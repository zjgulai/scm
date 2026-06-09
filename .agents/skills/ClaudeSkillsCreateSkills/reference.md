# Reference: Agent Skills Spec, Compatibility, and Publishing

本文件是 `SKILL.md` 的重型参考，保留完整矩阵与详细速查。

## 1) Frontmatter Fields (Full)

### Required / 推荐必填

| Field | Constraint | Notes |
|------|------------|-------|
| `name` | 1-64 chars, lowercase letters/numbers/hyphens | 建议与目录名一致，避免 `--` |
| `description` | 1-1024 chars | 第三人称；写 WHAT + WHEN；不要写 workflow 摘要 |

### Optional (Agent Skills Spec)

| Field | Notes |
|------|-------|
| `license` | 许可证信息 |
| `compatibility` | 运行环境约束 |
| `metadata` | 扩展键值 |
| `allowed-tools` | 实验字段，按实现支持 |

### Optional (Claude Code Extensions)

| Field | Purpose | Cursor Support |
|------|---------|----------------|
| `argument-hint` | 参数提示 | Partial |
| `disable-model-invocation` | 禁止自动调用，仅手动 | Partial |
| `user-invocable` | 是否在 `/` 菜单显示 | Partial |
| `allowed-tools` | skill 生命周期内工具白名单 | Partial |
| `context: fork` | 在子代理中运行 | No |
| `agent` | 指定子代理类型 | No |
| `hooks` | skill 生命周期钩子 | Partial |

## 2) Compatibility Matrix

| Field | Agent Skills Spec | Claude Code | Cursor |
|------|--------------------|-------------|--------|
| `name` | Required | Required | Required |
| `description` | Recommended | Recommended | Recommended |
| `license` | Optional | Supported | Supported |
| `compatibility` | Optional | Supported | Supported |
| `metadata` | Optional | Supported | Supported |
| `allowed-tools` | Experimental | Supported | Partial |
| `argument-hint` | N/A | Supported | Partial |
| `disable-model-invocation` | N/A | Supported | Partial |
| `user-invocable` | N/A | Supported | Partial |
| `context: fork` | N/A | Supported | Not supported |
| `agent` | N/A | Supported | Not supported |
| `hooks` | N/A | Supported | Partial |

## 3) Skill Paths by IDE

| IDE | Project Scope | User Scope |
|-----|----------------|------------|
| Claude Code | `.claude/skills/<skill-name>/` | `~/.claude/skills/<skill-name>/` |
| Cursor | `.cursor/skills/<skill-name>/` | `~/.cursor/skills/<skill-name>/` |
| Codex | `.codex/skills/<skill-name>/` | `~/.codex/skills/<skill-name>/` |
| OpenCode | `.opencode/skill/<skill-name>/` | `~/.config/opencode/skill/<skill-name>/` |

注意：`~/.cursor/skills-cursor/` 是 Cursor 内置目录，不用于自定义 Skill。

## 4) Publishing and Installation

### Repository Layout Options

Single-skill repo:

```text
repo-root/
└── SKILL.md
```

Multi-skill repo:

```text
repo-root/
└── skills/
    ├── skill-a/
    │   └── SKILL.md
    └── skill-b/
        └── SKILL.md
```

### Install Commands

```bash
# Install whole repo
npx add-skill <owner>/<repo>

# Install a specific skill
npx add-skill <owner>/<repo> --skill <skill-name>

# Global install
npx add-skill <owner>/<repo> -g

# Alternative installer
npx openskills install <owner>/<repo>
```

### Publish Checklist

- `name` 合法、可检索、与目录命名策略一致。
- `description` 聚焦触发条件，不描述步骤流程。
- 主文件 < 500 行，引用深度一层。
- 通过 RED -> GREEN -> REFACTOR。
- 完成安装验证（至少本地一次）。

## 5) Content Extraction Mapping

### Type Mapping

| Input Content | Recommended Skill Type | Extra Field Suggestion |
|--------------|------------------------|------------------------|
| Coding guideline | `Reference` | none |
| Deployment process | `Technique` | `disable-model-invocation: true` |
| Migration procedure | `Technique` | `argument-hint` |
| Root cause playbook | `Pattern` + `Technique` | none |
| API handbook | `Reference` | examples in `examples.md` |

### Extraction Table

| Extract | Ask This | Place Into |
|--------|----------|------------|
| Core objective | 解决什么问题？ | overview + description WHAT |
| Trigger scenarios | 何时触发？ | description WHEN + usage section |
| Required constraints | 哪些不可违反？ | checklist / guardrails |
| Workflow steps | 最小执行路径？ | workflow section |
| Common mistakes | 常见错误？ | anti-pattern section |
| Evidence/examples | 如何判断好坏？ | examples.md |

## 6) CSO Quick Rules

- Description starts with `Use when...`
- Include search terms users will actually say
- Do not summarize the workflow in description
- Keep high-frequency skills concise
- Keep terminology consistent
