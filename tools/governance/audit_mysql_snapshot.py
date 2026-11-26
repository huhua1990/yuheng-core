#!/usr/bin/env python3
"""Extract a review-oriented inventory from a MySQL SQL snapshot.

This parser never executes SQL. It intentionally extracts only table names,
column names, primary keys, secondary index names, and INSERT statement counts.
"""

import argparse
import csv
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import List


@dataclass
class TableAudit:
    name: str
    columns: List[str] = field(default_factory=list)
    primary_key: List[str] = field(default_factory=list)
    indexes: List[str] = field(default_factory=list)
    insert_statements: int = 0
    insert_rows: int = 0
    parse_warnings: List[str] = field(default_factory=list)
    content_warnings: List[str] = field(default_factory=list)


CREATE_RE = re.compile(
    r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`(?P<name>[^`]+)`\s*\((?P<body>.*?)\)\s*(?:ENGINE\b|$)",
    re.IGNORECASE | re.DOTALL,
)
INSERT_RE = re.compile(
    r"^\s*INSERT\s+INTO\s+`(?P<name>[^`]+)`(?P<body>.*)$",
    re.IGNORECASE | re.MULTILINE | re.DOTALL,
)
COLUMN_RE = re.compile(r"^\s*`(?P<name>[^`]+)`\s+", re.MULTILINE)
PRIMARY_RE = re.compile(r"^\s*PRIMARY\s+KEY\s*\((?P<columns>[^)]*)\)", re.IGNORECASE | re.MULTILINE)
INDEX_RE = re.compile(
    r"^\s*(?:UNIQUE\s+)?(?:KEY|INDEX)\s+`(?P<name>[^`]+)`",
    re.IGNORECASE | re.MULTILINE,
)
INDEX_COLUMNS_RE = re.compile(r"`([^`]+)`")
LEGACY_NAMESPACE = "cn.iocoder.yudao"


def sql_statements(text: str):
    """Yield SQL statements while ignoring semicolons inside strings/comments."""
    statement = []
    quote = None
    line_comment = False
    block_comment = False
    i = 0
    while i < len(text):
        char = text[i]
        following = text[i + 1] if i + 1 < len(text) else ""
        if line_comment:
            if char == "\n":
                line_comment = False
                statement.append(char)
            i += 1
            continue
        if block_comment:
            if char == "*" and following == "/":
                block_comment = False
                i += 2
            else:
                i += 1
            continue
        if quote:
            statement.append(char)
            if char == "\\" and following:
                statement.append(following)
                i += 2
                continue
            if char == quote:
                if following == quote:
                    statement.append(following)
                    i += 2
                    continue
                quote = None
            i += 1
            continue
        if char in ("'", '"', "`"):
            quote = char
            statement.append(char)
            i += 1
            continue
        if char == "#" or (char == "-" and following == "-" and (i + 2 == len(text) or text[i + 2].isspace())):
            line_comment = True
            i += 1 if char == "#" else 2
            continue
        if char == "/" and following == "*":
            block_comment = True
            i += 2
            continue
        if char == ";":
            yield "".join(statement)
            statement = []
        else:
            statement.append(char)
        i += 1
    if statement:
        yield "".join(statement)


def count_value_tuples(values_sql: str) -> int:
    """Count top-level value tuples, ignoring parentheses inside SQL strings."""
    count = 0
    quote = None
    depth = 0
    i = 0
    while i < len(values_sql):
        char = values_sql[i]
        following = values_sql[i + 1] if i + 1 < len(values_sql) else ""
        if quote:
            if char == "\\":
                i += 2
                continue
            if char == quote:
                if following == quote:
                    i += 2
                    continue
                quote = None
        elif char in ("'", '"'):
            quote = char
        elif char == "(":
            if depth == 0:
                count += 1
            depth += 1
        elif char == ")" and depth:
            depth -= 1
        i += 1
    return count


def audit_snapshot(path: Path) -> List[TableAudit]:
    """Return one audit row per CREATE TABLE, including parse warnings."""
    text = path.read_text(encoding="utf-8", errors="replace")
    tables = {}
    statements = list(sql_statements(text))
    for statement in statements:
        match = CREATE_RE.search(statement)
        if not match:
            continue
        name = match.group("name")
        body = match.group("body")
        audit = TableAudit(name=name)
        audit.columns = [column.group("name") for column in COLUMN_RE.finditer(body)]
        primary = PRIMARY_RE.search(body)
        if primary:
            audit.primary_key = INDEX_COLUMNS_RE.findall(primary.group("columns"))
        audit.indexes = [index.group("name") for index in INDEX_RE.finditer(body)]
        if not audit.columns:
            audit.parse_warnings.append("no recognized column definitions")
        if not audit.primary_key:
            audit.parse_warnings.append("no recognized primary key")
        tables[name] = audit

    for statement in statements:
        match = INSERT_RE.search(statement)
        if not match:
            continue
        name = match.group("name")
        if name in tables:
            tables[name].insert_statements += 1
            values = re.split(r"\bVALUES\b", match.group("body"), maxsplit=1, flags=re.IGNORECASE)
            if len(values) == 2:
                tables[name].insert_rows += count_value_tuples(values[1])
            if LEGACY_NAMESPACE in match.group("body"):
                warning = "legacy Java namespace cn.iocoder.yudao in inserted runtime data"
                if warning not in tables[name].content_warnings:
                    tables[name].content_warnings.append(warning)

    # Keep CREATE TABLE statements the parser could not structurally match.
    for name in re.findall(r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`([^`]+)`", text, re.IGNORECASE):
        if name not in tables:
            tables[name] = TableAudit(name=name, parse_warnings=["unrecognized CREATE TABLE block format"])

    return list(tables.values())


def write_csv(path: Path, tables: List[TableAudit]) -> None:
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream, delimiter="\t", lineterminator="\n")
        writer.writerow(["table", "column_count", "columns", "primary_key", "secondary_indexes", "insert_statements", "insert_rows", "parse_warnings", "content_warnings"])
        for table in tables:
            writer.writerow([
                table.name,
                len(table.columns),
                ",".join(table.columns),
                ",".join(table.primary_key),
                ",".join(table.indexes),
                table.insert_statements,
                table.insert_rows,
                "; ".join(table.parse_warnings),
                "; ".join(table.content_warnings),
            ])


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshot", type=Path, help="MySQL SQL snapshot to inspect; it is never executed")
    parser.add_argument("--output", type=Path, help="write a tab-separated report")
    parser.add_argument("--json", action="store_true", help="write JSON to stdout")
    args = parser.parse_args(argv)
    tables = audit_snapshot(args.snapshot)
    warnings = sum(bool(table.parse_warnings) for table in tables)
    if args.output:
        write_csv(args.output, tables)
        print(f"Audited {len(tables)} tables; {warnings} table(s) need parser review; wrote {args.output}")
    elif args.json:
        print(json.dumps([asdict(table) for table in tables], ensure_ascii=False, indent=2))
    else:
        print("table\tcolumns\tindexes\tinserts\twarnings")
        for table in tables:
            print(f"{table.name}\t{len(table.columns)}\t{len(table.indexes)}\t{table.insert_statements}\t{table.insert_rows}\t{'; '.join(table.parse_warnings + table.content_warnings)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
