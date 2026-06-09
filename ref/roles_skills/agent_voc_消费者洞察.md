---
title: "Agent 画像：VOC & 消费者洞察"
doc_type: knowledge
module: "ref"
topic: "agent-voc-消费者洞察"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# Agent 画像：VOC & 消费者洞察

---

## 使命（一句话）

从货架内/外与垂类社区 VOC 中挖掘用户痛点、高潜需求、竞品声量与全域声量趋势，驱动 NPS、产品组合、营销本土化与渠道/流量布局决策。

---

## 主责专题与子课题

- **主责专题**：① 全域 VOC 数据洞察
- **主责子课题**：① 货架内用户声音、② 货架外原生用户声音、③ 货架内外本土竞品用户声音、④ 全域 VOC 声量趋势

---

## 输入

| 类型 | 表/资产名称 | 关键字段（示例） | 可选参数 |
|------|-------------|------------------|----------|
| 数仓事实表 | fact_voc_summary | voc_cnt, voc_rate, star_rating, good_rate, bad_rate, sales_qty, return_rate, channel_id, country_code, spu_id, dt_month | dt_month, country_code, channel_id |
| 数仓事实表 | fact_voc_trend | voc_cnt, voc_rate, sales_qty, voc_trend_12m, voc_source_type, mention_volume | dt_month, country_code, channel_id |
| 数仓事实表 | fact_voc_brand_summary | brand_id, voc_cnt, voc_rate, star_rating, bad_rate, tag_localized | dt_month, country_code |
| 数仓贴源 | ods_voc_external | platform, community_name, post_id, comment_id, topic_tags, sentiment_polarity, content_text | post_time / dt |
| 数仓维度表 | dim_voc_tag, dim_voc_external_community, dim_brand | 标签与社区、品牌属性 | — |
| 可选事实表 | fact_voc_external_daily | platform, country_code, topic_tag, post_cnt, comment_cnt | dt |
| 资产层 | ref/books/maternal_social_voc/ | 方法论、Reddit/垂类社区脚本与日志 | — |
| 资产层 | main_project_lute/voc社媒平台目录 | 海外母婴垂类社媒与社区平台清单与投放策略 | — |

---

## 调用的 Skills / 脚本

| 能力名称 | 路径/来源 | 调用场景 | 备注 |
|----------|------------|----------|------|
| 专题一分析 | data_example/scripts/run_专题一分析.py | 货架内/综合 VOC 分析 | 现有可复用 |
| maternal_social_voc 方法论 | ref/books/maternal_social_voc/（01-Reddit生态与方法论、02-日常VOC采集模板） | 货架外/垂类社区采集与标注 | 现有可复用 |
| reddit_voc_fetch 等脚本 | ref/books/maternal_social_voc/scripts/ | 外部社区抓取与日报 | 现有可复用 |
| voc社媒平台目录 | main_project_lute/voc社媒平台目录 | 垂类平台与区域策略参考，支持社区筛选与交叉线 2 | 文档型 Skill |
| 情绪/主题标注与高潜需求挖掘 | — | 货架外统一编码、第二大单品候选 | 待 Phase 2 实现 |
| 竞品声量对比与本土化话术提炼 | — | 子课题③ | 待 Phase 2 实现 |

---

## 输出格式

| 输出物 | 格式 | 消费者 |
|--------|------|--------|
| 货架内痛点亮点清单、NPS 相关结论 | 表 + 文本 | 分析岗、产品/客服 |
| 高潜需求清单、第二大单品候选池 | 表 + 清单 | 产品/IPMS、战略解码 Agent |
| 高浓度社区清单与话题/人群特征 | 表 + 清单 | 营销 Agent、专题④、交叉线 2 |
| 本土化话术与卖点清单 | 表/清单 | 营销、专题④ |
| 声量趋势雷达、机会风险清单 | 看板 + 表 | 渠道/流量、专题③④ |
| VOC 分层分析规则（按国家/渠道战略角色与流量结构） | 文档/配置 | VOC Agent 自身、营销 Agent、交叉线 4 |
| 专题① 结论摘要（JSON/文本） | JSON/文本 | 咨询 PPT Agent、管理层 |

---

## 与 01 矩阵的对应

- **本 Agent 消费的「库表建议」列中的表清单**：fact_voc_summary, fact_voc_trend, fact_voc_brand_summary, ods_voc_external, fact_voc_external_daily（可选）, dim_voc_tag, dim_voc_external_community, dim_brand, ods_review_detail（若有）。
