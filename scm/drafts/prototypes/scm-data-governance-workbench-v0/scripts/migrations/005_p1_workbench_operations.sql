CREATE TABLE IF NOT EXISTS workbench_operations (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  target_asset_type TEXT NOT NULL DEFAULT '',
  target_asset_ids TEXT NOT NULL DEFAULT '[]',
  operation_title TEXT NOT NULL,
  operation_summary TEXT NOT NULL,
  operation_payload TEXT NOT NULL DEFAULT '{}',
  owner TEXT NOT NULL DEFAULT 'data_governance',
  priority TEXT NOT NULL DEFAULT 'P1',
  status TEXT NOT NULL DEFAULT 'review_pending',
  workflow_id TEXT NOT NULL DEFAULT '',
  reviewer TEXT NOT NULL DEFAULT '',
  review_note TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'local_user',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workbench_operations_module ON workbench_operations(module_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_workbench_operations_type ON workbench_operations(operation_type, status);
CREATE INDEX IF NOT EXISTS idx_workbench_operations_workflow ON workbench_operations(workflow_id);
