---
name: mckinsey-donut-chart
description: Use when users need donut or pie-style composition visuals to communicate share, mix, or structure in a concise executive format.
---

# 麦肯锡环形图制作 Skill

## 概述

环形图(Donut Chart)是麦肯锡常用的占比展示图表，相比传统饼图更简洁现代，中心区域可用于展示关键数据。

## 适用场景

### 最适合
- 2-5个类别的占比展示
- 强调某一类别占比
- 中心展示关键数据
- 偏好/选择分析

### 不适合
- 类别超过5个
- 需要精确比较
- 展示变化趋势

## 麦肯锡环形图设计规范

### 1. 基本结构

```
        ┌───────────────────┐
       ╱                     ╲
      │    ┌───────────┐     │
      │    │           │     │
      │    │   79%     │     │
      │    │ 更有帮助   │     │
      │    │           │     │
      │    └───────────┘     │
       ╲                     ╱
        └───────────────────┘

      图例: ■ 视频会议 █ 电话会议
```

### 2. 尺寸规范

```
外环直径: 150-200px
内环直径: 80-100px
环宽度: 35-50px

比例关系:
内径 : 外径 = 1 : 1.8~2
```

### 3. 中心数据

**内容**:
```
- 核心百分比数字 (最大字号)
- 简短说明文字 (辅助字号)

示例:
┌───────────┐
│           │
│   79%     │  ← 核心数据 (24-36pt)
│ 更有帮助   │  ← 说明文字 (12-14pt)
│           │
└───────────┘
```

### 4. 颜色配置

**双色占比**:
```css
/* 视频 vs 电话 */
.primary { color: #051C2C; }   /* 主要 - 深蓝 */
.secondary { color: #CCCCCC; } /* 次要 - 浅灰 */
```

**多色占比**:
```css
/* 5类别 */
.cat1 { color: #051C2C; }  /* 深蓝 */
.cat2 { color: #1E3A5F; }  /* 中蓝 */
.cat3 { color: #3A5F8A; }  /* 浅蓝 */
.cat4 { color: #5A7F9F; }  /* 淡蓝 */
.cat5 { color: #999999; }  /* 灰色 */
```

## 多环形图布局

### 场景对比布局

**结构**:
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   ┌─────┐   │ │   ┌─────┐   │ │   ┌─────┐   │ │   ┌─────┐   │
│   │ 79% │   │ │   │ 76% │   │ │   │ 76% │   │ │   │ 77% │   │
│   └─────┘   │ │   └─────┘   │ │   └─────┘   │ │   └─────┘   │
│  内部人员   │ │  现有客户   │ │  潜在客户   │ │   供应商    │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**设计要点**:
```
1. 保持尺寸一致
2. 标题在下方
3. 使用相同颜色编码
4. 水平排列便于对比
```

### 趋势对比布局

**结构**:
```
    Q1          Q2          Q3          Q4
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  60%    │ │  68%    │ │  75%    │ │  79%    │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

## 麦肯锡案例复现

### 案例: 视频会议偏好分析

**原始数据**:
```
场景: 不同商业情境下视频会议vs电话会议偏好
数据:
- 内部人员: 79%偏好视频
- 现有客户: 76%偏好视频
- 潜在客户: 76%偏好视频
- 供应商: 77%偏好视频
```

**幻灯片结构**:
```markdown
# 视频会议在所有商业场景下均比电话会议更受偏好

## 概述图表
图表展示了不同商业情境下受访者对视频会议与电话会议的偏好比例

## 通过图表可知
• 视频会议在所有商业场景下均比电话会议更受欢迎(76-79% vs 21-24%)
• 内部沟通场景偏好度最高(79%)
• 所有场景的偏好比例相近，说明视频会议已被广泛接受
• 企业应优先投资视频会议技术以适应这一趋势

## 关键词
Video preference | 商业沟通 | 数据来源: McKinsey Survey

## 图表
[4个环形图并排展示]
```

## 代码示例

### Python (Matplotlib)

```python
import matplotlib.pyplot as plt
import numpy as np

# 数据
sizes = [79, 21]
labels = ['视频会议', '电话会议']
colors = ['#051C2C', '#CCCCCC']

# 创建图表
fig, ax = plt.subplots(figsize=(8, 8))

# 绘制环形图
wedges, texts = ax.pie(
    sizes,
    colors=colors,
    startangle=90,
    wedgeprops=dict(width=0.5)
)

# 添加中心文字
ax.text(0, 0.05, '79%', ha='center', va='center', fontsize=36, fontweight='bold')
ax.text(0, -0.1, '更有帮助', ha='center', va='center', fontsize=14)

# 添加图例
ax.legend(wedges, labels, loc='lower center', bbox_to_anchor=(0.5, -0.1))

plt.tight_layout()
plt.show()
```

### Python (Plotly)

```python
import plotly.graph_objects as go

# 数据
values = [79, 21]
labels = ['视频会议', '电话会议']
colors = ['#051C2C', '#CCCCCC']

# 创建环形图
fig = go.Figure(go.Pie(
    values=values,
    labels=labels,
    hole=0.6,
    marker_colors=colors,
    textinfo='none',
    hoverinfo='label+percent'
))

# 添加中心注释
fig.add_annotation(
    text="<b>79%</b><br>更有帮助",
    x=0.5, y=0.5,
    font_size=24,
    showarrow=False
)

fig.update_layout(
    showlegend=True,
    height=400,
    width=400
)

fig.show()
```

## 质量检查清单

```
□ 类别数量是否≤5个？
□ 中心数据是否清晰展示？
□ 颜色对比是否明显？
□ 图例是否完整？
□ 多环形图尺寸是否一致？
□ 是否有数据来源标注？
□ 标题是否直接表达观点？
```

---

**Skill版本**: 1.0
**适用场景**: 占比分析、偏好展示、商业报告
**复杂度**: 初级
**前置Skill**: mckinsey-chart-type-guide
**关联Skill**:
- mckinsey-color-standards (颜色标准)
- mckinsey-bar-chart (条形图)

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
