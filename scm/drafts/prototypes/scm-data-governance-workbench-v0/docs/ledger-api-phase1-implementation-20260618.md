---
title: "SQLite Ledger Phase 1 API Implementation"
status: "draft"
created_at: "2026-06-18"
scope: "scm-data-governance-workbench-v0 backend phase 1"
boundary: "prototype; no login; no production writeback; no external LLM call"
---

# SQLite Ledger Phase 1 API Implementation

## 1. 实施范围

本阶段完成 SQLite 工作台账本后端基座：

- 服务启动时幂等创建 ledger 表。
- 新增注解、评论、修订建议、审计事件 API。
- 扩展 `/api/deploy/health`，返回 ledger 状态。
- 本体和指标字典 canonical 资产仍保持只读，所有用户操作写入 ledger。

## 2. 新增表

| 表 | 用途 |
|---|---|
| `asset_annotations` | 资产注解 |
| `asset_comments` | 资产评论 |
| `revision_proposals` | 修订建议 |
| `workflow_instances` | 治理流程实例 |
| `workflow_steps` | 治理流程步骤 |
| `audit_events` | 审计事件 |

## 3. 新增 API

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/api/ledger/summary` | ledger 表计数和写入边界 |
| `GET` | `/api/audit-events` | 查询审计事件 |
| `GET` | `/api/ledger/:assetType/:assetId/annotations` | 查询资产注解 |
| `POST` | `/api/ledger/:assetType/:assetId/annotations` | 新增资产注解 |
| `PATCH` | `/api/ledger/annotations/:id` | 更新注解内容或状态 |
| `GET` | `/api/ledger/:assetType/:assetId/comments` | 查询资产评论 |
| `POST` | `/api/ledger/:assetType/:assetId/comments` | 新增资产评论 |
| `PATCH` | `/api/ledger/comments/:id` | 更新评论内容或状态 |
| `GET` | `/api/revision-proposals` | 查询修订建议 |
| `POST` | `/api/revision-proposals` | 创建修订建议 |
| `GET` | `/api/revision-proposals/:id` | 查询单条修订建议 |
| `PATCH` | `/api/revision-proposals/:id/review` | 审核修订建议 |

现有写接口同步补充审计：

- `POST /api/governance/tasks/:id/review`
- `POST /api/decision/action-task`

## 4. 写入边界

- 不写业务系统。
- 不调用外部模型。
- 不直接更新 `ontology_objects`、`ontology_links`、`metrics`、`kpi_tree` 等 canonical 表。
- 无登录阶段使用 `local_user` 作为默认 actor。
- 测试写入使用 `codex_smoke`，验证后已清理。

## 5. Smoke 证据

本地临时端口：`127.0.0.1:5184`

已验证：

- `node --check server/index.mjs`：退出码 0。
- `npm run check`：退出码 0。
- `npm run build`：退出码 0。
- `/api/deploy/health`：返回 `ok=true`，且 `database.ledger.writable=true`。
- `/api/ledger/summary`：返回 6 类 ledger 计数。
- 注解创建、查询、归档：通过。
- 评论创建：通过。
- 修订建议创建和 review：通过。
- 审计事件生成：通过。

清理后 ledger 业务计数：

| 对象 | 数量 |
|---|---:|
| `asset_annotations` | 0 |
| `asset_comments` | 0 |
| `revision_proposals` | 0 |
| `audit_events` | 0 |

## 6. 后续衔接

阶段 2 前端应直接复用这些 API：

- `ContextDrawer` 读取详情后并行拉取 annotations/comments/revision proposals。
- `AnnotationPanel` 调用 annotation/comment API。
- `RevisionProposalForm` 调用 revision proposal API。
- 指标字典和对象本体页面隐藏 canonical 编辑入口，只保留注解、评论和修订建议。
