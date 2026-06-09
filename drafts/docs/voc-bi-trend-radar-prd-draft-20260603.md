---
title: 全域 VOC 趋势与渠道输入页面 PRD 草稿
doc_type: prd
module: project-governance
topic: voc-bi-trend-radar-prd
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 全域 VOC 趋势与渠道输入页面 PRD 草稿

## 1. 页面定位

`VOC-BI-004` 是专题①全域 VOC 数据洞察下的声量趋势与渠道输入页面。

页面服务于 `VOC-T4`，由 `VOC-AGENT-004` 承接趋势摘要、来源结构异常、标签趋势复核、渠道 / 营销背景解释和 handoff 候选输出。

当前页面读取草稿宽表 `dwt_voc_trend_radar`。该宽表仍处于 blocked 状态，因此本页只允许作为 PRD 和 BI 页面草稿，不进入 `sql/`，不写生产 SQL，不定义生产调度。

本页是“趋势雷达 + 跨专题输入线索”页面，不是渠道策略决策页、营销 ROI 页、预算建议页或活动动作页。页面只允许输出趋势摘要、风险 / 机会线索、待采样清单和 handoff 候选。

## 2. 核心业务问题

1. 国家、渠道、来源类型、品类和主题的 VOC 声量如何变化。
2. 内部 VOC、外部社区、社媒、评论和服务来源结构是否发生异常变化。
3. 星级、好评率、中差评率和评分变化是否提示服务体验风险。
4. 哪些 `tag_key`、`tag_l2`、`tag_l3`、`topic_tag` 出现趋势变化或新兴迹象。
5. 哪些趋势信号需要移交给 ORDER、CHANNEL、MKT、PRODUCT 或 SERVICE 专题继续判断。
6. 哪些趋势字段、来源枚举、标签算法或跨专题背景仍阻塞 Green 状态。

本页不回答以下问题：

1. 不把声量变化写成市场规模变化。
2. 不把 VOC 趋势写成 ROI 因果。
3. 不输出渠道加码、渠道收缩、预算调整、投放形式或活动动作。
4. 不把 `voc_trend_12m` 当作已确认算法。
5. 不把 `roas_context` 写成 VOC 趋势原因。
6. 不把 Phase3 mock 趋势写成生产事实。

## 3. 证据来源

| 来源 | 路径 | 证据等级 | 用途 |
| --- | --- | --- | --- |
| 专题蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | Amber | `VOC-T4`、`VOC-BI-004`、`VOC-AGENT-004` 边界 |
| 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | Amber | 趋势指标、状态字段、禁用解释 |
| 趋势宽表草稿 | `drafts/analysis/voc-topic-trend-wide-table-spec-draft-20260603.md` | Amber | `dwt_voc_trend_radar` 字段契约和 DQ gates |
| 货架外宽表草稿 | `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md` | Amber | 外部社区与主题输入边界 |
| 竞品本土化宽表草稿 | `drafts/analysis/voc-topic-competitor-localization-wide-table-spec-draft-20260603.md` | Amber | 品牌 / 竞品趋势背景边界 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | Amber | `fact_voc_trend` 与专题④数据需求 |
| 外部数据清单 | `main_project_lute/全局数据资源整合/03_外部数据需求清单.md` | Amber | 外部 VOC 与渠道 / 社媒背景需求 |
| 数仓设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | Amber | `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily` 主键 |
| 字段口径说明 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | Amber | VOC 与 CHANNEL / MKT 字段边界 |
| VOC 故事线 | `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md` | Amber | 全域声量趋势业务叙事 |
| 交叉线2 | `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线2_社媒VOC到垂类投放与营销ROI.md` | Amber | VOC -> MKT 输入边界 |
| 交叉线4 | `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线4_渠道与营销反哺VOC与产品.md` | Amber | CHANNEL / MKT -> VOC 分层背景 |
| Phase3 输出 | `main_project_lute/phase3_outputs/topic1_voc/voc_trend.csv` | Grey | 趋势字段 mock 样例 |
| Phase3 mock | `main_project_lute/phase3_mock/fact_voc_trend_mock.csv` | Grey | 国家×渠道×来源类型趋势 mock 样例 |
| Phase3 mock | `main_project_lute/phase3_mock/fact_voc_summary_mock.csv` | Grey | 内部 VOC 趋势字段 mock 样例 |

Grey 来源只能用于页面结构和字段形态验证，不能作为生产趋势、风险、机会或渠道动作依据。

## 4. 目标用户

| 用户 | 使用目标 | 页面约束 |
| --- | --- | --- |
| 销售运营与渠道团队 | 发现国家×渠道层面的 VOC 趋势线索 | 只接收 handoff 候选，不直接调整渠道策略 |
| 市场与内容团队 | 识别来源结构、主题和社媒声量变化 | 只接收采样和复核线索，不直接调整预算 |
| 产品与服务团队 | 追踪评分、差评率、标签趋势和服务风险 | 只接收风险候选，不替代根因分析 |
| BI 与数据团队 | 校验趋势粒度、来源枚举、算法和 DQ gates | 关注 blocked 字段与数据质量 |
| `VOC-AGENT-004` | 输出趋势摘要、待确认项和 handoff 候选 | 不输出渠道、预算、投放或 ROI 动作 |

## 5. 页面流程

1. 全局筛选与证据状态条。
2. 趋势雷达总览。
3. VOC 声量趋势折线。
4. 来源结构堆叠。
5. 国家×渠道趋势矩阵。
6. 标签趋势与新兴主题观察。
7. 评分、好评率和中差评率变化。
8. CHANNEL / MKT 背景解释区。
9. Handoff 候选与 `VOC-AGENT-004` 待办队列。

页面从“趋势是否可信”进入，再看“趋势在哪里变化”，最后输出“应由哪个专题继续判断”。页面不得从 VOC 趋势直接跳到渠道或营销动作。

## 6. 全局筛选

| 筛选项 | 字段 | 说明 |
| --- | --- | --- |
| 月份 | `dt_month`、`period_start`、`period_end` | 默认最近可用月份；时间窗口需可见 |
| 国家 | `country_code` | 支持单国、多国对比 |
| 渠道 | `channel_id`、`site` | 需与 `dim_channel` 对齐 |
| VOC 来源类型 | `voc_source_type` | onshelf、external、community、social、service、review 等枚举待确认 |
| 品类 | `category_l3` | 支持品类级趋势 |
| 标签 | `tag_key`、`tag_l2`、`tag_l3`、`topic_tag` | 标签体系未稳定前保持 candidate / blocked |
| 品牌范围 | `brand_scope` | all、self、competitor、category-only |
| GTM 分组 | `gtm_group` | 只作渠道背景输入 |
| 渠道生命周期 | `lifecycle_stage` | blocked 前只作背景候选 |
| 证据等级 | `evidence_level` | Grey、Amber、Green、Red |
| 趋势算法状态 | `trend_algorithm_status` | blocked、review、stable |
| 来源类型复核状态 | `source_type_review_status` | blocked、review、stable |
| 标签复核状态 | `tag_review_status` | blocked、review、stable |
| 跨专题背景状态 | `cross_topic_context_status` | blocked、review、stable |

## 7. 页面模块

### 7.1 证据状态条

目的：先判断当前筛选下的趋势是否能被解释。

字段：

| 字段 | 展示方式 | 解释 |
| --- | --- | --- |
| `evidence_level` | 状态标签 | 页面证据等级 |
| `dq_status` | 状态标签 | 数据质量状态 |
| `sample_size` | 数值 | 当前筛选下有效样本数 |
| `trend_algorithm_status` | 状态标签 | 趋势算法是否确认 |
| `source_type_review_status` | 状态标签 | 来源类型枚举是否确认 |
| `tag_review_status` | 状态标签 | 标签趋势是否复核 |
| `source_mix_status` | 状态标签 | 内外部来源是否混写 |
| `cross_topic_context_status` | 状态标签 | CHANNEL / MKT 背景输入是否确认 |

本页 DQ 编码使用 `VOC-DQ-TREND-*` 族，包括 `VOC-DQ-TREND-SCHEMA-001`、`VOC-DQ-TREND-GRAIN-001`、`VOC-DQ-TREND-SOURCE-001`、`VOC-DQ-TREND-TIME-001`、`VOC-DQ-TREND-ALG-001`、`VOC-DQ-TREND-TAG-001`、`VOC-DQ-TREND-ZERO-001`、`VOC-DQ-TREND-CROSS-001`、`VOC-DQ-TREND-HANDOFF-001`、`VOC-DQ-TREND-CLAIM-001`。

状态解释：

| 状态 | 页面行为 |
| --- | --- |
| Grey | 只展示 mock 结构和字段样例 |
| Amber | 展示候选趋势，必须标注待复核 |
| Green | 允许进入正式 BI 候选，但仍需保留来源链路 |
| Red | 禁止展示趋势结论，只显示缺口和待办 |

### 7.2 趋势雷达总览

目的：展示哪些国家、渠道、来源类型或品类进入观察。

字段：

| 字段 | 说明 |
| --- | --- |
| `trend_radar_level` | 趋势雷达等级，当前 blocked |
| `trend_radar_reason` | 趋势触发原因，当前 blocked |
| `watchlist_flag` | 是否进入观察清单 |
| `watchlist_priority` | 观察优先级，当前 blocked |
| `handoff_target` | 候选移交对象 |
| `handoff_reason` | 候选移交原因 |
| `handoff_allowed_flag` | 是否允许移交，当前 blocked |

展示规则：

1. `trend_radar_level` 未稳定前，只展示 Grey / Amber 状态。
2. `watchlist_flag` 只表示需要观察，不表示需要业务动作。
3. `handoff_allowed_flag = false` 时，只展示待确认原因。

### 7.3 VOC 声量趋势折线

目的：展示 VOC 声量、提及量和基础体验指标的时间变化。

字段：

| 字段 | 说明 |
| --- | --- |
| `voc_cnt` | VOC 量 |
| `mention_volume` | 品牌 / 品类 / 主题提及量 |
| `review_cnt` | 内部评论数 |
| `post_cnt` | 外部帖子数 |
| `comment_cnt` | 外部评论数 |
| `voc_cnt_prev_period` | 上期 VOC 量 |
| `voc_cnt_chg` | 声量变化率 |
| `voc_cnt_yoy` | 声量同比，当前 blocked |
| `voc_trend_12m` | 12 月趋势值，当前 blocked |
| `trend_slope` | 趋势斜率，当前 blocked |
| `trend_direction` | up、down、flat、volatile |

展示规则：

1. `voc_cnt_chg` 可展示为候选变化率，但必须处理上期为 0、缺失和小样本波动。
2. `voc_trend_12m` 在算法未确认前只显示为字段缺口。
3. 声量上升只表示被讨论更多，不表示市场需求扩大。

### 7.4 来源结构堆叠

目的：展示内外部来源的结构变化。

字段：

| 字段 | 说明 |
| --- | --- |
| `voc_source_type` | 来源类型 |
| `source_voc_cnt` | 当前来源 VOC 量 |
| `source_share` | 来源占比 |
| `source_share_chg` | 来源占比变化 |
| `source_system` | 来源系统或采集方式 |
| `source_file_or_job` | 来源文件或任务名 |
| `source_mix_status` | 来源混合状态 |

展示规则：

1. 来源类型枚举未确认前，不输出来源结构结论。
2. 外部来源声量不能与内部评论 / 工单声量直接相加为市场规模。
3. `source_share_chg` 只作为异常线索，不作为投放动作依据。

### 7.5 国家×渠道趋势矩阵

目的：把 VOC 趋势放入国家和渠道背景中观察。

字段：

| 字段 | 说明 |
| --- | --- |
| `country_code` | 国家 |
| `channel_id` | 渠道 |
| `site` | 站点 |
| `gtm_group` | GTM 分组 |
| `lifecycle_stage` | 渠道生命周期阶段 |
| `channel_health_risk_flag` | 渠道健康风险背景 |
| `traffic_pct_organic` | 自然流量占比背景 |
| `traffic_pct_paid` | 付费流量占比背景 |

展示规则：

1. CHANNEL 字段只作解释背景。
2. `lifecycle_stage` 未确认前，不输出渠道成熟度判断。
3. VOC 页面不输出渠道拓展、渠道收缩或资源倾斜结论。

### 7.6 标签趋势与新兴主题观察

目的：识别哪些 VOC 标签或外部主题出现变化。

字段：

| 字段 | 说明 |
| --- | --- |
| `tag_key` | 标签键 |
| `tag_l2` | 二级标签 |
| `tag_l3` | 三级标签 |
| `topic_tag` | 外部主题标签 |
| `tag_trend` | 标签趋势值或趋势状态，当前 blocked |
| `tag_cnt` | 标签命中量 |
| `tag_cnt_chg` | 标签命中变化率 |
| `dominant_tag` | 当前周期主导标签 |
| `emerging_tag_flag` | 是否新兴标签，当前 blocked |

展示规则：

1. 标签体系未确认前，只展示候选标签趋势。
2. `emerging_tag_flag` 未稳定前，不写“新兴需求已出现”。
3. 标签趋势必须展示样本量和复核状态。

### 7.7 评分、好评率和中差评率变化

目的：把服务体验变化纳入趋势解释。

字段：

| 字段 | 说明 |
| --- | --- |
| `star_rating` | 平均星级 |
| `rating_chg` | 评分变化 |
| `good_rate` | 好评率 |
| `bad_rate` | 中差评率 |
| `bad_rate_chg` | 中差评率变化 |
| `return_rate` | 退货率背景，当前 blocked |
| `doa_rate` | DOA 率背景，当前 blocked |

展示规则：

1. `rating_chg` 和 `bad_rate_chg` 可作为服务风险候选。
2. `return_rate`、`doa_rate` 只作背景字段，不替代 ORDER / SERVICE 根因分析。
3. 评分变化不能直接解释销量、ROI 或渠道表现。

### 7.8 CHANNEL / MKT 背景解释区

目的：解释 VOC 趋势可能受到哪些背景事件影响，但不输出业务动作。

字段：

| 字段 | 说明 |
| --- | --- |
| `campaign_active_flag` | 当期是否有相关活动 |
| `campaign_type_context` | 活动类型背景 |
| `roas_context` | ROAS 背景值 |
| `mkt_event_context` | 大促、投放、内容合作等背景 |
| `cross_topic_context_status` | 背景输入确认状态 |

展示规则：

1. `roas_context` 只能作为背景值，不能写成因果解释。
2. MKT 背景字段未确认前，不输出营销解释结论。
3. 活动背景只帮助判断“需要谁继续看”，不决定“怎么做”。

### 7.9 Handoff 候选与 Agent 待办队列

目的：把趋势线索转为可治理的待办，而不是业务动作。

允许的 `recommended_action_type`：

| 值 | 含义 |
| --- | --- |
| `analyze` | 继续分析 |
| `sample` | 补采样本 |
| `review` | 人工复核 |
| `handoff` | 移交其他专题判断 |

禁止的 `recommended_action_type`：

| 值 | 禁止原因 |
| --- | --- |
| `budget` | 预算动作属于 MKT / 管理层 |
| `launch` | 活动动作属于 MKT |
| `expand_channel` | 渠道动作属于 CHANNEL |
| `shrink_channel` | 渠道动作属于 CHANNEL |
| `inventory_action` | 库存动作属于 SCM / ORDER |

队列触发条件：

| 触发条件 | 待办类型 |
| --- | --- |
| `trend_algorithm_status = blocked` | 趋势算法确认 |
| `source_type_review_status = blocked` | 来源类型枚举确认 |
| `tag_review_status != stable` | 标签趋势复核 |
| `source_mix_status = blocked` | 内外部来源混合复核 |
| `cross_topic_context_status = blocked` | CHANNEL / MKT 背景确认 |
| `voc_cnt_chg` 异常但 `sample_size` 不足 | 补采样本 |
| `handoff_target` 有值但 `handoff_allowed_flag = false` | Owner 确认 |
| `recommended_action_type` 超出白名单 | 输出拦截 |

队列输出字段：

| 字段 | 说明 |
| --- | --- |
| `task_id` | 待办 ID |
| `task_type` | 待办类型 |
| `dt_month` | 月份 |
| `country_code` | 国家 |
| `channel_id` | 渠道 |
| `voc_source_type` | 来源类型 |
| `tag_key` | 标签 |
| `evidence_level` | 当前证据等级 |
| `blocking_reason` | 阻塞原因 |
| `handoff_target` | 候选移交对象 |
| `owner_agent` | 固定为 `VOC-AGENT-004` |

## 8. 页面状态

| 页面状态 | 判定条件 | 页面行为 |
| --- | --- | --- |
| Grey | 只有 mock、规划或外部参考 | 展示结构样例和缺口 |
| Amber | 有候选趋势数据，但 DQ 或算法未完全通过 | 展示候选趋势和待办 |
| Green | 源表、粒度、来源枚举、算法、标签和跨专题背景均 stable | 进入正式 BI 候选 |
| Red | 数据质量失败、来源混写或输出越权 | 禁止展示趋势结论 |

## 9. 验收标准

1. 页面明确绑定 `VOC-BI-004`、`VOC-T4`、`VOC-AGENT-004`。
2. 页面读取对象明确为 `dwt_voc_trend_radar`。
3. 页面引用 `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily`、`ods_voc_external`、`dim_voc_tag`、`dim_channel` 作为上游候选，不把它们写成已落地生产表。
4. 页面包含趋势雷达总览、VOC 声量趋势折线、来源结构堆叠、国家×渠道趋势矩阵、标签趋势、体验变化、跨专题背景和 Agent 队列。
5. 页面明确 `VOC-DQ-TREND-*` gates 未通过前保持 blocked 或 Amber。
6. 页面明确 `recommended_action_type` 只允许 `analyze`、`sample`、`review`、`handoff`。
7. 页面禁止输出渠道加码、预算、ROI、投放形式、活动动作和库存动作。
8. 页面不进入 `sql/`，不写生产 SQL，不创建调度定义。

## 10. 当前禁止动作

1. 不创建 `sql/dwt_voc_trend_radar.sql`。
2. 不把 `voc_trend.csv`、`fact_voc_trend_mock.csv`、`fact_voc_summary_mock.csv` 当作生产事实表。
3. 不把 `voc_trend_12m` 写成已确认算法。
4. 不把外部样本声量外推为市场需求变化。
5. 不在没有来源枚举时输出来源结构结论。
6. 不在没有 CHANNEL / MKT Owner 确认时输出渠道或营销动作。
7. 不将 `roas_context` 写成 VOC 趋势的因果解释。

## 11. 待用户决策

| 决策点 | 当前风险 | 建议下一步 |
| --- | --- | --- |
| `voc_source_type` 枚举 | 内部评论、服务工单、外部社区、社媒来源可能混写 | 先确认 onshelf、external、community、social、service、review 是否为第一版枚举 |
| `voc_trend_12m` 算法 | 斜率、同比、移动平均、指数平滑含义不同 | 先选一种算法作为草稿口径，并保留算法状态字段 |
| 标签趋势粒度 | `tag_l2/tag_l3` 与外部 `topic_tag` 可能不可直接合并 | 第一版先分开展示，暂不强合并 |
| CHANNEL / MKT 背景是否入页 | 背景字段容易被误读成因果解释 | 第一版只入解释区，不入核心趋势结论 |
| handoff Owner 流程 | 无 Owner 确认会让 VOC Agent 越权推动动作 | 建立 handoff allowed 条件和 Owner 确认记录 |
| 小样本波动规则 | 上期为 0 或样本过少会制造假趋势 | 设置最小样本量、缺失值和 0 分母处理规则 |

## 12. 下一步

下一步进入 `VOC-AGENT-001`，创建货架内服务质量与体验 Agent 任务规格草稿。

建议文件：`drafts/docs/voc-agent-service-quality-task-spec-draft-20260603.md`。

该任务规格应读取 `VOC-BI-001` 和 `dwt_voc_service_experience` 的页面 / 宽表边界，定义 Agent 如何输出痛点摘要、样本复核队列和服务质量线索。仍不得创建生产 SQL 或输出管理层动作。
