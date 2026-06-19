---
title: "P2 Semantic Operations Implementation"
status: "draft"
created_at: "2026-06-19"
updated_at: "2026-06-19"
scope: "ChatBI answerability scorecard and AI evidence export registry"
boundary: "local SQLite governance ledger only; no provider call; no ERP/Jijia writeback"
---

# P2 Semantic Operations Implementation

## 1. Implemented Scope

This batch closes the operational layer behind two remaining P2 items:

- `SCM-PRD-P2-006 / AIP-B4-001`: ChatBI answerability scorecard.
- `SCM-PRD-P2-008 / AIP-B4-002`: AI evidence export registry.

The implementation does not change Metric Dictionary 2.0 canonical definitions. It aggregates existing `chatbi_contexts`, `ai_chat_messages`, and `ai_retrieval_evidence` into governance views.

## 2. API Surface

| API | Purpose | Boundary |
|---|---|---|
| `GET /api/chatbi/answerability-scorecard` | Returns certification coverage, average score, answerability buckets, L1 domain coverage and weak-context queue | `providerCalls=false`, `erpWriteback=false` |
| `GET /api/ai-chat/evidence-exports` | Returns cross-message evidence export registry with JSON/Markdown export URLs | local evidence package only |
| `GET /api/ai-chat/messages/:messageId/evidence-export?format=json` | Exports one assistant message evidence package as JSON | no provider call |
| `GET /api/ai-chat/messages/:messageId/evidence-export?format=markdown` | Exports one assistant message evidence package as Markdown | no provider call |

## 3. UI Surface

| Page | New Surface | Purpose |
|---|---|---|
| ChatBI 语义治理台 | `.chatbiScorecardPanel` | Management scorecard for certified coverage, score, weak contexts and evidence count |
| ChatBI 语义治理台 | `.answerabilityDomainGrid` | L1 domain coverage by contexts, certified contexts, weak contexts and evidence count |
| ChatBI 语义治理台 | `.answerabilityWeakQueue` | Weak evidence/refusal queue for owner review |
| AI 对话 | `.aiEvidenceExportRegistry` | Cross-message evidence export registry with JSON/Markdown links |

## 4. Acceptance

Local acceptance is covered by:

```bash
npm run check
npm run build
SCM_SKIP_PUBLIC_BROWSER_SMOKE=1 npm run smoke:p0
```

Public acceptance after deployment should include:

```bash
SCM_WORKBENCH_URL=https://scm.lute-tlz-dddd.top/ REQUIRE_AI_FEEDBACK=1 npm run smoke:browser
curl -fsS https://scm.lute-tlz-dddd.top/api/chatbi/answerability-scorecard
curl -fsS https://scm.lute-tlz-dddd.top/api/ai-chat/evidence-exports
```

## 5. Non-Goals

- No external DeepSeek/Kimi provider call.
- No NL2SQL against raw tables.
- No ERP/Jijia write-back.
- No direct mutation of canonical ontology or Metric Dictionary 2.0.
