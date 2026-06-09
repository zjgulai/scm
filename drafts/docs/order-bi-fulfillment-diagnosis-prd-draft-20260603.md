---
title: 专题②订单履约时效与节点瓶颈诊断 PRD 草稿
doc_type: prd
module: project-governance
topic: order-bi-fulfillment-diagnosis-prd
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②订单履约时效与节点瓶颈诊断 PRD 草稿

## 1. 任务定位

本文件执行 `ORDER-BI-002`，目标是固定“订单履约时效与节点瓶颈诊断”页面 PRD，支撑专题② `ORDER-T2`：订单平均耗时与核心节点诊断。

当前页面只消费 `dwt_order_fulfillment_diagnosis` 规格、ORDER 指标字典和 Phase2 mock 输出，不接真实生产 SQL，不输出履约瓶颈责任结论，不触发仓库、承运商、调拨或补货动作。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 页面 ID | `ORDER-BI-002` |
| 页面名称 | 订单履约时效与节点瓶颈诊断 |
| 主输入 | `dwt_order_fulfillment_diagnosis` |
| 参考输入 | SCM 履约稳定性、库存健康、kp04 仓储与调拨协同 |
| 服务对象 | 订单运营、仓配协同、供应链分析、数据 Owner、订单 Agent |
| 页面目标 | 判断订单慢在哪个节点、哪些国家/渠道/仓库受影响、超时是否与周转或 VOC 线索相关 |
| 当前状态 | `Grey`，因为真实履约节点表、时间字段、时区、超时阈值、Owner 和样本 DQ 尚未确认 |
| SQL 状态 | 不创建 SQL；`ORDER-DQ-001` 通过后再进入 `ORDER-SQL-002` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| 四专题治理计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定 `ORDER-BI-002` 页面任务 | 草稿计划 |
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定页面核心问题、输入和组件 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-FULFILL-*` 指标公式 | 草稿指标字典 |
| 履约诊断宽表规格 | `drafts/analysis/order-topic-fulfillment-diagnosis-wide-table-spec-draft-20260603.md` | 固定 `dwt_order_fulfillment_diagnosis` 字段、DQ 和边界 | 草稿数据规格 |
| Phase2 履约输出 | `main_project_lute/phase2_outputs/topic2/topic2_leadtime_diagnostics.csv` | 提供渠道×国家×目的仓耗时样例 | mock 产物 |
| SCM 数据底表 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供 `dwt_fulfillment_stability` 参考 | SCM 参考 |
| SCM kp04 | `scm/供应链成本指标全链路优化/（tactic）课题一：kp04-仓储与调拨协同执行方案.md` | 提供仓储与调拨协同解释参考 | SCM 参考 |

## 4. 页面边界

| 边界 | 页面负责 | 页面不负责 |
|---|---|---|
| 履约节点 | 创建、支付、发货、在途、清关、签收节点耗时 | 承运商全量轨迹、包裹级扫描明细 |
| 时效诊断 | 节点耗时、总耗时、超时率、超时阶段、节点缺失 | 物流商定责、仓库定责、SLA 处罚 |
| 仓网线索 | 国家、渠道、目的仓、仓库类型下的慢节点范围 | 仓网重规划、调拨、补货、承运商切换 |
| 周转辅助 | `turnover_days` 与履约慢的相关线索 | 完整库存健康、库龄、缺货预测 |
| VOC 线索 | `has_voc` 和 `voc_ticket_id` 作为体验线索 | VOC 主题归因、用户原话和客诉根因 |
| SCM 引用 | 作为履约稳定性和库存解释参考 | 用 SCM 聚合表替代订单级节点时间戳 |
| Agent 入口 | 向 `ORDER-AGENT-002` 传递筛选范围和证据状态 | 让 Agent 在 Grey 状态输出责任结论 |

## 5. 用户与使用场景

| 用户 | 核心问题 | 页面应给出的结果 |
|---|---|---|
| 订单运营 | 哪些订单、国家、渠道的履约慢 | 节点耗时、超时率、影响范围 |
| 仓配协同 | 慢在发货、在途、清关还是尾程 | 节点瓶颈和仓库/目的仓下钻 |
| 供应链分析 | 履约慢是否与周转和仓网有关 | 周转天数、目的仓、履约类型线索 |
| 数据 Owner | 哪些时间戳、阈值、时区还不能生产化 | DQ 状态、字段缺口、不可用节点 |
| 订单 Agent Owner | 哪些范围可进入履约异常诊断 | 筛选上下文、节点快照、证据等级 |

## 6. 页面信息架构

| 区块 | 组件 | 目的 | 状态规则 |
|---|---|---|---|
| A. 状态栏 | 数据状态、样本范围、时间戳质量、SQL 状态 | 先告诉用户当前证据等级 | `Grey` 时固定提示“仅规格 / mock，不输出责任结论” |
| B. 全局筛选 | 时间、国家、渠道、店铺、目的仓、仓库类型、履约类型、超时状态 | 控制所有组件范围 | 未确认字段显示为不可用 |
| C. 履约 KPI | 总耗时、节点耗时、超时率、周转天数、VOC 关联率 | 判断履约基本盘 | 无阈值签收时不展示责任判断 |
| D. 节点漏斗 | 创建 -> 支付 -> 发货 -> 在途 -> 清关 -> 签收 | 展示链路节点和缺失率 | 缺失节点单独标记 |
| E. 节点耗时分布 | 箱线图 / 分位数表 | 找异常长尾 | 只定位范围，不定责 |
| F. 超时矩阵 | 国家×渠道、目的仓×节点 | 找高超时范围 | 点击后下钻订单样本 |
| G. 仓库排序 | 目的仓、仓库类型、履约类型排序 | 找仓网相关线索 | 动作需 SCM 或 Agent 后续确认 |
| H. 周转相关视图 | 周转天数×总履约耗时散点 | 判断履约慢是否可能与库存周转相关 | 不输出库存健康结论 |
| I. VOC 线索面板 | `has_voc`、VOC 关联订单率、物流 VOC 线索 | 识别体验影响范围 | 不输出 VOC 标签结论 |
| J. DQ 缺口面板 | 时间戳缺失、顺序倒挂、负耗时、阈值缺口、时区缺口 | 让治理问题可见 | `Grey` 状态的主输出之一 |
| K. Agent 入口 | 选定范围后触发 `ORDER-AGENT-002` | 输出异常诊断请求 | Grey 状态只允许输出缺口和待确认问题 |

## 7. 全局筛选器

| 筛选器 | 字段 | 必填 | 说明 |
|---|---|---:|---|
| 时间 | `order_date`、`dt_month` | 是 | 支持日、月、分析期 |
| 国家 | `country_code` | 是 | 默认全部 |
| 渠道 | `channel_id` | 是 | 默认全部 |
| 店铺 | `shop_id` | 否 | 支持店铺下钻 |
| 目的仓 | `dest_warehouse` | 是 | 履约下钻核心维度 |
| 仓库 | `warehouse_id` | 否 | 源字段未确认时不可用 |
| 仓库类型 | `warehouse_type` | 否 | FBA、3PL、自建仓等 |
| 履约类型 | `fulfillment_type` | 否 | FBA、自发货、3PL、海外仓等 |
| 承运商 | `carrier_id` | 否 | 当前规划契约未强制要求 |
| 超时状态 | `is_overdue`、`overdue_stage` | 是 | 超时订单、正常订单、节点超时 |
| 节点缺失 | `is_node_missing` | 是 | 区分真实慢和数据缺口 |
| 数据状态 | `data_quality_status`、`timestamp_quality_status` | 是 | `Grey` / `Amber` / `Green` / `Red` |

## 8. 指标与卡片

| 卡片 | 指标 | 公式 | 来源 |
|---|---|---|---|
| 订单数 | 基础指标 | `count(distinct order_id)` | `dwt_order_fulfillment_diagnosis.order_id` |
| 创建到支付耗时 | `ORDER-FULFILL-001` | `avg(lead_time_created_to_paid_days)` | `lead_time_created_to_paid_days` |
| 支付到发货耗时 | `ORDER-FULFILL-002` | `avg(lead_time_paid_to_shipped_days)` | `lead_time_paid_to_shipped_days` |
| 发货到签收耗时 | `ORDER-FULFILL-003` | `avg(lead_time_shipped_to_delivered_days)` | `lead_time_shipped_to_delivered_days` |
| 在途到清关耗时 | `ORDER-FULFILL-004` | `avg(lead_time_in_transit_to_cleared_hours) / 24` | `lead_time_in_transit_to_cleared_hours` |
| 总履约耗时 | `ORDER-FULFILL-005` | `avg(lead_time_total_days)` | `lead_time_total_days` |
| 库存周转天数 | `ORDER-FULFILL-006` | `avg(turnover_days)` | `turnover_days` |
| 超时订单数 | `ORDER-FULFILL-007` | `sum(case when is_overdue then 1 else 0 end)` | `is_overdue` |
| 超时率 | `ORDER-FULFILL-008` | `sum(is_overdue) / count(distinct order_id)` | `is_overdue`、`order_id` |
| 物流 VOC 关联订单率 | `ORDER-FULFILL-009` | `sum(case when has_voc then 1 else 0 end) / count(distinct order_id)` | `has_voc` |
| 节点缺失率 | DQ 辅助 | `sum(is_node_missing) / count(distinct order_id)` | `is_node_missing` |

Grey 状态下，所有卡片只展示“可计算 / 不可计算 / 缺口原因”。未签收真实时间戳、时区和超时阈值前，不展示同比、环比、责任归因或动作建议。

## 9. 图表与表格规格

| 模块 | 图表 / 表格 | 维度 | 指标 | 交互 |
|---|---|---|---|---|
| 履约总览趋势 | 折线 + KPI 卡 | `dt_month` | 总履约耗时、超时率、订单数 | 点击月份过滤全页 |
| 节点漏斗 | 横向节点漏斗 | 创建、支付、发货、在途、清关、签收 | 节点完成率、节点缺失率 | 点击节点过滤明细 |
| 节点耗时分布 | 箱线图 / P50-P90-P95 表 | 节点 | 节点耗时天数 / 小时 | 点击长尾进入样本清单 |
| 国家×渠道超时矩阵 | 热力图 | `country_code`、`channel_id` | 超时率、总耗时、订单数 | 点击单元格带入筛选 |
| 目的仓瓶颈排序 | 排序表 | `dest_warehouse`、`warehouse_type` | 总耗时、超时率、订单数、周转天数 | 高影响范围优先标记 |
| 节点×目的仓矩阵 | 热力图 | 节点、`dest_warehouse` | 节点耗时、节点超时率 | 点击进入节点样本 |
| 周转相关散点 | 散点图 | `dest_warehouse` 或 `country_code` | `turnover_days`、`lead_time_total_days`、订单数 | 只展示相关线索 |
| VOC 线索表 | 表格 | 国家、渠道、目的仓、节点 | `has_voc`、VOC 关联订单率、超时率 | 跳转 XL3 / VOC 前置输入 |
| 异常订单样本 | 表格 | `order_id` | 节点时间、节点耗时、超时阶段、DQ 状态 | 供 Agent 消费 |
| DQ 缺口面板 | 表格 | check_id | 通过率、失败原因、阻断状态 | 跳转数据治理任务 |

## 10. 节点诊断逻辑

| 诊断对象 | 规则 | 输出 |
|---|---|---|
| 慢节点 | 节点平均耗时或 P90 高于阈值 | 慢节点候选，不输出责任 |
| 超时阶段 | `overdue_stage` 或最大超阈值节点 | 超时阶段分布 |
| 数据缺口 | 节点时间缺失、顺序倒挂、负耗时 | DQ 缺口清单 |
| 仓网线索 | 目的仓维度总耗时、超时率、周转天数异常 | SCM 深挖候选 |
| 体验线索 | 超时订单与 `has_voc` 同时出现 | VOC 交叉线候选 |
| 履约类型线索 | `fulfillment_type` 维度出现高耗时 | 待确认履约类型范围 |

节点诊断只给“候选范围”。若没有真实样本、阈值和 Owner 签收，页面不得输出“某仓库导致履约慢”或“某承运商应切换”的句子。

## 11. 状态与颜色规则

| 状态 | 判定 | 页面行为 | 禁止行为 |
|---|---|---|---|
| Grey | 只有规格、mock 或样例，无真实源表和样本 | 展示字段缺口、组件设计、mock 示例 | 责任结论、仓网动作、承运商动作、SQL |
| Amber | 有真实样本，P0 DQ 通过但时区、阈值或节点仍未签收 | 展示待验证异常、样本趋势、DQ 提醒 | 管理层强结论 |
| Green | 源表、样本、Owner、权限、DQ、时区和阈值均通过 | 展示看板、触发 Agent、进入 SQL 前置 | 无证据泛化 |
| Red | P0 DQ 失败且无业务解释 | 阻断看板数据展示，只显示缺口 | Agent 诊断、SQL、动作建议 |

页面顶部必须始终展示 `data_quality_status` 和 `timestamp_quality_status`。当状态不是 `Green` 时，所有导出、Agent 触发和管理层摘要都要带证据等级。

## 12. Agent 入口

| 入口 | 输入 | 输出 | 护栏 |
|---|---|---|---|
| 履约异常诊断 | 当前筛选范围、节点耗时、超时率、DQ 状态 | 异常范围、慢节点候选、字段缺口 | Grey 只输出缺口 |
| 节点瓶颈诊断 | 节点、目的仓、国家、渠道、订单样本 | 待验证瓶颈节点和样本清单 | 不自动归责仓库或承运商 |
| 周转联动诊断 | `turnover_days`、总耗时、目的仓 | 库存 / 周转相关线索 | 不输出库存健康结论 |
| VOC 线索诊断 | `has_voc`、超时阶段、订单样本 | 可进入 VOC / XL3 的订单线索 | 不输出 VOC 原话或标签结论 |
| 数据治理诊断 | DQ 检查失败项、字段缺口 | 源表确认清单、Owner 待办 | 不绕过 DQ 门禁 |

`ORDER-AGENT-002` 的默认输出必须包含证据状态、使用字段、不可用字段、样本范围和下一步确认项。没有真实样本时，不允许输出履约责任归因。

## 13. 数据与刷新规则

| 项 | 规则 |
|---|---|
| 数据来源 | `dwt_order_fulfillment_diagnosis` |
| 当前可用数据 | Phase2 mock `topic2_leadtime_diagnostics.csv` 仅作页面样例 |
| 刷新频率 | 真实源表确认前不定义正式频率 |
| 分区 | `order_date` |
| 月度聚合 | `dt_month` |
| 时间单位 | 底层小时，BI 展示天 |
| 时区 | 未确认前必须展示为 DQ 缺口 |
| 阈值 | 未确认前不输出超时责任结论 |
| 导出 | Grey 状态只允许导出字段缺口和 mock 示例，不导出业务结论 |
| SQL | `ORDER-DQ-001` 通过前不创建正式 SQL |

## 14. 验收标准

| 编号 | 标准 | 通过条件 |
|---|---|---|
| `ORDER-BI-002-AC-001` | 页面目标明确 | 能回答慢在哪个节点、国家、渠道、仓库范围 |
| `ORDER-BI-002-AC-002` | 输入边界明确 | 只以 `dwt_order_fulfillment_diagnosis` 为主输入，SCM 只作参考 |
| `ORDER-BI-002-AC-003` | 指标口径明确 | KPI 均能映射到 `ORDER-FULFILL-*` 或宽表派生字段 |
| `ORDER-BI-002-AC-004` | 节点下钻明确 | 节点、国家、渠道、目的仓、超时阶段均有筛选和下钻 |
| `ORDER-BI-002-AC-005` | DQ 护栏明确 | Grey / Amber / Green / Red 行为不同 |
| `ORDER-BI-002-AC-006` | Agent 护栏明确 | Grey 状态只输出缺口，不输出责任和动作 |
| `ORDER-BI-002-AC-007` | 不创建 SQL | 文档只定义 PRD，不生成 `sql/` 资产 |

## 15. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 履约主表 | 独立 `fact_order_fulfillment` 优先 | 真实数仓是否已有独立履约表 |
| 时间单位 | 底层小时，展示天 | BI 是否需要小时级节点明细 |
| 时区 | 统一转换到业务标准时区 | 源系统是否跨国家混用本地时间 |
| 缺失节点 | 允许非 P0 节点缺失并标记 | `in_transit_at`、`cleared_at` 缺失是否常态 |
| 超时阈值 | 国家×渠道×目的仓×履约类型配置 | 业务是否已有 SLA 或超时规则表 |
| 周转来源 | 优先源表，备选库存专题映射 | `turnover_days` 是订单级还是仓库周期聚合字段 |
| VOC 线索 | `has_voc` 只作体验线索 | 是否有稳定 `voc_ticket_id` 或工单关联 |
| Agent 触发 | 只允许带证据状态触发 | 哪些角色能触发 `ORDER-AGENT-002` |

## 16. 下一步任务

下一步执行 `ORDER-BI-003`：订单价结构与毛利归因 PRD。

建议落盘文件：

`drafts/docs/order-bi-margin-attribution-prd-draft-20260603.md`

进入条件：

1. 复核 `dwt_order_margin_attribution` 宽表规格。
2. 明确订单类型、促销、组合、品单价、客品数和 SPU 下钻边界。
3. 固定页面模块、筛选器、四因素归因、组合候选和 Agent 入口。
4. 继续保持 `Grey` 状态，不创建正式 SQL。
