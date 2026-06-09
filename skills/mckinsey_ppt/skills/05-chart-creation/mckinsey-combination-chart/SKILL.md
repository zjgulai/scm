---
name: mckinsey-combination-chart
description: Use when users need combo chart design, including dual-axis, bar-line, or mixed-metric pages that show scale and growth or multiple linked signals together.
---

# 麦肯锡复合图表制作 Skill

## 概述

复合图表(Combination Chart)是将两种或多种图表类型组合在一起，用于同时展示不同维度的数据，是麦肯锡分析复杂商业问题的重要工具。

## 何时用复合图 vs 多子图

在选型前先做以下判断（与 [multi-dimensional-charts](../mckinsey-multi-dimensional-charts/SKILL.md) 选择指南对齐）：

| 判断 | 复合图更合适 | 多子图更合适 |
|------|--------------|--------------|
| 维度数量 | 2～3 个维度，且有关联 | 4+ 个维度或维度相对独立 |
| 业务问题 | 同时看规模与增速、结构+对比、累积+趋势 | 多渠道/多品类各自独立看趋势 |
| 是否有时序 | 同一时间轴上的多指标（如销售额+增长率） | 多个时间序列或不同粒度 |
| 是否强调流向 | 否，重在对比或构成 | 是（可考虑多维图如双向条形） |
| 单图信息密度 | 可接受 ≤5 个视觉元素（系列/轴） | 超过则拆成多子图 |

**业务问题 → 图表类型映射**：
- **同时看规模与增长率** → 柱+线双轴图
- **结构+占比（如渠道分布与转化）** → 柱+饼（或柱+环形）
- **累积+趋势（如份额变化）** → 面积+折线
- **多群体多指标对比** → 若 2～3 个群体用复合图；4+ 群体考虑多子图

## 复合图表类型

### 1. 柱状图 + 折线图（规模+增长率）

**适用场景**:
- 同时展示绝对值和变化率
- 展示销售额与增长率
- 展示市场规模与CAGR

**结构示例**:
```
销售额(百万)  │  增长率
    200 ┤     █           ╭──● 38%
    150 ┤     █      ●───╯    23%
    100 ┤     █
     50 ┤
      0 └─────────────────
         一二线城市  三四线城市

      █ 销售额  ● 增长率(CAGR)
```

**设计规范**:
```
主轴(左): 柱状图 - 绝对值
  • 颜色: #051C2C (深蓝)
  • 用途: 展示规模/数量

次轴(右): 折线图 - 相对值
  • 颜色: #3A5F8A (浅蓝) 或 #FF6B35 (橙色强调)
  • 用途: 展示趋势/增长率

关键标注:
  • 折线图关键点标注数值
  • 增长率使用百分比
```

**必检项清单（柱+线）**：
- [ ] 双轴刻度与单位：左轴绝对值、右轴百分比（或率），单位在轴标题中标明
- [ ] 图例位置：右上或图下，不遮挡数据；双轴系列均出现在图例中
- [ ] 关键点标注：折线至少标注首尾或极值点数值
- [ ] 与麦肯锡版式衔接：标题=核心观点（如「辅食品类增速领先达45%」）；「通过图表可知」3～5 条，与图表结论一致；关键词区含指标名与数据来源

### 2. 柱状图 + 饼图（结构+占比）

**适用场景**:
- 展示分群结构与偏好
- 展示渠道分布与效果
- 展示用户画像与行为

**结构示例**:
```
偏好度(%)     │        用户结构
   100 ┤  ████           ┌────┐
    80 ┤  ████  ████     │ 68%│ 设计
    60 ┤  ████  ████     │────│
    40 ┤  ████  ████     │ 32%│ 品牌
    20 ┤  ████  ████  ████ └────┘
     0 └─────────────────
        25-35岁 35-45岁 45-55岁

      █ 偏好度   用户年龄结构
```

**设计规范**:
```
左侧: 柱状图 - 主指标
  • 宽度占60%
  • 展示关键对比

右侧: 饼图/环形图 - 结构占比
  • 宽度占40%
  • 展示分布/构成

对齐规则:
  • 饼图中心与柱状图区域中心对齐
  • 图例放在下方或右侧
```

**必检项清单（柱+饼）**：
- [ ] 布局比例：左侧柱状约 60% 宽、右侧饼/环约 40%，或左右 50%-50%，留白一致
- [ ] 图例与标签：饼图需有类别标签或图例，占比数值可见；柱状图轴标签清晰
- [ ] 标题与结论区：标题=观点（如「TikTok 转化率最高但流量占比仅 20%」）；「通过图表可知」与结构/占比结论对应
- [ ] 关键词区：指标名（如「转化率」「流量占比」）、数据来源

### 3. 面积图 + 折线图（累积+趋势）

**适用场景**:
- 展示累计贡献与趋势
- 展示市场份额变化
- 展示品类增长结构

**结构示例**:
```
市场份额(%)   │
   100 ┤  ▓▓▓▓▓▓▓▓▓▓▓▓●
    80 ┤  ▒▒▒▒▒▒▒▒●═══▓▓▓
    60 ┤  ░░░░░░●═══▒▒▒▒▒
    40 ┤  ░░░●═══░░░░░░░
    20 ┤  ●═══░░░░░░░░░
     0 └─────────────────
        2020   2022   2024

      ▓ 线上  ▒ 线下  ░ 其他  ● 总趋势
```

## 母婴跨境电商应用案例

### 案例1: 品类销售与增长分析

**业务场景**: 分析各品类销售规模与增长率

**数据结构**:
```
品类        销售额(万)  同比增长率
奶粉        1200       +25%
纸尿裤      800        +15%
辅食        600        +45%
洗护        400        +30%
玩具        300        +20%
```

**复合图表设计**:
```markdown
# 辅食品类增速领先，达45%，但规模仍有增长空间

## 概述图表
图表展示了各品类销售额与同比增长率的对比

## 通过图表可知
• 辅食品类增速最高达45%，但销售额仅600万，增长潜力大
• 奶粉品类规模最大1200万，增速25%，是稳定增长的核心品类
• 纸尿裤增速较低15%，需关注市场饱和度
• 建议加大辅食品类投入，抓住高增长机会

## 图表
[柱状图(销售额) + 折线图(增长率)]
```

### 案例2: 渠道分布与转化率分析

**业务场景**: 分析各渠道流量占比与转化效率

**数据结构**:
```
渠道        流量占比    转化率
亚马逊      45%        3.2%
独立站      25%        2.8%
TikTok      20%        4.5%
其他        10%        2.0%
```

**复合图表设计**:
```markdown
# TikTok渠道转化率最高达4.5%，但流量占比仅20%

## 通过图表可知
• TikTok转化率4.5%领先其他渠道，说明内容营销效果好
• 亚马逊流量占比45%最大，但转化率3.2%中等
• 独立站转化率2.8%，需优化用户体验
• 建议增加TikTok投放预算，提升高转化渠道占比

## 值得关注
• 渠道效率: TikTok > 亚马逊 > 独立站 > 其他
• 流量结构: 需向高转化渠道倾斜
```

### 案例3: 价格带销售与毛利率分析

**业务场景**: 分析不同价格带销售表现与盈利能力

**数据结构**:
```
价格带         销售额占比   毛利率
$0-20         30%         25%
$20-50        40%         35%
$50-100       20%         42%
$100+         10%         50%
```

**复合图表设计**:
```markdown
# 中端价格带($20-50)销售占比最高40%，但高端($100+)毛利率达50%

## 通过图表可知
• $20-50价格带是主力销售区间，占比40%
• $100+价格带毛利率最高50%，但销售占比仅10%
• 存在结构性优化空间：提升高端产品占比
• 建议开发更多$50-100价格带产品，平衡销量与利润

## 关键词
Price Band | Gross Margin | 销售结构 | 数据来源: 销售报表
```

## 技术实现

### 实现层：Chartify

若采用 [Spotify Chartify](https://github.com/spotify/chartify)（基于 Bokeh、统一 tidy 数据格式）实现柱+线等复合图，可复用 [chartify-chart-generation](../chartify-chart-generation/SKILL.md) Skill：使用 `Chart(second_y_axis=True)` 先画柱再画线并绑定第二 Y 轴，数据格式与导出（HTML/PNG/SVG）及稳定性约定见该 Skill。

### Python (Matplotlib)

```python
import matplotlib.pyplot as plt
import numpy as np

# 数据
categories = ['奶粉', '纸尿裤', '辅食', '洗护', '玩具']
sales = [1200, 800, 600, 400, 300]
growth = [25, 15, 45, 30, 20]

# 创建图表
fig, ax1 = plt.subplots(figsize=(12, 6))

# 柱状图 - 销售额
x = np.arange(len(categories))
bars = ax1.bar(x, sales, color='#051C2C', width=0.6, label='销售额(万)')
ax1.set_ylabel('销售额(万元)', color='#051C2C')
ax1.set_xticks(x)
ax1.set_xticklabels(categories)

# 折线图 - 增长率
ax2 = ax1.twinx()
line = ax2.plot(x, growth, color='#FF6B35', marker='o', linewidth=2, label='增长率(%)')
ax2.set_ylabel('增长率(%)', color='#FF6B35')

# 标注增长率
for i, v in enumerate(growth):
    ax2.annotate(f'{v}%', (i, v), textcoords="offset points",
                 xytext=(0, 10), ha='center', fontsize=10)

# 图例
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper right')

plt.title('各品类销售额与增长率对比')
plt.tight_layout()
plt.show()
```

### 柱+饼布局（左侧柱状 + 右侧饼图）

使用 `GridSpec` 或两个 subplot 实现左右分栏：左侧柱状图、右侧饼图，便于「结构+占比」类结论。

```python
import matplotlib.pyplot as plt
import numpy as np

# 数据：年龄带偏好度 + 用户结构占比
categories = ['25-35岁', '35-45岁', '45-55岁']
preference = [75, 68, 52]
share = [0.35, 0.45, 0.20]  # 饼图占比
labels = ['25-35岁', '35-45岁', '45-55岁']

fig = plt.figure(figsize=(12, 5))
gs = fig.add_gridspec(1, 2, width_ratios=[6, 4], wspace=0.3)

# 左侧：柱状图
ax1 = fig.add_subplot(gs[0])
x = np.arange(len(categories))
ax1.bar(x, preference, color='#051C2C', width=0.6)
ax1.set_ylabel('偏好度(%)')
ax1.set_xticks(x)
ax1.set_xticklabels(categories)
ax1.set_ylim(0, 100)

# 右侧：饼图
ax2 = fig.add_subplot(gs[1])
colors = ['#051C2C', '#3A5F8A', '#FF6B35']
ax2.pie(share, labels=labels, autopct='%1.0f%%', colors=colors, startangle=90)
ax2.set_title('用户年龄结构')

plt.suptitle('各年龄带偏好度与用户结构', y=1.02)
plt.tight_layout()
plt.show()
```

### 与 PPT 生成脚本衔接

若需将图表插入 PPT，可与项目内 `data_example/scripts` 的实践对齐：
- **图片尺寸与 DPI**：建议导出为 120 DPI 以上，宽度约 8–10 英寸，便于在幻灯片 1/3 图表区清晰展示。
- **插入位置**：脚本中常用 `python-pptx` 在占位形状或指定位置插入图片；标题与「通过图表可知」等文案建议与 [slide-template](../../02-structure-design/mckinsey-slide-template/SKILL.md) / [conclusion-first](../../08-expression-methodology/mckinsey-conclusion-first/SKILL.md) 一致，放在图表上方或左侧文字区。
- **参考脚本**：`build_waterfall_ppt.py`、`build_sheet2_*`、`build_sheet4_*`、`build_sheet5_*` 等为「matplotlib 出图 + python-pptx 插入」的示例，可复用其保存路径与插入逻辑。

## 质量检查清单

```
□ 两种图表类型是否互补而非重复？
□ 双轴是否清晰标注？
□ 颜色是否易于区分？
□ 关键数据是否标注？
□ 图例是否完整？
□ 标题是否直接表达核心观点？
□ 是否避免了信息过载？
```

---

**Skill版本**: 1.0
**适用场景**: 多维度数据分析、规模与增长对比、效率分析
**复杂度**: 中级
**前置Skill**: mckinsey-chart-type-guide
**关联Skill**:
- mckinsey-bar-chart (条形图)
- mckinsey-chart-type-guide (折线图)
- mckinsey-donut-chart (环形图)

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
