---
title: "P1 工作流运营、本体路径与决策状态机实施记录"
status: "draft"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "SCM workbench P1 second batch: workflow filters/SLA/bulk review, ontology path explanation, decision-loop state machine"
boundary: "SQLite governance ledger only; ontology and metric dictionary remain read-only; no ERP/Jijia writeback; no provider call"
---

# P1 工作流运营、本体路径与决策状态机实施记录

## 1. 实施结论

本批 P1 把第一批“候选资产进入 workflow”的基础能力继续推进到可运营状态：

- Workflow Board 支持按状态、模块、优先级、owner、SLA 和关键词筛选。
- Workflow Board 支持选择可见任务并批量批准/拒绝。
- 新建 workflow 按优先级自动生成默认 due date，并返回 `sla_status` 与 `sla_note`。
- 对象本体页新增对象关系路径解释，聚合本体关系、标签、维度、指标桥和血缘证据。
- 决策闭环页新增 Action 创建、状态轨道和显式状态迁移。

边界保持不变：这些操作只写本项目 SQLite 治理台账与审计日志，不写 `metrics`、`tags`、`dimensions`、`ontology_objects` 正本，不写积加、ERP、WMS 或 TMS。

## 2. 数据模型

新增迁移：

```text
scripts/migrations/003_p1_workflow_ontology_decision.sql
```

扩展表：

```text
action_tasks.created_at
action_tasks.updated_at
```

新增表：

```text
action_task_transitions
```

Action 状态机：

```text
draft -> recommended -> pending_approval -> approved -> in_progress -> completed -> reviewed
```

可拒绝分支：

```text
draft / recommended / pending_approval / in_progress -> rejected
```

说明：`approved` 只表示治理动作获批执行或记录，不代表自动写回业务系统。

## 3. API

新增或增强接口：

| Method | Path | 用途 |
|---|---|---|
| `GET` | `/api/workflows` | 新增 `priority`、`q`、`slaStatus` 筛选，并返回 `sla_status`、`sla_note` |
| `GET` | `/api/workflows/summary` | 新增 owner/SLA 聚合 |
| `POST` | `/api/workflows/bulk-review` | 批量批准/拒绝 workflow，并同步候选生命周期 |
| `GET` | `/api/ontology/paths?objectId=sku` | 解释对象出入关系、标签、维度、指标桥和血缘证据 |
| `GET` | `/api/decision/summary` | 决策日志、Action 状态和写回边界汇总 |
| `GET` | `/api/decision/action-tasks` | 返回 Action 任务与迁移次数 |
| `POST` | `/api/decision/action-tasks/:id/transition` | 执行 Action 状态迁移并写审计 |

## 4. 前端

增强 `WorkflowBoard`：

- 增加筛选条：状态、模块、优先级、owner、SLA、关键词。
- 增加批量操作条：选择可见项、批量批准、批量拒绝。
- 任务卡显示状态、SLA、due date、owner、priority 和步骤状态。

增强 `OntologyPanel`：

- 增加对象选择器。
- 增加路径叙事：出向关系、入向关系、维度桥、指标桥。
- 支持点击路径卡进入上下文抽屉做注解、评论或修订建议。

增强 `DecisionPanel`：

- 增加决策/Action 汇总。
- 增加状态轨道。
- 增加 Action 创建表单。
- 增加每个 Action 的下一步状态按钮。

## 5. 验收

已通过本地临时 SQLite 副本验收：

```bash
npm run build
SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

新增 smoke 覆盖：

- `workflowFilters.read`
- `workflowBulkReview.writeLedgerOnly`
- `ontologyPath.read`
- `decisionAction.create`
- `decisionAction.transitionPendingApproval`
- `decisionAction.transitionApproved`
- `decisionSummary.read`

## 6. 当前限制

- 本体图仍为“类型全覆盖 + 关键实例入图”的只读治理模型；海量明细仍应留在数仓或业务系统。
- Workflow 批量操作当前只支持批准/拒绝，尚未实现批量改 owner、批量改 due date。
- Action 状态机当前记录审批与执行状态，不自动触发业务系统动作。
- 生产站点验收默认只读；生产台账写入需要单独授权。

## 7. 后续建议

- 补 `SCM-PRD-P1-009`：ChatBI 上下文认证流。
- 补 `SCM-PRD-P1-010`：审计日志操作页。
- P2 进入知识源 register、知识卡质量评分、问法样本库和 AI 反馈闭环。
