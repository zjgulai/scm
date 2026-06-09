---
title: 专题① VOC Batch 1 evidence review gate 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-evidence-review-gate
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 evidence review gate 草稿

## 1. Review Gate 定位

本文执行 `VOC-EVIDENCE-REVIEW-001`，用于定义 Batch 1 的 23 条 evidence item 从 `received` 到 `accepted / rejected / needs-review` 的审查门槛、退回原因、Owner 补证格式和台账回填审批规则。

本文不是证据审查结果，不是 Owner 已签收结果，不是权限审批结果，不是样本包，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不声明任何 P0 来源已生产可用。

当前结论：

- 23 条 evidence item 仍保持接收槽位性质。
- 本文只定义 review gate，不接收真实证据。
- 本文不把任何 `receive_status` 改成 `accepted`。
- 本文不把任何 `owner_status` 改成 `signed`。
- 本文不把任何 `dq_readiness_status` 改成 `ready`。
- 本文不把任何 `sql_allowed` 改成 `yes`。
- 即使 evidence item 未来通过 review gate，也只能形成台账回填建议，不能自动回填签收台账。

反面论证：设置 review gate 以后，容易被误解为“只要证据格式满足，就能进入 DQ 或 SQL”。这不成立。Review gate 只检查证据是否可被接收；是否能更新 `VOC-SIGNOFF-001`，还需要独立的台账回填审批。是否进入 SQL，还需要独立 SQL 准入审批。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item、初始状态和回填字段 | Amber |
| Batch 1 Owner 会议包 | `drafts/analysis/voc-topic-batch1-owner-meeting-pack-draft-20260604.md` | 固定 5 个会议、证据模板、回填规则和 No-Go | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 target ledger、状态字段和 `sql_allowed = no` | Amber |
| DQ Gate 规格 | `drafts/analysis/voc-topic-dq-gate-spec-draft-20260604.md` | 固定 DQ readiness 和 Green 升级门槛 | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. Review Gate 字段

| 字段 | 说明 | 初始值 |
|---|---|---|
| `review_gate_id` | 审查门禁 ID | required |
| `evidence_item_id` | 对应接收台账中的 evidence item | required |
| `meeting_id` | 证据来源会议 | required |
| `target_ledger_id` | 回填目标签收台账行 | required |
| `target_source_asset` | 回填目标来源 | required |
| `evidence_type` | source / access / sample / pii / policy / pk-grain / field / freshness / dq | required |
| `minimum_checks` | 必查项 | required |
| `accept_if` | 可进入 accepted 的条件 | required |
| `needs_review_if` | 需要复核的条件 | required |
| `reject_if` | 退回条件 | required |
| `owner_fix_format` | Owner 补证格式 | required |
| `ledger_update_rule` | 台账回填规则 | proposal-only |
| `review_status` | not-started / accepted / rejected / needs-review | `not-started` |

## 4. 通用审查门槛

所有 evidence item 必须先通过通用门槛，再进入类型门槛。

| gate | 检查项 | accept_if | needs_review_if | reject_if |
|---|---|---|---|---|
| `GATE-COMMON-001` | `evidence_item_id` 是否匹配台账 | 与 23 条槽位之一完全一致 | 拼写疑似错误但可追溯 | 新增来源或新增未登记 evidence item |
| `GATE-COMMON-002` | `meeting_id` 是否匹配 | 属于 5 个 Batch 1 meeting_id | 会议编号可疑但主题一致 | 跨 Batch 或无会议来源 |
| `GATE-COMMON-003` | Owner 是否可追溯 | 有 owner_role、owner_name、证据日期 | 只有 owner_role 无真实姓名 | `self`、AI、会议主持人代签 |
| `GATE-COMMON-004` | 范围是否明确 | 有 evidence_scope 和 forbidden_content | scope 过宽但可补充 | 全量兜底、空 forbidden_content |
| `GATE-COMMON-005` | 是否含禁用内容 | 不含完整原文、URL 批量列表、真实用户标识、未脱敏截图 | 疑似含敏感摘录但可脱敏 | 含完整原文或可识别用户信息 |
| `GATE-COMMON-006` | 状态建议是否越权 | 只提出 candidate / requested / draft / blocker | 状态措辞模糊 | signed / ready / sql_allowed yes |

## 5. evidence_type 类型门槛

| evidence_type | accept_if | needs_review_if | reject_if | owner_fix_format |
|---|---|---|---|---|
| source | 提供真实源系统、真实表名或明确不存在说明，并给出 Owner 路由 | 表名存在但 Owner 缺失 | 无 Owner 的表名、mock、CSV 样例 | 补 `owner_name`、真实表名、系统名、证据日期 |
| access | 提供权限申请 ID、Owner 批准记录或明确权限限制 | 只有待申请描述 | 自动申请 full-text 或未脱敏原文 | 补权限工单、scope、forbidden_scope |
| sample | 提供 sample hash、聚合样本规则、采样方法和样本量 | 样本量或覆盖维度不足 | 完整原文、URL 批量列表、未脱敏截图 | 补 sample_package_id、hash 规则、覆盖维度 |
| pii | 有 COMPLIANCE 或对应 Owner 审查记录，明确 URL、用户标识、原文、截图边界 | 只有业务 Owner 说明 | 未匿名用户 ID、完整原文、未脱敏截图 | 补 policy_review_id、脱敏规则、禁用项 |
| policy | 逐平台给出保存、展示、回溯和限制条件 | 平台范围不完整 | 把平台目录当授权 | 补逐平台政策审查、allowed / limited / blocked 候选 |
| pk-grain | 给出主键、粒度、重复规则和 join 放大风险 | 主键候选存在但唯一性未验证 | 只给字段名不说明唯一性 | 补唯一性说明、重复处理、join 风险 |
| field | 给出字段清单、类型、枚举、空值和历史变更 | 只给核心字段，缺枚举或空值 | 业务 KPI 承诺、业务动作字段 | 补字段类型、枚举、空值、变更历史 |
| freshness | 给出刷新频率、分区、回溯范围和时区 | 只有刷新频率无分区 | 实时可用承诺 | 补分区、刷新、回溯、时区 |
| dq | 只记录 DQ readiness 阻断项，不含执行结果 | 阻断项不完整 | DQ SQL 或执行结果 | 补阻断字段、缺失 scope、前置证据引用 |

## 6. Batch 1 evidence review gate 总表

| review_gate_id | evidence_item_id | meeting_id | target_source_asset | evidence_type | minimum_checks | accept_if | needs_review_if | reject_if | ledger_update_rule | review_status |
|---|---|---|---|---|---|---|---|---|---|---|
| `VOC-REVIEW-B1-EXT-POLICY-001` | `VOC-EVIDENCE-B1-EXT-POLICY-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | policy | common + policy | 三个平台逐一说明保存、展示、回溯和限制 | 缺一个平台或限制措辞模糊 | 把平台目录当授权 | proposal-only: `source_policy_status` candidate | not-started |
| `VOC-REVIEW-B1-EXT-PII-001` | `VOC-EVIDENCE-B1-EXT-PII-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | pii | common + pii | 明确 URL、用户名、用户 ID、截图、原文禁用范围 | 只有业务口径无合规审查 | 含完整原文或真实用户标识 | proposal-only: `pii_policy_status` blocker | not-started |
| `VOC-REVIEW-B1-EXT-PK-001` | `VOC-EVIDENCE-B1-EXT-PK-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | pk-grain | common + pk-grain | 说明 `(platform, post_id, comment_id)` 或替代主键及去重规则 | 主键候选缺唯一性说明 | 只给字段名 | proposal-only: `pk_grain_status` candidate | not-started |
| `VOC-REVIEW-B1-EXT-FIELD-001` | `VOC-EVIDENCE-B1-EXT-FIELD-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | field | common + field | 字段清单覆盖主题、情绪、语言、平台、时间 | 缺枚举或空值规则 | 含业务动作字段 | proposal-only: `field_type_status` candidate | not-started |
| `VOC-REVIEW-B1-EXT-FRESH-001` | `VOC-EVIDENCE-B1-EXT-FRESH-001` | `VOC-MEETING-B1-EXT-POLICY-001` | `ods_voc_external` | freshness | common + freshness | 给出采集批次、刷新频率、历史回溯、时区 | 缺历史回溯或时区 | 声明实时可用 | proposal-only: `freshness_status` candidate | not-started |
| `VOC-REVIEW-B1-TAG-SOURCE-001` | `VOC-EVIDENCE-B1-TAG-SOURCE-001` | `VOC-MEETING-B1-TAG-001` | `dim_voc_tag` | source | common + source | 给出标签 Owner、版本、适用范围、停用规则 | 有版本无 Owner | 静态表无 Owner | proposal-only: source owner route | not-started |
| `VOC-REVIEW-B1-TAG-FIELD-001` | `VOC-EVIDENCE-B1-TAG-FIELD-001` | `VOC-MEETING-B1-TAG-001` | `dim_voc_tag` | field | common + field | 说明 `tag_l2` / `tag_l3` / `tag_localized` 层级和冲突处理 | 层级规则缺冲突处理 | 标签直接触发产品动作 | proposal-only: `field_type_status` candidate | not-started |
| `VOC-REVIEW-B1-TAG-PK-001` | `VOC-EVIDENCE-B1-TAG-PK-001` | `VOC-MEETING-B1-TAG-001` | `dim_voc_tag` | pk-grain | common + pk-grain | 给出 `tag_id`、版本、生效时间和唯一性 | 缺版本生效时间 | 无版本冲突说明 | proposal-only: `pk_grain_status` candidate | not-started |
| `VOC-REVIEW-B1-TAG-SAMPLE-001` | `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | `VOC-MEETING-B1-TAG-001` | `dim_voc_tag` | sample | common + sample | 给出人审、冲突、不可映射样本 hash 规则 | 只有样本要求无 sample id | 未授权原文 | proposal-only: `sample_policy_status` draft | not-started |
| `VOC-REVIEW-B1-METRIC-PK-001` | `VOC-EVIDENCE-B1-METRIC-PK-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `fact_voc_summary` | pk-grain | common + pk-grain | 明确渠道×国家×SPU×月唯一粒度和 join 风险 | 缺店铺粒度说明 | 只写按月汇总 | proposal-only: `pk_grain_status` candidate | not-started |
| `VOC-REVIEW-B1-METRIC-FIELD-001` | `VOC-EVIDENCE-B1-METRIC-FIELD-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `fact_voc_summary` | field | common + field | 明确 `sales_qty`、`voc_rate`、评分、评论分母来源 | 字段有名无血缘 | KPI 承诺 | proposal-only: `field_type_status` candidate | not-started |
| `VOC-REVIEW-B1-METRIC-BI-001` | `VOC-EVIDENCE-B1-METRIC-BI-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `fact_voc_summary` | field | common + field | 说明与 dws / ads / 存量 BI 并列、替代、冲突或待映射 | 只说一致无字段对照 | 直接覆盖存量 BI | proposal-only: `blocking_reason` | not-started |
| `VOC-REVIEW-B1-METRIC-FRESH-001` | `VOC-EVIDENCE-B1-METRIC-FRESH-001` | `VOC-MEETING-B1-INTERNAL-METRIC-001` | `fact_voc_summary` | freshness | common + freshness | 给出刷新频率、月分区、回溯、时区 | 缺时区或回溯 | 新鲜度已达标声明 | proposal-only: `freshness_status` candidate | not-started |
| `VOC-REVIEW-B1-DETAIL-SOURCE-001` | `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | source | common + source | 给出真实表名、Owner、是否主明细 | 表名候选无 Owner | 直接定正式主表 | proposal-only: source candidate | not-started |
| `VOC-REVIEW-B1-DETAIL-PK-001` | `VOC-EVIDENCE-B1-DETAIL-PK-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | pk-grain | common + pk-grain | 给出明细主键、日期口径、重复规则 | 主键候选缺重复处理 | 只给业务描述 | proposal-only: `pk_grain_status` candidate | not-started |
| `VOC-REVIEW-B1-DETAIL-FIELD-001` | `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | field | common + field | 字段覆盖 VOC 类型、标签、情绪、来源枚举 | 缺枚举或空值规则 | 责任归因字段 | proposal-only: `field_type_status` candidate | not-started |
| `VOC-REVIEW-B1-DETAIL-PII-001` | `VOC-EVIDENCE-B1-DETAIL-PII-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | pii | common + pii | 明确内部原文、用户标识、订单号、截图、脱敏规则 | 只有 SERVICE 或 VOC 说明无合规审查 | 完整原文、订单号、真实用户标识 | proposal-only: PII blocker | not-started |
| `VOC-REVIEW-B1-DETAIL-SERVICE-001` | `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | `VOC-MEETING-B1-INTERNAL-DETAIL-001` | `dwd_voc_record_detail_full` | sample | common + sample | 明确服务体验样本只作线索或复核范围 | 用途边界不清 | 责任归因 | proposal-only: `blocking_reason` | not-started |
| `VOC-REVIEW-B1-REVIEW-SOURCE-001` | `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | source | common + source | 给出真实表名、Owner、渠道范围 | 表名无 Owner | 无 Owner 来源 | proposal-only: source candidate | not-started |
| `VOC-REVIEW-B1-REVIEW-PK-001` | `VOC-EVIDENCE-B1-REVIEW-PK-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | pk-grain | common + pk-grain | 明确 review_id 唯一性或联合主键 | 缺唯一性验证 | 只给 review_id | proposal-only: `pk_grain_status` candidate | not-started |
| `VOC-REVIEW-B1-REVIEW-FIELD-001` | `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | field | common + field | 给出评分范围、评论日期、追评、空值规则 | 缺异常处理 | 评分业务结论 | proposal-only: `field_type_status` candidate | not-started |
| `VOC-REVIEW-B1-REVIEW-SAMPLE-001` | `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | sample | common + sample | 给出 20 条评论样本 hash 规则和覆盖维度 | 有样本要求无 sample id | 完整 review、URL 批量列表、真实用户 ID | proposal-only: sample draft | not-started |
| `VOC-REVIEW-B1-REVIEW-PII-001` | `VOC-EVIDENCE-B1-REVIEW-PII-001` | `VOC-MEETING-B1-REVIEW-001` | `ods_review_detail` | pii | common + pii | 明确 review URL、用户名、原文展示限制 | 缺 COMPLIANCE 审查 | 未脱敏截图、完整原文 | proposal-only: PII blocker | not-started |

## 7. Owner 补证格式

所有 `needs-review` 或 `rejected` 的 evidence item，必须按以下格式补证。

| 字段 | 要求 |
|---|---|
| `evidence_item_id` | 原 evidence item ID，不得新建 |
| `fix_reason` | owner-missing / date-missing / scope-too-broad / forbidden-content / policy-missing / pk-unclear / field-unclear / sample-unsafe / status-overreach |
| `owner_role` | 原 Owner 角色 |
| `owner_name` | 真实 Owner 名称 |
| `evidence_date` | YYYY-MM-DD |
| `fixed_scope` | 本次补证覆盖范围 |
| `removed_content` | 删除的 forbidden_content |
| `added_content` | 新增的可接收内容摘要 |
| `remaining_blocker` | 仍未解决的阻断 |
| `requested_review_status` | accepted / needs-review / rejected |

## 8. 退回原因字典

| reject_reason | 说明 | 后续动作 |
|---|---|---|
| `owner-missing` | 缺真实 Owner 名称或 Owner 路由 | 退回补 Owner |
| `date-missing` | 缺证据日期 | 退回补日期 |
| `scope-too-broad` | evidence_scope 过宽或全量兜底 | 退回收窄范围 |
| `forbidden-content` | 含完整原文、URL 批量列表、真实用户标识或未脱敏截图 | 退回脱敏或删除 |
| `policy-missing` | 缺 COMPLIANCE 或平台政策审查 | 转 `needs-review` 给 COMPLIANCE |
| `pk-unclear` | 主键、唯一性或重复规则不清 | 退回 DATA |
| `field-unclear` | 字段类型、枚举、空值或血缘不清 | 退回 DATA / BI / VOC |
| `sample-unsafe` | 样本包含未授权原文或可识别信息 | 退回样本重做 |
| `status-overreach` | 试图升级 signed / ready / sql_allowed yes | 拒绝并保留 blocked |

## 9. 台账回填审批规则

| review_status | 是否允许改 `VOC-SIGNOFF-001` | 可生成内容 | 禁止内容 |
|---|---|---|---|
| `not-started` | no | 无 | 任何台账更新 |
| `needs-review` | no | 补证请求 | signed / ready / SQL |
| `rejected` | no | 退回原因 | signed / ready / SQL |
| `accepted` | no | 台账回填建议 | 直接改签收台账 |

即使 `review_status = accepted`，也只允许创建下一层 `VOC-LEDGER-UPDATE-001` 回填建议，不允许直接修改 `VOC-SIGNOFF-001`。

## 10. 状态锁

本文创建后仍禁止以下状态迁移：

| 禁止迁移 | 原因 |
|---|---|
| `receive_status: not-received -> accepted` | 本文不接收真实证据 |
| `review_status: not-started -> accepted` | 本文不执行真实审查 |
| `owner_status: unsigned -> signed` | 缺少真实 `signoff_id`、Owner、日期和签收范围 |
| `access_status: unknown -> approved` | 缺少权限审批记录 |
| `sample_policy_status: unknown -> signed` | 缺少样本包和样本策略签收 |
| `pii_policy_status: unknown -> signed` | 缺少 COMPLIANCE 或对应 Owner 签收 |
| `source_policy_status: unknown -> allowed` | 缺少逐平台政策审查结果 |
| `pk_grain_status: unknown -> signed` | 缺少主键粒度审查签收 |
| `field_type_status: unknown -> signed` | 缺少字段口径签收 |
| `freshness_status: unknown -> signed` | 缺少刷新频率签收 |
| `dq_readiness_status: blocked -> ready` | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed: no -> yes` | 本文不能授权 SQL |

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
- 不把 review gate 当作真实审查结果。
- 不把 `review_status = accepted` 当作 `owner_status = signed`。
- 不把 `receive_status = accepted` 当作 `owner_status = signed`。
- 不把 `candidate-only` 当作 `signed`。
- 不把 `requested-only` 当作 `approved`。
- 不把 `draft-only` 当作 `sample_policy_status = signed`。
- 不把 `blocker-only` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 12. 下一步

下一步建议创建 `VOC-LEDGER-UPDATE-001` Batch 1 evidence-to-signoff 回填建议控制草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-ledger-update-control-draft-20260604.md`

该文件应定义在 evidence item 未来通过 review gate 后，如何生成 `VOC-SIGNOFF-001` 的候选回填建议、审批字段、禁止状态和回滚规则。未完成真实 evidence review 前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
