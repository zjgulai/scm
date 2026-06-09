# Claude Skills 发布工作区

本目录是普通发布工作区，不再作为嵌套 Git 仓库维护。

## 当前发布包

| Skill | 来源 | 用途 |
|---|---|---|
| `codex-skills-create-skills/` | `.agents/skills/ClaudeSkillsCreateSkills/` | 创建、审查、发布 Agent Skills |

## 重建规则

1. 项目内可用 Skill 以 `.agents/skills/` 为当前源。
2. 发布目录只保留需要对外分发的 Skill 包和发布说明。
3. 不在本目录内保留 `.git/`，避免主仓库出现嵌套 Git 边界。
4. 若需要重新发布到 GitHub，在主仓外部创建独立仓库或使用明确的 submodule。

## 发布前校验

```bash
cd _publish_claude_skills/codex-skills-create-skills
./scripts/validate-skill.sh
```

## 历史备份

本次重建前的完整目录已备份到 `~/.Codex/file-history/`。
