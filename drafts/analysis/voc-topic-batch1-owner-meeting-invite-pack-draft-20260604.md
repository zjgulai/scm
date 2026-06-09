---
title: 专题① VOC Batch 1 Owner meeting invite pack 草稿
doc_type: analysis
module: project-governance
topic: voc-topic-batch1-owner-meeting-invite-pack
status: draft
created: 2026-06-04
updated: 2026-06-04
owner: self
source: human+ai
---

# 专题① VOC Batch 1 Owner meeting invite pack 草稿

## 1. 邀请包定位

本文执行 `VOC-BATCH1-MEETING-INVITE-001`，用于把 `VOC-BATCH1-HANDOFF-001` 和 `VOC-BATCH1-RESPONSE-001` 转成 5 个可发送的 Batch 1 Owner 会议邀请、会前材料清单、证据回复截止规则和禁用材料说明。

本文不是会议已发送结果，不是会议执行结果，不是 Owner 回复结果，不是 evidence 接收结果，不是 evidence review 结果，不是台账回填结果，不是 Owner 已签收结果，不是 DQ 执行结果，不是 SQL 初稿，不创建 `sql/` 资产，不连接数据库，不创建 DQ 执行脚本，不修改 `VOC-SIGNOFF-001`，不声明任何 P0 来源已生产可用。

当前结论：

- Batch 1 的 5 个会议仍为 `not-held`。
- Batch 1 的 23 条 evidence item 仍为 `not-received`。
- Batch 1 的 23 条 review gate 仍为 `not-started`。
- Batch 1 的 23 条 ledger update control 仍为 `not-created`。
- 本文只定义邀请和会前材料，不代表邀请已发送。
- 5 个 Batch 1 来源继续保持 `blocked / unsigned`。
- 5 个 Batch 1 来源继续保持 `dq_readiness_status = blocked`。
- 5 个 Batch 1 来源继续保持 `sql_allowed = no`。

反面论证：会议邀请包比 handoff 更接近真实执行，容易被误读成“Owner 已经进入确认流程”。这不成立。邀请包只是发送前材料，只有真实发送记录、参会确认、会议纪要和逐条 Owner 回复出现后，才允许进入后续 evidence review。

## 2. 上游证据

| 类型 | 路径 | 用途 | 证据等级 |
|---|---|---|---|
| Batch 1 Owner response template | `drafts/analysis/voc-topic-batch1-owner-response-template-draft-20260604.md` | 固定 `VOC-BATCH1-RESPONSE-001` 的逐角色回复模板 | Amber |
| Batch 1 Owner execution handoff | `drafts/analysis/voc-topic-batch1-owner-execution-handoff-draft-20260604.md` | 固定 `VOC-BATCH1-HANDOFF-001` 的交接卡、角色和禁止材料 | Amber |
| Batch 1 governance status board | `drafts/analysis/voc-topic-batch1-governance-status-board-draft-20260604.md` | 固定 `VOC-BATCH1-STATUS-001` 的当前阻断状态 | Amber |
| Batch 1 evidence item 接收台账 | `drafts/analysis/voc-topic-batch1-evidence-intake-ledger-draft-20260604.md` | 固定 `VOC-EVIDENCE-001` 的 23 条 evidence item 和 `not-received` | Amber |
| Batch 1 evidence review gate | `drafts/analysis/voc-topic-batch1-evidence-review-gate-draft-20260604.md` | 固定 `VOC-EVIDENCE-REVIEW-001` 的 review gate 和退回规则 | Amber |
| Batch 1 Owner 会议包 | `drafts/analysis/voc-topic-batch1-owner-meeting-pack-draft-20260604.md` | 固定 `VOC-MEETING-001` 的 5 个会议和提问清单 | Amber |
| P0 来源签收台账 | `drafts/analysis/voc-topic-p0-source-signoff-ledger-draft-20260604.md` | 固定 `VOC-SIGNOFF-001` 的 `blocked / unsigned / sql_allowed = no` | Amber |
| SQL 前置规格 | `drafts/analysis/voc-topic-sql-prerequisite-spec-draft-20260604.md` | 固定未签收前不进入 SQL | Amber |

## 3. 邀请字段模式

| 字段 | 说明 | 初始规则 |
|---|---|---|
| `invite_id` | 会议邀请 ID | `VOC-INVITE-B1-[SOURCE]-001` |
| `meeting_id` | 对应会议 ID | 5 个 Batch 1 meeting_id 之一 |
| `target_source_asset` | 目标来源 | 5 个 Batch 1 来源之一 |
| `target_ledger_id` | 目标 `VOC-SIGNOFF-001` 行 | `VOC-SIGNOFF-P0-006` / `012` / `004` / `001` / `005` |
| `primary_owner_role` | 主 Owner 角色 | DATA / VOC / COMPLIANCE |
| `required_attendees` | 必须参会角色 | DATA / BI / VOC / SERVICE / PRODUCT / COMPLIANCE 的子集 |
| `pre_read` | 会前材料 | handoff、response template、No-Go、目标 evidence item |
| `evidence_items_requested` | 本会议请求的 evidence item | 只能来自 23 条已登记槽位 |
| `response_deadline_rule` | 回复截止规则 | 会前 1 个工作日提交初稿，会议后 1 个工作日补齐 |
| `forbidden_attachments` | 禁止附件 | 完整原文、URL 批量列表、真实用户标识、未脱敏截图、SQL、DQ |
| `status_to_preserve` | 必须保持状态 | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `sql_allowed = no` |

## 4. 邀请发送规则

| 行为 | 允许 | 禁止 |
|---|---|---|
| 创建邀请草稿 | yes | 写成已发送 |
| 发送会议邀请 | 后续人工执行 | 自动修改 `meeting_execution_status` |
| Owner 会前回复 | 使用 `VOC-BATCH1-RESPONSE-001` 模板 | 用聊天摘要替代逐条 evidence |
| 附件接收 | 只收 metadata-only / sample-hash / desensitized-excerpt / aggregate-only | 收完整原文、URL 批量包、未脱敏截图 |
| 会后纪要 | 只能记录讨论和待补证 | 写成签收、DQ ready 或 SQL allowed |

## 5. 邀请 1：外部 VOC 政策与 PII

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-EXT-POLICY-001` |
| meeting_id | `VOC-MEETING-B1-EXT-POLICY-001` |
| target_source_asset | `ods_voc_external` |
| target_ledger_id | `VOC-SIGNOFF-P0-006` |
| primary_owner_role | COMPLIANCE |
| required_attendees | COMPLIANCE / DATA / VOC |
| 建议标题 | `[VOC Batch 1] 外部社区政策、PII、主键和字段证据确认` |
| 会议目标 | 确认 Reddit / BabyCenter / Mumsnet 平台政策、PII 禁用项、post/comment 主键、字段和刷新候选 |
| 会前材料 | `VOC-BATCH1-HANDOFF-001` 外部 VOC 交接卡，`VOC-BATCH1-RESPONSE-001` COMPLIANCE / DATA / VOC 回复模板 |
| response_deadline_rule | 会前 1 个工作日提交可填项；会议后 1 个工作日补齐 blocker |
| forbidden_attachments | 外部完整原文、URL 批量列表、未匿名用户 ID、未脱敏截图、SQL、DQ |
| status_to_preserve | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |

| evidence_item_id | primary_owner_role | 会前请求 | 附件策略 | 禁止 |
|---|---|---|---|---|
| `VOC-EVIDENCE-B1-EXT-POLICY-001` | COMPLIANCE | 逐平台说明保存、展示、回溯和限制条件 | metadata-only | 把平台目录当授权 |
| `VOC-EVIDENCE-B1-EXT-PII-001` | COMPLIANCE | 明确 URL、用户名、用户 ID、截图、原文处理规则 | metadata-only / desensitized-excerpt | 完整原文、URL 批量列表、未匿名用户 ID |
| `VOC-EVIDENCE-B1-EXT-PK-001` | DATA | post/comment 主键、去重规则、join 风险 | metadata-only | 只给字段名不说明唯一性 |
| `VOC-EVIDENCE-B1-EXT-FIELD-001` | DATA / VOC | 字段清单、主题、情绪、语言、平台字段 | metadata-only | 业务动作字段 |
| `VOC-EVIDENCE-B1-EXT-FRESH-001` | DATA | 采集批次、刷新频率、历史回溯、时区 | metadata-only | 实时可用承诺 |

## 6. 邀请 2：VOC 标签字典

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-TAG-001` |
| meeting_id | `VOC-MEETING-B1-TAG-001` |
| target_source_asset | `dim_voc_tag` |
| target_ledger_id | `VOC-SIGNOFF-P0-012` |
| primary_owner_role | VOC |
| required_attendees | VOC / PRODUCT / DATA |
| 建议标题 | `[VOC Batch 1] 标签字典 Owner、层级、主键和人审样本确认` |
| 会议目标 | 明确标签 Owner、版本、`tag_l2` / `tag_l3` / `tag_localized`、主键、生效时间和人审样本 hash |
| 会前材料 | `VOC-BATCH1-HANDOFF-001` 标签交接卡，`VOC-BATCH1-RESPONSE-001` VOC / PRODUCT / DATA 回复模板 |
| response_deadline_rule | 会前 1 个工作日提交标签字段和样本规则；会议后 1 个工作日补齐 Owner 路由 |
| forbidden_attachments | 未授权原文、产品改版动作、渠道动作、库存动作、SQL、DQ |
| status_to_preserve | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |

| evidence_item_id | primary_owner_role | 会前请求 | 附件策略 | 禁止 |
|---|---|---|---|---|
| `VOC-EVIDENCE-B1-TAG-SOURCE-001` | VOC | 标签 Owner、版本、适用范围、停用规则 | metadata-only | 无 Owner 静态表 |
| `VOC-EVIDENCE-B1-TAG-FIELD-001` | VOC / PRODUCT | 标签层级、本土化字段、冲突处理 | metadata-only | 用标签直接写产品动作 |
| `VOC-EVIDENCE-B1-TAG-PK-001` | DATA / VOC | `tag_id`、版本、生效时间、唯一性 | metadata-only | 无版本冲突说明 |
| `VOC-EVIDENCE-B1-TAG-SAMPLE-001` | VOC | 人审样本、冲突样本、不可映射样本 hash 规则 | sample-hash | 未授权原文 |

## 7. 邀请 3：内部 VOC 聚合指标

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-METRIC-001` |
| meeting_id | `VOC-MEETING-B1-INTERNAL-METRIC-001` |
| target_source_asset | `fact_voc_summary` |
| target_ledger_id | `VOC-SIGNOFF-P0-004` |
| primary_owner_role | DATA |
| required_attendees | DATA / BI / VOC |
| 建议标题 | `[VOC Batch 1] 内部 VOC 聚合指标、分母口径和 BI 关系确认` |
| 会议目标 | 确认唯一粒度、`sales_qty`、`voc_rate`、评分、评论分母、dws / ads / BI 关系和刷新分区 |
| 会前材料 | `VOC-BATCH1-HANDOFF-001` 聚合指标交接卡，`VOC-BATCH1-RESPONSE-001` DATA / BI / VOC 回复模板 |
| response_deadline_rule | 会前 1 个工作日提交字段和 BI 冲突清单；会议后 1 个工作日补齐 blocker |
| forbidden_attachments | KPI 发布稿、覆盖存量 BI 的结论、SQL、DQ、生产可用承诺 |
| status_to_preserve | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |

| evidence_item_id | primary_owner_role | 会前请求 | 附件策略 | 禁止 |
|---|---|---|---|---|
| `VOC-EVIDENCE-B1-METRIC-PK-001` | DATA | 渠道×国家×SPU×月唯一粒度和 join 风险 | metadata-only | 只写“按月汇总” |
| `VOC-EVIDENCE-B1-METRIC-FIELD-001` | DATA / BI | `sales_qty`、`voc_rate`、评分、评论分母来源 | metadata-only | 业务 KPI 承诺 |
| `VOC-EVIDENCE-B1-METRIC-BI-001` | BI | 与 dws / ads / 存量 BI 的关系 | metadata-only | 直接覆盖存量 BI |
| `VOC-EVIDENCE-B1-METRIC-FRESH-001` | DATA | 刷新频率、月分区、历史回溯、时区 | metadata-only | 新鲜度已达标声明 |

## 8. 邀请 4：内部 VOC 明细

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-DETAIL-001` |
| meeting_id | `VOC-MEETING-B1-INTERNAL-DETAIL-001` |
| target_source_asset | `dwd_voc_record_detail_full` |
| target_ledger_id | `VOC-SIGNOFF-P0-001` |
| primary_owner_role | DATA |
| required_attendees | DATA / VOC / SERVICE / COMPLIANCE |
| 建议标题 | `[VOC Batch 1] 内部 VOC 明细主表、PII 和服务样本边界确认` |
| 会议目标 | 明确真实表名候选、明细主键、VOC 字段、PII 边界和服务样本用途 |
| 会前材料 | `VOC-BATCH1-HANDOFF-001` 内部明细交接卡，`VOC-BATCH1-RESPONSE-001` DATA / VOC / SERVICE / COMPLIANCE 回复模板 |
| response_deadline_rule | 会前 1 个工作日提交表名、主键、字段和 PII 初稿；会议后 1 个工作日补齐样本边界 |
| forbidden_attachments | 完整原文、订单号、真实用户标识、未脱敏截图、责任归因、SQL、DQ |
| status_to_preserve | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |

| evidence_item_id | primary_owner_role | 会前请求 | 附件策略 | 禁止 |
|---|---|---|---|---|
| `VOC-EVIDENCE-B1-DETAIL-SOURCE-001` | DATA | 真实表名、Owner、是否主明细 | metadata-only | 没有 Owner 的表名 |
| `VOC-EVIDENCE-B1-DETAIL-PK-001` | DATA | 明细主键、日期口径、重复规则 | metadata-only | 只给业务描述 |
| `VOC-EVIDENCE-B1-DETAIL-FIELD-001` | DATA / VOC | VOC 类型、标签、情绪、来源枚举 | metadata-only | 责任归因字段 |
| `VOC-EVIDENCE-B1-DETAIL-PII-001` | COMPLIANCE | 内部原文、用户标识、订单号、截图和脱敏规则 | metadata-only / desensitized-excerpt | 完整原文、订单号、真实用户标识 |
| `VOC-EVIDENCE-B1-DETAIL-SERVICE-001` | SERVICE | 服务体验样本只作线索或复核的范围 | sample-hash / aggregate-only | 直接责任归因 |

## 9. 邀请 5：Review 明细

| 字段 | 内容 |
|---|---|
| invite_id | `VOC-INVITE-B1-REVIEW-001` |
| meeting_id | `VOC-MEETING-B1-REVIEW-001` |
| target_source_asset | `ods_review_detail` |
| target_ledger_id | `VOC-SIGNOFF-P0-005` |
| primary_owner_role | DATA |
| required_attendees | DATA / VOC / SERVICE / COMPLIANCE |
| 建议标题 | `[VOC Batch 1] Review 明细主键、评分字段、样本 hash 和 PII 边界确认` |
| 会议目标 | 明确真实表名、review_id 唯一性、评分字段、评论日期、样本 hash 和 PII 边界 |
| 会前材料 | `VOC-BATCH1-HANDOFF-001` Review 交接卡，`VOC-BATCH1-RESPONSE-001` DATA / VOC / SERVICE / COMPLIANCE 回复模板 |
| response_deadline_rule | 会前 1 个工作日提交 source / pk / field 初稿；会议后 1 个工作日补齐 sample / pii |
| forbidden_attachments | 完整 review、URL 批量列表、真实用户 ID、评分业务结论、责任归因、SQL、DQ |
| status_to_preserve | `not-held` / `not-received` / `not-started` / `not-created` / `blocked` / `unsigned` / `dq_readiness_status = blocked` / `sql_allowed = no` |

| evidence_item_id | primary_owner_role | 会前请求 | 附件策略 | 禁止 |
|---|---|---|---|---|
| `VOC-EVIDENCE-B1-REVIEW-SOURCE-001` | DATA | 真实表名、Owner、渠道范围 | metadata-only | 无 Owner 来源 |
| `VOC-EVIDENCE-B1-REVIEW-PK-001` | DATA | review_id 唯一性或联合主键、重复规则 | metadata-only | 只给 review_id |
| `VOC-EVIDENCE-B1-REVIEW-FIELD-001` | DATA / VOC | 评分范围、评论日期、追评和空值规则 | metadata-only | 评分业务结论 |
| `VOC-EVIDENCE-B1-REVIEW-SAMPLE-001` | VOC / SERVICE | 20 条评论样本 hash 规则和覆盖维度 | sample-hash | 完整 review、URL 批量列表、真实用户 ID |
| `VOC-EVIDENCE-B1-REVIEW-PII-001` | COMPLIANCE | review URL、用户名、原文展示限制和脱敏规则 | metadata-only / desensitized-excerpt | 未脱敏截图、完整原文 |

## 10. 通用邀请正文模板

以下正文可复制到每个会议邀请。发送前必须替换方括号字段。

```text
主题：[建议标题]

本次会议只处理 [target_source_asset] 的 Batch 1 来源签收前置证据，不讨论 SQL、DQ 执行、业务动作或生产上线。

请各 Owner 在会前 1 个工作日，按 `VOC-BATCH1-RESPONSE-001` 回复模板填写本会议对应 evidence item：
[evidence_item_id list]

请勿附带完整原文、URL 批量列表、真实用户标识、未脱敏截图、SQL、DQ 脚本、市场规模、渠道动作、库存动作、产品改版动作或责任归因材料。

会议目标：
[meeting objective]

会前材料：
- `VOC-BATCH1-HANDOFF-001`
- `VOC-BATCH1-RESPONSE-001`
- 本会议 evidence item 清单
- No-Go 动作清单

状态边界：
本会议邀请不改变 `meeting_execution_status = not-held`、`receive_status = not-received`、`review_status = not-started`、`update_request_status = not-created`、`owner_status = unsigned`、`dq_readiness_status = blocked`、`sql_allowed = no`。
```

## 11. 会前检查清单

| check_id | 检查项 | 通过标准 | 不通过处理 |
|---|---|---|---|
| `VOC-INVITE-CHECK-001` | meeting_id 是否为 Batch 1 五个会议之一 | 匹配 5 个 ID | 不发送 |
| `VOC-INVITE-CHECK-002` | evidence item 是否来自 23 条登记槽位 | 全部匹配 | 移除新增 evidence |
| `VOC-INVITE-CHECK-003` | Owner role 是否明确 | primary 和 required_attendees 均明确 | 补 Owner 路由 |
| `VOC-INVITE-CHECK-004` | 是否附带 response template | 引用 `VOC-BATCH1-RESPONSE-001` | 补会前材料 |
| `VOC-INVITE-CHECK-005` | 是否写明 forbidden attachments | 明确完整原文、URL 批量列表、用户标识、未脱敏截图、SQL、DQ 禁止 | 补 No-Go |
| `VOC-INVITE-CHECK-006` | 是否声明状态不迁移 | 保留 not-held / not-received / blocked / sql_allowed no | 不发送 |

## 12. 回复截止和升级规则

| 事件 | 截止规则 | 未满足处理 |
|---|---|---|
| 会前初稿 | 会前 1 个工作日 | 标记为 `owner-missing` 或 `date-missing`，但不改 evidence 状态 |
| 会后补证 | 会后 1 个工作日 | 记录 remaining blocker，保持 `receive_status = not-received` |
| 合规审查 | 涉及 PII / policy 的会议必须由 COMPLIANCE 回复 | 缺 COMPLIANCE 时不进入 review gate |
| BI 冲突 | `fact_voc_summary` 指标冲突必须由 BI 明确并列、替代、冲突或待映射 | 缺 BI 时保持 blocker |
| 样本安全 | 样本只接受 sample-hash、脱敏摘录或聚合范围 | 含 forbidden content 时退回 |
| SQL / DQ 请求 | 任一 Owner 要求直接写 SQL 或 DQ | 拒绝，保持 `sql_allowed = no` 和 `dq_readiness_status = blocked` |

## 13. 状态保留表

| 状态字段 | 本邀请包创建后必须保持 | 原因 |
|---|---|---|
| `meeting_invite_status` | draft | 本文只创建邀请草稿 |
| `meeting_execution_status` | not-held | 未发生真实会议 |
| `receive_status` | not-received | 未收到真实 Owner 回复 |
| `review_status` | not-started | 未执行 evidence review |
| `update_request_status` | not-created | 未生成回填建议 |
| `apply_allowed` | no | 未获回填审批 |
| `source_status` | blocked | 未完成真实来源签收 |
| `owner_status` | unsigned | 缺少 `signoff_id`、Owner、日期和签收范围 |
| `dq_readiness_status` | blocked | 缺少完整证据链和 DQ readiness 审查 |
| `sql_allowed` | no | 未完成 SQL 准入审批 |

## 14. No-Go 动作

本阶段明确禁止：

- 不进入 `sql/`。
- 不写生产 SQL。
- 不写伪 SQL。
- 不创建 DQ 执行脚本。
- 不创建源表抽取脚本。
- 不连接数据库。
- 不修改 `VOC-SIGNOFF-001`。
- 不声明任何 P0 来源已签收。
- 不声明任何 P0 来源已生产可用。
- 不把邀请包当作邀请已发送。
- 不把邀请发送当作会议已执行。
- 不把 Owner 参会确认当作 Owner 已回复。
- 不把 Owner 回复模板当作 evidence 已接收。
- 不把 `receive_status = accepted` 当作 `owner_status = signed`。
- 不把 `review_status = accepted` 当作 `owner_status = signed`。
- 不把 `candidate-only` 当作 `signed`。
- 不把 `requested-only` 当作 `approved`。
- 不把 `draft-only` 当作 `sample_policy_status = signed`。
- 不把 `blocker-only` 当作 `dq_readiness_status = ready`。
- 不把 Batch 1 当作 Green 候选。
- 不展示完整原文、URL 批量列表、用户标识或未脱敏截图。
- 不输出市场规模、预算、渠道动作、投放动作、库存动作、产品改版动作、竞品排名、转化优势或责任归因。

## 15. 下一步

下一步建议创建 `VOC-BATCH1-MEETING-RUNBOOK-001` Batch 1 Owner meeting execution runbook 草稿。

建议文件：

- `drafts/analysis/voc-topic-batch1-owner-meeting-execution-runbook-draft-20260604.md`

该文件应把 5 个会议邀请转成会议执行当天的主持流程、纪要字段、证据收集检查点、退回规则和会后状态冻结规则。未完成真实 Owner 会议、真实回复、evidence review 和回填审批前，不进入 `sql/`，不写生产 SQL，不创建 DQ 执行脚本。
