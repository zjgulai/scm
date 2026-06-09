# McKinsey PPT Skills 复用工作流

## 工作流

1. 用 `skills_index.py` 搜索需求关键词。
2. 先走专家入口或选型类 Skill，明确图表/结构。
3. 再切到制作类或业务类 Skill 生成内容。
4. 使用 `trigger-evals.json` 检查触发边界是否准确。
5. 输出时统一采用结论先行标题和可追溯数据来源。

## 触发测试建议

- 每次调整 `description` 后，至少回归检查:
  - 2 条 should_trigger 样例
  - 2 条 should_not_trigger 样例
- 如果误触发率上升，优先收紧 `description` 的边界词。

## 版本升级建议

- v3.x: 保持元数据与索引稳定
- v4.x: 引入质量审核类 skills（09-quality-review）
- v5.x: 拆分可发布 skill 包并提供安装说明
