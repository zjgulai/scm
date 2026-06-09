---
title: 专题① VOC P0 来源缺口与回填优先级草稿
doc_type: analysis
module: project-governance
topic: voc-topic-p0-source-gap-priority
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC P0 来源缺口与回填优先级草稿

## 1. 规格定位

本文执行 `VOC-GAP-001`，用于按影响面、Owner 数量、合规风险、DQ 阻断强度和四张宽表依赖，对 12 个 P0 来源的缺口和回填优先级进行排序。

本文不是 Owner 已签收结果，不是数据质量结论，不是源系统可用性证明，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不声明任何 P0 来源已生产可用。

当前结论：

- 12 个 P0 来源继续保持 `blocked`。
- 所有 `owner_status` 继续保持 `unsigned`。
- 所有 `sql_allowed` 继续保持 `no`。
- 优先级只决定先找谁补证据，不决定来源是否可用。
- 高优先级不等于高可信度，只表示其阻断影响更大。

反面论证：把缺口排出优先级后，容易被误读成“前几项更接近可用”。这不成立。当前排序只是治理执行顺序；没有 `signoff_id`、权限记录、样本包和政策审查时，任何来源都不能升级为 `signed`、`ready` 或 `Green`。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Owner 访谈与证据回填清单 | `drafts/analysis/voc-topic-owner-interview-evidence-intake-checklist-draft-20260604.md` | 固定 Owner 任务、权限任务、样本包任务和回填顺序 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 12 个 P0 来源、blocked 状态和台账字段 | Amber |
| 真实源系统确认包 | `drafts/analysis/voc-topic-real-source-system-confirmation-pack-draft-20260604.md` | 固定访谈、权限、样本、政策和签收模板 | Amber |
| 源表 Owner 与权限矩阵 | `drafts/analysis/voc-topic-source-owner-permission-matrix-draft-20260604.md` | 固定 P0 / P1 / P2 分层、Owner 和权限缺口 | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ 阻断和 Green 升级门槛 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 P0 未过不得进入 SQL | Amber |

## 3. 排序维度

| 维度 | 评分含义 | 评分规则 |
|---|---|---|
| `wide_table_impact` | 影响多少张目标宽表 | 1 到 5，影响越多分越高 |
| `owner_complexity` | 需要多少 Owner 协同 | 1 到 5，跨 DATA / BI / VOC / 业务 / COMPLIANCE 越多分越高 |
| `compliance_risk` | PII、原文、URL、平台政策风险 | 1 到 5，外部原文和可识别样本风险最高 |
| `dq_block_strength` | 阻断多少 P0 DQ gate | 1 到 5，跨 DQ 族越多分越高 |
| `execution_leverage` | 回填后能解锁多少后续治理动作 | 1 到 5，能解锁多个 Owner 或多张宽表分越高 |

总分只用于执行排序，不用于来源质量判断。

## 4. 优先级总表

| rank | source_asset | 批次 | wide_table_impact | owner_complexity | compliance_risk | dq_block_strength | execution_leverage | 总分 | 当前状态 | 核心缺口 | 推荐下一动作 |
|---|---|---|---:|---:|---:|---:|---:|---:|---|---|---|
| 1 | `ods_voc_external` | Batch 1 | 4 | 5 | 5 | 5 | 5 | 27 | blocked / unsigned | 平台政策、post/comment 主键、PII、文本保留、去重规则未签收 | 先开 COMPLIANCE + DATA + VOC 联合取证 |
| 2 | `dim_voc_tag` | Batch 1 | 5 | 4 | 2 | 5 | 5 | 26 | blocked / unsigned | 标签 Owner、人审样本、冲突处理、`tag_l2` / `tag_l3` / `tag_localized` 映射未签收 | 先开 VOC + PRODUCT + DATA 标签确认 |
| 3 | `fact_voc_summary` | Batch 1 | 4 | 4 | 2 | 5 | 5 | 25 | blocked / unsigned | `sales_qty`、`voc_rate`、评分、评论分母和 dws 并列关系未签收 | 先开 DATA + BI + VOC 分母口径确认 |
| 4 | `dwd_voc_record_detail_full` | Batch 1 | 3 | 5 | 4 | 5 | 4 | 25 | blocked / unsigned | 源系统、原文权限、主键、日期口径未签收 | 先开 DATA + VOC + SERVICE + COMPLIANCE 主明细确认 |
| 5 | `ods_review_detail` | Batch 1 | 3 | 5 | 4 | 4 | 4 | 24 | blocked / unsigned | 评论原文、review_id、评分范围、引用权限未签收 | 先开 review 主键、评分范围和脱敏摘录审批 |
| 6 | `fact_voc_external_daily` | Batch 2 | 3 | 3 | 3 | 4 | 4 | 22 | blocked / unsigned | 平台×国家×主题×日粒度、刷新频率、样本量规则未签收 | 等 `ods_voc_external` 政策与去重规则后推进 |
| 7 | `dim_voc_external_community` | Batch 2 | 2 | 4 | 4 | 4 | 4 | 22 | blocked / unsigned | 社区主键、国家、语言、人群阶段、平台范围未签收 | 与 `ods_voc_external` 平台政策并行推进 |
| 8 | `fact_voc_trend` | Batch 2 | 2 | 4 | 2 | 5 | 4 | 21 | blocked / unsigned | 趋势算法、来源类型、时间窗口、0 分母规则未签收 | 等 `fact_voc_summary` 与外部聚合候选后推进 |
| 9 | `fact_voc_brand_summary` | Batch 2 | 1 | 5 | 4 | 4 | 3 | 21 | blocked / unsigned | 品牌粒度、评分来源、竞品标识、样本 hash 未签收 | 等 `dim_brand` 与 `ods_voc_external` 边界后推进 |
| 10 | `dim_brand` | Batch 2 | 1 | 3 | 2 | 4 | 3 | 18 | blocked / unsigned | 品牌别名、本地语言名、自有 / 竞品标识未签收 | 先开 BRAND + VOC alias 字典确认 |
| 11 | `dws_voc_record_analysis_day_full` | Batch 3 | 1 | 3 | 1 | 4 | 3 | 16 | blocked / unsigned | 聚合粒度、来源枚举、标签缺失率未签收 | 等内部主明细和 BI 口径关系明确后推进 |
| 12 | `ads_voc_record_stat_full` | Batch 3 | 1 | 3 | 1 | 3 | 3 | 15 | blocked / unsigned | 看板口径、周期口径、分母来源、指标定义未签收 | 等 dws / fact 关系和 BI 展示口径明确后推进 |

排序说明：`dim_voc_external_community` 总分较高，但仍留在 Batch 2，而不是 Batch 1，是因为其主要依赖 `ods_voc_external` 的平台政策和外部样本边界。先处理 `ods_voc_external` 能减少重复政策审查。

## 5. Batch 1：先做的阻断源

Batch 1 处理全局阻断和高合规风险，不处理会导致后续所有宽表取证反复返工。

| source_asset | 为什么必须先做 | 直接阻断 |
|---|---|---|
| `ods_voc_external` | 外部 VOC 是 T2 / T3 / T4 的共同基础，且涉及平台政策、PII、URL 和原文保存 | `VOC-DQ-EXT-*`、`VOC-DQ-COMP-*`、`VOC-DQ-TREND-*` |
| `dim_voc_tag` | 标签体系横跨四张目标宽表，是内部、外部、竞品和趋势的共同解释层 | `VOC-DQ-SHELF-TAG-001`、`VOC-DQ-EXT-TAG-001`、`VOC-DQ-COMP-TAG-001`、`VOC-DQ-TREND-TAG-001` |
| `fact_voc_summary` | 内部 VOC 汇总和趋势背景共同依赖它，分母口径不清会污染 VOC 率和趋势 | `VOC-DQ-SHELF-SALES-001`、`VOC-DQ-SHELF-RATING-001`、`VOC-DQ-TREND-SCHEMA-001` |
| `dwd_voc_record_detail_full` | 内部 VOC 主明细候选，决定 T1 是否能做样本证据和来源分层 | `VOC-DQ-SHELF-SCHEMA-001`、`VOC-DQ-SHELF-PK-001`、`VOC-DQ-SHELF-TEXT-001` |
| `ods_review_detail` | 评论评分、原文权限和 T1 / T3 评分来源依赖它 | `VOC-DQ-SHELF-RATING-001`、`VOC-DQ-SHELF-TEXT-001`、`VOC-DQ-COMP-RATING-001` |

Batch 1 的完成标准不是 `signed`，而是至少形成可审查的 Owner、权限、样本、政策和主键粒度证据包。

## 6. Batch 2：依赖 Batch 1 后并行推进

Batch 2 主要处理外部聚合、趋势、品牌和社区维度。

| source_asset | 依赖前置 | 推荐推进方式 |
|---|---|---|
| `fact_voc_external_daily` | `ods_voc_external` 的平台政策、去重和主题标签规则 | 先拿 30 天聚合样本，不输出需求强度 |
| `dim_voc_external_community` | `ods_voc_external` 的平台范围和政策边界 | 与外部平台政策并行确认目录保存和社区元数据 |
| `fact_voc_trend` | `fact_voc_summary`、`fact_voc_external_daily`、`dim_voc_tag` | 先确认趋势算法和 0 分母规则，不输出趋势业务动作 |
| `fact_voc_brand_summary` | `dim_brand`、`ods_voc_external`、评分来源 | 先确认品牌评分来源和样本 hash，不输出竞品排名 |
| `dim_brand` | BRAND / VOC 对竞品范围和 alias 的共识 | 先建 alias 签收任务，不进入市场份额或转化优势 |

## 7. Batch 3：内部聚合与展示口径

Batch 3 不是不重要，而是其推进依赖内部主明细和 BI 口径关系先明确。

| source_asset | 依赖前置 | 推荐推进方式 |
|---|---|---|
| `dws_voc_record_analysis_day_full` | `dwd_voc_record_detail_full`、`dim_voc_tag`、BI 日聚合口径 | 确认日聚合唯一粒度和标签缺失率 |
| `ads_voc_record_stat_full` | `dws_voc_record_analysis_day_full`、`fact_voc_summary`、BI 展示口径 | 确认展示周期和指标分母，避免和 fact 并行冲突 |

## 8. Owner 负载视图

| owner_role | 第一批需要参与的来源 | 当前风险 |
|---|---|---|
| DATA | 全部 Batch 1 来源 | 若 DATA 不确认真实表名、主键、字段和刷新，所有后续状态都停留 unknown |
| VOC | 全部 Batch 1 来源 | 若 VOC 不确认标签、人审和样本口径，四张宽表无法解释 |
| COMPLIANCE | `ods_voc_external`、`dwd_voc_record_detail_full`、`ods_review_detail` | 若合规不确认，外部样本和原文摘录全部 blocked |
| BI | `fact_voc_summary` | 若 BI 不确认分母和存量口径，T1 / T4 的指标解释会漂移 |
| SERVICE | `dwd_voc_record_detail_full`、`ods_review_detail` | 若 SERVICE 不确认样本用途，服务体验会被误写成责任归因 |
| PRODUCT | `dim_voc_tag` | 若 PRODUCT 不确认标签用途，本土化和产品线解释会越界 |

## 9. 决策点

以下事项需要后续结合真实 Owner 反馈再决策，不在本文中直接定案：

| 决策项 | 默认建议 | 影响 |
|---|---|---|
| `dim_voc_tag` 与 `ods_voc_external` 谁先开会 | 并行 | 一个是全局解释层，一个是最高合规风险源，不能互等 |
| `dwd_voc_record_detail_full` 是否作为内部 VOC 主明细 | 先作为候选主明细取证 | 不能在没有真实表名和权限前定为主表 |
| `fact_voc_summary` 是否替代 dws / ads | 暂不替代 | 先并列确认，避免规划事实表覆盖存量 BI 口径 |
| 外部平台第一批范围 | Reddit + BabyCenter + Mumsnet | 降低政策、样本和语言复杂度 |
| 是否允许任何来源 `waived` | 仅允许局部豁免 | `waived` 不允许替代 `signed` 或开启 SQL |

## 10. 禁止状态迁移

本文创建后仍禁止以下状态迁移：

| 禁止迁移 | 原因 |
|---|---|
| `owner_status: unsigned -> signed` | 缺少真实 `signoff_id`、Owner、日期和证据引用 |
| `access_status: unknown -> approved` | 缺少权限申请或审批记录 |
| `sample_policy_status: unknown -> signed` | 缺少样本包和样本策略签收 |
| `pii_policy_status: unknown -> signed` | 缺少 COMPLIANCE 或对应 Owner 签收 |
| `source_policy_status: unknown -> allowed` | 缺少平台政策审查 |
| `dq_readiness_status: blocked -> ready` | 缺少来源、权限、样本、PII、主键、字段和刷新证据 |
| `sql_allowed: no -> yes` | 本文不是 SQL 准入审批 |

## 11. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不声明任何 P0 来源已签收。
- 不声明任何 P0 来源已生产可用。
- 不把优先级排序当作来源可信度排序。
- 不把 Batch 1 当作 Green 候选。
- 不把 `waived` 当作 `signed`。
- 不把本排序当作 DQ 执行结果。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不把外部样本写成市场规模、预算、渠道动作、投放动作、库存动作或产品改版动作。

## 12. 下一步

下一步建议创建 `VOC-ROADMAP-001` P0 来源治理执行路线图草稿。

建议文件：

- `drafts/analysis/voc-topic-p0-source-governance-execution-roadmap-draft-20260604.md`

该文件应把 Batch 1 / Batch 2 / Batch 3 转成时间顺序、Owner 会议顺序、证据回填顺序和状态检查点。未完成真实回填前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
