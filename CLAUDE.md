# 卓越商业分析专家AI SaaS

## 项目架构：主体 + 支撑体系

本项目以 **main_project_lute** 为核心（产品名：卓越商业分析专家AI SaaS），其他目录均为支撑服务。

```
shopify_analysis/
├── main_project_lute/              # ⭐ 主体项目：数智决策-AI效能作战室
│   ├── 项目总览/                    # 顶层规划文档
│   ├── Phase1_故事线与智能体/       # 业务逻辑设计（已完成）
│   ├── Phase2_MVP_开发/            # MVP实施 ✅ 专题② + 交叉线3
│   ├── Phase3_全专题与运营化/       # 完整上线计划
│   └── 全局数据资源整合/            # 数据架构（已完成）
│
├── main_project_lute/phase2_mock/   # Phase2 Mock数据
├── main_project_lute/phase2_outputs/# Phase2 产出结果
│   ├── topic2/                     # 专题②中间结果
│   └── crossline3_voc/            # 交叉线3 VOC结论
│
├── main_project_lute/data_example/  # 数据算法测试项目（验证分析逻辑）
│   ├── data/                      # 数据源
│   ├── scripts/                   # 分析脚本
│   ├── outputs/                   # 产出结果
│   └── docs/                      # 结论文档
│
├── skills/cross_border_ecommerce/  # 39个分析Skills库
├── skills/mckinsey_ppt/           # 20个PPT图表Skills
├── .cursor/skills/                # 聚合型专项Skills
├── knowledge_base/data_ability/    # 知识萃取参考资料
├── knowledge_base/reason_analysis/ # 归因分析参考资料
└── archive/                        # 归档目录
```

---

## 自动Skills查找机制

当用户询问数据分析相关问题时，**必须首先**使用Skills搜索工具查找相关的Skills。

### 使用方法

```bash
# 在回答用户问题之前，先执行搜索
python3 skills/cross_border_ecommerce/skills_index.py "用户的查询内容"
```

### 工作流程

1. **用户提问** → 例如: "帮我做指标归因分析"
2. **自动搜索Skills** → 执行搜索命令
3. **阅读相关SKILL.md** → 使用Read工具读取匹配的Skills
4. **应用Skill方法论** → 按照Skill指导进行分析

### 示例

当用户问: "帮我分析销售额下降的原因"

```bash
# Step 1: 搜索相关Skills
python3 skills/cross_border_ecommerce/skills_index.py "销售额下降原因分析"

# 输出示例:
# 找到 3 个相关Skills:
# 1. cbec-contribution-calculation (贡献度计算)
# 2. cbec-yoy-mom-analysis (同比环比分析)
# 3. cbec-anomaly-detection (异常检测)
```

```bash
# Step 2: 读取最相关的Skill
# Read: skills/cross_border_ecommerce/skills/02-attribution-analysis/contribution-calculation/SKILL.md

# Step 3: 按照Skill方法论进行分析
```

### Skills目录结构

```
skills/cross_border_ecommerce/skills/
├── 00-data-foundation/          # 数据基础
├── 01-financial-analysis/       # 财务分析
├── 02-attribution-analysis/     # 归因分析 ⭐
├── 03-cost-analysis/            # 成本分析
├── 04-product-analysis/         # 产品分析
├── 05-trend-analysis/           # 趋势分析
├── 06-predictive-analysis/      # 预测分析
├── 07-monitoring-analysis/      # 监控分析
├── 08-customer-analysis/        # 客户分析
├── 09-pricing-analysis/         # 定价分析
├── 10-supply-chain-analysis/    # 供应链分析
├── 11-user-behavior-analysis/   # 用户行为分析
├── 12-marketing-analysis/       # 营销分析
├── 13-methodology-analysis/     # 方法论分析
├── 14-reporting-analysis/       # 报告分析
├── 15-campaign-analysis/        # 活动分析
├── 16-channel-analysis/         # 渠道分析 ✨NEW
├── 17-content-analysis/         # 内容分析 ✨NEW
└── 19-risk-analysis/            # 风险分析 ✨NEW
```

### 关键词到Skills映射（快速参考）

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

### Python API使用

```python
import sys
sys.path.insert(0, 'cross_border_ecommerce_skills')
from skills_index import SkillsIndex

# 创建索引
index = SkillsIndex()

# 搜索相关Skills
results = index.search("帮我做指标归因分析")
for r in results:
    print(f"{r['name']}: 相关性 {r['relevance']}")

# 获取Skill完整内容
content = index.get_skill_content('cbec-complex-contribution')
```

---

## 项目概述

**主体项目**：main_project_lute（卓越商业分析专家AI SaaS）

面向60-80亿规模母婴出海企业（Momcozy）的「数智决策-AI效能作战室」，整合4大专题×14子课题与5+1智能体。

**当前进度**：
- Phase1 业务逻辑设计 ✅
- Phase2 MVP 开发中 ✅ (专题② + 交叉线3)
- 专题一/二分析 ✅

---

## 🚀 Phase2 MVP 快速运行

```bash
cd /Users/pray/project/shopify_analysis

# 1. 生成Mock数据
python main_project_lute/data_example/scripts/generate_phase2_mock_data.py

# 2. 运行专题②管道
python main_project_lute/data_example/scripts/run_phase2_topic2_pipeline.py

# 3. 运行交叉线3（订单→VOC）
python main_project_lute/data_example/scripts/run_phase2_crossline3_pipeline.py

# 4. 运行VOC Agent处理
python main_project_lute/data_example/scripts/run_phase2_crossline3_voc_agent.py

# 5. 生成PPT汇报
python main_project_lute/data_example/scripts/build_phase2_ppt.py
```

**产出目录**：
- `main_project_lute/phase2_mock/` - Mock数据
- `main_project_lute/phase2_outputs/topic2/` - 专题②中间结果
- `main_project_lute/phase2_outputs/crossline3_voc/` - VOC双重视图结论
- `main_project_lute/phase2_outputs/Phase2_MVP_汇报.pptx` - 管理层汇报PPT
- `ref/phase2_io/` - VOC输入表

**详细状态**：`main_project_lute/Phase2_MVP_开发/PHASE2_STATUS.md`

**主要能力**:
- VOC全域洞察（货架内外+竞品）
- 订单质量提升（成本+毛利+退款归因）
- 渠道健康度（国家×渠道生命周期）
- 营销ROI量化（LTV+活动类型）

**支撑体系**:
- `skills/cross_border_ecommerce/` - 39个分析Skills库
- `skills/mckinsey_ppt/` - 20个PPT图表Skills
- `main_project_lute/data_example/` - 数据算法测试项目

**主体项目文档**:
- `main_project_lute/数智决策-AI效能作战室-产品与项目规划.md` - 核心规划
- `main_project_lute/项目总览/00_项目蓝图_总规划.md` - 里程碑

---

## PPT 图表 & AI 汇报相关 Skills（mckinsey_ppt_skills）

当你需要**选择图表类型、设计麦肯锡风格 PPT、生成复合/多维图表**时，优先调用 `mckinsey_ppt_skills`：

- 选图层：
  - `skills/04-chart-selection/chart-type-guide/SKILL.md`（按业务问题选图）
  - `skills/04-chart-selection/chart-classification/SKILL.md`（图表类型分类）
- 复合 & 多维图：
  - `skills/05-chart-creation/combination-chart/SKILL.md`（柱+线、柱+饼、面积+线等复合图）
  - `skills/05-chart-creation/multi-dimensional-charts/SKILL.md`（瀑布、增长驱动、竞争转换、价格带等多维分析图）
  - `skills/05-chart-creation/chartify-chart-generation/SKILL.md`（用 Chartify/Bokeh 可靠生成图表）
- 专家入口：
  - `skills/00-expert-entry/ppt-multidim-chart-expert/SKILL.md`（PPT 多维图表分析设计专家，统一入口）

**常见场景 → 推荐路径：**

| 需求                                   | 推荐Skill顺序                                                     |
|----------------------------------------|-------------------------------------------------------------------|
| 做复合图/双轴图/规模+增速              | `ppt-multidim-chart-expert` → `combination-chart` → Chartify 实现 |
| 做归因瀑布图/增长驱动/多维分析         | `ppt-multidim-chart-expert` → `multi-dimensional-charts`         |
| 做母婴/出海主题的业务图表              | `maternal-ecommerce-charts` 等业务应用 Skills                     |
| 需要 AI 自动出图并插入 PPT             | 图表类型 Skill → `chartify-chart-generation` → data_example 脚本 |

---

## 项目级 Skills（.cursor/skills）

项目下还定义了一些**聚合型/专项 Skill**，用于直接驱动复杂分析流程：

- `book-knowledge-extraction/SKILL.md`  
  - 双引擎知识萃取：对书籍或长文按「结构真相还原 → 思维模型迁移 → 行为内化」三阶段输出读书笔记与行动方案。  
  - 触发词：萃取书籍、双引擎萃取、读书笔记、书籍分析、思维模型、行为转化。

- `momcozy-margin-analysis/SKILL.md`（及 `reference.md`）  
  - Momcozy 专项毛利率/毛利额归因分析：按 MAT/YTD 时间窗口、平台×区域×品线/费用项做分解，输出瀑布图与 PPT 结论。  
  - 触发词：毛利率归因、毛利额归因、以价换量、费用结构分析、平台对比、北美/欧洲。

- `momcozy-product-line-basket-reporting/SKILL.md`  
  - Momcozy 专项品线/购物篮报告：基于专题⑤～⑧的关联规则与场景，生成「典型组合↔典型需求场景」表与 PPT。  
  - 触发词：购物篮分析、连带购买、品线组合、搭售策略、需求场景。

**建议调用顺序：**

- **经营分析/归因**：  
  用户提「毛利率/毛利额/费用/平台/区域」→ 先用 `cross_border_ecommerce_skills` 搜索 → 命中 `margin-attribution` 等 → 若是 Momcozy 专题 → 再调用 `momcozy-margin-analysis`。

- **品线组合/购物篮**：  
  用户提「连带购买/组合场景/爆品组合」→ 先用 `cross_border_ecommerce_skills` 里的 product-analysis/attribution Skills → 若是 Momcozy 专题 → 再调用 `momcozy-product-line-basket-reporting`。

- **读书与方法论萃取**：  
  用户提「萃取一本书/帮我把这本书变成行动」→ 直接调用 `book-knowledge-extraction`，按三阶段输出。

---

## 快速开始：典型场景 → 建议路径

### 1. 做毛利率/毛利额归因（平台×区域×时间窗口）

- 数据：`main_project_lute/data_example/原始数据/专题一：分析数据总表.xlsx`（Sheet①、②）
- 入口顺序：
  1. 若是通用归因：先用 `skills/cross_border_ecommerce/skills_index.py` 搜索「毛利率 归因」「margin-attribution」类 Skill。
  2. 若是 Momcozy 专题：直接调用 `.cursor/skills/momcozy-margin-analysis/SKILL.md`，按其中步骤跑 `data_example` 脚本并更新 PPT。

### 2. 做购物篮分析与品线组合营销（专题五 + 专题①）

- 数据：同一 Excel 的 Sheet⑤～⑧ 与 `main_project_lute/data_example/专题产物/专题①/`。
- 入口顺序：
  1. 通用购物篮原理：可参考 `skills/cross_border_ecommerce` 中 product/attribution 相关 Skills。
  2. Momcozy 专题：调用 `.cursor/skills/momcozy-product-line-basket-reporting/SKILL.md`，生成购物篮结论、组合↔场景表与 PPT。

### 3. 做母婴品牌出海 / 竞品洞察

- 知识：`ref/books/` 中 01–09 号出海/运营类书籍，及综合总结  
  - 入口：`ref/books/README.md`、`ref/books/INDEX.md`、`ref/books/母婴品牌出海-战略战术战斗与精细化运营总结.md`
- 品牌与竞品：`knowledge_base/insights/maternal_brand/` 下研究框架与 Momcozy 示例
- 建议路径：
  1. 先读 `knowledge_base/insights/maternal_brand/00-研究框架与模板.md` 明确四维度结构；
  2. 再用 books 总结与出海/数智化书籍做战略/战术锚点；
  3. 最后结合 `data_example` 中的平台×区域/品线组合结果，形成「理论 → 洞察 → 数据验证」的闭环。

### 4. 做 AI PPT 多维图表页面

- 入口顺序：
  1. 图表/页面选型：`skills/mckinsey_ppt/skills/00-expert-entry/ppt-multidim-chart-expert/SKILL.md`
  2. 复合图/多维图规范：`skills/05-chart-creation/combination-chart/`、`multi-dimensional-charts/`
  3. AI/代码出图：`skills/mckinsey_ppt/skills/05-chart-creation/chartify-chart-generation/` + `main_project_lute/data_example/scripts/*build_*` 完成图表与 PPT 更新。 

