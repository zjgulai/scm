---
title: 专题① VOC Batch 1 Owner execution handoff 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-owner-execution-handoff
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Owner execution handoff 草稿

## 1. 交接包定位

本文执行 `VOC-BATCH1-HANDOFF-001`，用于把 `VOC-BATCH1-STATUS-001` 的 Batch 1 状态板转成 Owner 可执行交接包，明确 5 个会议分别找谁、收什么 evidence、按什么格式响应、哪些状态必须保持、哪些材料禁止接收。

本文不是会议执行结果，不是 Owner 回复结果，不是 evidence 接收结果，不是 evidence review 结果，不是台账回填结果，不是 Owner 已签收结果，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议仍为 `not-held`。
- Batch 1 的 23 条 evidence item 仍为 `not-received`。
- Batch 1 的 23 条 review gate 仍为 `not-started`。
- Batch 1 的 23 条 ledger update control 仍为 `not-created`。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源继续保持 `dq_readiness_status = blocked`。
- 5 个 Batch 1 来源继续保持 `sql_allowed = no`。

反面论证：交接包写成 Owner 可执行格式后，容易被误读成“已经进入真实会议执行”。这不成立。本文只是把执行请求标准化；没有真实会议纪要、Owner 名称、证据日期、证据范围和审查记录前，任何状态都不能升级。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 governance status board | `drafts/analysis/voc-topic-batch1-governance-status-board-draft-20260604.md` | 固定 `VOC-BATCH1-STATUS-001` 的当前阻断状态和 23 条链路 | Amber |
| Batch 1 evidence-to-signoff 回填建议控制 | `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 `VOC-LEDGER-UPDATE-001` 的 `not-created` 和 `apply_allowed = no` | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 `not-started` 和退回规则 | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和 `not-received` | Amber |
| Batch 1 Owner 会议包 | `drafts/analysis/voc-topic-batch1-owner-meeting-pack-draft-20260604.md` | 固定 `VOC-MEETING-001` 的 5 个会议和证据模板 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 `blocked / unsigned / sql_allowed = no` | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. 当前交接总览

| 指标 | 当前值 | 交接含义 |
|---|---:|---|
| Batch 1 来源数 | 5 | 只处理 `ods_voc_external`、`dim_voc_tag`、`fact_voc_summary`、`dwd_voc_record_detail_full`、`ods_review_detail` |
| Owner 会议数 | 5 | 会议已定义，真实执行数为 0 |
| evidence item 数 | 23 | 槽位已定义，真实接收数为 0 |
| review gate 数 | 23 | 规则已定义，真实审查数为 0 |
| ledger update control 数 | 23 | 控制已定义，真实回填建议数为 0 |
| `owner_status = signed` 来源数 | 0 | 不允许把交接包写成签收 |
| `dq_readiness_status = ready` 来源数 | 0 | 不允许把交接包写成 DQ readiness |
| `sql_allowed = yes` 来源数 | 0 | 不允许进入 `sql/` |

## 4. Handoff 字段模式

| 字段 | 说明 | 初始规则 |
|---|---|---|
| `handoff_id` | 本交接请求 ID | `VOC-HANDOFF-B1-[SOURCE]-001` |
| `owner_role` | 主响应角色 | DATA / BI / VOC / SERVICE / PRODUCT / COMPLIANCE |
| `meeting_id` | 对应 Batch 1 会议 | 5 个 Batch 1 meeting_id 之一 |
| `target_source_asset` | 目标来源 | 5 个 Batch 1 来源之一 |
| `target_ledger_id` | 目标 `VOC-SIGNOFF-001` 行 | `VOC-SIGNOFF-P0-006` / `012` / `004` / `001` / `005` |
| `evidence_items` | 本次请求收集的 evidence item | 只能来自 23 条已登记槽位 |
| `expected_outputs` | Owner 允许提交的材料摘要 | Owner、日期、scope、可接收摘要、禁用内容、附件引用 |
| `forbidden_outputs` | 禁止提交或禁止据此输出的内容 | 完整原文、URL 批量列表、用户标识、未脱敏截图、业务动作、SQL、DQ |
| `status_to_preserve` | 必须保持的状态 | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |
| `response_format` | Owner 回复格式 | 使用第 11 节表格，不接受口头确认替代 |
| `escalation_route` | 异常升级路径 | policy -> COMPLIANCE，field / pk -> DATA，BI conflict -> BI，sample -> VOC / SERVICE |

## 5. Owner 角色分工

| owner_role | 负责范围 | 必须提供 | 禁止越界 |
|---|---|---|---|
| COMPLIANCE | `ods_voc_external`、`dwd_voc_record_detail_full`、`ods_review_detail` 的 PII / policy 边界 | PII、URL、用户标识、原文、截图、平台政策的可用与禁用范围 | 不提供完整原文、URL 批量列表、用户 ID、未脱敏截图 |
| DATA | 5 个来源的真实表名、主键、字段、刷新、权限路由 | source、pk-grain、field、freshness、access 的候选证据 | 不承诺生产可用，不创建 SQL，不覆盖 Owner 签收 |
| VOC | 外部主题、人审样本、标签体系、样本准入 | topic / tag / sample / field 规则和样本 hash 要求 | 不输出市场规模、渠道动作、产品改版动作 |
| PRODUCT | `dim_voc_tag` 的产品线、本土化标签和用途边界 | 标签用途、映射限制、不可直接触发动作说明 | 不把标签结论写成产品改版任务 |
| BI | `fact_voc_summary` 与存量 BI、dws、ads 的关系 | 指标并列、替代、冲突或待映射清单 | 不覆盖存量 BI，不发布 KPI |
| SERVICE | `dwd_voc_record_detail_full` 和 `ods_review_detail` 的服务样本边界 | 服务体验样本只作线索或复核的范围 | 不做责任归因，不提交未脱敏原文 |

## 6. 交接卡 1：外部 VOC 政策与 PII

| 字段 | 内容 |
|---|---|
| handoff_id | `VOC-HANDOFF-B1-EXT-001` |
| meeting_id | `VOC-MEETING-B1-EXT-POLICY-001` |
| 主 Owner | COMPLIANCE |
| 参与 Owner | DATA / VOC |
| target_source_asset | `ods_voc_external` |
| target_ledger_id | `VOC-SIGNOFF-P0-006` |
| 当前状态 | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |
| expected_outputs | 三个平台政策边界、PII 禁用项、post/comment 主键、字段清单、刷新候选 |
| forbidden_outputs | 外部完整原文、URL 批量列表、用户 ID、未脱敏截图、市场规模、渠道动作、SQL、DQ |
| escalation_route | policy / pii -> COMPLIANCE；pk / field / freshness -> DATA；topic / sample -> VOC |

| evidence_item_id | review_gate_id | update_request_id | owner_role | expected_output | forbidden_output |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-REVIEW-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | COMPLIANCE | Reddit / BabyCenter / Mumsnet 逐平台保存、展示、回溯、限制条件 | 把平台目录当授权 |
| `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-REVIEW-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | COMPLIANCE | URL、用户名、用户 ID、截图、外部原文处理规则 | 完整原文、URL 批量列表、未匿名用户 ID |
| `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-REVIEW-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | DATA | post/comment 主键、去重规则、join 风险 | 只给字段名不说明唯一性 |
| `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-REVIEW-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | DATA / VOC | 字段清单、主题、情绪、语言、平台字段 | 业务动作字段 |
| `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-REVIEW-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | DATA | 采集批次、刷新频率、历史回溯、时区 | 实时可用承诺 |

## 7. 交接卡 2：VOC 标签字典

| 字段 | 内容 |
|---|---|
| handoff_id | `VOC-HANDOFF-B1-TAG-001` |
| meeting_id | `VOC-MEETING-B1-TAG-001` |
| 主 Owner | VOC |
| 参与 Owner | PRODUCT / DATA |
| target_source_asset | `dim_voc_tag` |
| target_ledger_id | `VOC-SIGNOFF-P0-012` |
| 当前状态 | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |
| expected_outputs | 标签 Owner、版本、层级规则、本土化字段、主键、版本生效时间、人审样本 hash |
| forbidden_outputs | 无 Owner 静态表、未授权原文、标签直接触发产品动作、`signed` 状态 |
| escalation_route | source / sample -> VOC；field usage -> PRODUCT；pk / freshness -> DATA |

| evidence_item_id | review_gate_id | update_request_id | owner_role | expected_output | forbidden_output |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-REVIEW-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | VOC | 标签 Owner、版本、适用范围、停用规则 | 无 Owner 的静态表 |
| `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-REVIEW-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | VOC / PRODUCT | `tag_l2` / `tag_l3` / `tag_localized` 层级和冲突处理 | 用标签直接写产品动作 |
| `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-REVIEW-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | DATA / VOC | `tag_id`、版本、生效时间、唯一性 | 无版本冲突说明 |
| `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-REVIEW-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | VOC | 人审样本、冲突样本、不可映射样本 hash 规则 | 未授权原文 |

## 8. 交接卡 3：内部 VOC 聚合指标

| 字段 | 内容 |
|---|---|
| handoff_id | `VOC-HANDOFF-B1-METRIC-001` |
| meeting_id | `VOC-MEETING-B1-INTERNAL-METRIC-001` |
| 主 Owner | DATA |
| 参与 Owner | BI / VOC |
| target_source_asset | `fact_voc_summary` |
| target_ledger_id | `VOC-SIGNOFF-P0-004` |
| 当前状态 | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |
| expected_outputs | 唯一粒度、`sales_qty`、`voc_rate`、评分、评论分母、BI 关系、刷新分区 |
| forbidden_outputs | 覆盖 dws / ads、发布 KPI、声明新鲜度达标、SQL、DQ |
| escalation_route | pk / field / freshness -> DATA；BI conflict -> BI；tag aggregation -> VOC |

| evidence_item_id | review_gate_id | update_request_id | owner_role | expected_output | forbidden_output |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-REVIEW-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | DATA | 渠道×国家×SPU×月唯一粒度和 join 风险 | 只写“按月汇总” |
| `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-REVIEW-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | DATA / BI | `sales_qty`、`voc_rate`、评分、评论分母字段来源 | 业务 KPI 承诺 |
| `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-REVIEW-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | BI | 与 dws / ads / 存量 BI 的并列、替代、冲突或待映射关系 | 直接覆盖存量 BI |
| `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-REVIEW-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | DATA | 刷新频率、月分区、历史回溯、时区 | 新鲜度已达标声明 |

## 9. 交接卡 4：内部 VOC 明细

| 字段 | 内容 |
|---|---|
| handoff_id | `VOC-HANDOFF-B1-DETAIL-001` |
| meeting_id | `VOC-MEETING-B1-INTERNAL-DETAIL-001` |
| 主 Owner | DATA |
| 参与 Owner | VOC / SERVICE / COMPLIANCE |
| target_source_asset | `dwd_voc_record_detail_full` |
| target_ledger_id | `VOC-SIGNOFF-P0-001` |
| 当前状态 | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |
| expected_outputs | 真实表名候选、明细主键、VOC 字段、PII 边界、服务样本用途 |
| forbidden_outputs | 完整原文、订单号、真实用户标识、未脱敏截图、责任归因、SQL、DQ |
| escalation_route | source / pk / field -> DATA；tag / sample -> VOC；service sample -> SERVICE；PII -> COMPLIANCE |

| evidence_item_id | review_gate_id | update_request_id | owner_role | expected_output | forbidden_output |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | DATA | 真实表名、Owner、是否主明细 | 没有 Owner 的表名 |
| `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-REVIEW-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | DATA | 明细主键、日期口径、重复规则 | 只给业务描述 |
| `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-REVIEW-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | DATA / VOC | VOC 类型、标签、情绪、来源枚举 | 责任归因字段 |
| `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-REVIEW-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | COMPLIANCE | 内部原文、用户标识、订单号、截图和脱敏规则 | 完整原文、订单号、真实用户标识 |
| `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | SERVICE | 服务体验样本只作线索或复核的范围 | 直接责任归因 |

## 10. 交接卡 5：Review 明细

| 字段 | 内容 |
|---|---|
| handoff_id | `VOC-HANDOFF-B1-REVIEW-001` |
| meeting_id | `VOC-MEETING-B1-REVIEW-001` |
| 主 Owner | DATA |
| 参与 Owner | VOC / SERVICE / COMPLIANCE |
| target_source_asset | `ods_review_detail` |
| target_ledger_id | `VOC-SIGNOFF-P0-005` |
| 当前状态 | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |
| expected_outputs | 真实表名、review_id 唯一性、评分字段、评论日期、样本 hash、PII 边界 |
| forbidden_outputs | 完整 review、URL 批量列表、真实用户 ID、评分业务结论、责任归因、SQL、DQ |
| escalation_route | source / pk / field -> DATA；sample -> VOC / SERVICE；PII -> COMPLIANCE |

| evidence_item_id | review_gate_id | update_request_id | owner_role | expected_output | forbidden_output |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | DATA | 真实表名、Owner、渠道范围 | 无 Owner 来源 |
| `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-REVIEW-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | DATA | review_id 唯一性或联合主键、重复规则 | 只给 review_id 不说明唯一性 |
| `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-REVIEW-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | DATA / VOC | 评分范围、评论日期、追评和空值规则 | 评分业务结论 |
| `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | VOC / SERVICE | 20 条评论样本 hash 规则和覆盖维度 | 完整 review、URL 批量列表、真实用户 ID |
| `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-REVIEW-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | COMPLIANCE | review URL、用户名、原文展示限制和脱敏规则 | 未脱敏截图、完整原文 |

## 11. Owner 响应格式

Owner 回复必须逐条 evidence item 填写。空泛会议纪要、聊天摘要、截图片段不能替代该格式。

| 字段 | 填写要求 |
|---|---|
| `evidence_item_id` | 只能填 23 条已登记 ID，不得新增 |
| `owner_role` | DATA / BI / VOC / SERVICE / PRODUCT / COMPLIANCE |
| `owner_name` | 真实 Owner 名称；未知时填 `TBD_WITH_OWNER_ROUTE` |
| `evidence_date` | YYYY-MM-DD |
| `evidence_scope` | 本证据覆盖的平台、字段、主键、样本或政策范围 |
| `accepted_content_summary` | 可进入 review gate 的摘要，不含完整原文 |
| `forbidden_content_confirmed` | 明确禁止使用或展示的内容 |
| `status_request` | keep-blocked / candidate-only / requested-only / draft-only / blocker-only |
| `remaining_blocker` | 仍未解决的 Owner、权限、样本、政策、主键、字段或刷新缺口 |
| `attachment_ref` | 文件名、样本包 ID、工单 ID 或会议纪要 ID；不能是完整原文包 |

## 12. 升级触发器

| trigger | 触发条件 | 处理 |
|---|---|---|
| `owner-missing` | 只有角色，没有真实 Owner 或 Owner 路由 | 退回补 Owner |
| `forbidden-content-found` | 含完整原文、URL 批量列表、真实用户标识或未脱敏截图 | 退回脱敏，禁止进入 review gate |
| `status-overreach` | 回复试图升级 `signed` / `ready` / `sql_allowed = yes` | 拒绝该 evidence item |
| `policy-missing` | 外部来源或 PII 缺 COMPLIANCE 审查 | 升级给 COMPLIANCE |
| `source-mismatch` | evidence 指向非 Batch 1 来源或新增来源 | 退回，不纳入本批次 |
| `sql-dq-request` | Owner 要求直接写 SQL、DQ SQL 或执行脚本 | 保持 `sql_allowed = no` 和 `dq_readiness_status = blocked` |
| `bi-conflict` | 指标口径与存量 BI、dws、ads 冲突 | 升级给 BI 和 DATA，不能覆盖存量口径 |
| `sample-unsafe` | 样本包含未授权原文或可识别信息 | 退回 VOC / SERVICE / COMPLIANCE 重做 |

## 13. 状态保留表

| 状态字段 | 本交接包后必须保持 | 原因 |
|---|---|---|
| `meeting_execution_status` | not-held | 未发生真实会议 |
| `receive_status` | not-received | 未收到真实 evidence item |
| `review_status` | not-started | 未执行 evidence review |
| `update_request_status` | not-created | 未生成回填建议 |
| `apply_allowed` | no | 未获回填审批 |
| `source_status` | blocked | 未完成真实来源签收 |
| `owner_status` | unsigned | 缺少 `signoff_id`、Owner、日期和签收范围 |
| `dq_readiness_status` | blocked | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed` | no | 未完成 SQL 准入审批 |

## 14. No-Go 动作

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
- 不把 Owner 交接包当作会议已执行。
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

## 15. 下一步

下一步建议创建 `VOC-BATCH1-RESPONSE-001` Batch 1 Owner response template 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-owner-response-template-draft-20260604.md`

该文件应把第 11 节 Owner 响应格式拆成可复制给 DATA / BI / VOC / SERVICE / PRODUCT / COMPLIANCE 的逐角色回复模板。未完成真实 Owner 回复、evidence review 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
