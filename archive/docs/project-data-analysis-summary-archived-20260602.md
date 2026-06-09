---
title: 数据分析总结与核心产出
doc_type: analysis
module: main-project-lute
topic: data-analysis-summary
status: archived
created: 2026-03-13
updated: 2026-06-02
owner: self
source: human+ai
---

# 数据分析总结与核心产出

**项目**：母婴跨境电商（Momcozy 吸奶器等母婴生活用品）  
**日期**：2026-03-05 会话整合  
**数据路径**：`data_example/data/` 下数据源 `专题一：分析数据总表.xlsx`（Sheet①、Sheet②）；产出在 `data_example/outputs/`，结论文档在 `data_example/docs/`，脚本在 `data_example/scripts/`。详见 `data_example/README.md`。

---

## 一、核心对话与决策摘要

| 主题 | 结论/决策 |
|------|-----------|
| 时间口径 | 统一 **P1**：MAT2026P1（2025-02～2026-01）、MAT2025P1（2024-02～2025-01）、YTD2026P1（2026-01）、YTD2025P1（2025-01） |
| 毛利率口径 | **卖出一块钱**：硬性成本 = 前台成本 + 后台成本，剩下来的才是毛利。品线毛利率 = 1 − 成本率（成本视角）；报表用 品线毛利额/销售额。 |
| 成本分类 | **前台成本**：促销折扣率、线上推广费率(品线)、退款率（顾客与流量侧）。**后台成本**：生产成本率、头程费率、仓储配送费率、平台佣金率、其他费率（供应链与履约侧）。 |
| 品牌与品类 | **Momcozy**，主营吸奶器等母婴生活用品（非奶粉/纸尿裤为主）。 |
| 产出呈现 | 结论与洞察需**领导层通俗易懂**；PPT 需明确数据标注（正/负贡献、贡献占比）；可代表归因的图表纳入同一 PPT。 |

---

## 二、分析体系与脚本一览

### 专题一（Sheet①：平台×区域×月份）

- **数据**：销售额、品线毛利额、品线毛利率。
- **脚本**：`data_example/scripts/run_专题一分析.py` → 产出 `outputs/专题一_分析结果.xlsx` 及多份结论 txt。
- **PPT**：`data_example/scripts/build_waterfall_ppt.py` → 生成 `outputs/专题一_归因瀑布图.pptx`（整体+子集瀑布图、以价换量、复合图、全部分析汇总页）。

### 专题二（Sheet②：亚马逊 vs 独立站，多费率）

- **数据**：销售额、品线毛利额、品线毛利率，以及 退款率、促销折扣率、线上推广费率(品线)、生产成本率、头程费率(营收)、仓储配送费率、平台佣金率；**其他费率** = 1 − 上述各费率绝对值之和。
- **脚本**：`data_example/scripts/run_专题二_Sheet2_双平台费率归因.py` → 产出 `outputs/专题二_Sheet2_双平台费率归因结果.xlsx`、`outputs/专题二_Sheet2_费率归因洞察与假设.txt`。
- **图表与 PPT**：`data_example/scripts/build_sheet2_fee_attribution_charts.py` → 生成各费率对毛利率波动贡献占比图、费率结构瀑布图（MAT/YTD），并**追加**到 `outputs/专题一_归因瀑布图.pptx`（专题二章节 + 洞察与 Momcozy 前台/后台结论页）。

### 前台 vs 后台 洞察（Momcozy）

- **文档**：`data_example/docs/专题二/专题二_前台与后台成本洞察_Momcozy.txt`（卖出一块钱结构、同比、前台/后台结论与行动方向、给领导的三条结论）。
- **PPT**：同上 build_sheet2 脚本内的两页结论（公式+结构+同比 + 前台/后台行动与三条结论）。

---

## 三、推荐运行顺序

1. `cd data_example`
2. `.venv/bin/python scripts/run_专题一分析.py`  
   → 生成 outputs/ 下专题一 Excel 与结论 txt
3. `.venv/bin/python scripts/build_waterfall_ppt.py`  
   → 生成/覆盖 outputs/专题一_归因瀑布图.pptx（专题一全部内容）
4. `.venv/bin/python scripts/run_专题二_Sheet2_双平台费率归因.py`  
   → 生成专题二 Excel 与费率归因洞察 txt
5. `.venv/bin/python scripts/build_sheet2_fee_attribution_charts.py`  
   → 生成专题二图表并**追加**到同一 PPT（会先移除末尾已有「Sheet②」页再追加，避免重复）

---

## 四、核心产出文件清单

| 类型 | 路径 |
|------|------|
| 专题一结果 | `data_example/outputs/专题一_分析结果.xlsx` |
| 专题一结论 | `data_example/outputs/` 或 `data_example/docs/专题一/` 下专题一相关 txt |
| 专题二结果 | `data_example/outputs/专题二_Sheet2_双平台费率归因结果.xlsx` |
| 专题二洞察 | `data_example/outputs/`、`data_example/docs/专题二/` |
| 统一 PPT | `data_example/outputs/专题一_归因瀑布图.pptx` |
| 图表缓存 | `data_example/_waterfall_imgs/` |
| 目录说明 | `data_example/README.md` |

---

## 五、给领导的三条结论（Momcozy）

1. **独立站卖 1 块钱有一半花在前台**（促销+推广+退款），毛利仅 6～7%；要改善毛利必须先压前台。
2. **今年独立站恶化主因是前台多花**（推广/促销/退款）；优先动作：控推广、控促销、控退款。
3. **后台**在把前台控制住之后，再系统优化（生产、头程、仓配），更可持续。

---

## 六、关键公式与口径（便于下次续用）

- **品线毛利率** = 品线毛利额 / 销售额。
- **xx费用额** = xx费率 × 销售额。
- **其他费率** = 1 − 退款率 − 促销折扣率 − 线上推广费率(品线) − 生产成本率 − 头程费率(营收) − 仓储配送费率 − 平台佣金率（费率取绝对值作成本占比）。
- **前台成本率** = 促销折扣率 + 线上推广费率(品线) + 退款率（绝对值之和）。
- **后台成本率** = 生产成本率 + 头程费率 + 仓储配送费率 + 平台佣金率 + 其他费率（绝对值之和）。
- **各费率对品线毛利率同比波动的贡献率(pp)** = −Δ(该费率)，**贡献占比%** = 贡献率 / Δ品线毛利率(pp) × 100。

---

## 七、下次续用时可说

- 「用最新数据跑一遍专题一和专题二，更新 Excel 和 PPT。」
- 「按前台/后台再给一版 Momcozy 结论。」
- 「在 PPT 里加一页：XXX 的归因/对比。」
- 「帮我查 专题二_Sheet2_双平台费率归因结果.xlsx 里 亚马逊/独立站 的 当期 前台合计、后台合计。」
- **专题五 / 专题①**：「做购物篮分析 Sheet⑤⑥⑦⑧」「品线组合营销 Part1～Part6 结论」「大领导汇报演讲稿 5–10 分钟」「更新专题五/专题① PPT」「典型组合↔场景」「客品数对毛利率影响」→ 见项目 Skill：`.cursor/skills/momcozy-product-line-basket-reporting/`。

详细步骤与概念见项目 Skill：`.cursor/skills/momcozy-margin-analysis/`（专题一二、毛利与费率）；专题五购物篮与专题①品线组合营销见 `.cursor/skills/momcozy-product-line-basket-reporting/`。目录结构见 `data_example/README.md`。
