---
title: "P2 AIP 审计时间线桥接实施记录"
date: "2026-06-20"
status: "implemented"
scope: "scm-data-governance-workbench-v0"
---

# P2 AIP 审计时间线桥接实施记录

## 目标

本批开发补齐 AIP 实践链路里的三个断点：Trace step 没有进入审计账本、Object 360 缺少对象级合并时间线、决策闭环难以看出建议卡与 Action 的承接关系。同时为审计日志工作台补齐基于当前筛选条件的 JSON 与 Excel 只读导出。

## 已实现

- `agent_trace.step_created`：每个 AIP trace step 创建时同步写入 `audit_events`，保留 `traceId`、`stepOrder`、`stepType`、`targetObjectId` 和状态。
- Object 360 合并时间线：对象详情接口返回 `timeline`，合并对象事件、Agent trace、建议卡、关联 workflow 和审计事件。
- 决策闭环建议映射：台账复盘区域增加“建议卡 / Action 映射”，按 recommendation id、trace id、workflow id 显示建议卡是否已承接为 Action。
- 审计日志导出：`/api/export/audit-log` 支持沿用审计工作台筛选条件导出 JSON 与 Excel，并在 payload 中保留 append-only、no-ui-delete、no-provider-call 边界说明。

## 边界

- 不引入 provider call。
- 不自动写回积加、ERP、WMS 或 TMS。
- 本体对象仍保持只读；本批只增加对象相关证据、审计与建议承接视图。
- 审计导出是只读导出，不提供删除、覆盖或批量导入能力。

## 验收覆盖

- `npm run check` 覆盖 TypeScript 类型检查。
- `scripts/smoke-core-workflows.mjs` 覆盖 trace step 审计、对象合并时间线、审计 JSON 导出和 Excel 导出。
- `scripts/smoke-browser-harness.sh` 覆盖 Object 360 合并时间线、决策映射面板和审计导出入口的真实页面 DOM。
