# 数据库迁移规则

## 强制规则

1. 数据库变更只能通过 Liquibase 迁移交付（禁止口头说明、手工执行、绕过迁移目录直接改库）
2. 迁移文件命名：changeset YAML `V{版本号}-{描述}.yaml`，SQL `V{版本号}__{描述}.sql`，版本号严格递增
3. 文件放在标准目录：
   - 主 changelog：`src/main/resources/db/changelog/db.changelog-master.yaml`
   - changeset：`src/main/resources/db/changelog/changes/`
   - SQL：`src/main/resources/db/migration/`
4. 业务表使用小写业务前缀（`biz_`），禁止修改 `system_`/`infra_` 基础表
5. 一个 changeset 只做一类变更（建表/加列/建索引/初始化数据分开）
6. 提交前确认：版本号递增、changeset 被主 changelog include、SQL 路径真实存在、表注释/索引/约束已补齐

---

## 新增 changeset YAML 强制规则

### A. 用 `sql:` 内联，禁止 `sqlFile`

```yaml
# ✅ 内联 sql
changes:
  - sql:
      sql: |
        CREATE TABLE ...
      splitStatements: true
      stripComments: false
```

### B. DDL 必须加 `preConditions` 防止重复执行

```yaml
preConditions:
  - onFail: MARK_RAN
  - onError: MARK_RAN
  - not:
      tableExists:
        tableName: biz_order
```

### C. 禁止紧凑格式

Liquibase 4.26+ 不允许 `changes:` 后同行写 `-`，必须换行。

---

## 推荐 changeset 模板

```yaml
databaseChangeLog:
  - changeSet:
      id: V1.0.1-create-order-table
      author: yuheng
      preConditions:
        - onFail: MARK_RAN
        - onError: MARK_RAN
        - not:
            tableExists:
              tableName: biz_order
      changes:
        - sql:
            sql: |
              CREATE TABLE biz_order (
                  id BIGINT NOT NULL PRIMARY KEY,
                  order_no VARCHAR(32) NOT NULL,
                  order_status VARCHAR(20) NOT NULL,
                  creator VARCHAR(64) NOT NULL,
                  create_time DATETIME NOT NULL,
                  updater VARCHAR(64) NOT NULL,
                  update_time DATETIME NOT NULL,
                  deleted BIT DEFAULT 0 NOT NULL
              ) COMMENT='订单表';
              
              CREATE INDEX idx_order_no ON biz_order(order_no);
            splitStatements: true
            stripComments: false
      rollback:
        - sql: "DROP TABLE IF EXISTS biz_order"
```

---

## 禁止写法

- 用非标准命名
- 一个脚本同时建表、灌数、修历史坏数据
- 没有注释
- 直接改基础表结构
- 只新增 SQL 文件却不注册到 changeset
- 表名使用大写或大小写混合

---

**规则版本**: v1.0  
**更新时间**: 2024-11-09
