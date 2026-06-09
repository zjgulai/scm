#!/usr/bin/env python3
from pathlib import Path
import shutil

base = Path(__file__).resolve().parents[1]
out = base / "dist" / "mckinsey-ppt-skills"

if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)

for rel in [
    "skills",
    "skills_index.py",
    "README.md",
    "SKILLS_NAVIGATION.md",
    "REUSE_WORKFLOW.md",
    "release-manifest.json",
    "PACKAGE_README.md",
    "SKILLS_AUDIT_BASELINE.md",
]:
    src = base / rel
    dst = out / rel
    if src.is_dir():
        shutil.copytree(src, dst)
    elif src.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

print(out)
