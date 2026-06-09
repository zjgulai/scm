---
title: 专题① VOC Batch 1 ledger update approval gate 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-ledger-update-approval-gate
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Ledger Update Approval Gate 草稿

## 1. 目的

本文执行 `VOC-BATCH1-LEDGER-UPDATE-APPROVAL-GATE-001`，承接 Batch 1 result-to-ledger update gate 与 ledger update control。

本文只定义 23 条候选 update request 进入审批队列前的门控，不创建真实审批结果，不改写 `VOC-SIGNOFF-001`，不允许 DQ，不允许 SQL。

## 2. 当前结论

- 23 条 result-to-ledger gate 当前保持 `not-open`。
- 23 条 ledger update control 当前保持 `update_request_status = not-created`。
- 23 条 approval gate 当前保持 `approval_gate_decision = not-open`。
- 23 条 approval gate 当前保持 `update_request_status_after_gate = not-created`。
- 23 条 approval gate 当前保持 `apply_allowed = no`。
- 5 个目标来源仍保持 `source_status = blocked` 与 `owner_status = unsigned`。
- `dq_readiness_status` 仍保持 `blocked`。
- `sql_allowed` 仍保持 `no`。

## 3. 上游依据

| 上游文件 | 本文使用方式 |
| --- | --- |
| `drafts/analysis/voc-topic-batch1-result-to-ledger-update-gate-draft-20260604.md` | 固定 23 条 result-to-ledger gate、proposal_type、审批角色和状态锁 |
| `drafts/analysis/voc-topic-batch1-review-result-ledger-draft-20260604.md` | 固定 23 条 review result 与证据判断来源 |
| `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 23 条 update_request_id、目标字段边界和 forbidden value |
| `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 12 个 P0 ledger，本文仅触达其中 5 个目标 ledger |
| `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 仍不可进入 |
| `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 SQL 前置条件仍未满足 |

## 4. 审批门控字段

| 字段 | 含义 | 当前约束 |
| --- | --- | --- |
| `approval_gate_id` | 审批门控 ID | required |
| `result_to_ledger_gate_id` | 上游 result-to-ledger gate | required |
| `update_request_id` | 上游 ledger update control | required |
| `target_ledger_id` | 目标 P0 signoff ledger | required |
| `target_source_asset` | 目标来源资产 | required |
| `proposal_type` | candidate / requested / draft / blocker / no-update | 继承上游 |
| `approval_owner_role` | 审批 Owner 角色 | 继承上游 |
| `approval_owner_name` | 审批 Owner 姓名 | 当前为 `TBD` |
| `approval_window_id` | 审批窗口或会议 ID | 当前为 `TBD` |
| `field_boundary_check` | 字段边界检查 | 当前为 `not-run` |
| `forbidden_value_check` | 禁止值检查 | 当前为 `not-run` |
| `approval_gate_decision` | not-open / blocked / approval-queued / rejected | 当前为 `not-open` |
| `update_request_status_after_gate` | not-created / pending-approval | 当前保持 `not-created` |
| `apply_allowed` | 是否允许写入 signoff ledger | 当前为 `no` |
| `dq_allowed` | 是否允许进入 DQ | 当前为 `no` |
| `sql_allowed` | 是否允许 SQL | 当前为 `no` |

## 5. 门控检查

| check_id | 检查项 | 通过条件 | 未通过处理 |
| --- | --- | --- | --- |
| `APPROVAL-GATE-CHECK-001` | 上游 gate 可追溯 | `result_to_ledger_gate_id` 属于 23 条冻结槽位 | 保持 `not-open` |
| `APPROVAL-GATE-CHECK-002` | update request 可追溯 | `update_request_id` 属于 23 条 ledger update control | 拒绝新增槽位 |
| `APPROVAL-GATE-CHECK-003` | proposal_type 合法 | 值属于 candidate / requested / draft / blocker / no-update | 标记 `blocked` |
| `APPROVAL-GATE-CHECK-004` | 审批 Owner 真实 | `approval_owner_role` 与真实 `approval_owner_name` 均存在 | 保持 `not-open` |
| `APPROVAL-GATE-CHECK-005` | 审批窗口真实 | `approval_window_id` 存在并可追溯到日期 | 保持 `not-open` |
| `APPROVAL-GATE-CHECK-006` | 字段边界可控 | 只触达上游允许字段 | 标记 `blocked` |
| `APPROVAL-GATE-CHECK-007` | 禁止值未出现 | 不出现 signed / ready / approved / sql yes 类升级值 | 标记 `blocked` |
| `APPROVAL-GATE-CHECK-008` | 证据不越界 | 不纳入全文、URL 批量、用户标识、截图 | 标记 `blocked` |
| `APPROVAL-GATE-CHECK-009` | 下游执行冻结 | 不直接修改 signoff、DQ、SQL | 保持 `apply_allowed = no` |

## 6. Approval Gate 映射

| approval_gate_id | result_to_ledger_gate_id | update_request_id | target_ledger_id | target_source_asset | proposal_type | approval_owner_role | approval_owner_name | approval_window_id | field_boundary_check | forbidden_value_check | approval_gate_decision | update_request_status_after_gate | apply_allowed | dq_allowed | sql_allowed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VOC-LEDGER-APPROVAL-GATE-B1-EXT-POLICY-001` | `VOC-RESULT-TO-LEDGER-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | COMPLIANCE | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-EXT-PII-001` | `VOC-RESULT-TO-LEDGER-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | blocker | COMPLIANCE | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-EXT-PK-001` | `VOC-RESULT-TO-LEDGER-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-EXT-FIELD-001` | `VOC-RESULT-TO-LEDGER-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA / VOC | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-EXT-FRESH-001` | `VOC-RESULT-TO-LEDGER-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-TAG-SOURCE-001` | `VOC-RESULT-TO-LEDGER-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | no-update | VOC | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-TAG-FIELD-001` | `VOC-RESULT-TO-LEDGER-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | VOC / PRODUCT | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-TAG-PK-001` | `VOC-RESULT-TO-LEDGER-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | DATA / VOC | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-TAG-SAMPLE-001` | `VOC-RESULT-TO-LEDGER-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | draft | VOC | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-PK-001` | `VOC-RESULT-TO-LEDGER-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-FIELD-001` | `VOC-RESULT-TO-LEDGER-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA / BI | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-BI-001` | `VOC-RESULT-TO-LEDGER-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | blocker | BI | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-FRESH-001` | `VOC-RESULT-TO-LEDGER-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-SOURCE-001` | `VOC-RESULT-TO-LEDGER-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | no-update | DATA | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-PK-001` | `VOC-RESULT-TO-LEDGER-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-FIELD-001` | `VOC-RESULT-TO-LEDGER-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA / VOC | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-PII-001` | `VOC-RESULT-TO-LEDGER-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | COMPLIANCE | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-SERVICE-001` | `VOC-RESULT-TO-LEDGER-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | SERVICE | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-SOURCE-001` | `VOC-RESULT-TO-LEDGER-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | no-update | DATA | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-PK-001` | `VOC-RESULT-TO-LEDGER-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-FIELD-001` | `VOC-RESULT-TO-LEDGER-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA / VOC | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-SAMPLE-001` | `VOC-RESULT-TO-LEDGER-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | draft | VOC / SERVICE | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |
| `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-PII-001` | `VOC-RESULT-TO-LEDGER-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | blocker | COMPLIANCE | TBD | TBD | not-run | not-run | not-open | not-created | no | no | no |

## 7. 状态迁移边界

| 迁移 | 本文是否执行 | 必要前提 | 禁止事项 |
| --- | --- | --- | --- |
| `not-open -> blocked` | no | Owner、窗口、字段边界或 forbidden value 任一缺失 | 不用 AI 判断替代 Owner 审批 |
| `not-open -> approval-queued` | no | 上游 gate 已真实通过，审批 Owner 与窗口均存在 | 不把 `not-open` 当作已排队 |
| `approval-queued -> pending-approval` | no | 后续 approval queue 已创建并登记审批请求 | 本文不创建真实请求 |
| `pending-approval -> approved-for-edit` | no | 真实审批记录、审批范围、回滚规则齐备 | 不直接改 `VOC-SIGNOFF-001` |
| `approved-for-edit -> applied` | no | 另有写入执行台账和回滚记录 | 本文不写入 ledger |

## 8. proposal_type 处理边界

| proposal_type | 当前含义 | 本文处理 | 下游限制 |
| --- | --- | --- | --- |
| candidate | 候选字段或状态可进入审批 | 保持 `not-open` | 不能直接写入 candidate 值 |
| requested | Owner 已请求但尚未形成审批项 | 保持 `not-open` | 不能替代 approval queue |
| draft | 样本包或样本策略仍是草稿 | 保持 `not-open` | 不能升级为 signed |
| blocker | 合规、服务、BI 等阻断项 | 保持 `not-open` | 不能跳过审批 |
| no-update | 当前不创建字段回填 | 保持 `not-open` | 只能记录 Owner 路由，不生成改写 |

## 9. forbidden value 边界

| forbidden_value | 禁止原因 |
| --- | --- |
| `source_status = signed` | 需要真实 Owner 签收，不由本文产生 |
| `owner_status = signed` | 需要签收 ID、Owner 姓名、日期、范围和证据引用 |
| `dq_readiness_status = ready` | 需要 source / access / sample / pii / pk-grain / field / freshness 同时满足 |
| `sql_allowed = yes` | SQL 准入必须另有审批，不由本文授权 |
| `update_request_status = approved-for-edit` | 需要真实审批记录与回滚规则 |
| 全文、URL 批量、用户标识、截图 | 当前证据边界不允许纳入 |

## 10. 当前冻结状态

| 对象 | 当前状态 | 说明 |
| --- | --- | --- |
| `approval_gate_decision` | not-open | 没有真实审批 Owner 和审批窗口 |
| `approval_owner_name` | TBD | 不用 `self` 或 AI 代填 |
| `approval_window_id` | TBD | 不用本聊天记录代替审批窗口 |
| `field_boundary_check` | not-run | 需要后续审批队列逐项执行 |
| `forbidden_value_check` | not-run | 需要后续审批队列逐项执行 |
| `update_request_status_after_gate` | not-created | 本文不创建审批请求 |
| `apply_allowed` | no | 本文不允许写入 `VOC-SIGNOFF-001` |
| `dq_allowed` | no | 本文不允许进入 DQ |
| `sql_allowed` | no | 本文不允许 SQL |

## 11. No-Go

- 不把 `approval_gate_decision = not-open` 解释为 `approval-queued`。
- 不把 `proposal_type = candidate` 解释为可直接更新 P0 signoff ledger。
- 不把 `proposal_type = no-update` 扩展成新的 update request。
- 不把 `approval_owner_role` 当作真实 `approval_owner_name`。
- 不把 `TBD` 代替审批窗口、审批日期或审批记录。
- 不把聊天摘要、会议口头结论或 AI 判断写成 Owner 签收证据。
- 不把 `update_request_status = not-created` 改成 `pending-approval` 或 `approved-for-edit`。
- 不把 `dq_readiness_status = blocked` 改成 `ready`。
- 不把 `sql_allowed = no` 改成 `yes`。
- 不创建、修改或执行任何 `sql/` 文件。

## 12. 下游入口

下一步建议创建 `VOC-BATCH1-LEDGER-APPROVAL-QUEUE-001`，用于登记真实审批队列、审批 Owner、审批窗口和队列状态。

建议文件：

- `drafts/analysis/voc-topic-batch1-ledger-approval-queue-draft-20260604.md`

下游文件仍只能是草稿分析资产，不能替代真实签收、DQ 或 SQL 准入。
