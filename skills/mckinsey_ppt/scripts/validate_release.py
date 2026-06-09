#!/usr/bin/env python3
from pathlib import Path
import json
import re

base = Path(__file__).resolve().parents[1]
skills_root = base / "skills"
manifest_path = base / "release-manifest.json"

errors = []

if not manifest_path.exists():
    errors.append("missing release-manifest.json")
else:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("skill_count") != len(list(skills_root.rglob("SKILL.md"))):
        errors.append("manifest skill_count mismatch")

for sf in skills_root.rglob("SKILL.md"):
    text = sf.read_text(encoding="utf-8")
    if not text.startswith("---"):
        errors.append(f"invalid frontmatter: {sf}")
        continue
    name = re.search(r"^name:\s*(.+)$", text, flags=re.M)
    desc = re.search(r"^description:\s*(.+)$", text, flags=re.M)
    if not name:
        errors.append(f"missing name: {sf}")
        continue
    if sf.parent.name != name.group(1).strip():
        errors.append(f"name-dir mismatch: {sf}")
    if not desc or not desc.group(1).strip().startswith("Use when"):
        errors.append(f"description not Use when: {sf}")
    if not (sf.parent / "reference.md").exists():
        errors.append(f"missing reference.md: {sf.parent}")
    if not (sf.parent / "trigger-evals.json").exists():
        errors.append(f"missing trigger-evals.json: {sf.parent}")

if errors:
    print("VALIDATION FAILED")
    for e in errors:
        print("-", e)
    raise SystemExit(1)

print("VALIDATION OK")
