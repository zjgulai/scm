# ADR-001: Agent/Engine/Output 三层架构决策

**状态**: 已采纳
**日期**: 2026-06-09
**决策者**: self

---

## 背景

`main_project_lute/` 下定义了 Data Agent 三层架构：

1. `agent/` — 意图解析（intent_parser.py）+ Skill 路由（skills_router.py）
2. `engine/` — Skill 加载（skill_loader.py）+ 数据处理（data_processor.py）+ 结果格式化（result_formatter.py）
3. `output/` — PPT 生成（ppt_generator.py）+ 报告组装（report_assembler.py）+ 图表引擎（chart_engine.py）

**现状问题**：
- DataProcessor 全部返回硬编码 Mock 数据（`data_processor.py` 12 个方法无真实数据读取）
- PPTGenerator 输出 JSON 而非 .pptx（`ppt_generator.py` 调用 `json.dumps` 保存）
- ChartEngine 不生成任何图表（`chart_engine.py` 无 matplotlib/plotly 调用）
- 实际运行链路完全绕过三层：`data_example/scripts/core/run_专题*.py` → `build_专题*.py` 直接生成 PPT
- 三层框架引用的测试目录（agent/tests/ 等）不存在

## 决策

**选择方案 C：保留三层作为编排层，底层委托给现有脚本。**

### 具体含义

- **保留** `agent/` 模块：意图解析和 Skill 路由逻辑有实际价值（关键词匹配、别名映射、索引搜索），不删除。
- **重构** `engine/data_processor.py`：不再返回硬编码 Mock 数据，改为通过 subprocess 调用现有的 `data_example/scripts/` 分析脚本，读取它们的 CSV/JSON 产出并返回结构化结果。每个返回附加 `_meta` 字段标记数据质量（real/mock/grey）。
- **重构** `output/ppt_generator.py`：使用 python-pptx 生成真正的 `.pptx` 文件，支持标题页、洞察页、图表页。保留 JSON 输出作为调试接口。
- **重构** `output/chart_engine.py`：使用 matplotlib 生成 PNG 图表。
- **保留** `output/report_assembler.py`：已有 Markdown/JSON 报告生成逻辑，保持可用。

### 放弃的选项

**选项 A（完全重写三层）** — 工作量大，需要将 `data_example/scripts/` 下所有分析逻辑重写到 engine 层。风险高，收益不确定。

**选项 B（删除三层）** — 会丢失意图解析和 Skill 路由的价值，使项目失去 AI SaaS 产品化的路径。同时 `run_agent.py` 和 `test_agent.py` CLI 入口会失效。

### 为什么选 C

1. **最小破坏性**：不删除现有分析脚本，不重写分析逻辑
2. **保留产品化路径**：`python -m main_project_lute.agent "分析 DTC 毛利率"` 作为统一 CLI
3. **渐进式演进**：未来可以逐步将 DataProcessor 从 subprocess 委托改为直接调用 Python 函数
4. **数据质量透明**：`_meta` 标记让调用者明确知道数据来源质量

## 影响

- DataProcessor 将依赖 `data_example/scripts/` 下的脚本可用
- PPTGenerator 将依赖 python-pptx（已在 requirements.txt）
- ChartEngine 将依赖 matplotlib（已在 requirements.txt）
- 现有 `data_example/scripts/` 下脚本不需要修改

## 验证

```bash
python main_project_lute/run_agent.py "分析 DTC 毛利率"
# 应输出 .pptx 文件到 tmp/outputs/
```
