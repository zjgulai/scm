---
title: 专题① VOC Batch 1 approval packet template 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-approval-packet-template
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Approval Packet Template 草稿

## 1. 目的

本文执行 `VOC-BATCH1-APPROVAL-PACKET-TEMPLATE-001`，承接 Batch 1 ledger approval queue。

本文只定义每条审批队列槽位进入真实审批前必须提交的 packet 模板，不创建真实 packet 实例，不创建真实审批请求，不登记真实审批结果，不改写 `VOC-SIGNOFF-001`，不允许 DQ，不允许 SQL。

## 2. 当前结论

- 23 条 approval queue 当前保持 `queue_entry_status = not-ready`。
- 23 条 approval packet template 当前保持 `packet_template_status = draft`。
- 23 条 approval packet instance 当前保持 `packet_instance_status = not-created`。
- 23 条 approval packet 当前保持 `evidence_packet_status = not-attached`。
- 23 条 approval packet 当前保持 `approval_request_status_after_packet = not-created`。
- 23 条 approval packet 当前保持 `queue_entry_status_after_packet = not-ready`。
- 23 条 approval packet 当前保持 `apply_allowed = no`。
- 5 个目标来源仍保持 `source_status = blocked` 与 `owner_status = unsigned`。
- `dq_readiness_status` 仍保持 `blocked`。
- `sql_allowed` 仍保持 `no`。

## 3. 上游依据

| 上游文件 | 本文使用方式 |
| --- | --- |
| `drafts/analysis/voc-topic-batch1-ledger-approval-queue-draft-20260604.md` | 固定 23 条 approval queue、not-ready 状态和队列阻断原因 |
| `drafts/analysis/voc-topic-batch1-ledger-update-approval-gate-draft-20260604.md` | 固定 23 条 approval gate、审批角色和禁止升级边界 |
| `drafts/analysis/voc-topic-batch1-result-to-ledger-update-gate-draft-20260604.md` | 固定 23 条 result-to-ledger gate 与 proposal_type |
| `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 23 条 update_request_id、目标字段和 forbidden value |
| `drafts/analysis/voc-topic-batch1-review-result-ledger-draft-20260604.md` | 固定 review result 来源，不把结果扩展为审批 |
| `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定目标 P0 ledger 的 blocked / unsigned / sql no 状态 |
| `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 仍不可进入 |
| `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 SQL 前置条件仍未满足 |

## 4. Packet 模板字段

| 字段 | 含义 | 当前约束 |
| --- | --- | --- |
| `approval_packet_template_id` | packet 模板 ID | required |
| `approval_queue_id` | 上游 approval queue | required |
| `approval_gate_id` | 上游 approval gate | required |
| `update_request_id` | 上游 update request 槽位 | required |
| `target_ledger_id` | 目标 P0 signoff ledger | required |
| `target_source_asset` | 目标来源资产 | required |
| `proposal_type` | candidate / requested / draft / blocker / no-update | 继承上游 |
| `approval_owner_role` | 审批 Owner 角色 | 继承上游 |
| `packet_required_sections` | 必需章节集合 | required |
| `packet_template_status` | draft / review / stable | 当前为 `draft` |
| `packet_instance_status` | not-created / draft / submitted / returned / approved / rejected | 当前为 `not-created` |
| `evidence_packet_status` | not-attached / attached / returned | 当前为 `not-attached` |
| `approval_request_status_after_packet` | not-created / created / approved / rejected | 当前为 `not-created` |
| `queue_entry_status_after_packet` | not-ready / ready / pending-approval | 当前为 `not-ready` |
| `apply_allowed` | 是否允许写入 signoff ledger | 当前为 `no` |
| `dq_allowed` | 是否允许进入 DQ | 当前为 `no` |
| `sql_allowed` | 是否允许 SQL | 当前为 `no` |

## 5. Packet 必需章节

| section_id | 章节 | 必需内容 | 禁止内容 |
| --- | --- | --- | --- |
| `PACKET-SECTION-001` | decision scope | 目标 ledger、目标字段、候选值、影响范围 | 直接写 `signed` / `ready` / `sql yes` |
| `PACKET-SECTION-002` | evidence references | evidence item、review result、review gate、来源日期 | 聊天摘要、AI 判断、无日期口头结论 |
| `PACKET-SECTION-003` | owner identity | 审批 Owner 姓名、角色、团队、审批窗口 | `self`、AI、会议主持人代签 |
| `PACKET-SECTION-004` | field boundary | 可触达字段、允许值、禁止值、回填理由 | 超出 ledger update control 的字段 |
| `PACKET-SECTION-005` | forbidden content screen | 原文、URL 批量、用户标识、截图检查结论 | 完整原文、URL 批量列表、用户标识、未脱敏截图 |
| `PACKET-SECTION-006` | rollback rule | 撤回、越界、误用、拒绝、证据失效回滚规则 | 无回滚方案的审批 |
| `PACKET-SECTION-007` | downstream freeze | signoff、DQ、SQL 不自动升级声明 | 把 packet 当作执行授权 |

## 6. Packet 准入检查

| check_id | 检查项 | 通过条件 | 未通过处理 |
| --- | --- | --- | --- |
| `PACKET-CHECK-001` | queue 可追溯 | `approval_queue_id` 属于 23 条冻结槽位 | 拒绝创建 packet 实例 |
| `PACKET-CHECK-002` | gate 可追溯 | `approval_gate_id` 属于 23 条冻结槽位 | 拒绝创建 packet 实例 |
| `PACKET-CHECK-003` | update request 可追溯 | `update_request_id` 属于 23 条冻结槽位 | 拒绝新增 request |
| `PACKET-CHECK-004` | 必需章节完整 | 7 个 packet section 均存在 | 保持 `packet_instance_status = not-created` |
| `PACKET-CHECK-005` | Owner 真实 | approval_owner_name、角色、团队、窗口齐备 | 保持 `queue_entry_status_after_packet = not-ready` |
| `PACKET-CHECK-006` | 字段边界合规 | 不超过 ledger update control 允许字段 | 标记 `returned` |
| `PACKET-CHECK-007` | 禁止内容未出现 | 无全文、URL 批量、用户标识、截图 | 标记 `returned` |
| `PACKET-CHECK-008` | 状态升级冻结 | 不出现 signed / ready / approved-for-edit / sql yes | 标记 `returned` |
| `PACKET-CHECK-009` | 下游执行冻结 | 不直接写入 signoff、DQ、SQL | 保持 `apply_allowed = no` |

## 7. Approval Packet Template 映射

| approval_packet_template_id | approval_queue_id | approval_gate_id | update_request_id | target_ledger_id | target_source_asset | proposal_type | approval_owner_role | packet_required_sections | packet_template_status | packet_instance_status | evidence_packet_status | approval_request_status_after_packet | queue_entry_status_after_packet | apply_allowed | dq_allowed | sql_allowed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-POLICY-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-POLICY-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | COMPLIANCE | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PII-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | blocker | COMPLIANCE | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA / VOC | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-EXT-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-EXT-FRESH-001` | `VOC-LEDGER-APPROVAL-GATE-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | candidate | DATA | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-TAG-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SOURCE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | no-update | VOC | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-TAG-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | VOC / PRODUCT | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-TAG-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | candidate | DATA / VOC | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | draft | VOC | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-METRIC-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-METRIC-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA / BI | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-METRIC-BI-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-BI-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | blocker | BI | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-METRIC-FRESH-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-METRIC-FRESH-001` | `VOC-LEDGER-APPROVAL-GATE-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | candidate | DATA | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | no-update | DATA | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | candidate | DATA / VOC | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-PII-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | COMPLIANCE | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | blocker | SERVICE | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | no-update | DATA | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-PK-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PK-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | candidate | DATA / VOC | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | draft | VOC / SERVICE | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |
| `VOC-APPROVAL-PACKET-TEMPLATE-B1-REVIEW-PII-001` | `VOC-LEDGER-APPROVAL-QUEUE-B1-REVIEW-PII-001` | `VOC-LEDGER-APPROVAL-GATE-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | blocker | COMPLIANCE | all-7-sections | draft | not-created | not-attached | not-created | not-ready | no | no | no |

## 8. Packet 组装顺序

| step | packet 状态 | 必须满足 | 输出 | 禁止 |
| --- | --- | --- | --- | --- |
| 1 | `not-created` | queue 仍为 `not-ready` | 仅保留模板 | 创建审批请求 |
| 2 | `draft` | 7 个必需章节均有真实材料 | packet 草稿 | 修改 `VOC-SIGNOFF-001` |
| 3 | `submitted` | Owner、窗口、字段边界、回滚规则齐备 | 进入审批队列候选 | 改 `approved-for-edit` |
| 4 | `returned` | 证据缺失、Owner 缺失或出现 forbidden content | 退回原因 | 删除审计轨迹 |
| 5 | `approved` | 真实审批记录存在 | 仅作为后续人工回填前置 | 自动写入 ledger |
| 6 | `rejected` | 审批拒绝或证据不足 | 保留拒绝原因 | 继续推进 DQ 或 SQL |

## 9. 来源级 Packet 分组

| target_source_asset | packet_template_count | approval_owner_roles | current_packet_status | 当前阻断 |
| --- | ---: | --- | --- | --- |
| `ods_voc_external` | 5 | COMPLIANCE / DATA / VOC | draft / not-created | approval queue not-ready; evidence packet not-attached |
| `dim_voc_tag` | 4 | VOC / PRODUCT / DATA | draft / not-created | approval queue not-ready; evidence packet not-attached |
| `fact_voc_summary` | 4 | DATA / BI | draft / not-created | approval queue not-ready; evidence packet not-attached |
| `dwd_voc_record_detail_full` | 5 | DATA / VOC / COMPLIANCE / SERVICE | draft / not-created | approval queue not-ready; evidence packet not-attached |
| `ods_review_detail` | 5 | DATA / VOC / SERVICE / COMPLIANCE | draft / not-created | approval queue not-ready; evidence packet not-attached |

## 10. 禁止值边界

| forbidden_value | 禁止原因 |
| --- | --- |
| `packet_instance_status = submitted` | 需要真实 packet 材料，不由本文产生 |
| `approval_request_status_after_packet = created` | 需要真实审批系统或会议登记 |
| `approval_request_status_after_packet = approved` | 需要真实审批记录 |
| `queue_entry_status_after_packet = pending-approval` | 需要真实审批请求 |
| `update_request_status = approved-for-edit` | 需要审批通过和回滚规则 |
| `source_status = signed` | 需要真实 Owner 签收 |
| `owner_status = signed` | 需要 `signoff_id`、Owner、日期、范围和证据引用 |
| `dq_readiness_status = ready` | 需要完整 source / access / sample / pii / pk-grain / field / freshness 证据链 |
| `sql_allowed = yes` | SQL 准入必须另有审批 |
| 全文、URL 批量、用户标识、截图 | 当前证据边界不允许纳入 |

## 11. 当前冻结状态

| 对象 | 当前状态 | 说明 |
| --- | --- | --- |
| `packet_template_status` | draft | 本文只定义模板 |
| `packet_instance_status` | not-created | 本文不创建真实 packet 实例 |
| `evidence_packet_status` | not-attached | 不把上游草稿当作真实 evidence packet |
| `approval_request_status_after_packet` | not-created | 本文不创建真实审批请求 |
| `queue_entry_status_after_packet` | not-ready | Owner、窗口、证据包、回滚规则仍未满足 |
| `apply_allowed` | no | 本文不允许写入 `VOC-SIGNOFF-001` |
| `dq_allowed` | no | 本文不允许进入 DQ |
| `sql_allowed` | no | 本文不允许 SQL |

## 12. No-Go

- 不把 `packet_template_status = draft` 解释为真实 packet 已提交。
- 不把 `packet_instance_status = not-created` 解释为 packet 已创建。
- 不把 `evidence_packet_status = not-attached` 解释为证据包已绑定。
- 不把 `approval_request_status_after_packet = not-created` 解释为审批请求已创建。
- 不把 `queue_entry_status_after_packet = not-ready` 解释为 `pending-approval`。
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

## 13. 下游入口

下一步建议创建 `VOC-BATCH1-APPROVAL-PACKET-REVIEW-GATE-001`，用于定义 packet 实例未来提交后如何审查完整性、Owner 真实性、字段边界和 forbidden content。

建议文件：

- `drafts/analysis/voc-topic-batch1-approval-packet-review-gate-draft-20260604.md`

下游文件仍只能是草稿分析资产，不能替代真实审批、签收、DQ 或 SQL 准入。
