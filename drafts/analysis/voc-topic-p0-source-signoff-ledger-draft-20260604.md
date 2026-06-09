---
title: 专题① VOC P0 来源签收台账草稿
doc_type: analysis
module: project-governance
topic: voc-topic-p0-source-signoff-ledger
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC P0 来源签收台账草稿

## 1. 台账定位

本文执行 `VOC-SIGNOFF-001`，用于承接 `VOC-SOURCE-002` 的真实源系统确认包，把 12 个 P0 来源初始化为逐行签收台账，便于后续回填 Owner 访谈、权限申请、样本包、PII / 平台政策、主键粒度、字段口径、刷新频率和 DQ 准入证据。

本文不是 Owner 已签收结果，不是源系统确认结论，不是数据抽取任务，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不声明任何 P0 来源已生产可用。

当前结论：

- 可以创建 `VOC-SIGNOFF-001` 草稿台账。
- 所有 12 个 P0 来源初始状态均为 `blocked`。
- 所有 `owner_status` 初始均为 `unsigned`。
- 所有 `sql_allowed` 初始均为 `no`。
- 任何行都不能在没有 `signoff_id`、Owner、日期和证据引用时升级为 `signed`。

反面论证：台账里列出完整来源和签收字段，表面上会让来源治理看起来已经接近完成。但这只是待回填结构，不是证据本身。没有真实 Owner 签收、权限工单、样本包和政策审查记录时，台账只能证明“缺口被结构化记录”，不能证明“来源已可用”。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| 真实源系统确认包 | `drafts/analysis/voc-topic-real-source-system-confirmation-pack-draft-20260604.md` | 固定 Owner 访谈、权限申请、样本包、平台政策和签收模板 | Amber |
| 源表 Owner 与权限矩阵 | `drafts/analysis/voc-topic-source-owner-permission-matrix-draft-20260604.md` | 固定 12 个 P0 来源、Owner、权限缺口和 `sql_allowed = no` | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 P0 gate、Green 升级和输出锁 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 P0 未过不得进入 SQL | Amber |
| VOC 蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | 固定四子课题和来源确认顺序 | Amber |

## 3. 台账字段

| 字段 | 说明 | 初始值 |
|---|---|---|
| `ledger_id` | 台账行 ID | required |
| `confirmation_id` | 对应 `VOC-SOURCE-002` 确认记录 ID | required |
| `source_asset` | P0 来源资产 | required |
| `source_domain` | internal_voc / review / external_community / brand / trend / tag | required |
| `target_wide_table` | 关联目标宽表 | required |
| `required_owner_role` | 必签 Owner 角色 | required |
| `source_owner_name` | 真实 Owner 名称 | `TBD` |
| `signoff_id` | 签收 ID | `TBD` |
| `source_status` | planned / candidate / blocked / signed / deprecated | `blocked` |
| `owner_status` | unsigned / signed / waived / rejected | `unsigned` |
| `access_status` | unknown / requested / approved / denied / not-applicable | `unknown` |
| `permission_scope` | metadata-only / sample-hash / desensitized-excerpt / full-text / aggregate-only / not-applicable | `TBD` |
| `sample_package_id` | 样本包 ID | `TBD` |
| `sample_policy_status` | unknown / draft / signed / blocked / not-applicable | `unknown` |
| `policy_review_id` | PII 或平台政策审查 ID | `TBD` |
| `pii_policy_status` | unknown / signed / blocked / not-applicable | `unknown` |
| `source_policy_status` | unknown / allowed / limited / manual-only / blocked / not-applicable | `unknown` |
| `pk_grain_review_id` | 主键和粒度审查 ID | `TBD` |
| `pk_grain_status` | unknown / candidate / signed / blocked | `unknown` |
| `field_review_id` | 字段和口径审查 ID | `TBD` |
| `field_type_status` | unknown / candidate / signed / blocked | `unknown` |
| `freshness_status` | unknown / candidate / signed / blocked | `unknown` |
| `dq_family` | 关联 DQ 族 | required |
| `dq_readiness_status` | unknown / ready / blocked | `blocked` |
| `blocking_reason` | 当前阻断原因 | required |
| `next_action` | 下一步回填动作 | required |
| `sql_allowed` | yes / no | `no` |

## 4. P0 来源签收台账

| ledger_id | confirmation_id | source_asset | source_domain | target_wide_table | required_owner_role | source_owner_name | signoff_id | source_status | owner_status | access_status | permission_scope | sample_package_id | sample_policy_status | policy_review_id | pii_policy_status | source_policy_status | pk_grain_status | field_type_status | freshness_status | dq_family | dq_readiness_status | blocking_reason | next_action | sql_allowed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `VOC-SIGNOFF-P0-001` | `VOC-CONFIRM-SOURCE-001` | `dwd_voc_record_detail_full` | internal_voc | `dwt_voc_shelf_inside` | DATA / VOC / SERVICE / COMPLIANCE | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-SHELF-*` | blocked | 源系统、原文权限、主键、日期口径未签收 | 发起 DATA / VOC / SERVICE 访谈，申请 sample-hash 权限 | no |
| `VOC-SIGNOFF-P0-002` | `VOC-CONFIRM-SOURCE-002` | `dws_voc_record_analysis_day_full` | internal_voc | `dwt_voc_shelf_inside` | DATA / BI / VOC | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-SHELF-*` | blocked | 聚合粒度、来源枚举、标签缺失率未签收 | 发起日聚合粒度和标签 DQ 样本确认 | no |
| `VOC-SIGNOFF-P0-003` | `VOC-CONFIRM-SOURCE-003` | `ads_voc_record_stat_full` | internal_voc | `dwt_voc_shelf_inside` | BI / DATA / VOC | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-SHELF-*` | blocked | 看板口径、周期口径、分母来源未签收 | 发起存量 BI 口径和 dws / fact 关系确认 | no |
| `VOC-SIGNOFF-P0-004` | `VOC-CONFIRM-SOURCE-004` | `fact_voc_summary` | internal_voc | `dwt_voc_shelf_inside` / `dwt_voc_trend_radar` | DATA / BI / VOC | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-SHELF-*` / `VOC-DQ-TREND-*` | blocked | `sales_qty`、`voc_rate`、评分和评论分母未签收 | 发起渠道×国家×SPU×月主键和分母口径确认 | no |
| `VOC-SIGNOFF-P0-005` | `VOC-CONFIRM-SOURCE-005` | `ods_review_detail` | review | `dwt_voc_shelf_inside` / `dwt_voc_competitor_localization` | DATA / VOC / SERVICE / COMPLIANCE | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-SHELF-*` / `VOC-DQ-COMP-*` | blocked | 评论原文、review_id、评分范围、引用权限未签收 | 发起评论 sample-hash、评分范围和脱敏摘录审批 | no |
| `VOC-SIGNOFF-P0-006` | `VOC-CONFIRM-SOURCE-006` | `ods_voc_external` | external_community | `dwt_voc_external_demand` / `dwt_voc_competitor_localization` / `dwt_voc_trend_radar` | DATA / VOC / COMPLIANCE | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-EXT-*` / `VOC-DQ-COMP-*` / `VOC-DQ-TREND-*` | blocked | 平台政策、post/comment 主键、PII、文本保留未签收 | 发起平台政策审查、样本包和去重规则确认 | no |
| `VOC-SIGNOFF-P0-007` | `VOC-CONFIRM-SOURCE-007` | `dim_voc_external_community` | external_community | `dwt_voc_external_demand` / `dwt_voc_trend_radar` | VOC / DATA / COMPLIANCE | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-EXT-*` / `VOC-DQ-TREND-*` | blocked | 社区主键、国家、语言、人群阶段映射未签收 | 发起社区目录、平台范围、国家 / 语言规则确认 | no |
| `VOC-SIGNOFF-P0-008` | `VOC-CONFIRM-SOURCE-008` | `fact_voc_external_daily` | external_community | `dwt_voc_external_demand` / `dwt_voc_trend_radar` | DATA / VOC | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-EXT-*` / `VOC-DQ-TREND-*` | blocked | 平台×国家×主题×日粒度和刷新频率未签收 | 发起聚合主键、采集窗口和刷新频率确认 | no |
| `VOC-SIGNOFF-P0-009` | `VOC-CONFIRM-SOURCE-009` | `fact_voc_brand_summary` | brand | `dwt_voc_competitor_localization` | DATA / BRAND / VOC / COMPLIANCE | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-COMP-*` | blocked | 品牌×国家×渠道×月粒度、评分来源、竞品标识未签收 | 发起品牌评分来源、竞品范围和样本 hash 确认 | no |
| `VOC-SIGNOFF-P0-010` | `VOC-CONFIRM-SOURCE-010` | `dim_brand` | brand | `dwt_voc_competitor_localization` | BRAND / VOC / DATA | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-COMP-*` | blocked | 品牌别名、本地语言名、自有 / 竞品标识未签收 | 发起 alias 字典、品牌范围和本地语言名签收 | no |
| `VOC-SIGNOFF-P0-011` | `VOC-CONFIRM-SOURCE-011` | `fact_voc_trend` | trend | `dwt_voc_trend_radar` | DATA / BI / VOC | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-TREND-*` | blocked | 趋势算法、来源类型、时间窗口和 0 分母规则未签收 | 发起趋势算法、来源枚举和 12 个月样本确认 | no |
| `VOC-SIGNOFF-P0-012` | `VOC-CONFIRM-SOURCE-012` | `dim_voc_tag` | tag | 全部 VOC 宽表 | VOC / PRODUCT / DATA | TBD | TBD | blocked | unsigned | unknown | TBD | TBD | unknown | TBD | unknown | unknown | unknown | unknown | unknown | `VOC-DQ-SHELF-*` / `VOC-DQ-EXT-*` / `VOC-DQ-COMP-*` / `VOC-DQ-TREND-*` | blocked | 标签 Owner、人工校准样本和冲突处理规则未签收 | 发起标签字典、人审样本和冲突率口径确认 | no |

## 5. 签收范围拆分

每个 P0 来源至少需要拆成以下签收范围。台账主行只记录总状态，细分签收记录必须回填到后续真实签收记录中。

| signoff_scope | 说明 | 缺失影响 |
|---|---|---|
| source | 确认真实源系统、真实表名和 Owner | source_status 保持 blocked |
| access | 确认可访问范围和权限工单 | access_status 保持 unknown / requested |
| sample | 确认样本包、样本量、采样方法和样本 hash | sample_policy_status 保持 unknown |
| pii | 确认用户标识、原文、URL、截图和脱敏规则 | pii_policy_status 保持 unknown / blocked |
| policy | 确认外部平台政策、保存和展示限制 | source_policy_status 保持 unknown / blocked |
| pk-grain | 确认主键、粒度、重复和 join 放大风险 | pk_grain_status 保持 unknown |
| field | 确认字段类型、枚举、空值和历史变更 | field_type_status 保持 unknown |
| freshness | 确认刷新频率、分区、历史回溯和时区 | freshness_status 保持 unknown |
| dq | 确认是否允许执行对应 `VOC-DQ-*` gate | dq_readiness_status 保持 blocked |

## 6. 状态更新规则

| 更新动作 | 必须满足 | 禁止事项 |
|---|---|---|
| `owner_status -> signed` | 有 `signoff_id`、Owner 名称、签收日期、签收范围和证据引用 | 不能用口头确认或聊天摘要替代 |
| `owner_status -> waived` | 有 `waiver_scope`、豁免原因和影响范围 | 不能把 waived 当作 Green |
| `access_status -> approved` | 有权限工单或 Owner 批准记录 | 不能自动申请全文或未脱敏原文 |
| `sample_policy_status -> signed` | 有 `sample_package_id` 和样本策略签收 | 样本包不得包含完整原文或用户标识 |
| `pii_policy_status -> signed` | 有 COMPLIANCE 或对应 Owner 签收 | 不能只由业务 Owner 兜底 |
| `source_policy_status -> allowed / limited` | 有平台政策审查记录 | 不能把平台目录当授权 |
| `dq_readiness_status -> ready` | source / access / sample / pii / pk-grain / field / freshness 均满足最低要求 | 不能声明 DQ 已执行 |
| `sql_allowed -> yes` | 本台账不足以授权，必须另有 SQL 准入审批 | 不能在本台账直接改为 yes |

## 7. 当前汇总

| 指标 | 当前值 | 说明 |
|---|---|---|
| P0 来源总数 | 12 | 来自 `VOC-SOURCE-001` |
| `signed` 来源数 | 0 | 当前没有真实签收 |
| `waived` 来源数 | 0 | 当前没有豁免 |
| `blocked` 来源数 | 12 | 全部等待 Owner 与证据回填 |
| `sql_allowed = yes` 来源数 | 0 | 本阶段不授权 SQL |
| 可执行 DQ 来源数 | 0 | 当前没有 DQ readiness |

## 8. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不声明任何 P0 来源已签收。
- 不声明任何 P0 来源已生产可用。
- 不把 `waived` 当作 `signed`。
- 不把本台账当作 DQ 执行结果。
- 不把 mock、CSV 样例、平台目录或方法论参考当作生产来源。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不把外部样本写成市场规模、预算、渠道动作、投放动作、库存动作或产品改版动作。

## 9. 下一步

下一步建议创建 `VOC-INTAKE-001` Owner 访谈与证据回填清单草稿。

建议文件：

- `drafts/analysis/voc-topic-owner-interview-evidence-intake-checklist-draft-20260604.md`

该文件应把 12 个 P0 来源按 Owner 拆成可执行访谈任务、权限申请任务、样本包回填任务和审查证据清单。未完成真实回填前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
