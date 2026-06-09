---
title: 竞品口碑与本土化话术页面 PRD 草稿
doc_type: prd
module: project-governance
topic: voc-bi-competitor-localization-prd
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 竞品口碑与本土化话术页面 PRD 草稿

## 1. 页面定位

`VOC-BI-003` 是全域 VOC 专题下的竞品口碑与本土化话术证据页。

页面服务于 `VOC-T3`，由 `VOC-AGENT-003` 承接证据补全、别名审核、标签审核、评分来源确认和样本复核任务。

当前页面读取草稿宽表 `dwt_voc_competitor_localization`。该宽表仍处于 blocked 状态，因此本页只允许作为 PRD 和 BI 页面草稿，不进入 `sql/`，不写生产 SQL，不定义生产调度。

本页不是竞品排行榜、市场份额页、ROI 页、转化归因页或广告投放文案生成页。页面输出的是 review/candidate 层的证据组织，不直接输出可投放广告文案。

## 2. 核心业务问题

1. 本土竞品在国家、渠道、品牌维度下如何被评价。
2. 自有品牌与竞品在 VOC 声量、评分、差评率、标签上存在哪些候选差异。
3. 哪些 `tag_localized`、`localized_pain_point`、`localized_selling_point` 能支持本土化话术假设。
4. 哪些样本证据能支撑品牌口碑和本土化卖点的人工复核。
5. 哪些证据缺口应进入 `VOC-AGENT-003` 的待办队列。

本页不回答以下问题：

1. 不把竞品声量等同转化优势。
2. 不把评分差异写成市场份额或 ROI。
3. 不把 `rating_gap` 命名为竞争优势。
4. 不输出未经审核的广告文案、素材文案或投放建议。
5. 不把 mock 数据或 Grey 参考资料写成生产结论。

## 3. 证据来源

| 来源 | 路径 | 证据等级 | 用途 |
| --- | --- | --- | --- |
| 专题蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | Amber | 页面编号、服务链路、Agent 归属 |
| 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | Amber | VOC 指标、状态字段、禁用解释 |
| 宽表草稿 | `drafts/analysis/voc-topic-competitor-localization-wide-table-spec-draft-20260603.md` | Amber | `dwt_voc_competitor_localization` 字段边界 |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | Amber | 专题与数据链路关系 |
| 外部数据清单 | `main_project_lute/全局数据资源整合/03_外部数据需求清单.md` | Amber | 外部 VOC、竞品和社媒数据需求 |
| 数仓设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | Amber | ODS、DWD、DWT 层候选结构 |
| 字段口径说明 | `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | Amber | 交叉字段、标签、状态口径 |
| VOC 故事线 | `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md` | Amber | 业务叙事和用户问题 |
| 行业参考 | `ref/company_info/momcozy_industry_report.md` | Grey | Momcozy、Medela、Elvie、Willow、Spectra、BabyBuddha 等竞品背景 |
| Phase3 输出 | `main_project_lute/phase3_outputs/topic1_voc/competitor_opportunity.csv` | Grey | 竞品机会 mock 样例 |
| Phase3 mock | `main_project_lute/phase3_mock/fact_voc_brand_summary_mock.csv` | Grey | 品牌评分与声量 mock 样例 |
| Phase3 mock | `main_project_lute/phase3_mock/ods_voc_external_mock.csv` | Grey | 外部 VOC 原始 mock 样例 |

Grey 来源只能用于页面结构和展示样例，不能作为生产评分、排名或营销结论。

## 4. 目标用户

| 用户 | 使用目标 | 页面约束 |
| --- | --- | --- |
| 品牌与营销团队 | 识别本土化卖点、痛点和话术候选 | 只看 review/candidate 话术，不直接投放 |
| 产品团队 | 判断竞品被提及的功能、包装、价格、信任信号 | 只做需求和洞察输入，不做销量归因 |
| BI 与数据团队 | 校验竞品维表、VOC 标签、评分来源和样本覆盖 | 关注 DQ 状态和证据缺口 |
| `VOC-AGENT-003` | 接收证据补全和人工审核任务 | 输出待办队列，不自动改写生产口径 |

## 5. 页面流程

1. 全局筛选与证据状态条。
2. 品牌覆盖概览。
3. Brand rating comparison。
4. 自有品牌与竞品 VOC 矩阵。
5. 国家话术矩阵。
6. 本土化痛点、卖点、话术候选列表。
7. 竞品样本证据抽屉。
8. `VOC-AGENT-003` 待办队列。

页面从“覆盖是否足够”进入，再看“评分和声量差异”，最后落到“哪些本土化表达值得人工复核”。页面不得从 `rating_gap` 直接跳到营销动作。

## 6. 全局筛选

| 筛选项 | 字段 | 说明 |
| --- | --- | --- |
| 月份 | `dt_month` | 默认最近可用月份 |
| 国家 | `country_code` | 支持单国、多国对比 |
| 渠道或站点 | `channel_id` / `site` / `platform` | 需与外部 VOC 来源一致 |
| 品牌 | `brand_id` / `brand_name` | 自有品牌和竞品统一筛选 |
| 品牌类型 | `is_self` | 区分自有品牌与竞品 |
| 竞品组 | `competitor_group` | 需等待 `dim_brand` 竞品组口径确认 |
| 类目 | `category_l3` | 默认聚焦母婴与哺乳相关类目 |
| 产品线候选 | `product_line_candidate` | 草稿字段，只作辅助分组 |
| 本土化标签 | `tag_localized` | 本地痛点、卖点、表达方式 |
| 证据等级 | `evidence_level` | Grey、Amber、Green、Red |
| 别名审核状态 | `alias_review_status` | blocked、review、stable |
| 标签审核状态 | `tag_review_status` | blocked、review、stable |
| 评分来源状态 | `rating_source_status` | blocked、review、stable |

## 7. 页面模块

### 7.1 证据状态条

目的：让用户先看到本页是否能用于业务判断。

字段：

| 字段 | 展示方式 | 解释 |
| --- | --- | --- |
| `alias_review_status` | 状态标签 | 品牌别名是否完成审核 |
| `rating_source_status` | 状态标签 | 评分来源是否确认 |
| `tag_review_status` | 状态标签 | 本土化标签是否完成审核 |
| `privacy_review_status` | 状态标签 | 样本摘录是否允许展示 |
| `evidence_level` | 状态标签 | 页面证据等级 |
| `dq_status` | 状态标签 | 数据质量状态 |
| `sample_size` | 数值 | 当前筛选下样本量 |

本页 DQ 编码固定为 `VOC-DQ-COMP`，用于标记竞品别名、评分来源、本土化标签和样本隐私审核的综合质量状态。

状态解释：

| 状态 | 页面行为 |
| --- | --- |
| Grey | 只展示结构和样例，不允许结论化表达 |
| Amber | 允许展示候选洞察，必须标注待复核 |
| Green | 允许进入正式 BI 候选，但仍需保留来源链路 |
| Red | 禁止展示具体结论，只显示缺口和待办 |

### 7.2 品牌覆盖概览

目的：确认当前筛选下是否有足够品牌、国家、渠道和样本覆盖。

指标：

| 指标 | 字段 |
| --- | --- |
| 品牌数 | `brand_id` distinct count |
| 自有品牌数 | `is_self = true` brand count |
| 竞品品牌数 | `is_self = false` brand count |
| 国家覆盖 | `country_code` distinct count |
| 渠道覆盖 | `channel_id` distinct count |
| 样本量 | `sample_size` |
| 别名待审数 | `alias_review_status != stable` count |

展示原则：

1. 覆盖不足时，页面先提示 `VOC-AGENT-003` 补证据。
2. 不用品牌数推导市场覆盖率。
3. 不用样本量推导品牌份额。

### 7.3 品牌评分对比

目的：展示自有品牌与竞品在评分、差评率和声量上的候选差异。

字段：

| 字段 | 说明 |
| --- | --- |
| `star_rating` | 原始评分字段，来源未确认前为 candidate |
| `mc_rating` | 自有品牌评分 mock 或候选字段 |
| `comp_rating` | 竞品评分 mock 或候选字段 |
| `rating_gap` | 评分差异，只表示评分候选差，不表示优势 |
| `bad_rate` | 差评率 |
| `review_cnt` | 评论量 |
| `voc_cnt` | VOC 声量 |

展示规则：

1. 图表标题使用“品牌评分对比”，不使用“竞争优势排名”。
2. `rating_gap` 只命名为评分差异。
3. `mc_rating` 和 `comp_rating` 在评分来源确认前统一显示 mock/candidate 标签。
4. 样本量不足时禁用排序结论。

### 7.4 自有品牌与竞品 VOC 矩阵

目的：对比自有品牌和竞品在声量、提及、情绪和差评率上的候选分布。

字段：

| 字段 | 说明 |
| --- | --- |
| `voc_cnt` | VOC 条数 |
| `voc_rate` | 当前筛选下 VOC 占比 |
| `mention_self_cnt` | 自有品牌提及数 |
| `mention_comp_cnt` | 竞品提及数 |
| `bad_rate` | 差评率 |
| `sentiment_polarity` | 情绪方向，blocked 时不展示结论 |

展示规则：

1. 声量高只表示被讨论更多。
2. 差评率高只表示风险候选。
3. 情绪字段未确认前，不写“消费者更喜欢”。

### 7.5 国家话术矩阵

目的：按国家、渠道和品牌展示本土化标签分布。

字段：

| 字段 | 说明 |
| --- | --- |
| `country_code` | 国家 |
| `channel_id` | 渠道 |
| `brand_name` | 品牌 |
| `tag_localized` | 本土化标签 |
| `localized_tag_confidence` | 标签置信度 |
| `sample_count` | 标签样本数 |

展示规则：

1. 低样本量标签只进入待复核队列。
2. 标签置信度不足时，不进入本土化卖点列表。
3. 不跨国家直接复用话术。

### 7.6 本土化痛点、卖点、话术候选列表

目的：把 VOC 标签整理为人工可审的本土化表达候选。

字段：

| 字段 | 说明 |
| --- | --- |
| `localized_pain_point` | 本土化痛点 |
| `localized_selling_point` | 本土化卖点 |
| `localized_copy_candidate` | 本土化话术候选 |
| `price_sensitivity_tag` | 价格敏感标签 |
| `feature_preference_tag` | 功能偏好标签 |
| `packaging_preference_tag` | 包装偏好标签 |
| `trust_signal_tag` | 信任信号标签 |
| `local_language_keyword` | 本地语言关键词 |
| `tag_review_status` | 标签审核状态 |

展示规则：

1. `localized_copy_candidate` 只作为 review 文案候选。
2. 文案候选必须展示证据等级、样本数和审核状态。
3. 未过 `privacy_review_status` 的样本不得展示原文摘录。
4. 本页不直接生成广告素材、落地页文案或投放文案。

### 7.7 竞品样本证据抽屉

目的：为每个候选标签或话术提供可复核证据。

字段：

| 字段 | 说明 |
| --- | --- |
| `sample_post_cnt` | 样本帖子数 |
| `sample_comment_cnt` | 样本评论数 |
| `sample_post_id_list_hash` | 样本帖子 ID hash 列表 |
| `sample_content_hash_list` | 样本内容 hash 列表 |
| `sample_excerpt_available_flag` | 摘录是否允许展示 |
| `sample_excerpt` | 经过隐私审核的短摘录 |
| `source_url_hash` | 来源 URL hash |
| `manual_review_case_id` | 人工审核 case |

展示规则：

1. 默认展示 hash、来源类型和审核状态。
2. 只有 `sample_excerpt_available_flag = true` 且 `privacy_review_status = stable` 时展示 `sample_excerpt`。
3. 不展示完整原文、PII、未审核用户名或未脱敏链接。

### 7.8 `VOC-AGENT-003` 待办队列

触发条件：

| 触发条件 | 待办类型 |
| --- | --- |
| `alias_review_status = blocked` | 竞品别名归一审核 |
| `rating_source_status = blocked` | 评分来源确认 |
| `tag_review_status != stable` | 本土化标签复核 |
| `sample_size` 低于阈值 | 样本补采 |
| `rating_gap` 较高但 `evidence_level != Green` | 评分差异证据复核 |
| `localized_copy_candidate` 有值但未审核 | 话术候选人工审核 |

队列输出字段：

| 字段 | 说明 |
| --- | --- |
| `task_id` | 待办 ID |
| `task_type` | 待办类型 |
| `brand_id` | 品牌 |
| `country_code` | 国家 |
| `channel_id` | 渠道 |
| `evidence_level` | 当前证据等级 |
| `blocking_reason` | 阻塞原因 |
| `owner_agent` | 固定为 `VOC-AGENT-003` |

## 8. 页面状态

| 页面状态 | 判定条件 | 页面行为 |
| --- | --- | --- |
| Grey | 仅有 mock 或行业参考 | 展示结构样例，不展示业务结论 |
| Amber | 有候选宽表和样本，但来源未全部确认 | 展示候选洞察和待办 |
| Green | 品牌别名、评分来源、标签和隐私审核均 stable | 进入正式 BI 候选 |
| Red | 数据缺失、DQ 失败或隐私审核失败 | 禁止展示结论，只展示缺口 |

## 9. 验收标准

1. 页面明确绑定 `VOC-BI-003`、`VOC-T3`、`VOC-AGENT-003`。
2. 页面读取对象明确为 `dwt_voc_competitor_localization`。
3. 页面引用 `fact_voc_brand_summary`、`dim_brand`、`ods_voc_external`、`dim_voc_tag` 作为上游候选，不把它们写成已落地生产表。
4. 页面包含品牌评分对比、自有与竞品 VOC 矩阵、国家话术矩阵、本土化卖点列表、样本证据抽屉和 Agent 队列。
5. 页面明确禁止把 `rating_gap` 写成优势、份额、ROI 或投放动作。
6. 页面明确 `localized_copy_candidate` 只用于 review，不直接输出可投放广告文案。
7. 页面在评分来源、别名、标签、隐私审核未稳定前保持 blocked 或 Amber。
8. 页面不进入 `sql/`，不写生产 SQL，不创建调度定义。

## 10. 当前禁止动作

1. 不创建 `sql/dwt_voc_competitor_localization.sql`。
2. 不把 `competitor_opportunity.csv`、`fact_voc_brand_summary_mock.csv`、`ods_voc_external_mock.csv` 当作生产事实表。
3. 不把行业报告中的竞品信息写成当前数据结论。
4. 不输出“竞品强弱排名”“市场份额排名”“转化优势排名”。
5. 不直接把话术候选交给投放、素材或站内页面。

## 11. 待用户决策

| 决策点 | 当前风险 | 建议下一步 |
| --- | --- | --- |
| 竞品品牌范围 | Momcozy、Medela、Elvie、Willow、Spectra、BabyBuddha 等是否全部纳入未确认 | 先确认核心竞品池，再维护 `dim_brand` |
| 品牌别名规则 | 社媒、评论、帖子里的品牌别名可能混乱 | 建立 `brand_alias_raw` 到 `brand_id` 的审核表 |
| 本土化标签生成方式 | 人工标签、LLM 标签、规则标签混用会造成口径漂移 | 明确 `dim_voc_tag` 的 tag source 和 review owner |
| 评分来源 | `mc_rating`、`comp_rating` 仍是 mock/candidate | 确认评分来自评论、平台 rating、人工标注还是混合计算 |
| 摘录展示权限 | 样本原文可能涉及隐私、平台条款和版权 | 只开放 hash 和短摘录，摘录需过隐私审核 |
| 话术展示权限 | `localized_copy_candidate` 容易被误用为投放文案 | 页面文案区固定标注 review/candidate |

## 12. 下一步

下一步进入 `VOC-BI-004`，创建 `drafts/docs/voc-bi-trend-radar-prd-draft-20260603.md`。

`VOC-BI-004` 目标是定义全域 VOC 趋势与渠道输入页面，重点处理趋势、渠道、内容输入和 Agent 队列。该页面仍不得输出预算动作、投放动作或生产 SQL。
