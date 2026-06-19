---
title: "P1 工作台操作闭环实现记录"
status: "draft"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "SCM-PRD-P1-001 governance-style CRUD baseline for all workbench modules"
boundary: "SQLite ledger only; no canonical overwrite; no ERP/Jijia writeback; no provider call"
---

# P1 工作台操作闭环实现记录

## 1. 本批目标

本批收口 `SCM-PRD-P1-001` 的基础版：把 13 个工作台从展示页推进到治理型 CRUD 闭环。这里的 CRUD 是治理台账意义上的创建、查询、筛选、审核、批量审核和审计留痕，不是直接删除、覆盖或发布 canonical 正本。

## 2. 已实现内容

- 新增 SQLite 表：`workbench_operations`。
- 新增 migration：`scripts/migrations/005_p1_workbench_operations.sql`。
- 新增 API：
  - `GET /api/workbench/operations`
  - `GET /api/workbench/operations/summary`
  - `POST /api/workbench/operations`
  - `POST /api/workbench/operations/:id/review`
  - `POST /api/workbench/operations/bulk-review`
- 每个操作请求会自动创建 `workflow_instances` 与 `workflow_steps`。
- 审核与批量审核会同步 workflow 状态，并写入 `audit_events`。
- 13 个工作台页面均增加 `moduleOpsPanel`：
  - 治理总览：风险下钻任务
  - 对象本体：只读本体修订建议
  - 标签工程：标签规则发布审核
  - 维度工程：维度适配矩阵检查
  - 指标工程：指标字段映射审核
  - 指标字典：同义词与问法修订
  - 指标体系：MECE 冲突检查
  - 血缘质量：质量规则批量执行
  - ChatBI：上下文认证复核
  - AI 知识库：知识卡质量复核
  - AI 对话：问答反馈复核
  - 决策闭环：动作复盘审核
  - 审计日志：审计证据导出请求

## 3. 验收证据

本地验证通过：

```bash
npm run check
npm run smoke:p0
```

`smoke:p0` 覆盖：

- `workbenchOperation.create`
- `workbenchOperation.filter`
- `workbenchOperation.review`
- `workbenchOperation.bulkReview`
- `workbenchOperation.summary`
- 本地 Browser Harness 对 `.moduleOpsPanel`、`.moduleOpsSummary`、展开控件做强校验。

线上只读 smoke 仍通过，但线上 release 尚未部署本批新 UI，因此公开站点默认不强制检查 `.moduleOpsPanel`。部署后可执行：

```bash
REQUIRE_WORKBENCH_OPERATIONS=1 SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ npm run smoke:browser
```

## 4. 边界

- 不直接写 `ontology_objects`、`tags`、`dimensions`、`metrics`、`kpi_tree` 等 canonical 正本。
- 指标字典 2.0 仍只读。
- 本体仍只读，只允许注解、评论、修订建议和操作请求。
- 外部模型 provider 仍关闭。
- 不触发积加、ERP、WMS、TMS 写回。

## 5. 剩余事项

- 生产部署后运行强校验 Browser Harness。
- 针对标签、维度、指标三个模块继续补更细的版本 diff、适用对象校验、字段级影响分析。
- 将工作台操作与后续 P2 知识源 register、知识卡评分、问法样本库打通。
