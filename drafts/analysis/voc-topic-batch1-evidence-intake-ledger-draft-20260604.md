---
title: 专题① VOC Batch 1 evidence item 接收台账草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-evidence-intake-ledger
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 evidence item 接收台账草稿

## 1. 台账定位

本文执行 `VOC-EVIDENCE-001`，用于把 `VOC-MEETING-001` 的 5 个 Batch 1 Owner 会议证据模板转成可逐条回填的 evidence item 接收台账。

本文不是证据本身，不是会议纪要，不是 Owner 已签收结果，不是权限审批结果，不是样本包，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不声明任何 P0 来源已生产可用。

当前结论：

- 23 个 evidence item 只是接收槽位。
- 所有 `receive_status` 初始为 `not-received`。
- 所有 `owner_name` 初始为 `TBD`。
- 所有 `evidence_date` 初始为 `TBD`。
- 所有 `ledger_update_allowed` 初始为 `no`。
- 所有 `target_ledger_id` 对应来源继续保持 `blocked / unsigned`。
- 所有 `sql_allowed` 继续保持 `no`。

反面论证：把 evidence item 编号列出来后，看起来像证据已经具备了编号和格式。这个理解是错误的。编号只是接收槽位，不能替代真实 Owner、真实日期、证据范围、审查结论和可追溯附件。没有真实证据前，任何行都不能推动 `signed`、`ready` 或 `sql_allowed = yes`。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 Owner 会议包 | `drafts/analysis/voc-topic-batch1-owner-meeting-pack-draft-20260604.md` | 固定 5 个会议、提问清单、证据模板和回填规则 | Amber |
| P0 来源治理执行路线图 | `drafts/analysis/voc-topic-p0-source-governance-execution-roadmap-draft-20260604.md` | 固定 Batch 1 顺序、检查点和继续条件 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 target ledger、状态字段和 `sql_allowed = no` | Amber |
| Owner 访谈与证据回填清单 | `drafts/analysis/voc-topic-owner-interview-evidence-intake-checklist-draft-20260604.md` | 固定 Owner 任务、权限任务和样本任务 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. 台账字段

| 字段 | 说明 | 初始值 |
|---|---|---|
| `evidence_item_id` | evidence 接收槽位 ID | required |
| `meeting_id` | 证据来源会议 | required |
| `target_ledger_id` | 回填目标签收台账行 | required |
| `target_source_asset` | 回填目标来源 | required |
| `source_domain` | external_community / tag / internal_voc / review | required |
| `evidence_type` | source / access / sample / pii / policy / pk-grain / field / freshness / dq | required |
| `owner_role` | 需要提供或审查证据的 Owner 角色 | required |
| `owner_name` | 真实 Owner 名称 | `TBD` |
| `evidence_scope` | 本证据覆盖范围 | required |
| `requested_output` | 需要接收的材料 | required |
| `accepted_content_rule` | 可接受内容 | required |
| `forbidden_content` | 禁止接收内容 | required |
| `status_proposal` | keep-blocked / candidate-only / requested-only / draft-only / blocker-only | required |
| `ledger_fields_to_update` | 后续可能回填的台账字段 | required |
| `receive_status` | not-received / received / rejected / needs-review / accepted | `not-received` |
| `evidence_date` | 证据日期 | `TBD` |
| `review_required` | 是否需要复核 | yes |
| `ledger_update_allowed` | 当前是否允许回填签收台账 | `no` |

## 4. 接收状态规则

| receive_status | 含义 | 可做动作 | 禁止动作 |
|---|---|---|---|
| `not-received` | 只有槽位，没有证据 | 继续催收 | 更新签收台账 |
| `received` | 收到材料但未审查 | 检查 owner、date、scope、forbidden_content | 改 `signed` |
| `needs-review` | 需要 Owner 或合规复核 | 保留待审 | 改 `ready` |
| `rejected` | 材料不满足接收规则 | 退回补证 | 进入 DQ |
| `accepted` | 满足接收规则 | 形成台账回填建议 | 改 `sql_allowed = yes` |

`accepted` 也不等于 `signed`。签收仍需独立 `signoff_id`、Owner、日期、签收范围和证据引用。

## 5. Batch 1 evidence item 总表

| evidence_item_id | meeting_id | target_ledger_id | target_source_asset | evidence_type | owner_role | owner_name | evidence_scope | status_proposal | ledger_fields_to_update | receive_status | ledger_update_allowed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | policy | COMPLIANCE | TBD | Reddit / BabyCenter / Mumsnet 平台政策 | candidate-only | `source_policy_status` | not-received | no |
| `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | pii | COMPLIANCE | TBD | URL、用户名、用户 ID、截图、外部原文处理 | blocker-only | `pii_policy_status` / `permission_scope` | not-received | no |
| `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | pk-grain | DATA | TBD | post/comment 主键和去重规则 | candidate-only | `pk_grain_status` | not-received | no |
| `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | field | DATA / VOC | TBD | 字段清单、主题、情绪、语言、平台字段 | candidate-only | `field_type_status` | not-received | no |
| `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `VOC-SIGNOFF-P0-006` | `ods_voc_external` | freshness | DATA | TBD | 采集批次、刷新频率、历史回溯 | candidate-only | `freshness_status` | not-received | no |
| `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-MEETING-B1-TAG-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | source | VOC | TBD | 标签 Owner、版本和适用范围 | keep-blocked | `source_owner_name` / `source_status` | not-received | no |
| `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-MEETING-B1-TAG-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | field | VOC / PRODUCT | TBD | `tag_l2` / `tag_l3` / `tag_localized` 层级规则 | candidate-only | `field_type_status` | not-received | no |
| `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-MEETING-B1-TAG-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | pk-grain | DATA / VOC | TBD | `tag_id`、版本、生效时间 | candidate-only | `pk_grain_status` / `freshness_status` | not-received | no |
| `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-MEETING-B1-TAG-001` | `VOC-SIGNOFF-P0-012` | `dim_voc_tag` | sample | VOC | TBD | 人审样本、冲突样本、不可映射样本 | draft-only | `sample_package_id` / `sample_policy_status` | not-received | no |
| `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | pk-grain | DATA | TBD | 渠道×国家×SPU×月唯一粒度和 join 风险 | candidate-only | `pk_grain_status` | not-received | no |
| `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | field | DATA / BI | TBD | `sales_qty`、`voc_rate`、评分、评论分母字段来源 | candidate-only | `field_type_status` / `blocking_reason` | not-received | no |
| `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | field | BI | TBD | 与 dws / ads / 存量 BI 的关系 | blocker-only | `blocking_reason` / `field_type_status` | not-received | no |
| `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `VOC-SIGNOFF-P0-004` | `fact_voc_summary` | freshness | DATA | TBD | 刷新频率、月分区、历史回溯、时区 | candidate-only | `freshness_status` | not-received | no |
| `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | source | DATA | TBD | 真实表名、Owner、是否主明细 | keep-blocked | `source_owner_name` / `source_status` | not-received | no |
| `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | pk-grain | DATA | TBD | 明细主键、日期口径、重复规则 | candidate-only | `pk_grain_status` | not-received | no |
| `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | field | DATA / VOC | TBD | VOC 类型、标签、情绪、来源枚举 | candidate-only | `field_type_status` | not-received | no |
| `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | pii | COMPLIANCE | TBD | 内部原文、用户标识、订单号、截图和脱敏规则 | blocker-only | `pii_policy_status` / `permission_scope` | not-received | no |
| `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `VOC-SIGNOFF-P0-001` | `dwd_voc_record_detail_full` | sample | SERVICE | TBD | 服务体验样本用途边界 | blocker-only | `sample_package_id` / `sample_policy_status` / `blocking_reason` | not-received | no |
| `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-MEETING-B1-REVIEW-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | source | DATA | TBD | 真实表名、Owner、渠道范围 | keep-blocked | `source_owner_name` / `source_status` | not-received | no |
| `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-MEETING-B1-REVIEW-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | pk-grain | DATA | TBD | review_id 唯一性和联合主键 | candidate-only | `pk_grain_status` | not-received | no |
| `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-MEETING-B1-REVIEW-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | field | DATA / VOC | TBD | 评分范围、评论日期、追评和空值规则 | candidate-only | `field_type_status` | not-received | no |
| `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-MEETING-B1-REVIEW-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | sample | VOC / SERVICE | TBD | 20 条评论样本 hash 规则 | draft-only | `sample_package_id` / `sample_policy_status` | not-received | no |
| `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-MEETING-B1-REVIEW-001` | `VOC-SIGNOFF-P0-005` | `ods_review_detail` | pii | COMPLIANCE | TBD | review URL、用户名、原文展示限制 | blocker-only | `pii_policy_status` / `permission_scope` | not-received | no |

## 6. 接收规则明细

| evidence_type | accepted_content_rule | forbidden_content | 默认状态建议 |
|---|---|---|---|
| source | 真实源系统、真实表名、Owner 路由或明确不存在说明 | 无 Owner 的表名、AI 代签 | keep-blocked |
| access | 权限申请 ID、Owner 批准记录或明确限制 | full-text、未脱敏原文、真实用户标识 | requested-only |
| sample | sample hash、聚合样本、采样方法和样本量 | 完整原文、URL 批量列表、未脱敏截图 | draft-only |
| pii | COMPLIANCE 或对应 Owner 对用户标识、URL、原文、截图的审查 | 业务 Owner 单方兜底、未匿名用户 ID | blocker-only |
| policy | 逐平台政策审查和保存 / 展示边界 | 把平台目录当授权 | candidate-only |
| pk-grain | 主键、粒度、重复规则、join 放大风险 | 只给字段名不说明唯一性 | candidate-only |
| field | 字段清单、类型、枚举、空值、历史变更 | 业务动作字段、KPI 承诺 | candidate-only |
| freshness | 刷新频率、分区、回溯范围、时区 | 实时可用承诺 | candidate-only |
| dq | 缺口说明和 readiness 阻断项 | DQ SQL、执行结果 | blocker-only |

## 7. 会后回填决策

| 条件 | ledger_update_allowed | 可形成的回填建议 | 禁止回填 |
|---|---|---|---|
| `receive_status = not-received` | no | 无 | 任何签收台账字段 |
| `receive_status = received` 但缺 owner 或 date | no | 退回补 Owner 或日期 | `source_owner_name`、`signoff_id` |
| `receive_status = received` 且含 forbidden_content | no | 标记 `rejected` 或 `needs-review` | `sample_policy_status = signed` |
| `receive_status = accepted` 且 status_proposal = candidate-only | no | 生成候选回填建议 | `signed`、`ready`、`sql_allowed = yes` |
| `receive_status = accepted` 且 status_proposal = requested-only | no | 生成权限申请建议 | `access_status = approved` |
| `receive_status = accepted` 且 status_proposal = draft-only | no | 生成样本草稿建议 | `sample_policy_status = signed` |
| `receive_status = accepted` 且 status_proposal = blocker-only | no | 生成阻断说明 | `dq_readiness_status = ready` |

`ledger_update_allowed` 当前全部保持 `no`。后续只有在创建单独会后 evidence review 文件，并逐条确认 owner、date、scope、forbidden_content 后，才允许提出台账变更建议。

## 8. 来源级接收缺口汇总

| target_source_asset | target_ledger_id | evidence item 数 | 当前接收数 | 当前可回填数 | 当前阻断 |
|---|---|---:|---:|---:|---|
| `ods_voc_external` | `VOC-SIGNOFF-P0-006` | 5 | 0 | 0 | 平台政策、PII、主键、字段、刷新均未接收 |
| `dim_voc_tag` | `VOC-SIGNOFF-P0-012` | 4 | 0 | 0 | 标签 Owner、层级、主键、人审样本均未接收 |
| `fact_voc_summary` | `VOC-SIGNOFF-P0-004` | 4 | 0 | 0 | 分母口径、BI 关系、唯一粒度、刷新均未接收 |
| `dwd_voc_record_detail_full` | `VOC-SIGNOFF-P0-001` | 5 | 0 | 0 | 主明细、PII、服务样本、字段、主键均未接收 |
| `ods_review_detail` | `VOC-SIGNOFF-P0-005` | 5 | 0 | 0 | review 主键、评分、样本 hash、PII 均未接收 |

## 9. 状态锁

本文创建后仍禁止以下状态迁移：

| 禁止迁移 | 原因 |
|---|---|
| `owner_status: unsigned -> signed` | 缺少真实 `signoff_id`、Owner、日期和签收范围 |
| `access_status: unknown -> approved` | 缺少权限审批记录 |
| `sample_policy_status: unknown -> signed` | 缺少样本包和样本策略签收 |
| `pii_policy_status: unknown -> signed` | 缺少 COMPLIANCE 或对应 Owner 签收 |
| `source_policy_status: unknown -> allowed` | 缺少逐平台政策审查结果 |
| `pk_grain_status: unknown -> signed` | 缺少主键粒度审查签收 |
| `field_type_status: unknown -> signed` | 缺少字段口径签收 |
| `freshness_status: unknown -> signed` | 缺少刷新频率签收 |
| `dq_readiness_status: blocked -> ready` | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed: no -> yes` | 本台账不能授权 SQL |

## 10. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不声明任何 P0 来源已签收。
- 不声明任何 P0 来源已生产可用。
- 不把 evidence item 槽位当作证据已接收。
- 不把 `receive_status = accepted` 当作 `owner_status = signed`。
- 不把 `candidate-only` 当作 `signed`。
- 不把 `requested-only` 当作 `approved`。
- 不把 `draft-only` 当作 `sample_policy_status = signed`。
- 不把 `blocker-only` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 11. 下一步

下一步建议创建 `VOC-EVIDENCE-REVIEW-001` Batch 1 evidence review gate 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md`

该文件应定义每条 evidence item 从 `received` 到 `accepted / rejected / needs-review` 的审查门槛、退回原因、Owner 补证格式和台账回填审批规则。未完成真实证据审查前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
