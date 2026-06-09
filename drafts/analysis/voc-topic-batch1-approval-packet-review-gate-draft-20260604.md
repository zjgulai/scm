---
title: 专题① VOC Batch 1 approval packet review gate 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-approval-packet-review-gate
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Approval Packet Review Gate 草稿

## 1. 目的

本文执行 `VOC-BATCH1-APPROVAL-PACKET-REVIEW-GATE-001`，承接 Batch 1 approval packet template。

本文只定义 packet 实例未来提交后的审查门控，不创建真实 packet 实例，不执行真实审查，不创建审批请求，不登记审批结果，不改写 `VOC-SIGNOFF-001`，不允许 DQ，不允许 SQL。

## 2. 当前结论

- 23 条 approval packet template 当前保持 `packet_template_status = draft`。
- 23 条 approval packet instance 当前保持 `packet_instance_status = not-created`。
- 23 条 approval packet review gate 当前保持 `packet_review_gate_decision = not-open`。
- 23 条 approval packet review gate 当前保持 `completeness_check_status = not-run`。
- 23 条 approval packet review gate 当前保持 `owner_identity_check_status = not-run`。
- 23 条 approval packet review gate 当前保持 `field_boundary_check_status = not-run`。
- 23 条 approval packet review gate 当前保持 `forbidden_content_check_status = not-run`。
- 23 条 approval packet review gate 当前保持 `rollback_rule_check_status = not-run`。
- 23 条 approval packet review gate 当前保持 `packet_instance_status_after_review = not-created`。
- 23 条 approval packet review gate 当前保持 `queue_entry_status_after_review = not-ready`。
- 23 条 approval packet review gate 当前保持 `approval_request_status_after_review = not-created`。
- 23 条 approval packet review gate 当前保持 `apply_allowed = no`。
- 5 个目标来源仍保持 `source_status = blocked` 与 `owner_status = unsigned`。
- `dq_readiness_status` 仍保持 `blocked`。
- `sql_allowed` 仍保持 `no`。

## 3. 上游依据

| 上游文件 | 本文使用方式 |
| --- | --- |
| `drafts/analysis/voc-topic-batch1-approval-packet-template-draft-20260604.md` | 固定 23 条 packet template、7 个必需 section、9 个 packet check 和状态锁 |
| `drafts/analysis/voc-topic-batch1-ledger-approval-queue-draft-20260604.md` | 固定 23 条 approval queue、not-ready 状态和队列阻断原因 |
| `drafts/analysis/voc-topic-batch1-ledger-update-approval-gate-draft-20260604.md` | 固定 23 条 approval gate、审批角色和禁止升级边界 |
| `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 23 条 update_request_id、目标字段和 forbidden value |
| `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定目标 P0 ledger 的 blocked / unsigned / sql no 状态 |
| `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 仍不可进入 |
| `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 SQL 前置条件仍未满足 |

## 4. Review Gate 字段

| 字段 | 含义 | 当前约束 |
| --- | --- | --- |
| `packet_review_gate_id` | packet review gate ID | required |
| `approval_packet_template_id` | 上游 packet template | required |
| `approval_queue_id` | 上游 approval queue | required |
| `approval_gate_id` | 上游 approval gate | required |
| `update_request_id` | 上游 update request 槽位 | required |
| `target_ledger_id` | 目标 P0 signoff ledger | required |
| `target_source_asset` | 目标来源资产 | required |
| `proposal_type` | candidate / requested / draft / blocker / no-update | 继承上游 |
| `approval_owner_role` | 审批 Owner 角色 | 继承上游 |
| `completeness_check_status` | 必需章节完整性检查 | 当前为 `not-run` |
| `owner_identity_check_status` | Owner 真实性检查 | 当前为 `not-run` |
| `field_boundary_check_status` | 字段边界检查 | 当前为 `not-run` |
| `forbidden_content_check_status` | 禁止内容检查 | 当前为 `not-run` |
| `rollback_rule_check_status` | 回滚规则检查 | 当前为 `not-run` |
| `packet_review_gate_decision` | not-open / blocked / returned / review-ready | 当前为 `not-open` |
| `packet_instance_status_after_review` | not-created / returned / submitted | 当前为 `not-created` |
| `queue_entry_status_after_review` | not-ready / ready / pending-approval | 当前为 `not-ready` |
| `approval_request_status_after_review` | not-created / created | 当前为 `not-created` |
| `apply_allowed` | 是否允许写入 signoff ledger | 当前为 `no` |
| `dq_allowed` | 是否允许进入 DQ | 当前为 `no` |
| `sql_allowed` | 是否允许 SQL | 当前为 `no` |

## 5. Review Gate 检查项

| check_id | 检查项 | 通过条件 | 未通过处理 |
| --- | --- | --- | --- |
| `PACKET-REVIEW-CHECK-001` | template 可追溯 | `approval_packet_template_id` 属于 23 条冻结槽位 | 拒绝审查 |
| `PACKET-REVIEW-CHECK-002` | queue 可追溯 | `approval_queue_id` 属于 23 条冻结槽位 | 拒绝审查 |
| `PACKET-REVIEW-CHECK-003` | update request 可追溯 | `update_request_id` 属于 23 条冻结槽位 | 拒绝新增 request |
| `PACKET-REVIEW-CHECK-004` | packet instance 真实 | packet instance 已提交且有提交时间、提交人、版本 | 保持 `not-open` |
| `PACKET-REVIEW-CHECK-005` | 7 个必需章节完整 | decision scope / evidence / owner / field / forbidden / rollback / freeze 均完整 | 标记 `returned` |
| `PACKET-REVIEW-CHECK-006` | Owner 真实性可验证 | Owner 姓名、角色、团队、审批窗口可追溯 | 标记 `returned` |
| `PACKET-REVIEW-CHECK-007` | 字段边界合规 | 不超过 ledger update control 允许字段和值 | 标记 `returned` |
| `PACKET-REVIEW-CHECK-008` | 禁止内容未出现 | 无全文、URL 批量、用户标识、截图 | 标记 `returned` |
| `PACKET-REVIEW-CHECK-009` | 回滚规则可执行 | 覆盖撤回、越界、误用、拒绝和证据失效 | 标记 `returned` |
| `PACKET-REVIEW-CHECK-010` | 状态升级冻结 | 不出现 signed / ready / approved-for-edit / sql yes | 标记 `blocked` |
| `PACKET-REVIEW-CHECK-011` | 下游执行冻结 | 不直接写入 signoff、DQ、SQL | 保持 `apply_allowed = no` |

## 6. Review Gate 映射

| packet_review_gate_id | approval_packet_template_id | approval_queue_id | approval_gate_id | update_request_id | target_ledger_id | target_source_asset | proposal_type | approval_owner_role | completeness_check_status | owner_identity_check_status | field_boundary_check_status | forbidden_content_check_status | rollback_rule_check_status | packet_review_gate_decision | packet_instance_status_after_review | queue_entry_status_after_review | approval_request_status_after_review | apply_allowed | dq_allowed | sql_allowed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-EXT-POLICY-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-POLICY-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-POLICY-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | COMPLIANCE | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-EXT-PII-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PII-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | blocker | COMPLIANCE | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-EXT-PK-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-EXT-FIELD-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA / VOC | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-EXT-FRESH-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FRESH-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-TAG-SOURCE-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-TAG-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SOURCE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | no-update | VOC | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-TAG-FIELD-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-TAG-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | VOC / PRODUCT | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-TAG-PK-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-TAG-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | DATA / VOC | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-TAG-SAMPLE-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | draft | VOC | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-METRIC-PK-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-METRIC-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-METRIC-FIELD-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-METRIC-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA / BI | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-METRIC-BI-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-METRIC-BI-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-BI-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | blocker | BI | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-METRIC-FRESH-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-METRIC-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FRESH-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-DETAIL-SOURCE-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | no-update | DATA | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-DETAIL-PK-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-DETAIL-FIELD-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA / VOC | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-DETAIL-PII-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PII-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | COMPLIANCE | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-DETAIL-SERVICE-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | SERVICE | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-REVIEW-SOURCE-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | no-update | DATA | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-REVIEW-PK-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-REVIEW-FIELD-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA / VOC | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-REVIEW-SAMPLE-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | draft | VOC / SERVICE | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |
| `VOC-APPROVAL-PACKET-REVIEW-GATE-B1-REVIEW-PII-001` | `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PII-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | blocker | COMPLIANCE | not-run | not-run | not-run | not-run | not-run | not-open | not-created | not-ready | not-created | no | no | no |

## 7. 状态迁移边界

| 迁移 | 本文是否执行 | 必要前提 | 禁止事项 |
| --- | --- | --- | --- |
| `not-open -> returned` | no | packet 实例已提交但缺章节、Owner、字段边界、回滚规则或出现 forbidden content | 不用模板草稿触发退回 |
| `not-open -> blocked` | no | packet 包含 signed / ready / approved-for-edit / sql yes 等升级值 | 不把 blocked 当作审批拒绝 |
| `not-open -> review-ready` | no | packet 实例真实提交，11 个 review check 均通过 | 不把 review-ready 当作 approved |
| `review-ready -> pending-approval` | no | 后续审批请求已真实登记 | 本文不创建审批请求 |
| `review-ready -> approved-for-edit` | no | 后续审批 Owner 已批准且有回滚规则 | 本文不授权回填 |

## 8. 来源级 Review Gate 分组

| target_source_asset | review_gate_count | approval_owner_roles | current_review_status | 当前阻断 |
| --- | ---: | --- | --- | --- |
| `ods_voc_external` | 5 | COMPLIANCE / DATA / VOC | not-open / not-run | packet instance not-created; queue not-ready |
| `dim_voc_tag` | 4 | VOC / PRODUCT / DATA | not-open / not-run | packet instance not-created; queue not-ready |
| `fact_voc_summary` | 4 | DATA / BI | not-open / not-run | packet instance not-created; queue not-ready |
| `dwd_voc_record_detail_full` | 5 | DATA / VOC / COMPLIANCE / SERVICE | not-open / not-run | packet instance not-created; queue not-ready |
| `ods_review_detail` | 5 | DATA / VOC / SERVICE / COMPLIANCE | not-open / not-run | packet instance not-created; queue not-ready |

## 9. 禁止值边界

| forbidden_value | 禁止原因 |
| --- | --- |
| `packet_review_gate_decision = review-ready` | 需要真实 packet 实例和 11 个审查项通过 |
| `packet_instance_status_after_review = submitted` | 需要真实 packet 提交记录 |
| `queue_entry_status_after_review = pending-approval` | 需要真实审批请求 |
| `approval_request_status_after_review = created` | 需要真实审批系统或会议登记 |
| `update_request_status = approved-for-edit` | 需要审批通过和回滚规则 |
| `source_status = signed` | 需要真实 Owner 签收 |
| `owner_status = signed` | 需要 `signoff_id`、Owner、日期、范围和证据引用 |
| `dq_readiness_status = ready` | 需要完整 source / access / sample / pii / pk-grain / field / freshness 证据链 |
| `sql_allowed = yes` | SQL 准入必须另有审批 |
| 全文、URL 批量、用户标识、截图 | 当前证据边界不允许纳入 |

## 10. 当前冻结状态

| 对象 | 当前状态 | 说明 |
| --- | --- | --- |
| `packet_review_gate_decision` | not-open | 没有真实 packet 实例 |
| `completeness_check_status` | not-run | 没有真实 packet 章节可审查 |
| `owner_identity_check_status` | not-run | 没有真实 Owner 姓名和审批窗口 |
| `field_boundary_check_status` | not-run | 没有真实 packet 字段提案 |
| `forbidden_content_check_status` | not-run | 没有真实 packet 内容可审查 |
| `rollback_rule_check_status` | not-run | 没有真实 packet 回滚方案 |
| `packet_instance_status_after_review` | not-created | 本文不创建或提交 packet |
| `queue_entry_status_after_review` | not-ready | 本文不推进审批队列 |
| `approval_request_status_after_review` | not-created | 本文不创建真实审批请求 |
| `apply_allowed` | no | 本文不允许写入 `VOC-SIGNOFF-001` |
| `dq_allowed` | no | 本文不允许进入 DQ |
| `sql_allowed` | no | 本文不允许 SQL |

## 11. No-Go

- 不把 `packet_review_gate_decision = not-open` 解释为 `review-ready`。
- 不把 `completeness_check_status = not-run` 解释为章节完整。
- 不把 `owner_identity_check_status = not-run` 解释为 Owner 真实。
- 不把 `field_boundary_check_status = not-run` 解释为字段边界合规。
- 不把 `forbidden_content_check_status = not-run` 解释为无 forbidden content。
- 不把 `rollback_rule_check_status = not-run` 解释为回滚规则可执行。
- 不把 `packet_instance_status_after_review = not-created` 解释为 packet 已提交。
- 不把 `queue_entry_status_after_review = not-ready` 解释为 `pending-approval`。
- 不把 `approval_request_status_after_review = not-created` 解释为审批请求已创建。
- 不把 `approval_owner_role` 当作真实 `approval_owner_name`。
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

下一步建议创建 `VOC-BATCH1-APPROVAL-PACKET-REVIEW-RESULT-LEDGER-001`，用于定义 packet review gate 未来执行后的审查结果台账。

建议文件：

- `drafts/analysis/voc-topic-batch1-approval-packet-review-result-ledger-draft-20260604.md`

下游文件仍只能是草稿分析资产，不能替代真实审批、签收、DQ 或 SQL 准入。
