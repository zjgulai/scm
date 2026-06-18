CREATE TABLE IF NOT EXISTS kpi_canvas_nodes (
  id TEXT PRIMARY KEY,
  metric_id TEXT NOT NULL,
  parent_metric_id TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  l1_domain TEXT NOT NULL DEFAULT '',
  x REAL NOT NULL DEFAULT 0,
  y REAL NOT NULL DEFAULT 0,
  width REAL NOT NULL DEFAULT 220,
  height REAL NOT NULL DEFAULT 88,
  collapsed INTEGER NOT NULL DEFAULT 0,
  layout_version TEXT NOT NULL DEFAULT 'p0-auto-layout-v1',
  status TEXT NOT NULL DEFAULT 'active',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kpi_canvas_nodes_metric ON kpi_canvas_nodes(metric_id);
CREATE INDEX IF NOT EXISTS idx_kpi_canvas_nodes_level ON kpi_canvas_nodes(level, l1_domain);

INSERT OR IGNORE INTO kpi_canvas_nodes (
  id,
  metric_id,
  parent_metric_id,
  level,
  code,
  name,
  l1_domain,
  x,
  y,
  width,
  height,
  collapsed,
  layout_version,
  status,
  updated_at
)
SELECT
  'canvas_' || m.id,
  m.id,
  COALESCE((
    SELECT kt.parent_metric_id
    FROM kpi_tree kt
    WHERE kt.child_metric_id = m.id
    LIMIT 1
  ), ''),
  m.level,
  m.code,
  m.name,
  m.l1_domain,
  CASE m.level
    WHEN 'L0' THEN 64
    WHEN 'L1' THEN 344
    WHEN 'L2' THEN 624
    ELSE 904
  END,
  56 + ((ROW_NUMBER() OVER (PARTITION BY m.level ORDER BY m.l1_domain, m.l2_group, m.code) - 1) * 112),
  CASE m.level WHEN 'L0' THEN 240 ELSE 220 END,
  88,
  CASE WHEN m.level IN ('L2', 'L3') THEN 1 ELSE 0 END,
  'p0-auto-layout-v1',
  'active',
  CURRENT_TIMESTAMP
FROM metrics m;

CREATE TABLE IF NOT EXISTS quality_rules (
  id TEXT PRIMARY KEY,
  rule_code TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  rule_expression TEXT NOT NULL,
  expected_behavior TEXT NOT NULL,
  owner TEXT NOT NULL DEFAULT 'data_governance',
  lifecycle_status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_rules_asset ON quality_rules(asset_type, asset_id, lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_quality_rules_severity ON quality_rules(severity, lifecycle_status);

CREATE TABLE IF NOT EXISTS quality_issues (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  issue_title TEXT NOT NULL,
  issue_detail TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  detected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  owner TEXT NOT NULL DEFAULT 'data_governance',
  evidence TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (rule_id) REFERENCES quality_rules(id)
);

CREATE INDEX IF NOT EXISTS idx_quality_issues_rule ON quality_issues(rule_id, status);
CREATE INDEX IF NOT EXISTS idx_quality_issues_asset ON quality_issues(asset_type, asset_id, status);
