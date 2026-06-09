---
title: 专题① VOC DQ Gate 与宽表准入门槛草稿
doc_type: analysis
module: project-governance
topic: voc-topic-dq-gate-spec
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC DQ Gate 与宽表准入门槛草稿

## 1. 规格定位

本文执行 `VOC-DQ-001`，用于统一专题① VOC 四张目标宽表进入 SQL 构建前必须满足的样本质量、字段准入、DQ gate、失败处理、Owner 签收和 `Green` 升级条件。

本文覆盖四个 DQ 族：

- `VOC-DQ-SHELF-*`：货架内服务质量与售后 VOC。
- `VOC-DQ-EXT-*`：货架外高潜需求与外部 VOC。
- `VOC-DQ-COMP-*`：竞品口碑与本土化表现。
- `VOC-DQ-TREND-*`：声量趋势与渠道输入。

当前文件不是 SQL 初稿，不创建 `sql/` 资产，不写生产 SQL，不创建 DQ 执行脚本，不连接数据库，不声明任何 DQ gate 已经执行通过。

反面论证：`VOC-SQL-001` 已经列出四张目标宽表的 DQ ID，看起来可以直接进入 SQL 或 DQ 脚本。但这些 ID 目前只定义准入判断，没有 Owner 签收、样本权限、阈值和执行证据。直接写 SQL 或脚本会把检查清单误用为已通过的质量证明。

## 2. 当前结论

| 判断项 | 当前结论 | 原因 |
|---|---|---|
| 是否可以定义 DQ gate | 可以 | `VOC-SQL-001` 已经明确四个 DQ 族和目标宽表 |
| 是否可以判定 DQ Green | 不可以 | 缺少源表 Owner、样本权限、阈值、执行记录和签收 |
| 是否可以创建正式 SQL | 不可以 | 四张宽表均未通过 `Green` 准入 |
| 是否可以创建 DQ 脚本 | 不可以 | 当前只定义语义和证据门槛，不连接数据库 |
| 是否可以使用 mock 作为生产证据 | 不可以 | mock 只能作为字段形态和页面样例 |

本文的目标是固定 gate 语义和必需证据。阈值只保留 `TBD` 占位，必须由对应 Owner 确认后才允许进入执行设计。

## 3. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定四张宽表、源表依赖、DQ ID 和禁止动作 | Amber |
| Agent 治理检查点 | `drafts/analysis/voc-topic-agent-spec-governance-checkpoint-draft-20260604.md` | 固定 Agent 输出边界和是否允许进入 `VOC-SQL-001` | Amber |
| VOC 产品化蓝图 | `drafts/analysis/voc-topic-productization-blueprint-draft-20260603.md` | 固定四子课题、BI、Agent、DQ 和 SQL 的前后关系 | Amber |
| VOC 指标字典 | `drafts/analysis/voc-topic-metric-dictionary-draft-20260603.md` | 固定指标状态、字段语义和 blocked 项 | Amber |
| 货架内宽表规格 | `drafts/analysis/voc-topic-shelf-inside-wide-table-spec-draft-20260603.md` | 固定 `dwt_voc_shelf_inside` 字段候选和准入缺口 | Amber |
| 外部需求宽表规格 | `drafts/analysis/voc-topic-external-demand-wide-table-spec-draft-20260603.md` | 固定 `dwt_voc_external_demand` 字段候选和准入缺口 | Amber |
| 竞品本土化宽表规格 | `drafts/analysis/voc-topic-competitor-localization-wide-table-spec-draft-20260603.md` | 固定 `dwt_voc_competitor_localization` 字段候选和准入缺口 | Amber |
| 趋势雷达宽表规格 | `drafts/analysis/voc-topic-trend-wide-table-spec-draft-20260603.md` | 固定 `dwt_voc_trend_radar` 字段候选和准入缺口 | Amber |
| 数据需求矩阵 | `main_project_lute/全局数据资源整合/01_专题课题_数据需求矩阵.md` | 固定 `fact_voc_*`、`ods_voc_*`、`dim_voc_*` 规划表 | Amber |
| 数仓主键设计 | `main_project_lute/全局数据资源整合/05_数仓表结构与主键设计.md` | 固定 fact / dim / ods 的粒度、主键和分区建议 | Amber |

## 4. DQ Result 输出契约

任何未来 DQ 执行结果必须先满足以下字段契约。当前文件只定义契约，不生成结果。

| 字段 | 说明 | 当前状态 |
|---|---|---|
| `dq_run_id` | DQ 执行批次 ID | TBD |
| `dq_gate_id` | DQ gate ID，例如 `VOC-DQ-SHELF-PK-001` | required |
| `dq_family` | `SHELF` / `EXT` / `COMP` / `TREND` | required |
| `target_asset` | 被检查宽表、源表或维表 | required |
| `target_grain` | 被检查粒度 | required |
| `target_fields` | 被检查字段列表 | required |
| `check_type` | schema / pk / range / policy / calibration / handoff / claim 等 | required |
| `check_scope` | 样本、全量、分区、时间窗口或人工抽检范围 | TBD |
| `status` | `Grey` / `Amber` / `Green` / `Red` / `blocked` | required |
| `severity` | `P0` / `P1` / `P2` | required |
| `evidence_level` | Grey / Amber / Green 对应证据层级 | required |
| `sample_size` | 样本量；未执行时为空 | TBD |
| `threshold_rule_id` | 阈值规则 ID | TBD |
| `threshold_value` | 阈值值；未确认前为 `TBD` | TBD |
| `threshold_status` | passed / failed / not-run / not-defined | required |
| `failed_record_count` | 失败记录数 | TBD |
| `failed_record_sample_hash` | 失败样本哈希，不保留原文 | TBD |
| `blocking_reason` | 阻断原因 | required when blocked |
| `required_evidence` | 升级所需证据 | required |
| `owner_role` | DATA / BI / VOC / PRODUCT / BRAND / SERVICE / CHANNEL / MKT / ORDER / COMPLIANCE | required |
| `owner_status` | unsigned / signed / waived / rejected | required |
| `review_case_id` | 人审或治理工单 ID | TBD |
| `handoff_target` | 允许交接的专题或 Owner | optional |
| `output_lock` | 禁止输出类型锁 | required |
| `created_at` | 记录创建时间 | required after execution |
| `updated_at` | 记录更新时间 | required after execution |

## 5. 状态模型

| 状态 | 判定标准 | 允许输出 | 禁止输出 |
|---|---|---|---|
| `Grey` | 只有规划、mock、字段候选、页面样例或行业参考 | 字段候选、缺口清单、审查问题 | 指标结论、SQL、业务动作、Agent 建议 |
| `Amber` | 有样本或草稿宽表，但阈值、Owner、权限或执行证据未全过 | review task、检查清单、handoff 草稿 | 生产 SQL、行动建议、ROI、排名、投放或库存动作 |
| `Green` | 源表、字段类型、PK / 粒度、样本、权限、阈值、Owner 签收均通过 | 允许讨论 SQL 初稿和 BI / Agent 准入 | 不自动允许生产 SQL 或上线 |
| `Red` | DQ 失败、来源政策失败、PII 失败、主键重复、结论越权 | 修复任务、阻断说明 | 所有业务解释和自动建议 |
| `blocked` | gate 无法运行或关键前置条件缺失 | Owner 待办、证据缺口 | SQL、DQ 执行结果声明、Green 升级 |

`Green` 不是上线许可。`Green` 只表示可以进入下一层设计讨论，仍需 SQL 审查、BI 审查和 Agent 输出边界审查。

## 6. 阈值原则

当前不设置生产数值阈值。所有阈值必须由对应 Owner 确认，并写入后续 `threshold_rule_id`。

| 阈值类别 | 示例字段或规则 | Owner | 当前阈值 |
|---|---|---|---|
| 空值率 | 主键、日期、来源、标签、国家、渠道 | DATA / BI | TBD |
| 重复率 | 推荐主键、post / comment ID、品牌粒度 | DATA | TBD |
| 样本量 | 外部 VOC、竞品样本、人工校准样本 | VOC / DATA | TBD |
| 标签缺失 / 冲突 | `tag_l2`、`tag_l3`、`topic_tag`、`tag_localized` | VOC / PRODUCT | TBD |
| 情绪校准 | sentiment、positive / negative / neutral | VOC / DATA | TBD |
| 来源政策 | `source_policy_status`、平台保留策略、URL 策略 | VOC / COMPLIANCE | TBD |
| PII | 用户标识、URL、原文、截图、样本摘录 | COMPLIANCE / DATA | TBD |
| 时间新鲜度 | 采集窗口、评论时间、工单时间、月度分区 | DATA / BI | TBD |
| 0 分母 | 上期为 0、样本缺失、小样本波动 | DATA / BI | TBD |
| 评分范围 | star rating、MC rating、竞品 rating | VOC / BRAND | TBD |
| 品牌别名置信度 | brand alias、本地语言名、缩写 | BRAND / VOC | TBD |
| 算法状态 | 趋势斜率、趋势方向、emerging tag | DATA / VOC | TBD |
| handoff Owner | `handoff_target`、handoff reason | BI / 业务 Owner | TBD |
| 结论政策 | ROI、预算、市场份额、渠道动作、产品动作 | BI / COMPLIANCE | TBD |

## 7. DQ Gate 明细

### 7.1 `SHELF`：货架内服务质量

| DQ ID | check_type | 必需证据 | 失败动作 | Green 条件 |
|---|---|---|---|---|
| `VOC-DQ-SHELF-SCHEMA-001` | schema | 主键、时间、来源、国家、渠道、商品、标签、指标字段清单 | 阻断宽表设计 | 字段存在、类型稳定、Owner 签收 |
| `VOC-DQ-SHELF-PK-001` | pk | 推荐逻辑主键样本唯一性报告 | 阻断 join 和聚合 | 样本内唯一且重复处理规则签收 |
| `VOC-DQ-SHELF-DATE-001` | date | `data_caliber`、`period_grain`、`period_value` 口径说明 | 阻断趋势和周期指标 | 时间粒度不混用 |
| `VOC-DQ-SHELF-SOURCE-001` | source | `voc_type`、`data_source`、`voc_source_group` 映射 | 阻断来源分层 | 来源枚举稳定且可追溯 |
| `VOC-DQ-SHELF-TAG-001` | tag | 标签层级缺失率、冲突率、不可映射率 | 降级为 Amber 或 Red | 标签映射通过人工样本校准 |
| `VOC-DQ-SHELF-SALES-001` | denominator | `sales_qty` 来源、非负校验、周期口径 | 阻断 VOC rate | 分母来源明确且异常处理签收 |
| `VOC-DQ-SHELF-RATING-001` | range | 星级范围、评分来源、评分周期 | 阻断评分结论 | 评分字段范围合法且来源明确 |
| `VOC-DQ-SHELF-REVIEW-001` | ratio | 评论分母、好中差评分子、分母关系 | 阻断评价率指标 | 分子不超过分母，分母非负 |
| `VOC-DQ-SHELF-TEXT-001` | policy | 原文引用权限、脱敏规则、哈希规则 | Red / blocked | 不保留原文或已获权限并脱敏 |
| `VOC-DQ-SHELF-XL3-001` | boundary | 退款输入与售后主题映射说明 | 阻断 XL3 责任归因 | 退款只作为售后线索，不输出责任判断 |

### 7.2 `EXT`：货架外高潜需求

| DQ ID | check_type | 必需证据 | 失败动作 | Green 条件 |
|---|---|---|---|---|
| `VOC-DQ-EXT-SCHEMA-001` | schema | 外部源表、聚合表、社区维表字段清单 | 阻断宽表设计 | 字段存在、类型稳定、Owner 签收 |
| `VOC-DQ-EXT-PK-001` | pk | post / comment 主键、采集批次、去重字段 | 阻断样本聚合 | 主键粒度不重复且批次可追溯 |
| `VOC-DQ-EXT-SAMPLE-001` | sample | 样本来源、采样方法、样本量、覆盖周期 | 保持 Amber | 样本策略由 VOC / DATA 签收 |
| `VOC-DQ-EXT-LANG-001` | language | 语言识别、翻译、跨语言标签规则 | 阻断跨国对比 | 语言和翻译口径稳定 |
| `VOC-DQ-EXT-TAG-001` | tag | 主题标签、需求标签、人审样本 | 降级为 Amber 或 Red | 标签体系经过样本校准 |
| `VOC-DQ-EXT-SENTIMENT-001` | calibration | 情绪分类标注集或人审结果 | 阻断情绪结论 | 情绪模型或规则通过人审 |
| `VOC-DQ-EXT-BRAND-001` | alias | 品牌 alias 字典、别名来源、匹配规则 | 阻断品牌维度 | 品牌映射可追溯 |
| `VOC-DQ-EXT-PII-001` | pii | PII、URL、全文内容保留策略 | Red | PII 处理合规并由 Owner 签收 |
| `VOC-DQ-EXT-DUP-001` | dedupe | 跨平台和同平台去重规则 | 阻断声量和需求强度 | 去重策略可执行且可审计 |
| `VOC-DQ-EXT-FRESHNESS-001` | freshness | 采集周期、刷新频率、窗口边界 | 保持 Amber | 新鲜度规则签收 |

### 7.3 `COMP`：竞品口碑与本土化

| DQ ID | check_type | 必需证据 | 失败动作 | Green 条件 |
|---|---|---|---|---|
| `VOC-DQ-COMP-SCHEMA-001` | schema | `fact_voc_brand_summary`、`dim_brand`、`ods_voc_external` 字段清单 | 阻断宽表设计 | 字段存在、类型稳定、Owner 签收 |
| `VOC-DQ-COMP-GRAIN-001` | grain | 品牌×国家×渠道 / 站点×月份×本土化标签粒度报告 | 阻断聚合 | 粒度不重复且 join 不放大 |
| `VOC-DQ-COMP-ALIAS-001` | alias | 竞品品牌别名、拼写、缩写、本地语言名 | 阻断竞品对比 | alias 来源和置信度签收 |
| `VOC-DQ-COMP-RATING-001` | rating | `star_rating`、`mc_rating`、`comp_rating` 来源与口径 | 阻断评分差异 | 评分来源清楚且范围合法 |
| `VOC-DQ-COMP-TAG-001` | tag | `tag_localized` 标签体系和人工样本 | 保持 Amber | 标签校准通过 |
| `VOC-DQ-COMP-SAMPLE-001` | sample | 外部样本来源、样本量、国家覆盖、采样方法 | 保持 Amber | 样本策略签收 |
| `VOC-DQ-COMP-CHANNEL-001` | channel | `channel_id`、`site`、`platform` 映射 | 阻断渠道切片 | 渠道映射稳定 |
| `VOC-DQ-COMP-PRODUCT-001` | product | 产品线、SPU、型号映射规则 | 阻断产品线对比 | 产品映射由 PRODUCT / BRAND 签收 |
| `VOC-DQ-COMP-PII-001` | pii | 样本摘录、URL、用户标识脱敏证据 | Red | 不暴露原文和用户标识 |
| `VOC-DQ-COMP-CLAIM-001` | claim | 禁止输出清单和话术审查 | Red | 不写转化、ROI、市场份额或可投放文案 |

### 7.4 `TREND`：声量趋势与渠道输入

| DQ ID | check_type | 必需证据 | 失败动作 | Green 条件 |
|---|---|---|---|---|
| `VOC-DQ-TREND-SCHEMA-001` | schema | `fact_voc_trend`、`fact_voc_summary`、`fact_voc_external_daily` 字段清单 | 阻断宽表设计 | 字段存在、类型稳定、Owner 签收 |
| `VOC-DQ-TREND-GRAIN-001` | grain | 月份×国家×渠道×来源类型×品类×标签×品牌范围粒度报告 | 阻断趋势聚合 | 粒度不重复且可追溯 |
| `VOC-DQ-TREND-SOURCE-001` | source | `voc_source_type` 枚举、内外部来源隔离规则 | 阻断来源趋势 | 来源不混写 |
| `VOC-DQ-TREND-TIME-001` | time | 月份、采集窗口、评论时间、工单时间、外部帖子时间规则 | 阻断同比和环比 | 时间窗口一致 |
| `VOC-DQ-TREND-ALG-001` | algorithm | `voc_trend_12m`、`trend_slope`、`trend_direction` 算法说明 | 阻断趋势方向 | 算法由 DATA / VOC 签收 |
| `VOC-DQ-TREND-TAG-001` | tag | `tag_key`、`tag_trend`、`emerging_tag_flag` 标签口径 | 保持 Amber | 标签趋势口径确认 |
| `VOC-DQ-TREND-ZERO-001` | zero-denominator | 上期为 0、小样本、样本缺失处理规则 | 阻断增长率 | 0 分母规则签收 |
| `VOC-DQ-TREND-CROSS-001` | boundary | CHANNEL / MKT 背景字段用途说明 | Red if violated | 只作上下文，不进入 VOC 因果结论 |
| `VOC-DQ-TREND-HANDOFF-001` | handoff | `handoff_target`、handoff reason、允许条件 | 阻断交接 | handoff Owner 确认 |
| `VOC-DQ-TREND-CLAIM-001` | claim | 禁止输出清单和话术审查 | Red | 不写渠道加码、预算、ROI 或管理动作 |

## 8. 跨族硬阻断条件

以下条件任一命中，目标宽表不得升级为 `Green`：

- PII 处理失败，或原文、URL、用户标识未经授权进入输出。
- `source_policy_status` 为 blocked，或平台采集 / 保留策略未确认。
- P0 主键重复且没有 Owner 签收的去重规则。
- P0 源表 Owner 缺失。
- `owner_status` 不是 signed，却试图升级为 `Green`。
- mock、CSV 样例、行业参考被当作生产事实。
- 结论违反 `VOC-DQ-COMP-CLAIM-001` 或 `VOC-DQ-TREND-CLAIM-001`。
- 外部样本来源、样本量、采样方法或时间窗口无法追溯。
- 标签体系、情绪分类或趋势算法未校准，却输出指标解释。

## 9. Owner 职责矩阵

| Owner | 负责范围 | 签收重点 |
|---|---|---|
| DATA | 源表、主键、粒度、字段类型、DQ 执行方式 | 是否可执行、是否可追溯、是否可复核 |
| BI | 指标口径、看板准入、输出状态模型 | 是否能进入 BI 视图或指标字典 |
| VOC | VOC 主题、标签、情绪、人审样本 | 标签和情绪是否可用于分析 |
| PRODUCT | 商品、SPU、产品线、本土化标签 | 产品维度是否可解释 |
| BRAND | 品牌 alias、竞品范围、品牌评分口径 | 竞品对比是否越权 |
| SERVICE | 工单、售后、退款、服务体验口径 | 服务线索是否被误写为责任归因 |
| CHANNEL | 渠道、站点、渠道背景字段 | 渠道字段是否只作背景 |
| MKT | 活动、投放、营销背景字段 | 营销字段是否只作背景 |
| ORDER | 订单、销量、退款、分母背景字段 | ORDER 字段是否只作分母或背景 |
| COMPLIANCE | PII、平台政策、样本保留、外部引用 | 外部数据是否合规 |

`COMPLIANCE` 是可选但高优先级 Owner。只要涉及外部原文、URL、用户标识、平台政策或可识别样本，必须纳入签收。

## 10. 输出锁

在 DQ 未 `Green` 前，以下输出保持锁定：

- 不输出原始评论、原文截图、URL 或用户标识。
- 不输出市场规模、需求强度排名或市场份额。
- 不输出 ROI、ROAS、预算、渠道加码或投放动作。
- 不输出库存动作、补货动作、SKU 改版动作。
- 不输出竞品排名、竞品优劣定论或可投放话术。
- 不输出趋势业务动作，只允许输出趋势待核查项。
- 不输出 SQL、伪 SQL、生产建表语句或调度脚本。
- 不把 review task、handoff、diagnostic suggestion 写成业务结论。

## 11. Green 升级清单

目标宽表从 `Amber` 升级为 `Green` 前，必须逐项完成：

- 所有 P0 DQ gate 为 `Green`。
- P1 gate 未通过时，不影响 P0 指标，且已标注降级范围。
- P0 源表 Owner 已签收。
- 字段类型、主键、粒度和时间窗口已签收。
- 样本来源、样本量、采样方法和权限已签收。
- PII 和平台政策已签收。
- 标签、情绪、品牌 alias、趋势算法已完成校准或明确不启用。
- mock 与生产事实隔离已确认。
- 失败记录已修复，或已由 Owner 以 `waived` 方式记录原因。
- output lock 只对明确允许的输出解除。
- `sql/` 仍保持无草稿污染；正式 SQL 必须在单独审批后再创建。

## 12. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不连接数据库。
- 不声明 DQ 已执行。
- 不把 DQ 草稿当作已执行结果。
- 不把 Grey / Amber 证据升级为 `Green`。
- 不把 mock 数据、CSV 样例或行业参考当作生产样本。
- 不把 VOC 结论写成 CHANNEL / MKT / ORDER / PRODUCT 的执行动作。

## 13. 下一步

下一步建议创建 `VOC-SOURCE-001` 源表 Owner 与权限矩阵草稿。

建议文件：

- `drafts/analysis/voc-topic-source-owner-permission-matrix-draft-20260604.md`

该文件应确认每个 P0 / P1 来源的 Owner、访问权限、样本政策、PII / 平台政策、源表状态和签收责任。未完成该矩阵前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
