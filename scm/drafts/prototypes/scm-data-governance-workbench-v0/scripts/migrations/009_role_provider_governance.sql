CREATE TABLE IF NOT EXISTS role_workbenches (
  id TEXT PRIMARY KEY,
  role_code TEXT NOT NULL UNIQUE,
  role_name TEXT NOT NULL,
  role_type TEXT NOT NULL DEFAULT 'supply_chain_operator',
  mission TEXT NOT NULL DEFAULT '',
  primary_object_types TEXT NOT NULL DEFAULT '[]',
  metric_refs TEXT NOT NULL DEFAULT '[]',
  decision_cadence TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT 'supply_chain_governance_owner',
  lifecycle_status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_role_workbenches_status ON role_workbenches(lifecycle_status, role_type);

CREATE TABLE IF NOT EXISTS role_playbooks (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL,
  playbook_name TEXT NOT NULL,
  trigger_condition TEXT NOT NULL DEFAULT '',
  action_template TEXT NOT NULL DEFAULT '{}',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  priority TEXT NOT NULL DEFAULT 'P1',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_role_playbooks_role ON role_playbooks(role_id, status, priority);

CREATE TABLE IF NOT EXISTS provider_gateway_policies (
  id TEXT PRIMARY KEY,
  provider_code TEXT NOT NULL UNIQUE,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'llm',
  status TEXT NOT NULL DEFAULT 'disabled',
  allowed_use_cases TEXT NOT NULL DEFAULT '[]',
  data_boundary TEXT NOT NULL DEFAULT '',
  evidence_required INTEGER NOT NULL DEFAULT 1,
  prompt_version_policy TEXT NOT NULL DEFAULT '',
  cost_policy TEXT NOT NULL DEFAULT '',
  pii_policy TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_provider_gateway_status ON provider_gateway_policies(status, provider_type);

CREATE TABLE IF NOT EXISTS agent_eval_cases (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL DEFAULT '',
  scenario_type TEXT NOT NULL DEFAULT '',
  question TEXT NOT NULL,
  expected_answerability TEXT NOT NULL DEFAULT 'partial',
  required_evidence_refs TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_eval_cases_role ON agent_eval_cases(role_id, scenario_type, status);
