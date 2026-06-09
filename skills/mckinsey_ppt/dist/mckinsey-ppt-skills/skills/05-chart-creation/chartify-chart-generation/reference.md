# Chartify 参考要点

本文档整理 [Spotify Chartify](https://github.com/spotify/chartify) 的 API/轴类型/导出与样式要点，便于扩展与查阅。主入口见 [SKILL.md](SKILL.md)。

## 官方资源

- **文档**：[chartify.readthedocs.io](https://chartify.readthedocs.io/en/latest/)
- **仓库**：[github.com/spotify/chartify](https://github.com/spotify/chartify)
- **示例 Notebook**：仓库内 `examples/Chartify Tutorial.ipynb`、`examples/Examples.ipynb`

## Chart 构造与轴类型

```python
chartify.Chart(
    blank_labels=False,        # 是否空白默认标签
    layout='slide_100%',       # 布局
    x_axis_type='linear',      # 'linear' | 'categorical' | 'datetime'
    y_axis_type='linear',      # 'linear' | 'categorical'
    second_y_axis=False        # 是否启用第二 Y 轴（柱+线等复合图）
)
```

- **categorical / linear**：柱状、堆叠柱、棒棒糖、箱线、区间、散点（分类轴）→ 使用 `chart.plot` 上的 `PlotMixedTypeXY` 方法（bar, bar_stacked, lollipop, boxplot, interval, scatter, text）。
- **linear / linear** 或 **datetime / linear**：折线、面积、散点（数值轴）→ 使用 `PlotNumericXY` 方法（line, area, scatter, text）。
- **单轴密度**：直方图、KDE → `PlotNumericDensityXY`（histogram, kde）。
- **categorical / categorical**：热力图 → `PlotCategoricalXY`（heatmap）。
- **双变量密度**：六边形分箱 → `PlotDensityXY`（hexbin）。
- **雷达图**：独立模块 `chartify._core.radar_chart`，用法见仓库或文档。

## 导出与 show

- **保存**：`chart.save(filename, format='html'|'png'|'svg')`  
  - `html`：无需 chromedriver，可交互，适合开发与调试。  
  - `png`：需 Chrome + chromedriver 在 PATH，适合插入 PPT/文档。  
  - `svg`：矢量，多数环境可用，无需 chromedriver。
- **展示**：`chart.show(format='html'|'png'|'svg')`，与 save 的 format 约定一致。
- **稳定性**：无 chromedriver 时 PNG 可能失败，建议 try/except 后 fallback 到 HTML 或 SVG（见 SKILL.md）。

## 样式与配色

- **Style**：`chart.style.set_color_palette(palette_type, palette=None, accent_values=None)`  
  - `palette_type`：`'categorical'` | `'sequential'` | `'diverging'` | `'accent'`  
  - 可用调色板与颜色名：`chartify.color_palettes.show()`
- **Options**：`chartify.options.set_option(option_name, option_value)`  
  - 例如 `'style.color_palette_categorical'`、`'style.color_palette_sequential'`、`'chart.blank_labels'` 等。
- **标题/副标题/图例/数据来源**：`chart.set_title()`、`chart.set_subtitle()`、`chart.set_legend_location()`、`chart.set_source_label()`。

## 轴与标注

- **轴标签**：`chart.axes.set_xaxis_label(label)`、`chart.axes.set_yaxis_label(label)`。
- **第二 Y 轴**：`Chart(second_y_axis=True)` 后，折线等可绑定第二 Y 轴（具体参数名以官方文档 [SecondYNumericalAxis](https://chartify.readthedocs.io/en/latest/usage.html) 为准）。
- **Callout**：`chart.callout.box()`、`chart.callout.line()`、`chart.callout.line_segment()`、`chart.callout.text()` 用于添加框、线或文字标注。

## 数据格式（Tidy）

- 分类+数值：`categorical_columns`（str 或 list）、`numeric_column`；堆叠再加 `stack_column`。
- 数值双轴：`x_column`、`y_column`；多系列用 `color_column`；面积堆叠用 `stacked=True`。
- 直方图：`values_column`；热力图：`x_column`、`y_column`、`color_column`。
- 传入前建议对 DataFrame 做缺失值/无穷值处理，并用 `categorical_order_by`、`color_order`、`stack_order` 控制顺序以保证可复现。

## 版本与依赖

- Chartify 5.x，建议 Python 3.9–3.11。
- 依赖：Bokeh、pandas 等（随 `pip install chartify` 安装）。
- PNG 导出额外依赖：Chrome、chromedriver（可选）。
