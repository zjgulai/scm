---
title: "phase2outputs 说明"
doc_type: workflow
module: "data-example"
topic: "产出-readme"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# phase2_outputs 说明

本目录用于承接 `Phase2 / Phase3` 实验性管道的输出结果。

## 当前状态

- 目录处于**实验阶段**，默认依赖 `scripts/experimental/` 下的 mock 数据生成脚本。
- 当前仓库未默认接入真实数仓，因此你可能看到“脚本可运行、目录暂无正式产物”的情况。
- 相关脚本包含：
  - `generate_phase2_mock_data.py`
  - `generate_phase3_sandbox_mock.py`
  - `generate_phase3_topic1_voc_mock.py`
  - `generate_phase3_topic3_channel_mock.py`
  - `run_phase2_*` / `run_phase3_*` / `build_phase*_ppt.py`

## 为什么暂时使用 mock

- 便于先验证分析逻辑、指标口径与页面结构。
- 降低外部依赖（连接、权限、网络）带来的调试成本。
- 支持在本地快速回归实验链路。

## 接入真实数仓的前置条件

在从 mock 切换到真实生产数据前，请先满足以下条件：

1. **数据源连通**：可访问数仓（如 MySQL/ClickHouse/BigQuery 等）并具备网络白名单。
2. **凭证与权限**：具备最小必要读取权限，敏感字段权限与脱敏策略已审批。
3. **数据契约**：核心表结构、字段命名、时间窗口口径与脚本中指标定义一致。
4. **调度策略**：明确批次频率、补数机制、失败重跑策略与报警方式。
5. **结果校验**：建立与 mock 基线对比的校验清单（行数、总额、关键比率、异常阈值）。
6. **输出归档**：确认正式产物落地位置、命名规范与版本留存策略。

## 推荐切换步骤

1. 先保留 mock 脚本，新增真实数据读取分支。
2. 并行跑 1~2 个周期做结果对比。
3. 通过校验后再将真实链路设为默认。
4. 在 `scripts/README.md` 中同步更新运行说明。
