---
title: 专题① VOC Batch 1 governance status board 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-governance-status-board
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 governance status board 草稿

## 1. 状态板定位

本文执行 `VOC-BATCH1-STATUS-001`，用于把 Batch 1 的会议包、evidence intake、review gate 和 ledger update control 汇总成状态板，显示每个 Batch 1 来源在会议、证据接收、证据审查、回填建议、DQ readiness 和 SQL 准入上的真实阻断状态。

本文不是会议执行结果，不是 evidence 接收结果，不是 evidence review 结果，不是台账回填结果，不是 Owner 已签收结果，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议已被结构化定义，但真实会议执行数为 0。
- Batch 1 的 23 条 evidence item 已被结构化定义，但真实 evidence 接收数为 0。
- Batch 1 的 23 条 review gate 已被结构化定义，但真实审查执行数为 0。
- Batch 1 的 23 条 ledger update control 已被结构化定义，但真实回填建议数为 0。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源的 `dq_readiness_status` 继续保持 `blocked`。
- 5 个 Batch 1 来源的 `sql_allowed` 继续保持 `no`。

反面论证：状态板把会议、证据、review gate 和回填控制放在同一张图里，容易被误读成“治理链已经跑完”。这不成立。本文只证明治理结构已经串联成可追踪状态板，不证明会议已发生、证据已收到、审查已通过、台账已回填或 SQL 已准入。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 evidence-to-signoff 回填建议控制 | `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md` | 固定 `VOC-LEDGER-UPDATE-001` 的 23 条 update control 和 `apply_allowed = no` | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 23 条 review gate 和 `not-started` 状态 | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和 `not-received` 状态 | Amber |
| Batch 1 Owner 会议包 | `drafts/analysis/voc-topic-batch1-owner-meeting-pack-draft-20260604.md` | 固定 `VOC-MEETING-001` 的 5 个 Batch 1 会议 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 blocked / unsigned / sql_allowed no | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 和 Green 升级门槛 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. 状态码

| 状态字段 | 当前允许状态 | 含义 |
|---|---|---|
| `meeting_definition_status` | defined | 会议包已定义 |
| `meeting_execution_status` | not-held | 真实会议未执行 |
| `receive_status` | not-received | evidence item 只是槽位 |
| `review_status` | not-started | review gate 只是规则 |
| `update_request_status` | not-created | 回填建议未生成 |
| `apply_allowed` | no | 不允许修改 `VOC-SIGNOFF-001` |
| `source_status` | blocked | 来源仍阻断 |
| `owner_status` | unsigned | Owner 仍未签收 |
| `dq_readiness_status` | blocked | DQ readiness 仍阻断 |
| `sql_allowed` | no | SQL 仍不准入 |

## 4. 总体计数

| 指标 | 当前值 | 说明 |
|---|---:|---|
| Batch 1 来源数 | 5 | `ods_voc_external`、`dim_voc_tag`、`fact_voc_summary`、`dwd_voc_record_detail_full`、`ods_review_detail` |
| 已定义会议数 | 5 | 会议包已成稿 |
| 已执行会议数 | 0 | 尚无真实会议记录 |
| evidence item 槽位数 | 23 | 接收台账已成稿 |
| 已接收 evidence item 数 | 0 | 尚无真实证据 |
| review gate 数 | 23 | review gate 已成稿 |
| 已执行 review 数 | 0 | 尚无真实审查 |
| ledger update control 数 | 23 | 回填控制已成稿 |
| 已生成回填建议数 | 0 | 尚无真实 accepted evidence |
| `owner_status = signed` 来源数 | 0 | 没有真实签收 |
| `dq_readiness_status = ready` 来源数 | 0 | 没有 DQ readiness |
| `sql_allowed = yes` 来源数 | 0 | 不允许进入 SQL |

## 5. 来源级状态板

| target_source_asset | target_ledger_id | meeting_id | meeting_execution_status | evidence slots | received | review gates | reviews executed | update controls | update requests | source_status | owner_status | dq_readiness_status | sql_allowed | 当前阻断 |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---|---|---|---|---|
| `ods_voc_external` | `VOC-SIGNOFF-P0-006` | `VOC-MEETING-B1-EXT-POLICY-001` | not-held | 5 | 0 | 5 | 0 | 5 | 0 | blocked | unsigned | blocked | no | 平台政策、PII、主键、字段、刷新均未接收 |
| `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | `VOC-MEETING-B1-TAG-001` | not-held | 4 | 0 | 4 | 0 | 4 | 0 | blocked | unsigned | blocked | no | 标签 Owner、字段层级、主键、人审样本均未接收 |
| `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | not-held | 4 | 0 | 4 | 0 | 4 | 0 | blocked | unsigned | blocked | no | 分母口径、BI 关系、唯一粒度、刷新均未接收 |
| `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | not-held | 5 | 0 | 5 | 0 | 5 | 0 | blocked | unsigned | blocked | no | 主明细、PII、服务样本、字段、主键均未接收 |
| `ods_review_detail` | `VOC-SIGNOFF-P0-005` | `VOC-MEETING-B1-REVIEW-001` | not-held | 5 | 0 | 5 | 0 | 5 | 0 | blocked | unsigned | blocked | no | review 主键、评分字段、样本 hash、PII 均未接收 |

## 6. 23 条链路状态

| chain_id | evidence_item_id | review_gate_id | update_request_id | target_source_asset | receive_status | review_status | update_request_status | apply_allowed |
|---|---|---|---|---|---|---|---|---|
| `VOC-CHAIN-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-REVIEW-B1-EXT-POLICY-001` | `VOC-LEDGER-UPDATE-B1-EXT-POLICY-001` | `ods_voc_external` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-EXT-PII-001` | `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-REVIEW-B1-EXT-PII-001` | `VOC-LEDGER-UPDATE-B1-EXT-PII-001` | `ods_voc_external` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-EXT-PK-001` | `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-REVIEW-B1-EXT-PK-001` | `VOC-LEDGER-UPDATE-B1-EXT-PK-001` | `ods_voc_external` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-EXT-FIELD-001` | `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-REVIEW-B1-EXT-FIELD-001` | `VOC-LEDGER-UPDATE-B1-EXT-FIELD-001` | `ods_voc_external` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-EXT-FRESH-001` | `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-REVIEW-B1-EXT-FRESH-001` | `VOC-LEDGER-UPDATE-B1-EXT-FRESH-001` | `ods_voc_external` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-TAG-SOURCE-001` | `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-REVIEW-B1-TAG-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SOURCE-001` | `dim_voc_tag` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-TAG-FIELD-001` | `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-REVIEW-B1-TAG-FIELD-001` | `VOC-LEDGER-UPDATE-B1-TAG-FIELD-001` | `dim_voc_tag` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-TAG-PK-001` | `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-REVIEW-B1-TAG-PK-001` | `VOC-LEDGER-UPDATE-B1-TAG-PK-001` | `dim_voc_tag` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-TAG-SAMPLE-001` | `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-REVIEW-B1-TAG-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-TAG-SAMPLE-001` | `dim_voc_tag` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-METRIC-PK-001` | `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-REVIEW-B1-METRIC-PK-001` | `VOC-LEDGER-UPDATE-B1-METRIC-PK-001` | `fact_voc_summary` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-METRIC-FIELD-001` | `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-REVIEW-B1-METRIC-FIELD-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FIELD-001` | `fact_voc_summary` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-METRIC-BI-001` | `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-REVIEW-B1-METRIC-BI-001` | `VOC-LEDGER-UPDATE-B1-METRIC-BI-001` | `fact_voc_summary` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-METRIC-FRESH-001` | `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-REVIEW-B1-METRIC-FRESH-001` | `VOC-LEDGER-UPDATE-B1-METRIC-FRESH-001` | `fact_voc_summary` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-DETAIL-SOURCE-001` | `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-REVIEW-B1-DETAIL-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SOURCE-001` | `dwd_voc_record_detail_full` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-DETAIL-PK-001` | `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-REVIEW-B1-DETAIL-PK-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PK-001` | `dwd_voc_record_detail_full` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-DETAIL-FIELD-001` | `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-REVIEW-B1-DETAIL-FIELD-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-FIELD-001` | `dwd_voc_record_detail_full` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-DETAIL-PII-001` | `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-REVIEW-B1-DETAIL-PII-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-PII-001` | `dwd_voc_record_detail_full` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-DETAIL-SERVICE-001` | `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-REVIEW-B1-DETAIL-SERVICE-001` | `VOC-LEDGER-UPDATE-B1-DETAIL-SERVICE-001` | `dwd_voc_record_detail_full` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-REVIEW-SOURCE-001` | `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-REVIEW-B1-REVIEW-SOURCE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SOURCE-001` | `ods_review_detail` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-REVIEW-PK-001` | `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-REVIEW-B1-REVIEW-PK-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PK-001` | `ods_review_detail` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-REVIEW-FIELD-001` | `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-REVIEW-B1-REVIEW-FIELD-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-FIELD-001` | `ods_review_detail` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-REVIEW-SAMPLE-001` | `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-REVIEW-B1-REVIEW-SAMPLE-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-SAMPLE-001` | `ods_review_detail` | not-received | not-started | not-created | no |
| `VOC-CHAIN-B1-REVIEW-PII-001` | `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-REVIEW-B1-REVIEW-PII-001` | `VOC-LEDGER-UPDATE-B1-REVIEW-PII-001` | `ods_review_detail` | not-received | not-started | not-created | no |

## 7. DQ readiness 状态

| target_source_asset | source / access | sample | pii / policy | pk-grain | field | freshness | dq_readiness_status | 原因 |
|---|---|---|---|---|---|---|---|---|
| `ods_voc_external` | missing | missing | missing | missing | missing | missing | blocked | 5 条 evidence 均未接收 |
| `dim_voc_tag` | missing | missing | not-applicable / pending | missing | missing | missing | blocked | 4 条 evidence 均未接收 |
| `fact_voc_summary` | pending | pending | not-applicable / pending | missing | missing | missing | blocked | 4 条 evidence 均未接收 |
| `dwd_voc_record_detail_full` | missing | missing | missing | missing | missing | missing | blocked | 5 条 evidence 均未接收 |
| `ods_review_detail` | missing | missing | missing | missing | missing | pending | blocked | 5 条 evidence 均未接收 |

## 8. SQL 准入状态

| target_source_asset | sql_allowed | SQL 准入阻断 | 是否可创建 SQL |
|---|---|---|---|
| `ods_voc_external` | no | 没有 Owner 签收、政策审查、PII 边界、主键字段和 DQ readiness | no |
| `dim_voc_tag` | no | 没有标签 Owner、样本、主键字段和 DQ readiness | no |
| `fact_voc_summary` | no | 没有分母口径、BI 关系、主键字段和 DQ readiness | no |
| `dwd_voc_record_detail_full` | no | 没有主明细确认、PII 边界、服务样本边界和 DQ readiness | no |
| `ods_review_detail` | no | 没有 review 主键、评分字段、样本 hash、PII 边界和 DQ readiness | no |

## 9. 当前可执行动作

| action_id | 动作 | 允许 | 禁止 |
|---|---|---|---|
| `VOC-ACTION-B1-001` | 准备 Batch 1 Owner 会议邀请和材料 | yes | 不能写成会议已执行 |
| `VOC-ACTION-B1-002` | 按 23 条 evidence item 催收证据 | yes | 不能写成证据已接收 |
| `VOC-ACTION-B1-003` | 为未来 evidence review 准备审查表 | yes | 不能执行真实 review |
| `VOC-ACTION-B1-004` | 汇总仍缺 Owner / policy / sample / pk / field / freshness | yes | 不能更新 `VOC-SIGNOFF-001` |
| `VOC-ACTION-B1-005` | 准备下一轮 Owner handoff 包 | yes | 不能进入 `sql/` |

## 10. 禁止状态迁移

本文创建后仍禁止以下状态迁移：

| 禁止迁移 | 原因 |
|---|---|
| `meeting_execution_status: not-held -> held` | 缺少真实会议纪要和 Owner 参会记录 |
| `receive_status: not-received -> accepted` | 缺少真实 evidence item |
| `review_status: not-started -> accepted` | 缺少真实审查记录 |
| `update_request_status: not-created -> approved-for-edit` | 缺少真实回填审批 |
| `apply_allowed: no -> yes` | 缺少真实审批 |
| `source_status: blocked -> signed` | 缺少正式签收 |
| `owner_status: unsigned -> signed` | 缺少真实 `signoff_id`、Owner、日期和签收范围 |
| `access_status: unknown -> approved` | 缺少权限审批记录 |
| `sample_policy_status: unknown -> signed` | 缺少样本包和样本策略签收 |
| `pii_policy_status: unknown -> signed` | 缺少 COMPLIANCE 或对应 Owner 签收 |
| `source_policy_status: unknown -> allowed` | 缺少逐平台政策审查结果 |
| `pk_grain_status: unknown -> signed` | 缺少主键粒度审查签收 |
| `field_type_status: unknown -> signed` | 缺少字段口径签收 |
| `freshness_status: unknown -> signed` | 缺少刷新频率签收 |
| `dq_readiness_status: blocked -> ready` | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed: no -> yes` | 本文不能授权 SQL |

## 11. No-Go 动作

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
- 不把状态板当作真实执行证明。
- 不把会议包定义当作会议已执行。
- 不把 evidence item 槽位当作证据已接收。
- 不把 review gate 定义当作真实审查结果。
- 不把 ledger update control 当作真实回填。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 12. 下一步

下一步建议创建 `VOC-BATCH1-HANDOFF-001` Batch 1 Owner execution handoff 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-owner-execution-handoff-draft-20260604.md`

该文件应把本状态板转成可发给 Owner 的执行交接包，明确每个会议要找谁、要收什么 evidence、哪些状态不能改、哪些材料禁止接收。未完成真实 Owner 会议、证据接收、review gate 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
