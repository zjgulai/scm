# 卓越商业分析专家AI SaaS

## 项目架构：主体 + 支撑体系

本项目以 **main_project_lute** 为核心（产品名：卓越商业分析专家AI SaaS），其他目录均为支撑服务。

```
ecom_ana_overview/
├── main_project_lute/              # ⭐ 主体项目：数智决策-AI效能作战室
│   ├── 项目总览/                    # 顶层规划文档 + KPI
│   ├── Phase1_故事线与智能体/       # 业务逻辑设计（已完成）
│   ├── Phase2_MVP_开发/            # MVP实施 ✅ 专题② + 交叉线3
│   ├── Phase3_全专题与运营化/       # 完整上线计划
│   ├── 全局数据资源整合/            # 数据架构（已完成）
│   ├── agent/                      # 意图解析 + Skill 路由
│   ├── engine/                     # 数据处理 + Skill 加载
│   ├── output/                     # PPT/报告/图表生成
│   ├── pipelines/                   # 分析管道脚本（核心执行层）
│   ├── phase2_mock/                # Phase2 Mock数据
│   ├── phase2_outputs/             # Phase2 产出结果
│   ├── phase3_mock/                # Phase3 Mock数据
│   └── phase3_outputs/             # Phase3 产出结果
│
├── skills/cross_border_ecommerce/  # 39个分析Skills库
├── skills/mckinsey_ppt/           # 20个PPT图表Skills
├── .cursor/skills/                # 7个业务专项Skills
├── .claude/skills/                # 34个工作流Skills（Claude Code入口）
├── .agents/skills/                # 34个工作流Skills（Agent/OpenSkills入口）
├── scm/                           # 供应链分析子项目
├── knowledge_base/                # 知识萃取参考资料
├── ref/                           # 书籍、数据字典、报告参考
├── configs/                       # 项目配置
├── docs/                          # 架构决策、API、工作流文档
├── drafts/                        # 分析草案和临时文件
├── archive/                       # 归档
└── tests/                         # 测试套件
```

---

## 自动Skills查找机制

当用户询问数据分析相关问题时，**必须首先**使用Skills搜索工具查找相关的Skills。

```bash
python3 skills/cross_border_ecommerce/skills_index.py "用户的查询内容"
```

### 工作流程

1. **用户提问** → 例如: "帮我做指标归因分析"
2. **自动搜索Skills** → 执行搜索命令
3. **阅读相关SKILL.md** → 使用Read工具读取匹配的Skills
4. **应用Skill方法论** → 按照Skill指导进行分析

### 关键词到Skills映射

| 关键词 | 推荐Skills |
|--------|-----------|
| 归因、贡献度、因素分解 | contribution-calculation, complex-contribution |
| 偏微分、全微分、弹性系数 | complex-contribution |
| 毛利率、毛利 | margin-attribution |
| 同比、环比、趋势 | yoy-mom-analysis |
| 用户、客户、分群、RFM | customer-segmentation |
| 留存、群组、LTV | cohort-analysis |
| 漏斗、转化 | conversion-funnel |
| 广告、营销 | ad-attribution, ad-performance-analysis |
| 渠道、流量 | channel-effect-analysis, traffic-source-analysis |
| 异常、监控、预警 | anomaly-detection, alert-management |
| 库存、供应商 | inventory-optimization, supplier-performance |
| 风险 | risk-warning-system |
| 定价、价格 | pricing-optimization |
| A/B测试、因果 | ab-testing, causal-inference |

---

## 项目概述

**主体项目**：main_project_lute（卓越商业分析专家AI SaaS）

面向60-80亿规模母婴出海企业（Momcozy）的「数智决策-AI效能作战室」，整合4大专题×14子课题与5+1智能体。

**当前进度**：
- Phase1 业务逻辑设计 ✅
- Phase2 MVP ✅ (专题② + 交叉线3)
- Phase3 全专题 ✅

---

## 🚀 快速运行

```bash
cd /Users/pray/project/ecom_ana_overview

# Phase2 MVP
python main_project_lute/pipelines/scripts/phase2/generate_phase2_mock_data.py
python main_project_lute/pipelines/scripts/phase2/run_phase2_topic2_pipeline.py
python main_project_lute/pipelines/scripts/phase2/run_phase2_crossline3_pipeline.py
python main_project_lute/pipelines/scripts/phase2/run_phase2_crossline3_voc_agent.py
python main_project_lute/pipelines/scripts/phase2/build_phase2_ppt.py

# Phase3 专题① VOC
python main_project_lute/pipelines/scripts/phase3/generate_phase3_topic1_voc_mock.py
python main_project_lute/pipelines/scripts/phase3/run_phase3_topic1_voc_pipeline.py
python main_project_lute/pipelines/scripts/phase3/build_phase3_topic1_ppt.py

# Phase3 专题③ 渠道
python main_project_lute/pipelines/scripts/phase3/generate_phase3_topic3_channel_mock.py
python main_project_lute/pipelines/scripts/phase3/run_phase3_topic3_channel_pipeline.py
python main_project_lute/pipelines/scripts/phase3/build_phase3_topic3_ppt.py

# Phase3 专题④ 营销
python main_project_lute/pipelines/scripts/phase3/run_phase3_topic4_marketing_pipeline.py
python main_project_lute/pipelines/scripts/phase3/build_phase3_topic4_ppt.py
```

**产出目录**：
- `main_project_lute/phase2_mock/` - Mock数据
- `main_project_lute/phase2_outputs/topic2/` - 专题②中间结果
- `main_project_lute/phase2_outputs/crossline3_voc/` - VOC双重视图结论
- `main_project_lute/phase2_outputs/Phase2_MVP_汇报.pptx` - 管理层汇报PPT
- `ref/phase2_io/` - VOC输入表

**详细状态**：`main_project_lute/Phase2_MVP_开发/PHASE2_STATUS.md` | `main_project_lute/Phase3_全专题与运营化/PHASE3_STATUS.md`

**主要能力**:
- VOC全域洞察（货架内外+竞品）
- 订单质量提升（成本+毛利+退款归因）
- 渠道健康度（国家×渠道生命周期）
- 营销ROI量化（LTV+活动类型）

---

## PPT 图表 & AI 汇报相关 Skills（mckinsey_ppt_skills）

当你需要**选择图表类型、设计麦肯锡风格 PPT、生成复合/多维图表**时：

- 选图层：`skills/mckinsey_ppt/skills/04-chart-selection/chart-type-guide/SKILL.md`
- 复合图：`skills/mckinsey_ppt/skills/05-chart-creation/combination-chart/SKILL.md`
- 多维图：`skills/mckinsey_ppt/skills/05-chart-creation/multi-dimensional-charts/SKILL.md`
- 专家入口：`skills/mckinsey_ppt/skills/00-expert-entry/mckinsey-ppt-multidim-chart-expert/SKILL.md`

---

## 项目级 Skills（.cursor/skills）

- `book-knowledge-extraction/SKILL.md` — 双引擎知识萃取：对书籍按「结构还原→思维模型迁移→行为内化」三阶段输出。触发词：萃取书籍、读书笔记、思维模型。
- `gamma-executive-ppt-generation/SKILL.md` — 将分析报告转为 Gamma 管理层 PPT，含逐页 Prompt 与演讲稿。触发词：Gamma PPT、管理层汇报 PPT。
- `kpi-smart-monthly-goal/SKILL.md` — 月度 KPI SMART 化制定，含指标口径、考核标准与交付表格。触发词：月度 KPI、SMART 目标。
- `momcozy-margin-analysis/SKILL.md` — Momcozy 专项毛利率/毛利额归因分析：按 MAT/YTD 时间窗口、平台×区域×品线做分解，输出瀑布图与 PPT 结论。触发词：毛利率归因、以价换量、费用结构分析。
- `momcozy-product-line-basket-reporting/SKILL.md` — Momcozy 专项品线/购物篮报告：基于关联规则生成「典型组合↔需求场景」表与 PPT。触发词：购物篮分析、连带购买、搭售策略。
- `supply-chain-indicator-decoding/SKILL.md` — 供应链北极星指标、MECE 指标树、L0-L3 解码与责任人映射。触发词：供应链指标、北极星、L0-L3、指标解码。
- `supply-chain-solution-storyline/SKILL.md` — 供应链诊断→管理层故事线、评估报告、启动会叙事。触发词：供应链方案、管理层叙事、启动会。

---

## Data Agent 架构（main_project_lute/）

```
用户输入 → agent/intent_parser.py（意图解析）
        → agent/skills_router.py（Skill 路由）
        → engine/data_processor.py（数据处理）
        → output/ppt_generator.py（PPT 生成）
        → output/report_assembler.py（报告组装）
```

入口：`main_project_lute/test_agent.py` 或 `main_project_lute/run_agent.py`

---

## 外部参考

- 知识库：`knowledge_base/data_ability/` — 数据分析专业知识
- 品牌竞品：`knowledge_base/insights/maternal_brand/` — Momcozy 母婴品牌研究
- 归因分析：`knowledge_base/reason_analysis/` — 归因方法论
- 数据字典：`ref/data_index/存量BI数据指标字典.md`
- 行业报告：`ref/data_report/`
- 公司信息：`ref/company_info/`
- 供应链：`scm/` — 供应链成本指标全链路优化子项目
