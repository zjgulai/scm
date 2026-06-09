---
title: 专题①声量趋势宽表规格草稿
doc_type: analysis
module: project-governance
topic: voc-topic-trend-wide-table-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题①声量趋势宽表规格草稿

## 1. 任务定位

本文承接 `VOC-DATA-005`，为专题① VOC / 洞察流的“全域 VOC 声量趋势”分支定义宽表草稿。

目标宽表暂定为：

- `dwt_voc_trend_radar`

服务对象：

- 指标族：`VOC-T4`
- BI 页面：`VOC-BI-004`
- Agent：`VOC-AGENT-004`

当前状态：`blocked`。

阻塞原因不是缺少趋势字段，而是真实 `fact_voc_trend`、来源类型、12 月趋势算法、标签趋势算法、外部聚合口径、渠道画像输入和营销背景输入尚未完成生产级确认。因此本文只定义宽表契约和数据治理门槛，不进入 `sql/`，不写生产 SQL。

## 2. 核心判断

`dwt_voc_trend_radar` 的边界是“全域 VOC 时间序列 + 来源结构 + 机会/风险线索”，不是竞品本土化主表，也不是营销 ROI 或渠道预算建议表。

纳入范围：

- 内部 VOC 汇总、外部 VOC 聚合、品牌/品类提及和来源结构的月度趋势。
- 国家、渠道、来源类型、品类、主题标签维度下的声量变化、评分变化、差评变化和标签趋势。
- 来自 CHANNEL / MKT 的国家渠道画像、生命周期、流量结构、活动背景，只作为分层解释输入。
- 趋势雷达、机会/风险候选、VOC 分层规则和跨专题输入线索。

不纳入范围：

- 货架外未满足需求主发现，该部分归 `dwt_voc_external_demand`。
- 竞品口碑、本土化话术和品牌评分对比，该部分归 `dwt_voc_competitor_localization`。
- 真实广告 ROI、预算加码、渠道收缩、投放形式建议。
- 由 mock 趋势直接得出的管理层动作。

反面论证：声量趋势也可以直接放进每个子课题的宽表中。本文不采用该路径，因为 T4 的业务问题是“国家、渠道、来源类型、品类和主题如何随时间变化”，其主轴是时间序列和跨专题解释，独立宽表能避免 T1/T2/T3 各自重复计算趋势口径。

## 3. 上游证据与引用路径

已对齐的上游材料：

- `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md`
- `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md`
- `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md`
- `drafts/analysis/voc-topic-competitor-localization-wide-table-spec-draft-20260603.md`
- `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md`
- `main_project_lute/全局数据资源整合/03_外部数据需求清单.md`
- `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md`
- `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md`
- `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md`
- `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线2_社媒VOC到垂类投放与营销ROI.md`
- `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线4_渠道与营销反哺VOC与产品.md`
- `main_project_lute/phase3_outputs/topic1_voc/voc_trend.csv`
- `main_project_lute/phase3_mock/fact_voc_trend_mock.csv`
- `main_project_lute/phase3_mock/fact_voc_summary_mock.csv`

证据分层：

| 证据 | 当前用途 | 状态 |
| --- | --- | --- |
| VOC 蓝图与指标字典 | 确认 `VOC-T4`、`VOC-BI-004`、`VOC-AGENT-004` 边界 | Amber |
| 数据矩阵与数仓主键设计 | 确认 `fact_voc_trend`、`fact_voc_summary`、`ods_voc_external` 聚合路径 | Amber |
| Phase1 故事线 | 确认“全域 VOC 声量趋势 -> 渠道与流量布局”的业务目标 | Amber |
| 交叉线2 / 交叉线4 | 确认 MKT / CHANNEL 只能作为输入或下游，不由 VOC 直接给 ROI / 预算结论 | Amber |
| Phase3 mock | 提供趋势字段形态，不作为生产事实 | Grey |

## 4. 宽表粒度

推荐主粒度：

```text
dt_month
+ country_code
+ channel_id
+ voc_source_type
+ category_l3
+ tag_key
+ brand_scope
```

解释：

- `dt_month` 与 `fact_voc_trend` 月粒度对齐。
- `country_code + channel_id` 是渠道、营销和 VOC 跨专题共享主轴。
- `voc_source_type` 区分 onshelf、external、community、social、service、review 等来源。
- `category_l3` 支持品类级趋势和产品线输入。
- `tag_key` 承接 `tag_l2/tag_l3/topic_tag/tag_trend`；无标签切片时使用 `_all`。
- `brand_scope` 区分 all、self、competitor、category-only；避免趋势表被品牌明细粒度拖乱。

不建议以单条评论、帖子或活动作为趋势宽表主粒度。明细只作为上游聚合来源和样本追溯，不直接进入趋势雷达主表。

## 5. 输入源优先级

| 优先级 | 输入源 | 角色 | 状态 |
| --- | --- | --- | --- |
| P0 | `fact_voc_trend` | 国家×渠道×来源类型×品类×月的趋势核心表 | blocked |
| P0 | `fact_voc_summary` | 内部 VOC、星级、好评率、差评率和销量对齐来源 | blocked |
| P1 | `fact_voc_external_daily` | 外部平台×国家×主题×日聚合来源 | blocked |
| P1 | `ods_voc_external` | 外部帖子/评论明细，作为外部聚合上游 | blocked |
| P1 | `dim_voc_tag` | 标签标准化与 `tag_key` 映射 | blocked |
| P1 | `dim_channel` | 渠道、站点、GTM 组映射 | candidate |
| P1 | `fact_channel_country_month` / `fact_channel_health` | CHANNEL 背景输入，只用于分层解释 | blocked |
| P1 | `fact_campaign_roi` / `fact_campaign_daily` | MKT 背景输入，只用于活动背景，不输出 ROI | blocked |
| P2 | `voc_trend.csv` | Phase3 趋势 mock，只支持字段映射参考 | mock |
| P2 | `fact_voc_trend_mock.csv`、`fact_voc_summary_mock.csv` | Phase3 演示数据，只支持样例验证 | mock |

进入 Green 前必须补齐：真实趋势源表、来源类型枚举、时间窗口、趋势算法、标签趋势算法、跨源去重、渠道映射和活动背景输入边界。

## 6. 输出字段契约

### 6.1 主键与时间窗口

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `dt_month` | date/string | 月份 | candidate |
| `period_start` | date | 周期开始日期 | candidate |
| `period_end` | date | 周期结束日期 | candidate |
| `country_code` | string | 国家码 | candidate |
| `channel_id` | string | 渠道 ID | candidate |
| `site` | string | 站点，如 Amazon US、DTC UK | candidate |
| `voc_source_type` | string | VOC 来源类型 | blocked |
| `category_l3` | string | 三级品类 | candidate |
| `tag_key` | string | 标签键；无标签切片时为 `_all` | blocked |
| `brand_scope` | string | all、self、competitor、category-only | candidate |
| `grain_hash` | string | 主粒度哈希，用于去重 | candidate |

### 6.2 声量与基础趋势指标

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `voc_cnt` | integer | VOC 量 | candidate |
| `voc_rate` | numeric | VOC 率 | blocked |
| `sales_qty` | integer | 对齐销量 | blocked |
| `mention_volume` | integer | 品牌/品类/主题提及量 | candidate |
| `post_cnt` | integer | 外部帖子数 | candidate |
| `comment_cnt` | integer | 外部评论数 | candidate |
| `review_cnt` | integer | 内部评论数 | candidate |
| `voc_cnt_prev_period` | integer | 上期 VOC 量 | candidate |
| `voc_cnt_chg` | numeric | 声量变化率 | candidate |
| `voc_cnt_yoy` | numeric | 声量同比 | blocked |
| `voc_trend_12m` | numeric | 12 月趋势值 | blocked |
| `trend_slope` | numeric | 趋势斜率 | blocked |
| `trend_direction` | string | up、down、flat、volatile | candidate |

`voc_trend_12m` 必须先确认算法是斜率、同比、移动平均、指数平滑还是模型输出。算法未确认时只允许保留字段，不允许输出正式结论。

### 6.3 评分、体验与风险指标

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `star_rating` | numeric | 平均星级 | candidate |
| `rating_chg` | numeric | 评分变化 | candidate |
| `good_rate` | numeric | 好评率 | candidate |
| `bad_rate` | numeric | 中差评率 | candidate |
| `bad_rate_chg` | numeric | 中差评率变化 | candidate |
| `return_rate` | numeric | 退货率背景 | blocked |
| `doa_rate` | numeric | DOA 率背景 | blocked |
| `risk_flag` | string | 风险标记 | blocked |
| `risk_reason_code` | string | 风险原因编码 | blocked |
| `opportunity_flag` | string | 机会标记 | blocked |
| `opportunity_reason_code` | string | 机会原因编码 | blocked |

`risk_flag` 和 `opportunity_flag` 只能表示 VOC 趋势候选信号。是否调整渠道、库存、营销或产品动作，必须由对应专题二次确认。

### 6.4 来源结构与标签趋势

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `source_voc_cnt` | integer | 当前来源 VOC 量 | candidate |
| `source_share` | numeric | 来源结构占比 | candidate |
| `source_share_chg` | numeric | 来源结构占比变化 | candidate |
| `tag_l2` | string | 二级标签 | candidate |
| `tag_l3` | string | 三级标签 | candidate |
| `topic_tag` | string | 外部主题标签 | candidate |
| `tag_trend` | numeric/string | 标签趋势值或趋势状态 | blocked |
| `tag_cnt` | integer | 标签命中量 | candidate |
| `tag_cnt_chg` | numeric | 标签命中变化率 | candidate |
| `dominant_tag` | string | 当前周期主导标签 | candidate |
| `emerging_tag_flag` | boolean | 是否新兴标签 | blocked |

标签趋势进入 Green 前必须先确认标签体系、跨源标签映射、重复标签处理和标签样本量门槛。

### 6.5 跨专题背景字段

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `lifecycle_stage` | string | 渠道生命周期阶段 | blocked |
| `gtm_group` | string | GTM 分组 | candidate |
| `channel_health_risk_flag` | string | 渠道健康风险背景 | blocked |
| `traffic_pct_organic` | numeric | 自然流量占比背景 | blocked |
| `traffic_pct_paid` | numeric | 付费流量占比背景 | blocked |
| `campaign_active_flag` | boolean | 当期是否有相关活动 | blocked |
| `campaign_type_context` | string | 活动类型背景 | blocked |
| `roas_context` | numeric | ROAS 背景值，只作解释输入 | blocked |
| `mkt_event_context` | string | 大促、投放、内容合作等背景 | blocked |

这些字段只能作为解释 VOC 趋势的上下文，不能由 VOC Agent 直接输出预算、投放加码、渠道收缩或 ROI 结论。

### 6.6 趋势雷达输出字段

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `trend_radar_level` | string | Grey、Amber、Green、Red 或 low/medium/high | blocked |
| `trend_radar_reason` | string | 趋势雷达触发原因 | blocked |
| `watchlist_flag` | boolean | 是否进入观察清单 | candidate |
| `watchlist_priority` | string | 观察优先级 | blocked |
| `handoff_target` | string | ORDER、CHANNEL、MKT、PRODUCT、SERVICE 等 | candidate |
| `handoff_reason` | string | 移交原因 | candidate |
| `handoff_allowed_flag` | boolean | 是否允许移交 | blocked |
| `recommended_action_type` | string | analyze、sample、review、handoff；不得写 budget / launch | candidate |

`recommended_action_type` 只允许触发分析、采样、复核或移交，不允许直接触发业务动作。

### 6.7 治理字段

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `source_system` | string | 来源系统或采集方式 | candidate |
| `source_file_or_job` | string | 来源文件或任务名 | candidate |
| `source_mix_status` | string | 内外部来源混合状态 | blocked |
| `evidence_level` | string | Grey、Amber、Green、Red | candidate |
| `dq_status` | string | 数据质量状态 | candidate |
| `sample_size` | integer | 有效样本数 | candidate |
| `trend_algorithm_status` | string | 趋势算法确认状态 | blocked |
| `source_type_review_status` | string | 来源类型复核状态 | blocked |
| `tag_review_status` | string | 标签趋势复核状态 | blocked |
| `cross_topic_context_status` | string | CHANNEL / MKT 背景输入确认状态 | blocked |
| `created_at` | timestamp | 入仓时间 | candidate |
| `updated_at` | timestamp | 更新时间 | candidate |

## 7. 指标计算边界

允许计算：

- `voc_cnt`、`mention_volume`、`post_cnt`、`comment_cnt`、`review_cnt`
- `voc_cnt_chg = (本期 voc_cnt - 上期 voc_cnt) / 上期 voc_cnt`
- `rating_chg = 本期 star_rating - 上期 star_rating`
- `source_share = source_voc_cnt / 同粒度全来源 voc_cnt`
- `tag_cnt_chg`
- 趋势观察清单和 handoff 候选

暂不允许计算为生产结论：

- `voc_trend_12m`
- `trend_radar_level`
- `risk_flag`
- `opportunity_flag`
- `watchlist_priority`
- `roas_context` 的因果解释
- 渠道加码 / 收缩建议
- 营销预算或投放形式建议

原因：这些结论需要趋势算法、跨源 DQ、渠道背景、营销活动背景和业务 Owner 共同确认。VOC 只能给出趋势线索。

## 8. Phase3 mock 映射

`voc_trend.csv` 当前字段包括 `dt_month`、`channel_id`、`voc_cnt`、`star_rating`、`good_rate`、`bad_rate`、`voc_cnt_chg`、`rating_chg`，可映射为：

| Phase3 字段 | 宽表候选字段 | 使用限制 |
| --- | --- | --- |
| `dt_month` | `dt_month` | 仅演示月份 |
| `channel_id` | `channel_id` | 需补国家、站点和渠道映射 |
| `voc_cnt` | `voc_cnt` | mock 声量，不代表生产声量 |
| `star_rating` | `star_rating` | mock 评分 |
| `good_rate` | `good_rate` | mock 好评率 |
| `bad_rate` | `bad_rate` | mock 中差评率 |
| `voc_cnt_chg` | `voc_cnt_chg` | 可复用变化率公式，但需处理上期为 0 / 缺失 |
| `rating_chg` | `rating_chg` | 可复用评分变化公式 |

`fact_voc_trend_mock.csv` 可映射 `country_code`、`channel_id`、`voc_source_type`、`dt_month`、`voc_cnt`、`voc_rate`、`voc_trend_12m`、`mention_volume`，但仍属于 mock。

`fact_voc_summary_mock.csv` 可辅助内部 VOC 趋势字段设计，但不能证明真实内部源表已经可用。

## 9. 数据质量门槛

进入 Green 前至少满足以下 gate：

| Gate ID | 检查项 | 当前状态 |
| --- | --- | --- |
| `VOC-DQ-TREND-SCHEMA-001` | `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily` 字段存在且类型稳定 | blocked |
| `VOC-DQ-TREND-GRAIN-001` | `dt_month + country_code + channel_id + voc_source_type + category_l3 + tag_key + brand_scope` 粒度不重复 | blocked |
| `VOC-DQ-TREND-SOURCE-001` | `voc_source_type` 枚举稳定，内外部来源不混写 | blocked |
| `VOC-DQ-TREND-TIME-001` | 月份、采集窗口、评论时间、工单时间和外部帖子时间归集规则确认 | blocked |
| `VOC-DQ-TREND-ALG-001` | `voc_trend_12m`、`trend_slope`、`trend_direction` 算法确认 | blocked |
| `VOC-DQ-TREND-TAG-001` | `tag_key`、`tag_trend`、`emerging_tag_flag` 经过标签口径确认 | blocked |
| `VOC-DQ-TREND-ZERO-001` | 上期为 0、样本缺失、小样本波动的处理规则确认 | blocked |
| `VOC-DQ-TREND-CROSS-001` | CHANNEL / MKT 背景输入只作上下文，不进入 VOC 因果结论 | blocked |
| `VOC-DQ-TREND-HANDOFF-001` | handoff 目标、原因和允许条件经过 Owner 确认 | blocked |
| `VOC-DQ-TREND-CLAIM-001` | 输出结论不写渠道加码、预算、ROI 或管理动作 | blocked |

任一 gate 未通过时，`VOC-BI-004` 只能展示探索态，`VOC-AGENT-004` 只能输出趋势摘要和待确认清单。

## 10. BI 与 Agent 消费方式

`VOC-BI-004` 建议读取：

- 趋势折线：`voc_cnt`、`mention_volume`、`star_rating`、`bad_rate`。
- 来源堆叠：`voc_source_type` 和 `source_share`。
- 国家×渠道矩阵：`country_code`、`channel_id`、`lifecycle_stage`。
- 标签趋势：`tag_key`、`tag_cnt_chg`、`emerging_tag_flag`。
- 风险提示：`risk_flag`、`risk_reason_code`、`evidence_level`。

`VOC-AGENT-004` 建议读取：

- `trend_direction`、`voc_cnt_chg`、`rating_chg`。
- `source_share_chg` 和来源结构异常。
- `tag_trend`、`dominant_tag`、`emerging_tag_flag`。
- `lifecycle_stage`、`campaign_type_context`、`roas_context`，仅作解释背景。
- `handoff_target`、`handoff_reason`、`handoff_allowed_flag`。

Agent 输出限制：

- 必须标注证据等级。
- 必须列出趋势算法、来源类型和样本量状态。
- 不把声量变化写成市场规模变化。
- 不把 VOC 趋势写成 ROI 因果。
- 不输出渠道加码、预算、投放形式或活动动作。
- 只允许输出趋势摘要、风险/机会线索、待采样清单和 handoff 候选。

## 11. 当前不能做的事项

当前明确禁止：

- 把 `voc_trend.csv` 直接提升为正式宽表。
- 将 `voc_trend_12m` 当作已确认算法。
- 将外部样本声量直接外推为市场需求变化。
- 在 `sql/` 创建 `dwt_voc_trend_radar` 的生产 SQL。
- 在没有来源类型枚举时输出来源结构结论。
- 在没有 CHANNEL / MKT Owner 确认时输出渠道或营销动作。
- 将 `roas_context` 写成 VOC 趋势的因果解释。

## 12. 下一步

下一步进入 `VOC-BI-001`：

- 文件：`drafts/docs/voc-bi-service-quality-overview-prd-draft-20260603.md`
- 目标：为货架内服务质量与体验页面建立 PRD 草稿。

`VOC-BI-001` 应读取 `dwt_voc_service_experience` 的字段契约，重点定义 KPI 卡、痛点 Pareto、星级分布、SPU 下钻和样本证据抽屉，避免直接进入 SQL 或生产看板。

## 13. 需要用户后续决策

需要确认的关键点：

1. `voc_source_type` 是否采用 onshelf、external、community、social、service、review 这组枚举。
2. `voc_trend_12m` 的算法采用斜率、同比、移动平均还是指数平滑。
3. 标签趋势是否先只做 `tag_l2/tag_l3`，暂不并入外部 `topic_tag`。
4. CHANNEL / MKT 背景字段是否进入第一版 BI，还是只留给 Agent 解释。
5. handoff 是否需要正式 Owner 确认流，避免 VOC Agent 直接推动业务动作。
