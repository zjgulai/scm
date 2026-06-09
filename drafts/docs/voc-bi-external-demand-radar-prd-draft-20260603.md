---
title: 货架外高潜需求与第二大单品雷达页面 PRD 草稿
doc_type: prd
module: project-governance
topic: voc-bi-external-demand-radar-prd
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 货架外高潜需求与第二大单品雷达页面 PRD 草稿

## 1. 页面定位

本文承接 `VOC-BI-002`，定义专题① VOC / 洞察流的货架外高潜需求与第二大单品雷达页面。

页面服务对象：

- 子课题：`VOC-T2`
- 页面编号：`VOC-BI-002`
- 主要 Agent：`VOC-AGENT-002`
- 上游宽表：`dwt_voc_external_demand`

当前状态：`blocked`。

阻塞原因不是页面结构缺失，而是真实外部 VOC 数据源、平台合规采集方式、样本量、语言识别、主题标签、情绪判断、社区元数据、品牌 / 产品映射和人工复核流程尚未完成生产级确认。因此本文只定义 PRD 草稿，不创建生产 BI，不进入 `sql/`，不写生产 SQL。

## 2. 核心业务问题

页面只回答货架外原生需求问题：

- 哪些平台、社区、国家和语言中出现了高频未满足需求？
- 哪些需求主题和场景有上升趋势或高互动样本？
- 哪些社区具有目标人群浓度，值得进入后续采样或交叉线 2 评估？
- 哪些需求可以形成第二大单品候选，但仍需要产品和 IPMS 复核？
- 哪些结论只适合交给 `VOC-AGENT-002` 做证据补齐？

页面不回答：

- 货架内服务质量和售后体验。
- 竞品本土化话术和品牌评分对比。
- 全域声量趋势雷达。
- 真实市场规模、销量机会、渗透率。
- 确定上新建议、SKU 决策、营销 ROI 或投放预算。

反面论证：可以把货架外需求页面做成“新品机会决策台”。本文不采用该路径，因为当前只有外部社区和社媒样本规划、方法论与 mock 输出，证据等级不足以支撑确定上新或市场规模结论。页面只能做需求雷达、样本复核和候选池。

## 3. 上游证据与引用路径

已对齐的上游材料：

- `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md`
- `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md`
- `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md`
- `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md`
- `main_project_lute/全局数据资源整合/03_外部数据需求清单.md`
- `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md`
- `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md`
- `main_project_lute/全局数据资源整合/voc社媒平台目录`
- `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md`
- `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线2_社媒VOC到垂类投放与营销ROI.md`
- `ref/books/maternal_social_voc/01-Reddit生态与方法论.md`
- `ref/books/maternal_social_voc/02-日常VOC采集模板与示例.md`
- `main_project_lute/phase3_outputs/topic1_voc/shelf_outside_brand_mention.csv`
- `main_project_lute/phase3_mock/ods_voc_external_mock.csv`
- `main_project_lute/phase3_mock/dim_voc_external_community_mock.csv`

证据分层：

| 证据 | 当前用途 | 状态 |
| --- | --- | --- |
| VOC 蓝图与指标字典 | 确认 `VOC-T2`、`VOC-BI-002`、`VOC-AGENT-002` 边界 | Amber |
| 外部需求宽表规格 | 确认页面读取 `dwt_voc_external_demand` | Amber |
| 外部数据需求清单和平台目录 | 确认 Reddit、BabyCenter、Mumsnet、WhatToExpect、Peanut、Facebook Groups 等候选源 | Amber |
| Reddit 方法论与采集模板 | 提供标签、采样和日志方法 | Amber |
| Phase3 mock | 提供页面结构参考，不作为生产事实 | Grey |

## 4. 目标用户

| 用户 | 使用目标 | 页面输出 |
| --- | --- | --- |
| 产品 / IPMS | 发现未满足需求和第二大单品候选 | 需求机会矩阵、候选池、样本证据 |
| 市场 / 品牌 | 理解外部社区真实讨论主题 | 社区热力、主题聚类、高互动样本 |
| 数据 / BI | 验证外部样本和标签质量 | DQ 状态、样本量、偏差和来源政策 |
| 营销 Agent / 交叉线 2 | 获取高浓度社区候选 | 社区浓度和 handoff 候选 |
| `VOC-AGENT-002` | 生成外部需求诊断输入 | 待验证主题、样本证据请求、缺口清单 |

## 5. 页面主线

页面第一屏必须直接进入需求雷达，不做介绍页。

推荐信息层级：

1. 全局筛选与证据状态。
2. 外部样本覆盖概览。
3. 社区热力图。
4. 主题聚类与需求频次。
5. 需求机会矩阵。
6. 第二大单品候选池。
7. 高互动样本列表。
8. Agent 诊断队列。

页面默认排序应优先使用 `topic_tag` 频次、`interaction_cnt`、`community_concentration`、`sample_size` 和证据等级；`second_product_candidate_score` 在 Green 前不得作为生产排序。

## 6. 全局筛选

| 筛选项 | 字段 | 默认 | 状态 |
| --- | --- | --- | --- |
| 日期 | `dt` / `collection_window_start` / `collection_window_end` | 最近 30 天 | candidate |
| 采集批次 | `collection_batch_id` | latest | candidate |
| 平台 | `platform` | all | candidate |
| 社区 | `community_name` / `subreddit` / `board_name` | all | candidate |
| 国家范围 | `country_scope` / `country_code_inferred` | all | blocked |
| 语言 | `lang` | all | candidate |
| 人群阶段 | `audience_stage` | all | candidate |
| 内容类型 | `content_type` | post / comment | candidate |
| 主题标签 | `topic_tag` / `topic_tags` | all | candidate |
| 需求维度 | `need_dimension` / `need_sub_dimension` | all | candidate |
| 情绪 | `sentiment_polarity` | all | blocked |
| 品牌提及 | `brand_mention_group` | all | candidate |
| 证据等级 | `evidence_level` | all | candidate |

筛选区必须展示 `source_policy_status`。平台政策为 `blocked` 或 `manual-only` 时，不展示自动化采样结论。

## 7. 页面模块

### 7.1 证据状态条

展示当前页面是否允许输出需求解释。

字段：

- `source_policy_status`
- `evidence_level`
- `dq_status`
- `sample_size`
- `sample_method`
- `sample_bias_flag`
- `content_text_available_flag`
- `manual_review_required_flag`

状态规则：

| 状态 | 页面行为 |
| --- | --- |
| Grey | 只展示页面结构、字段状态和 mock 示例 |
| Amber | 展示候选主题、样本缺口和人工复核请求 |
| Green | 展示需求解释、样本列表和 Agent 输入 |
| Red | 禁止展示业务结论，只展示缺口 |

### 7.2 外部样本覆盖概览

目标：说明页面当前覆盖了哪些外部源。

推荐指标：

| 指标 | 字段 | 当前状态 |
| --- | --- | --- |
| 平台数 | `platform` distinct | candidate |
| 社区数 | `community_name` distinct | candidate |
| 国家范围数 | `country_scope` distinct | blocked |
| 语言数 | `lang` distinct | candidate |
| 帖子数 | `post_cnt` | candidate |
| 评论数 | `comment_cnt` | candidate |
| 互动量 | `interaction_cnt` | candidate |
| 样本量 | `sample_size` | candidate |
| 样本偏差 | `sample_bias_flag` | blocked |

覆盖概览必须把 mock 数据和真实样本分开显示。

### 7.3 社区热力图

目标：识别高浓度社区和话题。

推荐展示：

- 行：`platform`、`community_name`
- 列：`topic_tag`、`need_dimension`
- 色值：`post_cnt + comment_cnt` 或 `community_concentration`
- 辅助：`interaction_cnt`、`sample_size`、`evidence_level`

限制：

- `community_concentration` 当前只允许作为候选指标。
- 不把高浓度社区直接写成投放建议。
- 高浓度社区只能移交交叉线 2 或营销 Agent 做二次评估。

### 7.4 主题聚类与需求频次

目标：识别未满足需求主题。

推荐展示：

- `topic_tag`
- `topic_tags`
- `tag_l2`
- `tag_l3`
- `need_dimension`
- `need_sub_dimension`
- `ideal_solution_flag`
- `ideal_solution_summary`
- `tag_cnt`
- `interaction_cnt`

限制：

- 标签体系未过 DQ 时，只展示原始标签和待复核状态。
- `ideal_solution_summary` 必须标注来源和样本量。
- 不把主题频次直接写成市场需求规模。

### 7.5 需求机会矩阵

目标：形成高潜需求候选，而非决策。

推荐坐标：

- X 轴：需求频次或样本量。
- Y 轴：互动量或情绪强度。
- 气泡大小：`community_concentration`。
- 颜色：`evidence_level`。

候选字段：

- `high_potential_need_priority`
- `need_dimension`
- `sentiment_polarity`
- `sentiment_strength`
- `interaction_cnt`
- `sample_size`
- `sample_bias_flag`

限制：

- `high_potential_need_priority` 当前为 `blocked`。
- `sentiment_polarity` 和 `sentiment_strength` 未校准前，不参与排序。
- 页面只能输出“候选需求”，不能输出确定产品路线。

### 7.6 第二大单品候选池

目标：展示可能进入产品复核的机会。

推荐字段：

- `second_product_candidate_score`
- `product_line_candidate`
- `spu_id_candidate`
- `category_l3`
- `need_dimension`
- `ideal_solution_summary`
- `sample_size`
- `evidence_level`
- `manual_review_required_flag`

限制：

- `second_product_candidate_score` 当前为 `blocked`。
- 只能展示“候选池”，不得写“应上新”“确定第二大单品”。
- 必须要求产品 / IPMS Owner 复核。

### 7.7 高互动样本列表

目标：让需求判断可复核。

展示字段：

- `platform`
- `community_name`
- `post_id`
- `comment_id`
- `content_type`
- `post_time`
- `url_hash`
- `content_hash`
- `content_text_available_flag`
- `content_excerpt`
- `topic_tag`
- `need_dimension`
- `interaction_cnt`

展示规则：

- 默认只展示样本 ID、平台、社区、标签、互动和哈希。
- 完整原文不得进入主表。
- `content_excerpt` 只有在脱敏和平台政策允许后展示。
- 不展示用户个人可识别信息。

### 7.8 品牌提及辅助区

目标：辅助理解需求语境，不做竞品页面。

展示字段：

- `mention_brand_self`
- `mention_brand_comp`
- `brand_name`
- `brand_alias_raw`
- `mention_self_cnt`
- `mention_comp_cnt`

限制：

- 品牌提及只作为外部需求上下文。
- 竞品评分、品牌排名和本土化话术属于 `VOC-BI-003`。
- `shelf_outside_brand_mention.csv` 只做 mock 字段参考。

### 7.9 Agent 诊断队列

目标：把页面发现转给 `VOC-AGENT-002` 做证据补齐。

触发条件：

- 主题频次高但样本量不足。
- 高互动样本集中于少数社区。
- 情绪指标为 `blocked`。
- `sample_bias_flag` 为 true。
- `second_product_candidate_score` 需要产品复核。
- 平台政策或原文权限未确认。

输出：

- 待验证需求主题。
- 需要补采样的社区。
- 需要人工标注的情绪或标签。
- 需要产品复核的候选机会。
- 不输出市场规模、确定上新或营销动作。

## 8. 页面状态

| 状态 | 触发条件 | 页面表现 |
| --- | --- | --- |
| Loading | 数据请求中 | 保持筛选区和骨架屏 |
| Empty | 筛选后无记录 | 展示筛选条件和建议放宽维度 |
| Grey | 只有 mock 或规划证据 | 展示页面结构和字段状态 |
| Amber | 样本存在但 DQ 未全过 | 展示候选需求和缺口 |
| Green | 源表、标签、权限、样本和 DQ 通过 | 展示需求解释和样本列表 |
| Red | 平台政策、样本、标签或权限冲突 | 禁止展示业务结论 |

## 9. 验收标准

页面 PRD 可进入评审前，必须满足：

| 验收项 | 标准 |
| --- | --- |
| 边界 | 只覆盖 `VOC-T2` 货架外原生需求 |
| 数据集 | 明确读取 `dwt_voc_external_demand` |
| 模块 | 包含样本覆盖、社区热力、主题聚类、需求机会矩阵、第二大单品候选池、样本列表、Agent 队列 |
| 口径 | `sample_size`、`community_concentration`、`positive_rate`、`high_potential_need_priority`、`second_product_candidate_score` 状态明确 |
| 权限 | 样本列表默认不展示完整原文 |
| 证据 | 每个可解释模块都展示 `evidence_level` 或缺口 |
| 禁止项 | 不输出市场规模、确定上新、渠道投放、营销 ROI |

## 10. 当前不能做的事项

当前明确禁止：

- 把 `shelf_outside_brand_mention.csv` 的数值写成真实外部需求。
- 把 `positive_rate` 当作已校准情绪指标。
- 把 Reddit 或社媒小样本外推为整体母婴市场规模。
- 创建生产 BI、正式 SQL 或 `sql/` 文件。
- 在平台政策未确认时自动展示原文。
- 将第二大单品候选写成确定上新建议。
- 将高浓度社区直接写成投放预算或 ROI 建议。

## 11. 下一步

下一步进入 `VOC-BI-003`：

- 文件：`drafts/docs/voc-bi-competitor-localization-prd-draft-20260603.md`
- 目标：为竞品口碑与本土化话术页面建立 PRD 草稿。

`VOC-BI-003` 应读取 `dwt_voc_competitor_localization`，重点定义品牌评分对比、国家话术矩阵、本土化卖点候选和竞品样本边界，避免把竞品声量写成转化优势或营销 ROI。

## 12. 需要用户后续决策

需要确认的关键点：

1. 外部 VOC 第一版是否只开放 Reddit + BabyCenter + Mumsnet，还是多平台并行。
2. 是否允许展示脱敏 `content_excerpt`。
3. `positive_rate` 是否进入页面；若进入，必须先建设标注样本。
4. `second_product_candidate_score` 是否只作为产品复核入口，不参与自动排序。
5. 高浓度社区是否只移交交叉线 2，不在本页面显示投放形式。
