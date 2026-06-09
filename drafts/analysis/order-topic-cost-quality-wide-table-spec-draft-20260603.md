---
title: 专题②订单成本质量宽表规格草稿
doc_type: analysis
module: project-governance
topic: order-topic-cost-quality-wide-table-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②订单成本质量宽表规格草稿

## 1. 任务定位

本文件执行 `ORDER-DATA-002`，目标是固定 `dwt_order_cost_quality` 的订单级宽表规格，支撑专题② `ORDER-T1`：订单量区域结构 -> 后台成本 / 仓网。

当前文件只定义宽表粒度、字段、公式、来源、DQ 门槛和 SCM 引用边界，不创建 SQL，不声明真实生产源表已经确认。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 目标宽表 | `dwt_order_cost_quality` |
| 主服务子课题 | `ORDER-T1` 订单量区域结构 -> 后台成本 / 仓网 |
| 次级服务子课题 | `ORDER-T3` 毛利归因、`ORDER-T4` 退款成本线索 |
| 推荐粒度 | 一行一订单，主键 `order_id` |
| 分区建议 | `order_date`，并保留 `dt_month` 便于月度聚合 |
| 当前状态 | `Grey`，因为真实库表、字段类型、Owner、权限和样本 DQ 尚未确认 |
| SQL 状态 | 不写正式 SQL；真实样本通过 `ORDER-DQ-001` 后再进入 `ORDER-SQL-001` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定 `ORDER-DATA-002` 宽表任务 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-COST-*` 指标公式 | 草稿指标字典 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 提供 T1 字段、库表建议和粒度 | 规划契约 |
| 主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 确认 `fact_order` 一行一订单 | 规划契约 |
| 字段口径 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | 固定前台/后台成本定义 | 规划契约 |
| Phase2 输出 | `main_project_lute/phase2_outputs/topic2/topic2_cost_attribution.csv` | 提供 mock 聚合字段样例 | mock 产物 |
| Phase2 脚本 | `main_project_lute/data_example/scripts/experimental/run_phase2_topic2_pipeline.py` | 提供成本字段聚合方式 | mock 方法 |
| 样例专题02 | `main_project_lute/data_example/专题产物/专题02/` | 提供费率归因和“卖 1 元成本”表达 | 样例方法 |
| SCM 成本规格 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供供应链成本节点参考和 DQ 门禁 | SCM 参考 |

## 4. 宽表边界

`dwt_order_cost_quality` 是订单级经营成本宽表，不是供应链全链路成本宽表。

| 边界 | 本表负责 | 本表不负责 |
|---|---|---|
| 订单事实 | 订单量、销售额、件数、品数、订单类型、渠道、国家、仓库 | 客户生命周期、投放触达、外部曝光 |
| 成本质量 | 前台成本、后台成本、成本率、单均成本、件均成本 | 供应商绩效、采购批次、库存库龄、完整供应链节点治理 |
| 仓网分析 | 订单目的仓、仓库维度下的成本与订单结构 | 仓网重规划、自动调拨、库存补货决策 |
| 退款线索 | `cost_refund` 作为订单成本分摊项，可连接退款事实作校验 | `fact_return.return_amt` 的退款原因、部分退、VOC 穿透 |
| SCM 引用 | 引用 SCM 成本科目、节点和 Grey/Amber/Green 门禁 | 用 SCM 表替代订单事实或生成供应链结论 |

## 5. 表级规格

| 项 | 规格 |
|---|---|
| 目标表 | `dwt_order_cost_quality` |
| 逻辑层级 | DWT / 主题宽表 |
| 业务目标 | 回答订单量、区域、渠道、仓库、订单类型如何影响前后台成本和毛利质量 |
| 主键 | `order_id` |
| 推荐粒度 | 一行一订单 |
| 分区键 | `order_date` |
| 常用聚合键 | `dt_month`、`country_code`、`channel_id`、`shop_id`、`warehouse_id`、`dest_warehouse`、`order_type` |
| 下游页面 | `ORDER-BI-001` 订单经营结果与成本质量总览 |
| 下游 Agent | `ORDER-AGENT-001` 订单成本异常诊断 |
| 输入依赖 | `fact_order`、可选 `fact_order_cost`、`dim_warehouse`、`dim_order_type`、可选 `fact_return` |
| 输出状态 | `data_quality_status` 必须随表输出 |

## 6. 字段清单

### 6.1 主键与时间字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `order_id` | string | 是 | `fact_order` | 订单主键，一行一订单 |
| `order_date` | date | 是 | `fact_order` | 分区字段 |
| `dt_month` | string | 是 | 派生 | `YYYY-MM` 月份，用于聚合 |
| `fiscal_period` | string | 否 | 财务或经营日历 | 财务期间，未确认前可为空 |
| `mat_period` | string | 否 | 派生或财务日历 | MAT 对比标签，未确认前可为空 |

### 6.2 维度字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `country_code` | string | 是 | `fact_order` | 国家 |
| `site` | string | 否 | `fact_order` | 站点 |
| `channel_id` | string | 是 | `fact_order` | 渠道或平台 |
| `shop_id` | string | 否 | `fact_order` | 店铺 |
| `warehouse_id` | string | 否 | `fact_order` / `dim_warehouse` | 发货仓或关联仓库 |
| `dest_warehouse` | string | 否 | `fact_order` | 目的仓 |
| `warehouse_type` | string | 否 | `dim_warehouse` | FBA、3PL、自建仓、退货仓等 |
| `is_fba` | boolean | 否 | `dim_warehouse` | 是否 FBA |
| `order_type` | string | 是 | `fact_order` / `dim_order_type` | 订单类型 |
| `order_type_name` | string | 否 | `dim_order_type` | 订单类型名称 |
| `is_promo_order` | boolean | 否 | `fact_order` / `dim_order_type` | 是否促销订单 |
| `is_b2b_order` | boolean | 否 | `dim_order_type` | 是否 B2B |
| `campaign_id` | string | 否 | `fact_order` | 活动 ID，仅作订单结构输入 |

### 6.3 销售与订单结构字段

| 字段 | 类型建议 | 必填 | 来源 | 指标映射 |
|---|---|---:|---|---|
| `gmv` | decimal | 是 | `fact_order` | `ORDER-COST-002` |
| `item_qty` | decimal | 是 | `fact_order` | `ORDER-COST-003` |
| `sku_qty` | decimal | 否 | `fact_order` | `ORDER-COST-004` |
| `order_unit_price` | decimal | 否 | 派生 | `gmv / nullif(item_qty, 0)` |
| `gross_margin_amt` | decimal | 是 | `fact_order` | `ORDER-MARGIN-001` |
| `gross_margin_pct` | decimal | 否 | 派生 | `gross_margin_amt / nullif(gmv, 0)` |

### 6.4 前台成本字段

前台成本口径：促销 + 推广 + 退款成本分摊。

| 字段 | 类型建议 | 必填 | 来源 | 指标映射 |
|---|---|---:|---|---|
| `cost_promo_discount` | decimal | 否 | `fact_order` / `fact_order_cost` | `ORDER-COST-011` |
| `cost_ad_spend` | decimal | 否 | `fact_order` / `fact_order_cost` | `ORDER-COST-012` |
| `cost_refund` | decimal | 否 | `fact_order` / `fact_order_cost` | `ORDER-COST-013` |
| `cost_front_total` | decimal | 是 | `fact_order` / 派生 | `ORDER-COST-007` |
| `cost_promo_discount_pct` | decimal | 否 | 派生 | `cost_promo_discount / nullif(gmv, 0)` |
| `cost_ad_spend_pct` | decimal | 否 | 派生 | `cost_ad_spend / nullif(gmv, 0)` |
| `cost_refund_pct` | decimal | 否 | 派生 | `cost_refund / nullif(gmv, 0)` |
| `cost_front_total_pct` | decimal | 否 | 派生 | `cost_front_total / nullif(gmv, 0)` |

### 6.5 后台成本字段

后台成本口径：生产 + 头程/货运 + 仓储配送 + 平台佣金 + 其他。

| 字段 | 类型建议 | 必填 | 来源 | 指标映射 |
|---|---|---:|---|---|
| `cost_production` | decimal | 否 | `fact_order` / `fact_order_cost` | `ORDER-COST-014` |
| `cost_freight` | decimal | 否 | `fact_order` / `fact_order_cost` | `ORDER-COST-015` |
| `cost_warehouse` | decimal | 否 | `fact_order` / `fact_order_cost` | `ORDER-COST-016` |
| `cost_commission` | decimal | 否 | `fact_order` / `fact_order_cost` | `ORDER-COST-017` |
| `cost_other` | decimal | 否 | `fact_order` / `fact_order_cost` | `ORDER-COST-018` |
| `cost_back_total` | decimal | 是 | `fact_order` / 派生 | `ORDER-COST-009` |
| `cost_production_pct` | decimal | 否 | 派生 | `cost_production / nullif(gmv, 0)` |
| `cost_freight_pct` | decimal | 否 | 派生 | `cost_freight / nullif(gmv, 0)` |
| `cost_warehouse_pct` | decimal | 否 | 派生 | `cost_warehouse / nullif(gmv, 0)` |
| `cost_commission_pct` | decimal | 否 | 派生 | `cost_commission / nullif(gmv, 0)` |
| `cost_other_pct` | decimal | 否 | 派生 | `cost_other / nullif(gmv, 0)` |
| `cost_back_total_pct` | decimal | 否 | 派生 | `cost_back_total / nullif(gmv, 0)` |

### 6.6 派生分析字段

| 字段 | 类型建议 | 公式 | 用途 |
|---|---|---|---|
| `total_cost_amt` | decimal | `cost_front_total + cost_back_total` | 总成本 |
| `total_cost_pct` | decimal | `total_cost_amt / nullif(gmv, 0)` | 总成本率 |
| `front_cost_share_in_total_cost` | decimal | `cost_front_total / nullif(total_cost_amt, 0)` | 前台占总成本 |
| `back_cost_share_in_total_cost` | decimal | `cost_back_total / nullif(total_cost_amt, 0)` | 后台占总成本 |
| `avg_front_cost_per_order` | decimal | `cost_front_total` | 单订单前台成本，订单级无需再除 |
| `avg_back_cost_per_order` | decimal | `cost_back_total` | 单订单后台成本，订单级无需再除 |
| `back_cost_per_item` | decimal | `cost_back_total / nullif(item_qty, 0)` | 件均后台成本 |
| `front_cost_per_item` | decimal | `cost_front_total / nullif(item_qty, 0)` | 件均前台成本 |
| `margin_after_front_cost_amt` | decimal | `gmv - cost_front_total` | 前台成本后经营空间 |
| `margin_after_total_cost_amt` | decimal | `gmv - total_cost_amt` | 总成本后经营空间 |
| `cost_quality_status` | string | 规则派生 | Green/Amber/Red/Grey |

### 6.7 证据与治理字段

| 字段 | 类型建议 | 必填 | 说明 |
|---|---|---:|---|
| `source_order_table` | string | 是 | 订单事实来源表名或样本来源 |
| `source_cost_table` | string | 否 | 成本分摊来源表名 |
| `cost_allocation_rule_id` | string | 否 | 成本分摊规则 ID |
| `currency_code` | string | 否 | 原币种 |
| `fx_rate` | decimal | 否 | 汇率 |
| `amount_base_currency` | string | 否 | 本位币 |
| `dq_run_id` | string | 否 | DQ 执行批次 |
| `data_quality_status` | string | 是 | `Grey` / `Amber` / `Green` / `Red` |
| `cost_gap_flags` | string | 否 | 成本缺口标记，如 `missing_back_cost` |
| `created_at` | datetime | 否 | 宽表生成时间 |
| `updated_at` | datetime | 否 | 宽表更新时间 |

## 7. 输入来源与 join 规则

| 输入资产 | 粒度 | 连接键 | 使用方式 | 风险 |
|---|---|---|---|---|
| `fact_order` | 一行一订单 | `order_id` | 主表，提供订单、销售、成本、毛利、仓库和订单类型字段 | 若成本字段合入本表，需确认字段是否已分摊 |
| `fact_order_cost` | 一行一订单或一行一订单×成本项 | `order_id` | 可选成本分摊表；如果是成本项粒度，必须先聚合到订单级 | 成本项重复会放大金额 |
| `dim_warehouse` | 一行一仓库 | `warehouse_id` | 补仓库类型、国家、FBA 标记 | 仓库 ID 与目的仓可能不一致 |
| `dim_order_type` | 一行一订单类型 | `order_type` | 补订单类型说明、促销/B2B 标记 | 订单类型枚举需统一 |
| `fact_return` | 一行一退货行 | `order_id` | 仅用于校验 `cost_refund` 或派生是否有退款，不直接替代 `cost_refund` | 一单多退货行，直接 join 会重复订单成本 |

## 8. 计算顺序

| 顺序 | 步骤 | 输出 | 门禁 |
|---:|---|---|---|
| 1 | 读取 `fact_order`，确认 `order_id` 唯一 | 订单主表 | `order_id` 不唯一则停止 |
| 2 | 如有 `fact_order_cost`，按 `order_id` 聚合成本项 | 订单级成本表 | 聚合后 `order_id` 必须唯一 |
| 3 | 合并仓库和订单类型维度 | 维度增强订单表 | 关键维度未匹配需标记 |
| 4 | 计算前台成本合计 | `cost_front_total` | 缺字段时进入 `cost_gap_flags` |
| 5 | 计算后台成本合计 | `cost_back_total` | 缺字段时进入 `cost_gap_flags` |
| 6 | 计算成本率与件均成本 | `*_pct`、`*_per_item` | `gmv = 0` 或 `item_qty = 0` 不强算 |
| 7 | 可选关联 `fact_return` 做退款存在性校验 | 退款校验字段 | 不把退款事实金额写成成本分摊 |
| 8 | 写入 `data_quality_status` | 状态字段 | 没有真实样本时固定为 `Grey` |

## 9. 指标映射

| 指标范围 | 指标 code | 来源字段 |
|---|---|---|
| 订单基础 | `ORDER-COST-001` 到 `ORDER-COST-006` | `order_id`、`gmv`、`item_qty`、`sku_qty` |
| 前台成本 | `ORDER-COST-007`、`ORDER-COST-008`、`ORDER-COST-011` 到 `ORDER-COST-013` | `cost_front_total`、`cost_promo_discount`、`cost_ad_spend`、`cost_refund` |
| 后台成本 | `ORDER-COST-009`、`ORDER-COST-010`、`ORDER-COST-014` 到 `ORDER-COST-018` | `cost_back_total`、`cost_production`、`cost_freight`、`cost_warehouse`、`cost_commission`、`cost_other` |
| 单均/件均成本 | `ORDER-COST-019` 到 `ORDER-COST-021` | `cost_front_total`、`cost_back_total`、`item_qty` |
| 毛利辅助 | `ORDER-MARGIN-001` 到 `ORDER-MARGIN-003` | `gross_margin_amt`、`gmv`、`order_id` |
| 退款辅助 | `ORDER-RETURN-003` 到 `ORDER-RETURN-005` | 可选 `fact_return` 校验，不直接写入成本口径 |

## 10. DQ 检查项

| check_id | 检查项 | 规则 | 阻断条件 |
|---|---|---|---|
| `ORDER-DQ-SCHEMA-001` | 字段存在性 | P0 字段必须存在：`order_id`、`order_date`、`country_code`、`channel_id`、`gmv`、`item_qty`、`cost_front_total`、`cost_back_total` | 缺任一 P0 字段 |
| `ORDER-DQ-PK-001` | 主键唯一性 | `order_id` 在宽表中唯一 | 重复订单且无业务解释 |
| `ORDER-DQ-TYPE-001` | 字段类型 | 金额、数量、率为数值；日期为日期 | 金额无法数值化 |
| `ORDER-DQ-NULL-001` | 空值 | P0 维度和金额字段空值率可解释 | 主键、日期、渠道或销售额为空 |
| `ORDER-DQ-RECON-001` | 成本合计重算 | `cost_front_total = promo + ad + refund`；`cost_back_total = production + freight + warehouse + commission + other` | 合计差异超阈值且无分摊说明 |
| `ORDER-DQ-RATE-001` | 率值合法性 | 主要成本率通常在 0 到 1；异常值需标记 | 大量负值或超过 1 且无法解释 |
| `ORDER-DQ-ZERO-001` | 零销售额处理 | `gmv = 0` 不计算成本率，进入异常清单 | 强行除零生成指标 |
| `ORDER-DQ-FK-001` | 维表映射 | `warehouse_id`、`order_type` 能映射维表 | P0 下钻维度无法映射 |
| `ORDER-DQ-REFUND-001` | 退款成本校验 | `cost_refund` 与 `fact_return.return_amt` 差异需解释 | 把退款事实金额直接当成本分摊 |
| `ORDER-DQ-SCM-001` | SCM 边界校验 | SCM 成本只做参考，不覆盖 ORDER 字段 | 用 `dwt_supply_chain_cost` 替代订单成本 |

## 11. 数据状态

| 状态 | 判定 | 本表允许用途 | 禁止用途 |
|---|---|---|---|
| Grey | 只有规格、mock 或样例，无真实源表和样本 | 字段缺口、源表确认、宽表规格讨论 | 成本根因、Owner 动作、正式 SQL |
| Amber | 有真实样本，P0 DQ 通过但仍有口径缺口 | 样本验证、非生产看板、待验证假设 | 管理层强结论 |
| Green | 真实源表、样本、Owner、权限、DQ 和口径签收均完成 | 看板、Agent、SQL 前置 | 无证据泛化 |
| Red | P0 DQ 失败且无业务解释 | 停止进入下游 | 看板、Agent、SQL |

当前本表状态为 `Grey`。

## 12. SCM 引用边界

| SCM 资产 | 可引用内容 | 在本表中的角色 | 禁止事项 |
|---|---|---|---|
| `dwt_supply_chain_cost` 规格 | 供应链成本节点、成本率、分摊字段、DQ 门禁 | 后台成本解释和字段补充参考 | 不替代 `fact_order` / `fact_order_cost` |
| SCM 费用科目拆解 | 采购、头程、仓储、尾程、逆向等节点 | 解释 `cost_back_total` 和 `cost_freight` 细分方向 | 不把 ORDER 变成 SCM 专题 |
| SCM Grey/Amber/Green 模型 | 数据状态和输出边界 | 治理状态复用 | Grey 状态不输出强动作 |
| `SCM-SQL-001` 门禁 | SQL 进入条件 | ORDER SQL 门禁参考 | 不创建 ORDER 正式 SQL |

## 13. 下游消费

| 下游 | 消费字段 | 输出 |
|---|---|---|
| `ORDER-BI-001` | `gmv`、`order_cnt`、`cost_front_total`、`cost_back_total`、`*_pct`、`warehouse_id`、`order_type` | 订单经营结果与成本质量总览 |
| `ORDER-AGENT-001` | 成本率、成本缺口、维度下钻、`data_quality_status` | 成本异常诊断、数据缺口、待确认问题 |
| `ORDER-DATA-004` | `gmv`、`gross_margin_amt`、`item_qty`、`order_type`、`campaign_id` | 毛利归因宽表输入 |
| `ORDER-DATA-005` | `order_id`、`cost_refund`、可选退款存在性校验 | 退款归因宽表交叉校验 |
| `XL3` | 仅消费退款归因后的主题输入，不直接消费本表成本结论 | 退款 -> VOC 编排 |

## 14. 当前不能做

| 禁止动作 | 原因 |
|---|---|
| 在 `sql/` 创建 `dwt_order_cost_quality.sql` | 真实源表、字段类型、样本和 DQ 未确认 |
| 用 Phase2 CSV 证明真实成本口径 | Phase2 是 mock 产物 |
| 直接把 `fact_return.return_amt` 写成 `cost_refund` | 两者分别是退款事实金额和订单成本分摊 |
| 用 SCM `dwt_supply_chain_cost` 替代本表 | SCM 是供应链深挖分枝，不是订单事实表 |
| 输出仓网调整、调拨、承运商切换等动作 | 本表只提供订单成本质量证据，动作需后续 Agent 且 Green 状态 |

## 15. 下一步

下一步进入：

```text
ORDER-DATA-003
```

建议新建草稿：

```text
drafts/analysis/order-topic-fulfillment-diagnosis-wide-table-spec-draft-20260603.md
```

该文件应固定 `dwt_order_fulfillment_diagnosis` 的订单履约节点、时间戳、耗时、超时、周转和 VOC 关联字段。仍不写 SQL。

## 16. 待确认决策

| 决策点 | 触发阶段 | 推荐默认 |
|---|---|---|
| `fact_order_cost` 是否独立存在 | `ORDER-SOURCE-001` | 先兼容“独立表或合入 fact_order”两种方案 |
| `cost_freight` 是否拆头程/尾程 | `ORDER-SOURCE-001` | 本表先保留合并字段，SCM 只作拆分参考 |
| `warehouse_id` 与 `dest_warehouse` 是否同义 | `ORDER-SOURCE-001` | 先并存，等真实源表确认 |
| 成本金额币种 | `ORDER-SOURCE-002` | 必须确认币种和汇率后才能进入 SQL |
| `cost_refund` 与 `return_amt` 对账阈值 | `ORDER-DQ-001` | 先列为 DQ 检查，不预设阈值 |
