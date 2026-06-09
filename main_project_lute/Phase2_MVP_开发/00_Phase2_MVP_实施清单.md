---
title: "Phase 2 MVP 实施清单（专题② + 交叉线3）"
doc_type: workflow
module: "phase2-mvp"
topic: "00-Phase2-MVP-实施清单"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# Phase 2 MVP 实施清单（专题② + 交叉线3）

## 1. MVP 范围

- 专题②《线上订单数量与质量提升》：按 Phase1 故事线跑通 ①~④ 子课题的端到端流程（数据源 → Agent → 输出表/结论）。
- 交叉线 3《订单与退款 → 反哺 VOC 与产品组合》：在专题② 退款归因基础上，产出售后/退款主题输入表，并与 VOC Agent 串联到双重视图结论。

## 2. 现有可复用资产

- Python 脚本：
  - data_example/scripts/run_专题二_Sheet2_双平台费率归因.py（订单成本与费率归因，支撑专题② 子课题①）。
  - data_example/scripts/run_专题三_Sheet3_SPU分析.py、run_专题四_Sheet4_*、build_sheet2_* 等：为后续子课题③ 毛利归因与图表输出提供思路与组件。
- Phase1 文档：
  - main_project_lute/Phase1_故事线与智能体/专题故事线/专题②_线上订单数量与质量提升_故事线.md。
  - main_project_lute/Phase1_故事线与智能体/交叉故事线/交叉线3_订单与退款反哺VOC与产品组合.md。
  - ref/roles_skills/agent_订单_成本_退款_仓网.md、agent_voc_消费者洞察.md。

## 3. 技术落地任务分解

### 3.1 数据契约与配置

- 校对 01_专题课题_数据需求矩阵 与 05_数仓表结构 中以下表的字段：fact_order、fact_order_item、fact_return、dim_return_reason、dim_warehouse、dim_order_type、dim_campaign。
- 在 ref/data_index/（或等价目录）补充一个 Phase2 专题②/交叉线3 的字段清单与口径说明（命名对齐 01/05）。

### 3.2 专题② Agent 端到端脚本

- 新建脚本：data_example/scripts/run_phase2_topic2_pipeline.py
  - 职责：
    - 调用/复用 run_专题二_Sheet2_双平台费率归因.py，产出订单成本与费率归因结果。
    - 预留接口：订单耗时与节点诊断（子课题②）、订单价结构与毛利归因（子课题③）、退款多维归因（子课题④）。
    - 将分散结果整理为标准输出表：
      - topic2_cost_attribution.parquet
      - topic2_leadtime_diagnostics.parquet（待实现）
      - topic2_margin_attribution.parquet（待实现）
      - topic2_refund_attribution.parquet（待实现）。

### 3.3 交叉线3 退款→VOC 管道

- 在同一脚本或新脚本 data_example/scripts/run_phase2_crossline3_pipeline.py 中：
  - 读取 topic2_refund_attribution.parquet，构造：
    - refund_theme_input_for_voc（售后/退款主题输入表，字段对齐交叉线3 文档）。
  - 预留与 VOC Agent 的接口：
    - 导出为 ref/phase2_io/refund_theme_input_for_voc.parquet 或 CSV。
    - 后续由 VOC Agent 脚本消费并产出“订单侧问题 + 用户原话双重视图”。

### 3.4 治理与监控

- 将交叉线3 纳入 ref/roles_skills/crossline_评估模板.md，记录：
  - line_id=3，status（planned/in_progress/live）、effect_metrics（退款率下降、VOC 投诉占比变化等）、is_phase2_candidate=true。
- 为专题② + 交叉线3 在 ppt_page_template_mapping.md 中各补一行，定义对应 PPT 页型与图表类型。

## 4. 近期优先实施顺序（技术视角）

1. 搭建 data_example/scripts/run_phase2_topic2_pipeline.py 脚本骨架，先打通与 run_专题二_Sheet2_双平台费率归因.py 的集成与输出整理。
2. 设计并落盘 topic2_refund_attribution 与 refund_theme_input_for_voc 的字段结构（与 01/05/交叉线3 文档对齐）。
3. 编写 data_example/scripts/run_phase2_crossline3_pipeline.py 骨架，完成从退款归因表到售后/退款主题输入表的映射逻辑雏形（可先用 mock 数据或子集）。
4. 更新 crossline_评估模板.md 与 ppt_page_template_mapping.md 中对应行，闭环治理层视角。

