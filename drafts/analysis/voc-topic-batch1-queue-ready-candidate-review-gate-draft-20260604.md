---
title: 专题① VOC Batch 1 queue ready candidate review gate 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-queue-ready-candidate-review-gate
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Queue Ready Candidate Review Gate 草稿

## 1. 目的

本文执行 `VOC-BATCH1-QUEUE-READY-CANDIDATE-REVIEW-GATE-001`，承接 Batch 1 queue ready candidate ledger。

本文只定义 queue ready candidate 未来进入人工复核前的 review gate，不创建真实 candidate，不执行人工复核，不把任何槽位改为 `candidate-created`、`candidate-review-ready`、`queue-ready`、`ready` 或 `pending-approval`，不创建真实审批请求，不登记审批通过，不改写 `VOC-SIGNOFF-001`，不允许 DQ，不允许 SQL。

## 2. 当前结论

- 23 条 queue ready candidate 当前保持 `queue_ready_candidate_status = not-created`。
- 23 条 candidate review gate 当前保持 `candidate_review_gate_decision = not-open`。
- 23 条 candidate review gate 当前保持 `result_to_queue_gate_decision_observed = not-open`。
- 23 条 candidate review gate 当前保持 `queue_ready_candidate_status_observed = not-created`。
- 23 条 candidate review gate 当前保持 `packet_review_result_status_observed = not-recorded`。
- 23 条 candidate review gate 当前保持 `queue_entry_status_observed = not-ready`。
- 23 条 candidate review gate 当前保持 `owner_window_status_observed = missing`。
- 23 条 candidate review gate 当前保持 `candidate_review_result_status_after_gate = not-recorded`。
- 23 条 candidate review gate 当前保持 `queue_ready_candidate_status_after_gate = not-created`。
- 23 条 candidate review gate 当前保持 `queue_entry_status_after_gate = not-ready`。
- 23 条 candidate review gate 当前保持 `approval_request_status_after_gate = not-created`。
- 23 条 candidate review gate 当前保持 `apply_allowed = no`。
- 5 个目标来源仍保持 `source_status = blocked` 与 `owner_status = unsigned`。
- `dq_readiness_status` 仍保持 `blocked`。
- `sql_allowed` 仍保持 `no`。

## 3. 上游依据

| 上游文件 | 本文使用方式 |
| --- | --- |
| `drafts/analysis/voc-topic-batch1-queue-ready-candidate-ledger-draft-20260604.md` | 固定 23 条 queue ready candidate、not-created 状态和 candidate 阻断 |
| `drafts/analysis/voc-topic-batch1-packet-result-to-queue-gate-draft-20260604.md` | 固定 23 条 result-to-queue gate、not-open 状态 |
| `drafts/analysis/voc-topic-batch1-approval-packet-review-result-ledger-draft-20260604.md` | 固定 23 条 packet review result、not-recorded 状态 |
| `drafts/analysis/voc-topic-batch1-ledger-approval-queue-draft-20260604.md` | 固定 23 条 approval queue、not-ready 状态 |
| `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 23 条 update_request_id、目标字段和 forbidden value |
| `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定目标 P0 ledger 的 blocked / unsigned / sql no 状态 |
| `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 仍不可进入 |
| `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 SQL 前置条件仍未满足 |

## 4. Candidate Review Gate 字段

| 字段 | 含义 | 当前约束 |
| --- | --- | --- |
| `queue_ready_candidate_review_gate_id` | candidate review gate ID | required |
| `queue_ready_candidate_id` | 上游 queue ready candidate | required |
| `packet_result_to_queue_gate_id` | 上游 result-to-queue gate | required |
| `packet_review_result_id` | 上游 packet review result | required |
| `approval_queue_id` | 目标 approval queue | required |
| `update_request_id` | 上游 update request 槽位 | required |
| `target_ledger_id` | 目标 P0 signoff ledger | required |
| `target_source_asset` | 目标来源资产 | required |
| `proposal_type` | candidate / requested / draft / blocker / no-update | 继承上游 |
| `approval_owner_role` | 审批 Owner 角色 | 继承上游 |
| `result_to_queue_gate_decision_observed` | 观察到的 result-to-queue gate 决策 | 当前为 `not-open` |
| `queue_ready_candidate_status_observed` | 观察到的 candidate 状态 | 当前为 `not-created` |
| `packet_review_result_status_observed` | 观察到的 packet review result 状态 | 当前为 `not-recorded` |
| `queue_entry_status_observed` | 观察到的 queue 状态 | 当前为 `not-ready` |
| `owner_window_status_observed` | Owner 和审批窗口是否齐备 | 当前为 `missing` |
| `candidate_review_gate_decision` | not-open / blocked / returned / candidate-review-ready | 当前为 `not-open` |
| `candidate_review_result_status_after_gate` | not-recorded / ready-to-record | 当前为 `not-recorded` |
| `queue_ready_candidate_status_after_gate` | not-created / candidate-created / reviewed | 当前为 `not-created` |
| `queue_entry_status_after_gate` | not-ready / ready / pending-approval | 当前为 `not-ready` |
| `approval_request_status_after_gate` | not-created / created | 当前为 `not-created` |
| `apply_allowed` | 是否允许写入 signoff ledger | 当前为 `no` |
| `dq_allowed` | 是否允许进入 DQ | 当前为 `no` |
| `sql_allowed` | 是否允许 SQL | 当前为 `no` |

## 5. Candidate Review Gate 检查项

| check_id | 检查项 | 通过条件 | 未通过处理 |
| --- | --- | --- | --- |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-001` | candidate 可追溯 | `queue_ready_candidate_id` 属于 23 条冻结槽位 | 拒绝开启 review gate |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-002` | result-to-queue gate 可追溯 | `packet_result_to_queue_gate_id` 属于 23 条冻结槽位 | 拒绝开启 review gate |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-003` | approval queue 可追溯 | `approval_queue_id` 属于 23 条冻结槽位 | 拒绝新增 queue |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-004` | update request 可追溯 | `update_request_id` 属于 23 条冻结槽位 | 拒绝新增 request |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-005` | candidate 已真实创建 | `queue_ready_candidate_status = candidate-created` | 保持 `not-open` |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-006` | 上游入队 gate 已通过 | `result_to_queue_gate_decision = queue-ready` | 保持 `not-open` |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-007` | Owner 和窗口齐备 | 真实 Owner、审批窗口、团队和日期可追溯 | 保持 `not-open` |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-008` | 禁止内容未出现 | 无全文、URL 批量、用户标识、截图 | 标记 `blocked` |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-009` | 状态升级冻结 | 不出现 signed / ready-by-default / approved-for-edit / sql yes | 标记 `blocked` |
| `QUEUE-READY-CANDIDATE-REVIEW-GATE-CHECK-010` | 下游执行冻结 | 不直接创建审批请求、写入 signoff、DQ、SQL | 保持 `apply_allowed = no` |

## 6. Candidate Review Gate 映射

| queue_ready_candidate_review_gate_id | queue_ready_candidate_id | packet_result_to_queue_gate_id | packet_review_result_id | approval_queue_id | update_request_id | target_ledger_id | target_source_asset | proposal_type | approval_owner_role | result_to_queue_gate_decision_observed | queue_ready_candidate_status_observed | packet_review_result_status_observed | queue_entry_status_observed | owner_window_status_observed | candidate_review_gate_decision | candidate_review_result_status_after_gate | queue_ready_candidate_status_after_gate | queue_entry_status_after_gate | approval_request_status_after_gate | apply_allowed | dq_allowed | sql_allowed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-POLICY-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-POLICY-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-EXT-POLICY-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-EXT-POLICY-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | COMPLIANCE | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-PII-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-PII-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-EXT-PII-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-EXT-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | blocker | COMPLIANCE | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-PK-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-EXT-PK-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-EXT-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-FIELD-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-EXT-FIELD-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-EXT-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA / VOC | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-EXT-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-B1-EXT-FRESH-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-EXT-FRESH-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-EXT-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-TAG-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-TAG-SOURCE-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-TAG-SOURCE-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-TAG-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | no-update | VOC | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-TAG-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-TAG-FIELD-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-TAG-FIELD-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-TAG-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | VOC / PRODUCT | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-TAG-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-TAG-PK-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-TAG-PK-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-TAG-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | DATA / VOC | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-TAG-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-TAG-SAMPLE-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-TAG-SAMPLE-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-TAG-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | draft | VOC | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-METRIC-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-METRIC-PK-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-METRIC-PK-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-METRIC-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-METRIC-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-METRIC-FIELD-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-METRIC-FIELD-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-METRIC-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA / BI | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-METRIC-BI-001` | `VOC-QUEUE-READY-CANDIDATE-B1-METRIC-BI-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-METRIC-BI-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-METRIC-BI-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | blocker | BI | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-METRIC-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-B1-METRIC-FRESH-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-METRIC-FRESH-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-METRIC-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-SOURCE-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-DETAIL-SOURCE-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | no-update | DATA | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-PK-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-DETAIL-PK-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-DETAIL-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-FIELD-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-DETAIL-FIELD-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-DETAIL-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA / VOC | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-PII-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-PII-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-DETAIL-PII-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-DETAIL-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | COMPLIANCE | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-DETAIL-SERVICE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-DETAIL-SERVICE-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-DETAIL-SERVICE-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | SERVICE | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-SOURCE-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-REVIEW-SOURCE-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | no-update | DATA | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-PK-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-PK-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-REVIEW-PK-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-REVIEW-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-FIELD-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-REVIEW-FIELD-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-REVIEW-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA / VOC | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-SAMPLE-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-REVIEW-SAMPLE-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | draft | VOC / SERVICE | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |
| `VOC-QUEUE-READY-CANDIDATE-REVIEW-GATE-B1-REVIEW-PII-001` | `VOC-QUEUE-READY-CANDIDATE-B1-REVIEW-PII-001` | `VOC-PACKET-RESULT-TO-QUEUE-GATE-B1-REVIEW-PII-001` | `VOC-APPROVAL-PACKET-REVIEW-RESULT-B1-REVIEW-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | blocker | COMPLIANCE | not-open | not-created | not-recorded | not-ready | missing | not-open | not-recorded | not-created | not-ready | not-created | no | no | no |

## 7. 状态迁移边界

| 迁移 | 本文是否执行 | 必要前提 | 禁止事项 |
| --- | --- | --- | --- |
| `not-open -> returned` | no | candidate 可追溯但缺少 Owner、窗口、候选创建记录或上游 queue-ready gate | 不把 returned 当作审批拒绝 |
| `not-open -> blocked` | no | candidate 或 queue 链路出现 forbidden content 或硬升级值 | 不继续进入审批 |
| `not-open -> candidate-review-ready` | no | candidate 已真实创建，上游 gate 为 `queue-ready`，Owner 和窗口齐备 | 不直接记录 review result |
| `candidate-review-ready -> ready-to-record` | no | 复核人、日期、范围、拒绝条件和证据边界已登记 | 本文不登记复核结果 |
| `ready-to-record -> queue-ready` | no | 后续 candidate review result ledger 明确允许 | 本文不把 queue 改成 ready |
| `queue-ready -> pending-approval` | no | 真实审批请求已登记 | 本文不创建审批请求 |

## 8. 来源级 Gate 分组

| target_source_asset | review_gate_slot_count | approval_owner_roles | current_review_gate_status | 当前阻断 |
| --- | ---: | --- | --- | --- |
| `ods_voc_external` | 5 | COMPLIANCE / DATA / VOC | not-open | candidate not-created; result-to-queue gate not-open; queue not-ready |
| `dim_voc_tag` | 4 | VOC / PRODUCT / DATA | not-open | candidate not-created; result-to-queue gate not-open; queue not-ready |
| `fact_voc_summary` | 4 | DATA / BI | not-open | candidate not-created; result-to-queue gate not-open; queue not-ready |
| `dwd_voc_record_detail_full` | 5 | DATA / VOC / COMPLIANCE / SERVICE | not-open | candidate not-created; result-to-queue gate not-open; queue not-ready |
| `ods_review_detail` | 5 | DATA / VOC / SERVICE / COMPLIANCE | not-open | candidate not-created; result-to-queue gate not-open; queue not-ready |

## 9. 禁止值边界

| forbidden_value | 禁止原因 |
| --- | --- |
| `candidate_review_gate_decision = candidate-review-ready` | 需要真实 candidate、上游 queue-ready gate、Owner 和审批窗口 |
| `candidate_review_result_status_after_gate = ready-to-record` | 需要复核人、日期、范围和拒绝条件，不由本文产生 |
| `queue_ready_candidate_status_after_gate = candidate-created` | 需要真实 candidate 创建记录 |
| `queue_ready_candidate_status_after_gate = reviewed` | 需要后续人工复核结果 |
| `queue_entry_status_after_gate = ready` | 需要后续 queue ready update gate |
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
| `result_to_queue_gate_decision_observed` | not-open | 上游 result-to-queue gate 未打开 |
| `queue_ready_candidate_status_observed` | not-created | 上游 candidate 未创建 |
| `packet_review_result_status_observed` | not-recorded | 没有真实 packet review result |
| `queue_entry_status_observed` | not-ready | 目标 queue 未就绪 |
| `owner_window_status_observed` | missing | 没有真实 Owner 和审批窗口 |
| `candidate_review_gate_decision` | not-open | 本文不打开 candidate review gate |
| `candidate_review_result_status_after_gate` | not-recorded | 本文不登记复核结果 |
| `queue_ready_candidate_status_after_gate` | not-created | 本文不创建或复核 candidate |
| `queue_entry_status_after_gate` | not-ready | 本文不把 queue 改为 ready |
| `approval_request_status_after_gate` | not-created | 本文不创建真实审批请求 |
| `apply_allowed` | no | 本文不允许写入 `VOC-SIGNOFF-001` |
| `dq_allowed` | no | 本文不允许进入 DQ |
| `sql_allowed` | no | 本文不允许 SQL |

## 11. No-Go

- 不把 `candidate_review_gate_decision = not-open` 解释为 `candidate-review-ready`。
- 不把 `queue_ready_candidate_status_observed = not-created` 解释为 candidate 已创建。
- 不把 `result_to_queue_gate_decision_observed = not-open` 解释为 `queue-ready`。
- 不把 `packet_review_result_status_observed = not-recorded` 解释为 `review-ready`。
- 不把 `queue_entry_status_observed = not-ready` 解释为 queue 可接收审批。
- 不把 `owner_window_status_observed = missing` 解释为 Owner 和审批窗口齐备。
- 不把 `candidate_review_result_status_after_gate = not-recorded` 解释为复核结果已登记。
- 不把 `queue_ready_candidate_status_after_gate = not-created` 解释为 candidate 已创建或已复核。
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

下一步建议创建 `VOC-BATCH1-QUEUE-READY-CANDIDATE-REVIEW-RESULT-LEDGER-001`，用于定义未来 candidate review gate 达到 `candidate-review-ready` 后的人工复核结果登记台账。

建议文件：

- `drafts/analysis/voc-topic-batch1-queue-ready-candidate-review-result-ledger-draft-20260604.md`

下游文件仍只能是草稿分析资产，不能替代真实审批、签收、DQ 或 SQL 准入。
