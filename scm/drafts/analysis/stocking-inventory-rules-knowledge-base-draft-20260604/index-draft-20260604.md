---
title: 备货库存规则知识库总览
doc_type: analysis
module: stocking-inventory
topic: rules-knowledge-base-index
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 备货库存规则知识库总览

## 定位

本知识库独立沉淀《备货库存数据规划》的业务库存规则。它不并入原积加 SCM 知识库，不改变原积加指标字典。

隔离原则：

- 本知识库负责 `备货计划业务库存` 的产品规则、计算口径、平台差异、字段映射和落库计划。
- 原积加 SCM 知识库负责 `积加 ERP 页面事实`、计划-采购-仓库-物流模块字段和指标血缘。
- 涉及积加数据时，通过 `jijia-consistency-map-draft-20260604.md` 对齐字段、指标和来源页面。

## 文件结构

| 文件 | 用途 |
|---|---|
| `alidocs-stocking-inventory-planning-raw-extract-draft-20260604.md` | 钉钉文档浏览器渲染原文分段抽取副本 |
| `source-evidence-boundary-draft-20260604.md` | 来源、证据等级、抽取限制和使用边界 |
| `business-rules-overview-draft-20260604.md` | 备货库存业务目标、库存域、主流程和规则分层 |
| `data-source-map-draft-20260604.md` | SRM、积加、自研 ERP、平台接口、物流跟踪等来源地图 |
| `metric-dictionary-draft-20260604.md` | 备货业务库存指标字典 |
| `platform-rule-dictionary-draft-20260604.md` | 产品库存、FBA、Walmart、TikTok、Shopify、三方仓规则 |
| `data-lineage-and-model-draft-20260604.md` | 业务库存血缘和数据库底座设计 |
| `jijia-consistency-map-draft-20260604.md` | 与积加 SCM 知识库保持一致的字段和指标映射 |
| `validation-and-implementation-plan-draft-20260604.md` | 导出/API 核验、落库和看板建设计划 |

## 核心结论

备货库存不是单一库存字段，而是跨来源汇总后的业务库存：

```text
备货业务库存
= 计划库存
+ 采购未交库存
+ 在途库存
+ 在库业务库存
```

其中 `在库业务库存` 又拆成：

```text
在库库存 = 可用库存 + 预占库存 + 冻结库存 + 不良品库存
在库良品库存 = 可用库存 + 预占库存 + 冻结库存
```

这些公式只适用于备货业务库存语义层，不覆盖积加 ERP 原生 `在库量`、`良品量`、`次品量`、`可用量` 等页面字段。

## 一致性规则

涉及积加数据时必须遵守：

1. 积加字段名沿用原积加 SCM 知识库的指标命名，不自造同义词。
2. 同名字段在不同平台公式不同，必须带 `source_system`、`inventory_source_type`、`channel`。
3. 默认 0 必须标记为 `business-default-zero`，不能等同于数据缺失。
4. SKU、MSKU、FNSKU、GTIN、ItemID 一对多映射必须记录扩展倍数。
5. 调拨、FBA 货件、物流跟踪、SRM 单据状态必须进入标准状态维表。

## 当前状态

当前版本是草稿，可用于：

- 备货库存规则评审。
- 数据源对齐和字段导出核验。
- 后续建立 `planning_business_inventory` 语义层。
- 和原积加 SCM 知识库做一致性比对。

当前版本不能直接作为：

- 最终上线 SQL。
- 已确认字段类型。
- 已确认系统接口清单。
- 财务或库存结算依据。
