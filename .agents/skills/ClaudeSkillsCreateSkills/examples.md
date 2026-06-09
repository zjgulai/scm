# Examples: Good vs Bad, Templates, and Pressure Tests

## 1) Complete Reusable Skill Example

Directory:

```text
release-readiness/
├── SKILL.md
├── reference.md
└── examples.md
```

`SKILL.md`:

```markdown
---
name: release-readiness
description: Evaluate whether a feature is ready for release. Use when preparing a release, final QA signoff, or when the user asks for go/no-go checks.
---

# Release Readiness

## When to Use
- Before merging high-impact PRs
- Before production deployment

## Workflow
1. Verify tests and critical checks
2. Confirm rollback strategy
3. Validate monitoring and alerts
4. Produce go/no-go conclusion

## Checklist
- [ ] Critical tests passed
- [ ] Rollback command verified
- [ ] Observability checks defined
- [ ] Risk owner assigned
```

## 2) Description Good vs Bad (5 groups)

### Group A: Workflow leakage

Bad:

```yaml
description: Build skills in four phases: plan, write, validate, publish.
```

Good:

```yaml
description: Use when creating or revising SKILL.md files, frontmatter, and publishing workflows.
```

### Group B: First-person wording

Bad:

```yaml
description: I can help you write skills.
```

Good:

```yaml
description: Use when users need standards-compliant skill authoring for Claude Code or Cursor.
```

### Group C: Missing trigger terms

Bad:

```yaml
description: Handles documentation quality.
```

Good:

```yaml
description: Improve SKILL.md quality. Use when users mention skill authoring, frontmatter, or add-skill installation.
```

### Group D: Too broad

Bad:

```yaml
description: Use for anything related to development.
```

Good:

```yaml
description: Use when converting process docs into reusable Agent Skills with clear triggers and validation checks.
```

### Group E: No WHAT/WHEN structure

Bad:

```yaml
description: Skill creation helper.
```

Good:

```yaml
description: Use when users ask to create skills from docs, define frontmatter, or publish skill repos.
```


### Group F: Shortcut failure mode (real)

Bad:

```yaml
description: Use when creating skills in 4 phases (plan, write, test, publish).
```

Risk:

```text
Agent may follow this short summary and skip detailed rules in SKILL.md.
```

Good:

```yaml
description: Use when users ask to create/review/publish skills or troubleshoot skill authoring quality.
```

## 3) Token Efficiency Good vs Bad

### Case 1: Verbose background

Bad:

```markdown
PDF files are a common format used for many years and have many internal structures...
```

Good:

```markdown
Use `pdfplumber` for text extraction. API details in `reference.md`.
```

### Case 2: Repeated examples

Bad:

```markdown
Example 1 ...
Example 2 ...
Example 3 ...
Example 4 ...
Example 5 ...
```

Good:

```markdown
Provide one strong canonical example and one edge case.
```

### Case 3: Repeating other skills

Bad:

```markdown
Reprint the whole TDD methodology inline.
```

Good:

```markdown
Reference the TDD skill and include only this skill-specific constraints.
```

## 4) Pattern Good vs Bad

### Template Pattern

Bad:

```markdown
Write your report clearly.
```

Good:

```markdown
## Report Template
1) Executive Summary
2) Evidence
3) Actions
```

### Workflow Pattern

Bad:

```markdown
Do analysis and then write output.
```

Good:

```markdown
1. Gather context
2. Define scope
3. Draft output
4. Validate against checklist
```

### Feedback Loop Pattern

Bad:

```markdown
Write once and finalize.
```

Good:

```markdown
Draft -> Validate -> Fix -> Re-test -> Finalize
```

## 5) Pressure Test Templates (Iron Law)

### RED Baseline Prompt

```text
You are asked to create a new Skill from this process doc.
Constraints are intentionally incomplete.
Deliver directly without asking follow-up questions.
```

Observe:
- 是否跳过触发词设计
- 是否把 workflow 写进 description
- 是否缺失校验清单

### GREEN Verification Prompt

```text
Now follow the updated skill-authoring guide and create the same Skill.
You must include: trigger-only description, <500 line main file, and validation checklist.
```

Observe:
- 是否遵守触发条件写法
- 是否分层到 reference/examples
- 是否形成可执行检查项

### REFACTOR Stress Prompt

```text
Time pressure: deliver in one pass, no extra files allowed.
Also include advanced fields and compatibility notes.
```

Expected behavior:
- 不因压力牺牲主文件简洁性
- 将重型内容迁移到 reference.md
- 保留发布前验证环节

## 6) Quick Output Template

```markdown
---
name: <skill-name>
description: Use when <trigger conditions>. 触发词：<keywords>.
---

# <Skill Title>

## When to Use
- ...

## Workflow
1. ...
2. ...

## Checklist
- [ ] ...

## Resources
- [reference.md](reference.md)
- [examples.md](examples.md)
```
