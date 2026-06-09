---
title: "McKinsey PPT Skills 导航与复用说明"
doc_type: workflow
module: "skills-mckinsey-ppt"
topic: "SKILLS-NAVIGATION"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# McKinsey PPT Skills 导航与复用说明

## 1. 如何选择 Skill

### A. 不确定做什么图
- 先用: `mckinsey-ppt-multidim-chart-expert`
- 再下钻: `mckinsey-chart-type-guide` / `mckinsey-chart-classification`

### B. 已确定图表类型，进入实现
- 基础图: `mckinsey-bar-chart` / `mckinsey-donut-chart` / `mckinsey-stacked-chart`
- 复合图: `mckinsey-combination-chart`
- 多维分析图: `mckinsey-multi-dimensional-charts`
- 代码实现: `chartify-chart-generation`

### C. 先搭汇报逻辑再画图
- 观点提炼: `mckinsey-core-insight`
- 逻辑结构: `mckinsey-pyramid-principle`
- 页面模板: `mckinsey-slide-template`
- 结论表达: `mckinsey-conclusion-first`

### D. 业务专题场景
- 母婴跨境: `mckinsey-maternal-ecommerce-charts`
- 消费者分析: `mckinsey-consumer-analysis-charts`
- 品牌健康度: `mckinsey-brand-health-charts`
- 渠道策略: `mckinsey-channel-strategy-charts`

## 2. 推荐调用顺序

1) 内容与问题定义: `mckinsey-core-insight` + `mckinsey-pyramid-principle`
2) 页面结构: `mckinsey-slide-template`
3) 图表选型: `mckinsey-chart-type-guide` / 专家入口
4) 图表制作: 基础图 / 复合图 / 多维图
5) 表达收口: `mckinsey-conclusion-first`

## 3. 复用资产说明

每个 Skill 目录当前统一包含:
- `SKILL.md`: 主说明
- `reference.md`: 速查与扩展
- `trigger-evals.json`: 触发/不触发样例

## 4. 维护规则

- 新增 Skill 后必须同步更新 `README.md` 与 `skills_index.py`。
- 新增 Skill 必须提供 `trigger-evals.json`。
- 目录名必须与 frontmatter `name` 一致。
