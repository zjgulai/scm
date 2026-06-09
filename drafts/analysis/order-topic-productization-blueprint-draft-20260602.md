---
title: 专题②线上订单数量与质量提升产品化蓝图草稿
doc_type: analysis
module: project-governance
topic: order-topic-productization-blueprint
status: draft
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---

# 专题②线上订单数量与质量提升产品化蓝图草稿

## 1. 任务定位

本文件执行 `ORDER-BLUEPRINT-001`，用于固定专题②的项目级分层、四个子课题边界、SCM 深挖分枝关系、样例产物映射和后续 `ORDER-*` 治理链路。

当前文件是草稿控制面板，不是正式专题目录，不创建生产 SQL，不声明真实数仓已经接入。

## 2. 核心判断

| 判断 | 结论 |
|---|---|
| 专题②主线 | `ORDER-*` 是四大专题中的专题②主治理包，主题为线上订单数量与质量提升 |
| SCM 定位 | `SCM-*` 是专题②下的供应链成本、库存、履约、逆向物流深挖分枝，保留顶层 `scm/` |
| 样例产物定位 | `data_example/专题产物/专题02/04/05` 是方法、公式、图表和样例证据来源，不是正式业务结论 |
| Phase2 定位 | Phase2 已跑通 mock 链路，可证明字段、脚本和输出结构存在，不证明生产数据可用 |
| Phase3 定位 | 当前存在 Topic1/3/4 输出；未发现 `phase3_outputs/topic2/` 正式输出目录 |
| 下一阶段目标 | 从蓝图进入指标字典、宽表规格、BI PRD、Agent 规格、源表确认、DQ、SQL 前置规格 |

## 3. 证据链

| 证据类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| 四专题总计划 | `drafts/analysis/plan-four-major-topics-governance-draft-20260602.md` | 固定四大专题、优先级、前缀、ORDER 工作包 | 草稿控制面板 |
| 专题②故事线 | `main_project_lute/Phase1_故事线与智能体/专题故事线/专题②_线上订单数量与质量提升_故事线.md` | 固定业务问题、四子课题和 Agent 消费关系 | 需求与验收基线 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 固定 fact/dim 表建议、关键字段和粒度 | 数仓规划基线 |
| 主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 固定 `fact_order`、`fact_order_item`、`fact_return` 主键与粒度 | 数仓规划基线 |
| 模块 IO | `main_project_lute/Phase3_全专题与运营化/模块输入输出规格表.md` | 固定 T2-1 到 T2-4 输入输出和消费者 | 运营化规格 |
| 字段口径 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | 固定 ORDER 与交叉线3字段口径 | 运营化规格 |
| Phase2 状态 | `main_project_lute/Phase2_MVP_开发/PHASE2_STATUS.md` | 证明专题② mock 管道与交叉线3 mock 管道已跑通 | mock 运行证据 |
| Phase2 输出 | `main_project_lute/phase2_outputs/topic2/` | 提供成本、耗时、毛利、退款输出字段样例 | mock 产物 |
| 交叉线3输出 | `ref/phase2_io/refund_theme_input_for_voc.csv`、`main_project_lute/phase2_outputs/crossline3_voc/` | 提供退款到 VOC 的字段和双重视图样例 | mock 产物 |
| 样例产物 | `main_project_lute/data_example/专题产物/专题02/04/05/` | 提供费率归因、四因素归因、购物篮分析方法 | 样例证据 |
| SCM 蓝图 | `scm/00_供应链专题_项目分层蓝图.md` | 固定 SCM 是供应链项目分枝 | 正式 SCM 架构资产 |
| SCM 产品化包 | `scm/供应链成本指标全链路优化/01_专题包_产品化拆分与数据任务蓝图.md` | 提供 `SCM-*` 治理模板和供应链深挖边界 | 正式 SCM 规格资产 |

## 4. 专题②分层蓝图

```text
ORDER 线上订单数量与质量提升
  L0 经营目标: 订单量增长质量、订单成本、履约体验、毛利结构、退款闭环
  L1 主专题: 专题② ORDER
  L2 四子课题: ORDER-T1 / ORDER-T2 / ORDER-T3 / ORDER-T4
  L3 数据产品: 指标字典、主题宽表、BI 页面、Agent 任务
  L4 证据治理: 源表确认、样本 DQ、SQL 前置规格
  L5 交叉编排: XL3 退款 -> VOC，部分输出可被 CHANNEL / MKT 消费
  Side Branch: SCM 供应链成本、库存、履约、逆向物流深挖分枝
```

## 5. 四子课题边界

| 子课题 | 业务问题 | ORDER 内负责 | 可引用 SCM | 禁止越界 |
|---|---|---|---|---|
| `ORDER-T1` 订单量区域结构 -> 后台成本 / 仓网 | 订单量、区域、渠道、仓库如何影响前后台成本；卖 1 元前后台各承担多少；客件数如何影响履约成本 | 订单级成本宽表、前后台成本归因、价值认同与客件数分析 | 供应链成本节点、仓网、库存、履约成本口径 | 不把 T1 改写成完整供应链库存/备货专题 |
| `ORDER-T2` 订单平均耗时与核心节点诊断 | 履约链路时效瓶颈在哪；节点耗时如何影响体验和周转 | 订单履约节点宽表、节点诊断、超时标记、周转关联 | 履约稳定、库存健康、调拨协同口径 | 不扩展成物流商 SLA 全量治理 |
| `ORDER-T3` 订单类型与订单价结构 -> 毛利额归因 | 促销/非促销、组合/非组合、品单价、客品数如何影响毛利额 | 订单价结构宽表、四因素归因、组合策略候选 | 后台成本、节点成本可作成本解释层 | 不替代专题④营销 ROI，不把活动归因写成营销因果 |
| `ORDER-T4` 退款多维归因 -> 订单和 VOC 穿透 | 退款是用户比较策略还是产品/组合设计问题；部分退如何打通 VOC | 退款归因宽表、部分退组合表、售后/退款主题输入表 | 逆向物流成本、返仓恢复、补发治理闭环 | 不替代客服系统改造，不替代专题① VOC 原始分析 |

## 6. ORDER 与 SCM 的关系

SCM 是 ORDER 的供应链深挖分枝，但不是 ORDER 的替代品。

| ORDER 子课题 | SCM 可引用资产 | 引用内容 | 引用角色 | 禁止事项 |
|---|---|---|---|---|
| `ORDER-T1` | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md`、`（data）课题一：供应链履约费用科目拆解明细.md` | 采购、头程、仓储、尾程、逆向成本节点和分摊思路 | 后台成本深拆参考 | 不用 SCM 宽表替代 `fact_order` / `fact_order_cost` |
| `ORDER-T1` | `scm/供应链成本指标全链路优化/（tactic）课题一：kp02-仓网规划执行方案.md` | 仓网角色、区域策略、调拨收益 | 仓网解释与动作参考 | 不把订单量分析扩展成仓网规划项目 |
| `ORDER-T2` | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` 中 `dwt_fulfillment_stability` | 发货、仓处理、尾程、SLA、履约评分字段 | 履约节点深挖参考 | 不绕过订单级节点时间戳 |
| `ORDER-T2` | `scm/供应链成本指标全链路优化/（tactic）课题一：kp04-仓储与调拨协同执行方案.md` | 缺货、库龄、调拨与仓储协同 | 时效瓶颈后续动作参考 | 不直接输出自动调拨建议 |
| `ORDER-T3` | `scm/供应链成本指标全链路优化/01_专题包_产品化拆分与数据任务蓝图.md` | 成本异常诊断、管理层摘要、Grey 护栏 | 成本解释与 Agent 护栏参考 | 不把促销/组合/单价归因改写成 SCM 成本专题 |
| `ORDER-T4` | `scm/供应链成本指标全链路优化/（data）课题一：专题分析数据需求底表.md` 中 `dwt_reverse_logistics` | 退货、补发、返仓、责任归因、处理时效 | 逆向物流深挖参考 | 不用逆向物流成本替代退款原因和 VOC 关联 |
| `ORDER-T4` | `scm/供应链成本指标全链路优化/01_专题包_产品化拆分与数据任务蓝图.md` 中 `SCM-DQ-001` / `SCM-SQL-001` | DQ 门槛和 SQL 前置门禁 | 治理模板参考 | 未拿真实样本前不创建正式 SQL |

## 7. 数据契约

### 7.1 核心事实表与维度表

| 表 | 粒度 | 关键字段 | 服务子课题 |
|---|---|---|---|
| `fact_order` | 一行一订单 | `order_id`、`order_date`、`country_code`、`channel_id`、`shop_id`、`warehouse_id`、`dest_warehouse`、`order_type`、`gmv`、`item_qty`、`sku_qty`、`cost_front_total`、`cost_back_total`、`gross_margin_amt`、`campaign_id` | T1/T2/T3/T4 |
| `fact_order_item` | 一行一订单行 | `order_id`、`line_item_id`、`spu_id`、`sku_id`、`category_l3`、`unit_price`、`item_qty`、`gmv_line`、`gross_margin_amt_line`、`is_promo`、`is_bundle` | T3/T4 |
| `fact_return` | 一行一次退款中的一个 SKU | `return_id`、`return_line_id`、`order_id`、`sku_id`、`spu_id`、`return_qty`、`return_amt`、`return_reason_code`、`is_partial_return`、`is_repeat_complaint`、`voc_ticket_id` | T4 |
| `fact_order_fulfillment` | 一行一订单履约节点快照 | `order_id`、`created_at`、`paid_at`、`shipped_at`、`in_transit_at`、`cleared_at`、`delivered_at`、`lead_time_*`、`turnover_days`、`is_overdue`、`has_voc` | T2 |
| `dim_warehouse` | 一行一仓库 | `warehouse_id`、`warehouse_name`、`warehouse_type`、`country_code`、`is_fba` | T1/T2 |
| `dim_order_type` | 一行一订单类型 | `order_type`、`order_type_name`、`is_promo`、`is_b2b` | T3 |
| `dim_return_reason` | 一行一退款原因 | `return_reason_code`、`return_reason_name`、`reason_category` | T4 |
| `dim_campaign` | 一行一活动 | `campaign_id`、`campaign_name`、`campaign_type`、`country_code`、`channel_id`、`start_dt`、`end_dt` | T3 |

### 7.2 主题宽表建议

| task_id | 目标宽表 | 推荐粒度 | 用途 |
|---|---|---|---|
| `ORDER-DATA-002` | `dwt_order_cost_quality` | 月/国家/渠道/仓库/订单类型/订单 | 支撑前后台成本归因、客件数和卖 1 元成本分析 |
| `ORDER-DATA-003` | `dwt_order_fulfillment_diagnosis` | 订单/国家/渠道/仓库/节点 | 支撑节点耗时、超时、周转和体验诊断 |
| `ORDER-DATA-004` | `dwt_order_margin_attribution` | 订单/订单行/SPU/活动/订单类型 | 支撑促销、组合、单价、客品数和毛利额归因 |
| `ORDER-DATA-005` | `dwt_return_attribution` | 退货行/订单/SKU/国家/渠道/原因 | 支撑退款原因、部分退、组合设计和 VOC 穿透 |

## 8. Phase2 输出映射

| Phase2 产物 | 字段样例 | 映射子课题 | 可复用方式 | 限制 |
|---|---|---|---|---|
| `topic2_cost_attribution.csv` | `channel_id`、`country_code`、`gmv`、`cost_front_total`、`cost_back_total`、`gross_margin_amt`、`order_cnt` | T1 | 复用成本归因字段结构和前后台成本率 | mock 产物，不能证明真实成本口径 |
| `topic2_leadtime_diagnostics.csv` | `dest_warehouse`、`lead_time_created_to_paid`、`lead_time_paid_to_shipped`、`lead_time_shipped_to_delivered`、`lead_time_total`、`is_overdue_pct` | T2 | 复用节点耗时字段和诊断输出结构 | mock 产物，缺真实履约节点来源 |
| `topic2_margin_attribution.csv` | `order_type`、`gmv`、`gross_margin_amt`、`item_qty`、`order_cnt`、`asp`、`gross_margin_pct` | T3 | 复用毛利归因输出结构 | mock 产物，活动/组合/订单类型需真实验证 |
| `topic2_refund_attribution.csv` | `return_reason_code`、`reason_category`、`refund_amt`、`refund_qty`、`return_order_cnt`、`is_partial_return`、`refund_rate` | T4 | 复用退款归因汇总字段 | mock 产物，退款原因编码需真实源表 |
| `topic2_refund_attribution_detail.csv` | `order_id`、`return_id`、`sku_id`、`spu_id`、`return_reason_code`、`is_partial_return` | T4/XL3 | 复用退款明细和 VOC 输入前置字段 | mock 产物，不能输出业务根因 |
| `ref/phase2_io/refund_theme_input_for_voc.csv` | `order_id`、`return_id`、`return_reason_code`、`is_partial_return`、`theme_suggested` | XL3 | 复用交叉线3 IO 契约 | 只作为 mock 联调样例 |

## 9. 样例产物映射

| 样例目录 | 对应 ORDER 子课题 | 可复用内容 | 进入蓝图的方式 | 禁止事项 |
|---|---|---|---|---|
| `data_example/专题产物/专题02/` | T1，部分 T4 | 费率归因、前后台成本率、促销/推广/退款/生产/头程/仓配/佣金/其他费率 | 转为 `ORDER-DATA-001` 指标候选和 `ORDER-BI-001` 图表参考 | 不当作订单级仓网事实；不当作真实退款原因证据 |
| `data_example/专题产物/专题04/` | T3，部分 T1 | `毛利额 = 客品数 × 品单价 × 订单数 × 前台毛利率`、SPU 下钻 | 转为 `ORDER-DATA-004` 归因方法和 `ORDER-BI-003` 页面参考 | 未接 `order_type`、`is_promo`、`is_bundle`、`campaign_id` 前，不算完整订单类型归因 |
| `data_example/专题产物/专题05/` | T3/T4，交叉线1候选 | 支持度、置信度、提升度、订单/客户维度组合关系 | 转为组合策略候选和部分退组合分析参考 | 不证明组合能提升毛利或降低退款 |
| `data_example/专题产物/专题01/` | T1/T3 背景 | 平台×区域毛利归因、管理层叙事、瀑布图 | 作为平台/区域口径和汇报模板参考 | 不升格为 ORDER 主线 |
| `data_example/专题产物/专题03/` | T3 背景 | SPU Pareto、毛利率箱体、正负贡献 SPU | 作为 SPU 下钻和商品组合参考 | 不替代 `fact_order_item` 订单行分析 |

## 10. BI 页面蓝图

| task_id | 页面 | 核心问题 | 输入 | 主要组件 | 输出 |
|---|---|---|---|---|---|
| `ORDER-BI-001` | 订单经营结果与成本质量总览 | 订单增长是否有质量；前后台成本是否拖累 | `dwt_order_cost_quality`、SCM 成本参考 | KPI 卡、前后台成本堆叠、国家/渠道热力、客件数分布 | 成本异常范围、下钻入口 |
| `ORDER-BI-002` | 履约耗时与核心节点诊断 | 瓶颈发生在哪个节点、国家、渠道、仓库 | `dwt_order_fulfillment_diagnosis` | 节点漏斗、耗时箱线、超时矩阵、仓库排序 | 节点瓶颈和待确认原因 |
| `ORDER-BI-003` | 订单价结构与毛利归因 | 哪些订单类型、组合、SPU 拉动或拖累毛利 | `dwt_order_margin_attribution` | 四因素瀑布、订单类型对比、SPU 下钻、组合候选 | 组合策略和品类优化候选 |
| `ORDER-BI-004` | 退款归因与售后闭环 | 退款来自比较策略、产品问题还是组合设计 | `dwt_return_attribution`、`refund_theme_input_for_voc` | 退款原因 Pareto、部分退矩阵、SKU 组合、VOC 输入表 | 退款归因清单、交叉线3输入 |

## 11. Agent 蓝图

| task_id | Agent 任务 | 触发条件 | 输入 | 输出 | 护栏 |
|---|---|---|---|---|---|
| `ORDER-AGENT-001` | 订单成本异常诊断 | 前台/后台成本率进入 Amber/Red；成本增速高于订单或销售增速 | `dwt_order_cost_quality`、SCM 成本参考 | 驱动项、异常范围、数据缺口、待分派事项 | Grey 状态只输出缺口，不输出根因 |
| `ORDER-AGENT-002` | 履约耗时诊断 | 节点耗时、总耗时或超时率异常 | `dwt_order_fulfillment_diagnosis`、SCM 履约参考 | 瓶颈节点、影响范围、待验证假设 | 不自动归责物流商或仓库 |
| `ORDER-AGENT-003` | 毛利归因与组合建议 | 毛利额或毛利率波动；组合/活动/订单类型异常 | `dwt_order_margin_attribution`、样例归因方法 | 归因解释、SPU/组合候选、风险提示 | 不把相关性当因果；不替代 MKT ROI |
| `ORDER-AGENT-004` | 退款归因与 VOC 输入 | 退款率、部分退、重复投诉或原因结构异常 | `dwt_return_attribution`、`refund_theme_input_for_voc` | 退款原因解释、组合问题候选、VOC 主题输入 | 无 `voc_ticket_id` 或原始 VOC 时不输出用户声音结论 |

### 11.1 数据状态边界

| 状态 | 判定 | Agent 允许输出 | Agent 禁止输出 |
|---|---|---|---|
| Grey | 只有规划、mock、样例，缺真实源表或样本 | 任务规格、字段缺口、待确认问题 | 根因、Owner、管理层动作 |
| Amber | 有样本但 DQ 未完全通过，或字段口径存在差异 | 待验证假设、样本问题、口径差异 | 强结论、生产建议 |
| Green | 源表、样本、DQ、口径均通过 | 指标解释、根因候选、动作建议 | 无证据泛化 |

## 12. 工作包拆分

| task_id | 工作包 | 产出 | Done 标准 |
|---|---|---|---|
| `ORDER-BLUEPRINT-001` | 专题②产品化蓝图 | 本文件 | 四子课题、SCM、样例、Phase2、证据边界均固定 |
| `ORDER-DATA-001` | 订单指标字典 | 指标种子表草稿 | 指标有 code、公式、Owner、源表和适用子课题 |
| `ORDER-DATA-002` | 订单成本宽表规格 | `dwt_order_cost_quality` 规格 | 可覆盖前后台成本、客件数、仓库、国家、渠道 |
| `ORDER-DATA-003` | 履约耗时宽表规格 | `dwt_order_fulfillment_diagnosis` 规格 | 可计算节点耗时、总耗时、超时和周转 |
| `ORDER-DATA-004` | 订单价格与毛利归因宽表规格 | `dwt_order_margin_attribution` 规格 | 可计算订单类型、促销、组合、单价、客品数贡献 |
| `ORDER-DATA-005` | 退款归因宽表规格 | `dwt_return_attribution` 规格 | 可支持部分退、原因、SKU/SPU、VOC 关联 |
| `ORDER-BI-001` | 经营结果与成本看板 PRD | 页面 PRD | 能回答订单增长质量和成本拖累 |
| `ORDER-BI-002` | 履约耗时与节点诊断 PRD | 页面 PRD | 能定位节点瓶颈和下钻路径 |
| `ORDER-BI-003` | 订单价结构和毛利归因 PRD | 页面 PRD | 能输出组合策略候选 |
| `ORDER-BI-004` | 退款归因与售后闭环 PRD | 页面 PRD | 能产出交叉线3输入 |
| `ORDER-AGENT-001` | 成本异常诊断 Agent | Agent 任务规格 | Grey/Amber/Green 输出边界清楚 |
| `ORDER-AGENT-002` | 履约耗时诊断 Agent | Agent 任务规格 | 不无证据归责 |
| `ORDER-AGENT-003` | 毛利归因与组合建议 Agent | Agent 任务规格 | 不替代 MKT ROI |
| `ORDER-AGENT-004` | 退款归因与 VOC 输入 Agent | Agent 任务规格 | 可被 `XL3-*` 消费 |
| `ORDER-SOURCE-001` | 本地证据与真实源表确认矩阵 | 源表矩阵 | 区分 mock、样例、生产待确认 |
| `ORDER-SOURCE-002` | 真实源系统确认包 | 源域登记、样本包要求、权限清单 | 明确 OMS、ERP、WMS、售后、财务 Owner |
| `ORDER-DQ-001` | 样本质量校验规格 | DQ 检查项和验收门槛 | P0 未过不进入 SQL |
| `ORDER-SQL-001` | SQL 初稿前置规格 | SQL 构建顺序和审查清单 | 未通过 DQ 前不创建正式 SQL |

## 13. 交叉线3入口

`ORDER-T4` 是 `XL3` 的上游。ORDER 只产出售后/退款主题输入，不产出 VOC 原始结论。

| 上游产物 | 字段 | 下游消费者 | 下游输出 |
|---|---|---|---|
| `refund_theme_input_for_voc` | `order_id`、`return_id`、`sku_id`、`spu_id`、`country_code`、`channel_id`、`return_reason_code`、`is_partial_return`、`theme_suggested` | VOC Agent | 售后/退款主题 VOC 摘要、双重视图结论 |
| 退款率/异常国家渠道 | `country_code`、`channel_id`、`refund_rate`、`reason_category` | 渠道 Agent | 渠道健康度风险预警 |
| 组合优化候选 | `spu_id`、`sku_id`、`combo_type`、`return_reason_code`、`confidence_level` | 产品/运营 | 组合优化、详情页或加购建议 |

## 14. 当前不能做

| 禁止动作 | 原因 |
|---|---|
| 把 SCM 文件迁入 `main_project_lute/` | 用户已确认 `scm/` 保持顶层深挖分枝 |
| 把专题02/04/05 改名成 ORDER 正式专题 | 它们是样例产物，且缺订单级真实源表 |
| 直接创建 `sql/ORDER-*.sql` | 真实源表、样本、DQ 未确认 |
| 用 Phase2 mock 输出生成管理层业务结论 | mock 只能证明管道结构，不能证明真实业务事实 |
| 把 ORDER 扩展成 VOC、CHANNEL、MKT 主线 | ORDER 只通过交叉线消费或提供输入 |
| 用 SCM 结论替代 ORDER 订单事实 | SCM 是供应链深挖分枝，不是订单事实主表 |

## 15. 下一步

下一步进入：

```text
ORDER-DATA-001
```

建议新建草稿：

```text
drafts/analysis/order-topic-metric-dictionary-draft-20260602.md
```

该文件应先固定 ORDER 指标字典，不写 SQL。指标来源包括：

1. `01_专题课题_数据需求矩阵.md` 中专题②四行；
2. `专题×交叉线_字段口径说明.md` 中专题②字段口径；
3. Phase2 topic2 输出字段；
4. 样例专题02/04/05的指标公式；
5. SCM 成本、履约、逆向物流指标中可作为参考的部分。

## 16. 待确认决策

| 决策点 | 触发阶段 | 推荐默认 |
|---|---|---|
| ORDER 草稿体系是否继续全部放 `drafts/analysis/` | `ORDER-DATA-001` 前 | 是，直到用户确认转正式 |
| ORDER 是否复用 SCM 的 Grey/Amber/Green 状态模型 | `ORDER-AGENT-*` 前 | 是，保持跨专题治理一致 |
| ORDER 指标字典是否独立成表格文件 | `ORDER-DATA-001` 前 | 先 Markdown 草稿，确认后再转结构化表 |
| `fact_order_cost` 是否独立于 `fact_order` | `ORDER-SOURCE-001` 前 | 先两种方案并列，等真实源表确认 |
| `fact_order_fulfillment` 是否独立建表 | `ORDER-SOURCE-001` 前 | 先作为可选表，等时间戳来源确认 |
