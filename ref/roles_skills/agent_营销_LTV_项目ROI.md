---
title: "Agent 画像：营销 & LTV & 项目 ROI"
doc_type: knowledge
module: "ref"
topic: "agent-营销-LTV-项目ROI"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# Agent 画像：营销 & LTV & 项目 ROI

---

## 使命（一句话）

建立营销活动类型与项目分类及 ROI 基准，产出用户 LTV 分段与二次增长曲线、费用结构与精细化 ROI（含曝光归因），支撑营销项目类型 ROI 量化提升与预算分配。

---

## 主责专题与子课题

- **主责专题**：④ 营销项目类型 ROI 量化提升
- **主责子课题**：① 用户精准营销与生命周期二次增长曲线、② 广告费/促销/推广/会员费结构与 ROI 基准、③ 平台广告费与产品促销形式精细化运营（曝光归因 ROI）

---

## 输入

| 类型 | 表/资产名称 | 关键字段（示例） | 可选参数 |
|------|-------------|------------------|----------|
| 数仓事实表 | fact_campaign_daily | campaign_id, campaign_type, country_code, channel_id, dt, ad_spend, promo_discount_amt, impressions, clicks, roas, ad_attributed_sales | dt, dt_month |
| 数仓事实表 | fact_campaign_roi | campaign_id, country_code, channel_id, spu_id, dt, impressions, spend, attributed_sales, roas, promo_margin_roi | dt |
| 数仓事实表 | fact_user_lifecycle | user_id_anon, dt_month, channel_id, country_code, lifecycle_segment, cum_gmv, ltv_segment, ltv_incr_amt | dt_month |
| 数仓事实表 | fact_user_campaign | user_id_anon, campaign_id, campaign_type, event_dt | event_dt |
| 数仓事实表 | fact_order | order_id, gmv, campaign_id, user_id | order_date |
| 数仓维度表 | dim_campaign, dim_campaign_type, dim_ltv_segment | 活动与类型、LTV 分段 | — |
| 可选 | 外部曝光/触达表 | exposure, reach, attribution_window | dt |

---

## 调用的 Skills / 脚本

| 能力名称 | 路径/来源 | 调用场景 | 备注 |
|----------|------------|----------|------|
| 专题四 Sheet4 系列（客品数/毛利率归因） | data_example/scripts/run_专题四_Sheet4_* | 订单价结构与毛利相关 | 可复用思路 |
| LTV 分段与二次增长曲线 | — | 子课题① | 待 Phase 2 实现 |
| 活动分类与预算规则、ROI 基准 | — | 子课题② | 待 Phase 2 实现 |
| 曝光→转化归因与精细化 ROI | — | 子课题③ | 待 Phase 2 实现（依赖外部曝光数据） |

---

## 输出格式

| 输出物 | 格式 | 消费者 |
|--------|------|--------|
| LTV 分段表、LTV 增量表、二次增长曲线结论 | 表 + 文本 | 营销/投放、战略解码 |
| 费用结构表、活动分类与预算规则、ROI 基准表 | 表 + 文档 | 管理层、预算与费效 |
| 归因模型说明、精细化 ROI 表 | 文档 + 表 | 投放优化、咨询 PPT、渠道 Agent |
| 专题④ 结论摘要 | JSON/文本 | 咨询 PPT Agent、管理层 |

---

## 与 01 矩阵的对应

- **本 Agent 消费的「库表建议」列中的表清单**：fact_campaign_daily, fact_campaign_roi, fact_user_lifecycle, fact_user_campaign, fact_order, dim_campaign, dim_campaign_type, dim_ltv_segment；若有曝光归因则需 fact_campaign_attribution 或外部曝光/触达表。
