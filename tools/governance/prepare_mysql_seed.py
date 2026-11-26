#!/usr/bin/env python3
"""Sanitize one-row INSERTs from the audited MySQL snapshot."""
import argparse
import re
from pathlib import Path

from audit_mysql_snapshot import sql_statements

INSERT = re.compile(r"^\s*INSERT\s+INTO\s+`([^`]+)`\s*\(([^)]*)\)\s+VALUES\s*\((.*)\)\s*$", re.I | re.S)
SENSITIVE = re.compile(r"^(?:password|secret|api_secret|client_secret|access_key|access_secret)$", re.I)
JSON_SECRET = re.compile(r'("(?:password|secret|accessKey|accessSecret|apiKey|clientSecret)"\s*:\s*")((?:\\.|[^"\\])*)(")', re.I)
ESCAPED_JSON_SECRET = re.compile(r'(\\"(?:password|secret|accessKey|accessSecret|apiKey|clientSecret)\\"\s*:\s*\\")((?:\\\\.|[^"\\])*)(\\")', re.I)


def split_values(text):
    values, start, quote, depth = [], 0, None, 0
    i = 0
    while i < len(text):
        c = text[i]
        if quote:
            if c == "\\":
                i += 2
                continue
            if c == quote:
                if i + 1 < len(text) and text[i + 1] == quote:
                    i += 2
                    continue
                quote = None
        elif c in "'\"":
            quote = c
        elif c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth < 0:
                raise ValueError("multiple tuples or invalid nesting")
        elif c == "," and depth == 0:
            values.append(text[start:i].strip())
            start = i + 1
        i += 1
    if quote or depth:
        raise ValueError("unbalanced SQL value")
    values.append(text[start:].strip())
    return values


def sanitize_insert(statement):
    match = INSERT.fullmatch(statement)
    if not match:
        raise ValueError("unsupported INSERT format")
    columns = re.findall(r"`([^`]+)`", match.group(2))
    values = split_values(match.group(3))
    if len(columns) != len(values):
        raise ValueError("column/value count mismatch in " + match.group(1))
    for index, column in enumerate(columns):
        if SENSITIVE.fullmatch(column):
            values[index] = "''"
        elif match.group(1) == "infra_file_config" and column == "config":
            value = JSON_SECRET.sub(r'\1\3', values[index])
            values[index] = ESCAPED_JSON_SECRET.sub(r'\1\3', value).replace('cn.iocoder.yudao.', 'com.yuheng.platform.')
    return "INSERT INTO `" + match.group(1) + "` (" + match.group(2) + ") VALUES (" + ", ".join(values) + ")"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    inserts = [sanitize_insert(statement.strip()) + ";" for statement in sql_statements(args.snapshot.read_text(encoding="utf-8")) if re.match(r"\s*INSERT\s+INTO\b", statement, re.I)]
    with args.output.open("x", encoding="utf-8") as output:
        output.write("\n".join(inserts) + "\n")
    print("Prepared", len(inserts), "INSERT statements")


if __name__ == "__main__":
    main()
