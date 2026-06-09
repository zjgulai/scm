---
title: 专题① VOC Batch 1 Owner response template 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-owner-response-template
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Owner response template 草稿

## 1. 模板定位

本文执行 `VOC-BATCH1-RESPONSE-001`，用于把 `VOC-BATCH1-HANDOFF-001` 的 Owner 交接字段拆成 DATA / BI / VOC / SERVICE / PRODUCT / COMPLIANCE 可复制使用的逐角色回复模板。

本文不是 Owner 回复结果，不是会议纪要，不是 evidence 接收结果，不是 evidence review 结果，不是台账回填结果，不是 Owner 已签收结果，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议仍为 `not-held`。
- Batch 1 的 23 条 evidence item 仍为 `not-received`。
- Batch 1 的 23 条 review gate 仍为 `not-started`。
- Batch 1 的 23 条 ledger update control 仍为 `not-created`。
- 本文只提供回复模板，不接收真实 evidence。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源继续保持 `dq_readiness_status = blocked`。
- 5 个 Batch 1 来源继续保持 `sql_allowed = no`。

反面论证：模板里列出 `owner_name`、`evidence_date` 和 `attachment_ref` 字段，容易被误读成这些字段已经存在。这个理解不成立。模板字段只是待填结构；没有真实 Owner 回复和附件引用前，所有证据状态必须保持 `not-received`。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 Owner execution handoff | `drafts/analysis/voc-topic-batch1-owner-execution-handoff-draft-20260604.md` | 固定 `VOC-BATCH1-HANDOFF-001` 的角色分工、交接卡和响应格式 | Amber |
| Batch 1 governance status board | `drafts/analysis/voc-topic-batch1-governance-status-board-draft-20260604.md` | 固定 `VOC-BATCH1-STATUS-001` 的当前阻断状态和链路数量 | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 review gate 和退回规则 | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和 `not-received` | Amber |
| Batch 1 Owner 会议包 | `drafts/analysis/voc-topic-batch1-owner-meeting-pack-draft-20260604.md` | 固定 `VOC-MEETING-001` 的 5 个会议和证据模板 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 `blocked / unsigned / sql_allowed = no` | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. 使用边界

| 使用对象 | 允许 | 禁止 |
|---|---|---|
| 会议主持人 | 把模板发给对应 Owner，并要求逐条填写 | 把模板发送动作写成会议已执行 |
| Owner | 填写真实 owner、日期、scope、摘要、禁用内容和附件引用 | 用口头确认、聊天摘要、截图碎片替代表格 |
| 治理记录人 | 收到回复后登记为待 review 材料 | 直接把回复写成 `accepted`、`signed`、`ready` 或 `sql_allowed = yes` |
| 后续 review 人 | 逐条对照 `VOC-EVIDENCE-REVIEW-001` 审查 | 跳过 review gate 直接改 `VOC-SIGNOFF-001` |

## 4. 通用回复头

每个 Owner 回复必须先填写以下表头。没有表头的回复不进入 evidence review。

| 字段 | 填写值 |
|---|---|
| `response_batch_id` | `VOC-BATCH1-RESPONSE-001` |
| `meeting_id` | 5 个 Batch 1 meeting_id 之一 |
| `target_source_asset` | 5 个 Batch 1 来源之一 |
| `target_ledger_id` | 对应 `VOC-SIGNOFF-P0-*` |
| `owner_role` | DATA / BI / VOC / SERVICE / PRODUCT / COMPLIANCE |
| `owner_name` | 真实 Owner 名称；未知时填 `TBD_WITH_OWNER_ROUTE` |
| `response_date` | YYYY-MM-DD |
| `response_scope` | 本次回复覆盖哪些 evidence item |
| `attachment_policy` | metadata-only / sample-hash / desensitized-excerpt / aggregate-only / not-applicable |
| `forbidden_content_confirmed` | 是否明确排除完整原文、URL 批量列表、用户标识和未脱敏截图 |

## 5. 逐条 evidence 回复字段

每条 evidence item 必须使用同一组字段，字段缺失时保持 `receive_status = not-received`。

| 字段 | 填写要求 | 禁止 |
|---|---|---|
| `evidence_item_id` | 只能填 23 条已登记 ID | 新增 evidence ID |
| `owner_role` | DATA / BI / VOC / SERVICE / PRODUCT / COMPLIANCE | 模糊部门或 AI 代填 |
| `owner_name` | 真实 Owner 名称或 `TBD_WITH_OWNER_ROUTE` | `self`、会议主持人代签 |
| `evidence_date` | YYYY-MM-DD | 相对日期 |
| `evidence_scope` | 平台、字段、主键、样本或政策覆盖范围 | 全量兜底 |
| `accepted_content_summary` | 可进入 review gate 的摘要 | 完整原文、URL 批量列表、真实用户标识 |
| `forbidden_content_confirmed` | 明确禁止的内容 | 空值 |
| `status_request` | keep-blocked / candidate-only / requested-only / draft-only / blocker-only | signed / ready / sql_allowed yes |
| `remaining_blocker` | 未解决的 Owner、权限、样本、政策、主键、字段或刷新缺口 | 空泛“无” |
| `attachment_ref` | 文件名、样本包 ID、工单 ID、会议纪要 ID | 完整原文包、URL 批量包、未脱敏截图包 |

## 6. 23 条 evidence 响应清单

| evidence_item_id | meeting_id | target_source_asset | target_ledger_id | primary_owner_role | cc_owner_role | allowed_status_request |
|---|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | COMPLIANCE | DATA / VOC | candidate-only / blocker-only |
| `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | COMPLIANCE | DATA / VOC | blocker-only |
| `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | DATA | COMPLIANCE / VOC | candidate-only |
| `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | DATA | VOC / COMPLIANCE | candidate-only |
| `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | DATA | VOC | candidate-only |
| `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-MEETING-B1-TAG-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | VOC | PRODUCT / DATA | keep-blocked / candidate-only |
| `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-MEETING-B1-TAG-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | VOC | PRODUCT / DATA | candidate-only |
| `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-MEETING-B1-TAG-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | DATA | VOC | candidate-only |
| `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-MEETING-B1-TAG-001` | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | VOC | PRODUCT / DATA | draft-only |
| `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | DATA | BI / VOC | candidate-only |
| `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | DATA | BI / VOC | candidate-only / blocker-only |
| `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | BI | DATA / VOC | blocker-only / candidate-only |
| `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | DATA | BI | candidate-only |
| `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | DATA | VOC / SERVICE / COMPLIANCE | keep-blocked / candidate-only |
| `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | DATA | VOC | candidate-only |
| `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | DATA | VOC / SERVICE | candidate-only |
| `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | COMPLIANCE | DATA / VOC / SERVICE | blocker-only |
| `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | SERVICE | DATA / VOC / COMPLIANCE | blocker-only / draft-only |
| `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | DATA | VOC / SERVICE / COMPLIANCE | keep-blocked / candidate-only |
| `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | DATA | VOC | candidate-only |
| `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | DATA | VOC / SERVICE | candidate-only |
| `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | VOC | SERVICE / COMPLIANCE | draft-only |
| `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | COMPLIANCE | DATA / VOC / SERVICE | blocker-only |

## 7. DATA 回复模板

DATA 只填写 source、pk-grain、field、freshness、access 路由。不能写 SQL，不能声明 DQ ready。

| evidence_item_id | owner_name | evidence_date | evidence_scope | accepted_content_summary | forbidden_content_confirmed | status_request | remaining_blocker | attachment_ref |
|---|---|---|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-PK-001` | TBD | YYYY-MM-DD | external post/comment 主键和去重 | 主键候选、重复处理、join 风险 | 不提供外部原文或 URL 批量列表 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-EXT-FIELD-001` | TBD | YYYY-MM-DD | 外部字段清单、主题、情绪、语言、平台字段 | 字段类型、枚举、空值候选 | 不写业务动作字段 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-EXT-FRESH-001` | TBD | YYYY-MM-DD | 外部采集批次、刷新、回溯、时区 | 刷新候选和分区说明 | 不承诺实时可用 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-TAG-PK-001` | TBD | YYYY-MM-DD | `dim_voc_tag` 主键、版本、生效时间 | `tag_id`、版本、唯一性候选 | 不改 `signed` | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-METRIC-PK-001` | TBD | YYYY-MM-DD | `fact_voc_summary` 唯一粒度 | 渠道×国家×SPU×月候选、join 风险 | 不只写“按月汇总” | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-METRIC-FIELD-001` | TBD | YYYY-MM-DD | `sales_qty`、`voc_rate`、评分、评论分母字段来源 | 字段来源、分母口径、冲突清单 | 不写 KPI 承诺 | candidate-only / blocker-only | TBD | TBD |
| `VOC-EVIDENCE-B1-METRIC-FRESH-001` | TBD | YYYY-MM-DD | 月分区、刷新频率、历史回溯、时区 | 刷新候选 | 不声明新鲜度达标 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | TBD | YYYY-MM-DD | 内部 VOC 主明细候选 | 真实表名候选、Owner 路由、是否主明细 | 不定正式主表 | keep-blocked / candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-DETAIL-PK-001` | TBD | YYYY-MM-DD | 明细主键、日期口径、重复规则 | 主键候选、日期字段、重复处理 | 不只给业务描述 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | TBD | YYYY-MM-DD | VOC 类型、标签、情绪、来源枚举 | 字段清单、枚举、空值候选 | 不写责任归因字段 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | TBD | YYYY-MM-DD | review 真实表名、Owner、渠道范围 | 表名候选、Owner 路由、渠道范围 | 不提供无 Owner 来源 | keep-blocked / candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-REVIEW-PK-001` | TBD | YYYY-MM-DD | review_id 唯一性和联合主键 | review 主键候选、重复规则 | 不只给 review_id | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | TBD | YYYY-MM-DD | 评分范围、评论日期、追评、空值规则 | 字段清单、评分枚举、异常处理 | 不输出评分业务结论 | candidate-only | TBD | TBD |

## 8. COMPLIANCE 回复模板

COMPLIANCE 只确认 policy / pii / permission_scope 边界。不能提交完整原文、URL 批量列表、用户标识或未脱敏截图。

| evidence_item_id | owner_name | evidence_date | evidence_scope | accepted_content_summary | forbidden_content_confirmed | status_request | remaining_blocker | attachment_ref |
|---|---|---|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-POLICY-001` | TBD | YYYY-MM-DD | Reddit / BabyCenter / Mumsnet 平台政策 | 逐平台保存、展示、回溯、限制条件候选 | 不把平台目录当授权 | candidate-only / blocker-only | TBD | TBD |
| `VOC-EVIDENCE-B1-EXT-PII-001` | TBD | YYYY-MM-DD | URL、用户名、用户 ID、截图、外部原文处理 | hash、脱敏摘录、聚合保存限制 | 完整原文、URL 批量列表、未匿名用户 ID、未脱敏截图 | blocker-only | TBD | TBD |
| `VOC-EVIDENCE-B1-DETAIL-PII-001` | TBD | YYYY-MM-DD | 内部原文、用户标识、订单号、截图处理 | 脱敏摘录、sample-hash、禁用项 | 完整原文、订单号、真实用户标识、未脱敏截图 | blocker-only | TBD | TBD |
| `VOC-EVIDENCE-B1-REVIEW-PII-001` | TBD | YYYY-MM-DD | review URL、用户名、原文展示限制 | 脱敏摘录条件和禁用项 | 未脱敏截图、完整原文、URL 批量列表 | blocker-only | TBD | TBD |

## 9. VOC 回复模板

VOC 只填写主题、标签、人审样本、样本准入和 VOC 字段边界。不能把 VOC 样本输出成市场规模、渠道动作或产品改版动作。

| evidence_item_id | owner_name | evidence_date | evidence_scope | accepted_content_summary | forbidden_content_confirmed | status_request | remaining_blocker | attachment_ref |
|---|---|---|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-FIELD-001` | TBD | YYYY-MM-DD | 外部主题、情绪、语言、平台字段 | T2 / T3 / T4 样本准入和字段候选 | 不写市场规模或渠道动作 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-TAG-SOURCE-001` | TBD | YYYY-MM-DD | 标签 Owner、版本、适用范围 | Owner 路由、版本候选、启停规则 | 不把无 Owner 静态表当来源 | keep-blocked / candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-TAG-FIELD-001` | TBD | YYYY-MM-DD | 标签层级和本土化字段 | `tag_l2` / `tag_l3` / `tag_localized` 规则 | 不用标签直接写产品动作 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-TAG-PK-001` | TBD | YYYY-MM-DD | 标签主键、版本、生效时间 | 主键和版本候选 | 不写无版本冲突说明 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | TBD | YYYY-MM-DD | 人审样本、冲突样本、不可映射样本 | 样本 hash 和冲突率候选 | 未授权原文 | draft-only | TBD | TBD |
| `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | TBD | YYYY-MM-DD | VOC 类型、标签、情绪、来源枚举 | 字段含义、人审范围、标签缺口 | 不写责任归因字段 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | TBD | YYYY-MM-DD | review 评分、评论日期、追评、空值规则 | 评论字段和标签用途候选 | 不输出评分业务结论 | candidate-only | TBD | TBD |
| `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | TBD | YYYY-MM-DD | 20 条评论样本 hash 规则 | sample-hash、渠道、国家、SPU、日期覆盖 | 完整 review、URL 批量列表、真实用户 ID | draft-only | TBD | TBD |

## 10. BI 回复模板

BI 只确认 `fact_voc_summary` 与存量 BI、dws、ads 的关系。不能覆盖既有口径或发布 KPI。

| evidence_item_id | owner_name | evidence_date | evidence_scope | accepted_content_summary | forbidden_content_confirmed | status_request | remaining_blocker | attachment_ref |
|---|---|---|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-METRIC-FIELD-001` | TBD | YYYY-MM-DD | `sales_qty`、`voc_rate`、评分、评论分母字段来源 | 字段对照、分母口径、冲突清单 | 不发布 KPI，不写业务承诺 | candidate-only / blocker-only | TBD | TBD |
| `VOC-EVIDENCE-B1-METRIC-BI-001` | TBD | YYYY-MM-DD | 与 dws / ads / 存量 BI 的关系 | 并列、替代、冲突或待映射说明 | 不直接覆盖存量 BI | blocker-only / candidate-only | TBD | TBD |

## 11. SERVICE 回复模板

SERVICE 只确认服务体验样本是否可作为线索或复核范围。不能输出责任归因。

| evidence_item_id | owner_name | evidence_date | evidence_scope | accepted_content_summary | forbidden_content_confirmed | status_request | remaining_blocker | attachment_ref |
|---|---|---|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | TBD | YYYY-MM-DD | 工单、售后、退货留言和服务体验样本用途 | 线索用途、复核范围、样本 hash 要求 | 直接责任归因、完整原文、用户标识 | blocker-only / draft-only | TBD | TBD |
| `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | TBD | YYYY-MM-DD | review 样本是否可用于服务复核 | sample-hash、覆盖维度、复核边界 | 完整 review、URL 批量列表、真实用户 ID | draft-only | TBD | TBD |

## 12. PRODUCT 回复模板

PRODUCT 只确认标签和产品线映射边界。不能把标签候选直接升级为产品改版动作。

| evidence_item_id | owner_name | evidence_date | evidence_scope | accepted_content_summary | forbidden_content_confirmed | status_request | remaining_blocker | attachment_ref |
|---|---|---|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-TAG-FIELD-001` | TBD | YYYY-MM-DD | 产品线、SPU、本土化标签映射 | 标签用途边界、不可直接触发动作说明 | 产品改版动作、渠道动作、库存动作 | candidate-only | TBD | TBD |

## 13. 退回和补证模板

当回复缺字段、含 forbidden content 或状态越权时，按以下模板退回。退回不改变 `receive_status = not-received`。

| 字段 | 填写值 |
|---|---|
| `return_id` | `VOC-BATCH1-RETURN-[EVIDENCE_ITEM_ID]-001` |
| `evidence_item_id` | 原 evidence item ID |
| `return_reason` | owner-missing / date-missing / scope-too-broad / forbidden-content / policy-missing / pk-unclear / field-unclear / sample-unsafe / status-overreach |
| `required_fix` | 需要补充或删除的内容 |
| `owner_role` | 原 Owner 角色 |
| `owner_name` | 原回复中的 Owner 名称或 `TBD_WITH_OWNER_ROUTE` |
| `next_review_allowed` | no，补齐后再进入 `VOC-EVIDENCE-REVIEW-001` |
| `status_to_preserve` | `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |

## 14. 状态保留表

| 状态字段 | 本模板创建后必须保持 | 原因 |
|---|---|---|
| `meeting_execution_status` | not-held | 未发生真实会议 |
| `receive_status` | not-received | 未收到真实 Owner 回复 |
| `review_status` | not-started | 未执行 evidence review |
| `update_request_status` | not-created | 未生成回填建议 |
| `apply_allowed` | no | 未获回填审批 |
| `source_status` | blocked | 未完成真实来源签收 |
| `owner_status` | unsigned | 缺少 `signoff_id`、Owner、日期和签收范围 |
| `dq_readiness_status` | blocked | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed` | no | 未完成 SQL 准入审批 |

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
- 不把回复模板当作 Owner 已回复。
- 不把模板字段当作 evidence 已接收。
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

下一步建议创建 `VOC-BATCH1-MEETING-INVITE-001` Batch 1 Owner meeting invite pack 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-owner-meeting-invite-pack-draft-20260604.md`

该文件应把 `VOC-BATCH1-HANDOFF-001` 和 `VOC-BATCH1-RESPONSE-001` 转成 5 个可发送会议邀请、会前材料清单和回复截止规则。未完成真实 Owner 会议、真实回复、evidence review 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
