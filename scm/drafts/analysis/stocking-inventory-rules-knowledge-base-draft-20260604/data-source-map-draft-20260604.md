---
title: 备货库存数据源地图
doc_type: analysis
module: stocking-inventory
topic: data-source-map
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 备货库存数据源地图

## 数据源清单

| 数据源 | 来源系统 | 用途 | 当前证据状态 |
|---|---|---|---|
| SRM 需求池明细 | SRM | 产品库存计划库存 | `source-doc-candidate` |
| SRM 采购订单明细 | SRM | 计划库存、采购未交库存 | `source-doc-candidate` |
| SRM 送货单明细 | SRM | 采购未交库存 | `source-doc-candidate` |
| 积加产品库存 | Jijia ERP | 产品库存可用、预占、不良品 | `jijia-consistency-reference` |
| 积加平台仓库存/FBA 库存 | Jijia ERP | FBA 可用、预占、冻结、不可售 | `jijia-consistency-reference` |
| 积加三方仓库存 | Jijia ERP | Shopify、TikTok、三方仓可用、预占、不良品 | `jijia-consistency-reference` |
| 调拨单 | Jijia ERP | 计划库存、在途库存 | `jijia-consistency-reference` |
| FBA 货件 | Jijia ERP/平台报告 | FBA 在途库存 | `source-doc-candidate` |
| 自研 ERP 物流跟踪表 | 自研 ERP | Walmart、TikTok、Shopify 在途库存 | `source-doc-candidate` |
| 自研 ERP 仓库归属 | 自研 ERP | 按渠道、国家、仓库类型筛选仓库 | `source-doc-candidate` |
| 自研 ERP 销售映射 | 自研 ERP | 供应链 SKU 与 MSKU/国家映射 | `source-doc-candidate` |
| Walmart 在线商品 | 自研 ERP/平台接口 | FNSKU -> GTIN -> ItemID 映射 | `source-doc-candidate` |
| FBT 库存 | 平台接口/自研 ERP | TikTok 可用、预占、次品 | `source-doc-candidate` |
| TikTok 库存接口 | 平台接口 | TikTok 库存同步 | `source-doc-candidate` |

## 来源系统分组

| 系统 | 必须保留的标识 |
|---|---|
| Jijia ERP | `source_system=Jijia ERP`、页面、仓库、SKU/MSKU、仓库类型 |
| SRM | `source_system=SRM`、需求池单号、PO、送货单、物料编码、供应商 |
| 自研 ERP | `source_system=Self ERP`、仓库归属、销售映射、物流跟踪单 |
| 平台接口 | `source_system=Platform API`、平台、国家、ItemID/MSKU/GTIN/FNSKU |

## 刷新频率

| 数据源 | 钉钉规则描述 | 建模要求 |
|---|---|---|
| 积加产品库存 + 三方仓库存 | 同步后实时更新 | 记录 `synced_at` 和来源任务 |
| FBA 库存 | 每小时整点更新一次 | 记录小时级快照 |
| Walmart 物流跟踪表 | 每小时整点定时更新 | 记录物流跟踪更新时间 |
| TikTok 库存接口 | 接口同步后实时更新 | 记录接口同步批次 |
| TikTok 物流跟踪表 | 每小时整点定时更新 | 记录物流跟踪更新时间 |

## 数据源缺口

| 缺口 | 影响 |
|---|---|
| SRM 字段名未导出确认 | 计划库存和采购未交库存无法写 SQL |
| FBA 货件字段未导出确认 | FBA 在途规则无法落库 |
| 自研 ERP 物流跟踪表未导出确认 | Walmart/TikTok/Shopify 在途无法落库 |
| 仓库归属未导出确认 | 渠道和国家筛选无法稳定 |
| 销售映射未导出确认 | SKU/MSKU/ItemID 映射风险无法量化 |
