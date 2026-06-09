---
title: "Agent 画像：渠道 & 国家运营"
doc_type: knowledge
module: "ref"
topic: "agent-渠道-国家运营"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# Agent 画像：渠道 & 国家运营

---

## 使命（一句话）

建立分国家的各渠道生命周期体系与国家画像，输出流量布局差异化与本土对标策略、风险机会雷达与加码/守住/收缩/观望决策，支撑渠道运营健康度提升。

---

## 主责专题与子课题

- **主责专题**：③ 分国家渠道运营健康度提升
- **主责子课题**：① 渠道生命周期管理与战略校准、② 渠道差异性分析与差异化运营策略、③ 渠道风险预警与机会点识别

---

## 输入

| 类型 | 表/资产名称 | 关键字段（示例） | 可选参数 |
|------|-------------|------------------|----------|
| 数仓事实表 | fact_channel_country_month | country_code, channel_id, dt_month, gmv, sales_qty, gross_margin_amt, gross_margin_pct, ad_spend_pct, lifecycle_stage, turnover_days, target_* | dt_month |
| 数仓事实表 | fact_channel_traffic | country_code, channel_id, dt_month, traffic_pct_organic, traffic_pct_paid, traffic_pct_influencer, traffic_pct_promo, sessions, pv, ad_impressions, ad_sales, gmv, asp | dt_month |
| 数仓事实表 | fact_channel_health | country_code, channel_id, dt_month, gmv_yoy, margin_pct_chg, ad_spend_pct, roas, turnover_days, return_rate, voc_rate, target_achievement_rate | dt_month |
| 数仓维度表 | dim_channel, dim_country, dim_channel_lifecycle, dim_traffic_source | 渠道属性、国家、生命周期阶段、流量类型 | — |
| 可选 | ods_competitor_traffic | 本土竞品流量结构 | dt_month |

---

## 调用的 Skills / 脚本

| 能力名称 | 路径/来源 | 调用场景 | 备注 |
|----------|------------|----------|------|
| 生命周期阶段打标与国家画像 | — | 子课题① | 待 Phase 2 实现 |
| 流量结构分析与本土对标 | — | 子课题② | 待 Phase 2 实现 |
| 风险机会雷达与决策矩阵 | — | 子课题③ | 待 Phase 2 实现 |

---

## 输出格式

| 输出物 | 格式 | 消费者 |
|--------|------|--------|
| 生命周期表、国家画像表 | 表 | 战略解码、专题④ |
| 流量结构表、对标结论、差异化运营策略表 | 表 + 清单 | 渠道/国家运营、营销 Agent |
| 风险机会雷达、决策矩阵 | 看板 + 表 | 管理层、咨询 PPT |
| 专题③ 结论摘要 | JSON/文本 | 咨询 PPT Agent、管理层 |

---

## 与 01 矩阵的对应

- **本 Agent 消费的「库表建议」列中的表清单**：fact_channel_country_month, fact_channel_traffic, fact_channel_health, dim_channel, dim_channel_lifecycle, dim_traffic_source, ods_competitor_traffic（若可获得）。
