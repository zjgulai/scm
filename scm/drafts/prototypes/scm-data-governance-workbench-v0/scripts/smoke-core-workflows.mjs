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
assert(Array.isArray(modules) && modules.length === 12, "expected 12 workbench modules", { count: modules.length });

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

const dryRun = await request("/api/chatbi/dry-run", {
  method: "POST",
  body: JSON.stringify({ question: "库存可售性可以分析哪些认证指标？" })
});
assert(dryRun.answerable === true, "ChatBI dry-run failed", dryRun);
assert(dryRun.policy === "certified_metric_only", "ChatBI policy changed", dryRun);

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

const auditEvents = await request("/api/audit-events?limit=20");
assert(Array.isArray(auditEvents) && auditEvents.length > 0, "audit events not recorded");

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
        "kpiCanvasNode.read",
        "kpiCanvasNode.update",
        "qualityRule.create",
        "qualityRule.review",
        "qualityRule.runPass",
        "qualityRule.runIssue",
        "qualityIssue.create",
        "qualityIssue.close",
        "qualitySummary.read",
        "chatbi.dryRun",
        "aiChat.supportedOrPartial",
        "aiChat.failClosed",
        "auditEvents.read"
      ]
    },
    null,
    2
  )
);
