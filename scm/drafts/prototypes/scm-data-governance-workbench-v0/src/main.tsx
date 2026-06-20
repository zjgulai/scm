import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Overview = {
  counts: Record<string, number>;
  lifecycle: Array<{ status: string; count: number }>;
  levels: Array<{ level: string; count: number }>;
  tasks: Array<{ status: string; count: number }>;
  moduleHealth: Array<{ module: string; score: number; status: string; note: string }>;
  architectureLayers: string[];
};

type Metric = {
  id: string;
  code: string;
  name: string;
  level: string;
  metric_type: string;
  l1_domain: string;
  l2_group: string;
  formula: string;
  grain: string;
  direction: string;
  owner: string;
  lifecycle_status: string;
  certification_status: string;
  definition: string;
};

type WorkbenchModule = {
  id: string;
  code: string;
  title: string;
  focus: string;
  stage: string;
  status: string;
  score: number;
  primaryMetric: string;
  secondaryMetric: string;
  apiPath: string;
};

type AnyRow = Record<string, string | number | boolean | null>;

type KbDomain = {
  id: string;
  name: string;
  description: string;
  source_scope: string;
  status: string;
  source_count: number;
  card_count: number;
};

type KbChunk = {
  id: string;
  card_id: string;
  source_id: string;
  chunk_text: string;
  chunk_index: number;
  score?: number;
};

type KbCard = {
  id: string;
  domain_id: string;
  source_id: string;
  title: string;
  summary: string;
  business_terms: string;
  related_assets: string;
  evidence_level: string;
  status: string;
  created_at: string;
  domain_name: string;
  source_title: string;
  source_path: string;
  chunk_count: number;
  crosswalk_count: number;
  quality_score?: number;
  completeness_score?: number;
  evidence_score?: number;
  freshness_score?: number;
  usage_score?: number;
  quality_status?: string;
  stale_status?: string;
  stale_reason?: string;
  score?: number;
  evidence_chunks?: KbChunk[];
};

type KbSourceRegister = AnyRow & {
  id: string;
  domain_id: string;
  domain_name: string;
  source_type: string;
  source_path: string;
  title: string;
  status: string;
  card_count: number;
  chunk_count: number;
  crosswalk_count: number;
  avg_quality_score: number;
  quality_score: number;
  stale_status: string;
  stale_reason: string;
  owner: string;
  last_indexed_at: string;
};

type KbQualitySummary = {
  totals: {
    domains: number;
    sources: number;
    cards: number;
    chunks: number;
    crosswalks: number;
    quality?: {
      averageCardScore: number;
      reviewCards: number;
      staleFindings: number;
      uncrosswalkedCards: number;
    };
  };
  cards: {
    total: number;
    average_quality_score: number;
    certifiable: number;
    usable: number;
    needs_review: number;
    weak: number;
    stale_findings: number;
    uncrosswalked: number;
  };
  domains: Array<AnyRow>;
};

type KbStaleFinding = AnyRow & {
  id: string;
  finding_type: string;
  domain_name: string;
  title: string;
  source_path: string;
  quality_score: number;
  stale_status: string;
  stale_reason: string;
  recommended_action: string;
};

type KbCrosswalkMatrix = {
  summary: {
    rows: number;
    crosswalks: number;
    mapped_metrics: number;
    total_l3_metrics: number;
    metric_coverage_rate: number;
  };
  rows: AnyRow[];
};

type KnowledgeRule = {
  id: string;
  source_card_id: string;
  source_domain_id: string;
  source_card_title?: string;
  source_domain_name?: string;
  rule_code: string;
  rule_name: string;
  rule_type: string;
  target_object_type: string;
  target_metric_ids: string[];
  target_dimension_ids: string[];
  condition_expression: string;
  action_template: Record<string, unknown>;
  evidence_refs: unknown[];
  conflict_key: string;
  conflict_status: string;
  open_conflict_count?: number;
  recommendation_count?: number;
  owner: string;
  priority: string;
  lifecycle_status: string;
  workflow_id: string;
  reviewer: string;
  review_note: string;
  created_at: string;
  updated_at: string;
};

type KnowledgeRuleSummary = {
  total: number;
  draft: number;
  certified: number;
  conflicts: number;
  byStatus: AnyRow[];
  byTargetObject: AnyRow[];
  byConflictStatus: AnyRow[];
  boundary: {
    mode: string;
    importAllowed: boolean;
    providerCalls: boolean;
    erpWriteback: boolean;
  };
};

type AiEvidence = {
  cardId: string;
  chunkId: string;
  sourceId: string;
  domainId: string;
  domainName: string;
  title: string;
  sourcePath: string;
  score: number;
  text: string;
};

type AiAnswerabilityDetails = {
  score: number;
  evidenceCount: number;
  topScore: number;
  domainCoverage: number;
  evidenceCoverage: number;
  strongTermCoverage: number;
  conflictCount: number;
  conflictSignal: boolean;
  sourceContextAttached: boolean;
  matchedTerms: string[];
  matchedStrongTerms: string[];
  missingStrongTerms: string[];
  domains: string[];
  scopedDomains: string[];
};

type AiChatResult = {
  sessionId: string;
  messageId: string;
  chatbiContextId: string | null;
  answerability: "supported" | "partial" | "insufficient" | "conflict";
  answerabilityScore: number;
  answerabilityDetails: AiAnswerabilityDetails;
  sourceContext: AssetRef | null;
  answer: string;
  policy: string;
  providerCalls: boolean;
  evidence: AiEvidence[];
};

type AiGovernanceSummary = {
  questionSamples: {
    total: number;
    avgQuality: number;
    byStatus: AnyRow[];
    byType: AnyRow[];
  };
  feedback: {
    total: number;
    open: number;
    byStatus: AnyRow[];
    byRating: AnyRow[];
  };
  boundary: {
    providerCalls: boolean;
    writeBackPolicy: string;
  };
};

type AiEvidenceExportRegistryItem = {
  message_id: string;
  session_id: string;
  session_title: string;
  preview: string;
  answerability: string;
  answerability_score: number;
  evidence_count: number;
  json_url: string;
  markdown_url: string;
  created_at: string;
  boundary?: {
    providerCalls: boolean;
    erpWriteback: boolean;
    mode: string;
  };
};

type AssetRef = {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  fields: AnyRow;
  readOnly?: boolean;
};

type LedgerAnnotation = {
  id: string;
  asset_type: string;
  asset_id: string;
  title: string;
  body: string;
  annotation_type: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type LedgerComment = {
  id: string;
  asset_type: string;
  asset_id: string;
  body: string;
  parent_id: string;
  status: string;
  created_by: string;
  created_at: string;
};

type RevisionProposal = {
  id: string;
  asset_type: string;
  asset_id: string;
  proposal_type: string;
  current_value: string;
  proposed_value: string;
  reason: string;
  evidence_refs: string;
  status: string;
  reviewer: string;
  review_note: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type GovernanceCandidate = {
  id: string;
  candidate_type: string;
  candidate_code: string;
  candidate_name: string;
  target_asset_type: string;
  target_asset_id: string;
  proposal_summary: string;
  proposed_payload: string;
  source_ref: string;
  evidence_refs: string;
  owner: string;
  priority: string;
  lifecycle_status: string;
  workflow_id: string;
  reviewer: string;
  review_note: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type WorkflowInstance = {
  id: string;
  workflow_type: string;
  asset_type: string;
  asset_id: string;
  status: string;
  priority: string;
  owner: string;
  due_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  title: string;
  source_ref: string;
  module_id: string;
  candidate_type?: string;
  candidate_code?: string;
  candidate_name?: string;
  candidate_status?: string;
  step_summary?: string;
  sla_status?: string;
  sla_note?: string;
};

type WorkbenchOperation = {
  id: string;
  module_id: string;
  operation_type: string;
  target_asset_type: string;
  target_asset_ids: string;
  operation_title: string;
  operation_summary: string;
  operation_payload: string;
  owner: string;
  priority: string;
  status: string;
  workflow_id: string;
  reviewer: string;
  review_note: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type OrchestrationLane = {
  id: string;
  title: string;
  description: string;
  stage: string;
  moduleIds: string[];
  moduleCount: number;
  openWorkflowCount: number;
  operationCount: number;
};

type OrchestrationModule = {
  id: string;
  code: string;
  title: string;
  stage: string;
  status: string;
  score: number;
  input: string;
  output: string;
  collaborators: string;
  guardrail: string;
  workflowCount: number;
  openWorkflowCount: number;
  operationCount: number;
  candidateCount: number;
  exportPath: string;
};

type OrchestrationHandoff = {
  from: string;
  to: string;
  contract: string;
  status: string;
};

type WorkflowTemplateStep = {
  key: string;
  name: string;
  actor: string;
  gate: string;
  output: string;
  state: string;
};

type WorkflowTemplate = {
  id: string;
  title: string;
  appliesTo: string;
  trigger: string;
  owner: string;
  defaultSla: string;
  entryModuleId: string;
  exitModuleId: string;
  boundary: {
    importAllowed: boolean;
    providerCalls: boolean;
    erpWriteback: boolean;
    ledgerMode: string;
  };
  steps: WorkflowTemplateStep[];
};

type WorkflowOrchestrationSummary = {
  totals: Record<string, number>;
  lanes: OrchestrationLane[];
  moduleMap: OrchestrationModule[];
  statusBuckets: {
    workflows: AnyRow[];
    operations: AnyRow[];
    sla: AnyRow[];
  };
  recentWorkflows: WorkflowInstance[];
  recentOperations: WorkbenchOperation[];
  templates: WorkflowTemplate[];
  handoffs: OrchestrationHandoff[];
  boundary: {
    mode: string;
    importAllowed: boolean;
    productionWrites: boolean;
    providerCalls: boolean;
    erpWriteback: boolean;
  };
};

type OntologyPath = {
  object: AnyRow | null;
  outbound: AnyRow[];
  inbound: AnyRow[];
  tags: AnyRow[];
  dimensions: AnyRow[];
  metrics: AnyRow[];
  lineageEdges: AnyRow[];
  narrative: string[];
};

type DecisionSummary = {
  decisions: { total: number; byStatus: AnyRow[] };
  actions: { total: number; byStatus: AnyRow[]; byOwner: AnyRow[] };
  stateOrder: string[];
  terminalStates: string[];
  writeBackPolicy: string;
};

type AuditEvent = {
  id: string;
  event_type: string;
  asset_type: string;
  asset_id: string;
  payload: string;
  actor: string;
  created_at: string;
};

type ChatbiSummary = {
  total: number;
  certified: number;
  draft: number;
  rejected: number;
  averageAnswerabilityScore?: number;
  weakContexts?: number;
  byStatus: AnyRow[];
  byPolicy: AnyRow[];
  answerabilityBuckets?: AnyRow[];
  answerabilityPolicy?: {
    certifiedAnswerPolicy: string;
    localEvidenceSamplePolicy: string;
    refusalRule: string;
  };
  pending: AnyRow[];
};

type ChatbiAnswerabilityScorecard = {
  summary: {
    total: number;
    certified: number;
    draft: number;
    weak: number;
    average_score: number;
    evidence_count: number;
    certified_coverage_rate: number;
    refusal_like_count: number;
    providerCalls: boolean;
    erpWriteback: boolean;
  };
  answerabilityBuckets: AnyRow[];
  domainScorecards: AnyRow[];
  weakContexts: AnyRow[];
  policy: {
    answerPolicy: string;
    refusalRule: string;
    evidenceExport: string;
    providerCalls: boolean;
    erpWriteback: boolean;
  };
};

type AuditSummary = {
  total: number;
  byEventType: AnyRow[];
  byAssetType: AnyRow[];
  byActor: AnyRow[];
  recent: AuditEvent[];
};

type AipObject = {
  id: string;
  object_type: string;
  object_key: string;
  display_name: string;
  lifecycle_status: string;
  risk_level: string;
  owner: string;
  health_score: number;
  source_refs: unknown[];
  properties: Record<string, unknown>;
  event_count?: number;
  recommendation_count?: number;
  trace_count?: number;
};

type AipEvent = {
  id: string;
  object_id: string;
  event_type: string;
  severity: string;
  event_title: string;
  event_detail: string;
  metric_refs: unknown[];
  evidence_refs: unknown[];
  status: string;
  occurred_at: string;
};

type AipTrace = {
  id: string;
  session_id: string;
  source_message_id: string;
  intent: string;
  question: string;
  target_object_type: string;
  target_object_id: string;
  target_metric_id: string;
  answerability: string;
  answerability_score: number;
  status: string;
  evidence_refs: unknown[];
  created_by: string;
  created_at: string;
};

type AipTraceStep = {
  id: string;
  trace_id: string;
  step_order: number;
  step_type: string;
  step_title: string;
  step_detail: string;
  input_refs: unknown[];
  output_refs: unknown[];
  status: string;
  created_at: string;
};

type AipRecommendation = {
  id: string;
  trace_id: string;
  target_object_type: string;
  target_object_id: string;
  scenario_type: string;
  recommendation_title: string;
  recommendation_detail: string;
  impact_summary: string;
  evidence_refs: unknown[];
  action_options: unknown[];
  action_tier: string;
  owner: string;
  priority: string;
  approval_status: string;
  workflow_id: string;
  due_date: string;
  reviewer: string;
  review_note: string;
  created_at: string;
  updated_at: string;
};

type AipTimelineItem = {
  id: string;
  item_type: string;
  title: string;
  detail: string;
  status: string;
  severity: string;
  actor: string;
  occurred_at: string;
  asset_type: string;
  asset_id: string;
  source_ref: string;
};

type AipObjectDetail = {
  object: AipObject;
  ontology: AnyRow | null;
  relations: { outbound: AnyRow[]; inbound: AnyRow[] };
  identityLinks: AnyRow[];
  metrics: AnyRow[];
  tags: AnyRow[];
  kbCards: AnyRow[];
  qualityIssues: AnyRow[];
  recommendations: AipRecommendation[];
  events: AipEvent[];
  traces: AipTrace[];
  timeline: AipTimelineItem[];
  boundary: AnyRow;
};

type AipTraceDetail = {
  trace: AipTrace;
  steps: AipTraceStep[];
  recommendations: AipRecommendation[];
};

type AipSummary = {
  schemaReady: boolean;
  objectInstances: number;
  identityLinks: number;
  objectEvents: number;
  traces: number;
  traceSteps: number;
  recommendations: number;
  recommendationTransitions: number;
  actionPolicyTiers: number;
  providerCalls: boolean;
  erpWriteback: boolean;
  objectsByType: AnyRow[];
  riskBuckets: AnyRow[];
  eventBuckets: AnyRow[];
  recommendationBuckets: AnyRow[];
  topRiskObjects: AipObject[];
  openRecommendations: AipRecommendation[];
  policyTiers: AnyRow[];
};

type DeployHealth = {
  ok: boolean;
  service: string;
  runtime: string;
  host: string;
  port: number;
  launchedAt: string;
  staticBuild: boolean;
  deployment: {
    releaseId: string;
    gitSha: string;
    dataMountType: string;
    dataVolumeName: string;
    dataMountPath: string;
  };
  boundary: {
    productionWrites: boolean;
    providerCalls: boolean;
    erpWriteback: boolean;
    chatbiPolicy: string;
  };
};

type AipScenario = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ruleSummary: string;
  targetObjectId: string;
  targetObjectType: string;
  targetMetricId: string;
  pathNarrative: string[];
  owner: string;
  priority: string;
  answerability: string;
  answerabilityScore: number;
  question: string;
  recommendationTitle: string;
  recommendationDetail: string;
  impactSummary: string;
  actionOptions: string[];
  object: AipObject | null;
  pathObjects: AipObject[];
  events: AipEvent[];
  recommendations: AipRecommendation[];
  traces: AipTrace[];
  healthScore: number;
  boundary: AnyRow;
};

type RoleWorkbench = {
  id: string;
  role_code: string;
  role_name: string;
  role_type: string;
  mission: string;
  primary_object_types: string[];
  metric_refs: string[];
  decision_cadence: string;
  owner: string;
  lifecycle_status: string;
  created_at: string;
  updated_at: string;
  counts?: {
    objects: number;
    criticalObjects: number;
    openEvents: number;
    recommendations: number;
    playbooks: number;
    evalCases: number;
  };
};

type RolePlaybook = {
  id: string;
  role_id: string;
  playbook_name: string;
  trigger_condition: string;
  action_template: Record<string, unknown>;
  evidence_refs: unknown[];
  priority: string;
  status: string;
};

type ProviderPolicy = {
  id: string;
  provider_code: string;
  provider_name: string;
  provider_type: string;
  status: string;
  allowed_use_cases: string[];
  data_boundary: string;
  evidence_required: boolean;
  prompt_version_policy: string;
  cost_policy: string;
  pii_policy: string;
};

type AgentEvalCase = {
  id: string;
  role_id: string;
  scenario_type: string;
  question: string;
  expected_answerability: string;
  required_evidence_refs: unknown[];
  status: string;
};

type RoleDomainProfile = {
  domain: string;
  persona: string;
  operatingQuestion: string;
  inputAssets: string[];
  outputArtifacts: string[];
  evidenceChecklist: string[];
  defaultScenarioTypes: string[];
  roleGoal: string;
  roleId: string;
  roleCode: string;
  owner: string;
  cadence: string;
  metricRefs: string[];
  objectTypes: string[];
};

type RoleWorkstream = {
  key: string;
  name: string;
  description: string;
  expectedOutput: string;
  owner: string;
};

type ProviderDecisionRecord = {
  id: string;
  provider_code: string;
  decision_title: string;
  preferred_rank: number;
  decision_status: string;
  decision_summary: string;
  cost_notes: string;
  risk_notes: string;
  fallback_policy: string;
  evidence_refs: unknown[];
  owner: string;
  lifecycle_status: string;
};

type PromptVersion = {
  id: string;
  prompt_code: string;
  provider_code: string;
  role_id: string;
  eval_case_id: string;
  scenario_type: string;
  prompt_title: string;
  prompt_body: string;
  context_contract: Record<string, unknown>;
  allowed_evidence_refs: unknown[];
  version_no: number;
  rollback_of: string;
  status: string;
  owner: string;
};

type ProviderCallAudit = {
  id: string;
  provider_code: string;
  prompt_version_id: string;
  trace_id: string;
  eval_case_id: string;
  call_status: string;
  request_purpose: string;
  evidence_refs: unknown[];
  token_estimate: number;
  cost_estimate_usd: number;
  error_summary: string;
  response_digest: string;
  actor: string;
  created_at: string;
};

type ProviderGatewaySummary = {
  providerPolicies: number;
  disabledProviders: number;
  decisionRecords: number;
  promptVersions: number;
  draftDisabledPrompts: number;
  callAudits: number;
  blockedCalls: number;
  preferredProvider: string;
  providerCandidates: AnyRow[];
  boundary: {
    providerCalls: boolean;
    erpWriteback: boolean;
    allowedCallStatuses: string[];
    policy: string;
  };
};

type AccessPolicyDraft = {
  id: string;
  role_code: string;
  policy_name: string;
  subject_role: string;
  allowed_actions: unknown[];
  object_scope: Record<string, unknown>;
  approval_required: boolean;
  login_required: boolean;
  status: string;
  owner: string;
  risk_level: string;
  evidence_refs: unknown[];
};

type PostgresMigrationTrigger = {
  id: string;
  trigger_code: string;
  trigger_name: string;
  threshold_value: number;
  current_value: number;
  unit: string;
  status: string;
  recommendation: string;
  owner: string;
  evidence_refs: unknown[];
};

type PostgresCompatibilityFinding = {
  id: string;
  table_name: string;
  finding_type: string;
  risk_level: string;
  finding_detail: string;
  postgres_recommendation: string;
  status: string;
  owner: string;
  evidence_refs: unknown[];
};

type WritebackRiskAssessment = {
  id: string;
  target_system: string;
  action_tier: string;
  api_surface: string;
  use_case: string;
  risk_level: string;
  approval_gate: string;
  rollback_plan: string;
  status: string;
  evidence_refs: unknown[];
};

type PlatformReadinessPayload = {
  summary: {
    rbacPolicies: number;
    loginEnabled: boolean;
    loginRequiredPolicies: number;
    approvalRequiredPolicies: number;
    postgresTriggers: number;
    readyTriggers: number;
    watchTriggers: number;
    postgresFindings: number;
    highRiskFindings: number;
    writebackAssessments: number;
    enabledWritebacks: number;
    disabledWritebacks: number;
    reviewRequiredWritebacks: number;
  };
  rbacPolicies: AccessPolicyDraft[];
  postgresTriggers: PostgresMigrationTrigger[];
  postgresFindings: PostgresCompatibilityFinding[];
  writebackAssessments: WritebackRiskAssessment[];
  boundary: {
    loginEnabled: boolean;
    postgresMigrationActive: boolean;
    providerCalls: boolean;
    erpWriteback: boolean;
    importAllowed: boolean;
    writebackPolicy: string;
  };
};

type RoleWorkbenchDetail = {
  role: RoleWorkbench;
  domainProfile: RoleDomainProfile;
  workstreams: RoleWorkstream[];
  filterOptions: {
    objectTypes: string[];
    riskLevels: string[];
    eventStatuses: string[];
    scenarioTypes: string[];
  };
  activeFilters: Record<string, string | number>;
  objects: AipObject[];
  events: (AipEvent & { display_name?: string; object_type?: string; object_owner?: string })[];
  recommendations: AipRecommendation[];
  playbooks: RolePlaybook[];
  metrics: Metric[];
  evalCases: AgentEvalCase[];
  providerPolicies: ProviderPolicy[];
  providerDecisionRecords: ProviderDecisionRecord[];
  promptVersions: PromptVersion[];
  providerCallAudits: ProviderCallAudit[];
  providerGatewaySummary: ProviderGatewaySummary;
  platformReadiness: PlatformReadinessPayload;
  actionBoundary: AnyRow;
};

type RoleGovernanceSummary = {
  roles: number;
  activeRoles: number;
  rolePlaybooks: number;
  evalCases: number;
  providerPolicies: number;
  disabledProviders: number;
  providerDecisionRecords: number;
  promptVersions: number;
  providerCallAudits: number;
  platformReadiness?: PlatformReadinessPayload["summary"];
  roleQueues: Array<{ id: string; roleName: string; owner: string; counts?: RoleWorkbench["counts"] }>;
  boundary: {
    providerCalls: boolean;
    erpWriteback: boolean;
    policy: string;
  };
};

type LedgerState = {
  annotations: LedgerAnnotation[];
  comments: LedgerComment[];
  proposals: RevisionProposal[];
  audits: AuditEvent[];
};

const fallbackModules: WorkbenchModule[] = [
  { id: "overview", code: "00", title: "治理链路总览", focus: "九层治理链路总控。", stage: "Operate", status: "active", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/governance/overview" },
  { id: "ai-chat", code: "AI", title: "AI 对话", focus: "本地知识库证据问答和拒答机制。", stage: "Serve", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/ai-chat" },
  { id: "ontology", code: "01", title: "对象本体工作台", focus: "对象与关系图谱。", stage: "Model", status: "mapped", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/ontology" },
  { id: "tags", code: "02", title: "标签工程工作台", focus: "标签规则与生命周期。", stage: "Model", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/tags" },
  { id: "dimensions", code: "03", title: "维度工程工作台", focus: "一致性维度与分析维度。", stage: "Model", status: "mapped", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/dimensions" },
  { id: "metric-engineering", code: "04", title: "指标工程工作台", focus: "指标公式与字段映射。", stage: "Build", status: "mapped", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/metric-engineering" },
  { id: "metric-dictionary", code: "05", title: "指标字典工作台", focus: "指标口径与认证。", stage: "Certify", status: "active", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/metric-dictionary" },
  { id: "kpi-system", code: "06", title: "指标体系编排台", focus: "KPI 树与归因路径。", stage: "Certify", status: "active", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/kpi-system" },
  { id: "lineage-quality", code: "07", title: "血缘与质量工作台", focus: "血缘、DQ 与影响分析。", stage: "Control", status: "reviewed", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/lineage-quality" },
  { id: "chatbi", code: "08", title: "ChatBI 语义治理台", focus: "可回答性与证据链。", stage: "Serve", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/chatbi" },
  { id: "ai-knowledge", code: "09", title: "AI 知识库", focus: "三大知识库主题域、本地检索和证据片段。", stage: "Serve", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/ai-knowledge" },
  { id: "workflow-orchestration", code: "10", title: "工作流编排台", focus: "跨工作台输入输出、审批、注解、修订和审计。", stage: "Operate", status: "active", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workflow-orchestration/summary" },
  { id: "role-workbench", code: "11", title: "角色工作台", focus: "计划、采购、库存、物流、成本角色队列。", stage: "Act", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/role-workbench" },
  { id: "decision-loop", code: "12", title: "决策闭环工作台", focus: "洞察到审批复盘。", stage: "Act", status: "draft", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/decision-loop" },
  { id: "audit-log", code: "13", title: "审计日志工作台", focus: "治理操作审计、筛选和证据回看。", stage: "Control", status: "active", score: 0, primaryMetric: "--", secondaryMetric: "--", apiPath: "/api/workbench/audit-log" }
];

const columnLabels: Record<string, string> = {
  id: "ID",
  code: "编码",
  name: "名称",
  title: "标题",
  level: "层级",
  metric_type: "指标类型",
  l1_domain: "L1 域",
  l2_group: "L2 分组",
  lifecycle_status: "生命周期",
  certification_status: "认证状态",
  owner: "Owner",
  object_type: "对象类型",
  grain: "粒度",
  status: "状态",
  source_object_id: "源对象",
  link_type: "关系",
  target_object_id: "目标对象",
  business_meaning: "业务含义",
  tag_type: "标签类型",
  rule_expression: "规则表达式",
  quality_status: "质量状态",
  dimension_type: "维度类型",
  hierarchy: "层级",
  bound_object_id: "绑定对象",
  formula: "公式",
  direction: "方向",
  source_ref: "来源",
  edge_type: "血缘类型",
  target_ref: "目标",
  confidence: "置信度",
  rule_code: "规则编码",
  rule_name: "规则名称",
  severity: "严重度",
  expected_behavior: "期望行为",
  issue_title: "问题",
  issue_detail: "问题说明",
  detected_at: "发现时间",
  resolved_at: "关闭时间",
  task_type: "任务类型",
  priority: "优先级",
  metric_id: "指标 ID",
  answer_policy: "回答策略",
  insight_title: "洞察",
  linked_metric_id: "关联指标",
  recommendation: "建议",
  review_note: "复盘记录",
  insight_ref: "洞察引用",
  action_name: "动作",
  approval_required: "需审批",
  replay_note: "复盘说明",
  source_path: "来源路径",
  source_title: "来源标题",
  source_type: "来源类型",
  domain_name: "主题域",
  evidence_level: "证据等级",
  business_terms: "业务术语",
  crosswalk_count: "关联资产",
  chunk_count: "证据片段",
  card_count: "知识卡",
  avg_quality_score: "平均质量分",
  quality_score: "质量分",
  completeness_score: "完整性",
  evidence_score: "证据强度",
  freshness_score: "时效性",
  usage_score: "使用/关联",
  stale_status: "复核状态",
  stale_reason: "复核原因",
  last_indexed_at: "最近索引",
  finding_type: "发现类型",
  recommended_action: "建议动作",
  asset_count: "资产数",
  metric_count: "指标关联",
  object_count: "对象关联",
  sample_assets: "样例资产",
  mapped_metrics: "已映射指标",
  total_l3_metrics: "L3 指标总数",
  metric_coverage_rate: "指标覆盖率",
  candidate_type: "候选类型",
  candidate_code: "候选编码",
  candidate_name: "候选名称",
  target_asset_type: "目标资产类型",
  target_asset_id: "目标资产 ID",
  proposal_summary: "候选说明",
  proposed_payload: "建议内容",
  evidence_refs: "证据引用",
  workflow_id: "Workflow",
  question_sample: "问法样本",
  question_text: "问题",
  sample_type: "样本类型",
  expected_answerability: "预期可答性",
  domain_ids: "主题域",
  source_message_id: "来源消息",
  rating: "反馈评级",
  feedback_text: "反馈说明",
  allowed_dimensions: "可用维度",
  evidence_chain: "证据链",
  answerability: "可回答性",
  answerability_score: "可回答性分",
  evidence_count: "证据数",
  reviewer: "审核人",
  certified_at: "认证时间",
  event_type: "事件类型",
  asset_type: "资产类型",
  asset_id: "资产 ID",
  actor: "操作者",
  created_at: "创建时间",
  payload: "载荷",
  workflow_type: "流程类型",
  module_id: "模块",
  due_date: "截止日期",
  step_summary: "步骤状态",
  sla_status: "SLA",
  sla_note: "SLA 说明",
  transition_count: "状态迁移",
  last_transition_at: "最近迁移",
  operation_type: "操作类型",
  operation_title: "操作标题",
  operation_summary: "操作说明",
  operation_payload: "操作载荷",
  target_asset_ids: "目标资产",
  workflow_ref: "关联流程",
  object_key: "对象主键",
  display_name: "对象名称",
  risk_level: "风险等级",
  health_score: "健康分",
  source_refs: "来源引用",
  properties: "对象属性",
  event_count: "事件数",
  recommendation_count: "建议数",
  trace_count: "Trace 数",
  target_object_type: "目标对象类型",
  target_metric_id: "目标指标",
  scenario_type: "场景类型",
  recommendation_title: "建议标题",
  recommendation_detail: "建议详情",
  impact_summary: "影响摘要",
  action_options: "动作选项",
  action_tier: "动作层级",
  approval_status: "审批状态",
  occurred_at: "发生时间",
  event_title: "事件标题",
  event_detail: "事件详情",
  metric_refs: "指标引用",
  step_order: "步骤",
  step_type: "步骤类型",
  step_title: "步骤标题",
  step_detail: "步骤说明",
  role_code: "角色编码",
  role_name: "角色",
  role_type: "角色类型",
  mission: "角色使命",
  primary_object_types: "主对象",
  decision_cadence: "决策节奏",
  playbook_name: "Playbook",
  trigger_condition: "触发条件",
  action_template: "动作模板",
  provider_code: "Provider",
  provider_name: "Provider 名称",
  provider_type: "Provider 类型",
  allowed_use_cases: "允许场景",
  data_boundary: "数据边界",
  evidence_required: "需要证据",
  prompt_version_policy: "Prompt 版本策略",
  cost_policy: "成本策略",
  pii_policy: "PII 策略",
  required_evidence_refs: "必需证据",
  decision_title: "决策标题",
  preferred_rank: "优先级排序",
  decision_status: "决策状态",
  decision_summary: "决策摘要",
  cost_notes: "成本说明",
  risk_notes: "风险说明",
  fallback_policy: "回退策略",
  prompt_code: "Prompt 编码",
  prompt_title: "Prompt 标题",
  prompt_body: "Prompt 正文",
  context_contract: "上下文契约",
  allowed_evidence_refs: "允许证据",
  version_no: "版本号",
  rollback_of: "回滚来源",
  prompt_version_id: "Prompt 版本",
  trace_id: "Trace",
  call_status: "调用状态",
  request_purpose: "请求目的",
  token_estimate: "Token 估算",
  cost_estimate_usd: "成本估算"
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function useApi<T>(path: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api<T>(path)
      .then((payload) => {
        if (!alive) return;
        setData(payload);
        setError("");
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [path]);
  return { data, error, loading };
}

function toneFromStatus(status = "") {
  if (["active", "certified", "已签字", "done", "approved", "completed", "on_track", "supported", "resolved", "low", "healthy", "replayed"].includes(status)) return "good";
  if (["mapped", "reviewed", "in_progress", "closed", "partial", "medium", "submitted", "L0", "L1"].includes(status)) return "blue";
  if (["draft", "review_pending", "pending_approval", "recommended", "due_soon", "no_due", "insufficient", "high", "L2"].includes(status)) return "warn";
  if (["deprecated", "blocked", "rejected", "overdue", "invalid_due", "conflict", "critical", "L3"].includes(status)) return "bad";
  return "neutral";
}

function actionNextStates(status = "") {
  const state = status === "approval_pending" ? "pending_approval" : status;
  const transitions: Record<string, string[]> = {
    draft: ["recommended", "pending_approval", "rejected"],
    recommended: ["pending_approval", "rejected"],
    pending_approval: ["approved", "rejected"],
    approved: ["in_progress", "completed"],
    in_progress: ["completed", "rejected"],
    completed: ["reviewed"],
    reviewed: [],
    rejected: []
  };
  return transitions[state] || [];
}

function recommendationNextStates(status = "") {
  const transitions: Record<string, string[]> = {
    draft: ["submitted", "rejected"],
    submitted: ["approved", "rejected"],
    approved: ["in_progress", "done"],
    in_progress: ["done", "rejected"],
    done: ["replayed"],
    replayed: [],
    rejected: []
  };
  return transitions[status] || [];
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "blue" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function ScoreLine({ score }: { score: number }) {
  return (
    <div className="scoreLine" aria-label={`readiness ${score}`}>
      <span style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} />
    </div>
  );
}

function cellValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function safeFieldValue(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (["string", "number", "boolean"].includes(typeof value)) return value as string | number | boolean;
  return JSON.stringify(value);
}

type PaginationController<T> = {
  pageItems: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
};

function usePagination<T>(items: T[], pageSize = 12): PaginationController<T> {
  const [page, setPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage((current) => Math.min(Math.max(current, 1), totalPages));
  }, [totalPages]);

  return {
    pageItems,
    page: safePage,
    totalPages,
    totalItems,
    pageSize,
    startIndex,
    endIndex: startIndex + pageItems.length,
    setPage
  };
}

function PaginationBar({ pager, label }: { pager: PaginationController<unknown>; label: string }) {
  if (pager.totalItems <= pager.pageSize) {
    return (
      <div className="paginationBar compact" aria-label={`${label} pagination`}>
        <span>{label}</span>
        <strong>{pager.totalItems ? `1-${pager.totalItems}` : "0"} / {pager.totalItems}</strong>
      </div>
    );
  }

  const jumpToFirst = () => pager.setPage(1);
  const jumpToPrevious = () => pager.setPage((value) => Math.max(1, value - 1));
  const jumpToNext = () => pager.setPage((value) => Math.min(pager.totalPages, value + 1));
  const jumpToLast = () => pager.setPage(pager.totalPages);

  return (
    <div className="paginationBar" aria-label={`${label} pagination`}>
      <div>
        <span>{label}</span>
        <strong>{pager.startIndex + 1}-{pager.endIndex} / {pager.totalItems}</strong>
      </div>
      <div className="paginationControls">
        <button type="button" onClick={jumpToFirst} disabled={pager.page <= 1}>首页</button>
        <button type="button" onClick={jumpToPrevious} disabled={pager.page <= 1}>上一页</button>
        <span>{pager.page} / {pager.totalPages}</span>
        <button type="button" onClick={jumpToNext} disabled={pager.page >= pager.totalPages}>下一页</button>
        <button type="button" onClick={jumpToLast} disabled={pager.page >= pager.totalPages}>末页</button>
      </div>
    </div>
  );
}

type WorkbenchSectionDefinition = {
  id: string;
  label: string;
  helper: string;
  badge?: string | number;
};

function WorkbenchSectionNav({
  sections,
  active,
  onChange,
  ariaLabel = "工作台页面分区"
}: {
  sections: WorkbenchSectionDefinition[];
  active: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="workbenchSectionNav" role="tablist" aria-label={ariaLabel}>
      {sections.map((section, index) => (
        <button
          key={section.id}
          type="button"
          role="tab"
          aria-selected={active === section.id}
          className={active === section.id ? "active" : ""}
          onClick={() => onChange(section.id)}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{section.label}</strong>
          <small>{section.helper}</small>
          {section.badge !== undefined ? <em>{section.badge}</em> : null}
        </button>
      ))}
    </div>
  );
}

function sectionPaneClass(active: string, id: string) {
  return `workbenchSectionPane ${active === id ? "active" : ""}`;
}

function DataTable({
  rows,
  columns,
  empty = "暂无数据",
  onSelectRow,
  rowOffset = 0,
  showIndex = true
}: {
  rows: AnyRow[];
  columns: string[];
  empty?: string;
  onSelectRow?: (row: AnyRow) => void;
  rowOffset?: number;
  showIndex?: boolean;
}) {
  if (!rows.length) return <div className="empty">{empty}</div>;
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            {showIndex ? <th className="rowIndexCol">序号</th> : null}
            {columns.map((column) => <th key={column}>{columnLabels[column] || column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={String(row.id ?? `${index}-${columns[0]}`)}
              className={onSelectRow ? "selectableRow" : ""}
              role={onSelectRow ? "button" : undefined}
              tabIndex={onSelectRow ? 0 : undefined}
              onClick={() => onSelectRow?.(row)}
              onKeyDown={(event) => {
                if (!onSelectRow) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectRow(row);
                }
              }}
            >
              {showIndex ? <td className="rowIndexCell">{rowOffset + index + 1}</td> : null}
              {columns.map((column) => <td key={column}>{cellValue(row[column])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function makeAsset(type: string, row: AnyRow, titleKeys: string[], subtitleKeys: string[] = [], readOnly = false): AssetRef {
  const id = String(row.id || row.code || row.metric_id || row.target_ref || row.source_ref || "asset");
  const title = titleKeys.map((key) => row[key]).find((value) => value !== undefined && value !== null && String(value).trim()) || id;
  const subtitle = subtitleKeys.map((key) => row[key]).find((value) => value !== undefined && value !== null && String(value).trim());
  return {
    type,
    id,
    title: String(title),
    subtitle: subtitle ? String(subtitle) : undefined,
    fields: row,
    readOnly
  };
}

function aipObjectAsset(object: AipObject): AssetRef {
  return {
    type: "aip_object",
    id: object.id,
    title: object.display_name || object.object_key,
    subtitle: `${object.object_type} / ${object.risk_level} / health ${object.health_score}`,
    fields: {
      id: object.id,
      object_type: object.object_type,
      object_key: object.object_key,
      display_name: object.display_name,
      lifecycle_status: object.lifecycle_status,
      risk_level: object.risk_level,
      owner: object.owner,
      health_score: Number(object.health_score || 0),
      source_refs: safeFieldValue(object.source_refs),
      properties: safeFieldValue(object.properties),
      event_count: Number(object.event_count || 0),
      recommendation_count: Number(object.recommendation_count || 0),
      trace_count: Number(object.trace_count || 0)
    },
    readOnly: true
  };
}

function aipRecommendationAsset(recommendation: AipRecommendation): AssetRef {
  return {
    type: "aip_recommendation",
    id: recommendation.id,
    title: recommendation.recommendation_title,
    subtitle: `${recommendation.scenario_type} / ${recommendation.approval_status}`,
    fields: {
      id: recommendation.id,
      trace_id: recommendation.trace_id,
      target_object_type: recommendation.target_object_type,
      target_object_id: recommendation.target_object_id,
      scenario_type: recommendation.scenario_type,
      recommendation_title: recommendation.recommendation_title,
      recommendation_detail: recommendation.recommendation_detail,
      impact_summary: recommendation.impact_summary,
      evidence_refs: safeFieldValue(recommendation.evidence_refs),
      action_options: safeFieldValue(recommendation.action_options),
      action_tier: recommendation.action_tier,
      owner: recommendation.owner,
      priority: recommendation.priority,
      approval_status: recommendation.approval_status,
      workflow_id: recommendation.workflow_id,
      due_date: recommendation.due_date,
      reviewer: recommendation.reviewer,
      review_note: recommendation.review_note,
      created_at: recommendation.created_at,
      updated_at: recommendation.updated_at
    },
    readOnly: true
  };
}

function aipTraceAsset(trace: AipTrace): AssetRef {
  return {
    type: "aip_trace",
    id: trace.id,
    title: trace.question,
    subtitle: `${trace.intent} / ${trace.answerability}`,
    fields: {
      id: trace.id,
      session_id: trace.session_id,
      source_message_id: trace.source_message_id,
      intent: trace.intent,
      question: trace.question,
      target_object_type: trace.target_object_type,
      target_object_id: trace.target_object_id,
      target_metric_id: trace.target_metric_id,
      answerability: trace.answerability,
      answerability_score: Number(trace.answerability_score || 0),
      status: trace.status,
      evidence_refs: safeFieldValue(trace.evidence_refs),
      created_by: trace.created_by,
      created_at: trace.created_at
    },
    readOnly: true
  };
}

function aipEventAsset(event: AipEvent): AssetRef {
  return {
    type: "aip_event",
    id: event.id,
    title: event.event_title,
    subtitle: `${event.event_type} / ${event.severity}`,
    fields: {
      id: event.id,
      object_id: event.object_id,
      event_type: event.event_type,
      severity: event.severity,
      event_title: event.event_title,
      event_detail: event.event_detail,
      metric_refs: safeFieldValue(event.metric_refs),
      evidence_refs: safeFieldValue(event.evidence_refs),
      status: event.status,
      occurred_at: event.occurred_at
    },
    readOnly: true
  };
}

function defaultOperationTemplate(moduleId: string) {
  const templates: Record<string, { operationType: string; targetAssetType: string; title: string; summary: string; payload: Record<string, string> }> = {
    overview: {
      operationType: "risk_drilldown",
      targetAssetType: "governance_module",
      title: "治理风险下钻任务",
      summary: "将总览中发现的 SLA、质量或认证风险转为 owner 可审核的治理任务。",
      payload: { view: "overview", decision_boundary: "ledger_only" }
    },
    ontology: {
      operationType: "revision_request",
      targetAssetType: "ontology_object",
      title: "对象本体修订建议",
      summary: "对对象属性、关系解释或状态定义提出只读本体修订建议。",
      payload: { readonly: "true", action: "annotate_comment_revision_only" }
    },
    tags: {
      operationType: "rule_publish_request",
      targetAssetType: "tag",
      title: "标签规则发布审核",
      summary: "批量复核标签规则、适用对象、owner 和发布状态。",
      payload: { lifecycle: "draft_to_reviewed", validation: "target_object_required" }
    },
    dimensions: {
      operationType: "compatibility_check",
      targetAssetType: "dimension",
      title: "维度适配矩阵检查",
      summary: "复核维度层级、绑定对象与可用指标范围，沉淀冲突或缺失项。",
      payload: { compatibility_scope: "metric_dimension", conflict_policy: "review_before_publish" }
    },
    "metric-engineering": {
      operationType: "field_mapping_review",
      targetAssetType: "metric",
      title: "指标字段映射审核",
      summary: "对指标公式、物理字段映射、异常处理和影响范围发起审核。",
      payload: { canonical_metric_write: "false", review_scope: "formula_field_lineage" }
    },
    "metric-dictionary": {
      operationType: "dictionary_revision_request",
      targetAssetType: "metric",
      title: "指标字典同义词与问法修订",
      summary: "保持指标字典 2.0 只读，将口径、同义词或问法调整进入修订台账。",
      payload: { metric_dictionary_v2: "read_only", route: "revision_proposal" }
    },
    "kpi-system": {
      operationType: "mece_conflict_check",
      targetAssetType: "kpi_node",
      title: "指标体系 MECE 冲突检查",
      summary: "对 L0-L3 节点、归因路径和点击注解发起结构复核。",
      payload: { graph_scope: "L0_L3", check: "duplicate_gap_overlap" }
    },
    "lineage-quality": {
      operationType: "quality_batch_run",
      targetAssetType: "quality_rule",
      title: "质量规则批量执行",
      summary: "批量执行质量规则，生成问题、owner 任务和关闭复盘。",
      payload: { run_mode: "ledger_record", issue_policy: "task_required" }
    },
    chatbi: {
      operationType: "context_certification_review",
      targetAssetType: "chatbi_context",
      title: "ChatBI 上下文认证复核",
      summary: "对问法样本、可用维度、证据链和拒答原因做认证复核。",
      payload: { answer_policy: "certified_metric_only", sql_execution: "false" }
    },
    "ai-knowledge": {
      operationType: "kb_source_quality_review",
      targetAssetType: "kb_card",
      title: "知识卡质量复核",
      summary: "复核知识源、证据等级、过期风险和指标体系支撑关系。",
      payload: { score_dimensions: "completeness_evidence_freshness_usage" }
    },
    "ai-chat": {
      operationType: "question_feedback_review",
      targetAssetType: "ai_chat_message",
      title: "AI 问答反馈复核",
      summary: "将证据不足、冲突或用户反馈沉淀为问法样本和治理任务。",
      payload: { provider_calls: "false", feedback_loop: "required" }
    },
    "workflow-orchestration": {
      operationType: "cross_workbench_orchestration_review",
      targetAssetType: "workbench_module",
      title: "跨工作台编排复核",
      summary: "复核模块输入、输出、状态迁移、审批、注解、修订建议、导出和审计证据是否闭合。",
      payload: { import_allowed: "false", provider_calls: "false", erp_writeback: "false", orchestration_scope: "workflow_operation_candidate_ledger" }
    },
    "role-workbench": {
      operationType: "role_action_draft",
      targetAssetType: "role_workbench",
      title: "角色工作台行动草稿",
      summary: "围绕角色队列中的对象、事件和建议卡创建 L1 行动草稿，进入 Owner 审核。",
      payload: { provider_calls: "false", erp_writeback: "false", action_tier: "L1", source: "role_workbench" }
    },
    "decision-loop": {
      operationType: "action_replay_review",
      targetAssetType: "action_task",
      title: "决策动作复盘审核",
      summary: "复核洞察、建议、审批、任务、结果和复盘链路。",
      payload: { writeback_policy: "suggestion_approval_replay_only" }
    },
    "audit-log": {
      operationType: "audit_export_request",
      targetAssetType: "audit_event",
      title: "审计证据导出请求",
      summary: "对审计事件筛选、导出和保留策略提出受控操作请求。",
      payload: { append_only: "true", retention_policy: "pending_design" }
    }
  };
  return templates[moduleId] || templates.overview;
}

function workbenchFlowSpec(moduleId: string) {
  const specs: Record<string, { input: string; output: string; collaborators: string; guardrail: string; steps: Array<{ label: string; detail: string }> }> = {
    overview: {
      input: "治理资产状态、P0/P1 任务、知识库证据和模块健康度。",
      output: "管理驾驶舱、风险下钻任务、JSON/Excel 资产盘点快照。",
      collaborators: "管理层、数据治理 Owner、供应链域负责人。",
      guardrail: "只读总控，不直接改 canonical 资产。",
      steps: [
        { label: "盘点", detail: "汇总资产与任务进度" },
        { label: "搜索", detail: "AI 证据检索定位问题" },
        { label: "下钻", detail: "进入模块或任务中心" },
        { label: "复盘", detail: "导出管理快照" }
      ]
    },
    "ai-chat": {
      input: "三大供应链知识库、本地检索索引、已认证语义上下文。",
      output: "带证据链的回答、拒答原因、问法样本和反馈治理任务。",
      collaborators: "业务分析师、ChatBI Owner、知识库维护人。",
      guardrail: "local evidence only，不调用外部模型，不做自由 NL2SQL。",
      steps: [
        { label: "提问", detail: "选择知识域与对象上下文" },
        { label: "取证", detail: "返回证据片段和可答性" },
        { label: "沉淀", detail: "生成问法样本或反馈" },
        { label: "审核", detail: "语义 Owner 认证" }
      ]
    },
    "workflow-orchestration": {
      input: "所有工作台模块契约、workflow、operation、候选、注解、修订和审计事件。",
      output: "跨工作台编排画布、任务池、handoff 合同、审批状态和导出证据包。",
      collaborators: "治理 PMO、各工作台 Owner、数据产品经理。",
      guardrail: "只做本地 SQLite 编排和导出，不允许导入，不调用 provider，不写回 ERP/Jijia。",
      steps: [
        { label: "契约", detail: "定义输入/输出/协作" },
        { label: "编排", detail: "串联状态迁移和任务" },
        { label: "审核", detail: "Owner 批准或拒绝" },
        { label: "取证", detail: "导出 JSON/Excel 证据" }
      ]
    },
    "role-workbench": {
      input: "计划、采购、库存、物流、成本角色配置，对象队列、事件、建议卡、playbook 和 eval case。",
      output: "角色待办视图、L1 行动草稿、provider 启用前置边界和 eval 证据清单。",
      collaborators: "供应链角色 Owner、数据治理、ChatBI 语义 Owner。",
      guardrail: "只写本地工作台账本；provider 默认关闭；不写回积加/ERP。",
      steps: [
        { label: "分派", detail: "按角色聚合对象与风险" },
        { label: "诊断", detail: "查看事件、指标和证据" },
        { label: "草稿", detail: "生成 L1 行动建议" },
        { label: "评估", detail: "用 eval case 校验可答性" }
      ]
    },
    ontology: {
      input: "SKU、Listing、Supplier、PO、Warehouse 等对象与关系。",
      output: "Palantir 风格对象图谱、对象路径、注解和修订建议。",
      collaborators: "数据架构、供应链流程 Owner、指标 Owner。",
      guardrail: "本体只读，只允许注解、评论、修订建议。",
      steps: [
        { label: "浏览", detail: "按对象类型查看实例" },
        { label: "追踪", detail: "查看上下游关系路径" },
        { label: "注解", detail: "补充业务语义" },
        { label: "提案", detail: "提交本体修订建议" }
      ]
    },
    tags: {
      input: "规则标签、统计标签、模型标签候选与适用对象。",
      output: "标签规则审核任务、适用对象矩阵和导出清单。",
      collaborators: "运营策略、数据治理、对象 Owner。",
      guardrail: "标签先入候选台账，发布前必须 owner 审核。",
      steps: [
        { label: "定义", detail: "维护标签语义" },
        { label: "适配", detail: "绑定对象和维度" },
        { label: "审核", detail: "校验规则与阈值" },
        { label: "发布", detail: "进入认证状态" }
      ]
    },
    dimensions: {
      input: "一致性维度、分析维度、维度层级和主数据映射。",
      output: "维度适配矩阵、冲突清单、指标可用维度范围。",
      collaborators: "主数据 Owner、指标 Owner、BI 开发。",
      guardrail: "维度变更必须先评估指标影响。",
      steps: [
        { label: "建模", detail: "定义维度与层级" },
        { label: "映射", detail: "绑定对象主键" },
        { label: "适配", detail: "校验可用指标" },
        { label: "导出", detail: "输出维度清单" }
      ]
    },
    "metric-engineering": {
      input: "原子/派生/复合指标、公式、粒度、字段映射和质量规则。",
      output: "指标工程台账、字段血缘审核、异常处理说明。",
      collaborators: "指标 Owner、数仓开发、BI 分析师。",
      guardrail: "P0 指标发布前必须具备字段映射和质量规则。",
      steps: [
        { label: "建模", detail: "维护公式与粒度" },
        { label: "映射", detail: "绑定物理字段" },
        { label: "质检", detail: "配置异常规则" },
        { label: "认证", detail: "Owner 签字发布" }
      ]
    },
    "metric-dictionary": {
      input: "指标字典 2.0、口径、owner、同义词和常见问法。",
      output: "只读指标字典、修订建议、ChatBI 认证上下文。",
      collaborators: "指标 Owner、业务分析师、语义治理 Owner。",
      guardrail: "指标字典 2.0 保持不变，变更进入修订建议。",
      steps: [
        { label: "检索", detail: "查口径与 owner" },
        { label: "比对", detail: "识别同义或冲突" },
        { label: "建议", detail: "提交修订提案" },
        { label: "复用", detail: "供 ChatBI 引用" }
      ]
    },
    "kpi-system": {
      input: "MECE V2 L0-L3 指标、归因路径、权重和钻取关系。",
      output: "思维导图、Palantir 对象图谱、节点注解和 MECE 冲突任务。",
      collaborators: "管理层、指标体系 Owner、数据产品经理。",
      guardrail: "画布调整只改布局/注解，指标体系结构变更需审核。",
      steps: [
        { label: "理解", detail: "思维导图看 L0-L3" },
        { label: "工程", detail: "对象图谱看关系" },
        { label: "注解", detail: "点击节点补说明" },
        { label: "审计", detail: "MECE 冲突检查" }
      ]
    },
    "lineage-quality": {
      input: "字段血缘、指标血缘、DQ 规则、质量问题和影响范围。",
      output: "质量运行结果、问题单、影响分析和关闭证据。",
      collaborators: "数仓开发、质量 Owner、指标 Owner。",
      guardrail: "规则运行进入台账，不自动修复生产数据。",
      steps: [
        { label: "定义", detail: "维护质量规则" },
        { label: "执行", detail: "生成质量问题" },
        { label: "归因", detail: "查看血缘影响" },
        { label: "关闭", detail: "记录修复复盘" }
      ]
    },
    chatbi: {
      input: "认证指标、可用维度、问法样本和证据链。",
      output: "可回答性判断、认证上下文、拒答原因和 dry-run 结果。",
      collaborators: "ChatBI Owner、指标 Owner、AI 治理人员。",
      guardrail: "只允许 certified 语义资产进入正式回答。",
      steps: [
        { label: "编排", detail: "维护上下文" },
        { label: "试问", detail: "dry-run 可答性" },
        { label: "认证", detail: "审核通过" },
        { label: "服务", detail: "供 AI 对话使用" }
      ]
    },
    "ai-knowledge": {
      input: "SCM 主知识库、备货规则知识库、业务知识库。",
      output: "主题域知识卡、证据质量评分、指标 crosswalk。",
      collaborators: "知识库维护人、供应链专家、指标 Owner。",
      guardrail: "知识卡可检索，正式口径仍以认证指标和 owner 为准。",
      steps: [
        { label: "整理", detail: "按主题域归档" },
        { label: "评分", detail: "检查证据质量" },
        { label: "映射", detail: "关联指标/对象" },
        { label: "导出", detail: "输出知识快照" }
      ]
    },
    "decision-loop": {
      input: "洞察、建议、审批、任务、执行结果和复盘。",
      output: "行动任务、状态流转、复盘证据和决策日志。",
      collaborators: "管理层、业务负责人、执行 Owner。",
      guardrail: "建议 + 审批 + 复盘，不默认自动写回业务系统。",
      steps: [
        { label: "洞察", detail: "记录问题与建议" },
        { label: "审批", detail: "确认动作边界" },
        { label: "执行", detail: "跟踪任务状态" },
        { label: "复盘", detail: "回写结果证据" }
      ]
    },
    "audit-log": {
      input: "所有 create/update/review/approve 审计事件。",
      output: "审计筛选结果、证据导出、责任链回看。",
      collaborators: "数据治理、审计、系统 Owner。",
      guardrail: "append-only 审计，不允许前端删除历史。",
      steps: [
        { label: "筛选", detail: "按事件和资产过滤" },
        { label: "回看", detail: "查看 payload" },
        { label: "导出", detail: "输出证据包" },
        { label: "复盘", detail: "支撑追责与改进" }
      ]
    }
  };
  return specs[moduleId] || specs.overview;
}

function ExportActions({ module }: { module: WorkbenchModule }) {
  const base = `/api/export/${encodeURIComponent(module.id)}`;
  return (
    <div className="exportActions" aria-label={`${module.title} export actions`}>
      <a href={`${base}?format=json`} className="textButton" target="_blank" rel="noreferrer">导出 JSON</a>
      <a href={`${base}?format=excel`} className="textButton" target="_blank" rel="noreferrer">导出 Excel</a>
    </div>
  );
}

function WorkbenchFlowStrip({ module }: { module: WorkbenchModule }) {
  const spec = workbenchFlowSpec(module.id);
  return (
    <div className="workbenchFlowStrip">
      <div className="flowSectionHead">
        <div>
          <p className="eyebrow">Workflow contract</p>
          <h3>输入、处理、输出与协作边界</h3>
        </div>
        <Badge tone="blue">{module.stage}</Badge>
      </div>
      <div className="flowMeta">
        <div>
          <span>输入</span>
          <strong>{spec.input}</strong>
        </div>
        <div>
          <span>输出</span>
          <strong>{spec.output}</strong>
        </div>
        <div>
          <span>协作</span>
          <strong>{spec.collaborators}</strong>
        </div>
        <div>
          <span>边界</span>
          <strong>{spec.guardrail}</strong>
        </div>
      </div>
      <div className="flowSteps">
        {spec.steps.map((step, index) => (
          <div key={`${step.label}-${index}`} className="flowStep">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.label}</strong>
            <small>{step.detail}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkbenchOperationDock({ module }: { module: WorkbenchModule }) {
  const template = useMemo(() => defaultOperationTemplate(module.id), [module.id]);
  const [refresh, setRefresh] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({ status: "", operationType: "", q: "" });
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    operationType: template.operationType,
    targetAssetType: template.targetAssetType,
    targetAssetIds: "",
    operationTitle: template.title,
    operationSummary: template.summary,
    owner: "data_governance",
    priority: "P1",
    operationPayload: JSON.stringify(template.payload, null, 2)
  });
  useEffect(() => {
    setForm({
      operationType: template.operationType,
      targetAssetType: template.targetAssetType,
      targetAssetIds: "",
      operationTitle: template.title,
      operationSummary: template.summary,
      owner: "data_governance",
      priority: "P1",
      operationPayload: JSON.stringify(template.payload, null, 2)
    });
    setSelectedIds([]);
    setFilters({ status: "", operationType: "", q: "" });
  }, [module.id, template]);
  const operationPath = useMemo(() => {
    const params = new URLSearchParams({ moduleId: module.id, limit: "40", refresh: String(refresh) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `/api/workbench/operations?${params.toString()}`;
  }, [module.id, filters, refresh]);
  const operations = useApi<WorkbenchOperation[]>(operationPath, []);

  async function submitOperation(event: React.FormEvent) {
    event.preventDefault();
    let operationPayload: unknown = form.operationPayload;
    try {
      operationPayload = JSON.parse(form.operationPayload || "{}");
    } catch {
      operationPayload = { raw: form.operationPayload };
    }
    const result = await api<{ ok: boolean; operation: WorkbenchOperation }>("/api/workbench/operations", {
      method: "POST",
      body: JSON.stringify({
        moduleId: module.id,
        operationType: form.operationType,
        targetAssetType: form.targetAssetType,
        targetAssetIds: form.targetAssetIds,
        operationTitle: form.operationTitle,
        operationSummary: form.operationSummary,
        operationPayload,
        owner: form.owner,
        priority: form.priority,
        createdBy: "local_user"
      })
    });
    setNote(`已创建操作 ${result.operation.id}，关联 workflow ${result.operation.workflow_id}`);
    setExpanded(true);
    setRefresh((value) => value + 1);
  }

  async function reviewOperation(operation: WorkbenchOperation, status: "approved" | "rejected") {
    await api(`/api/workbench/operations/${encodeURIComponent(operation.id)}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: `Workbench operation marked as ${status} from ${module.id}.`
      })
    });
    setNote(`操作 ${operation.id} 已更新为 ${status}`);
    setRefresh((value) => value + 1);
  }

  async function bulkReview(status: "approved" | "rejected") {
    if (!selectedIds.length) return;
    await api("/api/workbench/operations/bulk-review", {
      method: "POST",
      body: JSON.stringify({
        ids: selectedIds,
        status,
        reviewer: "local_user",
        note: `${module.id} bulk operation review: ${status}`
      })
    });
    setNote(`已批量更新 ${selectedIds.length} 个操作为 ${status}`);
    setSelectedIds([]);
    setRefresh((value) => value + 1);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="moduleOpsPanel">
      <div className="moduleOpsSummary">
        <div>
          <p className="eyebrow">Workbench operations</p>
          <h3>工作台操作闭环</h3>
        </div>
        <div className="badgeCluster">
          <Badge tone="blue">{operations.data.length} ops</Badge>
          <button className="textButton" onClick={() => setExpanded((value) => !value)}>{expanded ? "收起" : "展开"}</button>
        </div>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      {expanded ? (
        <div className="moduleOpsBody">
          <form className="moduleOpsForm" onSubmit={submitOperation}>
            <div className="formGrid">
              <label>
                操作类型
                <input value={form.operationType} onChange={(event) => setForm({ ...form, operationType: event.target.value })} required />
              </label>
              <label>
                目标资产类型
                <input value={form.targetAssetType} onChange={(event) => setForm({ ...form, targetAssetType: event.target.value })} />
              </label>
              <label>
                优先级
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
              </label>
            </div>
            <label>
              操作标题
              <input value={form.operationTitle} onChange={(event) => setForm({ ...form, operationTitle: event.target.value })} required />
            </label>
            <label>
              目标资产 ID
              <textarea value={form.targetAssetIds} onChange={(event) => setForm({ ...form, targetAssetIds: event.target.value })} placeholder="可用逗号或换行分隔" />
            </label>
            <label>
              操作说明
              <textarea value={form.operationSummary} onChange={(event) => setForm({ ...form, operationSummary: event.target.value })} required />
            </label>
            <label>
              操作载荷 JSON
              <textarea value={form.operationPayload} onChange={(event) => setForm({ ...form, operationPayload: event.target.value })} />
            </label>
            <button type="submit">创建操作并进入 workflow</button>
          </form>
          <div className="moduleOpsList">
            <div className="workflowFilters compactFilters">
              <label>
                状态
                <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                  <option value="">全部</option>
                  <option value="review_pending">review_pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </label>
              <label>
                类型
                <input value={filters.operationType} onChange={(event) => setFilters({ ...filters, operationType: event.target.value })} placeholder={template.operationType} />
              </label>
              <label>
                搜索
                <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="标题 / 说明 / 资产" />
              </label>
            </div>
            <div className="bulkActionBar compact">
              <button className="textButton" onClick={() => setSelectedIds(selectedIds.length === operations.data.length ? [] : operations.data.map((item) => item.id))}>
                {selectedIds.length === operations.data.length && operations.data.length ? "取消全选" : "选择可见项"}
              </button>
              <span>{selectedIds.length} selected</span>
              <button className="textButton" disabled={!selectedIds.length} onClick={() => bulkReview("approved")}>批量批准</button>
              <button className="textButton" disabled={!selectedIds.length} onClick={() => bulkReview("rejected")}>批量拒绝</button>
            </div>
            <div className="operationCards">
              {operations.data.length ? operations.data.map((operation) => (
                <article className="operationCard" key={operation.id}>
                  <div className="ledgerItemHead">
                    <label className="checkRow">
                      <input type="checkbox" checked={selectedIds.includes(operation.id)} onChange={() => toggleSelected(operation.id)} />
                      <strong>{operation.operation_title}</strong>
                    </label>
                    <Badge tone={toneFromStatus(operation.status)}>{operation.status}</Badge>
                  </div>
                  <p>{operation.operation_summary}</p>
                  <small>{operation.operation_type} / {operation.target_asset_type || "--"} / {operation.workflow_id}</small>
                  <div className="qualityActions">
                    {!["approved", "rejected", "closed", "done"].includes(operation.status) ? (
                      <>
                        <button className="textButton" onClick={() => reviewOperation(operation, "approved")}>批准</button>
                        <button className="textButton" onClick={() => reviewOperation(operation, "rejected")}>拒绝</button>
                      </>
                    ) : <span className="muted">reviewed by {operation.reviewer || "--"}</span>}
                  </div>
                </article>
              )) : <div className="empty compact">暂无操作台账。</div>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ModuleHeader({ module, eyebrow }: { module: WorkbenchModule; eyebrow?: string }) {
  return (
    <div className="moduleHeaderStack">
      <div className="moduleHeader">
        <div className="moduleTitleBlock">
          <p className="eyebrow">{eyebrow || `${module.stage} / ${module.code}`}</p>
          <h2>{module.title}</h2>
          <p className="muted">{module.focus}</p>
        </div>
        <div className="moduleSignal">
          <Badge tone={toneFromStatus(module.status)}>{module.status}</Badge>
          <strong>{module.primaryMetric}</strong>
          <span>{module.secondaryMetric}</span>
          <ExportActions module={module} />
        </div>
      </div>
      <WorkbenchFlowStrip module={module} />
      <WorkbenchOperationDock module={module} />
    </div>
  );
}

function AipScenarioBoard({ onOpenAsset }: { onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [runningId, setRunningId] = useState("");
  const [note, setNote] = useState("");
  const scenarios = useApi<AipScenario[]>(`/api/aip/scenarios?refresh=${refresh}`, []);

  async function runScenario(scenario: AipScenario) {
    setRunningId(scenario.id);
    setNote("");
    try {
      const payload = await api<{ ok: boolean; trace: AipTrace; recommendation: AipRecommendation }>(`/api/aip/scenarios/${encodeURIComponent(scenario.id)}/run`, {
        method: "POST",
        body: JSON.stringify({ actor: "local_user" })
      });
      setNote(`场景 ${scenario.title} 已生成 trace ${payload.trace.id} 和建议卡 ${payload.recommendation.id}。`);
      onOpenAsset(aipRecommendationAsset(payload.recommendation));
      setRefresh((value) => value + 1);
    } catch (err) {
      setNote(`运行场景失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunningId("");
    }
  }

  return (
    <div className="scenarioSelector">
      <div className="surfaceHead">
        <div>
          <p className="eyebrow">AIP scenario closed loop</p>
          <h3>三大供应链场景闭环</h3>
          <p className="muted">场景卡把对象、事件、指标、证据、trace 和建议卡串起来；当前动作只写入治理 ledger。</p>
        </div>
        <Badge tone="blue">{scenarios.data.length} scenarios</Badge>
      </div>
      {note ? <div className="kbNotice compact">{note}</div> : null}
      {scenarios.error ? <div className="error compact">{scenarios.error}</div> : null}
      <div className="scenarioGrid">
        {scenarios.data.map((scenario) => (
          <article className="aipScenarioCard scenarioCard" data-scenario={scenario.id} key={scenario.id}>
            <div className="scenarioCardHead">
              <div>
                <span>{scenario.subtitle}</span>
                <h4>{scenario.title}</h4>
              </div>
              <Badge tone={toneFromStatus(scenario.priority)}>{scenario.priority}</Badge>
            </div>
            <p>{scenario.description}</p>
            <div className="scenarioPath">
              {scenario.pathNarrative.map((node) => <span key={`${scenario.id}-${node}`}>{node}</span>)}
            </div>
            <div className="scenarioSignals">
              <div><span>对象健康</span><strong>{Math.round(Number(scenario.healthScore || 0))}</strong></div>
              <div><span>事件</span><strong>{scenario.events.length}</strong></div>
              <div><span>Trace</span><strong>{scenario.traces.length}</strong></div>
              <div><span>建议卡</span><strong>{scenario.recommendations.length}</strong></div>
            </div>
            <div className="scenarioRule">
              <strong>规则口径</strong>
              <span>{scenario.ruleSummary}</span>
            </div>
            <div className="scenarioActions">
              <button className="textButton" disabled={!scenario.object} onClick={() => scenario.object && onOpenAsset(aipObjectAsset(scenario.object))}>打开对象</button>
              <button className="textButton scenarioRunButton" disabled={runningId === scenario.id} onClick={() => runScenario(scenario)}>
                {runningId === scenario.id ? "运行中..." : "生成 Trace + 建议卡"}
              </button>
            </div>
          </article>
        ))}
        {!scenarios.data.length ? <div className="empty compact">暂无场景定义。</div> : null}
      </div>
    </div>
  );
}

function MissionHero({
  overview,
  modules,
  onSelect,
  onOpenAsset
}: {
  overview: Overview;
  modules: WorkbenchModule[];
  onSelect: (id: string) => void;
  onOpenAsset: (asset: AssetRef) => void;
}) {
  const certified = modules.find((module) => module.id === "metric-engineering")?.secondaryMetric || "--";
  const l3 = overview.levels.find((item) => item.level === "L3")?.count || 0;
  const taskTotal = overview.tasks.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const taskDone = overview.tasks
    .filter((item) => ["已签字", "certified", "done", "approved", "closed"].includes(item.status))
    .reduce((sum, item) => sum + Number(item.count || 0), 0);
  const taskProgress = taskTotal ? Math.round((taskDone / taskTotal) * 100) : 0;
  const coreModules = modules.filter((module) => !["overview", "ai-chat"].includes(module.id)).slice(0, 6);
  const [question, setQuestion] = useState("请评估当前供应链指标治理最需要优先处理的风险。");
  const [result, setResult] = useState<AiChatResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const deploy = useApi<DeployHealth>("/api/deploy/health", {
    ok: false,
    service: "scm-data-governance-workbench",
    runtime: "--",
    host: "--",
    port: 0,
    launchedAt: "",
    staticBuild: false,
    deployment: {
      releaseId: "loading",
      gitSha: "unknown",
      dataMountType: "unknown",
      dataVolumeName: "",
      dataMountPath: ""
    },
    boundary: {
      productionWrites: false,
      providerCalls: false,
      erpWriteback: false,
      chatbiPolicy: "certified_metric_only"
    }
  });
  const aip = useApi<AipSummary>("/api/aip/summary", {
    schemaReady: false,
    objectInstances: 0,
    identityLinks: 0,
    objectEvents: 0,
    traces: 0,
    traceSteps: 0,
    recommendations: 0,
    recommendationTransitions: 0,
    actionPolicyTiers: 0,
    providerCalls: false,
    erpWriteback: false,
    objectsByType: [],
    riskBuckets: [],
    eventBuckets: [],
    recommendationBuckets: [],
    topRiskObjects: [],
    openRecommendations: [],
    policyTiers: []
  });

  async function askFromCockpit(event: React.FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setRunning(true);
    setError("");
    try {
      const payload = await api<{ ok: boolean; result: AiChatResult }>("/api/ai-chat/local", {
        method: "POST",
        body: JSON.stringify({ question, domainIds: [], limit: 5 })
      });
      setResult(payload.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  const inventoryItems = [
    { label: "对象本体", value: overview.counts.ontologyObjects || 0, total: Math.max(1, (overview.counts.ontologyObjects || 0) + (overview.counts.ontologyLinks || 0)), note: `${overview.counts.ontologyLinks || 0} links` },
    { label: "指标资产", value: overview.counts.metrics || 0, total: Math.max(overview.counts.metrics || 0, 178), note: `${l3} L3 / ${certified}` },
    { label: "知识证据", value: overview.counts.kbCards || 0, total: Math.max(overview.counts.kbCards || 0, 295), note: `${overview.counts.kbSources || 0} sources` },
    { label: "治理任务", value: taskDone, total: Math.max(1, taskTotal), note: `${taskProgress}% closed` }
  ];
  const releaseId = deploy.data.deployment.releaseId || "unknown";
  const gitSha = deploy.data.deployment.gitSha || "unknown";
  const shortSha = gitSha === "unknown" ? gitSha : gitSha.slice(0, 7);
  const mountName = deploy.data.deployment.dataVolumeName || deploy.data.deployment.dataMountPath || "--";

  return (
    <section className="missionHero aipCommandCenter">
      <div className="cockpitLead">
        <div className="heroCopy">
          <p className="eyebrow">Management cockpit</p>
          <h1>供应链数据开发治理驾驶舱</h1>
          <p>
            第一屏聚合 AI 证据搜索、资产盘点、治理任务中心和模块入口；所有动作遵循认证语义层与 ledger 审核边界。
          </p>
        </div>
        <form className="cockpitSearch" onSubmit={askFromCockpit}>
          <div className="surfaceHead">
            <h3>AI 搜索对话</h3>
            <Badge tone="blue">local evidence only</Badge>
          </div>
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
          <div className="cockpitSearchActions">
            <button type="submit" disabled={running}>{running ? "检索中..." : "搜索知识库"}</button>
            <button type="button" className="secondaryButton" onClick={() => onSelect("ai-chat")}>进入 AI 对话</button>
          </div>
          {error ? <div className="error">{error}</div> : null}
          {result ? (
            <div className="cockpitAnswer">
              <div>
                <Badge tone={toneFromStatus(result.answerability)}>{result.answerability}</Badge>
                <span>{Math.round(result.answerabilityScore)} / 100</span>
                <span>{result.evidence.length} evidence</span>
              </div>
              <p>{result.answer}</p>
            </div>
          ) : null}
        </form>
        <div className="aipCommandGrid">
          <div className="aipRiskQueue">
            <div className="surfaceHead">
              <div>
                <p className="eyebrow">AIP risk queue</p>
                <h3>高风险对象队列</h3>
              </div>
              <Badge tone={aip.data.schemaReady ? "good" : "warn"}>{aip.data.objectInstances} objects</Badge>
            </div>
            {aip.error ? <div className="error compact">{aip.error}</div> : null}
            <div className="aipQueueList">
              {(aip.data.topRiskObjects || []).slice(0, 4).map((object) => (
                <button key={object.id} className="aipQueueCard" onClick={() => onOpenAsset(aipObjectAsset(object))}>
                  <span>
                    <strong>{object.display_name}</strong>
                    <small>{object.object_type} / {object.object_key}</small>
                  </span>
                  <Badge tone={toneFromStatus(object.risk_level)}>{object.risk_level}</Badge>
                  <ScoreLine score={Number(object.health_score || 0)} />
                  <small>{Number(object.event_count || 0)} events / {Number(object.recommendation_count || 0)} cards / {Number(object.trace_count || 0)} traces</small>
                </button>
              ))}
              {!aip.data.topRiskObjects?.length ? <div className="empty compact">暂无 AIP 对象实例；先运行本地迁移或 seed。</div> : null}
            </div>
          </div>
          <div className="recommendationQueue aipRecommendationQueue">
            <div className="surfaceHead">
              <div>
                <p className="eyebrow">Recommendation queue</p>
                <h3>待处理行动建议</h3>
              </div>
              <Badge tone={aip.data.erpWriteback ? "bad" : "good"}>{aip.data.erpWriteback ? "writeback on" : "no writeback"}</Badge>
            </div>
            <div className="aipQueueList">
              {(aip.data.openRecommendations || []).slice(0, 4).map((recommendation) => (
                <button key={recommendation.id} className="aipQueueCard recommendationCardMini" onClick={() => onOpenAsset(aipRecommendationAsset(recommendation))}>
                  <span>
                    <strong>{recommendation.recommendation_title}</strong>
                    <small>{recommendation.scenario_type} / {recommendation.owner}</small>
                  </span>
                  <div className="badgeCluster">
                    <Badge tone={toneFromStatus(recommendation.approval_status)}>{recommendation.approval_status}</Badge>
                    <Badge tone={toneFromStatus(recommendation.action_tier)}>{recommendation.action_tier}</Badge>
                  </div>
                  <p>{recommendation.impact_summary || recommendation.recommendation_detail}</p>
                </button>
              ))}
              {!aip.data.openRecommendations?.length ? <div className="empty compact">暂无建议卡。Agent Trace 或手工诊断后会进入这里。</div> : null}
            </div>
            <div className="aipBoundaryLine">
              <span>provider {aip.data.providerCalls ? "on" : "off"}</span>
              <span>writeback {aip.data.erpWriteback ? "on" : "off"}</span>
              <span>{aip.data.actionPolicyTiers} action tiers</span>
            </div>
          </div>
        </div>
      </div>
      <div className="cockpitSide">
        <div className="assetProgressPanel">
          <div className="sectionLabel">
            <span>Inventory</span>
            <strong>资产状态与盘点进度</strong>
          </div>
          {inventoryItems.map((item) => (
            <div className="assetProgressItem" key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.value} / {item.total}</span>
              </div>
              <ScoreLine score={Math.min(100, Math.round((item.value / item.total) * 100))} />
              <small>{item.note}</small>
            </div>
          ))}
        </div>
        <div className="taskCenterPanel">
          <div className="sectionLabel">
            <span>Tasks</span>
            <strong>治理任务中心</strong>
          </div>
          <div className="taskStatusList">
            {overview.tasks.slice(0, 5).map((task) => (
              <div key={task.status}>
                <span>{task.status}</span>
                <strong>{task.count}</strong>
              </div>
            ))}
            {!overview.tasks.length ? <div><span>暂无任务</span><strong>0</strong></div> : null}
          </div>
        </div>
        <div className="releaseStatusPanel">
          <div className="sectionLabel">
            <span>Operations</span>
            <strong>部署与数据账本状态</strong>
          </div>
          <div className="releaseStatusHeader">
            <Badge tone={deploy.data.ok ? "good" : "warn"}>{deploy.loading ? "checking" : deploy.data.ok ? "healthy" : "unverified"}</Badge>
            <span>{deploy.data.service}</span>
          </div>
          {deploy.error ? <div className="error compact">{deploy.error}</div> : null}
          <div className="releaseMetaGrid">
            <div className="releaseMetaItem">
              <span>release</span>
              <strong>{releaseId}</strong>
            </div>
            <div className="releaseMetaItem">
              <span>git SHA</span>
              <strong>{shortSha}</strong>
            </div>
            <div className="releaseMetaItem">
              <span>data mount</span>
              <strong>{deploy.data.deployment.dataMountType}</strong>
            </div>
            <div className="releaseMetaItem">
              <span>ledger volume</span>
              <strong>{mountName}</strong>
            </div>
          </div>
          <div className="releaseBoundaryLine">
            <span>provider {deploy.data.boundary.providerCalls ? "on" : "off"}</span>
            <span>ERP writeback {deploy.data.boundary.erpWriteback ? "on" : "off"}</span>
            <span>{deploy.data.boundary.chatbiPolicy}</span>
          </div>
        </div>
        <div className="moduleLaunchGrid">
          {coreModules.map((module) => (
            <button key={module.id} onClick={() => onSelect(module.id)}>
              <span>{module.code}</span>
              <strong>{module.title}</strong>
              <small>{module.primaryMetric}</small>
            </button>
          ))}
        </div>
      </div>
      <AipScenarioBoard onOpenAsset={onOpenAsset} />
    </section>
  );
}

function ArchitectureRail({ layers }: { layers: string[] }) {
  return (
    <section className="railPanel">
      <div className="sectionLabel">
        <span>Architecture</span>
        <strong>九层递进式治理架构</strong>
      </div>
      <div className="layerRail">
        {layers.map((layer, index) => (
          <div className="layerNode" key={layer}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{layer}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModuleGrid({ modules, onSelect }: { modules: WorkbenchModule[]; onSelect: (id: string) => void }) {
  const modulePager = usePagination<WorkbenchModule>(modules.slice(1), 6);

  return (
    <div className="moduleGridPager">
      <section className="moduleGrid">
        {modulePager.pageItems.map((module, index) => (
          <button className="moduleCard" key={module.id} onClick={() => onSelect(module.id)}>
            <div className="moduleTop">
              <span>{String(modulePager.startIndex + index + 1).padStart(2, "0")} · {module.code}</span>
              <Badge tone={toneFromStatus(module.status)}>{module.status}</Badge>
            </div>
            <strong>{module.title}</strong>
            <p>{module.focus}</p>
            <ScoreLine score={module.score} />
            <div className="moduleMetrics">
              <span>{module.primaryMetric}</span>
              <span>{module.secondaryMetric}</span>
            </div>
          </button>
        ))}
      </section>
      <PaginationBar pager={modulePager} label="工作台模块地图" />
    </div>
  );
}

function OverviewPanel({
  overview,
  modules,
  onSelect,
  onOpenAsset
}: {
  overview: Overview;
  modules: WorkbenchModule[];
  onSelect: (id: string) => void;
  onOpenAsset: (asset: AssetRef) => void;
}) {
  const overviewModule = modules.find((module) => module.id === "overview") || fallbackModules[0];
  const [activeOverviewSection, setActiveOverviewSection] = useState("cockpit");
  const overviewSections = [
    { id: "cockpit", label: "驾驶舱", helper: "AI 搜索、资产状态、治理边界", badge: overview.tasks.length },
    { id: "architecture", label: "架构地图", helper: "九层治理与工作台入口", badge: overview.architectureLayers?.length || 0 },
    { id: "readiness", label: "成熟度", helper: "模块健康扫描与缺口", badge: overview.moduleHealth?.length || 0 },
    { id: "tasks", label: "治理任务", helper: "候选资产、审批、SLA", badge: overview.counts.governanceTasks || 0 }
  ];
  return (
    <div className="stack">
      <MissionHero overview={overview} modules={modules} onSelect={onSelect} onOpenAsset={onOpenAsset} />
      <WorkbenchSectionNav
        sections={overviewSections}
        active={activeOverviewSection}
        onChange={setActiveOverviewSection}
        ariaLabel="治理链路总览页面分区"
      />
      <div className={sectionPaneClass(activeOverviewSection, "cockpit")}>
        <div className="overviewControlBar">
          <WorkbenchFlowStrip module={overviewModule} />
          <div className="overviewExportCard">
            <p className="eyebrow">Export</p>
            <h3>只读导出</h3>
            <p className="muted">不允许导入；支持管理驾驶舱当前模块的 JSON 和 Excel 快照。</p>
            <ExportActions module={overviewModule} />
          </div>
        </div>
        <WorkbenchOperationDock module={overviewModule} />
      </div>
      <div className={sectionPaneClass(activeOverviewSection, "architecture")}>
        <ArchitectureRail layers={overview.architectureLayers || []} />
        <section className="panel">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Workbench map</p>
              <h2>十个工作台模块</h2>
            </div>
            <Badge tone="good">Certified semantic first</Badge>
          </div>
          <ModuleGrid modules={modules} onSelect={onSelect} />
        </section>
      </div>
      <div className={sectionPaneClass(activeOverviewSection, "readiness")}>
        <section className="panel">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Readiness</p>
              <h2>治理成熟度扫描</h2>
            </div>
            <Badge>sample seeded</Badge>
          </div>
          <div className="readinessGrid">
            {overview.moduleHealth?.map((item) => (
              <div className="readinessItem" key={item.module}>
                <div>
                  <strong>{item.module}</strong>
                  <Badge tone={toneFromStatus(item.status)}>{item.status}</Badge>
                </div>
                <ScoreLine score={item.score} />
                <p>{item.note}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className={sectionPaneClass(activeOverviewSection, "tasks")}>
        <WorkflowBoard onOpenAsset={onOpenAsset} />
      </div>
    </div>
  );
}

function WorkflowBoard({ onOpenAsset }: { onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    owner: "",
    moduleId: "",
    priority: "",
    slaStatus: "",
    q: ""
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const workflowPath = useMemo(() => {
    const params = new URLSearchParams({ limit: "80", refresh: String(refresh) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `/api/workflows?${params.toString()}`;
  }, [filters, refresh]);
  const summary = useApi<any>(`/api/workflows/summary?refresh=${refresh}`, {
    total: 0,
    byStatus: [],
    byPriority: [],
    byModule: [],
    byOwner: [],
    bySla: [],
    candidates: { total: 0, byType: [] },
    openWorkflows: []
  });
  const workflows = useApi<WorkflowInstance[]>(workflowPath, []);
  const [note, setNote] = useState("");
  const workflowPager = usePagination<WorkflowInstance>(workflows.data, 6);

  useEffect(() => {
    workflowPager.setPage(1);
  }, [filters.status, filters.owner, filters.moduleId, filters.priority, filters.slaStatus, filters.q]);

  async function reviewWorkflow(workflow: WorkflowInstance, status: string) {
    await api(`/api/workflows/${encodeURIComponent(workflow.id)}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        note: `P1 workflow board marked workflow as ${status}.`
      })
    });
    setNote(`Workflow ${workflow.id} 已更新为 ${status}`);
    setRefresh((value) => value + 1);
  }

  async function bulkReview(status: string) {
    if (!selectedIds.length) return;
    await api("/api/workflows/bulk-review", {
      method: "POST",
      body: JSON.stringify({
        ids: selectedIds,
        status,
        reviewer: "local_user",
        note: `P1 workflow board bulk marked ${selectedIds.length} workflows as ${status}.`
      })
    });
    setNote(`已批量更新 ${selectedIds.length} 个 workflow 为 ${status}`);
    setSelectedIds([]);
    setRefresh((value) => value + 1);
  }

  function toggleWorkflow(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function selectVisible() {
    const ids = workflowPager.pageItems.map((workflow) => workflow.id);
    const allPageSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds(allPageSelected ? selectedIds.filter((id) => !ids.includes(id)) : Array.from(new Set([...selectedIds, ...ids])));
  }

  return (
    <section className="panel">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">P1 workflow board</p>
          <h2>候选资产与治理任务板</h2>
        </div>
        <Badge tone="blue">{summary.data.total} workflows</Badge>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      <div className="workflowSummaryGrid">
        <div>
          <span>Open tasks</span>
          <strong>{summary.data.openWorkflows?.length || 0}</strong>
          <small>latest visible</small>
        </div>
        <div>
          <span>Candidates</span>
          <strong>{summary.data.candidates?.total || 0}</strong>
          <small>{summary.data.candidates?.byType?.map((item: AnyRow) => `${item.candidate_type}:${item.count}`).join(" / ") || "no candidates"}</small>
        </div>
        <div>
          <span>Modules</span>
          <strong>{summary.data.byModule?.length || 0}</strong>
          <small>{summary.data.byStatus?.map((item: AnyRow) => `${item.status}:${item.count}`).join(" / ") || "no workflow"}</small>
        </div>
        <div>
          <span>SLA risk</span>
          <strong>{summary.data.bySla?.find((item: AnyRow) => item.status === "overdue")?.count || 0}</strong>
          <small>{summary.data.bySla?.map((item: AnyRow) => `${item.status}:${item.count}`).join(" / ") || "no SLA"}</small>
        </div>
      </div>
      <div className="workflowFilters">
        <label>
          状态
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">全部</option>
            {summary.data.byStatus?.map((item: AnyRow) => <option key={String(item.status)} value={String(item.status)}>{String(item.status)}</option>)}
          </select>
        </label>
        <label>
          模块
          <select value={filters.moduleId} onChange={(event) => setFilters({ ...filters, moduleId: event.target.value })}>
            <option value="">全部</option>
            {summary.data.byModule?.map((item: AnyRow) => <option key={String(item.module_id)} value={String(item.module_id)}>{String(item.module_id || "governance")}</option>)}
          </select>
        </label>
        <label>
          优先级
          <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
            <option value="">全部</option>
            {summary.data.byPriority?.map((item: AnyRow) => <option key={String(item.priority)} value={String(item.priority)}>{String(item.priority)}</option>)}
          </select>
        </label>
        <label>
          Owner
          <select value={filters.owner} onChange={(event) => setFilters({ ...filters, owner: event.target.value })}>
            <option value="">全部</option>
            {summary.data.byOwner?.map((item: AnyRow) => <option key={String(item.owner)} value={String(item.owner)}>{String(item.owner || "--")}</option>)}
          </select>
        </label>
        <label>
          SLA
          <select value={filters.slaStatus} onChange={(event) => setFilters({ ...filters, slaStatus: event.target.value })}>
            <option value="">全部</option>
            {summary.data.bySla?.map((item: AnyRow) => <option key={String(item.status)} value={String(item.status)}>{String(item.status)}</option>)}
          </select>
        </label>
        <label className="workflowSearch">
          搜索
          <input value={filters.q} placeholder="标题 / 编码 / source" onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
        </label>
      </div>
      <div className="bulkActionBar">
        <button className="textButton" onClick={selectVisible}>选择本页</button>
        <span>{selectedIds.length} selected / {workflows.data.length} total</span>
        <button className="textButton" disabled={!selectedIds.length} onClick={() => bulkReview("approved")}>批量批准</button>
        <button className="textButton" disabled={!selectedIds.length} onClick={() => bulkReview("rejected")}>批量拒绝</button>
        <button className="textButton" onClick={() => setFilters({ status: "", owner: "", moduleId: "", priority: "", slaStatus: "", q: "" })}>重置筛选</button>
      </div>
      <div className="workflowCards">
        {workflows.data.length ? workflowPager.pageItems.map((workflow, index) => (
          <article className="workflowCard" key={workflow.id}>
            <div className="ledgerItemHead">
              <label className="checkRow">
                <input type="checkbox" checked={selectedIds.includes(workflow.id)} onChange={() => toggleWorkflow(workflow.id)} />
                <strong><span className="inlineIndex">#{workflowPager.startIndex + index + 1}</span>{workflow.title || workflow.workflow_type}</strong>
              </label>
              <div className="badgeCluster">
                <Badge tone={toneFromStatus(workflow.status)}>{workflow.status}</Badge>
                <Badge tone={toneFromStatus(workflow.sla_status || "")}>{workflow.sla_status || "no_sla"}</Badge>
              </div>
            </div>
            <p>{workflow.workflow_type} / {workflow.module_id || "governance"} / {workflow.source_ref || `${workflow.asset_type}:${workflow.asset_id}`}</p>
            <div className="workflowMetaGrid">
              <small>{workflow.step_summary || "no steps"}</small>
              <small>owner {workflow.owner || "--"} / {workflow.priority}</small>
              <small>due {workflow.due_date ? new Date(workflow.due_date).toLocaleString() : "--"} / {workflow.sla_note || "--"}</small>
            </div>
            <div className="qualityActions">
              <button className="textButton" onClick={() => onOpenAsset(makeAsset("workflow", workflow as unknown as AnyRow, ["title", "workflow_type", "id"], ["module_id", "owner"]))}>详情</button>
              {!["approved", "rejected", "closed", "done"].includes(workflow.status) ? (
                <>
                  <button className="textButton" onClick={() => reviewWorkflow(workflow, "approved")}>批准</button>
                  <button className="textButton" onClick={() => reviewWorkflow(workflow, "rejected")}>拒绝</button>
                </>
              ) : null}
            </div>
          </article>
        )) : <div className="empty compact">暂无 workflow。提交候选或修订建议后会进入这里。</div>}
      </div>
      <PaginationBar pager={workflowPager} label="治理任务板" />
    </section>
  );
}

function WorkflowOrchestrationPanel({
  module,
  onOpenAsset,
  onSelect
}: {
  module: WorkbenchModule;
  onOpenAsset: (asset: AssetRef) => void;
  onSelect: (id: string) => void;
}) {
  const emptySummary: WorkflowOrchestrationSummary = {
    totals: {},
    lanes: [],
    moduleMap: [],
    statusBuckets: { workflows: [], operations: [], sla: [] },
    recentWorkflows: [],
    recentOperations: [],
    templates: [],
    handoffs: [],
    boundary: {
      mode: "local_sqlite_workflow_orchestration",
      importAllowed: false,
      productionWrites: false,
      providerCalls: false,
      erpWriteback: false
    }
  };
  const [refresh, setRefresh] = useState(0);
  const [selectedModuleId, setSelectedModuleId] = useState("workflow-orchestration");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [activeWorkflowSection, setActiveWorkflowSection] = useState("templates");
  const [note, setNote] = useState("");
  const summary = useApi<WorkflowOrchestrationSummary>(`/api/workflow-orchestration/summary?limit=16&refresh=${refresh}`, emptySummary);
  const selectedModule = summary.data.moduleMap.find((item) => item.id === selectedModuleId) || summary.data.moduleMap[0];
  const selectedTemplate = summary.data.templates.find((item) => item.id === selectedTemplateId) || summary.data.templates[0];
  const moduleContractPager = usePagination<OrchestrationModule>(summary.data.moduleMap, 4);
  const handoffPager = usePagination<OrchestrationHandoff>(summary.data.handoffs, 4);
  const workflowSections = [
    { id: "templates", label: "模板门禁", helper: "标准流程、步骤、入口出口", badge: summary.data.templates.length },
    { id: "lanes", label: "阶段画布", helper: "跨工作台阶段与模块分布", badge: summary.data.lanes.length },
    { id: "contracts", label: "协作契约", helper: "输入输出、handoff、任务池", badge: summary.data.moduleMap.length },
    { id: "board", label: "任务板", helper: "治理 workflow 查询与批量审核", badge: summary.data.recentWorkflows.length }
  ];

  async function createOrchestrationOperation(target?: OrchestrationModule) {
    const targetModule = target || selectedModule;
    if (!targetModule) return;
    const result = await api<{ ok: boolean; operation: WorkbenchOperation }>("/api/workbench/operations", {
      method: "POST",
      body: JSON.stringify({
        moduleId: "workflow-orchestration",
        operationType: "cross_workbench_orchestration_review",
        targetAssetType: "workbench_module",
        targetAssetIds: [targetModule.id],
        operationTitle: `${targetModule.title} 编排复核`,
        operationSummary: `复核 ${targetModule.title} 的输入、输出、协作、状态迁移、审批、注解、修订建议和导出证据是否闭合。`,
        operationPayload: {
          targetModuleId: targetModule.id,
          input: targetModule.input,
          output: targetModule.output,
          collaborators: targetModule.collaborators,
          guardrail: targetModule.guardrail,
          workflowCount: targetModule.workflowCount,
          operationCount: targetModule.operationCount,
          candidateCount: targetModule.candidateCount,
          importAllowed: false,
          providerCalls: false,
          erpWriteback: false
        },
        owner: "governance_pmo",
        priority: targetModule.openWorkflowCount > 0 ? "P1" : "P2",
        createdBy: "local_user"
      })
    });
    setNote(`已创建编排操作 ${result.operation.id}，关联 workflow ${result.operation.workflow_id}`);
    setSelectedModuleId(targetModule.id);
    setRefresh((value) => value + 1);
  }

  async function createTemplateOperation(template?: WorkflowTemplate) {
    const targetTemplate = template || selectedTemplate;
    if (!targetTemplate) return;
    const result = await api<{ ok: boolean; operation: WorkbenchOperation }>("/api/workbench/operations", {
      method: "POST",
      body: JSON.stringify({
        moduleId: "workflow-orchestration",
        operationType: "workflow_template_review",
        targetAssetType: "workflow_template",
        targetAssetIds: [targetTemplate.id],
        operationTitle: `${targetTemplate.title} 模板复核`,
        operationSummary: `复核 ${targetTemplate.title} 的入口、出口、步骤门禁、产物和只读边界是否满足跨工作台流转要求。`,
        operationPayload: {
          templateId: targetTemplate.id,
          appliesTo: targetTemplate.appliesTo,
          trigger: targetTemplate.trigger,
          owner: targetTemplate.owner,
          defaultSla: targetTemplate.defaultSla,
          entryModuleId: targetTemplate.entryModuleId,
          exitModuleId: targetTemplate.exitModuleId,
          boundary: targetTemplate.boundary,
          steps: targetTemplate.steps,
          importAllowed: false,
          providerCalls: false,
          erpWriteback: false
        },
        owner: targetTemplate.owner || "governance_pmo",
        priority: targetTemplate.id.includes("metric") || targetTemplate.id.includes("chatbi") ? "P1" : "P2",
        createdBy: "local_user"
      })
    });
    setNote(`已创建模板复核操作 ${result.operation.id}，关联 workflow ${result.operation.workflow_id}`);
    setSelectedTemplateId(targetTemplate.id);
    setSelectedModuleId(targetTemplate.entryModuleId);
    setRefresh((value) => value + 1);
  }

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      {note ? <div className="kbNotice">{note}</div> : null}
      <div className="workflowOrchestrationWorkbench">
        <div className="orchestrationCommandBar">
          {[
            ["Modules", summary.data.totals.modules || 0, "workbench contracts"],
            ["Open workflows", summary.data.totals.openWorkflows || 0, "owner review pool"],
            ["Operations", summary.data.totals.operations || 0, "local ledger only"],
            ["Evidence", (summary.data.totals.annotations || 0) + (summary.data.totals.revisionProposals || 0) + (summary.data.totals.auditEvents || 0), "annotation/revision/audit"]
          ].map(([label, value, helper]) => (
            <article key={String(label)}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{helper}</small>
            </article>
          ))}
        </div>

        <div className="orchestrationBoundary">
          <div>
            <p className="eyebrow">Orchestration boundary</p>
            <h3>只做本地编排，不做生产写回</h3>
          </div>
          <div className="badgeCluster">
            <Badge tone="good">import off</Badge>
            <Badge tone="good">provider off</Badge>
            <Badge tone="good">ERP writeback off</Badge>
          </div>
        </div>

        <WorkbenchSectionNav
          sections={workflowSections}
          active={activeWorkflowSection}
          onChange={setActiveWorkflowSection}
          ariaLabel="工作流编排台分区"
        />

        <div className={sectionPaneClass(activeWorkflowSection, "templates")}>
        <div className="workflowTemplatePanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p className="eyebrow">Workflow templates</p>
              <h2>标准工作流模板与步骤门禁</h2>
            </div>
            <button className="textButton templateReviewButton" onClick={() => createTemplateOperation()}>创建模板复核</button>
          </div>
          <div className="workflowTemplateLayout">
            <div className="templateRail">
              {summary.data.templates.map((template) => (
                <button className={template.id === selectedTemplate?.id ? "active" : ""} key={template.id} onClick={() => setSelectedTemplateId(template.id)}>
                  <strong>{template.title}</strong>
                  <small>{template.appliesTo}</small>
                  <span>{template.steps.length} steps / {template.defaultSla}</span>
                </button>
              ))}
            </div>
            {selectedTemplate ? (
              <div className="templateDetail">
                <div className="templateMetaGrid">
                  <div>
                    <span>Trigger</span>
                    <strong>{selectedTemplate.trigger}</strong>
                  </div>
                  <div>
                    <span>Owner</span>
                    <strong>{selectedTemplate.owner}</strong>
                  </div>
                  <div>
                    <span>Route</span>
                    <strong>{selectedTemplate.entryModuleId} → {selectedTemplate.exitModuleId}</strong>
                  </div>
                  <div>
                    <span>Boundary</span>
                    <strong>{selectedTemplate.boundary.ledgerMode} / import off / provider off</strong>
                  </div>
                </div>
                <div className="templateStepper">
                  {selectedTemplate.steps.map((step, index) => (
                    <article className="templateStep" key={step.key}>
                      <div className="templateStepIndex">{index + 1}</div>
                      <div>
                        <span>{step.state}</span>
                        <h3>{step.name}</h3>
                        <p><b>Actor</b>{step.actor}</p>
                        <p><b>Gate</b>{step.gate}</p>
                        <p><b>Output</b>{step.output}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="qualityActions templateActions">
                  <button className="textButton" onClick={() => onSelect(selectedTemplate.entryModuleId)}>进入入口工作台</button>
                  <button className="textButton" onClick={() => onSelect(selectedTemplate.exitModuleId)}>进入出口工作台</button>
                  <button className="textButton templateReviewButton" onClick={() => createTemplateOperation(selectedTemplate)}>创建此模板复核</button>
                </div>
              </div>
            ) : (
              <div className="empty compact">暂无工作流模板。</div>
            )}
          </div>
        </div>
        </div>

        <div className={sectionPaneClass(activeWorkflowSection, "lanes")}>
        <div className="orchestrationLaneCanvas">
          {summary.data.lanes.map((lane, index) => (
            <article className="orchestrationLane" key={lane.id}>
              <div className="laneNumber">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <span>{lane.stage}</span>
                <h3>{lane.title}</h3>
                <p>{lane.description}</p>
                <small>{lane.moduleCount} modules / {lane.openWorkflowCount} open workflows / {lane.operationCount} ops</small>
              </div>
              <div className="laneModuleChips">
                {lane.moduleIds.map((id) => (
                  <button key={id} onClick={() => {
                    setSelectedModuleId(id);
                    onSelect(id);
                  }}>{id}</button>
                ))}
              </div>
            </article>
          ))}
        </div>
        </div>

        <div className={sectionPaneClass(activeWorkflowSection, "contracts")}>
        <div className="orchestrationDetailGrid">
          <div className="orchestrationModuleMatrix">
            <div className="sectionHeader compactHeader">
              <div>
                <p className="eyebrow">Module contracts</p>
                <h2>工作台输入/输出协作矩阵</h2>
              </div>
              <button className="textButton orchestrationCreateButton" onClick={() => createOrchestrationOperation()}>生成编排操作</button>
            </div>
            <div className="moduleContractList">
              {moduleContractPager.pageItems.map((item, index) => (
                <article className={item.id === selectedModule?.id ? "active" : ""} key={item.id}>
                  <button className="moduleContractTitle" onClick={() => setSelectedModuleId(item.id)}>
                    <span>{String(moduleContractPager.startIndex + index + 1).padStart(2, "0")} · {item.code}</span>
                    <strong>{item.title}</strong>
                    <small>{item.stage} / {item.status}</small>
                  </button>
                  <div className="moduleContractBody">
                    <p><b>输入</b>{item.input}</p>
                    <p><b>输出</b>{item.output}</p>
                    <p><b>协作</b>{item.collaborators}</p>
                    <p><b>边界</b>{item.guardrail}</p>
                    <div className="moduleContractStats">
                      <span>{item.workflowCount} workflows</span>
                      <span>{item.operationCount} ops</span>
                      <span>{item.candidateCount} assets</span>
                    </div>
                    <div className="qualityActions">
                      <button className="textButton" onClick={() => onSelect(item.id)}>进入工作台</button>
                      <button className="textButton orchestrationCreateButton" onClick={() => createOrchestrationOperation(item)}>创建编排复核</button>
                      <a className="textButton" href={item.exportPath} target="_blank" rel="noreferrer">导出 JSON</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <PaginationBar pager={moduleContractPager} label="工作台契约矩阵" />
          </div>

          <div className="orchestrationSideStack">
            <div className="handoffPanel">
              <div className="sectionHeader compactHeader">
                <div>
                  <p className="eyebrow">Handoff contracts</p>
                  <h2>跨工作台交付关系</h2>
                </div>
              </div>
              <div className="handoffList">
                {handoffPager.pageItems.map((handoff, index) => (
                  <article key={`${handoff.from}-${handoff.to}`}>
                    <strong><span className="inlineIndex">#{handoffPager.startIndex + index + 1}</span>{handoff.from} → {handoff.to}</strong>
                    <p>{handoff.contract}</p>
                    <Badge tone={toneFromStatus(handoff.status)}>{handoff.status}</Badge>
                  </article>
                ))}
              </div>
              <PaginationBar pager={handoffPager} label="交付关系" />
            </div>

            <div className="orchestrationTaskPool">
              <div className="sectionHeader compactHeader">
                <div>
                  <p className="eyebrow">Task pool</p>
                  <h2>近期 workflow / operation</h2>
                </div>
              </div>
              <div className="orchestrationTaskColumns">
                <div>
                  <h3>Workflow</h3>
                  {summary.data.recentWorkflows.slice(0, 5).map((workflow) => (
                    <button key={workflow.id} onClick={() => onOpenAsset(makeAsset("workflow", workflow as unknown as AnyRow, ["title", "workflow_type", "id"], ["module_id", "owner"]))}>
                      <strong>{workflow.title || workflow.workflow_type}</strong>
                      <small>{workflow.module_id || "governance"} / {workflow.status} / {workflow.sla_status || "no_sla"}</small>
                    </button>
                  ))}
                </div>
                <div>
                  <h3>Operation</h3>
                  {summary.data.recentOperations.slice(0, 5).map((operation) => (
                    <button key={operation.id} onClick={() => onOpenAsset(makeAsset("workbench_operation", operation as unknown as AnyRow, ["operation_title", "id"], ["module_id", "owner"]))}>
                      <strong>{operation.operation_title}</strong>
                      <small>{operation.module_id} / {operation.status}</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className={sectionPaneClass(activeWorkflowSection, "board")}>
        <WorkflowBoard onOpenAsset={onOpenAsset} />
        </div>
      </div>
    </section>
  );
}

function Object360Panel({ onOpenAsset }: { onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ type: "", risk: "", owner: "", q: "" });
  const [selectedId, setSelectedId] = useState("");
  const [note, setNote] = useState("");
  const [creatingRecommendation, setCreatingRecommendation] = useState(false);
  const objectsPath = useMemo(() => {
    const params = new URLSearchParams({ limit: "80", refresh: String(refresh) });
    if (filters.type) params.set("type", filters.type);
    if (filters.risk) params.set("risk", filters.risk);
    if (filters.owner) params.set("owner", filters.owner);
    if (filters.q) params.set("q", filters.q);
    return `/api/aip/objects?${params.toString()}`;
  }, [filters, refresh]);
  const objects = useApi<AipObject[]>(objectsPath, []);
  const currentId = selectedId || objects.data[0]?.id || "obj_batch_fba_negative_available";
  const detail = useApi<AipObjectDetail>(`/api/aip/objects/${encodeURIComponent(currentId)}?refresh=${refresh}`, {
    object: {
      id: currentId,
      object_type: "",
      object_key: "",
      display_name: "暂无对象",
      lifecycle_status: "draft",
      risk_level: "medium",
      owner: "",
      health_score: 0,
      source_refs: [],
      properties: {}
    },
    ontology: null,
    relations: { outbound: [], inbound: [] },
    identityLinks: [],
    metrics: [],
    tags: [],
    kbCards: [],
    qualityIssues: [],
    recommendations: [],
    events: [],
    traces: [],
    timeline: [],
    boundary: {}
  });
  const selectedObject = detail.data.object;
  const propertyEntries = Object.entries(selectedObject.properties || {}).slice(0, 8);
  const relationCount = detail.data.relations.outbound.length + detail.data.relations.inbound.length;
  const owners = Array.from(new Set(objects.data.map((object) => object.owner).filter(Boolean))).sort();

  function updateFilters(next: Partial<typeof filters>) {
    setFilters((current) => ({ ...current, ...next }));
    setSelectedId("");
  }

  async function createObjectRecommendation() {
    if (!selectedObject.id || selectedObject.id === "__missing__") return;
    setCreatingRecommendation(true);
    setNote("");
    try {
      const riskText = selectedObject.risk_level === "critical" || selectedObject.risk_level === "high"
        ? `当前对象风险等级为 ${selectedObject.risk_level}，建议 owner 复核业务事件、指标证据和库存状态。`
        : "建议 owner 复核对象证据、指标口径和业务状态，确认是否需要后续治理动作。";
      const payload = await api<{ ok: boolean; recommendation: AipRecommendation }>("/api/aip/recommendations", {
        method: "POST",
        body: JSON.stringify({
          targetObjectId: selectedObject.id,
          targetObjectType: selectedObject.object_type,
          scenarioType: selectedObject.risk_level === "critical" ? "critical_object_review" : "object_360_review",
          recommendationTitle: `复核 ${selectedObject.display_name}`,
          recommendationDetail: riskText,
          impactSummary: `object=${selectedObject.object_type}; health=${selectedObject.health_score}; events=${detail.data.events.length}; metrics=${detail.data.metrics.length}`,
          evidenceRefs: [
            { type: "aip_object", ref: selectedObject.id },
            ...detail.data.events.slice(0, 3).map((event) => ({ type: "object_event", ref: event.id })),
            ...detail.data.metrics.slice(0, 3).map((metric) => ({ type: "metric", ref: String(metric.id || metric.code) }))
          ],
          actionOptions: ["复核对象事件", "核对指标口径", "补充证据链", "确认是否转执行任务"],
          actionTier: "L1",
          owner: selectedObject.owner || "supply_chain_owner",
          priority: selectedObject.risk_level === "critical" ? "P0" : "P1",
          createdBy: "local_user"
        })
      });
      setNote(`已从 Object 360 创建建议卡 ${payload.recommendation.id}，进入决策闭环审核。`);
      onOpenAsset(aipRecommendationAsset(payload.recommendation));
      setRefresh((value) => value + 1);
    } catch (err) {
      setNote(`创建建议卡失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setCreatingRecommendation(false);
    }
  }

  return (
    <div className="object360Panel">
      <div className="surfaceHead">
        <div>
          <p className="eyebrow">AIP Object 360</p>
          <h3>关键对象实例与证据视图</h3>
          <p className="muted">类型本体保持只读；实例层只允许注解、评论、修订建议和行动卡。</p>
        </div>
        <div className="badgeCluster">
          <Badge tone={toneFromStatus(selectedObject.risk_level)}>{selectedObject.risk_level}</Badge>
          <Badge tone="blue">{objects.data.length} visible</Badge>
        </div>
      </div>
      {note ? <div className="kbNotice compact">{note}</div> : null}
      {objects.error ? <div className="error compact">{objects.error}</div> : null}
      {detail.error ? <div className="error compact">{detail.error}</div> : null}
      <div className="object360Filters">
        <label>
          对象类型
          <select value={filters.type} onChange={(event) => updateFilters({ type: event.target.value })}>
            <option value="">全部</option>
            {Array.from(new Set(objects.data.map((object) => object.object_type).filter(Boolean))).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label>
          风险
          <select value={filters.risk} onChange={(event) => updateFilters({ risk: event.target.value })}>
            <option value="">全部</option>
            <option value="critical">critical</option>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </label>
        <label className="objectOwnerFilter">
          Owner
          <select value={filters.owner} onChange={(event) => updateFilters({ owner: event.target.value })}>
            <option value="">全部</option>
            {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        </label>
        <label>
          搜索
          <input value={filters.q} onChange={(event) => updateFilters({ q: event.target.value })} placeholder="SKU / warehouse / exception" />
        </label>
        <button className="textButton" onClick={() => setRefresh((value) => value + 1)}>刷新</button>
      </div>
      <div className="object360Layout">
        <aside className="object360List">
          {objects.data.length ? objects.data.map((object) => (
            <button key={object.id} className={object.id === currentId ? "active" : ""} onClick={() => setSelectedId(object.id)}>
              <span>
                <strong>{object.display_name}</strong>
                <small>{object.object_type} / {object.object_key}</small>
              </span>
              <Badge tone={toneFromStatus(object.risk_level)}>{object.risk_level}</Badge>
              <ScoreLine score={Number(object.health_score || 0)} />
              <small>{Number(object.event_count || 0)} events / {Number(object.recommendation_count || 0)} cards</small>
            </button>
          )) : <div className="empty compact">暂无对象实例。</div>}
        </aside>
        <div className="object360Detail">
          <div className="objectHeroCard">
            <div>
              <p className="eyebrow">{selectedObject.object_type}</p>
              <h3>{selectedObject.display_name}</h3>
              <p>{selectedObject.object_key} / owner {selectedObject.owner || "--"} / status {selectedObject.lifecycle_status}</p>
            </div>
            <div className="objectHeroActions">
              <Badge tone={toneFromStatus(selectedObject.risk_level)}>{selectedObject.risk_level}</Badge>
              <button className="textButton" onClick={() => onOpenAsset(aipObjectAsset(selectedObject))}>打开注解</button>
              <button className="textButton objectRecommendationCreate" disabled={creatingRecommendation} onClick={createObjectRecommendation}>
                {creatingRecommendation ? "创建中..." : "创建建议卡"}
              </button>
            </div>
          </div>
          <div className="objectSignalGrid">
            <div><span>健康分</span><strong>{Number(selectedObject.health_score || 0)}</strong></div>
            <div><span>关系</span><strong>{relationCount}</strong></div>
            <div><span>指标</span><strong>{detail.data.metrics.length}</strong></div>
            <div><span>证据</span><strong>{detail.data.kbCards.length}</strong></div>
            <div><span>Trace</span><strong>{detail.data.traces.length}</strong></div>
            <div><span>Action</span><strong>{detail.data.recommendations.length}</strong></div>
          </div>
          <div className="objectGraphCanvas">
            <div className="objectNode activeNode">{selectedObject.display_name}</div>
            <div className="objectRelationGraph">
              {detail.data.relations.outbound.slice(0, 4).map((link) => (
                <span key={`out-${cellValue(link.id)}`}>{cellValue(link.link_type)} to {cellValue(link.target_name || link.target_object_id)}</span>
              ))}
              {detail.data.relations.inbound.slice(0, 4).map((link) => (
                <span key={`in-${cellValue(link.id)}`}>{cellValue(link.source_name || link.source_object_id)} to {cellValue(link.link_type)}</span>
              ))}
              {!relationCount ? <span>暂无对象关系</span> : null}
            </div>
          </div>
          <div className="objectEvidencePanel evidencePanel">
            <div className="surfaceHead">
              <h3>证据与属性</h3>
              <Badge>{detail.data.identityLinks.length} identities</Badge>
            </div>
            <div className="objectEvidenceGrid">
              <div>
                <strong>对象属性</strong>
                {propertyEntries.length ? propertyEntries.map(([key, value]) => (
                  <span key={key}>{key}: {cellValue(value)}</span>
                )) : <span>暂无属性</span>}
              </div>
              <div>
                <strong>身份映射</strong>
                {detail.data.identityLinks.slice(0, 6).map((identity) => (
                  <span key={String(identity.id)}>{cellValue(identity.identity_type)} = {cellValue(identity.identity_value)} / {cellValue(identity.confidence)}</span>
                ))}
                {!detail.data.identityLinks.length ? <span>暂无身份映射</span> : null}
              </div>
              <div>
                <strong>知识证据</strong>
                {detail.data.kbCards.slice(0, 5).map((card) => (
                  <button className="textButton inlineAssetButton" key={String(card.id)} onClick={() => onOpenAsset(makeAsset("kb_card", card, ["title", "id"], ["domain_name", "source_path"], true))}>{cellValue(card.title)}</button>
                ))}
                {!detail.data.kbCards.length ? <span>暂无知识证据</span> : null}
              </div>
              <div className="objectMetricEvidence">
                <strong>关联指标</strong>
                {detail.data.metrics.slice(0, 5).map((metric) => (
                  <button className="textButton inlineAssetButton" key={String(metric.id || metric.code)} onClick={() => onOpenAsset(makeAsset("metric", metric, ["name", "code", "id"], ["level", "owner"], true))}>
                    {cellValue(metric.name || metric.code)} / {cellValue(metric.certification_status || metric.lifecycle_status)}
                  </button>
                ))}
                {!detail.data.metrics.length ? <span>暂无指标证据</span> : null}
              </div>
              <div className="objectQualityEvidence">
                <strong>质量问题</strong>
                {detail.data.qualityIssues.slice(0, 5).map((issue) => (
                  <button className="textButton inlineAssetButton" key={String(issue.id)} onClick={() => onOpenAsset(makeAsset("quality_issue", issue, ["issue_title", "id"], ["severity", "status"], true))}>
                    {cellValue(issue.issue_title || issue.id)} / {cellValue(issue.severity || issue.status)}
                  </button>
                ))}
                {!detail.data.qualityIssues.length ? <span>暂无质量问题</span> : null}
              </div>
            </div>
          </div>
          <div className="objectEventTimeline objectEventTimelineGrid">
            <div className="surfaceHead">
              <h3>事件 / Trace / 建议卡</h3>
              <Badge tone="blue">{detail.data.timeline.length || detail.data.events.length + detail.data.traces.length + detail.data.recommendations.length}</Badge>
            </div>
            <div className="objectUnifiedTimeline">
              <div className="sectionLabel">
                <span>Unified timeline</span>
                <strong>对象合并时间线</strong>
              </div>
              <div className="objectUnifiedTimelineList">
                {detail.data.timeline.slice(0, 10).map((item, index) => (
                  <button
                    key={`${item.item_type}-${item.id}-${index}`}
                    onClick={() => onOpenAsset(makeAsset(item.asset_type || item.item_type, item as unknown as AnyRow, ["title", "id"], ["item_type", "status", "actor"], true))}
                  >
                    <span className="inlineIndex">#{index + 1}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.item_type} / {item.status} / {item.actor || "--"}</small>
                    </div>
                    <Badge tone={toneFromStatus(item.status || item.severity)}>{item.severity || item.status}</Badge>
                    <time>{item.occurred_at}</time>
                  </button>
                ))}
                {!detail.data.timeline.length ? <div className="empty compact">暂无合并时间线。</div> : null}
              </div>
            </div>
            <div className="objectTimelineColumns">
              <div>
                <strong>业务事件</strong>
                {detail.data.events.slice(0, 5).map((event) => (
                  <button key={event.id} onClick={() => onOpenAsset(aipEventAsset(event))}>
                    <Badge tone={toneFromStatus(event.severity)}>{event.severity}</Badge>
                    <span>{event.event_title}</span>
                    <small>{event.event_type} / {event.occurred_at}</small>
                  </button>
                ))}
                {!detail.data.events.length ? <small>暂无事件</small> : null}
              </div>
              <div>
                <strong>Agent Trace</strong>
                {detail.data.traces.slice(0, 5).map((trace) => (
                  <button key={trace.id} onClick={() => onOpenAsset(aipTraceAsset(trace))}>
                    <Badge tone={answerabilityTone(trace.answerability)}>{trace.answerability}</Badge>
                    <span>{trace.question}</span>
                    <small>{trace.intent} / score {trace.answerability_score}</small>
                  </button>
                ))}
                {!detail.data.traces.length ? <small>暂无 trace</small> : null}
              </div>
              <div>
                <strong>建议卡</strong>
                {detail.data.recommendations.slice(0, 5).map((recommendation) => (
                  <button key={recommendation.id} onClick={() => onOpenAsset(aipRecommendationAsset(recommendation))}>
                    <Badge tone={toneFromStatus(recommendation.approval_status)}>{recommendation.approval_status}</Badge>
                    <span>{recommendation.recommendation_title}</span>
                    <small>{recommendation.action_tier} / {recommendation.owner}</small>
                  </button>
                ))}
                {!detail.data.recommendations.length ? <small>暂无建议卡</small> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OntologyPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const objects = useApi<AnyRow[]>("/api/ontology/objects", []);
  const links = useApi<AnyRow[]>("/api/ontology/links", []);
  const [selectedObject, setSelectedObject] = useState("");
  const [activeOntologySection, setActiveOntologySection] = useState("object360");
  const objectId = selectedObject || String(objects.data[0]?.id || "");
  const path = useApi<OntologyPath>(`/api/ontology/paths?objectId=${encodeURIComponent(objectId)}`, {
    object: null,
    outbound: [],
    inbound: [],
    tags: [],
    dimensions: [],
    metrics: [],
    lineageEdges: [],
    narrative: []
  });
  const ontologySections = [
    { id: "object360", label: "Object 360", helper: "对象实例、风险、证据、事件", badge: objects.data.length },
    { id: "paths", label: "关系解释", helper: "出入向关系、标签、维度、指标", badge: path.data.metrics.length },
    { id: "tables", label: "本体台账", helper: "对象类型与关系表格", badge: links.data.length }
  ];
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <WorkbenchSectionNav
        sections={ontologySections}
        active={activeOntologySection}
        onChange={setActiveOntologySection}
        ariaLabel="对象本体工作台分区"
      />
      <div className={sectionPaneClass(activeOntologySection, "object360")}>
      <Object360Panel onOpenAsset={onOpenAsset} />
      </div>
      <div className={sectionPaneClass(activeOntologySection, "paths")}>
      <div className="ontologyPathPanel">
        <div className="surfaceHead">
          <div>
            <h3>对象关系路径解释</h3>
            <p className="muted">本体正本只读；这里把对象关系、标签、维度、指标和血缘证据聚合成可解释路径。</p>
          </div>
          <Badge tone="blue">{path.data.metrics.length} metrics</Badge>
        </div>
        <div className="ontologySelector">
          <label>
            选择对象
            <select value={objectId} onChange={(event) => setSelectedObject(event.target.value)}>
              {objects.data.map((object) => (
                <option key={String(object.id)} value={String(object.id)}>{cellValue(object.name)} / {cellValue(object.id)}</option>
              ))}
            </select>
          </label>
          <button className="textButton" onClick={() => path.data.object && onOpenAsset(makeAsset("ontology_object", path.data.object, ["name", "id"], ["object_type", "owner"], true))}>打开对象注解</button>
        </div>
        <div className="pathNarrative">
          {path.data.narrative.map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="pathwayLayout">
          <div className="pathCard">
            <strong>出向关系</strong>
            {path.data.outbound.length ? path.data.outbound.map((link) => (
              <button key={String(link.id)} onClick={() => onOpenAsset(makeAsset("ontology_link", link, ["link_type", "id"], ["source_object_id", "target_object_id"], true))}>
                <span>{cellValue(link.source_object_id)} -- {cellValue(link.link_type)} -- {cellValue(link.target_name || link.target_object_id)}</span>
                <small>{cellValue(link.business_meaning)}</small>
              </button>
            )) : <small>暂无出向关系</small>}
          </div>
          <div className="pathCard">
            <strong>入向关系</strong>
            {path.data.inbound.length ? path.data.inbound.map((link) => (
              <button key={String(link.id)} onClick={() => onOpenAsset(makeAsset("ontology_link", link, ["link_type", "id"], ["source_object_id", "target_object_id"], true))}>
                <span>{cellValue(link.source_name || link.source_object_id)} -- {cellValue(link.link_type)} -- {cellValue(link.target_object_id)}</span>
                <small>{cellValue(link.business_meaning)}</small>
              </button>
            )) : <small>暂无入向关系</small>}
          </div>
          <div className="pathCard">
            <strong>标签与维度</strong>
            {[...path.data.tags.slice(0, 4), ...path.data.dimensions.slice(0, 4)].length ? (
              <>
                {path.data.tags.slice(0, 4).map((tag) => <button key={String(tag.id)} onClick={() => onOpenAsset(makeAsset("tag", tag, ["name", "id"], ["tag_type", "owner"]))}><span>{cellValue(tag.name)}</span><small>tag / {cellValue(tag.lifecycle_status)}</small></button>)}
                {path.data.dimensions.slice(0, 4).map((dimension) => <button key={String(dimension.id)} onClick={() => onOpenAsset(makeAsset("dimension", dimension, ["name", "id"], ["dimension_type", "owner"]))}><span>{cellValue(dimension.name)}</span><small>dimension / {cellValue(dimension.dimension_type)}</small></button>)}
              </>
            ) : <small>暂无标签或维度绑定</small>}
          </div>
          <div className="pathCard">
            <strong>关联指标</strong>
            {path.data.metrics.length ? path.data.metrics.slice(0, 6).map((metric) => (
              <button key={String(metric.id)} onClick={() => onOpenAsset(makeAsset("metric", metric, ["name", "code", "id"], ["level", "l1_domain"], true))}>
                <span>{cellValue(metric.name)}</span>
                <small>{cellValue(metric.code)} / {cellValue(metric.level)} / {cellValue(metric.certification_status)}</small>
              </button>
            )) : <small>暂无指标桥接</small>}
          </div>
        </div>
      </div>
      </div>
      <div className={sectionPaneClass(activeOntologySection, "tables")}>
      <div className="split">
        <div className="surface objectTable">
          <div className="surfaceHead">
            <h3>对象类型</h3>
            <Badge>{objects.data.length} rows</Badge>
          </div>
          <DataTable
            rows={objects.data}
            columns={["id", "name", "object_type", "grain", "owner", "status"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("ontology_object", row, ["name", "id"], ["object_type", "owner"], true))}
          />
        </div>
        <div className="surface linkTable">
          <div className="surfaceHead">
            <h3>对象关系</h3>
            <Badge>{links.data.length} links</Badge>
          </div>
          <DataTable
            rows={links.data}
            columns={["source_object_id", "link_type", "target_object_id", "business_meaning", "status"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("ontology_link", row, ["link_type", "id"], ["source_object_id", "target_object_id"], true))}
          />
        </div>
      </div>
      </div>
    </section>
  );
}

function CandidateWorkbench({
  candidateType,
  title,
  targetAssetType,
  defaultPayload,
  onOpenAsset
}: {
  candidateType: "tag" | "dimension" | "metric";
  title: string;
  targetAssetType: string;
  defaultPayload: Record<string, string>;
  onOpenAsset: (asset: AssetRef) => void;
}) {
  const [refresh, setRefresh] = useState(0);
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    candidateName: defaultPayload.name || "",
    candidateCode: defaultPayload.code || "",
    targetAssetId: defaultPayload.targetAssetId || "",
    proposalSummary: defaultPayload.summary || "",
    owner: "data_governance",
    priority: "P1",
    proposedPayload: JSON.stringify(defaultPayload, null, 2)
  });
  const candidates = useApi<GovernanceCandidate[]>(`/api/governance/candidates?candidateType=${candidateType}&limit=80&refresh=${refresh}`, []);

  async function submitCandidate(event: React.FormEvent) {
    event.preventDefault();
    let proposedPayload: unknown = form.proposedPayload;
    try {
      proposedPayload = JSON.parse(form.proposedPayload || "{}");
    } catch {
      proposedPayload = { raw: form.proposedPayload };
    }
    const result = await api<{ ok: boolean; candidate: GovernanceCandidate }>("/api/governance/candidates", {
      method: "POST",
      body: JSON.stringify({
        candidateType,
        candidateCode: form.candidateCode || `${candidateType}_${Date.now()}`,
        candidateName: form.candidateName,
        targetAssetType,
        targetAssetId: form.targetAssetId,
        proposalSummary: form.proposalSummary,
        proposedPayload,
        sourceRef: `${candidateType}_workbench_form`,
        evidenceRefs: [{ type: "workbench", ref: `${candidateType}_candidate_form` }],
        owner: form.owner,
        priority: form.priority,
        createdBy: "local_user"
      })
    });
    setNote(`已提交候选 ${result.candidate.candidate_code}，并创建 workflow ${result.candidate.workflow_id}`);
    setRefresh((value) => value + 1);
  }

  async function reviewCandidate(candidate: GovernanceCandidate, status: "approved" | "rejected") {
    await api(`/api/governance/candidates/${encodeURIComponent(candidate.id)}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: `P1 candidate workbench marked candidate as ${status}.`
      })
    });
    setNote(`候选 ${candidate.candidate_code} 已更新为 ${status}`);
    setRefresh((value) => value + 1);
  }

  return (
    <div className="candidateWorkbench">
      <div className="surfaceHead">
        <div>
          <p className="eyebrow">Candidate flow</p>
          <h3>{title}</h3>
        </div>
        <Badge tone="blue">{candidates.data.length} candidates</Badge>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      <div className="candidateLayout">
        <form className="candidateForm" onSubmit={submitCandidate}>
          <label>
            候选名称
            <input value={form.candidateName} onChange={(event) => setForm({ ...form, candidateName: event.target.value })} required />
          </label>
          <div className="formGrid">
            <label>
              候选编码
              <input value={form.candidateCode} onChange={(event) => setForm({ ...form, candidateCode: event.target.value })} />
            </label>
            <label>
              目标资产 ID
              <input value={form.targetAssetId} onChange={(event) => setForm({ ...form, targetAssetId: event.target.value })} />
            </label>
            <label>
              优先级
              <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </select>
            </label>
          </div>
          <label>
            候选说明
            <textarea value={form.proposalSummary} onChange={(event) => setForm({ ...form, proposalSummary: event.target.value })} required />
          </label>
          <label>
            建议内容 JSON
            <textarea value={form.proposedPayload} onChange={(event) => setForm({ ...form, proposedPayload: event.target.value })} />
          </label>
          <button type="submit">提交候选并创建 workflow</button>
        </form>
        <div className="candidateCards">
          {candidates.data.length ? candidates.data.map((candidate) => (
            <article className="candidateCard" key={candidate.id}>
              <div className="ledgerItemHead">
                <strong>{candidate.candidate_name}</strong>
                <Badge tone={toneFromStatus(candidate.lifecycle_status)}>{candidate.lifecycle_status}</Badge>
              </div>
              <p>{candidate.proposal_summary}</p>
              <small>{candidate.candidate_code} / {candidate.target_asset_type}:{candidate.target_asset_id || "--"} / {candidate.workflow_id}</small>
              <div className="qualityActions">
                <button className="textButton" onClick={() => onOpenAsset(makeAsset("governance_candidate", candidate as unknown as AnyRow, ["candidate_name", "candidate_code", "id"], ["candidate_type", "owner"]))}>详情</button>
                {!["approved", "rejected"].includes(candidate.lifecycle_status) ? (
                  <>
                    <button className="textButton" onClick={() => reviewCandidate(candidate, "approved")}>批准候选</button>
                    <button className="textButton" onClick={() => reviewCandidate(candidate, "rejected")}>拒绝候选</button>
                  </>
                ) : null}
              </div>
            </article>
          )) : <div className="empty compact">暂无候选。提交后不会改写 canonical 正本，只进入台账与 workflow。</div>}
        </div>
      </div>
    </div>
  );
}

function TagsPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const tags = useApi<AnyRow[]>("/api/tags", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <DataTable
        rows={tags.data}
        columns={["id", "name", "tag_type", "target_object_id", "rule_expression", "lifecycle_status", "owner", "quality_status"]}
        onSelectRow={(row) => onOpenAsset(makeAsset("tag", row, ["name", "id"], ["tag_type", "owner"]))}
      />
      <CandidateWorkbench
        candidateType="tag"
        title="标签候选提交流"
        targetAssetType="tag"
        defaultPayload={{
          name: "高风险负库存 SKU",
          code: "tag_negative_available_inventory_risk",
          targetAssetId: "sku",
          summary: "基于可用库存负数、同步延迟和业务例外字段，提出 SKU 风险标签候选。"
        }}
        onOpenAsset={onOpenAsset}
      />
    </section>
  );
}

function DimensionsPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const dimensions = useApi<AnyRow[]>("/api/dimensions", []);
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <DataTable
        rows={dimensions.data}
        columns={["id", "name", "dimension_type", "hierarchy", "bound_object_id", "lifecycle_status", "owner"]}
        onSelectRow={(row) => onOpenAsset(makeAsset("dimension", row, ["name", "id"], ["dimension_type", "owner"]))}
      />
      <CandidateWorkbench
        candidateType="dimension"
        title="维度候选提交流"
        targetAssetType="dimension"
        defaultPayload={{
          name: "库存责任仓维度",
          code: "dim_inventory_responsible_warehouse",
          targetAssetId: "warehouse",
          summary: "补充用于库存责任归属、异常闭环和仓库 SLA 分析的一致性维度候选。"
        }}
        onOpenAsset={onOpenAsset}
      />
    </section>
  );
}

function MetricsPanel({
  module,
  dictionary = false,
  onOpenAsset
}: {
  module: WorkbenchModule;
  dictionary?: boolean;
  onOpenAsset: (asset: AssetRef) => void;
}) {
  const [query, setQuery] = useState("");
  const path = query
    ? `/api/metrics?q=${encodeURIComponent(query)}`
    : dictionary
      ? "/api/metrics?level=L3"
      : "/api/metrics";
  const metrics = useApi<Metric[]>(path, []);
  const l3Count = metrics.data.filter((metric) => metric.level === "L3").length;
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="toolbar">
        <div className="searchBox">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="指标、code、口径" />
        </div>
        <Badge tone="blue">{l3Count} L3 visible</Badge>
      </div>
      <DataTable
        rows={metrics.data as unknown as AnyRow[]}
        columns={["code", "name", "level", "metric_type", "l1_domain", "l2_group", "lifecycle_status", "certification_status", "owner"]}
        onSelectRow={(row) => onOpenAsset(makeAsset("metric", row, ["name", "code", "id"], ["level", "owner"], dictionary))}
      />
      {!dictionary ? (
        <CandidateWorkbench
          candidateType="metric"
          title="指标候选提交流"
          targetAssetType="metric"
          defaultPayload={{
            name: "可用库存负数例外覆盖率",
            code: "negative_available_inventory_exception_coverage_rate",
            targetAssetId: "business_available_qty",
            summary: "基于质量规则和业务例外解释，提出衡量负库存可解释性的派生指标候选。"
          }}
          onOpenAsset={onOpenAsset}
        />
      ) : null}
    </section>
  );
}

function KpiTreePanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const tree = useApi<any[]>("/api/kpi-tree", []);
  const [canvasRefresh, setCanvasRefresh] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [scope, setScope] = useState<"core" | "all">("core");
  const [viewMode, setViewMode] = useState<"mindmap" | "object-graph">("object-graph");
  const [kpiSearch, setKpiSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [draftPositions, setDraftPositions] = useState<Record<string, { x: number; y: number }>>({});
  const suppressNextClickRef = useRef(false);
  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const canvas = useApi<AnyRow[]>(`/api/kpi-canvas/nodes?limit=1000&refresh=${canvasRefresh}`, []);
  const flat = useMemo(() => {
    const rows: AnyRow[] = [];
    function walk(nodes: any[], depth = 0) {
      nodes.forEach((node) => {
        rows.push({
          id: node.id,
          level: node.level,
          name: `${"".padStart(depth * 2, " ")}${node.name}`,
          code: node.code,
          l1_domain: node.l1_domain
        });
        if (node.children) walk(node.children, depth + 1);
      });
    }
    walk(tree.data);
    return rows;
  }, [tree.data]);
  const domains = useMemo(() => {
    return Array.from(new Set(canvas.data.map((node) => String(node.l1_domain || "")).filter(Boolean))).sort();
  }, [canvas.data]);
  const nodeByMetricId = useMemo(() => {
    return Object.fromEntries(canvas.data.map((node) => [String(node.metric_id), node]));
  }, [canvas.data]);
  const nodeById = useMemo(() => {
    return Object.fromEntries(canvas.data.map((node) => [String(node.id), node]));
  }, [canvas.data]);
  const childMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    canvas.data.forEach((node) => {
      const parentMetricId = String(node.parent_metric_id || "");
      if (!parentMetricId) return;
      const parent = nodeByMetricId[parentMetricId];
      if (!parent) return;
      const parentNodeId = String(parent.id);
      map[parentNodeId] = [...(map[parentNodeId] || []), String(node.id)];
    });
    return map;
  }, [canvas.data, nodeByMetricId]);
  const parentMap = useMemo(() => {
    const map: Record<string, string> = {};
    canvas.data.forEach((node) => {
      const parent = nodeByMetricId[String(node.parent_metric_id || "")];
      if (parent) map[String(node.id)] = String(parent.id);
    });
    return map;
  }, [canvas.data, nodeByMetricId]);
  const highlighted = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>([selectedNodeId]);
    let cursor = selectedNodeId;
    while (parentMap[cursor]) {
      cursor = parentMap[cursor];
      ids.add(cursor);
    }
    const queue = [...(childMap[selectedNodeId] || [])];
    while (queue.length) {
      const id = queue.shift()!;
      ids.add(id);
      queue.push(...(childMap[id] || []));
    }
    return ids;
  }, [selectedNodeId, parentMap, childMap]);
  function isHiddenByCollapsedAncestor(node: AnyRow) {
    let cursor = String(node.id);
    while (parentMap[cursor]) {
      cursor = parentMap[cursor];
      const parent = nodeById[cursor];
      if (parent && Number(parent.collapsed || 0)) return true;
    }
    return false;
  }
  const visibleNodes = useMemo(() => {
    return canvas.data.filter((node) => {
      if (selectedDomain && node.l1_domain !== selectedDomain) return false;
      if (scope === "core" && node.level === "L3") return false;
      if (isHiddenByCollapsedAncestor(node)) return false;
      return true;
    });
  }, [canvas.data, selectedDomain, scope, parentMap, nodeById]);
  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => String(node.id))), [visibleNodes]);
  const levelCounts = useMemo(() => {
    return canvas.data.reduce<Record<string, number>>((acc, node) => {
      const level = String(node.level || "unknown");
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
  }, [canvas.data]);
  const canvasEdges = useMemo(() => {
    return visibleNodes
      .map((node) => {
        const parent = nodeByMetricId[String(node.parent_metric_id || "")];
        if (!parent || !visibleNodeIds.has(String(parent.id))) return null;
        return { source: parent, target: node };
      })
      .filter(Boolean) as Array<{ source: AnyRow; target: AnyRow }>;
  }, [visibleNodes, nodeByMetricId, visibleNodeIds]);
  const mindTree = useMemo(() => {
    const term = kpiSearch.trim().toLowerCase();
    function matches(node: any) {
      return [node.name, node.code, node.level, node.l1_domain, node.l2_group]
        .some((value) => String(value || "").toLowerCase().includes(term));
    }
    function filterNodes(nodes: any[]): any[] {
      return nodes
        .map((node) => ({ ...node, children: filterNodes(node.children || []) }))
        .filter((node) => {
          const domainOk = !selectedDomain || node.level === "L0" || node.l1_domain === selectedDomain || node.children.length;
          const scopeOk = scope === "all" || node.level !== "L3" || node.children.length;
          const searchOk = !term || matches(node) || node.children.length;
          return domainOk && scopeOk && searchOk;
        });
    }
    return filterNodes(tree.data);
  }, [tree.data, selectedDomain, scope, kpiSearch]);
  const canvasHeight = Math.min(
    scope === "all" ? 3200 : 1800,
    Math.max(460, ...visibleNodes.map((node) => Number(draftPositions[String(node.id)]?.y ?? node.y ?? 0) + Number(node.height || 88) + 96))
  );
  const canvasWidth = Math.max(
    1240,
    ...visibleNodes.map((node) => Number(draftPositions[String(node.id)]?.x ?? node.x ?? 0) + Number(node.width || 220) + 96)
  );

  async function toggleNode(node: AnyRow) {
    await api(`/api/kpi-canvas/nodes/${encodeURIComponent(String(node.id))}`, {
      method: "PATCH",
      body: JSON.stringify({
        collapsed: !Boolean(Number(node.collapsed || 0)),
        layoutVersion: "p0-click-toggle",
        actor: "local_user"
      })
    });
    setCanvasRefresh((value) => value + 1);
  }

  function nodePosition(node: AnyRow) {
    const draft = draftPositions[String(node.id)];
    return {
      x: Number(draft?.x ?? node.x ?? 0),
      y: Number(draft?.y ?? node.y ?? 0),
      width: Number(node.width || 220),
      height: Number(node.height || 88)
    };
  }

  function openCanvasNode(node: AnyRow) {
    setSelectedNodeId(String(node.id));
    onOpenAsset(makeAsset("kpi_canvas_node", node, ["name", "code", "id"], ["level", "l1_domain"]));
  }

  function startDrag(event: React.PointerEvent, node: AnyRow) {
    const position = nodePosition(node);
    setSelectedNodeId(String(node.id));
    setDragState({
      id: String(node.id),
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent) {
    if (!dragState) return;
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    const x = Math.max(16, Math.round(dragState.originX + dx));
    const y = Math.max(16, Math.round(dragState.originY + dy));
    setDragState({ ...dragState, moved: dragState.moved || Math.abs(dx) + Math.abs(dy) > 4 });
    setDraftPositions((current) => ({ ...current, [dragState.id]: { x, y } }));
  }

  async function endDrag(event: React.PointerEvent, node: AnyRow) {
    if (!dragState || dragState.id !== String(node.id)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const draft = draftPositions[dragState.id];
    setDragState(null);
    if (dragState.moved && draft) {
      suppressNextClickRef.current = true;
      await api(`/api/kpi-canvas/nodes/${encodeURIComponent(String(node.id))}`, {
        method: "PATCH",
        body: JSON.stringify({
          x: draft.x,
          y: draft.y,
          layoutVersion: "p0-manual-layout",
          actor: "local_user"
        })
      });
      setCanvasRefresh((value) => value + 1);
    } else {
      openCanvasNode(node);
    }
  }

  const selectedNode = selectedNodeId ? nodeById[selectedNodeId] : null;

  function openMindNode(node: any) {
    const canvasNode = nodeByMetricId[String(node.id)];
    if (canvasNode) {
      openCanvasNode(canvasNode);
      return;
    }
    onOpenAsset(makeAsset("metric", node, ["name", "code", "id"], ["level", "l1_domain"], true));
  }

  function renderMindNode(node: any, depth = 0): React.ReactNode {
    const canvasNode = nodeByMetricId[String(node.id)];
    const nodeId = canvasNode ? String(canvasNode.id) : String(node.id);
    const selected = selectedNodeId === nodeId;
    return (
      <div className={`mindNodeWrap depth-${Math.min(depth, 3)}`} key={String(node.id)}>
        <button className={`mindNode level-${String(node.level).toLowerCase()} ${selected ? "selected" : ""}`} onClick={() => openMindNode(node)}>
          <span>{cellValue(node.level)}</span>
          <strong>{cellValue(node.name)}</strong>
          <small>{cellValue(node.code)}{node.l1_domain ? ` / ${cellValue(node.l1_domain)}` : ""}</small>
        </button>
        {node.children?.length ? (
          <div className="mindChildren">
            {node.children.map((child: any) => renderMindNode(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="canvasToolbar">
        <div>
          <p className="eyebrow">KPI canvas</p>
          <h3>MECE V2 L0-L3 指标体系画布</h3>
        </div>
        <div className="canvasControls">
          <button className={viewMode === "mindmap" ? "active" : ""} onClick={() => setViewMode("mindmap")}>思维导图</button>
          <button className={viewMode === "object-graph" ? "active" : ""} onClick={() => setViewMode("object-graph")}>Palantir 对象图谱</button>
          <button className={scope === "core" ? "active" : ""} onClick={() => setScope("core")}>L0-L2</button>
          <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>含 L3</button>
          <button onClick={() => setZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(1))))}>-</button>
          <button onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
          <button onClick={() => setZoom((value) => Math.min(1.4, Number((value + 0.1).toFixed(1))))}>+</button>
          <button className="kpiFullscreenButton" onClick={() => setCanvasFullscreen(true)}>最大化预览</button>
          <select value={selectedDomain} onChange={(event) => setSelectedDomain(event.target.value)}>
            <option value="">全部 L1 域</option>
            {domains.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
          </select>
          <input value={kpiSearch} onChange={(event) => setKpiSearch(event.target.value)} placeholder="搜索指标 / 编码" />
        </div>
      </div>
      {tree.error ? <div className="error">{tree.error}</div> : null}
      {canvas.error ? <div className="error">{canvas.error}</div> : null}
      <div className="kpiCanvasStatusGrid" aria-label="KPI canvas data status">
        <article>
          <span>画布节点</span>
          <strong>{canvas.data.length}</strong>
          <small>{visibleNodes.length} visible / {canvasEdges.length} links</small>
        </article>
        <article>
          <span>L0-L3 分布</span>
          <strong>{["L0", "L1", "L2", "L3"].map((level) => `${level}:${levelCounts[level] || 0}`).join(" / ")}</strong>
          <small>来自 `/api/kpi-canvas/nodes`</small>
        </article>
        <article>
          <span>指标树</span>
          <strong>{flat.length}</strong>
          <small>来自 `/api/kpi-tree`</small>
        </article>
        <article>
          <span>当前视图</span>
          <strong>{viewMode === "object-graph" ? "Palantir 对象图谱" : "思维导图"}</strong>
          <small>{scope === "core" ? "L0-L2" : "L0-L3"} / {selectedDomain || "全部 L1 域"}</small>
        </article>
      </div>
      <div className={`kpiPreviewShell ${canvasFullscreen ? "fullscreen" : ""}`} role={canvasFullscreen ? "dialog" : undefined} aria-modal={canvasFullscreen ? "true" : undefined} aria-label="指标体系画布预览">
        <div className="kpiPreviewTopbar">
          <div>
            <p className="eyebrow">Canvas preview</p>
            <h3>{viewMode === "object-graph" ? "Palantir 对象图谱" : "指标思维导图"}</h3>
          </div>
          <div className="badgeCluster">
            <Badge tone="blue">{visibleNodes.length} nodes</Badge>
            <Badge>{canvasEdges.length} links</Badge>
            {canvasFullscreen ? <button className="textButton" onClick={() => setCanvasFullscreen(false)}>退出最大化</button> : null}
          </div>
        </div>
        <div className="kpiWorkbench">
        <div className="kpiMainCanvas">
          {viewMode === "mindmap" ? (
            <div className="kpiMindMapPanel">
              {mindTree.length ? mindTree.map((node) => renderMindNode(node)) : <div className="empty compact">没有匹配的指标节点。</div>}
            </div>
          ) : (
            <div className="kpiCanvasWrap">
              <div className="kpiCanvasSpacer" style={{ height: canvasHeight * zoom, width: canvasWidth * zoom }}>
                <div className="kpiCanvas" style={{ height: canvasHeight, width: canvasWidth, transform: `scale(${zoom})` }}>
                  <svg className="kpiEdges" width={canvasWidth} height={canvasHeight} aria-hidden="true">
                    {canvasEdges.map((edge) => {
                      const source = nodePosition(edge.source);
                      const target = nodePosition(edge.target);
                      const active = highlighted.has(String(edge.source.id)) && highlighted.has(String(edge.target.id));
                      const x1 = source.x + source.width;
                      const y1 = source.y + source.height / 2;
                      const x2 = target.x;
                      const y2 = target.y + target.height / 2;
                      const mid = Math.max(x1 + 28, x1 + (x2 - x1) / 2);
                      return (
                        <path
                          key={`${edge.source.id}-${edge.target.id}`}
                          className={active ? "active" : ""}
                          d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                        />
                      );
                    })}
                  </svg>
                  {visibleNodes.map((node) => (
                    <div
                      key={String(node.id)}
                      className={`kpiNode level-${String(node.level).toLowerCase()} ${Number(node.collapsed || 0) ? "collapsed" : ""} ${highlighted.has(String(node.id)) ? "pathActive" : ""} ${selectedNodeId === String(node.id) ? "selected" : ""}`}
                      style={{
                        left: nodePosition(node).x,
                        top: nodePosition(node).y,
                        width: Number(node.width || 220),
                        height: Number(node.height || 88)
                      }}
                      role="button"
                      tabIndex={0}
                      onPointerDown={(event) => startDrag(event, node)}
                      onPointerMove={moveDrag}
                      onPointerUp={(event) => endDrag(event, node)}
                      onClick={() => {
                        if (suppressNextClickRef.current) {
                          suppressNextClickRef.current = false;
                          return;
                        }
                        openCanvasNode(node);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          openCanvasNode(node);
                        }
                      }}
                    >
                      <span>{cellValue(node.level)}</span>
                      <strong>{cellValue(node.name)}</strong>
                      <small>{cellValue(node.code)}</small>
                      <em>{Number(node.collapsed || 0) ? "collapsed" : "expanded"}</em>
                    </div>
                  ))}
                  {!visibleNodes.length ? <div className="empty compact kpiCanvasEmpty">没有匹配的指标节点，请调整域、层级或搜索条件。</div> : null}
                </div>
              </div>
            </div>
          )}
        </div>
        <aside className="kpiInspector">
          <div className="sectionLabel">
            <span>Inspector</span>
            <strong>节点注解</strong>
          </div>
          {selectedNode ? (
            <>
              <Badge tone={toneFromStatus(String(selectedNode.status || "active"))}>{cellValue(selectedNode.level)}</Badge>
              <h3>{cellValue(selectedNode.name)}</h3>
              <p>{cellValue(selectedNode.code)} / {cellValue(selectedNode.l1_domain || "全域")}</p>
              <div className="kpiInspectorStats">
                <span>{childMap[String(selectedNode.id)]?.length || 0} 下级</span>
                <span>{parentMap[String(selectedNode.id)] ? "有上级" : "根节点"}</span>
                <span>{Number(selectedNode.collapsed || 0) ? "已折叠" : "已展开"}</span>
              </div>
              <button className="textButton" onClick={() => toggleNode(selectedNode)}>折叠/展开</button>
              <button className="textButton" onClick={() => onOpenAsset(makeAsset("kpi_canvas_node", selectedNode, ["name", "code", "id"], ["level", "l1_domain"]))}>打开注解抽屉</button>
            </>
          ) : (
            <p className="muted">点击任一指标节点后，可在这里查看层级、上级/下级、状态，并进入注解、评论和修订建议。</p>
          )}
        </aside>
        </div>
      </div>
      <div className="canvasHint">
        <span>{visibleNodes.length} nodes visible / {canvas.data.length} total / {canvasEdges.length} links</span>
        <div className="canvasActions">
          {selectedNode ? <button className="textButton" onClick={() => toggleNode(selectedNode)}>折叠/展开选中节点</button> : null}
          {selectedNode ? <button className="textButton" onClick={() => onOpenAsset(makeAsset("kpi_canvas_node", selectedNode, ["name", "code", "id"], ["level", "l1_domain"]))}>打开注解</button> : null}
        </div>
      </div>
      <DataTable
        rows={flat}
        columns={["id", "level", "code", "name", "l1_domain"]}
        onSelectRow={(row) => onOpenAsset(makeAsset("metric", row, ["name", "code", "id"], ["level", "l1_domain"], true))}
      />
    </section>
  );
}

function LineagePanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [ruleForm, setRuleForm] = useState({
    ruleName: "可用库存负数必须具备业务例外说明",
    assetType: "metric",
    assetId: "business_available_qty",
    severity: "medium",
    ruleExpression: "available_qty >= 0 OR exception_reason IS NOT NULL",
    expectedBehavior: "当可用库存为负数时，必须能追溯到超卖、预留、同步延迟、调拨占用等业务例外。"
  });
  const [dqNote, setDqNote] = useState("");
  const lineage = useApi<AnyRow[]>("/api/lineage", []);
  const tasks = useApi<AnyRow[]>("/api/governance/tasks", []);
  const qualityRules = useApi<AnyRow[]>(`/api/quality/rules?limit=100&refresh=${refresh}`, []);
  const qualityIssues = useApi<AnyRow[]>(`/api/quality/issues?limit=100&refresh=${refresh}`, []);
  const qualitySummary = useApi<any>(`/api/quality/summary?refresh=${refresh}`, {
    rules: { total: 0, byStatus: [], bySeverity: [] },
    issues: { total: 0, byStatus: [], bySeverity: [], byAssetType: [] },
    openImpact: []
  });

  async function createRule(event: React.FormEvent) {
    event.preventDefault();
    const ruleCode = `DQ_${Date.now()}`;
    await api("/api/quality/rules", {
      method: "POST",
      body: JSON.stringify({
        ruleCode,
        ...ruleForm,
        owner: "data_governance",
        actor: "local_user"
      })
    });
    setDqNote(`已创建质量规则 ${ruleCode}`);
    setRefresh((value) => value + 1);
  }

  async function reviewRule(rule: AnyRow, status: string) {
    await api(`/api/quality/rules/${encodeURIComponent(String(rule.id))}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        note: `P0 quality workflow marked rule as ${status}.`
      })
    });
    setDqNote(`规则 ${cellValue(rule.rule_code)} 已更新为 ${status}`);
    setRefresh((value) => value + 1);
  }

  async function runRule(rule: AnyRow, result: "issue" | "pass") {
    await api(`/api/quality/rules/${encodeURIComponent(String(rule.id))}/run`, {
      method: "POST",
      body: JSON.stringify({
        result,
        issueTitle: `${cellValue(rule.rule_name)} 检查结果`,
        issueDetail: result === "pass"
          ? "本次检查记录为通过，不生成质量问题。"
          : "本次检查生成待复核质量问题，需要 owner 确认业务例外、字段映射或同步链路。",
        evidence: [{ type: "quality_rule", ref: String(rule.rule_code), result }],
        actor: "local_user"
      })
    });
    setDqNote(result === "pass" ? `规则 ${cellValue(rule.rule_code)} 已记录通过` : `规则 ${cellValue(rule.rule_code)} 已生成质量问题`);
    setRefresh((value) => value + 1);
  }

  async function closeIssue(issue: AnyRow) {
    await api(`/api/quality/issues/${encodeURIComponent(String(issue.id))}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "closed",
        reviewNote: "P0 close-loop smoke: issue reviewed and closed with evidence retained.",
        evidence: [{ type: "review", ref: String(issue.id), status: "closed" }],
        actor: "local_user"
      })
    });
    setDqNote(`质量问题 ${cellValue(issue.issue_title)} 已关闭`);
    setRefresh((value) => value + 1);
  }

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="qualitySummaryGrid">
        <div>
          <span>规则总数</span>
          <strong>{qualitySummary.data.rules.total}</strong>
          <small>{qualitySummary.data.rules.byStatus.map((item: AnyRow) => `${item.status}:${item.count}`).join(" / ") || "no rules"}</small>
        </div>
        <div>
          <span>问题总数</span>
          <strong>{qualitySummary.data.issues.total}</strong>
          <small>{qualitySummary.data.issues.byStatus.map((item: AnyRow) => `${item.status}:${item.count}`).join(" / ") || "no issues"}</small>
        </div>
        <div>
          <span>影响资产</span>
          <strong>{qualitySummary.data.openImpact.length}</strong>
          <small>open/reviewing impact groups</small>
        </div>
      </div>
      {dqNote ? <div className="kbNotice">{dqNote}</div> : null}
      <div className="qualityWorkbench">
        <form className="qualityRuleForm" onSubmit={createRule}>
          <div className="surfaceHead">
            <h3>创建质量规则</h3>
            <Badge tone="blue">ledger workflow</Badge>
          </div>
          <label>
            规则名称
            <input value={ruleForm.ruleName} onChange={(event) => setRuleForm({ ...ruleForm, ruleName: event.target.value })} />
          </label>
          <div className="formGrid">
            <label>
              资产类型
              <input value={ruleForm.assetType} onChange={(event) => setRuleForm({ ...ruleForm, assetType: event.target.value })} />
            </label>
            <label>
              资产 ID
              <input value={ruleForm.assetId} onChange={(event) => setRuleForm({ ...ruleForm, assetId: event.target.value })} />
            </label>
            <label>
              严重度
              <select value={ruleForm.severity} onChange={(event) => setRuleForm({ ...ruleForm, severity: event.target.value })}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
            </label>
          </div>
          <label>
            规则表达式
            <textarea value={ruleForm.ruleExpression} onChange={(event) => setRuleForm({ ...ruleForm, ruleExpression: event.target.value })} />
          </label>
          <label>
            期望行为
            <textarea value={ruleForm.expectedBehavior} onChange={(event) => setRuleForm({ ...ruleForm, expectedBehavior: event.target.value })} />
          </label>
          <button type="submit">创建规则</button>
        </form>
        <div className="qualityImpact">
          <div className="surfaceHead">
            <h3>影响面</h3>
            <Badge>{qualitySummary.data.openImpact.length} groups</Badge>
          </div>
          {qualitySummary.data.openImpact.length ? (
            <div className="impactList">
              {qualitySummary.data.openImpact.map((item: AnyRow) => (
                <article key={`${item.asset_type}-${item.asset_id}-${item.severity}`}>
                  <strong>{cellValue(item.asset_id)}</strong>
                  <span>{cellValue(item.asset_type)} / {cellValue(item.severity)}</span>
                  <Badge tone="warn">{cellValue(item.issue_count)} issues</Badge>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty compact">暂无 open/reviewing 影响面。</div>
          )}
        </div>
      </div>
      <div className="split">
        <div className="surface">
          <div className="surfaceHead">
            <h3>血缘边</h3>
            <Badge>{lineage.data.length} edges</Badge>
          </div>
          <DataTable
            rows={lineage.data.slice(0, 260)}
            columns={["source_ref", "edge_type", "target_ref", "confidence", "status"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("lineage_edge", row, ["edge_type", "id"], ["source_ref", "target_ref"]))}
          />
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>治理任务</h3>
            <Badge>{tasks.data.length} tasks</Badge>
          </div>
          <DataTable
            rows={tasks.data.slice(0, 140)}
            columns={["task_type", "target_ref", "title", "owner", "status", "priority"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("governance_task", row, ["title", "id"], ["task_type", "owner"]))}
          />
        </div>
      </div>
      <div className="split qualitySplit">
        <div className="surface">
          <div className="surfaceHead">
            <h3>质量规则</h3>
            <Badge>{qualityRules.data.length} rules</Badge>
          </div>
          <div className="qualityCards">
            {qualityRules.data.length ? qualityRules.data.map((rule) => (
              <article className="qualityCard" key={String(rule.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(rule.rule_name)}</strong>
                  <Badge tone={toneFromStatus(String(rule.lifecycle_status))}>{cellValue(rule.lifecycle_status)}</Badge>
                </div>
                <p>{cellValue(rule.expected_behavior)}</p>
                <small>{cellValue(rule.rule_code)} / {cellValue(rule.asset_type)}:{cellValue(rule.asset_id)} / {cellValue(rule.severity)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("quality_rule", rule, ["rule_name", "rule_code", "id"], ["asset_type", "asset_id"]))}>详情</button>
                  <button className="textButton" onClick={() => reviewRule(rule, "reviewed")}>审核</button>
                  <button className="textButton" onClick={() => reviewRule(rule, "certified")}>认证</button>
                  <button className="textButton" onClick={() => runRule(rule, "issue")}>运行并生成问题</button>
                  <button className="textButton" onClick={() => runRule(rule, "pass")}>记录通过</button>
                </div>
              </article>
            )) : <div className="empty compact">暂无质量规则，可先创建一条规则。</div>}
          </div>
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>质量问题</h3>
            <Badge>{qualityIssues.data.length} issues</Badge>
          </div>
          <div className="qualityCards">
            {qualityIssues.data.length ? qualityIssues.data.map((issue) => (
              <article className="qualityCard" key={String(issue.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(issue.issue_title)}</strong>
                  <Badge tone={toneFromStatus(String(issue.status))}>{cellValue(issue.status)}</Badge>
                </div>
                <p>{cellValue(issue.issue_detail)}</p>
                <small>{cellValue(issue.asset_type)}:{cellValue(issue.asset_id)} / {cellValue(issue.severity)} / {cellValue(issue.owner)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("quality_issue", issue, ["issue_title", "id"], ["asset_type", "asset_id"]))}>详情</button>
                  {String(issue.status) !== "closed" ? <button className="textButton" onClick={() => closeIssue(issue)}>关闭复盘</button> : null}
                </div>
              </article>
            )) : <div className="empty compact">暂无质量问题。运行规则后可生成问题。</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function safeJsonList(value: unknown) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function ChatBiPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ status: "", answerPolicy: "", q: "" });
  const [activeChatbiSection, setActiveChatbiSection] = useState("scorecard");
  const query = [
    "limit=160",
    `refresh=${refresh}`,
    filters.status ? `status=${encodeURIComponent(filters.status)}` : "",
    filters.answerPolicy ? `answerPolicy=${encodeURIComponent(filters.answerPolicy)}` : "",
    filters.q ? `q=${encodeURIComponent(filters.q)}` : ""
  ].filter(Boolean).join("&");
  const contexts = useApi<AnyRow[]>(`/api/chatbi/context?${query}`, []);
  const summary = useApi<ChatbiSummary>(`/api/chatbi/summary?refresh=${refresh}`, {
    total: 0,
    certified: 0,
    draft: 0,
    rejected: 0,
    averageAnswerabilityScore: 0,
    weakContexts: 0,
    byStatus: [],
    byPolicy: [],
    answerabilityBuckets: [],
    answerabilityPolicy: {
      certifiedAnswerPolicy: "certified_metric_only",
      localEvidenceSamplePolicy: "local_kb_evidence_sample",
      refusalRule: "missing certified context returns governed refusal"
    },
    pending: []
  });
  const scorecard = useApi<ChatbiAnswerabilityScorecard>(`/api/chatbi/answerability-scorecard?refresh=${refresh}`, {
    summary: {
      total: 0,
      certified: 0,
      draft: 0,
      weak: 0,
      average_score: 0,
      evidence_count: 0,
      certified_coverage_rate: 0,
      refusal_like_count: 0,
      providerCalls: false,
      erpWriteback: false
    },
    answerabilityBuckets: [],
    domainScorecards: [],
    weakContexts: [],
    policy: {
      answerPolicy: "certified_metric_only",
      refusalRule: "未认证指标或弱证据上下文只进入治理队列。",
      evidenceExport: "local evidence package",
      providerCalls: false,
      erpWriteback: false
    }
  });
  const metrics = useApi<Metric[]>("/api/metrics?level=L3&q=库存", []);
  const [question, setQuestion] = useState("库存可售性可以分析哪些认证指标？");
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    metricId: "",
    questionSample: "库存可售性可以分析哪些认证指标？",
    allowedDimensions: "time,sku,warehouse",
    evidenceChain: "MECE V2 metric blueprint, field mapping template, owner review"
  });

  useEffect(() => {
    if (form.metricId || !metrics.data.length) return;
    setForm((current) => ({ ...current, metricId: String(metrics.data[0].id) }));
  }, [metrics.data.length, form.metricId]);

  function openContext(row: AnyRow) {
    onOpenAsset(makeAsset("chatbi_context", row, ["question_sample", "name", "code", "id"], ["answer_policy", "metric_id", "status"]));
  }

  async function dryRun() {
    setRunning(true);
    setNote("");
    try {
      setResult(await api("/api/chatbi/dry-run", { method: "POST", body: JSON.stringify({ question }) }));
    } finally {
      setRunning(false);
    }
  }

  async function createContext(event: React.FormEvent) {
    event.preventDefault();
    if (!form.metricId || !form.questionSample.trim()) return;
    const payload = await api<{ ok: boolean; context: AnyRow }>("/api/chatbi/context", {
      method: "POST",
      body: JSON.stringify({
        metricId: form.metricId,
        questionSample: form.questionSample,
        allowedDimensions: form.allowedDimensions.split(",").map((item) => item.trim()).filter(Boolean),
        evidenceChain: form.evidenceChain.split(",").map((item) => item.trim()).filter(Boolean),
        answerability: "partial",
        answerabilityScore: 68,
        evidenceCount: Math.max(1, form.evidenceChain.split(",").filter(Boolean).length),
        actor: "local_user"
      })
    });
    setNote(`已创建 ChatBI 上下文候选 ${cellValue(payload.context.id)}，等待 Owner 审核。`);
    setRefresh((value) => value + 1);
  }

  async function reviewContext(row: AnyRow, status: "certified" | "rejected" | "reviewed") {
    const payload = await api<{ ok: boolean; context: AnyRow }>(`/api/chatbi/context/${encodeURIComponent(String(row.id))}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: status === "certified"
          ? "UI owner review: context can be used by certified_metric_only ChatBI dry-run."
          : status === "rejected"
            ? "UI owner review: context rejected; keep evidence for audit only."
            : "UI owner review: semantics checked, pending certification decision."
      })
    });
    setNote(`上下文 ${cellValue(payload.context.id)} 已更新为 ${cellValue(payload.context.status)}。`);
    setRefresh((value) => value + 1);
  }

  const pendingContexts = contexts.data.filter((item) => ["draft", "review_pending", "reviewed"].includes(String(item.status)));
  const certifiedContexts = contexts.data.filter((item) => String(item.status) === "certified");
  const chatbiSections = [
    { id: "scorecard", label: "评分运营", helper: "可回答性、弱证据、领域覆盖", badge: scorecard.data.summary.total },
    { id: "authoring", label: "上下文生成", helper: "创建候选与 Dry-run", badge: metrics.data.length },
    { id: "contexts", label: "认证队列", helper: "待审、认证、拒答上下文", badge: contexts.data.length }
  ];
  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="chatbiSummaryGrid">
        <div>
          <span>上下文总数</span>
          <strong>{summary.data.total}</strong>
          <small>{summary.data.byStatus.map((item) => `${item.status}:${item.count}`).join(" / ") || "no status"}</small>
        </div>
        <div>
          <span>已认证</span>
          <strong>{summary.data.certified}</strong>
          <small>only certified_metric_only can answer</small>
        </div>
        <div>
          <span>待审核</span>
          <strong>{summary.data.draft}</strong>
          <small>draft / review_pending / reviewed</small>
        </div>
        <div>
          <span>已拒绝</span>
          <strong>{summary.data.rejected}</strong>
          <small>保留证据，不进入正式回答</small>
        </div>
      </div>
      <WorkbenchSectionNav
        sections={chatbiSections}
        active={activeChatbiSection}
        onChange={setActiveChatbiSection}
        ariaLabel="ChatBI 语义治理台分区"
      />
      <div className={sectionPaneClass(activeChatbiSection, "scorecard")}>
      <div className="chatbiAnswerabilityPanel">
        <div>
          <p className="eyebrow">Answerability governance</p>
          <h3>可回答性分层</h3>
          <span>{summary.data.answerabilityPolicy?.refusalRule}</span>
        </div>
        <div className="answerabilityMiniGrid">
          <article>
            <span>平均可回答性</span>
            <strong>{summary.data.averageAnswerabilityScore || 0}</strong>
            <small>score / 100</small>
          </article>
          <article>
            <span>弱证据上下文</span>
            <strong>{summary.data.weakContexts || 0}</strong>
            <small>insufficient / refused / score&lt;55</small>
          </article>
          {(summary.data.answerabilityBuckets || []).slice(0, 4).map((bucket) => (
            <article key={String(bucket.answerability)}>
              <span>{cellValue(bucket.answerability)}</span>
              <strong>{cellValue(bucket.count)}</strong>
              <small>answerability bucket</small>
            </article>
          ))}
        </div>
      </div>
      <div className="surface chatbiScorecardPanel">
        <div className="surfaceHead">
          <div>
            <p className="eyebrow">Semantic operations</p>
            <h3>ChatBI 可回答性评分运营面板</h3>
          </div>
          <Badge tone={scorecard.data.summary.providerCalls ? "bad" : "good"}>provider off</Badge>
        </div>
        <div className="answerabilityScoreGrid">
          <article>
            <span>认证覆盖率</span>
            <strong>{Math.round(Number(scorecard.data.summary.certified_coverage_rate || 0) * 100)}%</strong>
            <small>{scorecard.data.summary.certified} certified / {scorecard.data.summary.total} contexts</small>
          </article>
          <article>
            <span>平均可回答性</span>
            <strong>{scorecard.data.summary.average_score || 0}</strong>
            <small>score / 100</small>
          </article>
          <article>
            <span>弱证据队列</span>
            <strong>{scorecard.data.summary.weak || 0}</strong>
            <small>score&lt;55 / refused / rejected</small>
          </article>
          <article>
            <span>证据片段</span>
            <strong>{scorecard.data.summary.evidence_count || 0}</strong>
            <small>local KB evidence only</small>
          </article>
        </div>
        <p className="scorecardPolicy">{scorecard.data.policy.refusalRule}</p>
        <div className="answerabilityDomainGrid">
          {scorecard.data.domainScorecards.length ? scorecard.data.domainScorecards.slice(0, 8).map((domain) => (
            <article key={String(domain.l1_domain)}>
              <div className="ledgerItemHead">
                <strong>{cellValue(domain.l1_domain)}</strong>
                <Badge tone={Number(domain.weak_contexts || 0) ? "warn" : "good"}>{cellValue(domain.average_score)}分</Badge>
              </div>
              <ScoreLine score={Number(domain.average_score || 0)} />
              <small>
                {cellValue(domain.certified_contexts)} certified / {cellValue(domain.total_contexts)} contexts · {cellValue(domain.evidence_count)} evidence
              </small>
            </article>
          )) : <div className="empty compact">暂无领域覆盖数据。先创建或认证 ChatBI 上下文。</div>}
        </div>
        <div className="answerabilityWeakQueue">
          <div className="surfaceHead compactHead">
            <h4>弱证据与拒答治理队列</h4>
            <Badge tone={scorecard.data.weakContexts.length ? "warn" : "good"}>{scorecard.data.weakContexts.length} visible</Badge>
          </div>
          <div className="weakContextList">
            {scorecard.data.weakContexts.length ? scorecard.data.weakContexts.slice(0, 6).map((context) => (
              <article key={String(context.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(context.question_sample)}</strong>
                  <Badge tone={answerabilityTone(String(context.answerability))}>{cellValue(context.answerability_score)}/100</Badge>
                </div>
                <p>{cellValue(context.name || context.metric_id)} / {cellValue(context.l1_domain)}</p>
                <small>{cellValue(context.recommended_action)}</small>
                <button className="textButton" onClick={() => openContext(context)}>打开上下文</button>
              </article>
            )) : <div className="empty compact">当前没有弱证据上下文。</div>}
          </div>
        </div>
      </div>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      <div className={sectionPaneClass(activeChatbiSection, "authoring")}>
      <div className="chatbiWorkbench">
        <form className="chatbiForm" onSubmit={createContext}>
          <div className="surfaceHead">
            <h3>创建问法上下文候选</h3>
            <Badge tone="warn">draft</Badge>
          </div>
          <label>
            绑定 L3 指标
            <select value={form.metricId} onChange={(event) => setForm({ ...form, metricId: event.target.value })}>
              {metrics.data.map((metric) => (
                <option key={metric.id} value={metric.id}>{metric.code} / {metric.name}</option>
              ))}
            </select>
          </label>
          <label>
            问法样本
            <textarea value={form.questionSample} onChange={(event) => setForm({ ...form, questionSample: event.target.value })} />
          </label>
          <div className="formGrid">
            <label>
              可用维度
              <input value={form.allowedDimensions} onChange={(event) => setForm({ ...form, allowedDimensions: event.target.value })} />
            </label>
            <label>
              证据链
              <input value={form.evidenceChain} onChange={(event) => setForm({ ...form, evidenceChain: event.target.value })} />
            </label>
          </div>
          <button type="submit">写入候选上下文</button>
        </form>
        <div className="surface">
          <div className="surfaceHead">
            <h3>可回答性 Dry-run</h3>
            <Badge tone={result?.answerable ? "good" : result ? "bad" : "warn"}>{result?.answerable ? "answerable" : "fail-closed"}</Badge>
          </div>
          <div className="chatBox">
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
            <button onClick={dryRun}>{running ? "判断中..." : "Dry-run"}</button>
          </div>
          {result ? (
            <div className="dryRunResult">
              <div className="ledgerItemHead">
                <strong>{result.answerable ? "命中认证上下文" : "拒答"}</strong>
                <Badge tone={result.answerable ? "good" : "bad"}>{result.policy}</Badge>
              </div>
              {result.rejectReason ? <p>{result.rejectReason}</p> : <p>{result.answerPreview}</p>}
              <pre>{JSON.stringify(result.candidates || [], null, 2)}</pre>
            </div>
          ) : null}
        </div>
      </div>
      </div>
      <div className={sectionPaneClass(activeChatbiSection, "contexts")}>
      <div className="surface chatbiFilters">
        <label>
          状态
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">全部</option>
            <option value="draft">draft</option>
            <option value="review_pending">review_pending</option>
            <option value="reviewed">reviewed</option>
            <option value="certified">certified</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <label>
          策略
          <select value={filters.answerPolicy} onChange={(event) => setFilters({ ...filters, answerPolicy: event.target.value })}>
            <option value="">全部</option>
            <option value="certified_metric_only">certified_metric_only</option>
            <option value="local_kb_evidence_sample">local_kb_evidence_sample</option>
          </select>
        </label>
        <label className="workflowSearch">
          搜索
          <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="指标、问法、证据链" />
        </label>
      </div>
      <div className="split">
        <div className="surface">
          <div className="surfaceHead">
            <h3>待审上下文</h3>
            <Badge>{pendingContexts.length} pending</Badge>
          </div>
          <div className="contextCards">
            {pendingContexts.length ? pendingContexts.map((context) => (
              <article className="contextCard" key={String(context.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(context.question_sample)}</strong>
                  <Badge tone={toneFromStatus(String(context.status))}>{cellValue(context.status)}</Badge>
                </div>
                <p>{cellValue(context.name)} / {cellValue(context.metric_id)}</p>
                <small>{safeJsonList(context.allowed_dimensions).join(" / ") || "no dimensions"} · evidence {cellValue(context.evidence_count)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => openContext(context)}>详情</button>
                  <button className="textButton" onClick={() => reviewContext(context, "reviewed")}>标记已审</button>
                  <button className="textButton" onClick={() => reviewContext(context, "certified")}>认证发布</button>
                  <button className="textButton" onClick={() => reviewContext(context, "rejected")}>拒绝</button>
                </div>
              </article>
            )) : <div className="empty compact">暂无待审上下文。</div>}
          </div>
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>认证上下文</h3>
            <Badge>{certifiedContexts.length} certified</Badge>
          </div>
          <DataTable
            rows={contexts.data}
            columns={["code", "name", "question_sample", "grain", "answer_policy", "status", "reviewer"]}
            onSelectRow={openContext}
          />
        </div>
      </div>
      </div>
    </section>
  );
}

function parseTerms(value: string) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function toneFromKbQuality(status = ""): "neutral" | "good" | "warn" | "bad" | "blue" {
  if (status === "certifiable") return "good";
  if (status === "usable") return "blue";
  if (status === "needs_review") return "warn";
  if (status === "weak") return "bad";
  return "neutral";
}

function toneFromKbStale(status = ""): "neutral" | "good" | "warn" | "bad" | "blue" {
  if (status === "fresh") return "good";
  if (["review_due", "crosswalk_gap", "downstream_review", "card_gap"].includes(status)) return "warn";
  if (["stale", "status_attention", "metadata_gap", "evidence_gap"].includes(status)) return "bad";
  return "neutral";
}

function KbPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [query, setQuery] = useState("备货业务库存");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [reindexing, setReindexing] = useState(false);
  const [reindexResult, setReindexResult] = useState<string>("");
  const [activeKbSection, setActiveKbSection] = useState("cards");
  const domainPath = `/api/kb/domains?refresh=${refresh}`;
  const cardPath = `/api/kb/cards?limit=80${selectedDomain ? `&domainId=${encodeURIComponent(selectedDomain)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}&refresh=${refresh}`;
  const qualityPath = `/api/kb/quality-summary${selectedDomain ? `?domainId=${encodeURIComponent(selectedDomain)}&` : "?"}refresh=${refresh}`;
  const sourcePath = `/api/kb/sources?limit=80${selectedDomain ? `&domainId=${encodeURIComponent(selectedDomain)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}&refresh=${refresh}`;
  const stalePath = `/api/kb/stale-findings?limit=40${selectedDomain ? `&domainId=${encodeURIComponent(selectedDomain)}` : ""}&refresh=${refresh}`;
  const crosswalkPath = `/api/kb/crosswalk-matrix${selectedDomain ? `?domainId=${encodeURIComponent(selectedDomain)}&` : "?"}refresh=${refresh}`;
  const rulePath = `/api/knowledge-rules?limit=60${selectedDomain ? `&q=${encodeURIComponent(selectedDomain)}` : ""}&refresh=${refresh}`;
  const domains = useApi<KbDomain[]>(domainPath, []);
  const cards = useApi<KbCard[]>(cardPath, []);
  const quality = useApi<KbQualitySummary>(qualityPath, {
    totals: { domains: 0, sources: 0, cards: 0, chunks: 0, crosswalks: 0 },
    cards: { total: 0, average_quality_score: 0, certifiable: 0, usable: 0, needs_review: 0, weak: 0, stale_findings: 0, uncrosswalked: 0 },
    domains: []
  });
  const sources = useApi<KbSourceRegister[]>(sourcePath, []);
  const staleFindings = useApi<KbStaleFinding[]>(stalePath, []);
  const crosswalkMatrix = useApi<KbCrosswalkMatrix>(crosswalkPath, {
    summary: { rows: 0, crosswalks: 0, mapped_metrics: 0, total_l3_metrics: 0, metric_coverage_rate: 0 },
    rows: []
  });
  const ruleSummary = useApi<KnowledgeRuleSummary>(`/api/knowledge-rules/summary?refresh=${refresh}`, {
    total: 0,
    draft: 0,
    certified: 0,
    conflicts: 0,
    byStatus: [],
    byTargetObject: [],
    byConflictStatus: [],
    boundary: { mode: "local_rule_governance", importAllowed: false, providerCalls: false, erpWriteback: false }
  });
  const rules = useApi<KnowledgeRule[]>(rulePath, []);
  const [ruleNote, setRuleNote] = useState("");
  const [activeRuleId, setActiveRuleId] = useState("");
  const sourcePager = usePagination<KbSourceRegister>(sources.data, 10);
  const findingPager = usePagination<KbStaleFinding>(staleFindings.data, 6);
  const crosswalkPager = usePagination<AnyRow>(crosswalkMatrix.data.rows, 10);
  const rulePager = usePagination<KnowledgeRule>(rules.data, 6);
  const cardPager = usePagination<KbCard>(cards.data, 6);

  useEffect(() => {
    sourcePager.setPage(1);
    findingPager.setPage(1);
    crosswalkPager.setPage(1);
    rulePager.setPage(1);
    cardPager.setPage(1);
  }, [query, selectedDomain]);

  async function reindex() {
    setReindexing(true);
    setReindexResult("");
    try {
      const result = await api<{ ok: boolean; summary: Record<string, number | string | boolean> }>("/api/kb/reindex", {
        method: "POST",
        body: JSON.stringify({ actor: "local_user" })
      });
      setReindexResult(`已索引 ${result.summary.cards} 张知识卡 / ${result.summary.chunks} 个片段`);
      setRefresh((value) => value + 1);
    } catch (error) {
      setReindexResult(error instanceof Error ? error.message : String(error));
    } finally {
      setReindexing(false);
    }
  }

  function openCard(card: KbCard) {
    onOpenAsset({
      type: "kb_card",
      id: card.id,
      title: card.title,
      subtitle: `${card.domain_name} / ${card.source_path}`,
      fields: {
        id: card.id,
        title: card.title,
        domain_name: card.domain_name,
        source_path: card.source_path,
        evidence_level: card.evidence_level,
        business_terms: card.business_terms,
        crosswalk_count: card.crosswalk_count,
        chunk_count: card.chunk_count,
        quality_score: card.quality_score || 0,
        quality_status: card.quality_status || "",
        completeness_score: card.completeness_score || 0,
        evidence_score: card.evidence_score || 0,
        freshness_score: card.freshness_score || 0,
        usage_score: card.usage_score || 0,
        stale_status: card.stale_status || "",
        stale_reason: card.stale_reason || "",
        summary: card.summary
      },
      readOnly: true
    });
  }

  function openRule(rule: KnowledgeRule) {
    onOpenAsset({
      type: "knowledge_rule",
      id: rule.id,
      title: rule.rule_name,
      subtitle: `${rule.rule_code} / ${rule.target_object_type}`,
      fields: {
        id: rule.id,
        rule_code: rule.rule_code,
        rule_type: rule.rule_type,
        target_object_type: rule.target_object_type,
        target_metric_ids: rule.target_metric_ids.join(", "),
        target_dimension_ids: rule.target_dimension_ids.join(", "),
        condition_expression: rule.condition_expression,
        conflict_status: rule.conflict_status,
        lifecycle_status: rule.lifecycle_status,
        owner: rule.owner,
        priority: rule.priority,
        workflow_id: rule.workflow_id,
        source_card_id: rule.source_card_id,
        source_card_title: rule.source_card_title || "",
        recommendation_count: rule.recommendation_count || 0,
        review_note: rule.review_note || ""
      },
      readOnly: true
    });
  }

  async function createRuleFromCard(card: KbCard) {
    setActiveRuleId(card.id);
    setRuleNote("");
    try {
      const payload = await api<{ ok: boolean; rule: KnowledgeRule; conflicts: AnyRow[] }>("/api/knowledge-rules", {
        method: "POST",
        body: JSON.stringify({
          sourceCardId: card.id,
          ruleName: `${card.title} - 规则候选`,
          createdBy: "local_user"
        })
      });
      setRuleNote(`已生成知识规则 ${payload.rule.rule_code}，冲突 ${payload.conflicts.length} 条，等待 Owner 复核。`);
      setRefresh((value) => value + 1);
    } catch (error) {
      setRuleNote(error instanceof Error ? error.message : String(error));
    } finally {
      setActiveRuleId("");
    }
  }

  async function reviewRule(rule: KnowledgeRule, status: "reviewed" | "certified" | "rejected") {
    setActiveRuleId(rule.id);
    try {
      const payload = await api<{ ok: boolean; rule: KnowledgeRule }>(`/api/knowledge-rules/${encodeURIComponent(rule.id)}/review`, {
        method: "POST",
        body: JSON.stringify({
          status,
          conflictStatus: status === "rejected" ? "rejected" : rule.conflict_status === "conflict" ? "conflict" : "clear",
          reviewer: "local_user",
          reviewNote: status === "certified"
            ? "UI owner review: rule can be used by semantic governance and AIP recommendation cards."
            : status === "rejected"
              ? "UI owner review: rule rejected; evidence retained for audit."
              : "UI owner review: rule checked, pending certification."
        })
      });
      setRuleNote(`规则 ${payload.rule.rule_code} 已更新为 ${payload.rule.lifecycle_status}。`);
      setRefresh((value) => value + 1);
    } finally {
      setActiveRuleId("");
    }
  }

  async function runRule(rule: KnowledgeRule) {
    setActiveRuleId(rule.id);
    try {
      const payload = await api<{ ok: boolean; recommendation: { recommendation: AipRecommendation } }>(`/api/knowledge-rules/${encodeURIComponent(rule.id)}/run`, {
        method: "POST",
        body: JSON.stringify({ actor: "local_user" })
      });
      setRuleNote(`规则已触发建议卡 ${payload.recommendation.recommendation.id}，进入人工审批与复盘边界。`);
      setRefresh((value) => value + 1);
    } finally {
      setActiveRuleId("");
    }
  }

  const kbSections = [
    { id: "cards", label: "证据卡片", helper: "主题域、知识卡、规则候选", badge: cards.data.length },
    { id: "sources", label: "知识源", helper: "来源台账与主题域质量", badge: sources.data.length },
    { id: "diagnostics", label: "诊断映射", helper: "复核发现与指标 crosswalk", badge: staleFindings.data.length },
    { id: "rules", label: "规则治理", helper: "知识规则候选、认证、建议卡", badge: ruleSummary.data.total }
  ];

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="kbToolbar">
        <div className="searchBox">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索规则、指标、对象、业务术语" />
        </div>
        <button className="secondaryButton" onClick={reindex} disabled={reindexing}>
          {reindexing ? "索引中..." : "重建本地索引"}
        </button>
      </div>
      {reindexResult ? <div className="kbNotice">{reindexResult}</div> : null}
      {ruleNote ? <div className="kbNotice">{ruleNote}</div> : null}
      {domains.error ? <div className="error">{domains.error}</div> : null}
      {cards.error ? <div className="error">{cards.error}</div> : null}
      {quality.error ? <div className="error">{quality.error}</div> : null}
      {sources.error ? <div className="error">{sources.error}</div> : null}
      {staleFindings.error ? <div className="error">{staleFindings.error}</div> : null}
      {crosswalkMatrix.error ? <div className="error">{crosswalkMatrix.error}</div> : null}
      {ruleSummary.error ? <div className="error">{ruleSummary.error}</div> : null}
      {rules.error ? <div className="error">{rules.error}</div> : null}
      <div className="kbGovernanceGrid">
        <article>
          <span>知识源台账</span>
          <strong>{quality.data.totals.sources}</strong>
          <small>{quality.data.totals.cards} cards / {quality.data.totals.chunks} chunks</small>
        </article>
        <article>
          <span>卡片平均质量</span>
          <strong>{quality.data.cards.average_quality_score}</strong>
          <small>{quality.data.cards.certifiable + quality.data.cards.usable} usable / {quality.data.cards.total} total</small>
        </article>
        <article>
          <span>复核发现</span>
          <strong>{staleFindings.data.length}</strong>
          <small>{quality.data.cards.stale_findings} stale / {quality.data.cards.uncrosswalked} no crosswalk</small>
        </article>
        <article>
          <span>指标 Crosswalk</span>
          <strong>{crosswalkMatrix.data.summary.mapped_metrics}</strong>
          <small>{Math.round(Number(crosswalkMatrix.data.summary.metric_coverage_rate || 0) * 100)}% of L3 metrics</small>
        </article>
        <article>
          <span>知识规则</span>
          <strong>{ruleSummary.data.total}</strong>
          <small>{ruleSummary.data.draft} draft / {ruleSummary.data.conflicts} conflicts</small>
        </article>
      </div>
      <WorkbenchSectionNav
        sections={kbSections}
        active={activeKbSection}
        onChange={setActiveKbSection}
        ariaLabel="AI 知识库页面分区"
      />
      <div className={sectionPaneClass(activeKbSection, "cards")}>
        <div className="domainGrid">
          <button className={!selectedDomain ? "active" : ""} onClick={() => setSelectedDomain("")}>
            <strong>全部主题域</strong>
            <span>{domains.data.reduce((sum, domain) => sum + Number(domain.card_count || 0), 0)} cards</span>
          </button>
          {domains.data.map((domain) => (
            <button className={selectedDomain === domain.id ? "active" : ""} key={domain.id} onClick={() => setSelectedDomain(domain.id)}>
              <strong>{domain.name}</strong>
              <span>{domain.card_count} cards / {domain.source_count} sources</span>
              <small>{domain.description}</small>
            </button>
          ))}
        </div>
        <div className="kbResultHeader">
          <div>
            <p className="eyebrow">Local evidence</p>
            <h3>知识卡与证据片段</h3>
          </div>
          <Badge tone={cards.data.length ? "blue" : "warn"}>
            {cards.data.length ? `${cardPager.startIndex + 1}-${cardPager.endIndex} / ${cards.data.length} cards` : "0 / 0 cards"}
          </Badge>
        </div>
        {!cards.data.length ? (
          <div className="empty">暂无知识卡。可点击“重建本地索引”从三大知识库生成本地索引。</div>
        ) : (
          <div className="kbCards">
            {cardPager.pageItems.map((card, index) => {
              const terms = parseTerms(card.business_terms);
              return (
                <article className="kbCard" key={card.id}>
                  <div className="kbCardHead">
                    <div className="kbCardDomain">
                      <span className="cardSerial">#{cardPager.startIndex + index + 1}</span>
                      <Badge tone="blue">{card.domain_name}</Badge>
                    </div>
                    <div className="badgeCluster">
                      <Badge tone={toneFromKbQuality(card.quality_status)}>{card.quality_score || 0}</Badge>
                      <Badge tone={toneFromKbStale(card.stale_status)}>{card.stale_status || "fresh"}</Badge>
                    </div>
                  </div>
                  <div className="kbCardTitleBlock">
                    <h3>{card.title}</h3>
                    <p>{card.summary}</p>
                  </div>
                  <div className="kbScoreGrid">
                    <span>完整性 <strong>{card.completeness_score || 0}</strong></span>
                    <span>证据 <strong>{card.evidence_score || 0}</strong></span>
                    <span>时效 <strong>{card.freshness_score || 0}</strong></span>
                    <span>关联 <strong>{card.usage_score || 0}</strong></span>
                  </div>
                  <div className="termRow">
                    {terms.slice(0, 6).map((term) => <span key={term}>{term}</span>)}
                  </div>
                  <div className="kbMeta">
                    <span>{card.source_path}</span>
                    <span>{card.evidence_level} / {card.chunk_count} chunks / {card.crosswalk_count} links</span>
                    {card.stale_reason ? <span>{card.stale_reason}</span> : null}
                  </div>
                  {card.evidence_chunks?.length ? (
                    <div className="evidenceSnippets">
                      {card.evidence_chunks.slice(0, 1).map((chunk) => (
                        <blockquote key={chunk.id}>{chunk.chunk_text.slice(0, 180)}{chunk.chunk_text.length > 180 ? "..." : ""}</blockquote>
                      ))}
                    </div>
                  ) : null}
                  <div className="qualityActions">
                    <button className="textButton" onClick={() => openCard(card)}>打开上下文</button>
                    <button className="textButton createKnowledgeRuleButton" onClick={() => createRuleFromCard(card)} disabled={activeRuleId === card.id}>
                      {activeRuleId === card.id ? "生成中..." : "生成规则候选"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <PaginationBar pager={cardPager} label="知识卡片" />
      </div>
      <div className={sectionPaneClass(activeKbSection, "sources")}>
        <div className="kbOpsGrid">
        <div className="surface sourceRegisterTable">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Source register</p>
              <h3>知识源台账</h3>
            </div>
            <Badge>{sources.data.length} sources</Badge>
          </div>
          <DataTable
            rows={sourcePager.pageItems}
            columns={["domain_name", "title", "source_type", "status", "card_count", "chunk_count", "crosswalk_count", "avg_quality_score", "stale_status"]}
            rowOffset={sourcePager.startIndex}
            onSelectRow={(row) => onOpenAsset(makeAsset("kb_source", row, ["title"], ["domain_name", "source_path"], true))}
          />
          <PaginationBar pager={sourcePager} label="知识源台账" />
        </div>
        <div className="surface kbDomainQualityTable">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Quality by domain</p>
              <h3>主题域质量</h3>
            </div>
            <Badge tone={quality.data.cards.average_quality_score >= 70 ? "good" : "warn"}>{quality.data.cards.average_quality_score} avg</Badge>
          </div>
          <DataTable
            rows={quality.data.domains}
            columns={["domain_name", "source_count", "card_count", "avg_quality_score", "low_quality_cards", "review_cards", "stale_cards", "uncrosswalked_cards", "crosswalk_count"]}
          />
        </div>
      </div>
      </div>
      <div className={sectionPaneClass(activeKbSection, "diagnostics")}>
        <div className="kbDiagnosticsGrid">
        <div className="surface staleFindingsPanel">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Diagnostics</p>
              <h3>复核与异常发现</h3>
            </div>
            <Badge tone={staleFindings.data.length ? "warn" : "good"}>{staleFindings.data.length} findings</Badge>
          </div>
          {staleFindings.data.length ? (
            <div className="findingList">
              {findingPager.pageItems.map((finding, index) => (
                <article key={finding.id}>
                  <div>
                    <strong><span className="inlineIndex">#{findingPager.startIndex + index + 1}</span>{finding.title}</strong>
                    <span>{finding.domain_name} / {finding.finding_type}</span>
                  </div>
                  <Badge tone={toneFromKbStale(finding.stale_status)}>{finding.stale_status}</Badge>
                  <p>{finding.stale_reason}</p>
                  <small>{finding.recommended_action}</small>
                </article>
              ))}
            </div>
          ) : <div className="empty compact">当前筛选范围内暂无复核发现。</div>}
          <PaginationBar pager={findingPager} label="复核发现" />
        </div>
        <div className="surface crosswalkMatrixTable">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Crosswalk matrix</p>
              <h3>知识库到治理资产映射</h3>
            </div>
            <Badge>{crosswalkMatrix.data.summary.crosswalks} links</Badge>
          </div>
          <DataTable
            rows={crosswalkPager.pageItems}
            columns={["domain_name", "asset_type", "crosswalk_count", "card_count", "asset_count", "metric_count", "object_count", "sample_assets"]}
            rowOffset={crosswalkPager.startIndex}
          />
          <PaginationBar pager={crosswalkPager} label="映射矩阵" />
        </div>
      </div>
      </div>
      <div className={sectionPaneClass(activeKbSection, "rules")}>
        <div className="surface knowledgeRulesWorkbench">
        <div className="surfaceHead">
          <div>
            <p className="eyebrow">Rule governance</p>
            <h3>知识规则治理台账</h3>
          </div>
          <div className="exportActions knowledgeRuleExportActions" aria-label="knowledge rule export actions">
            <a href="/api/export/knowledge-rules?format=json" target="_blank" rel="noreferrer">JSON</a>
            <a href="/api/export/knowledge-rules?format=excel" target="_blank" rel="noreferrer">Excel</a>
          </div>
        </div>
        <div className="knowledgeRuleSummaryGrid">
          <article>
            <span>规则总数</span>
            <strong>{ruleSummary.data.total}</strong>
            <small>{ruleSummary.data.byStatus.map((item) => `${item.lifecycle_status}:${item.count}`).join(" / ") || "no status"}</small>
          </article>
          <article>
            <span>已认证规则</span>
            <strong>{ruleSummary.data.certified}</strong>
            <small>can guide ChatBI/AIP</small>
          </article>
          <article>
            <span>冲突待审</span>
            <strong>{ruleSummary.data.conflicts}</strong>
            <small>same target condition</small>
          </article>
          <article>
            <span>治理边界</span>
            <strong>{ruleSummary.data.boundary.providerCalls ? "ON" : "OFF"}</strong>
            <small>provider call / ERP writeback</small>
          </article>
        </div>
        <div className="knowledgeRuleCards">
          {rules.data.length ? rulePager.pageItems.map((rule, index) => (
            <article className="knowledgeRuleCard" key={rule.id}>
              <div className="ledgerItemHead">
                <strong><span className="inlineIndex">#{rulePager.startIndex + index + 1}</span>{rule.rule_name}</strong>
                <Badge tone={rule.conflict_status === "conflict" ? "warn" : "good"}>{rule.conflict_status}</Badge>
              </div>
              <p>{rule.condition_expression}</p>
              <div className="ruleMetaGrid">
                <span>{rule.rule_code}</span>
                <span>{rule.target_object_type}</span>
                <span>{rule.priority}</span>
                <span>{rule.lifecycle_status}</span>
              </div>
              <small>{rule.source_card_title || rule.source_card_id} / rec {rule.recommendation_count || 0}</small>
              <div className="qualityActions">
                <button className="textButton" onClick={() => openRule(rule)}>详情</button>
                <button className="textButton" onClick={() => reviewRule(rule, "reviewed")} disabled={activeRuleId === rule.id}>标记已审</button>
                <button className="textButton" onClick={() => reviewRule(rule, "certified")} disabled={activeRuleId === rule.id || rule.conflict_status === "conflict"}>认证</button>
                <button className="textButton" onClick={() => runRule(rule)} disabled={activeRuleId === rule.id}>触发建议卡</button>
                <button className="textButton" onClick={() => reviewRule(rule, "rejected")} disabled={activeRuleId === rule.id}>拒绝</button>
              </div>
            </article>
          )) : <div className="empty compact">暂无知识规则。可从知识卡片生成规则候选。</div>}
        </div>
        <PaginationBar pager={rulePager} label="知识规则" />
      </div>
      </div>
    </section>
  );
}

function answerabilityTone(answerability = ""): "neutral" | "good" | "warn" | "bad" | "blue" {
  if (answerability === "supported") return "good";
  if (answerability === "partial") return "warn";
  if (answerability === "conflict") return "bad";
  if (answerability === "insufficient") return "bad";
  return "neutral";
}

function toChatSourceContext(asset: AssetRef | null) {
  if (!asset) return null;
  return {
    type: asset.type,
    id: asset.id,
    title: asset.title,
    subtitle: asset.subtitle || "",
    fields: asset.fields
  };
}

function AgentTraceTimelinePanel({ refresh, onOpenAsset }: { refresh: number; onOpenAsset: (asset: AssetRef) => void }) {
  const [selectedId, setSelectedId] = useState("");
  const [note, setNote] = useState("");
  const traces = useApi<AipTrace[]>(`/api/aip/traces?limit=12&refresh=${refresh}`, []);
  const currentTraceId = selectedId || traces.data[0]?.id || "";
  const traceDetail = useApi<AipTraceDetail>(`/api/aip/traces/${encodeURIComponent(currentTraceId || "__missing__")}?refresh=${refresh}`, {
    trace: {
      id: "",
      session_id: "",
      source_message_id: "",
      intent: "no_trace",
      question: "暂无 Agent Trace",
      target_object_type: "",
      target_object_id: "",
      target_metric_id: "",
      answerability: "insufficient",
      answerability_score: 0,
      status: "draft",
      evidence_refs: [],
      created_by: "",
      created_at: ""
    },
    steps: [],
    recommendations: []
  });
  const activeTrace = traceDetail.data.trace.id ? traceDetail.data.trace : traces.data[0];
  const steps = traceDetail.data.steps.length
    ? traceDetail.data.steps
    : [{
        id: "trace-placeholder",
        trace_id: activeTrace?.id || "",
        step_order: 1,
        step_type: "waiting_for_trace",
        step_title: traces.data.length ? "正在读取 trace 详情" : "暂无 trace，先运行本地证据问答或 P0 smoke",
        step_detail: traces.data.length ? "Trace list is available; detail panel is loading." : "Trace ledger will record intent parse, object resolve, evidence binding and answerability gate.",
        input_refs: [],
        output_refs: [],
        status: traces.data.length ? "loading" : "draft",
        created_at: ""
      }];
  const evidenceGap = activeTrace
    ? Math.max(0, 100 - Math.round(Number(activeTrace.answerability_score || 0)))
    : 100;

  async function createRecommendationFromTrace() {
    if (!activeTrace?.id) return;
    const payload = await api<{ ok: boolean; recommendation: AipRecommendation }>("/api/aip/recommendations", {
      method: "POST",
      body: JSON.stringify({
        traceId: activeTrace.id,
        targetObjectId: activeTrace.target_object_id,
        targetObjectType: activeTrace.target_object_type,
        targetMetricId: activeTrace.target_metric_id,
        scenarioType: activeTrace.intent || "semantic_governance",
        recommendationTitle: `复核 ${activeTrace.question.slice(0, 36)}`,
        recommendationDetail: "基于 Agent Trace 创建的 ledger-only 建议卡，需要 owner 审核证据、对象和动作边界。",
        impactSummary: `answerability ${activeTrace.answerability} / score ${activeTrace.answerability_score}`,
        evidenceRefs: [{ type: "trace", ref: activeTrace.id }],
        actionOptions: ["复核对象证据", "补齐指标口径", "创建治理任务"],
        actionTier: "L1",
        owner: "semantic_governance_owner",
        priority: evidenceGap >= 50 ? "P0" : "P1",
        createdBy: "local_user"
      })
    });
    setNote(`已创建建议卡 ${payload.recommendation.id}，进入决策闭环审核。`);
    onOpenAsset(aipRecommendationAsset(payload.recommendation));
  }

  return (
    <div className="agentTraceTimeline">
      <div className="surfaceHead">
        <div>
          <p className="eyebrow">Agent execution trace</p>
          <h3>AI 执行轨迹与证据门控</h3>
        </div>
        <div className="badgeCluster">
          <Badge tone={answerabilityTone(activeTrace?.answerability)}>{activeTrace?.answerability || "insufficient"}</Badge>
          <Badge>{traces.data.length} traces</Badge>
        </div>
      </div>
      {note ? <div className="kbNotice compact">{note}</div> : null}
      {traces.error ? <div className="error compact">{traces.error}</div> : null}
      {currentTraceId && traceDetail.error ? <div className="error compact">{traceDetail.error}</div> : null}
      <div className="traceLayout">
        <aside className="traceList">
          {traces.data.length ? traces.data.map((trace) => (
            <button key={trace.id} className={trace.id === currentTraceId ? "active" : ""} onClick={() => setSelectedId(trace.id)}>
              <strong>{trace.question}</strong>
              <span>{trace.intent}</span>
              <Badge tone={answerabilityTone(trace.answerability)}>{trace.answerability}</Badge>
            </button>
          )) : <div className="empty compact">暂无可选 trace。</div>}
        </aside>
        <div className="traceDetail">
          <div className="answerabilityPanel">
            <div>
              <span>可回答性</span>
              <strong>{activeTrace ? Math.round(Number(activeTrace.answerability_score || 0)) : 0}/100</strong>
            </div>
            <ScoreLine score={activeTrace ? Number(activeTrace.answerability_score || 0) : 0} />
            <small>{activeTrace?.question || "等待问答产生 trace"}</small>
          </div>
          <div className="evidenceGapPanel">
            <span>证据缺口</span>
            <strong>{evidenceGap}</strong>
            <small>{evidenceGap >= 50 ? "需要补证或拒答" : "证据基本可支撑"}</small>
          </div>
          <ol className="traceSteps">
            {steps.map((step) => (
              <li className="traceStep" key={step.id}>
                <span>{step.step_order}</span>
                <div>
                  <strong>{step.step_title}</strong>
                  <p>{step.step_detail}</p>
                  <small>{step.step_type} / {step.status}</small>
                </div>
              </li>
            ))}
          </ol>
          <div className="traceActions">
            {activeTrace?.id ? <button className="textButton" onClick={() => onOpenAsset(aipTraceAsset(activeTrace))}>打开 trace 上下文</button> : null}
            <button className="textButton createRecommendationButton" disabled={!activeTrace?.id} onClick={createRecommendationFromTrace}>生成建议卡</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AiChatPanel({
  module,
  onOpenAsset,
  sourceAsset,
  onClearSourceAsset,
  onWorkbenchRefresh
}: {
  module: WorkbenchModule;
  onOpenAsset: (asset: AssetRef) => void;
  sourceAsset: AssetRef | null;
  onClearSourceAsset: () => void;
  onWorkbenchRefresh: () => void;
}) {
  const [question, setQuestion] = useState("备货业务库存如何计算？有哪些证据来源？");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [result, setResult] = useState<AiChatResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [activeAiSection, setActiveAiSection] = useState("answer");
  const domains = useApi<KbDomain[]>(`/api/kb/domains?refresh=${refresh}`, []);
  const sessions = useApi<AnyRow[]>(`/api/ai-chat/sessions?limit=12&refresh=${refresh}`, []);
  const governance = useApi<AiGovernanceSummary>(`/api/ai-chat/governance-summary?refresh=${refresh}`, {
    questionSamples: { total: 0, avgQuality: 0, byStatus: [], byType: [] },
    feedback: { total: 0, open: 0, byStatus: [], byRating: [] },
    boundary: { providerCalls: false, writeBackPolicy: "semantic_governance_ledger_only" }
  });
  const questionSamples = useApi<AnyRow[]>(`/api/ai-chat/question-samples?limit=24&refresh=${refresh}`, []);
  const feedbackItems = useApi<AnyRow[]>(`/api/ai-chat/feedback?limit=24&refresh=${refresh}`, []);
  const evidenceExports = useApi<AiEvidenceExportRegistryItem[]>(`/api/ai-chat/evidence-exports?limit=24&refresh=${refresh}`, []);

  useEffect(() => {
    if (!sourceAsset) return;
    setQuestion(`请基于「${sourceAsset.title}」说明其供应链治理含义、可用证据、相关指标或规则，以及是否存在口径风险。`);
    setResult(null);
  }, [sourceAsset?.type, sourceAsset?.id]);

  function toggleDomain(domainId: string) {
    setSelectedDomains((current) => (
      current.includes(domainId)
        ? current.filter((id) => id !== domainId)
        : [...current, domainId]
    ));
  }

  async function ask() {
    if (!question.trim()) return;
    setRunning(true);
    setError("");
    try {
      const payload = await api<{ ok: boolean; result: AiChatResult }>("/api/ai-chat/local", {
        method: "POST",
        body: JSON.stringify({
          question,
          domainIds: selectedDomains,
          sourceContext: toChatSourceContext(sourceAsset),
          limit: 8
        })
      });
      setResult(payload.result);
      try {
        const inferredTargetObjectId = sourceAsset?.type === "aip_object"
          ? sourceAsset.id
          : /负|FBA|库存|available/i.test(question)
            ? "obj_batch_fba_negative_available"
            : "";
        const trace = await api<{ ok: boolean; trace: AipTrace }>("/api/aip/traces", {
          method: "POST",
          body: JSON.stringify({
            question,
            sessionId: payload.result.sessionId,
            sourceMessageId: payload.result.messageId,
            intent: sourceAsset?.type === "aip_object" ? "source_context_diagnosis" : "local_knowledge_answerability_check",
            targetObjectId: inferredTargetObjectId,
            targetObjectType: sourceAsset?.type === "aip_object" ? String(sourceAsset.fields.object_type || "") : inferredTargetObjectId ? "inventory_batch" : "",
            targetMetricId: inferredTargetObjectId ? "business_available_qty" : "",
            answerability: payload.result.answerability,
            answerabilityScore: payload.result.answerabilityScore,
            evidenceRefs: payload.result.evidence.slice(0, 5).map((item) => ({
              type: "kb_evidence",
              ref: `${item.domainId}/${item.cardId}/${item.chunkId}`,
              score: item.score
            })),
            createdBy: "local_user"
          })
        });
        setFeedbackNote(`已写入 AIP Trace ${trace.trace.id}，可在执行轨迹中复盘证据链。`);
      } catch (traceErr) {
        setFeedbackNote(`AI 回答已生成；AIP Trace 写入失败：${traceErr instanceof Error ? traceErr.message : String(traceErr)}`);
      }
      setRefresh((value) => value + 1);
      onWorkbenchRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  function openEvidence(evidence: AiEvidence) {
    onOpenAsset({
      type: "kb_card",
      id: evidence.cardId,
      title: evidence.title,
      subtitle: `${evidence.domainName} / ${evidence.sourcePath}`,
      fields: {
        id: evidence.cardId,
        title: evidence.title,
        domain_name: evidence.domainName,
        source_path: evidence.sourcePath,
        chunk_count: 1,
        score: evidence.score,
        summary: evidence.text
      },
      readOnly: true
    });
  }

  async function createQuestionSample(sampleType: "standard" | "synonym" | "reject" | "conflict") {
    if (!result) return;
    const payload = await api<{ ok: boolean; sample: AnyRow }>("/api/ai-chat/question-samples", {
      method: "POST",
      body: JSON.stringify({
        questionText: question,
        sampleType,
        domainIds: selectedDomains,
        expectedAnswerability: result.answerability,
        sourceMessageId: result.messageId,
        targetAssetType: sourceAsset?.type || (result.chatbiContextId ? "chatbi_context" : ""),
        targetAssetId: sourceAsset?.id || result.chatbiContextId || "",
        sourceContext: toChatSourceContext(sourceAsset),
        evidenceRefs: result.evidence.slice(0, 5).map((item) => `kb:${item.domainId}/${item.cardId}/${item.chunkId}`),
        createdBy: "local_user"
      })
    });
    setFeedbackNote(`已沉淀问法样本 ${cellValue(payload.sample.id)}，等待语义审核。`);
    setRefresh((value) => value + 1);
    onWorkbenchRefresh();
  }

  async function createFeedback(rating: "useful" | "not_useful" | "insufficient" | "wrong_evidence") {
    if (!result) return;
    const payload = await api<{ ok: boolean; feedback: AnyRow }>("/api/ai-chat/feedback", {
      method: "POST",
      body: JSON.stringify({
        sessionId: result.sessionId,
        messageId: result.messageId,
        questionText: question,
        rating,
        feedbackText,
        answerability: result.answerability,
        answerabilityScore: result.answerabilityScore,
        evidenceCount: result.evidence.length,
        sourceContext: toChatSourceContext(sourceAsset),
        createdBy: "local_user"
      })
    });
    setFeedbackText("");
    setFeedbackNote(`已记录反馈 ${cellValue(payload.feedback.id)}，并生成语义治理 review workflow。`);
    setRefresh((value) => value + 1);
    onWorkbenchRefresh();
  }

  async function reviewQuestionSample(row: AnyRow, status: "certified" | "reviewed" | "rejected") {
    const payload = await api<{ ok: boolean; sample: AnyRow }>(`/api/ai-chat/question-samples/${encodeURIComponent(String(row.id))}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: status === "certified"
          ? "UI review: question sample is reusable for answerability governance."
          : status === "rejected"
            ? "UI review: sample rejected, evidence retained for audit."
            : "UI review: sample checked, pending certification."
      })
    });
    setFeedbackNote(`问法样本 ${cellValue(payload.sample.id)} 已更新为 ${cellValue(payload.sample.status)}。`);
    setRefresh((value) => value + 1);
  }

  async function reviewFeedback(row: AnyRow, status: "resolved" | "closed" | "rejected") {
    const payload = await api<{ ok: boolean; feedback: AnyRow }>(`/api/ai-chat/feedback/${encodeURIComponent(String(row.id))}/review`, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        reviewNote: status === "resolved"
          ? "UI review: feedback translated into semantic governance action."
          : status === "closed"
            ? "UI review: feedback reviewed and closed."
            : "UI review: feedback rejected as not actionable."
      })
    });
    setFeedbackNote(`反馈 ${cellValue(payload.feedback.id)} 已更新为 ${cellValue(payload.feedback.status)}。`);
    setRefresh((value) => value + 1);
  }

  const aiSections = [
    { id: "answer", label: "问答台", helper: "范围、问题、证据回答", badge: result?.evidence.length || selectedDomains.length || "all" },
    { id: "trace", label: "执行轨迹", helper: "Agent trace 与证据门控", badge: "AIP" },
    { id: "exports", label: "证据导出", helper: "JSON/Markdown 证据包台账", badge: evidenceExports.data.length },
    { id: "samples", label: "样本反馈", helper: "问法样本与回答反馈队列", badge: questionSamples.data.length + feedbackItems.data.length }
  ];

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="aiGovernanceGrid">
        <article>
          <span>问法样本</span>
          <strong>{governance.data.questionSamples.total}</strong>
          <small>avg quality {governance.data.questionSamples.avgQuality || 0}</small>
        </article>
        <article>
          <span>反馈总量</span>
          <strong>{governance.data.feedback.total}</strong>
          <small>{governance.data.feedback.open} open</small>
        </article>
        <article>
          <span>语义边界</span>
          <strong>{governance.data.boundary.providerCalls ? "ON" : "OFF"}</strong>
          <small>{governance.data.boundary.writeBackPolicy}</small>
        </article>
      </div>
      {feedbackNote ? <div className="kbNotice">{feedbackNote}</div> : null}
      <WorkbenchSectionNav
        sections={aiSections}
        active={activeAiSection}
        onChange={setActiveAiSection}
        ariaLabel="AI 对话页面分区"
      />
      <div className={sectionPaneClass(activeAiSection, "answer")}>
      <div className="aiChatLayout">
        <aside className="aiChatScope">
          <div className="surfaceHead">
            <h3>知识范围</h3>
            <Badge>{selectedDomains.length || "全部"}</Badge>
          </div>
          <div className="scopeList">
            {domains.data.map((domain) => (
              <label key={domain.id} className={selectedDomains.includes(domain.id) ? "active" : ""}>
                <input type="checkbox" checked={selectedDomains.includes(domain.id)} onChange={() => toggleDomain(domain.id)} />
                <span>
                  <strong>{domain.name}</strong>
                  <small>{domain.card_count} cards</small>
                </span>
              </label>
            ))}
          </div>
          <div className="aiPolicy">
            <Badge tone="blue">local evidence only</Badge>
            <p>本阶段只检索本地 SQLite 知识库索引，不调用外部模型，不做自由 NL2SQL。</p>
          </div>
          <div className="surfaceHead sessionHead">
            <h3>最近对话</h3>
            <Badge>{sessions.data.length}</Badge>
          </div>
          <div className="sessionList">
            {sessions.data.map((session) => (
              <article key={String(session.id)}>
                <strong>{cellValue(session.title)}</strong>
                <small>{cellValue(session.updated_at)}</small>
              </article>
            ))}
          </div>
        </aside>
        <div className="aiChatMain">
          <div className="promptBox">
            {sourceAsset ? (
              <div className="sourceContextBox">
                <div>
                  <p className="eyebrow">Source context</p>
                  <strong>{sourceAsset.title}</strong>
                  <small>{sourceAsset.type} / {sourceAsset.id}</small>
                </div>
                <button className="textButton" onClick={onClearSourceAsset}>清除上下文</button>
              </div>
            ) : null}
            <label>
              问题
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="输入供应链指标、规则、本体、数据质量或业务流程问题" />
            </label>
            <div className="promptActions">
              <button onClick={ask} disabled={running}>{running ? "检索证据中..." : "本地证据回答"}</button>
              <span>回答必须带证据；证据不足会拒答。</span>
            </div>
          </div>
          {error ? <div className="error">{error}</div> : null}
          {result ? (
            <div className="answerPanel">
              <div className="answerHead">
                <div>
                  <p className="eyebrow">Answerability</p>
                  <h3>{result.answerability}</h3>
                </div>
                <div className="answerBadges">
	                  <Badge tone={answerabilityTone(result.answerability)}>{result.answerability}</Badge>
	                  <Badge tone={answerabilityTone(result.answerability)}>{result.answerabilityScore}/100</Badge>
                  <Badge>{result.policy}</Badge>
	                  <Badge tone={result.providerCalls ? "bad" : "good"}>{result.providerCalls ? "provider call" : "no provider call"}</Badge>
	                  {result.chatbiContextId ? <Badge tone="blue">draft context</Badge> : null}
	                </div>
	              </div>
              <div className="exportActions aiEvidenceExportActions" aria-label="ai evidence export actions">
                <span>证据包导出</span>
                <a href={`/api/ai-chat/messages/${encodeURIComponent(result.messageId)}/evidence-export?format=json`} target="_blank" rel="noreferrer">JSON</a>
                <a href={`/api/ai-chat/messages/${encodeURIComponent(result.messageId)}/evidence-export?format=markdown`} target="_blank" rel="noreferrer">Markdown</a>
              </div>
              <div className="aiFeedbackActions">
                <div>
                  <strong>样本沉淀</strong>
                  <span>把当前问法写入语义治理样本库，等待人工审核。</span>
                </div>
                <button className="textButton" onClick={() => createQuestionSample("standard")}>标准问法</button>
                <button className="textButton" onClick={() => createQuestionSample("synonym")}>同义问法</button>
                <button className="textButton" onClick={() => createQuestionSample(result.answerability === "conflict" ? "conflict" : "reject")}>拒答/冲突样本</button>
                <label>
                  反馈说明
                  <input value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} placeholder="补充证据不足、证据错误或回答可用原因" />
                </label>
                <button className="textButton" onClick={() => createFeedback("useful")}>有用</button>
                <button className="textButton" onClick={() => createFeedback("insufficient")}>证据不足</button>
                <button className="textButton" onClick={() => createFeedback("wrong_evidence")}>证据错误</button>
              </div>
              <div className="scoreExplain">
                {[
                  ["证据覆盖", result.answerabilityDetails.evidenceCoverage],
                  ["强相关词覆盖", result.answerabilityDetails.strongTermCoverage],
                  ["主题域覆盖", result.answerabilityDetails.domainCoverage]
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <div className="scoreMeta">
                      <span>{label}</span>
                      <strong>{Math.round(Number(value) * 100)}%</strong>
                    </div>
                    <div className="scoreLine"><span style={{ width: `${Math.round(Number(value) * 100)}%` }} /></div>
                  </div>
                ))}
                <div className="scoreTags">
                  <Badge tone={result.answerabilityDetails.conflictSignal ? "warn" : "good"}>
                    conflict signals {result.answerabilityDetails.conflictCount}
                  </Badge>
                  <Badge>{result.answerabilityDetails.evidenceCount} evidence</Badge>
                  <Badge>{result.answerabilityDetails.sourceContextAttached ? "context attached" : "no source context"}</Badge>
                </div>
                {result.answerabilityDetails.matchedStrongTerms.length ? (
                  <div className="termRow">
                    {result.answerabilityDetails.matchedStrongTerms.slice(0, 8).map((term) => <span key={term}>{term}</span>)}
                  </div>
                ) : null}
              </div>
	              <pre className="answerText">{result.answer}</pre>
              <div className="evidencePanel">
                <div className="surfaceHead">
                  <h3>证据链</h3>
                  <Badge>{result.evidence.length} chunks</Badge>
                </div>
                {result.evidence.length ? (
                  <div className="evidenceList">
                    {result.evidence.map((item) => (
                      <article key={item.chunkId}>
                        <div className="ledgerItemHead">
                          <strong>{item.title}</strong>
                          <Badge tone="blue">{item.domainName}</Badge>
                        </div>
                        <p>{item.text}</p>
                        <small>{item.sourcePath} / score {item.score}</small>
                        <button className="textButton" onClick={() => openEvidence(item)}>打开证据卡</button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty compact">无可用证据，回答已拒答。</div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty">输入问题后，将基于本地知识库索引返回证据、回答分级和拒答原因。</div>
          )}
        </div>
      </div>
      </div>
      <div className={sectionPaneClass(activeAiSection, "trace")}>
      <AgentTraceTimelinePanel refresh={refresh} onOpenAsset={onOpenAsset} />
      </div>
      <div className={sectionPaneClass(activeAiSection, "exports")}>
      <div className="surface aiEvidenceExportRegistry">
        <div className="surfaceHead">
          <div>
            <p className="eyebrow">Evidence exports</p>
            <h3>AI 证据导出台账</h3>
          </div>
          <Badge>{evidenceExports.data.length} packages</Badge>
        </div>
        <p className="registryPolicy">台账只记录本地知识库证据包导出入口；不调用外部模型，不写回积加/ERP。</p>
        <div className="evidenceExportRegistryGrid">
          {evidenceExports.data.length ? evidenceExports.data.slice(0, 9).map((item) => (
            <article key={item.message_id}>
              <div className="ledgerItemHead">
                <strong>{cellValue(item.session_title || item.session_id)}</strong>
                <Badge tone={answerabilityTone(String(item.answerability))}>{cellValue(item.answerability)}</Badge>
              </div>
              <p>{cellValue(item.preview)}</p>
              <small>
                score {cellValue(item.answerability_score)} / evidence {cellValue(item.evidence_count)} / {cellValue(item.created_at)}
              </small>
              <div className="exportActions compactExports">
                <a href={item.json_url} target="_blank" rel="noreferrer">JSON</a>
                <a href={item.markdown_url} target="_blank" rel="noreferrer">Markdown</a>
              </div>
            </article>
          )) : <div className="empty compact">暂无证据导出记录。先运行一次本地证据回答。</div>}
        </div>
      </div>
      </div>
      <div className={sectionPaneClass(activeAiSection, "samples")}>
      <div className="aiGovernanceWorkbench">
        <div className="surface questionSampleLibrary">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Question samples</p>
              <h3>问法样本库</h3>
            </div>
            <Badge>{questionSamples.data.length} visible</Badge>
          </div>
          <div className="sampleList">
            {questionSamples.data.length ? questionSamples.data.slice(0, 8).map((sample) => (
              <article key={String(sample.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(sample.question_text)}</strong>
                  <Badge tone={toneFromStatus(String(sample.status))}>{cellValue(sample.status)}</Badge>
                </div>
                <p>{cellValue(sample.sample_type)} / {cellValue(sample.expected_answerability)} / quality {cellValue(sample.quality_score)}</p>
                <small>{cellValue(sample.target_asset_type)} {cellValue(sample.target_asset_id)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("ai_question_sample", sample, ["question_text"], ["sample_type", "status"], true))}>详情</button>
                  <button className="textButton" onClick={() => reviewQuestionSample(sample, "reviewed")}>标记已审</button>
                  <button className="textButton" onClick={() => reviewQuestionSample(sample, "certified")}>认证样本</button>
                  <button className="textButton" onClick={() => reviewQuestionSample(sample, "rejected")}>拒绝</button>
                </div>
              </article>
            )) : <div className="empty compact">暂无问法样本。先运行一次本地证据回答，再沉淀样本。</div>}
          </div>
        </div>
        <div className="surface aiFeedbackQueue">
          <div className="surfaceHead">
            <div>
              <p className="eyebrow">Feedback loop</p>
              <h3>AI 回答反馈队列</h3>
            </div>
            <Badge tone={governance.data.feedback.open ? "warn" : "good"}>{governance.data.feedback.open} open</Badge>
          </div>
          <div className="sampleList">
            {feedbackItems.data.length ? feedbackItems.data.slice(0, 8).map((feedback) => (
              <article key={String(feedback.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(feedback.question_text)}</strong>
                  <Badge tone={toneFromStatus(String(feedback.status))}>{cellValue(feedback.rating)}</Badge>
                </div>
                <p>{cellValue(feedback.feedback_text) || "无补充说明"}</p>
                <small>{cellValue(feedback.answerability)} / score {cellValue(feedback.answerability_score)} / evidence {cellValue(feedback.evidence_count)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("ai_answer_feedback", feedback, ["question_text"], ["rating", "status"], true))}>详情</button>
                  <button className="textButton" onClick={() => reviewFeedback(feedback, "resolved")}>转治理动作</button>
                  <button className="textButton" onClick={() => reviewFeedback(feedback, "closed")}>关闭</button>
                  <button className="textButton" onClick={() => reviewFeedback(feedback, "rejected")}>拒绝</button>
                </div>
              </article>
            )) : <div className="empty compact">暂无反馈。回答后可以标记有用、证据不足或证据错误。</div>}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

function RecommendationQueuePanel({ onOpenAsset }: { onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ status: "", q: "" });
  const [note, setNote] = useState("");
  const recommendationPath = useMemo(() => {
    const params = new URLSearchParams({ limit: "60", refresh: String(refresh) });
    if (filters.status) params.set("status", filters.status);
    if (filters.q) params.set("q", filters.q);
    return `/api/aip/recommendations?${params.toString()}`;
  }, [filters, refresh]);
  const recommendations = useApi<AipRecommendation[]>(recommendationPath, []);

  async function moveRecommendation(recommendation: AipRecommendation, status: string) {
    const route = ["approved", "rejected"].includes(status) && recommendation.approval_status === "submitted"
      ? `/api/aip/recommendations/${encodeURIComponent(recommendation.id)}/review`
      : `/api/aip/recommendations/${encodeURIComponent(recommendation.id)}/transition`;
    const result = await api<{ ok: boolean; recommendation: AipRecommendation }>(route, {
      method: "POST",
      body: JSON.stringify({
        status,
        reviewer: "local_user",
        actor: "local_user",
        reviewNote: `UI review: ${recommendation.id} -> ${status}; no provider call and no ERP writeback.`,
        note: `UI transition: ${recommendation.id} -> ${status}.`,
        evidenceRefs: [{ type: "ui_action", ref: recommendation.id, status }]
      })
    });
    setNote(`建议卡 ${result.recommendation.id} 已更新为 ${result.recommendation.approval_status}`);
    setRefresh((value) => value + 1);
  }

  return (
    <div className="recommendationQueue">
      <div className="surfaceHead">
        <div>
          <p className="eyebrow">AIP recommendation cards</p>
          <h3>建议卡审核与行动分层</h3>
          <p className="muted">建议卡是 Action 前置层：先证据复核和 owner 审批，再转执行，不做自动写回。</p>
        </div>
        <div className="recommendationHeaderActions">
          <Badge>{recommendations.data.length} visible</Badge>
          <div className="exportActions recommendationExportActions" aria-label="recommendation card export actions">
            <a href="/api/export/aip-recommendations?format=json" className="textButton" target="_blank" rel="noreferrer">导出 JSON</a>
            <a href="/api/export/aip-recommendations?format=excel" className="textButton" target="_blank" rel="noreferrer">导出 Excel</a>
          </div>
        </div>
      </div>
      {note ? <div className="kbNotice compact">{note}</div> : null}
      {recommendations.error ? <div className="error compact">{recommendations.error}</div> : null}
      <div className="recommendationToolbar">
        <label>
          状态
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">全部</option>
            <option value="submitted">submitted</option>
            <option value="approved">approved</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
            <option value="replayed">replayed</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <label>
          搜索
          <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="建议 / 场景 / 影响" />
        </label>
        <button className="textButton" onClick={() => setRefresh((value) => value + 1)}>刷新</button>
      </div>
      <div className="recommendationCards">
        {recommendations.data.length ? recommendations.data.map((recommendation) => (
          <article className="recommendationCard" key={recommendation.id}>
            <div className="ledgerItemHead">
              <div>
                <strong>{recommendation.recommendation_title}</strong>
                <small>{recommendation.scenario_type} / {recommendation.target_object_id || "--"}</small>
              </div>
              <div className="badgeCluster">
                <Badge tone={toneFromStatus(recommendation.approval_status)}>{recommendation.approval_status}</Badge>
                <span className={`actionTierBadge ${recommendation.action_tier.toLowerCase()}`}>{recommendation.action_tier}</span>
              </div>
            </div>
            <p>{recommendation.recommendation_detail}</p>
            <div className="recommendationMetaGrid">
              <span>Impact <strong>{recommendation.impact_summary || "--"}</strong></span>
              <span>Owner <strong>{recommendation.owner}</strong></span>
              <span>Workflow <strong>{recommendation.workflow_id || "--"}</strong></span>
            </div>
            {recommendation.action_options.length ? (
              <div className="termRow">
                {recommendation.action_options.slice(0, 5).map((option, index) => <span key={`${recommendation.id}-${index}`}>{cellValue(option)}</span>)}
              </div>
            ) : null}
            <div className="recommendationReviewControl">
              <button className="textButton" onClick={() => onOpenAsset(aipRecommendationAsset(recommendation))}>详情</button>
              {recommendationNextStates(recommendation.approval_status).map((state) => (
                <button className="textButton" key={state} onClick={() => moveRecommendation(recommendation, state)}>{state}</button>
              ))}
              {!recommendationNextStates(recommendation.approval_status).length ? <span className="muted">terminal</span> : null}
            </div>
          </article>
        )) : <div className="empty compact">暂无建议卡。可从 AI 执行轨迹生成，或由 API/流程写入 ledger。</div>}
      </div>
    </div>
  );
}

const emptyPlatformReadiness: PlatformReadinessPayload = {
  summary: {
    rbacPolicies: 0,
    loginEnabled: false,
    loginRequiredPolicies: 0,
    approvalRequiredPolicies: 0,
    postgresTriggers: 0,
    readyTriggers: 0,
    watchTriggers: 0,
    postgresFindings: 0,
    highRiskFindings: 0,
    writebackAssessments: 0,
    enabledWritebacks: 0,
    disabledWritebacks: 0,
    reviewRequiredWritebacks: 0
  },
  rbacPolicies: [],
  postgresTriggers: [],
  postgresFindings: [],
  writebackAssessments: [],
  boundary: {
    loginEnabled: false,
    postgresMigrationActive: false,
    providerCalls: false,
    erpWriteback: false,
    importAllowed: false,
    writebackPolicy: "assessment_only_all_external_writeback_disabled_or_review_required"
  }
};

const emptyRoleDetail: RoleWorkbenchDetail = {
  role: {
    id: "",
    role_code: "",
    role_name: "角色工作台",
    role_type: "",
    mission: "",
    primary_object_types: [],
    metric_refs: [],
    decision_cadence: "",
    owner: "",
    lifecycle_status: "draft",
    created_at: "",
    updated_at: "",
    counts: {
      objects: 0,
      criticalObjects: 0,
      openEvents: 0,
      recommendations: 0,
      playbooks: 0,
      evalCases: 0
    }
  },
  domainProfile: {
    domain: "",
    persona: "",
    operatingQuestion: "",
    inputAssets: [],
    outputArtifacts: [],
    evidenceChecklist: [],
    defaultScenarioTypes: [],
    roleGoal: "",
    roleId: "",
    roleCode: "",
    owner: "",
    cadence: "",
    metricRefs: [],
    objectTypes: []
  },
  workstreams: [],
  filterOptions: {
    objectTypes: [],
    riskLevels: [],
    eventStatuses: [],
    scenarioTypes: []
  },
  activeFilters: {},
  objects: [],
  events: [],
  recommendations: [],
  playbooks: [],
  metrics: [],
  evalCases: [],
  providerPolicies: [],
  providerDecisionRecords: [],
  promptVersions: [],
  providerCallAudits: [],
  providerGatewaySummary: {
    providerPolicies: 0,
    disabledProviders: 0,
    decisionRecords: 0,
    promptVersions: 0,
    draftDisabledPrompts: 0,
    callAudits: 0,
    blockedCalls: 0,
    preferredProvider: "",
    providerCandidates: [],
    boundary: {
      providerCalls: false,
      erpWriteback: false,
      allowedCallStatuses: ["blocked_disabled", "blocked_manual_gate_required"],
      policy: "dry_run_audit_only_until_provider_enabled_with_owner_approval_eval_and_budget"
    }
  },
  platformReadiness: emptyPlatformReadiness,
  actionBoundary: {}
};

const emptyRoleSummary: RoleGovernanceSummary = {
  roles: 0,
  activeRoles: 0,
  rolePlaybooks: 0,
  evalCases: 0,
  providerPolicies: 0,
  disabledProviders: 0,
  providerDecisionRecords: 0,
  promptVersions: 0,
  providerCallAudits: 0,
  platformReadiness: emptyPlatformReadiness.summary,
  roleQueues: [],
  boundary: {
    providerCalls: false,
    erpWriteback: false,
    policy: "provider_disabled_until_certified_context_eval_and_owner_approval"
  }
};

function roleWorkbenchAsset(role: RoleWorkbench): AssetRef {
  return {
    type: "role_workbench",
    id: role.id,
    title: role.role_name,
    subtitle: `${role.owner} / ${role.decision_cadence}`,
    fields: {
      id: role.id,
      role_code: role.role_code,
      role_name: role.role_name,
      role_type: role.role_type,
      mission: role.mission,
      primary_object_types: safeFieldValue(role.primary_object_types),
      metric_refs: safeFieldValue(role.metric_refs),
      decision_cadence: role.decision_cadence,
      owner: role.owner,
      lifecycle_status: role.lifecycle_status
    },
    readOnly: true
  };
}

const roleDetailSections = [
  { id: "command", label: "角色总览", helper: "使命、筛选、对象/事件/推荐队列" },
  { id: "actions", label: "行动草稿", helper: "单项行动、批量行动、Owner 审核入口" },
  { id: "provider", label: "Provider 治理", helper: "模型策略、Prompt、Blocked audit" },
  { id: "platform", label: "平台就绪度", helper: "RBAC、Postgres、Write-back 评估" },
  { id: "evidence", label: "证据与指标", helper: "Playbook、Eval、角色指标映射" }
] as const;

type RoleDetailSectionId = typeof roleDetailSections[number]["id"];

function RoleWorkbenchPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [selectedRoleId, setSelectedRoleId] = useState("role_inventory");
  const [activeRoleSection, setActiveRoleSection] = useState<RoleDetailSectionId>("command");
  const [selectedRoleTargetIds, setSelectedRoleTargetIds] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [actionNote, setActionNote] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [providerAuditNote, setProviderAuditNote] = useState("");
  const [providerDryRun, setProviderDryRun] = useState(false);
  const [roleFilters, setRoleFilters] = useState({
    objectType: "",
    riskLevel: "",
    eventStatus: "",
    scenarioType: "",
    q: ""
  });
  const roleFilterQuery = new URLSearchParams({ refresh: String(refresh) });
  Object.entries(roleFilters).forEach(([key, value]) => {
    if (value) roleFilterQuery.set(key, value);
  });
  const summary = useApi<RoleGovernanceSummary>(`/api/roles/summary?refresh=${refresh}`, emptyRoleSummary);
  const roles = useApi<RoleWorkbench[]>(`/api/roles/workbenches?refresh=${refresh}`, []);
  const detail = useApi<RoleWorkbenchDetail>(`/api/roles/workbenches/${encodeURIComponent(selectedRoleId)}?${roleFilterQuery.toString()}`, emptyRoleDetail);
  const activeRole = detail.data.role;
  const platformReadiness = detail.data.platformReadiness || emptyPlatformReadiness;
  const roleDomain = detail.data.domainProfile;
  const firstObject = detail.data.objects[0];
  const firstEvent = detail.data.events[0];
  const openEvents = detail.data.events.filter((event) => event.status !== "closed");
  const criticalEvents = openEvents.filter((event) => ["critical", "high"].includes(event.severity));
  const activeRecommendations = detail.data.recommendations.filter((recommendation) => !["done", "replayed", "rejected"].includes(recommendation.approval_status));
  const roleSlaStatus = criticalEvents.length ? "critical" : activeRecommendations.length ? "due_soon" : openEvents.length ? "watch" : "on_track";
  const roleSlaNote = criticalEvents.length
    ? `${criticalEvents.length} high/critical events need same-day owner review`
    : activeRecommendations.length
      ? `${activeRecommendations.length} recommendation cards are waiting for approval or execution`
      : openEvents.length
        ? `${openEvents.length} open events should stay in the role queue`
        : "No open event pressure in the current role queue";
  const shiftCadence = activeRole.decision_cadence || "daily review";
  const shiftLabel = /daily|day|日/.test(shiftCadence)
    ? "Daily control tower"
    : /weekly|week|周/.test(shiftCadence)
      ? "Weekly owner review"
      : /monthly|month|月/.test(shiftCadence)
        ? "Monthly governance review"
        : "Event-driven review";
  const roleBatchTargets = [
    ...detail.data.objects.slice(0, 5).map((object) => ({
      id: object.id,
      type: "object",
      title: object.display_name,
      subtitle: `${object.object_type} / ${object.risk_level}`,
      tone: object.risk_level
    })),
    ...detail.data.events.slice(0, 5).map((event) => ({
      id: event.id,
      type: "event",
      title: event.event_title,
      subtitle: `${event.event_type} / ${event.severity}`,
      tone: event.severity
    })),
    ...detail.data.recommendations.slice(0, 5).map((recommendation) => ({
      id: recommendation.id,
      type: "recommendation",
      title: recommendation.recommendation_title,
      subtitle: `${recommendation.scenario_type} / ${recommendation.approval_status}`,
      tone: recommendation.approval_status
    }))
  ];
  const selectedBatchTargets = roleBatchTargets.filter((target) => selectedRoleTargetIds.includes(target.id));
  const roleBatchPager = usePagination(roleBatchTargets, 4);

  useEffect(() => {
    if (!roles.data.length) return;
    if (!roles.data.some((role) => role.id === selectedRoleId || role.role_code === selectedRoleId)) {
      setSelectedRoleId(roles.data[0].id);
    }
  }, [roles.data, selectedRoleId]);

  useEffect(() => {
    setSelectedRoleTargetIds([]);
    roleBatchPager.setPage(1);
  }, [activeRole.id]);

  function toggleRoleTarget(id: string) {
    setSelectedRoleTargetIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function updateRoleFilter(key: keyof typeof roleFilters, value: string) {
    setRoleFilters((current) => ({ ...current, [key]: value }));
    setSelectedRoleTargetIds([]);
  }

  function clearRoleFilters() {
    setRoleFilters({ objectType: "", riskLevel: "", eventStatus: "", scenarioType: "", q: "" });
    setSelectedRoleTargetIds([]);
  }

  async function createActionDraft(mode: "single" | "bulk" = "single") {
    if (!activeRole.id) return;
    setActiveRoleSection("actions");
    setDrafting(true);
    setActionNote("");
    try {
      const bulkTargets = selectedBatchTargets.length ? selectedBatchTargets : roleBatchTargets.slice(0, 6);
      const targetAssetIds = mode === "bulk"
        ? bulkTargets.map((target) => target.id)
        : [firstObject?.id, firstEvent?.id].filter(Boolean);
      const evidenceRefs = mode === "bulk"
        ? bulkTargets.filter((target) => target.type === "event").map((target) => `object_event:${target.id}`)
        : firstEvent ? [`object_event:${firstEvent.id}`] : [];
      const payload = await api<{ ok: boolean; operation: WorkbenchOperation }>(`/api/roles/workbenches/${encodeURIComponent(activeRole.id)}/action-draft`, {
        method: "POST",
        body: JSON.stringify({
          operationTitle: mode === "bulk" ? `${activeRole.role_name} 批量行动草稿` : `${activeRole.role_name} L1 行动草稿`,
          operationSummary: mode === "bulk"
            ? `${activeRole.role_name} 汇总 ${targetAssetIds.length} 个对象/事件/建议卡，形成本地批量治理行动草稿；进入 Owner 审核，不调用 provider，不写回 ERP/Jijia。`
            : `${activeRole.role_name} 基于对象队列、事件和 playbook 生成本地行动草稿；进入 Owner 审核，不调用 provider，不写回 ERP/Jijia。`,
          targetAssetIds,
          evidenceRefs,
          playbookId: detail.data.playbooks[0]?.id,
          batchMode: mode,
          slaStatus: roleSlaStatus,
          shiftCadence,
          owner: activeRole.owner,
          priority: firstEvent?.severity === "critical" ? "P0" : "P1",
          createdBy: "local_user"
        })
      });
      setActionNote(`已创建 ${payload.operation.id}，workflow ${payload.operation.workflow_id}。`);
      setRefresh((value) => value + 1);
    } catch (err) {
      setActionNote(`创建失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDrafting(false);
    }
  }

  async function recordProviderBlockedDryRun() {
    const prompt = detail.data.promptVersions[0];
    const evaluation = detail.data.evalCases[0];
    setActiveRoleSection("provider");
    setProviderDryRun(true);
    setProviderAuditNote("");
    try {
      const payload = await api<{ ok: boolean; callAudit: ProviderCallAudit }>("/api/provider-gateway/blocked-dry-run", {
        method: "POST",
        body: JSON.stringify({
          providerCode: prompt?.provider_code || "deepseek",
          promptVersionId: prompt?.id || "",
          evalCaseId: evaluation?.id || "",
          traceId: "trace_seed_negative_available",
          requestPurpose: `${activeRole.role_name || "角色"} provider readiness dry-run`,
          evidenceRefs: prompt?.allowed_evidence_refs || evaluation?.required_evidence_refs || [],
          actor: "local_user"
        })
      });
      setProviderAuditNote(`已记录 ${payload.callAudit.call_status} audit ${payload.callAudit.id}，未调用 provider。`);
      setRefresh((value) => value + 1);
    } catch (err) {
      setProviderAuditNote(`记录失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProviderDryRun(false);
    }
  }

  return (
    <div className="panelStack">
      <ModuleHeader module={module} />
      <section className="roleWorkbench">
        <div className="roleSummaryGrid">
          <article>
            <span>角色</span>
            <strong>{summary.data.roles}</strong>
            <small>{summary.data.activeRoles} active roles</small>
          </article>
          <article>
            <span>Playbook</span>
            <strong>{summary.data.rolePlaybooks}</strong>
            <small>角色触发器与动作模板</small>
          </article>
          <article>
            <span>Eval cases</span>
            <strong>{summary.data.evalCases}</strong>
            <small>问答可答性校验集</small>
          </article>
          <article>
            <span>Provider</span>
            <strong>{summary.data.disabledProviders}/{summary.data.providerPolicies}</strong>
            <small>{summary.data.boundary.providerCalls ? "provider on" : "provider off"}</small>
          </article>
          <article>
            <span>Prompt</span>
            <strong>{summary.data.promptVersions}</strong>
            <small>{summary.data.providerCallAudits} call audits</small>
          </article>
        </div>
        {(summary.error || roles.error || detail.error) ? <div className="error">{summary.error || roles.error || detail.error}</div> : null}
        <div className="roleWorkbenchLayout">
          <aside className="roleRail">
            <div className="sectionLabel">
              <span>Roles</span>
              <strong>角色队列</strong>
            </div>
            {roles.data.map((role) => (
              <button
                key={role.id}
                className={activeRole.id === role.id ? "active" : ""}
                onClick={() => setSelectedRoleId(role.id)}
              >
                <span>{role.role_code}</span>
                <strong>{role.role_name}</strong>
                <small>{role.counts?.objects || 0} objects / {role.counts?.openEvents || 0} events</small>
              </button>
            ))}
          </aside>
          <div className={`roleWorkbenchMain roleSection-${activeRoleSection}`}>
            <div className="roleMissionPanel">
              <div>
                <p className="eyebrow">Role mission</p>
                <h3>{activeRole.role_name}</h3>
                <p>{activeRole.mission || "暂无角色使命。"}</p>
              </div>
              <div className="roleMissionMeta">
                <Badge tone={toneFromStatus(activeRole.lifecycle_status)}>{activeRole.lifecycle_status || "draft"}</Badge>
                <Badge tone="blue">{activeRole.owner || "--"}</Badge>
                <Badge>{activeRole.decision_cadence || "--"}</Badge>
                <button className="textButton" onClick={() => activeRole.id && onOpenAsset(roleWorkbenchAsset(activeRole))}>查看角色资产</button>
              </div>
            </div>
            <div className="roleObjectChips">
              {activeRole.primary_object_types.map((item) => <span key={item}>{item}</span>)}
              {activeRole.metric_refs.map((item) => <span key={item} className="metricChip">{item}</span>)}
            </div>
            <div className="roleSectionNav" role="tablist" aria-label="角色工作台二级分区">
              {roleDetailSections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  aria-selected={activeRoleSection === section.id}
                  className={activeRoleSection === section.id ? "active" : ""}
                  onClick={() => setActiveRoleSection(section.id)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{section.label}</strong>
                  <small>{section.helper}</small>
                </button>
              ))}
            </div>
            <div className="roleDomainPanel">
              <div className="surfaceHead">
                <div>
                  <p className="eyebrow">Role domain</p>
                  <h3>{roleDomain.persona || activeRole.role_name} 操作模型</h3>
                  <p className="muted">{roleDomain.operatingQuestion || "当前角色的问题域、输入证据和输出动作。"}</p>
                </div>
                <div className="exportGroup">
                  <a href={`/api/roles/workbenches/${encodeURIComponent(activeRole.id || selectedRoleId)}/export?format=json`} className="textButton" target="_blank" rel="noreferrer">导出 JSON</a>
                  <a href={`/api/roles/workbenches/${encodeURIComponent(activeRole.id || selectedRoleId)}/export?format=excel`} className="textButton" target="_blank" rel="noreferrer">导出 Excel</a>
                </div>
              </div>
              <div className="roleDomainGrid">
                <article>
                  <span>输入对象</span>
                  <strong>{roleDomain.inputAssets.slice(0, 4).join(" / ") || "--"}</strong>
                  <small>{roleDomain.roleGoal || activeRole.mission}</small>
                </article>
                <article>
                  <span>输出产物</span>
                  <strong>{roleDomain.outputArtifacts.slice(0, 3).join(" / ") || "--"}</strong>
                  <small>只生成建议、审核和复盘证据，不自动写回。</small>
                </article>
                <article>
                  <span>证据要求</span>
                  <strong>{roleDomain.evidenceChecklist.slice(0, 4).join(" / ") || "--"}</strong>
                  <small>用于 ChatBI/Agent 的可回答性和行动依据。</small>
                </article>
              </div>
              <div className="roleWorkstreamGrid">
                {detail.data.workstreams.map((stream, index) => (
                  <article key={stream.key}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{stream.name}</strong>
                    <p>{stream.description}</p>
                    <small>{stream.expectedOutput}</small>
                  </article>
                ))}
              </div>
            </div>
            <div className="roleFilterPanel">
              <label>
                对象类型
                <select value={roleFilters.objectType} onChange={(event) => updateRoleFilter("objectType", event.target.value)}>
                  <option value="">全部</option>
                  {detail.data.filterOptions.objectTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                风险等级
                <select value={roleFilters.riskLevel} onChange={(event) => updateRoleFilter("riskLevel", event.target.value)}>
                  <option value="">全部</option>
                  {detail.data.filterOptions.riskLevels.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                事件状态
                <select value={roleFilters.eventStatus} onChange={(event) => updateRoleFilter("eventStatus", event.target.value)}>
                  <option value="">全部</option>
                  {detail.data.filterOptions.eventStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                场景
                <select value={roleFilters.scenarioType} onChange={(event) => updateRoleFilter("scenarioType", event.target.value)}>
                  <option value="">全部</option>
                  {detail.data.filterOptions.scenarioTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                搜索
                <input value={roleFilters.q} onChange={(event) => updateRoleFilter("q", event.target.value)} placeholder="对象、事件、owner" />
              </label>
              <button className="textButton" type="button" onClick={clearRoleFilters}>清空筛选</button>
            </div>
            <div className="roleSlaShiftGrid">
              <section className="roleSlaPanel">
                <div className="sectionLabel">
                  <span>SLA</span>
                  <strong>角色 SLA 摘要</strong>
                </div>
                <div className="roleSlaScore">
                  <Badge tone={toneFromStatus(roleSlaStatus)}>{roleSlaStatus}</Badge>
                  <strong>{criticalEvents.length + activeRecommendations.length}</strong>
                  <small>{roleSlaNote}</small>
                </div>
              </section>
              <section className="roleShiftPanel">
                <div className="sectionLabel">
                  <span>Shift</span>
                  <strong>班次/节奏</strong>
                </div>
                <div className="roleShiftMeta">
                  <strong>{shiftLabel}</strong>
                  <span>{shiftCadence}</span>
                  <small>本阶段只形成角色工作流节奏提示，不启用排班系统。</small>
                </div>
              </section>
            </div>
            <div className="roleQueueGrid">
              <article>
                <div className="surfaceHead">
                  <h3>对象队列</h3>
                  <Badge tone="blue">{detail.data.objects.length} objects</Badge>
                </div>
                <div className="roleQueueList">
                  {detail.data.objects.slice(0, 8).map((object) => (
                    <button key={object.id} onClick={() => onOpenAsset(aipObjectAsset(object))}>
                      <span>
                        <strong>{object.display_name}</strong>
                        <small>{object.object_type} / {object.object_key}</small>
                      </span>
                      <Badge tone={toneFromStatus(object.risk_level)}>{object.risk_level}</Badge>
                    </button>
                  ))}
                  {!detail.data.objects.length ? <div className="empty compact">暂无对象队列。</div> : null}
                </div>
              </article>
              <article>
                <div className="surfaceHead">
                  <h3>事件队列</h3>
                  <Badge tone="warn">{detail.data.events.length} events</Badge>
                </div>
                <div className="roleQueueList">
                  {detail.data.events.slice(0, 8).map((event) => (
                    <button key={event.id} onClick={() => onOpenAsset(aipEventAsset(event))}>
                      <span>
                        <strong>{event.event_title}</strong>
                        <small>{event.display_name || event.object_id}</small>
                      </span>
                      <Badge tone={toneFromStatus(event.severity)}>{event.severity}</Badge>
                    </button>
                  ))}
                  {!detail.data.events.length ? <div className="empty compact">暂无事件队列。</div> : null}
                </div>
              </article>
              <article>
                <div className="surfaceHead">
                  <h3>推荐动作</h3>
                  <Badge tone="blue">{detail.data.recommendations.length} cards</Badge>
                </div>
                <div className="roleQueueList">
                  {detail.data.recommendations.slice(0, 8).map((recommendation) => (
                    <button key={recommendation.id} onClick={() => onOpenAsset(aipRecommendationAsset(recommendation))}>
                      <span>
                        <strong>{recommendation.recommendation_title}</strong>
                        <small>{recommendation.owner} / {recommendation.scenario_type}</small>
                      </span>
                      <Badge tone={toneFromStatus(recommendation.approval_status)}>{recommendation.approval_status}</Badge>
                    </button>
                  ))}
                  {!detail.data.recommendations.length ? <div className="empty compact">暂无推荐动作。</div> : null}
                </div>
              </article>
            </div>
            <div className="roleActionPanel">
              <div>
                <p className="eyebrow">Ledger action</p>
                <h3>本地行动草稿</h3>
                <p>将当前角色的首个对象、事件和 playbook 组合为 L1 行动草稿，进入工作台操作审核流。</p>
              </div>
              <button className="roleActionDraftButton" disabled={drafting || !activeRole.id} onClick={() => createActionDraft("single")}>
                {drafting ? "创建中..." : "创建行动草稿"}
              </button>
            </div>
            <div className="roleBatchActionPanel">
              <div className="surfaceHead">
                <div>
                  <p className="eyebrow">Batch action</p>
                  <h3>批量治理动作</h3>
                  <p className="muted">选择对象、事件或建议卡，生成一个批量行动草稿并进入 Owner 审核；不触发业务系统写回。</p>
                </div>
                <Badge tone="blue">{selectedBatchTargets.length || roleBatchPager.pageItems.length} selected</Badge>
              </div>
              <div className="roleBatchSelector">
                {roleBatchPager.pageItems.map((target, index) => (
                  <label key={target.id} className={selectedRoleTargetIds.includes(target.id) ? "selected" : ""}>
                    <input type="checkbox" checked={selectedRoleTargetIds.includes(target.id)} onChange={() => toggleRoleTarget(target.id)} />
                    <span>
                      <strong><span className="inlineIndex">#{roleBatchPager.startIndex + index + 1}</span>{target.title}</strong>
                      <small>{target.type} / {target.subtitle}</small>
                    </span>
                    <Badge tone={toneFromStatus(target.tone)}>{target.tone}</Badge>
                  </label>
                ))}
                {!roleBatchTargets.length ? <div className="empty compact">当前角色暂无可批量处理的对象。</div> : null}
              </div>
              <PaginationBar pager={roleBatchPager} label="批量动作对象池" />
              <div className="roleBatchActions">
                <button className="textButton" onClick={() => setSelectedRoleTargetIds(roleBatchTargets.map((target) => target.id))}>全选</button>
                <button className="textButton" onClick={() => setSelectedRoleTargetIds([])}>清空</button>
                <button className="roleBatchActionButton" disabled={drafting || !activeRole.id || !roleBatchTargets.length} onClick={() => createActionDraft("bulk")}>
                  {drafting ? "创建中..." : "创建批量行动草稿"}
                </button>
              </div>
            </div>
            {actionNote ? <div className="kbNotice">{actionNote}</div> : null}
            <div className="roleSupportingGrid">
              <section className="rolePlaybookPanel">
                <div className="surfaceHead">
                  <h3>角色 Playbook</h3>
                  <Badge tone="blue">{detail.data.playbooks.length}</Badge>
                </div>
                <div className="playbookList">
                  {detail.data.playbooks.map((playbook) => (
                    <article key={playbook.id}>
                      <div className="ledgerItemHead">
                        <strong>{playbook.playbook_name}</strong>
                        <Badge tone={toneFromStatus(playbook.priority)}>{playbook.priority}</Badge>
                      </div>
                      <p>{playbook.trigger_condition}</p>
                      <small>{cellValue(playbook.action_template)}</small>
                    </article>
                  ))}
                </div>
              </section>
              <section className="providerPolicyPanel">
                <div className="surfaceHead">
                  <div>
                    <h3>Provider Gateway</h3>
                    <p className="muted">决策记录、prompt 版本和 call audit 只进入治理账本；当前不调用外部模型。</p>
                  </div>
                  <div className="badgeCluster">
                    <Badge tone="good">default off</Badge>
                    <Badge tone="blue">{detail.data.providerGatewaySummary.blockedCalls} blocked</Badge>
                  </div>
                </div>
                <div className="providerReadinessStats">
                  <div><span>决策记录</span><strong>{detail.data.providerGatewaySummary.decisionRecords}</strong></div>
                  <div><span>Prompt 版本</span><strong>{detail.data.providerGatewaySummary.promptVersions}</strong></div>
                  <div><span>Call audit</span><strong>{detail.data.providerGatewaySummary.callAudits}</strong></div>
                  <div><span>首选候选</span><strong>{detail.data.providerGatewaySummary.preferredProvider || "--"}</strong></div>
                </div>
                <div className="providerPolicyList providerReadinessList">
                  {detail.data.providerPolicies.map((policy) => (
                    <article key={policy.id}>
                      <div className="ledgerItemHead">
                        <strong>{policy.provider_name}</strong>
                        <Badge tone={toneFromStatus(policy.status)}>{policy.status}</Badge>
                      </div>
                      <p>{policy.data_boundary}</p>
                      <small>{policy.prompt_version_policy}</small>
                    </article>
                  ))}
                </div>
                <div className="providerGovernanceGrid">
                  <div>
                    <div className="sectionLabel">
                      <span>Decision</span>
                      <strong>Provider 决策记录</strong>
                    </div>
                    <div className="providerDecisionList">
                      {detail.data.providerDecisionRecords.map((decision) => (
                        <article key={decision.id}>
                          <div className="ledgerItemHead">
                            <strong>{decision.decision_title}</strong>
                            <Badge tone={toneFromStatus(decision.decision_status)}>{decision.provider_code} / rank {decision.preferred_rank}</Badge>
                          </div>
                          <p>{decision.decision_summary}</p>
                          <small>{decision.fallback_policy}</small>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="sectionLabel">
                      <span>Prompt</span>
                      <strong>Prompt 版本</strong>
                    </div>
                    <div className="promptVersionList">
                      {detail.data.promptVersions.map((prompt) => (
                        <article key={prompt.id}>
                          <div className="ledgerItemHead">
                            <strong>{prompt.prompt_title}</strong>
                            <Badge tone={toneFromStatus(prompt.status)}>{prompt.status}</Badge>
                          </div>
                          <p>{prompt.prompt_body}</p>
                          <small>{prompt.provider_code} / {prompt.prompt_code} / v{prompt.version_no}</small>
                        </article>
                      ))}
                      {!detail.data.promptVersions.length ? <div className="empty compact">当前角色暂无 prompt 版本。</div> : null}
                    </div>
                  </div>
                  <div>
                    <div className="sectionLabel">
                      <span>Audit</span>
                      <strong>Blocked call audit</strong>
                    </div>
                    <div className="providerCallAuditList">
                      {detail.data.providerCallAudits.slice(0, 5).map((audit) => (
                        <article key={audit.id}>
                          <div className="ledgerItemHead">
                            <strong>{audit.provider_code}</strong>
                            <Badge tone={toneFromStatus(audit.call_status)}>{audit.call_status}</Badge>
                          </div>
                          <p>{audit.request_purpose}</p>
                          <small>{audit.error_summary}</small>
                        </article>
                      ))}
                    </div>
                    <button className="textButton providerDryRunButton" disabled={providerDryRun} onClick={recordProviderBlockedDryRun}>
                      {providerDryRun ? "记录中..." : "记录 blocked dry-run"}
                    </button>
                    {providerAuditNote ? <div className="kbNotice compact">{providerAuditNote}</div> : null}
                  </div>
                </div>
              </section>
              <section className="platformReadinessPanel">
                <div className="surfaceHead">
                  <div>
                    <h3>平台就绪度</h3>
                    <p className="muted">RBAC、SQLite/Postgres、schema 兼容性和 write-back 只进入治理账本；当前保持本地 SQLite、无登录、无业务系统写回。</p>
                  </div>
                  <div className="badgeCluster">
                    <Badge tone="good">login off</Badge>
                    <Badge tone="good">writeback disabled</Badge>
                    <Badge tone="blue">SQLite ledger</Badge>
                  </div>
                </div>
                <div className="platformReadinessStats">
                  <div><span>RBAC 草案</span><strong>{platformReadiness.summary.rbacPolicies}</strong><small>{platformReadiness.summary.approvalRequiredPolicies} approval gated</small></div>
                  <div><span>Postgres 触发器</span><strong>{platformReadiness.summary.postgresTriggers}</strong><small>{platformReadiness.summary.readyTriggers} ready / {platformReadiness.summary.watchTriggers} watch</small></div>
                  <div><span>兼容性发现</span><strong>{platformReadiness.summary.postgresFindings}</strong><small>{platformReadiness.summary.highRiskFindings} high risk</small></div>
                  <div><span>Write-back 评估</span><strong>{platformReadiness.summary.writebackAssessments}</strong><small>{platformReadiness.summary.disabledWritebacks} disabled / {platformReadiness.summary.reviewRequiredWritebacks} review</small></div>
                </div>
                <div className="platformReadinessGrid">
                  <div>
                    <div className="sectionLabel">
                      <span>RBAC</span>
                      <strong>未来权限草案</strong>
                    </div>
                    <div className="platformReadinessList rbacPolicyList">
                      {platformReadiness.rbacPolicies.map((policy) => (
                        <article key={policy.id}>
                          <div className="ledgerItemHead">
                            <strong>{policy.policy_name}</strong>
                            <Badge tone={toneFromStatus(policy.risk_level)}>{policy.status}</Badge>
                          </div>
                          <p>{policy.subject_role} / {policy.role_code}</p>
                          <small>{cellValue(policy.allowed_actions)} · login {policy.login_required ? "required" : "off"}</small>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="sectionLabel">
                      <span>Postgres</span>
                      <strong>迁移触发条件</strong>
                    </div>
                    <div className="platformReadinessList postgresTriggerList">
                      {platformReadiness.postgresTriggers.map((trigger) => (
                        <article key={trigger.id}>
                          <div className="ledgerItemHead">
                            <strong>{trigger.trigger_name}</strong>
                            <Badge tone={toneFromStatus(trigger.status)}>{trigger.status}</Badge>
                          </div>
                          <p>{trigger.current_value}/{trigger.threshold_value} {trigger.unit}</p>
                          <small>{trigger.recommendation}</small>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="sectionLabel">
                      <span>Schema</span>
                      <strong>兼容性审计</strong>
                    </div>
                    <div className="platformReadinessList postgresFindingList">
                      {platformReadiness.postgresFindings.map((finding) => (
                        <article key={finding.id}>
                          <div className="ledgerItemHead">
                            <strong>{finding.table_name}</strong>
                            <Badge tone={toneFromStatus(finding.risk_level)}>{finding.finding_type}</Badge>
                          </div>
                          <p>{finding.finding_detail}</p>
                          <small>{finding.postgres_recommendation}</small>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="sectionLabel">
                      <span>Write-back</span>
                      <strong>受控写回评估</strong>
                    </div>
                    <div className="platformReadinessList writebackRiskList">
                      {platformReadiness.writebackAssessments.map((item) => (
                        <article key={item.id}>
                          <div className="ledgerItemHead">
                            <strong>{item.target_system}</strong>
                            <Badge tone={toneFromStatus(item.status)}>{item.status}</Badge>
                          </div>
                          <p>{item.use_case}</p>
                          <small>{item.approval_gate}</small>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
              <section className="evalCasePanel">
                <div className="surfaceHead">
                  <h3>Agent Eval</h3>
                  <Badge tone="warn">{detail.data.evalCases.length} cases</Badge>
                </div>
                <div className="evalCaseList">
                  {detail.data.evalCases.map((item) => (
                    <article key={item.id}>
                      <div className="ledgerItemHead">
                        <strong>{item.scenario_type}</strong>
                        <Badge tone={toneFromStatus(item.expected_answerability)}>{item.expected_answerability}</Badge>
                      </div>
                      <p>{item.question}</p>
                      <small>{cellValue(item.required_evidence_refs)}</small>
                    </article>
                  ))}
                </div>
              </section>
              <section className="roleMetricsPanel">
                <div className="surfaceHead">
                  <h3>角色指标</h3>
                  <Badge tone="blue">{detail.data.metrics.length}</Badge>
                </div>
                <DataTable
                  rows={detail.data.metrics.slice(0, 8).map((metric) => metric as unknown as AnyRow)}
                  columns={["code", "name", "level", "owner", "certification_status"]}
                  empty="暂无角色指标映射。"
                />
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DecisionPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [note, setNote] = useState("");
  const [activeDecisionSection, setActiveDecisionSection] = useState("recommendations");
  const [form, setForm] = useState({
    insightRef: "decision_1",
    actionName: "创建供应链治理动作",
    owner: "供应链数据治理 Owner",
    replayNote: "Suggestion + approval + replay only."
  });
  const actions = useApi<AnyRow[]>(`/api/decision/action-tasks?limit=100&refresh=${refresh}`, []);
  const decisions = useApi<AnyRow[]>(`/api/decision/logs?refresh=${refresh}`, []);
  const recommendations = useApi<AipRecommendation[]>(`/api/aip/recommendations?limit=100&refresh=${refresh}`, []);
  const summary = useApi<DecisionSummary>(`/api/decision/summary?refresh=${refresh}`, {
    decisions: { total: 0, byStatus: [] },
    actions: { total: 0, byStatus: [], byOwner: [] },
    stateOrder: [],
    terminalStates: [],
    writeBackPolicy: "suggestion_approval_replay_only"
  });

  async function createAction(event: React.FormEvent) {
    event.preventDefault();
    const result = await api<{ ok: boolean; task: AnyRow }>("/api/decision/action-task", {
      method: "POST",
      body: JSON.stringify(form)
    });
    setNote(`已创建 Action ${cellValue(result.task.id)}，状态为 ${cellValue(result.task.status)}`);
    setRefresh((value) => value + 1);
  }

  async function transitionAction(action: AnyRow, status: string) {
    const result = await api<{ ok: boolean; task: AnyRow }>(`/api/decision/action-tasks/${encodeURIComponent(String(action.id))}/transition`, {
      method: "POST",
      body: JSON.stringify({
        status,
        actor: "local_user",
        note: `Decision loop moved ${cellValue(action.id)} to ${status}.`,
        evidence: [{ type: "ui_transition", ref: String(action.id), status }]
      })
    });
    setNote(`Action ${cellValue(result.task.id)} 已推进到 ${cellValue(result.task.status)}`);
    setRefresh((value) => value + 1);
  }

  const decisionSections = [
    { id: "recommendations", label: "建议队列", helper: "AIP 建议卡、审批状态、行动分层", badge: summary.data.actions.total },
    { id: "action", label: "创建 Action", helper: "洞察引用、Owner、审批复盘", badge: summary.data.stateOrder.length },
    { id: "ledger", label: "台账复盘", helper: "洞察记录、建议卡映射与 Action 执行轨迹", badge: decisions.data.length + actions.data.length + recommendations.data.length }
  ];
  const recommendationMappings = recommendations.data.slice(0, 10).map((recommendation) => {
    const linkedActions = actions.data.filter((action) => {
      const insightRef = String(action.insight_ref || "");
      return [recommendation.id, recommendation.workflow_id, recommendation.trace_id].filter(Boolean).includes(insightRef);
    });
    return { recommendation, linkedActions };
  });

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="decisionSummaryGrid">
        <div>
          <span>洞察记录</span>
          <strong>{summary.data.decisions.total}</strong>
          <small>{summary.data.decisions.byStatus.map((item) => `${item.status}:${item.count}`).join(" / ") || "no decisions"}</small>
        </div>
        <div>
          <span>Action 任务</span>
          <strong>{summary.data.actions.total}</strong>
          <small>{summary.data.actions.byStatus.map((item) => `${item.status}:${item.count}`).join(" / ") || "no actions"}</small>
        </div>
        <div>
          <span>写回边界</span>
          <strong>0</strong>
          <small>{summary.data.writeBackPolicy}</small>
        </div>
      </div>
      {note ? <div className="kbNotice">{note}</div> : null}
      <WorkbenchSectionNav
        sections={decisionSections}
        active={activeDecisionSection}
        onChange={setActiveDecisionSection}
        ariaLabel="决策闭环页面分区"
      />
      <div className={sectionPaneClass(activeDecisionSection, "recommendations")}>
        <RecommendationQueuePanel onOpenAsset={onOpenAsset} />
      </div>
      <div className={sectionPaneClass(activeDecisionSection, "action")}>
      <div className="stateRail">
        {summary.data.stateOrder.map((state) => (
          <span key={state} className={summary.data.terminalStates.includes(state) ? "terminal" : ""}>{state}</span>
        ))}
      </div>
      <form className="decisionForm" onSubmit={createAction}>
        <div className="surfaceHead">
          <h3>创建治理 Action</h3>
          <Badge tone="blue">suggestion + approval + replay</Badge>
        </div>
        <div className="formGrid">
          <label>
            洞察引用
            <select value={form.insightRef} onChange={(event) => setForm({ ...form, insightRef: event.target.value })}>
              <option value="manual">manual</option>
              <optgroup label="AIP 建议卡">
                {recommendations.data.slice(0, 12).map((recommendation) => (
                  <option key={recommendation.id} value={recommendation.id}>{recommendation.recommendation_title}</option>
                ))}
              </optgroup>
              {decisions.data.map((decision) => <option key={String(decision.id)} value={String(decision.id)}>{cellValue(decision.insight_title)}</option>)}
            </select>
          </label>
          <label>
            动作名称
            <input value={form.actionName} onChange={(event) => setForm({ ...form, actionName: event.target.value })} />
          </label>
          <label>
            Owner
            <input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} />
          </label>
        </div>
        <label>
          复盘说明
          <textarea value={form.replayNote} onChange={(event) => setForm({ ...form, replayNote: event.target.value })} />
        </label>
        <button type="submit">创建 Action</button>
      </form>
      </div>
      <div className={sectionPaneClass(activeDecisionSection, "ledger")}>
      <div className="surface decisionMappingPanel">
        <div className="surfaceHead">
          <div>
            <h3>建议卡 / Action 映射</h3>
            <p className="muted">用 recommendation id、trace id 或 workflow id 串联建议卡与治理 Action；未匹配表示仍停留在建议或审批层。</p>
          </div>
          <Badge tone="blue">{recommendationMappings.length} mappings</Badge>
        </div>
        <div className="decisionMappingList">
          {recommendationMappings.length ? recommendationMappings.map(({ recommendation, linkedActions }) => (
            <article key={recommendation.id}>
              <div>
                <strong>{recommendation.recommendation_title}</strong>
                <small>{recommendation.id} / workflow {recommendation.workflow_id || "--"}</small>
              </div>
              <Badge tone={toneFromStatus(recommendation.approval_status)}>{recommendation.approval_status}</Badge>
              <span>{linkedActions.length ? `${linkedActions.length} linked actions` : "待转 Action"}</span>
              <button className="textButton" onClick={() => onOpenAsset(aipRecommendationAsset(recommendation))}>打开建议卡</button>
            </article>
          )) : <div className="empty compact">暂无建议卡映射。</div>}
        </div>
      </div>
      <div className="split">
        <div className="surface">
          <div className="surfaceHead">
            <h3>洞察记录</h3>
            <Badge>{decisions.data.length} logs</Badge>
          </div>
          <DataTable
            rows={decisions.data}
            columns={["id", "insight_title", "linked_metric_id", "recommendation", "status", "review_note"]}
            onSelectRow={(row) => onOpenAsset(makeAsset("decision_log", row, ["insight_title", "id"], ["linked_metric_id", "status"]))}
          />
        </div>
        <div className="surface">
          <div className="surfaceHead">
            <h3>Action 任务</h3>
            <Badge>{actions.data.length} actions</Badge>
          </div>
          <div className="actionCards">
            {actions.data.length ? actions.data.map((action) => (
              <article className="actionCard" key={String(action.id)}>
                <div className="ledgerItemHead">
                  <strong>{cellValue(action.action_name)}</strong>
                  <Badge tone={toneFromStatus(String(action.status))}>{cellValue(action.status)}</Badge>
                </div>
                <p>{cellValue(action.insight_ref)} / owner {cellValue(action.owner)} / transitions {cellValue(action.transition_count || 0)}</p>
                <small>{cellValue(action.replay_note)}</small>
                <div className="qualityActions">
                  <button className="textButton" onClick={() => onOpenAsset(makeAsset("action_task", action, ["action_name", "id"], ["owner", "status"]))}>详情</button>
                  {actionNextStates(String(action.status)).map((state) => (
                    <button className="textButton" key={state} onClick={() => transitionAction(action, state)}>{state}</button>
                  ))}
                </div>
              </article>
            )) : <div className="empty compact">暂无 Action。可从上方创建建议/审批/复盘任务。</div>}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

function AuditLogPanel({ module, onOpenAsset }: { module: WorkbenchModule; onOpenAsset: (asset: AssetRef) => void }) {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ eventType: "", assetType: "", assetId: "", actor: "", q: "" });
  const [activeAuditSection, setActiveAuditSection] = useState("timeline");
  const query = [
    "limit=220",
    `refresh=${refresh}`,
    filters.eventType ? `eventType=${encodeURIComponent(filters.eventType)}` : "",
    filters.assetType ? `assetType=${encodeURIComponent(filters.assetType)}` : "",
    filters.assetId ? `assetId=${encodeURIComponent(filters.assetId)}` : "",
    filters.actor ? `actor=${encodeURIComponent(filters.actor)}` : "",
    filters.q ? `q=${encodeURIComponent(filters.q)}` : ""
  ].filter(Boolean).join("&");
  const summary = useApi<AuditSummary>(`/api/audit/summary?refresh=${refresh}`, {
    total: 0,
    byEventType: [],
    byAssetType: [],
    byActor: [],
    recent: []
  });
  const events = useApi<AuditEvent[]>(`/api/audit-events?${query}`, []);
  const eventPager = usePagination<AuditEvent>(events.data, 10);
  const auditExportParams = new URLSearchParams({ limit: "500" });
  if (filters.eventType) auditExportParams.set("eventType", filters.eventType);
  if (filters.assetType) auditExportParams.set("assetType", filters.assetType);
  if (filters.assetId) auditExportParams.set("assetId", filters.assetId);
  if (filters.actor) auditExportParams.set("actor", filters.actor);
  if (filters.q) auditExportParams.set("q", filters.q);
  const auditExportQuery = auditExportParams.toString();

  useEffect(() => {
    eventPager.setPage(1);
  }, [filters.eventType, filters.assetType, filters.assetId, filters.actor, filters.q]);

  function openEvent(event: AuditEvent) {
    onOpenAsset({
      type: "audit_event",
      id: event.id,
      title: event.event_type,
      subtitle: `${event.asset_type}:${event.asset_id} / ${event.actor}`,
      fields: event,
      readOnly: true
    });
  }

  function selectFacet(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: current[key] === value ? "" : value }));
  }

  const auditSections = [
    { id: "timeline", label: "事件时间线", helper: "筛选、分页、打开审计详情", badge: events.data.length },
    { id: "facets", label: "审计分面", helper: "按事件、资产、操作者聚合", badge: summary.data.byEventType.length + summary.data.byAssetType.length }
  ];

  return (
    <section className="panel">
      <ModuleHeader module={module} />
      <div className="auditSummaryGrid">
        <div>
          <span>审计事件</span>
          <strong>{summary.data.total}</strong>
          <small>append-only SQLite ledger</small>
        </div>
        <div>
          <span>事件类型</span>
          <strong>{summary.data.byEventType.length}</strong>
          <small>{summary.data.byEventType.slice(0, 3).map((item) => `${item.event_type}:${item.count}`).join(" / ") || "no events"}</small>
        </div>
        <div>
          <span>资产类型</span>
          <strong>{summary.data.byAssetType.length}</strong>
          <small>{summary.data.byAssetType.slice(0, 3).map((item) => `${item.asset_type}:${item.count}`).join(" / ") || "no assets"}</small>
        </div>
        <div>
          <span>操作者</span>
          <strong>{summary.data.byActor.length}</strong>
          <small>{summary.data.byActor.slice(0, 3).map((item) => `${item.actor}:${item.count}`).join(" / ") || "no actors"}</small>
        </div>
      </div>
      <div className="auditExportBar">
        <div>
          <strong>审计导出</strong>
          <span>按当前筛选导出 append-only 事件，不删除、不覆盖审计账本。</span>
        </div>
        <div className="exportActions auditExportActions" aria-label="audit export actions">
          <a href={`/api/export/audit-log?format=json&${auditExportQuery}`} className="textButton" target="_blank" rel="noreferrer">导出 JSON</a>
          <a href={`/api/export/audit-log?format=excel&${auditExportQuery}`} className="textButton" target="_blank" rel="noreferrer">导出 Excel</a>
        </div>
      </div>
      <WorkbenchSectionNav
        sections={auditSections}
        active={activeAuditSection}
        onChange={setActiveAuditSection}
        ariaLabel="审计日志页面分区"
      />
      <div className={sectionPaneClass(activeAuditSection, "facets")}>
      <div className="auditWorkbench auditFacetWorkbench">
        <aside className="auditFacets">
          <div className="surfaceHead">
            <h3>事件类型</h3>
            <Badge>{summary.data.byEventType.length}</Badge>
          </div>
          <div className="facetList">
            {summary.data.byEventType.map((item) => (
              <button
                key={String(item.event_type)}
                className={filters.eventType === item.event_type ? "active" : ""}
                onClick={() => selectFacet("eventType", String(item.event_type))}
              >
                <span>{cellValue(item.event_type)}</span>
                <strong>{cellValue(item.count)}</strong>
              </button>
            ))}
          </div>
          <div className="surfaceHead">
            <h3>资产类型</h3>
            <Badge>{summary.data.byAssetType.length}</Badge>
          </div>
          <div className="facetList">
            {summary.data.byAssetType.map((item) => (
              <button
                key={String(item.asset_type)}
                className={filters.assetType === item.asset_type ? "active" : ""}
                onClick={() => selectFacet("assetType", String(item.asset_type))}
              >
                <span>{cellValue(item.asset_type) || "empty"}</span>
                <strong>{cellValue(item.count)}</strong>
              </button>
            ))}
          </div>
        </aside>
        <div className="surface auditActorPanel">
          <div className="surfaceHead">
            <h3>操作者分布</h3>
            <Badge>{summary.data.byActor.length}</Badge>
          </div>
          <div className="facetList">
            {summary.data.byActor.map((item) => (
              <button
                key={String(item.actor)}
                className={filters.actor === item.actor ? "active" : ""}
                onClick={() => selectFacet("actor", String(item.actor))}
              >
                <span>{cellValue(item.actor) || "empty"}</span>
                <strong>{cellValue(item.count)}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
      <div className={sectionPaneClass(activeAuditSection, "timeline")}>
      <div className="auditWorkbench auditTimelineWorkbench">
        <div className="auditMain">
          <div className="auditFilters">
            <label>
              事件类型
              <input value={filters.eventType} onChange={(event) => setFilters({ ...filters, eventType: event.target.value })} placeholder="例如 chatbi_context.reviewed" />
            </label>
            <label>
              资产类型
              <input value={filters.assetType} onChange={(event) => setFilters({ ...filters, assetType: event.target.value })} placeholder="例如 chatbi_context" />
            </label>
            <label>
              资产 ID
              <input value={filters.assetId} onChange={(event) => setFilters({ ...filters, assetId: event.target.value })} />
            </label>
            <label>
              操作者
              <input value={filters.actor} onChange={(event) => setFilters({ ...filters, actor: event.target.value })} />
            </label>
            <label className="workflowSearch">
              搜索
              <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="事件、资产、payload" />
            </label>
            <button className="secondaryButton" onClick={() => setRefresh((value) => value + 1)}>刷新</button>
          </div>
          <div className="surfaceHead">
            <h3>审计事件时间线</h3>
            <Badge>{events.data.length ? `${eventPager.startIndex + 1}-${eventPager.endIndex} / ${events.data.length}` : "0 / 0"} visible</Badge>
          </div>
          <div className="auditTimeline">
            {events.data.length ? eventPager.pageItems.map((event, index) => (
              <article key={event.id}>
                <div className="timelineDot" />
                <div className="auditEventCard">
                  <div className="ledgerItemHead">
                    <strong><span className="inlineIndex">#{eventPager.startIndex + index + 1}</span>{event.event_type}</strong>
                    <Badge tone="blue">{event.actor}</Badge>
                  </div>
                  <p>{event.asset_type}:{event.asset_id}</p>
                  <pre>{event.payload}</pre>
                  <small>{event.created_at}</small>
                  <button className="textButton" onClick={() => openEvent(event)}>打开审计详情</button>
                </div>
              </article>
            )) : <div className="empty compact">当前筛选无审计事件。</div>}
          </div>
          <PaginationBar pager={eventPager} label="审计时间线" />
        </div>
      </div>
      </div>
    </section>
  );
}

function FieldList({ fields }: { fields: AnyRow }) {
  return (
    <dl className="fieldList">
      {Object.entries(fields).slice(0, 28).map(([key, value]) => (
        <div key={key}>
          <dt>{columnLabels[key] || key}</dt>
          <dd>{cellValue(value) || "--"}</dd>
        </div>
      ))}
    </dl>
  );
}

function ContextDrawer({
  asset,
  onClose,
  onAskAi
}: {
  asset: AssetRef | null;
  onClose: () => void;
  onAskAi: (asset: AssetRef) => void;
}) {
  const [tab, setTab] = useState<"summary" | "annotations" | "comments" | "revisions" | "audit">("summary");
  const [ledger, setLedger] = useState<LedgerState>({ annotations: [], comments: [], proposals: [], audits: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [annotationTitle, setAnnotationTitle] = useState("");
  const [annotationBody, setAnnotationBody] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [proposalType, setProposalType] = useState("definition_refinement");
  const [proposalValue, setProposalValue] = useState("");
  const [proposalReason, setProposalReason] = useState("");
  const [proposalEvidence, setProposalEvidence] = useState("");

  async function loadLedger(nextAsset = asset) {
    if (!nextAsset) return;
    setLoading(true);
    setError("");
    const assetType = encodeURIComponent(nextAsset.type);
    const assetId = encodeURIComponent(nextAsset.id);
    try {
      const [annotations, comments, proposals, audits] = await Promise.all([
        api<LedgerAnnotation[]>(`/api/ledger/${assetType}/${assetId}/annotations`),
        api<LedgerComment[]>(`/api/ledger/${assetType}/${assetId}/comments`),
        api<RevisionProposal[]>(`/api/revision-proposals?assetType=${assetType}&assetId=${assetId}`),
        api<AuditEvent[]>(`/api/audit-events?assetType=${assetType}&assetId=${assetId}&limit=30`)
      ]);
      setLedger({ annotations, comments, proposals, audits });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!asset) return;
    setTab("summary");
    setAnnotationTitle("");
    setAnnotationBody("");
    setCommentBody("");
    setProposalType("definition_refinement");
    setProposalValue("");
    setProposalReason("");
    setProposalEvidence("");
    loadLedger(asset);
  }, [asset?.type, asset?.id]);

  if (!asset) return null;
  const currentAsset = asset;

  async function submitAnnotation(event: React.FormEvent) {
    event.preventDefault();
    if (!annotationTitle.trim() || !annotationBody.trim()) return;
    await api(`/api/ledger/${encodeURIComponent(currentAsset.type)}/${encodeURIComponent(currentAsset.id)}/annotations`, {
      method: "POST",
      body: JSON.stringify({
        title: annotationTitle,
        body: annotationBody,
        annotationType: "workbench_note",
        createdBy: "local_user"
      })
    });
    setAnnotationTitle("");
    setAnnotationBody("");
    await loadLedger();
  }

  async function archiveAnnotation(id: string) {
    await api(`/api/ledger/annotations/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "archived", actor: "local_user" })
    });
    await loadLedger();
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    if (!commentBody.trim()) return;
    await api(`/api/ledger/${encodeURIComponent(currentAsset.type)}/${encodeURIComponent(currentAsset.id)}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: commentBody, createdBy: "local_user" })
    });
    setCommentBody("");
    await loadLedger();
  }

  async function submitProposal(event: React.FormEvent) {
    event.preventDefault();
    if (!proposalValue.trim() || !proposalReason.trim()) return;
    await api("/api/revision-proposals", {
      method: "POST",
      body: JSON.stringify({
        assetType: currentAsset.type,
        assetId: currentAsset.id,
        proposalType,
        currentValue: JSON.stringify(currentAsset.fields),
        proposedValue: proposalValue,
        reason: proposalReason,
        evidenceRefs: [{ source: "workbench_local", path: proposalEvidence || `${currentAsset.type}/${currentAsset.id}` }],
        createdBy: "local_user"
      })
    });
    setProposalValue("");
    setProposalReason("");
    setProposalEvidence("");
    await loadLedger();
  }

  return (
    <>
      <button className="drawerScrim" aria-label="关闭资产抽屉" onClick={onClose} />
      <aside className="contextDrawer" aria-label="资产上下文抽屉">
        <div className="drawerHead">
          <div>
            <p className="eyebrow">{asset.type}</p>
            <h2>{asset.title}</h2>
            <p className="muted">{asset.subtitle || asset.id}</p>
          </div>
          <button className="iconButton" onClick={onClose} aria-label="关闭">×</button>
        </div>
        <div className="drawerPolicy">
          <Badge tone={asset.readOnly ? "warn" : "blue"}>{asset.readOnly ? "canonical read-only" : "ledger writable"}</Badge>
          <span>所有操作写入 SQLite 台账，不直接覆盖 canonical 资产。</span>
          <button className="textButton" onClick={() => onAskAi(currentAsset)}>用 AI 追问</button>
        </div>
        <div className="drawerTabs" role="tablist">
          {[
            ["summary", "详情"],
            ["annotations", `注解 ${ledger.annotations.length}`],
            ["comments", `评论 ${ledger.comments.length}`],
            ["revisions", `修订 ${ledger.proposals.length}`],
            ["audit", `审计 ${ledger.audits.length}`]
          ].map(([key, label]) => (
            <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key as typeof tab)}>
              {label}
            </button>
          ))}
        </div>
        {error ? <div className="error">{error}</div> : null}
        {loading ? <div className="empty">正在读取台账...</div> : null}
        <div className="drawerBody">
          {tab === "summary" && (
            <div className="drawerSection">
              <h3>资产字段</h3>
              <FieldList fields={asset.fields} />
            </div>
          )}
          {tab === "annotations" && (
            <div className="drawerSection">
              <form className="ledgerForm" onSubmit={submitAnnotation}>
                <label>
                  注解标题
                  <input value={annotationTitle} onChange={(event) => setAnnotationTitle(event.target.value)} placeholder="例如：口径待 owner 复核" />
                </label>
                <label>
                  注解内容
                  <textarea value={annotationBody} onChange={(event) => setAnnotationBody(event.target.value)} placeholder="记录证据、判断、上下文或待办事项" />
                </label>
                <button type="submit">新增注解</button>
              </form>
              <LedgerList
                empty="暂无注解"
                items={ledger.annotations}
                render={(item) => (
                  <>
                    <div className="ledgerItemHead">
                      <strong>{item.title}</strong>
                      <Badge tone={toneFromStatus(item.status)}>{item.status}</Badge>
                    </div>
                    <p>{item.body}</p>
                    <small>{item.created_by} / {item.created_at}</small>
                    {item.status !== "archived" ? <button className="textButton" onClick={() => archiveAnnotation(item.id)}>归档</button> : null}
                  </>
                )}
              />
            </div>
          )}
          {tab === "comments" && (
            <div className="drawerSection">
              <form className="ledgerForm" onSubmit={submitComment}>
                <label>
                  评论
                  <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="补充讨论、确认意见或复盘说明" />
                </label>
                <button type="submit">发表评论</button>
              </form>
              <LedgerList
                empty="暂无评论"
                items={ledger.comments}
                render={(item) => (
                  <>
                    <p>{item.body}</p>
                    <small>{item.created_by} / {item.created_at}</small>
                  </>
                )}
              />
            </div>
          )}
          {tab === "revisions" && (
            <div className="drawerSection">
              <form className="ledgerForm" onSubmit={submitProposal}>
                <label>
                  修订类型
                  <input value={proposalType} onChange={(event) => setProposalType(event.target.value)} />
                </label>
                <label>
                  建议值
                  <textarea value={proposalValue} onChange={(event) => setProposalValue(event.target.value)} placeholder="写出口径、字段、规则或状态建议" />
                </label>
                <label>
                  原因
                  <textarea value={proposalReason} onChange={(event) => setProposalReason(event.target.value)} placeholder="说明为什么要修订，以及与知识库/业务事实的关系" />
                </label>
                <label>
                  证据路径
                  <input value={proposalEvidence} onChange={(event) => setProposalEvidence(event.target.value)} placeholder="可填知识库路径、报表、页面或样本数据引用" />
                </label>
                <button type="submit">提交修订建议</button>
              </form>
              <LedgerList
                empty="暂无修订建议"
                items={ledger.proposals}
                render={(item) => (
                  <>
                    <div className="ledgerItemHead">
                      <strong>{item.proposal_type}</strong>
                      <Badge tone={toneFromStatus(item.status)}>{item.status}</Badge>
                    </div>
                    <p>{item.reason}</p>
                    <pre>{item.proposed_value}</pre>
                    <small>{item.created_by} / {item.created_at}</small>
                  </>
                )}
              />
            </div>
          )}
          {tab === "audit" && (
            <div className="drawerSection">
              <LedgerList
                empty="暂无审计事件"
                items={ledger.audits}
                render={(item) => (
                  <>
                    <div className="ledgerItemHead">
                      <strong>{item.event_type}</strong>
                      <span>{item.actor}</span>
                    </div>
                    <pre>{item.payload}</pre>
                    <small>{item.created_at}</small>
                  </>
                )}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function LedgerList<T>({ items, render, empty }: { items: T[]; render: (item: T) => React.ReactNode; empty: string }) {
  if (!items.length) return <div className="empty compact">{empty}</div>;
  return (
    <div className="ledgerList">
      {items.map((item, index) => (
        <article className="ledgerItem" key={(item as { id?: string }).id || index}>
          {render(item)}
        </article>
      ))}
    </div>
  );
}

function Sidebar({ modules, active, onSelect }: { modules: WorkbenchModule[]; active: string; onSelect: (id: string) => void }) {
  const groups = [
    { title: "入口", ids: ["overview", "ai-chat"] },
    { title: "对象与模型", ids: ["ontology", "tags", "dimensions"] },
    { title: "指标治理", ids: ["metric-engineering", "metric-dictionary", "kpi-system"] },
    { title: "控制与语义", ids: ["lineage-quality", "chatbi", "ai-knowledge"] },
    { title: "编排与闭环", ids: ["workflow-orchestration", "role-workbench", "decision-loop", "audit-log"] }
  ];
  const moduleById = Object.fromEntries(modules.map((module) => [module.id, module]));
  return (
    <aside className="sidebar">
      <div className="brand">
        <span>SC</span>
        <div>
          <strong>AIP-SCM</strong>
          <small>Data Workbench</small>
        </div>
      </div>
      <nav>
        {groups.map((group) => (
          <div className="navGroup" key={group.title}>
            <p>{group.title}</p>
            {group.ids.map((id) => moduleById[id]).filter(Boolean).map((module) => (
              <button className={active === module.id ? "active" : ""} key={module.id} onClick={() => onSelect(module.id)}>
                <span>{module.code}</span>
                <strong>{module.title}</strong>
                <small>{module.primaryMetric}</small>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function App() {
  const [active, setActive] = useState("overview");
  const [selectedAsset, setSelectedAsset] = useState<AssetRef | null>(null);
  const [chatSourceAsset, setChatSourceAsset] = useState<AssetRef | null>(null);
  const [workbenchRefresh, setWorkbenchRefresh] = useState(0);
  const overview = useApi<Overview>("/api/governance/overview", {
    counts: {},
    lifecycle: [],
    levels: [],
    tasks: [],
    moduleHealth: [],
    architectureLayers: []
  });
  const modulesApi = useApi<WorkbenchModule[]>(`/api/workbench/modules?refresh=${workbenchRefresh}`, fallbackModules);
  const modules = modulesApi.data.length ? modulesApi.data : fallbackModules;
  const activeModule = modules.find((module) => module.id === active) || modules[0];
  function selectModule(id: string) {
    setActive(id);
    setSelectedAsset(null);
  }

  function askAiFromAsset(asset: AssetRef) {
    setChatSourceAsset(asset);
    setSelectedAsset(null);
    setActive("ai-chat");
  }

  return (
    <main className="shell">
      <Sidebar modules={modules} active={activeModule.id} onSelect={selectModule} />
      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Supply chain semantic governance</p>
            <h1>{activeModule.title}</h1>
          </div>
          <div className="topMeta">
            <Badge tone="good">certified metrics</Badge>
            <Badge tone="blue">ontology graph</Badge>
            <Badge>approval first</Badge>
          </div>
        </header>
        {overview.error ? <div className="error">{overview.error}</div> : null}
        {modulesApi.error ? <div className="error">{modulesApi.error}</div> : null}
        {overview.loading && active === "overview" ? <div className="empty">正在加载治理资产...</div> : null}
        {active === "overview" && <OverviewPanel overview={overview.data} modules={modules} onSelect={selectModule} onOpenAsset={setSelectedAsset} />}
        {active === "ontology" && <OntologyPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "tags" && <TagsPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "dimensions" && <DimensionsPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "metric-engineering" && <MetricsPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "metric-dictionary" && <MetricsPanel module={activeModule} dictionary onOpenAsset={setSelectedAsset} />}
        {active === "kpi-system" && <KpiTreePanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "lineage-quality" && <LineagePanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "chatbi" && <ChatBiPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "ai-knowledge" && <KbPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "workflow-orchestration" && <WorkflowOrchestrationPanel module={activeModule} onOpenAsset={setSelectedAsset} onSelect={selectModule} />}
        {active === "ai-chat" && (
          <AiChatPanel
            module={activeModule}
            onOpenAsset={setSelectedAsset}
            sourceAsset={chatSourceAsset}
            onClearSourceAsset={() => setChatSourceAsset(null)}
            onWorkbenchRefresh={() => setWorkbenchRefresh((value) => value + 1)}
          />
        )}
        {active === "role-workbench" && <RoleWorkbenchPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "decision-loop" && <DecisionPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
        {active === "audit-log" && <AuditLogPanel module={activeModule} onOpenAsset={setSelectedAsset} />}
      </section>
      <ContextDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} onAskAi={askAiFromAsset} />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
