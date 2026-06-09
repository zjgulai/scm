---
title: "专题④ 营销项目类型 ROI 量化提升 — 故事线"
doc_type: analysis
module: "phase1-storyline-agent"
topic: "专题④-营销项目类型ROI量化提升-故事线"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# 专题④ 营销项目类型 ROI 量化提升 — 故事线

---

## 1. 业务问题与目标

- **本专题要回答的 1～3 个核心问题**：
  - 各营销活动类型与项目的分类及预算提报规则如何？各类活动的 ROI 基准是多少？
  - 用户 LTV 分段与各项目类型在分段内的 LTV 增量如何？二次增长曲线如何？
  - 结合曝光量，国家-渠道-活动类型的精细化 ROI 如何测算？
- **目标用户**：管理层、分析岗、营销/投放

---

## 2. 总故事线（一句话）

建立营销活动类型与项目的分类及预算提报规则 → 建立各类营销活动的 ROI 基准 → 结合外部曝光量构建因营销活动带来的销售额算法模型 → 按国家-渠道-活动类型做精细化 ROI 测算。

---

## 3. 子课题与步骤

### 子课题① 用户精准营销与生命周期二次增长曲线

- **业务问题**：LTV 分段如何？各项目类型在分段内的 LTV 增量如何？二次增长曲线如何刻画？
- **步骤**：
  - 步骤 1：从 fact_user_ltv、fact_order、dim_campaign 取用户 LTV 与活动参与 — **负责 Agent**：营销 & LTV & 项目 ROI — **本步输出**：LTV 分段表
  - 步骤 2：按项目类型在分段内的 LTV 增量、复购/二次曲线分析 — **负责 Agent**：营销 & LTV & 项目 ROI — **本步输出**：LTV 增量表、二次增长曲线结论
- **本课题最终输出**：LTV 分段表、LTV 增量表、二次增长曲线结论

### 子课题② 广告费、促销折扣、推广费、会员运营费结构与 ROI 基准

- **业务问题**：营销活动类型与项目如何分类？预算提报规则如何？各类活动 ROI/ROAS 基准是多少？
- **步骤**：
  - 步骤 1：从 fact_marketing、dim_campaign_type 取活动类型、费用、归属国家/渠道 — **负责 Agent**：营销 & LTV & 项目 ROI — **本步输出**：营销项目明细与费用结构表
  - 步骤 2：建立活动类型与项目分类及预算提报规则（与业务对齐） — **负责 Agent**：营销 & LTV & 项目 ROI — **本步输出**：活动分类与预算规则文档
  - 步骤 3：按活动类型（或国家×渠道×活动类型）设定 ROI/ROAS 基准 — **负责 Agent**：营销 & LTV & 项目 ROI — **本步输出**：ROI 基准表
- **本课题最终输出**：费用结构表、活动分类与预算规则、ROI 基准表

### 子课题③ 平台广告费与产品促销形式精细化运营（曝光归因 ROI）

- **业务问题**：结合曝光量，因营销活动带来的销售额如何归因？国家-渠道-活动类型的 ROI 如何精细化测算？
- **步骤**：
  - 步骤 1：从内部投放与促销明细、订单与收入表取数；若有外部曝光/触达数据一并接入 — **负责 Agent**：营销 & LTV & 项目 ROI — **本步输出**：投放与转化宽表
  - 步骤 2：建立「曝光→触达→转化→销售额」归因或统计模型 — **负责 Agent**：营销 & LTV & 项目 ROI — **本步输出**：归因模型与参数
  - 步骤 3：按国家-渠道-活动类型拆分，计算各格子 ROI — **负责 Agent**：营销 & LTV & 项目 ROI — **本步输出**：精细化 ROI 表
- **本课题最终输出**：归因模型说明、精细化 ROI 表

---

## 4. 输入数据

| 数据源类型 | 表/资产名称 | 关键字段（示例） | 时间/筛选条件 |
|------------|-------------|------------------|----------------|
| 数仓事实表 | fact_campaign_daily | campaign_id, campaign_type, country_code, channel_id, dt, ad_spend, promo_discount_amt, impressions, clicks, roas, ad_attributed_sales | dt / dt_month |
| 数仓事实表 | fact_campaign_roi | campaign_id, country_code, channel_id, spu_id, dt, impressions, spend, attributed_sales, roas, promo_margin_roi | dt |
| 数仓事实表 | fact_user_ltv | user_id, country_code, channel_id, ltv_amt, first_order_dt, segment | 按用户 |
| 数仓事实表 | fact_order | order_id, gmv, campaign_id, user_id | order_date |
| 数仓维度表 | dim_campaign, dim_campaign_type | 活动与类型属性 | — |
| 可选 | 外部曝光/触达表 | exposure, reach, attribution_window | dt |

---

## 5. 输出物

| 输出物名称 | 格式 | 用途/消费者 |
|------------|------|-------------|
| LTV 分段表、LTV 增量表、二次增长曲线结论 | 表 + 文本 | 营销/投放、战略解码 |
| 费用结构表、活动分类与预算规则、ROI 基准表 | 表 + 文档 | 管理层、预算与费效 |
| 归因模型说明、精细化 ROI 表 | 文档 + 表 | 投放优化、咨询 PPT |
| 专题④ 结论摘要（供 PPT） | JSON/文本 | 咨询 PPT Agent、管理层 |

---

## 6. 与 01 矩阵的对应

- **本专题在《01_专题课题_数据需求矩阵》中的行**：第 12～14 行（子课题 ①～③）。
- **对应库表建议**：fact_marketing、fact_user_ltv、fact_order、dim_campaign、dim_campaign_type；若有曝光归因则需外部曝光/触达表或内部归因中间表。
