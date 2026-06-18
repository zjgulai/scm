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

const modules = await request("/api/workbench/modules");
assert(Array.isArray(modules) && modules.length === 13, "expected 13 workbench modules", { count: modules.length });
assert(modules.some((module) => module.id === "audit-log"), "audit log workbench module missing", modules);

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
        lineageEdges: health.database?.lineageEdges
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
        "chatbi.dryRun",
        "aiChat.supportedOrPartial",
        "aiChat.failClosed",
        "decisionAction.create",
        "decisionAction.transitionPendingApproval",
        "decisionAction.transitionApproved",
        "decisionSummary.read",
        "auditSummary.read",
        "auditEvents.read",
        "auditEvents.filterChatbi"
      ]
    },
    null,
    2
  )
);
