CREATE TABLE IF NOT EXISTS provider_decision_records (
  id TEXT PRIMARY KEY,
  provider_code TEXT NOT NULL DEFAULT '',
  decision_title TEXT NOT NULL,
  preferred_rank INTEGER NOT NULL DEFAULT 0,
  decision_status TEXT NOT NULL DEFAULT 'draft',
  decision_summary TEXT NOT NULL DEFAULT '',
  cost_notes TEXT NOT NULL DEFAULT '',
  risk_notes TEXT NOT NULL DEFAULT '',
  fallback_policy TEXT NOT NULL DEFAULT '',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  owner TEXT NOT NULL DEFAULT 'ai_governance_owner',
  lifecycle_status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_provider_decision_records_provider ON provider_decision_records(provider_code, decision_status, lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_provider_decision_records_rank ON provider_decision_records(preferred_rank, provider_code);

CREATE TABLE IF NOT EXISTS prompt_versions (
  id TEXT PRIMARY KEY,
  prompt_code TEXT NOT NULL UNIQUE,
  provider_code TEXT NOT NULL DEFAULT '',
  role_id TEXT NOT NULL DEFAULT '',
  eval_case_id TEXT NOT NULL DEFAULT '',
  scenario_type TEXT NOT NULL DEFAULT '',
  prompt_title TEXT NOT NULL,
  prompt_body TEXT NOT NULL DEFAULT '',
  context_contract TEXT NOT NULL DEFAULT '{}',
  allowed_evidence_refs TEXT NOT NULL DEFAULT '[]',
  version_no INTEGER NOT NULL DEFAULT 1,
  rollback_of TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  owner TEXT NOT NULL DEFAULT 'ai_governance_owner',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_provider ON prompt_versions(provider_code, status, scenario_type);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_role ON prompt_versions(role_id, eval_case_id, status);

CREATE TABLE IF NOT EXISTS provider_call_audits (
  id TEXT PRIMARY KEY,
  provider_code TEXT NOT NULL DEFAULT '',
  prompt_version_id TEXT NOT NULL DEFAULT '',
  trace_id TEXT NOT NULL DEFAULT '',
  eval_case_id TEXT NOT NULL DEFAULT '',
  call_status TEXT NOT NULL DEFAULT 'blocked_disabled',
  request_purpose TEXT NOT NULL DEFAULT '',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  token_estimate INTEGER NOT NULL DEFAULT 0,
  cost_estimate_usd REAL NOT NULL DEFAULT 0,
  error_summary TEXT NOT NULL DEFAULT '',
  response_digest TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT 'local_user',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_provider_call_audits_provider ON provider_call_audits(provider_code, call_status, created_at);
CREATE INDEX IF NOT EXISTS idx_provider_call_audits_prompt ON provider_call_audits(prompt_version_id, eval_case_id, trace_id);
