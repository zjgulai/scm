---
name: chartify-chart-generation
description: Use when users need reliable code-based chart generation with Chartify for reusable visuals, automated exports, or implementation-ready chart scripts aligned with PPT storytelling needs.
---

# Chartify 图表生成 Skill

## 概述

本 Skill 萃取自 [Spotify Chartify](https://github.com/spotify/chartify)，基于 Bokeh，采用**统一 tidy 数据格式**（pandas DataFrame + 列名）。设计规范由 [bar-chart](../mckinsey-bar-chart/SKILL.md)、[combination-chart](../mckinsey-combination-chart/SKILL.md)、[stacked-chart](../mckinsey-stacked-chart/SKILL.md) 等提供；本 Skill 负责「如何用 Chartify 实现」及数据/导出/稳定性约定。

## 前置条件与依赖

- **安装**：`pip install chartify`（会拉取 Bokeh、pandas 等依赖）。
- **Python**：建议 3.9 / 3.10 / 3.11；Chartify 当前版本 5.x。
- **PNG 导出（可选）**：需安装 Chrome 与 [chromedriver](https://sites.google.com/chromium.org/driver/)，并将 chromedriver 放入 PATH。若无 chromedriver，请使用 HTML 或 SVG 导出（见下文「可靠性与稳定性」）。

## 图表类型速查表

| 图表类型       | Chart 轴类型 (x / y)     | 方法名           | 必选/常用参数                                       | 推荐 DataFrame 列名 |
|----------------|--------------------------|------------------|-----------------------------------------------------|----------------------|
| 柱状图         | categorical / linear     | `plot.bar`       | categorical_columns, numeric_column                 | 同上                 |
| 堆叠柱状图     | categorical / linear     | `plot.bar_stacked` | categorical_columns, numeric_column, stack_column | 同上                 |
| 棒棒糖/箱线/区间 | categorical / linear     | `plot.lollipop` / `plot.boxplot` / `plot.interval` | 同 bar 或见文档     | 同上                 |
| 折线图         | linear 或 datetime / linear | `plot.line`    | x_column, y_column, color_column（可选）            | 同上                 |
| 面积图         | linear 或 datetime / linear | `plot.area`    | x_column, y_column, stacked（可选）                  | 同上                 |
| 散点图         | linear / linear          | `plot.scatter`   | x_column, y_column, size_column（可选）              | 同上                 |
| 直方图         | 密度轴                   | `plot.histogram` | values_column, method, bins                        | values_column        |
| 热力图         | categorical / categorical | `plot.heatmap`   | x_column, y_column, color_column                    | 同上                 |
| 柱+线复合图    | categorical / linear + second_y_axis | 先 `plot.bar` 再 `plot.line`（第二 Y 轴） | 同柱状 + 折线列     | 同左轴柱、右轴线     |
| 六边形分箱     | PlotDensityXY            | `plot.hexbin`    | x_values_column, y_values_column, size              | 同上                 |
| 雷达图         | 独立模块                 | radar_chart API  | 见 reference.md / 官方文档                          | —                    |

**轴类型与 Chart 构造**：

- 柱状/堆叠/棒棒糖/箱线：`Chart(x_axis_type='categorical', y_axis_type='linear')`；要对调为横向条形时交换 x/y 轴类型。
- 折线/面积/散点（数值轴）：`Chart(x_axis_type='linear')` 或 `x_axis_type='datetime'`。
- 柱+线复合：`Chart(..., second_y_axis=True)`，先画柱再画线，线绑定第二 Y 轴（见官方 SecondYNumericalAxis）。

## 核心图表生成模式

### 柱状图

```python
import chartify
import pandas as pd

df = pd.DataFrame({
    'category': ['A', 'B', 'C', 'D'],
    'value': [100, 85, 70, 55]
})
ch = chartify.Chart(x_axis_type='categorical', y_axis_type='linear')
ch.plot.bar(df, categorical_columns='category', numeric_column='value')
ch.set_title('类别对比')
ch.save('bar.html', format='html')
```

### 堆叠柱状图

```python
ch = chartify.Chart(x_axis_type='categorical', y_axis_type='linear')
ch.plot.bar_stacked(
    df, categorical_columns='category', numeric_column='value',
    stack_column='segment'  # 需有 segment 列
)
ch.save('stacked_bar.html', format='html')
```

### 折线图 / 时间序列

```python
ch = chartify.Chart(x_axis_type='datetime', y_axis_type='linear')
ch.plot.line(df, x_column='date', y_column='value', color_column='series')
ch.save('line.html', format='html')
```

### 面积图（可堆叠）

```python
ch = chartify.Chart(x_axis_type='linear', y_axis_type='linear')
ch.plot.area(df, x_column='x', y_column='y', color_column='series', stacked=True)
ch.save('area.html', format='html')
```

### 柱+线复合图（双轴）

```python
ch = chartify.Chart(x_axis_type='categorical', y_axis_type='linear', second_y_axis=True)
ch.plot.bar(df, categorical_columns='category', numeric_column='sales')
# 折线绑定第二 Y 轴：使用 y_range_name='second' 或按 Chartify 文档绑定
ch.plot.line(df, x_column='category', y_column='growth', y_range_name='second')
ch.set_title('销售额与增长率')
ch.save('combo.html', format='html')
```

注：第二 Y 轴具体绑定方式以 Chartify 官方文档（SecondYNumericalAxis）为准，不同版本 API 可能略有差异。

### 直方图

```python
ch = chartify.Chart(y_axis_type='linear')  # 密度轴
ch.plot.histogram(df, values_column='values', method='count', bins='auto')
ch.save('histogram.html', format='html')
```

### 热力图

```python
ch = chartify.Chart(x_axis_type='categorical', y_axis_type='categorical')
ch.plot.heatmap(df, x_column='x', y_column='y', color_column='z')
ch.save('heatmap.html', format='html')
```

## 数据格式约定（稳定性）

- **统一使用 pandas DataFrame**，列名与上表及 Chartify 文档一致：`categorical_columns`、`numeric_column`、`x_column`、`y_column`、`color_column`、`stack_column`、`values_column` 等。
- **缺失值与无穷值**：在传入 Chartify 前对 DataFrame 做 `dropna()` 或 `fillna()`，避免 Bokeh 报错。
- **分类顺序**：通过 `categorical_order_by`、`color_order`、`stack_order` 等参数控制，保证可复现。
- **时间列**：用于 `x_axis_type='datetime'` 的列应为 datetime 类型（`pd.to_datetime()`）。

## 可靠性与稳定性

- **导出优先级**：开发/调试用 **HTML**（无需 chromedriver）；交付用 **PNG**（需 Chrome + chromedriver）或 **SVG**。
- **PNG 不可用时的 fallback**：若环境中无 chromedriver，在调用 `chart.save(path, format='png')` 时可能抛错。建议在脚本中捕获异常并回退到 HTML 或 SVG：
  ```python
  try:
      ch.save('out.png', format='png')
  except Exception:
      ch.save('out.html', format='html')  # 或 format='svg'
  ```
- **与 PPT 流程衔接**：将 Chartify 导出的 PNG 或 SVG 交给现有流程（如 python-pptx）插入幻灯片；图片尺寸与 DPI 可在导出前通过 Chartify 的 layout/style 或后处理调整。设计规范与版式仍参考 [combination-chart](../mckinsey-combination-chart/SKILL.md) 与 [ppt-multidim-chart-expert](../../00-expert-entry/mckinsey-ppt-multidim-chart-expert/SKILL.md)。

## 与设计层 Skill 的对应关系

| 设计层 Skill     | Chartify 实现方式 |
|-----------------|-------------------|
| bar-chart       | `PlotMixedTypeXY.bar`，轴 categorical + linear |
| stacked-chart   | `PlotMixedTypeXY.bar_stacked`，stack_column |
| combination-chart（柱+线） | `Chart(second_y_axis=True)` + bar 再 line |
| multi-dimensional-charts（热力/雷达等） | `plot.heatmap`、radar_chart 模块、`plot.parallel` |
| donut-chart     | Chartify 无原生甜甜圈，保留现有实现 |

## 参考

- 官方文档：[chartify.readthedocs.io](https://chartify.readthedocs.io/en/latest/)
- 仓库与示例：[github.com/spotify/chartify](https://github.com/spotify/chartify)
- 本目录下 [reference.md](reference.md) 整理轴类型、导出与配色等要点。

---

**Skill 版本**: 1.0  
**适用场景**: Chartify/Bokeh 图表实现、与麦肯锡图表设计规范配合的实现层  
**关联 Skill**: bar-chart, stacked-chart, combination-chart, multi-dimensional-charts

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
