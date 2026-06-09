---
title: 专题① VOC Batch 1 Owner meeting minutes ledger 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-owner-meeting-minutes-ledger
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Owner meeting minutes ledger 草稿

## 1. 台账定位

本文执行 `VOC-BATCH1-MEETING-MINUTES-LEDGER-001`，用于定义 Batch 1 的 5 个 Owner 会议真实发生后，如何登记 `minutes_id`、参会 Owner、缺席 Owner、`evidence_items_discussed`、`forbidden_content_removed`、`remaining_blocker` 和 `status_freeze_confirmed`。

本文不是会议已执行结果，不是会议纪要正文，不是 Owner 回复结果，不是 evidence 接收结果，不是 evidence review 结果，不是台账回填结果，不是 Owner 已签收结果，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议仍为 `not-held`。
- Batch 1 的 5 条 minutes ledger 行只是登记槽位。
- Batch 1 的 23 条 evidence item 仍为 `not-received`。
- Batch 1 的 23 条 review gate 仍为 `not-started`。
- Batch 1 的 23 条 ledger update control 仍为 `not-created`。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源继续保持 `dq_readiness_status = blocked`。
- 5 个 Batch 1 来源继续保持 `sql_allowed = no`。

反面论证：minutes ledger 看起来比 runbook 更接近执行事实，容易被误读成会议纪要已经生成。这个理解不成立。本文只定义纪要登记字段和槽位；没有真实 `minutes_id`、真实时间、真实参会人和真实 Owner 回复前，任何会议仍不能从 `not-held` 升级。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 Owner meeting execution runbook | `drafts/analysis/voc-topic-batch1-owner-meeting-execution-runbook-draft-20260604.md` | 固定 `VOC-BATCH1-MEETING-RUNBOOK-001` 的主持流程、纪要字段和会后冻结规则 | Amber |
| Batch 1 Owner meeting invite pack | `drafts/analysis/voc-topic-batch1-owner-meeting-invite-pack-draft-20260604.md` | 固定 `VOC-BATCH1-MEETING-INVITE-001` 的 5 个邀请和会前材料 | Amber |
| Batch 1 Owner response template | `drafts/analysis/voc-topic-batch1-owner-response-template-draft-20260604.md` | 固定 `VOC-BATCH1-RESPONSE-001` 的逐角色回复模板 | Amber |
| Batch 1 Owner execution handoff | `drafts/analysis/voc-topic-batch1-owner-execution-handoff-draft-20260604.md` | 固定 `VOC-BATCH1-HANDOFF-001` 的交接卡和状态边界 | Amber |
| Batch 1 governance status board | `drafts/analysis/voc-topic-batch1-governance-status-board-draft-20260604.md` | 固定 `VOC-BATCH1-STATUS-001` 的当前阻断状态 | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和 `not-received` | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 23 条 review gate 和 `not-started` | Amber |
| Batch 1 Owner 会议包 | `drafts/analysis/voc-topic-batch1-owner-meeting-pack-draft-20260604.md` | 固定 `VOC-MEETING-001` 的 5 个会议和提问清单 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 `blocked / unsigned / sql_allowed = no` | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. Minutes Ledger 字段模式

| 字段 | 说明 | 初始值 |
|---|---|---|
| `minutes_ledger_id` | minutes ledger 行 ID | required |
| `minutes_id` | 真实纪要 ID | `TBD` |
| `invite_id` | 来源邀请 ID | required |
| `meeting_id` | 来源会议 ID | required |
| `target_source_asset` | 目标来源 | required |
| `target_ledger_id` | 目标 `VOC-SIGNOFF-001` 行 | required |
| `scheduled_datetime` | 计划时间 | `TBD` |
| `actual_datetime` | 真实会议时间 | `TBD` |
| `meeting_execution_status` | not-held / held-pending-minutes / minutes-drafted / minutes-locked / rejected | `not-held` |
| `attendees_present` | 真实参会人 + owner_role | `TBD` |
| `attendees_missing` | 缺席 Owner 和补证责任 | `TBD` |
| `evidence_items_expected` | 本会议应讨论 evidence item | required |
| `evidence_items_discussed_count` | 已真实讨论 evidence item 数 | 0 |
| `response_template_used` | 是否使用 `VOC-BATCH1-RESPONSE-001` | no |
| `forbidden_content_removed` | 是否移除禁用材料 | `TBD` |
| `accepted_content_summary` | 可进入后续 review 的摘要 | `TBD` |
| `remaining_blocker` | 未解决阻断 | required |
| `next_action_owner` | 会后补证 Owner | `TBD` |
| `next_action_due_date` | 会后补证截止日 | `TBD` |
| `status_freeze_confirmed` | 是否确认状态冻结 | no |
| `receive_status_after_minutes` | minutes 后 evidence 接收状态 | `not-received` |
| `review_status_after_minutes` | minutes 后 review 状态 | `not-started` |
| `update_request_status_after_minutes` | minutes 后回填建议状态 | `not-created` |
| `sql_allowed_after_minutes` | minutes 后 SQL 状态 | no |

## 4. Batch 1 Minutes Ledger 总表

| minutes_ledger_id | minutes_id | invite_id | meeting_id | target_source_asset | target_ledger_id | expected evidence count | meeting_execution_status | evidence_items_discussed_count | response_template_used | status_freeze_confirmed | receive_status_after_minutes | review_status_after_minutes | update_request_status_after_minutes | sql_allowed_after_minutes |
|---|---|---|---|---|---|---:|---|---:|---|---|---|---|---|---|
| `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | TBD | `VOC-INVITE-B1-EXT-POLICY-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | 5 | not-held | 0 | no | no | not-received | not-started | not-created | no |
| `VOC-MINUTES-LEDGER-B1-TAG-001` | TBD | `VOC-INVITE-B1-TAG-001` | `VOC-MEETING-B1-TAG-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | 4 | not-held | 0 | no | no | not-received | not-started | not-created | no |
| `VOC-MINUTES-LEDGER-B1-METRIC-001` | TBD | `VOC-INVITE-B1-METRIC-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | 4 | not-held | 0 | no | no | not-received | not-started | not-created | no |
| `VOC-MINUTES-LEDGER-B1-DETAIL-001` | TBD | `VOC-INVITE-B1-DETAIL-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | 5 | not-held | 0 | no | no | not-received | not-started | not-created | no |
| `VOC-MINUTES-LEDGER-B1-REVIEW-001` | TBD | `VOC-INVITE-B1-REVIEW-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | 5 | not-held | 0 | no | no | not-received | not-started | not-created | no |

## 5. Evidence-to-Minutes 覆盖表

以下 23 条只是纪要登记应覆盖的 evidence item。当前均未真实讨论。

| evidence_item_id | minutes_ledger_id | target_source_asset | discussed_status | accepted_content_summary | forbidden_content_removed | remaining_blocker | review_entry_allowed |
|---|---|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `ods_voc_external` | not-discussed | TBD | TBD | 平台政策未登记 | no |
| `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `ods_voc_external` | not-discussed | TBD | TBD | PII 边界未登记 | no |
| `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `ods_voc_external` | not-discussed | TBD | TBD | post/comment 主键未登记 | no |
| `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `ods_voc_external` | not-discussed | TBD | TBD | 外部字段未登记 | no |
| `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-MINUTES-LEDGER-B1-EXT-POLICY-001` | `ods_voc_external` | not-discussed | TBD | TBD | 刷新和回溯未登记 | no |
| `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-MINUTES-LEDGER-B1-TAG-001` | `dim_voc_tag` | not-discussed | TBD | TBD | 标签 Owner 未登记 | no |
| `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-MINUTES-LEDGER-B1-TAG-001` | `dim_voc_tag` | not-discussed | TBD | TBD | 标签字段未登记 | no |
| `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-MINUTES-LEDGER-B1-TAG-001` | `dim_voc_tag` | not-discussed | TBD | TBD | 标签主键未登记 | no |
| `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-MINUTES-LEDGER-B1-TAG-001` | `dim_voc_tag` | not-discussed | TBD | TBD | 人审样本未登记 | no |
| `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-MINUTES-LEDGER-B1-METRIC-001` | `fact_voc_summary` | not-discussed | TBD | TBD | 唯一粒度未登记 | no |
| `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-MINUTES-LEDGER-B1-METRIC-001` | `fact_voc_summary` | not-discussed | TBD | TBD | 字段和分母未登记 | no |
| `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-MINUTES-LEDGER-B1-METRIC-001` | `fact_voc_summary` | not-discussed | TBD | TBD | BI 关系未登记 | no |
| `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-MINUTES-LEDGER-B1-METRIC-001` | `fact_voc_summary` | not-discussed | TBD | TBD | 刷新分区未登记 | no |
| `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `dwd_voc_record_detail_full` | not-discussed | TBD | TBD | 主明细来源未登记 | no |
| `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `dwd_voc_record_detail_full` | not-discussed | TBD | TBD | 明细主键未登记 | no |
| `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `dwd_voc_record_detail_full` | not-discussed | TBD | TBD | 明细字段未登记 | no |
| `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `dwd_voc_record_detail_full` | not-discussed | TBD | TBD | 内部 PII 边界未登记 | no |
| `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-MINUTES-LEDGER-B1-DETAIL-001` | `dwd_voc_record_detail_full` | not-discussed | TBD | TBD | 服务样本边界未登记 | no |
| `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `ods_review_detail` | not-discussed | TBD | TBD | review 来源未登记 | no |
| `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `ods_review_detail` | not-discussed | TBD | TBD | review 主键未登记 | no |
| `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `ods_review_detail` | not-discussed | TBD | TBD | review 字段未登记 | no |
| `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `ods_review_detail` | not-discussed | TBD | TBD | review 样本 hash 未登记 | no |
| `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-MINUTES-LEDGER-B1-REVIEW-001` | `ods_review_detail` | not-discussed | TBD | TBD | review PII 边界未登记 | no |

## 6. Minutes ID 规则

| meeting_id | minutes_id 公式 | 允许进入真实登记的前置 |
|---|---|---|
| `VOC-MEETING-B1-EXT-POLICY-001` | `VOC-MINUTES-B1-EXT-POLICY-[YYYYMMDD]` | 有真实会议时间、COMPLIANCE / DATA / VOC 参会记录 |
| `VOC-MEETING-B1-TAG-001` | `VOC-MINUTES-B1-TAG-[YYYYMMDD]` | 有真实会议时间、VOC / PRODUCT / DATA 参会记录 |
| `VOC-MEETING-B1-INTERNAL-METRIC-001` | `VOC-MINUTES-B1-METRIC-[YYYYMMDD]` | 有真实会议时间、DATA / BI / VOC 参会记录 |
| `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `VOC-MINUTES-B1-DETAIL-[YYYYMMDD]` | 有真实会议时间、DATA / VOC / SERVICE / COMPLIANCE 参会记录 |
| `VOC-MEETING-B1-REVIEW-001` | `VOC-MINUTES-B1-REVIEW-[YYYYMMDD]` | 有真实会议时间、DATA / VOC / SERVICE / COMPLIANCE 参会记录 |

任何 `minutes_id` 都不能只凭会议邀请、runbook、会前模板或口头通知生成。

## 7. 纪要正文最低字段

| 字段 | 必须记录 | 不满足时处理 |
|---|---|---|
| `minutes_id` | 按第 6 节公式生成 | 不登记真实纪要 |
| `actual_datetime` | YYYY-MM-DD HH:MM timezone | 保持 `meeting_execution_status = not-held` |
| `attendees_present` | 真实姓名 + owner_role | 标记 `owner-missing` |
| `attendees_missing` | 缺席 Owner 和补证责任 | 保留 blocker |
| `evidence_items_discussed` | 本会议 evidence item ID 清单 | 不进入 evidence intake |
| `accepted_content_summary` | 可进入后续 review 的摘要 | 不得写完整原文 |
| `forbidden_content_removed` | 会中拒收或删除的禁用材料 | 空值时不进入 review gate |
| `remaining_blocker` | 未解决的 owner / date / scope / policy / pk / field / sample 缺口 | 不得写成 resolved |
| `next_action_owner` | 会后补证 Owner | host 不得代签 |
| `status_freeze_confirmed` | yes | no 时纪要不锁定 |

## 8. 状态迁移控制

| 目标状态 | 本台账是否允许 | 条件 | 仍然禁止 |
|---|---|---|---|
| `meeting_execution_status: not-held -> held-pending-minutes` | no | 必须另有真实会议记录 | 本文直接改状态 |
| `meeting_execution_status: held-pending-minutes -> minutes-locked` | no | 必须另有真实纪要正文和 status freeze | 本文直接锁定 |
| `receive_status: not-received -> received` | no | 必须另有真实 Owner 回复和附件引用 | 把纪要当 evidence |
| `review_status: not-started -> accepted` | no | 必须按 `VOC-EVIDENCE-REVIEW-001` 审查 | 会议纪要直接 accepted |
| `update_request_status: not-created -> draft` | no | 必须 evidence review accepted 后进入 `VOC-LEDGER-UPDATE-001` | 纪要直接生成回填 |
| `owner_status: unsigned -> signed` | no | 必须有 `signoff_id`、Owner、日期和签收范围 | 口头确认改 signed |
| `dq_readiness_status: blocked -> ready` | no | 必须完整证据链和 DQ readiness 审查 | 纪要直接 ready |
| `sql_allowed: no -> yes` | no | 必须独立 SQL 准入审批 | 纪要授权 SQL |

## 9. Forbidden Content 登记规则

| forbidden_content_type | 示例 | minutes 处理 | 后续状态 |
|---|---|---|---|
| full-text | 完整评论、完整外部帖子、完整工单描述 | 记录为 removed，不保留正文 | 不进入 review gate |
| url-batch | URL 批量列表、review 链接包 | 记录为 removed，只保留禁用说明 | 不进入 evidence intake |
| user-identifier | 用户 ID、用户名、订单号、头像、未匿名账号 | 记录为 removed，要求脱敏 | 保持 blocker |
| raw-screenshot | 未脱敏截图 | 记录为 removed，要求替换为 hash 或脱敏摘录 | 保持 blocker |
| sql-dq | SQL、DQ SQL、抽取脚本、执行结果 | 记录为 rejected | 保持 `sql_allowed = no` |
| business-action | 市场规模、预算、渠道动作、库存动作、产品改版动作、责任归因 | 记录为 out-of-scope | 不进入 VOC 来源治理 |

## 10. 会后补证任务字段

| 字段 | 说明 | 初始值 |
|---|---|---|
| `followup_id` | 会后补证任务 ID | `VOC-FOLLOWUP-B1-[EVIDENCE_ITEM_ID]-001` |
| `minutes_id` | 来源纪要 ID | `TBD` |
| `evidence_item_id` | 对应 evidence item | required |
| `fix_reason` | owner-missing / date-missing / scope-too-broad / forbidden-content / policy-missing / pk-unclear / field-unclear / sample-unsafe / status-overreach | required |
| `next_action_owner` | 补证 Owner | `TBD` |
| `next_action_due_date` | 截止日期 | `TBD` |
| `allowed_fix` | 允许补充的内容 | owner、date、scope、metadata、sample-hash、desensitized-excerpt、aggregate-only |
| `forbidden_fix` | 禁止补充的内容 | full-text、URL 批量列表、用户标识、未脱敏截图、SQL、DQ |
| `followup_status` | not-created / requested / received / rejected / closed | `not-created` |

## 11. 会后冻结规则

| 状态字段 | 本台账创建后必须保持 | 原因 |
|---|---|---|
| `meeting_execution_status` | not-held | 没有真实会议纪要 |
| `receive_status` | not-received | 没有真实 Owner 回复进入 intake |
| `review_status` | not-started | 没有执行 evidence review |
| `update_request_status` | not-created | 没有生成回填建议 |
| `apply_allowed` | no | 未获回填审批 |
| `source_status` | blocked | 未完成真实来源签收 |
| `owner_status` | unsigned | 缺少 `signoff_id`、Owner、日期和签收范围 |
| `dq_readiness_status` | blocked | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed` | no | 未完成 SQL 准入审批 |

## 12. No-Go 动作

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
- 不把 minutes ledger 当作真实会议纪要。
- 不把会议邀请当作会议已执行。
- 不把 runbook 当作会议已执行。
- 不把 Owner 参会确认当作 Owner 已回复。
- 不把会议纪要当作 evidence 已接收。
- 不把 `receive_status = accepted` 当作 `owner_status = signed`。
- 不把 `review_status = accepted` 当作 `owner_status = signed`。
- 不把 `candidate-only` 当作 `signed`。
- 不把 `requested-only` 当作 `approved`。
- 不把 `draft-only` 当作 `sample_policy_status = signed`。
- 不把 `blocker-only` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 13. 下一步

下一步建议创建 `VOC-BATCH1-POST-MEETING-FOLLOWUP-001` Batch 1 post-meeting follow-up tracker 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-post-meeting-followup-tracker-draft-20260604.md`

该文件应定义真实会议纪要生成后，如何把 `remaining_blocker` 拆成会后补证任务、Owner 截止日期、允许补证材料、禁止补证材料和进入 evidence intake 的前置条件。未完成真实 Owner 会议、真实回复、evidence review 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
