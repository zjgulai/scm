---
name: codex-skills-create-skills
description: Use when the user asks to create, revise, review, or publish Agent Skills for Codex or Cursor, or asks about SKILL.md frontmatter, compatibility, add-skill/openskills installation, and skill authoring standards. 触发词：创建 skill、写 SKILL、Agent Skills 规范、frontmatter、add-skill、openskills。
---

# Codex Skills Build Guide

本 Skill 融合三类能力：开放标准合规、可发现性优化（CSO）、以及严格的 TDD 验证流程（Iron Law）。

## When to Use / 何时使用

- 用户需要创建、修改或发布 Skill（Codex / Cursor）。
- 用户询问 `SKILL.md` 结构、frontmatter 字段、目录布局或安装方式。
- 用户希望从现有文档/流程提炼成可复用 Skill。

## When Not to Create / 何时不该创建

- 一次性任务、不可复用问题。
- 纯项目局部约定（优先放 `AGENTS.md` 或项目规范）。
- 可被 lint/regex/hook 完全自动化的机械性约束。

## Skill Types / Skill 类型

| Type | Definition | Typical Use |
|------|------------|-------------|
| `Technique` | 有明确步骤的方法 | 调试流程、图表制作流程 |
| `Pattern` | 思维框架或决策模型 | 归因方法、拆解框架 |
| `Reference` | 可检索知识库 | API 速查、字段规范 |

类型决定测试方法与正文自由度：`Technique` 偏流程，`Pattern` 偏判断，`Reference` 偏检索。

## Core Structure / 核心结构

最小结构：

```text
skill-name/
└── SKILL.md
```

推荐结构：

```text
skill-name/
├── SKILL.md
├── reference.md
├── examples.md
└── scripts/
```

规则：
- 主文件 `SKILL.md` 保持 `< 500` 行。
- 引用保持一层深度（`SKILL.md -> reference.md / examples.md`）。
- 重型内容移到 `reference.md`，示例与对比移到 `examples.md`。

## CSO Critical Rule / 可发现性关键规则

### Description must describe trigger, not workflow

`description` 的职责是“什么时候应该加载这个 Skill”，不是“这个 Skill 的流程摘要”。

Bad:

```yaml
description: Build skills in four phases: plan, write, validate, publish.
```

Good:

```yaml
description: Use when creating or reviewing SKILL.md, frontmatter, publishing, or installation workflows.
```

如果在 description 中写入 workflow，agent 可能直接按摘要执行并跳过正文，导致关键步骤漏执行。

## Description Formula / description 公式

```yaml
description: Use when <trigger conditions and symptoms>. 触发词：<keywords>.
```

检查点：
- 第三人称
- 仅写 WHEN（触发条件/症状）
- 含触发词
- 不描述具体执行流程

## Token Efficiency / Token 效率

| Item | Target |
|------|--------|
| 高频加载 Skill | 尽量 `< 200` 词 |
| 普通 Skill 主文件 | `< 500` 行 |
| 重型参考 | 放 `reference.md` |

建议：
- 默认方案写在正文，细节参数放 `reference.md`。
- 一条高质量示例优于多条重复示例。
- 避免大段背景介绍，优先可执行指令。

## Authoring Patterns / 写作模式

### 1) Template Pattern

Bad:

```markdown
Write a report with key points.
```

Good:

```markdown
## Report Template
1. Executive Summary
2. Findings (with data)
3. Actions (owner + timeline)
```

### 2) Examples Pattern

Bad:

```markdown
Provide examples.
```

Good:

```markdown
Input: “Need commit message for auth bug fix”
Output: "fix(auth): resolve token refresh race condition"
```

### 3) Workflow Pattern

Bad:

```markdown
Analyze, then write.
```

Good:

```markdown
1. Gather context
2. Draft minimal frontmatter
3. Write core sections
4. Run validation
```

### 4) Feedback Loop Pattern

Bad:

```markdown
Write once and finish.
```

Good:

```markdown
Write -> Validate -> Fix -> Re-validate (repeat until pass)
```

更多完整示例见 [examples.md](examples.md)。

## Iron Law Testing / 严格测试法

**NO SKILL WITHOUT A FAILING TEST FIRST**

你必须先验证“没有该 Skill 时 agent 会失败”，再写 Skill。
编辑已有 Skill 也一样：先做 RED 基线，再允许修改正文。

### Phase 1: RED (Baseline Failure)

- 不加载目标 Skill，给 subagent 真实任务。
- 记录错误行为与原话（verbatim rationalizations）。
- 提炼失败模式（漏步骤、乱用工具、格式不一致等）。

### Phase 2: GREEN (Minimal Fix)

- 只针对 RED 暴露的问题写最小内容。
- 避免“想当然的全量堆砌”。

### Phase 3: REFACTOR (Close Loopholes)

- 继续施压场景（时间压力、模糊需求、并行任务）。
- 收集新借口并加入反例/约束。
- 重测，直到稳定通过。

### Phase 4: PUBLISH (After Passing Only)

- 仅在测试通过后发布或安装验证。

## Test Strategy by Skill Type / 按类型测试

| Skill Type | Test Input | Pass Criteria |
|------------|------------|---------------|
| `Technique` | 新场景执行题 | 步骤完整且可复现 |
| `Pattern` | 选择题/归因题 | 能识别何时用、何时不用 |
| `Reference` | 检索+应用题 | 能找到正确信息并用对 |

## Build Workflow / 构建工作流

1. **Plan**：定义用途、类型、触发词、放置路径。
2. **Write**：写最小可用 `SKILL.md`（小而准）。
3. **Test**：执行 RED -> GREEN -> REFACTOR。
4. **Publish**：验证安装与可发现性。

## Publishing Checklist / 发布前清单

- [ ] `name` 与目录命名一致、格式合法。
- [ ] `description` 只写触发条件，不写流程摘要。
- [ ] `SKILL.md` < 500 行，引用一层深度。
- [ ] 经过 RED -> GREEN -> REFACTOR 验证。
- [ ] 安装路径、安装命令与兼容性说明清楚。

## Convert Existing Content to Skill / 从现有内容提炼 Skill

从原始文档提炼时，按此最小流程：

1. 判定类型（Technique / Pattern / Reference）。
2. 提取触发词（用户会怎么提问）。
3. 产出 description（仅 WHEN + 触发词，不写 workflow）。
4. 将重型说明移到 `reference.md`，正文保留执行主线。
5. 用压力场景做 RED 测试后再发布。

详细映射表与字段兼容性见 [reference.md](reference.md)。

## Resources / 附加资源

- 规范与字段、兼容性、安装路径：见 [reference.md](reference.md)
- 完整模板、好坏对比、压力测试模板：见 [examples.md](examples.md)
