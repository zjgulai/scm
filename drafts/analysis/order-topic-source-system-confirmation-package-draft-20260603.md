---
title: 专题②真实源系统确认包草稿
doc_type: analysis
module: project-governance
topic: order-topic-source-system-confirmation-package
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②真实源系统确认包草稿

## 1. 任务定位

本文件执行 `ORDER-SOURCE-002`，目标是把 `ORDER-SOURCE-001` 的“本地证据与真实源表确认矩阵”展开成可向业务和数据 Owner 发起确认的源系统工作包。

当前文件只列候选源系统、候选字段、Owner、权限、样本包、DQ 入口和禁止越界结论。不补不存在的库表名，不创建 SQL，不声明真实源系统已经确认。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 工作包 | `ORDER-SOURCE-002` |
| 上游 | `ORDER-SOURCE-001` 本地证据与真实源表确认矩阵 |
| 下游 | `ORDER-DQ-001` 样本质量校验规格 |
| 当前证据状态 | `Grey` |
| 覆盖源域 | OMS、ERP、WMS、TMS、平台售后、客服/VOC、财务、营销活动、商品主数据、SCM |
| 覆盖目标 | `fact_order`、`fact_order_cost`、`fact_order_fulfillment`、`fact_order_item`、`fact_return`、`dim_*`、VOC 工单表、SCM 参考表 |
| SQL 状态 | `ORDER-SQL-001` 至 `ORDER-SQL-004` 继续阻断 |

## 3. 上游证据

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| ORDER 源表矩阵 | `drafts/analysis/order-topic-source-evidence-and-source-table-matrix-draft-20260603.md` | 固定候选真实源表、样本、DQ 和 SQL 放行条件 | 草稿矩阵 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 提供 T2-1 至 T2-4 的字段、库表建议和数据来源 | 规划契约 |
| 主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 固定 `fact_order`、`fact_order_item`、`fact_return`、`fact_order_fulfillment` 粒度 | 规划契约 |
| 模块规格 | `main_project_lute/Phase3_全专题与运营化/模块输入输出规格表.md` | 固定专题②模块输入输出和 `refund_theme_input_for_voc` 交叉线输出 | 规划契约 |
| SCM 数据底表 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供履约稳定、逆向物流和样本包门槛参考 | SCM 参考 |

## 4. 源系统确认总表

| source_system_id | 源系统域 | 目标资产 | 候选数据对象 | 待确认 Owner | 权限要求 | 最小样本包 | DQ 入口 | 禁止越界 |
|---|---|---|---|---|---|---|---|---|
| `ORDER-SYS-OMS-001` | OMS / 平台订单 | `fact_order`、可选 `fact_order_fulfillment` | 订单主表、订单状态、订单时间戳、订单收入、取消/退款状态 | 订单运营 + 数据 Owner | 只读样本；订单 ID 可追溯；敏感用户字段脱敏 | 一个完整自然月，覆盖多国家、多渠道、多订单类型、已支付、已取消、已退款订单 | `ORDER-DQ-SOURCE-SCHEMA-001`、`ORDER-DQ-SOURCE-PK-001`、`ORDER-DQ-SOURCE-AMOUNT-001` | 不用 OMS 状态直接判定成本、毛利、售后责任 |
| `ORDER-SYS-ERP-001` | ERP 订单与商品明细 | `fact_order_item`、`dim_spu` / `dim_sku` | 订单行、SKU/SPU、数量、单价、商品主数据、品类、颜色、尺码 | ERP Owner + 商品主数据 Owner + 数据 Owner | 只读样本；商品字段可进入分析；供应商敏感字段可屏蔽 | 与订单样本同期，覆盖同单多 SKU、同 SKU 多行、组合商品、促销商品 | `ORDER-DQ-SOURCE-PK-001`、`ORDER-DQ-SOURCE-JOIN-001` | 不用商品主数据直接输出商品动作或下架建议 |
| `ORDER-SYS-FIN-001` | 财务 / 费用系统 | `fact_order_cost`、成本字段校验 | 成本凭证、费用分摊、促销折扣、广告费、仓配费、佣金、退款成本、币种汇率 | 财务 Owner + 数据 Owner | 只读样本；成本口径和分摊规则需可审计 | 与订单样本同期，覆盖前台成本、后台成本、币种、汇率、月结期间 | `ORDER-DQ-SOURCE-AMOUNT-001` | 不把财务样本写成财务总账结论或成本责任 |
| `ORDER-SYS-WMS-001` | WMS / 仓储 | `fact_order_fulfillment`、`dim_warehouse`、SCM 参考 | 出库、发货、仓库、仓型、目的仓、库存周转、仓储节点 | 仓储 Owner + 数据 Owner + SCM Owner | 只读样本；仓库编码可映射；仓储成本字段按权限提供 | 一个完整履约周期，覆盖主要仓库、目的仓、FBA/3PL/自建仓 | `ORDER-DQ-SOURCE-TIMESTAMP-001`、`ORDER-DQ-SOURCE-JOIN-001` | 不输出仓网重规划、调拨、补货动作 |
| `ORDER-SYS-TMS-001` | TMS / 承运商轨迹 | `fact_order_fulfillment`、`dwt_fulfillment_stability` 参考 | 运单、揽收、在途、清关、妥投、异常、承运商、尾程费用 | 物流 Owner + 数据 Owner + SCM Owner | 只读样本；承运商字段可匿名或按编码提供 | 一个完整履约周期，覆盖已妥投、超时、异常件和主承运商 | `ORDER-DQ-SOURCE-TIMESTAMP-001`、`ORDER-DQ-SOURCE-SCM-001` | 不输出承运商切换、赔付或 SLA 处罚结论 |
| `ORDER-SYS-AFTERSALES-001` | 平台售后 / 退货退款 | `fact_return`、`dim_return_reason`、`dwt_return_attribution` | 退货单、退款单、退货行、退款金额、原因码、部分退、售后状态 | 售后 Owner + 客服 Owner + 数据 Owner | 只读样本；退款单和原订单可关联；客户身份脱敏 | 一个完整售后周期，覆盖整退、部分退、多 SKU 退货、拒绝/完成状态 | `ORDER-DQ-SOURCE-REASON-001`、`ORDER-DQ-SOURCE-PARTIAL-001` | 不输出客服责任、商品责任或退款根因强结论 |
| `ORDER-SYS-VOC-001` | 客服 / VOC | VOC 工单表、`refund_theme_input_for_voc` 校验、`dim_voc_tag` | 工单、评论、用户原文、标签、情绪、客服分类、工单状态 | 客服 Owner + VOC Owner + 数据 Owner | 原文访问需单独授权；用户标识脱敏；只允许聚合后 join | 覆盖退款和履约异常样本中的关联工单，含可 join 的 `order_id` / `return_id` / `voc_ticket_id` | `ORDER-DQ-SOURCE-VOC-001` | ORDER 分枝不输出 VOC 原话、情绪、最终标签或用户声音结论 |
| `ORDER-SYS-MKT-001` | 营销活动 / Campaign | `dim_campaign`、可选活动结构字段 | 活动 ID、活动类型、活动周期、国家、渠道、店铺、促销标记 | 营销 Owner + 数据 Owner | 只读样本；费用和曝光另走专题④权限 | 覆盖订单样本中非空 `campaign_id` 的活动主数据 | `ORDER-DQ-SOURCE-JOIN-001` | 不输出 ROI、ROAS、曝光归因或营销动作 |
| `ORDER-SYS-PRODUCT-001` | 商品主数据 | `dim_spu` / `dim_sku` | SPU、SKU、品类、颜色、尺码、组合属性、商品状态 | 商品 Owner + ERP Owner + 数据 Owner | 只读样本；敏感供应链字段可屏蔽 | 覆盖订单行、退货行、组合候选、VOC 输入中的全部 SKU/SPU | `ORDER-DQ-SOURCE-JOIN-001` | 不输出商品下架、改款或组合上线动作 |
| `ORDER-SYS-SCM-001` | SCM 履约稳定 / 逆向物流 | `dwt_fulfillment_stability`、`dwt_reverse_logistics` 参考 | 履约稳定、尾程费用、返仓、补发、质检、报废、逆向费用 | SCM Owner + 仓储 Owner + 物流 Owner + 财务 Owner | 只读样本；粒度必须标注；费用字段按权限提供 | 覆盖 ORDER 履约异常和退款异常样本的可对齐周期 | `ORDER-DQ-SOURCE-SCM-001` | 不替代 ORDER 主事实，不输出 SCM 供应链结论 |

## 5. 样本包要求

| sample_id | 样本包 | 覆盖源系统 | 必备内容 | 最小周期 | 用途 |
|---|---|---|---|---|---|
| `ORDER-SAMPLE-001` | 订单主样本 | OMS / ERP / 经营 BI | `order_id`、订单日期、国家、渠道、店铺、订单类型、GMV、件数、毛利、仓库、活动 ID | 一个完整自然月 | 支撑 `fact_order`、成本、毛利、退款 join |
| `ORDER-SAMPLE-002` | 订单行样本 | ERP / OMS | `order_id`、`line_item_id`、SKU/SPU、单价、数量、订单行 GMV、订单行毛利、促销/组合标记 | 与 `ORDER-SAMPLE-001` 同期 | 支撑毛利、组合、退款回溯 |
| `ORDER-SAMPLE-003` | 成本样本 | 财务 / 费用系统 | 前台成本、后台成本、成本项、分摊规则、币种、汇率、月结期间 | 与订单样本同期 | 支撑成本宽表和成本 DQ |
| `ORDER-SAMPLE-004` | 履约样本 | OMS / WMS / TMS | 创建、支付、发货、在途、清关、妥投、时区、超时标记、目的仓、承运商 | 一个完整履约周期 | 支撑履约耗时宽表和 SCM handoff |
| `ORDER-SAMPLE-005` | 售后退款样本 | 平台售后 / 客服 | `return_id`、`return_line_id`、原订单、SKU/SPU、数量、金额、原因码、部分退、重复投诉、售后状态 | 一个完整售后周期 | 支撑退款归因和 XL3 输入 |
| `ORDER-SAMPLE-006` | VOC 关联样本 | 客服 / VOC | 工单 ID、订单 ID、退货 ID、标签、工单状态、可授权原文或脱敏摘要 | 与售后样本重叠 | 验证 join 和 VOC handoff，不在 ORDER 输出原文 |
| `ORDER-SAMPLE-007` | 维表样本 | 仓库、订单类型、活动、商品、退款原因 | `dim_warehouse`、`dim_order_type`、`dim_campaign`、`dim_sku`、`dim_return_reason` | 覆盖样本期全部键值 | 防止维表 join 丢失或放大 |
| `ORDER-SAMPLE-008` | SCM 参考样本 | SCM / 仓储 / 物流 / 售后 | `dwt_fulfillment_stability`、`dwt_reverse_logistics` 相关周期样本 | 与履约/售后样本重叠 | 只做解释参考，不替代 ORDER 主表 |

## 6. 字段确认包

| target | 必须确认字段 | 可选字段 | 必须确认的问题 |
|---|---|---|---|
| `fact_order` | `order_id`、`order_date`、`country_code`、`channel_id`、`gmv`、`item_qty`、`gross_margin_amt` | `shop_id`、`warehouse_id`、`dest_warehouse`、`order_type`、`campaign_id`、`created_at`、`paid_at`、`shipped_at`、`delivered_at` | 是否一行一订单；成本和履约字段是否合入本表；币种和金额口径 |
| `fact_order_cost` | `order_id`、成本项、成本金额、成本期间、分摊规则 | `cost_promo_discount`、`cost_ad_spend`、`cost_refund`、`cost_production`、`cost_freight`、`cost_warehouse`、`cost_commission`、`cost_other` | 是否独立表；一行一订单还是一行一订单×成本项；是否已分摊 |
| `fact_order_fulfillment` | `order_id`、`created_at`、`paid_at`、`shipped_at`、`delivered_at`、`timezone`、`is_overdue` | `in_transit_at`、`cleared_at`、`carrier_id`、`fulfillment_type`、`turnover_days`、`voc_ticket_id` | 是否独立表；时区；超时阈值；节点顺序；是否有多包裹 |
| `fact_order_item` | `order_id`、`line_item_id`、`sku_id`、`spu_id`、`unit_price`、`item_qty`、`gmv_line` | `gross_margin_amt_line`、`is_promo`、`is_bundle`、`category_l3` | 同单同 SKU 是否可能多行；订单行毛利是否真实存在；组合标记来源 |
| `fact_return` | `return_id`、`return_line_id`、`order_id`、`sku_id`、`return_qty`、`return_amt`、`return_reason_code`、`is_partial_return` | `spu_id`、`variant_color`、`variant_size`、`is_repeat_complaint`、`voc_ticket_id`、`after_sales_id` | 是否一行一退货行；部分退定义；原因码版本；售后状态 |
| `dim_return_reason` | `return_reason_code`、`return_reason_name`、`reason_category` | 责任初判、原因层级、有效期 | 谁维护原因码；历史变更如何处理；能否映射 VOC 标签 |
| `dim_warehouse` | `warehouse_id`、`warehouse_name`、`warehouse_type`、`country_code` | `is_fba`、区域、仓型 | 发货仓和目的仓是否同一键；仓库历史变更如何处理 |
| `dim_campaign` | `campaign_id`、`campaign_type`、`start_dt`、`end_dt` | 活动名称、国家、渠道、店铺 | 活动只做结构维度，不作为 ROI 证据 |
| `dim_spu` / `dim_sku` | `sku_id`、`spu_id`、`category_l2`、`category_l3` | 颜色、尺码、商品状态、组合属性 | SKU/SPU 历史变更和组合属性来源 |
| VOC 工单表 | `voc_ticket_id`、`order_id` 或 `return_id`、工单时间、标签 | 原文、情绪、客服分类、工单状态 | 原文权限；join 前聚合粒度；ORDER 不输出 VOC 结论 |

## 7. 权限与隐私要求

| 数据类型 | 最低权限 | 脱敏要求 | 输出边界 |
|---|---|---|---|
| 订单与订单行 | 只读样本 | 用户 ID、收货信息、联系方式不得进入样本 | 可用于订单级 DQ 和宽表规格 |
| 成本与财务 | 只读样本 + 口径说明 | 供应商或合同敏感信息可用编码 | 只做成本口径和对账，不输出财务结论 |
| 履约与物流 | 只读样本 | 承运商可编码；地址明细不进入样本 | 只做节点耗时和 DQ，不定责 |
| 售后退款 | 只读样本 | 客户身份脱敏；平台账号脱敏 | 只做退款事实、原因和部分退验证 |
| VOC 原文 | 单独授权 | 原文可脱敏或只给摘要；用户身份必须脱敏 | ORDER 只判断 handoff，不输出原话或最终标签 |
| SCM 参考 | 只读样本 | 财务、供应商、承运商敏感字段按权限处理 | 只做参考，不替代 ORDER 主事实 |

## 8. Owner 签收清单

| signoff_id | 签收对象 | 必须签收内容 | 未签收影响 |
|---|---|---|---|
| `ORDER-SIGNOFF-001` | 数据 Owner | 候选真实表名、字段存在性、分区、权限、样本交付方式 | `ORDER-DQ-001` 不启动 |
| `ORDER-SIGNOFF-002` | 订单运营 Owner | 订单类型、订单状态、订单日期、订单取消/退款状态口径 | `fact_order` 保持 Grey |
| `ORDER-SIGNOFF-003` | 财务 Owner | 成本项、成本分摊、币种汇率、月结期间、退款成本口径 | `dwt_order_cost_quality` 不进入 SQL |
| `ORDER-SIGNOFF-004` | 仓配 / 物流 Owner | 履约节点、时区、超时阈值、承运商和仓库字段 | `dwt_order_fulfillment_diagnosis` 不进入 SQL |
| `ORDER-SIGNOFF-005` | 商品 Owner | SKU/SPU、品类、颜色、尺码、组合属性、商品状态 | 毛利、组合和退款 SKU 下钻保持 Grey |
| `ORDER-SIGNOFF-006` | 售后 / 客服 Owner | 退款原因、部分退、重复投诉、售后状态、VOC 关联键 | `dwt_return_attribution` 不进入 SQL |
| `ORDER-SIGNOFF-007` | VOC Owner | VOC 工单 join、标签体系、原文权限、`dim_voc_tag` 映射 | `refund_theme_input_for_voc` 不触发 VOC 结论 |
| `ORDER-SIGNOFF-008` | SCM Owner | 履约稳定和逆向物流参考表粒度、字段和样本周期 | SCM handoff 只能停留在参考层 |

## 9. 状态转换规则

| 状态 | 判定 | 允许动作 | 禁止动作 |
|---|---|---|---|
| `Grey` | 只有规划、mock、样例和未签收候选源系统 | 源系统确认、样本包请求、字段缺口记录 | SQL、根因、Owner 责任、业务动作 |
| `Amber` | 已收到样本，但字段、口径、权限或 DQ 有差异 | 样本差异说明、DQ 修复、口径比较 | 管理层强结论、生产建议 |
| `Green` | 源表、样本、Owner、权限、DQ 和口径均签收 | 进入 `ORDER-DQ-001` 结果固化和 SQL 前置 | 无证据泛化 |
| `Red` | P0 字段缺失、主键失败、join 放大、权限不可用或越界使用 | 阻断说明、修复前置条件 | 继续生成 BI / Agent / SQL 结论 |

## 10. 仍需决策的问题

| decision_id | 决策问题 | 当前默认 | 影响 |
|---|---|---|---|
| `ORDER-SYS-DEC-001` | `fact_order_cost` 是否独立于 `fact_order` | 并列保留 | 决定 `ORDER-SQL-001` 的 CTE 结构 |
| `ORDER-SYS-DEC-002` | `fact_order_fulfillment` 是否独立建表 | 独立表优先，订单扩展字段备选 | 决定 `ORDER-SQL-002` 的主表 |
| `ORDER-SYS-DEC-003` | `line_item_id` 和 `return_line_id` 是否真实存在 | 必须先确认 | 决定毛利和退款粒度能否 Green |
| `ORDER-SYS-DEC-004` | VOC 原文权限是否可给到 DQ 或 XL3 | 先只要求 join 字段和标签映射 | 决定是否能进入 VOC 结论分枝 |
| `ORDER-SYS-DEC-005` | 履约阈值由谁维护 | 仓配 / 物流 Owner 待确认 | 决定超时和慢节点是否可解释 |
| `ORDER-SYS-DEC-006` | 样本期按自然月还是财务期间 | 订单用自然月，成本另保留财务期间字段 | 决定成本对账和经营口径 |

## 11. 下一步任务

下一步执行 `ORDER-DQ-001`：专题②样本质量校验规格。

建议草稿位置为 `drafts/analysis/order-topic-sample-quality-gate-spec-draft-20260603.md`。该文件需要把 `ORDER-SOURCE-001` 与 `ORDER-SOURCE-002` 中的 P0 字段、主键、join、金额、时间戳、退款原因、部分退、VOC 和 SCM 边界转成可执行 DQ 检查清单。

在 `ORDER-DQ-001` 完成并由 Owner 签收前，继续保持 `ORDER-SQL-001` 至 `ORDER-SQL-004` 为阻断状态。
