---
title: "Agent 画像：订单 & 成本 & 退款 & 仓网"
doc_type: knowledge
module: "ref"
topic: "agent-订单-成本-退款-仓网"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# Agent 画像：订单 & 成本 & 退款 & 仓网

---

## 使命（一句话）

从订单、成本、履约与退款数据中产出前后台成本归因、订单价结构毛利归因、节点诊断与退款多维归因（含部分退组合与 VOC 穿透输入），支撑订单数量与质量提升及业财一体化。

---

## 主责专题与子课题

- **主责专题**：② 线上订单数量与质量提升
- **主责子课题**：① 订单量区域结构对后台成本的影响、② 订单平均耗时与核心节点、③ 订单类型与订单价结构对毛利额归因、④ 退款订单多维归因（反推订单 + 穿透 VOC）

---

## 输入

| 类型 | 表/资产名称 | 关键字段（示例） | 可选参数 |
|------|-------------|------------------|----------|
| 数仓事实表 | fact_order | order_id, order_date, country_code, channel_id, gmv, cost_front_total, cost_back_*, item_qty, sku_qty, dest_warehouse, created_at, paid_at, shipped_at, delivered_at, campaign_id, gross_margin_amt | order_date / dt_month |
| 数仓事实表 | fact_order_item | order_id, line_item_id, spu_id, sku_id, unit_price, item_qty, gmv_line, is_promo, is_bundle | order_date |
| 数仓事实表 | fact_return | return_id, order_id, sku_id, return_qty, return_amt, return_reason_code, is_partial_return, voc_ticket_id | return_dt |
| 数仓事实表 | fact_order_cost（或合入 fact_order） | order_id, cost_front_total, cost_back_total, cost_back_prod, cost_back_shipping, cost_back_warehouse | order_date |
| 数仓事实表 | fact_order_fulfillment（可选） | order_id, created_at, paid_at, shipped_at, in_transit_at, cleared_at, delivered_at, lead_time_* | order_date |
| 数仓维度表 | dim_warehouse, dim_order_type, dim_return_reason, dim_campaign | 仓库、订单类型、退款原因、活动 | — |

---

## 调用的 Skills / 脚本

| 能力名称 | 路径/来源 | 调用场景 | 备注 |
|----------|------------|----------|------|
| 专题二双平台费率归因 | data_example/scripts/run_专题二_Sheet2_双平台费率归因.py | 前后台成本/费率归因 | 现有可复用 |
| Sheet4 客品数品单价订单数毛利率归因 | data_example/scripts/run_专题四_Sheet4_客品数品单价订单数毛利率归因.py、run_专题四_Sheet4_客品数与毛利率下钻归因.py | 订单价结构、毛利归因 | 现有可复用 |
| build_sheet2 / sheet4 图表 | data_example/scripts/build_sheet2_fee_attribution_charts.py、build_sheet4_waterfall.py、build_sheet4_drilldown_charts.py | 看板与汇报图表 | 现有可复用 |
| 专题三 SPU 分析 | data_example/scripts/run_专题三_Sheet3_SPU分析.py | 品类/SPU 维度分析 | 可复用 |
| 订单耗时与节点诊断 | — | 子课题② | 待 Phase 2 实现 |
| 退款部分退组合与故意比较 vs 组合设计 | — | 子课题④ | 待 Phase 2 实现 |

---

## 输出格式

| 输出物 | 格式 | 消费者 |
|--------|------|--------|
| 前后台成本归因表、价值认同与客件数结论 | 表 + 文本 | 管理层、供应链 |
| 订单节点诊断表、周转与体验结论 | 表 + 文本 | 供应链、渠道健康度 |
| 毛利额归因表、组合策略建议 | 表 + 清单 | 品类/运营、专题④ |
| 退款归因表、部分退组合分析、组合优化清单 | 表 + 清单 | 客服/产品、VOC Agent |
| 售后/退款主题输入表（供 VOC 扩展） | 表/JSON | VOC Agent |
| 专题② 结论摘要 | JSON/文本 | 咨询 PPT Agent、管理层 |

---

## 与 01 矩阵的对应

- **本 Agent 消费的「库表建议」列中的表清单**：fact_order, fact_order_item, fact_order_cost（或合入 fact_order）, fact_return, fact_order_fulfillment（可选）, dim_warehouse, dim_order_type, dim_return_reason, dim_campaign。
