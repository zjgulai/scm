---
title: 专题① VOC Batch 1 approval request owner assignment gate 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-approval-request-owner-assignment-gate
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 approval request owner assignment gate 草稿

## 1. 定位

本文定义 23 条 VOC Batch 1 槽位在未来从 approval request creation gate 进入 owner、reviewer、review scope 分配前必须通过的 owner assignment gate。

本文不是人员分配记录。本文不分配真实 owner，不分配真实 reviewer，不确认 review scope，不创建真实 approval request，不把任何 queue entry 改为 `ready`、`pending-approval` 或 `approved-for-edit`，不写入 `VOC-SIGNOFF-001`，不允许 DQ，不允许 SQL。

## 2. 当前结论

- 23 条 approval request owner assignment gate 当前保持 `approval_request_owner_assignment_gate_decision = not-open`。
- 23 条 approval request creation gate 观察值保持 `approval_request_creation_gate_decision_observed = not-open`。
- 23 条 queue ready update apply gate 观察值保持 `queue_ready_update_apply_gate_decision_observed = not-open`。
- 23 条 approval request 观察值保持 `approval_request_status_observed = not-created`。
- 23 条 queue entry 观察值保持 `queue_entry_status_observed = not-ready`。
- 23 条 owner window 观察值保持 `owner_window_status_observed = missing`。
- 23 条 reviewer identity 观察值保持 `reviewer_identity_status_observed = missing`。
- 23 条 review scope 观察值保持 `review_scope_status_observed = missing`。
- 23 条 owner assignment 在本文后仍保持 `owner_assignment_status_after_gate = not-assigned`。
- 23 条 reviewer assignment 在本文后仍保持 `reviewer_assignment_status_after_gate = not-assigned`。
- 23 条 review scope 在本文后仍保持 `review_scope_status_after_gate = missing`。
- 23 条 approval request 在本文后仍保持 `approval_request_status_after_owner_assignment_gate = not-created`。
- 23 条 queue entry 在本文后仍保持 `queue_entry_status_after_owner_assignment_gate = not-ready`。
- 23 条槽位当前保持 `owner_assignment_allowed = no`、`reviewer_assignment_allowed = no`、`review_scope_assignment_allowed = no`、`approval_request_create_allowed = no`、`queue_ready_state_update_allowed = no`、`apply_allowed = no`、`dq_allowed = no`、`sql_allowed = no`。

## 3. 上游证据

| 上游资产 | 本文读取的状态 | 影响 |
| --- | --- | --- |
| `voc-topic-batch1-approval-request-creation-gate-draft-20260604.md` | `approval_request_creation_gate_decision = not-open` | 未达到 `creation-ready` |
| `voc-topic-batch1-approval-request-creation-gate-draft-20260604.md` | `approval_request_status_after_creation_gate = not-created` | approval request 不存在 |
| `voc-topic-batch1-approval-request-creation-gate-draft-20260604.md` | `queue_entry_status_after_creation_gate = not-ready` | queue entry 不可分配 |
| `voc-topic-batch1-approval-request-creation-gate-draft-20260604.md` | `approval_request_create_allowed = no`、`apply_allowed = no`、`dq_allowed = no`、`sql_allowed = no` | 不允许创建、写入、DQ 或 SQL |

## 4. Owner assignment gate 字段

| 字段 | 含义 | 当前约束 |
| --- | --- | --- |
| `approval_request_owner_assignment_gate_id` | 本文定义的 owner assignment gate ID | 只作为草稿规划 ID |
| `approval_request_creation_gate_id` | 上游 approval request creation gate ID | 当前未打开 |
| `queue_ready_update_apply_gate_id` | 上游 apply gate ID | 当前未打开 |
| `queue_ready_update_ledger_id` | 上游 update ledger ID | 当前未创建执行态 |
| `queue_ready_update_gate_id` | 上游 update gate ID | 当前未打开 |
| `candidate_review_result_to_queue_ready_gate_id` | 上游 result-to-queue-ready gate ID | 当前未打开 |
| `queue_ready_candidate_review_result_id` | 上游 review result ID | 当前未记录真实结果 |
| `approval_queue_id` | 目标 approval queue ID | 当前未 ready |
| `approval_request_id` | 未来 approval request ID | 当前不创建真实请求 |
| `owner_assignment_id` | 未来 owner assignment ID | 当前不创建真实分配 |
| `review_assignment_id` | 未来 reviewer assignment ID | 当前不创建真实分配 |
| `update_request_id` | 未来 queue 更新请求 ID | 当前不创建真实请求 |
| `target_ledger_id` | 目标 signoff ledger | 只允许引用，不允许写入 |
| `target_source_asset` | 目标源资产 | 只允许登记范围，不允许 DQ 或 SQL |
| `proposal_type` | 更新类型 | 保持候选、阻断、草稿或无需更新 |
| `proposed_owner_role` | 未来 owner 角色建议 | 当前不等于真实 owner |
| `approval_request_creation_gate_decision_observed` | 观察到的 creation gate 决策 | 当前为 `not-open` |
| `queue_ready_update_apply_gate_decision_observed` | 观察到的 apply gate 决策 | 当前为 `not-open` |
| `approval_request_status_observed` | 观察到的 approval request 状态 | 当前为 `not-created` |
| `queue_entry_status_observed` | 观察到的 queue entry 状态 | 当前为 `not-ready` |
| `owner_window_status_observed` | 观察到的 owner window 状态 | 当前为 `missing` |
| `reviewer_identity_status_observed` | 观察到的 reviewer identity 状态 | 当前为 `missing` |
| `review_scope_status_observed` | 观察到的 review scope 状态 | 当前为 `missing` |
| `approval_request_owner_assignment_gate_decision` | owner assignment gate 决策 | 当前为 `not-open` |
| `owner_assignment_status_after_gate` | 本文后 owner assignment 状态 | 当前为 `not-assigned` |
| `reviewer_assignment_status_after_gate` | 本文后 reviewer assignment 状态 | 当前为 `not-assigned` |
| `review_scope_status_after_gate` | 本文后 review scope 状态 | 当前为 `missing` |
| `approval_request_status_after_owner_assignment_gate` | 本文后 approval request 状态 | 当前为 `not-created` |
| `queue_entry_status_after_owner_assignment_gate` | 本文后 queue entry 状态 | 当前为 `not-ready` |
| `owner_assignment_allowed` | 是否允许分配 owner | 当前为 `no` |
| `reviewer_assignment_allowed` | 是否允许分配 reviewer | 当前为 `no` |
| `review_scope_assignment_allowed` | 是否允许确认 review scope | 当前为 `no` |
| `approval_request_create_allowed` | 是否允许创建 approval request | 当前为 `no` |
| `queue_ready_state_update_allowed` | 是否允许更新 queue ready 状态 | 当前为 `no` |
| `apply_allowed` | 是否允许写入 signoff ledger | 当前为 `no` |
| `dq_allowed` | 是否允许进入 DQ | 当前为 `no` |
| `sql_allowed` | 是否允许 SQL | 当前为 `no` |

## 5. Owner assignment gate 检查项

| 检查项 ID | 检查项 | 通过条件 | 当前状态 |
| --- | --- | --- | --- |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-001` | creation gate 可追溯 | 每个槽位存在上游 `approval_request_creation_gate_id` | 已登记，未打开 |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-002` | creation gate 决策满足 | `approval_request_creation_gate_decision_observed = creation-ready` | 当前 `not-open` |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-003` | approval request 存在 | `approval_request_status_observed = pending-approval` | 当前 `not-created` |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-004` | owner window 存在 | owner window 已确认 | 当前 `missing` |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-005` | reviewer identity 存在 | reviewer identity 已确认 | 当前 `missing` |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-006` | review scope 存在 | review scope 已确认 | 当前 `missing` |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-007` | 阻断项不得自动分配 | blocker 或 draft 槽位不能绕过复核分配 | 已锁定 |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-008` | 禁止内容隔离 | 不含 SQL、DQ、审批通过或写入动作 | 已锁定 |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-009` | 状态升级冻结 | 不把 `not-assigned` 改成 `assigned` | 已冻结 |
| `APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-CHECK-010` | 下游执行冻结 | 不分配人员、不创建审批请求、写入 signoff、DQ、SQL | 已冻结 |

## 6. Approval request owner assignment gate 映射

| approval_request_owner_assignment_gate_id | approval_request_creation_gate_id | queue_ready_update_apply_gate_id | queue_ready_update_ledger_id | queue_ready_update_gate_id | candidate_review_result_to_queue_ready_gate_id | queue_ready_candidate_review_result_id | approval_queue_id | approval_request_id | owner_assignment_id | review_assignment_id | update_request_id | target_ledger_id | target_source_asset | proposal_type | proposed_owner_role | approval_request_creation_gate_decision_observed | queue_ready_update_apply_gate_decision_observed | approval_request_status_observed | queue_entry_status_observed | owner_window_status_observed | reviewer_identity_status_observed | review_scope_status_observed | approval_request_owner_assignment_gate_decision | owner_assignment_status_after_gate | reviewer_assignment_status_after_gate | review_scope_status_after_gate | approval_request_status_after_owner_assignment_gate | queue_entry_status_after_owner_assignment_gate | owner_assignment_allowed | reviewer_assignment_allowed | review_scope_assignment_allowed | approval_request_create_allowed | queue_ready_state_update_allowed | apply_allowed | dq_allowed | sql_allowed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-POLICY-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-POLICY-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-EXT-POLICY-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-EXT-POLICY-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-POLICY-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-POLICY-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-POLICY-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-POLICY-001` | `VOC-APPROVAL-REQUEST-B1-EXT-POLICY-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-POLICY-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | COMPLIANCE | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-PII-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-PII-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-EXT-PII-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-EXT-PII-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-PII-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-PII-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PII-001` | `VOC-APPROVAL-REQUEST-B1-EXT-PII-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-PII-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | blocker | COMPLIANCE | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-PK-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-EXT-PK-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-EXT-PK-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PK-001` | `VOC-APPROVAL-REQUEST-B1-EXT-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-FIELD-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-EXT-FIELD-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-EXT-FIELD-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-EXT-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA / VOC | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-FRESH-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-FRESH-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-EXT-FRESH-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-EXT-FRESH-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-EXT-FRESH-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-EXT-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-EXT-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FRESH-001` | `VOC-APPROVAL-REQUEST-B1-EXT-FRESH-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-FRESH-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-TAG-SOURCE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-TAG-SOURCE-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-TAG-SOURCE-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-TAG-SOURCE-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-TAG-SOURCE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-TAG-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-TAG-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SOURCE-001` | `VOC-APPROVAL-REQUEST-B1-TAG-SOURCE-001` | `VOC-OWNER-ASSIGNMENT-B1-TAG-SOURCE-001` | `VOC-REVIEW-ASSIGNMENT-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | no-update | VOC | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-TAG-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-TAG-FIELD-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-TAG-FIELD-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-TAG-FIELD-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-TAG-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-TAG-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-TAG-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-TAG-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-TAG-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | VOC / PRODUCT | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-TAG-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-TAG-PK-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-TAG-PK-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-TAG-PK-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-TAG-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-TAG-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-TAG-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-PK-001` | `VOC-APPROVAL-REQUEST-B1-TAG-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-TAG-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | DATA / VOC | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-TAG-SAMPLE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-TAG-SAMPLE-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-TAG-SAMPLE-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-TAG-SAMPLE-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-TAG-SAMPLE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-TAG-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-TAG-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SAMPLE-001` | `VOC-APPROVAL-REQUEST-B1-TAG-SAMPLE-001` | `VOC-OWNER-ASSIGNMENT-B1-TAG-SAMPLE-001` | `VOC-REVIEW-ASSIGNMENT-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | draft | VOC | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-METRIC-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-METRIC-PK-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-METRIC-PK-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-METRIC-PK-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-METRIC-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-METRIC-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-METRIC-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-PK-001` | `VOC-APPROVAL-REQUEST-B1-METRIC-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-METRIC-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-METRIC-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-METRIC-FIELD-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-METRIC-FIELD-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-METRIC-FIELD-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-METRIC-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-METRIC-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-METRIC-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-METRIC-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-METRIC-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA / BI | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-METRIC-BI-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-METRIC-BI-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-METRIC-BI-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-METRIC-BI-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-METRIC-BI-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-METRIC-BI-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-METRIC-BI-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-BI-001` | `VOC-APPROVAL-REQUEST-B1-METRIC-BI-001` | `VOC-OWNER-ASSIGNMENT-B1-METRIC-BI-001` | `VOC-REVIEW-ASSIGNMENT-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | blocker | BI | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-METRIC-FRESH-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-METRIC-FRESH-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-METRIC-FRESH-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-METRIC-FRESH-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-METRIC-FRESH-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-METRIC-FRESH-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-METRIC-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FRESH-001` | `VOC-APPROVAL-REQUEST-B1-METRIC-FRESH-001` | `VOC-OWNER-ASSIGNMENT-B1-METRIC-FRESH-001` | `VOC-REVIEW-ASSIGNMENT-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-SOURCE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-SOURCE-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-DETAIL-SOURCE-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-DETAIL-SOURCE-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-SOURCE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SOURCE-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-SOURCE-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | no-update | DATA | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-PK-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-DETAIL-PK-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-DETAIL-PK-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PK-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-FIELD-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-DETAIL-FIELD-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-DETAIL-FIELD-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA / VOC | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-PII-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-PII-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-DETAIL-PII-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-DETAIL-PII-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-PII-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-PII-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PII-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-PII-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-PII-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | COMPLIANCE | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-SERVICE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-SERVICE-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-DETAIL-SERVICE-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-DETAIL-SERVICE-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-DETAIL-SERVICE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-DETAIL-SERVICE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SERVICE-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-SERVICE-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | SERVICE | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-SOURCE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-SOURCE-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-REVIEW-SOURCE-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-REVIEW-SOURCE-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-SOURCE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-SOURCE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SOURCE-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-SOURCE-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | no-update | DATA | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-PK-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-REVIEW-PK-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-REVIEW-PK-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-PK-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-PK-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PK-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-FIELD-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-REVIEW-FIELD-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-REVIEW-FIELD-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-FIELD-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-FIELD-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA / VOC | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-SAMPLE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-SAMPLE-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-REVIEW-SAMPLE-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-REVIEW-SAMPLE-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-SAMPLE-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-SAMPLE-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SAMPLE-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-SAMPLE-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | draft | VOC / SERVICE | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-PII-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-PII-001` | `VOC-QUEUE-READY-UPDATE-APPLY-GATE-B1-REVIEW-PII-001` | `VOC-QUEUE-READY-UPDATE-LEDGER-B1-REVIEW-PII-001` | `VOC-QUEUE-READY-UPDATE-GATE-B1-REVIEW-PII-001` | `VOC-CANDIDATE-REVIEW-RESULT-TO-QUEUE-READY-GATE-B1-REVIEW-PII-001` | `VOC-QUEUE-READY-CANDIDATE-REVIEW-RESULT-B1-REVIEW-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PII-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-PII-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-PII-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | blocker | COMPLIANCE | not-open | not-open | not-created | not-ready | missing | missing | missing | not-open | not-assigned | not-assigned | missing | not-created | not-ready | no | no | no | no | no | no | no | no |

## 7. 分源分层

| target_source_asset | 槽位数 | 当前分层 |
| --- | ---: | --- |
| `ods_voc_external` | 5 | 外部 VOC 接入，不能绕过合规、PII、主键、字段和刷新窗口确认分配 owner |
| `dim_voc_tag` | 4 | 标签维表，不能绕过字段语义、主键和样例解释确认分配 owner |
| `fact_voc_summary` | 4 | 指标汇总事实表，不能绕过主键、字段、BI 口径和刷新窗口确认分配 owner |
| `dwd_voc_record_detail_full` | 5 | VOC 明细宽表，不能绕过主键、字段、PII 和客服系统来源确认分配 owner |
| `ods_review_detail` | 5 | Review 明细，不能绕过主键、字段、样例和 PII 确认分配 owner |

## 8. 状态迁移边界

| 目标状态 | 当前是否允许 | 必要前置条件 |
| --- | --- | --- |
| `approval_request_owner_assignment_gate_decision = assignment-ready` | 否 | 上游 `approval_request_creation_gate_decision_observed = creation-ready` |
| `owner_assignment_status_after_gate = assigned` | 否 | 需要真实 owner window 和 owner 身份 |
| `reviewer_assignment_status_after_gate = assigned` | 否 | 需要真实 reviewer identity |
| `review_scope_status_after_gate = scoped` | 否 | 需要真实 review scope |
| `approval_request_status_after_owner_assignment_gate = pending-review` | 否 | 需要真实 assignment gate 通过 |
| `owner_assignment_allowed = yes` | 否 | 需要 owner assignment 准入 |
| `reviewer_assignment_allowed = yes` | 否 | 需要 reviewer assignment 准入 |
| `review_scope_assignment_allowed = yes` | 否 | 需要 review scope 准入 |
| `approval_request_create_allowed = yes` | 否 | 需要 approval request 创建审批 |
| `queue_ready_state_update_allowed = yes` | 否 | 需要 queue ready state 更新审批 |
| `apply_allowed = yes` | 否 | 需要 signoff ledger 写入审批 |
| `dq_allowed = yes` | 否 | 需要 DQ 准入另行打开 |
| `sql_allowed = yes` | 否 | SQL 准入必须另有审批 |

## 9. 禁止解释

- 不把 `approval_request_owner_assignment_gate_decision = not-open` 解释为 `assignment-ready`。
- 不把 `approval_request_creation_gate_decision_observed = not-open` 解释为 `creation-ready`。
- 不把 `queue_ready_update_apply_gate_decision_observed = not-open` 解释为 `apply-ready`。
- 不把 `approval_request_status_observed = not-created` 解释为 approval request 已创建。
- 不把 `queue_entry_status_observed = not-ready` 解释为 queue 已 ready。
- 不把 `owner_window_status_observed = missing` 解释为 owner window 已确认。
- 不把 `reviewer_identity_status_observed = missing` 解释为 reviewer 已确认。
- 不把 `review_scope_status_observed = missing` 解释为 review scope 已确认。
- 不把 `owner_assignment_status_after_gate = not-assigned` 改写为 `assigned`。
- 不把 `reviewer_assignment_status_after_gate = not-assigned` 改写为 `assigned`。
- 不把 `review_scope_status_after_gate = missing` 改写为 `scoped`。
- 不把 `approval_request_status_after_owner_assignment_gate = not-created` 改写为 `pending-review`。
- 不把 `queue_entry_status_after_owner_assignment_gate = not-ready` 改写为 `pending-review`。
- 不把 `owner_assignment_allowed = no` 改成 `yes`。
- 不把 `reviewer_assignment_allowed = no` 改成 `yes`。
- 不把 `review_scope_assignment_allowed = no` 改成 `yes`。
- 不把 `approval_request_create_allowed = no` 改成 `yes`。
- 不把 `queue_ready_state_update_allowed = no` 改成 `yes`。
- 不把 `apply_allowed = no` 改成 `yes`。
- 不把 `dq_allowed = no` 改成 `yes`。
- 不把 `sql_allowed = no` 改成 `yes`。

## 10. 当前冻结状态

| 冻结项 | 当前值 | 原因 |
| --- | --- | --- |
| `approval_request_creation_gate_decision_observed` | not-open | 上游 creation gate 未打开 |
| `queue_ready_update_apply_gate_decision_observed` | not-open | 上游 apply gate 未打开 |
| `approval_request_status_observed` | not-created | 未创建审批请求 |
| `queue_entry_status_observed` | not-ready | 当前 queue 未就绪 |
| `owner_window_status_observed` | missing | 缺少 owner 窗口 |
| `reviewer_identity_status_observed` | missing | 缺少复核人身份 |
| `review_scope_status_observed` | missing | 缺少复核范围 |
| `approval_request_owner_assignment_gate_decision` | not-open | 本文不打开 owner assignment gate |
| `owner_assignment_status_after_gate` | not-assigned | 本文不分配 owner |
| `reviewer_assignment_status_after_gate` | not-assigned | 本文不分配 reviewer |
| `review_scope_status_after_gate` | missing | 本文不确认 review scope |
| `approval_request_status_after_owner_assignment_gate` | not-created | 本文不创建审批请求 |
| `queue_entry_status_after_owner_assignment_gate` | not-ready | 本文不执行 queue 更新 |
| `owner_assignment_allowed` | no | 不允许 owner 分配 |
| `reviewer_assignment_allowed` | no | 不允许 reviewer 分配 |
| `review_scope_assignment_allowed` | no | 不允许 review scope 确认 |
| `approval_request_create_allowed` | no | 不允许创建审批请求 |
| `queue_ready_state_update_allowed` | no | 不允许 queue 状态更新 |
| `apply_allowed` | no | 不允许写入 `VOC-SIGNOFF-001` |
| `dq_allowed` | no | 不允许 DQ |
| `sql_allowed` | no | 不允许 SQL |

## 11. No-Go

当前不得执行以下动作：

- 不创建、修改或执行任何 `sql/` 文件。
- 不创建 DQ 脚本、DQ 任务或 DQ 结论。
- 不创建真实 approval request。
- 不分配真实 owner、reviewer 或 review scope。
- 不把任何 approval queue entry 更新为 `ready`、`pending-approval` 或 `approved-for-edit`。
- 不写入或改写 `VOC-SIGNOFF-001`。
- 不把 `VOC-SIGNOFF-P0-*` 的 blocking 状态升级为 signed。
- 不用本文替代真实 owner review、合规复核、客服复核或 BI 口径复核。

## 12. 下游入口

下一步建议创建 `VOC-BATCH1-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-001`，对应草稿文件：

`drafts/analysis/voc-topic-batch1-approval-request-review-package-gate-draft-20260604.md`

该 gate 只用于定义未来 `approval_request_owner_assignment_gate_decision = assignment-ready` 后是否允许打开 review package。当前本文结论仍为 `not-open`、`not-assigned`、`missing`、`not-created`、`not-ready`、`owner_assignment_allowed = no`、`reviewer_assignment_allowed = no`、`review_scope_assignment_allowed = no`、`approval_request_create_allowed = no`、`queue_ready_state_update_allowed = no`、`apply_allowed = no`、`dq_allowed = no`、`sql_allowed = no`。
