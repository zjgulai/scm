---
title: 积加 SCM ERP 字段核验清单
doc_type: analysis
module: scm
topic: erp-field-validation-checklist
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 积加 SCM ERP 字段核验清单

## 目标

本清单承接 `implementation-plan-draft-20260604.md` 的阶段 2：ERP 实际字段核验。目标是把帮助文档字段、ERP 页面可见字段、导出字段、API 字段和后续数据库字段建立一一映射。

当前版本重点覆盖仓库模块 40 个子页面。计划、采购、物流模块后续按同一模板补齐。

## 证据边界

本清单使用三类来源：

| 来源 | 当前状态 | 可用于 |
|---|---|---|
| 积加帮助中心文档 | 已整理为四模块知识库草稿 | 业务逻辑、页面说明、字段候选、公式候选 |
| ERP 仓库页面实采 | 已二次重采 40 页 | 页面存在性、筛选器、状态页签、分页量级、可见字段候选 |
| ERP 导出/API/数据库 | 待执行 | 字段最终确认、字段类型、主键、隐藏列、刷新频率 |

当前 UI 证据不能直接等同于最终数据库字段。分页总数、状态页签数量、合计窗口和导出明细属于不同口径，必须分开入模。

## 字段状态枚举

| 状态 | 含义 | 是否可进指标口径 |
|---|---|---|
| `doc-candidate` | 帮助文档或既有知识库出现的字段 | 否，只能作为候选 |
| `ui-confirmed` | ERP 页面可见字段或页面可见业务量 | 可进候选指标，不可定稿 |
| `ui-status-only` | 只有状态页签或状态数量，列表字段未确认 | 只能进状态快照候选 |
| `ui-empty-current-filter` | 当前筛选为空 | 不得推断业务无数据 |
| `operation-page` | 扫码、组包、发货等操作页 | 进流程知识库，不作为列表事实表 |
| `export-confirmed` | ERP 导出列名已确认 | 可进入字段映射 |
| `api-confirmed` | API 字段名和类型已确认 | 可进入 ODS/DWD 设计 |
| `missing` | 导出/API 均未发现 | 从指标口径剔除或转为待补 |
| `permission-hidden` | 权限导致不可见 | 需业务或管理员确认 |
| `parameter-dependent` | 字段受系统参数或筛选配置影响 | 必须绑定参数快照 |

## 核验工作流

1. 固定页面筛选条件，记录仓库、平台、店铺、时间范围、状态页签、成本取值和是否仅良品等条件。
2. 从 ERP 下载中心或页面导出获取明细文件。
3. 对照 `warehouse-live-page-data-dictionary-draft-20260604.md`，建立 `doc_field -> ui_label -> export_field -> api_field -> db_field` 映射。
4. 标记字段状态、字段类型、单位、币种、时间口径、是否可空、是否受参数影响。
5. 把字段挂到目标维表、事实表、快照表或状态快照表。
6. 只有 `export-confirmed` 或 `api-confirmed` 字段才能进入正式指标 SQL。

## 仓库页面核验队列

| 优先级 | 分组 | 页面 | UI 证据状态 | 当前量级 | 目标数据对象 | 导出/API 核验重点 |
|---|---|---|---|---:|---|---|
| P0 | 库存 | 仓库库存 | `ui-confirmed` | 49 | `fact_inventory_snapshot` | 仓库、仓库类型、总库存、在库量、良品量、次品量、可用量、预占量、在途量、计采交合计量 |
| P0 | 库存 | 产品库存 | `ui-confirmed` | 29319 | `fact_inventory_snapshot` | SKU、MSKU、ASIN、仓库、平台站点、总库存、可用量、预占量、货件在途量、库龄段 |
| P0 | 库存 | 自营仓库存 | `ui-confirmed` | 9247 | `fact_bin_inventory_snapshot` | 仓库、库区、库位、SKU、质量状态、位置状态、总数量、出库占用数量、可用数量 |
| P0 | 库存 | Amazon.FBA库存 | `ui-confirmed` | 6684 | `fact_platform_inventory_snapshot` | 平台、店铺、站点、ASIN、MSKU、FNSKU、在库量、已发货量、待入库量、货件在途量、15/30 天销量 |
| P0 | 库存 | 批次库存 | `ui-confirmed` | 279915 | `fact_batch_inventory_snapshot` | 初始批次号、批次类型、SKU/MSKU、当前仓库、状态、数量、采购成本、头程成本、货值 |
| P1 | 库存 | 批次流水 | `ui-empty-current-filter` | - | `fact_batch_flow` | 初始批次号、关联单据、操作类型、子操作类型、质量状态、数量、操作人、操作时间 |
| P1 | 库存 | 库龄分析 | `ui-empty-current-filter` | - | `fact_inventory_age_snapshot` | 仓库库龄、公司库龄、库龄段、数量、货值、本位币汇率月份、是否仅良品 |
| P0 | 库存 | 库存流水 | `ui-empty-current-filter` | - | `fact_inventory_flow` | 关联单据、操作类型、出入前可用、可用出入数、现库存可用、不良品出入数、创建时间 |
| P1 | 入库管理 | 入库单 | `ui-status-only` | 待入库 818 | `fact_inbound_receipt_line`、`fact_order_status_snapshot` | 发货单号、应收货量、已收货量、退货量、送检量、已检量、状态页签筛选口径 |
| P1 | 入库管理 | 质检单 | `ui-empty-current-filter` | 0 | `fact_quality_order_line` | 质检单号、质检状态、质检方式、送检量、抽检量、抽检次品率、质检良品量、实交量 |
| P0 | 库内管理 | 调拨单 | `ui-confirmed` | 2189 | `fact_transfer_order_line`、`fact_order_status_snapshot` | 调拨单号、状态、调拨量、已出运、已调入、待拣货、待出库、调拨在途 |
| P0 | 库内管理 | 调整单 | `ui-confirmed` | 63627 | `fact_adjustment_order_line` | 调整单号、调整仓库、平台站点、状态、处理人、处理时间、调整原因 |
| P1 | 库内管理 | 盘点单 | `ui-confirmed` | 40 | `fact_stock_count_line` | 盘点单号、盘点仓、盘点方式、盘点类型、盈亏数量、状态 |
| P0 | 库内管理 | 其它入库单 | `ui-confirmed` | 1608 | `fact_other_inout_line` | 其它入库号、子操作类型、仓库、入库良品量、入库次品量、审核状态、审核时间 |
| P0 | 库内管理 | 其它出库单 | `ui-confirmed` | 26313 | `fact_other_inout_line` | 其它出库号、子操作类型、仓库、出库良品量、出库次品量、审核状态、审核时间 |
| P1 | 库内管理 | 库存状态变更单 | `ui-confirmed` | 4 | `fact_stock_status_change` | 变更单号、SKU、平台站点、从库存状态、到库存状态、变更数量、变更原因 |
| P2 | 库内管理 | 装配单 | `ui-confirmed` | 1 | `fact_assembly_order_line` | 装配单号、装配仓、单据类型、状态、装配量、包材消耗、整单人工费 |
| P2 | 库内管理 | 装箱任务 | `ui-confirmed` | 162 | `fact_packing_task_line` | 装箱任务单号、关联单号、发货仓、发货量、已装箱、装箱员、状态 |
| P2 | 库内管理 | 扫码装箱 | `operation-page` | - | `process_scan_packing` | 操作流程、扫描单据类型、提交动作、异常提示，不建列表事实表 |
| P1 | 出库管理 | 物流下单 | `ui-confirmed` | 153 | `fact_logistics_order_line` | 物流下单号、物流商请求状态、物流商、物流渠道、运单号、重量、体积、费用、异常类型 |
| P2 | 出库管理 | 物流商在线申报 | `ui-empty-current-filter` | 0 | `fact_logistics_declaration_line` | 包裹单号、申报状态、申报类型、失败原因、申报人、申报时间 |
| P0 | 出库管理 | 销售出库单 | `ui-confirmed` | 1022 | `fact_delivery_order_line` | 出库单号、SKU、仓库、店铺、订单平台、出库状态、异常、出库时间、物流渠道 |
| P1 | 出库管理 | 拣货任务 | `ui-empty-current-filter` | 0 | `fact_picking_task_line` | 任务编号、仓库、任务状态、出库状态、待拣货量、已拣货量、波次号、拣货员 |
| P2 | 出库管理 | 扫码发货 | `operation-page` | - | `process_scan_shipment` | 验货模式、称重、打印、扫描单据类型、发货动作，不建列表事实表 |
| P2 | 出库管理 | 平台组包 | `operation-page` | - | `process_platform_packaging` | Lazada、Aliexpress、Wildberries 组包流程，不建列表事实表 |
| P1 | 出库管理 | 运输单 | `ui-confirmed` | 267 | `fact_transport_order_line` | 运输单号、包裹信息、发货数量、运费、揽收方式、物流类型、发货仓、目的仓、发运时间 |
| P0 | 出库管理 | 包裹单 | `ui-confirmed` | 55937 | `fact_package_line`、`fact_order_status_snapshot` | 包裹单、物流下单号、订单号、物流商、物流渠道、目的国家、预估费用、实际费用、状态页签口径 |
| P2 | 出库管理 | B2B出库单 | `ui-empty-current-filter` | - | `fact_b2b_delivery_line` | 单据号、关联订单、计划出库量、已拣货量、已出库量、预计出库时间 |
| P2 | 出库管理 | 全托管出库单 | `ui-empty-current-filter` | 0 | `fact_trusteeship_delivery_line` | 出库仓、来源单号、单据状态、计划出库量、已出库量、出库时间 |
| P1 | 三方仓管理 | 三方仓入库预报单 | `ui-confirmed` | 3309 | `fact_third_party_forecast_line` | 预报单号、入库仓库、发货单号、调拨单号、三方仓单号、预约状态 |
| P0 | 三方仓管理 | 三方仓入库单 | `ui-confirmed` | 17678 | `fact_third_party_inbound_line` | 入库单号、入库仓、入库状态、来源单号、三方仓服务商、计划入库数、已入库总数、实际费用 |
| P1 | 三方仓管理 | 三方仓销售出库单 | `ui-confirmed` | 0 | `fact_third_party_outbound_line` | 表格有样本但分页为 0，必须导出确认出库单号、三方仓状态、出库时间、实际费用 |
| P1 | 三方仓管理 | 三方仓大货出库单 | `ui-confirmed` | 91 | `fact_third_party_bulk_outbound_line` | 出库单号、来源单号、目的仓、三方仓状态、异常信息、货件号、实际费用 |
| P0 | 库存稽核 | 三方仓库存差异 | `ui-confirmed` | 781 | `fact_inventory_reconciliation_diff` | ERP 数量、三方仓数量、可用量、预占量、在途量、次品量、预计在库量、差异数量 |
| P2 | 库存稽核 | 月度FBA报告差异 | `ui-empty-current-filter` | 0 | `fact_fba_monthly_variance` | 月份、店铺/仓库、平台站点、MSKU、ASIN、差异数量 |
| P2 | 库存稽核 | FBA库存对账 | `ui-empty-current-filter` | 0 | `fact_fba_inventory_reconciliation` | 对账月份、处理状态、所属仓库/站点、ASIN/MSKU/FNSKU、差异类型、处理人 |
| P0 | 基础配置 | 仓库资料 | `ui-confirmed` | 81 | `dim_warehouse` | 仓库 ID、仓库名称、仓库类型、国家、省份、启用状态、仓库参数 |
| P1 | 基础配置 | 库位资料 | `ui-empty-current-filter` | - | `dim_storage_bin` | 仓库、库区编码、库区名称、上下架优先级、是否可上架、是否可下架 |
| P2 | 基础配置 | 容器资料 | `ui-empty-current-filter` | - | `dim_container_rule` | 编码规则、容器类型、规则名称、仓库名称、已生成数量 |
| P0 | 基础配置 | 库存批次初始化 | `ui-confirmed` | 56 | `fact_inventory_batch_initialization` | 仓库 ID、仓库名称、仓库类型、库存初始化状态、仓库创建时间 |

## P0 字段映射种子

以下字段先进入第一批导出核验，不等于最终字段名。

| 指标/实体 | UI 字段候选 | 目标库字段 | 来源页面 | 状态 |
|---|---|---|---|---|
| 仓库主键 | 仓库ID、仓库名称 | `warehouse_id`、`warehouse_name` | 仓库资料、仓库库存 | `ui-confirmed` |
| 仓库类型 | 仓库类型 | `warehouse_type` | 仓库资料、仓库库存 | `ui-confirmed` |
| SKU 主键 | SKU、产品名称/SKU | `sku`、`product_name` | 产品库存、批次库存、销售出库单 | `ui-confirmed` |
| 平台站点 | 平台站点、店铺、站点 | `platform`、`site`、`store` | 产品库存、平台仓库存、销售出库单 | `ui-confirmed` |
| 总库存 | 总库存、总数量 | `total_inventory_qty` | 仓库库存、产品库存、平台仓库存 | `ui-confirmed` |
| 在库量 | 在库量 | `onhand_qty` | 仓库库存、产品库存、平台仓库存 | `ui-confirmed` |
| 良品量 | 良品量 | `good_qty` | 仓库库存、产品库存 | `ui-confirmed` |
| 次品量 | 次品量、不良品 | `defective_qty` | 仓库库存、产品库存、库存流水 | `ui-confirmed` |
| 可用量 | 可用量、可用数量 | `available_qty` | 仓库库存、产品库存、自营仓库存 | `ui-confirmed` |
| 预占量 | 预占量、出库占用数量 | `reserved_qty` | 仓库库存、产品库存、自营仓库存 | `ui-confirmed` |
| 在途量 | 在途量、货件在途量 | `in_transit_qty`、`shipment_inbound_qty` | 产品库存、平台仓库存 | `ui-confirmed` |
| 批次号 | 初始批次号 | `batch_no` | 批次库存、批次流水 | `ui-confirmed` |
| 批次数量 | 数量 | `batch_qty` | 批次库存 | `ui-confirmed` |
| 批次成本 | 采购成本、头程成本、货值 | `purchase_cost`、`headway_cost`、`inventory_value` | 批次库存 | `ui-confirmed` |
| 库存流水 | 关联单据、操作类型、可用出入数、不良品出入数 | `source_order_no`、`operation_type`、`available_delta_qty`、`defective_delta_qty` | 库存流水 | `doc-candidate` |
| 调拨状态 | 待拣货、待出库、调拨在途 | `status_name`、`status_count` | 调拨单 | `ui-status-only` |
| 包裹状态 | 待出运、已出运、已取消 | `status_name`、`status_count` | 包裹单 | `ui-status-only` |
| 三方仓差异 | ERP、三方、差异 | `erp_qty`、`external_qty`、`variance_qty` | 三方仓库存差异 | `ui-confirmed` |

## 字段映射模板

每次导出后按以下模板登记，不直接覆盖指标字典。

| module | page | source_url | filter_snapshot | doc_field | ui_label | export_file | export_field | api_field | db_table | db_field | data_type | unit | currency | status | note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| warehouse | 产品库存 | `/amzv-web/gip/inventoryManage/product` | 待补 | 可用量 | 可用量 | 待补 | 待补 | 待补 | `fact_inventory_snapshot` | `available_qty` | number | qty | - | `ui-confirmed` | 等导出确认字段名 |

## 导出登记规范

导出文件必须记录：

| 字段 | 说明 |
|---|---|
| `export_file_name` | 原始导出文件名，不改成低信息量名称 |
| `exported_at` | 导出时间 |
| `exported_by` | 导出人 |
| `erp_url` | 页面 URL |
| `filter_snapshot` | 页面筛选条件，包括仓库、店铺、时间、状态、成本取值 |
| `row_count` | 导出行数 |
| `column_count` | 导出列数 |
| `field_status` | 字段是否 `export-confirmed`、`missing`、`permission-hidden` |
| `source_hash` | 导出文件哈希，用于防止重复和追踪变更 |

## 指标定稿门槛

一个仓库指标进入正式口径前，必须同时满足：

1. 来源字段至少达到 `export-confirmed`，核心字段优先达到 `api-confirmed`。
2. 指标粒度已经确定，例如 `SKU + 仓库 + 快照日期`。
3. 时间口径已经确定，例如实时、每日 0 点快照、订单创建时间、出库时间或对账月份。
4. 状态排除规则已经确定，例如作废、取消、处理失败是否排除。
5. 平台仓、FBA、三方仓、自营仓的 `source_system` 已明确。
6. 金额字段已经保留币种、本位币、汇率月份。
7. 质量规则已定义，例如非负、状态合法、库存守恒、对账差异阈值。

## 当前待核验问题

| 问题 | 影响 | 下一步动作 |
|---|---|---|
| 库龄分析在 Codex 自带浏览器当前筛选为空，但用户 Chrome 截图有数据 | 库龄数量和货值不能定稿 | 按用户截图中的仓库/平台筛选复采，优先导出 |
| 入库单页签 `待入库:818` 但列表为空 | 入库状态数量与列表事实口径不一致 | 导出待入库页签，确认二级筛选 |
| 包裹单分页总数和页签总数口径差异极大 | 包裹状态指标可能误用 | 拆列表事实和状态快照，分别导出 |
| 三方仓销售出库单表格有样本但分页为 0 | 分页总数不可信 | 用导出或 API 校验 |
| 自营仓、平台仓、三方仓字段相似但 source 不同 | 库存口径混淆 | 所有库存事实表强制保留 `source_system` 和 `inventory_source_type` |

## 下一步执行清单

1. 先导出 P0 页面：仓库资料、仓库库存、产品库存、自营仓库存、Amazon.FBA库存、批次库存、调拨单、调整单、其它入库单、其它出库单、销售出库单、包裹单、三方仓入库单、三方仓库存差异、库存批次初始化。
2. 把导出文件放入公司约定的导出暂存目录，记录文件名、筛选条件、导出时间和行列数。
3. 生成字段映射表，优先补 `export_field`、字段类型、单位、币种和枚举值。
4. 回填 `metric-dictionary-draft-20260604.md` 和 `warehouse-live-metric-dictionary-draft-20260604.md` 中的指标状态。
5. 在 `database-and-knowledge-base-design-draft-20260604.md` 中将已确认字段绑定到目标表。
