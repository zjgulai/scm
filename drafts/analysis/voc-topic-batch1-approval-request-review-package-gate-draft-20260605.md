---
title: 专题① VOC Batch 1 approval request review package gate 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-approval-request-review-package-gate
status: draft
created: 2026-06-05
updated: 2026-06-05
owner: self
source: human+ai
---

# 专题① VOC Batch 1 approval request review package gate 草稿

## 1. 定位

本文定义 23 条 VOC Batch 1 槽位在未来从 owner assignment gate 进入 review package 打开前必须通过的 gate。

本文不是 review package 打开记录。本文不打开真实 review package，不分配真实 owner、reviewer 或 review scope，不创建真实 approval request，不把任何 queue entry 改为 `ready`、`pending-approval` 或 `approved-for-edit`，不写入 `VOC-SIGNOFF-001`，不允许 DQ，不允许 SQL。

## 2. 当前结论

- 23 条 approval request review package gate 当前保持 `approval_request_review_package_gate_decision = not-open`。
- 23 条 owner assignment gate 观察值保持 `approval_request_owner_assignment_gate_decision_observed = not-open`。
- 23 条 creation gate 观察值保持 `approval_request_creation_gate_decision_observed = not-open`。
- 23 条 approval request 观察值保持 `approval_request_status_observed = not-created`。
- 23 条 owner assignment 观察值保持 `owner_assignment_status_observed = not-assigned`。
- 23 条 reviewer assignment 观察值保持 `reviewer_assignment_status_observed = not-assigned`。
- 23 条 review scope 观察值保持 `review_scope_status_observed = missing`。
- 23 条 queue entry 观察值保持 `queue_entry_status_observed = not-ready`。
- 23 条 review package 在本文后仍保持 `review_package_status_after_gate = not-opened`。
- 23 条 approval request 在本文后仍保持 `approval_request_status_after_review_package_gate = not-created`。
- 23 条 queue entry 在本文后仍保持 `queue_entry_status_after_review_package_gate = not-ready`。
- 23 条槽位当前保持 `review_package_open_allowed = no`、`owner_assignment_allowed = no`、`reviewer_assignment_allowed = no`、`review_scope_assignment_allowed = no`、`approval_request_create_allowed = no`、`apply_allowed = no`、`dq_allowed = no`、`sql_allowed = no`。

## 3. 上游证据

| 上游资产 | 本文读取的状态 | 影响 |
| --- | --- | --- |
| `voc-topic-batch1-approval-request-owner-assignment-gate-draft-20260604.md` | `approval_request_owner_assignment_gate_decision = not-open` | 未达到 `assignment-ready` |
| `voc-topic-batch1-approval-request-owner-assignment-gate-draft-20260604.md` | `owner_assignment_status_after_gate = not-assigned` | owner 不可用于 review package |
| `voc-topic-batch1-approval-request-owner-assignment-gate-draft-20260604.md` | `reviewer_assignment_status_after_gate = not-assigned` | reviewer 不可用于 review package |
| `voc-topic-batch1-approval-request-owner-assignment-gate-draft-20260604.md` | `review_scope_status_after_gate = missing` | review scope 不可用于 review package |
| `voc-topic-batch1-approval-request-owner-assignment-gate-draft-20260604.md` | `apply_allowed = no`、`dq_allowed = no`、`sql_allowed = no` | 不允许写入、DQ 或 SQL |

## 4. Review package gate 字段

| 字段 | 含义 | 当前约束 |
| --- | --- | --- |
| `approval_request_review_package_gate_id` | 本文定义的 review package gate ID | 只作为草稿规划 ID |
| `approval_request_owner_assignment_gate_id` | 上游 owner assignment gate ID | 当前未打开 |
| `approval_request_creation_gate_id` | 上游 creation gate ID | 当前未打开 |
| `approval_request_id` | 未来 approval request ID | 当前不创建真实请求 |
| `owner_assignment_id` | 未来 owner assignment ID | 当前不创建真实分配 |
| `review_assignment_id` | 未来 reviewer assignment ID | 当前不创建真实分配 |
| `review_package_id` | 未来 review package ID | 当前不打开真实 package |
| `target_ledger_id` | 目标 signoff ledger | 只允许引用，不允许写入 |
| `target_source_asset` | 目标源资产 | 只允许登记范围，不允许 DQ 或 SQL |
| `proposal_type` | 更新类型 | 保持候选、阻断、草稿或无需更新 |
| `proposed_owner_role` | 未来 owner 角色建议 | 当前不等于真实 owner |
| `approval_request_owner_assignment_gate_decision_observed` | 观察到的 owner assignment gate 决策 | 当前为 `not-open` |
| `approval_request_creation_gate_decision_observed` | 观察到的 creation gate 决策 | 当前为 `not-open` |
| `approval_request_status_observed` | 观察到的 approval request 状态 | 当前为 `not-created` |
| `owner_assignment_status_observed` | 观察到的 owner assignment 状态 | 当前为 `not-assigned` |
| `reviewer_assignment_status_observed` | 观察到的 reviewer assignment 状态 | 当前为 `not-assigned` |
| `review_scope_status_observed` | 观察到的 review scope 状态 | 当前为 `missing` |
| `queue_entry_status_observed` | 观察到的 queue entry 状态 | 当前为 `not-ready` |
| `approval_request_review_package_gate_decision` | review package gate 决策 | 当前为 `not-open` |
| `review_package_status_after_gate` | 本文后 review package 状态 | 当前为 `not-opened` |
| `approval_request_status_after_review_package_gate` | 本文后 approval request 状态 | 当前为 `not-created` |
| `queue_entry_status_after_review_package_gate` | 本文后 queue entry 状态 | 当前为 `not-ready` |
| `review_package_open_allowed` | 是否允许打开 review package | 当前为 `no` |
| `owner_assignment_allowed` | 是否允许分配 owner | 当前为 `no` |
| `reviewer_assignment_allowed` | 是否允许分配 reviewer | 当前为 `no` |
| `review_scope_assignment_allowed` | 是否允许确认 review scope | 当前为 `no` |
| `approval_request_create_allowed` | 是否允许创建 approval request | 当前为 `no` |
| `apply_allowed` | 是否允许写入 signoff ledger | 当前为 `no` |
| `dq_allowed` | 是否允许进入 DQ | 当前为 `no` |
| `sql_allowed` | 是否允许 SQL | 当前为 `no` |

## 5. Review package gate 检查项

| 检查项 ID | 检查项 | 通过条件 | 当前状态 |
| --- | --- | --- | --- |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-001` | owner assignment gate 可追溯 | 每个槽位存在上游 `approval_request_owner_assignment_gate_id` | 已登记，未打开 |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-002` | owner assignment gate 决策满足 | `approval_request_owner_assignment_gate_decision_observed = assignment-ready` | 当前 `not-open` |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-003` | approval request 存在 | `approval_request_status_observed = pending-review` | 当前 `not-created` |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-004` | owner 已分配 | `owner_assignment_status_observed = assigned` | 当前 `not-assigned` |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-005` | reviewer 已分配 | `reviewer_assignment_status_observed = assigned` | 当前 `not-assigned` |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-006` | review scope 已确认 | `review_scope_status_observed = scoped` | 当前 `missing` |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-007` | review package 内容边界 | package 只包含待审材料，不包含审批结论 | 已锁定 |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-008` | 禁止内容隔离 | 不含 SQL、DQ、审批通过或写入动作 | 已锁定 |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-009` | 状态升级冻结 | 不把 `not-opened` 改成 `opened` | 已冻结 |
| `APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-CHECK-010` | 下游执行冻结 | 不打开 package、不创建审批请求、写入 signoff、DQ、SQL | 已冻结 |

## 6. Approval request review package gate 映射

| approval_request_review_package_gate_id | approval_request_owner_assignment_gate_id | approval_request_creation_gate_id | approval_request_id | owner_assignment_id | review_assignment_id | review_package_id | target_ledger_id | target_source_asset | proposal_type | proposed_owner_role | approval_request_owner_assignment_gate_decision_observed | approval_request_creation_gate_decision_observed | approval_request_status_observed | owner_assignment_status_observed | reviewer_assignment_status_observed | review_scope_status_observed | queue_entry_status_observed | approval_request_review_package_gate_decision | review_package_status_after_gate | approval_request_status_after_review_package_gate | queue_entry_status_after_review_package_gate | review_package_open_allowed | owner_assignment_allowed | reviewer_assignment_allowed | review_scope_assignment_allowed | approval_request_create_allowed | apply_allowed | dq_allowed | sql_allowed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-EXT-POLICY-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-POLICY-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-POLICY-001` | `VOC-APPROVAL-REQUEST-B1-EXT-POLICY-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-POLICY-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-POLICY-001` | `VOC-REVIEW-PACKAGE-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | COMPLIANCE | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-EXT-PII-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-PII-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-PII-001` | `VOC-APPROVAL-REQUEST-B1-EXT-PII-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-PII-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-PII-001` | `VOC-REVIEW-PACKAGE-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | blocker | COMPLIANCE | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-EXT-PK-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-PK-001` | `VOC-APPROVAL-REQUEST-B1-EXT-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-PK-001` | `VOC-REVIEW-PACKAGE-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-EXT-FIELD-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-EXT-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-FIELD-001` | `VOC-REVIEW-PACKAGE-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA / VOC | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-EXT-FRESH-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-EXT-FRESH-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-EXT-FRESH-001` | `VOC-APPROVAL-REQUEST-B1-EXT-FRESH-001` | `VOC-OWNER-ASSIGNMENT-B1-EXT-FRESH-001` | `VOC-REVIEW-ASSIGNMENT-B1-EXT-FRESH-001` | `VOC-REVIEW-PACKAGE-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-TAG-SOURCE-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-TAG-SOURCE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-TAG-SOURCE-001` | `VOC-APPROVAL-REQUEST-B1-TAG-SOURCE-001` | `VOC-OWNER-ASSIGNMENT-B1-TAG-SOURCE-001` | `VOC-REVIEW-ASSIGNMENT-B1-TAG-SOURCE-001` | `VOC-REVIEW-PACKAGE-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | no-update | VOC | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-TAG-FIELD-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-TAG-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-TAG-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-TAG-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-TAG-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-TAG-FIELD-001` | `VOC-REVIEW-PACKAGE-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | VOC / PRODUCT | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-TAG-PK-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-TAG-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-TAG-PK-001` | `VOC-APPROVAL-REQUEST-B1-TAG-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-TAG-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-TAG-PK-001` | `VOC-REVIEW-PACKAGE-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | DATA / VOC | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-TAG-SAMPLE-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-TAG-SAMPLE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-TAG-SAMPLE-001` | `VOC-APPROVAL-REQUEST-B1-TAG-SAMPLE-001` | `VOC-OWNER-ASSIGNMENT-B1-TAG-SAMPLE-001` | `VOC-REVIEW-ASSIGNMENT-B1-TAG-SAMPLE-001` | `VOC-REVIEW-PACKAGE-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | draft | VOC | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-METRIC-PK-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-METRIC-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-METRIC-PK-001` | `VOC-APPROVAL-REQUEST-B1-METRIC-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-METRIC-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-METRIC-PK-001` | `VOC-REVIEW-PACKAGE-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-METRIC-FIELD-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-METRIC-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-METRIC-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-METRIC-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-METRIC-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-METRIC-FIELD-001` | `VOC-REVIEW-PACKAGE-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA / BI | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-METRIC-BI-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-METRIC-BI-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-METRIC-BI-001` | `VOC-APPROVAL-REQUEST-B1-METRIC-BI-001` | `VOC-OWNER-ASSIGNMENT-B1-METRIC-BI-001` | `VOC-REVIEW-ASSIGNMENT-B1-METRIC-BI-001` | `VOC-REVIEW-PACKAGE-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | blocker | BI | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-METRIC-FRESH-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-METRIC-FRESH-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-METRIC-FRESH-001` | `VOC-APPROVAL-REQUEST-B1-METRIC-FRESH-001` | `VOC-OWNER-ASSIGNMENT-B1-METRIC-FRESH-001` | `VOC-REVIEW-ASSIGNMENT-B1-METRIC-FRESH-001` | `VOC-REVIEW-PACKAGE-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-DETAIL-SOURCE-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-SOURCE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-SOURCE-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-SOURCE-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-PACKAGE-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | no-update | DATA | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-DETAIL-PK-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-PK-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-PK-001` | `VOC-REVIEW-PACKAGE-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-DETAIL-FIELD-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-FIELD-001` | `VOC-REVIEW-PACKAGE-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA / VOC | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-DETAIL-PII-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-PII-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-PII-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-PII-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-PII-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-PII-001` | `VOC-REVIEW-PACKAGE-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | COMPLIANCE | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-DETAIL-SERVICE-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-DETAIL-SERVICE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-DETAIL-SERVICE-001` | `VOC-APPROVAL-REQUEST-B1-DETAIL-SERVICE-001` | `VOC-OWNER-ASSIGNMENT-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-ASSIGNMENT-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-PACKAGE-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | SERVICE | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-REVIEW-SOURCE-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-SOURCE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-SOURCE-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-SOURCE-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-PACKAGE-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | no-update | DATA | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-REVIEW-PK-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-PK-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-PK-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-PK-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-PK-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-PK-001` | `VOC-REVIEW-PACKAGE-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-REVIEW-FIELD-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-FIELD-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-FIELD-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-FIELD-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-FIELD-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-FIELD-001` | `VOC-REVIEW-PACKAGE-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA / VOC | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-REVIEW-SAMPLE-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-SAMPLE-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-SAMPLE-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-SAMPLE-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-PACKAGE-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | draft | VOC / SERVICE | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |
| `VOC-APPROVAL-REQUEST-REVIEW-PACKAGE-GATE-B1-REVIEW-PII-001` | `VOC-APPROVAL-REQUEST-OWNER-ASSIGNMENT-GATE-B1-REVIEW-PII-001` | `VOC-APPROVAL-REQUEST-CREATION-GATE-B1-REVIEW-PII-001` | `VOC-APPROVAL-REQUEST-B1-REVIEW-PII-001` | `VOC-OWNER-ASSIGNMENT-B1-REVIEW-PII-001` | `VOC-REVIEW-ASSIGNMENT-B1-REVIEW-PII-001` | `VOC-REVIEW-PACKAGE-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | blocker | COMPLIANCE | not-open | not-open | not-created | not-assigned | not-assigned | missing | not-ready | not-open | not-opened | not-created | not-ready | no | no | no | no | no | no | no | no |

## 7. 分源分层

| target_source_asset | 槽位数 | 当前分层 |
| --- | ---: | --- |
| `ods_voc_external` | 5 | 外部 VOC 接入，review package 不得绕过合规、PII、主键、字段和刷新窗口确认 |
| `dim_voc_tag` | 4 | 标签维表，review package 不得绕过字段语义、主键和样例解释确认 |
| `fact_voc_summary` | 4 | 指标汇总事实表，review package 不得绕过主键、字段、BI 口径和刷新窗口确认 |
| `dwd_voc_record_detail_full` | 5 | VOC 明细宽表，review package 不得绕过主键、字段、PII 和客服系统来源确认 |
| `ods_review_detail` | 5 | Review 明细，review package 不得绕过主键、字段、样例和 PII 确认 |

## 8. 状态迁移边界

| 目标状态 | 当前是否允许 | 必要前置条件 |
| --- | --- | --- |
| `approval_request_review_package_gate_decision = package-ready` | 否 | 上游 `approval_request_owner_assignment_gate_decision_observed = assignment-ready` |
| `review_package_status_after_gate = opened` | 否 | 需要真实 owner、reviewer、review scope 和 approval request |
| `approval_request_status_after_review_package_gate = under-review` | 否 | 需要真实 review package 打开 |
| `queue_entry_status_after_review_package_gate = under-review` | 否 | 需要真实 queue 状态更新准入 |
| `review_package_open_allowed = yes` | 否 | 需要 review package 打开准入 |
| `owner_assignment_allowed = yes` | 否 | 需要 owner assignment 准入 |
| `reviewer_assignment_allowed = yes` | 否 | 需要 reviewer assignment 准入 |
| `review_scope_assignment_allowed = yes` | 否 | 需要 review scope 准入 |
| `approval_request_create_allowed = yes` | 否 | 需要 approval request 创建审批 |
| `apply_allowed = yes` | 否 | 需要 signoff ledger 写入审批 |
| `dq_allowed = yes` | 否 | 需要 DQ 准入另行打开 |
| `sql_allowed = yes` | 否 | SQL 准入必须另有审批 |

## 9. 禁止解释

- 不把 `approval_request_review_package_gate_decision = not-open` 解释为 `package-ready`。
- 不把 `approval_request_owner_assignment_gate_decision_observed = not-open` 解释为 `assignment-ready`。
- 不把 `approval_request_creation_gate_decision_observed = not-open` 解释为 `creation-ready`。
- 不把 `approval_request_status_observed = not-created` 解释为 approval request 已创建。
- 不把 `owner_assignment_status_observed = not-assigned` 解释为 owner 已分配。
- 不把 `reviewer_assignment_status_observed = not-assigned` 解释为 reviewer 已分配。
- 不把 `review_scope_status_observed = missing` 解释为 review scope 已确认。
- 不把 `queue_entry_status_observed = not-ready` 解释为 queue 已 ready。
- 不把 `review_package_status_after_gate = not-opened` 改写为 `opened`。
- 不把 `approval_request_status_after_review_package_gate = not-created` 改写为 `under-review`。
- 不把 `queue_entry_status_after_review_package_gate = not-ready` 改写为 `under-review`。
- 不把 `review_package_open_allowed = no` 改成 `yes`。
- 不把 `owner_assignment_allowed = no` 改成 `yes`。
- 不把 `reviewer_assignment_allowed = no` 改成 `yes`。
- 不把 `review_scope_assignment_allowed = no` 改成 `yes`。
- 不把 `approval_request_create_allowed = no` 改成 `yes`。
- 不把 `apply_allowed = no` 改成 `yes`。
- 不把 `dq_allowed = no` 改成 `yes`。
- 不把 `sql_allowed = no` 改成 `yes`。

## 10. 当前冻结状态

| 冻结项 | 当前值 | 原因 |
| --- | --- | --- |
| `approval_request_owner_assignment_gate_decision_observed` | not-open | 上游 owner assignment gate 未打开 |
| `approval_request_creation_gate_decision_observed` | not-open | 上游 creation gate 未打开 |
| `approval_request_status_observed` | not-created | 未创建审批请求 |
| `owner_assignment_status_observed` | not-assigned | 未分配 owner |
| `reviewer_assignment_status_observed` | not-assigned | 未分配 reviewer |
| `review_scope_status_observed` | missing | 未确认 review scope |
| `queue_entry_status_observed` | not-ready | 当前 queue 未就绪 |
| `approval_request_review_package_gate_decision` | not-open | 本文不打开 review package gate |
| `review_package_status_after_gate` | not-opened | 本文不打开 review package |
| `approval_request_status_after_review_package_gate` | not-created | 本文不创建审批请求 |
| `queue_entry_status_after_review_package_gate` | not-ready | 本文不执行 queue 更新 |
| `review_package_open_allowed` | no | 不允许打开 review package |
| `owner_assignment_allowed` | no | 不允许 owner 分配 |
| `reviewer_assignment_allowed` | no | 不允许 reviewer 分配 |
| `review_scope_assignment_allowed` | no | 不允许 review scope 确认 |
| `approval_request_create_allowed` | no | 不允许创建审批请求 |
| `apply_allowed` | no | 不允许写入 `VOC-SIGNOFF-001` |
| `dq_allowed` | no | 不允许 DQ |
| `sql_allowed` | no | 不允许 SQL |

## 11. No-Go

当前不得执行以下动作：

- 不创建、修改或执行任何 `sql/` 文件。
- 不创建 DQ 脚本、DQ 任务或 DQ 结论。
- 不创建真实 approval request。
- 不分配真实 owner、reviewer 或 review scope。
- 不打开真实 review package。
- 不把任何 approval queue entry 更新为 `ready`、`pending-approval`、`under-review` 或 `approved-for-edit`。
- 不写入或改写 `VOC-SIGNOFF-001`。
- 不把 `VOC-SIGNOFF-P0-*` 的 blocking 状态升级为 signed。
- 不用本文替代真实 owner review、合规复核、客服复核或 BI 口径复核。

## 12. 下游入口

下一步建议创建 `VOC-BATCH1-APPROVAL-REQUEST-REVIEW-RESULT-GATE-001`，对应草稿文件：

`drafts/analysis/voc-topic-batch1-approval-request-review-result-gate-draft-20260605.md`

该 gate 只用于定义未来 `approval_request_review_package_gate_decision = package-ready` 后是否允许登记 review result。当前本文结论仍为 `not-open`、`not-opened`、`not-created`、`not-ready`、`review_package_open_allowed = no`、`owner_assignment_allowed = no`、`reviewer_assignment_allowed = no`、`review_scope_assignment_allowed = no`、`approval_request_create_allowed = no`、`apply_allowed = no`、`dq_allowed = no`、`sql_allowed = no`。
