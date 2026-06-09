---
title: 专题① VOC Batch 1 review result to ledger update gate 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-result-to-ledger-update-gate
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 review result to ledger update gate 草稿

## 1. Result-to-Ledger Gate 定位

本文执行 `VOC-BATCH1-RESULT-TO-LEDGER-UPDATE-GATE-001`，用于定义未来 `review_result_status = accepted` 后，如何进入 `VOC-LEDGER-UPDATE-001` 的候选回填建议流程，并继续冻结 DQ readiness、SQL 准入和 `VOC-SIGNOFF-001` 直接修改权限。

本文不是真实 review 结果，不是 ledger update 已创建结果，不是回填审批结果，不是 Owner 已签收结果，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议仍为 `not-held`。
- Batch 1 的 23 条 evidence item 仍为 `not-received`。
- Batch 1 的 23 条 review queue slot 仍为 `not-created`。
- Batch 1 的 23 条 review gate 仍为 `not-started`。
- Batch 1 的 23 条 review result slot 仍为 `not-recorded`。
- Batch 1 的 23 条 result-to-ledger gate 仍为 `not-open`。
- Batch 1 的 23 条 ledger update control 仍为 `not-created`。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源继续保持 `dq_readiness_status = blocked`。
- 5 个 Batch 1 来源继续保持 `sql_allowed = no`。

反面论证：`review_result_status = accepted` 听起来像已经可以回填 `VOC-SIGNOFF-001`。这个理解仍然越权。`accepted` 只说明证据可被接收；它进入回填建议前仍需要 result-to-ledger gate 检查 proposal type、字段边界、审批 Owner、敏感材料、回滚规则和禁止状态。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 review result ledger | `drafts/analysis/voc-topic-batch1-review-result-ledger-draft-20260604.md` | 固定 `VOC-BATCH1-REVIEW-RESULT-LEDGER-001` 的 23 条 result slot 和 `not-recorded` | Amber |
| Batch 1 review execution queue | `drafts/analysis/voc-topic-batch1-review-execution-queue-draft-20260604.md` | 固定 `VOC-BATCH1-REVIEW-EXECUTION-QUEUE-001` 的 23 条 queue 和 result 边界 | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 23 条 review gate 和 proposal-only 规则 | Amber |
| Batch 1 ledger update control | `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 `VOC-LEDGER-UPDATE-001` 的 23 条 update control 和 `not-created` | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 `blocked / unsigned / sql_allowed = no` | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 和 Green 升级门槛 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. Result-to-Ledger Gate 字段模式

| 字段 | 说明 | 初始值 |
|---|---|---|
| `result_to_ledger_gate_id` | result 进入 ledger update control 的门禁 ID | required |
| `review_result_id` | 来源 review result slot | required |
| `update_request_id` | 目标 ledger update control | required |
| `evidence_item_id` | 目标 evidence item | required |
| `review_gate_id` | 来源 review gate | required |
| `target_source_asset` | 目标来源资产 | required |
| `target_ledger_id` | 目标 `VOC-SIGNOFF-001` 行 | required |
| `proposal_type` | candidate / requested / draft / blocker / no-update | required |
| `approval_owner_role` | 后续审批 Owner 角色 | required |
| `required_review_result_status` | 触发条件 | accepted |
| `field_boundary_check` | 字段和值边界检查 | required |
| `forbidden_status_check` | 禁止状态检查 | signed / ready / approved / sql_allowed yes |
| `gate_decision` | not-open / blocked / update-draft-eligible | `not-open` |
| `update_request_status_after_gate` | gate 通过后允许的状态 | 当前保持 `not-created` |
| `apply_allowed` | 是否允许改 `VOC-SIGNOFF-001` | no |
| `dq_allowed` | 是否允许进入 DQ readiness | no |
| `sql_allowed` | 是否允许进入 SQL | no |

## 4. Gate 通用门槛

| condition_id | 条件 | 通过标准 | 不通过时 |
|---|---|---|---|
| `RESULT-TO-LEDGER-CHECK-001` | review result 已真实登记 | `result_record_status = recorded` 且 `review_result_status = accepted` | 保持 `gate_decision = not-open` |
| `RESULT-TO-LEDGER-CHECK-002` | review result 可追溯 | `review_result_id` 属于 23 条 result slot | 拒绝新增 result |
| `RESULT-TO-LEDGER-CHECK-003` | update request 可追溯 | `update_request_id` 属于 23 条 `VOC-LEDGER-UPDATE-001` | 拒绝新增 update control |
| `RESULT-TO-LEDGER-CHECK-004` | proposal type 合法 | candidate / requested / draft / blocker / no-update | 拒绝 signed / ready / SQL |
| `RESULT-TO-LEDGER-CHECK-005` | 字段边界不越权 | 只能建议候选、草稿、阻断或 requested | 拒绝 signed、approved、ready |
| `RESULT-TO-LEDGER-CHECK-006` | 审批 Owner 可追溯 | approval_owner_role 与来源和字段匹配 | 保持 blocked |
| `RESULT-TO-LEDGER-CHECK-007` | 无敏感材料冲突 | 不含 full-text、URL 批量列表、用户标识、未脱敏截图 | 拒绝进入 update |
| `RESULT-TO-LEDGER-CHECK-008` | 不直接改台账 | `apply_allowed = no` | 停止 gate |
| `RESULT-TO-LEDGER-CHECK-009` | 不生成 DQ readiness | `dq_allowed = no` | 停止 gate |
| `RESULT-TO-LEDGER-CHECK-010` | 不授权 SQL | `sql_allowed = no` | 停止 gate |

## 5. proposal_type 边界

| proposal_type | 可进入的 update control 意义 | 允许建议 | 禁止建议 |
|---|---|---|---|
| candidate | 候选字段、主键、刷新或政策状态 | `candidate`、候选 review id、细化 blocker | `signed`、`ready` |
| requested | 权限或 Owner 请求状态 | `requested`、权限 scope 候选 | `approved`、full-text |
| draft | 样本或样本策略草稿 | sample ID candidate、`draft` | `sample_policy_status = signed` |
| blocker | 阻断项说明 | keep `blocked`、新增 `blocking_reason` | `dq_readiness_status = ready` |
| no-update | 只保留证据可接收记录 | Owner route、candidate note | 删除阻断或签收 |

## 6. Result-to-Ledger Gate 总表

| result_to_ledger_gate_id | review_result_id | update_request_id | evidence_item_id | review_gate_id | target_source_asset | target_ledger_id | proposal_type | approval_owner_role | gate_decision | update_request_status_after_gate | apply_allowed | dq_allowed | sql_allowed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `VOC-RESULT-TO-LEDGER-B1-EXT-POLICY-001` | `VOC-REVIEW-RESULT-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-REVIEW-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | candidate | COMPLIANCE | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-EXT-PII-001` | `VOC-REVIEW-RESULT-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-REVIEW-B1-EXT-PII-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | blocker | COMPLIANCE | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-EXT-PK-001` | `VOC-REVIEW-RESULT-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-REVIEW-B1-EXT-PK-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | candidate | DATA | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-EXT-FIELD-001` | `VOC-REVIEW-RESULT-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-REVIEW-B1-EXT-FIELD-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | candidate | DATA / VOC | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-EXT-FRESH-001` | `VOC-REVIEW-RESULT-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-REVIEW-B1-EXT-FRESH-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | candidate | DATA | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-TAG-SOURCE-001` | `VOC-REVIEW-RESULT-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-REVIEW-B1-TAG-SOURCE-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | no-update | VOC | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-TAG-FIELD-001` | `VOC-REVIEW-RESULT-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-REVIEW-B1-TAG-FIELD-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | candidate | VOC / PRODUCT | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-TAG-PK-001` | `VOC-REVIEW-RESULT-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-REVIEW-B1-TAG-PK-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | candidate | DATA / VOC | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-TAG-SAMPLE-001` | `VOC-REVIEW-RESULT-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-REVIEW-B1-TAG-SAMPLE-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | draft | VOC | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-METRIC-PK-001` | `VOC-REVIEW-RESULT-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-REVIEW-B1-METRIC-PK-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | candidate | DATA | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-METRIC-FIELD-001` | `VOC-REVIEW-RESULT-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-REVIEW-B1-METRIC-FIELD-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | candidate | DATA / BI | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-METRIC-BI-001` | `VOC-REVIEW-RESULT-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-REVIEW-B1-METRIC-BI-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | blocker | BI | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-METRIC-FRESH-001` | `VOC-REVIEW-RESULT-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-REVIEW-B1-METRIC-FRESH-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | candidate | DATA | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-RESULT-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-B1-DETAIL-SOURCE-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | no-update | DATA | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-DETAIL-PK-001` | `VOC-REVIEW-RESULT-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-REVIEW-B1-DETAIL-PK-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | candidate | DATA | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-DETAIL-FIELD-001` | `VOC-REVIEW-RESULT-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-REVIEW-B1-DETAIL-FIELD-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | candidate | DATA / VOC | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-DETAIL-PII-001` | `VOC-REVIEW-RESULT-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-REVIEW-B1-DETAIL-PII-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | blocker | COMPLIANCE | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-RESULT-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-B1-DETAIL-SERVICE-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | blocker | SERVICE | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-RESULT-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-B1-REVIEW-SOURCE-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | no-update | DATA | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-REVIEW-PK-001` | `VOC-REVIEW-RESULT-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-REVIEW-B1-REVIEW-PK-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | candidate | DATA | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-REVIEW-FIELD-001` | `VOC-REVIEW-RESULT-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-REVIEW-B1-REVIEW-FIELD-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | candidate | DATA / VOC | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-RESULT-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-B1-REVIEW-SAMPLE-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | draft | VOC / SERVICE | not-open | not-created | no | no | no |
| `VOC-RESULT-TO-LEDGER-B1-REVIEW-PII-001` | `VOC-REVIEW-RESULT-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-REVIEW-B1-REVIEW-PII-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | blocker | COMPLIANCE | not-open | not-created | no | no | no |

## 7. Gate 状态迁移

| 状态迁移 | 是否允许 | 条件 | 禁止 |
|---|---|---|---|
| `not-open -> blocked` | yes | accepted result 缺审批 Owner、字段边界、回滚规则或含 forbidden content | 改 `VOC-SIGNOFF-001` |
| `not-open -> update-draft-eligible` | conditional | 真实 accepted result 通过全部 `RESULT-TO-LEDGER-CHECK-*` | 自动创建回填草稿 |
| `update-draft-eligible -> not-created` | yes | 只允许保持目标 update control 槽位可追溯 | 改 `approved-for-edit` |
| `update-draft-eligible -> draft` | no | 必须由后续 ledger update approval gate 执行 | 本文创建真实回填建议 |
| `blocked -> update-draft-eligible` | conditional | Owner 补齐边界并重跑 gate | 新增未登记 update_request_id |

本文创建时不执行任何状态迁移。所有 23 条 `gate_decision` 保持 `not-open`，所有 23 条 `update_request_status_after_gate` 保持 `not-created`，所有 23 条 `apply_allowed` 保持 `no`，所有 23 条 `dq_allowed` 保持 `no`，所有 23 条 `sql_allowed` 保持 `no`。

## 8. 退回原因字典

| reject_reason | 说明 | 后续动作 |
|---|---|---|
| `result-not-accepted` | review result 未登记或不是 accepted | 退回 result ledger |
| `result-not-recorded` | `result_record_status` 不是 recorded | 退回真实 review 记录 |
| `approval-owner-missing` | 缺 approval_owner_role 或审批角色不匹配 | 补审批 Owner |
| `field-boundary-missing` | proposed ledger fields 或 allowed value boundary 不清 | 补字段边界 |
| `forbidden-content` | 含完整原文、URL 批量列表、真实用户标识或未脱敏截图 | 拒绝进入 update |
| `status-overreach` | 试图升级 signed / ready / approved / sql_allowed yes | 拒绝并保留 blocked |
| `ledger-missing` | update_request_id 不属于 23 条控制槽位 | 拒绝新增 update control |
| `dq-overreach` | 试图创建 DQ readiness 结论 | 保持 `dq_allowed = no` |

## 9. 状态冻结

| 状态字段 | 本 gate 创建后必须保持 | 原因 |
|---|---|---|
| `review_result_status` | not-recorded | 没有真实 accepted review 结果 |
| `gate_decision` | not-open | 没有真实 result-to-ledger 通过记录 |
| `update_request_status` | not-created | 没有创建回填建议草稿 |
| `update_request_status_after_gate` | not-created | 本 gate 不创建真实 update request |
| `apply_allowed` | no | 未获回填审批 |
| `source_status` | blocked | 未完成真实来源签收 |
| `owner_status` | unsigned | 缺少 `signoff_id`、Owner、日期和签收范围 |
| `dq_readiness_status` | blocked | 缺少完整证据链和 DQ readiness 审查 |
| `dq_allowed` | no | 本 gate 不执行 DQ |
| `sql_allowed` | no | 未完成 SQL 准入审批 |

## 10. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不修改 `VOC-SIGNOFF-001`。
- 不声明任何 P0 来源已签收。
- 不声明任何 P0 来源已生产可用。
- 不把 result-to-ledger gate 当作真实回填建议。
- 不把 `review_result_status = accepted` 当作 `owner_status = signed`。
- 不把 `gate_decision = update-draft-eligible` 当作 `update_request_status = approved-for-edit`。
- 不把 `candidate` 当作 `signed`。
- 不把 `requested` 当作 `approved`。
- 不把 `draft` 当作 `sample_policy_status = signed`。
- 不把 `blocker` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 11. 下一步

下一步建议创建 `VOC-BATCH1-LEDGER-UPDATE-APPROVAL-GATE-001` Batch 1 ledger update approval gate 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-ledger-update-approval-gate-draft-20260604.md`

该文件应定义未来 `gate_decision = update-draft-eligible` 后，如何把候选回填建议转入审批队列、绑定审批 Owner、记录审批窗口，并继续冻结 `VOC-SIGNOFF-001` 直接修改、DQ readiness 和 SQL 准入。未完成真实回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
