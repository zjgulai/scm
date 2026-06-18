---
title: "P1 ChatBI 上下文认证流与审计日志工作台实施记录"
status: "draft"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "SCM workbench P1 third batch: ChatBI context certification workflow and audit log operation page"
boundary: "SQLite governance ledger only; certified semantic dry-run only; no ERP/Jijia writeback; no external provider call; no free NL2SQL"
---

# P1 ChatBI 上下文认证流与审计日志工作台实施记录

## 1. 实施结论

本批完成 `SCM-PRD-P1-009` 与 `SCM-PRD-P1-010` 的基础可验收版本：

- ChatBI 语义治理台从单一 dry-run 扩展为上下文候选工作台。
- 支持创建问法上下文候选，绑定 L3 指标、可用维度和证据链。
- 上下文候选自动创建 `chatbi_context_certification` workflow。
- 支持 Owner 审核、认证发布和拒绝。
- ChatBI dry-run 只允许 `status=certified` 且 `answer_policy=certified_metric_only` 的上下文进入正式可答路径。
- 未认证上下文命中时返回拒答原因，不执行 SQL，不调用外部模型。
- 新增审计日志工作台，可按事件类型、资产类型、资产 ID、操作者和 payload 关键词筛选。

边界保持不变：所有操作只写本项目 SQLite 治理台账、workflow 和 `audit_events`，不改指标字典 2.0 正本，不写积加、ERP、WMS 或 TMS，不调用 DeepSeek/Kimi。

## 2. 数据模型

新增迁移：

```text
scripts/migrations/004_p1_chatbi_certification_audit.sql
```

扩展 `chatbi_contexts`：

```text
updated_at
reviewer
review_note
certified_at
workflow_id
```

新增索引：

```text
idx_chatbi_contexts_policy
idx_chatbi_contexts_source_message
idx_chatbi_contexts_status
idx_audit_events_type_actor
```

## 3. API

新增或增强接口：

| Method | Path | 用途 |
|---|---|---|
| `GET` | `/api/chatbi/summary` | ChatBI 上下文状态、策略和待审样本汇总 |
| `GET` | `/api/chatbi/context` | 支持按 status、answerPolicy、metricId、q 筛选上下文 |
| `POST` | `/api/chatbi/context` | 创建问法上下文候选并生成认证 workflow |
| `POST` | `/api/chatbi/context/:id/review` | 审核、认证或拒绝上下文 |
| `POST` | `/api/chatbi/dry-run` | 只基于认证上下文判断可回答性 |
| `GET` | `/api/audit/summary` | 审计事件聚合 |
| `GET` | `/api/audit-events` | 增强 actor 与 q 筛选 |
| `GET` | `/api/workbench/audit-log` | 审计日志工作台 payload |

## 4. 前端

增强 `ChatBiPanel`：

- 汇总卡：上下文总数、已认证、待审核、已拒绝。
- 创建表单：绑定 L3 指标、问法样本、可用维度、证据链。
- dry-run 面板：展示命中认证上下文或拒答原因。
- 待审上下文卡片：支持详情、标记已审、认证发布、拒绝。
- 认证上下文表：展示指标、问法、粒度、策略、状态、审核人。

新增 `AuditLogPanel`：

- 汇总卡：审计事件数、事件类型数、资产类型数、操作者数。
- Facet：事件类型与资产类型快速筛选。
- 筛选条：事件类型、资产类型、资产 ID、操作者、全文搜索。
- 时间线：展示事件、资产、payload、发生时间，并可打开详情抽屉。

## 5. 验收

已通过本地临时 SQLite 副本验收：

```bash
npm run build
SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

新增 smoke 覆盖：

- `chatbiContext.create`
- `chatbiContext.failClosedBeforeCertification`
- `chatbiContext.certify`
- `chatbiSummary.read`
- `chatbi.dryRun`
- `auditSummary.read`
- `auditEvents.read`
- `auditEvents.filterChatbi`

Browser Harness 本地页面巡检：

```text
moduleCount=13
ChatBI: summaryCards=4, form=true, filters=true, dryRun=true
AuditLog: summaryCards=4, facets=30, filters=true, timeline=true
```

## 6. 当前限制

- ChatBI 上下文认证目前是本地治理账本流，不代表真实数据查询已经具备 SQL 执行能力。
- `dry-run` 仍只返回指标口径、维度和证据链，不执行真实 SQL。
- 审计日志工作台为 append-only 查询页，不提供删除或覆盖审计事件能力。
- 生产站点验收默认只读；生产台账写入需单独授权。

## 7. 后续建议

- P2 建立问法样本库、同义词库、拒答样本库和样本质量评分。
- P2 把 AI 对话生成的 draft context 与 ChatBI 认证台做更强联动。
- P3 接 DeepSeek/Kimi 前先增加 provider call 审计、prompt 版本和证据绑定策略。
