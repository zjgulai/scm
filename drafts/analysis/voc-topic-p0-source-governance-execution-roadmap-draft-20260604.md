---
title: 专题① VOC P0 来源治理执行路线图草稿
doc_type: analysis
module: project-governance
topic: voc-topic-p0-source-governance-execution-roadmap
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC P0 来源治理执行路线图草稿

## 1. 路线图定位

本文执行 `VOC-ROADMAP-001`，用于把 `VOC-GAP-001` 的 Batch 1 / Batch 2 / Batch 3 缺口优先级，转成 Owner 会议顺序、证据回填顺序、状态检查点和继续条件。

本文不是项目排期承诺，不是 Owner 已签收结果，不是权限审批结果，不是数据质量结论，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不声明任何 P0 来源已生产可用。

当前结论：

- 12 个 P0 来源继续保持 `blocked`。
- 所有 `owner_status` 继续保持 `unsigned`。
- 所有 `access_status` 继续保持 `unknown` 或待申请任务状态。
- 所有 `dq_readiness_status` 继续保持 `blocked`。
- 所有 `sql_allowed` 继续保持 `no`。
- 路线图只决定治理推进顺序，不决定来源质量、来源可用性或业务动作。

反面论证：路线图一旦写成阶段和会议，很容易被误读为“进入执行后自然会产出 SQL”。这不成立。本文的执行对象是证据治理，不是数据开发。没有真实 Owner、`signoff_id`、权限审批、样本包、PII / 平台政策审查、主键粒度和字段口径记录时，任何来源都不能升级为 `signed`、`ready` 或 `sql_allowed = yes`。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| P0 来源缺口与回填优先级 | `drafts/analysis/voc-topic-p0-source-gap-priority-draft-20260604.md` | 固定 Batch 1 / Batch 2 / Batch 3、排序维度和执行优先级 | Amber |
| Owner 访谈与证据回填清单 | `drafts/analysis/voc-topic-owner-interview-evidence-intake-checklist-draft-20260604.md` | 固定 Owner 访谈任务、权限任务、样本包任务和回填字段 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 12 个 P0 来源、台账字段和初始 blocked 状态 | Amber |
| 真实源系统确认包 | `drafts/analysis/voc-topic-real-source-system-confirmation-pack-draft-20260604.md` | 固定访谈、权限、样本、政策和签收模板 | Amber |
| 源表 Owner 与权限矩阵 | `drafts/analysis/voc-topic-source-owner-permission-matrix-draft-20260604.md` | 固定 Owner、权限、样本政策和 `sql_allowed = no` | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness、Green 升级和输出锁 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定 P0 未过不得进入 SQL | Amber |

## 3. 执行原则

| 原则 | 执行含义 | 禁止误读 |
|---|---|---|
| 先证据，后状态 | 先拿 evidence item，再回填台账状态 | 不能用会议纪要直接替代签收 |
| 先高阻断，后低阻断 | Batch 1 优先处理跨宽表、高合规、高 DQ 阻断来源 | Batch 1 不等于 Green 候选 |
| 先 Owner，后 DQ | Owner、权限、样本、政策和字段口径未齐前不评估 DQ readiness | 不能先写 DQ SQL 倒逼签收 |
| 先边界，后业务解释 | 先确认样本可用范围和禁用范围 | 不能把 VOC 样本写成市场规模、预算或产品动作 |
| 先台账，后开发 | `VOC-SIGNOFF-001` 有可引用证据后才讨论开发准入 | 本文不能授权 SQL |

## 4. 阶段总览

| phase_id | 阶段 | 目标 | 入口条件 | 输出物 | 出口条件 | 禁止状态 |
|---|---|---|---|---|---|---|
| `VOC-ROADMAP-P0-00` | 路线图冻结 | 固定 Batch、Owner 和检查点 | `VOC-GAP-001` 已成稿 | 本文 | 路线图可被逐项执行 | 不得改 `sql_allowed` |
| `VOC-ROADMAP-P0-01` | Batch 1 启动 | 处理外部政策、标签、内部分母、主明细、评论源阻断 | 12 个来源已在台账中列出 | 会议任务和证据任务 | 每个 Batch 1 来源形成 evidence item 占位 | 不得声明 signed |
| `VOC-ROADMAP-P0-02` | Batch 1 回填 | 把 Owner、权限、样本、政策、主键、字段、刷新证据回填台账 | evidence item 已创建 | 台账字段更新候选 | 每个来源至少能说明缺口仍在何处 | 不得声明 ready |
| `VOC-ROADMAP-P0-03` | Batch 2 启动 | 在 Batch 1 证据边界下推进外部聚合、社区、趋势、品牌 | `ods_voc_external` 和 `dim_voc_tag` 边界已明确候选 | Batch 2 访谈任务 | Batch 2 来源形成 evidence item 占位 | 不得输出业务动作 |
| `VOC-ROADMAP-P0-04` | Batch 3 启动 | 推进 dws / ads 内部聚合与 BI 展示口径 | 内部主明细和 BI 分母候选已明确 | BI / DATA 口径任务 | dws / ads 与 fact 关系可审查 | 不得覆盖存量 BI 事实 |
| `VOC-ROADMAP-P0-05` | DQ readiness 复核 | 判断哪些来源允许进入 DQ gate 设计讨论 | source / access / sample / pii / policy / pk-grain / field / freshness 均有证据 | readiness 复核记录 | 仍需独立 SQL 准入审批 | 不得创建 DQ 脚本 |

## 5. Batch 1 会议顺序

Batch 1 的会议可以并行约期，但证据回填必须按以下顺序进入台账。

| sequence | meeting_id | 主 Owner | 参与 Owner | 关联来源 | 核心议题 | 必须产出 | 不允许产出 |
|---|---|---|---|---|---|---|---|
| 1 | `VOC-MEETING-B1-EXT-POLICY-001` | COMPLIANCE | DATA / VOC | `ods_voc_external` | Reddit + BabyCenter + Mumsnet 平台政策、URL、用户标识、文本保存、去重 | `policy_review_id` 候选、样本限制、禁用范围 | 外部全文抓取方案、市场规模结论 |
| 2 | `VOC-MEETING-B1-TAG-001` | VOC | PRODUCT / DATA | `dim_voc_tag` | 标签 Owner、`tag_l2` / `tag_l3` / `tag_localized`、人审样本、冲突规则 | 标签字典候选、冲突率口径、不可映射处理 | 产品改版动作 |
| 3 | `VOC-MEETING-B1-INTERNAL-METRIC-001` | DATA | BI / VOC | `fact_voc_summary` | `sales_qty`、`voc_rate`、评分、评论分母、渠道×国家×SPU×月粒度 | 分母口径候选、字段清单、BI 关系说明 | 覆盖 dws / ads 的结论 |
| 4 | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | DATA | VOC / SERVICE / COMPLIANCE | `dwd_voc_record_detail_full` | 内部 VOC 主明细候选、原文权限、主键、日期口径、服务体验边界 | 主键候选、权限范围、脱敏规则 | 责任归因或完整原文导出 |
| 5 | `VOC-MEETING-B1-REVIEW-001` | DATA | VOC / SERVICE / COMPLIANCE | `ods_review_detail` | review_id、评分范围、评论日期、摘录权限、样本 hash | review 主键候选、评分规则、脱敏摘录条件 | URL 批量列表、真实用户标识 |

## 6. Batch 2 会议顺序

Batch 2 依赖 Batch 1 的政策、标签和内部分母候选，不独立启动业务结论。

| sequence | meeting_id | 主 Owner | 参与 Owner | 关联来源 | 前置依赖 | 必须产出 | 不允许产出 |
|---|---|---|---|---|---|---|---|
| 6 | `VOC-MEETING-B2-EXT-DAILY-001` | DATA | VOC / COMPLIANCE | `fact_voc_external_daily` | `ods_voc_external` 平台政策、去重、主题标签候选 | 平台×国家×主题×日主键、30 天聚合样本规则 | 需求强度结论 |
| 7 | `VOC-MEETING-B2-COMMUNITY-001` | VOC | DATA / COMPLIANCE | `dim_voc_external_community` | 外部平台范围和目录保存边界 | community 主键、国家、语言、人群阶段映射 | 内容抓取授权推断 |
| 8 | `VOC-MEETING-B2-TREND-001` | DATA | BI / VOC | `fact_voc_trend` | `fact_voc_summary`、`fact_voc_external_daily`、`dim_voc_tag` 候选 | 趋势算法、来源类型、12 个月窗口、0 分母规则 | 趋势业务动作 |
| 9 | `VOC-MEETING-B2-BRAND-SUMMARY-001` | BRAND | DATA / VOC / COMPLIANCE | `fact_voc_brand_summary` | `dim_brand` 候选、外部样本政策、评分来源 | 品牌×国家×渠道×月主键、样本 hash、评分来源 | 竞品排名、投放建议 |
| 10 | `VOC-MEETING-B2-BRAND-DIM-001` | BRAND | VOC / DATA | `dim_brand` | 竞品范围初稿 | alias、本地语言名、自有 / 竞品标识 | 市场份额或转化优势 |

## 7. Batch 3 会议顺序

Batch 3 处理内部聚合和展示口径，必须等内部主明细、标签和 BI 分母候选形成后再推进。

| sequence | meeting_id | 主 Owner | 参与 Owner | 关联来源 | 前置依赖 | 必须产出 | 不允许产出 |
|---|---|---|---|---|---|---|---|
| 11 | `VOC-MEETING-B3-DWS-001` | DATA | BI / VOC | `dws_voc_record_analysis_day_full` | `dwd_voc_record_detail_full`、`dim_voc_tag`、BI 日聚合口径候选 | 日聚合唯一粒度、来源枚举、标签缺失率规则 | 替代 fact 的结论 |
| 12 | `VOC-MEETING-B3-ADS-001` | BI | DATA / VOC | `ads_voc_record_stat_full` | `dws_voc_record_analysis_day_full`、`fact_voc_summary`、BI 展示口径候选 | 展示周期、指标分母、页面使用范围 | 看板上线承诺 |

## 8. 证据回填顺序

每个来源必须按相同证据链回填。顺序可以并行收集，但状态升级只能按依赖推进。

| order | evidence_type | 回填目标字段 | 最低可接受证据 | 可以更新为 | 仍然不能更新为 |
|---|---|---|---|---|---|
| 1 | source | `source_owner_name` / `source_status` | Owner 名称、真实源系统、真实表名或明确不存在说明 | `source_status = candidate` | `signed` |
| 2 | access | `access_status` / `permission_scope` | 权限申请 ID 或 Owner 批准记录 | `requested` / `approved` | `sql_allowed = yes` |
| 3 | sample | `sample_package_id` / `sample_policy_status` | 样本包 ID、样本量、采样方法、hash 或聚合样本说明 | `draft` / `signed` | DQ 已执行 |
| 4 | pii | `policy_review_id` / `pii_policy_status` | COMPLIANCE 或对应 Owner 审查记录 | `signed` / `blocked` | 外部全文可展示 |
| 5 | policy | `source_policy_status` | 平台政策审查记录或不适用说明 | `allowed` / `limited` / `blocked` | 自动采集授权 |
| 6 | pk-grain | `pk_grain_status` | 主键、粒度、重复规则、join 放大风险说明 | `candidate` / `signed` | 宽表可生产 |
| 7 | field | `field_type_status` | 字段清单、类型、枚举、空值、历史变更说明 | `candidate` / `signed` | 指标可发布 |
| 8 | freshness | `freshness_status` | 刷新频率、分区、回溯范围、时区说明 | `candidate` / `signed` | 数据新鲜度已达标 |
| 9 | dq | `dq_readiness_status` | 以上范围均有证据且无阻断 | `ready` 候选 | DQ SQL 已写 |
| 10 | sql | `sql_allowed` | 独立 SQL 准入审批，不由本文授权 | 无 | `yes` |

## 9. 状态检查点

| checkpoint_id | 检查点 | 检查内容 | 通过条件 | 失败处理 |
|---|---|---|---|---|
| `VOC-CP-00-ROADMAP` | 路线图检查 | 本文是否只承接上游，不新增来源 | 12 个 P0 来源与 `VOC-SIGNOFF-001` 一致 | 回退到缺口排序修正 |
| `VOC-CP-01-OWNER` | Owner 识别 | 每个来源是否有真实 Owner 或明确待找 Owner | `source_owner_name` 有真实名称或 Owner 缺口记录 | 保持 `owner_status = unsigned` |
| `VOC-CP-02-ACCESS` | 权限检查 | 权限范围是否明确且不越界 | 有 access evidence item，且 forbidden_scope 未被申请 | 保持 `access_status = unknown / requested` |
| `VOC-CP-03-SAMPLE` | 样本检查 | 样本是否满足脱敏、hash、聚合或摘录边界 | 有 `sample_package_id`，无完整原文、URL 批量列表、用户标识 | 保持 `sample_policy_status = unknown / draft` |
| `VOC-CP-04-POLICY` | PII / 平台政策检查 | 内部原文、外部平台、URL、用户标识是否被审查 | 有 `policy_review_id` 或明确 not-applicable | 保持 `pii_policy_status = unknown / blocked` |
| `VOC-CP-05-PK-FIELD` | 主键字段检查 | 主键、粒度、字段、枚举、刷新是否可审查 | `pk_grain_status`、`field_type_status`、`freshness_status` 至少为 candidate | 保持 DQ blocked |
| `VOC-CP-06-DQ-READINESS` | DQ readiness 检查 | P0 scope 是否允许进入 DQ gate 设计讨论 | source / access / sample / pii / policy / pk-grain / field / freshness 均非 unknown，且无 blocked | 不创建 DQ 执行脚本 |
| `VOC-CP-07-SQL-GATE` | SQL 准入检查 | 是否有独立 SQL 准入审批 | 本文不提供通过条件 | 保持 `sql_allowed = no` |

## 10. 来源到检查点映射

| source_asset | 批次 | 必经检查点 | 首要阻断 | 下一步动作 |
|---|---|---|---|---|
| `ods_voc_external` | Batch 1 | `VOC-CP-01` / `VOC-CP-02` / `VOC-CP-03` / `VOC-CP-04` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 平台政策、PII、主键、去重 | 启动 `VOC-MEETING-B1-EXT-POLICY-001` |
| `dim_voc_tag` | Batch 1 | `VOC-CP-01` / `VOC-CP-03` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 标签 Owner、人审样本、冲突规则 | 启动 `VOC-MEETING-B1-TAG-001` |
| `fact_voc_summary` | Batch 1 | `VOC-CP-01` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 分母口径、评分来源、BI 关系 | 启动 `VOC-MEETING-B1-INTERNAL-METRIC-001` |
| `dwd_voc_record_detail_full` | Batch 1 | `VOC-CP-01` / `VOC-CP-02` / `VOC-CP-03` / `VOC-CP-04` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 内部原文、主键、服务边界 | 启动 `VOC-MEETING-B1-INTERNAL-DETAIL-001` |
| `ods_review_detail` | Batch 1 | `VOC-CP-01` / `VOC-CP-02` / `VOC-CP-03` / `VOC-CP-04` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 评论原文、URL、评分范围 | 启动 `VOC-MEETING-B1-REVIEW-001` |
| `fact_voc_external_daily` | Batch 2 | `VOC-CP-01` / `VOC-CP-03` / `VOC-CP-04` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 外部聚合主键和刷新 | 等外部政策候选后启动 `VOC-MEETING-B2-EXT-DAILY-001` |
| `dim_voc_external_community` | Batch 2 | `VOC-CP-01` / `VOC-CP-04` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 社区目录、国家、语言、人群阶段 | 启动 `VOC-MEETING-B2-COMMUNITY-001` |
| `fact_voc_trend` | Batch 2 | `VOC-CP-01` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 趋势算法、来源类型、0 分母 | 等内外部聚合候选后启动 `VOC-MEETING-B2-TREND-001` |
| `fact_voc_brand_summary` | Batch 2 | `VOC-CP-01` / `VOC-CP-03` / `VOC-CP-04` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 品牌粒度、评分来源、样本 hash | 启动 `VOC-MEETING-B2-BRAND-SUMMARY-001` |
| `dim_brand` | Batch 2 | `VOC-CP-01` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | alias、本地语言名、竞品标识 | 启动 `VOC-MEETING-B2-BRAND-DIM-001` |
| `dws_voc_record_analysis_day_full` | Batch 3 | `VOC-CP-01` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 日聚合粒度、来源枚举、标签缺失率 | 等内部主明细和标签候选后启动 `VOC-MEETING-B3-DWS-001` |
| `ads_voc_record_stat_full` | Batch 3 | `VOC-CP-01` / `VOC-CP-05` / `VOC-CP-06` / `VOC-CP-07` | 看板口径、周期口径、分母来源 | 等 dws / fact 关系候选后启动 `VOC-MEETING-B3-ADS-001` |

## 11. 继续条件

| from_stage | to_stage | 必须满足 | 明确不需要 |
|---|---|---|---|
| 路线图冻结 | Batch 1 启动 | 本文通过结构检查，且 12 个 P0 来源无新增或遗漏 | 不需要 SQL |
| Batch 1 启动 | Batch 1 回填 | 每个 Batch 1 来源有会议任务和 evidence item 占位 | 不需要 Owner signed |
| Batch 1 回填 | Batch 2 启动 | `ods_voc_external`、`dim_voc_tag`、`fact_voc_summary` 至少形成候选边界 | 不需要 DQ ready |
| Batch 2 启动 | Batch 3 启动 | 内外部聚合、社区、趋势、品牌的依赖关系可审查 | 不需要业务动作 |
| Batch 3 启动 | DQ readiness 复核 | 每个进入复核的来源有 source / access / sample / pii / policy / pk-grain / field / freshness 证据 | 不需要 DQ SQL |
| DQ readiness 复核 | SQL 准入讨论 | 另行创建 SQL 准入审批材料 | 本文不能替代审批 |

## 12. 输出边界

允许输出：

- Owner 会议清单。
- evidence item 占位。
- 状态检查点。
- 缺口记录。
- 台账回填建议。
- DQ readiness 复核候选。
- SQL 准入前置问题清单。

禁止输出：

- 生产 SQL。
- 伪 SQL。
- DQ 执行脚本。
- 源表抽取脚本。
- 数据库连接参数。
- 外部平台全文抓取方案。
- 市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作。
- 竞品排名、转化优势、责任归因。
- 未脱敏评论、完整原文、URL 批量列表、真实用户标识。

## 13. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不声明任何 P0 来源已签收。
- 不声明任何 P0 来源已生产可用。
- 不把路线图当作排期承诺。
- 不把会议任务当作 Owner 已确认。
- 不把 evidence item 占位当作证据已回填。
- 不把 `requested`、`draft`、`candidate`、`unsigned` 升级为 `signed`。
- 不把 `waived` 当作 `signed`。
- 不把 Batch 1 当作 Green 候选。
- 不把 `dq_readiness_status = ready` 当作 DQ 已执行。
- 不把 `VOC-CP-07-SQL-GATE` 写成已通过。

## 14. 下一步

下一步建议创建 `VOC-MEETING-001` Batch 1 Owner 会议包草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-owner-meeting-pack-draft-20260604.md`

该文件应把 `VOC-MEETING-B1-EXT-POLICY-001`、`VOC-MEETING-B1-TAG-001`、`VOC-MEETING-B1-INTERNAL-METRIC-001`、`VOC-MEETING-B1-INTERNAL-DETAIL-001`、`VOC-MEETING-B1-REVIEW-001` 拆成会议议程、提问清单、证据接收模板和会后台账回填规则。未完成真实会议与证据回填前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
