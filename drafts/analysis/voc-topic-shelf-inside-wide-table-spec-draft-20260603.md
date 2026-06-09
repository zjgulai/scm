---
title: 专题①货架内VOC宽表规格草稿
doc_type: analysis
module: project-governance
topic: voc-topic-shelf-inside-wide-table-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题①货架内VOC宽表规格草稿

## 1. 任务定位

本文件执行 `VOC-DATA-002`，用于固定专题① `VOC-T1` 货架内用户声音到服务质量与体验分析的宽表规格。目标资产建议命名为 `dwt_voc_shelf_inside`。

当前文件是宽表规格草稿，不创建 SQL，不声明 `dwd_voc_record_detail_full`、`dws_voc_record_analysis_day_full`、`ads_voc_record_stat_full` 或 `fact_voc_summary` 已经具备生产访问、样本 DQ 或 Owner 签收。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 工作包 | `VOC-DATA-002` |
| 目标宽表 | `dwt_voc_shelf_inside` |
| 所属子课题 | `VOC-T1` 货架内用户声音 -> 服务质量与体验 |
| 主要服务页面 | `VOC-BI-001` 货架内服务质量与体验总览 |
| 主要服务 Agent | `VOC-AGENT-001` 货架内 VOC 诊断 |
| 当前状态 | `blocked` |
| 阻断原因 | 真实源表、样本、原文权限、标签口径、日期口径、销量分母和 Owner 签收未完成 |
| 文件落点 | `drafts/analysis/` |
| 禁止动作 | 不进入 `sql/`；不写生产 SQL；不输出真实痛点结论 |

## 3. 上游证据

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| VOC 蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | 固定 `VOC-T1` 边界和后续工作包 | 草稿蓝图 |
| VOC 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | 固定 T1 指标、状态和分母口径 | 草稿指标字典 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 提供 `fact_voc_summary`、`dim_voc_tag`、`ods_review_detail` 候选 | 数仓规划基线 |
| VOC 看板技术方案 | `main_project_lute/全局数据资源整合/VOC看板2.0重构技术方案.md` | 提供 dwd / dws / ads 表设计 | 技术方案证据 |
| VOC 字段口径 | `main_project_lute/全局数据资源整合/VOC看板2.0_大白话与字段口径.md` | 提供字段取值、日期口径、好中差评和星级公式 | 技术方案证据 |
| Phase3 货架内 mock | `main_project_lute/phase3_outputs/topic1_voc/shelf_inside_analysis.csv` | 提供 mock 输出字段结构 | mock 产物 |

## 4. 宽表定位

`dwt_voc_shelf_inside` 只负责货架内 VOC，即内部客服工单、商品评论、退货留言、站内评价和销量对齐后的服务体验分析。

| 包含 | 不包含 |
|---|---|
| 客服工单、商品评论、退货留言、站内评价 | Reddit、BabyCenter、Mumsnet 等外部社区 |
| 平台、渠道、店铺、国家、SPU、SKU / VOC 型号 | 外部社区人群标签和互动量 |
| VOC 量、VOC 率、星级、好评率、中差评率、评论数、工单数、销量 | 竞品评分、竞品提及、本土化话术 |
| 标签一到四级、情绪、原文权限标记、样本证据索引 | 营销 ROI、渠道加码、预算建议 |
| `XL3` 售后 / 退款主题输入的校验状态 | ORDER 退款根因或 VOC 最终标签 |

## 5. 推荐粒度

推荐主粒度：

```text
统计周期 × 日期口径 × 平台 × 渠道 × 店铺 × 国家 × SPU × VOC型号 × VOC来源 × VOC标签路径
```

推荐逻辑主键：

```text
period_grain
+ data_caliber
+ period_value
+ platform
+ channel_id
+ shop
+ country_code
+ spu_code
+ sku_model_name_voc
+ voc_type
+ data_source
+ voc_level1
+ voc_level2
+ voc_level3
+ voc_level4
```

| 粒度字段 | 说明 | 当前状态 |
|---|---|---|
| `period_grain` | `day` / `week` / `month`，来自 dws / ads 统计口径 | `candidate` |
| `data_caliber` | `order` / `voc`，区分下单日和 VOC 产生日 | `blocked` |
| `period_value` | 日、周或月值，例如 `2026-06-03`、`2026Week23`、`2026-06` | `candidate` |
| `channel_id` / `channel` | 渠道字段需统一命名 | `blocked` |
| `spu_code` / `spu_id` | 商品口径需与主数据映射 | `blocked` |
| `voc_level1` 到 `voc_level4` | 汇总层标签路径 | `blocked` |

## 6. 输入源优先级

| 优先级 | 候选输入 | 粒度 | 用途 | 状态 |
|---:|---|---|---|---|
| 1 | `dwd_voc_record_detail_full` | 一条 VOC 明细 | 原文、标签、来源、商品、订单 / 工单索引 | `blocked` |
| 2 | `dws_voc_record_analysis_day_full` | 日 × 维度 × 标签 | 日级 VOC 量、销量、好中差评、工单数 | `candidate` |
| 3 | `ads_voc_record_stat_full` | 周/月 × 维度 × 标签 | 看板周月汇总、星级分布、日期口径 | `candidate` |
| 4 | `fact_voc_summary` | 渠道 × 国家 × SPU × 月 | 规划层货架内汇总事实 | `candidate` |
| 5 | `ods_review_detail` | 评论级 | 站内评论明细补充 | `blocked` |
| 6 | `dim_voc_tag` | 标签维度 | 标签解释、层级、主题编码 | `blocked` |
| 7 | `fact_return` / `refund_theme_input_for_voc` | 退款 / 交叉线输入 | 售后主题校验，不替代 VOC 原文 | `blocked` |
| 8 | `shelf_inside_analysis.csv` | mock 汇总 | 字段结构参考 | `candidate` |

## 7. 输出字段契约

### 7.1 主键与时间字段

| 字段 | 类型建议 | 来源 | 说明 | 状态 |
|---|---|---|---|---|
| `period_grain` | string | dws / ads | `day` / `week` / `month` | `candidate` |
| `data_caliber` | string | ads | `order` / `voc`，未确认前不得混用 | `blocked` |
| `period_value` | string | dws / ads | 日、周、月统一展示值 | `candidate` |
| `period_start_date` | date | 计算字段 | 周/月起始日期 | `blocked` |
| `period_end_date` | date | 计算字段 | 周/月结束日期 | `blocked` |
| `dt_month` | string | fact / 计算字段 | 月份字段，服务月度看板 | `candidate` |
| `source_stat_date` | date | dws | 日表统计日期，用于追溯 | `candidate` |

### 7.2 渠道、国家和商品字段

| 字段 | 类型建议 | 来源 | 说明 | 状态 |
|---|---|---|---|---|
| `platform` | string | dwd / dws / ads | 平台名称 | `candidate` |
| `channel_id` | string | fact / 映射 | 标准渠道 ID | `blocked` |
| `channel_name` | string | dwd / dws / ads | 原始渠道名称 | `candidate` |
| `shop` | string | dwd / dws / ads | 店铺 | `candidate` |
| `country_code` | string | dwd / dws / ads | 国家代码 | `candidate` |
| `country_name` | string | dwd / dws / ads | 国家名称 | `candidate` |
| `spu_code` | string | dwd / dws / ads | SPU 编码 | `candidate` |
| `spu_id` | string | 商品主数据映射 | 统一 SPU ID | `blocked` |
| `spu_name` | string | dwd / dws / ads | SPU 名称 | `candidate` |
| `platform_sku` | string | dwd / dws / ads | 平台 SKU | `candidate` |
| `asin` | string | dwd / dws / ads | Amazon ASIN | `candidate` |
| `sku_model_name_voc` | string | dwd / dws / ads | VOC 看板型号 | `candidate` |
| `product_line` | string | dwd / dws / ads | 产品品线 | `candidate` |
| `sku_developer_name` | string | dwd / dws / ads | 产品经理候选字段 | `candidate` |

### 7.3 来源与标签字段

| 字段 | 类型建议 | 来源 | 说明 | 状态 |
|---|---|---|---|---|
| `voc_type` | string | dwd / dws / ads | 客服工单 / 退货留言 / 商品评论 / 订单销量 | `candidate` |
| `data_source` | string | dwd | 京麦、千牛、Zendesk、Amazon、Meltwater 等二级来源 | `blocked` |
| `voc_source_group` | string | 计算字段 | 内部 VOC 来源归并，例如 `ticket` / `review` / `return_message` / `sales` | `blocked` |
| `voc_level1` | string | dws / ads / dim | VOC 一级标签 | `blocked` |
| `voc_level2` | string | dws / ads / dim | VOC 二级标签 | `blocked` |
| `voc_level3` | string | dws / ads / dim | VOC 三级标签 | `blocked` |
| `voc_level4` | string | dws / ads / dim | VOC 四级标签 | `blocked` |
| `tag_l2` | string | `dim_voc_tag` | 标准二级标签 | `blocked` |
| `tag_l3` | string | `dim_voc_tag` | 标准三级标签 | `blocked` |
| `tag_quality_status` | string | DQ 输出 | 标签缺失、冲突、不可映射状态 | `blocked` |
| `sentiment` | string | dwd | 情感类型，仅作为线索 | `blocked` |

### 7.4 指标字段

| 字段 | metric_code | 公式 / 口径 | 状态 |
|---|---|---|---|
| `voc_cnt` | `VOC-METRIC-SHELF-001` | 指定维度下 VOC 量 | `candidate` |
| `ticket_cnt` | `VOC-METRIC-SHELF-010` | 指定维度下工单数 | `candidate` |
| `order_cnt` | 待定 | `ads` 去重订单数，不包含 null | `blocked` |
| `order_array_sample` | 待定 | dws 的订单数组追溯样本，不作为统计主字段 | `blocked` |
| `sales_qty` | 待定 | 销量，可能来自 dws / fact_voc_summary / 销售明细 | `blocked` |
| `voc_rate` | `VOC-METRIC-SHELF-002` | `voc_cnt / sales_qty` 或存量 BI 尺度 | `blocked` |
| `rating_qty` | `VOC-METRIC-SHELF-003` | 平均星级分子，dws 口径 | `candidate` |
| `ship_qty` | `VOC-METRIC-SHELF-003` | 平均星级分母，dws 口径 | `candidate` |
| `star_rating` | `VOC-METRIC-SHELF-003` | `rating_qty / ship_qty` 或 fact 已算字段 | `candidate` |
| `rating_star1_cnt` 到 `rating_star5_cnt` | `VOC-METRIC-SHELF-003` | ads 星级分布 | `candidate` |
| `total_reviews_cnt` | `VOC-METRIC-SHELF-004` / `005` | 好中差评分母 | `candidate` |
| `positive_reviews_cnt` | `VOC-METRIC-SHELF-004` | 好评数 | `candidate` |
| `neutral_negative_cnt` | `VOC-METRIC-SHELF-005` | 中差评数 | `candidate` |
| `good_rate` | `VOC-METRIC-SHELF-004` | `positive_reviews_cnt / total_reviews_cnt` | `candidate` |
| `bad_rate` | `VOC-METRIC-SHELF-005` | `neutral_negative_cnt / total_reviews_cnt` | `candidate` |
| `review_cnt` | `VOC-METRIC-SHELF-006` | 评论数 | `candidate` |
| `review_cnt_new` | `VOC-METRIC-SHELF-007` | 周期新增评论数 | `blocked` |
| `return_rate` | `VOC-METRIC-SHELF-008` | 需与 ORDER 退款口径对齐 | `blocked` |
| `doa_rate` | `VOC-METRIC-SHELF-009` | 需品质 Owner 签收 | `blocked` |
| `pain_priority` | `VOC-METRIC-SHELF-011` | 生产权重未定义，Phase3 `priority` 只作样例 | `blocked` |

### 7.5 原文与样本证据字段

| 字段 | 类型建议 | 来源 | 说明 | 状态 |
|---|---|---|---|---|
| `sample_record_ids` | string / array | dwd | 代表样本 ID 列表，只用于追溯 | `blocked` |
| `sample_ticket_ids` | string / array | dwd | 代表工单 ID 列表 | `blocked` |
| `sample_review_ids` | string / array | ods_review_detail / dwd | 代表评论 ID 列表 | `blocked` |
| `sample_text_available_flag` | boolean | DQ 输出 | 是否允许查看原文 | `blocked` |
| `sample_text_hash` | string | DQ 输出 | 原文哈希或脱敏索引 | `blocked` |
| `sample_text_excerpt` | string | dwd | 只在权限和脱敏通过后可输出 | `blocked` |

宽表主表不默认存放完整 `content`、`review`、`return_remarks`。原文只能在权限、脱敏和审查通过后以抽屉或明细接口方式引用。

### 7.6 治理字段

| 字段 | 类型建议 | 说明 |
|---|---|---|
| `source_detail_table` | string | 明细来源表名或样本文件名 |
| `source_agg_table` | string | 汇总来源表名或样本文件名 |
| `source_tag_table` | string | 标签维度来源 |
| `source_sales_table` | string | 销量分母来源 |
| `metric_status` | string | `candidate` / `blocked` / `stable-ready` |
| `data_quality_status` | string | `Grey` / `Amber` / `Green` / `Red` |
| `gap_flags` | string / array | 标签、原文、日期、销量、分母、权限等缺口 |
| `dq_run_id` | string | DQ 执行批次 |
| `updated_at` | datetime | 宽表更新时间 |

## 8. 指标计算边界

| 指标 | 当前可定义 | 当前不能定义 |
|---|---|---|
| `voc_cnt` | 可按 dws / ads / fact 汇总字段承接 | 不能确认生产表中的去重规则 |
| `voc_rate` | 可写候选公式 `voc_cnt / sales_qty` | 不能确认每百单、每万单或占比尺度 |
| `star_rating` | 可承接 `rating_qty / ship_qty` 或已有字段 | 不能确认所有来源都有评分 |
| `good_rate` / `bad_rate` | 可承接评论分子分母公式 | 不能确认工单和退货留言是否进入评论分母 |
| `ticket_cnt` | 可承接工单数 | 不能把评论数和工单数混为 VOC 量分母 |
| `return_rate` | 可作为候选字段 | 不能替代 ORDER 退款归因口径 |
| `pain_priority` | 可引用 mock 字段结构 | 不能输出真实痛点优先级 |

## 9. Phase3 mock 映射

| mock 字段 | 映射到目标字段 | 使用方式 | 限制 |
|---|---|---|---|
| `channel_id` | `channel_id` | 页面筛选和下钻结构参考 | 真实渠道映射待确认 |
| `country_code` | `country_code` | 国家维度参考 | 真实国家枚举待确认 |
| `spu_id` | `spu_id` / `spu_code` | 商品维度参考 | SPU 主数据映射待确认 |
| `voc_cnt` | `voc_cnt` | 指标字段参考 | mock 值不作真实结论 |
| `star_rating` | `star_rating` | 评分字段参考 | 评分分子分母待确认 |
| `good_rate` | `good_rate` | 好评率字段参考 | 评论分母待确认 |
| `bad_rate` | `bad_rate` | 中差评率字段参考 | 评论分母待确认 |
| `review_cnt` | `review_cnt` | 评论数字段参考 | 评论来源待确认 |
| `issue_type` | `issue_type` / `pain_type` | 痛点 / 亮点分类候选 | 生产分类规则待确认 |
| `priority` | `pain_priority` | 排序字段候选 | 生产权重未定义 |

## 10. DQ 前置

| dq_id | 检查项 | 规则 | 未通过影响 |
|---|---|---|---|
| `VOC-DQ-SHELF-SCHEMA-001` | 字段存在 | 主键、时间、来源、渠道、国家、商品、标签和指标字段存在 | 宽表 `Red` |
| `VOC-DQ-SHELF-PK-001` | 主键唯一 | 推荐逻辑主键在样本内唯一 | 不进入 SQL |
| `VOC-DQ-SHELF-DATE-001` | 日期口径 | `data_caliber`、`period_grain`、`period_value` 不混用 | 不输出趋势 |
| `VOC-DQ-SHELF-SOURCE-001` | 来源枚举 | `voc_type` 和 `data_source` 可映射 | 不输出来源占比 |
| `VOC-DQ-SHELF-TAG-001` | 标签完整 | `voc_level1` 到 `voc_level4` 缺失率在阈值内 | 不输出痛点排行 |
| `VOC-DQ-SHELF-SALES-001` | 销量分母 | `sales_qty` / `sale_qty` 来源明确且非负 | `voc_rate` 保持 `blocked` |
| `VOC-DQ-SHELF-RATING-001` | 星级范围 | `rating` 或 `star_rating` 在合法范围内 | 不输出评分 |
| `VOC-DQ-SHELF-REVIEW-001` | 评论分母 | `total_reviews_cnt` 非负，分子不超过分母 | 不输出好中差评率 |
| `VOC-DQ-SHELF-TEXT-001` | 原文权限 | 原文引用权限、脱敏和哈希规则明确 | 不输出样本原文 |
| `VOC-DQ-SHELF-XL3-001` | 退款输入边界 | `refund_theme_input_for_voc` 只能作为售后主题线索 | 不输出双重视图 |

## 11. BI 与 Agent 消费

| 消费方 | 使用字段 | 允许输出 | 禁止输出 |
|---|---|---|---|
| `VOC-BI-001` | KPI、趋势、标签、SPU、来源和样本索引 | 服务质量总览、痛点清单、下钻入口 | 无权限原文、生产动作结论 |
| `VOC-AGENT-001` | `voc_cnt`、`voc_rate`、`bad_rate`、标签、样本证据 | 数据缺口、待验证痛点、样本证据请求 | 无证据根因、Owner 归责 |
| `XL1` | 痛点主题、SPU、国家、渠道 | 给 ORDER 的主题输入 | SKU 组合上线结论 |
| `XL3` | 售后主题映射状态、VOC 原文证据状态 | 双重视图前置判断 | 用 ORDER 输入替代 VOC 原文 |

## 12. 当前不能做

| 禁止动作 | 原因 |
|---|---|
| 创建 `sql/voc_shelf_inside.sql` | 源表、样本、DQ、Owner 未确认 |
| 把 `shelf_inside_analysis.csv` 的数值写成真实痛点 | Phase3 输出是 mock |
| 把 `priority` 作为生产排序 | 权重和分母未定义 |
| 在宽表主表中默认存完整原文 | 原文权限和脱敏未确认 |
| 把退货留言直接等同退款根因 | 退款归因属于 ORDER / XL3 |
| 把外部社区字段混入货架内宽表 | 外部需求属于 `VOC-DATA-003` |

## 13. 下一步

下一步进入：

```text
VOC-DATA-003
```

建议新建草稿：

```text
drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md
```

该文件应固定 `dwt_voc_external_demand` 或等价货架外需求宽表规格，覆盖 Reddit、母婴垂类社区、社媒、主题标签、情绪、互动量、社区浓度和第二大单品候选字段。继续保持不写 SQL。

## 14. 待确认决策

| 决策点 | 触发阶段 | 推荐默认 |
|---|---|---|
| 主粒度是否以 `ads` 周/月为主还是 dws 日粒度为主 | `VOC-SOURCE-001` 前 | 先支持 day/week/month，待看板优先级确认 |
| `channel_id` 是否能从 `channel` 稳定映射 | `VOC-SOURCE-001` 前 | 保持 `blocked` |
| `spu_id` 和 `spu_code` 是否同一套主数据 | `VOC-SOURCE-001` 前 | 保持并列字段 |
| `voc_rate` 尺度 | `VOC-DQ-001` 前 | 等存量 BI Owner 确认 |
| 原文是否可在 BI 抽屉展示 | `VOC-BI-001` 前 | 默认只放索引，不放完整原文 |
