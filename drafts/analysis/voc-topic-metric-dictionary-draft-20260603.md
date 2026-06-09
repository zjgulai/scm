---
title: 专题①VOC指标字典草稿
doc_type: analysis
module: project-governance
topic: voc-topic-metric-dictionary
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题①VOC指标字典草稿

## 1. 任务定位

本文件执行 `VOC-DATA-001`，用于固定专题①全域 VOC 数据洞察的指标字典、公式口径、候选源表、适用子课题、证据状态和禁止越界边界。

当前文件是指标种子表草稿，不创建 SQL，不声明真实源表、样本、原文权限、标签体系或 DQ 已经通过。凡涉及生产口径的指标，当前只允许标为 `candidate` 或 `blocked`。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 工作包 | `VOC-DATA-001` |
| 所属蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` |
| 当前数据状态 | `Grey` |
| 指标状态 | 全部为草稿候选，不作生产事实 |
| 覆盖子课题 | `VOC-T1`、`VOC-T2`、`VOC-T3`、`VOC-T4` |
| 覆盖交叉线 | `XL1`、`XL2`、`XL3`、`XL4` 的 VOC 输入输出字段 |
| 禁止动作 | 不写 SQL；不补虚构库表名；不把 Phase3 mock 指标写成真实业务结论 |

## 3. 上游证据

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| VOC 蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | 固定四子课题、源域分层和后续工作包 | 草稿蓝图 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 提供 VOC 指标、字段、候选表和粒度 | 数仓规划基线 |
| 字段口径说明 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | 提供 `fact_voc_*` 和交叉线字段口径 | 运营化规格 |
| 模块 IO | `main_project_lute/Phase3_全专题与运营化/模块输入输出规格表.md` | 提供 T1-1 到 T1-4 输入输出 | 运营化规格 |
| VOC 看板口径 | `main_project_lute/全局数据资源整合/VOC看板2.0_大白话与字段口径.md` | 提供 dwd / dws / ads 字段、周月口径和好中差评公式 | 技术方案证据 |
| Phase3 mock | `main_project_lute/phase3_outputs/topic1_voc/` | 提供 mock 字段结构 | mock 产物 |
| 外部 VOC 模板 | `ref/books/maternal_social_voc/02-日常VOC采集模板与示例.md` | 提供外部社区采集字段和标签方式 | 方法论资产 |

## 4. 指标状态模型

| status | 定义 | 允许用途 | 禁止用途 |
|---|---|---|---|
| `candidate` | 指标来自规划文档、技术方案或 mock 输出，尚未生产验证 | 进入蓝图、PRD、宽表规格和 DQ 设计 | 管理层结论、SQL 正式资产 |
| `blocked` | 指标依赖真实源表、原文权限、标签口径、外部抓取或 Owner 签收 | 作为待确认项 | 任何业务结论 |
| `stable-ready` | 后续源表、样本、DQ、Owner 签收后可转稳定 | 转正式前候选状态 | 当前不得使用 |

当前所有指标状态均不得超过 `candidate`。

## 5. 通用维度字典

| dim_code | 维度 | 候选字段 | 候选来源 | 适用范围 | 当前状态 |
|---|---|---|---|---|---|
| `VOC-DIM-TIME-001` | VOC 日期 | `voc_date`、`stat_date`、`dt_month`、`post_time`、`date_value` | dwd / dws / ads / ods | 全部子课题 | `candidate` |
| `VOC-DIM-TIME-002` | 日期口径 | `data_caliber` | `ads_voc_record_stat_full` | T1/T4 | `candidate` |
| `VOC-DIM-SOURCE-001` | VOC 一级来源 | `voc_type` | dwd / dws / ads | T1/T4 | `candidate` |
| `VOC-DIM-SOURCE-002` | VOC 二级来源 | `data_source`、`voc_source_type` | dwd / fact_voc_trend | T1/T4 | `candidate` |
| `VOC-DIM-CHANNEL-001` | 渠道 | `channel_id`、`channel` | fact / dwd / dws | T1/T3/T4 | `candidate` |
| `VOC-DIM-GEO-001` | 国家 | `country_code`、`country_name`、`country_scope` | fact / dwd / external dim | 全部子课题 | `candidate` |
| `VOC-DIM-PRODUCT-001` | SPU / SKU | `spu_id`、`spu_code`、`sku_model_name_voc`、`platform_sku`、`asin` | fact / dwd | T1/T3 | `candidate` |
| `VOC-DIM-TAG-001` | VOC 标签 | `tag_l2`、`tag_l3`、`voc_label1` 到 `voc_label4`、`topic_tags` | dim_voc_tag / dwd / ods | 全部子课题 | `candidate` |
| `VOC-DIM-COMMUNITY-001` | 外部社区 | `platform`、`community_name`、`board_name`、`subreddit` | ods_voc_external / ref 模板 | T2/T4 | `candidate` |
| `VOC-DIM-BRAND-001` | 品牌 | `brand_id`、`brand_name`、`brand`、`is_self` | fact_voc_brand_summary / dim_brand / mock | T2/T3 | `candidate` |
| `VOC-DIM-ORDER-001` | 订单 / 退款关联 | `order_id`、`return_id`、`voc_ticket_id` | dwd / fact_return / XL3 输入 | T1/XL3 | `blocked` |
| `VOC-DIM-AUDIENCE-001` | 外部人群阶段 | `audience_stage`、`人群标签` | dim_voc_external_community / 外部模板 | T2 | `candidate` |

## 6. T1 货架内服务体验指标

| metric_code | 指标 | 公式 / 口径 | 候选字段 | 候选源表 | 适用 | Owner 候选 | 状态 |
|---|---|---|---|---|---|---|---|
| `VOC-METRIC-SHELF-001` | VOC 量 | 指定维度下 VOC 记录数或汇总值 | `voc_cnt` | `fact_voc_summary`、`dws_voc_record_analysis_day_full`、`ads_voc_record_stat_full` | T1/T4 | 数据 / 客服 | `candidate` |
| `VOC-METRIC-SHELF-002` | VOC 率 | `voc_cnt / sales_qty` 或存量 BI 每百单 / 万单口径，需 Owner 确认尺度 | `voc_cnt`、`sales_qty`、`sale_qty` | `fact_voc_summary`、`dws_voc_record_analysis_day_full` | T1/T4/CHANNEL 输入 | 数据 / 客服 / 销售运营 | `blocked` |
| `VOC-METRIC-SHELF-003` | 平均星级 | dws 口径为 `rating_qty / ship_qty`；ads 可由星级分布重算 | `rating_qty`、`ship_qty`、`rating_star1_cnt` 到 `rating_star5_cnt`、`star_rating` | dws / ads / `fact_voc_summary` | T1/T3/T4 | 客服 / 商品 | `candidate` |
| `VOC-METRIC-SHELF-004` | 好评率 | `positive_reviews_cnt / total_reviews_cnt` | `positive_reviews_cnt`、`total_reviews_cnt`、`good_rate` | dws / ads / `fact_voc_summary` | T1/T3 | 客服 / 商品 | `candidate` |
| `VOC-METRIC-SHELF-005` | 中差评率 | `neutral_negative_cnt / total_reviews_cnt` | `neutral_negative_cnt`、`total_reviews_cnt`、`bad_rate` | dws / ads / `fact_voc_summary` | T1/T3 | 客服 / 商品 | `candidate` |
| `VOC-METRIC-SHELF-006` | 评论数 | 指定维度下评论总数 | `review_cnt`、`total_reviews_cnt` | `fact_voc_summary`、ads | T1 | 客服 / 商品 | `candidate` |
| `VOC-METRIC-SHELF-007` | 新增评论数 | 指定周期新增评论数 | `review_cnt_new` | `fact_voc_summary` | T1 | 客服 / 商品 | `candidate` |
| `VOC-METRIC-SHELF-008` | 退货率 | `return_cnt / order_cnt` 或来源表已给 `return_rate`，需与 ORDER 退款口径对齐 | `return_rate`、`order_id`、`return_id` | `fact_voc_summary`、`fact_return` 线索 | T1/XL3 | 客服 / 售后 / 订单 | `blocked` |
| `VOC-METRIC-SHELF-009` | DOA 率 | `doa_cnt / sales_qty` 或存量品质口径 | `doa_rate` | `fact_voc_summary` / 品质源表候选 | T1 | 品质 / 客服 | `blocked` |
| `VOC-METRIC-SHELF-010` | 工单数 | 指定维度下工单量 | `ticket_cnt`、`ticket_id` | dws / dwd | T1 | 客服 | `candidate` |
| `VOC-METRIC-SHELF-011` | 痛点优先级 | Phase3 mock 为 `priority`；生产需由 `bad_rate`、`voc_cnt`、业务权重共同定义 | `priority`、`bad_rate`、`voc_cnt` | `shelf_inside_analysis.csv` / 待建宽表 | T1/XL1 | 分析 / 产品 / 客服 | `blocked` |

## 7. T2 货架外需求指标

| metric_code | 指标 | 公式 / 口径 | 候选字段 | 候选源表 | 适用 | Owner 候选 | 状态 |
|---|---|---|---|---|---|---|---|
| `VOC-METRIC-EXT-001` | 外部帖子数 | 指定平台 / 社区 / 主题下帖子数 | `post_cnt`、`post_id` | `fact_voc_external_daily`、`ods_voc_external` | T2/T4 | 市场 / 数据 | `candidate` |
| `VOC-METRIC-EXT-002` | 外部评论数 | 指定平台 / 社区 / 主题下评论数 | `comment_cnt`、`comment_id` | `fact_voc_external_daily`、`ods_voc_external` | T2/T4 | 市场 / 数据 | `candidate` |
| `VOC-METRIC-EXT-003` | 互动量 | `reply_cnt + like_cnt`，是否纳入收藏 / 转发需按平台确认 | `reply_cnt`、`like_cnt` | `ods_voc_external` | T2 | 市场 | `blocked` |
| `VOC-METRIC-EXT-004` | 正向情绪率 | 正向样本数 / 有效情绪样本数 | `sentiment_polarity`、`positive_rate` | `ods_voc_external`、`shelf_outside_brand_mention.csv` | T2/T3 | 市场 / 数据 | `blocked` |
| `VOC-METRIC-EXT-005` | 高潜需求主题频次 | 指定主题标签出现次数 | `topic_tags`、`topic_tag` | `ods_voc_external`、外部采集日志 | T2/XL2 | 产品 / 市场 | `candidate` |
| `VOC-METRIC-EXT-006` | 高潜需求优先级 | 主题频次、互动量、情绪强度、战略相关性的综合评分 | `topic_tags`、`reply_cnt`、`like_cnt`、`priority` | 外部样本 / 交叉线字段 | T2/XL2 | 产品 / 市场 | `blocked` |
| `VOC-METRIC-EXT-007` | 第二大单品候选分 | 外部需求主题与现有产品缺口匹配后的候选分 | `topic_tags`、`理想产品/解决方案`、`spu_id` | 外部采集模板 / 产品主数据候选 | T2 | 产品 / IPMS | `blocked` |
| `VOC-METRIC-EXT-008` | 社区浓度 | 指定社区目标主题样本数 / 该社区总样本数 | `community_name`、`topic_tag`、`post_cnt`、`comment_cnt` | `fact_voc_external_daily` / 外部样本 | T2/XL2 | 市场 / 投放 | `blocked` |

## 8. T3 竞品与本土化指标

| metric_code | 指标 | 公式 / 口径 | 候选字段 | 候选源表 | 适用 | Owner 候选 | 状态 |
|---|---|---|---|---|---|---|---|
| `VOC-METRIC-COMP-001` | 品牌 VOC 量 | 品牌×国家×渠道×月份 VOC 汇总量 | `brand_id`、`voc_cnt` | `fact_voc_brand_summary` | T3 | 市场 / 品牌 | `candidate` |
| `VOC-METRIC-COMP-002` | 品牌 VOC 率 | 品牌 VOC 量 / 对应销量或样本基数，分母需确认 | `voc_cnt`、`voc_rate` | `fact_voc_brand_summary` | T3 | 市场 / 数据 | `blocked` |
| `VOC-METRIC-COMP-003` | 品牌评分 | 品牌维度平均星级 | `star_rating`、`mc_rating`、`comp_rating` | `fact_voc_brand_summary`、`competitor_opportunity.csv` | T3 | 市场 / 商品 | `candidate` |
| `VOC-METRIC-COMP-004` | 评分差异 | 自有品牌评分 - 竞品评分 | `mc_rating`、`comp_rating`、`advantage` | `competitor_opportunity.csv` | T3 | 市场 / 商品 | `candidate` |
| `VOC-METRIC-COMP-005` | 本土化标签覆盖 | `tag_localized` 命中样本数 / 有效样本数 | `tag_localized` | `fact_voc_brand_summary`、`dim_voc_tag` | T3 | 市场 / 品牌 | `blocked` |
| `VOC-METRIC-COMP-006` | 竞品提及量 | 指定竞品在外部样本中的提及次数 | `mention_brand_comp`、`brand`、`post_cnt` | `ods_voc_external`、`shelf_outside_brand_mention.csv` | T2/T3 | 市场 | `candidate` |
| `VOC-METRIC-COMP-007` | 自有品牌提及量 | 自有品牌在外部样本中的提及次数 | `mention_brand_self`、`brand`、`post_cnt` | `ods_voc_external`、`shelf_outside_brand_mention.csv` | T2/T3 | 市场 | `candidate` |
| `VOC-METRIC-COMP-008` | 本土化话术候选优先级 | 本土化标签频次、情绪、国家渠道战略权重的综合排序 | `tag_localized`、`sentiment_polarity`、`country_code` | 待建竞品宽表 | T3/XL4 | 市场 / 品牌 | `blocked` |

## 9. T4 声量趋势指标

| metric_code | 指标 | 公式 / 口径 | 候选字段 | 候选源表 | 适用 | Owner 候选 | 状态 |
|---|---|---|---|---|---|---|---|
| `VOC-METRIC-TREND-001` | 声量 | 指定维度下 VOC 或提及量 | `voc_cnt`、`mention_volume` | `fact_voc_trend`、`voc_trend.csv` | T4 | 市场 / 数据 | `candidate` |
| `VOC-METRIC-TREND-002` | 声量 12 月趋势 | 12 个月趋势值，计算方式需确认是斜率、同比还是平滑指数 | `voc_trend_12m` | `fact_voc_trend` | T4 | 市场 / 数据 | `blocked` |
| `VOC-METRIC-TREND-003` | 声量变化率 | `(本期 voc_cnt - 上期 voc_cnt) / 上期 voc_cnt` | `voc_cnt_chg`、`voc_cnt` | `voc_trend.csv`、`fact_voc_trend` | T4 | 数据 | `candidate` |
| `VOC-METRIC-TREND-004` | 评分变化 | 本期评分 - 上期评分 | `rating_chg`、`star_rating` | `voc_trend.csv`、`fact_voc_summary` | T4/T1 | 数据 / 客服 | `candidate` |
| `VOC-METRIC-TREND-005` | 来源结构占比 | 指定来源 VOC 量 / 全部来源 VOC 量 | `voc_source_type`、`voc_cnt` | `fact_voc_trend` | T4 | 市场 / 数据 | `candidate` |
| `VOC-METRIC-TREND-006` | 标签趋势 | 指定标签在周期内的变化或增长率 | `tag_trend`、`tag_l2`、`tag_l3` | `fact_voc_trend`、`dim_voc_tag` | T4 | 市场 / 客服 | `blocked` |
| `VOC-METRIC-TREND-007` | 机会 / 风险标记 | 趋势、差评、声量、国家渠道画像共同触发 | `risk_flag`、`voc_cnt`、`bad_rate`、`mention_volume` | `fact_voc_trend` + CHANNEL 输入 | T4/XL4 | 分析 / 渠道 | `blocked` |

## 10. 交叉线指标

| metric_code | 指标 / 产出字段 | 公式 / 口径 | 候选字段 | 交叉线 | 状态 |
|---|---|---|---|---|---|
| `VOC-METRIC-XL1-001` | 痛点主题编码 | VOC 标签聚类后的稳定主题 ID | `theme_code`、`tag_l2`、`tag_l3`、`topic_tags` | `XL1` | `blocked` |
| `VOC-METRIC-XL1-002` | 痛点主题优先级 | 痛点频次、差评率、销售影响和业务权重综合排序 | `theme_name`、`priority`、`bad_rate`、`voc_cnt` | `XL1` | `blocked` |
| `VOC-METRIC-XL2-001` | 高浓度社区优先级 | 社区浓度、互动量、主题相关性和可投放性综合排序 | `community_name`、`topic_tag`、`priority`、`suggested_placement` | `XL2` | `blocked` |
| `VOC-METRIC-XL3-001` | 售后主题映射状态 | ORDER 主题建议能否映射到 VOC 标签体系 | `theme_suggested`、`return_reason_code`、`tag_l2`、`tag_l3` | `XL3` | `blocked` |
| `VOC-METRIC-XL3-002` | 双重视图覆盖率 | 同时存在 ORDER 退款主题和 VOC 原文证据的样本数 / ORDER 主题输入样本数 | `order_id`、`return_id`、`voc_ticket_id`、`content_text` | `XL3` | `blocked` |
| `VOC-METRIC-XL4-001` | VOC 分层规则覆盖 | 已绑定国家渠道画像的 VOC 样本数 / 有效 VOC 样本数 | `country_code`、`channel_id`、`lifecycle_stage`、`risk_flag` | `XL4` | `blocked` |

## 11. 指标分母与日期口径

| 口径项 | 当前判断 | 待确认项 |
|---|---|---|
| VOC 日期 | 工单取创建 / 接入时间，评论取评论时间，退货取备注产生时间 | 各来源是否已统一到 `voc_date` |
| 订单日期 | `data_caliber = order` 表示按下单日归属 | 与 `order_id` / `order_array` 的去重规则 |
| VOC 日期 | `data_caliber = voc` 表示按 VOC 产生日归属 | dwd、dws、ads 是否同口径 |
| VOC 率分母 | 可能是销量、订单数、每百单或每万单 | 必须与存量 BI Owner 确认 |
| 好中差评分母 | `total_reviews_cnt` | 仅评论类还是含工单 / 退货留言 |
| 平均星级分母 | `ship_qty` 或有效评分数 | 与 ads 星级分布的换算关系 |
| 外部社区样本分母 | 平台 / 社区 / 主题范围内有效帖子评论数 | 抓取规则、去重、语言过滤 |

## 12. P0 指标与 DQ 前置

| priority | 指标 | 为什么是 P0 | DQ 前置 |
|---|---|---|---|
| P0 | `VOC-METRIC-SHELF-001` VOC 量 | 所有 VOC 看板、Agent 和趋势的基础 | 主键、来源、日期、维度非空 |
| P0 | `VOC-METRIC-SHELF-002` VOC 率 | 服务体验横向比较的核心指标 | 分母口径、销量 / 订单数可用 |
| P0 | `VOC-METRIC-SHELF-003` 平均星级 | 评论体验和竞品对比核心指标 | rating 范围、分子分母一致 |
| P0 | `VOC-METRIC-SHELF-004` 好评率 | 服务体验正向评价核心指标 | 分母非零、评论口径明确 |
| P0 | `VOC-METRIC-SHELF-005` 中差评率 | 痛点识别核心指标 | 分母非零、分类口径明确 |
| P0 | `VOC-METRIC-EXT-005` 高潜需求主题频次 | 外部需求挖掘基础 | 标签映射、样本去重、语言过滤 |
| P0 | `VOC-METRIC-COMP-001` 品牌 VOC 量 | 竞品对比基础 | 品牌 ID / 别名映射 |
| P0 | `VOC-METRIC-TREND-001` 声量 | 趋势雷达基础 | 来源类型、时间、国家渠道维度 |

## 13. 当前不能用于结论的指标

| 指标 | 原因 | 允许用途 |
|---|---|---|
| `priority` | Phase3 mock 已出现，但生产权重未定义 | PRD / DQ 设计 |
| `advantage` | mock 中为评分差异，不代表真实竞品优势 | 竞品页面字段候选 |
| `positive_rate` | 外部来源、样本量和情绪分类未确认 | 外部情绪指标候选 |
| `voc_trend_12m` | 趋势计算方法未确认 | 趋势指标候选 |
| `theme_suggested` | 来自 ORDER 输入，不是 VOC 最终标签 | XL3 输入候选 |
| `suggested_placement` | 属于营销投放建议，不是 VOC 事实 | XL2 handoff 字段候选 |

## 14. 下一步

下一步进入：

```text
VOC-DATA-002
```

建议新建草稿：

```text
drafts/analysis/voc-topic-shelf-inside-wide-table-spec-draft-20260603.md
```

该文件应先固定 `dwt_voc_shelf_inside` 或等价货架内 VOC 宽表规格，覆盖内部评论、客服工单、退货留言、星级、好中差评、销量对齐和标签字段。继续保持不写 SQL。

## 15. 待确认决策

| 决策点 | 触发阶段 | 推荐默认 |
|---|---|---|
| `voc_rate` 采用每百单、每万单还是占比 | `VOC-DATA-002` 前 | 暂不强定，标 `blocked` |
| `fact_voc_summary` 与 `dws_voc_record_analysis_day_full` 是否并存 | `VOC-SOURCE-001` 前 | 先并列候选 |
| 外部情绪 `positive_rate` 是否由算法或人工标签产生 | `VOC-DATA-003` 前 | 先标 `blocked` |
| `theme_code` 是否使用 `dim_voc_tag` 体系 | `VOC-DATA-003` / `XL1` 前 | 是，但需标签 Owner 签收 |
| 竞品别名如何映射到 `dim_brand` | `VOC-DATA-004` 前 | 先建别名表候选 |
