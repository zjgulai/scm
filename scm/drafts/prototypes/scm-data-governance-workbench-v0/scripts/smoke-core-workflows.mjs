const baseUrl = process.env.SCM_WORKBENCH_URL || "http://127.0.0.1:5174";
const allowRemoteWrites = process.env.ALLOW_LEDGER_WRITE_SMOKE === "1";
const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(baseUrl);

if (!isLocal && !allowRemoteWrites) {
  throw new Error(
    `Refusing ledger write smoke against non-local URL: ${baseUrl}. ` +
      "Set ALLOW_LEDGER_WRITE_SMOKE=1 only for an explicitly authorized staging target."
  );
}

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    throw new Error(`${init.method || "GET"} ${path} failed: ${response.status} ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function requestRaw(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${init.method || "GET"} ${path} failed: ${response.status} ${text.slice(0, 200)}`);
  }
  return { response, text };
}

function assert(condition, message, detail) {
  if (!condition) {
    const suffix = detail ? ` ${JSON.stringify(detail)}` : "";
    throw new Error(`${message}${suffix}`);
  }
}

const health = await request("/api/deploy/health");
assert(health.ok === true, "deploy health is not ok", health);
assert(health.boundary?.providerCalls === false, "provider call boundary changed", health.boundary);
assert(health.boundary?.erpWriteback === false, "ERP writeback boundary changed", health.boundary);
assert(health.database?.aipPhase1?.schemaReady === true, "AIP Phase 1 schema is not ready", health.database?.aipPhase1);
assert(health.database?.aipPhase1?.providerCalls === false, "AIP provider boundary changed", health.database?.aipPhase1);
assert(health.database?.aipPhase1?.erpWriteback === false, "AIP ERP writeback boundary changed", health.database?.aipPhase1);

const modules = await request("/api/workbench/modules");
assert(Array.isArray(modules) && modules.length === 13, "expected 13 workbench modules", { count: modules.length });
assert(modules.some((module) => module.id === "audit-log"), "audit log workbench module missing", modules);
assert(modules[0]?.id === "overview" && modules[1]?.id === "ai-chat", "AI chat should be directly below overview", modules.slice(0, 4));

const overviewExport = await request("/api/export/overview?format=json");
assert(overviewExport.boundary?.mode === "read_only_export", "JSON export is not read-only", overviewExport.boundary);
assert(overviewExport.boundary?.importAllowed === false, "JSON export unexpectedly allows import", overviewExport.boundary);
assert(overviewExport.payload?.overview?.counts?.metrics >= 1, "JSON export missing overview metrics", overviewExport.payload);

const excelExport = await requestRaw("/api/export/kpi-system?format=excel");
assert(
  excelExport.response.headers.get("content-type")?.includes("application/vnd.ms-excel"),
  "Excel export content type is wrong",
  { contentType: excelExport.response.headers.get("content-type") }
);
assert(excelExport.text.includes("<table") && excelExport.text.includes("SCM Governance Export"), "Excel export missing table markup");

const canvasNodes = await request("/api/kpi-canvas/nodes?limit=20");
assert(Array.isArray(canvasNodes) && canvasNodes.length > 0, "KPI canvas nodes are not available");

const firstCanvasNode = canvasNodes[0];
const updatedCanvasNode = await request(`/api/kpi-canvas/nodes/${firstCanvasNode.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    x: Number(firstCanvasNode.x || 0) + 1,
    y: Number(firstCanvasNode.y || 0) + 1,
    layoutVersion: "p0-smoke-layout",
    actor: "p0_smoke"
  })
});
assert(updatedCanvasNode.node?.layout_version === "p0-smoke-layout", "KPI canvas node update failed", updatedCanvasNode);

const assetType = "metric";
const assetId = "smoke_metric_business_available_qty";
const stamp = new Date().toISOString();

const annotation = await request(`/api/ledger/${assetType}/${assetId}/annotations`, {
  method: "POST",
  body: JSON.stringify({
    title: `Smoke annotation ${stamp}`,
    body: "P0 smoke validates annotation create/update without touching canonical metric data.",
    annotationType: "smoke",
    createdBy: "p0_smoke"
  })
});
assert(annotation.annotation?.id, "annotation was not created", annotation);

const updatedAnnotation = await request(`/api/ledger/annotations/${annotation.annotation.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "archived",
    body: "P0 smoke archived this annotation after create/update validation.",
    actor: "p0_smoke"
  })
});
assert(updatedAnnotation.annotation?.status === "archived", "annotation update failed", updatedAnnotation);

const comment = await request(`/api/ledger/${assetType}/${assetId}/comments`, {
  method: "POST",
  body: JSON.stringify({
    body: `P0 smoke comment ${stamp}`,
    createdBy: "p0_smoke"
  })
});
assert(comment.comment?.id, "comment was not created", comment);

const updatedComment = await request(`/api/ledger/comments/${comment.comment.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "archived",
    body: "P0 smoke archived this comment after create/update validation.",
    actor: "p0_smoke"
  })
});
assert(updatedComment.comment?.status === "archived", "comment update failed", updatedComment);

const proposal = await request("/api/revision-proposals", {
  method: "POST",
  body: JSON.stringify({
    assetType,
    assetId,
    proposalType: "definition_note",
    currentValue: "smoke-current",
    proposedValue: { smoke: true, createdAt: stamp },
    reason: "P0 smoke validates revision proposal create/review workflow.",
    evidenceRefs: [{ type: "smoke", ref: "scripts/smoke-core-workflows.mjs" }],
    createdBy: "p0_smoke"
  })
});
assert(proposal.proposal?.id, "revision proposal was not created", proposal);

const reviewedProposal = await request(`/api/revision-proposals/${proposal.proposal.id}/review`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "rejected",
    reviewer: "p0_smoke",
    reviewNote: "Smoke proposal reviewed and rejected to avoid canonical changes."
  })
});
assert(reviewedProposal.proposal?.status === "rejected", "revision proposal review failed", reviewedProposal);

const metricCandidate = await request("/api/governance/candidates", {
  method: "POST",
  body: JSON.stringify({
    candidateType: "metric",
    candidateCode: `smoke_candidate_metric_${Date.now()}`,
    candidateName: "Smoke candidate metric",
    targetAssetType: "metric",
    targetAssetId: assetId,
    proposalSummary: "P1 smoke validates metric candidate create/review and workflow linkage.",
    proposedPayload: {
      formula: "smoke_numerator / smoke_denominator",
      grain: "SKU x warehouse x date",
      direction: "higher_is_better"
    },
    sourceRef: "scripts/smoke-core-workflows.mjs",
    evidenceRefs: [{ type: "smoke", ref: "scripts/smoke-core-workflows.mjs" }],
    owner: "p1_smoke",
    priority: "P1",
    createdBy: "p1_smoke"
  })
});
assert(metricCandidate.candidate?.id, "governance candidate was not created", metricCandidate);
assert(metricCandidate.candidate?.workflow_id, "candidate workflow was not created", metricCandidate);

const reviewedCandidate = await request(`/api/governance/candidates/${metricCandidate.candidate.id}/review`, {
  method: "POST",
  body: JSON.stringify({
    status: "approved",
    reviewer: "p1_smoke",
    reviewNote: "Smoke candidate approved without writing canonical metric table."
  })
});
assert(reviewedCandidate.candidate?.lifecycle_status === "approved", "candidate review failed", reviewedCandidate);

const workflows = await request("/api/workflows?limit=20");
assert(Array.isArray(workflows) && workflows.some((workflow) => workflow.id === metricCandidate.candidate.workflow_id), "workflow board missing candidate workflow", workflows);

const workflowSummary = await request("/api/workflows/summary");
assert(workflowSummary.candidates?.total >= 1, "workflow summary missing candidate counts", workflowSummary);
assert(Array.isArray(workflowSummary.bySla), "workflow summary missing SLA buckets", workflowSummary);

const bulkCandidate = await request("/api/governance/candidates", {
  method: "POST",
  body: JSON.stringify({
    candidateType: "tag",
    candidateCode: `smoke_bulk_tag_${Date.now()}`,
    candidateName: "Smoke bulk review tag",
    targetAssetType: "ontology_object",
    targetAssetId: "sku",
    proposalSummary: "P1 smoke validates workflow filter, SLA enrichment and bulk review.",
    proposedPayload: {
      tag_type: "rule",
      target_object_id: "sku",
      rule_expression: "smoke = true"
    },
    sourceRef: "scripts/smoke-core-workflows.mjs",
    evidenceRefs: [{ type: "smoke", ref: "scripts/smoke-core-workflows.mjs" }],
    owner: "p1_bulk_smoke",
    priority: "P1",
    createdBy: "p1_bulk_smoke"
  })
});
assert(bulkCandidate.candidate?.workflow_id, "bulk candidate workflow was not created", bulkCandidate);

const filteredWorkflows = await request(`/api/workflows?owner=p1_bulk_smoke&moduleId=tags&priority=P1&q=${encodeURIComponent("Smoke bulk")}&limit=20`);
assert(
  Array.isArray(filteredWorkflows) && filteredWorkflows.some((workflow) => workflow.id === bulkCandidate.candidate.workflow_id),
  "workflow filters did not find bulk smoke workflow",
  filteredWorkflows
);
assert(filteredWorkflows.every((workflow) => workflow.sla_status), "workflow SLA enrichment missing", filteredWorkflows);

const bulkReview = await request("/api/workflows/bulk-review", {
  method: "POST",
  body: JSON.stringify({
    ids: [bulkCandidate.candidate.workflow_id],
    status: "rejected",
    reviewer: "p1_bulk_smoke",
    note: "Smoke bulk review rejected this candidate to avoid canonical changes."
  })
});
assert(bulkReview.updated === 1, "workflow bulk review failed", bulkReview);

const workbenchOperation = await request("/api/workbench/operations", {
  method: "POST",
  body: JSON.stringify({
    moduleId: "tags",
    operationType: "rule_publish_request",
    targetAssetType: "tag",
    targetAssetIds: ["sku", "warehouse"],
    operationTitle: `P1 smoke workbench operation ${Date.now()}`,
    operationSummary: "P1 smoke validates module operation create, workflow linkage and ledger-only review.",
    operationPayload: {
      rule_version: "smoke-v1",
      publish_policy: "review_before_canonical_write"
    },
    owner: "p1_ops_smoke",
    priority: "P1",
    createdBy: "p1_ops_smoke"
  })
});
assert(workbenchOperation.operation?.id, "workbench operation was not created", workbenchOperation);
assert(workbenchOperation.operation?.workflow_id, "workbench operation workflow was not created", workbenchOperation);

const filteredOperations = await request(`/api/workbench/operations?moduleId=tags&operationType=rule_publish_request&owner=p1_ops_smoke&q=${encodeURIComponent("P1 smoke workbench")}`);
assert(
  Array.isArray(filteredOperations) && filteredOperations.some((operation) => operation.id === workbenchOperation.operation.id),
  "workbench operation filters did not find smoke operation",
  filteredOperations
);

const reviewedOperation = await request(`/api/workbench/operations/${workbenchOperation.operation.id}/review`, {
  method: "POST",
  body: JSON.stringify({
    status: "approved",
    reviewer: "p1_ops_smoke",
    reviewNote: "Smoke approves the workbench operation without canonical table writes."
  })
});
assert(reviewedOperation.operation?.status === "approved", "workbench operation review failed", reviewedOperation);

const bulkOperation = await request("/api/workbench/operations", {
  method: "POST",
  body: JSON.stringify({
    moduleId: "dimensions",
    operationType: "compatibility_check",
    targetAssetType: "dimension",
    targetAssetIds: "warehouse,sku",
    operationTitle: `P1 smoke bulk operation ${Date.now()}`,
    operationSummary: "P1 smoke validates workbench operation bulk review.",
    operationPayload: {
      matrix: "metric_dimension",
      conflict_policy: "review_required"
    },
    owner: "p1_ops_bulk_smoke",
    priority: "P1",
    createdBy: "p1_ops_bulk_smoke"
  })
});
assert(bulkOperation.operation?.id, "bulk workbench operation was not created", bulkOperation);

const bulkOperationReview = await request("/api/workbench/operations/bulk-review", {
  method: "POST",
  body: JSON.stringify({
    ids: [bulkOperation.operation.id],
    status: "rejected",
    reviewer: "p1_ops_bulk_smoke",
    note: "Smoke rejects bulk workbench operation to keep canonical assets unchanged."
  })
});
assert(bulkOperationReview.updated === 1, "workbench operation bulk review failed", bulkOperationReview);

const operationSummary = await request("/api/workbench/operations/summary");
assert(operationSummary.total >= 2, "workbench operation summary missing smoke operations", operationSummary);

const qualityRule = await request("/api/quality/rules", {
  method: "POST",
  body: JSON.stringify({
    ruleCode: `SMOKE_RULE_${Date.now()}`,
    ruleName: "P0 smoke quality rule",
    assetType: "metric",
    assetId,
    severity: "low",
    ruleExpression: "available_qty >= 0 OR has_business_exception = true",
    expectedBehavior: "Negative available inventory must carry a business exception reason.",
    owner: "p0_smoke",
    actor: "p0_smoke"
  })
});
assert(qualityRule.rule?.id, "quality rule was not created", qualityRule);

const reviewedQualityRule = await request(`/api/quality/rules/${qualityRule.rule.id}/review`, {
  method: "POST",
  body: JSON.stringify({
    status: "reviewed",
    reviewer: "p0_smoke",
    note: "Smoke validates rule review lifecycle."
  })
});
assert(reviewedQualityRule.rule?.lifecycle_status === "reviewed", "quality rule review failed", reviewedQualityRule);

const passedQualityRun = await request(`/api/quality/rules/${qualityRule.rule.id}/run`, {
  method: "POST",
  body: JSON.stringify({
    result: "pass",
    actor: "p0_smoke"
  })
});
assert(passedQualityRun.result === "pass", "quality rule pass run failed", passedQualityRun);

const failedQualityRun = await request(`/api/quality/rules/${qualityRule.rule.id}/run`, {
  method: "POST",
  body: JSON.stringify({
    result: "issue",
    issueTitle: "P0 smoke generated issue from rule execution",
    issueDetail: "Synthetic issue generated by rule execution smoke.",
    actor: "p0_smoke"
  })
});
assert(failedQualityRun.issue?.id, "quality rule issue run failed", failedQualityRun);

const qualityIssue = await request("/api/quality/issues", {
  method: "POST",
  body: JSON.stringify({
    ruleId: qualityRule.rule.id,
    assetType: "metric",
    assetId,
    issueTitle: "P0 smoke quality issue",
    issueDetail: "Synthetic issue used to validate quality issue lifecycle.",
    severity: "low",
    owner: "p0_smoke",
    evidence: [{ type: "smoke", ref: "scripts/smoke-core-workflows.mjs" }],
    actor: "p0_smoke"
  })
});
assert(qualityIssue.issue?.id, "quality issue was not created", qualityIssue);

const closedQualityIssue = await request(`/api/quality/issues/${qualityIssue.issue.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "closed",
    actor: "p0_smoke"
  })
});
assert(closedQualityIssue.issue?.status === "closed", "quality issue close failed", closedQualityIssue);

const closedRunIssue = await request(`/api/quality/issues/${failedQualityRun.issue.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "closed",
    reviewNote: "Smoke closes generated run issue.",
    actor: "p0_smoke"
  })
});
assert(closedRunIssue.issue?.status === "closed", "quality generated issue close failed", closedRunIssue);

const qualitySummary = await request("/api/quality/summary");
assert(qualitySummary.rules?.total >= 1, "quality summary missing rules", qualitySummary);
assert(qualitySummary.issues?.total >= 2, "quality summary missing issues", qualitySummary);

const ontologyPath = await request("/api/ontology/paths?objectId=sku");
assert(ontologyPath.object?.id === "sku", "ontology path did not resolve SKU object", ontologyPath);
assert(Array.isArray(ontologyPath.outbound) && ontologyPath.outbound.length >= 1, "ontology path missing outbound links", ontologyPath);
assert(Array.isArray(ontologyPath.metrics) && ontologyPath.metrics.length >= 1, "ontology path missing metric bridge", ontologyPath);

const inventoryMetrics = await request("/api/metrics?level=L3&q=库存");
const chatMetric = inventoryMetrics.find((metric) => String(metric.name || "").includes("库存")) || inventoryMetrics[0];
assert(chatMetric?.id, "no L3 inventory metric available for ChatBI context smoke", inventoryMetrics);

const smokeQuestion = `P1 ChatBI semantic certification smoke ${stamp}`;
const chatbiContext = await request("/api/chatbi/context", {
  method: "POST",
  body: JSON.stringify({
    metricId: chatMetric.id,
    questionSample: smokeQuestion,
    allowedDimensions: ["time", "sku", "warehouse"],
    evidenceChain: ["scripts/smoke-core-workflows.mjs", "MECE V2 metric blueprint"],
    answerability: "partial",
    answerabilityScore: 72,
    evidenceCount: 2,
    actor: "p1_chatbi_smoke"
  })
});
assert(chatbiContext.context?.id, "ChatBI context was not created", chatbiContext);
assert(chatbiContext.context?.workflow_id, "ChatBI context workflow was not created", chatbiContext);

const rejectedBeforeCertification = await request("/api/chatbi/dry-run", {
  method: "POST",
  body: JSON.stringify({ question: smokeQuestion })
});
assert(rejectedBeforeCertification.answerable === false, "uncertified ChatBI context should fail closed", rejectedBeforeCertification);
assert(rejectedBeforeCertification.rejectReason?.includes("尚未认证") || rejectedBeforeCertification.rejectReason?.includes("未认证"), "uncertified reject reason missing", rejectedBeforeCertification);

const certifiedContext = await request(`/api/chatbi/context/${chatbiContext.context.id}/review`, {
  method: "POST",
  body: JSON.stringify({
    status: "certified",
    reviewer: "p1_chatbi_smoke",
    reviewNote: "Smoke certifies this local context for dry-run only; no SQL execution and no external model call."
  })
});
assert(certifiedContext.context?.status === "certified", "ChatBI context certification failed", certifiedContext);
assert(certifiedContext.context?.answer_policy === "certified_metric_only", "ChatBI certified policy mismatch", certifiedContext);

const chatbiSummary = await request("/api/chatbi/summary");
assert(chatbiSummary.certified >= 1, "ChatBI summary missing certified contexts", chatbiSummary);
assert(
  Array.isArray(chatbiSummary.answerabilityBuckets) && Number.isFinite(Number(chatbiSummary.averageAnswerabilityScore || 0)),
  "ChatBI answerability summary fields missing",
  chatbiSummary
);

const dryRun = await request("/api/chatbi/dry-run", {
  method: "POST",
  body: JSON.stringify({ question: smokeQuestion })
});
assert(dryRun.answerable === true, "ChatBI dry-run failed", dryRun);
assert(dryRun.policy === "certified_metric_only", "ChatBI policy changed", dryRun);
assert(dryRun.candidates?.some((candidate) => candidate.metricId === chatMetric.id), "ChatBI dry-run missing certified context candidate", dryRun);

const aiSupported = await request("/api/ai-chat/local", {
  method: "POST",
  body: JSON.stringify({ question: "备货业务库存和计划库存有什么关系？" })
});
assert(aiSupported.ok === true, "AI chat supported query failed", aiSupported);
assert(aiSupported.result?.providerCalls === false, "AI chat unexpectedly called provider", aiSupported.result);
assert(
  ["supported", "partial", "conflict"].includes(aiSupported.result?.answerability),
  "AI chat did not return evidence-backed classification",
  aiSupported.result
);
assert(aiSupported.result?.messageId, "AI chat did not return assistant message id", aiSupported.result);

const aiEvidenceJson = await request(`/api/ai-chat/messages/${aiSupported.result.messageId}/evidence-export?format=json`);
assert(aiEvidenceJson.boundary?.providerCalls === false, "AI evidence JSON export provider boundary changed", aiEvidenceJson.boundary);
assert(Array.isArray(aiEvidenceJson.evidence), "AI evidence JSON export missing evidence rows", aiEvidenceJson);

const aiEvidenceMarkdown = await requestRaw(`/api/ai-chat/messages/${aiSupported.result.messageId}/evidence-export?format=markdown`);
assert(
  aiEvidenceMarkdown.response.headers.get("content-type")?.includes("text/markdown"),
  "AI evidence Markdown export content type is wrong",
  { contentType: aiEvidenceMarkdown.response.headers.get("content-type") }
);
assert(aiEvidenceMarkdown.text.includes("AI Evidence Export"), "AI evidence Markdown export missing title");

const aiInsufficient = await request("/api/ai-chat/local", {
  method: "POST",
  body: JSON.stringify({ question: "火星仓库的量子传送库存规则是什么？" })
});
assert(aiInsufficient.ok === true, "AI chat insufficient query failed", aiInsufficient);
assert(aiInsufficient.result?.providerCalls === false, "AI chat insufficient query called provider", aiInsufficient.result);
assert(
  ["insufficient", "partial"].includes(aiInsufficient.result?.answerability),
  "AI chat did not fail closed for weak evidence",
  aiInsufficient.result
);

const kbQuality = await request("/api/kb/quality-summary");
assert(kbQuality.cards?.total >= 1, "KB quality summary missing cards", kbQuality);
assert(Number.isFinite(Number(kbQuality.cards?.average_quality_score)), "KB quality average score missing", kbQuality);

const kbSources = await request("/api/kb/sources?limit=5");
assert(Array.isArray(kbSources) && kbSources.length >= 1, "KB source register missing sources", kbSources);
assert(
  kbSources.every((source) => source.stale_status && Number.isFinite(Number(source.avg_quality_score))),
  "KB source governance fields missing",
  kbSources
);

const kbCards = await request("/api/kb/cards?limit=5");
assert(Array.isArray(kbCards) && kbCards.length >= 1, "KB cards missing", kbCards);
assert(
  kbCards.every((card) => Number.isFinite(Number(card.quality_score)) && card.stale_status),
  "KB card quality fields missing",
  kbCards
);

const kbStaleFindings = await request("/api/kb/stale-findings?limit=5");
assert(Array.isArray(kbStaleFindings), "KB stale findings response is not an array", kbStaleFindings);

const kbCrosswalkMatrix = await request("/api/kb/crosswalk-matrix");
assert(kbCrosswalkMatrix.summary?.crosswalks >= 1, "KB crosswalk summary missing links", kbCrosswalkMatrix);
assert(Array.isArray(kbCrosswalkMatrix.rows), "KB crosswalk matrix rows missing", kbCrosswalkMatrix);

const knowledgeRule = await request("/api/knowledge-rules", {
  method: "POST",
  body: JSON.stringify({
    sourceCardId: kbCards[0].id,
    ruleName: `P0 smoke knowledge rule ${stamp} ${kbCards[0].title}`,
    createdBy: "p0_knowledge_rule_smoke"
  })
});
assert(knowledgeRule.rule?.id, "Knowledge rule was not created", knowledgeRule);
assert(knowledgeRule.rule?.workflow_id, "Knowledge rule workflow was not created", knowledgeRule);
assert(knowledgeRule.rule?.target_object_type, "Knowledge rule target object was not inferred", knowledgeRule.rule);

const reviewedKnowledgeRule = await request(`/api/knowledge-rules/${knowledgeRule.rule.id}/review`, {
  method: "POST",
  body: JSON.stringify({
    status: "reviewed",
    reviewer: "p0_knowledge_rule_smoke",
    reviewNote: "Smoke reviews knowledge rule candidate; certification remains owner-governed."
  })
});
assert(reviewedKnowledgeRule.rule?.lifecycle_status === "reviewed", "Knowledge rule review failed", reviewedKnowledgeRule);

const triggeredKnowledgeRule = await request(`/api/knowledge-rules/${knowledgeRule.rule.id}/run`, {
  method: "POST",
  body: JSON.stringify({ actor: "p0_knowledge_rule_smoke" })
});
assert(triggeredKnowledgeRule.recommendation?.recommendation?.id, "Knowledge rule did not create recommendation card", triggeredKnowledgeRule);
assert(
  triggeredKnowledgeRule.recommendation?.recommendation?.scenario_type === "knowledge_rule_trigger",
  "Knowledge rule recommendation scenario mismatch",
  triggeredKnowledgeRule.recommendation
);

const knowledgeRuleSummary = await request("/api/knowledge-rules/summary");
assert(knowledgeRuleSummary.total >= 1, "Knowledge rule summary missing rules", knowledgeRuleSummary);
assert(knowledgeRuleSummary.boundary?.providerCalls === false && knowledgeRuleSummary.boundary?.erpWriteback === false, "Knowledge rule boundary changed", knowledgeRuleSummary.boundary);

const knowledgeRuleExport = await request("/api/export/knowledge-rules?format=json");
assert(knowledgeRuleExport.boundary?.mode === "read_only_export", "Knowledge rule JSON export is not read-only", knowledgeRuleExport.boundary);
assert(
  knowledgeRuleExport.payload?.rules?.some((rule) => rule.id === knowledgeRule.rule.id),
  "Knowledge rule JSON export missing smoke rule",
  knowledgeRuleExport.payload
);

const knowledgeRuleExcelExport = await requestRaw("/api/export/knowledge-rules?format=excel");
assert(
  knowledgeRuleExcelExport.response.headers.get("content-type")?.includes("application/vnd.ms-excel"),
  "Knowledge rule Excel export content type is wrong",
  { contentType: knowledgeRuleExcelExport.response.headers.get("content-type") }
);
assert(
  knowledgeRuleExcelExport.text.includes("Knowledge Rules") && knowledgeRuleExcelExport.text.includes(knowledgeRule.rule.rule_code),
  "Knowledge rule Excel export missing rule content"
);

const questionSample = await request("/api/ai-chat/question-samples", {
  method: "POST",
  body: JSON.stringify({
    questionText: `P2 smoke standard question sample ${stamp}`,
    sampleType: "standard",
    targetAssetType: "chatbi_context",
    targetAssetId: aiSupported.result?.chatbiContextId || "",
    domainIds: ["stocking-rules"],
    expectedAnswerability: aiSupported.result?.answerability || "partial",
    sourceMessageId: aiSupported.result?.messageId || "",
    evidenceRefs: (aiSupported.result?.evidence || []).slice(0, 3).map((item) => `kb:${item.domainId}/${item.cardId}/${item.chunkId}`),
    createdBy: "p2_ai_smoke"
  })
});
assert(questionSample.sample?.id, "AI question sample was not created", questionSample);
assert(questionSample.sample?.workflow_id, "AI question sample workflow was not created", questionSample);

const certifiedQuestionSample = await request(`/api/ai-chat/question-samples/${questionSample.sample.id}/review`, {
  method: "POST",
  body: JSON.stringify({
    status: "certified",
    reviewer: "p2_ai_smoke",
    reviewNote: "Smoke certifies reusable question sample for governance only."
  })
});
assert(certifiedQuestionSample.sample?.status === "certified", "AI question sample review failed", certifiedQuestionSample);

const aiFeedback = await request("/api/ai-chat/feedback", {
  method: "POST",
  body: JSON.stringify({
    sessionId: aiSupported.result?.sessionId,
    messageId: aiSupported.result?.messageId,
    questionText: "备货业务库存和计划库存有什么关系？",
    rating: "insufficient",
    feedbackText: "P2 smoke records feedback and routes it into semantic governance.",
    answerability: aiSupported.result?.answerability,
    answerabilityScore: aiSupported.result?.answerabilityScore,
    evidenceCount: aiSupported.result?.evidence?.length || 0,
    createdBy: "p2_ai_smoke"
  })
});
assert(aiFeedback.feedback?.id, "AI answer feedback was not created", aiFeedback);
assert(aiFeedback.feedback?.workflow_id, "AI answer feedback workflow was not created", aiFeedback);

const closedAiFeedback = await request(`/api/ai-chat/feedback/${aiFeedback.feedback.id}/review`, {
  method: "POST",
  body: JSON.stringify({
    status: "closed",
    reviewer: "p2_ai_smoke",
    reviewNote: "Smoke closes feedback after governance routing validation."
  })
});
assert(closedAiFeedback.feedback?.status === "closed", "AI answer feedback review failed", closedAiFeedback);

const aiGovernanceSummary = await request("/api/ai-chat/governance-summary");
assert(aiGovernanceSummary.questionSamples?.total >= 1, "AI governance summary missing question samples", aiGovernanceSummary);
assert(aiGovernanceSummary.feedback?.total >= 1, "AI governance summary missing feedback", aiGovernanceSummary);
assert(aiGovernanceSummary.boundary?.providerCalls === false, "AI governance provider boundary changed", aiGovernanceSummary);

const actionTask = await request("/api/decision/action-task", {
  method: "POST",
  body: JSON.stringify({
    insightRef: "decision_1",
    actionName: "P1 smoke decision action",
    owner: "p1_decision_smoke",
    replayNote: "Smoke action remains suggestion + approval + replay only."
  })
});
assert(actionTask.task?.id, "action task was not created", actionTask);
assert(actionTask.task?.status === "recommended", "action task default state changed", actionTask);

const approvalTransition = await request(`/api/decision/action-tasks/${actionTask.task.id}/transition`, {
  method: "POST",
  body: JSON.stringify({
    status: "pending_approval",
    actor: "p1_decision_smoke",
    note: "Smoke moved action to approval queue.",
    evidence: [{ type: "smoke", ref: "scripts/smoke-core-workflows.mjs", status: "pending_approval" }]
  })
});
assert(approvalTransition.task?.status === "pending_approval", "action transition to pending approval failed", approvalTransition);

const approvedTransition = await request(`/api/decision/action-tasks/${actionTask.task.id}/transition`, {
  method: "POST",
  body: JSON.stringify({
    status: "approved",
    actor: "p1_decision_smoke",
    note: "Smoke approved action without provider or ERP write-back.",
    evidence: [{ type: "smoke", ref: "scripts/smoke-core-workflows.mjs", status: "approved" }]
  })
});
assert(approvedTransition.task?.status === "approved", "action transition to approved failed", approvedTransition);

const decisionSummary = await request("/api/decision/summary");
assert(decisionSummary.writeBackPolicy === "suggestion_approval_replay_only", "decision write-back policy changed", decisionSummary);

const aipSummary = await request("/api/aip/summary");
assert(aipSummary.schemaReady === true, "AIP summary schema readiness failed", aipSummary);
assert(aipSummary.objectInstances >= 10, "AIP object seed missing", aipSummary);
assert(aipSummary.actionPolicyTiers >= 4, "AIP policy tier seed missing", aipSummary);
assert(Array.isArray(aipSummary.topRiskObjects) && aipSummary.topRiskObjects.length > 0, "AIP top risk objects missing", aipSummary);

const aipObjects = await request("/api/aip/objects?type=inventory_batch&risk=critical&limit=5");
assert(Array.isArray(aipObjects) && aipObjects.some((object) => object.id === "obj_batch_fba_negative_available"), "AIP critical inventory batch not found", aipObjects);

const aipObjectDetail = await request("/api/aip/objects/obj_batch_fba_negative_available");
assert(aipObjectDetail.object?.properties?.business_available_qty < 0, "AIP Object 360 negative available inventory evidence missing", aipObjectDetail.object);
assert(Array.isArray(aipObjectDetail.events) && aipObjectDetail.events.some((event) => event.event_type === "negative_available_inventory"), "AIP object events missing negative available inventory", aipObjectDetail.events);
assert(aipObjectDetail.boundary?.ontologyReadOnly === true, "AIP object boundary changed", aipObjectDetail.boundary);

const aipObjectEvents = await request("/api/aip/objects/obj_batch_fba_negative_available/events?eventType=negative_available_inventory");
assert(Array.isArray(aipObjectEvents) && aipObjectEvents.length >= 1, "AIP object events API failed", aipObjectEvents);

const aipTrace = await request("/api/aip/traces", {
  method: "POST",
  body: JSON.stringify({
    question: "FBA 可用库存为负是否合理，应该如何排查？",
    intent: "negative_available_inventory_diagnosis",
    targetObjectId: "obj_batch_fba_negative_available",
    targetMetricId: "business_available_qty",
    answerability: "partial",
    answerabilityScore: 72,
    evidenceRefs: [
      { type: "object_event", ref: "evt_negative_available_inventory" },
      { type: "knowledge_domain", ref: "stocking-rules" }
    ],
    createdBy: "p0_aip_smoke"
  })
});
assert(aipTrace.trace?.id, "AIP trace was not created", aipTrace);
assert(Array.isArray(aipTrace.steps) && aipTrace.steps.length >= 4, "AIP trace steps were not created", aipTrace);

const aipTraceDetail = await request(`/api/aip/traces/${aipTrace.trace.id}`);
assert(aipTraceDetail.trace?.target_object_id === "obj_batch_fba_negative_available", "AIP trace detail target object mismatch", aipTraceDetail);

const aipRecommendation = await request("/api/aip/recommendations", {
  method: "POST",
  body: JSON.stringify({
    traceId: aipTrace.trace.id,
    targetObjectId: "obj_batch_fba_negative_available",
    scenarioType: "negative_available_inventory",
    recommendationTitle: "P0 smoke 负可用库存排查行动卡",
    recommendationDetail: "先核对平台预占、同步延迟、批次状态和调整流水，再决定是否发起库存修正或补货动作。",
    impactSummary: "影响 business_available_qty、stockout_risk 和 Listing 可售连续性。",
    evidenceRefs: [
      { type: "trace", ref: aipTrace.trace.id },
      { type: "object_event", ref: "evt_negative_available_inventory" }
    ],
    actionOptions: ["核对平台预占", "检查库存同步延迟", "复核批次状态", "生成 Owner 审核任务"],
    actionTier: "L1",
    owner: "p0_aip_smoke",
    priority: "P1",
    createdBy: "p0_aip_smoke"
  })
});
assert(aipRecommendation.recommendation?.id, "AIP recommendation was not created", aipRecommendation);
assert(aipRecommendation.recommendation?.workflow_id, "AIP recommendation workflow was not created", aipRecommendation);
assert(aipRecommendation.recommendation?.approval_status === "submitted", "AIP recommendation default status changed", aipRecommendation);

const reviewedRecommendation = await request(`/api/aip/recommendations/${aipRecommendation.recommendation.id}/review`, {
  method: "POST",
  body: JSON.stringify({
    status: "approved",
    reviewer: "p0_aip_smoke",
    reviewNote: "Smoke approves recommendation as ledger-only action card; no ERP/Jijia writeback."
  })
});
assert(reviewedRecommendation.recommendation?.approval_status === "approved", "AIP recommendation review failed", reviewedRecommendation);

const transitionedRecommendation = await request(`/api/aip/recommendations/${aipRecommendation.recommendation.id}/transition`, {
  method: "POST",
  body: JSON.stringify({
    status: "in_progress",
    actor: "p0_aip_smoke",
    note: "Smoke moves approved recommendation into execution tracking."
  })
});
assert(transitionedRecommendation.recommendation?.approval_status === "in_progress", "AIP recommendation transition failed", transitionedRecommendation);

const aipRecommendations = await request(`/api/aip/recommendations?objectId=obj_batch_fba_negative_available&q=${encodeURIComponent("负可用")}`);
assert(Array.isArray(aipRecommendations) && aipRecommendations.some((card) => card.id === aipRecommendation.recommendation.id), "AIP recommendation filter failed", aipRecommendations);

const aipRecommendationExport = await request("/api/export/aip-recommendations?format=json");
assert(aipRecommendationExport.boundary?.mode === "read_only_export", "AIP recommendation JSON export is not read-only", aipRecommendationExport.boundary);
assert(
  aipRecommendationExport.payload?.recommendations?.some((card) => card.id === aipRecommendation.recommendation.id),
  "AIP recommendation JSON export missing smoke recommendation",
  aipRecommendationExport.payload
);

const aipRecommendationExcelExport = await requestRaw("/api/export/aip-recommendations?format=excel");
assert(
  aipRecommendationExcelExport.response.headers.get("content-type")?.includes("application/vnd.ms-excel"),
  "AIP recommendation Excel export content type is wrong",
  { contentType: aipRecommendationExcelExport.response.headers.get("content-type") }
);
assert(
  aipRecommendationExcelExport.text.includes("AIP Recommendation Cards") && aipRecommendationExcelExport.text.includes(aipRecommendation.recommendation.id),
  "AIP recommendation Excel export missing recommendation content"
);

const aipScenarios = await request("/api/aip/scenarios");
const scenarioIds = ["negative_available_inventory", "stockout_risk", "aging_overstock_risk"];
assert(
  Array.isArray(aipScenarios) && scenarioIds.every((scenarioId) => aipScenarios.some((scenario) => scenario.id === scenarioId)),
  "AIP scenarios missing required scenario ids",
  aipScenarios
);
assert(
  aipScenarios.every((scenario) => scenario.object?.id && Array.isArray(scenario.events) && scenario.events.length >= 1 && Array.isArray(scenario.pathObjects) && scenario.pathObjects.length >= 3),
  "AIP scenarios missing object/event/path evidence",
  aipScenarios
);

for (const scenarioId of scenarioIds) {
  const run = await request(`/api/aip/scenarios/${scenarioId}/run`, {
    method: "POST",
    body: JSON.stringify({ actor: "p0_aip_scenario_smoke" })
  });
  assert(run.trace?.id, `AIP scenario ${scenarioId} did not create trace`, run);
  assert(run.recommendation?.id, `AIP scenario ${scenarioId} did not create recommendation`, run);
  assert(run.recommendation?.scenario_type === scenarioId, `AIP scenario ${scenarioId} recommendation scenario mismatch`, run.recommendation);
  assert(run.boundary?.providerCalls === false && run.boundary?.erpWriteback === false, `AIP scenario ${scenarioId} boundary changed`, run.boundary);
}

const auditEvents = await request("/api/audit-events?limit=20");
assert(Array.isArray(auditEvents) && auditEvents.length > 0, "audit events not recorded");

const auditSummary = await request("/api/audit/summary");
assert(auditSummary.total >= auditEvents.length, "audit summary count is inconsistent", auditSummary);

const chatbiAuditEvents = await request(`/api/audit-events?eventType=chatbi_context.reviewed&assetType=chatbi_context&actor=p1_chatbi_smoke&q=${encodeURIComponent(chatbiContext.context.id)}&limit=20`);
assert(
  Array.isArray(chatbiAuditEvents) && chatbiAuditEvents.some((event) => event.asset_id === chatbiContext.context.id),
  "ChatBI context review audit event missing",
  chatbiAuditEvents
);

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      modules: modules.length,
      health: {
        ontologyObjects: health.database?.ontologyObjects,
        metrics: health.database?.metrics,
        lineageEdges: health.database?.lineageEdges,
        aipPhase1: health.database?.aipPhase1
      },
      validatedWorkflows: [
        "annotation.create",
        "annotation.archive",
        "comment.create",
        "comment.archive",
        "revisionProposal.create",
        "revisionProposal.review",
        "governanceCandidate.create",
        "governanceCandidate.review",
        "workflowBoard.read",
        "workflowSummary.read",
        "workflowFilters.read",
        "workflowBulkReview.writeLedgerOnly",
        "workbenchOperation.create",
        "workbenchOperation.filter",
        "workbenchOperation.review",
        "workbenchOperation.bulkReview",
        "workbenchOperation.summary",
        "ontologyPath.read",
        "kpiCanvasNode.read",
        "kpiCanvasNode.update",
        "qualityRule.create",
        "qualityRule.review",
        "qualityRule.runPass",
        "qualityRule.runIssue",
        "qualityIssue.create",
        "qualityIssue.close",
        "qualitySummary.read",
        "chatbiContext.create",
        "chatbiContext.failClosedBeforeCertification",
        "chatbiContext.certify",
        "chatbiSummary.read",
        "chatbiSummary.answerabilityGovernance",
        "chatbi.dryRun",
        "aiChat.supportedOrPartial",
        "aiChat.evidenceExportJson",
        "aiChat.evidenceExportMarkdown",
        "aiChat.failClosed",
        "kbSourceRegister.read",
        "kbCardQuality.score",
        "kbStaleFindings.read",
        "kbCrosswalkMatrix.read",
        "knowledgeRule.createFromCard",
        "knowledgeRule.review",
        "knowledgeRule.triggerRecommendation",
        "knowledgeRule.exportJson",
        "knowledgeRule.exportExcel",
        "aiQuestionSample.create",
        "aiQuestionSample.certify",
        "aiFeedback.create",
        "aiFeedback.close",
        "aiGovernanceSummary.read",
        "decisionAction.create",
        "decisionAction.transitionPendingApproval",
        "decisionAction.transitionApproved",
        "decisionSummary.read",
        "aipSummary.read",
        "aipObject.read",
        "aipObject.events",
        "aipTrace.create",
        "aipTrace.read",
        "aipRecommendation.create",
        "aipRecommendation.review",
        "aipRecommendation.transition",
        "aipRecommendation.filter",
        "aipRecommendation.exportJson",
        "aipRecommendation.exportExcel",
        "aipScenarios.read",
        "aipScenarios.runNegativeInventory",
        "aipScenarios.runStockoutRisk",
        "aipScenarios.runAgingOverstock",
        "auditSummary.read",
        "auditEvents.read",
        "auditEvents.filterChatbi"
      ]
    },
    null,
    2
  )
);
