---
title: 专题②本地证据与真实源表确认矩阵草稿
doc_type: analysis
module: project-governance
topic: order-topic-source-evidence-and-source-table-matrix
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②本地证据与真实源表确认矩阵草稿

## 1. 任务定位

本文件执行 `ORDER-SOURCE-001`，目标是把专题② ORDER 已完成的蓝图、指标字典、宽表规格、BI PRD、Agent 规格、Phase2 mock 输出、样例方法、XL3 输入和 SCM 参考，统一映射到待确认的真实源表、Owner、样本、DQ 和 SQL 放行条件。

当前文件只做源表确认矩阵，不创建 SQL，不声明生产源表已经存在，不把 mock 或样例产物提升为生产事实。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 工作包 | `ORDER-SOURCE-001` |
| 文件状态 | `draft` |
| 服务专题 | 专题② ORDER：订单量区域结构、履约耗时、订单价结构、退款归因 |
| 覆盖资产 | `ORDER-DATA-001` 至 `ORDER-DATA-005`、`ORDER-BI-001` 至 `ORDER-BI-004`、`ORDER-AGENT-001` 至 `ORDER-AGENT-004` |
| 核心产出 | 本地证据 -> 目标宽表 -> 候选真实源表 -> P0 样本 -> DQ -> SQL 放行矩阵 |
| 当前证据状态 | `Grey`，因为真实表名、权限、Owner、样本和 DQ 均未签收 |
| SQL 状态 | `ORDER-SQL-001` 至 `ORDER-SQL-004` 全部阻断 |
| 下一步 | `ORDER-SOURCE-002`：源系统确认包，明确 OMS、ERP、WMS、售后、客服、财务、VOC 和 SCM Owner |

## 3. 证据等级规则

| 证据层 | 当前可用内容 | 允许用途 | 禁止用途 |
|---|---|---|---|
| `planning_contract` | 数据需求矩阵、主键设计、模块输入输出规格 | 定义候选源表、粒度、字段和 join 方向 | 声明真实表已存在 |
| `mock_output` | `main_project_lute/phase2_outputs/topic2/*.csv`、`ref/phase2_io/refund_theme_input_for_voc.csv` | 验证字段形态、页面样例、Agent 输入输出 | 替代真实订单、退款、履约、成本数据 |
| `sample_method` | `data_example/专题产物/专题02/04/05` 和脚本 | 复用费率归因、四因素、组合分析方法 | 输出当前业务结论 |
| `draft_spec` | ORDER 宽表、BI、Agent 草稿 | 固定产品化规格和治理边界 | 直接进入正式 SQL |
| `scm_reference` | `scm/供应链成本指标全链路优化/` | 补充成本、履约、逆向物流参考 | 替代 ORDER 订单级事实 |
| `production_confirmed` | 待 Owner、权限、样本、DQ 签收 | 进入 DQ 和 SQL 前置 | 当前尚不存在 |

## 4. 本地证据资产矩阵

| evidence_id | 本地证据 | 类型 | 覆盖范围 | 可复用方式 | 当前限制 |
|---|---|---|---|---|---|
| `ORDER-EVD-001` | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | `planning_contract` | 四个 ORDER 子课题字段和候选源表 | 作为源表确认起点 | 不是生产表清单 |
| `ORDER-EVD-002` | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | `planning_contract` | `fact_order`、`fact_order_item`、`fact_return`、`fact_order_fulfillment`、`dim_*` 主键 | 固定粒度和 join 风险 | 真实表名待映射 |
| `ORDER-EVD-003` | `main_project_lute/Phase3_全专题与运营化/模块输入输出规格表.md` | `planning_contract` | T2-1 至 T2-4 输入输出 | 固定模块消费关系 | 字段是否已落库待确认 |
| `ORDER-EVD-004` | `main_project_lute/phase2_outputs/topic2/topic2_cost_attribution.csv` | `mock_output` | 成本、GMV、订单数、毛利字段 | `ORDER-BI-001` mock 展示和字段参考 | 聚合级，不含订单主键 |
| `ORDER-EVD-005` | `main_project_lute/phase2_outputs/topic2/topic2_leadtime_diagnostics.csv` | `mock_output` | 渠道×国家×目的仓履约耗时 | `ORDER-BI-002` mock 展示和字段参考 | 聚合级，不含节点原始时间戳 |
| `ORDER-EVD-006` | `main_project_lute/phase2_outputs/topic2/topic2_margin_attribution.csv` | `mock_output` | 订单类型、品类、毛利、GMV | `ORDER-BI-003` mock 展示和字段参考 | 聚合级，不含订单行主键 |
| `ORDER-EVD-007` | `main_project_lute/phase2_outputs/topic2/topic2_refund_attribution.csv` | `mock_output` | 退款原因、部分退、退款率 | `ORDER-BI-004` mock 展示和字段参考 | 聚合级，不含完整退货行 |
| `ORDER-EVD-008` | `main_project_lute/phase2_outputs/topic2/topic2_refund_attribution_detail.csv` | `mock_output` | 退款明细、订单、SKU/SPU、原因 | `ORDER-DATA-005` 和 `XL3` 输入前置 | 缺真实原因码维表和 VOC 原始证据 |
| `ORDER-EVD-009` | `ref/phase2_io/refund_theme_input_for_voc.csv` | `mock_output` | `refund_theme_input_for_voc` 最小字段 | `XL3-IO-001` 输入样例 | `theme_suggested` 不是 VOC 最终标签 |
| `ORDER-EVD-010` | `main_project_lute/data_example/专题产物/专题02/` | `sample_method` | 费率结构、前后台成本、卖 1 元成本 | 成本页面和归因表达方法 | 不代表当前订单级事实 |
| `ORDER-EVD-011` | `main_project_lute/data_example/专题产物/专题04/` | `sample_method` | 四因素毛利归因 | `ORDER-BI-003` 和 `ORDER-AGENT-003` 方法 | 基期和真实毛利未签收 |
| `ORDER-EVD-012` | `main_project_lute/data_example/专题产物/专题05/` | `sample_method` | 购物篮关联、支持度、置信度、提升度 | 组合候选方法 | 不等于组合策略上线证据 |
| `ORDER-EVD-013` | `main_project_lute/data_example/scripts/experimental/run_phase2_topic2_pipeline.py` | `mock_method` | Phase2 订单 mock 管道 | 字段生成逻辑参考 | 不代表生产 ETL |
| `ORDER-EVD-014` | `main_project_lute/data_example/scripts/experimental/run_phase2_crossline3_voc_agent.py` | `mock_method` | 退款输入进入 VOC Agent 的样例流程 | 固定 ORDER -> XL3 -> VOC 边界 | 不输出真实用户声音 |
| `ORDER-EVD-015` | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | `scm_reference` | `dwt_fulfillment_stability`、`dwt_reverse_logistics` | 成本、履约、逆向物流参考 | 不替代 ORDER 订单级源表 |

## 5. 目标宽表源表确认矩阵

| target_asset | 服务任务 | 目标粒度 | 本地证据 | 候选真实源表 | P0 样本必须覆盖 | 当前阻断 | SQL 放行 |
|---|---|---|---|---|---|---|---|
| `dwt_order_cost_quality` | `ORDER-DATA-002`、`ORDER-BI-001`、`ORDER-AGENT-001` | 一行一订单，`order_id` | `ORDER-EVD-001`、`ORDER-EVD-002`、`ORDER-EVD-004`、`ORDER-EVD-010`、`ORDER-EVD-015` | `fact_order`、可选 `fact_order_cost`、`dim_warehouse`、`dim_order_type`、可选 `fact_return` 校验 | `order_id`、`order_date`、`country_code`、`channel_id`、`gmv`、`item_qty`、`cost_front_total`、`cost_back_total`、`gross_margin_amt`、仓库、订单类型 | `fact_order_cost` 是否独立、成本项是否已分摊、退款成本与退款事实如何对账 | `ORDER-DQ-001` 通过后进入 `ORDER-SQL-001` |
| `dwt_order_fulfillment_diagnosis` | `ORDER-DATA-003`、`ORDER-BI-002`、`ORDER-AGENT-002` | 一行一订单履约快照，`order_id` | `ORDER-EVD-001`、`ORDER-EVD-002`、`ORDER-EVD-005`、`ORDER-EVD-015` | 首选 `fact_order_fulfillment`，备选 `fact_order` 扩展时间戳，`dim_warehouse`，可选 VOC 订单级聚合 | `order_id`、`created_at`、`paid_at`、`shipped_at`、`in_transit_at`、`cleared_at`、`delivered_at`、`timezone`、`is_overdue`、`dest_warehouse` | 独立履约表是否存在、时区、节点顺序、超时阈值、VOC join 粒度 | `ORDER-DQ-001` 通过后进入 `ORDER-SQL-002` |
| `dwt_order_margin_attribution` | `ORDER-DATA-004`、`ORDER-BI-003`、`ORDER-AGENT-003` | 一行一订单行，`(order_id, line_item_id)` | `ORDER-EVD-001`、`ORDER-EVD-002`、`ORDER-EVD-006`、`ORDER-EVD-011`、`ORDER-EVD-012` | `fact_order_item`、`fact_order`、`dim_order_type`、`dim_campaign`、`dim_spu` / `dim_sku`、可选 `dwt_order_cost_quality` | `order_id`、`line_item_id`、`sku_id`、`spu_id`、`unit_price`、`item_qty_line`、`gmv_line`、`gross_margin_amt_line`、`is_promo_line`、`is_bundle_line` | `line_item_id` 是否真实存在、订单行毛利是否有源字段、促销/组合/活动定义、基期口径 | `ORDER-DQ-001` 通过后进入 `ORDER-SQL-003` |
| `dwt_return_attribution` | `ORDER-DATA-005`、`ORDER-BI-004`、`ORDER-AGENT-004`、`XL3-IO-001` | 一行一退货行，`(return_id, return_line_id)` | `ORDER-EVD-001`、`ORDER-EVD-002`、`ORDER-EVD-007`、`ORDER-EVD-008`、`ORDER-EVD-009`、`ORDER-EVD-014`、`ORDER-EVD-015` | `fact_return`、`fact_order`、`fact_order_item`、`dim_return_reason`、`dim_spu` / `dim_sku`、可选 VOC 工单表 | `return_id`、`return_line_id`、`order_id`、`sku_id`、`spu_id`、`return_qty`、`return_amt`、`return_reason_code`、`reason_category`、`is_partial_return`、`voc_ticket_id` | `return_line_id` 是否存在、原因码映射、部分退定义、VOC 映射、退款金额和成本退款口径差异 | `ORDER-DQ-001` 通过后进入 `ORDER-SQL-004` |
| `refund_theme_input_for_voc` | `XL3-IO-001`、`ORDER-AGENT-004` | 一行一退款主题输入，建议以 `return_id` + `sku_id` 辅助去重 | `ORDER-EVD-008`、`ORDER-EVD-009`、`ORDER-EVD-014` | `dwt_return_attribution` 派生，VOC 工单表和 `dim_voc_tag` 用于后续校验 | `order_id`、`return_id`、`sku_id`、`spu_id`、`country_code`、`channel_id`、`return_reason_code`、`is_partial_return`、`theme_suggested` | `theme_suggested` 不能当最终 VOC 标签，缺 VOC 原文时不能输出用户声音 | `XL3-DQ-001` 通过后进入 XL3 编排，不进入 ORDER SQL |

## 6. BI 与 Agent 依赖矩阵

| asset_id | 资产 | 主输入 | 必需源表确认 | 证据状态 | 放行条件 |
|---|---|---|---|---|---|
| `ORDER-BI-001` | 订单经营结果与成本质量总览 | `dwt_order_cost_quality` | `fact_order`、`fact_order_cost` 或成本字段、`dim_warehouse`、`dim_order_type` | `Grey` | 成本字段、成本分摊、仓库维度、订单类型和样本 DQ 通过 |
| `ORDER-BI-002` | 履约时效与节点瓶颈诊断 | `dwt_order_fulfillment_diagnosis` | `fact_order_fulfillment` 或订单时间戳、`dim_warehouse` | `Grey` | 时间字段、时区、节点顺序、超时阈值和样本 DQ 通过 |
| `ORDER-BI-003` | 订单价结构与毛利归因 | `dwt_order_margin_attribution` | `fact_order_item`、`fact_order`、`dim_campaign`、`dim_sku` | `Grey` | 订单行主键、订单行 GMV、订单行毛利、促销/组合标记和基期通过 |
| `ORDER-BI-004` | 退款归因与售后闭环 | `dwt_return_attribution` | `fact_return`、`fact_order_item`、`dim_return_reason`、VOC 工单映射 | `Grey` | 退货行主键、原因码、部分退、VOC 映射和样本 DQ 通过 |
| `ORDER-AGENT-001` | 成本异常诊断 Agent | `dwt_order_cost_quality` | 同 `ORDER-BI-001` | `Grey` | 只能输出 gap，不能输出成本根因和仓网动作 |
| `ORDER-AGENT-002` | 履约耗时诊断 Agent | `dwt_order_fulfillment_diagnosis` | 同 `ORDER-BI-002` | `Grey` | 只能输出 gap，不能输出仓库、承运商或 Owner 责任 |
| `ORDER-AGENT-003` | 毛利归因与组合建议 Agent | `dwt_order_margin_attribution` | 同 `ORDER-BI-003`，可参考专题04/05方法 | `Grey` | 只能输出结构候选，不能输出促销因果、ROI 或组合上线 |
| `ORDER-AGENT-004` | 退款归因与 VOC 输入 Agent | `dwt_return_attribution`、`refund_theme_input_for_voc` | 同 `ORDER-BI-004`，另需 VOC / XL3 映射 | `Grey` | 只能输出订单侧建议主题，不能输出 VOC 原话、最终标签或客服责任 |

## 7. 真实源表确认清单

| candidate_source | 期望粒度与主键 | 责任域待确认 | 最小样本要求 | P0 DQ 检查 | 下游影响 |
|---|---|---|---|---|---|
| `fact_order` | 一行一订单，`order_id` | OMS / ERP / 经营 BI / 数据 Owner | 至少一个完整月，覆盖多国家、多渠道、多订单类型 | `order_id` 唯一；日期、国家、渠道、GMV、件数、毛利、仓库、订单类型非空率；金额非负；币种一致 | 四张 ORDER 宽表共同依赖 |
| `fact_order_cost` | 一行一订单或一行一订单×成本项，`order_id` + 成本项 | 财务 / 费用系统 / 数据 Owner | 同 `fact_order` 期间，覆盖前台和后台成本项 | 成本项不重复放大；总成本可与 BI 或财务样本对账；分摊规则存在 | `dwt_order_cost_quality`、`dwt_order_margin_attribution` |
| `fact_order_fulfillment` | 一行一订单履约快照，`order_id` | OMS / WMS / TMS / 仓配 / 数据 Owner | 至少一个完整履约周期，覆盖已签收和超时订单 | `order_id` 唯一；节点时间可解析；时区一致；节点顺序合法；超时阈值有规则 | `dwt_order_fulfillment_diagnosis`、SCM 履约参考 |
| `fact_order_item` | 一行一订单行，`(order_id, line_item_id)` | OMS / ERP 商品明细 / 数据 Owner | 与 `fact_order` 同期，覆盖同单多 SKU 和同 SKU 多行场景 | 主键唯一；订单 join 不丢失；SKU/SPU 非空；GMV、数量、毛利可重算 | `dwt_order_margin_attribution`、`dwt_return_attribution` |
| `fact_return` | 一行一退货行，`(return_id, return_line_id)` | 售后 / 平台退款 / 客服 / 数据 Owner | 至少一个完整售后周期，覆盖整退、部分退、多 SKU 退货 | 主键唯一；订单 join；退款金额和数量合法；原因码存在；部分退定义可重算 | `dwt_return_attribution`、`refund_theme_input_for_voc` |
| `dim_return_reason` | 一行一原因码，`return_reason_code` | 售后 / 客服 / VOC Owner | 覆盖样本期全部原因码 | 原因码唯一；`reason_category` 非空；历史变更有版本 | 退款原因、XL3 建议主题 |
| `dim_warehouse` | 一行一仓库，`warehouse_id` 或目的仓映射键 | WMS / 供应链 / SCM Owner | 覆盖订单样本中的发货仓和目的仓 | 仓库键唯一；仓库类型、国家、FBA 标记可映射 | 成本、履约、SCM handoff |
| `dim_order_type` | 一行一订单类型，`order_type` | 订单运营 / ERP / 数据 Owner | 覆盖样本期全部订单类型 | 枚举唯一；促销、B2B、普通订单标记明确 | 成本、毛利、BI 筛选器 |
| `dim_campaign` | 一行一活动，`campaign_id` | 营销 / 活动系统 / 数据 Owner | 覆盖样本中非空活动 ID | 活动 ID 唯一；活动类型、周期、国家渠道可映射 | 毛利结构参考，不替代 MKT ROI |
| `dim_spu` / `dim_sku` | 一行一 SPU/SKU | ERP 商品主数据 / 商品 Owner | 覆盖订单行和退货行 SKU/SPU | 商品键唯一；品类、颜色、尺码可映射 | 毛利、退款、组合、VOC 输入 |
| VOC 工单表 | 一行一工单或事件，需聚合到订单/退款级 | 客服 / VOC / 数据 Owner | 覆盖退款和履约异常样本中的工单 | join 前必须聚合；`voc_ticket_id` 不放大订单或退货行；原文权限明确 | `ORDER-AGENT-004`、`XL3-AGENT-001` |
| `dwt_fulfillment_stability` | SCM 履约稳定性聚合或订单/包裹粒度 | SCM / 物流 / 数据 Owner | 覆盖履约异常样本 | 不替代 `fact_order_fulfillment`；粒度差异必须标注 | 仅作 `ORDER-BI-002` 深挖参考 |
| `dwt_reverse_logistics` | 退货单/SKU/渠道/原因 | SCM / 售后 / 仓储 / 财务 | 覆盖退款异常样本 | 不替代 `fact_return`；原因、费用、返仓状态可串联 | 仅作 `ORDER-BI-004` 逆向履约参考 |

## 8. DQ 前置门禁

| dq_group | 适用资产 | 必须通过的检查 | 失败后的状态 |
|---|---|---|---|
| `ORDER-DQ-SOURCE-SCHEMA-001` | 全部候选源表 | P0 字段存在、字段类型可解析、分区字段存在 | `Red`，不得进入 SQL |
| `ORDER-DQ-SOURCE-PK-001` | `fact_order`、`fact_order_item`、`fact_return`、`fact_order_fulfillment` | 主键唯一，重复必须有业务解释 | `Red`，不得 join |
| `ORDER-DQ-SOURCE-JOIN-001` | 四张目标宽表 | 主表与维表 join 不丢失、不放大 | `Red` 或 `Amber`，视影响范围 |
| `ORDER-DQ-SOURCE-AMOUNT-001` | 成本、毛利、退款 | 金额非负、币种一致、汇率来源明确、聚合可对账 | `Amber` / `Red` |
| `ORDER-DQ-SOURCE-TIMESTAMP-001` | 履约 | 时间可解析、时区一致、节点顺序合法、负耗时可解释 | `Red` |
| `ORDER-DQ-SOURCE-REASON-001` | 退款 | 原因码可映射，`reason_category` 版本明确 | `Amber` / `Red` |
| `ORDER-DQ-SOURCE-PARTIAL-001` | 退款 | `is_partial_return` 可由退款数量和订单行数量复核 | `Amber` / `Red` |
| `ORDER-DQ-SOURCE-VOC-001` | VOC / XL3 | VOC join 不放大，原文权限和标签映射边界明确 | `Amber` / `Red` |
| `ORDER-DQ-SOURCE-SCM-001` | SCM 参考 | SCM 聚合表仅作参考，不覆盖 ORDER 主事实 | 越界时阻断 |

## 9. SQL 放行矩阵

| sql_task | 目标资产 | 当前状态 | 放行前置 | 当前结论 |
|---|---|---|---|---|
| `ORDER-SQL-001` | `dwt_order_cost_quality` | `blocked` | `fact_order`、成本字段或 `fact_order_cost`、仓库/订单类型维表、样本 DQ、成本口径 Owner 签收 | 不创建 SQL |
| `ORDER-SQL-002` | `dwt_order_fulfillment_diagnosis` | `blocked` | 履约源表、节点时间、时区、阈值、样本 DQ、仓配 Owner 签收 | 不创建 SQL |
| `ORDER-SQL-003` | `dwt_order_margin_attribution` | `blocked` | 订单行、订单毛利、活动/促销/组合标记、基期口径、样本 DQ 签收 | 不创建 SQL |
| `ORDER-SQL-004` | `dwt_return_attribution` | `blocked` | 退货行、原因码、部分退、VOC 映射、样本 DQ、售后/VOC Owner 签收 | 不创建 SQL |
| `XL3-SQL-001` | `refund_theme_input_for_voc` 或等价 IO | `blocked` | `dwt_return_attribution` Green，`theme_suggested` 规则、VOC 权限、XL3 DQ 签收 | 不创建 SQL |

## 10. 需要用户或业务 Owner 决策的问题

| decision_id | 问题 | 默认处理 | 不决策的影响 |
|---|---|---|---|
| `ORDER-SRC-DEC-001` | `fact_order_cost` 是否独立于 `fact_order` | 先两种方案并列 | 成本宽表不能进入 SQL |
| `ORDER-SRC-DEC-002` | `fact_order_fulfillment` 是否独立建表 | 独立表优先，订单扩展字段备选 | 履约节点 SQL 不能定稿 |
| `ORDER-SRC-DEC-003` | `line_item_id` 是否真实存在 | 必须优先确认；不存在则定义 ETL 生成规则 | 毛利和组合分析可能误合并订单行 |
| `ORDER-SRC-DEC-004` | `return_line_id` 是否真实存在 | 必须优先确认；不存在则定义 ETL 生成规则 | 退款部分退和 SKU 归因会失真 |
| `ORDER-SRC-DEC-005` | `cost_refund` 与 `fact_return.return_amt` 的关系 | 只做对账，不互相替代 | 成本与退款两条线会口径混淆 |
| `ORDER-SRC-DEC-006` | `return_reason_code -> reason_category` 谁维护 | 先列为售后/客服/VOC Owner 待确认 | 退款原因和 XL3 输入不可 Green |
| `ORDER-SRC-DEC-007` | VOC 工单能否按 `order_id` / `return_id` / `voc_ticket_id` 安全关联 | 只允许聚合后关联 | 直接 join 会放大订单或退货行 |
| `ORDER-SRC-DEC-008` | 履约超时阈值按国家、渠道、仓库还是履约类型配置 | 先保留 `overdue_threshold_rule_id` | 无阈值不能输出慢节点结论 |
| `ORDER-SRC-DEC-009` | 样本期选择 | 建议一个完整自然月 + 一个完整售后周期 | DQ 无法覆盖退货和履约闭环 |
| `ORDER-SRC-DEC-010` | SCM `dwt_fulfillment_stability` / `dwt_reverse_logistics` 是否已有真实表 | 只作参考，不作为 ORDER 主事实 | SCM 深挖无法联动，但不阻断 ORDER 主宽表规格 |

## 11. 下一步任务

下一步执行 `ORDER-SOURCE-002`：真实源系统确认包。

建议草稿位置为 `drafts/analysis/order-topic-source-system-confirmation-package-draft-20260603.md`。该文件需要按源系统拆分 OMS、ERP、WMS、TMS、平台售后、客服/VOC、财务、营销活动、商品主数据、SCM，并为每个源系统列出 Owner、权限、样本包、字段映射、DQ 入口和禁止越界结论。

在 `ORDER-SOURCE-002` 和 `ORDER-DQ-001` 完成前，继续保持 `ORDER-SQL-001` 至 `ORDER-SQL-004` 为阻断状态。
