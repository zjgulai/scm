---
title: 专题②线上订单数量与质量提升指标字典草稿
doc_type: analysis
module: project-governance
topic: order-topic-metric-dictionary
status: draft
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---

# 专题②线上订单数量与质量提升指标字典草稿

## 1. 任务定位

本文件执行 `ORDER-DATA-001`，用于把专题② ORDER 的指标从故事线、数仓契约、Phase2 mock 输出和样例专题公式中抽取为指标种子表。

当前文件只固定指标定义、公式、源表候选、适用子课题和证据状态，不创建 SQL，不声明真实生产口径已经完成。

## 2. 指标来源

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定四子课题、SCM 分枝和工作包 | 草稿控制面板 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 固定专题②字段、库表建议、粒度 | 规划契约 |
| 主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 固定 `fact_order`、`fact_order_item`、`fact_return`、`fact_order_fulfillment` 粒度和主键 | 规划契约 |
| 字段口径 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | 固定前后台成本、部分退、交叉线3输入字段口径 | 规划契约 |
| Phase2 输出 | `main_project_lute/phase2_outputs/topic2/*.csv` | 提供成本、耗时、毛利、退款字段样例 | mock 输出 |
| 交叉线3输出 | `ref/phase2_io/refund_theme_input_for_voc.csv` | 提供退款到 VOC 的输入字段样例 | mock 输出 |
| 专题02脚本 | `main_project_lute/data_example/scripts/core/run_专题02_双平台费率归因.py` | 费率归因、前后台成本和贡献占比公式 | 样例方法 |
| 专题04脚本 | `main_project_lute/data_example/scripts/core/run_专题04_四因素归因.py` | 毛利额四因素归因公式 | 样例方法 |
| 专题05脚本 | `main_project_lute/data_example/scripts/core/run_专题05_购物篮关联分析.py` | 支持度、置信度、提升度公式来源 | 样例方法 |
| Phase2 脚本 | `main_project_lute/data_example/scripts/experimental/run_phase2_topic2_pipeline.py` | Topic2 mock 管道字段和聚合方式 | mock 方法 |
| SCM 规格 | `scm/供应链成本指标全链路优化/01_专题包_产品化拆分与数据任务蓝图.md` | Grey/Amber/Green 状态和 DQ/SQL 门禁参考 | 治理模板 |

## 3. 编码规则

| 域 | 编码前缀 | 服务子课题 |
|---|---|---|
| 基础经营与成本 | `ORDER-COST-*` | `ORDER-T1` |
| 履约耗时 | `ORDER-FULFILL-*` | `ORDER-T2` |
| 毛利与价格结构 | `ORDER-MARGIN-*` | `ORDER-T3` |
| 退款与售后 | `ORDER-RETURN-*` | `ORDER-T4` |
| 组合与购物篮 | `ORDER-COMBO-*` | `ORDER-T3` / `ORDER-T4` |
| 交叉线3输入 | `ORDER-XL3-*` | `XL3` |

字段命名保留英文，指标名称用中文。指标必须标注 `source_table`、`formula`、`owner`、`topic_scope` 和 `evidence_status`。

## 4. 通用维度

| dimension_code | 字段 | 说明 | 适用 |
|---|---|---|---|
| `DIM-TIME-001` | `order_date` / `return_dt` / `dt_month` | 订单、退款或汇总月份 | 全部 |
| `DIM-GEO-001` | `country_code` | 国家 | 全部 |
| `DIM-CHANNEL-001` | `channel_id` | 渠道或平台 | 全部 |
| `DIM-SHOP-001` | `shop_id` | 店铺 | T1/T3 |
| `DIM-WH-001` | `warehouse_id` / `dest_warehouse` | 仓库或目的仓 | T1/T2 |
| `DIM-ORDER-001` | `order_type` | 订单类型 | T3 |
| `DIM-CAMPAIGN-001` | `campaign_id` | 活动 | T3 |
| `DIM-PRODUCT-001` | `spu_id` / `sku_id` / `category_l3` | 商品层级 | T3/T4 |
| `DIM-RETURN-001` | `return_reason_code` / `reason_category` | 退款原因 | T4 |
| `DIM-VOC-001` | `voc_ticket_id` / `theme_suggested` | VOC 关联键或建议主题 | T4/XL3 |

## 5. ORDER-COST 指标

| metric_code | metric_name | formula | source_table | source_fields | owner | topic_scope | priority | evidence_status |
|---|---|---|---|---|---|---|---:|---|
| `ORDER-COST-001` | 订单数 | `count(distinct order_id)` | `fact_order` | `order_id` | 订单 & 成本 & 退款 & 仓网 | T1/T3/T4 | P0 | contract+mock |
| `ORDER-COST-002` | 销售额 | `sum(gmv)` | `fact_order` | `gmv` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P0 | contract+mock |
| `ORDER-COST-003` | 件数 | `sum(item_qty)` | `fact_order` / `fact_order_item` | `item_qty` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P0 | contract+mock |
| `ORDER-COST-004` | 品数 | `sum(sku_qty)` | `fact_order` | `sku_qty` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P0 | contract |
| `ORDER-COST-005` | 客件数 | `sum(item_qty) / count(distinct order_id)` | `fact_order` | `item_qty`, `order_id` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P0 | contract+sample |
| `ORDER-COST-006` | 客品数 | `sum(sku_qty) / count(distinct order_id)` | `fact_order` | `sku_qty`, `order_id` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P0 | contract+sample |
| `ORDER-COST-007` | 前台成本额 | `sum(cost_front_total)` | `fact_order` | `cost_front_total` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P0 | contract+mock |
| `ORDER-COST-008` | 前台成本率 | `sum(cost_front_total) / sum(gmv)` | `fact_order` | `cost_front_total`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P0 | contract+mock+sample |
| `ORDER-COST-009` | 后台成本额 | `sum(cost_back_total)` | `fact_order` / `fact_order_cost` | `cost_back_total` | 订单 & 成本 & 退款 & 仓网 | T1 | P0 | contract+mock |
| `ORDER-COST-010` | 后台成本率 | `sum(cost_back_total) / sum(gmv)` | `fact_order` / `fact_order_cost` | `cost_back_total`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1 | P0 | contract+mock+sample |
| `ORDER-COST-011` | 促销折扣率 | `sum(cost_promo_discount) / sum(gmv)` | `fact_order` | `cost_promo_discount`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P0 | mock+sample |
| `ORDER-COST-012` | 线上推广费率 | `sum(cost_ad_spend) / sum(gmv)` | `fact_order` | `cost_ad_spend`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P1 | mock+sample |
| `ORDER-COST-013` | 退款成本率 | `sum(cost_refund) / sum(gmv)` | `fact_order` | `cost_refund`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1/T4 | P0 | mock+sample |
| `ORDER-COST-014` | 生产成本率 | `sum(cost_production) / sum(gmv)` | `fact_order` / `fact_order_cost` | `cost_production`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1 | P1 | mock+sample |
| `ORDER-COST-015` | 头程费率 | `sum(cost_freight) / sum(gmv)` | `fact_order` / `fact_order_cost` | `cost_freight`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1 | P1 | mock+sample |
| `ORDER-COST-016` | 仓储配送费率 | `sum(cost_warehouse) / sum(gmv)` | `fact_order` / `fact_order_cost` | `cost_warehouse`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1/T2 | P1 | mock+sample |
| `ORDER-COST-017` | 平台佣金率 | `sum(cost_commission) / sum(gmv)` | `fact_order` / `fact_order_cost` | `cost_commission`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1 | P1 | mock+sample |
| `ORDER-COST-018` | 其他费率 | `sum(cost_other) / sum(gmv)` 或 `1 - sum(已列示费率)` | `fact_order` / `fact_order_cost` | `cost_other`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T1 | P2 | mock+sample |
| `ORDER-COST-019` | 单均前台成本 | `sum(cost_front_total) / count(distinct order_id)` | `fact_order` | `cost_front_total`, `order_id` | 订单 & 成本 & 退款 & 仓网 | T1 | P1 | contract+mock |
| `ORDER-COST-020` | 单均后台成本 | `sum(cost_back_total) / count(distinct order_id)` | `fact_order` / `fact_order_cost` | `cost_back_total`, `order_id` | 订单 & 成本 & 退款 & 仓网 | T1 | P1 | contract+mock |
| `ORDER-COST-021` | 件均后台成本 | `sum(cost_back_total) / sum(item_qty)` | `fact_order` / `fact_order_cost` | `cost_back_total`, `item_qty` | 订单 & 成本 & 退款 & 仓网 | T1 | P1 | contract |
| `ORDER-COST-022` | 成本率贡献率 | `-(current_rate - baseline_rate)`，单位 pp | 样例专题02方法 | `*_rate` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P2 | sample_method |
| `ORDER-COST-023` | 成本率贡献占比 | `metric_contribution_pp / total_margin_rate_delta_pp` | 样例专题02方法 | `*_contribution_pp` | 订单 & 成本 & 退款 & 仓网 | T1/T3 | P2 | sample_method |

## 6. ORDER-FULFILL 指标

| metric_code | metric_name | formula | source_table | source_fields | owner | topic_scope | priority | evidence_status |
|---|---|---|---|---|---|---|---:|---|
| `ORDER-FULFILL-001` | 创建到支付耗时 | `avg(paid_at - created_at)` | `fact_order_fulfillment` / `fact_order` | `created_at`, `paid_at` | 订单 & 成本 & 退款 & 仓网 | T2 | P1 | contract+mock |
| `ORDER-FULFILL-002` | 支付到发货耗时 | `avg(shipped_at - paid_at)` | `fact_order_fulfillment` / `fact_order` | `paid_at`, `shipped_at` | 订单 & 成本 & 退款 & 仓网 | T2 | P0 | contract+mock |
| `ORDER-FULFILL-003` | 发货到签收耗时 | `avg(delivered_at - shipped_at)` | `fact_order_fulfillment` / `fact_order` | `shipped_at`, `delivered_at` | 订单 & 成本 & 退款 & 仓网 | T2 | P0 | contract+mock |
| `ORDER-FULFILL-004` | 在途到清关耗时 | `avg(cleared_at - in_transit_at)` | `fact_order_fulfillment` / `fact_order` | `in_transit_at`, `cleared_at` | 订单 & 成本 & 退款 & 仓网 | T2 | P2 | contract |
| `ORDER-FULFILL-005` | 总履约耗时 | `avg(delivered_at - created_at)` 或 `avg(lead_time_total)` | `fact_order_fulfillment` / `fact_order` | `lead_time_total`, `created_at`, `delivered_at` | 订单 & 成本 & 退款 & 仓网 | T2 | P0 | contract+mock |
| `ORDER-FULFILL-006` | 库存周转天数 | `avg(turnover_days)` | `fact_order_fulfillment` / `fact_order` | `turnover_days` | 订单 & 成本 & 退款 & 仓网 | T2 | P1 | contract+mock |
| `ORDER-FULFILL-007` | 超时订单数 | `sum(case when is_overdue then 1 else 0 end)` | `fact_order_fulfillment` / `fact_order` | `is_overdue`, `order_id` | 订单 & 成本 & 退款 & 仓网 | T2 | P0 | contract+mock |
| `ORDER-FULFILL-008` | 超时率 | `超时订单数 / count(distinct order_id)` | `fact_order_fulfillment` / `fact_order` | `is_overdue`, `order_id` | 订单 & 成本 & 退款 & 仓网 | T2 | P0 | contract+mock |
| `ORDER-FULFILL-009` | 物流 VOC 关联订单率 | `sum(case when has_voc then 1 else 0 end) / count(distinct order_id)` | `fact_order_fulfillment` / VOC 工单表 | `has_voc`, `order_id`, `voc_ticket_id` | 订单 Agent 主产出，VOC Agent 消费 | T2/XL3 | P2 | contract |

## 7. ORDER-MARGIN 指标

| metric_code | metric_name | formula | source_table | source_fields | owner | topic_scope | priority | evidence_status |
|---|---|---|---|---|---|---|---:|---|
| `ORDER-MARGIN-001` | 毛利额 | `sum(gross_margin_amt)` | `fact_order` | `gross_margin_amt` | 订单 & 成本 & 退款 & 仓网 | T3 | P0 | contract+mock |
| `ORDER-MARGIN-002` | 毛利率 | `sum(gross_margin_amt) / sum(gmv)` | `fact_order` | `gross_margin_amt`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T3 | P0 | contract+mock |
| `ORDER-MARGIN-003` | 订单均价 | `sum(gmv) / count(distinct order_id)` | `fact_order` | `gmv`, `order_id` | 订单 & 成本 & 退款 & 仓网 | T3 | P0 | contract |
| `ORDER-MARGIN-004` | 品单价 | `sum(gmv_line) / sum(item_qty)` | `fact_order_item` | `gmv_line`, `item_qty` | 订单 & 成本 & 退款 & 仓网 | T3 | P0 | contract+sample |
| `ORDER-MARGIN-005` | 订单类型销售占比 | `sum(gmv by order_type) / sum(gmv)` | `fact_order` | `order_type`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T3 | P1 | contract+mock |
| `ORDER-MARGIN-006` | 促销订单占比 | `count(distinct promo order_id) / count(distinct order_id)` | `fact_order` / `fact_order_item` | `is_promo`, `order_id` | 订单 & 成本 & 退款 & 仓网 | T3 | P1 | contract |
| `ORDER-MARGIN-007` | 组合订单占比 | `count(distinct bundle order_id) / count(distinct order_id)` | `fact_order` / `fact_order_item` | `is_bundle`, `order_id` | 订单 & 成本 & 退款 & 仓网 | T3/T4 | P1 | contract |
| `ORDER-MARGIN-008` | SPU 毛利额 | `sum(gross_margin_amt_line)` | `fact_order_item` | `spu_id`, `gross_margin_amt_line` | 订单 & 成本 & 退款 & 仓网 | T3 | P0 | contract+mock |
| `ORDER-MARGIN-009` | SPU 毛利率 | `sum(gross_margin_amt_line) / sum(gmv_line)` | `fact_order_item` | `spu_id`, `gross_margin_amt_line`, `gmv_line` | 订单 & 成本 & 退款 & 仓网 | T3 | P0 | contract+mock |
| `ORDER-MARGIN-010` | 客件数贡献额 | `base_unit_price * base_order_cnt * base_front_margin_rate * (current_item_per_order - base_item_per_order)` | 样例专题04方法 + `fact_order_item` | `item_qty`, `order_id`, `gmv_line`, `gross_margin_amt_line` | 订单 & 成本 & 退款 & 仓网 | T3 | P2 | sample_method |
| `ORDER-MARGIN-011` | 品单价贡献额 | `base_item_per_order * base_order_cnt * base_front_margin_rate * (current_unit_price - base_unit_price)` | 样例专题04方法 + `fact_order_item` | `unit_price`, `gmv_line`, `item_qty` | 订单 & 成本 & 退款 & 仓网 | T3 | P2 | sample_method |
| `ORDER-MARGIN-012` | 订单数贡献额 | `base_item_per_order * base_unit_price * base_front_margin_rate * (current_order_cnt - base_order_cnt)` | 样例专题04方法 + `fact_order` | `order_id`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T3 | P2 | sample_method |
| `ORDER-MARGIN-013` | 前台毛利率贡献额 | `base_item_per_order * base_unit_price * base_order_cnt * (current_front_margin_rate - base_front_margin_rate)` | 样例专题04方法 + `fact_order` | `gross_margin_amt`, `gmv`, `cost_front_total` | 订单 & 成本 & 退款 & 仓网 | T3 | P2 | sample_method |
| `ORDER-MARGIN-014` | 归因贡献占比 | `factor_contribution_amt / total_margin_delta_amt` | 样例专题04方法 | `factor_contribution_amt`, `total_margin_delta_amt` | 订单 & 成本 & 退款 & 仓网 | T3 | P2 | sample_method |

## 8. ORDER-RETURN 指标

| metric_code | metric_name | formula | source_table | source_fields | owner | topic_scope | priority | evidence_status |
|---|---|---|---|---|---|---|---:|---|
| `ORDER-RETURN-001` | 退款金额 | `sum(return_amt)` | `fact_return` | `return_amt` | 订单 & 成本 & 退款 & 仓网 | T4 | P0 | contract |
| `ORDER-RETURN-002` | 退款数量 | `sum(return_qty)` | `fact_return` | `return_qty` | 订单 & 成本 & 退款 & 仓网 | T4 | P0 | contract |
| `ORDER-RETURN-003` | 退款订单数 | `count(distinct order_id where return exists)` | `fact_return` | `order_id` | 订单 & 成本 & 退款 & 仓网 | T4 | P0 | contract+mock |
| `ORDER-RETURN-004` | 订单退款率 | `退款订单数 / count(distinct fact_order.order_id)` | `fact_return` + `fact_order` | `order_id` | 订单 & 成本 & 退款 & 仓网 | T4 | P0 | contract |
| `ORDER-RETURN-005` | 退款金额率 | `sum(return_amt) / sum(fact_order.gmv)` | `fact_return` + `fact_order` | `return_amt`, `gmv` | 订单 & 成本 & 退款 & 仓网 | T4 | P0 | contract |
| `ORDER-RETURN-006` | 退款原因金额占比 | `sum(return_amt by return_reason_code) / sum(return_amt)` | `fact_return` + `dim_return_reason` | `return_reason_code`, `return_amt` | 订单 & 成本 & 退款 & 仓网 | T4 | P0 | contract+mock |
| `ORDER-RETURN-007` | 部分退比例 | `count(distinct return_id where is_partial_return) / count(distinct return_id)` | `fact_return` | `is_partial_return`, `return_id` | 订单 & 成本 & 退款 & 仓网 | T4 | P0 | contract+mock |
| `ORDER-RETURN-008` | 重复投诉比例 | `count(distinct return_id where is_repeat_complaint) / count(distinct return_id)` | `fact_return` / VOC 工单表 | `is_repeat_complaint`, `return_id` | 订单 Agent 主产出，VOC Agent 消费 | T4/XL3 | P1 | contract |
| `ORDER-RETURN-009` | VOC 关联率 | `count(distinct return_id where voc_ticket_id is not null) / count(distinct return_id)` | `fact_return` + VOC 工单表 | `voc_ticket_id`, `return_id` | 订单 Agent 主产出，VOC Agent 消费 | T4/XL3 | P0 | contract |
| `ORDER-RETURN-010` | 部分退组合覆盖率 | `count(distinct partial return order_id with sku组合) / count(distinct partial return order_id)` | `fact_return` + `fact_order_item` | `order_id`, `sku_id`, `is_partial_return` | 订单 & 成本 & 退款 & 仓网 | T4 | P1 | contract |
| `ORDER-RETURN-011` | 退款原因分类占比 | `sum(return_amt by reason_category) / sum(return_amt)` | `fact_return` + `dim_return_reason` | `reason_category`, `return_amt` | 订单 & 成本 & 退款 & 仓网 | T4 | P0 | contract+mock |

## 9. ORDER-COMBO 指标

| metric_code | metric_name | formula | source_table | source_fields | owner | topic_scope | priority | evidence_status |
|---|---|---|---|---|---|---|---:|---|
| `ORDER-COMBO-001` | 组合支持度 | `count(orders containing A and B) / count(all orders)` | `fact_order_item` | `order_id`, `spu_id`, `sku_id` | 订单 & 成本 & 退款 & 仓网 | T3/T4 | P2 | sample_method |
| `ORDER-COMBO-002` | 组合置信度 | `count(orders containing A and B) / count(orders containing A)` | `fact_order_item` | `order_id`, `spu_id`, `sku_id` | 订单 & 成本 & 退款 & 仓网 | T3/T4 | P2 | sample_method |
| `ORDER-COMBO-003` | 组合提升度 | `confidence(A -> B) / support(B)` | `fact_order_item` | `order_id`, `spu_id`, `sku_id` | 订单 & 成本 & 退款 & 仓网 | T3/T4 | P2 | sample_method |
| `ORDER-COMBO-004` | 正向组合标记 | `case when lift > 1 then 1 else 0 end` | 组合分析结果表 | `lift` | 订单 & 成本 & 退款 & 仓网 | T3/T4 | P2 | sample_method |
| `ORDER-COMBO-005` | 互斥组合标记 | `case when lift < 1 then 1 else 0 end` | 组合分析结果表 | `lift` | 订单 & 成本 & 退款 & 仓网 | T3/T4 | P2 | sample_method |

## 10. ORDER-XL3 指标

| metric_code | metric_name | formula | source_table | source_fields | owner | topic_scope | priority | evidence_status |
|---|---|---|---|---|---|---|---:|---|
| `ORDER-XL3-001` | 售后退款主题输入行数 | `count(*)` | `refund_theme_input_for_voc` | `order_id`, `return_id` | 订单 Agent 主产出，VOC Agent 消费 | XL3 | P0 | mock |
| `ORDER-XL3-002` | 建议主题覆盖率 | `count(rows where theme_suggested is not null) / count(*)` | `refund_theme_input_for_voc` | `theme_suggested` | 订单 Agent 主产出，VOC Agent 消费 | XL3 | P0 | mock |
| `ORDER-XL3-003` | 退款主题可映射率 | `count(rows where theme_suggested maps to dim_voc_tag) / count(*)` | `refund_theme_input_for_voc` + `dim_voc_tag` | `theme_suggested`, `tag_l2`, `tag_l3` | 订单 Agent 主产出，VOC Agent 消费 | XL3 | P1 | contract |
| `ORDER-XL3-004` | VOC 反查有效率 | `count(rows with matched voc_ticket_id or order_id review) / count(*)` | `refund_theme_input_for_voc` + VOC 明细 | `order_id`, `return_id`, `voc_ticket_id` | VOC Agent | XL3 | P1 | contract |

## 11. SCM 参考指标

以下指标不改名为 ORDER 指标，只作为 ORDER 成本、履约和逆向物流解释层参考。

| scm_metric_code | scm_metric_name | ORDER 引用场景 | 禁止事项 |
|---|---|---|---|
| `SC-L1-001` | 全链路供应链成本率 | T1 后台成本解释 | 不替代 `ORDER-COST-010` |
| `SC-IN-L3-001` | 头程运输成本率 | T1 头程费率深挖 | 不直接生成 ORDER SQL |
| `SC-OUT-L3-001` | 尾程配送成本率 | T1/T2 履约成本解释 | 不替代订单节点耗时 |
| `SC-IV-L4-002` | 库存周转天数 | T2 周转解释 | 不替代 `ORDER-FULFILL-006` |
| `FD-L1-001` | 综合履约满意度指数 | T2 降本护栏 | 不直接作为订单体验结论 |
| `dwt_reverse_logistics` 相关指标 | 逆向物流成本、补发成本、返仓可售率 | T4 逆向深挖 | 不替代退款原因和 VOC 关联 |

## 12. 数据状态门禁

| 状态 | 进入条件 | 指标允许用途 | 禁止用途 |
|---|---|---|---|
| Grey | 只有契约、样例或 mock 输出，缺真实源表与样本 | 指标字典、字段缺口、取数需求 | 业务根因、Owner 动作、管理层强结论 |
| Amber | 有真实样本但 DQ 未完全通过，或口径差异未闭环 | 待验证假设、样本口径对比 | 生产结论、正式 SQL |
| Green | 源表、样本、DQ、Owner、权限和口径均通过 | 看板指标、Agent 解释、SQL 前置 | 无证据泛化 |

当前本指标字典整体状态为 `Grey`。原因是：真实 `database.schema.table`、字段类型、Owner、权限和样本 DQ 尚未确认。

## 13. 下一步

下一步进入：

```text
ORDER-DATA-002
```

建议新建草稿：

```text
drafts/analysis/order-topic-cost-quality-wide-table-spec-draft-20260602.md
```

该文件应固定 `dwt_order_cost_quality` 的粒度、主键、字段、来源、计算顺序、样本 DQ 和与 SCM 成本口径的引用边界。仍不写 SQL。

## 14. 待确认决策

| 决策点 | 触发阶段 | 推荐默认 |
|---|---|---|
| `cost_refund` 与 `return_amt` 是否并存 | `ORDER-DATA-002` / `ORDER-DATA-005` | 并存；前者为成本分摊，后者为退款事实金额 |
| `cost_freight` 是否拆头程/尾程 | `ORDER-SOURCE-001` | 先保留 `cost_freight`，真实源表确认后再拆 |
| `asp` 命名是否改为品单价 | `ORDER-DATA-004` | 指标名用“品单价”，字段可兼容 `asp` |
| 组合指标是否进入 P0 | `ORDER-BI-003` | 先 P2，验证后再提升 |
| `ORDER-COST-022/023` 是否作为正式归因指标 | `ORDER-DATA-004` | 先作为样例方法，真实基期口径确认后再转正式 |
