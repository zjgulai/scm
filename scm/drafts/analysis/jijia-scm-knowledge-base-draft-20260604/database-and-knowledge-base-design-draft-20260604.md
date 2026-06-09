---
title: 积加 SCM 数据库底座与知识库设计
doc_type: architecture
module: scm
topic: jijia-database-knowledge-base-design
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 积加 SCM 数据库底座与知识库设计

## 设计原则

1. 单据明细优先，不直接从汇总字段建核心指标。
2. 库存必须同时保留快照和流水。
3. 参数驱动公式必须保留参数快照。
4. 平台报告、ERP 单据、三方仓接口必须分 source。
5. 指标定义必须可版本化。
6. 知识库必须和数据模型使用同一指标编码。

## 数据库分层

```text
ods: 原始导出/API 明细
  -> dwd: 清洗后的业务单据事实
  -> dws: 按 SKU/MSKU/仓库/日期聚合的供应链宽表
  -> ads: BI 指标和预警结果
  -> meta: 指标定义、字段映射、血缘、参数快照
```

## 核心维表

| 表 | 粒度 | 关键字段 |
|---|---|---|
| `dim_product` | SKU | sku、产品名称、品类、品牌、单品毛重、尺寸、箱规 |
| `dim_msku` | MSKU + 平台站点 | msku、sku、platform、site、store、配送方式 |
| `dim_warehouse` | 仓库 | warehouse_id、仓库类型、国家、是否平台仓、是否三方仓 |
| `dim_supplier` | 供应商 | supplier_id、结算方式、采购员、状态 |
| `dim_supplier_product` | 供应商 + SKU | supplier_id、sku、采购交期、MOQ、默认供应商、报价 |
| `dim_logistics_method` | 物流方式 | method_id、计费方式、体积重系数、时效、发货国家、目的仓 |
| `dim_logistics_channel` | 物流渠道 | channel_id、物流商、渠道类型、是否 API 对接 |
| `dim_site` | 平台站点 | platform、site、国家、区域 |
| `dim_status` | 模块 + 状态 | module、document_type、status_code、status_name、是否有效 |
| `dim_date` | 日期 | date、week、month、quarter、year |

## 核心事实表

| 表 | 粒度 | 用途 |
|---|---|---|
| `fact_replenishment_snapshot` | 计算批次 + MSKU + 目的仓 | 智能补货、红绿线、连续补货建议 |
| `fact_purchase_plan_line` | 采购计划单 + SKU/MSKU 行 | 采购计划量、分单状态、目的仓、物流方式 |
| `fact_split_task_line` | 分单任务 + SKU 行 | 分单数量、供应商、装配仓、采购/预装/委外去向 |
| `fact_purchase_order_line` | PO + SKU 行 | 采购量、交货量、入库量、金额 |
| `fact_delivery_order_line` | LN + SKU 行 | 交货量、实交量、质检、发货、入库状态 |
| `fact_assembly_plan_line` | 预装需求 + 组合品行 | 可装量、计划需求量、实际需求量、装配中、已装配 |
| `fact_transfer_order_line` | 调拨单 + SKU 行 | 调拨量、已出运、已调入、调出仓、调入仓 |
| `fact_shipment_order_line` | 发货单 + SKU 行 | 发货量、出运日期、预计到仓、实际到仓、完成状态 |
| `fact_first_mile_order_line` | 头程单 + 货件 + SKU 行 | 货件申报量、单据量、差异量 |
| `fact_inbound_order_line` | 入库单 + SKU 行 | 应收货、已收货、已入库、良品、次品 |
| `fact_inventory_snapshot` | 快照时间 + SKU/MSKU + 仓库 + 站点 | 计划量、采购量、交货量、在途、良品、预占、可用 |
| `fact_inventory_transaction` | 库存流水单行 | 操作类型、来源单据、良品变化、次品变化 |
| `fact_batch_inventory_snapshot` | 快照时间 + 实物批次 | 批次追溯、初始入库来源、实物状态 |
| `fact_logistics_cost_line` | 发货单 + 物流商 + 费用项 | 预估费用、实际费用、估实差异 |
| `fact_supplier_reconciliation_line` | 供应商 + 单据 + SKU | 采购量、发货量、入库量、含税/不含税金额 |

## 元数据表

| 表 | 用途 |
|---|---|
| `meta_source_document` | 记录帮助文档、ERP 导出、API 文档来源 |
| `meta_field_mapping` | `doc_field`、`export_field`、`api_field` 映射 |
| `meta_field_validation_status` | 记录字段证据状态、导出确认状态、权限隐藏和参数依赖 |
| `meta_metric_definition` | 指标编码、名称、口径、状态、负责人 |
| `meta_metric_dependency` | 指标依赖字段、依赖指标、计算顺序 |
| `meta_parameter_snapshot` | 智能补货、库存映射、物流方式等参数快照 |
| `meta_quality_rule` | 数据质量规则和阈值 |
| `meta_lineage_edge` | 单据和字段血缘边 |
| `meta_change_log` | 指标口径和数据模型变更记录 |

## 推荐指标编码规则

```text
SCM-[DOMAIN]-[NNN]
```

域编码：

| 编码 | 业务域 |
|---|---|
| PLAN | 计划 |
| PUR | 采购 |
| WH | 仓库 |
| LOG | 物流 |
| COST | 成本 |
| LINEAGE | 血缘 |

示例：

- `SCM-PLAN-001`：目标库存量
- `SCM-PLAN-002`：推荐采购量
- `SCM-PUR-001`：采购计划量
- `SCM-WH-001`：良品可用量
- `SCM-LOG-001`：物流时效偏差

## 知识库目录设计

```text
jijia-scm-knowledge-base/
├─ 00-governance/
│  ├─ metric-naming-rule.md
│  ├─ source-evidence-rule.md
│  └─ change-log.md
├─ 01-source-docs/
│  ├─ plan-source-map.md
│  ├─ purchase-source-map.md
│  ├─ warehouse-source-map.md
│  └─ logistics-source-map.md
├─ 02-business-process/
│  ├─ plan-process.md
│  ├─ purchase-process.md
│  ├─ warehouse-process.md
│  ├─ logistics-process.md
│  └─ end-to-end-scm-process.md
├─ 03-metric-dictionary/
│  ├─ plan-metrics.md
│  ├─ purchase-metrics.md
│  ├─ warehouse-metrics.md
│  ├─ logistics-metrics.md
│  └─ cost-metrics.md
├─ 04-lineage/
│  ├─ document-lineage.md
│  ├─ metric-lineage.md
│  └─ field-lineage.md
├─ 05-data-model/
│  ├─ dimension-tables.md
│  ├─ fact-tables.md
│  └─ meta-tables.md
├─ 06-quality-rules/
│  ├─ plan-quality-rules.md
│  ├─ purchase-quality-rules.md
│  ├─ warehouse-quality-rules.md
│  └─ logistics-quality-rules.md
├─ 07-reporting/
│  ├─ plan-dashboard.md
│  ├─ purchase-dashboard.md
│  ├─ warehouse-dashboard.md
│  └─ logistics-dashboard.md
└─ 08-open-questions/
   ├─ erp-field-validation.md
   ├─ parameter-validation.md
   └─ api-coverage-validation.md
```

## 知识库页面模板

```md
---
metric_id:
metric_name:
domain:
status:
owner:
source_document:
source_table:
grain:
updated:
---

# 指标名称

## 业务问题

## 口径定义

## 计算逻辑

## 来源字段

## 依赖指标

## 数据质量规则

## 适用场景

## 不适用场景

## 变更记录
```

## 数据质量规则样例

| 规则 | 说明 |
|---|---|
| 字段状态统一 | 页面可见、导出确认、API 确认、权限隐藏、参数依赖必须进入元数据表 |
| 单据链路完整性 | 采购订单必须能追溯到采购计划或明确标记为手工采购 |
| 数量非负 | 计划量、采购量、交货量、入库量、库存量不得为负，调整单除外 |
| 状态排除 | 已作废单据不得进入有效计划量、采购量、交货量 |
| 入库一致性 | 入库单已入库量不得大于应收货，除非业务允许超收并有变更单 |
| 物流差异 | 实际费用高于预估费用超过阈值时进入差异处理 |
| 库存快照刷新 | 库存快照必须记录刷新时间，不能和实时流水混算 |

## 第一版建模优先级

1. 产品、MSKU、仓库、供应商、物流方式主数据。
2. 采购计划、采购订单、交货单、发货单、入库单明细。
3. 产品库存快照和库存流水。
4. 物流费用和估实差异。
5. 智能补货快照和参数快照。
6. 指标血缘和质量规则。

## 不建议的路径

不要直接用页面汇总字段搭建全部指标。汇总字段适合看板，不适合作为底层事实。正确路径是：用明细事实表建指标，再用页面汇总字段做一致性校验。
