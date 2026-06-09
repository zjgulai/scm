---
title: 专题②SQL初稿前置规格草稿
doc_type: analysis
module: project-governance
topic: order-topic-sql-preflight-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②SQL初稿前置规格草稿

## 1. 任务定位

本文件执行 `ORDER-SQL-001`，目标是固定专题② ORDER 进入 SQL 初稿前必须满足的构建顺序、CTE 结构、字段契约、审查清单和阻断条件。

当前文件不是 SQL 文件，不创建 `sql/` 资产，不声明真实源表、样本 DQ 或 Owner 已签收。它只定义 `ORDER-SQL-001` 至 `ORDER-SQL-004` 的 SQL 前置规格。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 工作包 | `ORDER-SQL-001` |
| 覆盖 SQL 任务 | `ORDER-SQL-001`、`ORDER-SQL-002`、`ORDER-SQL-003`、`ORDER-SQL-004` |
| 目标资产 | `dwt_order_cost_quality`、`dwt_order_fulfillment_diagnosis`、`dwt_order_margin_attribution`、`dwt_return_attribution` |
| 可选 IO | `refund_theme_input_for_voc` |
| 当前状态 | `blocked` |
| 阻断原因 | 真实源表、样本、权限、Owner、P0 DQ 和核心 P1 DQ 尚未 Green |
| 文件落点 | `drafts/analysis/` |
| 禁止动作 | 不在 `sql/` 下创建正式 SQL；不写可执行生产 SQL；不补虚构库表名 |

## 3. 上游证据

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定 SQL 前置任务边界 | 草稿蓝图 |
| 源表矩阵 | `drafts/analysis/order-topic-source-evidence-and-source-table-matrix-draft-20260603.md` | 提供源表、目标宽表和 SQL 放行条件 | 草稿矩阵 |
| 源系统确认包 | `drafts/analysis/order-topic-source-system-confirmation-package-draft-20260603.md` | 提供 Owner、权限和样本包 | 草稿确认包 |
| 样本质量门禁 | `drafts/analysis/order-topic-sample-quality-gate-spec-draft-20260603.md` | 提供 DQ Green / Amber / Red 判定和 SQL 阻断条件 | 草稿 DQ 规格 |
| 成本宽表规格 | `drafts/analysis/order-topic-cost-quality-wide-table-spec-draft-20260603.md` | 提供 `dwt_order_cost_quality` 输入、字段和计算顺序 | 草稿宽表规格 |
| 履约宽表规格 | `drafts/analysis/order-topic-fulfillment-diagnosis-wide-table-spec-draft-20260603.md` | 提供 `dwt_order_fulfillment_diagnosis` 输入、字段和计算顺序 | 草稿宽表规格 |
| 毛利宽表规格 | `drafts/analysis/order-topic-margin-attribution-wide-table-spec-draft-20260603.md` | 提供 `dwt_order_margin_attribution` 输入、字段和计算顺序 | 草稿宽表规格 |
| 退款宽表规格 | `drafts/analysis/order-topic-return-attribution-wide-table-spec-draft-20260603.md` | 提供 `dwt_return_attribution` 和 `refund_theme_input_for_voc` 输入、字段和计算顺序 | 草稿宽表规格 |

## 4. SQL 前置总门禁

| gate_id | 门禁 | 规则 | 未通过动作 |
|---|---|---|---|
| `ORDER-SQL-GATE-001` | 真实表名 | 所有源表必须由数据 Owner 提供真实表名或样本文件名 | 保持 `blocked` |
| `ORDER-SQL-GATE-002` | 权限 | 至少有只读样本权限，敏感字段脱敏规则明确 | 保持 `blocked` |
| `ORDER-SQL-GATE-003` | Owner 签收 | 数据 Owner 与业务 Owner 签收字段口径、样本期和分区 | 保持 `blocked` |
| `ORDER-SQL-GATE-004` | P0 DQ | 对应目标资产 P0 DQ 必须 Green | 保持 `blocked` |
| `ORDER-SQL-GATE-005` | 核心 P1 DQ | 金额、时间戳、原因码、部分退、VOC、SCM 边界等核心 P1 不得阻断 | 只能写差异清单 |
| `ORDER-SQL-GATE-006` | 字段契约 | 输出字段、类型、粒度、主键和分区必须与宽表规格一致 | 不进入 SQL 草稿 |
| `ORDER-SQL-GATE-007` | 性能审查 | join 粒度、聚合顺序、分区过滤和去重策略必须明确 | 不进入 SQL 草稿 |
| `ORDER-SQL-GATE-008` | 证据边界 | SQL 只产出事实和指标，不产出根因、Owner 责任或业务动作 | 越界即阻断 |

## 5. SQL 任务状态矩阵

| sql_task | 目标资产 | 当前状态 | 必须 Green 的 DQ | 下一步允许动作 |
|---|---|---|---|---|
| `ORDER-SQL-001` | `dwt_order_cost_quality` | `blocked` | `ORDER-DQ-COST-*`、`ORDER-DQ-SOURCE-AMOUNT-001`、财务 Owner 签收 | 只允许补 SQL 前置讨论 |
| `ORDER-SQL-002` | `dwt_order_fulfillment_diagnosis` | `blocked` | `ORDER-DQ-FULFILL-*`、时区和阈值 Owner 签收 | 只允许补 SQL 前置讨论 |
| `ORDER-SQL-003` | `dwt_order_margin_attribution` | `blocked` | `ORDER-DQ-MARGIN-*`、订单行毛利和组合口径签收 | 只允许补 SQL 前置讨论 |
| `ORDER-SQL-004` | `dwt_return_attribution` | `blocked` | `ORDER-DQ-RETURN-*`、原因码、部分退、VOC join 签收 | 只允许补 SQL 前置讨论 |
| `XL3-SQL-001` | `refund_theme_input_for_voc` | `blocked` | `ORDER-DQ-XL3-*`、VOC 权限和标签映射边界签收 | 只允许补 IO 前置讨论 |

## 6. 通用 CTE 规范

| 规则 | 要求 |
|---|---|
| 命名 | CTE 使用 `src_*`、`dedup_*`、`agg_*`、`map_*`、`calc_*`、`dq_*`、`final_*` 层级 |
| 分区 | 所有源表读取必须先应用样本期或分区过滤 |
| 主表优先 | 先确认主表主键唯一，再 join 维表或事实补充表 |
| 维表去重 | 所有维表必须先在连接键上去重，禁止一对多放大 |
| 金额聚合 | 成本项、退款行、订单行先聚合到目标粒度再 join |
| DQ 字段 | 每个目标表必须输出 `data_quality_status`、`dq_run_id`、来源表字段和缺口标记 |
| 边界字段 | VOC、SCM、MKT 只保留 handoff 或参考字段，不写根因结论 |
| 可审查性 | 每个 CTE 必须能回答输入、输出、主键、过滤条件和是否可能放大数据 |

## 7. `ORDER-SQL-001` 成本质量 CTE 蓝图

| CTE | 输入 | 输出 | 门禁 |
|---|---|---|---|
| `src_order` | `fact_order` | 订单主表字段 | `order_id` 唯一，分区过滤 |
| `src_order_cost` | `fact_order_cost` 或 `fact_order` 成本字段 | 成本项或订单级成本字段 | 成本项粒度确认 |
| `agg_cost_by_order` | `src_order_cost` | 一行一订单成本 | 聚合后 `order_id` 唯一 |
| `dedup_dim_warehouse` | `dim_warehouse` | 仓库维度 | `warehouse_id` / `dest_warehouse` 唯一 |
| `dedup_dim_order_type` | `dim_order_type` | 订单类型维度 | `order_type` 唯一 |
| `agg_return_for_recon` | 可选 `fact_return` | 订单级退款事实对账字段 | 只做对账，不替代 `cost_refund` |
| `calc_cost_quality` | 订单、成本、维表、退款对账 | 成本率、件均成本、总成本、毛利辅助字段 | 禁止除零强算 |
| `dq_cost_flags` | `calc_cost_quality` | `cost_gap_flags`、`data_quality_status` | DQ 未 Green 不进入正式 SQL |
| `final_dwt_order_cost_quality` | `dq_cost_flags` | `dwt_order_cost_quality` 字段契约 | 主键 `order_id`，分区 `order_date` |

### 7.1 成本字段契约

| 字段组 | 必须输出 | 说明 |
|---|---|---|
| 主键时间 | `order_id`、`order_date`、`dt_month` | 一行一订单 |
| 维度 | `country_code`、`channel_id`、`shop_id`、`warehouse_id`、`dest_warehouse`、`order_type` | 维表字段不应放大订单 |
| 销售 | `gmv`、`item_qty`、`sku_qty`、`gross_margin_amt` | 金额和数量需可解析 |
| 前台成本 | `cost_promo_discount`、`cost_ad_spend`、`cost_refund`、`cost_front_total` | `cost_refund` 不等于退款事实金额 |
| 后台成本 | `cost_production`、`cost_freight`、`cost_warehouse`、`cost_commission`、`cost_other`、`cost_back_total` | 成本项缺失进入 gap |
| 治理 | `source_order_table`、`source_cost_table`、`cost_allocation_rule_id`、`dq_run_id`、`data_quality_status` | 必须可追溯 |

## 8. `ORDER-SQL-002` 履约耗时 CTE 蓝图

| CTE | 输入 | 输出 | 门禁 |
|---|---|---|---|
| `src_fulfillment` | `fact_order_fulfillment` 或 `fact_order` 时间戳字段 | 履约节点主表 | `order_id` 唯一 |
| `src_order_context` | `fact_order` | 订单维度补充 | 若主表已含订单维度，需明确优先级 |
| `normalize_timestamps` | `src_fulfillment` | 标准化节点时间 | datetime 可解析，时区明确 |
| `calc_node_leadtime` | 标准化时间字段 | 节点耗时小时与天 | 节点顺序合法 |
| `calc_overdue` | 节点耗时与阈值规则 | `is_overdue`、`overdue_stage` | `overdue_threshold_rule_id` 必须签收 |
| `dedup_dim_warehouse` | `dim_warehouse` | 仓库维度 | 仓库键唯一 |
| `agg_voc_by_order` | 可选 VOC 工单表 | 订单级 VOC 标记 | 必须先聚合到订单级 |
| `dq_fulfillment_flags` | 履约计算结果 | 时间戳缺口、时区、负耗时、VOC join 标记 | P0 失败时 Red |
| `final_dwt_order_fulfillment_diagnosis` | `dq_fulfillment_flags` | 目标宽表字段 | 主键 `order_id`，分区 `order_date` |

### 8.1 履约字段契约

| 字段组 | 必须输出 | 说明 |
|---|---|---|
| 主键时间 | `order_id`、`order_date`、`dt_month` | 一行一订单履约快照 |
| 节点时间 | `created_at`、`paid_at`、`shipped_at`、`in_transit_at`、`cleared_at`、`delivered_at`、`timezone` | 非 P0 节点可为空但需标记 |
| 耗时 | `lead_time_*_hours`、`lead_time_*_days`、`lead_time_total_hours`、`lead_time_total_days` | 底层小时，展示天 |
| 超时 | `is_overdue`、`overdue_stage`、`overdue_threshold_rule_id` | 阈值未签收时不能输出责任结论 |
| 体验线索 | `has_voc`、`voc_ticket_id` | 只做线索，不输出 VOC 结论 |
| 治理 | `timestamp_quality_status`、`fulfillment_data_gap_flags`、`dq_run_id`、`data_quality_status` | 必须随表输出 |

## 9. `ORDER-SQL-003` 毛利归因 CTE 蓝图

| CTE | 输入 | 输出 | 门禁 |
|---|---|---|---|
| `src_order_item` | `fact_order_item` | 订单行主表 | `(order_id, line_item_id)` 唯一 |
| `src_order` | `fact_order` | 订单级字段 | `order_id` 唯一 |
| `dedup_dim_order_type` | `dim_order_type` | 订单类型维度 | 枚举唯一 |
| `dedup_dim_campaign` | `dim_campaign` | 活动维度 | `campaign_id` 唯一或为空可解释 |
| `dedup_dim_sku` | `dim_spu` / `dim_sku` | 商品维度 | SKU/SPU 可映射 |
| `agg_order_line_recon` | `src_order_item` | 订单级行汇总 | `sum(gmv_line)` 与订单 GMV 可对账 |
| `calc_margin_line` | 订单行、订单、维表 | 行级毛利、价格带、分摊字段 | 行级毛利缺失需分摊规则 |
| `calc_combo_flags` | 订单行组合字段 | 组合候选字段 | 不输出组合上线动作 |
| `dq_margin_flags` | 毛利计算结果 | GMV 对账、毛利分摊、活动映射、促销/组合缺口 | P0 失败时 Red |
| `final_dwt_order_margin_attribution` | `dq_margin_flags` | 目标宽表字段 | 主键 `(order_id, line_item_id)` |

### 9.1 毛利字段契约

| 字段组 | 必须输出 | 说明 |
|---|---|---|
| 主键时间 | `order_id`、`line_item_id`、`order_date`、`dt_month` | 一行一订单行 |
| 订单维度 | `country_code`、`channel_id`、`shop_id`、`order_type`、`campaign_id` | 活动只做结构维度 |
| 商品字段 | `spu_id`、`sku_id`、`category_l2`、`category_l3`、`variant_color`、`variant_size` | 商品下钻和退款线索 |
| 订单行金额 | `unit_price`、`item_qty_line`、`gmv_line`、`gross_margin_amt_line` | 行级毛利缺失需规则 |
| 订单级字段 | `order_gmv_total`、`order_gross_margin_amt_total`、`order_item_qty_total`、`order_line_count` | 聚合时禁止直接重复求和 |
| 促销组合 | `is_promo_order`、`is_promo_line`、`is_bundle_order`、`is_bundle_line` | 不输出 ROI 或组合上线 |
| 治理 | `source_order_table`、`source_order_item_table`、`source_campaign_table`、`margin_gap_flags`、`dq_run_id`、`data_quality_status` | 必须可追溯 |

## 10. `ORDER-SQL-004` 退款归因 CTE 蓝图

| CTE | 输入 | 输出 | 门禁 |
|---|---|---|---|
| `src_return` | `fact_return` | 退款行主表 | `(return_id, return_line_id)` 唯一 |
| `src_order` | `fact_order` | 原订单字段 | `order_id` 唯一 |
| `src_order_item` | `fact_order_item` | 原订单行字段 | 需避免同单同 SKU 多行误匹配 |
| `dedup_dim_return_reason` | `dim_return_reason` | 原因码维度 | `return_reason_code` 唯一 |
| `dedup_dim_sku` | `dim_spu` / `dim_sku` | 商品维度 | SKU/SPU 可映射 |
| `agg_voc_by_return` | 可选 VOC 工单表 | 退款级或订单级 VOC 标记 | 必须先聚合，禁止放大退款行 |
| `calc_partial_return` | 退款行与原订单行 | 部分退类型、数量比例 | 定义需 Owner 签收 |
| `calc_theme_suggested` | 退款原因与部分退字段 | `theme_suggested`、`theme_suggested_rule_id`、`xl3_input_ready` | 只生成订单侧建议主题 |
| `dq_return_flags` | 退款计算结果 | 原因、部分退、VOC、SCM、金额数量缺口 | P0 失败时 Red |
| `final_dwt_return_attribution` | `dq_return_flags` | 目标宽表字段 | 主键 `(return_id, return_line_id)` |

### 10.1 退款字段契约

| 字段组 | 必须输出 | 说明 |
|---|---|---|
| 主键时间 | `return_id`、`return_line_id`、`order_id`、`return_dt`、`dt_month` | 一行一退货行 |
| 订单维度 | `country_code`、`channel_id`、`shop_id`、`order_type`、`campaign_id` | 只做结构维度 |
| 商品退款 | `sku_id`、`spu_id`、`return_qty`、`return_amt`、`order_line_qty`、`order_line_gmv` | 支撑部分退和 SKU/SPU 下钻 |
| 原因 | `return_reason_code`、`return_reason_name`、`reason_category` | 原因码维表必须签收 |
| 部分退 | `is_partial_return`、`partial_return_type`、`combo_return_candidate` | 部分退不等于组合问题 |
| VOC / XL3 | `voc_ticket_id`、`has_voc`、`theme_suggested`、`theme_suggested_rule_id`、`xl3_input_ready` | 不输出 VOC 原话或最终标签 |
| 治理 | `source_return_table`、`source_order_table`、`source_order_item_table`、`source_return_reason_table`、`source_voc_table`、`return_gap_flags`、`dq_run_id`、`data_quality_status` | 必须可追溯 |

## 11. `refund_theme_input_for_voc` IO 前置

| CTE | 输入 | 输出 | 门禁 |
|---|---|---|---|
| `src_return_attribution_green` | `dwt_return_attribution` | 已通过 DQ 的退款归因行 | 目标表必须 Green |
| `filter_xl3_ready` | 退款归因行 | 可进入 XL3 的候选行 | `xl3_input_ready = true` 或缺口明确 |
| `select_xl3_fields` | 候选行 | `refund_theme_input_for_voc` 最小字段 | 字段齐全 |
| `dq_xl3_boundary` | 最小字段 | VOC / XL3 边界标记 | `theme_suggested` 不是最终标签 |

最小字段为 `order_id`、`return_id`、`sku_id`、`spu_id`、`country_code`、`channel_id`、`return_reason_code`、`is_partial_return`、`theme_suggested`。缺 `voc_ticket_id` 不阻断输入行，但阻断 VOC 结论。

## 12. SQL 审查清单

| review_id | 审查项 | 必须回答 |
|---|---|---|
| `ORDER-SQL-REVIEW-001` | 源表真实性 | 表名、库名、分区、权限和 Owner 是否已签收 |
| `ORDER-SQL-REVIEW-002` | 粒度 | 每个 CTE 的一行代表什么 |
| `ORDER-SQL-REVIEW-003` | 主键 | 主表和输出表主键是否唯一 |
| `ORDER-SQL-REVIEW-004` | join | 每个 join 是否可能放大或丢失主表 |
| `ORDER-SQL-REVIEW-005` | 聚合 | 成本项、订单行、退款行是否先聚合到目标粒度 |
| `ORDER-SQL-REVIEW-006` | 时间 | 分区、样本期、履约时间戳和时区是否明确 |
| `ORDER-SQL-REVIEW-007` | 金额 | 金额、币种、汇率、成本分摊和退款事实是否区分 |
| `ORDER-SQL-REVIEW-008` | DQ | 输出是否包含 DQ 字段和 gap flags |
| `ORDER-SQL-REVIEW-009` | 性能 | 是否使用分区过滤、必要索引或聚合前过滤 |
| `ORDER-SQL-REVIEW-010` | 边界 | 是否避免 VOC、SCM、MKT、客服、财务责任越界 |

## 13. 阻断条件

| blocker_id | 条件 | 阻断范围 |
|---|---|---|
| `ORDER-SQL-BLOCK-001` | 缺真实源表名或样本文件名 | 全部 SQL |
| `ORDER-SQL-BLOCK-002` | 权限不可用或敏感字段未脱敏 | 全部 SQL |
| `ORDER-SQL-BLOCK-003` | P0 schema、PK 或 join DQ 为 Red | 对应目标宽表 |
| `ORDER-SQL-BLOCK-004` | 成本金额、毛利、退款金额或币种口径未签收 | 成本、毛利、退款 SQL |
| `ORDER-SQL-BLOCK-005` | 履约时间戳不可解析、时区混乱或阈值缺失 | 履约 SQL |
| `ORDER-SQL-BLOCK-006` | `line_item_id` 或 `return_line_id` 不存在且无生成规则 | 毛利、退款 SQL |
| `ORDER-SQL-BLOCK-007` | VOC 工单 join 放大订单或退款行 | 履约、退款、XL3 |
| `ORDER-SQL-BLOCK-008` | SCM 聚合表被用于替代 ORDER 主事实 | 履约、退款、成本 |
| `ORDER-SQL-BLOCK-009` | SQL 文本输出根因、Owner 责任、业务动作或 VOC 原话 | 全部 SQL |
| `ORDER-SQL-BLOCK-010` | 未经确认把草稿 SQL 放入 `sql/` | 全部 SQL |

## 14. 文件落盘规则

| 阶段 | 允许落点 | 禁止落点 |
|---|---|---|
| 当前 `blocked` 阶段 | `drafts/analysis/` 前置规格 | `sql/` |
| DQ Amber 阶段 | `drafts/analysis/` SQL 结构草稿和差异清单 | `sql/` 正式资产 |
| DQ Green + Owner 签收 | 可讨论 `sql/` 正式 SQL 文件 | 未审查直接入 `sql/` |
| 性能与审查通过 | `sql/` 可落正式 SQL | 无审查、无回滚说明的 SQL |

## 15. 下一步任务

专题② ORDER 的第一轮规格链路已从蓝图推进到 SQL 前置。下一步不应继续写 SQL，除非用户提供真实源表、样本、权限、Owner 签收和 DQ 结果。

建议下一步进入阶段性总览：`ORDER-GOVERNANCE-CHECKPOINT-001`，生成专题②当前产物索引、未完成决策、SQL 阻断清单和转入下一大专题的交接说明。建议草稿位置为 `drafts/analysis/order-topic-governance-checkpoint-draft-20260603.md`。
