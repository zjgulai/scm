CREATE TABLE IF NOT EXISTS knowledge_rules (
  id TEXT PRIMARY KEY,
  source_card_id TEXT NOT NULL DEFAULT '',
  source_domain_id TEXT NOT NULL DEFAULT '',
  rule_code TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'diagnostic',
  target_object_type TEXT NOT NULL DEFAULT '',
  target_metric_ids TEXT NOT NULL DEFAULT '[]',
  target_dimension_ids TEXT NOT NULL DEFAULT '[]',
  condition_expression TEXT NOT NULL DEFAULT '',
  action_template TEXT NOT NULL DEFAULT '{}',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  conflict_key TEXT NOT NULL DEFAULT '',
  conflict_status TEXT NOT NULL DEFAULT 'clear',
  owner TEXT NOT NULL DEFAULT 'knowledge_governance_owner',
  priority TEXT NOT NULL DEFAULT 'P1',
  lifecycle_status TEXT NOT NULL DEFAULT 'draft',
  workflow_id TEXT NOT NULL DEFAULT '',
  reviewer TEXT NOT NULL DEFAULT '',
  review_note TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'local_user',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_rules_source ON knowledge_rules(source_domain_id, source_card_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_rules_target ON knowledge_rules(target_object_type, lifecycle_status, priority);
CREATE INDEX IF NOT EXISTS idx_knowledge_rules_conflict ON knowledge_rules(conflict_key, conflict_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_rules_workflow ON knowledge_rules(workflow_id);

CREATE TABLE IF NOT EXISTS knowledge_rule_conflicts (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  conflicting_rule_id TEXT NOT NULL,
  conflict_type TEXT NOT NULL DEFAULT 'same_target_condition',
  conflict_detail TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_rule_conflicts_rule ON knowledge_rule_conflicts(rule_id, status);
CREATE INDEX IF NOT EXISTS idx_knowledge_rule_conflicts_peer ON knowledge_rule_conflicts(conflicting_rule_id, status);
