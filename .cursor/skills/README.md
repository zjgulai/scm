# 项目级 Skills 索引（统一标准版）

本目录是项目级专项 Skills。当前共 7 个，全部按统一结构维护：

- `SKILL.md`：入口说明（WHEN-only 触发 + 核心流程）
- `reference.md`：重型模板与长规则
- `examples.md`：典型输入输出样例
- `trigger-evals.json`：触发/误触评测样例

## 一、Skills 清单

### A. 内容专项

1. `book-knowledge-extraction`
- 用途：书籍/长文的结构萃取、模型迁移、行为转化。
- 典型触发词：读书笔记、知识萃取、思维模型、行为转化。

### B. Momcozy 业务专项

2. `momcozy-margin-analysis`
- 用途：专题01/专题02 的毛利与费率归因、前后台成本拆解。
- 典型触发词：毛利率归因、前台后台成本、Amazon vs 独立站。

3. `momcozy-product-line-basket-reporting`
- 用途：专题05 购物篮关联 + 专题01 品线组合营销故事线。
- 典型触发词：Sheet⑤⑥⑦⑧、支持度置信度提升度、组合场景。

### C. 供应链方案专项

4. `supply-chain-solution-storyline`
- 用途：将诊断结果重构为管理层故事线、评估报告、拍板材料。
- 典型触发词：36%成本率、方案评估、故事线、拍板事项。

5. `supply-chain-indicator-decoding`
- 用途：北极星指标树、L0-L3 解码、执行指标与约束对。
- 典型触发词：指标树、战略解码、L0/L1/L2/L3、熔断规则。

6. `gamma-executive-ppt-generation`
- 用途：将已有分析转换为 Gamma 管理层 deck Prompt 体系。
- 典型触发词：Gamma、逐页Prompt、补丁Prompt、演讲稿。

7. `kpi-smart-monthly-goal`
- 用途：将月度KPI改写为SMART、管理层可读版本，并可落地到Excel模板。
- 典型触发词：KPI重写、SMART、指标类型、统计口径、写入Excel模板。

## 二、推荐调用顺序（经营改善主链路）

1. `supply-chain-solution-storyline`：先把问题讲清楚（怎么讲）
2. `supply-chain-indicator-decoding`：再把目标拆到执行层（怎么拆）
3. `gamma-executive-ppt-generation`：最后转成 AI deck（怎么生成）

## 三、目录和数据路径约定

与 `main_project_lute/data_example` 新结构保持一致：

- 原始数据：`main_project_lute/data_example/原始数据/`
- 专题产物：`main_project_lute/data_example/专题产物/专题01~专题05/`
- 执行脚本：`main_project_lute/data_example/scripts/core/`、`main_project_lute/data_example/scripts/sheet10/`

不再使用旧路径：`data_example/data`、`data_example/docs`、`data_example/outputs`。

## 四、维护规范

- frontmatter `description` 采用 WHEN-only（触发条件导向）
- 主文件保持简洁，重型内容放 `reference.md`
- 每次调整边界时同步更新 `trigger-evals.json`
- 新增 skill 时保持同样四件套结构
