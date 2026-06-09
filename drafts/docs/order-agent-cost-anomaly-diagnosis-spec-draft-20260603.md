---
title: 专题②订单成本异常诊断 Agent 规格草稿
doc_type: workflow
module: project-governance
topic: order-agent-cost-anomaly-diagnosis-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②订单成本异常诊断 Agent 规格草稿

## 1. 任务定位

本文件执行 `ORDER-AGENT-001`，目标是固定“订单成本异常诊断 Agent”的任务规格，支撑专题② `ORDER-T1`：订单量区域结构 -> 后台成本 / 仓网。

当前 Agent 只消费 `dwt_order_cost_quality`、`ORDER-BI-001` 页面上下文、ORDER 指标字典和 SCM 成本参考，不接真实生产 SQL，不输出 Grey 状态下的成本根因、Owner 责任、仓网动作、调拨动作或管理层强结论。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| Agent ID | `ORDER-AGENT-001` |
| Agent 名称 | 订单成本异常诊断 Agent |
| 主输入 | `dwt_order_cost_quality` |
| 页面入口 | `ORDER-BI-001` 订单经营结果与成本质量总览 |
| 指标范围 | `ORDER-COST-*`，辅助引用 `ORDER-MARGIN-*`、`ORDER-RETURN-*` |
| 参考输入 | SCM 成本科目、SCM Grey/Amber/Green 门禁、Phase2 mock 成本输出 |
| 服务对象 | 订单运营、成本分析、仓网协同、数据 Owner、订单 Agent Owner |
| Agent 目标 | 输出成本异常范围、驱动候选、证据状态、字段缺口和下一步确认项 |
| 当前状态 | `Grey`，因为真实源表、样本 DQ、Owner、权限、成本阈值和口径未签收 |
| SQL 状态 | 不创建 SQL；`ORDER-DQ-001` 通过后再进入 `ORDER-SQL-001` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| 四专题治理计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定 `ORDER-AGENT-001` 工作包 | 草稿计划 |
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定 Agent 触发条件、输入、输出和护栏 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-COST-*` 指标公式和证据状态 | 草稿指标字典 |
| 成本质量宽表规格 | `drafts/analysis/order-topic-cost-quality-wide-table-spec-draft-20260603.md` | 固定 `dwt_order_cost_quality` 字段、DQ、SCM 边界 | 草稿数据规格 |
| 成本总览页面 PRD | `drafts/docs/order-bi-cost-quality-overview-prd-draft-20260603.md` | 固定页面入口、筛选器、图表和 Agent 护栏 | 草稿 PRD |
| Phase2 成本输出 | `main_project_lute/phase2_outputs/topic2/topic2_cost_attribution.csv` | 提供国家×渠道成本率 mock 字段样例 | mock 产物 |
| SCM 产品化蓝图 | `scm/供应链成本指标全链路优化/01_专题包_产品化拆分与数据任务蓝图.md` | 提供 Agent 任务规格、输出字段和 Grey 护栏参考 | SCM 参考 |
| SCM 成本规格 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供供应链成本节点和费用科目参考 | SCM 参考 |

## 4. Agent 边界

| 边界 | Agent 负责 | Agent 不负责 |
|---|---|---|
| 异常识别 | 标记前台成本率、后台成本率、总成本率、单均/件均成本异常范围 | 证明真实业务根因 |
| 驱动候选 | 按成本项、国家、渠道、仓库、订单类型输出候选驱动 | 输出确定性责任部门或 Owner |
| 数据治理 | 输出字段缺口、DQ 失败项、不可用指标、待确认口径 | 绕过 DQ 直接进入 SQL |
| SCM 参考 | 使用 SCM 成本科目解释后台成本拆分方向 | 用 SCM 宽表替代订单事实 |
| 仓网线索 | 识别需要 SCM 深挖的仓库、目的仓或渠道范围 | 触发仓网重规划、自动调拨、承运商切换 |
| 前台成本线索 | 标记促销、广告、退款成本率异常候选 | 输出营销 ROI、活动归因或投放动作 |
| 退款成本线索 | 校验 `cost_refund` 与退款事实需要对账 | 把 `fact_return.return_amt` 当 `cost_refund` |
| 管理摘要 | Green 状态下可生成带证据的摘要候选 | Grey/Amber 状态下输出管理层强结论 |

## 5. 触发条件

| trigger_id | 触发条件 | 必需字段 | 允许状态 |
|---|---|---|---|
| `ORDER-A1-TRG-001` | 前台成本率进入 Amber / Red | `cost_front_total_pct`、`gmv`、`data_quality_status` | Amber / Green |
| `ORDER-A1-TRG-002` | 后台成本率进入 Amber / Red | `cost_back_total_pct`、`gmv`、`data_quality_status` | Amber / Green |
| `ORDER-A1-TRG-003` | 总成本率异常 | `total_cost_pct`、`cost_front_total`、`cost_back_total` | Amber / Green |
| `ORDER-A1-TRG-004` | 成本增速高于 GMV 或订单数增速 | `dt_month`、`gmv`、`order_id`、成本字段、基期字段 | Green |
| `ORDER-A1-TRG-005` | 国家×渠道热力中出现高成本组合 | `country_code`、`channel_id`、成本率 | Amber / Green |
| `ORDER-A1-TRG-006` | 仓库、目的仓或仓库类型成本异常 | `warehouse_id` / `dest_warehouse`、成本率、订单数 | Amber / Green |
| `ORDER-A1-TRG-007` | 成本字段或成本合计 DQ 失败 | `cost_gap_flags`、`dq_run_id`、`data_quality_status` | Grey / Amber / Red |
| `ORDER-A1-TRG-008` | 用户在 `ORDER-BI-001` 选定范围后手动触发 | 当前筛选器、KPI 快照、DQ 状态 | Grey / Amber / Green / Red |

Grey 状态下，触发 Agent 只允许返回规格缺口和取数确认项。Red 状态下，Agent 只允许返回阻断原因和修复前置条件。

## 6. 输入契约

### 6.1 必需上下文

| 输入 | 字段 | 用途 |
|---|---|---|
| 筛选范围 | `dt_month`、`country_code`、`channel_id`、`shop_id`、`warehouse_id`、`dest_warehouse`、`order_type` | 定义诊断范围 |
| 经营指标 | `order_id`、`gmv`、`item_qty`、`sku_qty`、`gross_margin_amt` | 判断经营规模和质量 |
| 前台成本 | `cost_promo_discount`、`cost_ad_spend`、`cost_refund`、`cost_front_total` | 拆分前台成本候选 |
| 后台成本 | `cost_production`、`cost_freight`、`cost_warehouse`、`cost_commission`、`cost_other`、`cost_back_total` | 拆分后台成本候选 |
| 派生字段 | `total_cost_amt`、`total_cost_pct`、`back_cost_per_item`、`front_cost_per_item` | 输出异常范围 |
| 治理字段 | `data_quality_status`、`cost_quality_status`、`cost_gap_flags`、`dq_run_id` | 控制输出等级 |
| 证据引用 | 页面 ID、指标 code、宽表字段、样本范围 | 支撑可追溯输出 |

### 6.2 可选上下文

| 输入 | 字段 | 用途 | 护栏 |
|---|---|---|---|
| `dim_warehouse` | `warehouse_type`、`is_fba` | 仓网线索分组 | 不输出仓网动作 |
| `dim_order_type` | `order_type_name`、`is_promo_order`、`is_b2b_order` | 订单类型解释 | 不替代毛利归因 |
| `fact_return` 校验 | `return_amt`、`return_id`、`order_id` | 校验退款成本口径 | 不替代 `cost_refund` |
| SCM 成本参考 | 采购、头程、仓储、尾程、逆向等节点 | 后台成本解释方向 | 不替代 ORDER 字段 |
| `ORDER-BI-003` 上下文 | 订单类型、毛利率、促销/组合标记 | 毛利联动线索 | 不输出营销 ROI |
| `ORDER-BI-004` 上下文 | 退款原因、退款事实、部分退 | 退款成本联动线索 | 不输出退款根因 |

## 7. 标准输出字段

| 字段 | 类型 | 必填 | 含义 |
|---|---|---:|---|
| `agent_task_id` | string | 是 | 固定为 `ORDER-AGENT-001` |
| `run_mode` | string | 是 | `gap_only` / `sample_diagnosis` / `production_diagnosis` / `blocked` |
| `evidence_status` | string | 是 | `Grey` / `Amber` / `Green` / `Red` |
| `scope` | object | 是 | 当前筛选范围 |
| `trigger_id` | string | 是 | 命中的触发条件 |
| `metric_codes` | list | 是 | 使用的 `ORDER-COST-*` 指标 |
| `primary_metric` | string | 否 | 当前主异常指标 |
| `current_value` | decimal | 否 | 当前指标值 |
| `baseline_value` | decimal | 否 | 基线、同期或目标值 |
| `delta_value` | decimal | 否 | 偏差值 |
| `anomaly_level` | string | 是 | `none` / `watch` / `amber` / `red` / `blocked` |
| `first_driver_candidate` | string | 否 | 第一驱动候选 |
| `second_driver_candidate` | string | 否 | 第二驱动候选 |
| `driver_breakdown` | list | 否 | 成本项、维度和指标贡献明细 |
| `data_gaps` | list | 是 | 字段缺口、DQ 失败、口径未确认 |
| `blocked_reasons` | list | 否 | Red 或 Grey 下的阻断原因 |
| `next_confirmation_items` | list | 是 | 下一步需要业务或数据确认的问题 |
| `handoff_targets` | list | 否 | 需要转入 SCM / ORDER-BI-003 / ORDER-BI-004 / MKT 的范围 |
| `confidence_level` | string | 是 | `none` / `low` / `medium` / `high` |
| `allowed_summary` | string | 是 | 当前状态下允许展示的摘要文本 |
| `forbidden_summary` | string | 是 | 当前状态下禁止展示的结论类型 |
| `evidence_refs` | list | 是 | 指标、字段、页面、宽表或样本引用 |

## 8. 输出模式

| 模式 | 进入条件 | 允许输出 | 禁止输出 |
|---|---|---|---|
| `gap_only` | `evidence_status = Grey` | 字段缺口、取数清单、DQ 前置项、不可用指标 | 根因、Owner、动作、管理层结论 |
| `blocked` | `evidence_status = Red` | 阻断原因、失败检查、修复前置条件 | 看板结论、Agent 诊断、SQL |
| `sample_diagnosis` | `evidence_status = Amber` | 样本异常、待验证假设、口径差异 | 强结论、生产动作、管理层摘要 |
| `production_diagnosis` | `evidence_status = Green` | 指标解释、驱动候选、下钻范围、动作候选 | 无证据泛化、越界到 SCM / MKT / VOC 结论 |

## 9. 推理链

| 步骤 | 动作 | 输出 | 门禁 |
|---:|---|---|---|
| 1 | 读取页面筛选范围和触发条件 | `scope`、`trigger_id` | 无筛选范围时只返回请求补全 |
| 2 | 校验 `data_quality_status` 和 `cost_quality_status` | `run_mode` | Grey / Red 先阻断业务结论 |
| 3 | 校验 P0 字段存在性和类型 | `data_gaps` | 缺 P0 字段不进入诊断 |
| 4 | 汇总 `ORDER-COST-*` 指标 | `metric_codes`、`current_value` | `gmv = 0` 或分母缺失不强算 |
| 5 | 对比基线、阈值或页面传入状态 | `anomaly_level`、`delta_value` | 基线未确认则不输出趋势结论 |
| 6 | 拆分前台成本项 | 前台驱动候选 | 促销、广告、退款只作结构候选 |
| 7 | 拆分后台成本项 | 后台驱动候选 | SCM 只作参考，不替代 ORDER 字段 |
| 8 | 下钻国家、渠道、仓库、订单类型 | 异常范围候选 | 样本不足时只输出待验证范围 |
| 9 | 关联页面跳转目标 | `handoff_targets` | 不跨专题输出终局结论 |
| 10 | 生成允许摘要和禁止摘要 | `allowed_summary`、`forbidden_summary` | 摘要必须带证据状态 |

## 10. 驱动候选规则

| 候选 | 字段 | 输出文本边界 | 交接目标 |
|---|---|---|---|
| 促销折扣 | `cost_promo_discount_pct` | 促销成本率结构候选 | `ORDER-BI-003` / MKT 待治理 |
| 广告花费 | `cost_ad_spend_pct` | 线上推广费率结构候选 | MKT 专题，不输出 ROI |
| 退款成本 | `cost_refund_pct` | 退款成本分摊异常候选 | `ORDER-BI-004`，不替代退款事实 |
| 生产成本 | `cost_production_pct` | 生产成本结构候选 | SCM 成本科目深挖 |
| 头程费率 | `cost_freight_pct` | 头程或货运成本候选 | SCM 头程深挖 |
| 仓储配送 | `cost_warehouse_pct` | 仓配成本候选 | SCM 履约 / 仓网深挖 |
| 平台佣金 | `cost_commission_pct` | 平台佣金结构候选 | 渠道 / 平台口径确认 |
| 其他成本 | `cost_other_pct` | 未解释成本候选 | 成本分摊规则确认 |
| 件均后台成本 | `back_cost_per_item` | 订单结构或仓配成本候选 | ORDER-T1 / SCM |
| 毛利率辅助 | `gross_margin_pct` | 成本拖累毛利的辅助线索 | `ORDER-BI-003` |

驱动候选不是根因。只有真实源表、样本 DQ、阈值、Owner 和口径均为 Green 时，才允许把候选升级为“根因候选”。

## 11. 状态行为

| 状态 | Agent 行为 | 示例允许句 | 示例禁止句 |
|---|---|---|---|
| Grey | 只输出字段缺口和取数确认项 | “当前只能确认需要 `cost_back_total`、`gmv` 和 `warehouse_id` 的真实样本。” | “后台成本高是某仓库导致。” |
| Amber | 输出样本异常和待验证假设 | “样本范围内后台成本率偏高，需确认成本分摊规则。” | “应立即调整仓网。” |
| Green | 输出指标解释、驱动候选和可分派事项 | “在已签收样本中，仓配成本率是第一驱动候选。” | “没有证据也泛化到所有国家渠道。” |
| Red | 输出阻断原因和修复前置条件 | “P0 DQ 失败，成本合计不可用于诊断。” | “继续生成管理层摘要。” |

## 12. Handoff 规则

| 目标 | 触发 | 传递字段 | 边界 |
|---|---|---|---|
| `ORDER-BI-003` | 毛利率、订单类型、促销或组合结构需要深挖 | `order_type`、`campaign_id`、`gross_margin_pct`、前台成本字段 | 不输出营销 ROI |
| `ORDER-BI-004` | `cost_refund_pct` 异常或退款成本需校验 | `order_id`、`cost_refund`、`country_code`、`channel_id` | 不替代退款事实 |
| SCM 成本分枝 | 后台成本、头程、仓配、生产成本需要深挖 | `warehouse_id`、`dest_warehouse`、后台成本字段 | 不替代 ORDER 订单事实 |
| `ORDER-SOURCE-001` | 源表、字段、Owner、权限不明确 | 真实源表确认清单 | 不进入 SQL |
| `ORDER-DQ-001` | 字段存在但质量未知 | P0 DQ 检查项和样本需求 | P0 未过不进入 SQL |

## 13. 失败与阻断

| blocker_id | 阻断条件 | Agent 输出 |
|---|---|---|
| `ORDER-A1-BLOCK-001` | 缺 `order_id`、`gmv`、`cost_front_total` 或 `cost_back_total` | P0 字段缺口 |
| `ORDER-A1-BLOCK-002` | `order_id` 不唯一且无业务解释 | 主键阻断 |
| `ORDER-A1-BLOCK-003` | 成本金额无法数值化 | 类型阻断 |
| `ORDER-A1-BLOCK-004` | `cost_front_total` 或 `cost_back_total` 与分项重算不一致 | 成本合计阻断 |
| `ORDER-A1-BLOCK-005` | `gmv = 0` 范围被强行计算成本率 | 分母阻断 |
| `ORDER-A1-BLOCK-006` | 用 SCM 宽表替代 ORDER 订单事实 | 边界阻断 |
| `ORDER-A1-BLOCK-007` | 用 `fact_return.return_amt` 替代 `cost_refund` | 口径阻断 |
| `ORDER-A1-BLOCK-008` | Grey 状态请求根因、Owner 或动作建议 | 证据等级阻断 |

## 14. 验收标准

| 编号 | 标准 | 通过条件 |
|---|---|---|
| `ORDER-AGENT-001-AC-001` | 输入契约明确 | 主输入、页面入口、指标范围、SCM 参考均清楚 |
| `ORDER-AGENT-001-AC-002` | 触发条件明确 | 前台、后台、总成本、国家渠道、仓库和 DQ 触发均覆盖 |
| `ORDER-AGENT-001-AC-003` | 输出字段明确 | 标准输出字段可被页面、日志和后续 Agent 消费 |
| `ORDER-AGENT-001-AC-004` | 推理链明确 | Agent 从证据状态、DQ、指标、拆分、下钻到摘要的顺序清楚 |
| `ORDER-AGENT-001-AC-005` | 驱动候选边界明确 | 候选不被写成根因，前台成本不被写成营销 ROI |
| `ORDER-AGENT-001-AC-006` | 状态行为明确 | Grey / Amber / Green / Red 输出差异清楚 |
| `ORDER-AGENT-001-AC-007` | Handoff 明确 | 能转入 `ORDER-BI-003`、`ORDER-BI-004`、SCM、SOURCE、DQ |
| `ORDER-AGENT-001-AC-008` | 阻断条件明确 | P0 字段、主键、类型、合计、分母、边界和证据等级均有阻断 |
| `ORDER-AGENT-001-AC-009` | 不创建 SQL | 文档只定义 Agent 规格，不生成 `sql/` 资产 |

## 15. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 成本阈值 | 先不预设 Amber / Red 数值 | 谁签收前台、后台、总成本率阈值 |
| 基线口径 | 先由页面传入，不在 Agent 内固定 | 同比、环比、YTD、MAT 还是管理层目标 |
| `fact_order_cost` | 兼容独立表或合入 `fact_order` | 真实数仓是否有成本项明细表 |
| 仓库字段 | `warehouse_id` 与 `dest_warehouse` 并存 | 二者是否同义，哪个适合成本分析 |
| SCM handoff | 只传候选范围和字段，不传动作 | SCM 分枝是否已有可接收的动作台账 |
| `cost_refund` 对账 | 只列 DQ 检查，不预设阈值 | 与 `fact_return.return_amt` 的差异阈值谁签收 |
| Agent 日志 | 标准输出字段落日志 | 后续是否需要结构化 JSON schema |
| 角色权限 | Grey 状态任何角色只能看缺口 | 哪些角色可在 Green 状态触发生产诊断 |

## 16. 下一步任务

下一步执行 `ORDER-AGENT-002`：订单履约耗时诊断 Agent 规格。

建议落盘文件：

`drafts/docs/order-agent-fulfillment-diagnosis-spec-draft-20260603.md`

进入条件：

1. 复核 `ORDER-BI-002` 与 `dwt_order_fulfillment_diagnosis`。
2. 明确 `ORDER-AGENT-002` 只消费履约节点页面上下文和证据状态。
3. 固定 Agent 输入、输出、禁止结论、Grey/Amber/Green/Red 行为。
4. 继续保持 SQL 前置门禁，不创建正式 SQL。
