---
title: 专题②订单履约耗时诊断 Agent 规格草稿
doc_type: workflow
module: project-governance
topic: order-agent-fulfillment-diagnosis-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②订单履约耗时诊断 Agent 规格草稿

## 1. 任务定位

本文件执行 `ORDER-AGENT-002`，目标是固定“订单履约耗时诊断 Agent”的任务规格，支撑专题② `ORDER-T2`：订单平均耗时与核心节点诊断。

当前 Agent 只消费 `dwt_order_fulfillment_diagnosis`、`ORDER-BI-002` 页面上下文、ORDER 指标字典和 SCM 履约参考，不接真实生产 SQL，不输出 Grey 状态下的履约责任、仓库责任、承运商责任、调拨补货动作或管理层强结论。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| Agent ID | `ORDER-AGENT-002` |
| Agent 名称 | 订单履约耗时诊断 Agent |
| 主输入 | `dwt_order_fulfillment_diagnosis` |
| 页面入口 | `ORDER-BI-002` 订单履约时效与节点瓶颈诊断 |
| 指标范围 | `ORDER-FULFILL-*` |
| 参考输入 | SCM 履约稳定性、库存健康、kp04 仓储与调拨协同、Phase2 mock 履约输出 |
| 服务对象 | 订单运营、仓配协同、供应链分析、数据 Owner、订单 Agent Owner |
| Agent 目标 | 输出慢节点候选、影响范围、超时阶段、时间戳缺口、周转/VOC 线索和下一步确认项 |
| 当前状态 | `Grey`，因为真实履约节点表、时间字段、时区、超时阈值、Owner 和样本 DQ 尚未确认 |
| SQL 状态 | 不创建 SQL；`ORDER-DQ-001` 通过后再进入 `ORDER-SQL-002` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| 四专题治理计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定 `ORDER-AGENT-002` 工作包 | 草稿计划 |
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定 Agent 触发条件、输入、输出和护栏 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-FULFILL-*` 指标公式和证据状态 | 草稿指标字典 |
| 履约诊断宽表规格 | `drafts/analysis/order-topic-fulfillment-diagnosis-wide-table-spec-draft-20260603.md` | 固定 `dwt_order_fulfillment_diagnosis` 字段、DQ、SCM 边界 | 草稿数据规格 |
| 履约诊断页面 PRD | `drafts/docs/order-bi-fulfillment-diagnosis-prd-draft-20260603.md` | 固定页面入口、筛选器、图表和 Agent 护栏 | 草稿 PRD |
| Phase2 履约输出 | `main_project_lute/phase2_outputs/topic2/topic2_leadtime_diagnostics.csv` | 提供国家×渠道×目的仓耗时 mock 字段样例 | mock 产物 |
| SCM kp04 | `scm/供应链成本指标全链路优化/（tactic）课题一：kp04-仓储与调拨协同执行方案.md` | 提供仓储、调拨、库存健康和履约协同参考 | SCM 参考 |
| SCM 数据底表 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供 `dwt_fulfillment_stability` 和履约成本参考 | SCM 参考 |

## 4. Agent 边界

| 边界 | Agent 负责 | Agent 不负责 |
|---|---|---|
| 履约节点 | 识别创建、支付、发货、在途、清关、签收等节点的慢节点候选 | 承运商全量轨迹或包裹级扫描分析 |
| 超时诊断 | 输出超时范围、超时阶段、节点超时候选和阈值缺口 | 自动归责仓库、承运商、物流商或 SLA 处罚 |
| 时间戳治理 | 输出时间字段缺失、顺序倒挂、负耗时、时区缺口 | 跳过 DQ 直接进入看板或 SQL |
| 仓网线索 | 标记国家、渠道、目的仓、仓库类型下的高耗时范围 | 触发仓网重规划、调拨、补货、承运商切换 |
| 周转辅助 | 使用 `turnover_days` 作为履约与库存联动线索 | 输出完整库存健康、库龄或缺货结论 |
| VOC 线索 | 使用 `has_voc`、`voc_ticket_id` 识别体验影响范围 | 输出 VOC 原话、情绪、主题标签或客诉根因 |
| SCM 参考 | 用 SCM 履约稳定性和 kp04 解释后续深挖方向 | 用 SCM 聚合表替代订单级节点时间戳 |
| 管理摘要 | Green 状态下可生成带证据的摘要候选 | Grey/Amber 状态下输出管理层强结论 |

## 5. 触发条件

| trigger_id | 触发条件 | 必需字段 | 允许状态 |
|---|---|---|---|
| `ORDER-A2-TRG-001` | 支付到发货耗时进入 Amber / Red | `lead_time_paid_to_shipped_hours`、`overdue_threshold_rule_id` | Amber / Green |
| `ORDER-A2-TRG-002` | 发货到签收耗时进入 Amber / Red | `lead_time_shipped_to_delivered_hours`、`overdue_threshold_rule_id` | Amber / Green |
| `ORDER-A2-TRG-003` | 总履约耗时进入 Amber / Red | `lead_time_total_hours`、`lead_time_total_days` | Amber / Green |
| `ORDER-A2-TRG-004` | 超时率异常 | `is_overdue`、`order_id`、阈值规则 | Amber / Green |
| `ORDER-A2-TRG-005` | 国家×渠道或目的仓出现高耗时组合 | `country_code`、`channel_id`、`dest_warehouse`、节点耗时 | Amber / Green |
| `ORDER-A2-TRG-006` | 周转天数与履约总耗时同时异常 | `turnover_days`、`lead_time_total_hours` | Amber / Green |
| `ORDER-A2-TRG-007` | VOC 关联订单与超时订单重叠 | `has_voc`、`voc_ticket_id`、`is_overdue` | Amber / Green |
| `ORDER-A2-TRG-008` | 时间戳、时区、节点顺序或阈值 DQ 失败 | `timestamp_quality_status`、`fulfillment_data_gap_flags`、`dq_run_id` | Grey / Amber / Red |
| `ORDER-A2-TRG-009` | 用户在 `ORDER-BI-002` 选定范围后手动触发 | 当前筛选器、节点 KPI、DQ 状态 | Grey / Amber / Green / Red |

Grey 状态下，触发 Agent 只允许返回字段缺口、阈值缺口、时区缺口和取数确认项。Red 状态下，Agent 只允许返回阻断原因和修复前置条件。

## 6. 输入契约

### 6.1 必需上下文

| 输入 | 字段 | 用途 |
|---|---|---|
| 筛选范围 | `dt_month`、`country_code`、`channel_id`、`shop_id`、`warehouse_id`、`dest_warehouse`、`warehouse_type`、`fulfillment_type` | 定义诊断范围 |
| 节点时间 | `created_at`、`paid_at`、`shipped_at`、`in_transit_at`、`cleared_at`、`delivered_at`、`timezone` | 校验节点顺序和时区 |
| 节点耗时 | `lead_time_*_hours`、`lead_time_*_days`、`lead_time_total_hours`、`lead_time_total_days` | 判断慢节点候选 |
| 超时字段 | `is_overdue`、`overdue_stage`、`overdue_threshold_rule_id` | 判断超时范围和阈值规则 |
| 周转字段 | `turnover_days` | 识别库存 / 周转联动线索 |
| VOC 线索 | `has_voc`、`voc_ticket_id` | 识别体验影响范围 |
| 治理字段 | `data_quality_status`、`timestamp_quality_status`、`fulfillment_data_gap_flags`、`dq_run_id` | 控制输出等级 |
| 证据引用 | 页面 ID、指标 code、宽表字段、样本范围 | 支撑可追溯输出 |

### 6.2 可选上下文

| 输入 | 字段 | 用途 | 护栏 |
|---|---|---|---|
| `dim_warehouse` | `warehouse_type`、`is_fba`、仓库区域 | 仓网线索分组 | 不输出仓网动作 |
| `fact_order` | `order_type`、`order_date`、订单基础维度 | 补订单维度 | 不替代履约节点主表 |
| VOC 工单表 | `voc_ticket_id`、`order_id`、工单聚合标记 | 体验线索 | 不输出 VOC 标签结论 |
| SCM 履约参考 | 履约稳定性、尾程成本、SLA 护栏 | 后续深挖方向 | 不替代订单级时间戳 |
| kp04 仓储调拨参考 | 仓储、调拨、库存覆盖、返仓恢复 | 仓配协同候选 | 不自动生成调拨或补货指令 |
| `ORDER-BI-001` 上下文 | 仓网成本、后台成本率 | 成本联动线索 | 不输出成本根因 |

## 7. 标准输出字段

| 字段 | 类型 | 必填 | 含义 |
|---|---|---:|---|
| `agent_task_id` | string | 是 | 固定为 `ORDER-AGENT-002` |
| `run_mode` | string | 是 | `gap_only` / `sample_diagnosis` / `production_diagnosis` / `blocked` |
| `evidence_status` | string | 是 | `Grey` / `Amber` / `Green` / `Red` |
| `scope` | object | 是 | 当前筛选范围 |
| `trigger_id` | string | 是 | 命中的触发条件 |
| `metric_codes` | list | 是 | 使用的 `ORDER-FULFILL-*` 指标 |
| `primary_metric` | string | 否 | 当前主异常指标 |
| `current_value` | decimal | 否 | 当前指标值 |
| `baseline_value` | decimal | 否 | 基线、同期或阈值 |
| `delta_value` | decimal | 否 | 偏差值 |
| `slow_node_candidate` | string | 否 | 慢节点候选 |
| `overdue_stage_candidate` | string | 否 | 超时阶段候选 |
| `impact_scope` | list | 否 | 受影响国家、渠道、目的仓、订单样本 |
| `node_breakdown` | list | 否 | 各节点耗时、阈值和缺口 |
| `timestamp_gaps` | list | 是 | 时间戳、时区、负耗时、顺序倒挂缺口 |
| `data_gaps` | list | 是 | 字段缺口、DQ 失败、口径未确认 |
| `blocked_reasons` | list | 否 | Red 或 Grey 下的阻断原因 |
| `next_confirmation_items` | list | 是 | 下一步需要业务或数据确认的问题 |
| `handoff_targets` | list | 否 | 需要转入 SCM / VOC / ORDER-BI-001 / SOURCE / DQ 的范围 |
| `confidence_level` | string | 是 | `none` / `low` / `medium` / `high` |
| `allowed_summary` | string | 是 | 当前状态下允许展示的摘要文本 |
| `forbidden_summary` | string | 是 | 当前状态下禁止展示的结论类型 |
| `evidence_refs` | list | 是 | 指标、字段、页面、宽表或样本引用 |

## 8. 输出模式

| 模式 | 进入条件 | 允许输出 | 禁止输出 |
|---|---|---|---|
| `gap_only` | `evidence_status = Grey` | 字段缺口、时间戳缺口、阈值缺口、时区确认项、不可用指标 | 慢节点责任、Owner、仓网动作、承运商动作 |
| `blocked` | `evidence_status = Red` | 阻断原因、失败检查、修复前置条件 | 看板结论、Agent 诊断、SQL |
| `sample_diagnosis` | `evidence_status = Amber` | 样本异常、待验证慢节点、口径差异、DQ 提醒 | 生产责任、强动作、管理层摘要 |
| `production_diagnosis` | `evidence_status = Green` | 指标解释、慢节点候选、影响范围、handoff 候选 | 无证据泛化、自动调拨、承运商切换 |

## 9. 推理链

| 步骤 | 动作 | 输出 | 门禁 |
|---:|---|---|---|
| 1 | 读取页面筛选范围和触发条件 | `scope`、`trigger_id` | 无筛选范围时只返回请求补全 |
| 2 | 校验 `data_quality_status` 和 `timestamp_quality_status` | `run_mode` | Grey / Red 先阻断责任结论 |
| 3 | 校验 P0 字段存在性、主键唯一性和时间字段类型 | `data_gaps`、`timestamp_gaps` | 缺 P0 字段不进入诊断 |
| 4 | 校验节点顺序、负耗时和时区一致性 | 时间戳 DQ 结果 | 顺序倒挂或时区混算进入阻断 |
| 5 | 汇总 `ORDER-FULFILL-*` 指标 | `metric_codes`、`current_value` | 阈值未确认不输出责任判断 |
| 6 | 识别节点耗时最大或超阈值节点 | `slow_node_candidate` | 只输出候选，不定责 |
| 7 | 识别超时阶段和影响范围 | `overdue_stage_candidate`、`impact_scope` | `overdue_threshold_rule_id` 缺失时仅输出缺口 |
| 8 | 下钻国家、渠道、目的仓、仓库类型和履约类型 | 范围候选 | 样本不足时只输出待验证范围 |
| 9 | 检查周转和 VOC 线索 | `handoff_targets` | 不输出库存健康或 VOC 结论 |
| 10 | 生成允许摘要和禁止摘要 | `allowed_summary`、`forbidden_summary` | 摘要必须带证据状态 |

## 10. 诊断候选规则

| 候选 | 字段 | 输出文本边界 | 交接目标 |
|---|---|---|---|
| 支付到发货慢 | `lead_time_paid_to_shipped_hours` | 发货前节点慢候选 | SCM / 仓配深挖，不定责仓库 |
| 发货到签收慢 | `lead_time_shipped_to_delivered_hours` | 尾程或跨境段慢候选 | SCM 履约稳定性，不定责承运商 |
| 在途到清关慢 | `lead_time_in_transit_to_cleared_hours` | 清关节点候选 | SCM / 物流深挖 |
| 总履约耗时高 | `lead_time_total_hours` | 总链路慢候选 | 需拆节点后再判断 |
| 超时阶段集中 | `overdue_stage`、`is_overdue` | 超时阶段候选 | 需阈值规则签收 |
| 节点缺失 | `is_node_missing`、`fulfillment_data_gap_flags` | 数据缺口 | `ORDER-DQ-001` |
| 周转联动 | `turnover_days`、`lead_time_total_hours` | 库存 / 周转线索 | SCM 库存健康，不输出库存结论 |
| VOC 联动 | `has_voc`、`voc_ticket_id`、`is_overdue` | 体验影响线索 | VOC / XL3，不输出 VOC 标签 |
| 仓网范围 | `warehouse_id`、`dest_warehouse`、`warehouse_type` | 仓网深挖候选 | SCM，不自动调拨 |

慢节点候选不是责任结论。只有真实源表、样本 DQ、时区、阈值、Owner 和口径均为 Green 时，才允许把候选升级为“瓶颈候选”；仍不得自动输出承运商切换、仓库定责或调拨补货动作。

## 11. 状态行为

| 状态 | Agent 行为 | 示例允许句 | 示例禁止句 |
|---|---|---|---|
| Grey | 只输出字段缺口、时区缺口和阈值确认项 | “当前只能确认需要 `created_at`、`shipped_at`、`delivered_at` 和统一时区样本。” | “某仓库导致履约慢。” |
| Amber | 输出样本异常和待验证慢节点 | “样本范围内支付到发货耗时偏高，需确认超时阈值。” | “应立即切换承运商。” |
| Green | 输出指标解释、慢节点候选和影响范围 | “在已签收样本中，发货到签收是主要慢节点候选。” | “无证据泛化到所有国家渠道。” |
| Red | 输出阻断原因和修复前置条件 | “P0 时间戳 DQ 失败，节点耗时不可用于诊断。” | “继续生成管理层摘要。” |

## 12. Handoff 规则

| 目标 | 触发 | 传递字段 | 边界 |
|---|---|---|---|
| SCM 履约分枝 | 仓库、目的仓、仓配节点或尾程耗时需要深挖 | `warehouse_id`、`dest_warehouse`、`warehouse_type`、节点耗时 | 不替代 SCM 主题宽表 |
| SCM 库存健康 | `turnover_days` 与履约慢同时异常 | `turnover_days`、`dest_warehouse`、`country_code`、订单数 | 不输出库存健康结论 |
| VOC / XL3 | 超时订单与 `has_voc` 同时出现 | `order_id`、`has_voc`、`voc_ticket_id`、`overdue_stage` | 不输出 VOC 原文和标签 |
| `ORDER-BI-001` | 履约慢可能与仓配成本联动 | `dest_warehouse`、`warehouse_id`、`lead_time_total_days` | 不输出成本根因 |
| `ORDER-SOURCE-001` | 源表、时间字段、Owner、权限不明确 | 真实源表确认清单 | 不进入 SQL |
| `ORDER-DQ-001` | 字段存在但质量未知 | P0 DQ 检查项和样本需求 | P0 未过不进入 SQL |

## 13. 失败与阻断

| blocker_id | 阻断条件 | Agent 输出 |
|---|---|---|
| `ORDER-A2-BLOCK-001` | 缺 `order_id`、`order_date`、`country_code`、`channel_id` 或 `dest_warehouse` | P0 维度字段缺口 |
| `ORDER-A2-BLOCK-002` | 缺 `created_at`、`shipped_at` 或 `delivered_at` | P0 节点时间缺口 |
| `ORDER-A2-BLOCK-003` | `order_id` 不唯一且无业务解释 | 主键阻断 |
| `ORDER-A2-BLOCK-004` | 时间字段无法解析为 datetime | 类型阻断 |
| `ORDER-A2-BLOCK-005` | 跨时区混算且无转换说明 | 时区阻断 |
| `ORDER-A2-BLOCK-006` | 节点顺序倒挂或大量负耗时 | 时间戳顺序阻断 |
| `ORDER-A2-BLOCK-007` | `is_overdue` 无来源或阈值规则 | 超时规则阻断 |
| `ORDER-A2-BLOCK-008` | VOC 工单一对多 join 放大订单 | VOC join 阻断 |
| `ORDER-A2-BLOCK-009` | 用 SCM 聚合表替代订单节点时间 | 边界阻断 |
| `ORDER-A2-BLOCK-010` | Grey 状态请求责任、Owner 或动作建议 | 证据等级阻断 |

## 14. 验收标准

| 编号 | 标准 | 通过条件 |
|---|---|---|
| `ORDER-AGENT-002-AC-001` | 输入契约明确 | 主输入、页面入口、指标范围、SCM / VOC 参考均清楚 |
| `ORDER-AGENT-002-AC-002` | 触发条件明确 | 节点耗时、总耗时、超时率、周转、VOC 和 DQ 触发均覆盖 |
| `ORDER-AGENT-002-AC-003` | 输出字段明确 | 标准输出字段可被页面、日志和后续 Agent 消费 |
| `ORDER-AGENT-002-AC-004` | 推理链明确 | Agent 从证据状态、DQ、节点指标、下钻到摘要的顺序清楚 |
| `ORDER-AGENT-002-AC-005` | 慢节点边界明确 | 候选不被写成责任，仓网线索不被写成调拨动作 |
| `ORDER-AGENT-002-AC-006` | 状态行为明确 | Grey / Amber / Green / Red 输出差异清楚 |
| `ORDER-AGENT-002-AC-007` | Handoff 明确 | 能转入 SCM、VOC / XL3、`ORDER-BI-001`、SOURCE、DQ |
| `ORDER-AGENT-002-AC-008` | 阻断条件明确 | P0 字段、主键、时间类型、时区、顺序、阈值、join 和证据等级均有阻断 |
| `ORDER-AGENT-002-AC-009` | 不创建 SQL | 文档只定义 Agent 规格，不生成 `sql/` 资产 |

## 15. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 履约主表 | 独立 `fact_order_fulfillment` 优先 | 真实数仓是否已有独立履约表 |
| 时间单位 | 底层小时，展示天 | Agent 是否需要小时级节点诊断输出 |
| 时区 | 统一转换到业务标准时区 | 跨国家站点是否混用本地时间 |
| 超时阈值 | 国家×渠道×目的仓×履约类型配置 | SLA 或超时规则由谁签收 |
| 缺失节点 | 允许非 P0 节点缺失并标记 | `in_transit_at`、`cleared_at` 缺失是否常态 |
| 周转来源 | 优先源表，备选 SCM / 库存专题映射 | `turnover_days` 是订单级还是仓库周期聚合字段 |
| VOC 关联键 | 优先 `order_id`，其次 `voc_ticket_id` | 工单系统是否稳定保留订单号 |
| SCM handoff | 只传候选范围和字段，不传动作 | SCM 分枝是否已有可接收的动作台账 |
| Agent 日志 | 标准输出字段落日志 | 后续是否需要结构化 JSON schema |
| 角色权限 | Grey 状态任何角色只能看缺口 | 哪些角色可在 Green 状态触发生产诊断 |

## 16. 下一步任务

下一步执行 `ORDER-AGENT-003`：毛利归因与组合建议 Agent 规格。

建议落盘文件：

`drafts/docs/order-agent-margin-combo-diagnosis-spec-draft-20260603.md`

进入条件：

1. 复核 `ORDER-BI-003` 与 `dwt_order_margin_attribution`。
2. 明确 `ORDER-AGENT-003` 只消费毛利归因页面上下文和证据状态。
3. 固定 Agent 输入、输出、禁止结论、Grey/Amber/Green/Red 行为。
4. 继续保持 SQL 前置门禁，不创建正式 SQL。
