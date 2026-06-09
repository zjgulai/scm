---
title: 专题②订单经营结果与成本质量总览 PRD 草稿
doc_type: prd
module: project-governance
topic: order-bi-cost-quality-overview-prd
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②订单经营结果与成本质量总览 PRD 草稿

## 1. 任务定位

本文件执行 `ORDER-BI-001`，目标是固定“订单经营结果与成本质量总览”页面 PRD，支撑专题② `ORDER-T1`：订单量区域结构 -> 后台成本 / 仓网。

当前页面只消费 `dwt_order_cost_quality` 规格、ORDER 指标字典和 Phase2 mock 输出，不接真实生产 SQL，不输出真实业务根因，不触发仓网、调拨、促销或供应链动作。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 页面 ID | `ORDER-BI-001` |
| 页面名称 | 订单经营结果与成本质量总览 |
| 主输入 | `dwt_order_cost_quality` |
| 参考输入 | SCM 成本科目和 Grey/Amber/Green 门禁 |
| 服务对象 | 订单运营、成本分析、仓网协同、数据 Owner、订单 Agent |
| 页面目标 | 判断订单增长是否有质量、前后台成本是否拖累经营结果、异常范围在哪里 |
| 当前状态 | `Grey`，因为真实源表、样本 DQ、Owner、权限和成本口径未签收 |
| SQL 状态 | 不创建 SQL；`ORDER-DQ-001` 通过后再进入 `ORDER-SQL-001` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| 四专题治理计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定 `ORDER-BI-001` 页面任务 | 草稿计划 |
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定页面核心问题、输入和组件 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-COST-*` 指标公式 | 草稿指标字典 |
| 成本质量宽表规格 | `drafts/analysis/order-topic-cost-quality-wide-table-spec-draft-20260603.md` | 固定 `dwt_order_cost_quality` 字段、DQ 和边界 | 草稿数据规格 |
| Phase2 成本输出 | `main_project_lute/phase2_outputs/topic2/topic2_cost_attribution.csv` | 提供国家×渠道成本率样例 | mock 产物 |
| SCM 成本规格 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供 SCM 成本节点和逆向参考 | SCM 参考 |

## 4. 页面边界

| 边界 | 页面负责 | 页面不负责 |
|---|---|---|
| 经营结果 | 订单数、GMV、件数、品数、毛利额、毛利率 | 财务总账、利润表、税费 |
| 成本质量 | 前台成本、后台成本、成本率、单均成本、件均成本 | 供应商绩效、采购批次、库存库龄 |
| 仓网线索 | 国家、渠道、仓库、目的仓下的后台成本差异 | 仓网重规划、调拨、承运商切换 |
| 异常定位 | 标记 Amber/Red 维度范围、成本缺口、DQ 缺口 | 责任定责、自动派单、管理层强结论 |
| SCM 引用 | 解释后台成本科目和门禁 | 用 SCM 表替代订单事实 |
| Agent 入口 | 向 `ORDER-AGENT-001` 传递筛选范围和证据状态 | 让 Agent 在 Grey 状态输出根因和动作 |

## 5. 用户与使用场景

| 用户 | 核心问题 | 页面应给出的结果 |
|---|---|---|
| 订单运营 | 订单增长是否带来有效 GMV 和毛利 | 订单数、GMV、毛利率、客件数、客品数趋势 |
| 成本分析 | 前台还是后台成本拖累经营质量 | 前后台成本率、成本结构、单均和件均成本 |
| 仓网协同 | 哪些国家、渠道、仓库成本异常 | 国家×渠道热力、仓库/目的仓下钻 |
| 数据 Owner | 哪些字段或口径还不能生产化 | DQ 状态、字段缺口、不可用指标 |
| 订单 Agent Owner | 哪些范围可进入异常诊断 | 筛选上下文、指标快照、数据状态 |

## 6. 页面信息架构

| 区块 | 组件 | 目的 | 状态规则 |
|---|---|---|---|
| A. 状态栏 | 数据状态、样本范围、DQ 摘要、SQL 状态 | 先告诉用户当前证据等级 | `Grey` 时固定提示“仅规格 / mock，不输出业务结论” |
| B. 全局筛选 | 时间、国家、渠道、店铺、仓库、目的仓、订单类型、成本状态 | 控制所有组件范围 | 未确认字段显示为不可用 |
| C. 经营结果 KPI | 订单数、GMV、件数、品数、毛利额、毛利率 | 判断经营基本盘 | 真实基期未确认时不展示同比强结论 |
| D. 成本质量 KPI | 前台成本率、后台成本率、总成本率、单均前台成本、单均后台成本、件均后台成本 | 判断成本拖累 | 成本字段缺口进入 `cost_gap_flags` |
| E. 成本结构视图 | 前台 / 后台成本堆叠条、成本科目拆分 | 定位成本来源 | 仅展示范围，不输出责任 |
| F. 国家×渠道热力 | `country_code × channel_id` 成本率、毛利率、订单数 | 找异常区域 | 点击后下钻，不自动定责 |
| G. 仓网下钻 | `warehouse_id`、`dest_warehouse`、`warehouse_type` 成本与订单结构 | 找仓网相关线索 | 动作需 SCM 或 Agent 后续确认 |
| H. 订单类型视图 | `order_type` 下 GMV、订单数、成本率、毛利率 | 连接 T3 毛利归因 | 不替代 `ORDER-BI-003` |
| I. 数据缺口面板 | 字段缺失、DQ 失败、维表未匹配、SCM 边界提示 | 让治理问题可见 | `Grey` 状态的主输出之一 |
| J. Agent 入口 | 选定范围后触发 `ORDER-AGENT-001` | 输出异常诊断请求 | Grey 状态只允许输出缺口和待确认问题 |

## 7. 全局筛选器

| 筛选器 | 字段 | 必填 | 说明 |
|---|---|---:|---|
| 时间 | `order_date`、`dt_month` | 是 | 支持日、月、分析期 |
| 国家 | `country_code` | 是 | 默认全部 |
| 渠道 | `channel_id` | 是 | 默认全部 |
| 站点 | `site` | 否 | 源字段未确认时不可用 |
| 店铺 | `shop_id` | 否 | 支持店铺下钻 |
| 仓库 | `warehouse_id` | 否 | 发货仓或关联仓 |
| 目的仓 | `dest_warehouse` | 否 | 用于仓网成本线索 |
| 仓库类型 | `warehouse_type` | 否 | 来自 `dim_warehouse` |
| 订单类型 | `order_type` | 是 | 标准、促销、组合、会员、B2B 等 |
| 数据状态 | `data_quality_status` | 是 | `Grey` / `Amber` / `Green` / `Red` |
| 成本缺口 | `cost_gap_flags` | 否 | 过滤缺成本字段的记录 |

## 8. 指标与卡片

| 卡片 | 指标 | 公式 | 来源 |
|---|---|---|---|
| 订单数 | `ORDER-COST-001` | `count(distinct order_id)` | `dwt_order_cost_quality.order_id` |
| GMV | `ORDER-COST-002` | `sum(gmv)` | `gmv` |
| 件数 | `ORDER-COST-003` | `sum(item_qty)` | `item_qty` |
| 品数 | `ORDER-COST-004` | `sum(sku_qty)` | `sku_qty` |
| 客件数 | `ORDER-COST-005` | `sum(item_qty) / count(distinct order_id)` | `item_qty`、`order_id` |
| 客品数 | `ORDER-COST-006` | `sum(sku_qty) / count(distinct order_id)` | `sku_qty`、`order_id` |
| 前台成本率 | `ORDER-COST-008` | `sum(cost_front_total) / sum(gmv)` | `cost_front_total`、`gmv` |
| 后台成本率 | `ORDER-COST-010` | `sum(cost_back_total) / sum(gmv)` | `cost_back_total`、`gmv` |
| 总成本率 | 扩展指标 | `sum(total_cost_amt) / sum(gmv)` | 派生字段 |
| 单均前台成本 | `ORDER-COST-019` | `sum(cost_front_total) / count(distinct order_id)` | `cost_front_total` |
| 单均后台成本 | `ORDER-COST-020` | `sum(cost_back_total) / count(distinct order_id)` | `cost_back_total` |
| 件均后台成本 | `ORDER-COST-021` | `sum(cost_back_total) / sum(item_qty)` | `cost_back_total`、`item_qty` |
| 毛利率 | `ORDER-MARGIN-002` 辅助 | `sum(gross_margin_amt) / sum(gmv)` | `gross_margin_amt`、`gmv` |

Grey 状态下，所有卡片只展示“可计算 / 不可计算 / 缺口原因”。未签收真实样本前，不展示同比、环比、责任归因或业务动作。

## 9. 图表与表格规格

| 模块 | 图表 / 表格 | 维度 | 指标 | 交互 |
|---|---|---|---|---|
| 经营结果趋势 | 折线 + KPI 卡 | `dt_month` | 订单数、GMV、毛利率 | 点击月份过滤全页 |
| 成本结构堆叠 | 堆叠条形图 | 前台 / 后台 / 总成本 | `cost_front_total`、`cost_back_total`、`total_cost_amt` | 点击成本层进入科目拆分 |
| 前台成本拆分 | 条形图 | 促销、广告、退款 | `cost_promo_discount`、`cost_ad_spend`、`cost_refund` | 点击科目过滤明细 |
| 后台成本拆分 | 条形图 | 生产、头程、仓配、佣金、其他 | `cost_production`、`cost_freight`、`cost_warehouse`、`cost_commission`、`cost_other` | 点击科目进入下钻 |
| 国家×渠道热力 | 热力图 | `country_code`、`channel_id` | 前台成本率、后台成本率、毛利率、订单数 | 点击单元格带入筛选 |
| 仓网成本散点 | 散点图 | `warehouse_id` / `dest_warehouse` | 订单数、后台成本率、件均后台成本 | 高成本高订单量优先标记 |
| 订单类型矩阵 | 明细表 | `order_type` | GMV、订单数、成本率、毛利率、客件数 | 跳转 `ORDER-BI-003` |
| 异常范围清单 | 表格 | 国家、渠道、仓库、订单类型 | 指标、状态、缺口、建议下一步 | 触发 Agent |
| DQ 缺口面板 | 表格 | check_id | 通过率、失败原因、阻断状态 | 跳转数据治理任务 |

## 10. 状态与颜色规则

| 状态 | 判定 | 页面行为 | 禁止行为 |
|---|---|---|---|
| Grey | 只有规格、mock 或样例，无真实源表和样本 | 展示字段缺口、组件设计、mock 示例 | 业务结论、原因定责、动作建议 |
| Amber | 有真实样本，P0 DQ 通过但口径未完全签收 | 展示待验证异常、样本趋势、DQ 提醒 | 管理层强结论 |
| Green | 源表、样本、Owner、权限、DQ 和口径均通过 | 展示看板、触发 Agent、进入 SQL 前置 | 无证据泛化 |
| Red | P0 DQ 失败且无业务解释 | 阻断看板数据展示，只显示缺口 | Agent 诊断、SQL、动作建议 |

页面顶部必须始终展示 `data_quality_status`。当状态不是 `Green` 时，所有导出、Agent 触发和管理层摘要都要带证据等级。

## 11. Agent 入口

| 入口 | 输入 | 输出 | 护栏 |
|---|---|---|---|
| 成本异常诊断 | 当前筛选范围、KPI、成本拆分、DQ 状态 | 异常范围、字段缺口、待确认问题 | Grey 只输出缺口 |
| 仓网成本线索 | 国家、渠道、仓库、目的仓、后台成本率 | 需要 SCM 深挖的候选范围 | 不输出调拨或仓网动作 |
| 前台成本线索 | 促销、广告、退款成本率 | 需要 ORDER-T3 / MKT / T4 深挖的候选范围 | 不输出营销 ROI 结论 |
| 数据治理诊断 | DQ 检查失败项、字段缺口 | 源表确认清单、Owner 待办 | 不绕过 DQ 门禁 |

`ORDER-AGENT-001` 的默认输出必须包含证据状态、使用字段、不可用字段和下一步确认项。没有真实样本时，不允许输出“成本高是因为某仓库/某渠道”的根因句。

## 12. 数据与刷新规则

| 项 | 规则 |
|---|---|
| 数据来源 | `dwt_order_cost_quality` |
| 当前可用数据 | Phase2 mock `topic2_cost_attribution.csv` 仅作页面样例 |
| 刷新频率 | 真实源表确认前不定义正式频率 |
| 分区 | `order_date` |
| 月度聚合 | `dt_month` |
| 权限 | 按国家、渠道、店铺、成本字段分级，待 Owner 确认 |
| 导出 | Grey 状态只允许导出字段缺口和 mock 示例，不导出业务结论 |
| SQL | `ORDER-DQ-001` 通过前不创建正式 SQL |

## 13. 验收标准

| 编号 | 标准 | 通过条件 |
|---|---|---|
| `ORDER-BI-001-AC-001` | 页面目标明确 | 能回答订单增长质量、前后台成本拖累和异常范围 |
| `ORDER-BI-001-AC-002` | 输入边界明确 | 只以 `dwt_order_cost_quality` 为主输入，SCM 只作参考 |
| `ORDER-BI-001-AC-003` | 指标口径明确 | KPI 均能映射到 `ORDER-COST-*` 或宽表派生字段 |
| `ORDER-BI-001-AC-004` | 下钻路径明确 | 国家、渠道、仓库、订单类型均有筛选和下钻规则 |
| `ORDER-BI-001-AC-005` | DQ 护栏明确 | Grey / Amber / Green / Red 行为不同 |
| `ORDER-BI-001-AC-006` | Agent 护栏明确 | Grey 状态只输出缺口，不输出根因和动作 |
| `ORDER-BI-001-AC-007` | 不创建 SQL | 文档只定义 PRD，不生成 `sql/` 资产 |

## 14. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 基期展示 | 先不展示同比 / 环比 | 业务是否有固定同期、环比或 YTD 口径 |
| 仓库字段 | `warehouse_id` + `dest_warehouse` 并存 | 发货仓和目的仓在真实系统是否不同 |
| 前台成本拆分 | 促销、广告、退款 | `cost_refund` 是否稳定来自成本分摊 |
| 后台成本拆分 | 生产、头程、仓配、佣金、其他 | 是否能从订单级拆到成本项 |
| 状态阈值 | 先复用 Grey/Amber/Green | Amber / Red 成本率阈值由谁签收 |
| 导出权限 | Grey 只导出缺口 | 成本字段是否需要权限隔离 |
| Agent 触发 | 只允许带证据状态触发 | 哪些角色能触发 `ORDER-AGENT-001` |

## 15. 下一步任务

下一步执行 `ORDER-BI-002`：订单履约时效与节点瓶颈诊断 PRD。

建议落盘文件：

`drafts/docs/order-bi-fulfillment-diagnosis-prd-draft-20260603.md`

进入条件：

1. 复核 `dwt_order_fulfillment_diagnosis` 宽表规格。
2. 明确节点耗时、超时率、周转天数和 VOC 线索的页面边界。
3. 固定页面模块、筛选器、节点下钻、DQ 提醒和 Agent 入口。
4. 继续保持 `Grey` 状态，不创建正式 SQL。
