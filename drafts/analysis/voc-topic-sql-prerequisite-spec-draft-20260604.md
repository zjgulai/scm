---
title: 专题① VOC SQL 前置规格草稿
doc_type: analysis
module: project-governance
topic: voc-topic-sql-prerequisite-spec
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC SQL 前置规格草稿

## 1. 规格定位

本文执行 `VOC-SQL-001`，用于固定专题① VOC 四张目标宽表进入 SQL 构建前必须满足的依赖、DQ gate、字段验收、构建顺序和禁止动作。

当前文件不是 SQL 初稿，不创建 `sql/` 资产，不写可执行 DDL / DML，不连接数据库，不声明任何源表已经生产可用。

当前准入结论：

- 可以创建 `VOC-SQL-001` 前置规格草稿。
- 不可以创建正式 SQL。
- 不可以创建生产调度。
- 不可以创建 Agent 运行脚本。
- 不可以把 Phase3 mock、CSV 样例、行业参考或草稿字段升级为生产事实。

反面论证：`01_专题课题_数据需求矩阵.md` 和 `05_数仓表结构与主键设计.md` 已经给出事实表、维表、主键和粒度，似乎可以直接写 SQL。但当前四张 VOC 宽表均为 `blocked`，缺少源表 Owner、样本权限、标签体系、平台政策、趋势算法和 DQ 通过证据。直接写 SQL 会把规划基线误当成生产可用性。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| 治理检查点 | `drafts/analysis/voc-topic-agent-spec-governance-checkpoint-draft-20260604.md` | 判断是否允许进入 `VOC-SQL-001` | Amber |
| VOC 蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | 固定四子课题、BI、Agent、DQ 和 SQL 前置关系 | Amber |
| 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | 固定指标状态、字段语义和 blocked 项 | Amber |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 固定 `fact_voc_*`、`ods_voc_*`、`dim_voc_*` 规划表 | Amber |
| 数仓主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 固定 fact / dim / ods 的粒度、主键和分区建议 | Amber |
| 货架内宽表 | `drafts/analysis/voc-topic-shelf-inside-wide-table-spec-draft-20260603.md` | `dwt_voc_shelf_inside` 前置门槛 | Amber |
| 外部需求宽表 | `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md` | `dwt_voc_external_demand` 前置门槛 | Amber |
| 竞品本土化宽表 | `drafts/analysis/voc-topic-competitor-localization-wide-table-spec-draft-20260603.md` | `dwt_voc_competitor_localization` 前置门槛 | Amber |
| 趋势雷达宽表 | `drafts/analysis/voc-topic-trend-wide-table-spec-draft-20260603.md` | `dwt_voc_trend_radar` 前置门槛 | Amber |
| Phase3 mock | `main_project_lute/phase3_outputs/topic1_voc/`、`main_project_lute/phase3_mock/` | 字段形态和页面样例 | Grey |

Grey 来源只允许作为字段样例、页面样例和检查清单输入，不允许进入生产 SQL 依赖。

## 3. 目标宽表范围

| 构建顺序 | 目标宽表 | 服务对象 | 主要来源 | 当前状态 | SQL 前置目标 |
|---|---|---|---|---|---|
| 1 | `dwt_voc_shelf_inside` / `dwt_voc_service_experience` | `VOC-T1`、`VOC-BI-001`、`VOC-AGENT-001` | 内部 VOC、评论、工单、退货留言、标签、销量分母 | blocked | 固定内部 VOC 源表、标签、分母、原文权限和主键门槛 |
| 2 | `dwt_voc_external_demand` | `VOC-T2`、`VOC-BI-002`、`VOC-AGENT-002` | 外部帖子 / 评论、社区维表、外部日聚合、标签和情绪 | blocked | 固定平台政策、采样、语言、标签、情绪、PII 和去重门槛 |
| 3 | `dwt_voc_competitor_localization` | `VOC-T3`、`VOC-BI-003`、`VOC-AGENT-003` | 品牌 VOC、品牌维表、外部竞品提及、标签、渠道映射 | blocked | 固定品牌别名、评分来源、本土化标签、样本隐私和产品线映射门槛 |
| 4 | `dwt_voc_trend_radar` | `VOC-T4`、`VOC-BI-004`、`VOC-AGENT-004` | VOC 趋势、内部 VOC、外部日聚合、标签、渠道 / 营销背景 | blocked | 固定来源枚举、时间窗口、趋势算法、标签趋势和 handoff 门槛 |

构建顺序不代表可以立即建表。它只定义未来 SQL 设计的依赖优先级。

## 4. 源表依赖矩阵

| 表 / 资产 | 类型 | 主要服务 | 当前状态 | 进入 SQL 前必须确认 |
|---|---|---|---|---|
| `dwd_voc_record_detail_full` | dwd | `dwt_voc_shelf_inside` | blocked | 源系统、主键、日期口径、原文权限、标签字段 |
| `dws_voc_record_analysis_day_full` | dws | `dwt_voc_shelf_inside` | blocked | 聚合粒度、标签缺失率、来源枚举、日期口径 |
| `ads_voc_record_stat_full` | ads | `dwt_voc_shelf_inside` | blocked | 看板口径、时间粒度、分母来源、指标定义 |
| `fact_voc_summary` | fact | T1 / T4 | blocked | 主键、`sales_qty`、`voc_rate`、星级和好中差评率口径 |
| `ods_review_detail` | ods | T1 / T3 | blocked | 评论主键、评论时间、评分范围、评论原文权限 |
| `ods_voc_external` | ods | T2 / T3 / T4 | blocked | 平台政策、post/comment 主键、PII、文本保留、采集批次 |
| `dim_voc_external_community` | dim | T2 / T4 | blocked | 社区主键、国家 / 语言 / 受众阶段映射 |
| `fact_voc_external_daily` | fact | T2 / T4 | candidate / blocked | 平台×国家×主题×日聚合粒度和刷新频率 |
| `fact_voc_brand_summary` | fact | T3 | blocked | 品牌×国家×渠道×月粒度、评分来源、竞品标识 |
| `dim_brand` | dim | T3 | blocked | 品牌 ID、别名、本地语言名、自有 / 竞品标识 |
| `fact_voc_trend` | fact | T4 | blocked | 国家×渠道×来源类型×品类×月粒度、趋势算法 |
| `dim_voc_tag` | dim | T1 / T2 / T3 / T4 | blocked | `tag_l2`、`tag_l3`、`topic_tag`、`tag_localized` 映射 |
| `dim_channel` | dim | T1 / T3 / T4 | candidate | `channel_id`、`site`、`gtm_group`、渠道历史变更 |
| `fact_channel_country_month` | fact | T4 背景 | blocked | 只作 CHANNEL 背景，不进入 VOC 因果结论 |
| `fact_channel_health` | fact | T4 背景 | blocked | 只作 CHANNEL 背景，不输出渠道动作 |
| `fact_campaign_daily` | fact | T4 背景 | blocked | 只作 MKT 背景，不输出投放动作 |
| `fact_campaign_roi` | fact | T4 背景 | blocked | 只作 MKT 背景，不输出 ROI 因果 |

## 5. P0 / P1 / P2 输入分层

| 层级 | 定义 | 处理规则 |
|---|---|---|
| P0 | 目标宽表不可缺少的核心事实表 / 明细表 / 维表 | 未确认时不得进入 SQL 初稿 |
| P1 | 可增强解释、分层或交叉线 handoff 的来源 | 未确认时可列为可选依赖，但不得驱动核心指标 |
| P2 | mock、CSV 样例、行业参考、方法论资产 | 只作字段形态参考，不进入生产依赖 |

四张目标宽表的 P0 依赖：

| 目标宽表 | P0 依赖 |
|---|---|
| `dwt_voc_shelf_inside` | `dwd_voc_record_detail_full`、`dws_voc_record_analysis_day_full`、`ads_voc_record_stat_full`、`fact_voc_summary`、`ods_review_detail`、`dim_voc_tag` |
| `dwt_voc_external_demand` | `ods_voc_external`、`dim_voc_external_community`、`fact_voc_external_daily` |
| `dwt_voc_competitor_localization` | `fact_voc_brand_summary`、`dim_brand`、`ods_voc_external`、`dim_voc_tag` |
| `dwt_voc_trend_radar` | `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily`、`ods_voc_external`、`dim_voc_tag` |

## 6. DQ Gate 总表

### 6.1 货架内服务质量

| DQ ID | SQL 前置判断 |
|---|---|
| `VOC-DQ-SHELF-SCHEMA-001` | 主键、时间、来源、渠道、国家、商品、标签和指标字段存在 |
| `VOC-DQ-SHELF-PK-001` | 推荐逻辑主键在样本内唯一 |
| `VOC-DQ-SHELF-DATE-001` | `data_caliber`、`period_grain`、`period_value` 不混用 |
| `VOC-DQ-SHELF-SOURCE-001` | `voc_type`、`data_source`、`voc_source_group` 可映射 |
| `VOC-DQ-SHELF-TAG-001` | 标签层级缺失率、冲突率和不可映射率可检查 |
| `VOC-DQ-SHELF-SALES-001` | 销量分母来源明确且非负 |
| `VOC-DQ-SHELF-RATING-001` | 星级和评分字段范围合法 |
| `VOC-DQ-SHELF-REVIEW-001` | 评论分母非负，分子不超过分母 |
| `VOC-DQ-SHELF-TEXT-001` | 原文引用权限、脱敏和哈希规则明确 |
| `VOC-DQ-SHELF-XL3-001` | 退款输入只能作为售后主题线索 |

### 6.2 货架外高潜需求

| DQ ID | SQL 前置判断 |
|---|---|
| `VOC-DQ-EXT-SCHEMA-001` | 外部源表、聚合表和社区维表字段稳定 |
| `VOC-DQ-EXT-PK-001` | post / comment 主键粒度不重复，批次可追溯 |
| `VOC-DQ-EXT-SAMPLE-001` | 样本来源、采样方法、样本量、覆盖周期明确 |
| `VOC-DQ-EXT-LANG-001` | 语言识别和跨语言翻译规则确认 |
| `VOC-DQ-EXT-TAG-001` | 主题标签和需求标签经过人工样本校准 |
| `VOC-DQ-EXT-SENTIMENT-001` | 情绪分类经过标注集或人审校准 |
| `VOC-DQ-EXT-BRAND-001` | 品牌 alias 字典可追溯 |
| `VOC-DQ-EXT-PII-001` | PII、URL、全文内容保留策略合规 |
| `VOC-DQ-EXT-DUP-001` | 跨平台和同平台去重规则明确 |
| `VOC-DQ-EXT-FRESHNESS-001` | 采集周期和刷新频率明确 |

### 6.3 竞品口碑与本土化

| DQ ID | SQL 前置判断 |
|---|---|
| `VOC-DQ-COMP-SCHEMA-001` | `fact_voc_brand_summary`、`dim_brand`、`ods_voc_external` 字段存在且类型稳定 |
| `VOC-DQ-COMP-GRAIN-001` | 品牌×国家×渠道 / 站点×月份×本土化标签粒度不重复 |
| `VOC-DQ-COMP-ALIAS-001` | 竞品品牌别名、拼写、缩写和本地语言名可追溯 |
| `VOC-DQ-COMP-RATING-001` | `star_rating`、`mc_rating`、`comp_rating` 来源与口径确认 |
| `VOC-DQ-COMP-TAG-001` | `tag_localized` 经过人工样本校准 |
| `VOC-DQ-COMP-SAMPLE-001` | 外部样本来源、样本量、国家覆盖和采样方法明确 |
| `VOC-DQ-COMP-CHANNEL-001` | `channel_id`、`site`、`platform` 映射稳定 |
| `VOC-DQ-COMP-PRODUCT-001` | 产品线、SPU、型号映射规则确认 |
| `VOC-DQ-COMP-PII-001` | 样本摘录、URL、用户标识脱敏合规 |
| `VOC-DQ-COMP-CLAIM-001` | 输出结论不写转化、ROI、市场份额或可投放文案 |

### 6.4 声量趋势与渠道输入

| DQ ID | SQL 前置判断 |
|---|---|
| `VOC-DQ-TREND-SCHEMA-001` | `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily` 字段存在且类型稳定 |
| `VOC-DQ-TREND-GRAIN-001` | 月份×国家×渠道×来源类型×品类×标签×品牌范围粒度不重复 |
| `VOC-DQ-TREND-SOURCE-001` | `voc_source_type` 枚举稳定，内外部来源不混写 |
| `VOC-DQ-TREND-TIME-001` | 月份、采集窗口、评论时间、工单时间、外部帖子时间规则一致 |
| `VOC-DQ-TREND-ALG-001` | `voc_trend_12m`、`trend_slope`、`trend_direction` 算法确认 |
| `VOC-DQ-TREND-TAG-001` | `tag_key`、`tag_trend`、`emerging_tag_flag` 经过标签口径确认 |
| `VOC-DQ-TREND-ZERO-001` | 上期为 0、样本缺失、小样本波动处理规则确认 |
| `VOC-DQ-TREND-CROSS-001` | CHANNEL / MKT 背景只作上下文，不进入 VOC 因果结论 |
| `VOC-DQ-TREND-HANDOFF-001` | handoff 目标、原因和允许条件经过 Owner 确认 |
| `VOC-DQ-TREND-CLAIM-001` | 输出结论不写渠道加码、预算、ROI 或管理动作 |

## 7. 字段验收门槛

| 字段类型 | 验收要求 | 未通过时状态 |
|---|---|---|
| 主键字段 | 推荐主键在样本内唯一；跨表 join 不放大行数 | Red / blocked |
| 时间字段 | `dt`、`dt_month`、`period_start`、`period_end` 口径明确 | blocked |
| 来源字段 | 内部、外部、评论、工单、社媒、社区来源可枚举 | blocked |
| 标签字段 | `tag_l2`、`tag_l3`、`topic_tag`、`tag_localized` 可映射 | blocked |
| 样本字段 | 样本 ID、样本哈希、摘录权限、脱敏策略明确 | blocked |
| 分母字段 | `sales_qty`、`review_cnt`、样本数等非负且来源明确 | blocked |
| 评分字段 | 星级范围、评分来源、评分周期和品牌维度明确 | blocked |
| 趋势字段 | 变化率、同比、趋势算法和 0 分母规则明确 | blocked |
| 背景字段 | CHANNEL / MKT / ORDER 字段只作背景，不作 VOC 因果 | Amber / blocked |

## 8. 状态推进规则

| 状态 | 判定 | SQL 前置行为 |
|---|---|---|
| `Grey` | 只有 mock、规划、参考资料或字段样例 | 只列缺口和字段候选 |
| `Amber` | 有样本或草稿宽表，但 DQ、Owner 或权限未全过 | 允许写前置规格和审查清单 |
| `Green` | 源表、字段、主键、权限、DQ、Owner 签收均通过 | 才允许讨论正式 SQL 初稿 |
| `Red` | 主键、权限、PII、来源、标签或结论越权失败 | 阻断 SQL，先修 DQ |

当前四张目标宽表均不是 `Green`。因此本文只能作为 `Amber` 级前置规格。

## 9. 禁止动作

- 不创建 `sql/dwt_voc_shelf_inside.sql`。
- 不创建 `sql/dwt_voc_external_demand.sql`。
- 不创建 `sql/dwt_voc_competitor_localization.sql`。
- 不创建 `sql/dwt_voc_trend_radar.sql`。
- 不写可执行 DDL。
- 不写可执行 DML。
- 不写伪 SQL。
- 不创建调度脚本。
- 不连接数据库。
- 不声明源表已经生产可用。
- 不把 Phase3 mock 当作生产事实。
- 不把 Grey / Amber 证据升级为 Green。
- 不把 VOC 输出写成渠道、营销、库存、SKU 改版、管理层动作或 ROI 结论。

## 10. Mock 隔离规则

| 资产 | 可用范围 | 禁止范围 |
|---|---|---|
| `shelf_inside_analysis.csv` | 货架内字段和页面样例 | 真实痛点、真实差评率、真实 SPU 问题 |
| `shelf_outside_brand_mention.csv` | 外部声量字段和展示形态 | 市场规模、需求强度、上新判断 |
| `competitor_opportunity.csv` | 竞品评分差异字段样例 | 竞品优势、市场份额、转化优势 |
| `voc_trend.csv` | 趋势字段样例 | 真实声量趋势、渠道动作 |
| `fact_voc_summary_mock.csv` | 内部 VOC 汇总字段样例 | 生产指标口径 |
| `fact_voc_trend_mock.csv` | 趋势表字段样例 | 生产趋势算法 |
| `fact_voc_brand_summary_mock.csv` | 品牌 VOC 字段样例 | 生产品牌对比 |
| `ods_voc_external_mock.csv` | 外部 VOC 明细字段样例 | 真实外部样本 |
| `dim_voc_tag_mock.csv` | 标签维表字段样例 | 正式标签体系 |
| `dim_voc_external_community_mock.csv` | 社区维表字段样例 | 正式平台政策 |

## 11. 正式 SQL 前审查清单

正式 SQL 初稿前必须逐项确认：

- 源表 Owner 已确认。
- 源表访问权限已确认。
- 源表主键和分区已确认。
- 字段类型已确认。
- 样本权限和 PII 策略已确认。
- 标签体系已确认。
- 外部平台政策已确认。
- 情绪和主题算法已校准。
- 品牌别名和评分来源已确认。
- 趋势算法已确认。
- CHANNEL / MKT / ORDER 背景字段只作上下文的规则已确认。
- DQ gate 的执行方式、阈值、失败处理已确认。
- mock 与生产事实隔离已确认。
- BI / Agent 输出边界已确认。

## 12. 待决策事项

| 决策项 | 当前建议 | 影响 |
|---|---|---|
| 是否先单独创建 `VOC-DQ-001` | 建议下一步创建 | 可以在写 SQL 前统一 DQ gate、阈值和失败处理 |
| 是否允许 `VOC-SQL-001` 后续包含伪 SQL | 暂不允许 | 防止被复制成生产 SQL |
| P0 源表确认顺序 | 先内部 VOC，再外部 VOC，再品牌，再趋势 | 与四张宽表构建顺序一致 |
| 外部源第一版范围 | 先 Reddit + BabyCenter + Mumsnet | 降低平台政策和采样复杂度 |
| 趋势算法 | 暂不选算法 | 等 DATA / 业务 Owner 确认 |
| 正式 SQL 目录准入 | 只在 Green 后讨论 | 保持 `sql/` 不被草稿污染 |

## 13. 下一步

下一步建议创建 `VOC-DQ-001` 样本质量与宽表准入门槛草稿。

建议文件：

- `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md`

该文件应统一四个 DQ 族的阈值、执行方式、失败处理、Owner 签收和 Green 升级条件。仍不进入 `sql/`，不写生产 SQL。
