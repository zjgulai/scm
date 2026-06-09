---
title: 专题②退款归因与 VOC 输入 Agent 规格草稿
doc_type: workflow
module: project-governance
topic: order-agent-return-attribution-voc-input-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②退款归因与 VOC 输入 Agent 规格草稿

## 1. 任务定位

本文件执行 `ORDER-AGENT-004`，目标是固定“退款归因与 VOC 输入 Agent”的任务规格，支撑专题② `ORDER-T4`：退款订单归因与用户声音输入。

当前 Agent 只消费 `dwt_return_attribution`、`ORDER-BI-004` 页面上下文、ORDER 指标字典、`refund_theme_input_for_voc`、XL3 样例脚本和 SCM 逆向履约参考，不接真实生产 SQL，不输出 Grey 状态下的退款责任、客服责任、VOC 原话、VOC 最终标签、用户情绪、商品责任、供应链责任或管理层强结论。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| Agent ID | `ORDER-AGENT-004` |
| Agent 名称 | 退款归因与 VOC 输入 Agent |
| 主输入 | `dwt_return_attribution` |
| 页面入口 | `ORDER-BI-004` 退款归因与 VOC 输入页 |
| 指标范围 | `ORDER-RETURN-*`、`ORDER-XL3-*` |
| 参考输入 | `refund_theme_input_for_voc`、XL3 样例脚本、`ORDER-BI-003` 组合线索、`ORDER-BI-001` 成本线索、SCM 逆向履约参考 |
| 服务对象 | 订单运营、客服协同、商品运营、供应链分析、VOC Agent Owner、订单 Agent Owner |
| Agent 目标 | 输出退款异常范围、原因结构候选、部分退与组合候选、SKU/SPU 候选、XL3 输入候选、VOC handoff 状态和下一步确认项 |
| 当前状态 | `Grey`，因为真实退款源表、原因码维表、部分退定义、VOC 工单映射、Owner 和样本 DQ 尚未确认 |
| SQL 状态 | 不创建 SQL；`ORDER-DQ-001` 通过后再进入 `ORDER-SQL-004` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| 四专题治理计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定 `ORDER-AGENT-004` 工作包 | 草稿计划 |
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定 Agent 触发条件、输入、输出和护栏 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-RETURN-*`、`ORDER-XL3-*` 指标公式和证据状态 | 草稿指标字典 |
| 退款归因宽表规格 | `drafts/analysis/order-topic-return-attribution-wide-table-spec-draft-20260603.md` | 固定 `dwt_return_attribution` 字段、DQ、XL3 输入和跨专题边界 | 草稿数据规格 |
| 退款归因页面 PRD | `drafts/docs/order-bi-return-attribution-prd-draft-20260603.md` | 固定页面入口、筛选器、图表和 Agent 护栏 | 草稿 PRD |
| Phase2 退款归因输出 | `main_project_lute/phase2_outputs/topic2/topic2_refund_attribution.csv` | 提供国家、渠道、退款率和退款金额 mock 字段样例 | mock 产物 |
| Phase2 退款明细输出 | `main_project_lute/phase2_outputs/topic2/topic2_refund_attribution_detail.csv` | 提供退款原因、部分退和 SKU/SPU mock 字段样例 | mock 产物 |
| XL3 输入样例 | `ref/phase2_io/refund_theme_input_for_voc.csv` | 提供 `theme_suggested` 和 `refund_theme_input_for_voc` 样例 | mock 输入 |
| XL3 脚本 | `main_project_lute/data_example/scripts/experimental/run_phase2_crossline3_voc_agent.py` | 提供订单侧退款输入进入 VOC 侧样例的参考流程 | 样例方法 |
| SCM 数据底表 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供 `dwt_reverse_logistics` 和逆向履约参考 | SCM 参考 |

## 4. Agent 边界

| 边界 | Agent 负责 | Agent 不负责 |
|---|---|---|
| 退款事实 | 汇总退款金额、退款数量、退款订单、退款行和退款状态候选 | 财务总账、支付清算、退款到账责任 |
| 退款原因 | 输出 `return_reason_code`、`reason_category`、原因 Pareto 和原因结构候选 | 重构客服原因码体系或判定客服责任 |
| 部分退 | 输出 `is_partial_return`、`partial_return_type`、SKU/SPU 和组合候选 | 把部分退直接等同于组合问题 |
| 重复投诉 | 标记 `is_repeat_complaint` 和重复退款/投诉线索 | 输出客户画像、客服处理质量或投诉责任 |
| VOC 输入 | 生成或审查 `refund_theme_input_for_voc`、`theme_suggested`、`theme_suggested_rule_id`、`xl3_input_ready` | 输出 VOC 原话、用户声音、情绪、最终标签或客服结论 |
| XL3 连接 | 将订单侧候选交给 `XL3-IO-001` / `XL3-AGENT-001` | 替代 VOC Agent 做双侧证据结论 |
| 组合线索 | 使用 `ORDER-COMBO-*`、`ORDER-BI-003` 和部分退字段识别组合风险候选 | 输出组合上线、下架、推荐规则或商品动作 |
| 成本线索 | 使用 `ORDER-BI-001` 成本上下文解释退款对成本/毛利的参考影响 | 输出 SCM 成本专题结论或仓网动作 |
| SCM 逆向 | 使用 `dwt_reverse_logistics` 作为返仓、逆向履约和尾程线索 | 用 SCM 逆向聚合表替代退款事实和退款原因 |

## 5. 触发条件

| trigger_id | 触发条件 | 必需字段 | 允许状态 |
|---|---|---|---|
| `ORDER-A4-TRG-001` | 退款率、退款金额或退款订单数进入 Amber / Red | `return_amt`、`return_qty`、`order_id`、`return_id` | Amber / Green |
| `ORDER-A4-TRG-002` | `reason_category` 或 `return_reason_code` 结构异常 | `return_reason_code`、`reason_category`、退款指标 | Amber / Green |
| `ORDER-A4-TRG-003` | 部分退率或部分退金额异常 | `is_partial_return`、`partial_return_type`、`return_amt` | Amber / Green |
| `ORDER-A4-TRG-004` | SKU/SPU 或品类退款异常 | `sku_id`、`spu_id`、`category_l3`、退款指标 | Amber / Green |
| `ORDER-A4-TRG-005` | 组合订单或组合行出现部分退风险 | `is_partial_return`、`order_id`、`sku_id`、`spu_id`、`ORDER-COMBO-*` | Amber / Green |
| `ORDER-A4-TRG-006` | 重复投诉或重复退款线索异常 | `is_repeat_complaint`、`customer_id`、`return_id` | Amber / Green |
| `ORDER-A4-TRG-007` | `theme_suggested` 覆盖率或映射率异常 | `theme_suggested`、`theme_suggested_rule_id`、`xl3_input_ready` | Amber / Green |
| `ORDER-A4-TRG-008` | `voc_ticket_id` / `has_voc` 与退款行 join 出现缺口或放大 | `voc_ticket_id`、`has_voc`、`return_id`、`order_id` | Grey / Amber / Red |
| `ORDER-A4-TRG-009` | 逆向履约线索与退款异常重叠 | `return_id`、`dwt_reverse_logistics` 参考字段 | Amber / Green |
| `ORDER-A4-TRG-010` | 退款源表、原因码、部分退、VOC 映射或 DQ 失败 | `return_gap_flags`、`dq_run_id`、`data_quality_status` | Grey / Amber / Red |
| `ORDER-A4-TRG-011` | 用户在 `ORDER-BI-004` 选定范围后手动触发 | 当前筛选器、退款 KPI、DQ 状态 | Grey / Amber / Green / Red |

Grey 状态下，触发 Agent 只允许返回字段缺口、原因码缺口、部分退定义缺口、VOC 映射缺口和 XL3 输入确认项。Red 状态下，Agent 只允许返回阻断原因和修复前置条件。

## 6. 输入契约

### 6.1 必需上下文

| 输入 | 字段 | 用途 |
|---|---|---|
| 筛选范围 | `return_dt`、`dt_month`、`country_code`、`channel_id`、`shop_id`、`order_type`、`sku_id`、`spu_id`、`category_l3`、`return_reason_code`、`reason_category` | 定义诊断范围 |
| 退款事实 | `return_id`、`return_line_id`、`order_id`、`line_item_id`、`return_status`、`return_amt`、`return_qty` | 计算退款指标和主键校验 |
| 订单与商品 | `order_id`、`order_gmv_total`、`line_item_id`、`sku_id`、`spu_id`、`item_qty_line`、`is_bundle_line` | 关联订单结构、商品范围和组合线索 |
| 原因字段 | `return_reason_code`、`reason_category`、`reason_mapping_rule_id` | 原因结构、原因映射和 Pareto |
| 部分退字段 | `is_partial_return`、`partial_return_type`、`combo_return_candidate` | 识别部分退与组合候选 |
| 重复投诉字段 | `is_repeat_complaint`、`customer_id`、`complaint_count` | 识别重复投诉线索 |
| VOC / XL3 字段 | `voc_ticket_id`、`has_voc`、`theme_suggested`、`theme_suggested_rule_id`、`xl3_input_ready` | 控制 VOC handoff 和 XL3 输入状态 |
| 治理字段 | `data_quality_status`、`return_quality_status`、`return_gap_flags`、`dq_run_id` | 控制输出等级 |
| 证据引用 | 页面 ID、指标 code、宽表字段、样本范围、输入文件 | 支撑可追溯输出 |

### 6.2 可选上下文

| 输入 | 字段 | 用途 | 护栏 |
|---|---|---|---|
| `refund_theme_input_for_voc` | `order_id`、`return_id`、`sku_id`、`spu_id`、`country_code`、`channel_id`、`return_reason_code`、`is_partial_return`、`theme_suggested` | 生成或审查 XL3 输入行 | 不输出 VOC 结论 |
| VOC 工单明细 | `voc_ticket_id`、原始文本、客服标签、用户原话 | 仅用于 handoff 可用性判断 | Agent 不读取或展示原文，不生成最终标签 |
| `dwt_order_margin_attribution` | 毛利、订单类型、组合标记 | 判断退款对毛利和组合风险的参考影响 | 不输出毛利根因 |
| `dwt_order_cost_quality` | 成本率、前后台成本、履约成本线索 | 成本解释辅助 | 不输出 SCM 成本结论 |
| `dwt_reverse_logistics` | 返仓、逆向履约、退货物流状态 | 逆向履约联动 | 不替代退款事实和原因码 |
| `ORDER-BI-003` 上下文 | `ORDER-COMBO-*`、组合候选、互斥候选 | 部分退组合风险联动 | 不上线组合规则 |
| `ORDER-BI-001` 上下文 | 成本质量、履约成本、尾程成本 | 退款成本联动 | 不输出成本责任 |

## 7. 标准输出字段

| 字段 | 类型 | 必填 | 含义 |
|---|---|---:|---|
| `agent_task_id` | string | 是 | 固定为 `ORDER-AGENT-004` |
| `run_mode` | string | 是 | `gap_only` / `sample_diagnosis` / `production_diagnosis` / `blocked` |
| `evidence_status` | string | 是 | `Grey` / `Amber` / `Green` / `Red` |
| `scope` | object | 是 | 当前筛选范围 |
| `trigger_id` | string | 是 | 命中的触发条件 |
| `metric_codes` | list | 是 | 使用的 `ORDER-RETURN-*`、`ORDER-XL3-*` 指标 |
| `primary_metric` | string | 否 | 当前主异常指标 |
| `current_value` | decimal | 否 | 当前指标值 |
| `baseline_value` | decimal | 否 | 基线、同期或阈值 |
| `delta_value` | decimal | 否 | 偏差值 |
| `refund_reason_candidates` | list | 否 | 原因码、原因分类和 Pareto 候选 |
| `partial_return_candidates` | list | 否 | 部分退范围、类型和金额候选 |
| `sku_spu_candidates` | list | 否 | SKU、SPU、品类退款异常候选 |
| `combo_return_candidates` | list | 否 | 与 `ORDER-COMBO-*` 相关的部分退组合候选 |
| `xl3_input_rows` | integer | 否 | 可进入 `refund_theme_input_for_voc` 的订单侧行数 |
| `theme_suggested_candidates` | list | 否 | 订单侧建议主题和规则 ID 候选 |
| `voc_handoff_status` | string | 是 | `not_ready` / `input_ready` / `voc_evidence_required` / `handoff_done` |
| `data_gaps` | list | 是 | 字段缺口、DQ 失败、口径未确认 |
| `blocked_reasons` | list | 否 | Red 或 Grey 下的阻断原因 |
| `next_confirmation_items` | list | 是 | 下一步需要业务或数据确认的问题 |
| `handoff_targets` | list | 否 | 需要转入 XL3 / VOC / ORDER-BI-003 / ORDER-BI-001 / SCM / SOURCE / DQ 的范围 |
| `confidence_level` | string | 是 | `none` / `low` / `medium` / `high` |
| `allowed_summary` | string | 是 | 当前状态下允许展示的摘要文本 |
| `forbidden_summary` | string | 是 | 当前状态下禁止展示的结论类型 |
| `evidence_refs` | list | 是 | 指标、字段、页面、宽表、样本或输入文件引用 |

## 8. 输出模式

| 模式 | 进入条件 | 允许输出 | 禁止输出 |
|---|---|---|---|
| `gap_only` | `evidence_status = Grey` | 字段缺口、原因码缺口、部分退定义缺口、VOC 映射缺口、XL3 输入缺口 | 退款责任、VOC 结论、商品责任、客服责任、管理层摘要 |
| `blocked` | `evidence_status = Red` | 阻断原因、失败检查、修复前置条件 | 看板结论、Agent 诊断、SQL |
| `sample_diagnosis` | `evidence_status = Amber` | 样本异常、待验证原因候选、部分退候选、XL3 输入候选、DQ 提醒 | 强根因、生产动作、VOC 最终标签 |
| `production_diagnosis` | `evidence_status = Green` | 指标解释、原因结构候选、SKU/SPU 候选、handoff 候选、XL3 输入状态 | 无证据泛化、自动归责、替代 VOC Agent 输出用户声音 |

## 9. 推理链

| 步骤 | 动作 | 输出 | 门禁 |
|---:|---|---|---|
| 1 | 读取页面筛选范围和触发条件 | `scope`、`trigger_id` | 无筛选范围时只返回请求补全 |
| 2 | 校验 `data_quality_status` 和 `return_quality_status` | `run_mode` | Grey / Red 先阻断根因和动作结论 |
| 3 | 校验 P0 字段、退款行主键、订单 join 和退款金额/数量字段 | `data_gaps` | 缺 P0 字段不进入诊断 |
| 4 | 校验原因码映射、部分退定义、重复投诉标记和 VOC join | `blocked_reasons` | 原因码或 VOC join 不可靠时只输出缺口 |
| 5 | 汇总 `ORDER-RETURN-*` 指标 | `metric_codes`、`current_value` | 基线或阈值未确认不输出异常强结论 |
| 6 | 下钻国家、渠道、SKU、SPU、品类和原因分类 | `refund_reason_candidates`、`sku_spu_candidates` | 样本不足时只输出待验证范围 |
| 7 | 检查部分退和组合线索 | `partial_return_candidates`、`combo_return_candidates` | 不把部分退直接写成组合问题 |
| 8 | 生成或审查 `refund_theme_input_for_voc` | `xl3_input_rows`、`theme_suggested_candidates` | `theme_suggested` 只代表订单侧建议主题 |
| 9 | 判断 `voc_handoff_status` 和 XL3 / VOC 交接范围 | `handoff_targets` | 无 VOC 原始证据时不输出 VOC 结论 |
| 10 | 生成允许摘要和禁止摘要 | `allowed_summary`、`forbidden_summary` | 摘要必须带证据状态 |

## 10. 诊断候选规则

| 候选 | 字段 | 输出文本边界 | 交接目标 |
|---|---|---|---|
| 退款金额异常 | `return_amt`、`order_id`、`country_code`、`channel_id` | 退款金额范围候选 | `ORDER-BI-004`，不输出财务责任 |
| 退款率异常 | `return_id`、`order_id`、`return_qty` | 退款率候选 | 需真实分母和基期 |
| 原因结构异常 | `return_reason_code`、`reason_category` | 原因结构候选 | 不重构原因码体系 |
| 部分退异常 | `is_partial_return`、`partial_return_type` | 部分退候选 | 不直接等同组合问题 |
| SKU/SPU 退款异常 | `sku_id`、`spu_id`、`category_l3` | 商品范围候选 | 商品动作需后续确认 |
| 组合部分退风险 | `is_bundle_line`、`combo_return_candidate`、`ORDER-COMBO-*` | 组合风险候选 | `ORDER-BI-003`，不输出推荐规则 |
| 重复投诉线索 | `is_repeat_complaint`、`customer_id`、`complaint_count` | 重复投诉候选 | 不输出客服责任 |
| VOC handoff 缺口 | `voc_ticket_id`、`has_voc` | VOC 映射缺口 | VOC / XL3，不输出原话 |
| XL3 输入候选 | `theme_suggested`、`theme_suggested_rule_id`、`xl3_input_ready` | 订单侧建议主题候选 | `XL3-IO-001` / `XL3-AGENT-001` |
| 逆向履约线索 | `return_id` + `dwt_reverse_logistics` 参考字段 | 逆向履约深挖候选 | SCM，不输出仓配动作 |

结构候选不是因果结论。`theme_suggested` 只能表达订单侧建议主题，例如 `部分退组合问题_原因SIZE` 或 `整单退款_原因DAMAGED`。只有 VOC 原始文本、工单、用户声音、标签映射和 VOC Agent 输出均完成证据校验时，才允许在 VOC 分枝输出用户声音结论；本 Agent 始终不输出 VOC 原话、最终标签或客服责任。

## 11. XL3 / VOC 输入规则

| 规则 | 输入 | 输出 | 约束 |
|---|---|---|---|
| `ORDER-A4-XL3-001` | `is_partial_return = true` 且存在 `return_reason_code` | `theme_suggested = 部分退组合问题_原因{reason}` | 仅为订单侧建议主题 |
| `ORDER-A4-XL3-002` | `is_partial_return = false` 且存在 `return_reason_code` | `theme_suggested = 整单退款_原因{reason}` | 不代表 VOC 最终标签 |
| `ORDER-A4-XL3-003` | 缺 `return_reason_code` | `theme_suggested` 为空，进入 `data_gaps` | 不强行补原因 |
| `ORDER-A4-XL3-004` | `voc_ticket_id` 为空但订单退款字段完整 | 可进入 `refund_theme_input_for_voc` | 只能提示 VOC 证据待补 |
| `ORDER-A4-XL3-005` | `voc_ticket_id` 存在且 VOC join 不放大 | `voc_handoff_status = input_ready` | 仍不输出用户原话 |
| `ORDER-A4-XL3-006` | `theme_suggested` 可映射到 `dim_voc_tag` | 标记 `ORDER-XL3-003` 候选 | 最终标签由 VOC Agent 生成 |
| `ORDER-A4-XL3-007` | XL3 回传 VOC back-check | 标记 `ORDER-XL3-004` 候选 | 只接收 back-check 状态，不替代 VOC 解释 |

`refund_theme_input_for_voc` 的最小字段为 `order_id`、`return_id`、`sku_id`、`spu_id`、`country_code`、`channel_id`、`return_reason_code`、`is_partial_return`、`theme_suggested`。缺 `voc_ticket_id` 不阻断输入行生成，但会阻断 VOC 结论输出。

## 12. 状态行为

| 状态 | Agent 行为 | 示例允许句 | 示例禁止句 |
|---|---|---|---|
| Grey | 只输出字段缺口、原因码缺口、VOC 映射缺口和 XL3 输入确认项 | “当前只能确认需要退款行、原因码、部分退定义和 VOC 映射样本。” | “客服原因导致退款上升。” |
| Amber | 输出样本异常和待验证候选 | “样本范围内部分退原因候选偏高，需确认原因码映射和 VOC 原始证据。” | “用户明确抱怨组合设计。” |
| Green | 输出指标解释、退款原因候选、部分退候选和 handoff 范围 | “在已签收样本中，SIZE 原因下部分退是 XL3 输入候选。” | “直接判定商品设计问题。” |
| Red | 输出阻断原因和修复前置条件 | “退款原因码 DQ 失败，退款归因不可用于诊断。” | “继续生成 VOC 标签和管理层摘要。” |

## 13. Handoff 规则

| 目标 | 触发 | 传递字段 | 边界 |
|---|---|---|---|
| `XL3-IO-001` | `refund_theme_input_for_voc` 可生成或需审查 | `order_id`、`return_id`、`sku_id`、`spu_id`、`return_reason_code`、`is_partial_return`、`theme_suggested` | 不输出 VOC 结论 |
| `XL3-AGENT-001` / VOC Agent | `voc_handoff_status = input_ready` | `voc_ticket_id`、订单侧建议主题、退款范围 | VOC Agent 才能输出用户声音 |
| `ORDER-BI-003` | 部分退与组合线索重叠 | `order_id`、`sku_id`、`spu_id`、`is_partial_return`、`combo_return_candidate` | 不上线组合规则 |
| `ORDER-BI-001` | 退款对成本质量或履约成本有解释需求 | 退款范围、成本参考字段、国家渠道 | 不输出成本根因 |
| SCM 逆向履约 | 退款异常与返仓、逆向物流或退货履约重叠 | `return_id`、`country_code`、`channel_id`、逆向履约参考字段 | 不替代 SCM 主题表 |
| `ORDER-SOURCE-001` | 源表、原因码、部分退、VOC 映射、Owner、权限不明确 | 真实源表确认清单 | 不进入 SQL |
| `ORDER-DQ-001` | 字段存在但质量未知 | P0 DQ 检查项和样本需求 | P0 未过不进入 SQL |

## 14. 失败与阻断

| blocker_id | 阻断条件 | Agent 输出 |
|---|---|---|
| `ORDER-A4-BLOCK-001` | 缺 `return_id`、`return_line_id`、`order_id`、`return_dt`、`sku_id` 或 `spu_id` | P0 字段缺口 |
| `ORDER-A4-BLOCK-002` | `(return_id, return_line_id)` 不唯一且无业务解释 | 退款行主键阻断 |
| `ORDER-A4-BLOCK-003` | 退款行无法匹配订单或订单行 | join 阻断 |
| `ORDER-A4-BLOCK-004` | `return_amt` 或 `return_qty` 缺失、为负或与退款状态冲突 | 退款事实阻断 |
| `ORDER-A4-BLOCK-005` | `return_reason_code` 缺失或无法映射 `reason_category` | 原因码阻断 |
| `ORDER-A4-BLOCK-006` | `is_partial_return` 无定义或与退款数量、订单行数量冲突 | 部分退阻断 |
| `ORDER-A4-BLOCK-007` | VOC 工单 join 放大退款行 | VOC join 阻断 |
| `ORDER-A4-BLOCK-008` | `theme_suggested` 被当成 VOC 最终标签 | XL3 边界阻断 |
| `ORDER-A4-BLOCK-009` | 用 SCM 逆向履约聚合表替代退款原因 | SCM 边界阻断 |
| `ORDER-A4-BLOCK-010` | Grey 状态请求退款根因、Owner、VOC 原话或管理层动作 | 证据等级阻断 |

## 15. 验收标准

| 编号 | 标准 | 通过条件 |
|---|---|---|
| `ORDER-AGENT-004-AC-001` | 输入契约明确 | 主输入、页面入口、指标范围、XL3 输入、VOC handoff 和 SCM 参考均清楚 |
| `ORDER-AGENT-004-AC-002` | 触发条件明确 | 退款金额、退款率、原因结构、部分退、SKU/SPU、组合、重复投诉、VOC、SCM 和 DQ 触发均覆盖 |
| `ORDER-AGENT-004-AC-003` | 输出字段明确 | 标准输出字段可被页面、日志、XL3 和 VOC 分枝消费 |
| `ORDER-AGENT-004-AC-004` | 推理链明确 | Agent 从证据状态、DQ、退款指标、下钻、XL3 输入到摘要的顺序清楚 |
| `ORDER-AGENT-004-AC-005` | VOC 边界明确 | `theme_suggested` 不被写成 VOC 最终标签，不输出用户原话、情绪或客服责任 |
| `ORDER-AGENT-004-AC-006` | 部分退边界明确 | 部分退只作为组合风险候选，不被直接写成组合问题 |
| `ORDER-AGENT-004-AC-007` | 状态行为明确 | Grey / Amber / Green / Red 输出差异清楚 |
| `ORDER-AGENT-004-AC-008` | Handoff 明确 | 能转入 `XL3-IO-001`、`XL3-AGENT-001`、VOC、`ORDER-BI-003`、`ORDER-BI-001`、SCM、SOURCE、DQ |
| `ORDER-AGENT-004-AC-009` | 不创建 SQL | 文档只定义 Agent 规格，不生成 `sql/` 资产 |

## 16. 待确认决策

| 决策点 | 当前建议 | 未确认风险 |
|---|---|---|
| 退款主事实表 | 以退款行表为主，订单表和订单行表为 join 参考 | 若只有订单级退款，部分退和 SKU/SPU 归因会失真 |
| 原因码维表 | 必须确认 `return_reason_code -> reason_category` 映射 Owner | 无映射时只能输出原因码缺口 |
| 部分退定义 | 建议用订单行退款数量与订单行购买数量判断，并保留业务规则 ID | 定义不清会误判组合风险 |
| VOC 映射 | `voc_ticket_id` 可以为空，但 VOC 结论必须依赖 VOC 原始证据 | 缺 VOC 证据时不能输出用户声音 |
| `theme_suggested` | 只作为订单侧建议主题和 XL3 输入字段 | 若被当成最终标签，会污染 VOC 证据链 |
| SCM 逆向履约 | 只作为返仓和逆向履约参考 | 不能替代退款事实、原因码或客服证据 |

## 17. 下一步任务

下一步进入 `ORDER-SOURCE-001`：建立本地证据与真实源表确认矩阵。该任务需要把专题②所有已定义宽表、BI 页和 Agent 规格映射到源表、样本文件、DQ 前置、Owner、权限、证据等级和 SQL 放行条件。

建议草稿位置为 `drafts/analysis/order-topic-source-evidence-and-source-table-matrix-draft-20260603.md`。在该矩阵完成并确认前，继续保持 `ORDER-SQL-001` 至 `ORDER-SQL-004` 为阻断状态，不创建 SQL。
