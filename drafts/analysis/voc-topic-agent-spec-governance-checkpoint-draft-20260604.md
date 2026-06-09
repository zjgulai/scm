---
title: 专题① VOC Agent 规格治理检查点草稿
doc_type: analysis
module: project-governance
topic: voc-topic-agent-spec-governance-checkpoint
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Agent 规格治理检查点草稿

## 1. 检查点结论

专题① `VOC-AGENT-001` 到 `VOC-AGENT-004` 的任务规格草稿已经形成完整链路，覆盖货架内服务质量、货架外高潜需求、竞品口碑与本土化、全域声量趋势四个子课题。

当前结论：

- 可以进入 `VOC-SQL-001` 前置规格草稿。
- 不可以进入正式 SQL。
- 不可以在 `sql/` 创建 `dwt_voc_*` 生产 SQL。
- 不可以创建 Agent 运行脚本、调度脚本或自动执行工具。
- 不可以把 mock、草稿、行业参考或外部样本写成生产事实。

反面论证：四个 Agent 规格已经明确字段、触发条件、DQ gates 和输出护栏，表面上似乎可以开始写 SQL。但该路径不可取，因为四个分支仍有源表确认、样本权限、标签口径、算法、Owner handoff 和 DQ blocked 项。当前只能写 SQL 前置规格，用于固定构建顺序、依赖表、审查清单和禁止动作。

## 2. 当前资产清单

| 层级 | 资产 | 路径 | 状态 |
|---|---|---|---|
| 蓝图 | VOC 产品化蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | draft / Amber |
| 指标 | VOC 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | draft / Amber |
| 页面 | 服务质量页面 PRD | `drafts/docs/voc-bi-service-quality-overview-prd-draft-20260603.md` | draft / blocked |
| 页面 | 外部需求页面 PRD | `drafts/docs/voc-bi-external-demand-radar-prd-draft-20260603.md` | draft / blocked |
| 页面 | 竞品本土化页面 PRD | `drafts/docs/voc-bi-competitor-localization-prd-draft-20260603.md` | draft / blocked |
| 页面 | 趋势雷达页面 PRD | `drafts/docs/voc-bi-trend-radar-prd-draft-20260603.md` | draft / blocked |
| 宽表 | 货架内宽表规格 | `drafts/analysis/voc-topic-shelf-inside-wide-table-spec-draft-20260603.md` | draft / blocked |
| 宽表 | 外部需求宽表规格 | `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md` | draft / blocked |
| 宽表 | 竞品本土化宽表规格 | `drafts/analysis/voc-topic-competitor-localization-wide-table-spec-draft-20260603.md` | draft / blocked |
| 宽表 | 趋势雷达宽表规格 | `drafts/analysis/voc-topic-trend-wide-table-spec-draft-20260603.md` | draft / blocked |
| Agent | 服务质量 Agent 规格 | `drafts/docs/voc-agent-service-quality-task-spec-draft-20260603.md` | draft / blocked |
| Agent | 外部需求 Agent 规格 | `drafts/docs/voc-agent-external-demand-task-spec-draft-20260603.md` | draft / blocked |
| Agent | 竞品本土化 Agent 规格 | `drafts/docs/voc-agent-competitor-localization-task-spec-draft-20260603.md` | draft / blocked |
| Agent | 趋势雷达 Agent 规格 | `drafts/docs/voc-agent-trend-radar-task-spec-draft-20260603.md` | draft / blocked |

## 3. 四个 Agent 检查结果

| Agent | 子课题 | 页面 | 宽表 | DQ 族 | 当前状态 | 可进入 `VOC-SQL-001` 的内容 | 禁止进入 SQL 的内容 |
|---|---|---|---|---|---|---|---|
| `VOC-AGENT-001` | `VOC-T1` 货架内服务质量 | `VOC-BI-001` | `dwt_voc_shelf_inside` / `dwt_voc_service_experience` | `VOC-DQ-SHELF-*` | blocked | 表依赖、字段缺口、DQ 清单、样本权限要求 | 痛点根因、Owner 归责、SKU 改版、渠道动作、营销 ROI |
| `VOC-AGENT-002` | `VOC-T2` 货架外高潜需求 | `VOC-BI-002` | `dwt_voc_external_demand` | `VOC-DQ-EXT-*` | blocked | 外部源表、采样规则、语言/标签/情绪/PII/去重 gates | 市场规模、确定上新、投放预算、营销 ROI、广告归因 |
| `VOC-AGENT-003` | `VOC-T3` 竞品口碑与本土化 | `VOC-BI-003` | `dwt_voc_competitor_localization` | `VOC-DQ-COMP-*` | blocked | 竞品别名、评分来源、本土化标签、样本隐私 gates | 竞品排名、市场份额、转化优势、可投放广告文案 |
| `VOC-AGENT-004` | `VOC-T4` 声量趋势与渠道输入 | `VOC-BI-004` | `dwt_voc_trend_radar` | `VOC-DQ-TREND-*` | blocked | 趋势算法、来源枚举、时间窗口、标签趋势、handoff gates | 渠道加码、预算调整、投放形式、活动动作、库存动作 |

## 4. 共享阻塞项

四个 Agent 共同阻塞项如下：

| 阻塞项 | 影响范围 | 对 `VOC-SQL-001` 的处理方式 |
|---|---|---|
| 真实源表未确认 | `fact_voc_summary`、`fact_voc_trend`、`fact_voc_brand_summary`、`ods_voc_external` 等 | 只能列依赖顺序和字段验收，不写正式 SQL |
| 样本权限未确认 | 原文、评论、帖子、工单、样本摘录 | 先写哈希、脱敏、抽屉权限要求 |
| 标签体系未稳定 | `dim_voc_tag`、`tag_l2`、`tag_l3`、`topic_tag`、`tag_localized` | 先写标签映射前置条件 |
| 外部平台政策未确认 | Reddit、BabyCenter、Mumsnet、社媒和社区 | 先写 `source_policy_status` gate |
| 情绪和主题算法未校准 | `sentiment_polarity`、`positive_rate`、`tag_trend` | 保持 blocked，不写指标结论 |
| 竞品别名和评分来源未稳定 | `dim_brand`、`brand_alias_raw`、`mc_rating`、`comp_rating` | 只写别名和评分来源审查要求 |
| 趋势算法未确认 | `voc_trend_12m`、`trend_slope`、`trend_direction` | 只写算法选型和审查清单 |
| 跨专题背景未签收 | ORDER、CHANNEL、MKT、PRODUCT、SERVICE、DATA | 只写 handoff 条件，不写业务动作 |
| Mock 被误用风险 | Phase3 CSV 和 mock 表 | 在 SQL 前置规格中显式标注 Grey 来源不可入生产 |

## 5. SQL 前置规格准入判断

`VOC-SQL-001` 当前允许创建为草稿规格，但只能放在 `drafts/analysis/`。

允许范围：

- 固定四张目标宽表的构建顺序。
- 固定上游 fact / dim / ods 候选表依赖。
- 固定每张宽表的 P0 / P1 / P2 输入源分层。
- 固定 DQ gate 清单。
- 固定字段进入 SQL 前的验收条件。
- 固定 mock 与生产事实的隔离规则。
- 固定 SQL 审查清单。
- 固定“不创建正式 SQL”的门禁。

禁止范围：

- 不创建 `sql/dwt_voc_shelf_inside.sql`。
- 不创建 `sql/dwt_voc_external_demand.sql`。
- 不创建 `sql/dwt_voc_competitor_localization.sql`。
- 不创建 `sql/dwt_voc_trend_radar.sql`。
- 不写可执行 DDL / DML。
- 不写调度脚本。
- 不连接数据库。
- 不声明源表已经生产可用。
- 不把 Grey / Amber 证据升级为 Green。

## 6. 建议的 `VOC-SQL-001` 构建顺序

| 顺序 | 规格段 | 目标 | 必须保持的护栏 |
|---|---|---|---|
| 1 | 源表依赖矩阵 | 汇总 `fact_voc_summary`、`fact_voc_trend`、`fact_voc_brand_summary`、`fact_voc_external_daily`、`ods_voc_external`、`dim_voc_tag`、`dim_brand`、`dim_channel` | 不声明生产可用 |
| 2 | DQ gate 总表 | 汇总 `VOC-DQ-SHELF-*`、`VOC-DQ-EXT-*`、`VOC-DQ-COMP-*`、`VOC-DQ-TREND-*` | DQ 未过不进入 SQL |
| 3 | 宽表构建顺序 | 先内部 VOC，再外部需求，再竞品本土化，再趋势雷达 | 不写 SQL 文件 |
| 4 | Mock 隔离规则 | 固定 Phase3 CSV 和 mock 表只能做字段样例 | 不让 mock 成为事实来源 |
| 5 | Handoff 与 Owner 条件 | 固定跨专题移交规则 | 不输出业务动作 |
| 6 | SQL 审查清单 | 固定正式 SQL 前的字段、粒度、主键、权限、DQ 审查 | 不创建 `sql/` 资产 |

## 7. 待用户决策项

| 决策项 | 当前建议 | 影响 |
|---|---|---|
| 是否创建 `VOC-SQL-001` 前置规格草稿 | 可以创建，继续放 `drafts/analysis/` | 不触碰正式 SQL |
| `VOC-SQL-001` 是否覆盖四张宽表 | 是，统一覆盖四张宽表的依赖和 gate | 避免分支 SQL 各自漂移 |
| 是否允许写伪 SQL | 暂不允许 | 防止被误复制到生产 |
| 是否优先确认 P0 源表 | 是，先确认真实源表、字段、主键和权限 | 决定能否从 blocked 进入 Amber / Green |
| 是否单独创建 `VOC-DQ-001` | 建议先创建 DQ 总规格，再写 SQL 前置规格 | 但如果继续推进速度优先，可在 `VOC-SQL-001` 中先内嵌 DQ gates |

## 8. 下一步

下一步建议创建 `VOC-SQL-001` 前置规格草稿。

建议文件：

- `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md`

该文件只写 SQL 构建顺序、上游依赖、DQ gate、字段验收和禁止动作，不进入 `sql/`，不写生产 SQL。
