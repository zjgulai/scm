---
title: 专题①竞品与本土化宽表规格草稿
doc_type: analysis
module: project-governance
topic: voc-topic-competitor-localization-wide-table-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题①竞品与本土化宽表规格草稿

## 1. 任务定位

本文承接 `VOC-DATA-004`，为专题① VOC / 洞察流的“竞品与本土化”分支定义宽表草稿。

目标宽表暂定为：

- `dwt_voc_competitor_localization`

服务对象：

- 指标族：`VOC-T3`
- BI 页面：`VOC-BI-003`
- Agent：`VOC-AGENT-003`

当前状态：`blocked`。

阻塞原因不是缺少表名，而是竞品品牌别名、国家市场口径、评分来源、本土化标签、外部样本来源、渠道映射和产品线映射尚未完成生产级确认。因此本文只定义宽表契约和数据治理门槛，不进入 `sql/`，不写生产 SQL。

## 2. 核心判断

`dwt_voc_competitor_localization` 的边界是“品牌口碑对比 + 本土化话术候选”，不是货架外需求发现主表，也不是渠道投放 ROI 表。

纳入范围：

- 自有品牌与竞品品牌在国家、渠道、平台、品类、产品线维度下的 VOC 量、评分、差评率和主题标签。
- 本土化卖点、痛点、话术、价格敏感、包装偏好、功能偏好、场景表达等候选标签。
- 竞品样本、外部提及和内部品牌汇总之间的可追溯映射。
- `tag_localized` 的候选生成、复核和证据等级。

不纳入范围：

- Reddit / 社媒未满足需求的主发现逻辑，该部分归 `dwt_voc_external_demand`。
- 真实市场份额、转化率优势、广告 ROI、预算加码结论。
- 只凭 `comp_rating - mc_rating` 得出的竞品胜负判断。
- 未经过 alias 规则确认的品牌排名。

反面论证：竞品口碑也可以直接并入货架外需求宽表。本文不采用该路径，因为竞品本土化关注的是“谁在当地被如何评价、哪些话术可借鉴”，主轴是品牌和市场，而货架外需求关注“用户提出了什么未满足需求”，主轴是社区和主题。两者共享外部样本，但宽表粒度不同。

## 3. 上游证据与引用路径

已对齐的上游材料：

- `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md`
- `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md`
- `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md`
- `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md`
- `main_project_lute/全局数据资源整合/03_外部数据需求清单.md`
- `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md`
- `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md`
- `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md`
- `main_project_lute/phase3_mock/fact_voc_brand_summary_mock.csv`
- `main_project_lute/phase3_mock/ods_voc_external_mock.csv`
- `main_project_lute/phase3_outputs/topic1_voc/competitor_opportunity.csv`
- `main_project_lute/phase3_outputs/topic1_voc/shelf_outside_brand_mention.csv`
- `ref/company_info/momcozy_industry_report.md`

证据分层：

| 证据 | 当前用途 | 状态 |
| --- | --- | --- |
| VOC 蓝图与指标字典 | 确认 `VOC-T3`、`VOC-BI-003`、`VOC-AGENT-003` 边界 | Amber |
| 数据矩阵与数仓主键设计 | 确认 `fact_voc_brand_summary`、`dim_brand`、`ods_voc_external` 候选链路 | Amber |
| Phase1 故事线 | 确认“本土竞品用户声音 -> 营销本土化”的业务目标 | Amber |
| Phase3 mock | 提供字段形态和演示结构，不作为生产事实 | Grey |
| 行业背景 | 提供 Momcozy、Medela、Elvie、Willow、Spectra 等竞品上下文 | Grey |

## 4. 宽表粒度

推荐主粒度：

```text
dt_month
+ country_code
+ channel_id / site
+ platform
+ brand_id / brand_name
+ is_self
+ competitor_group
+ category_l3
+ product_line_candidate
+ tag_localized
```

解释：

- `dt_month` 与现有 `fact_voc_brand_summary` 月粒度对齐。
- `country_code + channel_id / site + platform` 支持国家和渠道差异分析。
- `brand_id / brand_name + is_self + competitor_group` 是竞品对比主轴。
- `category_l3 + product_line_candidate` 用于区分吸奶器、哺乳配件、孕产护理等产品线候选。
- `tag_localized` 是本宽表的核心输出字段，承接本地表达、卖点和痛点。

不建议以单条 post/comment 作为 BI 主粒度。单条内容应作为样本证据挂接到品牌/国家/渠道/月聚合行，供抽屉页或 Agent 引用。

## 5. 输入源优先级

| 优先级 | 输入源 | 角色 | 状态 |
| --- | --- | --- | --- |
| P0 | `fact_voc_brand_summary` | 品牌×国家×渠道×月的 VOC、评分、差评率和本土化标签基础 | blocked |
| P0 | `dim_brand` | 品牌标准名、自有/竞品标识、国家、别名映射 | blocked |
| P1 | `ods_voc_external` | 外部竞品提及样本，承接 post/comment 级证据 | blocked |
| P1 | `dwt_voc_external_demand` | 复用外部需求主题和情绪标签，但不继承其主粒度 | draft |
| P1 | `dim_voc_tag` | 统一标签体系，支撑 `tag_localized` | blocked |
| P1 | `dim_channel` | 渠道、站点和平台映射 | candidate |
| P2 | `competitor_opportunity.csv` | Phase3 评分差异 mock，只支持字段映射参考 | mock |
| P2 | `fact_voc_brand_summary_mock.csv`、`ods_voc_external_mock.csv` | Phase3 演示数据，只支持样例验证 | mock |
| P2 | `ref/company_info/momcozy_industry_report.md` | 竞品与行业背景，不作为生产数据源 | reference |

进入 Green 前必须补齐：真实品牌字典、竞品 alias、评分来源、渠道映射、样本来源、标签标注规则、国家市场口径和人工复核流程。

## 6. 输出字段契约

### 6.1 主键与时间

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `dt_month` | date/string | 月份 | candidate |
| `country_code` | string | 国家码 | candidate |
| `channel_id` | string | 渠道 ID | candidate |
| `site` | string | 站点，如 Amazon US、DTC UK | candidate |
| `platform` | string | VOC 来源平台或销售平台 | candidate |
| `brand_id` | string | 标准品牌 ID | blocked |
| `tag_localized` | string | 本土化标签 | blocked |
| `grain_hash` | string | 主粒度哈希，用于去重 | candidate |

### 6.2 品牌与竞品维度

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `brand_name` | string | 标准品牌名 | blocked |
| `brand_alias_raw` | string | 外部文本中的原始品牌别名 | candidate |
| `is_self` | boolean | 是否自有品牌 | blocked |
| `competitor_brand_id` | string | 竞品品牌 ID | blocked |
| `competitor_group` | string | 竞品组，如 traditional、wearable-tech、local-specialist | candidate |
| `brand_country_origin` | string | 品牌来源国家 | candidate |
| `brand_local_presence_level` | string | 本地存在感等级 | blocked |
| `brand_mapping_confidence` | numeric | 品牌映射置信度 | blocked |

`brand_name` 和 `competitor_brand_id` 必须由 `dim_brand` 和 alias 字典确认，不能直接用外部文本字符串作为生产品牌键。

### 6.3 品类、产品线与规格

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `category_l2` | string | 二级品类 | candidate |
| `category_l3` | string | 三级品类 | candidate |
| `spu_id_candidate` | string | 自有或竞品可能关联的 SPU | blocked |
| `product_line_candidate` | string | 产品线候选，如 wearable pump、hospital-grade pump、nursing bra | blocked |
| `sku_or_model_raw` | string | 外部文本或评论中的型号表达 | candidate |
| `packaging_spec_tag` | string | 包装或套装规格标签 | candidate |
| `accessory_tag` | string | 法兰、奶袋、配件等标签 | candidate |

产品线映射当前只允许作为候选信号。若要进入 SKU 决策，必须与商品主数据、竞品产品目录和人工样本复核对齐。

### 6.4 评分、口碑与声量

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `voc_cnt` | integer | 品牌 VOC 量 | candidate |
| `voc_rate` | numeric | VOC 率 | blocked |
| `review_cnt` | integer | 评论数 | candidate |
| `star_rating` | numeric | 品牌平均星级 | blocked |
| `mc_rating` | numeric | 自有品牌评分 | mock |
| `comp_rating` | numeric | 竞品评分 | mock |
| `rating_gap` | numeric | 自有评分 - 竞品评分 | candidate |
| `bad_rate` | numeric | 中差评率 | blocked |
| `positive_cnt` | integer | 正向样本数 | blocked |
| `negative_cnt` | integer | 负向样本数 | blocked |
| `sentiment_polarity` | string | 情绪倾向 | blocked |
| `mention_self_cnt` | integer | 自有品牌提及量 | candidate |
| `mention_comp_cnt` | integer | 竞品品牌提及量 | candidate |

`rating_gap` 只表示评分差异，不表示转化优势、市场份额优势或本土化成功。

### 6.5 本土化标签与话术

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `tag_localized` | string | 本土化主题标签 | blocked |
| `localized_pain_point` | string | 当地用户痛点摘要 | candidate |
| `localized_selling_point` | string | 可借鉴卖点候选 | candidate |
| `localized_copy_candidate` | string | 话术候选短句 | blocked |
| `price_sensitivity_tag` | string | 价格敏感标签 | candidate |
| `feature_preference_tag` | string | 功能偏好标签，如 quiet、portable、hospital-grade | candidate |
| `packaging_preference_tag` | string | 包装偏好标签 | candidate |
| `trust_signal_tag` | string | 信任信号，如 FDA、hospital-grade、doctor-recommended | candidate |
| `local_language_keyword` | string | 本地语言关键词 | blocked |
| `localized_tag_confidence` | numeric | 标签置信度 | blocked |

`localized_copy_candidate` 进入 Green 前必须经过人工复核。它只能作为营销话术候选，不自动进入广告素材或商品详情页。

### 6.6 样本追溯

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `sample_post_cnt` | integer | 可追溯帖子样本数 | candidate |
| `sample_comment_cnt` | integer | 可追溯评论样本数 | candidate |
| `sample_post_id_list_hash` | string | 样本 post ID 列表哈希 | candidate |
| `sample_content_hash_list` | string | 样本内容哈希集合 | candidate |
| `sample_excerpt_available_flag` | boolean | 是否允许展示摘录 | blocked |
| `sample_excerpt` | string | 脱敏样本摘录 | blocked |
| `source_url_hash` | string | 来源 URL 哈希 | candidate |
| `manual_review_case_id` | string | 人审样本批次 | blocked |

默认不在宽表中保存完整原文。需要样本证据时，只展示合规脱敏摘录和来源哈希。

### 6.7 治理字段

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `source_system` | string | 来源系统或采集方式 | candidate |
| `source_file_or_job` | string | 来源文件或任务名 | candidate |
| `evidence_level` | string | Grey、Amber、Green、Red | candidate |
| `dq_status` | string | 数据质量状态 | candidate |
| `sample_size` | integer | 有效样本数 | candidate |
| `alias_review_status` | string | 品牌别名复核状态 | blocked |
| `tag_review_status` | string | 本土化标签复核状态 | blocked |
| `rating_source_status` | string | 评分来源确认状态 | blocked |
| `privacy_review_status` | string | 隐私与平台政策复核状态 | blocked |
| `created_at` | timestamp | 入仓时间 | candidate |
| `updated_at` | timestamp | 更新时间 | candidate |

## 7. 指标计算边界

允许计算：

- `voc_cnt`、`review_cnt`、`mention_self_cnt`、`mention_comp_cnt`
- 品牌、国家、渠道、月份维度下的声量和评分趋势
- `rating_gap = mc_rating - comp_rating`，但只能作为评分差异
- `tag_localized` 的样本频次和国家/渠道分布
- `localized_selling_point` 的候选优先级

暂不允许计算为生产结论：

- 竞品转化优势
- 竞品市场份额
- 广告 ROI 或预算加码建议
- 品牌最终排名
- 自动化本地化文案
- SKU 上新或淘汰决策

原因：这些结论需要销售、渠道、营销、商品和真实用户样本的多源校验。VOC 只能提供口碑和话术线索。

## 8. Phase3 mock 映射

`competitor_opportunity.csv` 当前字段包括 `country`、`channel`、`competitor`、`comp_rating`、`mc_rating`、`advantage`，可映射为：

| Phase3 字段 | 宽表候选字段 | 使用限制 |
| --- | --- | --- |
| `country` | `country_code` | 仅演示国家维度 |
| `channel` | `channel_id` | 仅演示渠道维度 |
| `competitor` | `brand_name` / `competitor_brand_id` | 需经 `dim_brand` 和 alias 字典确认 |
| `comp_rating` | `comp_rating` | mock 评分，非生产评分源 |
| `mc_rating` | `mc_rating` | mock 评分，非生产评分源 |
| `advantage` | `rating_gap` | 只表示评分差异，不代表竞品或自有品牌优势 |

`fact_voc_brand_summary_mock.csv` 可映射 `brand_id`、`country_code`、`channel_id`、`dt_month`、`voc_cnt`、`voc_rate`、`star_rating`、`bad_rate`，但仍属于 mock。

`ods_voc_external_mock.csv` 可辅助样本追溯字段设计，如 `platform`、`community_name`、`post_id`、`comment_id`、`country_code`、`brand_mention`、`emotion`、`likes`、`replies`，但不能作为真实外部样本。

## 9. 数据质量门槛

进入 Green 前至少满足以下 gate：

| Gate ID | 检查项 | 当前状态 |
| --- | --- | --- |
| `VOC-DQ-COMP-SCHEMA-001` | `fact_voc_brand_summary`、`dim_brand`、`ods_voc_external` 字段存在且类型稳定 | blocked |
| `VOC-DQ-COMP-GRAIN-001` | `dt_month + country_code + channel_id/site + brand_id + tag_localized` 粒度不重复 | blocked |
| `VOC-DQ-COMP-ALIAS-001` | 竞品品牌别名、拼写、缩写和本地语言名可追溯 | blocked |
| `VOC-DQ-COMP-RATING-001` | `star_rating`、`mc_rating`、`comp_rating` 来源与口径确认 | blocked |
| `VOC-DQ-COMP-TAG-001` | `tag_localized` 经过人工样本校准 | blocked |
| `VOC-DQ-COMP-SAMPLE-001` | 外部样本来源、样本量、国家覆盖和采样方法明确 | blocked |
| `VOC-DQ-COMP-CHANNEL-001` | `channel_id`、`site`、`platform` 映射稳定 | blocked |
| `VOC-DQ-COMP-PRODUCT-001` | 产品线、SPU、型号映射规则确认 | blocked |
| `VOC-DQ-COMP-PII-001` | 样本摘录、URL、用户标识脱敏合规 | blocked |
| `VOC-DQ-COMP-CLAIM-001` | 输出结论不把评分差异写成转化、ROI 或市场份额 | blocked |

任一 gate 未通过时，`VOC-BI-003` 只能展示探索态，`VOC-AGENT-003` 只能输出候选话术和待确认清单。

## 10. BI 与 Agent 消费方式

`VOC-BI-003` 建议读取：

- 品牌评分对比。
- 自有/竞品 VOC 量与差评率。
- 国家×渠道×品牌的本土化标签矩阵。
- 本土化痛点、卖点和话术候选。
- 样本量、品牌别名复核状态和证据等级。

`VOC-AGENT-003` 建议读取：

- `brand_name`、`is_self`、`competitor_group`。
- `rating_gap` 及其证据状态。
- `tag_localized`、`localized_pain_point`、`localized_selling_point`。
- `localized_copy_candidate` 的人审状态。
- 样本数量、来源和脱敏摘录。

Agent 输出限制：

- 必须标注证据等级。
- 必须列出评分来源、样本来源和样本量。
- 不把竞品声量等同转化。
- 不把评分差异写成市场份额或 ROI。
- 不直接输出可投放广告文案，只输出待复核话术候选。

## 11. 当前不能做的事项

当前明确禁止：

- 把 `competitor_opportunity.csv` 直接提升为正式宽表。
- 将 `advantage` 写成真实竞争优势。
- 将 `comp_rating`、`mc_rating` 当作生产评分源。
- 在 `sql/` 创建 `dwt_voc_competitor_localization` 的生产 SQL。
- 在没有 `dim_brand` 和 alias 字典时输出品牌排名。
- 在没有人审样本时输出自动化本地化文案。
- 将本宽表输出直接交给营销投放或详情页改版。

## 12. 下一步

下一步进入 `VOC-DATA-005`：

- 文件：`drafts/analysis/voc-topic-trend-wide-table-spec-draft-20260603.md`
- 目标：为全域 VOC 声量趋势建立独立宽表规格。

`VOC-DATA-005` 应重点处理 `fact_voc_trend`、来源类型、国家、渠道、品类、时间序列、声量趋势和跨专题输入，避免与本文的品牌本土化口径交叉。

## 13. 需要用户后续决策

需要确认的关键点：

1. 竞品品牌范围是否先限定为 Medela、Spectra、Elvie、Willow、BabyBuddha 与 Momcozy。
2. `dim_brand` 是否允许纳入本地语言别名和常见拼写错误。
3. `tag_localized` 第一版由人工标签字典驱动，还是由 LLM 聚类后人审。
4. `localized_copy_candidate` 是否允许进入 BI 页面；若允许，必须要求人工复核状态。
5. 评分来源是否只用内部评论/平台评价，还是允许并入外部社媒情绪评分。
