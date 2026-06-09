---

entity_id: ecom-70-1-data
entity_type: resource
title: (data)课题一:供应链履约费用科目拆解明细
definition: '文档类型: 文档 > 来源链接: https://alidocs.dingtalk.com/i/nodes/2Amq4vjg89eOxx1wuQMwzNzd83kdP0wQ?utm_scene=person_space'
taxonomy_path: 外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化
created: '2026-04-25'
updated: '2026-06-02'
skill_ready: false
product_ready: false
legacy_fields:
  original_filename: (data)课题一:供应链履约费用科目拆解明细.url
  source_folder: 2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1:供应链成本指标全链路优化/(data)课题一:供应链履约费用科目拆解明细.url
  migrated_at: 2026-04-25
doc_type: analysis
source: human+ai
owner: self
topic: "（data）课题一：供应链履约费用科目拆解明细"
module: "scm"
source_url: https://alidocs.dingtalk.com/i/nodes/2Amq4vjg89eOxx1wuQMwzNzd83kdP0wQ?utm_scene=person_space
migrated_from: 20-Areas/跨境电商工作知识库
migrated_at: '2026-04-29'
related:
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(data)课题一:供应链成本效率-指标体系
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(plan)课题一:供应链成本分析思路
- 30-Resources/外部文档/跨境电商/70-专题研究/课题1:供应链成本指标全链路优化/(report)课题一:供应链成本效率整合洞察及方案V1.0
- 30-resources-moc-indexmocexternal-docs
status: stable
tags:
  - scm
  - supply-chain
  - data-rebuild

---
# （data）课题一：供应链履约费用科目拆解明细

> **文档类型**: 文档
> **来源链接**: [https://alidocs.dingtalk.com/i/nodes/2Amq4vjg89eOxx1wuQMwzNzd83kdP0wQ?utm_scene=person_space](https://alidocs.dingtalk.com/i/nodes/2Amq4vjg89eOxx1wuQMwzNzd83kdP0wQ?utm_scene=person_space)

---

## 原始信息
- 原始文件名: `（data）课题一：供应链履约费用科目拆解明细.url`
- 文件类型: URL 快捷方式
- 原始路径: `2026_04_25_【专题类】专题研究/【专题类】专题研究/课题1：供应链成本指标全链路优化/（data）课题一：供应链履约费用科目拆解明细.url`
## 相关链接

- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（data）课题一：供应链成本效率-指标体系|（data）课题一：供应链成本效率-指标体系]]
- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（plan）课题一：供应链成本分析思路|（plan）课题一：供应链成本分析思路]]
- [[40-Archives/url-placeholders/70-专题研究/课题1：供应链成本指标全链路优化/（report）课题一：供应链成本效率整合洞察及方案V1.0|（report）课题一：供应链成本效率整合洞察及方案V1.0]]

---

## 本地重建说明

本节为基于当前项目本地资料重建的费用科目拆解，不等同于钉钉原文复制。当前重建目标是把供应链履约成本拆到可取数、可分摊、可归因的科目层，支撑后续成本效率指标体系与报告。

## 1. 成本总口径

供应链成本专题采用节点成本合计口径：

```text
供应链总成本
= 采购成本
+ 头程成本
+ 仓储成本
+ 尾程成本
+ 退换补发成本
+ 小包直邮成本
+ 其他需单列的履约相关成本
```

用于与本地正式稿对齐的四项重算口径：

```text
四项重算总成本率 = (采购成本 + 头程成本 + 尾程成本 + 仓储成本) / 销售额
```

当退换补发、直邮、关税合规等科目尚未完整入账时，必须在报告中标记“未纳入四项重算口径”，不能静默混入其他费用。

## 2. 费用科目拆解表

| 成本节点 | 一级科目 | 二级科目 | 推荐分摊粒度 | 核算来源 | 说明 |
|---|---|---|---|---|---|
| 采购 | 商品采购 | 采购货值、采购折扣、采购价差 | SKU/GTM/供应商/月 | ERP、采购系统、财务 | 采购成本是 MAT2026 中最主要的压力项 |
| 采购 | 合规成本 | 关税、清关费、认证费、商检费 | 批次/SKU/国家 | 关务、财务 | 可并入采购或单列，必须统一 |
| 头程 | 国际运输 | 海运、空运、陆运、铁路 | 批次/SKU/渠道/区域 | TMS、货代账单 | 需要支持海运 $/CBM、空运 $/KG |
| 头程 | 头程附加费 | 燃油附加费、港杂、仓单、换单、查验 | 批次/柜/票 | 物流对账 | 优先按体积、重量、货值分摊 |
| 仓储 | 仓租与管理 | 仓租、管理费、系统费、基础服务费 | 仓/SKU/月 | WMS、3PL/FBA 账单 | FBA、3PL、自建仓分开 |
| 仓储 | 操作费用 | 入库、上架、拣货、打包、贴标、出库 | 订单/SKU/仓 | WMS、仓储账单 | 与订单履约成本联动 |
| 仓储 | 长期库存 | 长期仓储费、库龄罚金、库存配置费 | SKU/仓/月 | FBA/WMS/财务 | 与库龄 90+/180+/365+ 关联 |
| 仓储 | 库存损耗 | 盘亏、报损、过期、滞销跌价 | SKU/仓/月 | WMS、财务 | 需要保留损耗原因 |
| 尾程 | 配送费用 | 快递费、最后一公里、妥投费 | 订单/包裹/国家 | TMS、平台账单 | Amazon/FBA/FBM/DTC 需分开 |
| 尾程 | 附加费用 | 偏远附加费、超重超尺寸、地址更正、燃油 | 订单/包裹 | 物流账单 | 是异常放大诊断重点 |
| 退换补发 | 逆向物流 | 退货运费、返仓、质检、重包装 | 退货单/SKU/原因 | 退货系统、WMS | 必须绑定原因编码 |
| 退换补发 | 补发费用 | 补发商品成本、补发运费、异常赔付 | 售后单/SKU/原因 | 客服、OMS、财务 | 用于识别重复性质量/履约问题 |
| 小包直邮 | 直邮物流 | 直邮运费、直邮清关、直邮尾程 | 订单/国家/渠道 | 物流账单、TMS | 与海外仓/FBA 路径分离 |
| 其他 | 平台履约费 | FBA 配送费、入库配置服务费、平台仓储相关费 | SKU/ASIN/月 | 平台账单 | 不得与尾程/仓储重复计入 |

## 3. 分摊规则

| 费用类型 | 首选分摊口径 | 备选口径 | 不允许的处理 |
|---|---|---|---|
| 采购成本 | SKU 实际采购价 | SPU 加权均摊 | 按销售额粗暴均摊 |
| 头程运输 | 体积/重量/柜型/航次 | 货值加权 | 只按渠道均摊 |
| 关税合规 | 商品 HS/国家/货值 | SKU 货值 | 混入采购总额后失去明细 |
| 仓储费 | SKU 库存天数 × 体积/件数 | SKU 库存金额 | 只按月末库存均摊 |
| 尾程费 | 订单/包裹实际账单 | 国家/渠道/重量带 | 与头程费用混记 |
| 退换补发 | 退货单/售后单实际费用 | SKU/原因加权 | 归入“其他费用” |
| 直邮 | 订单实际物流路径 | 国家/重量带 | 与海外仓尾程合并 |

## 4. 节点到指标映射

| 成本节点 | 对应指标 | 管理问题 | 下游文件 |
|---|---|---|---|
| 采购 | 采购费率、采购降本率、采购物流成本优化率 | 采购上行是否吞噬物流降本 | 成本效率指标体系、整合洞察报告 |
| 头程 | 头程运输成本率、海运单位成本、空运单位成本、整柜率 | 运力方式与装载是否合理 | 成本分析思路、运输优化模型 |
| 仓储 | 仓储成本率、长期仓储费占比、库存周转天数 | 库存资金与库龄是否失控 | 库存健康看板、仓网规划 |
| 尾程 | 尾程配送成本率、单订单履约成本、配送时效达成率 | 高销售区是否被尾程拖累 | 成本视图、履约稳定看板 |
| 退换补发 | 退货处理成本率、履约事故率、退货率 | 逆向链路是否重复侵蚀利润 | 逆向物流归因 |
| 小包直邮 | 直邮成本率、直邮时效、直邮异常率 | 直邮是否超过成本时效边界 | 渠道履约策略 |

## 5. `SCM-DATA-002` 费用科目到成本宽表映射

本节服务 `dwt_supply_chain_cost`，用于把费用科目转成可入宽表的字段、节点枚举和分摊规则。真实源表未确认前，本节只作为数据任务规格，不等同于生产 SQL。

### 5.1 成本节点枚举

| `cost_node` | 覆盖科目 | 对应宽表金额字段 | 必须保留的追溯键 |
|---|---|---|---|
| `purchase` | 商品采购、采购价差、采购折扣、关税合规 | `purchase_cost` | `purchase_order_id`、`supplier_id`、`sku` |
| `first_leg` | 海运、空运、陆运、港杂、清关、燃油附加费 | `first_leg_cost` | `shipment_id`、`batch_id`、`route_id` |
| `warehouse` | 仓租、管理费、入库、上架、拣货、打包、长期仓储、损耗 | `warehouse_cost` | `warehouse_id`、`sku`、`bill_id` |
| `last_mile` | 快递、妥投、偏远、超重、地址更正、尾程燃油 | `last_mile_cost` | `order_id`、`package_id`、`carrier_id` |
| `reverse` | 退货运费、返仓、质检、重包装、补发、报废 | `reverse_cost` | `return_id`、`after_sales_id`、`reason_code` |
| `direct_mail` | 直邮运费、直邮清关、直邮尾程、异常件 | `direct_mail_cost` | `order_id`、`country`、`carrier_id` |
| `other_fulfillment` | 平台履约附加费、无法归入以上节点的履约费用 | `other_fulfillment_cost` | `bill_id`、`expense_subject` |

### 5.2 分摊字段

| 字段 | 用途 | 验收要求 |
|---|---|---|
| `raw_cost` | 分摊前原始费用 | 与账单或凭证金额一致 |
| `allocated_cost` | 分摊后进入宽表的费用 | 分摊后合计必须回勾 `raw_cost` |
| `allocation_rule` | 分摊规则编码 | 允许值需提前定义，例如 `sku_actual`、`volume_weighted`、`value_weighted` |
| `allocation_basis` | 分摊基准值 | 体积、重量、货值、订单数、库存天数等 |
| `currency` | 原币种 | 必须保留 |
| `fx_rate` | 入账汇率 | 必须记录来源和日期 |
| `cost_period` | 成本所属期间 | 必须与财务期间可对齐 |
| `bill_period` | 账单期间 | 用于识别跨期账单 |

### 5.3 不可入表条件

1. 无法追溯到账单、订单、批次、SKU 或财务凭证的费用，不得进入正式宽表。
2. 缺失分摊规则的费用只能进入缺口清单，不能默认写入 `other_fulfillment_cost`。
3. 同一费用同时命中多个 `cost_node` 时，必须先解决科目归属冲突。
4. 汇率来源缺失时，不得跨币种合并成本率。
5. 平台履约费若已包含仓储或配送费用，必须先拆分，不能重复计入仓储和尾程。

## 6. `SCM-DATA-006` 逆向费用到宽表映射

本节服务 `dwt_reverse_logistics`，用于把退换补发相关费用转成逆向物流宽表字段、原因编码和责任归因。真实源表未确认前，本节只作为数据任务规格，不等同于生产 SQL。

### 6.1 逆向费用枚举

| `reverse_cost_type` | 覆盖科目 | 对应宽表字段 | 必须保留的追溯键 |
|---|---|---|---|
| `return_shipping` | 退货运费、返仓运费 | `return_shipping_cost` | `return_id`、`order_id`、`carrier_id` |
| `inspection` | 质检、检测、拍照、判责 | `inspection_cost` | `return_id`、`warehouse_id`、`inspection_id` |
| `repack` | 重包装、换标、耗材 | `repack_cost` | `return_id`、`sku`、`warehouse_id` |
| `reship_logistics` | 补发物流、重新派送 | `reship_cost` | `after_sales_id`、`order_id`、`carrier_id` |
| `reship_goods` | 补发商品成本 | `reship_goods_cost` | `after_sales_id`、`sku`、`purchase_order_id` |
| `scrap` | 报废、不可售跌价、销毁 | `scrap_amount` | `return_id`、`sku`、`scrap_reason_code` |
| `compensation` | 客服赔付、平台赔付 | `compensation_amount` | `after_sales_id`、`claim_id` |
| `recovery` | 返仓可售恢复金额 | `sellable_recovery_amount` | `return_id`、`sku`、`warehouse_id` |

### 6.2 原因编码层级

| 层级 | 字段 | 示例 | 用途 |
|---|---|---|---|
| L1 | `reason_group` | 产品质量、物流损坏、错漏发、用户原因、平台规则 | 管理层归因 |
| L2 | `return_reason_code` | `quality_defect`、`damaged_in_transit`、`wrong_item` | P5 退货原因帕累托 |
| L3 | `reason_detail` | 漏液、破损、少件、尺码不符 | SKU 整改 |
| 责任 | `responsibility_type` | 产品/仓储/物流/客服/用户/平台 | Owner 归属 |
| 状态 | `reason_coding_status` | coded/uncoded/review | 数据治理 |

### 6.3 费用归因规则

| 场景 | 首选归因 | 备选归因 | 不允许的处理 |
|---|---|---|---|
| 有退货单和原订单 | `return_id` + `order_id` + `sku` | `after_sales_id` + `sku` | 只按月份汇总 |
| 有补发但无退货 | `after_sales_id` + `order_id` + `sku` | 客服工单 + SKU | 混入退货运费 |
| 有返仓质检 | `return_id` + `warehouse_id` + 质检结果 | `sku` + 仓 | 不区分可售和不可售 |
| 有报废损失 | `return_id` + `sku` + 报废原因 | SKU 加权 | 归入其他费用 |
| 有客服赔付 | `after_sales_id` + `claim_id` | 原订单 | 与补发商品成本重复 |

### 6.4 入表验收

1. `reverse_total_cost` 必须能拆回退货运费、质检、重包装、补发、报废和赔付分项。
2. `return_reason_code` 缺失的记录只能进入 Grey 状态，不得进入 TOP 原因强结论。
3. 同一售后单发生退货和补发时，必须保留两类成本，不得互相覆盖。
4. 返仓可售恢复金额必须与报废金额分开，不能只保留净额。
5. TOP 原因进入 P5 前必须能绑定 `responsibility_type`、`owner_name` 和 `action_id`。

## 7. 核算验收要求

1. 每个费用科目必须能追溯到原始账单、订单、批次或财务凭证之一。
2. 分摊前金额、分摊后金额、分摊规则和分摊日期必须同时保留。
3. 同一笔费用不得同时进入头程、尾程、仓储等多个节点。
4. 四项重算口径和全链路口径必须并行保留，便于与现有 MAT 正式稿对齐。
5. 费用科目缺失时应生成缺口清单，而不是用 `其他` 覆盖。
