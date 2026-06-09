---
title: 专题① VOC Batch 1 Owner 会议包草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-owner-meeting-pack
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Owner 会议包草稿

## 1. 会议包定位

本文执行 `VOC-MEETING-001`，用于把 `VOC-ROADMAP-001` 中的 5 个 Batch 1 Owner 会议拆成会议议程、提问清单、证据接收模板和会后台账回填规则。

本文不是会议纪要，不是 Owner 已签收结果，不是权限审批结果，不是样本包，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 只进入 Owner 会议准备和 evidence item 接收。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 会议完成不自动等于 `owner_status = signed`。
- evidence item 占位不自动等于证据已回填。
- 任何会后状态变化必须回填到 `VOC-SIGNOFF-001`，并保留证据 ID、Owner、日期和范围。
- 本文不能授权 `sql_allowed = yes`。

反面论证：把会议议程和提问清单写细后，容易被误认为“只要开完会就可以开始 DQ 或 SQL”。这不成立。会议包只是把取证工作结构化。只有真实 Owner 提交可引用证据，并通过台账字段回填规则后，才允许讨论下一层 DQ readiness 候选。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| P0 来源治理执行路线图 | `drafts/analysis/voc-topic-p0-source-governance-execution-roadmap-draft-20260604.md` | 固定 5 个 Batch 1 会议、会议顺序和检查点 | Amber |
| P0 来源缺口与回填优先级 | `drafts/analysis/voc-topic-p0-source-gap-priority-draft-20260604.md` | 固定 Batch 1 来源、核心缺口和推荐下一动作 | Amber |
| Owner 访谈与证据回填清单 | `drafts/analysis/voc-topic-owner-interview-evidence-intake-checklist-draft-20260604.md` | 固定 Owner 任务、权限申请、样本包和回填字段 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 ledger_id、source_asset、状态字段和 `sql_allowed = no` | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. Batch 1 会议总表

| sequence | meeting_id | 主 Owner | 参与 Owner | target_source_asset | target_ledger_id | 会议目标 | 会后允许状态 |
|---|---|---|---|---|---|---|---|
| 1 | `VOC-MEETING-B1-EXT-POLICY-001` | COMPLIANCE | DATA / VOC | `ods_voc_external` | `VOC-SIGNOFF-P0-006` | 明确外部平台政策、PII、URL、主键、去重和样本边界 | evidence item 待回填 |
| 2 | `VOC-MEETING-B1-TAG-001` | VOC | PRODUCT / DATA | `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | 明确标签 Owner、层级、本土化标签、人审样本和冲突规则 | evidence item 待回填 |
| 3 | `VOC-MEETING-B1-INTERNAL-METRIC-001` | DATA | BI / VOC | `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | 明确内部分母、评分、评论数、渠道×国家×SPU×月粒度和 BI 关系 | evidence item 待回填 |
| 4 | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | DATA | VOC / SERVICE / COMPLIANCE | `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | 明确内部 VOC 主明细候选、原文权限、主键、日期口径和服务边界 | evidence item 待回填 |
| 5 | `VOC-MEETING-B1-REVIEW-001` | DATA | VOC / SERVICE / COMPLIANCE | `ods_review_detail` | `VOC-SIGNOFF-P0-005` | 明确 review 主键、评分范围、评论日期、摘录权限和样本 hash | evidence item 待回填 |

## 4. 通用会议议程

每个会议固定 6 个议程段。主持人不得把议程扩展成开发排期或 SQL 讨论。

| order | 议程段 | 目标 | 产出 |
|---|---|---|---|
| 1 | 来源定位确认 | 确认本会议只处理一个 `target_source_asset` | source identity 记录 |
| 2 | Owner 与权限确认 | 确认真实 Owner、可访问范围、禁用范围 | owner / access evidence item |
| 3 | 样本与政策确认 | 确认样本包、脱敏、PII、平台政策或不适用理由 | sample / pii / policy evidence item |
| 4 | 主键字段刷新确认 | 确认主键、粒度、字段、枚举、刷新频率 | pk-grain / field / freshness evidence item |
| 5 | DQ readiness 阻断确认 | 只判断还缺哪些证据，不执行 DQ | dq blocking note |
| 6 | 会后台账回填确认 | 确认哪些字段可以保持、候选更新或继续 blocked | ledger update proposal |

## 5. 通用证据接收模板

所有会后材料必须按 evidence item 接收。口头确认、聊天摘要、截图片段不能直接替代 evidence item。

| 字段 | 要求 | 允许值或格式 | 禁止 |
|---|---|---|---|
| `evidence_item_id` | 必填 | `VOC-EVIDENCE-B1-[SOURCE]-[TYPE]-[NNN]` | 空值、仅会议编号 |
| `meeting_id` | 必填 | 5 个 Batch 1 meeting_id 之一 | 跨会议混用 |
| `target_ledger_id` | 必填 | `VOC-SIGNOFF-P0-006` / `012` / `004` / `001` / `005` | 非 Batch 1 ledger |
| `target_source_asset` | 必填 | 5 个 Batch 1 来源之一 | 新增来源 |
| `owner_role` | 必填 | DATA / BI / VOC / SERVICE / PRODUCT / COMPLIANCE | 模糊团队名 |
| `owner_name` | 必填或明确待找 | 真实 Owner 名称 / `TBD_WITH_OWNER_ROUTE` | `self` 代签 |
| `evidence_type` | 必填 | source / access / sample / pii / policy / pk-grain / field / freshness / dq | sql |
| `evidence_scope` | 必填 | 本证据覆盖哪些字段或平台 | 全量兜底 |
| `accepted_content` | 必填 | 可回填内容摘要 | 完整原文、URL 批量列表、真实用户标识 |
| `forbidden_content` | 必填 | 本证据明确禁止使用的内容 | 空值 |
| `status_proposal` | 必填 | keep-blocked / candidate-only / requested-only / draft-only | signed / ready / sql-allowed |
| `ledger_fields_to_update` | 必填 | 台账字段列表 | 直接改 `sql_allowed` |
| `evidence_date` | 必填 | YYYY-MM-DD | 相对日期 |
| `review_required` | 必填 | yes / no | 空值 |

## 6. 通用回填规则

| 回填目标 | 可接受条件 | 允许回填 | 禁止回填 |
|---|---|---|---|
| `source_owner_name` | 有真实 Owner 或明确 Owner 路由 | Owner 名称 / `TBD_WITH_OWNER_ROUTE` | `self`、AI、会议主持人代签 |
| `source_status` | 真实源系统和表名有候选证据 | `candidate` | `signed` |
| `owner_status` | 本阶段没有真实签收文件 | `unsigned` | `signed` |
| `access_status` | 有权限申请任务或 Owner 说明 | `requested` / keep `unknown` | `approved` |
| `permission_scope` | 明确 metadata-only / sample-hash / desensitized-excerpt / aggregate-only | 具体范围 | full-text |
| `sample_policy_status` | 有样本包要求或样本包 ID 候选 | `draft` / keep `unknown` | `signed` |
| `pii_policy_status` | 有 COMPLIANCE 审查记录候选 | keep `unknown` / `blocked` | `signed` |
| `source_policy_status` | 有平台政策审查记录候选 | keep `unknown` / `limited` 候选 | `allowed` |
| `pk_grain_status` | 有主键和粒度候选说明 | `candidate` | `signed` |
| `field_type_status` | 有字段清单和枚举候选 | `candidate` | `signed` |
| `freshness_status` | 有刷新频率候选 | `candidate` | `signed` |
| `dq_readiness_status` | 任一前置仍 unknown 或 blocked | `blocked` | `ready` |
| `sql_allowed` | 本文无授权能力 | `no` | `yes` |

## 7. `VOC-MEETING-B1-EXT-POLICY-001`

### 7.1 会议范围

| 项目 | 内容 |
|---|---|
| target_source_asset | `ods_voc_external` |
| target_ledger_id | `VOC-SIGNOFF-P0-006` |
| 主 Owner | COMPLIANCE |
| 参与 Owner | DATA / VOC |
| 核心阻断 | Reddit + BabyCenter + Mumsnet 平台政策、post/comment 主键、PII、URL、文本保留、去重 |
| 只允许产出 | 平台政策候选、样本边界、去重候选、禁用范围 |

### 7.2 提问清单

| question_id | 提问对象 | 问题 | 目标证据类型 | 验收规则 |
|---|---|---|---|---|
| `VOC-Q-EXT-001` | COMPLIANCE | Reddit、BabyCenter、Mumsnet 是否允许保存 post/comment 元数据、hash 或脱敏摘录？ | policy / pii | 必须逐平台回答，不能用“外部社区”整体兜底 |
| `VOC-Q-EXT-002` | COMPLIANCE | URL、用户名、用户 ID、头像、截图是否允许进入样本包？ | pii | 必须列出禁止项 |
| `VOC-Q-EXT-003` | DATA | `ods_voc_external` 是否已有真实表名、采集批次、字段清单和分区？ | source / field / freshness | 必须给出表名候选或明确不存在 |
| `VOC-Q-EXT-004` | DATA | post/comment 主键是 `(platform, post_id, comment_id)` 还是其他组合？ | pk-grain | 必须说明去重规则和重复处理 |
| `VOC-Q-EXT-005` | VOC | 外部主题、情绪、语言过滤和人审样本如何定义？ | sample / field | 必须说明 T2 / T3 / T4 的样本准入 |

### 7.3 证据接收模板

| evidence_item_id | evidence_type | requested_output | accepted_content | forbidden_content | ledger_fields_to_update |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-POLICY-001` | policy | 三个平台政策审查结果 | 平台级 allowed / limited / blocked 候选、保存范围 | 自动抓取授权推断 | `source_policy_status` |
| `VOC-EVIDENCE-B1-EXT-PII-001` | pii | PII、URL、用户标识和截图处理规则 | hash、脱敏摘录、聚合保存限制 | 完整原文、URL 批量列表、未匿名用户 ID | `pii_policy_status`、`permission_scope` |
| `VOC-EVIDENCE-B1-EXT-PK-001` | pk-grain | post/comment 主键和去重规则 | 主键候选、重复处理、join 风险 | 只给字段名不说明唯一性 | `pk_grain_status` |
| `VOC-EVIDENCE-B1-EXT-FIELD-001` | field | 字段清单、主题、情绪、语言、平台字段 | 字段类型和枚举候选 | 业务结论字段 | `field_type_status` |
| `VOC-EVIDENCE-B1-EXT-FRESH-001` | freshness | 采集批次、刷新频率、历史回溯 | 分区和刷新候选 | 实时可用承诺 | `freshness_status` |

### 7.4 会后回填规则

| 条件 | 允许动作 | 禁止动作 |
|---|---|---|
| 只有平台政策口头结论 | 写入缺口记录 | 改 `source_policy_status = allowed` |
| 有逐平台政策 evidence item | 提出 `source_policy_status` 候选 | 改 `sql_allowed = yes` |
| 有主键和字段候选 | 改 `pk_grain_status = candidate`、`field_type_status = candidate` | 改 `dq_readiness_status = ready` |
| PII 仍未审查 | 保持 `pii_policy_status = unknown / blocked` | 提供样本全文 |

## 8. `VOC-MEETING-B1-TAG-001`

### 8.1 会议范围

| 项目 | 内容 |
|---|---|
| target_source_asset | `dim_voc_tag` |
| target_ledger_id | `VOC-SIGNOFF-P0-012` |
| 主 Owner | VOC |
| 参与 Owner | PRODUCT / DATA |
| 核心阻断 | 标签 Owner、`tag_l2` / `tag_l3` / `tag_localized`、人审样本、冲突率、不可映射率 |
| 只允许产出 | 标签字典候选、人审样本要求、冲突处理候选 |

### 8.2 提问清单

| question_id | 提问对象 | 问题 | 目标证据类型 | 验收规则 |
|---|---|---|---|---|
| `VOC-Q-TAG-001` | VOC | 当前标签字典是否有 Owner、版本、适用范围和停用标签规则？ | source / field | 必须有版本或明确待建版本 |
| `VOC-Q-TAG-002` | VOC | `tag_l2`、`tag_l3`、`tag_localized` 的层级关系是否唯一？ | pk-grain / field | 必须说明一对多和冲突处理 |
| `VOC-Q-TAG-003` | PRODUCT | 产品线、SPU、本土化标签如何映射？ | field | 必须说明标签不直接触发产品改版 |
| `VOC-Q-TAG-004` | DATA | `tag_id` 主键、版本字段、缺失值和历史变更如何存储？ | pk-grain / freshness | 必须说明版本生效时间 |
| `VOC-Q-TAG-005` | VOC | 人审样本、冲突样本、不可映射样本如何抽取？ | sample | 必须提供样本 hash 或样本规则 |

### 8.3 证据接收模板

| evidence_item_id | evidence_type | requested_output | accepted_content | forbidden_content | ledger_fields_to_update |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-TAG-SOURCE-001` | source | 标签 Owner、版本和适用范围 | Owner 候选、版本候选、启停规则 | 无 Owner 的静态表 |
| `VOC-EVIDENCE-B1-TAG-FIELD-001` | field | 标签层级和本土化字段 | `tag_l2` / `tag_l3` / `tag_localized` 规则 | 用标签直接写产品动作 |
| `VOC-EVIDENCE-B1-TAG-PK-001` | pk-grain | `tag_id`、版本、生效时间 | 主键和版本候选 | 无版本冲突说明 |
| `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | sample | 人审样本、冲突样本、不可映射样本 | 样本 hash 和冲突率候选 | 未授权原文 |

### 8.4 会后回填规则

| 条件 | 允许动作 | 禁止动作 |
|---|---|---|
| 标签 Owner 未确认 | 保持 `owner_status = unsigned` | 把 VOC 会议主持人写成 Owner |
| 标签版本和字段候选已明确 | 改 `field_type_status = candidate` | 改 `signed` |
| 人审样本只有要求没有样本 ID | 改 `sample_policy_status = draft` | 改 `sample_policy_status = signed` |
| PRODUCT 确认用途边界 | 写入 forbidden_content | 输出产品改版动作 |

## 9. `VOC-MEETING-B1-INTERNAL-METRIC-001`

### 9.1 会议范围

| 项目 | 内容 |
|---|---|
| target_source_asset | `fact_voc_summary` |
| target_ledger_id | `VOC-SIGNOFF-P0-004` |
| 主 Owner | DATA |
| 参与 Owner | BI / VOC |
| 核心阻断 | `sales_qty`、`voc_rate`、评分、评论分母、渠道×国家×SPU×月粒度、与 dws / ads 并列关系 |
| 只允许产出 | 分母口径候选、字段清单、BI 关系说明 |

### 9.2 提问清单

| question_id | 提问对象 | 问题 | 目标证据类型 | 验收规则 |
|---|---|---|---|---|
| `VOC-Q-METRIC-001` | DATA | `fact_voc_summary` 的唯一粒度是否为渠道×国家×SPU×月？是否包含店铺粒度？ | pk-grain | 必须明确唯一键和是否会 join 放大 |
| `VOC-Q-METRIC-002` | DATA | `sales_qty` 的来源和分母口径是什么？ | field | 必须说明来源表或待确认缺口 |
| `VOC-Q-METRIC-003` | BI | `voc_rate`、评分、评论分母是否与存量 BI 同名指标一致？ | field | 必须列出一致、冲突或待映射 |
| `VOC-Q-METRIC-004` | VOC | VOC 主题和标签是否允许聚合到该事实表？ | sample / field | 必须说明标签缺失和不可映射处理 |
| `VOC-Q-METRIC-005` | DATA | 刷新频率、月分区、历史回溯和时区如何定义？ | freshness | 必须说明刷新候选 |

### 9.3 证据接收模板

| evidence_item_id | evidence_type | requested_output | accepted_content | forbidden_content | ledger_fields_to_update |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-METRIC-PK-001` | pk-grain | 唯一粒度和 join 风险 | 渠道×国家×SPU×月候选、店铺粒度说明 | 只写“按月汇总” |
| `VOC-EVIDENCE-B1-METRIC-FIELD-001` | field | `sales_qty`、`voc_rate`、评分、评论分母字段来源 | 字段类型、分母口径、冲突清单 | 业务 KPI 承诺 |
| `VOC-EVIDENCE-B1-METRIC-BI-001` | field | 与 dws / ads / 存量 BI 的关系 | 并列、替代、冲突或待映射说明 | 直接覆盖存量 BI |
| `VOC-EVIDENCE-B1-METRIC-FRESH-001` | freshness | 刷新频率、分区、历史回溯 | 月分区和时区候选 | 新鲜度已达标声明 |

### 9.4 会后回填规则

| 条件 | 允许动作 | 禁止动作 |
|---|---|---|
| 分母口径存在冲突 | 写入 `blocking_reason` | 改 `field_type_status = signed` |
| 唯一粒度候选明确 | 改 `pk_grain_status = candidate` | 声明宽表可生产 |
| BI 关系仍待确认 | 保持 `dq_readiness_status = blocked` | 创建 DQ SQL |
| 只有字段名没有血缘 | 保持 `field_type_status = unknown` | 改 `candidate` |

## 10. `VOC-MEETING-B1-INTERNAL-DETAIL-001`

### 10.1 会议范围

| 项目 | 内容 |
|---|---|
| target_source_asset | `dwd_voc_record_detail_full` |
| target_ledger_id | `VOC-SIGNOFF-P0-001` |
| 主 Owner | DATA |
| 参与 Owner | VOC / SERVICE / COMPLIANCE |
| 核心阻断 | 内部 VOC 主明细候选、原文权限、主键、日期口径、服务体验边界 |
| 只允许产出 | 主键候选、权限范围、脱敏规则、服务样本边界 |

### 10.2 提问清单

| question_id | 提问对象 | 问题 | 目标证据类型 | 验收规则 |
|---|---|---|---|---|
| `VOC-Q-DETAIL-001` | DATA | `dwd_voc_record_detail_full` 是否是真实主明细表？真实表名、分区和刷新规则是什么？ | source / freshness | 必须给出真实表名候选或明确不是主表 |
| `VOC-Q-DETAIL-002` | DATA | VOC 明细主键是什么？是否需要渠道、订单、评论、工单等联合主键？ | pk-grain | 必须说明重复和 join 放大风险 |
| `VOC-Q-DETAIL-003` | VOC | 哪些 VOC 类型可进入 T1？标签、人审和情绪字段如何解释？ | field / sample | 必须说明样本准入和标签缺口 |
| `VOC-Q-DETAIL-004` | SERVICE | 工单、售后、退货留言和服务体验样本如何使用？ | sample | 必须说明只能作线索还是可归因 |
| `VOC-Q-DETAIL-005` | COMPLIANCE | 内部原文、用户标识、订单号、截图和脱敏摘录规则是什么？ | pii | 必须列出可接收和禁止内容 |

### 10.3 证据接收模板

| evidence_item_id | evidence_type | requested_output | accepted_content | forbidden_content | ledger_fields_to_update |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | source | 真实表名、Owner、是否主明细 | 表名候选、Owner 路由、来源说明 | 没有 Owner 的表名 |
| `VOC-EVIDENCE-B1-DETAIL-PK-001` | pk-grain | 明细主键、日期口径、重复规则 | 主键候选、日期字段、重复处理 | 只给业务描述 |
| `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | field | VOC 类型、标签、情绪、来源枚举 | 字段清单和枚举候选 | 责任归因字段 |
| `VOC-EVIDENCE-B1-DETAIL-PII-001` | pii | 内部原文和用户标识处理规则 | 脱敏摘录、sample-hash、禁用项 | 完整原文、订单号、真实用户标识 |
| `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | sample | 服务体验样本用途边界 | 线索用途、复核范围 | 直接责任归因 |

### 10.4 会后回填规则

| 条件 | 允许动作 | 禁止动作 |
|---|---|---|
| 真实主表未确认 | 保持 `source_status = blocked` | 把该表定为正式主表 |
| 有主键和字段候选 | 改 `pk_grain_status = candidate`、`field_type_status = candidate` | 改 `signed` |
| SERVICE 仅确认线索用途 | 写入 forbidden_content | 输出责任归因 |
| COMPLIANCE 未给 PII 证据 | 保持 `pii_policy_status = unknown / blocked` | 接收完整原文样本 |

## 11. `VOC-MEETING-B1-REVIEW-001`

### 11.1 会议范围

| 项目 | 内容 |
|---|---|
| target_source_asset | `ods_review_detail` |
| target_ledger_id | `VOC-SIGNOFF-P0-005` |
| 主 Owner | DATA |
| 参与 Owner | VOC / SERVICE / COMPLIANCE |
| 核心阻断 | review_id、评分范围、评论日期、摘录权限、样本 hash、T1 / T3 评分来源 |
| 只允许产出 | review 主键候选、评分规则、脱敏摘录条件 |

### 11.2 提问清单

| question_id | 提问对象 | 问题 | 目标证据类型 | 验收规则 |
|---|---|---|---|---|
| `VOC-Q-REVIEW-001` | DATA | `ods_review_detail` 的真实表名、review_id、渠道、国家、SPU 和评论日期字段是什么？ | source / pk-grain / field | 必须说明 review_id 是否唯一 |
| `VOC-Q-REVIEW-002` | DATA | 评分范围、空评分、追评、重复评论如何处理？ | field | 必须列出评分枚举和异常处理 |
| `VOC-Q-REVIEW-003` | VOC | 评论样本能否用于 T1 内部货架 VOC 和 T3 竞品本土化？ | sample | 必须说明样本准入和标签要求 |
| `VOC-Q-REVIEW-004` | SERVICE | 评论原文或摘录是否可用于服务复核？ | sample / pii | 必须说明只作线索还是可归责 |
| `VOC-Q-REVIEW-005` | COMPLIANCE | review URL、用户名、用户 ID、完整评论原文是否允许保存或展示？ | pii / policy | 必须列出 forbidden content |

### 11.3 证据接收模板

| evidence_item_id | evidence_type | requested_output | accepted_content | forbidden_content | ledger_fields_to_update |
|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | source | 真实表名、Owner、渠道范围 | 表名候选、Owner 路由、渠道范围 | 无 Owner 来源 |
| `VOC-EVIDENCE-B1-REVIEW-PK-001` | pk-grain | review_id 唯一性和联合主键 | review 主键候选、重复规则 | 只给 review_id 不说明唯一性 |
| `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | field | 评分范围、评论日期、追评和空值规则 | 字段清单、评分枚举、异常处理 | 评分业务结论 |
| `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | sample | 20 条评论样本 hash 规则 | sample-hash、渠道、国家、SPU、日期覆盖 | 完整 review、URL 批量列表、真实用户 ID |
| `VOC-EVIDENCE-B1-REVIEW-PII-001` | pii | review URL、用户名、原文展示限制 | 脱敏摘录条件和禁用项 | 未脱敏截图、完整原文 |

### 11.4 会后回填规则

| 条件 | 允许动作 | 禁止动作 |
|---|---|---|
| review_id 唯一性未确认 | 保持 `pk_grain_status = unknown` | 改 `candidate` |
| 评分范围和异常处理明确 | 改 `field_type_status = candidate` | 输出评分结论 |
| 样本只有抽取要求 | 改 `sample_policy_status = draft` | 改 `signed` |
| URL 或完整原文未获许可 | 保持 `pii_policy_status = blocked` | 展示 URL 批量列表 |

## 12. 会后交付包

每个会议结束后，只允许形成以下交付包。交付包不是签收。

| deliverable_id | 交付物 | 适用会议 | 进入台账前置 |
|---|---|---|---|
| `VOC-B1-MINUTES-[MEETING]` | 会议纪要 | 5 个 Batch 1 会议 | 只能记录讨论，不更新状态 |
| `VOC-B1-EVIDENCE-[MEETING]` | evidence item 清单 | 5 个 Batch 1 会议 | 每条 evidence item 有 owner、date、scope |
| `VOC-B1-LEDGER-PROPOSAL-[MEETING]` | 台账回填建议 | 5 个 Batch 1 会议 | 只允许 candidate / requested / draft / keep-blocked |
| `VOC-B1-BLOCKER-[MEETING]` | 未解决阻断清单 | 5 个 Batch 1 会议 | 必须指向缺失 Owner、权限、样本、政策、主键、字段或刷新 |

## 13. 会后状态审查

| review_item | 审查问题 | 通过标准 | 不通过处理 |
|---|---|---|---|
| Owner | 是否有真实 Owner 或 Owner 路由？ | 有 owner_name 或 `TBD_WITH_OWNER_ROUTE` | 保持 `owner_status = unsigned` |
| Scope | evidence item 是否说明范围？ | 有 `evidence_scope` 和禁用范围 | 不进入台账 |
| PII | 是否含完整原文、URL 批量列表、真实用户标识？ | 没有禁用内容 | 移回证据修正 |
| Status | 是否试图直接升级 signed / ready / sql_allowed yes？ | 没有越权状态 | 拒绝回填 |
| Traceability | 是否能追到 meeting_id、owner、date？ | 三者齐全 | 不进入台账 |

## 14. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不声明任何 P0 来源已签收。
- 不声明任何 P0 来源已生产可用。
- 不把会议完成当作 Owner 已确认。
- 不把 evidence item 占位当作证据已回填。
- 不把 `candidate`、`requested`、`draft`、`unsigned` 升级为 `signed`。
- 不把 `waived` 当作 `signed`。
- 不把 Batch 1 当作 Green 候选。
- 不把 `dq_readiness_status = ready` 当作 DQ 已执行。
- 不把 `sql_allowed = no` 改成 `yes`。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 15. 下一步

下一步建议创建 `VOC-EVIDENCE-001` Batch 1 evidence item 接收台账草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md`

该文件应把 5 个会议的 evidence item 模板转成可回填台账，逐条记录 `evidence_item_id`、`meeting_id`、`target_ledger_id`、`evidence_type`、`owner_role`、`owner_name`、`status_proposal` 和 `ledger_fields_to_update`。未完成真实证据回填前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
