---
title: "SQLite 台账备份、恢复与迁移 Runbook"
status: "draft"
created_at: "2026-06-18"
updated_at: "2026-06-18"
scope: "SCM governance workbench SQLite operations"
boundary: "workbench ledger database only; no ERP/Jijia business data writeback"
---

# SQLite 台账备份、恢复与迁移 Runbook

## 1. 数据库边界

当前 SQLite 文件是供应链治理工作台的本地台账和知识库索引，不是积加、ERP、WMS、TMS 的生产业务库。允许写入的对象包括注解、评论、修订建议、工作流、AI 检索证据、知识库索引和治理审计。

默认路径：

```bash
data/governance_workbench.sqlite
```

可通过环境变量覆盖：

```bash
SCM_DB_PATH=/path/to/governance_workbench.sqlite
```

## 2. 本地备份

```bash
npm run backup:sqlite
```

输出包含：

- `dbPath`：源 SQLite 路径。
- `backupPath`：备份文件路径。
- `bytes`：备份字节数。

默认备份目录：

```bash
data/backups/
```

可通过环境变量覆盖：

```bash
SCM_BACKUP_DIR=/tmp/scm-sqlite-backups npm run backup:sqlite
```

## 3. 服务器备份

在腾讯云轻量服务器上：

```bash
cd /opt/scm-governance-workbench/current
docker exec scm-governance-workbench npm run backup:sqlite
docker cp scm-governance-workbench:/app/data/backups ./backups-$(date +%Y%m%d%H%M%S)
```

备份前后建议分别执行：

```bash
curl -fsS http://127.0.0.1:5174/api/deploy/health
docker compose -p scm_governance_workbench ps
```

## 4. 本地迁移

```bash
npm run migrate
```

迁移机制：

- SQL 文件位于 `scripts/migrations/`。
- 文件名必须符合 `001_example.sql` 格式。
- 已执行记录写入 `schema_migrations`。
- 每个迁移文件单独事务执行，失败会 rollback。

## 5. 迁移前验证

不要直接在唯一数据库上试迁移。先复制一份：

```bash
cp data/governance_workbench.sqlite tmp/governance_workbench-migration-smoke.sqlite
SCM_DB_PATH=tmp/governance_workbench-migration-smoke.sqlite npm run migrate
```

验证表是否存在：

```bash
node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('tmp/governance_workbench-migration-smoke.sqlite'); console.log(db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' AND name IN ('kpi_canvas_nodes','quality_rules','quality_issues','schema_migrations') ORDER BY name\").all())"
```

## 6. 恢复

生产部署使用 Docker named volume 保存 SQLite 台账，默认 volume 名为：

```text
scm_governance_workbench_scm-governance-data
```

恢复前必须停容器或确保无写入。推荐通过 volume 准备脚本恢复：

```bash
docker compose -p scm_governance_workbench -f docker-compose.yml -f docker-compose.tencent.yml stop scm-governance-workbench
SCM_FORCE_VOLUME_SEED=1 SCM_SOURCE_DB=data/backups/governance_workbench-YYYYMMDDTHHMMSSZ.sqlite ./deploy/prepare-sqlite-volume.sh
docker compose -p scm_governance_workbench -f docker-compose.yml -f docker-compose.tencent.yml start scm-governance-workbench
curl -fsS http://127.0.0.1:5174/api/deploy/health
```

本地非 Docker 开发仍可直接替换 `data/governance_workbench.sqlite`，但不要把这种方式用于腾讯云生产容器。

## 7. 当前 P0 迁移内容

`001_p0_canvas_quality_tables.sql` 增加：

- `schema_migrations`
- `kpi_canvas_nodes`
- `quality_rules`
- `quality_issues`

其中 `kpi_canvas_nodes` 会从现有 `metrics` 和 `kpi_tree` 生成初始 auto layout。它只是画布底座，不代表指标体系真画布 UI 已完成。
