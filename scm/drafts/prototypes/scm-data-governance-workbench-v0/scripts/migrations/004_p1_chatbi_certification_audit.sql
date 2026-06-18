ALTER TABLE chatbi_contexts ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE chatbi_contexts ADD COLUMN reviewer TEXT NOT NULL DEFAULT '';
ALTER TABLE chatbi_contexts ADD COLUMN review_note TEXT NOT NULL DEFAULT '';
ALTER TABLE chatbi_contexts ADD COLUMN certified_at TEXT NOT NULL DEFAULT '';
ALTER TABLE chatbi_contexts ADD COLUMN workflow_id TEXT NOT NULL DEFAULT '';

UPDATE chatbi_contexts
SET created_at = COALESCE(NULLIF(created_at, ''), CURRENT_TIMESTAMP),
    updated_at = COALESCE(NULLIF(updated_at, ''), CURRENT_TIMESTAMP)
WHERE created_at = '' OR updated_at = '';

CREATE INDEX IF NOT EXISTS idx_chatbi_contexts_policy ON chatbi_contexts(answer_policy, status);
CREATE INDEX IF NOT EXISTS idx_chatbi_contexts_source_message ON chatbi_contexts(source_message_id);
CREATE INDEX IF NOT EXISTS idx_chatbi_contexts_status ON chatbi_contexts(status, metric_id, answer_policy);
CREATE INDEX IF NOT EXISTS idx_audit_events_type_actor ON audit_events(event_type, actor, created_at);
