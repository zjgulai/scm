---
title: 专题① VOC 真实源系统确认包草稿
doc_type: analysis
module: project-governance
topic: voc-topic-real-source-system-confirmation-pack
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC 真实源系统确认包草稿

## 1. 规格定位

本文执行 `VOC-SOURCE-002`，用于把 `VOC-SOURCE-001` 中的 P0 来源拆成可执行的 Owner 访谈问题、权限申请项、样本包要求、平台政策检查项和签收记录模板。

本文不是源系统已确认结论，不是数据抽取脚本，不是 DQ 执行脚本，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不声明任何源表已生产可用。

当前结论：

- 可以创建真实源系统确认包草稿。
- 不能把本确认包当作 Owner 已签收结果。
- 不能把规划表、mock、CSV 样例、外部平台目录或方法论文档升级为生产来源。
- 未完成 P0 来源确认前，四张 VOC 目标宽表继续保持 `blocked`。
- `sql_allowed` 继续为 `no`。

反面论证：`VOC-SOURCE-001` 已经列出 P0 来源、Owner 和缺口，似乎可以直接找人确认。但如果不把问题、权限、样本和签收字段标准化，后续确认会变成口头判断，无法支撑 DQ、SQL、BI 或 Agent 的 Green 升级。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| 源表 Owner 与权限矩阵 | `drafts/analysis/voc-topic-source-owner-permission-matrix-draft-20260604.md` | 固定 P0 / P1 / P2 来源、Owner 和权限缺口 | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 Green 升级、PII、source policy 和 Owner 签收门槛 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 P0 来源未确认前不进入 SQL | Amber |
| VOC 蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | 固定源域、四子课题和 `VOC-SOURCE-002` 位置 | Amber |
| 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | 固定指标对应候选源和 Owner 候选 | Amber |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 固定规划表、字段和来源类别 | Amber |
| 数仓主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 固定规划粒度、主键和分区建议 | Amber |

## 3. 确认包输出结构

每个 P0 来源必须形成一条确认记录。记录至少包含：

| 字段 | 说明 |
|---|---|
| `confirmation_id` | 确认记录 ID |
| `source_asset` | 候选源表或源资产 |
| `source_domain` | internal_voc / review / external_community / brand / trend / tag |
| `source_system_name` | 真实源系统名；未知时填 `unknown` |
| `source_owner_name` | 业务或数据 Owner |
| `source_owner_role` | DATA / BI / VOC / SERVICE / PRODUCT / BRAND / COMPLIANCE |
| `access_request_id` | 权限申请或工单 ID |
| `sample_package_id` | 样本包 ID |
| `policy_review_id` | PII、原文或平台政策审查 ID |
| `pk_grain_review_id` | 主键和粒度审查 ID |
| `field_review_id` | 字段类型和口径审查 ID |
| `dq_gate_family` | 对应 `VOC-DQ-*` 族 |
| `owner_status` | unsigned / signed / waived / rejected |
| `access_status` | unknown / requested / approved / denied / not-applicable |
| `sample_policy_status` | unknown / draft / signed / blocked / not-applicable |
| `pii_policy_status` | unknown / signed / blocked / not-applicable |
| `source_policy_status` | unknown / allowed / limited / manual-only / blocked / not-applicable |
| `sql_allowed` | 当前固定为 `no` |
| `blocking_reason` | 未签收或无法确认的原因 |
| `next_action` | 下一步 Owner 任务 |

## 4. P0 来源确认顺序

确认顺序按四张目标宽表依赖推进，先内部 VOC，再外部 VOC，再品牌，再趋势。

| 顺序 | 目标 | P0 来源 | 关键 Owner | 目的 |
|---|---|---|---|---|
| 1 | 内部 VOC 主链 | `dwd_voc_record_detail_full`、`dws_voc_record_analysis_day_full`、`ads_voc_record_stat_full`、`fact_voc_summary`、`ods_review_detail`、`dim_voc_tag` | DATA / BI / VOC / SERVICE / COMPLIANCE | 确认 T1 是否有可审查的内部 VOC 主链 |
| 2 | 外部需求主链 | `ods_voc_external`、`dim_voc_external_community`、`fact_voc_external_daily` | DATA / VOC / COMPLIANCE | 确认 T2 是否有可审查的外部样本和平台政策 |
| 3 | 竞品本土化主链 | `fact_voc_brand_summary`、`dim_brand`、`ods_voc_external`、`dim_voc_tag` | DATA / BRAND / VOC / COMPLIANCE | 确认 T3 是否有可审查的品牌、评分、alias 和样本链 |
| 4 | 趋势雷达主链 | `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily`、`ods_voc_external`、`dim_voc_tag` | DATA / BI / VOC / COMPLIANCE | 确认 T4 是否有可审查的趋势算法、时间窗口和来源枚举 |

## 5. 通用 Owner 访谈问题

每个 P0 来源都必须回答以下问题：

| 问题组 | 必问问题 | 通过标准 |
|---|---|---|
| 源系统 | 该资产是否在生产系统或数仓中真实存在？真实表名是否等于候选表名？ | Owner 给出系统名、库表名或明确否定 |
| Owner | 谁对字段、权限、质量和口径负责？是否允许后续复核？ | `source_owner_name` 和 `source_owner_role` 明确 |
| 粒度 | 一行代表什么？主键是什么？是否存在重复行或快照版本？ | `pk_grain_status = signed` |
| 时间 | 分区、刷新频率、历史回溯周期和时区是什么？ | `freshness_status = signed` |
| 字段 | 关键字段类型、枚举值、空值规则和历史变更是否明确？ | `field_type_status = signed` |
| 权限 | 可访问范围是 metadata、hash、脱敏摘录、聚合还是全文？ | `access_status = approved` 且 `permission_scope` 明确 |
| 样本 | 能否提供最小样本包？样本是否可复核、可脱敏、可追溯？ | `sample_policy_status = signed` |
| PII | 是否包含用户标识、原文、URL、截图、邮箱、电话或平台 ID？ | `pii_policy_status = signed` 或 `not-applicable` |
| DQ | 是否允许后续执行 DQ gate？失败样本如何反馈？ | DQ family 可执行，失败处理 Owner 明确 |
| 输出 | 该来源能支持哪些输出？哪些输出必须锁定？ | output lock 明确 |

## 6. 内部 VOC 主链确认包

### 6.1 `dwd_voc_record_detail_full`

| 项 | 要求 |
|---|---|
| 访谈 Owner | DATA / VOC / SERVICE |
| 权限申请 | metadata + sample-hash；脱敏摘录需 COMPLIANCE 签收 |
| 样本包 | 20 条跨渠道、国家、VOC 类型、日期的样本 hash；不含完整原文 |
| 主键问题 | 是否存在 `voc_record_id` 或可替代主键；是否有重复、撤回或合并记录 |
| 字段问题 | `voc_type`、`data_source`、`country_code`、`channel_id`、`spu_id`、`tag_l2`、`tag_l3`、`content_hash` |
| DQ 关联 | `VOC-DQ-SHELF-SCHEMA-001`、`VOC-DQ-SHELF-PK-001`、`VOC-DQ-SHELF-SOURCE-001`、`VOC-DQ-SHELF-TEXT-001` |
| 阻断条件 | 原文权限不明、主键不明、来源枚举不明、标签字段不可追溯 |

### 6.2 `dws_voc_record_analysis_day_full`

| 项 | 要求 |
|---|---|
| 访谈 Owner | DATA / BI / VOC |
| 权限申请 | aggregate-only + metadata |
| 样本包 | 近 30 天日期×平台×渠道×店铺×国家×SPU×标签聚合样本 |
| 主键问题 | 日聚合粒度是否唯一；标签变化是否导致重复行 |
| 字段问题 | 日期、平台、渠道、店铺、国家、SPU、标签、`voc_cnt`、评分分子分母 |
| DQ 关联 | `VOC-DQ-SHELF-SCHEMA-001`、`VOC-DQ-SHELF-DATE-001`、`VOC-DQ-SHELF-TAG-001` |
| 阻断条件 | 聚合粒度不明、来源枚举不明、标签缺失率无法计算 |

### 6.3 `ads_voc_record_stat_full`

| 项 | 要求 |
|---|---|
| 访谈 Owner | BI / DATA / VOC |
| 权限申请 | aggregate-only + metadata |
| 样本包 | 周/月口径样本，包含指标计算尺度和展示维度 |
| 主键问题 | 周/月、口径、维度、标签是否构成唯一粒度 |
| 字段问题 | `data_caliber`、`period_grain`、`period_value`、展示维度、指标字段 |
| DQ 关联 | `VOC-DQ-SHELF-DATE-001`、`VOC-DQ-SHELF-SALES-001`、`VOC-DQ-SHELF-REVIEW-001` |
| 阻断条件 | 看板口径与 dws / fact 关系不明、分母来源不明 |

### 6.4 `fact_voc_summary`

| 项 | 要求 |
|---|---|
| 访谈 Owner | DATA / BI / VOC |
| 权限申请 | aggregate-only + metadata |
| 样本包 | 渠道×国家×SPU×月份样本，至少覆盖 `sales_qty`、`voc_cnt`、`review_cnt`、评分字段 |
| 主键问题 | `(channel_id, country_code, spu_id, dt_month)` 是否唯一；是否包含店铺粒度 |
| 字段问题 | `voc_cnt`、`voc_rate`、`sales_qty`、`star_rating`、`good_rate`、`bad_rate`、`return_rate` |
| DQ 关联 | `VOC-DQ-SHELF-SALES-001`、`VOC-DQ-SHELF-RATING-001`、`VOC-DQ-SHELF-REVIEW-001`、`VOC-DQ-TREND-SCHEMA-001` |
| 阻断条件 | `sales_qty` 分母不明、评分范围不明、与 dws 并列关系未确认 |

### 6.5 `ods_review_detail`

| 项 | 要求 |
|---|---|
| 访谈 Owner | DATA / VOC / SERVICE / COMPLIANCE |
| 权限申请 | sample-hash；脱敏摘录需单独签收 |
| 样本包 | 20 条评论样本 hash，覆盖评分、渠道、国家、SPU、日期 |
| 主键问题 | `review_id` 是否唯一；是否需要与 `channel_id` 或 `order_id` 联合 |
| 字段问题 | `review_id`、`order_id`、`review_dt`、`rating`、`review_hash`、`spu_id` |
| DQ 关联 | `VOC-DQ-SHELF-RATING-001`、`VOC-DQ-SHELF-TEXT-001`、`VOC-DQ-COMP-RATING-001` |
| 阻断条件 | 评论原文权限不明、评分范围不明、主键不明 |

## 7. 外部 VOC 主链确认包

### 7.1 `ods_voc_external`

| 项 | 要求 |
|---|---|
| 访谈 Owner | DATA / VOC / COMPLIANCE |
| 权限申请 | metadata-only + sample-hash；默认不申请全文 |
| 样本包 | 每个平台至少 20 条 post/comment hash；第一批建议 Reddit + BabyCenter + Mumsnet |
| 平台政策 | 逐平台确认 `source_policy_status`：allowed / limited / manual-only / blocked |
| 主键问题 | `(platform, post_id, comment_id)` 是否唯一；采集批次是否可追溯 |
| 字段问题 | `platform`、`community_name`、`post_id`、`comment_id`、`user_id_anon`、`post_time`、`lang`、`topic_tags`、`sentiment_polarity` |
| DQ 关联 | `VOC-DQ-EXT-PK-001`、`VOC-DQ-EXT-SAMPLE-001`、`VOC-DQ-EXT-PII-001`、`VOC-DQ-COMP-PII-001` |
| 阻断条件 | 平台政策 blocked、PII 未签收、样本来源不可追溯、去重规则缺失 |

### 7.2 `dim_voc_external_community`

| 项 | 要求 |
|---|---|
| 访谈 Owner | VOC / DATA / COMPLIANCE |
| 权限申请 | metadata-only |
| 样本包 | 平台、社区、国家范围、语言、人群阶段字典样本 |
| 平台政策 | 目录可保存不等于内容可抓取，需分开签收 |
| 主键问题 | 是否存在 `community_id`；否则 `platform + community_name` 是否唯一 |
| 字段问题 | `platform`、`community_name`、`country_scope`、`lang`、`community_type`、`audience_stage` |
| DQ 关联 | `VOC-DQ-EXT-SCHEMA-001`、`VOC-DQ-EXT-LANG-001`、`VOC-DQ-TREND-SOURCE-001` |
| 阻断条件 | 社区国家 / 语言映射不明、平台政策不明、人群阶段无 Owner |

### 7.3 `fact_voc_external_daily`

| 项 | 要求 |
|---|---|
| 访谈 Owner | DATA / VOC |
| 权限申请 | aggregate-only |
| 样本包 | 平台×国家×主题×日聚合样本，至少 30 天 |
| 主键问题 | `(platform, country_code, topic_tag, dt)` 是否唯一 |
| 字段问题 | `post_cnt`、`comment_cnt`、`mention_self_cnt`、`mention_comp_cnt`、刷新频率 |
| DQ 关联 | `VOC-DQ-EXT-FRESHNESS-001`、`VOC-DQ-EXT-DUP-001`、`VOC-DQ-TREND-GRAIN-001` |
| 阻断条件 | 聚合来源不可追溯、刷新频率不明、主题标签未校准 |

## 8. 竞品与标签确认包

### 8.1 `fact_voc_brand_summary`

| 项 | 要求 |
|---|---|
| 访谈 Owner | DATA / BRAND / VOC |
| 权限申请 | aggregate-only + sample-hash |
| 样本包 | 品牌×国家×渠道×月样本，包含评分、差评、本土化标签 |
| 主键问题 | `(brand_id, country_code, channel_id, dt_month)` 是否唯一；是否含 SPU 维度 |
| 字段问题 | `brand_id`、`voc_cnt`、`voc_rate`、`star_rating`、`bad_rate`、`tag_localized` |
| DQ 关联 | `VOC-DQ-COMP-SCHEMA-001`、`VOC-DQ-COMP-GRAIN-001`、`VOC-DQ-COMP-RATING-001` |
| 阻断条件 | 竞品范围不明、评分来源不明、样本隐私不明 |

### 8.2 `dim_brand`

| 项 | 要求 |
|---|---|
| 访谈 Owner | BRAND / VOC / DATA |
| 权限申请 | metadata-only |
| 样本包 | 自有品牌、竞品品牌、别名、本地语言名、国家范围 |
| 主键问题 | `brand_id` 是否唯一；alias 是否一对多 |
| 字段问题 | `brand_name`、`is_self`、`country_code`、`brand_alias`、local language alias |
| DQ 关联 | `VOC-DQ-COMP-ALIAS-001`、`VOC-DQ-EXT-BRAND-001` |
| 阻断条件 | alias 无来源、竞品范围无 BRAND 签收、本地语言名冲突 |

### 8.3 `dim_voc_tag`

| 项 | 要求 |
|---|---|
| 访谈 Owner | VOC / PRODUCT / DATA |
| 权限申请 | metadata-only + calibration sample hash |
| 样本包 | 标签字典、标签层级、人审样本、冲突样本、不可映射样本 |
| 主键问题 | `tag_id` 是否稳定；`tag_l2 + tag_l3` 是否可替代 |
| 字段问题 | `tag_l2`、`tag_l3`、`tag_category`、`topic_tag`、`tag_localized` |
| DQ 关联 | `VOC-DQ-SHELF-TAG-001`、`VOC-DQ-EXT-TAG-001`、`VOC-DQ-COMP-TAG-001`、`VOC-DQ-TREND-TAG-001` |
| 阻断条件 | 标签 Owner 缺失、人工校准样本缺失、标签冲突率不可计算 |

## 9. 趋势确认包

### 9.1 `fact_voc_trend`

| 项 | 要求 |
|---|---|
| 访谈 Owner | DATA / BI / VOC |
| 权限申请 | aggregate-only |
| 样本包 | 12 个月国家×渠道×来源类型×品类×标签聚合样本 |
| 主键问题 | `(country_code, channel_id, voc_source_type, category_l3, dt_month)` 是否唯一；品牌范围是否可选 |
| 字段问题 | `voc_cnt`、`voc_rate`、`sales_qty`、`voc_trend_12m`、`mention_volume`、`tag_trend` |
| 算法问题 | 趋势是斜率、同比、环比、平滑指数还是规则标签？0 分母怎么处理？ |
| DQ 关联 | `VOC-DQ-TREND-SCHEMA-001`、`VOC-DQ-TREND-GRAIN-001`、`VOC-DQ-TREND-ALG-001`、`VOC-DQ-TREND-ZERO-001` |
| 阻断条件 | 趋势算法未签收、0 分母规则缺失、来源枚举混写 |

## 10. 权限申请模板

| 字段 | 填写要求 |
|---|---|
| `access_request_id` | 权限或工单编号 |
| `request_owner` | 发起人 |
| `source_asset` | 目标来源 |
| `requested_scope` | metadata-only / sample-hash / desensitized-excerpt / aggregate-only |
| `business_purpose` | 仅限 VOC 宽表准入、DQ 设计、BI / Agent 边界确认 |
| `forbidden_scope` | full-text、未脱敏原文、用户标识、URL 批量导出、生产 SQL |
| `retention_policy` | 样本保存周期和删除要求 |
| `review_owner` | DATA / BI / VOC / SERVICE / BRAND / COMPLIANCE |
| `decision` | approved / denied / limited / manual-only |
| `decision_reason` | 审批说明 |

## 11. 样本包模板

样本包只用于 DQ 和口径确认，不用于业务结论。

| 字段 | 填写要求 |
|---|---|
| `sample_package_id` | 样本包 ID |
| `source_asset` | 来源资产 |
| `sample_scope` | 时间、国家、渠道、平台、品牌、标签范围 |
| `sample_size` | 样本量 |
| `sample_method` | full / stratified / keyword / manual / owner-selected |
| `sample_record_id_hash_list` | 样本 ID 哈希列表 |
| `content_hash_list` | 原文哈希列表；无原文时填 `not-applicable` |
| `desensitized_excerpt_allowed` | yes / no |
| `pii_removed_flag` | yes / no / not-applicable |
| `known_bias` | 样本偏差说明 |
| `dq_gate_target` | 样本服务的 DQ gate |
| `review_status` | draft / signed / rejected |

样本包不得包含完整原文、真实用户 ID、邮箱、电话、URL 批量列表或未脱敏截图。

## 12. 平台政策检查模板

外部来源必须逐平台填写。

| 字段 | 填写要求 |
|---|---|
| `policy_review_id` | 平台政策审查 ID |
| `platform` | Reddit / BabyCenter / Mumsnet / The Bump / Facebook / Instagram / other |
| `community_name` | 社区或版块 |
| `allowed_collection_method` | manual / api / export / no-collection / unknown |
| `content_storage_allowed` | yes / no / limited / unknown |
| `excerpt_display_allowed` | yes / no / limited / unknown |
| `url_storage_allowed` | yes / no / limited / unknown |
| `user_identifier_policy` | anonymize / hash / remove / unknown |
| `source_policy_status` | allowed / limited / manual-only / blocked / unknown |
| `compliance_owner_status` | unsigned / signed / rejected |
| `notes` | 限制说明 |

`source_policy_status = blocked` 时，关联来源不得进入样本包、DQ、BI 或 Agent 输出。

## 13. 签收记录模板

| 字段 | 填写要求 |
|---|---|
| `signoff_id` | 签收 ID |
| `source_asset` | 来源资产 |
| `owner_role` | Owner 角色 |
| `owner_name` | Owner 名称 |
| `signoff_scope` | source / access / sample / pii / policy / pk-grain / field / freshness / dq |
| `decision` | signed / waived / rejected |
| `decision_date` | 签收日期 |
| `waiver_scope` | waived 时必须写明局部范围 |
| `blocking_reason` | rejected 或 unsigned 时必须填写 |
| `next_action` | 后续行动 |

`waived` 不能替代 `signed`。`waived` 只允许局部解除阻塞，不允许将来源升级为 `Green`。

## 14. 当前输出锁

在 `VOC-SOURCE-002` 未完成前，保持以下输出锁：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不声明任何源表已生产可用。
- 不声明任何 P0 来源已签收。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不把外部样本写成市场规模、预算、渠道动作、投放动作、库存动作或产品改版动作。
- 不把 P2 mock、CSV 样例、平台目录或方法论参考当作生产来源。

## 15. 下一步

下一步建议创建 `VOC-SIGNOFF-001` P0 来源签收台账草稿。

建议文件：

- `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md`

该文件应把 `VOC-SOURCE-002` 的确认字段落成逐行台账，便于后续真实访谈、权限申请和样本包回填。未完成真实签收前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
