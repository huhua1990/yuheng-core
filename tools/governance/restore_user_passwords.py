#!/usr/bin/env python3
"""Create guarded updates from audited historical system_users INSERTs."""
import argparse
import re
from pathlib import Path

from audit_mysql_snapshot import sql_statements
from prepare_mysql_seed import INSERT, split_values

SQL_STRING = re.compile(r"'(?:\\.|''|[^'\\])*'\Z", re.S)


def make_update(statement):
    match = INSERT.fullmatch(statement)
    if not match or match.group(1) != "system_users":
        raise ValueError("expected system_users INSERT")
    columns = re.findall(r"`([^`]+)`", match.group(2))
    values = split_values(match.group(3))
    if len(columns) != len(values) or len(set(columns)) != len(columns):
        raise ValueError("invalid column/value list")
    row = dict(zip(columns, values))
    if not all(key in row for key in ("id", "username", "password", "tenant_id")):
        raise ValueError("missing user identity or password")
    if not re.fullmatch(r"[0-9]+", row["id"]) or not re.fullmatch(r"[0-9]+", row["tenant_id"]):
        raise ValueError("user identity must be numeric")
    if not SQL_STRING.fullmatch(row["username"]) or not SQL_STRING.fullmatch(row["password"]):
        raise ValueError("username and password must be SQL string literals")
    return ("UPDATE `system_users` SET `password` = " + row["password"] +
            " WHERE `id` = " + row["id"] + " AND `username` = " + row["username"] +
            " AND `tenant_id` = " + row["tenant_id"] + " AND `password` = '';" )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    updates = []
    for statement in sql_statements(args.snapshot.read_text(encoding="utf-8")):
        if re.match(r"\s*INSERT\s+INTO\s+`system_users`", statement, re.I):
            updates.append(make_update(statement.strip()))
    if not updates:
        raise ValueError("no system_users rows found")
    with args.output.open("x", encoding="utf-8") as output:
        output.write("\n".join(updates) + "\n")
    print("Prepared guarded updates:", len(updates))


if __name__ == "__main__":
    main()
