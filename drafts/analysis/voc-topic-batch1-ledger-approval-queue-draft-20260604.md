---
title: 专题① VOC Batch 1 ledger approval queue 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-ledger-approval-queue
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Ledger Approval Queue 草稿

## 1. 目的

本文执行 `VOC-BATCH1-LEDGER-APPROVAL-QUEUE-001`，承接 Batch 1 ledger update approval gate。

本文只建立审批队列槽位和准入规则，不创建真实审批请求，不登记真实审批结果，不改写 `VOC-SIGNOFF-001`，不允许 DQ，不允许 SQL。

## 2. 当前结论

- 23 条 approval gate 当前保持 `approval_gate_decision = not-open`。
- 23 条 approval queue 当前保持 `queue_entry_status = not-ready`。
- 23 条 approval queue 当前保持 `approval_request_status = not-created`。
- 23 条 approval queue 当前保持 `approval_owner_name = TBD`。
- 23 条 approval queue 当前保持 `approval_window_id = TBD`。
- 23 条 approval queue 当前保持 `apply_allowed = no`。
- 5 个目标来源仍保持 `source_status = blocked` 与 `owner_status = unsigned`。
- `dq_readiness_status` 仍保持 `blocked`。
- `sql_allowed` 仍保持 `no`。

## 3. 上游依据

| 上游文件 | 本文使用方式 |
| --- | --- |
| `drafts/analysis/voc-topic-batch1-ledger-update-approval-gate-draft-20260604.md` | 固定 23 条 approval gate、审批角色、状态锁和 No-Go 边界 |
| `drafts/analysis/voc-topic-batch1-result-to-ledger-update-gate-draft-20260604.md` | 固定 23 条 result-to-ledger gate 与 proposal_type |
| `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 23 条 update_request_id、目标字段和 forbidden value |
| `drafts/analysis/voc-topic-batch1-review-result-ledger-draft-20260604.md` | 固定 review result 来源，不把结果扩展为审批 |
| `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定目标 P0 ledger 的 blocked / unsigned / sql no 状态 |
| `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 仍不可进入 |
| `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 SQL 前置条件仍未满足 |

## 4. 审批队列字段

| 字段 | 含义 | 当前约束 |
| --- | --- | --- |
| `approval_queue_id` | 审批队列 ID | required |
| `approval_gate_id` | 上游 approval gate | required |
| `update_request_id` | 上游 update request 槽位 | required |
| `target_ledger_id` | 目标 P0 signoff ledger | required |
| `target_source_asset` | 目标来源资产 | required |
| `proposal_type` | candidate / requested / draft / blocker / no-update | 继承上游 |
| `approval_owner_role` | 审批 Owner 角色 | 继承上游 |
| `approval_owner_name` | 审批 Owner 姓名 | 当前为 `TBD` |
| `approval_window_id` | 审批窗口或会议 ID | 当前为 `TBD` |
| `queue_entry_status` | not-ready / ready / pending-approval / returned / expired / closed | 当前为 `not-ready` |
| `approval_request_status` | not-created / created / approved / rejected / withdrawn | 当前为 `not-created` |
| `evidence_packet_status` | not-attached / attached / returned | 当前为 `not-attached` |
| `rollback_rule_status` | missing / drafted / approved | 当前为 `missing` |
| `queue_blocking_reason` | 队列阻断原因 | required |
| `apply_allowed` | 是否允许写入 signoff ledger | 当前为 `no` |
| `dq_allowed` | 是否允许进入 DQ | 当前为 `no` |
| `sql_allowed` | 是否允许 SQL | 当前为 `no` |

## 5. 队列准入检查

| check_id | 检查项 | 通过条件 | 未通过处理 |
| --- | --- | --- | --- |
| `QUEUE-CHECK-001` | approval gate 可追溯 | `approval_gate_id` 属于 23 条冻结槽位 | 拒绝入队 |
| `QUEUE-CHECK-002` | update request 可追溯 | `update_request_id` 属于 23 条冻结槽位 | 拒绝新增 request |
| `QUEUE-CHECK-003` | proposal_type 合法 | 值属于 candidate / requested / draft / blocker / no-update | 标记 `returned` |
| `QUEUE-CHECK-004` | 审批 Owner 真实 | `approval_owner_name` 不是 TBD、self、AI、主持人代签 | 保持 `not-ready` |
| `QUEUE-CHECK-005` | 审批窗口真实 | `approval_window_id` 可追溯到日期和会议或系统工单 | 保持 `not-ready` |
| `QUEUE-CHECK-006` | 证据包可追溯 | evidence packet 已绑定 evidence item、review result、field boundary | 保持 `not-ready` |
| `QUEUE-CHECK-007` | 回滚规则存在 | rollback rule 覆盖撤回、越界、误用、拒绝 | 保持 `not-ready` |
| `QUEUE-CHECK-008` | 禁止值未出现 | 不出现 signed / ready / approved-for-edit / sql yes | 标记 `returned` |
| `QUEUE-CHECK-009` | 下游执行冻结 | 不直接写入 signoff、DQ、SQL | 保持 `apply_allowed = no` |

## 6. Approval Queue 映射

| approval_queue_id | approval_gate_id | update_request_id | target_ledger_id | target_source_asset | proposal_type | approval_owner_role | approval_owner_name | approval_window_id | queue_entry_status | approval_request_status | evidence_packet_status | rollback_rule_status | queue_blocking_reason | apply_allowed | dq_allowed | sql_allowed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-POLICY-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | COMPLIANCE | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PII-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | blocker | COMPLIANCE | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA / VOC | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FRESH-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SOURCE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | no-update | VOC | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | VOC / PRODUCT | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | DATA / VOC | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | draft | VOC | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA / BI | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-BI-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | blocker | BI | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FRESH-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | no-update | DATA | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA / VOC | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PII-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | COMPLIANCE | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | SERVICE | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | no-update | DATA | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA / VOC | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | draft | VOC / SERVICE | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |
| `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PII-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | blocker | COMPLIANCE | TBD | TBD | not-ready | not-created | not-attached | missing | approval gate not-open; owner/window missing | no | no | no |

## 7. 状态迁移边界

| 迁移 | 本文是否执行 | 必要前提 | 禁止事项 |
| --- | --- | --- | --- |
| `not-ready -> ready` | no | approval gate 已真实 `approval-queued`，Owner、窗口、证据包、回滚规则齐备 | 不把 TBD 当作 ready |
| `ready -> pending-approval` | no | 审批请求已在真实审批系统或会议纪要中登记 | 本文不创建真实请求 |
| `pending-approval -> approved` | no | 审批 Owner 明确批准字段、值、范围、日期和回滚规则 | 不把角色名当作审批人 |
| `pending-approval -> rejected` | no | 审批 Owner 明确拒绝或证据不足 | 不删除审计轨迹 |
| `approved -> closed` | no | 后续人工回填执行台账和复核记录齐备 | 本文不写入 ledger |

## 8. 队列分组视图

| target_source_asset | queue_slot_count | approval_owner_roles | current_queue_status | 当前阻断 |
| --- | ---: | --- | --- | --- |
| `ods_voc_external` | 5 | COMPLIANCE / DATA / VOC | not-ready | approval gate not-open; owner/window missing |
| `dim_voc_tag` | 4 | VOC / PRODUCT / DATA | not-ready | approval gate not-open; owner/window missing |
| `fact_voc_summary` | 4 | DATA / BI | not-ready | approval gate not-open; owner/window missing |
| `dwd_voc_record_detail_full` | 5 | DATA / VOC / COMPLIANCE / SERVICE | not-ready | approval gate not-open; owner/window missing |
| `ods_review_detail` | 5 | DATA / VOC / SERVICE / COMPLIANCE | not-ready | approval gate not-open; owner/window missing |

## 9. 禁止值边界

| forbidden_value | 禁止原因 |
| --- | --- |
| `queue_entry_status = pending-approval` | 需要真实审批请求，不由本文产生 |
| `approval_request_status = approved` | 需要真实审批记录，不由本文产生 |
| `update_request_status = approved-for-edit` | 需要审批通过和回滚规则，不由本文产生 |
| `source_status = signed` | 需要真实 Owner 签收 |
| `owner_status = signed` | 需要 `signoff_id`、Owner、日期、范围和证据引用 |
| `dq_readiness_status = ready` | 需要完整 source / access / sample / pii / pk-grain / field / freshness 证据链 |
| `sql_allowed = yes` | SQL 准入必须另有审批 |
| 全文、URL 批量、用户标识、截图 | 当前证据边界不允许纳入 |

## 10. 当前冻结状态

| 对象 | 当前状态 | 说明 |
| --- | --- | --- |
| `queue_entry_status` | not-ready | approval gate、Owner、窗口、证据包、回滚规则均未满足 |
| `approval_request_status` | not-created | 本文不创建真实审批请求 |
| `approval_owner_name` | TBD | 不用 `self`、AI 或主持人代填 |
| `approval_window_id` | TBD | 不用聊天记录代替审批窗口 |
| `evidence_packet_status` | not-attached | 不把上游草稿当作真实 evidence packet |
| `rollback_rule_status` | missing | 后续需要审批队列逐项补齐 |
| `apply_allowed` | no | 本文不允许写入 `VOC-SIGNOFF-001` |
| `dq_allowed` | no | 本文不允许进入 DQ |
| `sql_allowed` | no | 本文不允许 SQL |

## 11. No-Go

- 不把 `queue_entry_status = not-ready` 解释为 `pending-approval`。
- 不把 `approval_request_status = not-created` 解释为审批请求已创建。
- 不把 `approval_owner_role` 当作真实 `approval_owner_name`。
- 不把 `approval_window_id = TBD` 当作真实审批会议或系统工单。
- 不把 `proposal_type = candidate` 解释为可直接更新 P0 signoff ledger。
- 不把 `proposal_type = no-update` 扩展成新的 update request。
- 不把 `approval_request_status = approved` 写入本队列。
- 不把 `update_request_status = not-created` 改成 `approved-for-edit`。
- 不把 `source_status = blocked` 改成 `signed`。
- 不把 `owner_status = unsigned` 改成 `signed`。
- 不把 `dq_readiness_status = blocked` 改成 `ready`。
- 不把 `sql_allowed = no` 改成 `yes`。
- 不创建、修改或执行任何 `sql/` 文件。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 12. 下游入口

下一步建议创建 `VOC-BATCH1-APPROVAL-PACKET-TEMPLATE-001`，用于定义每条队列槽位进入真实审批前必须具备的 approval packet 模板。

建议文件：

- `drafts/analysis/voc-topic-batch1-approval-packet-template-draft-20260604.md`

下游文件仍只能是草稿分析资产，不能替代真实审批、签收、DQ 或 SQL 准入。
