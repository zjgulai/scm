---
title: 专题②订单价格与毛利归因宽表规格草稿
doc_type: analysis
module: project-governance
topic: order-topic-margin-attribution-wide-table-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②订单价格与毛利归因宽表规格草稿

## 1. 任务定位

本文件执行 `ORDER-DATA-004`，目标是固定 `dwt_order_margin_attribution` 的订单价格与毛利归因宽表规格，支撑专题② `ORDER-T3`：订单类型与订单价结构 -> 毛利额归因。

当前文件只定义宽表粒度、字段、公式、来源、DQ 门槛和跨专题边界，不创建 SQL，不声明真实生产源表已经确认。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 目标宽表 | `dwt_order_margin_attribution` |
| 主服务子课题 | `ORDER-T3` 订单类型与订单价结构 -> 毛利额归因 |
| 次级服务子课题 | `ORDER-T1` 成本质量解释、`ORDER-T4` 部分退组合线索 |
| 推荐粒度 | 一行一订单行，主键 `(order_id, line_item_id)` |
| 备选主键 | `(order_id, sku_id)`，仅在业务确认同一订单内同一 SKU 不会重复出现时使用 |
| 分区建议 | `order_date`，并保留 `dt_month` 便于月度聚合 |
| 首选来源 | `fact_order` + `fact_order_item` |
| 当前状态 | `Grey`，因为真实订单行毛利、促销/组合标记、活动维度、基期口径和样本 DQ 尚未确认 |
| SQL 状态 | 不写正式 SQL；真实样本通过 `ORDER-DQ-001` 后再进入 `ORDER-SQL-003` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定 `ORDER-DATA-004` 宽表任务 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-MARGIN-*` 和 `ORDER-COMBO-*` 指标公式 | 草稿指标字典 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 提供 T3 字段、库表建议和粒度 | 规划契约 |
| 主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 确认 `fact_order` 与 `fact_order_item` 粒度 | 规划契约 |
| 字段口径 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | 固定订单与订单行字段口径 | 规划契约 |
| Phase2 输出 | `main_project_lute/phase2_outputs/topic2/topic2_margin_attribution.csv` | 提供订单类型×平台、品类×平台聚合样例 | mock 产物 |
| Phase2 脚本 | `main_project_lute/data_example/scripts/experimental/run_phase2_topic2_pipeline.py` | 提供毛利率、品单价、订单类型聚合方式 | mock 方法 |
| 专题04脚本 | `main_project_lute/data_example/scripts/core/run_专题04_四因素归因.py` | 提供 `客品数 × 品单价 × 订单数 × 前台毛利率` 归因方法 | 样例方法 |
| 专题04公式说明 | `main_project_lute/data_example/专题产物/专题04/文档/专题四_Sheet4_聚合公式说明.md` | 提供客品数和毛利率聚合贡献公式 | 样例方法 |

## 4. 宽表边界

`dwt_order_margin_attribution` 是订单行级价格与毛利归因宽表，不是营销 ROI 表，也不是财务总账。

| 边界 | 本表负责 | 本表不负责 |
|---|---|---|
| 订单价结构 | 订单类型、活动 ID、促销标记、组合标记、品单价、客件数、客品数 | 广告曝光、触达、投放归因销售额 |
| 商品结构 | SPU、SKU、品类、订单行 GMV、订单行毛利 | 产品生命周期、完整 SKU 主数据治理 |
| 毛利归因 | 按订单类型、活动、SPU、品类解释毛利额与毛利率变化 | 财务总账确认、税费、完整会计利润 |
| 四因素方法 | 客品数、品单价、订单数、前台毛利率贡献拆解 | 自动证明某个促销或组合造成毛利变化 |
| 组合线索 | `is_bundle`、组合订单占比、候选组合下钻 | 购物篮规则最终上线、推荐策略实验结论 |
| 成本解释 | 前台成本、后台成本作为毛利解释字段 | SCM 成本专题、仓网重规划、供应链 Owner 动作 |
| 营销边界 | `campaign_id` 仅作为订单结构维度 | 不替代专题④广告、促销、会员费 ROI 归因 |

## 5. 表级规格

| 项 | 规格 |
|---|---|
| 目标表 | `dwt_order_margin_attribution` |
| 逻辑层级 | DWT / 主题宽表 |
| 业务目标 | 回答订单类型、促销、组合、品单价、客品数、SPU 和活动如何影响毛利额与毛利率 |
| 主键 | `(order_id, line_item_id)` |
| 推荐粒度 | 一行一订单行 |
| 分区键 | `order_date` |
| 常用聚合键 | `dt_month`、`country_code`、`channel_id`、`shop_id`、`order_type`、`campaign_id`、`spu_id`、`sku_id`、`category_l3` |
| 下游页面 | `ORDER-BI-003` 订单价结构与毛利归因 |
| 下游 Agent | `ORDER-AGENT-003` 毛利归因与组合建议 |
| 输入依赖 | `fact_order`、`fact_order_item`、`dim_order_type`、`dim_campaign`、`dim_spu` / `dim_sku` |
| 输出状态 | `data_quality_status` 必须随表输出 |

订单行级是必要选择：如果使用订单级，SPU/SKU、组合和品类下钻会丢失；如果使用聚合级，无法支撑后续 Agent 对异常订单、异常商品组合和部分退线索的回溯。

## 6. 字段清单

### 6.1 主键与时间字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `order_id` | string | 是 | `fact_order` / `fact_order_item` | 订单主键 |
| `line_item_id` | string | 是 | `fact_order_item` | 订单行主键；没有时必须由 ETL 生成并标记规则 |
| `order_date` | date | 是 | `fact_order` | 分区字段 |
| `dt_month` | string | 是 | 派生 | `YYYY-MM` 月份，用于聚合 |
| `analysis_period` | string | 否 | 参数或派生 | 当前分析期，如 `YTD2026P1` |
| `baseline_period` | string | 否 | 参数或派生 | 基期，如 `YTD2025P2` |

### 6.2 订单维度字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `country_code` | string | 是 | `fact_order` | 国家 |
| `site` | string | 否 | `fact_order` | 站点 |
| `channel_id` | string | 是 | `fact_order` | 渠道或平台 |
| `shop_id` | string | 否 | `fact_order` | 店铺 |
| `order_type` | string | 是 | `fact_order` / `dim_order_type` | 订单类型 |
| `order_type_name` | string | 否 | `dim_order_type` | 订单类型名称 |
| `campaign_id` | string | 否 | `fact_order` / `dim_campaign` | 活动 ID，仅作为结构维度 |
| `campaign_type` | string | 否 | `dim_campaign` | 活动类型，用于分组，不代表营销因果 |
| `is_promo_order` | boolean | 否 | `fact_order` / `dim_order_type` | 订单级促销标记 |
| `is_bundle_order` | boolean | 否 | 订单行聚合派生 | 任一订单行 `is_bundle = true` 则为 true |

### 6.3 商品与订单行字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `spu_id` | string | 是 | `fact_order_item` | SPU |
| `sku_id` | string | 是 | `fact_order_item` | SKU |
| `category_l3` | string | 否 | `fact_order_item` / `dim_sku` | 三级品类 |
| `category_l2` | string | 否 | `dim_sku` | 二级品类 |
| `variant_color` | string | 否 | `dim_sku` | 颜色，用于部分退和组合线索 |
| `variant_size` | string | 否 | `dim_sku` | 尺码，用于部分退和组合线索 |
| `unit_price` | decimal | 是 | `fact_order_item` | 订单行单价 |
| `item_qty_line` | decimal | 是 | `fact_order_item.item_qty` | 订单行件数 |
| `gmv_line` | decimal | 是 | `fact_order_item` | 订单行销售额 |
| `gross_margin_amt_line` | decimal | 是 | `fact_order_item` / 分摊派生 | 订单行毛利额 |
| `is_promo_line` | boolean | 否 | `fact_order_item.is_promo` | 订单行促销标记 |
| `is_bundle_line` | boolean | 否 | `fact_order_item.is_bundle` | 订单行组合标记 |

### 6.4 订单级汇总字段

订单级字段会在订单行宽表中重复出现。聚合时必须使用 `count(distinct order_id)`、订单级去重或分摊字段，禁止直接对重复订单级字段求和。

| 字段 | 类型建议 | 必填 | 来源 | 聚合限制 |
|---|---|---:|---|---|
| `order_gmv_total` | decimal | 是 | `fact_order.gmv` | 订单级字段，禁止在订单行上直接 sum |
| `order_gross_margin_amt_total` | decimal | 是 | `fact_order.gross_margin_amt` | 订单级字段，禁止在订单行上直接 sum |
| `order_item_qty_total` | decimal | 是 | `fact_order.item_qty` | 订单级字段，禁止在订单行上直接 sum |
| `order_sku_qty_total` | decimal | 否 | `fact_order.sku_qty` | 订单级字段，禁止在订单行上直接 sum |
| `cost_front_total` | decimal | 否 | `fact_order` / `dwt_order_cost_quality` | 订单级成本，直接 sum 会重复 |
| `cost_back_total` | decimal | 否 | `fact_order` / `dwt_order_cost_quality` | 订单级成本，直接 sum 会重复 |
| `order_line_count` | integer | 是 | 派生 | 每单订单行数，用于 DQ 和分摊 |
| `line_gmv_share_in_order` | decimal | 是 | 派生 | `gmv_line / sum(gmv_line by order_id)` |
| `cost_front_alloc_line` | decimal | 否 | 派生 | `cost_front_total * line_gmv_share_in_order`，需标记分摊规则 |
| `cost_back_alloc_line` | decimal | 否 | 派生 | `cost_back_total * line_gmv_share_in_order`，需标记分摊规则 |

### 6.5 派生分析字段

| 字段 | 类型建议 | 公式 | 指标映射 |
|---|---|---|---|
| `order_cnt_flag` | integer | 固定为 1，但聚合时必须 `count(distinct order_id)` | `ORDER-MARGIN-003` 辅助 |
| `line_unit_price_calc` | decimal | `gmv_line / nullif(item_qty_line, 0)` | `ORDER-MARGIN-004` |
| `gross_margin_pct_line` | decimal | `gross_margin_amt_line / nullif(gmv_line, 0)` | `ORDER-MARGIN-009` |
| `gross_margin_pct_order` | decimal | `order_gross_margin_amt_total / nullif(order_gmv_total, 0)` | `ORDER-MARGIN-002` |
| `front_margin_rate_line` | decimal | `(gmv_line - cost_front_alloc_line) / nullif(gmv_line, 0)`，成本分摊未确认前禁用 | 四因素方法 |
| `item_per_order_agg_ready` | decimal | 聚合层 `sum(item_qty_line) / count(distinct order_id)` | `ORDER-MARGIN-010` |
| `sku_per_order_agg_ready` | decimal | 聚合层 `count(distinct sku_id) / count(distinct order_id)` | 订单结构辅助 |
| `is_margin_allocated` | boolean | 订单行毛利额是否由订单级毛利分摊得到 | DQ 辅助 |
| `margin_allocation_rule_id` | string | 分摊规则 ID | DQ 辅助 |
| `price_band` | string | 价格带配置派生 | 订单价结构 |
| `margin_quality_status` | string | 规则派生 | Green/Amber/Red/Grey |

### 6.6 证据与治理字段

| 字段 | 类型建议 | 必填 | 说明 |
|---|---|---:|---|
| `source_order_table` | string | 是 | 订单事实来源表名 |
| `source_order_item_table` | string | 是 | 订单行事实来源表名 |
| `source_campaign_table` | string | 否 | 活动维度来源表名 |
| `dq_run_id` | string | 否 | DQ 执行批次 |
| `data_quality_status` | string | 是 | `Grey` / `Amber` / `Green` / `Red` |
| `margin_gap_flags` | string | 否 | 如 `missing_line_margin`、`campaign_unmapped` |
| `created_at_system` | datetime | 否 | 宽表生成时间 |
| `updated_at_system` | datetime | 否 | 宽表更新时间 |

## 7. 输入来源与 join 规则

| 输入资产 | 粒度 | 连接键 | 使用方式 | 风险 |
|---|---|---|---|---|
| `fact_order` | 一行一订单 | `order_id` | 补订单日期、国家、渠道、订单类型、活动 ID、订单级 GMV 和毛利 | join 到订单行后订单级金额会重复 |
| `fact_order_item` | 一行一订单行 | `(order_id, line_item_id)` | 主表，提供 SPU/SKU、数量、单价、订单行 GMV、订单行毛利、促销和组合标记 | 若缺 `line_item_id`，同 SKU 多行会合并错误 |
| `dim_order_type` | 一行一订单类型 | `order_type` | 补订单类型名称、促销或 B2B 标记 | 订单类型枚举未统一会导致分组漂移 |
| `dim_campaign` | 一行一活动 | `campaign_id` | 补活动名称、活动类型、活动周期 | 只做分组，不证明活动因果 |
| `dim_spu` / `dim_sku` | 一行一商品 | `spu_id` / `sku_id` | 补品类、颜色、尺码等商品维度 | 商品主数据缺失会影响 SPU 下钻 |
| `dwt_order_cost_quality` | 一行一订单 | `order_id` | 可选补成本质量字段 | 只能作为成本解释，不回写财务毛利 |

join 顺序：以 `fact_order_item` 为主表，先关联 `fact_order`，再关联订单类型、活动和商品维度。任何一对多维表都必须先去重到连接键唯一，禁止让维表 join 放大订单行。

## 8. 计算顺序

| 顺序 | 步骤 | 输出 | 门禁 |
|---:|---|---|---|
| 1 | 读取 `fact_order_item`，确认订单行主键唯一 | 订单行主表 | `(order_id, line_item_id)` 不唯一则停止 |
| 2 | 读取 `fact_order`，确认 `order_id` 唯一 | 订单主表 | `order_id` 不唯一则停止 |
| 3 | 关联订单与订单行 | 订单行宽表底座 | 订单行找不到订单需进入 DQ |
| 4 | 校验订单行汇总与订单级金额 | `line_sum_recon_status` | `sum(gmv_line by order_id)` 与 `order_gmv_total` 差异不可解释则停止 |
| 5 | 补订单类型、活动和商品维度 | 维度增强宽表 | 关键维度未匹配需标记 |
| 6 | 计算行级单价、行级毛利率、订单内 GMV 权重 | `line_unit_price_calc`、`gross_margin_pct_line`、`line_gmv_share_in_order` | `item_qty_line = 0` 不强算单价 |
| 7 | 如缺订单行毛利，按规则分摊订单级毛利 | `gross_margin_amt_line`、`is_margin_allocated` | 分摊规则未确认时不能输出强结论 |
| 8 | 可选分摊订单级成本 | `cost_front_alloc_line`、`cost_back_alloc_line` | 成本只作解释，不改写毛利事实 |
| 9 | 聚合生成四因素归因输入 | 客品数、品单价、订单数、前台毛利率 | 基期和分析期未确认则不输出贡献额 |
| 10 | 写入质量状态和来源字段 | `data_quality_status` | 没有真实样本时固定为 `Grey` |

## 9. 四因素归因方法

四因素归因方法来自专题04样例，适合进入 `ORDER-BI-003` 和 `ORDER-AGENT-003`，但不能在无基期签收时作为正式业务结论。

| 因素 | 聚合公式 | 贡献额近似公式 |
|---|---|---|
| 客品数 `C` | `sum(item_qty_line) / count(distinct order_id)` | `base_unit_price * base_order_cnt * base_front_margin_rate * (current_item_per_order - base_item_per_order)` |
| 品单价 `P` | `sum(gmv_line) / sum(item_qty_line)` | `base_item_per_order * base_order_cnt * base_front_margin_rate * (current_unit_price - base_unit_price)` |
| 订单数 `N` | `count(distinct order_id)` | `base_item_per_order * base_unit_price * base_front_margin_rate * (current_order_cnt - base_order_cnt)` |
| 前台毛利率 `G` | `sum(gross_margin_amt_line) / sum(gmv_line)` | `base_item_per_order * base_unit_price * base_order_cnt * (current_front_margin_rate - base_front_margin_rate)` |

毛利额关系：`margin_amt = C * P * N * G`。

贡献占比：`factor_contribution_amt / nullif(total_margin_delta_amt, 0)`。

当前建议只把上述公式作为方法层写入，不在 DWT 表内固化某个基期结果。基期、分析期、国家、渠道、订单类型、SPU 或活动维度应由 BI / mart 层参数化生成。

## 10. 指标映射

| 指标 code | 指标名称 | 宽表字段 | 聚合方式 |
|---|---|---|---|
| `ORDER-MARGIN-001` | 毛利额 | `gross_margin_amt_line` 或去重后的 `order_gross_margin_amt_total` | `sum` |
| `ORDER-MARGIN-002` | 毛利率 | `gross_margin_amt_line`、`gmv_line` | `sum(gross_margin_amt_line) / sum(gmv_line)` |
| `ORDER-MARGIN-003` | 订单均价 | `order_gmv_total`、`order_id` | `sum(distinct order_gmv_total by order_id) / count(distinct order_id)` |
| `ORDER-MARGIN-004` | 品单价 | `gmv_line`、`item_qty_line` | `sum(gmv_line) / sum(item_qty_line)` |
| `ORDER-MARGIN-005` | 订单类型销售占比 | `order_type`、`gmv_line` | `sum(gmv_line by order_type) / sum(gmv_line)` |
| `ORDER-MARGIN-006` | 促销订单占比 | `is_promo_order`、`order_id` | `count(distinct promo order_id) / count(distinct order_id)` |
| `ORDER-MARGIN-007` | 组合订单占比 | `is_bundle_order`、`order_id` | `count(distinct bundle order_id) / count(distinct order_id)` |
| `ORDER-MARGIN-008` | SPU 毛利额 | `spu_id`、`gross_margin_amt_line` | `sum` |
| `ORDER-MARGIN-009` | SPU 毛利率 | `spu_id`、`gross_margin_amt_line`、`gmv_line` | `sum(gross_margin_amt_line) / sum(gmv_line)` |
| `ORDER-MARGIN-010` | 客件数贡献额 | `item_qty_line`、`order_id`、四因素基期字段 | mart 层计算 |
| `ORDER-MARGIN-011` | 品单价贡献额 | `gmv_line`、`item_qty_line`、四因素基期字段 | mart 层计算 |
| `ORDER-MARGIN-012` | 订单数贡献额 | `order_id`、四因素基期字段 | mart 层计算 |
| `ORDER-MARGIN-013` | 前台毛利率贡献额 | `gross_margin_amt_line`、`gmv_line`、四因素基期字段 | mart 层计算 |
| `ORDER-MARGIN-014` | 归因贡献占比 | 四因素贡献额与总毛利额差异 | mart 层计算 |
| `ORDER-COMBO-001` 到 `ORDER-COMBO-005` | 组合指标 | `order_id`、`spu_id`、`sku_id`、`is_bundle_line` | 组合分析结果表计算 |

`ORDER-COST-022` 和 `ORDER-COST-023` 仍保留为样例方法。真实基期、成本口径和财务口径未确认前，不升格为正式 ORDER 毛利归因指标。

## 11. DQ 检查项

| check_id | 检查项 | 规则 | 阻断条件 |
|---|---|---|---|
| `ORDER-DQ-MARGIN-SCHEMA-001` | 字段存在性 | P0 字段必须存在：`order_id`、`line_item_id`、`order_date`、`country_code`、`channel_id`、`order_type`、`sku_id`、`spu_id`、`gmv_line`、`item_qty_line` | 缺任一 P0 字段 |
| `ORDER-DQ-MARGIN-PK-001` | 主键唯一性 | `(order_id, line_item_id)` 在宽表中唯一 | 重复订单行且无业务解释 |
| `ORDER-DQ-MARGIN-ORDER-PK-001` | 订单主键唯一性 | `fact_order.order_id` 唯一 | 订单主表重复导致订单行放大 |
| `ORDER-DQ-MARGIN-JOIN-001` | 订单行到订单 join | 每个订单行必须匹配一个订单 | 大量订单行无法匹配订单 |
| `ORDER-DQ-MARGIN-LINE-RECON-001` | 行级 GMV 汇总 | `sum(gmv_line by order_id)` 与 `fact_order.gmv` 差异在阈值内 | 差异不可解释 |
| `ORDER-DQ-MARGIN-QTY-001` | 数量合法性 | `item_qty_line > 0` 或有退货/冲销解释 | 大量非正数量且无解释 |
| `ORDER-DQ-MARGIN-RATE-001` | 毛利率合法性 | 毛利率允许负值，但需标记；异常极值需解释 | 极值来源不可解释 |
| `ORDER-DQ-MARGIN-ALLOC-001` | 毛利分摊规则 | 缺订单行毛利时必须有 `margin_allocation_rule_id` | 分摊规则缺失还输出行级毛利结论 |
| `ORDER-DQ-MARGIN-CAMPAIGN-001` | 活动维表映射 | `campaign_id` 可映射活动维度或为空且有解释 | 活动维度大量缺失但被用于归因 |
| `ORDER-DQ-MARGIN-PROMO-001` | 促销标记一致性 | 订单级和行级促销标记差异需解释 | 标记冲突影响促销归因 |
| `ORDER-DQ-MARGIN-BUNDLE-001` | 组合标记一致性 | 订单级组合标记由订单行派生或源系统确认 | 组合定义缺失还输出组合策略 |
| `ORDER-DQ-MARGIN-CAUSAL-001` | 因果边界 | 活动、促销、组合只作结构归因，不声明营销因果 | 把结构相关性写成 ROI 因果 |

## 12. 数据状态

| 状态 | 判定 | 本表允许用途 | 禁止用途 |
|---|---|---|---|
| Grey | 只有规格、mock 或样例，无真实源表和样本 | 字段缺口、源表确认、宽表规格讨论 | 毛利原因定责、组合上线动作、正式 SQL |
| Amber | 有真实样本，P0 DQ 通过但仍有毛利分摊、活动标记或基期缺口 | 样本验证、非生产看板、待验证假设 | 管理层强结论 |
| Green | 真实源表、样本、Owner、权限、DQ、基期和活动/组合口径均签收 | 看板、Agent、SQL 前置 | 无证据泛化 |
| Red | P0 DQ 失败且无业务解释 | 停止进入下游 | 看板、Agent、SQL |

当前本表状态为 `Grey`。

## 13. 跨专题引用边界

| 相邻专题 / 资产 | 可引用内容 | 在本表中的角色 | 禁止事项 |
|---|---|---|---|
| `dwt_order_cost_quality` | 前台成本、后台成本、成本率 | 毛利变化解释字段 | 不回写财务毛利，不替代成本专题 |
| SCM 成本专题 | 供应链成本节点、仓配成本解释 | 后台成本深挖参考 | 不把订单价结构归因改写为 SCM 成本专题 |
| 专题④营销 | 活动 ID、活动类型、促销类型 | 分组维度和后续 ROI 输入 | 不输出 ROAS、曝光归因、投放因果 |
| 专题① VOC | 高 VOC SPU、退货率、体验线索 | 商品结构风险参考 | 不把毛利低直接解释为用户声音 |
| `dwt_return_attribution` | 部分退、退款原因、SKU 退货线索 | 组合问题候选 | 不用退款事实替代毛利事实 |

## 14. 下游消费

| 下游 | 消费字段 | 输出 |
|---|---|---|
| `ORDER-BI-003` | `order_type`、`campaign_id`、`spu_id`、`category_l3`、`gmv_line`、`gross_margin_amt_line`、`item_qty_line` | 订单价结构与毛利归因页面 |
| `ORDER-AGENT-003` | 四因素聚合字段、DQ 状态、订单类型、SPU、组合标记 | 毛利归因解释、SPU/组合候选、风险提示 |
| `ORDER-DATA-002` | `cost_front_total`、`cost_back_total`、成本分摊字段 | 成本解释，不回写毛利 |
| `ORDER-DATA-005` | `order_id`、`sku_id`、`spu_id`、`is_bundle_line`、`variant_color`、`variant_size` | 部分退组合归因输入 |
| `MKT` 专题 | `campaign_id`、`campaign_type`、`gmv_line`、`gross_margin_amt_line` | 营销 ROI 上游订单输入，需在 MKT 专题单独治理 |

## 15. 当前不能做的事

| 事项 | 原因 | 后续进入条件 |
|---|---|---|
| 不创建正式 SQL | 缺真实表名、字段类型、权限和样本 DQ | `ORDER-DQ-001` 通过后进入 `ORDER-SQL-003` |
| 不输出促销或组合因果结论 | 当前只有结构字段和样例方法 | 需要实验、营销归因或准实验设计 |
| 不把活动 ID 当 ROI 证据 | 缺曝光、触达、费用和归因销售额 | 专题④ MKT 完成 ROI 数据契约 |
| 不把订单行毛利分摊当事实 | 分摊规则未确认 | 订单行毛利源字段或财务签收分摊规则 |
| 不直接上线组合策略 | 组合指标只是候选线索 | 组合实验、退款/VOC 证据和运营确认 |

## 16. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 订单行主键 | `(order_id, line_item_id)` | 源系统是否稳定提供 `line_item_id` |
| 订单行毛利 | 优先源字段 `gross_margin_amt_line` | 若没有，是否允许按 GMV 权重分摊订单级毛利 |
| 品单价字段命名 | 字段用 `unit_price`，聚合指标可兼容 `asp` | BI 是否继续使用 `asp` 展示名 |
| 促销标记 | 行级 `is_promo_line` + 订单级 `is_promo_order` | 两者冲突时谁优先 |
| 组合定义 | 行级 `is_bundle_line` 派生订单级组合 | 组合是否来自 SKU 套装、同单搭配，还是营销 bundle |
| 基期口径 | 参数化 `baseline_period` | 使用同比、环比、YTD，还是管理层固定基期 |
| 活动边界 | `campaign_id` 只作结构维度 | 哪些活动进入订单价结构，哪些转入 MKT 专题 |

## 17. 下一步任务

下一步执行 `ORDER-DATA-005`：定义 `dwt_return_attribution` 退款多维归因宽表规格。

建议落盘文件：

`drafts/analysis/order-topic-return-attribution-wide-table-spec-draft-20260603.md`

进入条件：

1. 复核 `ORDER-RETURN-*` 指标字典。
2. 对齐 `fact_return`、`fact_order`、`fact_order_item`、`dim_return_reason` 和 VOC 关联键。
3. 明确退款归因只负责售后退款与订单穿透，不替代 VOC 原始分析。
4. 继续保持 `Grey` 状态，不创建正式 SQL。
