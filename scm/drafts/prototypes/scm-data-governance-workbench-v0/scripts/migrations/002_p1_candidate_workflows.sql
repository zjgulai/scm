ALTER TABLE workflow_instances ADD COLUMN title TEXT NOT NULL DEFAULT '';
ALTER TABLE workflow_instances ADD COLUMN source_ref TEXT NOT NULL DEFAULT '';
ALTER TABLE workflow_instances ADD COLUMN module_id TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS governance_candidates (
  id TEXT PRIMARY KEY,
  candidate_type TEXT NOT NULL,
  candidate_code TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  target_asset_type TEXT NOT NULL DEFAULT '',
  target_asset_id TEXT NOT NULL DEFAULT '',
  proposal_summary TEXT NOT NULL,
  proposed_payload TEXT NOT NULL DEFAULT '{}',
  source_ref TEXT NOT NULL DEFAULT '',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  owner TEXT NOT NULL DEFAULT 'data_governance',
  priority TEXT NOT NULL DEFAULT 'P1',
  lifecycle_status TEXT NOT NULL DEFAULT 'review_pending',
  workflow_id TEXT NOT NULL DEFAULT '',
  reviewer TEXT NOT NULL DEFAULT '',
  review_note TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'local_user',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_governance_candidates_type ON governance_candidates(candidate_type, lifecycle_status, priority);
CREATE INDEX IF NOT EXISTS idx_governance_candidates_target ON governance_candidates(target_asset_type, target_asset_id, lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_governance_candidates_workflow ON governance_candidates(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status, priority, owner);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_module ON workflow_instances(module_id, workflow_type, status);
