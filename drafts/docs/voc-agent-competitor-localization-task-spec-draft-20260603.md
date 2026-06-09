---
title: 竞品口碑与本土化话术 Agent 任务规格草稿
doc_type: workflow
module: project-governance
topic: voc-agent-competitor-localization-task-spec
status: draft
created: 2026-06-03
updated: 2026-06-03
owner: self
source: human+ai
---

# 竞品口碑与本土化话术 Agent 任务规格草稿

## 1. Agent 定位

`VOC-AGENT-003` 绑定 `VOC-T3` 与 `VOC-BI-003`，服务于竞品口碑与本土化表达场景。

它的任务不是生成竞品结论，而是把 `dwt_voc_competitor_localization` 宽表中的低可信字段、样本缺口、人工审查点和跨团队交接事项转成可处理任务。

当前状态保持 `blocked`。阻塞原因是竞品别名、评分来源、本土化标签、样本隐私和候选话术尚未完成稳定证据链治理。

本文件只定义 Agent 任务规格，不创建 Agent 代码、不创建生产 SQL、不创建运行脚本。

## 2. Agent 职责边界

允许处理的任务：

- 竞品别名与品牌映射审查。
- 评分来源、评分口径、评分差异证据审查。
- 本土化标签、痛点、卖点、语言关键词审查。
- 候选话术的人工复核任务生成。
- 样本数量、样本哈希、样本摘录与隐私审查。
- `rating_gap`、`bad_rate`、`sentiment_polarity` 等指标的证据充分性审查。
- 国家、渠道、站点、品牌、品类覆盖缺口任务生成。
- 将稳定候选问题交接给 `BRAND`、`MKT`、`PRODUCT`、`DATA` 角色复核。

禁止处理的任务：

- 不输出竞品排名。
- 不输出市场份额。
- 不输出转化优势。
- 不输出营销 ROI。
- 不输出可投放广告文案。
- 不把 `advantage` 写成真实竞争优势。
- 不把 `localized_copy_candidate` 直接交给投放。
- 不基于 mock、草稿、行业报告摘要生成生产级经营建议。

## 3. 证据来源

| 证据源 | 用途 | 当前证据等级 |
|---|---|---|
| `drafts/docs/voc-bi-competitor-localization-prd-draft-20260603.md` | 页面、Agent 队列、冻结项与验收口径 | Amber |
| `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | VOC 专题产品化蓝图与跨页面关系 | Amber |
| `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | 指标命名、字段语义和治理边界 | Amber |
| `drafts/analysis/voc-topic-competitor-localization-wide-table-spec-draft-20260603.md` | `dwt_voc_competitor_localization` 宽表草案 | Amber |
| `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md` | 外部需求宽表与跨页字段参照 | Amber |
| `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 专题、课题、数据需求矩阵 | Amber |
| `main_project_lute/全局数据资源整合/03_外部数据需求清单.md` | 外部数据源需求 | Amber |
| `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 数仓表结构与主键设计 | Amber |
| `main_project_lute/Phase3_全专题与运营化/专题×交叉线_字段口径说明.md` | 字段口径与运营化说明 | Amber |
| `main_project_lute/Phase1_故事线与智能体/专题故事线/专题①_全域VOC数据洞察_故事线.md` | VOC 故事线与智能体锚点 | Amber |
| `ref/company_info/momcozy_industry_report.md` | 行业背景与竞品叙事参考 | Grey |
| `main_project_lute/phase3_outputs/topic1_voc/competitor_opportunity.csv` | 竞品机会样例输出 | Grey |
| `main_project_lute/phase3_mock/fact_voc_brand_summary_mock.csv` | 品牌 VOC mock 指标 | Grey |
| `main_project_lute/phase3_mock/ods_voc_external_mock.csv` | 外部 VOC mock 明细 | Grey |
| `main_project_lute/phase3_mock/dim_voc_tag_mock.csv` | VOC 标签 mock 维表 | Grey |

`ref/company_info/momcozy_industry_report.md` 只作为行业背景参考，不视为生产数据源。所有 mock CSV 只能用于字段、任务类型和页面原型推演，不能作为真实市场判断证据。

上游表与样例文件关系：

- `fact_voc_brand_summary` 承载品牌级 VOC 聚合指标。
- `dim_brand` 承载品牌主数据、竞品别名和品牌映射关系。
- `ods_voc_external` 承载外部 VOC 原始样本。
- `dim_voc_tag` 承载 VOC 标签与本土化标签维度。
- `competitor_opportunity.csv` 只作为竞品机会样例输出，不作为真实优势证据。

## 4. 输入契约

### 4.1 页面上下文

Agent 必须接收以下页面筛选与上下文字段：

- `dt_month`
- `country_code`
- `channel_id`
- `site`
- `platform`
- `brand_id`
- `brand_name`
- `is_self`
- `competitor_group`
- `category_l3`
- `product_line_candidate`
- `tag_localized`
- `evidence_level`
- `alias_review_status`
- `rating_source_status`
- `tag_review_status`
- `privacy_review_status`

### 4.2 品牌与竞品维度

- `brand_alias_raw`
- `competitor_brand_id`
- `brand_country_origin`
- `brand_local_presence_level`
- `brand_mapping_confidence`

### 4.3 指标字段

- `voc_cnt`
- `voc_rate`
- `review_cnt`
- `star_rating`
- `mc_rating`
- `comp_rating`
- `rating_gap`
- `bad_rate`
- `mention_self_cnt`
- `mention_comp_cnt`
- `sentiment_polarity`

### 4.4 本土化字段

- `tag_localized`
- `localized_pain_point`
- `localized_selling_point`
- `localized_copy_candidate`
- `price_sensitivity_tag`
- `feature_preference_tag`
- `packaging_preference_tag`
- `trust_signal_tag`
- `local_language_keyword`
- `localized_tag_confidence`

### 4.5 样本与治理字段

- `sample_post_cnt`
- `sample_comment_cnt`
- `sample_post_id_list_hash`
- `sample_content_hash_list`
- `sample_excerpt_available_flag`
- `sample_excerpt`
- `source_url_hash`
- `manual_review_case_id`
- `source_system`
- `source_file_or_job`
- `dq_status`
- `sample_size`

## 5. 触发条件

| 条件 | 任务类型 | 处理目标 |
|---|---|---|
| `alias_review_status = blocked` | `brand_alias_review` | 确认竞品别名、品牌 ID 和原始别名映射 |
| `rating_source_status = blocked` | `rating_source_review` | 补足评分来源、评分口径和评分区间 |
| `tag_review_status != stable` | `localized_tag_review` | 审查本土化标签是否可解释、可复核 |
| `privacy_review_status != stable` | `sample_privacy_review` | 检查样本摘录、哈希与隐私处理状态 |
| `sample_size` 低于阈值 | `sample_replenishment_review` | 请求补样或降级证据等级 |
| `rating_gap` 高但 `evidence_level != Green` | `rating_gap_evidence_review` | 补充评分差异证据，不输出优势结论 |
| `localized_copy_candidate` 存在但未复核 | `copy_candidate_review` | 交给人工确认候选话术是否可进入下一步 |
| `brand_mapping_confidence` 低 | `brand_mapping_review` | 修正品牌映射，不生成竞品判断 |
| `product_line_candidate` 缺失 | `product_line_mapping_review` | 将竞品表达绑定到产品线候选 |
| 任一 DQ 失败 | `dq_blocker_review` | 生成数据治理阻塞任务 |

## 6. DQ Gate

| DQ ID | Gate | 阻塞条件 |
|---|---|---|
| `VOC-DQ-COMP-SCHEMA-001` | 表结构完整性 | 必填字段缺失或字段类型无法解释 |
| `VOC-DQ-COMP-GRAIN-001` | 粒度一致性 | 页面筛选粒度与宽表粒度冲突 |
| `VOC-DQ-COMP-ALIAS-001` | 竞品别名治理 | `brand_alias_raw` 无法映射到稳定品牌 ID |
| `VOC-DQ-COMP-RATING-001` | 评分来源治理 | `mc_rating`、`comp_rating` 或 `rating_gap` 缺少来源说明 |
| `VOC-DQ-COMP-TAG-001` | 本土化标签治理 | 标签缺少样本支持或人工复核状态 |
| `VOC-DQ-COMP-SAMPLE-001` | 样本充分性 | `sample_size`、样本哈希或样本摘录不足 |
| `VOC-DQ-COMP-CHANNEL-001` | 渠道覆盖 | 国家、站点、平台、渠道覆盖不足 |
| `VOC-DQ-COMP-PRODUCT-001` | 产品线映射 | 竞品表达无法绑定到稳定产品线候选 |
| `VOC-DQ-COMP-PII-001` | 隐私处理 | 样本摘录未完成脱敏或哈希处理 |
| `VOC-DQ-COMP-CLAIM-001` | 结论降级 | 草稿、mock、Grey 证据被写成真实经营结论 |

任一 DQ 为 `blocked` 时，Agent 只能生成治理任务，不允许生成业务建议。

## 7. 输出契约

### 7.1 任务队列

Agent 输出任务队列必须包含：

- `task_id`
- `task_type`
- `severity`
- `evidence_level`
- `dq_ids`
- `dt_month`
- `country_code`
- `channel_id`
- `site`
- `platform`
- `brand_id`
- `brand_name`
- `brand_alias_raw`
- `competitor_group`
- `tag_localized`
- `metric_name`
- `metric_value`
- `metric_status`
- `sample_size`
- `sample_content_hash_list`
- `blocking_reason`
- `requested_evidence`
- `handoff_target`
- `handoff_reason`
- `owner_agent`

`owner_agent` 固定为 `VOC-AGENT-003`。

### 7.2 本土化洞察候选

候选洞察只能作为人工复核输入，字段包括：

- `localized_candidate_title`
- `localized_candidate_scope`
- `localized_pain_point`
- `localized_selling_point`
- `localized_copy_candidate`
- `supporting_metrics`
- `supporting_samples`
- `copy_review_status`
- `blocking_reason`

`localized_copy_candidate` 的默认状态是 `candidate`。未进入人工复核前，不允许标记为 `stable`。

### 7.3 评分差异审查

评分差异审查输出必须保留：

- `rating_gap`
- `mc_rating`
- `comp_rating`
- `rating_source_status`
- `required_rating_source`
- `rating_sample_size`
- `rating_period`
- `rating_platform`
- `blocking_reason`

当 `rating_source_status != stable` 时，`rating_gap` 只能作为审查线索，不能写成真实竞争优势。

### 7.4 样本证据请求

样本证据请求必须包含：

- `sample_post_cnt`
- `sample_comment_cnt`
- `sample_post_id_list_hash`
- `sample_content_hash_list`
- `sample_excerpt_available_flag`
- `privacy_review_status`
- `requested_sample_rule`
- `blocking_reason`

### 7.5 交接目标

| `handoff_target` | 允许事项 | 禁止事项 |
|---|---|---|
| `BRAND` | 审查本土化表达、品牌语气、竞品提法 | 直接定稿对外话术 |
| `MKT` | 审查候选话术和素材方向 | 输出可投放广告文案、预算建议、营销 ROI |
| `PRODUCT` | 审查功能痛点、包装偏好、产品线候选 | 输出未经验证的产品改造结论 |
| `DATA` | 补字段、补样本、修 DQ、稳定口径 | 直接给业务结论背书 |

## 8. 状态机

| 状态 | 定义 | Agent 行为 |
|---|---|---|
| `Grey` | 来源为 mock、行业背景、草稿或样例输出 | 只生成字段缺口和治理任务 |
| `Amber` | 已有口径草案，但证据链未稳定 | 生成审查任务和交接任务 |
| `Green` | 字段、样本、来源、人工复核均稳定 | 允许进入页面候选洞察，但仍不自动投放 |
| `Red` | DQ 失败或证据误用 | 阻断页面结论和业务交接 |

## 9. 验收标准

- 页面 `VOC-BI-003` 能显示 `VOC-AGENT-003` 的任务队列来源和阻塞原因。
- `brand_alias_review` 能定位品牌别名、映射置信度和缺失证据。
- `rating_source_review` 能定位 `mc_rating`、`comp_rating`、`rating_gap` 的来源缺口。
- `localized_tag_review` 能定位标签、样本和人工复核状态。
- `sample_privacy_review` 能阻断未脱敏样本进入页面洞察。
- `copy_candidate_review` 只输出候选，不输出可投放话术。
- 所有 mock、草稿、行业报告证据默认不升级为 `Green`。
- 任一 DQ 失败时，页面只显示治理任务，不显示业务结论。

## 10. 当前禁止动作

- 不进入 `sql/`。
- 不写生产 SQL。
- 不创建 Agent 运行脚本。
- 不创建正式区文档。
- 不输出竞品排名。
- 不输出市场份额。
- 不输出转化优势。
- 不输出营销 ROI。
- 不输出可投放广告文案。
- 不把 `advantage` 写成真实竞争优势。
- 不把 `localized_copy_candidate` 直接交给投放。

## 11. 待决策事项

| 决策项 | 当前建议 | 需要确认的问题 |
|---|---|---|
| 竞品品牌别名治理来源 | 先由 `DATA` 建立别名映射表，再由 `BRAND` 复核 | 是否已有可用的正式竞品主数据 |
| 评分来源优先级 | 平台评分、评论星级、第三方评分必须分开 | 是否允许引用外部行业报告中的非结构化评分描述 |
| 本土化标签审核角色 | `BRAND` 负责语气，`PRODUCT` 负责功能痛点，`MKT` 只审候选表达 | 是否需要单独设置法务或合规复核 |
| 候选话术输出范围 | 只保留候选，不进入投放 | 是否允许进入素材 brief，而不是广告文案 |
| Green 升级门槛 | DQ 全绿、样本充分、人工复核完成后再升级 | 样本阈值按国家、渠道还是品类分别设定 |

## 12. 下一步

下一步进入 `VOC-AGENT-004`：趋势预警与异常漂移 Agent 任务规格。

目标文件：

- `drafts/docs/voc-agent-trend-radar-task-spec-draft-20260603.md`
