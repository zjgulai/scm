---
title: 趋势预警与异常漂移 Agent 任务规格草稿
doc_type: workflow
module: project-governance
topic: voc-agent-trend-radar-task-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 趋势预警与异常漂移 Agent 任务规格草稿

## 1. Agent 定位

`VOC-AGENT-004` 绑定 `VOC-T4` 与 `VOC-BI-004`，服务于全域 VOC 声量趋势、来源结构异常、标签趋势漂移和跨专题 handoff 候选。

它的任务不是给渠道、营销或管理层动作建议，而是把 `dwt_voc_trend_radar` 宽表中的趋势算法缺口、来源枚举缺口、小样本波动、标签趋势复核、跨专题背景确认和输出越权风险转成可处理任务。

当前状态保持 `blocked`。阻塞原因是 `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily`、来源类型枚举、12 月趋势算法、标签趋势算法、跨源去重、渠道画像输入和营销背景输入尚未完成生产级确认。

本文件只定义 Agent 任务规格，不创建 Agent 代码、不创建生产 SQL、不创建运行脚本。

## 2. Agent 职责边界

允许处理的任务：

- 趋势算法确认任务。
- 来源类型枚举复核任务。
- 内外部来源混写检查任务。
- 月份、采集窗口、评论时间、工单时间和外部帖子时间归集规则复核任务。
- 上期为 0、样本缺失、小样本波动的处理规则任务。
- 标签趋势、主导标签和新兴标签复核任务。
- 来源结构变化、声量变化和评分变化的异常线索任务。
- CHANNEL / MKT 背景输入确认任务。
- `handoff_target`、`handoff_reason` 和 `handoff_allowed_flag` 的 Owner 确认任务。
- 输出越权拦截任务。

禁止处理的任务：

- 不输出渠道加码。
- 不输出渠道收缩。
- 不输出预算调整。
- 不输出投放形式。
- 不输出活动动作。
- 不输出库存动作。
- 不把声量变化写成市场规模变化。
- 不把 VOC 趋势写成 ROI 因果。
- 不把 `roas_context` 写成趋势原因。
- 不把 `voc_trend.csv` 或 mock 表写成生产事实。
- 不把 `voc_trend_12m` 写成已确认算法。

## 3. 证据来源

| 证据源 | 用途 | 当前证据等级 |
|---|---|---|
| `drafts/docs/voc-bi-trend-radar-prd-draft-20260603.md` | 页面、Agent 队列、行动白名单和禁用项 | Amber |
| `drafts/analysis/voc-topic-trend-wide-table-spec-draft-20260603.md` | `dwt_voc_trend_radar` 宽表草案、DQ gates 和字段契约 | Amber |
| `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | `VOC-T4`、`VOC-BI-004`、`VOC-AGENT-004` 蓝图边界 | Amber |
| `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | 趋势指标、来源维度、标签趋势和风险标记状态 | Amber |
| `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md` | 外部 VOC 聚合与主题趋势边界 | Amber |
| `drafts/analysis/voc-topic-competitor-localization-wide-table-spec-draft-20260603.md` | 竞品与本土化趋势背景边界 | Amber |
| `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | `fact_voc_trend` 与专题④数据需求 | Amber |
| `main_project_lute/全局数据资源整合/03_外部数据需求清单.md` | 外部 VOC 与渠道 / 社媒背景需求 | Amber |
| `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily` 主键与粒度 | Amber |
| `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | VOC 与 CHANNEL / MKT 字段边界 | Amber |
| `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md` | 全域声量趋势业务叙事 | Amber |
| `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线2_社媒VOC到垂类投放与营销ROI.md` | VOC -> MKT 输入边界 | Amber |
| `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线4_渠道与营销反哺VOC与产品.md` | CHANNEL / MKT -> VOC 分层背景 | Amber |
| `main_project_lute/phase3_outputs/topic1_voc/voc_trend.csv` | 趋势字段 mock 样例 | Grey |
| `main_project_lute/phase3_mock/fact_voc_trend_mock.csv` | 国家×渠道×来源类型趋势 mock 样例 | Grey |
| `main_project_lute/phase3_mock/fact_voc_summary_mock.csv` | 内部 VOC 趋势字段 mock 样例 | Grey |

Grey 来源只能用于字段形态、任务类型和页面结构验证，不能作为生产趋势、风险、机会或渠道动作依据。

## 4. 上游表与样例文件关系

- `fact_voc_trend` 承载国家×渠道×来源类型×品类×月份的趋势核心表。
- `fact_voc_summary` 承载内部 VOC、星级、好评率、差评率和销量对齐来源。
- `fact_voc_external_daily` 承载平台×国家×主题×日的外部聚合来源。
- `ods_voc_external` 承载外部帖子和评论明细。
- `dim_voc_tag` 承载标签标准化与 `tag_key` 映射。
- `dim_channel` 承载渠道、站点和 GTM 分组映射。
- `fact_channel_country_month` 与 `fact_channel_health` 只作为 CHANNEL 背景输入。
- `fact_campaign_daily` 与 `fact_campaign_roi` 只作为 MKT 背景输入，不允许由 VOC Agent 解释 ROI 因果。
- `voc_trend.csv`、`fact_voc_trend_mock.csv`、`fact_voc_summary_mock.csv` 只作为 mock 样例。

## 5. 输入契约

### 5.1 页面上下文

Agent 必须接收以下页面筛选与上下文字段：

- `dt_month`
- `period_start`
- `period_end`
- `country_code`
- `channel_id`
- `site`
- `voc_source_type`
- `category_l3`
- `tag_key`
- `tag_l2`
- `tag_l3`
- `topic_tag`
- `brand_scope`
- `gtm_group`
- `lifecycle_stage`
- `evidence_level`
- `dq_status`
- `trend_algorithm_status`
- `source_type_review_status`
- `tag_review_status`
- `source_mix_status`
- `cross_topic_context_status`

### 5.2 声量与趋势指标

- `voc_cnt`
- `voc_rate`
- `sales_qty`
- `mention_volume`
- `post_cnt`
- `comment_cnt`
- `review_cnt`
- `voc_cnt_prev_period`
- `voc_cnt_chg`
- `voc_cnt_yoy`
- `voc_trend_12m`
- `trend_slope`
- `trend_direction`
- `star_rating`
- `rating_chg`
- `good_rate`
- `bad_rate`
- `bad_rate_chg`

### 5.3 来源结构与标签趋势

- `source_voc_cnt`
- `source_share`
- `source_share_chg`
- `source_system`
- `source_file_or_job`
- `tag_trend`
- `tag_cnt`
- `tag_cnt_chg`
- `dominant_tag`
- `emerging_tag_flag`

### 5.4 跨专题背景字段

- `channel_health_risk_flag`
- `traffic_pct_organic`
- `traffic_pct_paid`
- `campaign_active_flag`
- `campaign_type_context`
- `roas_context`
- `mkt_event_context`

这些字段只作为解释背景。`VOC-AGENT-004` 不得把它们写成因果结论。

### 5.5 输出控制字段

- `trend_radar_level`
- `trend_radar_reason`
- `watchlist_flag`
- `watchlist_priority`
- `handoff_target`
- `handoff_reason`
- `handoff_allowed_flag`
- `recommended_action_type`
- `sample_size`
- `grain_hash`

## 6. 触发条件

| 条件 | 任务类型 | 处理目标 |
|---|---|---|
| `trend_algorithm_status = blocked` | `trend_algorithm_review` | 确认 `voc_trend_12m`、`trend_slope`、`trend_direction` 算法 |
| `source_type_review_status = blocked` | `source_type_enum_review` | 确认 onshelf、external、community、social、service、review 等来源枚举 |
| `source_mix_status = blocked` | `source_mix_review` | 阻止内外部来源直接相加或混写 |
| 时间窗口字段缺失或冲突 | `time_window_review` | 确认月份、采集窗口和不同来源时间归集 |
| `sample_size` 低于阈值 | `small_sample_review` | 降级趋势证据或请求补样 |
| 上期为 0 或缺失 | `zero_denominator_review` | 审查 `voc_cnt_chg` 是否可计算 |
| `tag_review_status != stable` | `tag_trend_review` | 审查 `tag_key`、`tag_trend`、`emerging_tag_flag` |
| `source_share_chg` 异常但来源状态不稳定 | `source_share_drift_review` | 审查来源结构漂移线索 |
| `voc_cnt_chg` 或 `rating_chg` 异常 | `trend_drift_review` | 生成趋势漂移审查任务，不输出业务动作 |
| `cross_topic_context_status = blocked` | `cross_topic_context_review` | 确认 CHANNEL / MKT 背景输入可用性 |
| `handoff_target` 有值但 `handoff_allowed_flag = false` | `handoff_owner_review` | 请求 Owner 确认 handoff 条件 |
| `recommended_action_type` 超出白名单 | `action_policy_violation_review` | 拦截预算、投放、渠道、库存等动作 |
| 任一 DQ 失败 | `dq_blocker_review` | 生成数据治理阻塞任务 |

## 7. DQ Gate

| DQ ID | Gate | 阻塞条件 |
|---|---|---|
| `VOC-DQ-TREND-SCHEMA-001` | 表结构完整性 | `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily` 字段缺失或类型不稳定 |
| `VOC-DQ-TREND-GRAIN-001` | 粒度一致性 | `dt_month + country_code + channel_id + voc_source_type + category_l3 + tag_key + brand_scope` 重复或冲突 |
| `VOC-DQ-TREND-SOURCE-001` | 来源枚举 | `voc_source_type` 枚举不稳定，内外部来源混写 |
| `VOC-DQ-TREND-TIME-001` | 时间归集 | 月份、采集窗口、评论时间、工单时间、外部帖子时间规则不一致 |
| `VOC-DQ-TREND-ALG-001` | 趋势算法 | `voc_trend_12m`、`trend_slope`、`trend_direction` 算法未确认 |
| `VOC-DQ-TREND-TAG-001` | 标签趋势 | `tag_key`、`tag_trend`、`emerging_tag_flag` 未经过标签口径确认 |
| `VOC-DQ-TREND-ZERO-001` | 小样本与 0 分母 | 上期为 0、样本缺失、小样本波动处理规则未确认 |
| `VOC-DQ-TREND-CROSS-001` | 跨专题背景 | CHANNEL / MKT 背景输入被写成 VOC 因果解释 |
| `VOC-DQ-TREND-HANDOFF-001` | Handoff Owner | `handoff_target`、`handoff_reason`、`handoff_allowed_flag` 未经 Owner 确认 |
| `VOC-DQ-TREND-CLAIM-001` | 结论降级 | 输出结论写成渠道加码、预算、ROI、投放形式或管理动作 |

任一 DQ 为 `blocked` 时，Agent 只能生成治理任务、趋势摘要草案和待确认清单，不允许生成业务动作。

## 8. 输出契约

### 8.1 任务队列

Agent 输出任务队列必须包含：

- `task_id`
- `task_type`
- `severity`
- `evidence_level`
- `dq_ids`
- `dt_month`
- `period_start`
- `period_end`
- `country_code`
- `channel_id`
- `site`
- `voc_source_type`
- `category_l3`
- `tag_key`
- `brand_scope`
- `metric_name`
- `metric_value`
- `metric_status`
- `sample_size`
- `trend_algorithm_status`
- `source_type_review_status`
- `tag_review_status`
- `source_mix_status`
- `cross_topic_context_status`
- `blocking_reason`
- `requested_evidence`
- `handoff_target`
- `handoff_reason`
- `handoff_allowed_flag`
- `recommended_action_type`
- `owner_agent`

`owner_agent` 固定为 `VOC-AGENT-004`。

### 8.2 趋势摘要候选

趋势摘要只能作为候选，字段包括：

- `trend_candidate_title`
- `trend_candidate_scope`
- `trend_direction`
- `voc_cnt_chg`
- `rating_chg`
- `source_share_chg`
- `tag_cnt_chg`
- `supporting_metrics`
- `supporting_sample_size`
- `trend_algorithm_status`
- `source_type_review_status`
- `blocking_reason`

当 `trend_algorithm_status != stable` 或 `sample_size` 低于阈值时，趋势摘要必须保持 `candidate`。

### 8.3 来源结构漂移审查

来源结构漂移输出必须包含：

- `voc_source_type`
- `source_voc_cnt`
- `source_share`
- `source_share_chg`
- `source_mix_status`
- `source_system`
- `source_file_or_job`
- `blocking_reason`

`source_share_chg` 只作为异常线索，不作为投放动作依据。

### 8.4 标签趋势审查

标签趋势输出必须包含：

- `tag_key`
- `tag_l2`
- `tag_l3`
- `topic_tag`
- `tag_trend`
- `tag_cnt`
- `tag_cnt_chg`
- `dominant_tag`
- `emerging_tag_flag`
- `tag_review_status`
- `blocking_reason`

`emerging_tag_flag` 未稳定前，不允许写成“新兴需求已出现”。

### 8.5 Handoff 候选

| `handoff_target` | 允许事项 | 禁止事项 |
|---|---|---|
| `ORDER` | 复核退款率、履约、退货主题是否解释 VOC 趋势 | 直接输出订单根因 |
| `CHANNEL` | 复核国家×渠道画像、生命周期和流量结构背景 | 输出渠道加码、渠道收缩或渠道拓展 |
| `MKT` | 复核活动背景、内容合作和投放背景 | 输出预算、投放形式、活动动作或 ROI 结论 |
| `PRODUCT` | 复核产品体验、标签趋势和功能痛点 | 输出未经验证的产品改造结论 |
| `SERVICE` | 复核客服、评论、服务体验和差评变化 | 输出管理层问责或流程动作 |
| `DATA` | 补字段、补样本、修 DQ、稳定算法和来源枚举 | 直接给业务结论背书 |

`handoff_allowed_flag = false` 时，Agent 只能输出 Owner 确认任务。

## 9. 推荐动作白名单

允许的 `recommended_action_type`：

- `analyze`
- `sample`
- `review`
- `handoff`

禁止的 `recommended_action_type`：

- `budget`
- `launch`
- `expand_channel`
- `shrink_channel`
- `inventory_action`
- `promotion_action`
- `price_action`
- `management_action`

发现禁止值时，Agent 必须生成 `action_policy_violation_review`，并把对应输出降级为 `Red`。

## 10. 状态机

| 状态 | 定义 | Agent 行为 |
|---|---|---|
| `Grey` | 来源为 mock、规划、外部参考或样例输出 | 只生成字段缺口和治理任务 |
| `Amber` | 有候选趋势数据，但 DQ、算法或 Owner 未完全通过 | 生成趋势摘要候选、待确认项和 handoff 候选 |
| `Green` | 源表、粒度、来源枚举、算法、标签和跨专题背景均 stable | 允许进入正式 BI 候选，但仍不自动输出业务动作 |
| `Red` | 数据质量失败、来源混写或输出越权 | 阻断趋势结论并生成修复任务 |

## 11. 验收标准

- 页面 `VOC-BI-004` 能显示 `VOC-AGENT-004` 的任务队列来源和阻塞原因。
- `trend_algorithm_review` 能定位 `voc_trend_12m`、`trend_slope`、`trend_direction` 的算法缺口。
- `source_type_enum_review` 能定位 `voc_source_type` 枚举缺口。
- `source_mix_review` 能阻断内部 VOC、外部社区、社媒和服务来源混写。
- `time_window_review` 能定位月份、采集窗口和来源时间归集冲突。
- `small_sample_review` 与 `zero_denominator_review` 能阻断假趋势。
- `tag_trend_review` 能定位标签趋势和新兴标签复核状态。
- `cross_topic_context_review` 能防止 CHANNEL / MKT 背景被写成 VOC 因果。
- `handoff_owner_review` 能要求 Owner 确认 handoff 条件。
- `action_policy_violation_review` 能拦截预算、投放、渠道、库存和管理动作。
- 所有 mock、草稿、外部参考证据默认不升级为 `Green`。
- 任一 DQ 失败时，页面只显示治理任务，不显示业务动作。

## 12. 当前禁止动作

- 不进入 `sql/`。
- 不写生产 SQL。
- 不创建 Agent 运行脚本。
- 不创建正式区文档。
- 不输出渠道加码。
- 不输出渠道收缩。
- 不输出预算调整。
- 不输出投放形式。
- 不输出活动动作。
- 不输出库存动作。
- 不把声量变化写成市场规模变化。
- 不把 VOC 趋势写成 ROI 因果。
- 不把 `roas_context` 写成趋势原因。
- 不把 `voc_trend.csv`、`fact_voc_trend_mock.csv`、`fact_voc_summary_mock.csv` 当作生产事实表。
- 不把 `voc_trend_12m` 写成已确认算法。

## 13. 待决策事项

| 决策项 | 当前建议 | 需要确认的问题 |
|---|---|---|
| `voc_source_type` 枚举 | 第一版使用 onshelf、external、community、social、service、review | 是否需要拆分 review 与 service，或增加 marketplace / forum |
| `voc_trend_12m` 算法 | 先不选算法，保留 `trend_algorithm_status` | 是否采用斜率、同比、移动平均或指数平滑 |
| 标签趋势粒度 | 第一版先分开 `tag_l2/tag_l3` 与外部 `topic_tag` | 是否允许跨源统一到同一 `tag_key` |
| 小样本阈值 | 按国家×渠道×来源类型×标签设置最小样本量 | 阈值由 DATA、业务 Owner 还是页面配置确定 |
| CHANNEL / MKT 背景入页方式 | 只入解释区，不进入核心趋势结论 | 是否需要第一版就加入 `fact_campaign_roi` 背景字段 |
| Handoff Owner 流程 | 所有 handoff 先要求 Owner 确认 | Owner 记录是否需要单独表或工单系统承接 |

## 14. 下一步

`VOC-AGENT-001`、`VOC-AGENT-002`、`VOC-AGENT-003`、`VOC-AGENT-004` 已形成专题①四个 Agent 任务规格草稿链路。

下一步建议进入专题①汇总检查点：

- 文件：`drafts/analysis/voc-topic-agent-spec-governance-checkpoint-draft-20260603.md`
- 目标：汇总四个 VOC Agent 的证据等级、blocked gates、禁止动作、用户待决策项和是否可以进入 `VOC-SQL-001` 前置规格。
