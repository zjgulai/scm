---
title: "专题① 全域 VOC 数据洞察 — 故事线"
doc_type: analysis
module: "phase1-storyline-agent"
topic: "专题①-全域VOC数据洞察-故事线"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# 专题① 全域 VOC 数据洞察 — 故事线

---

## 1. 业务问题与目标

- **本专题要回答的 1～3 个核心问题**：
  - 各渠道/品类/单品的服务质量与体验如何？关键痛点与亮点在哪？（货架内）
  - 货架外（社媒与垂类社区）用户有哪些未被满足的需求？第二大单品机会在哪里？
  - 本土竞品如何被用户评价？全域声量趋势如何指导渠道与流量布局？
- **目标用户**：管理层、分析岗、产品/客服/营销

---

## 2. 总故事线（一句话）

从货架内 NPS/差评 → 货架外高潜需求与第二大单品 → 本土竞品声音与营销本土化 → 全域声量趋势与渠道/流量布局 → 服务闭环 + IPMS 大单品闭环。

---

## 3. 子课题与步骤

### 子课题① 货架内用户声音 → 服务质量与体验

- **业务问题**：各渠道/品类/单品的服务质量与体验如何？驱动 NPS、复购率、LTV 的痛点与亮点是什么？
- **步骤**：
  - 步骤 1：从数仓/资产层拉取 fact_voc_summary、ods_review_detail（若有），按渠道/国家/SPU/时间聚合 — **负责 Agent**：VOC & 消费者洞察 — **本步输出**：VOC 汇总宽表
  - 步骤 2：情绪+主题+场景标注（含 tag_l2/tag_l3），识别痛点与亮点 — **负责 Agent**：VOC & 消费者洞察 — **本步输出**：痛点亮点清单、标签分布
  - 步骤 3：输出 NPS/复购率/LTV 相关结论与建议 — **负责 Agent**：VOC & 消费者洞察 — **本步输出**：结论摘要
- **本课题最终输出**：货架内 VOC 看板/汇总表、痛点亮点清单、结论摘要

### 子课题② 货架外原生用户声音 → 人-AI 挖掘高潜需求

- **业务问题**：Reddit/垂类社区等货架外场景下，用户对吸奶器/母婴品类有哪些未被满足的需求？第二大单品机会在哪？
- **步骤**：
  - 步骤 1：从 ods_voc_external、dim_voc_external_community 取数，按平台/国家/主题聚合 — **负责 Agent**：VOC & 消费者洞察 — **本步输出**：货架外声量宽表
  - 步骤 2：与货架内统一编码（功能/场景/情绪/价格），人-AI 协同挖掘高潜需求 — **负责 Agent**：VOC & 消费者洞察 — **本步输出**：高潜需求清单、第二大单品候选池
- **本课题最终输出**：高潜需求清单、第二大单品候选池、可选 fact_voc_external_daily 聚合表

### 子课题③ 货架内外本土竞品用户声音 → 营销本土化

- **业务问题**：本土竞品在货架内外被用户如何评价？哪些卖点/话术更打动当地妈妈？
- **步骤**：
  - 步骤 1：从 fact_voc_brand_summary、dim_brand、ods_voc_external 取竞品与自有品牌声量 — **负责 Agent**：VOC & 消费者洞察 — **本步输出**：品牌×国家×渠道 VOC 对比表
  - 步骤 2：提炼营销本土化调性与话术清单，支撑转化率与促销 ROI — **负责 Agent**：VOC & 消费者洞察 — **本步输出**：本土化话术清单、建议卖点
- **本课题最终输出**：品牌声量对比表、本土化话术与卖点清单

### 子课题④ 全域 VOC 声量趋势 → 渠道拓展与流量布局

- **业务问题**：各国家/渠道/平台的品牌与品类声量如何演变？哪里是机会、哪里有风险？
- **步骤**：
  - 步骤 1：从 fact_voc_trend、fact_voc_summary 取时间序列，按国家/渠道/来源类型/品类 — **负责 Agent**：VOC & 消费者洞察 — **本步输出**：声量趋势表
  - 步骤 2：趋势雷达与机会/风险标注，指导渠道拓展与流量布局、广告 ROI 方向 — **负责 Agent**：VOC & 消费者洞察 — **本步输出**：趋势雷达、机会风险清单
- **本课题最终输出**：声量趋势看板、趋势雷达、机会/风险清单

---

## 4. 输入数据

| 数据源类型 | 表/资产名称 | 关键字段（示例） | 时间/筛选条件 |
|------------|-------------|------------------|----------------|
| 数仓事实表 | fact_voc_summary | voc_cnt, voc_rate, star_rating, good_rate, bad_rate, sales_qty, return_rate, channel_id, country_code, spu_id, dt_month | dt_month, country_code, channel_id |
| 数仓事实表 | fact_voc_trend | voc_cnt, voc_rate, sales_qty, voc_trend_12m, voc_source_type, mention_volume | dt_month, country_code, channel_id |
| 数仓事实表 | fact_voc_brand_summary | brand_id, voc_cnt, voc_rate, star_rating, bad_rate, tag_localized | dt_month, country_code |
| 数仓贴源 | ods_voc_external | platform, community_name, post_id, comment_id, topic_tags, sentiment_polarity, content_text | post_time / dt |
| 数仓维度 | dim_voc_tag, dim_voc_external_community, dim_brand | 标签与社区、品牌属性 | — |
| 资产层 | ref/books/maternal_social_voc/ 日志与标注 | 方法论与历史标注 | — |
| 资产层 | main_project_lute/voc社媒平台目录 | 海外母婴垂类社媒与社区平台清单与策略 | — |

---

## 5. 输出物

| 输出物名称 | 格式 | 用途/消费者 |
|------------|------|-------------|
| 货架内 VOC 汇总与痛点亮点清单 | 表 + 文本 | 分析岗、产品/客服 |
| 高潜需求清单、第二大单品候选池 | 表 + 清单 | 产品/IPMS、战略解码 Agent |
| 高浓度社区清单与话题/人群特征 | 表 + 清单 | 营销 Agent、专题④、交叉线 2 |
| 本土化话术与卖点清单 | 表/清单 | 营销、专题④ 投放 |
| 声量趋势雷达、机会风险清单 | 看板 + 清单 | 渠道/流量布局、专题③④ |
| VOC 分层分析规则（按国家/渠道战略角色与流量结构） | 文档/配置 | VOC Agent 自身、营销 Agent、交叉线 4 |
| 专题① 结论摘要（供 PPT） | JSON/文本 | 咨询 PPT Agent、管理层 |

---

## 6. 与 01 矩阵的对应

- **本专题在《01_专题课题_数据需求矩阵》中的行**：第 1～4 行（子课题 ①～④）。
- **对应库表建议**：fact_voc_summary, fact_voc_trend, fact_voc_brand_summary, ods_voc_external, dim_voc_tag, dim_voc_external_community, dim_brand, ods_review_detail（若有）。
