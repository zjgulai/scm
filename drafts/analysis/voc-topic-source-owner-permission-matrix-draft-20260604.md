---
title: 专题① VOC Source Owner 与权限矩阵草稿
doc_type: analysis
module: project-governance
topic: voc-topic-source-owner-permission-matrix
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Source Owner 与权限矩阵草稿

## 1. 规格定位

本文执行 `VOC-SOURCE-001`，用于把专题① VOC 的 P0 / P1 / P2 来源资产、候选源表、Owner、访问权限、样本政策、PII / 平台政策和签收状态集中治理。

本文不是源系统确认书，不是数据抽取任务，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不声明任何源表已生产可用。

当前结论：

- `VOC-SOURCE-001` 可以创建为草稿矩阵。
- 四张 VOC 目标宽表仍保持 `blocked`。
- 所有 P0 来源在 Owner、权限、样本、主键、字段类型和 DQ 未签收前，均不得进入正式 SQL。
- P1 来源只能作为背景或 handoff 线索，不能驱动 VOC 核心指标。
- P2 来源只能作为字段形态、页面样例或方法论参考，不能写入生产依赖。

反面论证：`01_专题课题_数据需求矩阵.md` 和 `05_数仓表结构与主键设计.md` 已经提供表名、主键和粒度，似乎可以视为源表确认。但这两份文档是数仓规划基线，不是生产库访问证明，也不是 Owner 签收记录。直接把规划表升级为生产源表，会绕过权限、样本、PII、平台政策和 DQ gate。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| VOC 蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | 固定源域分层、`VOC-SOURCE-001` / `VOC-SOURCE-002` 定位 | Amber |
| 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | 固定指标候选源表、Owner 候选和 blocked 指标 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 P0 / P1 / P2 输入分层和源表依赖 | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 Owner、权限、PII、source policy、Green 升级门槛 | Amber |
| Agent 治理检查点 | `drafts/analysis/voc-topic-agent-spec-governance-checkpoint-draft-20260604.md` | 固定 Agent 不得把草稿源写成生产事实 | Amber |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 固定专题①规划表、字段和来源类别 | Amber |
| 数仓主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 固定规划表粒度、主键和分区建议 | Amber |

## 3. 状态字段定义

后续任何来源确认记录必须至少包含以下字段：

| 字段 | 取值或说明 |
|---|---|
| `source_asset` | 源表、文件、系统或方法论资产名 |
| `source_domain` | internal_voc / review / return / external_community / social_monitoring / tag / brand / trend / channel_background / marketing_background / mock |
| `source_layer` | dwd / dws / ads / ods / fact / dim / external / mock / reference |
| `priority` | P0 / P1 / P2 |
| `target_wide_table` | 关联的 `dwt_voc_*` 目标宽表 |
| `evidence_level` | Grey / Amber / Green |
| `source_status` | planned / candidate / blocked / signed / deprecated |
| `required_owner_role` | DATA / BI / VOC / PRODUCT / BRAND / SERVICE / CHANNEL / MKT / ORDER / COMPLIANCE |
| `owner_status` | unsigned / signed / waived / rejected |
| `access_status` | unknown / requested / approved / denied / not-applicable |
| `permission_scope` | metadata-only / sample-hash / desensitized-excerpt / full-text / aggregate-only / not-applicable |
| `sample_policy_status` | unknown / draft / signed / blocked / not-applicable |
| `pii_policy_status` | unknown / signed / blocked / not-applicable |
| `source_policy_status` | unknown / allowed / limited / manual-only / blocked / not-applicable |
| `pk_grain_status` | unknown / candidate / signed / blocked |
| `field_type_status` | unknown / candidate / signed / blocked |
| `freshness_status` | unknown / candidate / signed / blocked |
| `dq_family` | `VOC-DQ-SHELF-*` / `VOC-DQ-EXT-*` / `VOC-DQ-COMP-*` / `VOC-DQ-TREND-*` |
| `blocking_reason` | 未能进入 Green 的原因 |
| `next_evidence_required` | 下一步必须补齐的证据 |
| `sql_allowed` | yes / no |

当前所有来源的 `sql_allowed` 均为 `no`。

## 4. P0 核心来源矩阵

P0 是四张目标宽表不可缺少的来源。任一 P0 未签收，对应宽表不得进入 SQL 初稿。

| source_asset | source_domain | source_layer | 服务宽表 | required_owner_role | 当前状态 | 权限 / 政策缺口 | 必补证据 | sql_allowed |
|---|---|---|---|---|---|---|---|---|
| `dwd_voc_record_detail_full` | internal_voc | dwd | `dwt_voc_shelf_inside` | DATA / VOC / SERVICE | blocked | 源系统、原文权限、主键、日期口径未签收 | 源系统 Owner、样本 hash、原文脱敏策略、主键唯一性 | no |
| `dws_voc_record_analysis_day_full` | internal_voc | dws | `dwt_voc_shelf_inside` | DATA / BI / VOC | blocked | 聚合粒度、来源枚举、标签缺失率未签收 | 日聚合粒度、字段类型、标签 DQ 样本 | no |
| `ads_voc_record_stat_full` | internal_voc | ads | `dwt_voc_shelf_inside` | BI / DATA / VOC | blocked | 看板口径、周期口径、分母来源未签收 | 存量 BI Owner、指标口径、与 dws / fact 关系 | no |
| `fact_voc_summary` | internal_voc | fact | `dwt_voc_shelf_inside` / `dwt_voc_trend_radar` | DATA / BI / VOC | blocked | `sales_qty`、`voc_rate`、星级、评论分母未签收 | 渠道×国家×SPU×月主键、分母口径、评分范围 | no |
| `ods_review_detail` | review | ods | `dwt_voc_shelf_inside` / `dwt_voc_competitor_localization` | DATA / VOC / SERVICE / COMPLIANCE | blocked | 评论原文、review_id、评分范围、引用权限未签收 | 评论样本 hash、脱敏摘录策略、评分字段校验 | no |
| `ods_voc_external` | external_community | ods | `dwt_voc_external_demand` / `dwt_voc_competitor_localization` / `dwt_voc_trend_radar` | DATA / VOC / COMPLIANCE | blocked | 平台政策、post/comment 主键、PII、文本保留未签收 | 平台政策表、采样方法、去重规则、PII 策略 | no |
| `dim_voc_external_community` | external_community | dim | `dwt_voc_external_demand` / `dwt_voc_trend_radar` | VOC / DATA / COMPLIANCE | blocked | 社区主键、国家、语言、人群阶段映射未签收 | 社区目录、平台范围、国家 / 语言规则 | no |
| `fact_voc_external_daily` | external_community | fact | `dwt_voc_external_demand` / `dwt_voc_trend_radar` | DATA / VOC | candidate / blocked | 平台×国家×主题×日粒度和刷新频率未签收 | 聚合主键、采集窗口、刷新频率、样本量规则 | no |
| `fact_voc_brand_summary` | brand | fact | `dwt_voc_competitor_localization` | DATA / BRAND / VOC | blocked | 品牌×国家×渠道×月粒度、评分来源、竞品标识未签收 | brand_id、评分来源、竞品范围、样本 hash | no |
| `dim_brand` | brand | dim | `dwt_voc_competitor_localization` | BRAND / VOC / DATA | blocked | 品牌别名、本地语言名、自有 / 竞品标识未签收 | alias 字典、品牌范围、Owner 签收 | no |
| `fact_voc_trend` | trend | fact | `dwt_voc_trend_radar` | DATA / VOC / BI | blocked | 趋势算法、来源类型、时间窗口未签收 | 趋势算法说明、0 分母规则、时间窗口规则 | no |
| `dim_voc_tag` | tag | dim | 全部 VOC 宽表 | VOC / PRODUCT / DATA | blocked | `tag_l2`、`tag_l3`、`topic_tag`、`tag_localized` 映射未签收 | 标签字典、人工校准样本、冲突处理规则 | no |

## 5. P1 背景来源矩阵

P1 来源只能用于解释背景、交叉线 handoff 或页面辅助筛选。未签收时不得驱动 VOC 核心指标。

| source_asset | source_domain | source_layer | 服务范围 | required_owner_role | 当前状态 | 使用边界 | sql_allowed |
|---|---|---|---|---|---|---|---|
| `dim_channel` | channel_background | dim | T1 / T3 / T4 背景切片 | CHANNEL / BI / DATA | candidate | 只用于渠道、站点、GTM 分层，不输出渠道动作 | no |
| `fact_channel_country_month` | channel_background | fact | T4 背景 | CHANNEL / BI / DATA | blocked | 只作国家×渠道背景，不进入 VOC 因果结论 | no |
| `fact_channel_health` | channel_background | fact | T4 背景 | CHANNEL / BI / DATA | blocked | 只作渠道健康背景，不输出渠道加码或风险定责 | no |
| `fact_campaign_daily` | marketing_background | fact | T4 背景 | MKT / BI / DATA | blocked | 只作活动背景，不输出投放动作 | no |
| `fact_campaign_roi` | marketing_background | fact | T4 背景 | MKT / BI / DATA | blocked | 只作 ROI 背景，不输出 ROI 因果 | no |
| `fact_return` | return | fact | T1 / XL3 背景 | ORDER / SERVICE / DATA | blocked | 只作退款分母或售后主题线索，不做责任归因 | no |
| `dwd_quality_amazon_return_detail` | return | dwd | T1 / XL3 背景 | SERVICE / ORDER / DATA | blocked | 只作退货留言候选，不替代 VOC 原文 | no |
| `ods_api_zendesk_ticket` | internal_voc | ods | T1 背景或明细补充 | SERVICE / DATA / COMPLIANCE | blocked | 只作工单明细候选，原文权限另签 | no |
| `ods_voc_spider_meltwater_social_media_monitoring` | social_monitoring | ods | T2 / T4 背景 | VOC / MKT / COMPLIANCE / DATA | blocked | 只作社媒声量候选，平台政策先行 | no |
| `ods_fb_data` | social_monitoring | ods | T2 / T4 背景 | MKT / VOC / COMPLIANCE / DATA | blocked | 只作社媒背景，用户标识和内容权限先行 | no |
| `ods_voc_spider_amazon_reviews_jijia` | review | ods | T1 / T3 补充 | VOC / SERVICE / DATA / COMPLIANCE | blocked | 只作评论样本候选，评论原文权限另签 | no |

## 6. P2 参考与 mock 来源

P2 只能作为字段形态、页面样例、方法论或业务背景参考。

| asset | 类型 | 可用范围 | 禁止范围 |
|---|---|---|---|
| `main_project_lute/phase3_outputs/topic1_voc/` | mock output | 字段形态、页面样例、队列样例 | 生产事实、真实指标、SQL 依赖 |
| `main_project_lute/phase3_mock/` | mock data | 宽表字段样例和 Demo 数据 | 真实样本、真实趋势、真实排名 |
| `ref/books/maternal_social_voc/README.md` | 方法论参考 | Reddit 方法、采样流程、日报 / 周报格式 | 生产 ODS、自动采集授权证明 |
| `main_project_lute/全局数据资源整合/voc社媒平台目录` | 平台目录候选 | 社区范围和平台分层候选 | 默认可抓取、默认可保存原文 |
| `ref/company_info/` | 行业背景 | 解释业务背景 | 指标证据、业务结论 |
| `当前voc标签分类维度表.xlsx` | 标签候选 | 标签体系候选 | 已签收标签维表 |

P2 资产不得写入 `source_asset` 的生产依赖位，只能在 `evidence_level = Grey` 时引用。

## 7. Owner 签收门槛

| Owner | 必须签收的内容 | 未签收影响 |
|---|---|---|
| DATA | 源表存在性、字段类型、主键、粒度、分区、刷新频率、DQ 执行方式 | 不进入 SQL，不执行 DQ |
| BI | 存量看板口径、指标尺度、页面准入、输出状态 | 不进入 BI 视图或指标解释 |
| VOC | VOC 主题、标签、情绪、样本人审、内外部来源可比性 | 不输出 VOC 洞察 |
| SERVICE | 工单、客服、售后、退货留言、服务体验样本 | 不输出服务体验诊断输入 |
| PRODUCT | SPU、品类、产品线、本土化标签 | 不输出产品或本土化输入 |
| BRAND | 品牌 alias、竞品范围、本地语言名、评分来源 | 不输出竞品对比或话术候选 |
| CHANNEL | 渠道、站点、GTM、渠道背景 | 不输出渠道背景交叉输入 |
| MKT | 活动、投放、社媒背景 | 不输出营销背景交叉输入 |
| ORDER | 销量、订单、退款、分母和售后输入 | 不输出分母或退款背景 |
| COMPLIANCE | PII、原文、URL、外部平台政策、样本保留 | 外部与原文相关输出全部 blocked |

签收记录必须区分 `signed` 与 `waived`。`waived` 只能解除局部阻塞，不能把来源升级为完整 `Green`。

## 8. 权限与样本政策

| 场景 | 默认权限 | 允许升级条件 |
|---|---|---|
| 内部评论 / 工单原文 | `sample-hash` | SERVICE / VOC / COMPLIANCE 签收脱敏摘录 |
| 退货留言 | `sample-hash` | SERVICE / ORDER 签收主题用途，禁止责任归因 |
| 外部帖子 / 评论 | `metadata-only` | COMPLIANCE 签收平台政策和摘录范围 |
| 社媒内容 | `metadata-only` | COMPLIANCE / MKT / VOC 签收保存、展示和脱敏范围 |
| 品牌 alias | `aggregate-only` | BRAND / VOC 签收 alias 字典 |
| 标签体系 | `aggregate-only` | VOC / PRODUCT 签收标签字典和人审样本 |
| CHANNEL / MKT 背景 | `aggregate-only` | CHANNEL / MKT / BI 签收只作背景 |
| mock / CSV 样例 | `not-applicable` | 不允许升级为生产权限 |

完整原文默认不可用。只有 `permission_scope = desensitized-excerpt` 且 `pii_policy_status = signed` 时，才允许进入样本复核；仍不得进入公开输出。

## 9. Green 升级条件

来源资产从 `blocked` / `candidate` 升级为 `Green` 前，必须满足：

- `owner_status = signed`。
- `access_status = approved`。
- `permission_scope` 与用途匹配。
- `sample_policy_status = signed` 或确认该来源不需要样本。
- `pii_policy_status = signed` 或明确 `not-applicable`。
- 外部来源的 `source_policy_status` 不得为 `blocked` 或 `unknown`。
- `pk_grain_status = signed`。
- `field_type_status = signed`。
- `freshness_status = signed`。
- 关联 DQ family 的 P0 gate 全部可执行。
- mock / CSV / 参考资料与生产事实隔离完成。

以上条件未全部满足前，`sql_allowed` 保持 `no`。

## 10. 当前阻断清单

| 阻断项 | 影响范围 | 处理方式 |
|---|---|---|
| P0 源表 Owner 未签收 | 四张 VOC 宽表 | 先建立 Owner 签收记录 |
| 原文 / 摘录权限未确认 | T1 / T2 / T3 | 默认只保留 hash，不展示原文 |
| 外部平台政策未确认 | T2 / T3 / T4 | 建立 `source_policy_status` 复核表 |
| 标签体系未签收 | 全部 VOC 宽表 | 建立标签 Owner 和人审样本 |
| 品牌 alias 未签收 | T3 | 建立 `dim_brand` alias 字典候选 |
| 趋势算法未签收 | T4 | 等 DATA / VOC 确认算法与 0 分母规则 |
| CHANNEL / MKT / ORDER 背景边界未签收 | T4 / XL 输入 | 只作背景，不输出动作或因果 |
| P2 mock 容易误用 | 全部 VOC 宽表 | 继续隔离在 Grey 证据层 |

## 11. 待用户决策点

以下决策会影响下一步 `VOC-SOURCE-002` 的真实源系统确认包：

| 决策项 | 默认建议 | 为什么 |
|---|---|---|
| 内部 VOC 主明细是否优先确认 `dwd_voc_record_detail_full` | 是，但仅作为候选主明细 | 它能覆盖工单、评论、退货留言统一视图，但当前没有生产权限证明 |
| `fact_voc_summary` 与 `dws_voc_record_analysis_day_full` 的关系 | 先并列候选 | 一个偏规划事实表，一个偏存量 VOC 看板聚合，不能强行合并 |
| 外部社区第一批范围 | Reddit + BabyCenter + Mumsnet | 先降低平台政策、样本和语言复杂度 |
| 原文展示默认策略 | 默认只展示 hash，摘录单独签收 | 避免 PII、平台政策和版权风险 |
| `COMPLIANCE` 是否作为外部来源必签 Owner | 是 | 外部原文、URL 和用户标识风险不能只由业务 Owner 兜底 |

## 12. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不声明任何源表已生产可用。
- 不把本矩阵当作 Owner 已签收结果。
- 不把 mock、CSV 样例、平台目录或方法论参考当作生产来源。
- 不把 P1 背景表写成 VOC 因果来源。
- 不把外部样本写成市场规模、投放动作、预算、渠道动作、库存动作或产品改版动作。

## 13. 下一步

下一步建议创建 `VOC-SOURCE-002` 真实源系统确认包草稿。

建议文件：

- `drafts/analysis/voc-topic-real-source-system-confirmation-pack-draft-20260604.md`

该文件应把 P0 来源拆成可执行的 Owner 访谈问题、权限申请项、样本包要求、平台政策检查项和签收记录模板。未完成 `VOC-SOURCE-002` 前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
