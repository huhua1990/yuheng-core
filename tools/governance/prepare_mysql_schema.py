#!/usr/bin/env python3
"""Prepare review-only MySQL schema fragments from a SQL snapshot.

This is scoped to the inspected snapshot format and does not validate schema
semantics or generate production-ready migrations.
"""

import argparse
import re
from pathlib import Path

from audit_mysql_snapshot import CREATE_RE, sql_statements


def split_schema(text):
    platform, examples, names = [], [], set()
    removed = False
    for statement in sql_statements(text):
        match = CREATE_RE.match(statement.strip())
        if not match:
            continue
        name = match.group("name")
        if name in names:
            raise ValueError("duplicate CREATE TABLE: " + name)
        names.add(name)
        if name == "system_operate_log":
            statement, count = re.subn(r"^\s*`success`[^\n]*,\s*\n", "\n", statement, flags=re.MULTILINE)
            if count != 1:
                raise ValueError("expected exactly one system_operate_log.success column")
            removed = True
        target = examples if name.startswith("yudao_demo") else platform
        target.append(statement.strip() + ";")
    if not removed:
        raise ValueError("system_operate_log.success not found")
    return "\n\n".join(platform) + "\n", "\n\n".join(examples) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshot", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    platform, examples = split_schema(args.snapshot.read_text(encoding="utf-8"))
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name in ("platform-schema.sql", "example-schema.sql"):
        if (args.output_dir / name).exists():
            raise FileExistsError(str(args.output_dir / name))
    for name, content in (("platform-schema.sql", platform), ("example-schema.sql", examples)):
        path = args.output_dir / name
        with path.open("x", encoding="utf-8") as output:
            output.write(content)
        print(path)


if __name__ == "__main__":
    main()
