---
title: 专题②样本质量校验规格草稿
doc_type: analysis
module: project-governance
topic: order-topic-sample-quality-gate-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②样本质量校验规格草稿

## 1. 任务定位

本文件执行 `ORDER-DQ-001`，目标是把专题② ORDER 的源表确认矩阵、源系统确认包和四张宽表规格转成可执行样本质量门禁。

当前文件只定义 DQ 检查项、状态判定、输出结构和 SQL 放行条件。不执行 DQ，不声明样本已通过，不创建 SQL。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 工作包 | `ORDER-DQ-001` |
| 上游 | `ORDER-SOURCE-001`、`ORDER-SOURCE-002`、`ORDER-DATA-002` 至 `ORDER-DATA-005` |
| 下游 | `ORDER-SQL-001` 至 `ORDER-SQL-004` 的 SQL 前置规格 |
| 当前状态 | `Grey`，因为真实源表、样本、Owner、权限和 DQ 结果均未签收 |
| DQ 目标 | 判定样本是否可从 `Grey` 进入 `Amber` 或 `Green` |
| SQL 状态 | 继续阻断；本文件不生成 `sql/` 资产 |

## 3. 上游证据

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| 源表矩阵 | `drafts/analysis/order-topic-source-evidence-and-source-table-matrix-draft-20260603.md` | 提供候选源表、P0 样本、DQ 分组和 SQL 放行条件 | 草稿矩阵 |
| 源系统确认包 | `drafts/analysis/order-topic-source-system-confirmation-package-draft-20260603.md` | 提供源系统、Owner、权限、样本包和签收清单 | 草稿确认包 |
| 成本宽表规格 | `drafts/analysis/order-topic-cost-quality-wide-table-spec-draft-20260603.md` | 提供 `dwt_order_cost_quality` DQ 检查项 | 草稿宽表规格 |
| 履约宽表规格 | `drafts/analysis/order-topic-fulfillment-diagnosis-wide-table-spec-draft-20260603.md` | 提供 `dwt_order_fulfillment_diagnosis` DQ 检查项 | 草稿宽表规格 |
| 毛利宽表规格 | `drafts/analysis/order-topic-margin-attribution-wide-table-spec-draft-20260603.md` | 提供 `dwt_order_margin_attribution` DQ 检查项 | 草稿宽表规格 |
| 退款宽表规格 | `drafts/analysis/order-topic-return-attribution-wide-table-spec-draft-20260603.md` | 提供 `dwt_return_attribution`、`refund_theme_input_for_voc` DQ 检查项 | 草稿宽表规格 |
| SCM 数据底表 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供 SCM 履约稳定和逆向物流参考边界 | SCM 参考 |

## 4. DQ 状态模型

| 状态 | 判定 | 允许动作 | 禁止动作 |
|---|---|---|---|
| `Grey` | 未收到真实样本，或源表、Owner、权限、字段仍未确认 | 记录缺口、请求样本、完善字段映射 | SQL、看板结论、Agent 根因、业务动作 |
| `Amber` | 已收到样本，P0 主键和 P0 字段可跑，但存在口径、阈值、维表、边界或部分 P1 缺口 | 样本验证、非生产诊断、差异清单、修复待办 | 管理层强结论、正式 SQL、生产建议 |
| `Green` | 源表、样本、权限、Owner、P0 DQ、核心 P1 DQ 和口径均签收 | SQL 前置规格、看板试算、Agent 样本诊断 | 无证据泛化、越界归责 |
| `Red` | P0 字段缺失、主键失败、join 放大、金额/时间戳不可解析、权限不可用或边界越界 | 阻断说明、修复前置条件 | 继续生成 BI / Agent / SQL 输出 |

## 5. DQ 执行输入

| 输入 | 必填 | 来源 | 用途 |
|---|---:|---|---|
| `dq_run_id` | 是 | DQ 执行批次 | 追踪一次校验 |
| `sample_id` | 是 | `ORDER-SAMPLE-*` | 标记样本包 |
| `target_asset` | 是 | 四张目标宽表或 XL3 输入 | 标记被校验资产 |
| `source_system_id` | 是 | `ORDER-SYS-*` | 标记源系统 |
| `sample_period` | 是 | Owner 提供 | 标记自然月、财务期间或售后周期 |
| `source_table_name` | 是 | 数据 Owner 提供 | 真实表名或样本文件名 |
| `owner_signoff_status` | 是 | Owner 签收表 | `pending` / `signed` / `rejected` |
| `permission_status` | 是 | 权限确认 | `pending` / `read_only` / `blocked` |
| `evidence_status_before` | 是 | 上游状态 | 通常为 `Grey` |

没有 `source_table_name`、`owner_signoff_status` 和 `permission_status` 时，只能生成 `Grey` 缺口报告。

## 6. 全局门禁

| check_id | 检查项 | 适用范围 | 规则 | 失败状态 |
|---|---|---|---|---|
| `ORDER-DQ-SOURCE-SCHEMA-001` | P0 字段存在性 | 全部候选源表 | P0 字段必须存在，字段名映射必须可追溯 | `Red` |
| `ORDER-DQ-SOURCE-PK-001` | 主键唯一性 | `fact_order`、`fact_order_item`、`fact_return`、`fact_order_fulfillment` | 主键唯一，重复必须有业务解释和去重规则 | `Red` |
| `ORDER-DQ-SOURCE-TYPE-001` | 字段类型 | 全部候选源表 | 日期、时间、金额、数量、布尔字段可解析 | `Red` / `Amber` |
| `ORDER-DQ-SOURCE-PERIOD-001` | 样本期间 | 全部样本包 | 样本期间覆盖一个完整自然月、履约周期或售后周期 | `Amber` |
| `ORDER-DQ-SOURCE-JOIN-001` | join 不放大 | 四张目标宽表 | 主表 join 维表不放大、不大量丢失 | `Red` / `Amber` |
| `ORDER-DQ-SOURCE-AMOUNT-001` | 金额合法性 | 成本、毛利、退款 | 金额非负或负值有业务解释；币种、汇率、期间明确 | `Red` / `Amber` |
| `ORDER-DQ-SOURCE-OWNER-001` | Owner 签收 | 全部源系统 | 数据 Owner 和业务 Owner 签收字段口径、权限、样本 | `Grey` / `Amber` |
| `ORDER-DQ-SOURCE-PERMISSION-001` | 权限 | 全部源系统 | 至少具备只读样本权限；敏感字段脱敏 | `Red` |
| `ORDER-DQ-SOURCE-SQL-BOUNDARY-001` | SQL 边界 | 全部资产 | DQ 未 Green 前不创建正式 SQL | 越界时 `Red` |

## 7. 目标资产门禁

### 7.1 成本质量宽表

| check_id | 检查项 | 规则 | 失败状态 |
|---|---|---|---|
| `ORDER-DQ-COST-SCHEMA-001` | P0 字段 | `order_id`、`order_date`、`country_code`、`channel_id`、`gmv`、`item_qty`、`cost_front_total`、`cost_back_total` 必须存在 | `Red` |
| `ORDER-DQ-COST-PK-001` | 订单主键 | `order_id` 在样本和宽表中唯一 | `Red` |
| `ORDER-DQ-COST-RECON-001` | 成本合计 | `cost_front_total` 和 `cost_back_total` 可由成本项重算或有分摊说明 | `Red` / `Amber` |
| `ORDER-DQ-COST-ZERO-001` | 零销售额 | `gmv = 0` 不强算成本率，进入异常清单 | `Amber` |
| `ORDER-DQ-COST-REFUND-001` | 退款成本 | `cost_refund` 与 `fact_return.return_amt` 只做对账，不互相替代 | 越界时 `Red` |
| `ORDER-DQ-COST-SCM-001` | SCM 边界 | SCM 成本只作参考，不覆盖 ORDER 成本字段 | 越界时 `Red` |

### 7.2 履约耗时宽表

| check_id | 检查项 | 规则 | 失败状态 |
|---|---|---|---|
| `ORDER-DQ-FULFILL-SCHEMA-001` | P0 字段 | `order_id`、`order_date`、`country_code`、`channel_id`、`dest_warehouse`、`created_at`、`shipped_at`、`delivered_at` 必须存在 | `Red` |
| `ORDER-DQ-FULFILL-PK-001` | 订单主键 | `order_id` 在履约主表和宽表中唯一 | `Red` |
| `ORDER-DQ-FULFILL-TIMEZONE-001` | 时区 | 节点时间使用同一时区或已转换到统一标准时区 | `Red` |
| `ORDER-DQ-FULFILL-TIMESTAMP-ORDER-001` | 节点顺序 | 非空节点满足业务顺序，负耗时必须解释 | `Red` |
| `ORDER-DQ-FULFILL-TOTAL-RECON-001` | 总耗时重算 | `lead_time_total` 与节点差值可重算或有阈值说明 | `Amber` / `Red` |
| `ORDER-DQ-FULFILL-OVERDUE-001` | 超时规则 | `is_overdue` 必须有来源或 `overdue_threshold_rule_id` | `Amber` / `Red` |
| `ORDER-DQ-FULFILL-VOC-001` | VOC 关联 | VOC 工单先聚合到订单级再 join | 放大时 `Red` |
| `ORDER-DQ-FULFILL-SCM-001` | SCM 边界 | SCM 聚合表不能替代订单级节点时间戳 | 越界时 `Red` |

### 7.3 毛利归因宽表

| check_id | 检查项 | 规则 | 失败状态 |
|---|---|---|---|
| `ORDER-DQ-MARGIN-SCHEMA-001` | P0 字段 | `order_id`、`line_item_id`、`order_date`、`country_code`、`channel_id`、`order_type`、`sku_id`、`spu_id`、`gmv_line`、`item_qty_line` 必须存在 | `Red` |
| `ORDER-DQ-MARGIN-PK-001` | 订单行主键 | `(order_id, line_item_id)` 唯一；无 `line_item_id` 时必须有生成规则 | `Red` |
| `ORDER-DQ-MARGIN-JOIN-001` | 订单 join | 每个订单行必须匹配一个订单 | `Red` / `Amber` |
| `ORDER-DQ-MARGIN-LINE-RECON-001` | 行级 GMV 对账 | `sum(gmv_line by order_id)` 与订单 GMV 差异可解释 | `Red` / `Amber` |
| `ORDER-DQ-MARGIN-ALLOC-001` | 行级毛利 | 缺订单行毛利时必须有 `margin_allocation_rule_id` | `Red` |
| `ORDER-DQ-MARGIN-CAMPAIGN-001` | 活动维表 | `campaign_id` 可映射或为空且有解释 | `Amber` |
| `ORDER-DQ-MARGIN-PROMO-BUNDLE-001` | 促销与组合标记 | 订单级和行级标记规则一致，组合定义由源系统或规则签收 | `Amber` / `Red` |
| `ORDER-DQ-MARGIN-CAUSAL-001` | 因果边界 | 活动、促销、组合只作结构维度，不声明 ROI 因果 | 越界时 `Red` |

### 7.4 退款归因宽表

| check_id | 检查项 | 规则 | 失败状态 |
|---|---|---|---|
| `ORDER-DQ-RETURN-SCHEMA-001` | P0 字段 | `return_id`、`return_line_id`、`order_id`、`return_dt`、`sku_id`、`return_qty`、`return_amt`、`return_reason_code`、`is_partial_return` 必须存在 | `Red` |
| `ORDER-DQ-RETURN-PK-001` | 退款行主键 | `(return_id, return_line_id)` 唯一；无 `return_line_id` 时必须有生成规则 | `Red` |
| `ORDER-DQ-RETURN-ORDER-JOIN-001` | 原订单匹配 | 每个退款行应匹配一个原订单 | `Red` / `Amber` |
| `ORDER-DQ-RETURN-ITEM-JOIN-001` | 原订单行匹配 | SKU/SPU 应能匹配原订单行或商品维度 | `Amber` / `Red` |
| `ORDER-DQ-RETURN-REASON-001` | 原因码 | `return_reason_code` 可映射 `dim_return_reason.reason_category` | `Amber` / `Red` |
| `ORDER-DQ-RETURN-AMT-QTY-001` | 金额数量 | `return_amt >= 0`；`return_qty > 0` 或有冲销解释 | `Red` / `Amber` |
| `ORDER-DQ-RETURN-PARTIAL-001` | 部分退 | `is_partial_return` 与 `return_qty / order_line_qty` 可解释 | `Amber` / `Red` |
| `ORDER-DQ-RETURN-VOC-001` | VOC 关联 | `voc_ticket_id` 可为空；有值时必须可映射且不放大退款行 | 放大时 `Red` |
| `ORDER-DQ-RETURN-SCM-001` | SCM 边界 | 逆向物流只作参考，不替代退款原因 | 越界时 `Red` |

### 7.5 XL3 / VOC 输入

| check_id | 检查项 | 规则 | 失败状态 |
|---|---|---|---|
| `ORDER-DQ-XL3-SCHEMA-001` | 最小字段 | `order_id`、`return_id`、`sku_id`、`spu_id`、`country_code`、`channel_id`、`return_reason_code`、`is_partial_return`、`theme_suggested` 必须可生成或说明缺口 | `Amber` / `Red` |
| `ORDER-DQ-XL3-THEME-001` | 建议主题 | `theme_suggested` 需要原因码和规则 ID；不能强行补原因 | `Amber` |
| `ORDER-DQ-XL3-VOC-001` | VOC 证据 | 缺 `voc_ticket_id` 不阻断输入行，但阻断 VOC 结论 | `Amber` |
| `ORDER-DQ-XL3-TAG-001` | 标签映射 | `theme_suggested` 如需映射 `dim_voc_tag`，必须保留映射结果和缺口 | `Amber` |
| `ORDER-DQ-XL3-BOUNDARY-001` | VOC 边界 | `theme_suggested` 不是 VOC 最终标签，不输出用户原话或情绪 | 越界时 `Red` |

## 8. DQ 输出结构

| 字段 | 类型 | 必填 | 含义 |
|---|---|---:|---|
| `dq_run_id` | string | 是 | DQ 执行批次 |
| `sample_id` | string | 是 | 样本包编号 |
| `target_asset` | string | 是 | 被校验资产 |
| `check_id` | string | 是 | 检查项编号 |
| `check_scope` | string | 是 | 源表、宽表、维表、join、金额、时间戳或边界 |
| `severity` | string | 是 | `P0` / `P1` / `P2` |
| `status` | string | 是 | `pass` / `warn` / `fail` / `blocked` / `not_applicable` |
| `row_count` | integer | 否 | 被校验行数 |
| `fail_count` | integer | 否 | 失败行数 |
| `fail_rate` | decimal | 否 | 失败比例 |
| `threshold_rule_id` | string | 否 | 阈值规则，未签收时为空 |
| `blocking_reason` | string | 否 | 进入 `Red` 或 `blocked` 的原因 |
| `owner_required` | string | 否 | 需签收或修复的 Owner |
| `evidence_refs` | list | 是 | 源表、样本、字段、规则和文档引用 |

## 9. 状态汇总规则

| 汇总层级 | Green 条件 | Amber 条件 | Red 条件 |
|---|---|---|---|
| 源表级 | P0 schema、PK、类型、权限、Owner 全部通过 | P0 通过但 P1 口径或维表缺口存在 | P0 字段缺失、主键失败、权限失败 |
| 宽表级 | 主表、维表、金额/时间/原因等核心 DQ 全部通过 | P0 通过但 P1 缺口仍需修复 | 主键、join、金额、时间或边界 P0 失败 |
| BI / Agent 级 | 主输入宽表 Green，页面和 Agent 护栏均保留 | 主输入 Amber，只允许样本诊断和缺口 | 主输入 Red，不触发页面或 Agent |
| SQL 前置级 | 目标宽表 Green，Owner 签收，权限确认 | 任一 P1 未签收则只写 SQL 前置讨论 | 任一 P0 Red 则阻断 SQL |

## 10. SQL 放行规则

| sql_task | 目标资产 | 必须 Green 的门禁 | 当前动作 |
|---|---|---|---|
| `ORDER-SQL-001` | `dwt_order_cost_quality` | `ORDER-DQ-COST-*`、`ORDER-DQ-SOURCE-AMOUNT-001`、财务 Owner 签收 | 继续阻断 |
| `ORDER-SQL-002` | `dwt_order_fulfillment_diagnosis` | `ORDER-DQ-FULFILL-*`、时区和阈值 Owner 签收 | 继续阻断 |
| `ORDER-SQL-003` | `dwt_order_margin_attribution` | `ORDER-DQ-MARGIN-*`、订单行毛利和组合口径签收 | 继续阻断 |
| `ORDER-SQL-004` | `dwt_return_attribution` | `ORDER-DQ-RETURN-*`、原因码、部分退、VOC join 签收 | 继续阻断 |
| `XL3-SQL-001` | `refund_theme_input_for_voc` | `ORDER-DQ-XL3-*`、VOC 权限和标签映射边界签收 | 继续阻断 |

本文件完成后，仍不得在 `sql/` 目录创建正式 SQL。后续只能进入 SQL 前置规格草稿，直到真实样本 DQ 和 Owner 签收为 Green。

## 11. Owner 签收要求

| signoff_id | 签收对象 | 签收内容 | 缺失影响 |
|---|---|---|---|
| `ORDER-DQ-SIGNOFF-001` | 数据 Owner | 真实表名、字段映射、主键、分区、权限、样本期间 | DQ 不可 Green |
| `ORDER-DQ-SIGNOFF-002` | 订单运营 Owner | 订单状态、订单类型、订单日期、取消/退款状态 | `fact_order` 不可 Green |
| `ORDER-DQ-SIGNOFF-003` | 财务 Owner | 成本项、币种、汇率、月结期间、分摊规则、退款成本 | 成本宽表不进 SQL |
| `ORDER-DQ-SIGNOFF-004` | 仓配 / 物流 Owner | 履约节点、时区、超时阈值、承运商与仓库字段 | 履约宽表不进 SQL |
| `ORDER-DQ-SIGNOFF-005` | 商品 Owner | SKU/SPU、品类、颜色、尺码、组合属性 | 毛利和退款 SKU 下钻不进 SQL |
| `ORDER-DQ-SIGNOFF-006` | 售后 / 客服 Owner | 原因码、部分退、重复投诉、售后状态、VOC 关联键 | 退款宽表不进 SQL |
| `ORDER-DQ-SIGNOFF-007` | VOC Owner | VOC join、原文权限、标签体系、`dim_voc_tag` 映射 | XL3 / VOC 结论阻断 |
| `ORDER-DQ-SIGNOFF-008` | SCM Owner | SCM 参考表粒度、字段、样本周期和边界 | SCM handoff 只能停留在参考层 |

## 12. 下一步任务

下一步执行 `ORDER-SQL-001`：专题② SQL 初稿前置规格。

建议草稿位置为 `drafts/analysis/order-topic-sql-preflight-spec-draft-20260603.md`。该文件只能定义 SQL 构建顺序、CTE 结构、字段契约、审查清单和阻断条件，不能在 `sql/` 目录创建正式 SQL。
