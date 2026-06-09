---
title: "Agent 画像：咨询 PPT & 故事线"
doc_type: knowledge
module: "ref"
topic: "agent-咨询PPT-故事线"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# Agent 画像：咨询 PPT & 故事线

---

## 使命（一句话）

将各 Agent 的结构化结论与故事线转化为管理层可用的咨询风格 PPT 页与叙事，统一版式与数据呈现，支撑汇报与决策。

---

## 主责专题与子课题

- **主责专题**：横切全部专题
- **主责子课题**：全部（不按子课题编号，按汇报模块聚合）

---

## 输入

| 类型 | 表/资产名称 | 关键字段（示例） | 可选参数 |
|------|-------------|------------------|----------|
| 各 Agent 输出 | 专题①～④ 结论摘要、归因表、清单、看板指标 | JSON/表/文本 | 汇报时间范围、受众 |
| 范例与模板 | ref/AIPPT/、mckinsey_ppt_skills | 版式、图表类型、叙事结构 | — |
| 页面模版映射表 | ref/roles_skills/ppt_page_template_mapping.md | module_type, source_type, slide_layout, chart_type, notes | 可按专题/交叉线模块筛选 |
| 交叉故事线产出 | 建议组合、高浓度社区、投放建议等 | 来自交叉线文档 | — |

---

## 调用的 Skills / 脚本

| 能力名称 | 路径/来源 | 调用场景 | 备注 |
|----------|------------|----------|------|
| McKinsey PPT Skills | mckinsey_ppt_skills（或项目内对应 Skill） | 版式、图表、叙事 | 现有可复用或待 Phase 2 接入 |
| ref/AIPPT/ 范例 | ref/AIPPT/ | 页结构、数据到图表的映射 | 若目录存在则复用 |
| build_sheet* 图表 | data_example/scripts/build_sheet3_ppt_charts.py 等 | 专题图表生成 | 现有可复用 |
| 故事线文档 | Phase1_故事线与智能体/专题故事线/*.md | 每页对应的故事线与结论 | 本 Phase 1 产出 |
| PPT 页面模版映射表 | ref/roles_skills/ppt_page_template_mapping.md | 将专题/交叉线模块映射到具体页型与图表类型 | 治理层 Skill，指导自动/半自动出 PPT |

---

## 输出格式

| 输出物 | 格式 | 消费者 |
|--------|------|--------|
| 专题汇报 PPT 页（按专题或按故事线） | PPT / HTML / Markdown | 管理层、汇报 |
| 执行摘要与关键结论页 | 文本 + 图表 | 管理层 |
| 交叉故事线结论页（如 VOC→订单建议） | 图表 + 清单 | 管理层、产品/运营 |

---

## 与 01 矩阵的对应

- **本 Agent 消费的「库表建议」**：不直接消费 01 矩阵表，而是消费**各 Agent 的产出物**（结论摘要、表、清单）；若需从数仓直出图表则可引用与各专题一致的 fact_* / dim_* 表名。
