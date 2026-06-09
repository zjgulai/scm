---

entity_id: ecom-70-1-data-b578
entity_type: resource
title: (data)课题一:专题分析数据需求底表
definition: '文档类型: 文档 > 来源链接: https://alidocs.dingtalk.com/i/nodes/7NkDwLng8ZK644BNCaZY0E7kWKMEvZBY?utm_scene=person_space'
taxonomy_path: 外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化
created: '2026-04-25'
updated: '2026-06-02'
skill_ready: false
product_ready: false
legacy_fields:
  original_filename: (data)课题一:专题分析数据需求底表.url
  source_folder: 2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1:供应链成本指标全链路优化/(data)课题一:专题分析数据需求底表.url
  migrated_at: 2026-04-25
doc_type: analysis
source: human+ai
owner: self
topic: "（data）课题一：专题分析数据需求底表"
module: "scm"
source_url: https://alidocs.dingtalk.com/i/nodes/7NkDwLng8ZK644BNCaZY0E7kWKMEvZBY?utm_scene=person_space
migrated_from: 20-Areas/跨境电商工作知识库
migrated_at: '2026-04-29'
related:
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(data)课题一:供应链指标体系-指标字典
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(data)课题一:供应链指标体系-结构化拆解
- 30-resources-moc-indexmocexternal-docs
status: stable
tags:
  - scm
  - supply-chain
  - data-rebuild

---
# （data）课题一：专题分析数据需求底表

> **文档类型**: 文档
> **来源链接**: [https://alidocs.dingtalk.com/i/nodes/7NkDwLng8ZK644BNCaZY0E7kWKMEvZBY?utm_scene=person_space](https://alidocs.dingtalk.com/i/nodes/7NkDwLng8ZK644BNCaZY0E7kWKMEvZBY?utm_scene=person_space)

---

## 原始信息
- 原始文件名: `（data）课题一：专题分析数据需求底表.url`
- 文件类型: URL 快捷方式
- 原始路径: `2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1：供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.url`

## 相关链接

- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（data）课题一：供应链指标体系-指标字典|（data）课题一：供应链指标体系-指标字典]]
- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（data）课题一：供应链指标体系-结构化拆解|（data）课题一：供应链指标体系-结构化拆解]]

---

## 本地重建说明

本节为基于当前项目本地资料重建的 Data 层入口，不等同于钉钉原文复制。当前外部链接需要登录，无法直接抓取正文；本地重建依据来自：

- `scm/02_Momcozy_KPI体系设计.md`
- `ref/books/供应链36%方案_Page6节点/02-企业问题树与指标口径重构.md`
- `ref/books/供应链36%方案_Page6节点/04-供应链大数据平台与算法模型方案.md`
- `ref/books/供应链36%方案_Page6节点/供应链课题/供应链成本分析正式稿_费用深拆版.md`

## 1. 数据底表定位

专题分析数据需求底表是供应链成本专题的取数总入口。它不直接承担汇报叙事，而是定义后续 4 类资产的取数边界：

| 下游资产 | 依赖本表的内容 | 失效风险 |
|---|---|---|
| 费用科目拆解 | 成本科目、节点、分摊口径 | 节点成本率不可比 |
| 成本效率指标体系 | 指标分母、维度、频率 | 指标同名不同义 |
| 指标字典 | 指标字段、公式、Owner | 看板与报告口径漂移 |
| 结构化拆解 | L1/L2/L3/L4 指标树 | 无法从经营问题追到执行动作 |

## 2. 统一维度字典

| 维度 | 标准字段建议 | 使用场景 | 优先级 |
|---|---|---|---:|
| 时间 | `biz_date`、`year_month`、`fiscal_period`、`mat_period` | MAT 对比、月度趋势、异常预警 | P0 |
| 组织 | `gtm_group`、`business_unit`、`owner_name` | GTM 与责任人归因 | P0 |
| 渠道 | `channel`、`platform`、`fulfillment_type` | Amazon/FBA/FBM/DTC/Offline 成本对比 | P0 |
| 地域 | `region`、`country`、`warehouse_region` | 北美/欧洲/拉美等区域归因 | P0 |
| 商品 | `category`、`product_line`、`spu`、`sku` | 品类成本、长尾 SKU、库存健康 | P0 |
| 节点 | `cost_node`、`operation_node` | 采购/头程/仓储/尾程/退换补发/直邮 | P0 |
| 仓网 | `warehouse_id`、`warehouse_type`、`ship_from`、`ship_to` | 仓网、调拨、海外仓/FBA 分析 | P1 |
| 供应商 | `supplier_id`、`supplier_name`、`supplier_level` | 采购降本、交付稳定、供应商评分 | P1 |
| 订单 | `order_id`、`shipment_id`、`tracking_no` | 履约时效、尾程费用、退货归因 | P1 |

## 3. 主题宽表需求

| 主题宽表 | 目标粒度 | 核心字段 | 支撑问题 | 来源系统 |
|---|---|---|---|---|
| `dwt_supply_chain_cost` | 月/渠道/区域/GTM/品类/SKU/节点 | 销售额、采购、头程、仓储、尾程、退换补发、直邮、总成本率 | 成本率为什么高、哪个节点驱动 | 财务、ERP、物流对账、平台账单 |
| `dwt_inventory_health` | 日/仓/SKU/区域/渠道 | 在库、在途、未交 PO、库存金额、周转天数、库龄 90+/180+ | 库存为什么占钱、哪里超龄 | ERP、WMS、采购系统 |
| `dwt_supplier_performance` | 月/供应商/GTM/品类 | 准交率、质检通过率、降本率、价格竞争力、稳定性评分 | 采购端为何对冲物流降本 | ERP、采购系统、质检系统 |
| `dwt_fulfillment_stability` | 订单/包裹/渠道/国家 | 发货时效、揽收时效、在途时效、签收时效、配送成本 | 履约体验与成本是否平衡 | OMS、WMS、TMS、平台物流 |
| `dwt_reverse_logistics` | 退货单/SKU/渠道/原因 | 退货原因、退货运费、补发成本、返仓可售率、处理时效 | 逆向链路如何影响成本率 | 退货系统、客服、WMS、财务 |

## 4. `SCM-DATA-002` 成本主题宽表规格

`SCM-DATA-002` 对应 `dwt_supply_chain_cost`。当前只固化宽表规格和验收口径，不创建生产 SQL；真实 SQL 需要等源系统、源表、字段、币种和刷新链路确认后再进入 `sql/` 或 Data Agent 任务。

### 4.1 宽表定位

| 项目 | 规格 |
|---|---|
| 目标表 | `dwt_supply_chain_cost` |
| 业务目标 | 支撑全链路供应链成本率、成本增速、同比降本率和节点成本归因 |
| 推荐粒度 | `year_month` + `region` + `channel` + `gtm_group` + `category` + `sku` + `cost_node` |
| 刷新频率 | 月度正式刷新，周度可做试算 |
| 下游页面 | P0 经营结果总览、P1 成本结构归因 |
| 下游 Agent | `SCM-AGENT-001` 成本异常诊断 |
| 当前状态 | 规格稳定，真实源表待确认 |

### 4.2 主键与维度字段

| 字段 | 说明 | 是否必填 | 来源要求 |
|---|---|---:|---|
| `year_month` | 业务月份 | 是 | 财务结账口径 |
| `mat_period` | MAT 周期标签 | 是 | 支持 MAT2025P2 / MAT2026P2 对比 |
| `region` | 经营区域 | 是 | 与主项目区域口径一致 |
| `country` | 国家 | 否 | 可为空，但区域不能为空 |
| `channel` | 渠道或平台 | 是 | Amazon、DTC、Offline 等 |
| `fulfillment_type` | 履约方式 | 是 | FBA、FBM、3PL、直邮等 |
| `gtm_group` | GTM 分组 | 是 | 与经营分析口径一致 |
| `category` | 品类 | 是 | 支持母婴品类拆解 |
| `spu` | SPU | 否 | 可用于聚合 SKU |
| `sku` | SKU | 是 | 成本分摊最低粒度 |
| `cost_node` | 成本节点 | 是 | 采购、头程、仓储、尾程、退换补发、直邮 |

### 4.3 金额与指标字段

| 字段 | 公式或口径 | 支撑指标 |
|---|---|---|
| `sales_amount` | 财务确认销售额，需说明含税和退款冲减 | `SC-L1-001`、`SC-L1-002` |
| `gmv_amount` | 平台 GMV 或经营 GMV，需与销售额区分 | 看板辅助分析 |
| `purchase_cost` | 商品采购与合规相关成本 | 采购费率、采购降本 |
| `first_leg_cost` | 头程运输、港杂、清关等费用 | `SC-IN-L3-001` |
| `warehouse_cost` | 仓租、操作费、长期仓储费、损耗 | 仓储成本率、长期仓储费占比 |
| `last_mile_cost` | 尾程配送、偏远、超重、燃油等费用 | `SC-OUT-L3-001` |
| `reverse_cost` | 退货、补发、返仓、质检、报废等费用 | 退货处理成本率 |
| `direct_mail_cost` | 小包直邮相关费用 | 直邮成本率 |
| `allocated_cost` | 分摊后节点成本 | 所有节点成本率 |
| `raw_cost` | 分摊前原始成本 | 费用追溯 |
| `total_supply_chain_cost` | 节点成本合计 | `SC-L1-001` |
| `four_item_cost` | 采购 + 头程 + 尾程 + 仓储 | MAT 正式稿对齐 |
| `cost_rate` | `total_supply_chain_cost / sales_amount` | `SC-L1-001` |
| `four_item_cost_rate` | `four_item_cost / sales_amount` | 四项重算对齐 |
| `yoy_cost_reduction_rate` | 去年同期单位成本与本期单位成本差异 | `SC-L1-003` |

### 4.4 源系统映射

| 数据域 | 源系统候选 | 必须确认的问题 |
|---|---|---|
| 销售 | 财务系统、平台账单、OMS | 销售额与 GMV 差异、退款冲减、币种 |
| 采购 | ERP、采购系统、财务凭证 | 标准成本、实际成本、供应商维度 |
| 头程 | TMS、货代账单、关务系统 | 航次、批次、体积、重量、SKU 分摊 |
| 仓储 | WMS、3PL 账单、FBA 账单 | FBA、3PL、自建仓是否分账 |
| 尾程 | TMS、平台物流账单、快递账单 | 订单、包裹、国家和物流商映射 |
| 逆向 | 退货系统、客服系统、WMS、财务 | 退货原因、补发费用、返仓可售率 |

### 4.5 验收规则

1. 宽表必须能按 `year_month` 对齐 MAT2025P2 与 MAT2026P2。
2. `total_supply_chain_cost` 必须等于节点成本合计；若节点缺失，必须产出缺口标记。
3. `raw_cost`、`allocated_cost`、`allocation_rule` 必须同时保留，不能只保留分摊结果。
4. 成本率指标不得在 `sales_amount = 0` 的行中强行计算，应进入异常样本清单。
5. P0 看板上线前，`SC-L1-001`、`SC-L1-002`、`SC-L1-003`、`SC-IN-L3-001`、`SC-OUT-L3-001` 五个指标必须能由本表独立计算。

## 5. `SCM-DATA-003` 库存健康宽表规格

`SCM-DATA-003` 对应 `dwt_inventory_health`。当前只固化宽表规格、字段口径和验收条件，不创建生产 SQL；真实 SQL 需要等 ERP、WMS、采购、计划系统的源表和刷新链路确认后再进入 `sql/` 或 Data Agent 任务。

### 5.1 宽表定位

| 项目 | 规格 |
|---|---|
| 目标表 | `dwt_inventory_health` |
| 业务目标 | 支撑库存周转、库龄健康、缺货风险、调拨候选和现金流占用诊断 |
| 推荐粒度 | `biz_date` + `region` + `country` + `warehouse_id` + `channel` + `gtm_group` + `category` + `sku` |
| 刷新频率 | 日度试算，月度正式结账口径 |
| 下游页面 | P0 库存与履约护栏、P2 库存健康与现金流 |
| 下游 Agent | `SCM-AGENT-002` 库存健康诊断 |
| 当前状态 | 规格稳定，真实源表待确认 |

### 5.2 主键与维度字段

| 字段 | 说明 | 是否必填 | 来源要求 |
|---|---|---:|---|
| `biz_date` | 库存快照日期 | 是 | WMS/ERP 日快照 |
| `year_month` | 业务月份 | 是 | 支持月度结账与看板汇总 |
| `region` | 经营区域 | 是 | 与成本宽表区域口径一致 |
| `country` | 国家 | 否 | 可为空，但区域不能为空 |
| `warehouse_id` | 仓库 ID | 是 | FBA、3PL、自建仓需可区分 |
| `warehouse_type` | 仓型 | 是 | FBA/3PL/自建仓/中转仓/退货仓 |
| `channel` | 渠道或平台 | 是 | 与订单和成本口径一致 |
| `gtm_group` | GTM 分组 | 是 | 与经营分析口径一致 |
| `category` | 品类 | 是 | 支持母婴品类拆解 |
| `sku` | SKU | 是 | 库存与调拨最低分析粒度 |

### 5.3 库存与指标字段

| 字段 | 公式或口径 | 支撑指标 |
|---|---|---|
| `on_hand_qty` | 仓内实物库存件数 | 可售库存、库容利用 |
| `available_qty` | 可售库存件数 | 现货满足率、缺货率 |
| `reserved_qty` | 已锁定库存件数 | 可售库存解释 |
| `in_transit_qty` | 在途库存件数 | 供需缺口、补货判断 |
| `open_po_qty` | 未交 PO 件数 | 计划与供应阻塞 |
| `inventory_amount` | 库存金额 | 资金占用、库龄金额 |
| `avg_inventory_amount` | 平均库存金额 | `SC-IV-L4-002` |
| `cogs_amount` | 销售成本 | `SC-IV-L4-002` |
| `inventory_turnover_days` | `avg_inventory_amount / (cogs_amount / 365)` | `SC-IV-L4-002` |
| `aging_90p_amount` | 库龄 90 天以上库存金额 | 库龄结构健康度 |
| `aging_180p_amount` | 库龄 180 天以上库存金额 | `SC-IV-L3-004` |
| `long_term_storage_cost` | 长期仓储费 | `SC-IV-L3-004` |
| `warehouse_cost` | 仓储费用 | 仓储成本率 |
| `stockout_order_qty` | 缺货订单数 | `FD-IV-L4-003` |
| `total_order_qty` | 总订单数 | `FD-IV-L4-003` |
| `stockout_rate` | `stockout_order_qty / total_order_qty` | `FD-IV-L4-003` |
| `spot_fulfillment_rate` | 有库存可发 SKU / 总 SKU | `FD-IV-L4-001` |
| `transfer_candidate_flag` | 是否进入调拨候选 | P2 调拨候选池 |
| `inventory_risk_status` | Green/Amber/Red/Grey | P2 风险规则 |

### 5.4 源系统映射

| 数据域 | 源系统候选 | 必须确认的问题 |
|---|---|---|
| 仓内库存 | WMS、FBA 库存报表、3PL 账单 | 可售、锁定、残次、待质检是否分开 |
| 在途库存 | TMS、采购系统、ERP | 在途节点、预计到仓日、批次与 SKU 映射 |
| 未交 PO | ERP、采购系统、计划系统 | PO 状态、供应商、交期、取消量 |
| 库存金额 | ERP、财务系统 | 成本法、币种、汇率、跌价准备 |
| 销售成本 | 财务系统、ERP | 与销售期间和 SKU 口径对齐 |
| 缺货订单 | OMS、平台订单、客服系统 | 缺货定义、取消订单是否纳入 |
| 仓储费用 | WMS、FBA/3PL 账单、财务 | 长期仓储费与普通仓储费是否分开 |

### 5.5 验收规则

1. `on_hand_qty`、`in_transit_qty`、`open_po_qty` 必须能并行展示，不能只看仓内库存。
2. `inventory_turnover_days` 的库存金额和销售成本必须来自同一期间。
3. 90+/180+ 库龄必须能下钻到仓、SKU、区域和 GTM。
4. 缺货率必须使用缺货订单和总订单的同一履约口径，不能混用客服投诉数。
5. 调拨候选只输出建议和收益测算，不自动执行。

## 6. `SCM-DATA-004` 供应商绩效宽表规格

`SCM-DATA-004` 对应 `dwt_supplier_performance`。当前只固化宽表规格、字段口径和验收条件，不创建生产 SQL；真实 SQL 需要等 ERP、采购系统、质检系统、计划系统和财务系统的源表确认后再进入 `sql/` 或 Data Agent 任务。

### 6.1 宽表定位

| 项目 | 规格 |
|---|---|
| 目标表 | `dwt_supplier_performance` |
| 业务目标 | 解释采购端上行、供应商结构差异、准交稳定性、质检风险和采购降本机会 |
| 推荐粒度 | `year_month` + `supplier_id` + `gtm_group` + `category` + `sku` |
| 刷新频率 | 月度正式刷新，周度可做 PO 风险试算 |
| 下游页面 | P1 成本结构归因、P3 预测计划协同、采购专题页 |
| 下游 Agent | `SCM-AGENT-001` 成本异常诊断、后续供应商绩效诊断任务 |
| 当前状态 | 规格稳定，真实源表待确认 |

### 6.2 主键与维度字段

| 字段 | 说明 | 是否必填 | 来源要求 |
|---|---|---:|---|
| `year_month` | 业务月份 | 是 | 采购与财务期间一致 |
| `supplier_id` | 供应商 ID | 是 | ERP/采购系统唯一键 |
| `supplier_name` | 供应商名称 | 是 | 与采购系统一致 |
| `supplier_level` | 供应商分层 | 是 | A/B/C 或战略/常规/观察 |
| `gtm_group` | GTM 分组 | 是 | 与成本和库存宽表一致 |
| `category` | 品类 | 是 | 支持母婴品类拆解 |
| `spu` | SPU | 否 | 可用于聚合 SKU |
| `sku` | SKU | 是 | 采购价差和质检最低分析粒度 |
| `purchase_order_id` | PO 编号 | 否 | 周度试算与异常下钻必填 |

### 6.3 采购与绩效字段

| 字段 | 公式或口径 | 支撑指标 |
|---|---|---|
| `purchase_amount` | 采购金额 | 采购结构和供应商贡献 |
| `purchase_qty` | 采购数量 | 供应规模 |
| `baseline_cost` | 基准采购成本 | `SC-IN-L3-003` |
| `actual_cost` | 实际采购成本 | `SC-IN-L3-003` |
| `cost_down_rate` | `(baseline_cost - actual_cost) / baseline_cost` | 采购降本率 |
| `purchase_price_variance` | 实际采购单价 - 基准采购单价 | 采购价差 |
| `on_time_po_qty` | 按期到货 PO 数 | PO 按期交付率 |
| `total_po_qty` | 总 PO 数 | PO 按期交付率 |
| `on_time_rate` | `on_time_po_qty / total_po_qty` | 准交率 |
| `delay_days_avg` | 平均延期天数 | 计划排产风险 |
| `quality_pass_qty` | 质检通过批次数 | 质检通过率 |
| `quality_total_qty` | 质检总批次数 | 质检通过率 |
| `quality_pass_rate` | `quality_pass_qty / quality_total_qty` | 质量稳定性 |
| `capacity_commitment_qty` | 承诺产能 | RCCP/MPS |
| `actual_delivered_qty` | 实际交付数量 | 产能兑现 |
| `capacity_fulfillment_rate` | `actual_delivered_qty / capacity_commitment_qty` | 供应稳定性 |
| `supplier_score` | 成本、交付、质量、产能加权评分 | 供应商分层 |
| `supplier_risk_status` | Green/Amber/Red/Grey | 采购治理 |

### 6.4 源系统映射

| 数据域 | 源系统候选 | 必须确认的问题 |
|---|---|---|
| 采购订单 | ERP、采购系统 | PO 状态、交期、取消、变更是否可追溯 |
| 采购成本 | ERP、财务系统 | 基准成本、实际成本、币种和汇率 |
| 供应商信息 | 采购系统、供应商主数据 | 供应商唯一键、分层、品类归属 |
| 质检 | 质检系统、WMS 入库质检 | 质检批次、失败原因、让步接收是否分开 |
| 产能 | 采购系统、供应商反馈、计划系统 | 承诺产能、实际交付、瓶颈原因 |
| 计划联动 | PSI、MPS、未交 PO | 计划版本和 PO 版本是否一致 |

### 6.5 验收规则

1. `SC-IN-L3-003` 必须能由 `baseline_cost` 与 `actual_cost` 计算。
2. 准交率必须基于 PO 承诺交期和实际到货，不得用供应商主观反馈替代。
3. 质检通过率必须保留失败原因，不能只保留是否通过。
4. 供应商评分必须能拆回成本、交付、质量和产能四类子分。
5. Red 供应商必须能下钻到 SKU、PO、GTM 和 Owner。

## 7. `SCM-DATA-005` 履约稳定宽表规格

`SCM-DATA-005` 对应 `dwt_fulfillment_stability`。当前只固化宽表规格、字段口径和验收条件，不创建生产 SQL；真实 SQL 需要等 OMS、WMS、TMS、平台物流、客服和财务系统的源表确认后再进入 `sql/` 或 Data Agent 任务。

### 7.1 宽表定位

| 项目 | 规格 |
|---|---|
| 目标表 | `dwt_fulfillment_stability` |
| 业务目标 | 支撑尾程配送成本率、履约时效、履约准确率、事故率和综合履约满意度 |
| 推荐粒度 | `order_id` + `shipment_id` + `package_id` + `channel` + `country` + `warehouse_id` + `carrier_id` |
| 刷新频率 | 日度试算，周/月正式汇总 |
| 下游页面 | P0 库存与履约护栏、P4 履约成本与体验、P5 逆向与治理闭环 |
| 下游 Agent | `SCM-AGENT-001` 成本异常诊断、`SCM-AGENT-003` 管理层摘要 |
| 当前状态 | 规格稳定，真实源表待确认 |

### 7.2 主键与维度字段

| 字段 | 说明 | 是否必填 | 来源要求 |
|---|---|---:|---|
| `order_id` | 订单 ID | 是 | OMS 或平台订单唯一键 |
| `shipment_id` | 发运 ID | 是 | WMS/TMS 可关联 |
| `package_id` | 包裹 ID | 是 | 尾程费用和妥投追踪 |
| `biz_date` | 发货或履约业务日期 | 是 | 支持日/周/月汇总 |
| `channel` | 渠道或平台 | 是 | 与成本宽表一致 |
| `country` | 目的国家 | 是 | 尾程效率分析 |
| `warehouse_id` | 发货仓 | 是 | 仓内履约分析 |
| `carrier_id` | 承运商 | 是 | 承运商治理 |
| `fulfillment_type` | 履约方式 | 是 | FBA/FBM/3PL/直邮 |
| `sku` | SKU | 否 | 多 SKU 订单可拆包或拆行 |

### 7.3 履约过程与指标字段

| 字段 | 公式或口径 | 支撑指标 |
|---|---|---|
| `order_created_at` | 订单创建时间 | 订单处理时效 |
| `warehouse_released_at` | 仓库释放时间 | 仓内处理时效 |
| `shipped_at` | 发货时间 | 发货及时率 |
| `picked_up_at` | 承运商揽收时间 | 揽收时效 |
| `delivered_at` | 签收时间 | 配送达成 |
| `warehouse_process_hours` | 订单释放到发货小时数 | `FD-TM-L3-003` |
| `first_mile_hours` | 发货到揽收小时数 | 履约时效 |
| `last_mile_hours` | 揽收到签收小时数 | 尾程体验 |
| `total_fulfillment_hours` | 订单创建到签收小时数 | 全链路时效 |
| `ship_cost` | 尾程配送费 | `SC-OUT-L3-001` |
| `pick_pack_cost` | 拣货打包贴标出库成本 | `SC-OUT-L3-004` |
| `packaging_cost` | 包装耗材成本 | `SC-OUT-L3-003` |
| `order_fulfillment_cost` | 履约总成本 / 订单数 | `FD-CS-L3-001` |
| `sla_met_flag` | 是否达成 SLA | 全链路时效达成率 |
| `delivery_success_flag` | 是否妥投 | 妥投率 |
| `damage_lost_flag` | 是否破损/丢失 | 履约事故率 |
| `wrong_missing_item_flag` | 是否错发/漏发/多发 | 履约准确率 |
| `fulfillment_score` | 时效分 × 40% + 质量分 × 40% + 成本分 × 20% | `FD-L1-001` |
| `fulfillment_risk_status` | Green/Amber/Red/Grey | P0/P4 护栏 |

### 7.4 源系统映射

| 数据域 | 源系统候选 | 必须确认的问题 |
|---|---|---|
| 订单 | OMS、平台订单 | 多包裹、多 SKU、取消订单如何处理 |
| 仓内作业 | WMS | 释放、拣货、打包、出库时间是否完整 |
| 运输轨迹 | TMS、承运商轨迹、平台物流 | 揽收、在途、签收和异常节点是否可追溯 |
| 尾程费用 | TMS、快递账单、平台账单、财务 | 订单或包裹级费用是否可回勾 |
| 异常事故 | 客服系统、质控系统、物流异常 | 破损、丢失、错漏发是否结构化 |
| 成本护栏 | `dwt_supply_chain_cost`、财务系统 | 履约成本和销售额期间是否一致 |

### 7.5 验收规则

1. `SC-OUT-L3-001` 必须能由尾程费用和销售额口径计算或关联。
2. 发货及时率、履约准确率、履约事故率必须能拆到仓、渠道、国家和物流商。
3. `fulfillment_score` 必须能拆回时效、质量、成本三类子分。
4. 尾程成本下降但时效或事故率恶化时，必须标记为履约降本风险。
5. Grey 数据状态不得输出承运商切换、仓配路径调整等强动作建议。

## 8. `SCM-DATA-006` 逆向物流宽表规格

`SCM-DATA-006` 对应 `dwt_reverse_logistics`。当前只固化宽表规格、原因编码、责任归因和返仓价值字段，不创建生产 SQL；真实 SQL 需要等退货系统、客服、WMS、财务和平台售后数据确认后再落盘。

### 8.1 宽表定位

| 项目 | 规格 |
|---|---|
| 目标表 | `dwt_reverse_logistics` |
| 业务目标 | 支撑退货、补发、返仓可售、报废损失、责任归因和整改闭环 |
| 推荐粒度 | `return_id` 或 `after_sales_id` + `sku` + `channel` + `country` + `return_reason_code` |
| 刷新频率 | 日度试算，月度正式归因 |
| 下游页面 | P5 逆向与治理闭环、P0 待拍板事项 |
| 下游 Agent | `SCM-AGENT-003` 管理层摘要、后续逆向异常诊断任务 |
| 当前状态 | 规格稳定，真实源表待确认 |

### 8.2 主键与维度字段

| 字段 | 说明 | 是否必填 | 来源要求 |
|---|---|---:|---|
| `return_id` | 退货单 ID | 是 | 退货系统或平台售后 |
| `after_sales_id` | 售后单 ID | 是 | 客服系统 |
| `order_id` | 原订单 ID | 是 | 与 OMS 可关联 |
| `biz_date` | 退货或售后发生日期 | 是 | 支持趋势分析 |
| `channel` | 渠道或平台 | 是 | 与销售和成本口径一致 |
| `country` | 国家 | 是 | 支持区域归因 |
| `warehouse_id` | 退货处理仓 | 否 | 有返仓时必填 |
| `category` | 品类 | 是 | 支持母婴品类拆解 |
| `sku` | SKU | 是 | 逆向治理最低分析粒度 |
| `return_reason_code` | 退货原因编码 | 是 | TOP 原因归因 |
| `responsibility_type` | 责任类型 | 是 | 产品/仓储/物流/客服/用户/平台 |

### 8.3 逆向金额与过程字段

| 字段 | 公式或口径 | 支撑指标 |
|---|---|---|
| `return_order_qty` | 退货订单数 | 退货率 |
| `total_order_qty` | 同期总订单数 | 退货率 |
| `return_rate` | `return_order_qty / total_order_qty` | P5 退货原因帕累托 |
| `return_shipping_cost` | 退货运费 | 退货处理成本率 |
| `inspection_cost` | 质检费用 | 返仓价值漏斗 |
| `repack_cost` | 重包装费用 | 返仓价值漏斗 |
| `reship_cost` | 补发物流费用 | 补发成本率 |
| `reship_goods_cost` | 补发商品成本 | 补发成本率 |
| `scrap_amount` | 报废损失金额 | 报废率、价值损失 |
| `sellable_recovery_amount` | 返仓可售恢复金额 | 返仓可售率 |
| `reverse_total_cost` | 退货 + 质检 + 重包装 + 补发 + 报废 | 逆向总成本 |
| `processing_hours` | 退货创建到归因或处理完成小时数 | 48h 归因达标率 |
| `reason_coding_status` | 原因编码状态 | 数据治理 |
| `action_id` | 关联整改动作 | `scm_action_tracking` |

### 8.4 源系统映射

| 数据域 | 源系统候选 | 必须确认的问题 |
|---|---|---|
| 退货申请 | 平台售后、客服系统 | 退货、换货、退款、补发是否分开 |
| 原订单 | OMS、平台订单 | 原订单、SKU、渠道、国家是否可关联 |
| 返仓处理 | WMS、退货仓系统 | 收货、质检、可售、不可售、报废状态 |
| 逆向费用 | 财务系统、物流账单、客服赔付 | 退货运费、补发费用、报废金额是否独立 |
| 原因编码 | 客服系统、质检系统 | 原因层级、责任方、是否允许多原因 |
| 整改动作 | PMO、动作台账 | TOP 原因是否绑定 Owner 和验收指标 |

### 8.5 验收规则

1. 退货、补发、报废、返仓可售必须能拆到 `return_reason_code`。
2. 无原因编码的退货不得输出强结论，只能进入数据治理清单。
3. 返仓价值必须区分可售、不可售、待质检和报废。
4. `reverse_total_cost` 必须能回勾退货运费、质检、重包装、补发和报废分项。
5. TOP 原因必须能关联 `scm_action_tracking` 的 Owner、截止日和验收指标。

## 9. P0 取数清单

| 数据域 | 指标/字段 | 粒度 | 口径要求 | Owner |
|---|---|---|---|---|
| 销售 | 销售额、订单数、件数、GMV、退款冲减 | 月/渠道/区域/GTM/SKU | 明确含税、退款、平台费是否纳入 | 财务 + 运营 |
| 采购 | 采购成本、采购货值、基准采购成本、采购降本率 | 月/供应商/GTM/SKU | 基准期、币种、汇率必须锁定 | 采购 + 财务 |
| 头程 | 海运、空运、陆运、燃油附加费、港杂、清关 | 批次/航次/SKU/渠道 | 能回摊到 SKU、渠道和区域 | 物流 |
| 仓储 | 仓租、操作费、长期仓储费、入库配置费、系统费 | 月/仓/SKU/渠道 | FBA、3PL、自建仓分开 | 仓储 |
| 尾程 | 配送费、妥投费、偏远附加费、快递费 | 订单/包裹/国家/渠道 | 与订单销售额可关联 | 物流 |
| 退换补发 | 退货运费、质检费、重包装、补发物流、报废 | 退货单/SKU/原因 | 原因编码需结构化 | 客服 + 仓储 |
| 直邮 | 直邮运费、清关、尾程、异常件费用 | 订单/国家/渠道 | 与海外仓/FBA 路径区分 | 物流 |
| 库存 | 在库、在途、未交 PO、库龄、周转天数 | 日/仓/SKU/区域 | 全链条库存 = 在库 + 在途 + 未交 PO | 计划 + 仓储 |

## 10. 数据质量验收

1. `销售额`、`采购成本`、`头程成本`、`尾程成本`、`仓储成本` 五个字段必须可按月对齐 MAT2025P2 与 MAT2026P2。
2. `总成本率 = 节点成本合计 / 销售额`，节点成本至少覆盖采购、头程、仓储、尾程；退换补发和直邮如暂缺，必须单独标记缺口。
3. `region`、`channel`、`gtm_group`、`sku` 四类维度不得在同一底表出现空值泛滥；空值样本需要进入数据质量清单。
4. 费用分摊必须保留原始金额与分摊后金额，不能只保留分摊结果。
5. 所有指标进入看板前必须绑定 `metric_code`、`metric_name`、`formula`、`owner`、`refresh_frequency`。

## 11. `SCM-SOURCE-001` 真实数据源确认矩阵

### 11.1 当前结论

当前仓库内存在供应链成本参考工作簿、主项目订单/履约类数据契约和 Phase mock 表，但没有生产级 SCM 源表清单。

因此本阶段只能完成“源表确认矩阵”和“阻断项识别”，不能宣称生产源表已确认，也不能进入可执行 SQL 落盘。

### 11.2 本地证据盘点

| 本地资产 | 可用于 | 不能用于 |
|---|---|---|
| `ref/books/供应链36%方案_Page6节点/供应链课题/供应链成本分析-MAT2025P2.xlsx` | 复核 MAT2025P2 成本结构、费用率、GTM/区域/渠道下钻口径 | 不能替代财务、ERP、物流账单等生产源表 |
| `ref/books/供应链36%方案_Page6节点/供应链课题/供应链成本分析-MAT2026P2.xlsx` | 复核 MAT2026P2 成本结构、同比与 MAT 对比口径 | 不能证明真实刷新链路、字段类型、币种和权限 |
| `ref/books/供应链36%方案_Page6节点/供应链课题/供应链成本分析_数据口径与sheet地图.md` | 识别 `供应链成本结构` 主分析底表和趋势/分布 Sheet 角色 | 不能作为生产库表血缘 |
| `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 复用订单、订单行、退货、仓库、履约节点的主键与粒度设计 | 不包含 SCM 五张 `dwt_*` 宽表的真实源表 |
| `main_project_lute/phase2_mock/*.csv`、`main_project_lute/phase3_mock/*.csv` | 做原型联调和字段命名参考 | 不能进入正式口径验收 |
| `main_project_lute/data_example/原始数据/专题一：分析数据总表.xlsx` | 复核销售额、毛利、头程费率、仓储配送费率等经营分析字段 | 不能覆盖库存、供应商、TMS、逆向和动作台账 |

### 11.3 目标宽表源表确认矩阵

| 目标表 | 源系统候选 | 本地证据状态 | 生产确认状态 | 必须确认项 | 未确认时门禁 |
|---|---|---|---|---|---|
| `dim_scm_metric` | SCM 指标字典、本地指标树 | 已有本地指标字典和 P0 种子指标 | 不依赖生产源表，但需业务 Owner 复核 | 指标公式、阈值、Owner、刷新频率、RAG 规则 | 未复核前只能作为 draft seed |
| `dwt_supply_chain_cost` | 财务、ERP、物流对账、平台账单、OMS | 供应链成本分析工作簿可复核成本率和 MAT 口径 | 待确认 | 生产源表名、字段类型、币种、汇率、财务期间、费用分摊规则、SKU/渠道/GTM 映射 | Data Agent 只输出 `Grey`；禁止生产 SQL |
| `dwt_inventory_health` | ERP、WMS、采购系统、计划系统、FBA/3PL 库存报表 | 主项目有 `dim_warehouse` 和订单履约 mock，仅能辅助字段命名 | 待确认 | 在库、可售、锁定、在途、未交 PO、库龄、库存金额、缺货定义、仓型 | 禁止输出调拨建议和库存强结论 |
| `dwt_supplier_performance` | ERP、采购系统、质检系统、计划系统、财务 | 本地无生产供应商绩效源表证据 | 待确认 | 供应商主键、PO 状态、承诺交期、实际到货、质检批次、基准成本、实际成本、产能 | 禁止输出供应商 Red 结论 |
| `dwt_fulfillment_stability` | OMS、WMS、TMS、承运商轨迹、平台物流、客服、财务 | 主项目有 `fact_order_fulfillment` 设计和 mock | 待确认 | 订单/包裹主键、发货节点、揽收节点、签收节点、尾程费用、异常事故编码 | 禁止输出承运商切换或仓配路径建议 |
| `dwt_reverse_logistics` | 退货系统、平台售后、客服、WMS、财务、物流账单 | 主项目有 `fact_return` 设计和 mock | 待确认 | 退货单、售后单、原订单、原因编码、责任类型、返仓状态、补发/报废/质检费用 | 禁止输出 TOP 原因整改结论 |
| `scm_action_tracking` | PMO、业务 Owner、看板异常工单 | 本地仅有字段规格 | 待创建或待确认 | `action_id`、`metric_code`、Owner、截止日、预期改善、实际改善、闭环状态 | Red 异常只能进入“待分派事项” |

### 11.4 源表确认问题清单

| 决策项 | 必须回答的问题 | 推荐 Owner |
|---|---|---|
| 生产表名 | 每个源系统是否已有可查表名、库名、环境和权限？ | 数据 Owner + IT |
| 字段类型 | 金额、数量、率、时间戳字段的数据类型和空值规则是什么？ | 数据 Owner |
| 币种与汇率 | 金额字段是本币、USD、CNY 还是平台币种？汇率表和折算日期是什么？ | 财务 |
| 财务期间 | MAT、月结、平台账单周期是否一致？跨期成本如何归属？ | 财务 + 供应链 |
| 主数据映射 | SKU、SPU、GTM、渠道、区域、仓库、供应商是否有统一主键？ | 数据 Owner + 运营 |
| 费用分摊 | 头程、仓储、尾程、逆向、直邮费用如何从账单分摊到 SKU/渠道/区域？ | 财务 + 物流 |
| 动作台账 | 异常动作由谁创建、谁验收、闭环状态如何回写？ | PMO + 业务 Owner |

### 11.5 数据质量状态门槛

| 状态 | 判定条件 | Agent 输出边界 |
|---|---|---|
| `Grey` | 只有规格或本地参考，没有生产源表名和样本数据 | 只能输出任务规格、数据缺口和待确认问题 |
| `Amber` | 已确认源表名、Owner、字段清单和样本数据，但未完成口径重算 | 可以输出待验证假设，不能输出强根因 |
| `Green` | 已完成字段类型校验、期间/币种校验、成本合计重算和宽表刷新验证 | 可以进入看板、SQL 和 Agent 诊断 |
| `Red` | 生产源表或字段存在严重缺失、口径冲突或刷新失败 | 只能输出数据治理事项，不能输出业务动作 |

### 11.6 下一步门禁

1. `SCM-SOURCE-002`：组织源系统确认，按 11.4 问题清单补真实库名、表名、字段、Owner 和权限。
2. `SCM-DQ-001`：拿到样本后做字段类型、空值、重复主键、期间、币种和成本合计校验。
3. `SCM-SQL-001`：只有 `dwt_supply_chain_cost` 和 `dwt_inventory_health` 达到 `Amber` 且通过 `SCM-DQ-001` P0 检查后，才允许进入 SQL 初稿。
4. `SCM-AGENT-DATA-001`：只有目标宽表达到 `Green` 后，才允许 Data Agent 输出生产根因、Owner 和动作建议。

## 12. `SCM-SOURCE-002` 真实源系统确认包

### 12.1 确认定义

`SCM-SOURCE-002` 不直接产出 SQL。它的目标是把生产源系统确认工作拆成可执行清单，防止用本地参考工作簿、Phase mock 或口径草稿冒充生产数仓证据。

一个源系统进入“已确认”状态，必须同时具备：

| 确认项 | 最小要求 | 缺失后果 |
|---|---|---|
| 真实库表 | 提供 `database.schema.table` 或等价生产数据资产路径 | 不能写正式 SQL |
| 字段清单 | 提供字段名、字段类型、主键、分区、枚举或口径说明 | 不能判断宽表可建性 |
| 数据 Owner | 明确业务 Owner、数据 Owner、权限审批人 | 不能进入验收闭环 |
| 权限路径 | 明确生产、准生产或只读查询环境，以及可导出范围 | 不能取样或重算 |
| 样本证据 | 至少提供一个完整财务期间样本或等价抽样结果 | 不能进入 `SCM-DQ-001` |
| 刷新机制 | 明确刷新频率、T+N、失败告警和历史回补规则 | 不能进入看板和 Agent 运行 |

### 12.2 源系统确认登记表

| 源域 | 支撑目标宽表 | 必须确认的生产资产 | 责任 Owner | 当前状态 |
|---|---|---|---|---|
| 财务销售与成本口径 | `dwt_supply_chain_cost` | 销售收入表、成本凭证/账单表、币种汇率表、月结期间表 | 财务 + 数据 Owner | Pending external confirmation |
| ERP 商品/采购/库存 | `dwt_supply_chain_cost`、`dwt_inventory_health`、`dwt_supplier_performance` | SKU/SPU 主数据、采购订单、采购入库、供应商主数据、采购成本表 | 采购 + ERP + 数据 Owner | Pending external confirmation |
| 物流对账/货代账单/头程 | `dwt_supply_chain_cost`、`dwt_fulfillment_stability` | 货代账单、船期/航次、箱单、头程费用分摊依据 | 物流 + 财务 | Pending external confirmation |
| WMS/FBA/3PL 库存与仓储账单 | `dwt_inventory_health`、`dwt_supply_chain_cost` | 仓库库存快照、库龄、入出库流水、仓储费账单、库位或仓型 | 仓储 + 数据 Owner | Pending external confirmation |
| OMS/平台订单 | `dwt_fulfillment_stability`、`dwt_reverse_logistics`、`dwt_supply_chain_cost` | 平台订单、履约方式、发货时效、订单收入、取消/退款状态 | 运营 + 数据 Owner | Pending external confirmation |
| TMS/承运商轨迹/尾程账单 | `dwt_fulfillment_stability`、`dwt_supply_chain_cost` | 运单、承运商轨迹、妥投状态、尾程费用账单、异常件记录 | 物流 + 数据 Owner | Pending external confirmation |
| 退货/售后/客服 | `dwt_reverse_logistics` | 退货单、退款单、售后原因、补发记录、返仓状态 | 客服 + 仓储 + 数据 Owner | Pending external confirmation |
| 质检系统 | `dwt_supplier_performance`、`dwt_reverse_logistics` | IQC/OQC 记录、不良原因、批次、供应商责任判定 | 质控 + 采购 | Pending external confirmation |
| PMO 动作台账/异常工单 | `scm_action_tracking` | 异常创建、Owner、动作、状态、验收结果、关闭时间 | PMO + 业务 Owner | Pending external confirmation |

### 12.3 目标宽表样本包要求

| 目标宽表 | 最小样本 | 必备内容 | 进入下一门槛 |
|---|---|---|---|
| `dim_scm_metric` | P0/P1 指标全集 | 指标编码、公式、单位、Owner、数据源、阈值 | 指标 Owner 签收后进入 `SCM-DQ-001` |
| `dwt_supply_chain_cost` | 一个完整财务期间，覆盖至少两个渠道和两个区域 | 销售额、总成本、头程、仓储、尾程、逆向、币种、汇率、分摊字段 | 样本齐备后进入 `SCM-DQ-001`，通过后再进入 `SCM-SQL-001` |
| `dwt_inventory_health` | 一个完整月度库存快照，覆盖主要仓库和 SKU | 库存数量、库存金额、库龄、周转、缺货、仓库、SKU、渠道 | 样本齐备后进入 `SCM-DQ-001`，通过后再进入 `SCM-SQL-001` |
| `dwt_supplier_performance` | 一个采购周期或等价供应商样本 | 采购订单、交付、质检、成本、供应商、品类、批次 | 样本齐备后进入 `SCM-DQ-001`，通过后再进入 SQL 初稿 |
| `dwt_fulfillment_stability` | 一个完整履约周期，覆盖主承运商 | 订单、发货、妥投、异常、承运商、仓库、尾程费用 | 样本齐备后进入 `SCM-DQ-001`，通过后再进入 SQL 初稿 |
| `dwt_reverse_logistics` | 一个完整售后周期 | 退货、退款、补发、原因、返仓、费用、责任归因 | 样本齐备后进入 `SCM-DQ-001`，通过后再进入 SQL 初稿 |
| `scm_action_tracking` | 至少 20 条异常闭环记录或当前动作台账全集 | 异常来源、Owner、动作、状态、验收、关闭时间 | 状态流转字段确认后进入 Agent 写回设计 |

### 12.4 权限与环境检查清单

| 检查项 | 必须记录的值 | 用途 |
|---|---|---|
| 查询环境 | prod / staging / readonly / data mart | 判断是否能用于正式口径 |
| 访问方式 | SQL、API、数据集市、导出文件、BI dataset | 决定后续 SQL 或 API 适配 |
| 审批人 | 权限审批人和业务审批人 | 避免无主数据资产 |
| 敏感字段 | 客户、地址、手机号、财务凭证、供应商价格 | 决定脱敏和导出范围 |
| 刷新频率 | T+0、T+1、周更、月结后刷新 | 决定看板与 Agent 触发频率 |
| 历史范围 | 可查询起止期间、回补能力 | 决定 MAT 和同比可用性 |
| 导出限制 | 是否允许样本导出、最大行数、脱敏规则 | 决定 `SCM-DQ-001` 执行方式 |

### 12.5 验收状态

| 状态 | 判定标准 | 后续动作 |
|---|---|---|
| `Grey` | 只有本确认包，未拿到真实库表和样本 | 停留在源表确认，不能进入 SQL |
| `Amber` | 已拿到真实库表、字段清单、Owner、权限路径和一个期间样本 | 执行 `SCM-DQ-001`，P0 检查未通过前不写 SQL |
| `Green` | 样本通过字段类型、主键、期间、币种、成本合计和刷新验证 | 执行 `SCM-SQL-001`，并准备 Agent 真实宽表接入 |
| `Red` | 源表缺失、口径冲突、权限不可用或样本无法重算 | 回到源系统治理，禁止下游开发 |

### 12.6 需要外部确认的决策

以下信息无法从当前本地目录推断，必须由业务或数据团队补齐：

1. 生产数仓、ERP、WMS、OMS、TMS、财务系统的真实资产路径。
2. 每个源域的业务 Owner、数据 Owner、权限审批人。
3. 成本分摊是否以 SKU、订单、箱、票、仓、渠道或区域为最小单元。
4. 月结期间、MAT 期间、平台账单周期不一致时的归属规则。
5. `scm_action_tracking` 是复用现有工单系统，还是新建专题动作台账。

### 12.7 下一步门禁

1. `SCM-DQ-001`：只有至少一个目标宽表达到 `Amber` 后，才执行样本质量校验。
2. `SCM-SQL-001`：只有 `dwt_supply_chain_cost` 和 `dwt_inventory_health` 通过 `SCM-DQ-001` 后，才允许进入 SQL 草稿；正式 SQL 仍需 Owner 和性能审查。
3. `SCM-AGENT-DATA-001`：只有核心宽表达到 `Green` 后，才允许 Data Agent 输出生产根因、Owner 和动作建议。

## 13. `SCM-DQ-001` 样本质量校验规格

### 13.1 执行边界

`SCM-DQ-001` 是样本质量校验规格，不代表真实样本已经通过验收。当前本地目录没有生产源表访问权限，也没有已确认样本，因此本节状态为：规格已就绪，执行等待外部样本。

允许启动真实 DQ 执行的前置条件：

| 前置条件 | 进入标准 | 未满足时的处理 |
|---|---|---|
| 源表确认 | 目标宽表已在 `SCM-SOURCE-002` 中达到 `Amber` | 回到源系统确认 |
| 样本可用 | 至少一个完整期间样本可查询或可导出 | 不写 DQ 结论 |
| 字段清单 | 字段名、类型、主键、分区和枚举已确认 | 不写 SQL 初稿 |
| Owner 签收 | 业务 Owner 和数据 Owner 已确认样本用途 | 不推进看板或 Agent |
| 脱敏规则 | 敏感字段处理方式已明确 | 不导出样本 |

### 13.2 通用 DQ 检查项

| check_id | 检查项 | 方法 | P0 阻断条件 |
|---|---|---|---|
| `DQ-SCHEMA-001` | 字段存在性 | 对照目标宽表规格检查必填字段 | 缺少主键、期间、金额、数量或 Owner 字段 |
| `DQ-TYPE-001` | 字段类型 | 检查日期、金额、数量、枚举、布尔状态 | 金额或数量字段无法数值化 |
| `DQ-PK-001` | 主键唯一性 | 按目标粒度统计重复主键 | P0 宽表存在重复主键且无法解释 |
| `DQ-NULL-001` | 必填字段空值 | 统计主键、期间、维度、金额、状态空值率 | 主键、期间或核心金额字段为空 |
| `DQ-ENUM-001` | 枚举合法性 | 检查渠道、区域、成本节点、状态、原因码 | 出现未登记枚举且影响归因 |
| `DQ-PERIOD-001` | 期间一致性 | 核对 `biz_date`、`year_month`、`fiscal_period`、`mat_period` | 同一样本混用无法归属的期间 |
| `DQ-CURRENCY-001` | 币种与汇率 | 检查币种、汇率、生效日期和本位币金额 | 多币种金额未带汇率或本位币 |
| `DQ-RECON-001` | 合计重算 | 核对源表合计、宽表合计和指标公式 | 成本、库存或订单合计不可重算 |
| `DQ-FK-001` | 主数据映射 | 检查 SKU、仓库、供应商、渠道、区域映射 | 关键维度无法映射到统一主键 |
| `DQ-FRESH-001` | 刷新时效 | 检查样本刷新时间和 T+N 规则 | 样本过期且不能说明回补机制 |
| `DQ-SEC-001` | 脱敏与权限 | 检查敏感字段是否符合导出限制 | 样本包含未授权敏感字段 |

### 13.3 目标宽表专项检查

| 目标宽表 | P0 检查 | P1 检查 | 通过后动作 |
|---|---|---|---|
| `dim_scm_metric` | `metric_code` 唯一、公式非空、Owner 非空、状态有效 | 阈值、单位、数据源映射完整 | 允许指标字典进入看板配置 |
| `dwt_supply_chain_cost` | 粒度唯一；销售额、总成本、头程、仓储、尾程、逆向可重算；币种和汇率完整 | 分摊依据、成本节点、GTM、渠道、区域完整 | 允许进入 `SCM-SQL-001` 成本宽表初稿 |
| `dwt_inventory_health` | SKU + 仓库 + 期间粒度唯一；库存数量和库存金额可重算；库龄分桶合法 | 缺货、冻结、在途、可售状态完整 | 允许进入 `SCM-SQL-001` 库存宽表初稿 |
| `dwt_supplier_performance` | 供应商、采购单、批次、交付、质检字段可串联 | 采购成本、交期、质量原因和责任归因完整 | 允许进入供应商绩效 SQL 初稿 |
| `dwt_fulfillment_stability` | 订单、发货、妥投、异常状态时间链路合法 | 承运商、仓库、履约方式、尾程费用完整 | 允许进入履约稳定 SQL 初稿 |
| `dwt_reverse_logistics` | 退货单、退款单、补发、返仓、费用字段可串联 | 原因码、责任方、商品状态和闭环动作完整 | 允许进入逆向物流 SQL 初稿 |
| `scm_action_tracking` | `action_id` 唯一；Owner、状态、创建时间、关闭时间合法 | 验收结果、动作来源、关联异常和复盘字段完整 | 允许进入 Agent 写回设计 |

### 13.4 DQ 结果记录模板

| 字段 | 含义 | 示例 |
|---|---|---|
| `dq_run_id` | 本次校验批次 | `SCM-DQ-20260602-001` |
| `target_table` | 目标宽表或数据资产 | `dwt_supply_chain_cost` |
| `sample_scope` | 样本范围 | `2026-05, US, Amazon, FBA` |
| `check_id` | 检查项编号 | `DQ-PK-001` |
| `severity` | 严重等级 | `P0`、`P1`、`P2` |
| `expected_rule` | 期望规则 | 主键重复数等于 0 |
| `actual_result` | 实际结果 | 等待样本后填写 |
| `status` | 结果状态 | `pass`、`fail`、`blocked` |
| `evidence_ref` | 证据引用 | SQL 截图、查询结果、样本文件 |
| `owner` | 处理人 | 数据 Owner |
| `next_action` | 后续动作 | 修复源表、补字段、确认口径 |

### 13.5 验收门槛

| 状态 | 判定标准 | 下游权限 |
|---|---|---|
| `Blocked` | 没有真实样本，或样本未授权 | 停留在源表确认，不进入 SQL |
| `Red` | 任一 P0 检查失败且无业务解释 | 不允许看板、SQL 或 Agent 接入 |
| `Amber` | P0 通过，P1 存在可解释缺口 | 只允许写非生产 SQL 草稿和待验证假设 |
| `Green` | P0 全部通过，P1 无阻断，关键合计可重算 | 允许进入 `SCM-SQL-001` 和看板样板 |

### 13.6 输出边界

1. 没有真实样本时，只能输出 DQ 规格、检查清单和待确认事项。
2. 样本达到 `Amber` 前，不写正式 SQL，不生成生产指标结论。
3. 任一 P0 检查失败时，Data Agent 只能输出数据治理事项，不能输出业务根因。
4. DQ 结果必须保留 `evidence_ref`，不能只写“通过/不通过”。

### 13.7 下一步门禁

1. 等业务或数据团队提供至少一个目标宽表的真实样本后，按 13.2 和 13.3 执行 DQ。
2. `dwt_supply_chain_cost` 与 `dwt_inventory_health` 通过 DQ 后，进入 `SCM-SQL-001` 成本和库存宽表 SQL 初稿。
3. `scm_action_tracking` 通过 DQ 后，进入 `SCM-AGENT-DATA-001` 的动作写回设计。

## 14. `SCM-SQL-001` SQL 初稿前置规格

### 14.1 执行边界

`SCM-SQL-001` 当前只能定义 SQL 生成规则、目标宽表构建顺序和审查门槛。当前本地目录没有真实生产源表，也没有通过 `SCM-DQ-001` 的样本，因此不在 `sql/` 目录创建正式 SQL 文件。

禁止事项：

| 禁止项 | 原因 |
|---|---|
| 用本地 mock 表名替代生产表名 | 会把样例数据误写成生产依据 |
| 用 `<database.schema.table>` 占位 SQL 进入 `sql/` 正式区 | 正式 SQL 目录只放可执行资产 |
| 跳过 `SCM-DQ-001` 直接写宽表 SQL | 字段类型、主键、期间、币种和合计重算未验证 |
| 输出生产根因或 Owner 动作建议 | 真实宽表尚未接入，Agent 仍必须保持 Grey |

### 14.2 SQL 落盘门槛

| 门槛 | 进入标准 | 通过后动作 |
|---|---|---|
| `SCM-SOURCE-002` | 真实源表、字段清单、Owner、权限路径和样本已确认 | 允许准备 DQ 查询 |
| `SCM-DQ-001` | P0 检查通过，关键合计可重算 | 允许写非生产 SQL 初稿 |
| 业务口径签收 | 成本分摊、期间、币种、主数据映射已签收 | 允许进入正式 SQL 目录 |
| 性能检查 | 样本 SQL 可执行，复杂查询有 `EXPLAIN ANALYZE` 计划 | 允许接入看板样板 |

### 14.3 SQL 构建顺序

| 顺序 | 目标资产 | 依赖 | 说明 |
|---:|---|---|---|
| 1 | `dim_scm_metric` | 指标字典、Owner、阈值 | 先固定指标编码、公式和状态，避免 SQL 口径漂移 |
| 2 | `dwt_supply_chain_cost` | 财务销售、成本账单、物流账单、汇率、主数据 | P0 优先，支撑成本异常、经营总览和管理层摘要 |
| 3 | `dwt_inventory_health` | 库存快照、WMS/FBA/3PL、SKU 主数据 | P0 优先，支撑库存健康和现金流 |
| 4 | `dwt_supplier_performance` | 采购、供应商、质检、交付 | P1，支撑采购端上行归因 |
| 5 | `dwt_fulfillment_stability` | OMS、TMS、承运商轨迹、尾程费用 | P1，支撑履约稳定和体验风险 |
| 6 | `dwt_reverse_logistics` | 退货、退款、补发、返仓、售后原因 | P1，支撑逆向闭环 |
| 7 | `scm_action_tracking` | 工单或 PMO 动作台账 | Agent 写回前置资产 |

### 14.4 宽表 SQL 结构契约

| 模块 | 必须包含 | 说明 |
|---|---|---|
| `source_*` CTE | 每个生产源表一段 CTE | 只做字段选择、类型转换、脱敏和期间过滤 |
| `dim_*` CTE | SKU、仓库、供应商、渠道、区域、GTM 映射 | 主数据映射必须可追溯 |
| `fact_*` CTE | 金额、数量、状态、时间链路 | 不在事实层写业务结论 |
| `allocation_*` CTE | 分摊规则和分摊基数 | 成本宽表必须保留分摊依据 |
| `reconcile_*` CTE | 合计重算和差异 | 每张 P0 宽表都要能重算核心合计 |
| final select | 目标宽表字段全集 | 字段顺序按本文件目标宽表规格输出 |

### 14.5 P0 SQL 字段契约

`dwt_supply_chain_cost` 首版 SQL 必须覆盖：

| 字段组 | 必填字段 |
|---|---|
| 粒度字段 | `year_month`、`fiscal_period`、`region`、`country`、`channel`、`gtm_group`、`category`、`sku`、`cost_node` |
| 金额字段 | `sales_amount`、`total_cost_amount`、`inbound_cost_amount`、`warehouse_cost_amount`、`last_mile_cost_amount`、`reverse_cost_amount` |
| 币种字段 | `currency_code`、`fx_rate`、`base_currency_amount` |
| 分摊字段 | `allocation_basis`、`allocation_ratio`、`allocation_source_ref` |
| 治理字段 | `source_system`、`source_table`、`dq_run_id`、`data_quality_status`、`updated_at` |

`dwt_inventory_health` 首版 SQL 必须覆盖：

| 字段组 | 必填字段 |
|---|---|
| 粒度字段 | `year_month`、`warehouse_id`、`warehouse_type`、`region`、`channel`、`sku`、`category` |
| 库存字段 | `on_hand_qty`、`available_qty`、`reserved_qty`、`in_transit_qty`、`inventory_amount` |
| 健康字段 | `inventory_age_days`、`age_bucket`、`turnover_days`、`stockout_flag`、`overstock_flag` |
| 治理字段 | `source_system`、`source_table`、`dq_run_id`、`data_quality_status`、`updated_at` |

### 14.6 SQL 审查清单

| 审查项 | 要求 |
|---|---|
| 粒度 | final select 的主键必须与目标宽表粒度一致 |
| 时间 | `biz_date`、`year_month`、`fiscal_period`、`mat_period` 不得混用 |
| 币种 | 多币种金额必须保留原币、本位币和汇率 |
| 分摊 | 成本分摊必须保留基数、比例和来源引用 |
| 主数据 | SKU、仓库、供应商、渠道和区域映射失败必须显式标记 |
| DQ 回写 | SQL 输出必须带 `dq_run_id` 和 `data_quality_status` |
| 性能 | 大表 Join、窗口函数和聚合必须做执行计划检查 |
| 权限 | 敏感字段不得未经脱敏输出到正式宽表 |

### 14.7 非生产 SQL 草稿模板

以下模板只用于约束结构，不是可执行 SQL：

```sql
WITH source_main AS (
  SELECT
    -- choose confirmed fields only
    *
  FROM confirmed_source_table
  WHERE confirmed_period_filter
),
dim_mapping AS (
  SELECT
    -- map SKU, channel, region, warehouse, supplier
    *
  FROM confirmed_dimension_table
),
fact_normalized AS (
  SELECT
    -- normalize type, currency, period, status
    *
  FROM source_main
),
reconcile_check AS (
  SELECT
    -- calculate reconciliation metrics
    *
  FROM fact_normalized
)
SELECT
  -- output target wide-table fields in agreed order
  *
FROM reconcile_check;
```

### 14.8 下一步门禁

1. 等 `dwt_supply_chain_cost` 和 `dwt_inventory_health` 获取真实样本并通过 `SCM-DQ-001` P0 检查。
2. 样本通过后，非生产 SQL 初稿优先落入 `drafts/analysis/`；真实表名、DQ、Owner 和性能审查全部通过后，才转入 `sql/`。
3. SQL 初稿通过 Owner 和性能审查后，再进入 `SCM-AGENT-DATA-001` 真实宽表接入设计。
