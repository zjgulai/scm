---
title: 专题②订单价结构与毛利归因 PRD 草稿
doc_type: prd
module: project-governance
topic: order-bi-margin-attribution-prd
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②订单价结构与毛利归因 PRD 草稿

## 1. 任务定位

本文件执行 `ORDER-BI-003`，目标是固定“订单价结构与毛利归因”页面 PRD，支撑专题② `ORDER-T3`：订单类型与订单价结构 -> 毛利额归因。

当前页面只消费 `dwt_order_margin_attribution` 规格、ORDER 指标字典、Phase2 mock 输出和专题04四因素方法，不接真实生产 SQL，不输出促销、组合或活动因果结论，不替代专题④营销 ROI。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 页面 ID | `ORDER-BI-003` |
| 页面名称 | 订单价结构与毛利归因 |
| 主输入 | `dwt_order_margin_attribution` |
| 参考输入 | 专题04四因素方法、专题05组合分析方法、`dwt_order_cost_quality` 成本解释 |
| 服务对象 | 订单运营、商品运营、成本分析、产品运营、订单 Agent |
| 页面目标 | 判断订单类型、促销、组合、品单价、客品数、SPU 和活动维度如何影响毛利额与毛利率 |
| 当前状态 | `Grey`，因为真实订单行毛利、促销/组合标记、活动维度、基期口径和样本 DQ 尚未确认 |
| SQL 状态 | 不创建 SQL；`ORDER-DQ-001` 通过后再进入 `ORDER-SQL-003` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| 四专题治理计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定 `ORDER-BI-003` 页面任务 | 草稿计划 |
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定页面核心问题、输入和组件 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-MARGIN-*` 与 `ORDER-COMBO-*` 指标公式 | 草稿指标字典 |
| 毛利归因宽表规格 | `drafts/analysis/order-topic-margin-attribution-wide-table-spec-draft-20260603.md` | 固定 `dwt_order_margin_attribution` 字段、DQ 和边界 | 草稿数据规格 |
| Phase2 毛利输出 | `main_project_lute/phase2_outputs/topic2/topic2_margin_attribution.csv` | 提供订单类型×平台、品类×平台聚合样例 | mock 产物 |
| 专题04公式说明 | `main_project_lute/data_example/专题产物/专题04/文档/专题四_Sheet4_聚合公式说明.md` | 提供客品数、毛利率和 SPU 贡献公式 | 样例方法 |
| 专题04脚本 | `main_project_lute/data_example/scripts/core/run_专题04_四因素归因.py` | 提供 `客品数 × 品单价 × 订单数 × 前台毛利率` 四因素方法 | 样例方法 |
| 专题05脚本 | `main_project_lute/data_example/scripts/core/run_专题05_购物篮关联分析.py` | 提供组合分析方法参考 | 样例方法 |

## 4. 页面边界

| 边界 | 页面负责 | 页面不负责 |
|---|---|---|
| 订单价结构 | 订单类型、品单价、客品数、订单数、价格带 | 定价策略自动发布 |
| 毛利归因 | 毛利额、毛利率、SPU/品类、四因素贡献 | 财务总账、税费、完整会计利润 |
| 促销结构 | 促销订单、促销行、促销前后毛利结构 | 证明促销活动 ROI 或广告归因销售额 |
| 组合线索 | 组合订单、同单 SPU/SKU、组合候选 | 推荐规则上线、组合实验结论 |
| 活动维度 | `campaign_id` 和 `campaign_type` 作为结构维度 | 专题④营销 ROI、ROAS、曝光归因 |
| 成本解释 | 前后台成本字段作为毛利解释辅助 | SCM 成本专题或仓网动作 |
| 退款连接 | 部分退和 SKU 退货线索作为组合风险参考 | 退款根因和 VOC 结论 |
| Agent 入口 | 向 `ORDER-AGENT-003` 传递筛选范围和证据状态 | 让 Agent 在 Grey 状态输出因果或动作 |

## 5. 用户与使用场景

| 用户 | 核心问题 | 页面应给出的结果 |
|---|---|---|
| 订单运营 | 哪些订单类型拉动或拖累毛利 | 订单类型矩阵、毛利率、GMV、订单数 |
| 商品运营 | 哪些 SPU/品类贡献或拖累毛利 | SPU/品类毛利排行、结构变化 |
| 成本分析 | 毛利变化是否受前台成本或后台成本影响 | 成本解释入口和成本缺口提示 |
| 产品运营 | 组合订单是否值得进一步验证 | 组合候选清单和证据等级 |
| 订单 Agent Owner | 哪些范围可进入毛利归因诊断 | 筛选上下文、四因素快照、DQ 状态 |

## 6. 页面信息架构

| 区块 | 组件 | 目的 | 状态规则 |
|---|---|---|---|
| A. 状态栏 | 数据状态、样本范围、基期口径、SQL 状态 | 先告诉用户当前证据等级 | `Grey` 时固定提示“仅规格 / mock，不输出因果结论” |
| B. 全局筛选 | 时间、国家、渠道、店铺、订单类型、活动、SPU、品类、促销、组合 | 控制所有组件范围 | 未确认字段显示为不可用 |
| C. 毛利 KPI | 毛利额、毛利率、订单数、订单均价、品单价、客品数 | 判断价格和毛利基本盘 | 基期未确认时不展示贡献结论 |
| D. 订单类型矩阵 | 订单类型×渠道 / 国家 | 找订单类型结构差异 | 不证明订单类型导致毛利变化 |
| E. 四因素瀑布 | 客品数、品单价、订单数、前台毛利率 | 展示毛利额变化的结构贡献 | 仅在基期签收后输出贡献额 |
| F. SPU / 品类下钻 | SPU、SKU、品类排行和箱体 | 找商品结构线索 | 不替代商品主数据治理 |
| G. 促销与组合视图 | 促销订单、组合订单、组合候选 | 找结构风险和候选策略 | 不输出营销 ROI 或推荐上线结论 |
| H. 活动维度视图 | `campaign_id`、`campaign_type` | 为 MKT 专题提供上游订单结构 | 不输出 ROAS |
| I. 成本解释面板 | 前台成本、后台成本、成本缺口 | 解释毛利变化可能与成本有关 | 不改写 `ORDER-BI-001` |
| J. 部分退组合线索 | SKU/SPU 与部分退、退款原因连接 | 给 `ORDER-BI-004` 作为输入 | 不输出退款根因 |
| K. DQ 缺口面板 | 订单行毛利、活动标记、促销/组合标记、主键缺口 | 让治理问题可见 | `Grey` 状态的主输出之一 |
| L. Agent 入口 | 选定范围后触发 `ORDER-AGENT-003` | 输出归因诊断请求 | Grey 状态只允许输出缺口和待确认问题 |

## 7. 全局筛选器

| 筛选器 | 字段 | 必填 | 说明 |
|---|---|---:|---|
| 时间 | `order_date`、`dt_month`、`analysis_period`、`baseline_period` | 是 | 四因素归因必须明确分析期和基期 |
| 国家 | `country_code` | 是 | 默认全部 |
| 渠道 | `channel_id` | 是 | 默认全部 |
| 店铺 | `shop_id` | 否 | 支持店铺下钻 |
| 订单类型 | `order_type`、`order_type_name` | 是 | 标准、促销、组合、会员、B2B 等 |
| 活动 | `campaign_id`、`campaign_type` | 否 | 只作结构维度 |
| SPU / SKU | `spu_id`、`sku_id` | 是 | 订单行分析核心维度 |
| 品类 | `category_l2`、`category_l3` | 否 | 商品结构下钻 |
| 价格带 | `price_band` | 否 | 价格结构分析 |
| 促销标记 | `is_promo_order`、`is_promo_line` | 否 | 订单级和行级并存 |
| 组合标记 | `is_bundle_order`、`is_bundle_line` | 否 | 订单级由行级派生 |
| 数据状态 | `data_quality_status`、`margin_quality_status` | 是 | `Grey` / `Amber` / `Green` / `Red` |

## 8. 指标与卡片

| 卡片 | 指标 | 公式 | 来源 |
|---|---|---|---|
| 毛利额 | `ORDER-MARGIN-001` | `sum(gross_margin_amt_line)` | `gross_margin_amt_line` |
| 毛利率 | `ORDER-MARGIN-002` | `sum(gross_margin_amt_line) / sum(gmv_line)` | `gross_margin_amt_line`、`gmv_line` |
| 订单均价 | `ORDER-MARGIN-003` | `sum(distinct order_gmv_total by order_id) / count(distinct order_id)` | `order_gmv_total`、`order_id` |
| 品单价 | `ORDER-MARGIN-004` | `sum(gmv_line) / sum(item_qty_line)` | `gmv_line`、`item_qty_line` |
| 订单类型销售占比 | `ORDER-MARGIN-005` | `sum(gmv_line by order_type) / sum(gmv_line)` | `order_type`、`gmv_line` |
| 促销订单占比 | `ORDER-MARGIN-006` | `count(distinct promo order_id) / count(distinct order_id)` | `is_promo_order`、`order_id` |
| 组合订单占比 | `ORDER-MARGIN-007` | `count(distinct bundle order_id) / count(distinct order_id)` | `is_bundle_order`、`order_id` |
| SPU 毛利额 | `ORDER-MARGIN-008` | `sum(gross_margin_amt_line by spu_id)` | `spu_id`、`gross_margin_amt_line` |
| SPU 毛利率 | `ORDER-MARGIN-009` | `sum(gross_margin_amt_line by spu_id) / sum(gmv_line by spu_id)` | `spu_id`、`gmv_line` |
| 客品数贡献额 | `ORDER-MARGIN-010` | mart 层四因素计算 | 四因素基期字段 |
| 品单价贡献额 | `ORDER-MARGIN-011` | mart 层四因素计算 | 四因素基期字段 |
| 订单数贡献额 | `ORDER-MARGIN-012` | mart 层四因素计算 | 四因素基期字段 |
| 前台毛利率贡献额 | `ORDER-MARGIN-013` | mart 层四因素计算 | 四因素基期字段 |
| 归因贡献占比 | `ORDER-MARGIN-014` | `factor_contribution_amt / total_margin_delta_amt` | 四因素结果 |

Grey 状态下，卡片只展示“可计算 / 不可计算 / 缺口原因”。没有真实基期、订单行毛利和活动/组合口径签收时，不展示贡献额或动作建议。

## 9. 图表与表格规格

| 模块 | 图表 / 表格 | 维度 | 指标 | 交互 |
|---|---|---|---|---|
| 毛利总览趋势 | 折线 + KPI 卡 | `dt_month` | 毛利额、毛利率、GMV、订单数 | 点击月份过滤全页 |
| 订单类型矩阵 | 矩阵 / 表格 | `order_type`、`channel_id` | GMV、订单数、毛利率、成本率 | 点击订单类型下钻 |
| 四因素瀑布 | 瀑布图 | 客品数、品单价、订单数、前台毛利率 | 贡献额、贡献占比 | 基期未确认时只展示结构 |
| SPU 毛利排行 | 排序表 | `spu_id`、`category_l3` | SPU 毛利额、毛利率、GMV | 点击 SPU 进入订单行样本 |
| SPU 毛利率箱体 | 箱线图 | `category_l3`、`spu_id` | `gross_margin_pct_line` | 找异常商品线索 |
| 价格带结构 | 条形图 / 热力图 | `price_band`、`category_l3` | 品单价、毛利率、销量 | 点击价格带过滤 |
| 促销结构视图 | 对比图 | `is_promo_order`、`is_promo_line` | GMV、毛利率、促销订单占比 | 不输出 ROI |
| 组合结构视图 | 组合候选表 | `spu_id`、`sku_id`、`is_bundle_line` | 组合订单占比、毛利率、退货线索 | 跳转 `ORDER-BI-004` |
| 活动维度视图 | 表格 | `campaign_id`、`campaign_type` | GMV、毛利率、订单数 | 跳转 MKT 专题待治理 |
| 成本解释面板 | 表格 / 条形图 | 前台成本、后台成本 | 成本率、成本缺口 | 跳转 `ORDER-BI-001` |
| DQ 缺口面板 | 表格 | check_id | 通过率、失败原因、阻断状态 | 跳转数据治理任务 |

## 10. 四因素归因逻辑

| 因素 | 聚合公式 | 页面展示 | 护栏 |
|---|---|---|---|
| 客品数 `C` | `sum(item_qty_line) / count(distinct order_id)` | 客品数变化、贡献额、贡献占比 | 基期未确认不算贡献额 |
| 品单价 `P` | `sum(gmv_line) / sum(item_qty_line)` | 品单价变化、贡献额、贡献占比 | 与 `asp` 展示名兼容 |
| 订单数 `N` | `count(distinct order_id)` | 订单数变化、贡献额、贡献占比 | 订单行表中必须去重 |
| 前台毛利率 `G` | `sum(gross_margin_amt_line) / sum(gmv_line)` | 毛利率变化、贡献额、贡献占比 | 行级毛利分摊未签收时不输出强结论 |

毛利额关系：`margin_amt = C * P * N * G`。

贡献占比：`factor_contribution_amt / nullif(total_margin_delta_amt, 0)`。

四因素结果建议在 mart / BI 层按筛选参数计算，不固化在 DWT 表内。页面必须展示分析期、基期、筛选范围和证据状态。

## 11. 组合候选逻辑

| 候选类型 | 来源 | 页面输出 | 禁止事项 |
|---|---|---|---|
| 正向组合 | `ORDER-COMBO-004` 或提升度大于 1 | 组合候选、覆盖订单、毛利率 | 不直接上线推荐规则 |
| 互斥组合 | `ORDER-COMBO-005` 或提升度小于 1 | 互斥候选、风险提示 | 不直接下架组合 |
| 部分退组合风险 | `dwt_return_attribution` 中部分退 + 组合订单 | 需要 T4 / VOC 验证的候选 | 不把部分退等同组合问题 |
| 高毛利组合候选 | 组合订单毛利率高于同类 | 待验证候选 | 不证明组合能提升毛利 |

组合指标当前保持 P2。真实订单行、组合定义、退款证据和运营实验未确认前，页面只能输出候选清单。

## 12. 状态与颜色规则

| 状态 | 判定 | 页面行为 | 禁止行为 |
|---|---|---|---|
| Grey | 只有规格、mock 或样例，无真实源表和样本 | 展示字段缺口、组件设计、mock 示例 | 因果结论、组合上线动作、营销 ROI、SQL |
| Amber | 有真实样本，P0 DQ 通过但毛利、活动或组合口径未完全签收 | 展示待验证异常、样本趋势、DQ 提醒 | 管理层强结论 |
| Green | 源表、样本、Owner、权限、DQ、基期和活动/组合口径均通过 | 展示看板、触发 Agent、进入 SQL 前置 | 无证据泛化 |
| Red | P0 DQ 失败且无业务解释 | 阻断看板数据展示，只显示缺口 | Agent 诊断、SQL、动作建议 |

页面顶部必须始终展示 `data_quality_status` 和 `margin_quality_status`。当状态不是 `Green` 时，所有导出、Agent 触发和管理层摘要都要带证据等级。

## 13. Agent 入口

| 入口 | 输入 | 输出 | 护栏 |
|---|---|---|---|
| 毛利归因诊断 | 当前筛选范围、四因素聚合、DQ 状态 | 结构贡献、字段缺口、待确认问题 | Grey 只输出缺口 |
| SPU 下钻诊断 | SPU、品类、毛利率、GMV、订单行样本 | SPU 贡献和异常候选 | 不输出商品动作 |
| 促销结构诊断 | 促销标记、毛利率、订单类型 | 促销结构候选 | 不输出 ROI 结论 |
| 组合候选诊断 | 组合标记、提升度、毛利率、部分退线索 | 组合候选与验证清单 | 不上线推荐规则 |
| 数据治理诊断 | DQ 检查失败项、字段缺口 | 源表确认清单、Owner 待办 | 不绕过 DQ 门禁 |

`ORDER-AGENT-003` 的默认输出必须包含证据状态、使用字段、不可用字段、样本范围、基期口径和下一步确认项。没有真实样本和基期签收时，不允许输出毛利归因责任句。

## 14. 数据与刷新规则

| 项 | 规则 |
|---|---|
| 数据来源 | `dwt_order_margin_attribution` |
| 当前可用数据 | Phase2 mock `topic2_margin_attribution.csv` 仅作页面样例 |
| 刷新频率 | 真实源表确认前不定义正式频率 |
| 分区 | `order_date` |
| 月度聚合 | `dt_month` |
| 基期 | 未确认前不展示贡献额 |
| 订单行毛利 | 源字段优先，分摊字段需规则 ID |
| `asp` 展示 | 指标名用“品单价”，可兼容 `asp` |
| 导出 | Grey 状态只允许导出字段缺口和 mock 示例，不导出业务结论 |
| SQL | `ORDER-DQ-001` 通过前不创建正式 SQL |

## 15. 验收标准

| 编号 | 标准 | 通过条件 |
|---|---|---|
| `ORDER-BI-003-AC-001` | 页面目标明确 | 能回答订单类型、SPU、品单价、客品数和毛利结构 |
| `ORDER-BI-003-AC-002` | 输入边界明确 | 只以 `dwt_order_margin_attribution` 为主输入，MKT / SCM / VOC 只作参考 |
| `ORDER-BI-003-AC-003` | 指标口径明确 | KPI 均能映射到 `ORDER-MARGIN-*`、`ORDER-COMBO-*` 或宽表派生字段 |
| `ORDER-BI-003-AC-004` | 四因素逻辑明确 | 客品数、品单价、订单数、前台毛利率的公式和护栏清楚 |
| `ORDER-BI-003-AC-005` | 组合候选边界明确 | 候选清单不等于动作或因果结论 |
| `ORDER-BI-003-AC-006` | DQ 护栏明确 | Grey / Amber / Green / Red 行为不同 |
| `ORDER-BI-003-AC-007` | Agent 护栏明确 | Grey 状态只输出缺口，不输出因果和动作 |
| `ORDER-BI-003-AC-008` | 不创建 SQL | 文档只定义 PRD，不生成 `sql/` 资产 |

## 16. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 订单行主键 | `(order_id, line_item_id)` | 源系统是否稳定提供 `line_item_id` |
| 订单行毛利 | 优先源字段 `gross_margin_amt_line` | 若没有，是否允许按 GMV 权重分摊订单级毛利 |
| 基期口径 | 参数化 `baseline_period` | 使用同比、环比、YTD，还是管理层固定基期 |
| 品单价命名 | 展示“品单价”，兼容 `asp` | BI 是否继续保留 `asp` 字段名 |
| 促销标记 | 行级 + 订单级并存 | 两者冲突时谁优先 |
| 组合定义 | 行级派生订单级 | 组合是 SKU 套装、同单搭配，还是营销 bundle |
| 活动边界 | `campaign_id` 只作结构维度 | 哪些活动进入 ORDER，哪些转入 MKT |
| Agent 触发 | 只允许带证据状态触发 | 哪些角色能触发 `ORDER-AGENT-003` |

## 17. 下一步任务

下一步执行 `ORDER-BI-004`：退款归因与售后闭环 PRD。

建议落盘文件：

`drafts/docs/order-bi-return-attribution-prd-draft-20260603.md`

进入条件：

1. 复核 `dwt_return_attribution` 宽表规格。
2. 明确退款原因、部分退、SKU/SPU、VOC 输入和 XL3 边界。
3. 固定页面模块、筛选器、退款原因 Pareto、部分退矩阵、Agent 入口。
4. 继续保持 `Grey` 状态，不创建正式 SQL。
