---
title: 专题①货架外需求宽表规格草稿
doc_type: analysis
module: project-governance
topic: voc-topic-external-demand-wide-table-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 专题①货架外需求宽表规格草稿

## 1. 任务定位

本文承接 `VOC-DATA-003`，为专题① VOC / 洞察流的“货架外需求”分支定义宽表草稿。

目标宽表暂定为：

- `dwt_voc_external_demand`

服务对象：

- 指标族：`VOC-T2`
- BI 页面：`VOC-BI-002`
- Agent：`VOC-AGENT-002`

当前状态：`blocked`。

阻塞原因不是字段框架缺失，而是真实外部 VOC 数据源、平台合规采集方式、样本量、语言识别、标签体系、情绪判断、品牌映射和产品映射尚未完成生产级确认。因此本文只定义宽表契约和数据治理门槛，不进入 `sql/`，不写生产 SQL。

## 2. 核心判断

`dwt_voc_external_demand` 的边界是“外部原生消费者需求信号”，不是内部售后问题，也不是竞品本地化调研主表，更不是营销投放归因表。

纳入范围：

- Reddit、BabyCenter、Mumsnet、The Bump、WhatToExpect、Peanut、Facebook Groups、Instagram 等外部社区或社媒平台。
- 用户自发表达的痛点、理想解决方案、产品需求、品牌提及、场景需求。
- 社区、国家、语言、用户阶段、内容类型、主题标签、互动量、情绪倾向和品牌提及。

不纳入范围：

- 内部客服、退货、评价、问卷、NPS 等货架内或自有渠道 VOC。
- 竞品本地化包装、价格、站点结构、渠道打法的主分析。
- 广告消耗、ROI、转化归因、活动复盘。
- 由小样本声量直接外推的市场规模判断。

反面论证：外部社区数据也可以被放入“市场研究”或“竞品情报”分支。本文不采用该路径，因为当前项目 VOC 蓝图已经把专题①定位为需求洞察入口，货架外需求更适合作为需求发现宽表，再由竞品本地化、SKU 规划和营销策略读取其标签结果。

## 3. 上游证据与引用路径

已对齐的上游材料：

- `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md`
- `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md`
- `main_project_lute/全局数据资源整合/03_外部数据需求清单.md`
- `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md`
- `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md`
- `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md`
- `main_project_lute/全局数据资源整合/voc社媒平台目录`
- `ref/books/maternal_social_voc/01-Reddit生态与方法论.md`
- `ref/books/maternal_social_voc/02-日常VOC采集模板与示例.md`
- `main_project_lute/phase3_outputs/topic1_voc/shelf_outside_brand_mention.csv`
- `main_project_lute/phase3_outputs/topic1_voc/competitor_opportunity.csv`
- `main_project_lute/phase3_outputs/topic1_voc/voc_trend.csv`

证据分层：

| 证据 | 当前用途 | 状态 |
| --- | --- | --- |
| VOC 蓝图与指标字典 | 确认专题、指标族、BI、Agent 边界 | Amber |
| 外部数据需求清单 | 确认 Reddit、社媒、社区平台需要采集 | Amber |
| 社媒平台目录与 Reddit 方法论 | 确认平台结构、采集模板、社区维度 | Amber |
| 数仓表结构与字段口径文件 | 提供 `ods_voc_external`、`fact_voc_external_daily`、`dim_voc_external_community` 等候选表名 | Amber |
| Phase3 CSV | 仅用于样例字段和演示口径，不作为生产事实 | Grey |

## 4. 宽表粒度

推荐主粒度：

```text
dt
+ collection_batch_id
+ platform
+ community_id / community_name
+ country_scope
+ lang
+ topic_tag
+ audience_stage
+ content_type
+ brand_mention_group
```

解释：

- `dt` 表示采集或归集日期。
- `collection_batch_id` 保留批次追溯，避免不同采集窗口混算。
- `platform + community_id / community_name` 是货架外 VOC 的核心来源定位。
- `country_scope + lang` 用于区分国家市场和语言噪声。
- `topic_tag / topic_tags` 用于承接需求标签。
- `audience_stage` 用于区分备孕、孕期、新生儿、辅食、学步等母婴生命周期阶段。
- `content_type` 区分 post、comment、review-like post、short video caption 等内容形态。
- `brand_mention_group` 区分自有品牌、竞品品牌、无品牌泛需求。

不建议以单条 raw post 作为最终 BI 主粒度。单条内容可作为可追溯明细或样本证据，但 BI 和 Agent 应优先读取聚合后的社区/主题/日期宽表，降低隐私、合规和噪声风险。

## 5. 输入源优先级

| 优先级 | 输入源 | 角色 | 状态 |
| --- | --- | --- | --- |
| P0 | `ods_voc_external` | 外部 VOC 原始采集层，承接 post/comment 级样本 | blocked |
| P0 | `dim_voc_external_community` | 社区、平台、国家、语言、受众阶段维表 | blocked |
| P1 | `fact_voc_external_daily` | 日级主题和互动聚合事实表 | candidate |
| P1 | 平台目录与日常 VOC 采集模板 | 社区和采集字段设计依据 | candidate |
| P2 | `shelf_outside_brand_mention.csv` | Phase3 演示样例，只支持字段映射参考 | mock |
| P2 | `competitor_opportunity.csv`、`voc_trend.csv` | 辅助识别标签和展示形态，不做生产口径 | mock |

进入 Green 前必须补齐：真实数据源 Owner、采集权限、平台政策、样本抽取规则、数据保留策略、字段血缘、去重规则和人工复核流程。

## 6. 输出字段契约

### 6.1 主键与采集窗口

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `dt` | date | 归集日期 | candidate |
| `collection_batch_id` | string | 采集批次 | candidate |
| `collection_window_start` | timestamp | 采集窗口开始 | candidate |
| `collection_window_end` | timestamp | 采集窗口结束 | candidate |
| `sample_method` | string | 抽样方式，如 full、keyword、community_seed、manual_sample | candidate |
| `source_policy_status` | string | 平台合规状态，如 allowed、limited、manual-only、blocked | blocked |

### 6.2 平台与社区维度

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `platform` | string | 平台名称 | candidate |
| `community_id` | string | 平台内社区 ID | blocked |
| `community_name` | string | 社区名称 | candidate |
| `board_name` | string | 论坛板块 | candidate |
| `subreddit` | string | Reddit 社区名 | candidate |
| `country_scope` | string | 社区或内容面向国家 | candidate |
| `country_code_inferred` | string | 由语言、社区、文本推断的国家码 | blocked |
| `lang` | string | 语言 | candidate |
| `community_type` | string | forum、subreddit、group、social-feed 等 | candidate |
| `audience_stage` | string | 母婴生命周期阶段 | candidate |

### 6.3 内容与样本追溯

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `post_id` | string | 平台 post ID 或哈希 ID | candidate |
| `comment_id` | string | 评论 ID 或哈希 ID | candidate |
| `content_type` | string | post、comment、caption、thread 等 | candidate |
| `post_time` | timestamp | 原始发布时间 | candidate |
| `url_hash` | string | URL 哈希，不默认暴露原始 URL | candidate |
| `content_text_available_flag` | boolean | 是否可在合规范围内保留文本 | blocked |
| `content_excerpt` | string | 可展示短摘录，需脱敏 | blocked |
| `content_hash` | string | 内容哈希，用于去重和追溯 | candidate |

默认不在宽表中保留完整原文。需要原文复核时，应通过合规样本库或人工标注表读取，且必须带权限控制。

### 6.4 标签、需求与情绪

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `topic_tag` | string | 一级主题标签 | candidate |
| `topic_tags` | array/string | 多标签集合 | candidate |
| `tag_l2` | string | 二级标签 | candidate |
| `tag_l3` | string | 三级标签 | candidate |
| `need_dimension` | string | 需求维度，如安全、清洁、便携、价格、成分 | candidate |
| `need_sub_dimension` | string | 需求子维度 | candidate |
| `sentiment_polarity` | string | positive、neutral、negative | blocked |
| `sentiment_strength` | numeric | 情绪强度 | blocked |
| `ideal_solution_flag` | boolean | 是否出现理想解决方案表达 | candidate |
| `ideal_solution_summary` | string | 理想解决方案摘要 | candidate |

`sentiment_polarity` 和 `sentiment_strength` 进入 Green 前必须通过人工样本或稳定标注规则校准，不能只依赖 LLM 一次性判断。

### 6.5 声量、互动与机会指标

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `post_cnt` | integer | 帖子数 | candidate |
| `comment_cnt` | integer | 评论数 | candidate |
| `reply_cnt` | integer | 回复数 | candidate |
| `like_cnt` | integer | 点赞或平台等价互动数 | candidate |
| `interaction_cnt` | integer | 回复、评论、点赞等互动汇总 | candidate |
| `positive_cnt` | integer | 正向样本数 | blocked |
| `negative_cnt` | integer | 负向样本数 | blocked |
| `neutral_cnt` | integer | 中性样本数 | blocked |
| `positive_rate` | numeric | 正向样本占比 | blocked |
| `mention_self_cnt` | integer | 自有品牌提及次数 | candidate |
| `mention_comp_cnt` | integer | 竞品品牌提及次数 | candidate |
| `community_concentration` | numeric | 声量是否集中于少数社区 | candidate |
| `high_potential_need_priority` | string | 高潜需求优先级 | blocked |
| `second_product_candidate_score` | numeric | 第二产品机会候选分 | blocked |

`positive_rate`、`high_potential_need_priority`、`second_product_candidate_score` 当前只能作为候选指标，不得进入正式结论。

### 6.6 品牌与产品映射

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `mention_brand_self` | boolean | 是否提及自有品牌 | candidate |
| `mention_brand_comp` | boolean | 是否提及竞品品牌 | candidate |
| `brand_name` | string | 标准化品牌名 | blocked |
| `brand_alias_raw` | string | 原始品牌别名 | candidate |
| `spu_id_candidate` | string | 可能关联的 SPU | blocked |
| `category_l3` | string | 三级品类 | candidate |
| `product_line_candidate` | string | 产品线候选 | blocked |

品牌和产品映射必须经过 alias 字典与人工抽样复核。否则只能作为候选信号，不能用于 SKU 决策自动化。

### 6.7 治理字段

| 字段 | 类型建议 | 含义 | 状态 |
| --- | --- | --- | --- |
| `source_system` | string | 来源系统或采集方式 | candidate |
| `source_file_or_job` | string | 来源文件或任务名 | candidate |
| `evidence_level` | string | Grey、Amber、Green、Red | candidate |
| `dq_status` | string | 数据质量状态 | candidate |
| `sample_size` | integer | 有效样本数 | candidate |
| `sample_bias_flag` | boolean | 是否存在明显样本偏差 | blocked |
| `duplicate_removed_flag` | boolean | 是否已去重 | candidate |
| `manual_review_required_flag` | boolean | 是否需要人工复核 | candidate |
| `created_at` | timestamp | 入仓时间 | candidate |
| `updated_at` | timestamp | 更新时间 | candidate |

## 7. 指标计算边界

允许计算：

- `post_cnt`、`comment_cnt`、`reply_cnt`、`like_cnt`、`interaction_cnt`
- `topic_tag` / `topic_tags` 维度下的样本占比和声量趋势
- `mention_self_cnt`、`mention_comp_cnt`
- `community_concentration`
- 按平台、社区、国家、语言、用户阶段聚合的需求热度

暂不允许计算为生产结论：

- `positive_rate`
- `second_product_candidate_score`
- `high_potential_need_priority`
- 品牌口碑排名
- SKU 上新优先级自动决策
- 市场规模、渗透率、真实销量机会
- 广告 ROI 或营销归因

原因：这些指标需要真实样本、采样偏差控制、情绪/标签校准、品牌别名映射和人审机制。缺一项时只能作为探索提示。

## 8. Phase3 小样本映射

`shelf_outside_brand_mention.csv` 当前字段包括 `brand`、`post_cnt`、`positive_rate` 等演示字段，可映射为：

| Phase3 字段 | 宽表候选字段 | 使用限制 |
| --- | --- | --- |
| `brand` | `brand_name` | 只做演示映射，非标准品牌字典 |
| `post_cnt` | `post_cnt` | 只代表样例声量，不代表真实市场声量 |
| `positive_rate` | `positive_rate` | 当前为 mock / blocked，不得作为正式口碑指标 |

`competitor_opportunity.csv` 可辅助识别竞品提及和需求机会，但不应反向改写本宽表的主边界。竞品本地化会进入 `VOC-DATA-004` 单独处理。

`voc_trend.csv` 可作为趋势展示样例，但需要真实 `dt`、采集窗口、平台、社区和样本量后才能进入正式指标。

## 9. 数据质量门槛

进入 Green 前至少满足以下 gate：

| Gate ID | 检查项 | 当前状态 |
| --- | --- | --- |
| `VOC-DQ-EXT-SCHEMA-001` | `ods_voc_external`、`fact_voc_external_daily`、`dim_voc_external_community` 字段存在且类型稳定 | blocked |
| `VOC-DQ-EXT-PK-001` | 主键粒度不重复，批次可追溯 | blocked |
| `VOC-DQ-EXT-SAMPLE-001` | 样本来源、采样方法、样本量、覆盖周期明确 | blocked |
| `VOC-DQ-EXT-LANG-001` | 语言识别和跨语言翻译规则确认 | blocked |
| `VOC-DQ-EXT-TAG-001` | 主题标签和需求标签经过人工样本校准 | blocked |
| `VOC-DQ-EXT-SENTIMENT-001` | 情绪分类经过标注集或人审校准 | blocked |
| `VOC-DQ-EXT-BRAND-001` | 品牌 alias 字典可追溯 | blocked |
| `VOC-DQ-EXT-PII-001` | PII、URL、全文内容保留策略合规 | blocked |
| `VOC-DQ-EXT-DUP-001` | 跨平台和同平台去重规则明确 | blocked |
| `VOC-DQ-EXT-FRESHNESS-001` | 采集周期和数据刷新频率明确 | blocked |

任一 gate 未通过时，`VOC-BI-002` 只能展示探索态，`VOC-AGENT-002` 只能输出候选问题和待确认清单。

## 10. BI 与 Agent 消费方式

`VOC-BI-002` 建议读取：

- 平台 / 社区 / 国家 / 语言的需求热度矩阵。
- 主题标签趋势。
- 高互动内容样本索引。
- 自有品牌与竞品提及对比。
- 样本量、采样偏差和证据等级提示。

`VOC-AGENT-002` 建议读取：

- `topic_tag`、`need_dimension`、`ideal_solution_summary`。
- `community_concentration` 和高互动社区。
- `positive_rate` 的候选值及其证据状态。
- `second_product_candidate_score` 的候选输入，而不是最终判断。

Agent 输出限制：

- 必须标注证据等级。
- 必须列出样本来源和样本量。
- 不把外部小样本声量写成市场规模。
- 不把候选产品需求写成确定上新建议。
- 不输出营销 ROI 或广告归因结论。

## 11. 当前不能做的事项

当前明确禁止：

- 把 Phase3 CSV 直接提升为正式宽表。
- 将 `positive_rate` 作为生产口碑指标。
- 将 Reddit 或社媒小样本直接外推为整体母婴市场需求。
- 在 `sql/` 创建 `dwt_voc_external_demand` 的生产 SQL。
- 绕过平台政策抓取不可合规保留的原文内容。
- 在没有品牌 alias 字典时输出品牌排名。
- 在没有人工样本校准时输出自动化情绪结论。

## 12. 下一步

下一步进入 `VOC-DATA-004`：

- 文件：`drafts/analysis/voc-topic-competitor-localization-wide-table-spec-draft-20260603.md`
- 目标：为竞品本地化机会建立独立宽表规格。

`VOC-DATA-004` 应重点处理竞品品牌、国家市场、包装规格、价格带、功能卖点、本地渠道、目标人群、站外评论与产品线机会，避免与本文的外部原生需求宽表交叉。

## 13. 需要用户后续决策

需要确认的关键点：

1. 外部 VOC 采集是否以 Reddit 为第一批 Green 候选源，还是多平台并行。
2. 是否允许保存原文摘录；如果允许，需要定义脱敏、保留周期和权限。
3. 主题标签优先由人工字典驱动，还是由 LLM 聚类后人审。
4. 情绪标签是否进入第一版 BI；若进入，必须同步建设标注样本。
5. `second_product_candidate_score` 是否只做候选提示，不进入自动决策。
