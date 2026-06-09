---
title: 专题②退款多维归因宽表规格草稿
doc_type: analysis
module: project-governance
topic: order-topic-return-attribution-wide-table-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②退款多维归因宽表规格草稿

## 1. 任务定位

本文件执行 `ORDER-DATA-005`，目标是固定 `dwt_return_attribution` 的退款多维归因宽表规格，支撑专题② `ORDER-T4`：退款多维归因 -> 订单和 VOC 穿透。

当前文件只定义宽表粒度、字段、公式、来源、DQ 门槛、交叉线3输入和 SCM 引用边界，不创建 SQL，不声明真实生产源表已经确认。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 目标宽表 | `dwt_return_attribution` |
| 主服务子课题 | `ORDER-T4` 退款多维归因 -> 订单和 VOC 穿透 |
| 次级服务子课题 | `ORDER-T1` 退款成本校验、`ORDER-T3` 部分退组合线索、`XL3` 退款 -> VOC 编排 |
| 推荐粒度 | 一行一退货行，主键 `(return_id, return_line_id)` |
| 备选主键 | `(return_id, sku_id)`，仅在业务确认同一退货单内同一 SKU 不会重复出现时使用 |
| 分区建议 | `return_dt`，并保留 `dt_month` 便于月度聚合 |
| 首选来源 | `fact_return` |
| 当前状态 | `Grey`，因为真实退款单、退款行、原因编码、部分退、VOC 关联键、Owner 和样本 DQ 尚未确认 |
| SQL 状态 | 不写正式 SQL；真实样本通过 `ORDER-DQ-001` 后再进入 `ORDER-SQL-004` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定 `ORDER-DATA-005` 宽表任务 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-RETURN-*`、`ORDER-XL3-*` 和组合指标公式 | 草稿指标字典 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 提供 T4 字段、库表建议和粒度 | 规划契约 |
| 主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 确认 `fact_return` 一行一退货行 | 规划契约 |
| 字段口径 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | 固定部分退、VOC 输入和退款原因字段 | 规划契约 |
| Phase2 汇总输出 | `main_project_lute/phase2_outputs/topic2/topic2_refund_attribution.csv` | 提供原因、国家、渠道聚合样例 | mock 产物 |
| Phase2 明细输出 | `main_project_lute/phase2_outputs/topic2/topic2_refund_attribution_detail.csv` | 提供退款明细和 XL3 输入前置字段 | mock 产物 |
| 交叉线3输入 | `ref/phase2_io/refund_theme_input_for_voc.csv` | 提供 `theme_suggested` 输出样例 | mock IO |
| Phase2 脚本 | `main_project_lute/data_example/scripts/experimental/run_phase2_topic2_pipeline.py` | 提供退款汇总、部分退比例、退款率计算方式 | mock 方法 |
| XL3 脚本 | `main_project_lute/data_example/scripts/experimental/run_phase2_crossline3_voc_agent.py` | 提供订单侧退款输入到 VOC Agent 的消费方式 | mock 方法 |
| SCM 逆向物流规格 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供逆向物流成本、补发、返仓和责任归因参考 | SCM 参考 |

## 4. 宽表边界

`dwt_return_attribution` 是退款事实与订单穿透宽表，不是 VOC 原始分析表，也不是 SCM 逆向物流成本表。

| 边界 | 本表负责 | 本表不负责 |
|---|---|---|
| 退款事实 | 退款单、退款行、原订单、SKU/SPU、退款金额、退款数量 | 财务总账退款入账确认 |
| 退款原因 | 原因编码、原因分类、部分退、重复投诉 | VOC 标签体系最终归类、用户原话抽取 |
| 订单穿透 | 国家、渠道、订单类型、订单 GMV、订单行商品信息 | 订单毛利完整归因、营销 ROI |
| 组合线索 | 部分退 SKU、组合订单标记、同单 SKU 关系 | 组合策略上线、推荐实验结论 |
| VOC 输入 | `voc_ticket_id`、`theme_suggested`、`refund_theme_input_for_voc` | VOC 原文证据、情绪、标签二三级结论 |
| SCM 引用 | 逆向物流、返仓、补发、质检、报废成本参考 | 用逆向物流成本替代退款原因和用户问题 |

## 5. 表级规格

| 项 | 规格 |
|---|---|
| 目标表 | `dwt_return_attribution` |
| 逻辑层级 | DWT / 主题宽表 |
| 业务目标 | 回答退款来自哪些国家、渠道、订单类型、SKU/SPU、原因和部分退模式，并为 VOC 交叉线提供输入 |
| 主键 | `(return_id, return_line_id)` |
| 推荐粒度 | 一行一退货行 |
| 分区键 | `return_dt` |
| 常用聚合键 | `dt_month`、`country_code`、`channel_id`、`order_type`、`return_reason_code`、`reason_category`、`spu_id`、`sku_id`、`is_partial_return` |
| 下游页面 | `ORDER-BI-004` 退款归因与售后闭环 |
| 下游 Agent | `ORDER-AGENT-004` 退款归因与 VOC 输入 |
| 下游交叉线 | `XL3` 退款 -> VOC 编排 |
| 输入依赖 | `fact_return`、`fact_order`、`fact_order_item`、`dim_return_reason`、`dim_spu` / `dim_sku`、可选 VOC 工单表 |
| 输出状态 | `data_quality_status` 必须随表输出 |

退货行粒度是必要选择：一单可能有多个 SKU、多个退货行、部分退和多原因。若合并成订单级，会丢失 SKU、颜色、尺码、原因和部分退结构。

## 6. 字段清单

### 6.1 主键与时间字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `return_id` | string | 是 | `fact_return` | 退款单或售后单主键 |
| `return_line_id` | string | 是 | `fact_return` / ETL 生成 | 退款行主键；没有时需生成并标记规则 |
| `order_id` | string | 是 | `fact_return` | 原订单 ID |
| `return_dt` | date | 是 | `fact_return` | 分区字段 |
| `order_date` | date | 否 | `fact_order` | 原订单日期 |
| `dt_month` | string | 是 | 派生 | `YYYY-MM` 月份，用于聚合 |
| `refund_status` | string | 否 | 售后系统 | 退款状态，如申请、通过、完成、拒绝 |
| `after_sales_id` | string | 否 | 售后系统 | 售后单 ID，若与 `return_id` 不同需保留 |

### 6.2 订单与渠道字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `country_code` | string | 是 | `fact_return` / `fact_order` | 国家 |
| `site` | string | 否 | `fact_order` | 站点 |
| `channel_id` | string | 是 | `fact_return` / `fact_order` | 渠道或平台 |
| `shop_id` | string | 否 | `fact_order` | 店铺 |
| `order_type` | string | 否 | `fact_order` | 订单类型 |
| `campaign_id` | string | 否 | `fact_order` | 活动 ID，仅作结构维度 |
| `order_gmv` | decimal | 否 | `fact_order.gmv` | 原订单 GMV |
| `order_item_qty` | decimal | 否 | `fact_order.item_qty` | 原订单件数 |
| `cost_refund_allocated` | decimal | 否 | `fact_order.cost_refund` | 订单级退款成本分摊；不等同于退款事实金额 |

### 6.3 商品与退款行字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `sku_id` | string | 是 | `fact_return` | 退款 SKU |
| `spu_id` | string | 是 | `fact_return` / `dim_sku` | 退款 SPU |
| `category_l3` | string | 否 | `dim_sku` / `fact_order_item` | 三级品类 |
| `category_l2` | string | 否 | `dim_sku` | 二级品类 |
| `variant_color` | string | 否 | `dim_sku` / `fact_return` | 颜色 |
| `variant_size` | string | 否 | `dim_sku` / `fact_return` | 尺码 |
| `order_line_item_id` | string | 否 | `fact_order_item` | 对应原订单行 ID |
| `order_line_qty` | decimal | 否 | `fact_order_item.item_qty` | 原订单行购买件数 |
| `order_line_gmv` | decimal | 否 | `fact_order_item.gmv_line` | 原订单行 GMV |
| `is_bundle_line` | boolean | 否 | `fact_order_item.is_bundle` | 原订单行是否组合 |
| `is_promo_line` | boolean | 否 | `fact_order_item.is_promo` | 原订单行是否促销 |

### 6.4 退款事实字段

| 字段 | 类型建议 | 必填 | 来源 | 指标映射 |
|---|---|---:|---|---|
| `return_qty` | decimal | 是 | `fact_return` | `ORDER-RETURN-002` |
| `return_amt` | decimal | 是 | `fact_return` | `ORDER-RETURN-001` |
| `return_reason_code` | string | 是 | `fact_return` | `ORDER-RETURN-006` |
| `return_reason_name` | string | 否 | `dim_return_reason` | 原因展示 |
| `reason_category` | string | 是 | `dim_return_reason` | `ORDER-RETURN-011` |
| `is_partial_return` | boolean | 是 | `fact_return` | `ORDER-RETURN-007` |
| `is_repeat_complaint` | boolean | 否 | `fact_return` / VOC 工单表 | `ORDER-RETURN-008` |
| `return_order_flag` | integer | 是 | 固定为 1，聚合时 `count(distinct order_id)` | `ORDER-RETURN-003` |
| `return_line_flag` | integer | 是 | 固定为 1 | 明细计数 |

### 6.5 派生分析字段

| 字段 | 类型建议 | 公式 | 用途 |
|---|---|---|---|
| `return_amt_pct_in_order` | decimal | `return_amt / nullif(order_gmv, 0)` | 单退货行占原订单 GMV |
| `return_qty_pct_in_order_line` | decimal | `return_qty / nullif(order_line_qty, 0)` | 判断是否部分退 |
| `is_full_line_return` | boolean | `return_qty >= order_line_qty`，阈值需确认 | 区分行级整退与部分退 |
| `partial_return_type` | string | `partial_sku` / `full_sku_partial_order` / `full_order` | 部分退结构 |
| `return_reason_priority` | string | 原因分类规则派生 | 原因 Pareto 和 Agent 优先级 |
| `combo_return_candidate` | boolean | `is_partial_return = true and is_bundle_line = true` | 部分退组合候选 |
| `sku_return_risk_flag` | boolean | SKU 退款率超阈值派生 | 商品风险线索 |
| `refund_rate_by_scope` | decimal | 聚合层 `sum(return_amt) / sum(order_gmv)`，需定义 scope | BI / mart 层计算 |
| `return_quality_status` | string | 规则派生 | Green/Amber/Red/Grey |

### 6.6 VOC 与 XL3 输出字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `voc_ticket_id` | string | 否 | `fact_return` / VOC 工单表 | VOC 关联键 |
| `has_voc` | boolean | 否 | 派生 | `voc_ticket_id is not null` 或工单表匹配 |
| `theme_suggested` | string | 否 | 订单 Agent 规则派生 | 给 VOC Agent 的建议主题，不是 VOC 最终标签 |
| `theme_suggested_rule_id` | string | 否 | 规则配置 | 退款原因到建议主题的映射规则 |
| `xl3_input_ready` | boolean | 是 | DQ 派生 | 是否可进入 `refund_theme_input_for_voc` |

`theme_suggested` 只能表达订单侧建议主题，例如 `部分退组合问题_原因SIZE`。VOC Agent 需要结合原始评论、工单或用户原话后，才能输出 VOC 结论。

### 6.7 证据与治理字段

| 字段 | 类型建议 | 必填 | 说明 |
|---|---|---:|---|
| `source_return_table` | string | 是 | 退款事实来源表名 |
| `source_order_table` | string | 否 | 订单事实来源表名 |
| `source_order_item_table` | string | 否 | 订单行事实来源表名 |
| `source_return_reason_table` | string | 否 | 退款原因维度来源表名 |
| `source_voc_table` | string | 否 | VOC 工单来源表名 |
| `dq_run_id` | string | 否 | DQ 执行批次 |
| `data_quality_status` | string | 是 | `Grey` / `Amber` / `Green` / `Red` |
| `return_gap_flags` | string | 否 | 如 `missing_reason_code`、`unmatched_order`、`missing_voc_key` |
| `created_at_system` | datetime | 否 | 宽表生成时间 |
| `updated_at_system` | datetime | 否 | 宽表更新时间 |

## 7. 输入来源与 join 规则

| 输入资产 | 粒度 | 连接键 | 使用方式 | 风险 |
|---|---|---|---|---|
| `fact_return` | 一行一退货行 | `(return_id, return_line_id)` | 主表，提供退款金额、数量、原因、部分退、VOC 关联键 | 若退货行缺失，会丢 SKU 和部分退结构 |
| `fact_order` | 一行一订单 | `order_id` | 补原订单日期、国家、渠道、订单类型、GMV 和退款成本分摊 | 订单金额 join 到退货行后会重复，聚合需去重 |
| `fact_order_item` | 一行一订单行 | `order_id` + `sku_id`，优先再加 `line_item_id` | 补原订单行、SKU/SPU、组合和促销标记 | 同单同 SKU 多行会误匹配，需 `line_item_id` |
| `dim_return_reason` | 一行一退款原因 | `return_reason_code` | 补原因名称、原因分类、责任初判 | 原因码缺失会破坏 Pareto |
| `dim_spu` / `dim_sku` | 一行一商品 | `spu_id` / `sku_id` | 补品类、颜色、尺码 | 商品维度缺失影响 SKU 风险下钻 |
| VOC 工单表 | 一行一工单或事件 | `voc_ticket_id` / `order_id` / `return_id` | 只补关联键和是否有 VOC | 多工单直接 join 会放大退款行 |
| `dwt_order_margin_attribution` | 一行一订单行 | `order_id` + `sku_id` / `line_item_id` | 可选补组合、促销和毛利结构线索 | 只能作订单结构参考，不替代退款事实 |
| SCM `dwt_reverse_logistics` | 一个完整售后周期 | 退货单、售后单、SKU、原因 | 逆向成本、补发、返仓、质检参考 | 不替代退款原因和 VOC 关联 |

join 顺序：以 `fact_return` 为主表，先关联 `fact_order`，再关联 `dim_return_reason`、商品维度和可选订单行。VOC 工单必须先聚合到退货行或订单级后再关联，禁止一对多直接放大退款事实。

## 8. 计算顺序

| 顺序 | 步骤 | 输出 | 门禁 |
|---:|---|---|---|
| 1 | 读取 `fact_return`，确认退款行主键唯一 | 退款行主表 | `(return_id, return_line_id)` 不唯一则停止 |
| 2 | 标准化退款金额、数量、原因编码和部分退字段 | 标准化退款事实 | P0 字段无法解析则进入 `Red` |
| 3 | 关联 `fact_order` | 订单增强退款表 | 退款行找不到原订单需标记 |
| 4 | 关联 `dim_return_reason` | 原因增强退款表 | 原因码无法映射需标记 |
| 5 | 关联 `fact_order_item` 和商品维度 | SKU/SPU 增强退款表 | 同单同 SKU 多行时必须用 `line_item_id` 或进入缺口 |
| 6 | 计算退款金额率、数量比例和部分退类型 | 退款派生字段 | `order_gmv = 0` 或 `order_line_qty = 0` 不强算 |
| 7 | 聚合或关联 VOC 工单 | `has_voc`、`voc_ticket_id` | 多工单需先聚合 |
| 8 | 派生 `theme_suggested` 和 `xl3_input_ready` | `refund_theme_input_for_voc` 输入字段 | 规则未确认时只能输出草稿建议 |
| 9 | 可选关联 SCM 逆向物流字段 | 逆向成本和返仓线索 | 不写入退款原因结论 |
| 10 | 写入质量状态和来源字段 | `data_quality_status` | 没有真实样本时固定为 `Grey` |

## 9. 指标映射

| 指标 code | 指标名称 | 宽表字段 | 聚合方式 |
|---|---|---|---|
| `ORDER-RETURN-001` | 退款金额 | `return_amt` | `sum` |
| `ORDER-RETURN-002` | 退款数量 | `return_qty` | `sum` |
| `ORDER-RETURN-003` | 退款订单数 | `order_id` | `count(distinct order_id where return exists)` |
| `ORDER-RETURN-004` | 订单退款率 | `order_id`、订单全集 | `退款订单数 / count(distinct fact_order.order_id)` |
| `ORDER-RETURN-005` | 退款金额率 | `return_amt`、`order_gmv` | `sum(return_amt) / sum(distinct order_gmv by order_id)` |
| `ORDER-RETURN-006` | 退款原因金额占比 | `return_reason_code`、`return_amt` | `sum(return_amt by reason) / sum(return_amt)` |
| `ORDER-RETURN-007` | 部分退比例 | `is_partial_return`、`return_id` | `count(distinct partial return_id) / count(distinct return_id)` |
| `ORDER-RETURN-008` | 重复投诉比例 | `is_repeat_complaint`、`return_id` | `count(distinct repeat complaint return_id) / count(distinct return_id)` |
| `ORDER-RETURN-009` | VOC 关联率 | `voc_ticket_id`、`return_id` | `count(distinct return_id where voc_ticket_id is not null) / count(distinct return_id)` |
| `ORDER-RETURN-010` | 部分退组合覆盖率 | `is_partial_return`、`is_bundle_line`、`order_id` | `count(distinct partial return order_id with bundle) / count(distinct partial return order_id)` |
| `ORDER-RETURN-011` | 退款原因分类占比 | `reason_category`、`return_amt` | `sum(return_amt by reason_category) / sum(return_amt)` |
| `ORDER-XL3-001` | 售后退款主题输入行数 | `xl3_input_ready` | `count(rows where xl3_input_ready)` |
| `ORDER-XL3-002` | 建议主题覆盖率 | `theme_suggested` | `count(theme_suggested not null) / count(*)` |

`cost_refund` 与 `return_amt` 必须并存：`cost_refund` 是订单成本分摊字段，`return_amt` 是退款事实金额。两者不能互相替代。

## 10. `refund_theme_input_for_voc` 输出契约

`dwt_return_attribution` 应能派生交叉线3输入表，但该输入表不是 VOC 结论表。

| 字段 | 来源 | 说明 |
|---|---|---|
| `order_id` | `dwt_return_attribution.order_id` | 原订单 |
| `return_id` | `dwt_return_attribution.return_id` | 退款单 |
| `sku_id` | `dwt_return_attribution.sku_id` | 退款 SKU |
| `spu_id` | `dwt_return_attribution.spu_id` | 退款 SPU |
| `country_code` | `dwt_return_attribution.country_code` | 国家 |
| `channel_id` | `dwt_return_attribution.channel_id` | 渠道 |
| `return_reason_code` | `dwt_return_attribution.return_reason_code` | 退款原因 |
| `is_partial_return` | `dwt_return_attribution.is_partial_return` | 是否部分退 |
| `theme_suggested` | 规则派生 | 建议主题，如 `部分退组合问题_原因SIZE` |

生成规则建议：

1. `is_partial_return = true` 时，优先生成 `部分退组合问题_原因{reason}`。
2. `is_partial_return = false` 时，生成 `整单退款_原因{reason}`。
3. `return_reason_code` 为空时，不生成 `theme_suggested`，进入 DQ 缺口。
4. `voc_ticket_id` 为空不阻断输入表，但不能输出 VOC 结论。

## 11. DQ 检查项

| check_id | 检查项 | 规则 | 阻断条件 |
|---|---|---|---|
| `ORDER-DQ-RETURN-SCHEMA-001` | 字段存在性 | P0 字段必须存在：`return_id`、`return_line_id`、`order_id`、`return_dt`、`sku_id`、`return_qty`、`return_amt`、`return_reason_code`、`is_partial_return` | 缺任一 P0 字段 |
| `ORDER-DQ-RETURN-PK-001` | 主键唯一性 | `(return_id, return_line_id)` 在宽表中唯一 | 重复退款行且无业务解释 |
| `ORDER-DQ-RETURN-TYPE-001` | 字段类型 | 金额、数量为数值；日期为日期；布尔字段可解析 | 类型无法解析 |
| `ORDER-DQ-RETURN-ORDER-JOIN-001` | 原订单匹配 | 每个退款行应匹配一个原订单 | 大量退款行无法匹配订单 |
| `ORDER-DQ-RETURN-ITEM-JOIN-001` | 原订单行匹配 | SKU/SPU 应能匹配原订单行或商品维度 | 部分退分析所需商品字段缺失 |
| `ORDER-DQ-RETURN-REASON-001` | 原因码映射 | `return_reason_code` 可映射 `dim_return_reason` | 大量原因码无法分类 |
| `ORDER-DQ-RETURN-AMT-001` | 金额合法性 | `return_amt >= 0`，负值需业务解释 | 大量负值或异常金额 |
| `ORDER-DQ-RETURN-QTY-001` | 数量合法性 | `return_qty > 0` 或冲销场景明确 | 大量非正数量 |
| `ORDER-DQ-RETURN-PARTIAL-001` | 部分退一致性 | `is_partial_return` 与 `return_qty / order_line_qty` 应可解释 | 部分退标记与数量逻辑冲突 |
| `ORDER-DQ-RETURN-VOC-001` | VOC 关联 | `voc_ticket_id` 可为空，但有值时必须可映射工单 | 工单 join 放大退款行 |
| `ORDER-DQ-RETURN-XL3-001` | XL3 输入 | `theme_suggested` 生成需有原因码和规则 ID | 无规则还输出建议主题 |
| `ORDER-DQ-RETURN-SCM-001` | SCM 边界 | 逆向物流只做参考 | 用逆向成本替代退款原因 |

## 12. 数据状态

| 状态 | 判定 | 本表允许用途 | 禁止用途 |
|---|---|---|---|
| Grey | 只有规格、mock 或样例，无真实源表和样本 | 字段缺口、源表确认、宽表规格讨论 | 退款根因定责、VOC 结论、正式 SQL |
| Amber | 有真实样本，P0 DQ 通过但仍有原因码、部分退或 VOC 关联缺口 | 样本验证、非生产看板、待验证假设 | 管理层强结论 |
| Green | 真实源表、样本、Owner、权限、DQ、原因码和 VOC 关联规则均签收 | 看板、Agent、XL3 输入、SQL 前置 | 无证据泛化 |
| Red | P0 DQ 失败且无业务解释 | 停止进入下游 | 看板、Agent、SQL、XL3 |

当前本表状态为 `Grey`。

## 13. SCM 与 VOC 边界

| 相邻资产 | 可引用内容 | 在本表中的角色 | 禁止事项 |
|---|---|---|---|
| SCM `dwt_reverse_logistics` | 退货运费、补发、返仓、质检、报废、责任归因 | 逆向物流深挖参考 | 不替代 `return_reason_code` 和 `reason_category` |
| `dwt_order_margin_attribution` | 订单行、SPU/SKU、组合、促销、毛利结构 | 部分退组合和商品结构线索 | 不把毛利低解释为退款根因 |
| `dwt_order_cost_quality` | `cost_refund`、成本分摊、订单 GMV | 退款成本校验 | 不把 `cost_refund` 当退款事实金额 |
| VOC 专题 | 原始评论、工单、标签、用户原话 | 下游消费方和证据补强方 | ORDER 不输出 VOC 最终标签和原话结论 |
| CHANNEL 专题 | 渠道健康、国家渠道风险 | 可消费退款率和原因结构 | ORDER 不输出渠道策略结论 |

## 14. 下游消费

| 下游 | 消费字段 | 输出 |
|---|---|---|
| `ORDER-BI-004` | `return_amt`、`return_qty`、`return_reason_code`、`reason_category`、`is_partial_return`、`country_code`、`channel_id`、`sku_id`、`spu_id` | 退款原因 Pareto、部分退矩阵、SKU/SPU 下钻 |
| `ORDER-AGENT-004` | 退款事实、原因、部分退、重复投诉、VOC 关联、DQ 状态 | 退款归因解释、组合问题候选、VOC 输入建议 |
| `XL3-IO-001` | `refund_theme_input_for_voc` 字段 | 售后/退款主题输入表 |
| `XL3-AGENT-001` | `theme_suggested`、原因、SKU、国家渠道 | VOC Agent 消费的订单侧线索 |
| `ORDER-DATA-002` | `return_amt`、`cost_refund_allocated` | 退款成本校验，不替代成本分摊 |
| `ORDER-DATA-004` | `sku_id`、`spu_id`、`is_partial_return`、`is_bundle_line` | 部分退组合分析 |

## 15. 当前不能做的事

| 事项 | 原因 | 后续进入条件 |
|---|---|---|
| 不创建正式 SQL | 缺真实表名、字段类型、权限和样本 DQ | `ORDER-DQ-001` 通过后进入 `ORDER-SQL-004` |
| 不输出退款根因责任结论 | 只有契约和 mock，没有真实原因码与业务复核 | 真实样本 + 原因码签收 + Owner 复核 |
| 不输出 VOC 原话和标签结论 | ORDER 只有退款侧线索 | VOC 专题接入原始评论、工单和标签体系 |
| 不把部分退等同组合问题 | 部分退可能来自尺码、颜色、质量、物流等多原因 | 组合、订单行、VOC、退款原因共同验证 |
| 不把逆向物流成本当退款原因 | SCM 逆向物流是成本和闭环视角 | SCM 专题签收后只做参考 |

## 16. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 退款行主键 | `(return_id, return_line_id)` | 源系统是否稳定提供 `return_line_id` |
| 备选主键 | `(return_id, sku_id)` | 同一退货单内同一 SKU 是否可能多行 |
| 退款日期 | `return_dt` | 取申请、审核、完成还是入账日期 |
| 退款金额字段名 | `return_amt` | mock 中 `refund_amt` 是否需统一映射 |
| 部分退判断 | 源字段优先，数量规则校验 | `is_partial_return` 是否可靠 |
| 原因分类 | `dim_return_reason.reason_category` | 现有原因码是否覆盖产品、物流、主观、描述不符等 |
| VOC 关联键 | 优先 `voc_ticket_id`，其次 `order_id` / `return_id` | 工单系统是否保留退货单号 |
| `theme_suggested` 规则 | 原因码 + 部分退状态生成 | 是否需要映射到 VOC 标签二三级 |
| SCM 逆向字段 | 暂不写入 ORDER P0 | 哪些字段后续作为参考进入 ORDER 页面 |

## 17. 下一步任务

下一步执行 `ORDER-BI-001`：订单经营结果与成本质量总览 PRD。

建议落盘文件：

`drafts/docs/order-bi-cost-quality-overview-prd-draft-20260603.md`

进入条件：

1. 复核 `dwt_order_cost_quality` 宽表规格。
2. 明确页面只消费 `Grey` 状态下的规格与 mock，不输出真实业务结论。
3. 固定页面模块、图表、筛选器、指标解释和 Agent 入口。
4. 继续保持 SQL 前置门禁，不创建正式 SQL。
