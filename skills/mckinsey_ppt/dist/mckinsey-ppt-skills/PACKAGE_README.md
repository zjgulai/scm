# McKinsey PPT Skills 产品化发布说明

## 包信息

- Package: `mckinsey-ppt-skills`
- Version: `3.0.0`
- Skills: 20
- 主入口: `mckinsey-ppt-multidim-chart-expert`

## 发布内容

- `skills/`: 全量 skills 目录
- `skills_index.py`: 关键词检索入口
- `README.md`: 使用说明
- `SKILLS_NAVIGATION.md`: 导航与调用顺序
- `REUSE_WORKFLOW.md`: 复用工作流
- `release-manifest.json`: 发布清单
- `scripts/validate_release.py`: 一致性校验
- `scripts/export_skill_pack.py`: 导出可迁移包

## 一键校验

```bash
python3 scripts/validate_release.py
```

## 一键导出

```bash
python3 scripts/export_skill_pack.py
```

导出目录为:

- `dist/mckinsey-ppt-skills/`

## 安装到其他项目（手动迁移）

将导出目录中的 `skills/` 拷贝到目标项目:

- Cursor 项目级: `<target>/.cursor/skills/`
- Claude 项目级: `<target>/.claude/skills/`

并将 `skills_index.py` 与 `SKILLS_NAVIGATION.md` 一并迁移，保持检索与导航可用。

## 版本升级建议

- `3.x`: 保持结构稳定与关键词映射更新
- `4.x`: 补齐 `09-quality-review` 质量审核类技能
- `5.x`: 增加自动化测试回归与发布流水线
