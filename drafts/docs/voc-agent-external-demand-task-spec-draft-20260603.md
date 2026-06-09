---
title: 货架外高潜需求与第二大单品 Agent 任务规格草稿
doc_type: workflow
module: project-governance
topic: voc-agent-external-demand-task-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 货架外高潜需求与第二大单品 Agent 任务规格草稿

## 1. Agent 定位

`VOC-AGENT-002` 是专题① VOC / 洞察流中负责货架外原生需求挖掘的证据治理 Agent。

绑定对象：

| 对象 | 编号或名称 | 状态 |
| --- | --- | --- |
| 子课题 | `VOC-T2` | draft |
| 页面 | `VOC-BI-002` | draft |
| 上游宽表 | `dwt_voc_external_demand` | blocked |
| 主要 DQ 族 | `VOC-DQ-EXT-*` | blocked |
| 交叉线 | `XL2` 社媒 VOC -> 营销 ROI | draft |

当前任务规格只定义 Agent 输入、触发条件、输出结构、DQ gate 和越权边界。不创建 Agent 代码，不进入 `sql/`，不写生产 SQL，不创建采集脚本、调度或自动执行工具。

## 2. Agent 职责

`VOC-AGENT-002` 负责把 `VOC-BI-002` 页面中的外部需求候选转成可治理的样本复核、标签复核和 handoff 任务。

允许职责：

1. 识别货架外社区、社媒和论坛中的候选需求主题。
2. 输出高潜需求候选摘要。
3. 输出第二大单品候选复核任务。
4. 请求平台政策、样本、语言、标签、情绪和品牌 alias 复核。
5. 生成高浓度社区和话题的 `XL2` handoff 候选。
6. 标注样本来源、样本量、采样方法、证据等级和 blocked 原因。
7. 生成需要人工标注或产品 / IPMS 复核的任务队列。

禁止职责：

1. 不把外部小样本声量写成市场规模。
2. 不把候选需求写成确定上新建议。
3. 不输出 SKU 决策、产品路线、渠道投放、预算或营销 ROI。
4. 不把高浓度社区直接写成投放建议。
5. 不把 `positive_rate` 写成生产口碑指标。
6. 不展示未授权原文、PII、原始 URL 或完整 `content_text`。
7. 不把 `shelf_outside_brand_mention.csv` 的数值写成真实外部需求。

## 3. 证据来源

| 来源 | 路径 | 证据等级 | 用途 |
| --- | --- | --- | --- |
| 页面 PRD | `drafts/docs/voc-bi-external-demand-radar-prd-draft-20260603.md` | Amber | Agent 触发入口和页面队列边界 |
| 专题蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | Amber | `VOC-T2`、`VOC-BI-002`、`VOC-AGENT-002` 边界 |
| 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | Amber | 外部需求指标状态、blocked 字段和禁用解释 |
| 宽表草稿 | `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md` | Amber | `dwt_voc_external_demand` 字段、DQ 和 Agent 消费方式 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | Amber | 货架外 VOC 数据需求 |
| 外部数据清单 | `main_project_lute/全局数据资源整合/03_外部数据需求清单.md` | Amber | 外部平台、社区、字段和采样范围 |
| 数仓设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | Amber | `ods_voc_external`、`fact_voc_external_daily`、`dim_voc_external_community` 粒度 |
| 字段口径说明 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | Amber | 外部 VOC 与交叉线字段边界 |
| VOC 故事线 | `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md` | Amber | 高潜需求与第二大单品业务问题 |
| 交叉线2 | `main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线2_社媒VOC到垂类投放与营销ROI.md` | Amber | 高浓度社区进入 MKT 的 handoff 边界 |
| Reddit 方法论 | `ref/books/maternal_social_voc/01-Reddit生态与方法论.md` | Amber | 社区选择、标签和样本方法 |
| 采集模板 | `ref/books/maternal_social_voc/02-日常VOC采集模板与示例.md` | Amber | 样本采集和日志格式 |
| Phase3 输出 | `main_project_lute/phase3_outputs/topic1_voc/shelf_outside_brand_mention.csv` | Grey | 外部品牌提及 mock 样例 |
| Phase3 mock | `main_project_lute/phase3_mock/ods_voc_external_mock.csv` | Grey | 外部帖子 / 评论字段 mock 样例 |
| Phase3 mock | `main_project_lute/phase3_mock/dim_voc_external_community_mock.csv` | Grey | 社区维度 mock 样例 |
| Phase3 mock | `main_project_lute/phase3_mock/dim_voc_tag_mock.csv` | Grey | 标签维度 mock 样例 |

Grey 来源只能用于字段形态和页面队列样例，不用于真实需求、市场规模、上新、投放或 ROI 结论。

## 4. 输入契约

### 4.1 页面上下文输入

| 字段 | 说明 |
| --- | --- |
| `dt` | 归集日期 |
| `collection_batch_id` | 采集批次 |
| `collection_window_start` | 采集窗口开始 |
| `collection_window_end` | 采集窗口结束 |
| `sample_method` | full、keyword、community_seed、manual_sample 等抽样方式 |
| `source_policy_status` | allowed、limited、manual-only、blocked |
| `platform` | 平台 |
| `community_id` | 平台内社区 ID |
| `community_name` | 社区名称 |
| `board_name` | 论坛板块 |
| `subreddit` | Reddit 社区名 |
| `country_scope` | 社区或内容面向国家 |
| `country_code_inferred` | 推断国家码 |
| `lang` | 语言 |
| `community_type` | forum、subreddit、group、social-feed |
| `audience_stage` | 母婴生命周期阶段 |
| `content_type` | post、comment、caption、thread |

`source_policy_status` 必须显式传入。状态为 `blocked` 或 `manual-only` 时，Agent 只能输出合规缺口和人工复核任务。

### 4.2 主题、需求与情绪输入

| 字段 | 说明 | 状态 |
| --- | --- | --- |
| `topic_tag` | 一级主题标签 | candidate |
| `topic_tags` | 多标签集合 | candidate |
| `tag_l2` | 标准二级标签 | candidate |
| `tag_l3` | 标准三级标签 | candidate |
| `need_dimension` | 需求维度 | candidate |
| `need_sub_dimension` | 需求子维度 | candidate |
| `sentiment_polarity` | 情绪极性 | blocked |
| `sentiment_strength` | 情绪强度 | blocked |
| `ideal_solution_flag` | 是否出现理想解决方案表达 | candidate |
| `ideal_solution_summary` | 理想解决方案摘要 | candidate |

`sentiment_polarity` 和 `sentiment_strength` 未经过标注集或人审校准前，只能触发 `sentiment_calibration_review`，不能参与需求优先级排序。

### 4.3 声量、互动与候选指标输入

| 字段 | 说明 | 状态 |
| --- | --- | --- |
| `post_cnt` | 帖子数 | candidate |
| `comment_cnt` | 评论数 | candidate |
| `reply_cnt` | 回复数 | candidate |
| `like_cnt` | 点赞或平台等价互动数 | candidate |
| `interaction_cnt` | 互动汇总 | candidate |
| `positive_cnt` | 正向样本数 | blocked |
| `negative_cnt` | 负向样本数 | blocked |
| `neutral_cnt` | 中性样本数 | blocked |
| `positive_rate` | 正向样本占比 | blocked |
| `community_concentration` | 社区集中度 | candidate |
| `high_potential_need_priority` | 高潜需求优先级 | blocked |
| `second_product_candidate_score` | 第二大单品候选分 | blocked |
| `mention_self_cnt` | 自有品牌提及次数 | candidate |
| `mention_comp_cnt` | 竞品品牌提及次数 | candidate |

`high_potential_need_priority` 和 `second_product_candidate_score` 只作为复核入口，不作为自动排序或产品决策。

### 4.4 样本与证据输入

| 字段 | 说明 |
| --- | --- |
| `post_id` | 帖子 ID 或 hash ID |
| `comment_id` | 评论 ID 或 hash ID |
| `post_time` | 原始发布时间 |
| `url_hash` | URL hash |
| `content_hash` | 内容 hash |
| `content_text_available_flag` | 是否可保留文本 |
| `content_excerpt` | 脱敏短摘录 |
| `sample_size` | 有效样本数 |
| `sample_bias_flag` | 是否存在样本偏差 |
| `duplicate_removed_flag` | 是否已去重 |
| `manual_review_required_flag` | 是否需要人工复核 |
| `source_system` | 来源系统或采集方式 |
| `source_file_or_job` | 来源文件或任务名 |
| `evidence_level` | Grey / Amber / Green / Red |
| `dq_status` | 数据质量状态 |

完整原文默认不可用。只有 `content_text_available_flag = true`、平台政策允许、脱敏完成且人工审查通过时，Agent 才能引用 `content_excerpt`。

## 5. 触发条件

`VOC-AGENT-002` 由 `VOC-BI-002` 页面队列、产品 / IPMS 请求或 `XL2` handoff 候选触发。

| 触发条件 | Agent 任务类型 |
| --- | --- |
| 主题频次高但 `sample_size` 不足 | `topic_sample_review` |
| 高互动样本集中于少数社区 | `community_concentration_review` |
| `sample_bias_flag = true` | `sample_bias_review` |
| `source_policy_status` 为 blocked 或 manual-only | `source_policy_review` |
| `sentiment_polarity` 或 `positive_rate` 为 blocked | `sentiment_calibration_review` |
| 标签缺失、冲突或不可映射 | `topic_tag_review` |
| `ideal_solution_summary` 有值但样本不足 | `ideal_solution_review` |
| `second_product_candidate_score` 有值或被请求 | `second_product_candidate_review` |
| 品牌提及有值但 alias 未确认 | `brand_alias_review` |
| 高浓度社区需要交叉线 2 评估 | `xl2_handoff_candidate` |
| `VOC-DQ-EXT-*` 任一 gate 失败 | `dq_blocker_review` |

## 6. DQ gate

Agent 必须读取并输出相关 DQ gate。未通过 gate 时，输出只能是缺口、复核请求或 handoff 候选。

| Gate ID | 检查项 | Agent 行为 |
| --- | --- | --- |
| `VOC-DQ-EXT-SCHEMA-001` | 外部源表、聚合表和社区维表字段稳定 | 缺字段时输出 schema blocker |
| `VOC-DQ-EXT-PK-001` | 主键粒度不重复，批次可追溯 | 不唯一时禁止输出主题频次结论 |
| `VOC-DQ-EXT-SAMPLE-001` | 样本来源、采样方法、样本量、覆盖周期明确 | 输出样本补采任务 |
| `VOC-DQ-EXT-LANG-001` | 语言识别和跨语言翻译规则确认 | 输出语言复核任务 |
| `VOC-DQ-EXT-TAG-001` | 主题标签和需求标签经过人工样本校准 | 标签未过时禁止输出高潜需求结论 |
| `VOC-DQ-EXT-SENTIMENT-001` | 情绪分类经过标注集或人审校准 | 情绪未过时禁止使用 `positive_rate` |
| `VOC-DQ-EXT-BRAND-001` | 品牌 alias 字典可追溯 | alias 未过时禁止输出品牌排名 |
| `VOC-DQ-EXT-PII-001` | PII、URL、全文内容保留策略合规 | 未过时禁止输出原文摘录 |
| `VOC-DQ-EXT-DUP-001` | 跨平台和同平台去重规则明确 | 未过时禁止输出声量结论 |
| `VOC-DQ-EXT-FRESHNESS-001` | 采集周期和数据刷新频率明确 | 未过时禁止输出趋势判断 |

## 7. 输出契约

### 7.1 Agent 任务队列表

| 字段 | 说明 |
| --- | --- |
| `task_id` | 任务 ID |
| `task_type` | 任务类型 |
| `severity` | low / medium / high / blocked |
| `evidence_level` | Grey / Amber / Green / Red |
| `dq_ids` | 关联 DQ gate |
| `collection_batch_id` | 采集批次 |
| `platform` | 平台 |
| `community_name` | 社区 |
| `country_scope` / `country_code_inferred` | 国家范围 |
| `lang` | 语言 |
| `audience_stage` | 人群阶段 |
| `content_type` | 内容类型 |
| `topic_tag` | 主题标签 |
| `need_dimension` | 需求维度 |
| `metric_name` | 触发指标 |
| `metric_value` | 候选指标值 |
| `metric_status` | 指标状态 |
| `sample_size` | 样本量 |
| `sample_method` | 采样方法 |
| `sample_bias_flag` | 样本偏差 |
| `content_hash` | 内容 hash |
| `url_hash` | URL hash |
| `blocking_reason` | 阻塞原因 |
| `requested_evidence` | 需要补齐的证据 |
| `handoff_target` | XL2 / PRODUCT / IPMS / MKT / DATA |
| `handoff_reason` | 移交原因 |
| `owner_agent` | 固定为 `VOC-AGENT-002` |

### 7.2 高潜需求候选摘要

允许输出：

| 字段 | 说明 |
| --- | --- |
| `need_candidate_title` | 候选需求标题 |
| `need_candidate_scope` | 平台 / 社区 / 国家 / 语言 / 人群阶段 |
| `need_dimension` | 需求维度 |
| `ideal_solution_summary` | 理想解决方案候选摘要 |
| `supporting_metrics` | `post_cnt`、`comment_cnt`、`interaction_cnt`、`sample_size` |
| `supporting_samples` | 样本 ID、hash 或脱敏摘录 |
| `evidence_level` | 证据等级 |
| `blocking_reason` | 不能升级为结论的原因 |

禁止输出：

1. 不写“市场规模为多少”。
2. 不写“应上新某 SKU”。
3. 不写“应投放某社区 / 某预算”。
4. 不把主题频次写成真实需求规模。

### 7.3 第二大单品候选复核

第二大单品候选只能作为产品 / IPMS 复核入口。

| 字段 | 说明 |
| --- | --- |
| `second_product_candidate_title` | 候选标题 |
| `product_line_candidate` | 产品线候选 |
| `spu_id_candidate` | SPU 候选 |
| `category_l3` | 三级品类 |
| `second_product_candidate_score` | 候选分，当前 blocked |
| `required_owner_review` | PRODUCT / IPMS |
| `required_evidence` | 需要补齐的样本、标签或竞品证据 |

禁止写法：

1. 不写“确定第二大单品”。
2. 不写“确定上新”。
3. 不写“自动进入产品 roadmap”。

### 7.4 样本证据请求

样本证据请求必须说明缺口，而不是生成结论。

| 字段 | 说明 |
| --- | --- |
| `sample_request_reason` | 请求原因 |
| `required_platform` | 需要补采平台 |
| `required_community` | 需要补采社区 |
| `required_sample_type` | post / comment / thread / caption |
| `required_sample_count` | 需要样本量 |
| `privacy_requirement` | hash / excerpt / no_text |
| `source_policy_status` | 当前平台政策状态 |
| `manual_review_required_flag` | 是否需要人工复核 |

### 7.5 Handoff 候选

| handoff target | 允许条件 | 禁止内容 |
| --- | --- | --- |
| `XL2` | 有社区、话题、人群阶段、样本量和证据等级 | 预算、投放形式、ROI 结论 |
| `PRODUCT` | 有需求维度、理想解决方案和样本证据 | 产品路线和改版动作 |
| `IPMS` | 有第二大单品候选但需战略 / 产品复核 | 确定上新建议 |
| `MKT` | 仅移交高浓度社区和话题上下文 | 广告归因和预算建议 |
| `DATA` | 字段、样本、标签、情绪、合规或去重缺口 | 生产 SQL 任务 |

## 8. Agent 状态机

| 状态 | 判定条件 | 输出行为 |
| --- | --- | --- |
| Grey | 只有 mock、规划或字段样例 | 输出缺口和任务结构 |
| Amber | 有候选样本但 DQ 未全过 | 输出候选需求、样本请求和复核任务 |
| Green | 源表、样本、标签、权限、去重和 DQ 通过 | 输出可评审需求输入 |
| Red | 平台政策、样本、标签、情绪、PII 或去重冲突 | 只输出 blocker |

## 9. 验收标准

1. 任务规格明确绑定 `VOC-AGENT-002`、`VOC-T2`、`VOC-BI-002`。
2. 任务规格明确读取 `dwt_voc_external_demand`。
3. 任务规格覆盖 `VOC-DQ-EXT-*` gate。
4. 任务规格包含触发条件、输入契约、输出契约、状态机和 forbidden outputs。
5. 任务规格明确 Phase3 mock 只能用于字段样例。
6. 任务规格禁止市场规模、确定上新、SKU 决策、渠道投放、预算、营销 ROI、生产 SQL 和未授权原文输出。
7. 任务规格明确 `XL2` 只是 handoff 候选，不是营销动作。

## 10. 当前禁止动作

1. 不创建 `sql/dwt_voc_external_demand.sql` 或任何生产 SQL。
2. 不创建外部平台采集脚本、调度任务或自动执行工具。
3. 不把 `shelf_outside_brand_mention.csv` 当作真实外部需求。
4. 不把 `ods_voc_external_mock.csv` 当作真实外部事实表。
5. 不把 `dim_voc_external_community_mock.csv` 当作稳定社区维表。
6. 不把 `dim_voc_tag_mock.csv` 当作稳定标签体系。
7. 不展示完整原文、原始 URL 或任何用户个人可识别信息。
8. 不输出市场规模、确定上新、SKU 决策、投放预算、营销 ROI 或广告归因。

## 11. 待用户决策

| 决策点 | 当前风险 | 建议下一步 |
| --- | --- | --- |
| 第一批外部平台 | 多平台并行会放大合规、语言和采样复杂度 | 先确认是否以 Reddit + BabyCenter + Mumsnet 为第一批 |
| 平台政策状态 | 不同平台对抓取、保存、展示原文限制不同 | 建立 `source_policy_status` 复核表 |
| 原文摘录权限 | 原文展示可能涉及隐私、平台条款和版权 | 默认只展示 hash，摘录需单独授权 |
| 情绪标签 | `positive_rate` 未校准会误导口碑判断 | 第一版先建标注样本，不进自动排序 |
| 主题标签方法 | LLM 聚类和人工字典容易口径漂移 | 采用 LLM 候选 + 人审稳定映射 |
| 第二大单品候选分 | 分数容易被误用为上新结论 | 只作为 PRODUCT / IPMS 复核入口 |
| `XL2` handoff | 高浓度社区容易被误写为投放动作 | 只移交社区、话题、人群和样本，不给预算或 ROI |

## 12. 下一步

下一步进入 `VOC-AGENT-003`，创建竞品口碑与本土化话术 Agent 任务规格草稿。

建议文件：`drafts/docs/voc-agent-competitor-localization-task-spec-draft-20260603.md`。

`VOC-AGENT-003` 应读取 `VOC-BI-003` 和 `dwt_voc_competitor_localization` 的边界，定义竞品评分、本土化标签、话术候选、样本复核和品牌 alias 的 Agent 输出限制。仍不得输出转化优势、市场份额、营销 ROI、可投放广告文案或生产 SQL。
