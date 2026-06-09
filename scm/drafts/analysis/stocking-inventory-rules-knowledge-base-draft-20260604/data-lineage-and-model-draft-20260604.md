---
title: 备货库存血缘与数据模型
doc_type: architecture
module: stocking-inventory
topic: data-lineage-and-model
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 备货库存血缘与数据模型

## 血缘主链路

```text
SRM 需求池
  -> 计划库存
SRM 采购订单 + SRM 送货单
  -> 采购未交库存
调拨单 + FBA 货件
  -> FBA 计划库存/在途库存
调拨单 + 发货单
  -> Shopify 计划库存/在途库存
调拨单 + 物流跟踪表 + 平台 SKU 映射
  -> Walmart/TikTok 计划库存/在途库存
积加产品库存/平台仓库存/三方仓库存 + 平台接口库存
  -> 可用/预占/冻结/不良品
仓库归属 + 销售映射
  -> 渠道粒度归并
业务派生公式
  -> 在库库存/在库良品库存
业务库存快照
  -> 备货计划、库存展示、导出
```

## 推荐数据分层

| 层 | 说明 |
|---|---|
| ODS | SRM、积加、自研 ERP、平台接口原始导出/API |
| DWD | 清洗后的需求池、采购订单、送货单、调拨单、货件、物流跟踪、平台库存 |
| DWS | 按平台业务主键、仓库、国家汇总的备货库存宽表 |
| ADS | 页面展示、导出和预警指标 |
| META | 指标定义、状态枚举、字段映射、仓库归属、SKU 映射、质量规则 |

## 核心事实表

| 表 | 粒度 | 说明 |
|---|---|---|
| `fact_planning_business_inventory_snapshot` | 快照时间 + 渠道 + 业务主键 + 仓库/国家 | 备货业务库存总表 |
| `fact_srm_demand_pool_line` | 需求池单号 + 物料编码 + 供应商 | 计划库存来源 |
| `fact_srm_purchase_order_line` | SRM PO + 物料编码 + 供应商 | 计划库存、采购未交库存 |
| `fact_srm_delivery_notice_line` | 送货单 + PO + SKU | 采购未交库存 |
| `fact_jijia_inventory_snapshot` | 快照时间 + SKU/MSKU + 仓库/平台仓 | 积加库存来源统一入口 |
| `fact_platform_inventory_snapshot` | 快照时间 + 平台 + 平台主键 + 国家/仓库 | FBA/Walmart/TikTok/FBT 平台库存 |
| `fact_transfer_order_line` | 调拨单 + SKU/MSKU/FNSKU + 调入仓 | 计划库存和在途库存来源 |
| `fact_fba_shipment_line` | FBA 货件 + MSKU + 仓库 | FBA 在途库存 |
| `fact_logistics_tracking_line` | 物流跟踪单 + SKU 明细 + 渠道 + 国家 | Walmart/TikTok/Shopify 在途 |

## 核心维表

| 表 | 粒度 | 说明 |
|---|---|---|
| `dim_business_inventory_key` | 渠道 + 业务主键类型 + 业务主键 | 统一 ItemID、MSKU、供应链 SKU、FNSKU |
| `dim_channel_warehouse_attribution` | 仓库 + 渠道 + 国家 + 仓库类型 | Walmart/TikTok/Shopify 仓库筛选 |
| `dim_platform_sku_mapping` | 平台 + SKU/MSKU/FNSKU/GTIN/ItemID + 国家 | 平台主键映射 |
| `dim_status_code` | 系统 + 单据类型 + 状态 | 需求池、采购订单、送货单、调拨、货件、物流跟踪状态 |
| `dim_inventory_source_type` | 来源系统 + 库存类型 | 区分积加、SRM、自研 ERP、平台接口 |

## 元数据表

| 表 | 说明 |
|---|---|
| `meta_stock_metric_definition` | 备货库存指标编码、名称、公式、负责人 |
| `meta_stock_field_mapping` | 钉钉规则字段、源系统字段、积加一致性字段、数据库字段 |
| `meta_stock_lineage_edge` | 字段、事实表、指标之间的血缘边 |
| `meta_stock_quality_rule` | 默认 0、一对多映射、状态过滤、同步延迟等质量规则 |
| `meta_stock_sync_batch` | 各来源同步批次和刷新时间 |

## 质量规则

| 规则 | 触发条件 | 处理 |
|---|---|---|
| 默认 0 标记 | 字段规则为默认为 0 | 字段状态写 `business-default-zero` |
| 映射扩展 | 一个 GTIN 对多个 ItemID，或供应链 SKU + 国家对多个 MSKU | 记录扩展倍数，标记 `mapping-expanded` |
| 未匹配 | 无 GTIN、无 MSKU、无销售映射 | 进入未匹配明细表 |
| 状态过滤 | 单据状态不在规则允许范围 | 不进入业务库存 |
| 同步延迟 | 来源同步时间超过阈值 | 标记库存过期 |
| 积加字段偏移 | 积加字段名或页面口径和一致性映射不一致 | 阻断指标定稿 |
