---
title: "Phase 2 MVP 执行状态"
doc_type: workflow
module: "phase2-mvp"
topic: "PHASE2-STATUS"
status: stable
created: 2026-06-02
updated: 2026-06-10
owner: self
source: human+ai
---
# Phase 2 MVP 执行状态

> 最后更新：2026-06-10

## MVP 范围

- 专题②《线上订单数量与质量提升》
- 交叉线3《订单与退款 → 反哺 VOC 与产品组合》

---

## ✅ 已完成

### 1. 虚拟数据生成

- `generate_phase2_mock_data.py`
- 覆盖：fact_order, fact_order_item, fact_order_fulfillment, fact_return, 维度表

### 2. 专题②管道

- `run_phase2_topic2_pipeline.py`
- 产出：
  - `topic2_cost_attribution.csv` - 成本归因
  - `topic2_leadtime_diagnostics.csv` - 耗时诊断
  - `topic2_margin_attribution.csv` - 毛利归因
  - `topic2_refund_attribution.csv` - 退款归因汇总
  - `topic2_refund_attribution_detail.csv` - 退款明细

### 3. 交叉线3管道

- `run_phase2_crossline3_pipeline.py`
- 产出：
  - `ref/phase2_io/refund_theme_input_for_voc.csv` - VOC主题输入

### 4. VOC Agent处理

- `run_phase2_crossline3_voc_agent.py`
- 产出：
  - `phase2_outputs/crossline3_voc/dual_perspective_table.csv` - 双重视图表格
  - `phase2_outputs/crossline3_voc/dual_perspective_conclusions.txt` - 双重视图结论

### 5. PPT汇报

- `build_phase2_ppt.py`
- 产出：
  - `phase2_outputs/Phase2_MVP_汇报.pptx` - 管理层汇报PPT
  - 图表：成本结构、履约时效、退款原因分析

---

## 运行命令

```bash
# 1. 生成Mock数据
python data_example/scripts/generate_phase2_mock_data.py

# 2. 运行专题②管道
python data_example/scripts/run_phase2_topic2_pipeline.py

# 3. 运行交叉线3（订单→VOC）
python data_example/scripts/run_phase2_crossline3_pipeline.py

# 4. 运行VOC Agent处理
python data_example/scripts/run_phase2_crossline3_voc_agent.py

# 5. 生成PPT汇报
python data_example/scripts/build_phase2_ppt.py
```

---

## 产出文件清单

| 类型 | 文件 |
|------|------|
| Mock数据 | `phase2_mock/fact_*.csv` |
| 中间结果 | `phase2_outputs/topic2/*.csv` |
| VOC结论 | `phase2_outputs/crossline3_voc/*.txt` |
| 图表 | `phase2_outputs/chart_*.png` |
| PPT | `phase2_outputs/Phase2_MVP_汇报.pptx` |

---

## 待完成

- [ ] 渠道Agent处理（可选）- 将退款率异常纳入渠道健康度
- [ ] 真实数据接入
- [ ] 扩展至其他专题
