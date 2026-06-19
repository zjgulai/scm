CREATE TABLE IF NOT EXISTS access_policy_drafts (
  id TEXT PRIMARY KEY,
  role_code TEXT NOT NULL DEFAULT '',
  policy_name TEXT NOT NULL,
  subject_role TEXT NOT NULL DEFAULT '',
  allowed_actions TEXT NOT NULL DEFAULT '[]',
  object_scope TEXT NOT NULL DEFAULT '{}',
  approval_required INTEGER NOT NULL DEFAULT 1,
  login_required INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  owner TEXT NOT NULL DEFAULT 'platform_governance_owner',
  risk_level TEXT NOT NULL DEFAULT 'medium',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_access_policy_drafts_role ON access_policy_drafts(role_code, status, risk_level);
CREATE INDEX IF NOT EXISTS idx_access_policy_drafts_subject ON access_policy_drafts(subject_role, approval_required, login_required);

CREATE TABLE IF NOT EXISTS postgres_migration_triggers (
  id TEXT PRIMARY KEY,
  trigger_code TEXT NOT NULL UNIQUE,
  trigger_name TEXT NOT NULL,
  threshold_value REAL NOT NULL DEFAULT 0,
  current_value REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'watch',
  recommendation TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT 'platform_governance_owner',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_postgres_migration_triggers_status ON postgres_migration_triggers(status, trigger_code);

CREATE TABLE IF NOT EXISTS postgres_compatibility_findings (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  finding_type TEXT NOT NULL DEFAULT '',
  risk_level TEXT NOT NULL DEFAULT 'medium',
  finding_detail TEXT NOT NULL DEFAULT '',
  postgres_recommendation TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'review_pending',
  owner TEXT NOT NULL DEFAULT 'platform_governance_owner',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_postgres_compatibility_findings_table ON postgres_compatibility_findings(table_name, risk_level, status);

CREATE TABLE IF NOT EXISTS writeback_risk_assessments (
  id TEXT PRIMARY KEY,
  target_system TEXT NOT NULL DEFAULT '',
  action_tier TEXT NOT NULL DEFAULT 'L3',
  api_surface TEXT NOT NULL DEFAULT '',
  use_case TEXT NOT NULL DEFAULT '',
  risk_level TEXT NOT NULL DEFAULT 'high',
  approval_gate TEXT NOT NULL DEFAULT '',
  rollback_plan TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'disabled',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_writeback_risk_assessments_status ON writeback_risk_assessments(status, risk_level, target_system);
