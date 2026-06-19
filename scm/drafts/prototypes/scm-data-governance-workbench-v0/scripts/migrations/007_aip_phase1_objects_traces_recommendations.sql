CREATE TABLE IF NOT EXISTS object_instances (
  id TEXT PRIMARY KEY,
  object_type TEXT NOT NULL,
  object_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  lifecycle_status TEXT NOT NULL DEFAULT 'active',
  risk_level TEXT NOT NULL DEFAULT 'medium',
  owner TEXT NOT NULL DEFAULT 'supply_chain_owner',
  health_score REAL NOT NULL DEFAULT 0,
  source_refs TEXT NOT NULL DEFAULT '[]',
  properties TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_object_instances_type_key ON object_instances(object_type, object_key);
CREATE INDEX IF NOT EXISTS idx_object_instances_filters ON object_instances(object_type, lifecycle_status, risk_level, owner);

CREATE TABLE IF NOT EXISTS object_identity_links (
  id TEXT PRIMARY KEY,
  object_id TEXT NOT NULL,
  identity_type TEXT NOT NULL,
  identity_value TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  evidence TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_object_identity_unique ON object_identity_links(object_id, identity_type, identity_value);
CREATE INDEX IF NOT EXISTS idx_object_identity_lookup ON object_identity_links(identity_type, identity_value, status);

CREATE TABLE IF NOT EXISTS object_events (
  id TEXT PRIMARY KEY,
  object_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  event_title TEXT NOT NULL,
  event_detail TEXT NOT NULL,
  metric_refs TEXT NOT NULL DEFAULT '[]',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'open',
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_object_events_object ON object_events(object_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_object_events_type ON object_events(event_type, severity, status);

CREATE TABLE IF NOT EXISTS agent_execution_traces (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL DEFAULT '',
  source_message_id TEXT NOT NULL DEFAULT '',
  intent TEXT NOT NULL,
  question TEXT NOT NULL,
  target_object_type TEXT NOT NULL DEFAULT '',
  target_object_id TEXT NOT NULL DEFAULT '',
  target_metric_id TEXT NOT NULL DEFAULT '',
  answerability TEXT NOT NULL DEFAULT 'partial',
  answerability_score REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  created_by TEXT NOT NULL DEFAULT 'local_user',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_traces_target ON agent_execution_traces(target_object_type, target_object_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_traces_status ON agent_execution_traces(answerability, status, created_at);

CREATE TABLE IF NOT EXISTS agent_trace_steps (
  id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL,
  step_title TEXT NOT NULL,
  step_detail TEXT NOT NULL,
  input_refs TEXT NOT NULL DEFAULT '[]',
  output_refs TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_trace_steps_trace ON agent_trace_steps(trace_id, step_order);

CREATE TABLE IF NOT EXISTS recommendation_cards (
  id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL DEFAULT '',
  target_object_type TEXT NOT NULL DEFAULT '',
  target_object_id TEXT NOT NULL DEFAULT '',
  scenario_type TEXT NOT NULL DEFAULT '',
  recommendation_title TEXT NOT NULL,
  recommendation_detail TEXT NOT NULL,
  impact_summary TEXT NOT NULL DEFAULT '',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  action_options TEXT NOT NULL DEFAULT '[]',
  action_tier TEXT NOT NULL DEFAULT 'L1',
  owner TEXT NOT NULL DEFAULT 'supply_chain_owner',
  priority TEXT NOT NULL DEFAULT 'P1',
  approval_status TEXT NOT NULL DEFAULT 'draft',
  workflow_id TEXT NOT NULL DEFAULT '',
  due_date TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'local_user',
  reviewer TEXT NOT NULL DEFAULT '',
  review_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recommendation_cards_target ON recommendation_cards(target_object_type, target_object_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_recommendation_cards_status ON recommendation_cards(approval_status, priority, owner);
CREATE INDEX IF NOT EXISTS idx_recommendation_cards_trace ON recommendation_cards(trace_id);

CREATE TABLE IF NOT EXISTS recommendation_transitions (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'local_user',
  note TEXT NOT NULL DEFAULT '',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recommendation_transitions_card ON recommendation_transitions(recommendation_id, created_at);

CREATE TABLE IF NOT EXISTS action_policy_tiers (
  id TEXT PRIMARY KEY,
  tier_code TEXT NOT NULL UNIQUE,
  tier_name TEXT NOT NULL,
  description TEXT NOT NULL,
  approval_required INTEGER NOT NULL DEFAULT 1,
  writeback_allowed INTEGER NOT NULL DEFAULT 0,
  allowed_actions TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_action_policy_tiers_status ON action_policy_tiers(status, tier_code);
