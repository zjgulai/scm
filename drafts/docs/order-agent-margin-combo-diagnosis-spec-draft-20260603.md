---
title: 专题②毛利归因与组合建议 Agent 规格草稿
doc_type: workflow
module: project-governance
topic: order-agent-margin-combo-diagnosis-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②毛利归因与组合建议 Agent 规格草稿

## 1. 任务定位

本文件执行 `ORDER-AGENT-003`，目标是固定“毛利归因与组合建议 Agent”的任务规格，支撑专题② `ORDER-T3`：订单类型与订单价结构 -> 毛利额归因。

当前 Agent 只消费 `dwt_order_margin_attribution`、`ORDER-BI-003` 页面上下文、ORDER 指标字典、专题04四因素样例方法和专题05组合分析样例方法，不接真实生产 SQL，不输出 Grey 状态下的毛利责任句、促销因果、活动 ROI、组合上线动作、商品动作或管理层强结论。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| Agent ID | `ORDER-AGENT-003` |
| Agent 名称 | 毛利归因与组合建议 Agent |
| 主输入 | `dwt_order_margin_attribution` |
| 页面入口 | `ORDER-BI-003` 订单价结构与毛利归因 |
| 指标范围 | `ORDER-MARGIN-*`、`ORDER-COMBO-*` |
| 参考输入 | 专题04四因素方法、专题05组合分析方法、`dwt_order_cost_quality` 成本解释、`dwt_return_attribution` 部分退线索 |
| 服务对象 | 订单运营、商品运营、成本分析、产品运营、订单 Agent Owner |
| Agent 目标 | 输出毛利结构变化、四因素贡献候选、SPU/品类候选、促销/活动结构候选、组合候选和下一步确认项 |
| 当前状态 | `Grey`，因为真实订单行毛利、促销/组合标记、活动维度、基期口径、Owner 和样本 DQ 尚未确认 |
| SQL 状态 | 不创建 SQL；`ORDER-DQ-001` 通过后再进入 `ORDER-SQL-003` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| 四专题治理计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定 `ORDER-AGENT-003` 工作包 | 草稿计划 |
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定 Agent 触发条件、输入、输出和护栏 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-MARGIN-*`、`ORDER-COMBO-*` 指标公式和证据状态 | 草稿指标字典 |
| 毛利归因宽表规格 | `drafts/analysis/order-topic-margin-attribution-wide-table-spec-draft-20260603.md` | 固定 `dwt_order_margin_attribution` 字段、DQ、跨专题边界 | 草稿数据规格 |
| 毛利归因页面 PRD | `drafts/docs/order-bi-margin-attribution-prd-draft-20260603.md` | 固定页面入口、四因素、组合候选和 Agent 护栏 | 草稿 PRD |
| Phase2 毛利输出 | `main_project_lute/phase2_outputs/topic2/topic2_margin_attribution.csv` | 提供订单类型、渠道、品类毛利 mock 字段样例 | mock 产物 |
| 专题04脚本 | `main_project_lute/data_example/scripts/core/run_专题04_四因素归因.py` | 提供 `客品数 × 品单价 × 订单数 × 前台毛利率` 四因素方法 | 样例方法 |
| 专题04公式说明 | `main_project_lute/data_example/专题产物/专题04/文档/专题四_Sheet4_聚合公式说明.md` | 提供客品数、品单价、毛利率贡献口径 | 样例方法 |
| 专题05脚本 | `main_project_lute/data_example/scripts/core/run_专题05_购物篮关联分析.py` | 提供支持度、置信度、提升度和组合标记参考 | 样例方法 |

## 4. Agent 边界

| 边界 | Agent 负责 | Agent 不负责 |
|---|---|---|
| 毛利结构 | 输出毛利额、毛利率、订单均价、品单价、客品数和订单数变化候选 | 财务总账、税费、完整会计利润 |
| 四因素归因 | 输出客品数、品单价、订单数、前台毛利率的结构贡献候选 | 在基期未签收时输出贡献额强结论 |
| SPU / 品类 | 输出 SPU、SKU、品类毛利异常候选和样本范围 | 商品下架、改款、定价动作 |
| 促销结构 | 标记促销订单、促销行和毛利结构候选 | 证明促销活动 ROI 或广告归因销售额 |
| 活动维度 | 使用 `campaign_id`、`campaign_type` 作为结构维度 | 替代专题④营销 ROI、ROAS、曝光归因 |
| 组合线索 | 输出正向组合、互斥组合、高毛利组合和部分退组合候选 | 直接上线推荐规则、套装策略或组合实验结论 |
| 成本解释 | 使用前后台成本字段解释毛利结构候选 | 输出 SCM 成本专题结论或仓网动作 |
| 退款连接 | 使用部分退和退款原因作为组合风险线索 | 输出退款根因、VOC 原话或用户声音结论 |

## 5. 触发条件

| trigger_id | 触发条件 | 必需字段 | 允许状态 |
|---|---|---|---|
| `ORDER-A3-TRG-001` | 毛利额或毛利率进入 Amber / Red | `gross_margin_amt_line`、`gmv_line`、`margin_quality_status` | Amber / Green |
| `ORDER-A3-TRG-002` | 四因素任一因素贡献异常 | `analysis_period`、`baseline_period`、四因素聚合字段 | Amber / Green |
| `ORDER-A3-TRG-003` | 订单类型毛利结构异常 | `order_type`、`gmv_line`、`gross_margin_amt_line` | Amber / Green |
| `ORDER-A3-TRG-004` | SPU / 品类毛利率或毛利额异常 | `spu_id`、`category_l3`、`gross_margin_pct_line` | Amber / Green |
| `ORDER-A3-TRG-005` | 促销订单或促销行毛利结构异常 | `is_promo_order`、`is_promo_line`、毛利字段 | Amber / Green |
| `ORDER-A3-TRG-006` | 活动维度毛利结构异常 | `campaign_id`、`campaign_type`、毛利字段 | Amber / Green |
| `ORDER-A3-TRG-007` | 组合订单、提升度或互斥组合候选异常 | `is_bundle_line`、`order_id`、`spu_id`、`sku_id`、组合指标 | Amber / Green |
| `ORDER-A3-TRG-008` | 部分退组合风险需要联动 | `is_bundle_line`、`order_id`、`sku_id`、`dwt_return_attribution` 线索 | Amber / Green |
| `ORDER-A3-TRG-009` | 订单行毛利、活动标记、促销/组合标记 DQ 失败 | `margin_gap_flags`、`dq_run_id`、`data_quality_status` | Grey / Amber / Red |
| `ORDER-A3-TRG-010` | 用户在 `ORDER-BI-003` 选定范围后手动触发 | 当前筛选器、四因素快照、DQ 状态 | Grey / Amber / Green / Red |

Grey 状态下，触发 Agent 只允许返回字段缺口、基期缺口、组合定义缺口和取数确认项。Red 状态下，Agent 只允许返回阻断原因和修复前置条件。

## 6. 输入契约

### 6.1 必需上下文

| 输入 | 字段 | 用途 |
|---|---|---|
| 筛选范围 | `analysis_period`、`baseline_period`、`dt_month`、`country_code`、`channel_id`、`shop_id`、`order_type`、`campaign_id`、`spu_id`、`sku_id`、`category_l3` | 定义诊断范围 |
| 订单行事实 | `order_id`、`line_item_id`、`gmv_line`、`item_qty_line`、`gross_margin_amt_line` | 计算毛利和品单价 |
| 订单级字段 | `order_gmv_total`、`order_gross_margin_amt_total`、`order_item_qty_total`、`order_line_count` | 订单均价、订单数和去重校验 |
| 订单结构 | `order_type`、`is_promo_order`、`is_promo_line`、`is_bundle_order`、`is_bundle_line` | 订单类型、促销和组合结构分析 |
| 活动字段 | `campaign_id`、`campaign_type` | 活动结构维度 |
| 商品字段 | `spu_id`、`sku_id`、`category_l2`、`category_l3`、`variant_color`、`variant_size` | SPU / SKU 下钻和部分退线索 |
| 四因素字段 | 客品数、品单价、订单数、前台毛利率、贡献额、贡献占比 | 结构贡献候选 |
| 治理字段 | `data_quality_status`、`margin_quality_status`、`margin_gap_flags`、`dq_run_id`、`margin_allocation_rule_id` | 控制输出等级 |
| 证据引用 | 页面 ID、指标 code、宽表字段、样本范围 | 支撑可追溯输出 |

### 6.2 可选上下文

| 输入 | 字段 | 用途 | 护栏 |
|---|---|---|---|
| `dwt_order_cost_quality` | `cost_front_total`、`cost_back_total`、成本率 | 成本解释辅助 | 不输出 SCM 成本结论 |
| `dwt_return_attribution` | `is_partial_return`、`return_reason_code`、`sku_id`、`spu_id` | 部分退组合风险线索 | 不输出退款根因 |
| 组合分析结果表 | 支持度、置信度、提升度、正向/互斥标记 | 组合候选排序 | 不上线推荐规则 |
| MKT 活动维度 | 活动名称、活动类型、活动周期 | 活动结构解释 | 不输出 ROI、ROAS 或因果 |
| VOC 线索 | 高 VOC SPU、体验线索 | 商品风险参考 | 不输出 VOC 标签或原话 |

## 7. 标准输出字段

| 字段 | 类型 | 必填 | 含义 |
|---|---|---:|---|
| `agent_task_id` | string | 是 | 固定为 `ORDER-AGENT-003` |
| `run_mode` | string | 是 | `gap_only` / `sample_diagnosis` / `production_diagnosis` / `blocked` |
| `evidence_status` | string | 是 | `Grey` / `Amber` / `Green` / `Red` |
| `scope` | object | 是 | 当前筛选范围 |
| `trigger_id` | string | 是 | 命中的触发条件 |
| `metric_codes` | list | 是 | 使用的 `ORDER-MARGIN-*`、`ORDER-COMBO-*` 指标 |
| `primary_metric` | string | 否 | 当前主异常指标 |
| `current_value` | decimal | 否 | 当前指标值 |
| `baseline_value` | decimal | 否 | 基线、同期或阈值 |
| `delta_value` | decimal | 否 | 偏差值 |
| `factor_candidates` | list | 否 | 四因素贡献候选 |
| `spu_candidates` | list | 否 | SPU / SKU / 品类候选 |
| `promo_campaign_candidates` | list | 否 | 促销或活动结构候选 |
| `combo_candidates` | list | 否 | 正向、互斥、高毛利、部分退组合候选 |
| `driver_breakdown` | list | 否 | 因素、维度和指标贡献明细 |
| `data_gaps` | list | 是 | 字段缺口、DQ 失败、口径未确认 |
| `blocked_reasons` | list | 否 | Red 或 Grey 下的阻断原因 |
| `next_confirmation_items` | list | 是 | 下一步需要业务或数据确认的问题 |
| `handoff_targets` | list | 否 | 需要转入 MKT / ORDER-BI-001 / ORDER-BI-004 / SOURCE / DQ 的范围 |
| `confidence_level` | string | 是 | `none` / `low` / `medium` / `high` |
| `allowed_summary` | string | 是 | 当前状态下允许展示的摘要文本 |
| `forbidden_summary` | string | 是 | 当前状态下禁止展示的结论类型 |
| `evidence_refs` | list | 是 | 指标、字段、页面、宽表或样本引用 |

## 8. 输出模式

| 模式 | 进入条件 | 允许输出 | 禁止输出 |
|---|---|---|---|
| `gap_only` | `evidence_status = Grey` | 字段缺口、基期缺口、毛利分摊缺口、活动/组合定义缺口、不可用指标 | 毛利责任、组合上线、促销因果、ROI |
| `blocked` | `evidence_status = Red` | 阻断原因、失败检查、修复前置条件 | 看板结论、Agent 诊断、SQL |
| `sample_diagnosis` | `evidence_status = Amber` | 样本异常、待验证结构候选、口径差异、DQ 提醒 | 强结论、生产动作、管理层摘要 |
| `production_diagnosis` | `evidence_status = Green` | 指标解释、四因素候选、SPU 候选、组合候选、handoff 候选 | 无证据泛化、自动定价、自动推荐上线 |

## 9. 推理链

| 步骤 | 动作 | 输出 | 门禁 |
|---:|---|---|---|
| 1 | 读取页面筛选范围和触发条件 | `scope`、`trigger_id` | 无筛选范围时只返回请求补全 |
| 2 | 校验 `data_quality_status` 和 `margin_quality_status` | `run_mode` | Grey / Red 先阻断因果和动作结论 |
| 3 | 校验 P0 字段、订单行主键、订单 join 和行级 GMV 对账 | `data_gaps` | 缺 P0 字段不进入诊断 |
| 4 | 校验订单行毛利来源或分摊规则 | `blocked_reasons`、`margin_gap_flags` | 分摊规则缺失不输出行级毛利结论 |
| 5 | 汇总 `ORDER-MARGIN-*` 指标 | `metric_codes`、`current_value` | 基期未确认不输出贡献额 |
| 6 | 计算或读取四因素候选 | `factor_candidates` | 只输出结构贡献候选 |
| 7 | 下钻订单类型、SPU、品类和价格带 | `spu_candidates`、`driver_breakdown` | 样本不足时只输出待验证范围 |
| 8 | 检查促销、活动和订单类型结构 | `promo_campaign_candidates` | 不输出营销 ROI |
| 9 | 检查组合指标和部分退线索 | `combo_candidates`、`handoff_targets` | 不上线推荐规则 |
| 10 | 生成允许摘要和禁止摘要 | `allowed_summary`、`forbidden_summary` | 摘要必须带证据状态 |

## 10. 诊断候选规则

| 候选 | 字段 | 输出文本边界 | 交接目标 |
|---|---|---|---|
| 客品数贡献 | `item_qty_line`、`order_id`、四因素字段 | 客品数结构贡献候选 | 商品/订单结构深挖 |
| 品单价贡献 | `gmv_line`、`item_qty_line`、`unit_price` | 品单价结构贡献候选 | 商品定价待确认，不自动改价 |
| 订单数贡献 | `order_id`、`order_type`、`channel_id` | 订单量结构贡献候选 | 订单运营，不输出增长因果 |
| 前台毛利率贡献 | `gross_margin_amt_line`、`gmv_line`、`cost_front_total` | 毛利率结构贡献候选 | `ORDER-BI-001` 成本解释 |
| SPU / 品类候选 | `spu_id`、`category_l3`、`gross_margin_pct_line` | 商品毛利候选 | 不输出商品动作 |
| 促销结构候选 | `is_promo_order`、`is_promo_line`、毛利字段 | 促销结构候选 | MKT / `ORDER-BI-003`，不输出 ROI |
| 活动结构候选 | `campaign_id`、`campaign_type`、毛利字段 | 活动结构候选 | MKT 专题，不输出 ROAS |
| 正向组合候选 | `ORDER-COMBO-004` 或 `lift > 1` | 组合候选 | 不上线推荐规则 |
| 互斥组合候选 | `ORDER-COMBO-005` 或 `lift < 1` | 互斥候选 | 不下架组合 |
| 部分退组合风险 | `is_bundle_line` + `dwt_return_attribution.is_partial_return` | 组合风险候选 | `ORDER-BI-004`，不输出退款根因 |

结构候选不是因果结论。只有真实源表、样本 DQ、基期、活动/组合口径、Owner 和实验或营销归因均为 Green 时，才允许进入更强的策略讨论；当前 Agent 仍不得直接输出组合上线、促销增减或商品动作。

## 11. 状态行为

| 状态 | Agent 行为 | 示例允许句 | 示例禁止句 |
|---|---|---|---|
| Grey | 只输出字段缺口、基期缺口和组合定义确认项 | “当前只能确认需要订单行毛利、基期和组合标记真实样本。” | “促销导致毛利下降。” |
| Amber | 输出样本异常和待验证结构候选 | “样本范围内品单价贡献候选偏高，需确认基期口径。” | “应立即调整定价。” |
| Green | 输出指标解释、四因素候选和下钻范围 | “在已签收样本中，前台毛利率是主要结构候选。” | “没有实验也证明组合能提升毛利。” |
| Red | 输出阻断原因和修复前置条件 | “订单行毛利 DQ 失败，毛利归因不可用于诊断。” | “继续生成管理层摘要。” |

## 12. Handoff 规则

| 目标 | 触发 | 传递字段 | 边界 |
|---|---|---|---|
| MKT 专题 | 促销、活动或 `campaign_id` 需要 ROI 深挖 | `campaign_id`、`campaign_type`、`gmv_line`、`gross_margin_amt_line` | 不输出 ROI / ROAS |
| `ORDER-BI-001` | 前台或后台成本解释毛利结构 | `cost_front_total`、`cost_back_total`、订单类型、渠道 | 不输出成本根因 |
| `ORDER-BI-004` | 组合候选与部分退或退款原因相关 | `order_id`、`sku_id`、`spu_id`、`is_bundle_line` | 不输出退款根因 |
| VOC / XL3 | 商品结构候选需要用户声音补证 | `spu_id`、`sku_id`、候选范围 | 不输出 VOC 原文和标签 |
| `ORDER-SOURCE-001` | 源表、订单行毛利、组合定义、活动维表不明确 | 真实源表确认清单 | 不进入 SQL |
| `ORDER-DQ-001` | 字段存在但质量未知 | P0 DQ 检查项和样本需求 | P0 未过不进入 SQL |

## 13. 失败与阻断

| blocker_id | 阻断条件 | Agent 输出 |
|---|---|---|
| `ORDER-A3-BLOCK-001` | 缺 `order_id`、`line_item_id`、`gmv_line`、`item_qty_line`、`spu_id` 或 `sku_id` | P0 字段缺口 |
| `ORDER-A3-BLOCK-002` | `(order_id, line_item_id)` 不唯一且无业务解释 | 订单行主键阻断 |
| `ORDER-A3-BLOCK-003` | 订单行无法匹配订单主表 | join 阻断 |
| `ORDER-A3-BLOCK-004` | 行级 GMV 汇总与订单级 GMV 差异不可解释 | 对账阻断 |
| `ORDER-A3-BLOCK-005` | 缺 `gross_margin_amt_line` 且无 `margin_allocation_rule_id` | 毛利分摊阻断 |
| `ORDER-A3-BLOCK-006` | 基期或分析期未确认却请求四因素贡献额 | 基期阻断 |
| `ORDER-A3-BLOCK-007` | 促销、活动或组合定义缺失却请求因果结论 | 结构定义阻断 |
| `ORDER-A3-BLOCK-008` | 把 `campaign_id` 当作 ROI 证据 | MKT 边界阻断 |
| `ORDER-A3-BLOCK-009` | 把组合候选当作推荐上线动作 | 组合动作阻断 |
| `ORDER-A3-BLOCK-010` | Grey 状态请求根因、Owner 或管理层动作 | 证据等级阻断 |

## 14. 验收标准

| 编号 | 标准 | 通过条件 |
|---|---|---|
| `ORDER-AGENT-003-AC-001` | 输入契约明确 | 主输入、页面入口、指标范围、样例方法和跨专题参考均清楚 |
| `ORDER-AGENT-003-AC-002` | 触发条件明确 | 毛利、四因素、订单类型、SPU、促销、活动、组合和 DQ 触发均覆盖 |
| `ORDER-AGENT-003-AC-003` | 输出字段明确 | 标准输出字段可被页面、日志和后续 Agent 消费 |
| `ORDER-AGENT-003-AC-004` | 推理链明确 | Agent 从证据状态、DQ、指标、四因素、下钻到摘要的顺序清楚 |
| `ORDER-AGENT-003-AC-005` | 因果边界明确 | 活动、促销、组合候选不被写成 ROI、因果或上线动作 |
| `ORDER-AGENT-003-AC-006` | 状态行为明确 | Grey / Amber / Green / Red 输出差异清楚 |
| `ORDER-AGENT-003-AC-007` | Handoff 明确 | 能转入 MKT、`ORDER-BI-001`、`ORDER-BI-004`、VOC / XL3、SOURCE、DQ |
| `ORDER-AGENT-003-AC-008` | 阻断条件明确 | P0 字段、主键、join、对账、毛利分摊、基期、结构定义和证据等级均有阻断 |
| `ORDER-AGENT-003-AC-009` | 不创建 SQL | 文档只定义 Agent 规格，不生成 `sql/` 资产 |

## 15. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 订单行主键 | `(order_id, line_item_id)` | 源系统是否稳定提供 `line_item_id` |
| 订单行毛利 | 优先源字段 `gross_margin_amt_line` | 若没有，是否允许按 GMV 权重分摊订单级毛利 |
| 基期口径 | 参数化 `baseline_period` | 使用同比、环比、YTD，还是管理层固定基期 |
| 四因素输出 | 基期签收前只输出可用性和缺口 | 何时允许输出贡献额与贡献占比 |
| 组合定义 | 行级 `is_bundle_line` 派生订单级组合 | 组合是套装、同单搭配，还是营销 bundle |
| 组合指标来源 | 先作为样例方法和 P2 候选 | 是否有真实组合分析结果表 |
| 活动边界 | `campaign_id` 只作结构维度 | 哪些活动进入 ORDER，哪些转入 MKT |
| 部分退联动 | 只传候选到 `ORDER-BI-004` | 哪些退款证据允许反哺组合风险 |
| Agent 日志 | 标准输出字段落日志 | 后续是否需要结构化 JSON schema |
| 角色权限 | Grey 状态任何角色只能看缺口 | 哪些角色可在 Green 状态触发生产诊断 |

## 16. 下一步任务

下一步执行 `ORDER-AGENT-004`：退款归因与 VOC 输入 Agent 规格。

建议落盘文件：

`drafts/docs/order-agent-return-attribution-voc-input-spec-draft-20260603.md`

进入条件：

1. 复核 `ORDER-BI-004` 与 `dwt_return_attribution`。
2. 明确 `ORDER-AGENT-004` 只消费退款归因页面上下文、XL3 输入和证据状态。
3. 固定 Agent 输入、输出、禁止结论、Grey/Amber/Green/Red 行为。
4. 继续保持 SQL 前置门禁，不创建正式 SQL。
