---
title: 备货库存与积加 SCM 一致性映射
doc_type: analysis
module: stocking-inventory
topic: jijia-consistency-map
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 备货库存与积加 SCM 一致性映射

## 一致性目标

本文件只负责一致性映射，不把备货库存知识库并入原积加 SCM 知识库。

一致性原则：

- 涉及积加页面字段时，沿用原积加 SCM 知识库的字段名称和指标解释。
- 涉及备货业务派生字段时，使用 `STOCK-*` 独立指标编码。
- 不用备货业务公式覆盖积加 ERP 原生字段。

## 参考文件

| 文件 | 用途 |
|---|---|
| `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/warehouse-live-metric-dictionary-draft-20260604.md` | 积加仓库指标一致性参考 |
| `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/warehouse-live-page-data-dictionary-draft-20260604.md` | 积加页面字段一致性参考 |
| `drafts/analysis/jijia-scm-knowledge-base-draft-20260604/erp-field-validation-checklist-draft-20260604.md` | 积加字段核验状态参考 |

## 字段映射

| 备货字段 | 备货指标 | 积加一致字段 | 积加指标 | 一致性处理 |
|---|---|---|---|---|
| 可用库存 | STOCK-BIZ-001 | 可用量、可用数量 | `wh_available_qty` | 名称可不同，含义必须按来源平台公式保留 |
| 预占库存 | STOCK-BIZ-002 | 预占量、已处理预占、出库占用数量 | `wh_reserved_qty` | 积加原字段与平台字段分开 |
| 冻结库存 | STOCK-BIZ-003 | 暂无统一积加字段 | 新增 | 不映射为积加可用或预占 |
| 不良品库存 | STOCK-BIZ-004 | 次品量、不良品、不可售、拒收损坏 | `wh_defective_qty` | 统一为 defective 语义，保留平台字段 |
| 在途库存 | STOCK-INTRANSIT-* | 在途量、货件在途量、已出运 | `wh_in_transit_qty`、`wh_shipment_inbound_qty` | 需要标记来源类型 |
| 计划库存 | STOCK-PLAN-001 | 计划量、调拨待出库 | `wh_plan_purchase_delivery_qty`、`wh_transfer_pending_out_qty` | 不能直接等同积加计划量 |
| 在库库存 | STOCK-BIZ-005 | 在库量 | `wh_onhand_qty` | 备货派生字段，不覆盖积加在库量 |
| 在库良品库存 | STOCK-BIZ-006 | 良品量、良品可用量 | `wh_good_qty`、`wh_available_qty` | 备货派生字段，不覆盖积加良品量 |

## 积加来源页面映射

| 备货来源 | 积加页面 | 一致性要求 |
|---|---|---|
| 积加产品库存 | 产品库存 | 对齐 SKU/MSKU、可用量、预占量、次品量 |
| 积加 FBA 库存 | 平台仓库存/Amazon.FBA库存 | 对齐 ASIN/MSKU/FNSKU、平台仓、货件在途、在库量 |
| 积加三方仓库存 | 三方仓库存差异、三方仓入库/出库、平台仓库存 | 对齐三方仓 SKU、可用量、预占量、次品量 |
| 调拨单 | 调拨单 | 对齐调拨量、待拣货、待出库、调拨在途、已完成 |
| 发货单/运输 | 销售出库单、运输单、包裹单 | 对齐出库、发运、物流状态 |
| 仓库资料 | 仓库资料 | 对齐仓库 ID、仓库名称、仓库类型、平台仓归属 |

## 状态一致性

| 状态域 | 备货规则 | 积加一致性约束 |
|---|---|---|
| 调拨计划 | 待拣货、待出库 | 使用积加调拨单状态枚举 |
| 调拨在途 | 调拨在途、已完成 | 使用积加调拨单状态枚举，但业务用途是计算在途 |
| FBA 货件 | WORKING、SHIPPED、IN_TRANSIT、DELIVERED、CHECKED_IN、READY_TO_SHIP | 独立货件状态域，不与调拨状态混合 |
| 物流跟踪 | 正常在途、出口查验未放行、进口查验未放行、延误风险 | 新增自研 ERP 物流状态域 |

## 禁止混用

| 禁止项 | 原因 |
|---|---|
| 用备货在库库存覆盖积加在库量 | 备货在库是派生公式，积加在库是页面原生口径 |
| 用 Walmart/TikTok 默认 0 表示字段缺失 | 默认 0 是业务规则，不是数据缺失 |
| 把 FBA 买家订单预留直接等同积加预占量 | 字段来源和平台语义不同 |
| 把平台接口库存混进积加库存快照而不标 source | 会破坏血缘和对账 |
| 忽略一对多映射扩展 | 会导致计划库存或可用库存虚高 |
