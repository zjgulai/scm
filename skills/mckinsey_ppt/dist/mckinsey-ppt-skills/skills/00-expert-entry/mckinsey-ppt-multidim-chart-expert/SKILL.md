---
name: mckinsey-ppt-multidim-chart-expert
description: Use when users need a chart strategy expert for PPT pages with complex trade-offs, such as multi-metric storytelling, combo charts, attribution waterfalls, growth-driver visuals, or uncertainty about chart selection for executive slides.
---

# PPT 多维图表分析设计专家

## 角色与职责

本 Skill 作为**复合图表与多维分析图表的统一入口**，在用户提出「做一张同时看 XX 和 YY 的图」「做归因/瀑布/双轴图」等需求时，按三步输出，并串联 chart-classification、combination-chart、multi-dimensional-charts，避免用户在多 Skill 间自行切换。

**三步输出**：
1. **推荐图表类型**：根据业务问题或指标，给出推荐图表（含单一图 vs 复合图 vs 多子图），并注明依据。
2. **设计规范摘要**：该图表的双轴/图例/标题/「通过图表可知」结构等必检项。
3. **实现要点**：matplotlib 或实现时的关键点（如双轴、堆叠、瀑布累计计算），并指向具体 Skill 的代码位置。

## 内部调用关系

```
用户需求（复合/多维/双轴/归因/瀑布…）
    │
    ▼
① 查 chart-classification 确定大类（对比/构成/趋势/分布/关系/复合）
    │
    ├─ 若为「复合类」或「多指标同时展示」 ──► 查 combination-chart
    │       → 输出：柱+线 / 柱+饼 / 面积+线 选型 + 设计规范 + 实现要点
    │
    └─ 若为「因素分解/流向/价格带/增长驱动」 ──► 查 multi-dimensional-charts
            → 输出：8 大多维图类型选型 + 复合 vs 多子图 + 设计规范 + 实现要点
```

## 业务问题 → 图表类型速查

| 业务问题 / 需求 | 推荐图表类型 | 引用 Skill |
|-----------------|--------------|------------|
| 同时看规模与增长率、销售额与增速 | 柱状图+折线图（双轴） | combination-chart |
| 结构占比 + 某维度对比 | 柱状图+饼图/环形图 | combination-chart |
| 累计贡献 + 趋势 | 面积图+折线图 | combination-chart |
| 销额/毛利/指标变化由哪些因素驱动 | 增长驱动分解图、瀑布图 | multi-dimensional-charts |
| 品牌/用户流向、谁抢了谁 | 竞争转换分析图、双向条形图 | multi-dimensional-charts |
| 价格带份额、高端化趋势 | 价格带分析图、堆叠柱状图 | multi-dimensional-charts |
| 规模+增长+份额多维度 | 气泡图或复合图 | multi-dimensional-charts |
| 多维度对比（>2 个维度、无强关联） | 多子图组合 | multi-dimensional-charts「复合 vs 多子图」 |

## 三步输出模板

### 第一步：推荐图表类型

- **分析目的**：（用一句话复述用户需求）
- **推荐图表**：（具体类型，如「柱状图+折线图（双轴）」）
- **选型理由**：（为何用复合图而非多子图、为何用该类型）
- **若需细节点**：请查阅 `mckinsey-combination-chart` 或 `mckinsey-multi-dimensional-charts` 对应章节。

### 第二步：设计规范摘要

- **标题**：幻灯片标题 = 核心观点（结论先行），非「XX 分析图」。
- **双轴**（若适用）：左轴指标与单位、右轴指标与单位；主次轴颜色区分。
- **图例与标注**：图例位置、关键数据点是否标注数值。
- **「通过图表可知」**：3～5 条结论，每条带数据支撑。
- **关键词与数据来源**：页脚标注 Key Terms + 数据来源。
- **必检项**：见各图表 Skill 的「必检项清单」。

### 第三步：实现要点

- **图表类型**：（与第一步一致）
- **matplotlib 要点**：（如 ax2 = ax1.twinx() 双轴；瀑布图累计计算；堆叠 bottom 等）
- **图片与 PPT**：建议尺寸（如 12×6 英寸）、DPI 150；插入 PPT 时预留标题区与结论区。项目内可参考 `data_example/scripts` 下 build_* 脚本（matplotlib 出图 + python-pptx 插入）。
- **代码位置**：详见 `mckinsey-combination-chart` 的「技术实现」或 `mckinsey-multi-dimensional-charts` 的「技术实现」。
- **实现层：Chartify**：若使用 Chartify（Bokeh）出图，见 05-chart-creation 下的 **chartify-chart-generation** Skill，含柱+线双轴、数据格式与导出 fallback 约定；库见 [Spotify Chartify](https://github.com/spotify/chartify)。

**与 PPT 生成脚本衔接**：若需将图表直接插入 PPT，可复用项目内 `data_example/scripts` 的实践：`build_waterfall_ppt.py`、`build_sheet2_*`、`build_sheet4_*`、`build_sheet5_*` 等脚本采用「matplotlib 出图 + python-pptx 插入」流程，包含图片尺寸、DPI 与占位插入方式；combination-chart 与 multi-dimensional-charts 的「技术实现」小节中也有与上述脚本衔接的说明。

## 端到端示例

### 示例 1：同时看销售额与增长率

**用户需求**：「做一张图同时看各品类销售额和同比增长率。」

1. **推荐图表类型**：柱状图+折线图（双轴）。理由：两个指标量纲不同（绝对值 vs 百分比）、且有关联（规模与效率），用单一复合图优于多子图。详见 combination-chart。
2. **设计规范摘要**：左轴柱状图—销售额（万元），深蓝 #051C2C；右轴折线图—增长率（%），浅蓝或橙色 #FF6B35；折线关键点标注数值；标题写核心观点如「婴配粉与洗护增速领先，玩具规模仍最小」。通过图表可知 3～5 条带数据。
3. **实现要点**：fig, ax1 = plt.subplots(); ax2 = ax1.twinx(); ax1.bar(...); ax2.plot(...)。完整代码见 combination-chart「技术实现」—柱+线双轴。出图后保存 PNG，用 python-pptx 插入幻灯片并配标题与结论区。

### 示例 2：毛利变化归因（瀑布图）

**用户需求**：「展示毛利额变化由哪些因素贡献。」

1. **推荐图表类型**：瀑布图（增长驱动分解）。理由：表达「期初→各因素贡献→期末」的累计关系，单一图即可。详见 multi-dimensional-charts「增长驱动分解图」。
2. **设计规范摘要**：从左到右为因素顺序；正贡献与负贡献用颜色区分（如正深蓝、负橙红）；每段标注贡献额或占比；标题写结论如「毛利增长主要由均价提升贡献」。通过图表可知各因素贡献排序与净效果。
3. **实现要点**：累计序列计算各段 bottom；ax.bar(..., bottom=cumulative)。完整代码见 multi-dimensional-charts「技术实现—瀑布图」。与 PPT 结合时，页上为标题+结论，页中为图，页脚为数据来源。

### 示例 3：多渠道多指标（建议多子图）

**用户需求**：「对比 5 个渠道的销售额、转化率、ROI。」

1. **推荐图表类型**：多子图组合（如 2×2 或 1×3）。理由：维度多（5 渠道 × 3 指标）、指标量纲不同，单一复合图易过载；multi-dimensional-charts「复合 vs 多子图」建议 4+ 维度优先多子图，保持统一风格与配色。
2. **设计规范摘要**：每个子图一个指标（或同一指标不同渠道）；子图标题=该图结论；整体幻灯片标题=总观点。图例与颜色在各子图间一致。
3. **实现要点**：fig, axes = plt.subplots(2, 2) 或 (1, 3)；每轴单独绘图。插入 PPT 时可一页多图或分页，依版面而定。

## 何时使用本 Skill

- 用户说「做复合图」「多维分析图」「双轴图」「瀑布图」「归因图」「增长驱动」「竞争转换」「价格带分析」。
- 用户说「图表设计专家」「PPT 图表选型」「同时展示多指标」「AI PPT 图表」。
- 用户问「用什么图展示规模与增速」「如何画归因」「同时看几个指标用什么图」。

## 关联 Skill（供深入查阅）

- **选图大类**：mckinsey-chart-classification、mckinsey-chart-type-guide
- **复合图制作**：mckinsey-combination-chart（柱+线、柱+饼、面积+线）
- **多维分析图**：mckinsey-multi-dimensional-charts（8 类多维图、复合 vs 多子图、瀑布/双向条形/气泡等）
- **业务场景**：mckinsey-maternal-ecommerce-charts、mckinsey-consumer-analysis-charts 等（场景到图表的映射）
- **实现参考**：项目内 `data_example/scripts` 下 build_waterfall_ppt.py、build_sheet2_*、build_sheet4_*、build_sheet5_* 等（matplotlib 出图 + python-pptx 插入 PPT）
- **实现层 Chartify**：05-chart-creation/chartify-chart-generation（Chartify/Bokeh 图表生成、柱+线双轴、数据格式与导出约定）

---

**Skill 版本**: 1.0  
**适用场景**: 复合图表选型、多维分析图表设计、PPT 图表端到端输出  
**复杂度**: 入口/串联

---

## 何时不要使用

- 需求仅是简单文案润色或排版修饰，不涉及本 Skill 对应的方法或图表决策。
- 用户问题与该 Skill 的核心场景不匹配，存在更直接的专项 Skill 可用。
- 仅需一次性小修改且不需要此 Skill 的方法论框架。

## 快速使用清单

- 明确页面目标或分析问题（先结论后图表）。
- 确认输入数据字段、时间口径、分组维度。
- 选择图表类型或方法模板并执行。
- 产出标题、关键结论、图表与数据来源。
- 用本 Skill 的质量检查项完成最终自检。

## 常见错误

- 图表类型与业务问题不匹配，导致结论表达失焦。
- 标题不是结论句，只写成章节名。
- 过度堆叠信息，单页承载超过可读上限。
- 缺失数据口径和来源说明，影响复用与可信度。

## 相关资源

- 速查与扩展说明见同目录 `reference.md`。
- 需要跨 Skill 路由时，可先用 `mckinsey-ppt-multidim-chart-expert`。
