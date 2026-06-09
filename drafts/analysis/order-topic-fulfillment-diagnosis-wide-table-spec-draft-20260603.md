---
title: 专题②订单履约耗时诊断宽表规格草稿
doc_type: analysis
module: project-governance
topic: order-topic-fulfillment-diagnosis-wide-table-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②订单履约耗时诊断宽表规格草稿

## 1. 任务定位

本文件执行 `ORDER-DATA-003`，目标是固定 `dwt_order_fulfillment_diagnosis` 的订单履约耗时诊断宽表规格，支撑专题② `ORDER-T2`：订单平均耗时与核心节点诊断。

当前文件只定义宽表粒度、字段、公式、来源、DQ 门槛和 SCM 引用边界，不创建 SQL，不声明真实生产源表已经确认。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 目标宽表 | `dwt_order_fulfillment_diagnosis` |
| 主服务子课题 | `ORDER-T2` 订单平均耗时与核心节点诊断 |
| 次级服务子课题 | `ORDER-T1` 仓网后台成本解释、`ORDER-T4` 物流 VOC 线索 |
| 推荐粒度 | 一行一订单履约快照，主键 `order_id` |
| 分区建议 | `order_date`，并保留 `dt_month` 便于月度聚合 |
| 首选来源 | `fact_order_fulfillment` |
| 备选来源 | `fact_order` 扩展时间戳字段 |
| 当前状态 | `Grey`，因为真实库表、时间字段类型、时区、超时阈值、Owner 和样本 DQ 尚未确认 |
| SQL 状态 | 不写正式 SQL；真实样本通过 `ORDER-DQ-001` 后再进入 `ORDER-SQL-002` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定 `ORDER-DATA-003` 宽表任务 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-FULFILL-*` 指标公式 | 草稿指标字典 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 提供 T2 字段、库表建议和粒度 | 规划契约 |
| 主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 确认 `fact_order_fulfillment` 与订单 1:1 | 规划契约 |
| 字段口径 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | 固定履约节点时间字段 | 规划契约 |
| Phase2 输出 | `main_project_lute/phase2_outputs/topic2/topic2_leadtime_diagnostics.csv` | 提供渠道×国家×目的仓聚合样例 | mock 产物 |
| Phase2 脚本 | `main_project_lute/data_example/scripts/experimental/run_phase2_topic2_pipeline.py` | 提供耗时均值、超时率和周转天数聚合方式 | mock 方法 |
| SCM 仓储调拨执行方案 | `scm/供应链成本指标全链路优化/（tactic）课题一：kp04-仓储与调拨协同执行方案.md` | 提供仓配协同和节点解释参考 | SCM 参考 |

## 4. 宽表边界

`dwt_order_fulfillment_diagnosis` 是订单级履约节点诊断宽表，不是供应链履约稳定性总表。

| 边界 | 本表负责 | 本表不负责 |
|---|---|---|
| 订单履约节点 | 创建、支付、发货、在途、清关、签收等节点时间 | 承运商全量轨迹、包裹分段轨迹、仓内作业明细 |
| 耗时诊断 | 节点耗时、总履约耗时、超时标记、超时阶段 | 自动仓网重规划、承运商切换策略 |
| 仓网解释 | 国家、渠道、目的仓、仓库类型下的耗时差异 | 库存补货、调拨、采购计划 |
| 周转辅助 | `turnover_days` 作为履约和库存联动解释字段 | 完整库存健康度、库龄、缺货风险闭环 |
| VOC 线索 | `has_voc` 和可选 `voc_ticket_id` 作为物流体验线索 | VOC 主题归因、客诉原因最终判定 |
| SCM 引用 | 引用 SCM 履约稳定性、库存健康和 kp04 补充解释 | 用 SCM 表替代订单履约时间戳 |

## 5. 表级规格

| 项 | 规格 |
|---|---|
| 目标表 | `dwt_order_fulfillment_diagnosis` |
| 逻辑层级 | DWT / 主题宽表 |
| 业务目标 | 回答订单在国家、渠道、目的仓和履约节点上哪里慢、慢多少、是否超时、是否关联 VOC |
| 主键 | `order_id` |
| 推荐粒度 | 一行一订单履约快照 |
| 分区键 | `order_date` |
| 常用聚合键 | `dt_month`、`country_code`、`channel_id`、`shop_id`、`warehouse_id`、`dest_warehouse`、`warehouse_type` |
| 下游页面 | `ORDER-BI-002` 订单履约时效与节点瓶颈诊断 |
| 下游 Agent | `ORDER-AGENT-002` 订单履约异常诊断 |
| 输入依赖 | `fact_order_fulfillment`、备选 `fact_order`、`dim_warehouse`、可选 VOC 工单表 |
| 输出状态 | `data_quality_status` 必须随表输出 |

## 6. 字段清单

### 6.1 主键与时间字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `order_id` | string | 是 | `fact_order_fulfillment` / `fact_order` | 订单主键，一行一订单 |
| `order_date` | date | 是 | `fact_order` / 派生 | 分区字段，通常取订单创建日期或支付日期，需由 Owner 确认 |
| `dt_month` | string | 是 | 派生 | `YYYY-MM` 月份，用于聚合 |
| `created_at` | datetime | 是 | `fact_order_fulfillment` / `fact_order` | 订单创建时间 |
| `paid_at` | datetime | 否 | `fact_order_fulfillment` / `fact_order` | 支付时间 |
| `shipped_at` | datetime | 是 | `fact_order_fulfillment` / `fact_order` | 发货或出库时间 |
| `in_transit_at` | datetime | 否 | `fact_order_fulfillment` / 物流节点 | 进入在途时间 |
| `cleared_at` | datetime | 否 | `fact_order_fulfillment` / 物流节点 | 清关完成时间 |
| `delivered_at` | datetime | 是 | `fact_order_fulfillment` / `fact_order` | 签收或妥投时间 |
| `timezone` | string | 否 | 源系统或配置 | 时间字段时区，未确认前必须标记 |

### 6.2 维度字段

| 字段 | 类型建议 | 必填 | 来源 | 说明 |
|---|---|---:|---|---|
| `country_code` | string | 是 | `fact_order_fulfillment` / `fact_order` | 国家 |
| `site` | string | 否 | `fact_order` | 站点 |
| `channel_id` | string | 是 | `fact_order_fulfillment` / `fact_order` | 渠道或平台 |
| `shop_id` | string | 否 | `fact_order` | 店铺 |
| `warehouse_id` | string | 否 | `fact_order` / `dim_warehouse` | 发货仓或关联仓库 |
| `dest_warehouse` | string | 是 | `fact_order_fulfillment` / `fact_order` | 目的仓或履约目的仓 |
| `warehouse_type` | string | 否 | `dim_warehouse` | FBA、3PL、自建仓、退货仓等 |
| `order_type` | string | 否 | `fact_order` | 订单类型 |
| `fulfillment_type` | string | 否 | 履约系统或配置 | FBA、自发货、3PL、海外仓等 |
| `carrier_id` | string | 否 | 物流系统 | 承运商，当前规划契约未强制要求 |

### 6.3 节点耗时字段

字段单位建议保留小时和天两个层级：小时用于 DQ 与节点诊断，天用于 BI 展示和 Phase2 mock 口径对齐。

| 字段 | 类型建议 | 必填 | 公式 | 指标映射 |
|---|---|---:|---|---|
| `lead_time_created_to_paid_hours` | decimal | 否 | `paid_at - created_at`，单位小时 | `ORDER-FULFILL-001` |
| `lead_time_paid_to_shipped_hours` | decimal | 是 | `shipped_at - paid_at`，单位小时 | `ORDER-FULFILL-002` |
| `lead_time_shipped_to_in_transit_hours` | decimal | 否 | `in_transit_at - shipped_at`，单位小时 | 节点扩展 |
| `lead_time_in_transit_to_cleared_hours` | decimal | 否 | `cleared_at - in_transit_at`，单位小时 | `ORDER-FULFILL-004` |
| `lead_time_cleared_to_delivered_hours` | decimal | 否 | `delivered_at - cleared_at`，单位小时 | 节点扩展 |
| `lead_time_shipped_to_delivered_hours` | decimal | 是 | `delivered_at - shipped_at`，单位小时 | `ORDER-FULFILL-003` |
| `lead_time_total_hours` | decimal | 是 | `delivered_at - created_at`，单位小时；如源表有 `lead_time_total`，需重算校验 | `ORDER-FULFILL-005` |
| `lead_time_created_to_paid_days` | decimal | 否 | `lead_time_created_to_paid_hours / 24` | Phase2 展示 |
| `lead_time_paid_to_shipped_days` | decimal | 是 | `lead_time_paid_to_shipped_hours / 24` | Phase2 展示 |
| `lead_time_shipped_to_delivered_days` | decimal | 是 | `lead_time_shipped_to_delivered_hours / 24` | Phase2 展示 |
| `lead_time_total_days` | decimal | 是 | `lead_time_total_hours / 24` | Phase2 展示 |

### 6.4 超时、周转与体验字段

| 字段 | 类型建议 | 必填 | 来源 / 公式 | 指标映射 |
|---|---|---:|---|---|
| `turnover_days` | decimal | 否 | `fact_order_fulfillment` / `fact_order` | `ORDER-FULFILL-006` |
| `is_overdue` | boolean | 是 | 源字段或阈值规则派生 | `ORDER-FULFILL-007`、`ORDER-FULFILL-008` |
| `overdue_stage` | string | 否 | 超时节点规则派生 | 定位超时发生在支付、发货、在途、清关或尾程 |
| `overdue_threshold_rule_id` | string | 否 | 阈值配置 | 标记国家、渠道、仓库或履约类型阈值 |
| `is_node_missing` | boolean | 是 | 节点字段缺失派生 | 区分真实慢和时间戳缺口 |
| `fulfillment_data_gap_flags` | string | 否 | DQ 派生 | 如 `missing_paid_at`、`negative_transit_time` |
| `has_voc` | boolean | 否 | `fact_order_fulfillment` / VOC 工单表 | `ORDER-FULFILL-009` |
| `voc_ticket_id` | string | 否 | VOC 工单表 | 仅作线索，不作 VOC 主题结论 |

### 6.5 证据与治理字段

| 字段 | 类型建议 | 必填 | 说明 |
|---|---|---:|---|
| `source_fulfillment_table` | string | 是 | 履约事实来源表名或样本来源 |
| `source_order_table` | string | 否 | 订单事实来源表名 |
| `source_voc_table` | string | 否 | VOC 工单来源表名 |
| `timestamp_quality_status` | string | 是 | 节点时间戳质量，取 `Grey` / `Amber` / `Green` / `Red` |
| `dq_run_id` | string | 否 | DQ 执行批次 |
| `data_quality_status` | string | 是 | `Grey` / `Amber` / `Green` / `Red` |
| `created_at_system` | datetime | 否 | 宽表生成时间 |
| `updated_at_system` | datetime | 否 | 宽表更新时间 |

## 7. 输入来源与 join 规则

| 输入资产 | 粒度 | 连接键 | 使用方式 | 风险 |
|---|---|---|---|---|
| `fact_order_fulfillment` | 一行一订单履约快照 | `order_id` | 首选主表，提供节点时间、耗时、超时、周转、VOC 标记 | 如果不是 1:1，直接 join 会放大订单 |
| `fact_order` | 一行一订单 | `order_id` | 补订单日期、国家、渠道、店铺、订单类型；也可作为无独立履约表时的备选主表 | 成本字段和履约字段混在一表时需避免口径污染 |
| `dim_warehouse` | 一行一仓库 | `warehouse_id` / `dest_warehouse` | 补仓库类型、区域、FBA 或 3PL 标记 | 目的仓和发货仓可能不是同一字段 |
| VOC 工单表 | 一行一工单或一行一工单事件 | `order_id` / `voc_ticket_id` | 只补 `has_voc` 和 `voc_ticket_id` | 多工单直接 join 会放大订单，必须先聚合到订单级 |
| SCM 履约稳定性表 | 仓库、承运商、线路或周期聚合 | 非订单主键 | 只作为解释参考，不直接 join 成订单事实 | 聚合粒度不同，不能替代订单履约快照 |

来源优先级：若 `fact_order_fulfillment` 存在且 `order_id` 唯一，则以它为主；若不存在，使用 `fact_order` 的履约扩展字段。若两者都存在，节点时间以 `fact_order_fulfillment` 为准，订单维度以 `fact_order` 为准，差异进入 DQ 差异清单。

## 8. 计算顺序

| 顺序 | 步骤 | 输出 | 门禁 |
|---:|---|---|---|
| 1 | 确认 `fact_order_fulfillment` 或备选 `fact_order` 的 `order_id` 唯一 | 订单履约主表 | `order_id` 不唯一则停止 |
| 2 | 标准化时间字段类型、时区和空值 | 标准化节点时间 | 时间字段无法解析则进入 `Red` |
| 3 | 校验节点时间顺序 | 时间顺序 DQ 结果 | `created_at <= paid_at <= shipped_at <= in_transit_at <= cleared_at <= delivered_at`，允许业务确认的缺失节点 |
| 4 | 派生节点耗时小时字段 | `lead_time_*_hours` | 出现负耗时必须标记 |
| 5 | 派生节点耗时天字段 | `lead_time_*_days` | 仅用于展示，不替代小时字段 |
| 6 | 计算总履约耗时并与源 `lead_time_total` 校验 | `lead_time_total_hours` / `lead_time_total_days` | 差异超阈值需进入 DQ |
| 7 | 应用超时阈值规则 | `is_overdue`、`overdue_stage` | 阈值未确认则不能输出业务责任结论 |
| 8 | 关联仓库和订单维度 | 维度增强宽表 | 关键维度未匹配需标记 |
| 9 | 可选聚合 VOC 工单到订单级后关联 | `has_voc`、`voc_ticket_id` | 禁止把多工单明细直接 join 到订单级 |
| 10 | 写入质量状态和来源字段 | `data_quality_status` | 没有真实样本时固定为 `Grey` |

## 9. 指标映射

| 指标 code | 指标名称 | 宽表字段 | 聚合方式 |
|---|---|---|---|
| `ORDER-FULFILL-001` | 创建到支付耗时 | `lead_time_created_to_paid_hours` / `lead_time_created_to_paid_days` | `avg` |
| `ORDER-FULFILL-002` | 支付到发货耗时 | `lead_time_paid_to_shipped_hours` / `lead_time_paid_to_shipped_days` | `avg` |
| `ORDER-FULFILL-003` | 发货到签收耗时 | `lead_time_shipped_to_delivered_hours` / `lead_time_shipped_to_delivered_days` | `avg` |
| `ORDER-FULFILL-004` | 在途到清关耗时 | `lead_time_in_transit_to_cleared_hours` | `avg` |
| `ORDER-FULFILL-005` | 总履约耗时 | `lead_time_total_hours` / `lead_time_total_days` | `avg` |
| `ORDER-FULFILL-006` | 库存周转天数 | `turnover_days` | `avg` |
| `ORDER-FULFILL-007` | 超时订单数 | `is_overdue`、`order_id` | `sum(case when is_overdue then 1 else 0 end)` |
| `ORDER-FULFILL-008` | 超时率 | `is_overdue`、`order_id` | `sum(is_overdue) / count(distinct order_id)` |
| `ORDER-FULFILL-009` | 物流 VOC 关联订单率 | `has_voc`、`order_id` | `sum(case when has_voc then 1 else 0 end) / count(distinct order_id)` |

Phase2 mock 输出已按 `channel_id`、`country_code`、`dest_warehouse` 聚合均值和超时率。正式宽表必须先落订单级，再由 BI 或 mart 层聚合，不能直接把 Phase2 聚合表当订单事实。

## 10. DQ 检查项

| check_id | 检查项 | 规则 | 阻断条件 |
|---|---|---|---|
| `ORDER-DQ-FULFILL-SCHEMA-001` | 字段存在性 | P0 字段必须存在：`order_id`、`order_date`、`country_code`、`channel_id`、`dest_warehouse`、`created_at`、`shipped_at`、`delivered_at` | 缺任一 P0 字段 |
| `ORDER-DQ-FULFILL-PK-001` | 主键唯一性 | `order_id` 在履约主表和宽表中唯一 | 重复订单且无业务解释 |
| `ORDER-DQ-FULFILL-TYPE-001` | 字段类型 | 时间字段为 datetime；耗时、周转为数值；超时为 boolean | 时间字段无法解析 |
| `ORDER-DQ-FULFILL-TIMEZONE-001` | 时区一致性 | 所有节点时间使用同一时区或已转换到统一时区 | 跨时区混算且无转换说明 |
| `ORDER-DQ-FULFILL-TIMESTAMP-ORDER-001` | 节点顺序 | 非空节点满足业务顺序 | 大量负耗时或顺序倒挂 |
| `ORDER-DQ-FULFILL-NEGATIVE-001` | 负耗时 | `lead_time_* >= 0` | 负耗时无法解释 |
| `ORDER-DQ-FULFILL-TOTAL-RECON-001` | 总耗时重算 | `lead_time_total` 与节点差值重算结果一致或差异在阈值内 | 总耗时与节点差异不可解释 |
| `ORDER-DQ-FULFILL-OVERDUE-001` | 超时规则 | `is_overdue` 来源或阈值规则必须明确 | 超时字段无规则来源 |
| `ORDER-DQ-FULFILL-WAREHOUSE-FK-001` | 仓库维表映射 | `warehouse_id` 或 `dest_warehouse` 可映射仓库维度 | 核心仓库下钻无法映射 |
| `ORDER-DQ-FULFILL-VOC-001` | VOC 关联 | VOC 工单必须先聚合到订单级再关联 | 多工单 join 放大订单 |
| `ORDER-DQ-FULFILL-SCM-001` | SCM 边界 | SCM 聚合表只做解释参考 | 用 SCM 聚合表覆盖订单节点时间 |

## 11. 数据状态

| 状态 | 判定 | 本表允许用途 | 禁止用途 |
|---|---|---|---|
| Grey | 只有规格、mock 或样例，无真实源表和样本 | 字段缺口、源表确认、宽表规格讨论 | 履约瓶颈定责、Owner 动作、正式 SQL |
| Amber | 有真实样本，P0 DQ 通过但仍有时区、阈值或节点缺口 | 样本验证、非生产看板、待验证假设 | 管理层强结论 |
| Green | 真实源表、样本、Owner、权限、DQ、时区和阈值均签收 | 看板、Agent、SQL 前置 | 无证据泛化 |
| Red | P0 DQ 失败且无业务解释 | 停止进入下游 | 看板、Agent、SQL |

当前本表状态为 `Grey`。

## 12. SCM 引用边界

| SCM 资产 | 可引用内容 | 在本表中的角色 | 禁止事项 |
|---|---|---|---|
| `dwt_fulfillment_stability` 规格 | 履约稳定性、仓配节点、SLA 护栏 | 解释订单超时背后的仓配稳定性 | 不替代订单级履约快照 |
| 库存健康和周转指标 | `turnover_days`、低库存、滞销、缺货风险 | 解释履约慢是否可能与库存有关 | 不把库存结论写成订单事实 |
| kp04 履约或订单聚合包 | 渠道、仓库、订单聚合视角 | BI 聚合参考 | 不跳过订单级宽表直接用聚合表 |
| SCM Grey/Amber/Green 模型 | 数据状态和输出边界 | 治理状态复用 | Grey 状态不输出强动作 |

## 13. 下游消费

| 下游 | 消费字段 | 输出 |
|---|---|---|
| `ORDER-BI-002` | `lead_time_*_days`、`turnover_days`、`is_overdue`、`overdue_stage`、`country_code`、`channel_id`、`dest_warehouse` | 订单履约时效与节点瓶颈诊断 |
| `ORDER-AGENT-002` | 节点耗时、超时规则、DQ 状态、维度下钻 | 履约异常诊断、数据缺口、待确认问题 |
| `ORDER-DATA-002` | `dest_warehouse`、`warehouse_id`、`turnover_days` | 仓网后台成本解释，不回写成本口径 |
| `ORDER-DATA-005` | `has_voc`、`voc_ticket_id`、`order_id` | 物流体验线索，不替代退款原因 |
| `CHANNEL` 专题 | `channel_id`、`country_code`、`turnover_days`、`is_overdue` | 渠道健康可选输入，需在渠道专题单独治理 |
| `SCM` 专题 | 聚合后的仓库、线路、节点异常 | 供应链深挖线索，不替代 SCM 主题宽表 |

## 14. 当前不能做的事

| 事项 | 原因 | 后续进入条件 |
|---|---|---|
| 不创建正式 SQL | 缺真实表名、字段类型、时区、权限和样本 DQ | `ORDER-DQ-001` 通过后进入 `ORDER-SQL-002` |
| 不输出履约瓶颈责任结论 | 只有契约和 mock，没有真实节点样本 | 真实样本 + 节点 DQ + 阈值签收 |
| 不生成仓库或承运商动作 | SCM 与订单专题边界未签收 | SCM 履约专题和订单专题双向确认 |
| 不把 VOC 关联解释为客诉根因 | `has_voc` 只是线索 | VOC 专题完成主题、原因和证据链归因 |
| 不把 `turnover_days` 当完整库存健康度 | 当前只是订单履约辅助字段 | 库存专题或 SCM 库存健康表签收 |

## 15. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 履约主表形态 | 独立 `fact_order_fulfillment` 优先 | 真实数仓是否已有独立履约表，还是字段在 `fact_order` |
| 时间单位 | 底层小时，展示天 | BI 是否统一展示天，Agent 是否需要小时级诊断 |
| 时区 | 统一转换到业务标准时区 | 源系统是否跨站点、跨国家混用本地时间 |
| 缺失节点策略 | 允许非 P0 节点缺失并标记 | `in_transit_at`、`cleared_at` 缺失是否常态 |
| 超时阈值 | 按国家×渠道×目的仓×履约类型配置 | 当前业务是否已有 SLA 或超时规则表 |
| 周转天数来源 | 优先源表，备选库存专题映射 | `turnover_days` 是订单级字段还是仓库周期聚合字段 |
| VOC 关联键 | 优先 `order_id`，其次 `voc_ticket_id` | VOC 工单是否稳定保留订单号 |

## 16. 下一步任务

下一步执行 `ORDER-DATA-004`：定义 `dwt_order_margin_attribution` 毛利归因宽表规格。

建议落盘文件：

`drafts/analysis/order-topic-margin-attribution-wide-table-spec-draft-20260603.md`

进入条件：

1. 复核 `ORDER-MARGIN-*` 指标字典。
2. 对齐 `fact_order`、`fact_order_item`、`campaign_id`、`order_type` 和 SPU/SKU 字段。
3. 明确毛利归因只做订单与商品结构解释，不替代财务总账。
4. 继续保持 `Grey` 状态，不创建正式 SQL。
