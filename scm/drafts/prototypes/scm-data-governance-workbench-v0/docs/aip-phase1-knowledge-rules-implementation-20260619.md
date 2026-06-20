---
title: "AIP Phase 1 Knowledge Rules And Semantic Governance Implementation"
status: "implemented_local_p3a_extended"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "Batch 4 knowledge rule governance, ChatBI answerability and AI evidence export for SCM AIP workbench"
boundary: "local prototype implementation only; no Tencent Cloud deployment in this section; no provider call; no ERP/Jijia/WMS/TMS writeback"
---

# AIP Phase 1 Knowledge Rules And Semantic Governance Implementation

## Summary

Batch 4 upgrades the AI knowledge base from searchable evidence into governable rule assets.

Implemented locally:

- `knowledge_rules` and `knowledge_rule_conflicts` SQLite tables.
- Knowledge card -> rule candidate creation.
- Rule target inference for object, metric and dimension bindings.
- Same target/condition conflict detection.
- Rule review workflow through existing workflow ledger.
- Rule-triggered `recommendation_cards` with `scenario_type=knowledge_rule_trigger`.
- JSON/Excel export for `knowledge-rules`.
- ChatBI answerability summary fields.
- AI answer evidence JSON/Markdown export.
- AI knowledge UI rule workbench and Browser Harness DOM checks.
- P3-A certification lifecycle and ChatBI certified-rule runtime gate explanation.
- Empty-ledger startup seed for three certified local governance demo rules.

The implementation keeps source knowledge cards read-only. Rules are separate governance assets and must still be reviewed by an owner before being treated as certified semantics.

## Data Model

New migration:

- `scripts/migrations/008_knowledge_rules.sql`

New tables:

- `knowledge_rules`
- `knowledge_rule_conflicts`

Key fields:

- `source_card_id`
- `source_domain_id`
- `rule_code`
- `rule_type`
- `target_object_type`
- `target_metric_ids`
- `target_dimension_ids`
- `condition_expression`
- `action_template`
- `evidence_refs`
- `conflict_key`
- `conflict_status`
- `lifecycle_status`
- `workflow_id`
- `certified_at`
- `deprecated_at`
- `certification_policy`
- `runtime_gate_status`

## API

Implemented locally:

- `GET /api/knowledge-rules/summary`
- `GET /api/knowledge-rules`
- `POST /api/knowledge-rules`
- `POST /api/knowledge-rules/:id/review`
- `GET /api/knowledge-rules/:id`
- `POST /api/knowledge-rules/:id/certify`
- `POST /api/knowledge-rules/:id/deprecate`
- `POST /api/knowledge-rules/:id/run`
- `GET /api/export/knowledge-rules?format=json`
- `GET /api/export/knowledge-rules?format=excel`
- `GET /api/ai-chat/messages/:messageId/evidence-export?format=json`
- `GET /api/ai-chat/messages/:messageId/evidence-export?format=markdown`

Boundary:

- provider calls are false;
- ERP/Jijia writeback is false;
- rule run only creates a local recommendation card and workflow/audit records.

## UI

AI 知识库工作台新增：

- `.knowledgeRulesWorkbench`
- `.knowledgeRuleSummaryGrid`
- `.knowledgeRuleCard`
- `.knowledgeRuleExportActions`
- `.createKnowledgeRuleButton`

ChatBI 语义治理台新增：

- `.chatbiAnswerabilityPanel`
- `.answerabilityMiniGrid`
- `.certifiedRuleCoverage`
- `.answerabilityGapReasons`

AI 知识库规则治理新增：

- `.knowledgeRuleCertificationControls`
- runtime gate status badge
- certified/deprecated timestamp fields

AI 对话结果新增：

- `.aiEvidenceExportActions`

## Verification

Verified locally at: `2026-06-19`.

Command:

```bash
REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Workflow smoke covered:

- `chatbiSummary.answerabilityGovernance`
- `aiChat.evidenceExportJson`
- `aiChat.evidenceExportMarkdown`
- `knowledgeRule.createFromCard`
- `knowledgeRule.review`
- `knowledgeRule.triggerRecommendation`
- `knowledgeRule.exportJson`
- `knowledgeRule.exportExcel`

Browser Harness covered:

- ChatBI answerability panel and cards.
- AI knowledge rule workbench.
- Rule summary cards.
- Rule JSON/Excel export links.
- Knowledge-card create-rule buttons.
- all 13 modules at `1350x900`, `1024x900`, `768x900`, `390x900`.

P3-A local verification added:

```bash
SCM_WORKBENCH_URL=http://127.0.0.1:5174 npm run smoke:workflows
REQUIRE_WORKBENCH_OPERATIONS=1 REQUIRE_KB_GOVERNANCE=1 REQUIRE_AI_FEEDBACK=1 REQUIRE_AIP_PHASE1=1 REQUIRE_AIP_SCENARIOS=1 SCM_WORKBENCH_URL=http://127.0.0.1:5174 npm run smoke:browser
```

P3-A smoke evidence:

- `chatbiAnswerability.certifiedRuleCoverage`
- `chatbi.dryRunCertifiedRuleLinked`
- `knowledgeRule.certify`
- `knowledgeRule.detail`
- `knowledgeRule.deprecate`
- Browser Harness `.knowledgeRuleCertificationControls`, `.certifiedRuleCoverage`, `.answerabilityGapReasons`
- temporary empty-rule SQLite startup returned `total=3`, `certified=3` and `runtime_gate_status=chatbi_runtime_candidate`

## Remaining Gaps

Not claimed as complete:

- Rule inference is heuristic and seed-backed; owner review is still required.
- Rule certification now drives ChatBI dry-run runtime gate explanation, but it is still a local governance policy and does not execute source-system rules.
- Startup seed rules are demo governance assets only and require owner review before business use.
- Provider integration remains off.
- Role-specific workbenches are still Batch 5.
- Public site has not been deployed in this pass.
