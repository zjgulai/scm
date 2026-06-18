ALTER TABLE action_tasks ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
ALTER TABLE action_tasks ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';

UPDATE action_tasks
SET created_at = COALESCE(NULLIF(created_at, ''), CURRENT_TIMESTAMP),
    updated_at = COALESCE(NULLIF(updated_at, ''), CURRENT_TIMESTAMP)
WHERE created_at = '' OR updated_at = '';

CREATE INDEX IF NOT EXISTS idx_action_tasks_status ON action_tasks(status, owner);

CREATE TABLE IF NOT EXISTS action_task_transitions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'local_user',
  note TEXT NOT NULL DEFAULT '',
  evidence TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_action_task_transitions_task ON action_task_transitions(task_id, created_at);
