CREATE TABLE IF NOT EXISTS ai_question_samples (
  id TEXT PRIMARY KEY,
  question_text TEXT NOT NULL,
  sample_type TEXT NOT NULL DEFAULT 'standard',
  target_asset_type TEXT NOT NULL DEFAULT '',
  target_asset_id TEXT NOT NULL DEFAULT '',
  domain_ids TEXT NOT NULL DEFAULT '[]',
  expected_answerability TEXT NOT NULL DEFAULT 'partial',
  source_message_id TEXT NOT NULL DEFAULT '',
  source_context TEXT NOT NULL DEFAULT '{}',
  evidence_refs TEXT NOT NULL DEFAULT '[]',
  quality_score REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  owner TEXT NOT NULL DEFAULT 'semantic_governance',
  created_by TEXT NOT NULL DEFAULT 'local_user',
  reviewer TEXT NOT NULL DEFAULT '',
  review_note TEXT NOT NULL DEFAULT '',
  workflow_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_answer_feedback (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL DEFAULT '',
  message_id TEXT NOT NULL DEFAULT '',
  question_text TEXT NOT NULL,
  rating TEXT NOT NULL,
  feedback_text TEXT NOT NULL DEFAULT '',
  answerability TEXT NOT NULL DEFAULT '',
  answerability_score REAL NOT NULL DEFAULT 0,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  source_context TEXT NOT NULL DEFAULT '{}',
  workflow_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'review_pending',
  created_by TEXT NOT NULL DEFAULT 'local_user',
  reviewer TEXT NOT NULL DEFAULT '',
  review_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_question_samples_status ON ai_question_samples(status, sample_type, updated_at);
CREATE INDEX IF NOT EXISTS idx_ai_question_samples_target ON ai_question_samples(target_asset_type, target_asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_answer_feedback_status ON ai_answer_feedback(status, rating, updated_at);
CREATE INDEX IF NOT EXISTS idx_ai_answer_feedback_message ON ai_answer_feedback(message_id);
