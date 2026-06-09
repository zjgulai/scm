---
title: 专题① VOC Batch 1 queue ready update gate 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-queue-ready-update-gate
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Queue Ready Update Gate 草稿

## 1. 目的

本文执行 `VOC-BATCH1-QUEUE-READY-UPDATE-GATE-001`，承接 Batch 1 candidate review result to queue ready gate。

本文只定义未来 `candidate_review_result_to_queue_ready_gate_decision = queue-ready` 后是否允许进入 queue ready update ledger，不执行真实 queue 更新，不把任何槽位改为 `update-ready`、`ready` 或 `pending-approval`，不创建真实审批请求，不登记审批通过，不改写 `VOC-SIGNOFF-001`，不允许 DQ，不允许 SQL。

## 2. 当前结论

- 23 条 result-to-queue-ready gate 当前保持 `candidate_review_result_to_queue_ready_gate_decision = not-open`。
- 23 条 queue ready update gate 当前保持 `queue_ready_update_gate_decision = not-open`。
- 23 条 queue ready update gate 当前保持 `candidate_review_result_to_queue_ready_gate_decision_observed = not-open`。
- 23 条 queue ready update gate 当前保持 `candidate_review_result_status_observed = not-recorded`。
- 23 条 queue ready update gate 当前保持 `candidate_review_result_decision_observed = not-open`。
- 23 条 queue ready update gate 当前保持 `queue_entry_status_observed = not-ready`。
- 23 条 queue ready update gate 当前保持 `owner_window_status_observed = missing`。
- 23 条 queue ready update gate 当前保持 `reviewer_identity_status_observed = missing`。
- 23 条 queue ready update gate 当前保持 `review_scope_status_observed = missing`。
- 23 条 queue ready update gate 当前保持 `queue_ready_update_ledger_status_after_gate = not-created`。
- 23 条 queue ready update gate 当前保持 `queue_entry_status_after_gate = not-ready`。
- 23 条 queue ready update gate 当前保持 `approval_request_status_after_gate = not-created`。
- 23 条 queue ready update gate 当前保持 `apply_allowed = no`。
- 5 个目标来源仍保持 `source_status = blocked` 与 `owner_status = unsigned`。
- `dq_readiness_status` 仍保持 `blocked`。
- `sql_allowed` 仍保持 `no`。

## 3. 上游依据

| 上游文件 | 本文使用方式 |
| --- | --- |
| `drafts/analysis/voc-topic-batch1-candidate-review-result-to-queue-ready-gate-draft-20260604.md` | 固定 23 条 result-to-queue-ready gate、not-open 状态和 update gate 阻断 |
| `drafts/analysis/voc-topic-batch1-queue-ready-candidate-review-result-ledger-draft-20260604.md` | 固定 23 条 candidate review result、not-recorded / not-open 状态 |
| `drafts/analysis/voc-topic-batch1-queue-ready-candidate-review-gate-draft-20260604.md` | 固定 23 条 candidate review gate、not-open 状态 |
| `drafts/analysis/voc-topic-batch1-queue-ready-candidate-ledger-draft-20260604.md` | 固定 23 条 queue ready candidate、not-created 状态 |
| `drafts/analysis/voc-topic-batch1-ledger-approval-queue-draft-20260604.md` | 固定 23 条 approval queue、not-ready 状态 |
| `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 23 条 update_request_id、目标字段和 forbidden value |
| `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定目标 P0 ledger 的 blocked / unsigned / sql no 状态 |
| `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 仍不可进入 |
| `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 SQL 前置条件仍未满足 |

## 4. Queue Ready Update Gate 字段

| 字段 | 含义 | 当前约束 |
| --- | --- | --- |
| `queue_ready_update_gate_id` | queue ready update gate ID | required |
| `candidate_review_result_to_queue_ready_gate_id` | 上游 result-to-queue-ready gate | required |
| `queue_ready_candidate_review_result_id` | 上游 candidate review result | required |
| `queue_ready_candidate_review_gate_id` | 上游 candidate review gate | required |
| `queue_ready_candidate_id` | 上游 queue ready candidate | required |
| `approval_queue_id` | 目标 approval queue | required |
| `update_request_id` | 上游 update request 槽位 | required |
| `target_ledger_id` | 目标 P0 signoff ledger | required |
| `target_source_asset` | 目标来源资产 | required |
| `proposal_type` | candidate / requested / draft / blocker / no-update | 继承上游 |
| `approval_owner_role` | 审批 Owner 角色 | 继承上游 |
| `candidate_review_result_to_queue_ready_gate_decision_observed` | 观察到的 result-to-queue-ready gate 决策 | 当前为 `not-open` |
| `candidate_review_result_status_observed` | 观察到的 candidate review result 状态 | 当前为 `not-recorded` |
| `candidate_review_result_decision_observed` | 观察到的 candidate review result 决策 | 当前为 `not-open` |
| `queue_entry_status_observed` | 观察到的 queue 状态 | 当前为 `not-ready` |
| `owner_window_status_observed` | Owner 和审批窗口是否齐备 | 当前为 `missing` |
| `reviewer_identity_status_observed` | 复核人身份是否真实 | 当前为 `missing` |
| `review_scope_status_observed` | 复核范围、字段、结果和拒绝条件是否齐备 | 当前为 `missing` |
| `queue_ready_update_gate_decision` | not-open / blocked / returned / update-ready | 当前为 `not-open` |
| `queue_ready_update_ledger_status_after_gate` | not-created / ready-to-create | 当前为 `not-created` |
| `queue_entry_status_after_gate` | not-ready / ready / pending-approval | 当前为 `not-ready` |
| `approval_request_status_after_gate` | not-created / created | 当前为 `not-created` |
| `apply_allowed` | 是否允许写入 signoff ledger | 当前为 `no` |
| `dq_allowed` | 是否允许进入 DQ | 当前为 `no` |
| `sql_allowed` | 是否允许 SQL | 当前为 `no` |

## 5. Queue Ready Update Gate 检查项

| check_id | 检查项 | 通过条件 | 未通过处理 |
| --- | --- | --- | --- |
| `QUEUE-READY-UPDATE-GATE-CHECK-001` | result-to-queue-ready gate 可追溯 | `candidate_review_result_to_queue_ready_gate_id` 属于 23 条冻结槽位 | 拒绝开启 update gate |
| `QUEUE-READY-UPDATE-GATE-CHECK-002` | review result 可追溯 | `queue_ready_candidate_review_result_id` 属于 23 条冻结槽位 | 拒绝开启 update gate |
| `QUEUE-READY-UPDATE-GATE-CHECK-003` | candidate 可追溯 | `queue_ready_candidate_id` 属于 23 条冻结槽位 | 拒绝开启 update gate |
| `QUEUE-READY-UPDATE-GATE-CHECK-004` | approval queue 可追溯 | `approval_queue_id` 属于 23 条冻结槽位 | 拒绝新增 queue |
| `QUEUE-READY-UPDATE-GATE-CHECK-005` | update request 可追溯 | `update_request_id` 属于 23 条冻结槽位 | 拒绝新增 request |
| `QUEUE-READY-UPDATE-GATE-CHECK-006` | 上游 gate 决策满足 | `candidate_review_result_to_queue_ready_gate_decision = queue-ready` | 保持 `not-open` |
| `QUEUE-READY-UPDATE-GATE-CHECK-007` | 复核结果完整 | 复核人、日期、范围、结果、理由和拒绝条件齐备 | 保持 `not-open` |
| `QUEUE-READY-UPDATE-GATE-CHECK-008` | queue 更新条件满足 | queue 未关闭、未过期、未撤回、未重复，且变更范围唯一 | 保持 `not-open` |
| `QUEUE-READY-UPDATE-GATE-CHECK-009` | 状态升级冻结 | 不出现 signed / ready-by-default / approved-for-edit / sql yes | 标记 `blocked` |
| `QUEUE-READY-UPDATE-GATE-CHECK-010` | 下游执行冻结 | 不直接创建审批请求、写入 signoff、DQ、SQL | 保持 `apply_allowed = no` |

## 6. Queue Ready Update Gate 映射

| queue_ready_update_gate_id | candidate_review_result_to_queue_ready_gate_id | queue_ready_candidate_review_result_id | queue_ready_candidate_review_gate_id | queue_ready_candidate_id | approval_queue_id | update_request_id | target_ledger_id | target_source_asset | proposal_type | approval_owner_role | candidate_review_result_to_queue_ready_gate_decision_observed | candidate_review_result_status_observed | candidate_review_result_decision_observed | queue_entry_status_observed | owner_window_status_observed | reviewer_identity_status_observed | review_scope_status_observed | queue_ready_update_gate_decision | queue_ready_update_ledger_status_after_gate | queue_entry_status_after_gate | approval_request_status_after_gate | apply_allowed | dq_allowed | sql_allowed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-POLICY-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-POLICY-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-POLICY-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-POLICY-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-POLICY-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | COMPLIANCE | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-PII-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-PII-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-PII-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-PII-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | blocker | COMPLIANCE | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA / VOC | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-FRESH-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-TAG-SOURCE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-TAG-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-TAG-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-TAG-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-TAG-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | no-update | VOC | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-TAG-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-TAG-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-TAG-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-TAG-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-TAG-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | VOC / PRODUCT | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-TAG-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-TAG-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-TAG-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-TAG-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-TAG-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | DATA / VOC | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-TAG-SAMPLE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-TAG-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-TAG-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-TAG-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | draft | VOC | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-METRIC-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-METRIC-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-METRIC-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-METRIC-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-METRIC-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-METRIC-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-METRIC-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-METRIC-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-METRIC-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-METRIC-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA / BI | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-METRIC-BI-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-METRIC-BI-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-METRIC-BI-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-METRIC-BI-001` | `VOC-QUEUE-READY-CANDIDATE-B1-METRIC-BI-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | blocker | BI | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-METRIC-FRESH-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-METRIC-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-METRIC-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-METRIC-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-B1-METRIC-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-SOURCE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | no-update | DATA | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA / VOC | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-PII-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-PII-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-PII-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-PII-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | COMPLIANCE | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-SERVICE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-SERVICE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-SERVICE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-SERVICE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | SERVICE | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-SOURCE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | no-update | DATA | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA / VOC | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-SAMPLE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | draft | VOC / SERVICE | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-PII-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-PII-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-PII-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-PII-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | blocker | COMPLIANCE | not-open | not-recorded | not-open | not-ready | missing | missing | missing | not-open | not-created | not-ready | not-created | no | no | no |

## 7. 状态迁移边界

| 迁移 | 本文是否执行 | 必要前提 | 禁止事项 |
| --- | --- | --- | --- |
| `not-open -> returned` | no | 上游 gate 可追溯但 queue 已关闭、过期、重复或复核范围缺失 | 不把 returned 当作审批拒绝 |
| `not-open -> blocked` | no | 上游 gate 或 queue 链路出现 forbidden content 或硬升级值 | 不继续进入审批 |
| `not-open -> update-ready` | no | 上游 gate 已真实 `queue-ready`，queue 可更新，复核和 Owner 窗口齐备 | 不直接修改 queue |
| `update-ready -> ready-to-create` | no | 后续 queue ready update ledger 草稿和复核记录齐备 | 本文不创建 ledger |
| `ready-to-create -> ready` | no | 后续 ledger 明确更新 queue 状态且审批链齐备 | 本文不更新 approval queue |
| `ready -> pending-approval` | no | 真实审批请求已登记 | 本文不创建审批请求 |

## 8. 来源级 Gate 分组

| target_source_asset | update_gate_slot_count | approval_owner_roles | current_update_gate_status | 当前阻断 |
| --- | ---: | --- | --- | --- |
| `ods_voc_external` | 5 | COMPLIANCE / DATA / VOC | not-open | result-to-queue-ready gate not-open; review result not-recorded; queue not-ready |
| `dim_voc_tag` | 4 | VOC / PRODUCT / DATA | not-open | result-to-queue-ready gate not-open; review result not-recorded; queue not-ready |
| `fact_voc_summary` | 4 | DATA / BI | not-open | result-to-queue-ready gate not-open; review result not-recorded; queue not-ready |
| `dwd_voc_record_detail_full` | 5 | DATA / VOC / COMPLIANCE / SERVICE | not-open | result-to-queue-ready gate not-open; review result not-recorded; queue not-ready |
| `ods_review_detail` | 5 | DATA / VOC / SERVICE / COMPLIANCE | not-open | result-to-queue-ready gate not-open; review result not-recorded; queue not-ready |

## 9. 禁止值边界

| forbidden_value | 禁止原因 |
| --- | --- |
| `queue_ready_update_gate_decision = update-ready` | 需要真实 queue-ready 上游 gate、复核结果、Owner 窗口和 queue 更新条件 |
| `queue_ready_update_ledger_status_after_gate = ready-to-create` | 需要后续 queue ready update ledger 计划和复核记录 |
| `queue_entry_status_after_gate = ready` | 需要后续 ledger 真实更新 queue 状态 |
| `queue_entry_status_after_gate = pending-approval` | 需要真实审批请求 |
| `approval_request_status_after_gate = created` | 需要真实审批系统或会议登记 |
| `update_request_status = approved-for-edit` | 需要审批通过和回滚规则 |
| `source_status = signed` | 需要真实 Owner 签收 |
| `owner_status = signed` | 需要 `signoff_id`、Owner、日期、范围和证据引用 |
| `dq_readiness_status = ready` | 需要完整 source / access / sample / pii / pk-grain / field / freshness 证据链 |
| `sql_allowed = yes` | SQL 准入必须另有审批 |
| 全文、URL 批量、用户标识、截图 | 当前证据边界不允许纳入 |

## 10. 当前冻结状态

| 对象 | 当前状态 | 说明 |
| --- | --- | --- |
| `candidate_review_result_to_queue_ready_gate_decision_observed` | not-open | 上游 result-to-queue-ready gate 未打开 |
| `candidate_review_result_status_observed` | not-recorded | 上游 review result 未登记 |
| `candidate_review_result_decision_observed` | not-open | 上游 review result 未产生 queue-ready 决策 |
| `queue_entry_status_observed` | not-ready | 目标 queue 未就绪 |
| `owner_window_status_observed` | missing | 没有真实 Owner 和审批窗口 |
| `reviewer_identity_status_observed` | missing | 没有真实复核人 |
| `review_scope_status_observed` | missing | 没有复核范围、结果和拒绝条件 |
| `queue_ready_update_gate_decision` | not-open | 本文不打开 queue ready update gate |
| `queue_ready_update_ledger_status_after_gate` | not-created | 本文不创建 queue ready update ledger |
| `queue_entry_status_after_gate` | not-ready | 本文不把 queue 改为 ready |
| `approval_request_status_after_gate` | not-created | 本文不创建真实审批请求 |
| `apply_allowed` | no | 本文不允许写入 `VOC-SIGNOFF-001` |
| `dq_allowed` | no | 本文不允许进入 DQ |
| `sql_allowed` | no | 本文不允许 SQL |

## 11. No-Go

- 不把 `queue_ready_update_gate_decision = not-open` 解释为 `update-ready`。
- 不把 `candidate_review_result_to_queue_ready_gate_decision_observed = not-open` 解释为 `queue-ready`。
- 不把 `candidate_review_result_status_observed = not-recorded` 解释为复核结果已登记。
- 不把 `candidate_review_result_decision_observed = not-open` 解释为 `queue-ready`。
- 不把 `queue_entry_status_observed = not-ready` 解释为 queue 可接收审批。
- 不把 `owner_window_status_observed = missing` 解释为 Owner 和审批窗口齐备。
- 不把 `reviewer_identity_status_observed = missing` 解释为真实复核人已确认。
- 不把 `review_scope_status_observed = missing` 解释为复核范围和拒绝条件齐备。
- 不把 `queue_ready_update_ledger_status_after_gate = not-created` 解释为 ledger 已创建。
- 不把 `queue_entry_status_after_gate = not-ready` 解释为 `ready` 或 `pending-approval`。
- 不把 `approval_request_status_after_gate = not-created` 解释为审批请求已创建。
- 不把 `proposal_type = candidate` 解释为可直接更新 P0 signoff ledger。
- 不把 `proposal_type = no-update` 扩展成新的 update request。
- 不把 `update_request_status = not-created` 改成 `approved-for-edit`。
- 不把 `source_status = blocked` 改成 `signed`。
- 不把 `owner_status = unsigned` 改成 `signed`。
- 不把 `dq_readiness_status = blocked` 改成 `ready`。
- 不把 `sql_allowed = no` 改成 `yes`。
- 不创建、修改或执行任何 `sql/` 文件。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 12. 下游入口

下一步建议创建 `VOC-BATCH1-QUEUE-READY-UPDATE-LEDGER-001`，用于定义未来 queue ready update gate 达到 `update-ready` 后的 queue 状态更新台账。

建议文件：

- `drafts/analysis/voc-topic-batch1-queue-ready-update-ledger-draft-20260604.md`

下游文件仍只能是草稿分析资产，不能替代真实审批、签收、DQ 或 SQL 准入。
