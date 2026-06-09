# 发布工作区重建摘要

## 重建时间

2026-06-02

## 重建原因

原 `_publish_claude_skills/` 是嵌套 Git 仓库，混在主项目目录内会造成版本管理边界不清。当前项目将其重建为普通发布目录。

## 当前结构

```text
_publish_claude_skills/
├── README.md
├── SUMMARY.md
├── LICENSE
└── codex-skills-create-skills/
    ├── SKILL.md
    ├── reference.md
    ├── examples.md
    ├── .openskills.json
    └── scripts/
```

## 源目录

`codex-skills-create-skills/` 来自 `.agents/skills/ClaudeSkillsCreateSkills/`，发布目录名已按 `SKILL.md` 的 `name` 规范化为 kebab-case。

## 后续决策

如需对外发布，使用外部独立仓库或显式 submodule，不再在主仓内直接维护嵌套 `.git`。
