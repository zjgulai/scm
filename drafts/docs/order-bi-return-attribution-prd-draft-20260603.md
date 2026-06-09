---
title: 专题②退款归因与售后闭环 PRD 草稿
doc_type: prd
module: project-governance
topic: order-bi-return-attribution-prd
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题②退款归因与售后闭环 PRD 草稿

## 1. 任务定位

本文件执行 `ORDER-BI-004`，目标是固定“退款归因与售后闭环”页面 PRD，支撑专题② `ORDER-T4`：退款多维归因 -> 订单和 VOC 穿透。

当前页面只消费 `dwt_return_attribution` 规格、ORDER 指标字典、Phase2 mock 输出和 `refund_theme_input_for_voc` 联调样例，不接真实生产 SQL，不输出退款根因定责，不输出 VOC 原始标签、用户原话或客服系统结论。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 页面 ID | `ORDER-BI-004` |
| 页面名称 | 退款归因与售后闭环 |
| 主输入 | `dwt_return_attribution` |
| 参考输入 | `refund_theme_input_for_voc`、SCM 逆向物流参考、订单毛利与组合线索 |
| 服务对象 | 订单运营、售后运营、商品运营、供应链逆向物流、VOC Agent、订单 Agent |
| 页面目标 | 判断退款来自哪些国家、渠道、SKU/SPU、退款原因和部分退结构，并产出交叉线3输入 |
| 当前状态 | `Grey`，因为真实退款单、退款行、原因编码、部分退规则、VOC 关联键、Owner 和样本 DQ 尚未确认 |
| SQL 状态 | 不创建 SQL；`ORDER-DQ-001` 通过后再进入 `ORDER-SQL-004` |

## 3. 证据链

| 来源 | 路径 | 用途 | 证据状态 |
|---|---|---|---|
| 四专题治理计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定 `ORDER-BI-004` 页面任务 | 草稿计划 |
| ORDER 蓝图 | `drafts/analysis/order-topic-productization-blueprint-draft-20260602.md` | 固定页面核心问题、输入和组件 | 草稿控制面板 |
| ORDER 指标字典 | `drafts/analysis/order-topic-metric-dictionary-draft-20260602.md` | 提供 `ORDER-RETURN-*`、`ORDER-XL3-*`、`ORDER-COMBO-*` 指标公式 | 草稿指标字典 |
| 退款归因宽表规格 | `drafts/analysis/order-topic-return-attribution-wide-table-spec-draft-20260603.md` | 固定 `dwt_return_attribution` 字段、DQ、XL3 输入和边界 | 草稿数据规格 |
| Phase2 退款汇总输出 | `main_project_lute/phase2_outputs/topic2/topic2_refund_attribution.csv` | 提供国家、渠道、原因和部分退聚合样例 | mock 产物 |
| Phase2 退款明细输出 | `main_project_lute/phase2_outputs/topic2/topic2_refund_attribution_detail.csv` | 提供退款行、订单、SKU/SPU 和原因字段样例 | mock 产物 |
| XL3 输入样例 | `ref/phase2_io/refund_theme_input_for_voc.csv` | 提供 `theme_suggested` 联调字段样例 | mock IO |
| XL3 脚本 | `main_project_lute/data_example/scripts/experimental/run_phase2_crossline3_voc_agent.py` | 提供订单侧退款输入到 VOC Agent 的消费方式 | mock 方法 |
| SCM 逆向物流规格 | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` | 提供退货、补发、返仓、质检、报废和责任归因参考 | SCM 参考 |

## 4. 页面边界

| 边界 | 页面负责 | 页面不负责 |
|---|---|---|
| 退款事实 | 退款金额、退款数量、退款订单数、退款行、退款状态 | 财务总账退款入账、会计利润确认 |
| 退款原因 | 原因编码、原因分类、原因 Pareto、原因金额占比 | 客服定责、原因码体系改造 |
| 部分退 | 部分退比例、部分退类型、部分退 SKU/SPU、部分退组合候选 | 把部分退直接等同组合设计问题 |
| 订单穿透 | 国家、渠道、订单类型、原订单、订单行、SKU/SPU | 完整毛利归因或营销 ROI |
| VOC 输入 | `refund_theme_input_for_voc`、`theme_suggested`、`xl3_input_ready` | VOC 原文、情绪、用户原话、最终标签结论 |
| SCM 引用 | 逆向物流成本、补发、返仓、质检和报废线索 | 用逆向物流成本替代退款原因 |
| 组合线索 | 组合订单中的部分退候选、SKU 同单关系 | 组合推荐上线、商品下架或详情页改版动作 |
| Agent 入口 | 向 `ORDER-AGENT-004` 传递筛选范围、退款结构和证据状态 | 让 Agent 在 Grey 状态输出业务根因或管理层动作 |

## 5. 用户与使用场景

| 用户 | 核心问题 | 页面应给出的结果 |
|---|---|---|
| 订单运营 | 哪些国家、渠道、订单类型退款率高 | 退款金额率、订单退款率、原因结构、影响范围 |
| 售后运营 | 退款集中在哪些原因和处理状态 | 原因 Pareto、重复投诉、VOC 关联率、售后闭环缺口 |
| 商品运营 | 哪些 SKU/SPU 存在退款和部分退线索 | SKU/SPU 退款排行、部分退矩阵、组合候选 |
| 供应链逆向物流 | 哪些退款可能进入返仓、补发、报废深挖 | 逆向物流参考入口，不输出 SCM 成本结论 |
| VOC Agent Owner | 哪些退款行可进入交叉线3 | `refund_theme_input_for_voc` 输入行、建议主题覆盖率、缺口 |
| 订单 Agent Owner | 哪些范围可进入退款归因诊断 | 筛选上下文、证据状态、字段缺口和待确认问题 |

## 6. 页面信息架构

| 区块 | 组件 | 目的 | 状态规则 |
|---|---|---|---|
| A. 状态栏 | 数据状态、样本范围、原因码覆盖、VOC 关联、SQL 状态 | 先告诉用户当前证据等级 | `Grey` 时固定提示“仅规格 / mock，不输出根因定责或 VOC 结论” |
| B. 全局筛选 | 时间、国家、渠道、店铺、订单类型、SKU/SPU、原因、部分退、VOC 状态 | 控制所有组件范围 | 未确认字段显示为不可用 |
| C. 退款 KPI | 退款金额、退款数量、退款订单数、订单退款率、退款金额率 | 判断退款基本盘 | 订单全集未确认时不展示生产口径退款率 |
| D. 退款原因 Pareto | 原因编码、原因分类、退款金额占比、退款订单数 | 找高影响原因结构 | 不输出责任部门 |
| E. 国家×渠道矩阵 | 国家、渠道、原因分类 | 定位退款高发范围 | 不输出渠道策略结论 |
| F. SKU/SPU 下钻 | SKU、SPU、品类、颜色、尺码 | 找商品退款线索 | 不替代商品主数据治理 |
| G. 部分退矩阵 | 部分退状态、部分退类型、原因、SKU/SPU | 找部分退结构和组合候选 | 不把部分退等同组合问题 |
| H. 组合候选面板 | 组合订单、部分退、同单 SKU/SPU | 给 `ORDER-BI-003` 和商品运营做验证输入 | 不上线组合推荐 |
| I. VOC / XL3 输入表 | `refund_theme_input_for_voc`、`theme_suggested`、`xl3_input_ready` | 生成 VOC Agent 消费输入 | 不输出 VOC 原始标签 |
| J. SCM 逆向参考 | 退货运费、补发、返仓、质检、报废字段缺口 | 给 SCM 分枝深挖入口 | 不替代退款事实 |
| K. DQ 缺口面板 | 主键、原因码、订单 join、SKU join、VOC join、XL3 规则 | 让治理问题可见 | `Grey` 状态的主输出之一 |
| L. Agent 入口 | 选定范围后触发 `ORDER-AGENT-004` | 输出退款归因请求 | Grey 状态只允许输出缺口和待确认问题 |

## 7. 全局筛选器

| 筛选器 | 字段 | 必填 | 说明 |
|---|---|---:|---|
| 时间 | `return_dt`、`dt_month`、`order_date` | 是 | 默认按退款日期分析；订单日期只作穿透 |
| 国家 | `country_code` | 是 | 默认全部 |
| 渠道 | `channel_id` | 是 | 默认全部 |
| 店铺 | `shop_id` | 否 | 支持店铺下钻 |
| 订单类型 | `order_type` | 否 | 只作结构维度 |
| 活动 | `campaign_id` | 否 | 只作订单结构维度，不输出营销 ROI |
| SKU / SPU | `sku_id`、`spu_id` | 是 | 退款行分析核心维度 |
| 品类 | `category_l2`、`category_l3` | 否 | 商品结构下钻 |
| 原因 | `return_reason_code`、`reason_category` | 是 | 退款原因 Pareto 核心维度 |
| 部分退 | `is_partial_return`、`partial_return_type` | 是 | 区分整单退、整行退、部分退 |
| 重复投诉 | `is_repeat_complaint` | 否 | 真实 VOC / 售后字段未确认前不可用 |
| VOC 状态 | `has_voc`、`voc_ticket_id`、`xl3_input_ready` | 是 | 区分可进入 XL3 与缺口 |
| 数据状态 | `data_quality_status`、`return_quality_status` | 是 | `Grey` / `Amber` / `Green` / `Red` |

## 8. 指标与卡片

| 卡片 | 指标 | 公式 | 来源 |
|---|---|---|---|
| 退款金额 | `ORDER-RETURN-001` | `sum(return_amt)` | `return_amt` |
| 退款数量 | `ORDER-RETURN-002` | `sum(return_qty)` | `return_qty` |
| 退款订单数 | `ORDER-RETURN-003` | `count(distinct order_id where return exists)` | `order_id` |
| 订单退款率 | `ORDER-RETURN-004` | `退款订单数 / count(distinct fact_order.order_id)` | `fact_return` + `fact_order` |
| 退款金额率 | `ORDER-RETURN-005` | `sum(return_amt) / sum(distinct order_gmv by order_id)` | `return_amt`、`order_gmv` |
| 退款原因金额占比 | `ORDER-RETURN-006` | `sum(return_amt by return_reason_code) / sum(return_amt)` | `return_reason_code`、`return_amt` |
| 部分退比例 | `ORDER-RETURN-007` | `count(distinct return_id where is_partial_return) / count(distinct return_id)` | `is_partial_return` |
| 重复投诉比例 | `ORDER-RETURN-008` | `count(distinct repeat complaint return_id) / count(distinct return_id)` | `is_repeat_complaint` |
| VOC 关联率 | `ORDER-RETURN-009` | `count(distinct return_id where voc_ticket_id is not null) / count(distinct return_id)` | `voc_ticket_id` |
| 部分退组合覆盖率 | `ORDER-RETURN-010` | `count(distinct partial return order_id with bundle) / count(distinct partial return order_id)` | `is_partial_return`、`is_bundle_line` |
| 退款原因分类占比 | `ORDER-RETURN-011` | `sum(return_amt by reason_category) / sum(return_amt)` | `reason_category` |
| XL3 输入行数 | `ORDER-XL3-001` | `count(rows where xl3_input_ready)` | `xl3_input_ready` |
| 建议主题覆盖率 | `ORDER-XL3-002` | `count(theme_suggested not null) / count(*)` | `theme_suggested` |

Grey 状态下，卡片只展示“可计算 / 不可计算 / 缺口原因”。没有真实订单全集、退款行、原因码、VOC 关联和 DQ 签收时，不展示生产退款率、业务根因或管理层动作。

## 9. 图表与表格规格

| 模块 | 图表 / 表格 | 维度 | 指标 | 交互 |
|---|---|---|---|---|
| 退款总览趋势 | 折线 + KPI 卡 | `dt_month` | 退款金额、退款订单数、退款金额率、订单退款率 | 点击月份过滤全页 |
| 退款原因 Pareto | 条形图 / Pareto | `return_reason_code`、`reason_category` | 退款金额、金额占比、退款订单数 | 点击原因下钻 |
| 国家×渠道退款矩阵 | 热力图 | `country_code`、`channel_id` | 退款金额率、退款订单数、主原因 | 点击单元格带入筛选 |
| SKU / SPU 退款排行 | 排序表 | `sku_id`、`spu_id`、`category_l3` | 退款金额、退款数量、原因结构 | 点击进入退款行样本 |
| SKU / SPU 原因箱体 | 箱线图 / 分布图 | `spu_id`、`reason_category` | 退款金额率、部分退比例 | 找商品异常线索 |
| 部分退矩阵 | 矩阵 | `partial_return_type`、`reason_category` | 部分退比例、退款金额、退款数量 | 点击进入组合候选 |
| 组合候选表 | 表格 | `is_bundle_line`、`sku_id`、`spu_id` | 部分退组合覆盖率、原因、退款金额 | 跳转 `ORDER-BI-003` |
| VOC / XL3 输入表 | 表格 | `return_id`、`order_id`、`theme_suggested` | XL3 输入行、建议主题覆盖率 | 导出给 VOC Agent |
| SCM 逆向参考面板 | 表格 | 退货、补发、返仓、质检、报废字段 | 字段可用性、缺口 | 跳转 SCM 深挖 |
| 异常退款样本 | 表格 | `return_id`、`return_line_id`、`order_id` | 退款金额、原因、部分退、DQ 状态 | 供 Agent 消费 |
| DQ 缺口面板 | 表格 | check_id | 通过率、失败原因、阻断状态 | 跳转数据治理任务 |

## 10. 退款归因逻辑

| 诊断对象 | 规则 | 页面输出 | 护栏 |
|---|---|---|---|
| 高退款原因 | 按 `return_amt`、`return_order_cnt` 或退款金额占比排序 | 原因 Pareto 和影响范围 | 不输出责任部门 |
| 高退款国家渠道 | 国家×渠道下退款金额率或退款订单率高 | 高影响范围候选 | 不输出渠道策略结论 |
| 商品退款线索 | SKU/SPU 退款金额、数量或部分退比例高 | 商品线索清单 | 不直接输出商品下架或改款动作 |
| 部分退线索 | `is_partial_return = true` 或数量比例显示部分退 | 部分退矩阵和部分退类型 | 不把部分退等同组合问题 |
| 组合候选 | `is_partial_return = true and is_bundle_line = true` | 组合问题候选 | 需 ORDER-BI-003、VOC 和真实退款样本共同验证 |
| 重复投诉 | `is_repeat_complaint = true` 或 VOC 工单重复 | 重复投诉候选 | 无 VOC 工单时不可输出 |
| VOC 输入 | `theme_suggested` 与 `xl3_input_ready` | 交叉线3输入表 | 不输出 VOC 原始标签和用户原话 |
| SCM 逆向线索 | 退货运费、补发、返仓、质检、报废字段可用 | 逆向物流深挖入口 | 不替代退款原因 |

退款归因只给“结构范围”和“待验证候选”。若没有真实样本、原因码、VOC 关联和 Owner 复核，页面不得输出“某商品导致退款”或“某组合设计造成投诉”的句子。

## 11. XL3 输入契约

`ORDER-BI-004` 应支持展示和导出 `refund_theme_input_for_voc`，但该表是 VOC Agent 的订单侧输入，不是 VOC 结论表。

| 字段 | 来源 | 页面角色 | 禁止解释 |
|---|---|---|---|
| `order_id` | `dwt_return_attribution.order_id` | 原订单上下文 | 不代表完整用户旅程 |
| `return_id` | `dwt_return_attribution.return_id` | 售后单上下文 | 不代表客服定责 |
| `sku_id` / `spu_id` | 退款行和商品维度 | 商品线索 | 不代表商品问题已证实 |
| `country_code` / `channel_id` | 订单或退款事实 | 范围筛选 | 不代表渠道责任 |
| `return_reason_code` | 退款原因码 | 建议主题来源 | 不代表 VOC 标签 |
| `is_partial_return` | 退款事实或数量规则 | 部分退结构 | 不代表组合问题 |
| `theme_suggested` | 原因码 + 部分退规则派生 | 给 VOC Agent 的建议主题 | 不代表用户原话或最终主题 |
| `xl3_input_ready` | DQ 派生 | 是否可进入交叉线3 | 不代表 VOC 分析完成 |

生成规则默认采用宽表规格中的建议：部分退优先生成 `部分退组合问题_原因{reason}`，非部分退生成 `整单退款_原因{reason}`。原因码为空时不生成 `theme_suggested`，进入 DQ 缺口。

## 12. 状态与颜色规则

| 状态 | 判定 | 页面行为 | 禁止行为 |
|---|---|---|---|
| Grey | 只有规格、mock 或样例，无真实源表和样本 | 展示字段缺口、组件设计、mock 示例、XL3 输入样例 | 根因定责、VOC 结论、SCM 成本结论、SQL |
| Amber | 有真实样本，P0 DQ 通过但原因码、部分退或 VOC 关联未完全签收 | 展示待验证异常、样本趋势、DQ 提醒 | 管理层强结论 |
| Green | 源表、样本、Owner、权限、DQ、原因码和 VOC 关联规则均通过 | 展示看板、触发 Agent、导出 XL3 输入、进入 SQL 前置 | 无证据泛化 |
| Red | P0 DQ 失败且无业务解释 | 阻断看板数据展示，只显示缺口 | Agent 诊断、SQL、XL3 导出 |

页面顶部必须始终展示 `data_quality_status` 和 `return_quality_status`。当状态不是 `Green` 时，所有导出、Agent 触发和管理层摘要都要带证据等级。

## 13. Agent 入口

| 入口 | 输入 | 输出 | 护栏 |
|---|---|---|---|
| 退款归因诊断 | 当前筛选范围、退款 KPI、原因结构、DQ 状态 | 原因结构、影响范围、字段缺口 | Grey 只输出缺口 |
| 商品退款诊断 | SKU/SPU、退款金额、退款数量、原因、部分退 | 商品线索和待验证问题 | 不输出商品动作 |
| 部分退组合诊断 | 部分退、组合标记、同单 SKU/SPU、原因 | 组合问题候选和验证清单 | 不上线推荐规则 |
| VOC 输入诊断 | `theme_suggested`、`xl3_input_ready`、VOC 关联状态 | XL3 输入建议、缺口 | 不输出 VOC 原话或标签结论 |
| SCM 逆向诊断 | 逆向物流字段可用性、补发、返仓、质检线索 | SCM 深挖清单 | 不替代退款原因 |
| 数据治理诊断 | DQ 检查失败项、字段缺口、join 缺口 | 源表确认清单、Owner 待办 | 不绕过 DQ 门禁 |

`ORDER-AGENT-004` 的默认输出必须包含证据状态、使用字段、不可用字段、样本范围、原因码覆盖、VOC 关联状态和下一步确认项。没有真实样本和 VOC 原始证据时，不允许输出用户声音结论。

## 14. 数据与刷新规则

| 项 | 规则 |
|---|---|
| 数据来源 | `dwt_return_attribution` |
| 当前可用数据 | Phase2 mock `topic2_refund_attribution.csv`、`topic2_refund_attribution_detail.csv` 仅作页面样例 |
| XL3 当前样例 | `ref/phase2_io/refund_theme_input_for_voc.csv` 仅作联调样例 |
| 刷新频率 | 真实源表确认前不定义正式频率 |
| 分区 | `return_dt` |
| 月度聚合 | `dt_month` |
| 退款日期口径 | 未确认前必须展示为 DQ 缺口 |
| 订单全集 | 未确认前不计算生产口径订单退款率 |
| 原因码 | 未确认 `dim_return_reason` 前只展示字段缺口 |
| VOC 关联 | `voc_ticket_id` 可为空，但不能输出 VOC 结论 |
| 导出 | Grey 状态只允许导出字段缺口和 mock / XL3 输入样例，不导出业务结论 |
| SQL | `ORDER-DQ-001` 通过前不创建正式 SQL |

## 15. 验收标准

| 编号 | 标准 | 通过条件 |
|---|---|---|
| `ORDER-BI-004-AC-001` | 页面目标明确 | 能回答退款金额、退款率、原因、部分退、SKU/SPU 和 VOC 输入范围 |
| `ORDER-BI-004-AC-002` | 输入边界明确 | 只以 `dwt_return_attribution` 为主输入，VOC / SCM / 毛利只作参考 |
| `ORDER-BI-004-AC-003` | 指标口径明确 | KPI 均能映射到 `ORDER-RETURN-*`、`ORDER-XL3-*` 或宽表派生字段 |
| `ORDER-BI-004-AC-004` | 退款原因 Pareto 明确 | 原因编码、原因分类、金额占比和订单数均有展示方式 |
| `ORDER-BI-004-AC-005` | 部分退矩阵明确 | 部分退、整退、SKU/SPU、组合候选和原因结构有下钻 |
| `ORDER-BI-004-AC-006` | XL3 输入边界明确 | `theme_suggested` 只作为 VOC Agent 输入，不作为 VOC 结论 |
| `ORDER-BI-004-AC-007` | DQ 护栏明确 | Grey / Amber / Green / Red 行为不同 |
| `ORDER-BI-004-AC-008` | Agent 护栏明确 | Grey 状态只输出缺口，不输出根因、定责和用户声音结论 |
| `ORDER-BI-004-AC-009` | 不创建 SQL | 文档只定义 PRD，不生成 `sql/` 资产 |

## 16. 待确认决策

| 决策点 | 推荐默认值 | 需要确认的问题 |
|---|---|---|
| 退款行主键 | `(return_id, return_line_id)` | 源系统是否稳定提供 `return_line_id` |
| 退款日期 | `return_dt` 默认取业务确认后的退款完成日 | 申请、审核、完成、入账哪个作为主分析日期 |
| 退款金额字段 | `return_amt` | mock 中 `refund_amt` 是否统一映射 |
| 订单退款率分母 | 退款期内订单全集 | 是否按订单日期、退款日期或二者窗口对齐 |
| 原因分类 | `dim_return_reason.reason_category` | 原因码是否覆盖产品、物流、主观、描述不符等 |
| 部分退判断 | 源字段优先，数量规则校验 | `is_partial_return` 是否可靠 |
| 组合定义 | 订单行 `is_bundle_line` + 同单 SKU/SPU 关系 | 业务组合是套装、搭配，还是营销 bundle |
| VOC 关联键 | 优先 `voc_ticket_id`，其次 `order_id` / `return_id` | 工单系统是否保留退货单号 |
| `theme_suggested` 规则 | 原因码 + 部分退状态生成 | 是否需要映射到 VOC 标签二三级 |
| SCM 逆向字段 | 暂不写入 ORDER P0 | 哪些字段后续作为参考进入页面 |
| Agent 触发 | 只允许带证据状态触发 | 哪些角色能触发 `ORDER-AGENT-004` |

## 17. 下一步任务

下一步执行 `ORDER-AGENT-001`：订单成本异常诊断 Agent 规格。

建议落盘文件：

`drafts/docs/order-agent-cost-anomaly-diagnosis-spec-draft-20260603.md`

进入条件：

1. 复核 `ORDER-BI-001` 与 `dwt_order_cost_quality`。
2. 明确 `ORDER-AGENT-001` 只消费成本质量页面上下文和证据状态。
3. 固定 Agent 输入、输出、禁止结论、Grey/Amber/Green/Red 行为。
4. 继续保持 SQL 前置门禁，不创建正式 SQL。
