---
title: 专题① VOC Batch 1 Owner meeting execution runbook 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-owner-meeting-execution-runbook
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Owner meeting execution runbook 草稿

## 1. Runbook 定位

本文执行 `VOC-BATCH1-MEETING-RUNBOOK-001`，用于把 `VOC-BATCH1-MEETING-INVITE-001` 的 5 个会议邀请转成会议执行当天的主持流程、纪要字段、证据收集检查点、退回规则和会后状态冻结规则。

本文不是会议已执行结果，不是会议纪要，不是 Owner 回复结果，不是 evidence 接收结果，不是 evidence review 结果，不是台账回填结果，不是 Owner 已签收结果，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议仍为 `not-held`。
- Batch 1 的 23 条 evidence item 仍为 `not-received`。
- Batch 1 的 23 条 review gate 仍为 `not-started`。
- Batch 1 的 23 条 ledger update control 仍为 `not-created`。
- 本文只定义会议执行 runbook，不代表会议已经召开。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源继续保持 `dq_readiness_status = blocked`。
- 5 个 Batch 1 来源继续保持 `sql_allowed = no`。

反面论证：runbook 已经包含主持话术、纪要字段和会后冻结规则，看起来像可以直接替代真实纪要。这个理解不成立。Runbook 是执行方法，不是执行事实；没有真实时间、参会人、Owner 回复、证据附件和会后审查记录前，不能推动任何状态迁移。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 Owner meeting invite pack | `drafts/analysis/voc-topic-batch1-owner-meeting-invite-pack-draft-20260604.md` | 固定 `VOC-BATCH1-MEETING-INVITE-001` 的 5 个邀请、会前材料和禁用附件 | Amber |
| Batch 1 Owner response template | `drafts/analysis/voc-topic-batch1-owner-response-template-draft-20260604.md` | 固定 `VOC-BATCH1-RESPONSE-001` 的逐角色回复模板 | Amber |
| Batch 1 Owner execution handoff | `drafts/analysis/voc-topic-batch1-owner-execution-handoff-draft-20260604.md` | 固定 `VOC-BATCH1-HANDOFF-001` 的交接卡和响应字段 | Amber |
| Batch 1 governance status board | `drafts/analysis/voc-topic-batch1-governance-status-board-draft-20260604.md` | 固定 `VOC-BATCH1-STATUS-001` 的当前阻断状态 | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和 `not-received` | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 23 条 review gate 和 `not-started` | Amber |
| Batch 1 Owner 会议包 | `drafts/analysis/voc-topic-batch1-owner-meeting-pack-draft-20260604.md` | 固定 `VOC-MEETING-001` 的 5 个会议和提问清单 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 `blocked / unsigned / sql_allowed = no` | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. 执行状态总览

| 指标 | 当前值 | Runbook 含义 |
|---|---:|---|
| 会议 runbook 数 | 5 | 只覆盖 Batch 1 的 5 个会议 |
| 已执行会议数 | 0 | 本文不生成会议纪要 |
| evidence item 数 | 23 | 仅定义收集检查点 |
| 已接收 evidence item 数 | 0 | 本文不接收证据 |
| review gate 数 | 23 | 本文只提醒未来 review，不执行审查 |
| 回填建议数 | 0 | 本文不生成 ledger update |
| `owner_status = signed` 来源数 | 0 | 不允许把会议执行写成签收 |
| `dq_readiness_status = ready` 来源数 | 0 | 不允许把会议执行写成 DQ readiness |
| `sql_allowed = yes` 来源数 | 0 | 不允许进入 `sql/` |

## 4. 会议角色

| role | 职责 | 禁止 |
|---|---|---|
| host | 按本 runbook 控制议程、状态边界、证据槽位和退回规则 | 替 Owner 代签、替 Owner 填证据 |
| recorder | 记录 meeting_id、真实参会人、待补证、禁用材料和会后 action | 把纪要写成 evidence accepted |
| primary_owner | 对本来源主证据范围负责 | 用口头确认替代表格 |
| supporting_owner | 对字段、样本、PII、BI 或业务边界补充说明 | 扩展到业务动作、SQL 或 DQ |
| reviewer_next | 会后按 `VOC-EVIDENCE-REVIEW-001` 执行审查 | 会议中直接通过 review gate |

## 5. 通用会议流程

| step | 阶段 | 主持动作 | 必须确认 | 禁止 |
|---|---|---|---|---|
| 1 | 开场状态锁 | 宣读本会议只处理一个 `target_source_asset` | `not-held`、`not-received`、`blocked`、`sql_allowed = no` 仍保持 | 宣布进入 SQL 或 DQ |
| 2 | Owner 点名 | 记录 primary_owner 和 supporting_owner 是否真实在场 | owner_role、owner_name、缺席 Owner | 会议主持人代签 |
| 3 | Evidence 槽位核对 | 逐条确认本会议 evidence_item_id | evidence item 必须来自 23 条登记槽位 | 新增来源或新增 evidence ID |
| 4 | 禁用材料提醒 | 宣读 forbidden attachments | 完整原文、URL 批量列表、真实用户标识、未脱敏截图、SQL、DQ 禁止 | 接收敏感附件 |
| 5 | 逐条收集回复 | 使用 `VOC-BATCH1-RESPONSE-001` 字段 | owner、date、scope、summary、forbidden_content、attachment_ref | 口头确认替代表格 |
| 6 | 缺口冻结 | 对未补齐项记录 remaining blocker | owner-missing、date-missing、policy-missing、pk-unclear 等 | 把 blocker 写成 resolved |
| 7 | 会后关闭 | 宣读会后只进入待 review 阶段 | `review_status = not-started`，`update_request_status = not-created` | 现场改 `VOC-SIGNOFF-001` |

## 6. 通用主持话术

以下话术用于每个会议开场，必须原样保留状态边界。

```text
本次会议只处理 [target_source_asset] 的 Batch 1 来源证据确认。

会议不会生成 SQL、DQ 脚本、生产上线结论、业务动作、市场规模、库存动作、产品改版动作或责任归因。

会议结束后，状态仍保持：
- meeting_execution_status 只有在真实纪要完成后才可从 not-held 进入待登记状态
- receive_status 仍不自动从 not-received 变成 accepted
- review_status 仍为 not-started
- update_request_status 仍为 not-created
- owner_status 仍为 unsigned
- dq_readiness_status 仍为 blocked
- sql_allowed 仍为 no

所有材料必须按 `VOC-BATCH1-RESPONSE-001` 字段提交；口头确认、聊天摘要和截图片段不能替代 evidence item。
```

## 7. 会议 1 Runbook：外部 VOC 政策与 PII

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-EXT-POLICY-001` |
| meeting_id | `VOC-MEETING-B1-EXT-POLICY-001` |
| target_source_asset | `ods_voc_external` |
| target_ledger_id | `VOC-SIGNOFF-P0-006` |
| primary_owner_role | COMPLIANCE |
| required_attendees | COMPLIANCE / DATA / VOC |
| opening_focus | Reddit / BabyCenter / Mumsnet 平台政策、PII、post/comment 主键、字段、刷新 |
| closeout_status | `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |

| evidence_item_id | meeting checkpoint | accept for future review only if | reject in meeting if |
|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-POLICY-001` | 逐平台政策边界 | 有 COMPLIANCE Owner、日期、平台范围和限制条件摘要 | 把平台目录当授权 |
| `VOC-EVIDENCE-B1-EXT-PII-001` | URL、用户标识、截图、原文边界 | 明确 forbidden content 和 permission_scope | 含完整原文、URL 批量列表、真实用户 ID |
| `VOC-EVIDENCE-B1-EXT-PK-001` | post/comment 主键与去重 | 有主键候选、唯一性说明和 join 风险 | 只给字段名 |
| `VOC-EVIDENCE-B1-EXT-FIELD-001` | 外部主题、情绪、语言、平台字段 | 有字段清单、枚举、空值或缺口 | 写成业务动作字段 |
| `VOC-EVIDENCE-B1-EXT-FRESH-001` | 采集批次、刷新、回溯、时区 | 有刷新候选和历史回溯 | 承诺实时可用 |

## 8. 会议 2 Runbook：VOC 标签字典

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-TAG-001` |
| meeting_id | `VOC-MEETING-B1-TAG-001` |
| target_source_asset | `dim_voc_tag` |
| target_ledger_id | `VOC-SIGNOFF-P0-012` |
| primary_owner_role | VOC |
| required_attendees | VOC / PRODUCT / DATA |
| opening_focus | 标签 Owner、版本、层级、本土化字段、主键、人审样本 |
| closeout_status | `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |

| evidence_item_id | meeting checkpoint | accept for future review only if | reject in meeting if |
|---|---|---|---|
| `VOC-EVIDENCE-B1-TAG-SOURCE-001` | 标签 Owner、版本和适用范围 | 有 Owner 路由、版本候选和停用规则 | 无 Owner 静态表 |
| `VOC-EVIDENCE-B1-TAG-FIELD-001` | `tag_l2` / `tag_l3` / `tag_localized` | 有层级规则、冲突处理和用途边界 | 用标签直接写产品动作 |
| `VOC-EVIDENCE-B1-TAG-PK-001` | `tag_id`、版本、生效时间 | 有唯一性、版本和生效时间候选 | 无版本冲突说明 |
| `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | 人审、冲突、不可映射样本 | 有 sample-hash 或样本规则 | 未授权原文 |

## 9. 会议 3 Runbook：内部 VOC 聚合指标

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-METRIC-001` |
| meeting_id | `VOC-MEETING-B1-INTERNAL-METRIC-001` |
| target_source_asset | `fact_voc_summary` |
| target_ledger_id | `VOC-SIGNOFF-P0-004` |
| primary_owner_role | DATA |
| required_attendees | DATA / BI / VOC |
| opening_focus | 唯一粒度、`sales_qty`、`voc_rate`、评分、评论分母、BI 关系、刷新 |
| closeout_status | `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |

| evidence_item_id | meeting checkpoint | accept for future review only if | reject in meeting if |
|---|---|---|---|
| `VOC-EVIDENCE-B1-METRIC-PK-001` | 渠道×国家×SPU×月唯一粒度 | 有唯一键、店铺粒度说明和 join 风险 | 只写按月汇总 |
| `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `sales_qty`、`voc_rate`、评分、评论分母 | 有字段来源、分母口径和冲突清单 | 写业务 KPI 承诺 |
| `VOC-EVIDENCE-B1-METRIC-BI-001` | dws / ads / 存量 BI 关系 | BI 说明并列、替代、冲突或待映射 | 直接覆盖存量 BI |
| `VOC-EVIDENCE-B1-METRIC-FRESH-001` | 刷新频率、月分区、回溯、时区 | 有刷新候选和回溯范围 | 声明新鲜度达标 |

## 10. 会议 4 Runbook：内部 VOC 明细

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-DETAIL-001` |
| meeting_id | `VOC-MEETING-B1-INTERNAL-DETAIL-001` |
| target_source_asset | `dwd_voc_record_detail_full` |
| target_ledger_id | `VOC-SIGNOFF-P0-001` |
| primary_owner_role | DATA |
| required_attendees | DATA / VOC / SERVICE / COMPLIANCE |
| opening_focus | 主明细候选、主键、字段、PII、服务样本边界 |
| closeout_status | `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |

| evidence_item_id | meeting checkpoint | accept for future review only if | reject in meeting if |
|---|---|---|---|
| `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | 真实表名、Owner、是否主明细 | 有真实表名候选和 Owner 路由 | 没有 Owner 的表名 |
| `VOC-EVIDENCE-B1-DETAIL-PK-001` | 明细主键、日期口径、重复规则 | 有主键候选、日期字段和重复处理 | 只给业务描述 |
| `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | VOC 类型、标签、情绪、来源枚举 | 有字段清单、枚举和空值候选 | 责任归因字段 |
| `VOC-EVIDENCE-B1-DETAIL-PII-001` | 内部原文、用户标识、订单号、截图 | 有脱敏规则、禁用项和 COMPLIANCE Owner | 完整原文、订单号、真实用户标识 |
| `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | 服务体验样本用途 | 有线索用途、复核范围和 sample-hash 规则 | 直接责任归因 |

## 11. 会议 5 Runbook：Review 明细

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-REVIEW-001` |
| meeting_id | `VOC-MEETING-B1-REVIEW-001` |
| target_source_asset | `ods_review_detail` |
| target_ledger_id | `VOC-SIGNOFF-P0-005` |
| primary_owner_role | DATA |
| required_attendees | DATA / VOC / SERVICE / COMPLIANCE |
| opening_focus | 真实表名、review_id、评分字段、评论日期、样本 hash、PII |
| closeout_status | `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |

| evidence_item_id | meeting checkpoint | accept for future review only if | reject in meeting if |
|---|---|---|---|
| `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | 真实表名、Owner、渠道范围 | 有表名候选、Owner 路由和渠道范围 | 无 Owner 来源 |
| `VOC-EVIDENCE-B1-REVIEW-PK-001` | review_id 唯一性或联合主键 | 有主键候选和重复规则 | 只给 review_id |
| `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | 评分范围、评论日期、追评、空值 | 有字段清单、评分枚举和异常处理 | 评分业务结论 |
| `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | 20 条评论样本 hash 规则 | 有 sample-hash 和覆盖维度 | 完整 review、URL 批量列表、真实用户 ID |
| `VOC-EVIDENCE-B1-REVIEW-PII-001` | review URL、用户名、原文展示限制 | 有脱敏规则和 COMPLIANCE Owner | 未脱敏截图、完整原文 |

## 12. 纪要字段模板

会议真实发生后，纪要必须使用下列字段。本文不创建真实纪要。

| 字段 | 要求 | 禁止 |
|---|---|---|
| `minutes_id` | `VOC-MINUTES-B1-[SOURCE]-[YYYYMMDD]` | 空值或泛化标题 |
| `meeting_id` | 5 个 Batch 1 meeting_id 之一 | 新增会议 ID |
| `meeting_datetime` | YYYY-MM-DD HH:MM timezone | 相对日期 |
| `attendees_present` | 真实姓名 + owner_role | 只写部门 |
| `attendees_missing` | 缺席 Owner 和补证责任 | 忽略缺席 |
| `evidence_items_discussed` | 本会议 evidence_item_id 清单 | 新增未登记 item |
| `accepted_content_summary` | 可进入后续 review 的摘要 | 完整原文、URL 批量列表、用户标识 |
| `forbidden_content_removed` | 会中删除或拒收的材料 | 空值 |
| `remaining_blocker` | 未解决缺口 | 写成 resolved |
| `next_action_owner` | 会后补证 Owner | host 代签 |
| `status_freeze_confirmed` | yes | no 或空值 |

## 13. 会中退回规则

| return_reason | 触发条件 | 会中处理 | 会后状态 |
|---|---|---|---|
| `owner-missing` | 无真实 Owner 或 Owner 路由 | 记录缺席 Owner，要求补 owner_name | 保持 `receive_status = not-received` |
| `date-missing` | 证据没有日期 | 退回补 evidence_date | 保持 `review_status = not-started` |
| `scope-too-broad` | evidence_scope 写成全量兜底 | 要求收窄平台、字段、样本或政策范围 | 不进入 review gate |
| `forbidden-content` | 含完整原文、URL 批量列表、用户标识或未脱敏截图 | 现场拒收并记录删除要求 | 不保留附件 |
| `policy-missing` | 外部来源或 PII 缺 COMPLIANCE | 标记 policy blocker | 不进入 DQ |
| `pk-unclear` | 主键、唯一性或重复规则不清 | 退回 DATA 补主键说明 | 不改 `pk_grain_status` |
| `field-unclear` | 字段、枚举、空值或血缘不清 | 退回 DATA / BI / VOC 补字段 | 不改 `field_type_status` |
| `sample-unsafe` | 样本含未授权原文或可识别信息 | 退回 VOC / SERVICE / COMPLIANCE 重做 | 不创建 sample package |
| `status-overreach` | 试图升级 signed / ready / sql_allowed yes | 当场拒绝状态请求 | 保持 `blocked / unsigned / sql_allowed = no` |

## 14. 会后冻结规则

| 状态字段 | 会后默认值 | 允许例外 | 禁止 |
|---|---|---|---|
| `meeting_execution_status` | not-held，直到真实纪要另行登记 | 有真实 minutes_id 后可进入待登记状态 | 本文直接改 held |
| `receive_status` | not-received | 真实回复另行进入 evidence intake 待审 | 会议结束即 accepted |
| `review_status` | not-started | 后续按 `VOC-EVIDENCE-REVIEW-001` 启动 | 会议中 accepted |
| `update_request_status` | not-created | 后续 evidence review accepted 后再提建议 | 会议中生成回填建议 |
| `source_status` | blocked | 后续签收台账审批后再更新 | 会议中 signed |
| `owner_status` | unsigned | 真实 signoff_id 和签收范围齐全后再更新 | 口头确认改 signed |
| `dq_readiness_status` | blocked | 完整证据链和 DQ readiness 审查后再更新 | 会议中 ready |
| `sql_allowed` | no | 独立 SQL 准入审批后再更新 | 会议中 yes |

## 15. No-Go 动作

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
- 不把 runbook 当作会议已执行。
- 不把主持话术当作会议纪要。
- 不把 Owner 参会确认当作 Owner 已回复。
- 不把 Owner 回复模板当作 evidence 已接收。
- 不把 `receive_status = accepted` 当作 `owner_status = signed`。
- 不把 `review_status = accepted` 当作 `owner_status = signed`。
- 不把 `candidate-only` 当作 `signed`。
- 不把 `requested-only` 当作 `approved`。
- 不把 `draft-only` 当作 `sample_policy_status = signed`。
- 不把 `blocker-only` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 16. 下一步

下一步建议创建 `VOC-BATCH1-MEETING-MINUTES-LEDGER-001` Batch 1 Owner meeting minutes ledger 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-owner-meeting-minutes-ledger-draft-20260604.md`

该文件应定义 5 个会议真实发生后如何登记 minutes_id、参会 Owner、缺席 Owner、evidence_items_discussed、forbidden_content_removed、remaining_blocker 和 status_freeze_confirmed。未完成真实 Owner 会议、真实回复、evidence review 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
