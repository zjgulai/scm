---
title: "P1 候选资产流与 Workflow Board 实施记录"
status: "draft"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "SCM workbench P1 first batch: candidate assets, workflow board, smoke coverage"
boundary: "SQLite governance ledger only; canonical metric dictionary remains read-only; no ERP/Jijia writeback; no provider call"
---

# P1 候选资产流与 Workflow Board 实施记录

## 1. 实施结论

本批 P1 已把“标签、维度、指标候选”从页面展示升级为可提交、可审核、可进入 workflow 的治理台账流。候选资产不会直接写入 `tags`、`dimensions`、`metrics` 正本，所有变更先落入 `governance_candidates` 和 `workflow_instances`，再由 owner 审核。

## 2. 数据模型

新增迁移：

```text
scripts/migrations/002_p1_candidate_workflows.sql
```

新增表：

```text
governance_candidates
```

扩展表：

```text
workflow_instances.title
workflow_instances.source_ref
workflow_instances.module_id
```

候选生命周期：

```text
review_pending -> approved / rejected
```

说明：`approved` 仅表示候选被批准进入后续发布或建模流程，不代表已经写入 canonical 表。

## 3. API

新增接口：

| Method | Path | 用途 |
|---|---|---|
| `GET` | `/api/governance/candidates` | 查询候选资产 |
| `POST` | `/api/governance/candidates` | 创建标签/维度/指标候选，并自动创建 workflow |
| `POST` | `/api/governance/candidates/:id/review` | 审核候选为 approved/rejected |
| `GET` | `/api/workflows` | 查询统一 workflow board |
| `GET` | `/api/workflows/summary` | 查询 workflow 和候选汇总 |
| `POST` | `/api/workflows/:id/review` | 从任务板审核 workflow |

增强接口：

- `POST /api/revision-proposals`：创建修订建议时自动创建 `revision_proposal_review` workflow。
- `PATCH /api/revision-proposals/:id/review`：审核修订建议时同步更新对应 workflow 状态。

## 4. 前端

新增 `WorkflowBoard`：

- 位置：治理链路总览。
- 功能：展示 workflow 总量、候选数量、模块分布、任务卡片。
- 操作：对未关闭 workflow 执行批准/拒绝，并保留审计。

新增 `CandidateWorkbench`：

- 标签工程工作台：标签候选提交流。
- 维度工程工作台：维度候选提交流。
- 指标工程工作台：指标候选提交流。
- 指标字典工作台保持只读，不直接挂候选写入表单。

## 5. 验收

已通过：

```bash
npm run build
npm run smoke:p0
```

`smoke:workflows` 已新增覆盖：

- `governanceCandidate.create`
- `governanceCandidate.review`
- `workflowBoard.read`
- `workflowSummary.read`

Browser Harness 本地新 UI 检查通过：

- 总览页存在 `候选资产与治理任务板`。
- 总览页 `.workflowSummaryGrid > div = 3`。
- 标签、维度、指标工程三页均存在 `.candidateWorkbench`、`.candidateForm` 和“提交候选并创建 workflow”按钮。

## 6. 部署证据

当前 P1 已部署：

```text
https://scm.lute-tlz-dddd.top/
```

部署 release：

```text
/opt/scm-governance-workbench/releases/scm-workbench-p1-candidate-workflows-85fd64d-20260619004559
```

SQLite 备份：

```text
/opt/scm-governance-workbench/backups/20260619004612/governance_workbench.sqlite
```

生产迁移：

```text
applied=["002_p1_candidate_workflows.sql"]
skipped=1
```

公网 health：

```text
ok=true
staticBuild=true
governanceCandidates=0
workflowInstances=0
providerCalls=false
erpWriteback=false
```

Browser Harness 公开站点检查：

- 12 个模块导航通过。
- 总览页存在 `候选资产与治理任务板`。
- 总览页 `.workflowSummaryGrid > div = 3`。
- 标签、维度、指标工程页均存在 `.candidateWorkbench`、`.candidateForm` 和“提交候选并创建 workflow”按钮。

说明：生产候选和 workflow 当前为 0 是预期值，因为公开站点验收只做只读 DOM/API 检查，没有写生产台账。

## 7. 当前边界

- 当前 P1 smoke 的写入只发生在临时 SQLite 副本。
- 当前不接 DeepSeek/Kimi。
- 当前不写积加、ERP、WMS、TMS。
- 当前不把候选直接 promote 到 canonical 表。

## 8. 后续 P1

状态更新（2026-06-19）：以下四项已进入第二批实现，实施记录见：

```text
docs/p1-operational-workflows-ontology-decision-20260619.md
```

- `SCM-PRD-P1-005`：扩展 workflow board 的筛选、owner SLA、批量操作。
- `SCM-PRD-P1-006`：把修订建议和候选流统一成更完整的步骤状态机。
- `SCM-PRD-P1-007`：对象本体关系路径解释。
- `SCM-PRD-P1-008`：决策闭环状态机。

仍未进入实现的下一批：

- `SCM-PRD-P1-009`：ChatBI 上下文认证流。
- `SCM-PRD-P1-010`：审计日志操作页。
