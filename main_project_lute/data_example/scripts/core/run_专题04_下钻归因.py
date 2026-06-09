# -*- coding: utf-8 -*-
"""
专题四（Sheet④）下钻：客品数下滑、毛利率下滑的 SPU 归因，TOP10 瀑布图，交叉核心 SPU 表与业务洞察
时间窗口：YTD2026P1（2026-01～2026-02），YTD2026P1 同期（2025-01～2025-02）

聚合公式（先明确）：
- 整体客品数 = 总销量 / 总订单数 = Σ销量 / Σ订单数（比值）
  等价于按订单数加权的客品数：整体客品数 = Σ(订单数_s/Σ订单数) × 客品数_s，其中 客品数_s = 销量_s/订单数_s
- 整体毛利率 = 总前台毛利额 / 总销售额 = Σ前台毛利额 / Σ销售额（比值）
  等价于按销售额加权的毛利率：整体毛利率 = Σ(销售额_s/Σ销售额) × 毛利率_s，其中 毛利率_s = 前台毛利额_s/销售额_s
"""
import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "原始数据"
TOPIC_DIR = BASE_DIR / "专题产物" / "专题04"
TABLE_DIR = TOPIC_DIR / "表格"
DOC_DIR = TOPIC_DIR / "文档"
IMG_DIR = TOPIC_DIR / "图表"
SRC_EXCEL = DATA_DIR / "专题一：分析数据总表.xlsx"
OUT_FORMULA_MD = DOC_DIR / "专题04_文档_聚合公式说明.md"
OUT_CROSS_MD = DOC_DIR / "专题04_文档_客品数与毛利率交叉核心SPU表.md"
OUT_INSIGHT_MD = DOC_DIR / "专题04_文档_下钻归因业务洞察与优化建议.md"
IMG_DIR.mkdir(parents=True, exist_ok=True)

SHEET_NAME = "④"
YTD2026P1_MONTHS = ["2026-01", "2026-02"]
YTD2025P2_MONTHS = ["2025-01", "2025-02"]


def load_and_agg_by_spu():
    df = pd.read_excel(SRC_EXCEL, sheet_name=SHEET_NAME)
    df["月份"] = df["年月"].astype(str).str[:7]
    d26 = df[df["月份"].isin(YTD2026P1_MONTHS)]
    d25 = df[df["月份"].isin(YTD2025P2_MONTHS)]
    s26 = d26.groupby("SPU名称").agg(
        销量=("销量", "sum"), 订单数=("订单数", "sum"),
        销售额=("销售额", "sum"), 前台毛利额=("前台毛利额", "sum")
    ).reset_index()
    s25 = d25.groupby("SPU名称").agg(
        销量=("销量", "sum"), 订单数=("订单数", "sum"),
        销售额=("销售额", "sum"), 前台毛利额=("前台毛利额", "sum")
    ).reset_index()
    s26["客品数"] = s26["销量"] / s26["订单数"].replace(0, np.nan)
    s25["客品数"] = s25["销量"] / s25["订单数"].replace(0, np.nan)
    s26["毛利率"] = s26["前台毛利额"] / s26["销售额"].replace(0, np.nan)
    s25["毛利率"] = s25["前台毛利额"] / s25["销售额"].replace(0, np.nan)
    return s26, s25, d26, d25


def main():
    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    DOC_DIR.mkdir(parents=True, exist_ok=True)
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    s26, s25, d26, d25 = load_and_agg_by_spu()
    Q26, N26 = d26["销量"].sum(), d26["订单数"].sum()
    Q25, N25 = d25["销量"].sum(), d25["订单数"].sum()
    S26, S25 = d26["销售额"].sum(), d25["销售额"].sum()
    M26, M25 = d26["前台毛利额"].sum(), d25["前台毛利额"].sum()
    整体客品数_26 = Q26 / N26 if N26 else np.nan
    整体客品数_25 = Q25 / N25 if N25 else np.nan
    整体毛利率_26 = M26 / S26 if S26 else np.nan
    整体毛利率_25 = M25 / S25 if S25 else np.nan
    delta_c = 整体客品数_26 - 整体客品数_25
    delta_gp = 整体毛利率_26 - 整体毛利率_25

    # 合并两期 SPU（外连接）
    merge = s26[["SPU名称", "销量", "订单数", "销售额", "前台毛利额", "客品数", "毛利率"]].merge(
        s25[["SPU名称", "销量", "订单数", "销售额", "前台毛利额", "客品数", "毛利率"]],
        on="SPU名称", how="outer", suffixes=("_26", "_25")
    ).fillna(0)
    # 订单数/销售额为 0 时客品数、毛利率会 NaN，已 fillna(0) 则后面按占比算时分子为 0
    merge["订单数_26"] = merge["订单数_26"].replace(0, np.nan)
    merge["订单数_25"] = merge["订单数_25"].replace(0, np.nan)
    merge["销售额_26"] = merge["销售额_26"].replace(0, np.nan)
    merge["销售额_25"] = merge["销售额_25"].replace(0, np.nan)
    merge["客品数_26"] = merge["销量_26"] / merge["订单数_26"]
    merge["客品数_25"] = merge["销量_25"] / merge["订单数_25"]
    merge["毛利率_26"] = merge["前台毛利额_26"] / merge["销售额_26"]
    merge["毛利率_25"] = merge["前台毛利额_25"] / merge["销售额_25"]
    merge = merge.fillna(0)

    # 客品数归因：整体客品数 = Σ(订单数_s/N)*客品数_s → Δ整体客品数 的 SPU 贡献 = 结构效应 + 水平效应
    # 贡献_s = (订单数_s_26/N_26)*(客品数_s_26 - 客品数_s_25) + (订单数_s_26/N_26 - 订单数_s_25/N_25)*客品数_s_25
    N26, N25 = float(N26), float(N25)
    merge["w26"] = merge["订单数_26"] / N26
    merge["w25"] = merge["订单数_25"] / N25
    merge["客品数_贡献"] = merge["w26"] * (merge["客品数_26"] - merge["客品数_25"]) + (merge["w26"] - merge["w25"]) * merge["客品数_25"]
    if abs(delta_c) < 1e-12:
        delta_c = 1e-12
    merge["客品数_贡献占比%"] = merge["客品数_贡献"] / delta_c * 100

    # 毛利率归因：整体毛利率 = Σ(销售额_s/S)*毛利率_s → 贡献_s = (销售额_s_26/S_26)*(毛利率_s_26 - 毛利率_s_25) + (销售额_s_26/S_26 - 销售额_s_25/S_25)*毛利率_s_25
    S26, S25 = float(S26), float(S25)
    merge["ws26"] = merge["销售额_26"] / S26
    merge["ws25"] = merge["销售额_25"] / S25
    merge["毛利率_贡献"] = merge["ws26"] * (merge["毛利率_26"] - merge["毛利率_25"]) + (merge["ws26"] - merge["ws25"]) * merge["毛利率_25"]
    if abs(delta_gp) < 1e-12:
        delta_gp = 1e-12
    merge["毛利率_贡献占比%"] = merge["毛利率_贡献"] / delta_gp * 100
    merge["毛利率_贡献_pp"] = merge["毛利率_贡献"] * 100

    # 1) 聚合公式说明
    formula_md = [
        "# 专题四（Sheet④）整体客品数、整体毛利率的聚合公式",
        "",
        "## 整体客品数",
        "",
        "- **定义**：整体客品数 = 总销量 / 总订单数 = Σ销量 / Σ订单数",
        "- **等价**：按订单数加权的各 SPU 客品数之和，即 整体客品数 = Σ (订单数_s / Σ订单数) × 客品数_s，其中 客品数_s = 销量_s / 订单数_s",
        "- **SPU 对整体客品数同比波动的贡献**（结构+水平）：",
        "  - 贡献_s = (订单数_s_26/N_26)×(客品数_s_26 − 客品数_s_25) + (订单数_s_26/N_26 − 订单数_s_25/N_25)×客品数_s_25",
        "  - 贡献占比% = 贡献_s / Δ整体客品数 × 100%",
        "",
        "## 整体毛利率",
        "",
        "- **定义**：整体毛利率 = 总前台毛利额 / 总销售额 = Σ前台毛利额 / Σ销售额",
        "- **等价**：按销售额加权的各 SPU 毛利率之和，即 整体毛利率 = Σ (销售额_s / Σ销售额) × 毛利率_s，其中 毛利率_s = 前台毛利额_s / 销售额_s",
        "- **SPU 对整体毛利率同比波动的贡献**（结构+水平）：",
        "  - 贡献_s = (销售额_s_26/S_26)×(毛利率_s_26 − 毛利率_s_25) + (销售额_s_26/S_26 − 销售额_s_25/S_25)×毛利率_s_25",
        "  - 贡献占比% = 贡献_s / Δ整体毛利率 × 100%，贡献率(pp) = 贡献_s × 100",
        "",
    ]
    with open(OUT_FORMULA_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(formula_md))

    # 2) 客品数 TOP10 瀑布图数据 & 3) 毛利率 TOP10 瀑布图数据（在 build 脚本里画）
    merge["客品数_贡献绝对值"] = merge["客品数_贡献"].abs()
    merge["毛利率_贡献绝对值"] = merge["毛利率_贡献"].abs()
    top10_c = merge.nlargest(10, "客品数_贡献绝对值")[["SPU名称", "客品数_贡献", "客品数_贡献占比%"]].copy()
    top10_g = merge.nlargest(10, "毛利率_贡献绝对值")[["SPU名称", "毛利率_贡献", "毛利率_贡献占比%", "毛利率_贡献_pp"]].copy()
    merge.to_excel(TABLE_DIR / "专题04_表格_下钻归因SPU明细.xlsx", index=False)
    top10_c.to_excel(TABLE_DIR / "专题04_表格_客品数归因TOP10.xlsx", index=False)
    top10_g.to_excel(TABLE_DIR / "专题04_表格_毛利率归因TOP10.xlsx", index=False)

    # 4) 交叉：同时导致客品数下滑和毛利率下滑 → 核心负贡献（两贡献都负）；核心正贡献（两贡献都正）
    merge["客品数负_毛利率负"] = (merge["客品数_贡献"] < 0) & (merge["毛利率_贡献"] < 0)
    merge["客品数正_毛利率正"] = (merge["客品数_贡献"] > 0) & (merge["毛利率_贡献"] > 0)
    neg_both = merge[merge["客品数负_毛利率负"]].copy()
    neg_both["综合得分"] = neg_both["客品数_贡献绝对值"] + neg_both["毛利率_贡献绝对值"]
    pos_both = merge[merge["客品数正_毛利率正"]].copy()
    pos_both["综合得分"] = pos_both["客品数_贡献绝对值"] + pos_both["毛利率_贡献绝对值"]
    core_neg = neg_both.nlargest(10, "综合得分")[["SPU名称", "客品数_贡献", "客品数_贡献占比%", "毛利率_贡献", "毛利率_贡献占比%"]]
    core_pos = pos_both.nlargest(10, "综合得分")[["SPU名称", "客品数_贡献", "客品数_贡献占比%", "毛利率_贡献", "毛利率_贡献占比%"]]

    cross_md = [
        "# 专题四（Sheet④）客品数与毛利率下钻 — 交叉核心 SPU 表",
        "",
        "**时间窗口**：YTD2026P1 vs YTD2025P2 同期",
        "",
        "## 核心负贡献 TOP10（同时拉低客品数与整体毛利率）",
        "",
        "| 排名 | SPU名称 | 客品数贡献 | 客品数贡献占比% | 毛利率贡献 | 毛利率贡献占比% |",
        "|------|---------|------------|------------------|------------|------------------|",
    ]
    for i, (_, r) in enumerate(core_neg.iterrows(), 1):
        cross_md.append(f"| {i} | {r['SPU名称'][:20]} | {r['客品数_贡献']:.4f} | {r['客品数_贡献占比%']:.1f}% | {r['毛利率_贡献']:.4f} | {r['毛利率_贡献占比%']:.1f}% |")
    cross_md.extend([
        "",
        "## 核心正贡献 TOP10（同时拉高客品数与整体毛利率）",
        "",
        "| 排名 | SPU名称 | 客品数贡献 | 客品数贡献占比% | 毛利率贡献 | 毛利率贡献占比% |",
        "|------|---------|------------|------------------|------------|------------------|",
    ])
    for i, (_, r) in enumerate(core_pos.iterrows(), 1):
        cross_md.append(f"| {i} | {r['SPU名称'][:20]} | {r['客品数_贡献']:.4f} | {r['客品数_贡献占比%']:.1f}% | {r['毛利率_贡献']:.4f} | {r['毛利率_贡献占比%']:.1f}% |")
    with open(OUT_CROSS_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(cross_md))

    # 5) 业务洞察与优化建议
    insight_md = [
        "# 专题四（Sheet④）客品数/毛利率下钻归因 — 业务洞察与优化建议",
        "",
        "## 一、归因结论摘要",
        "",
        f"- 整体客品数同比变化：{delta_c:+.4f}（{整体客品数_26:.4f} vs {整体客品数_25:.4f}）",
        f"- 整体毛利率同比变化：{delta_gp:+.2%}（{整体毛利率_26:.2%} vs {整体毛利率_25:.2%}）",
        "- 客品数归因：按 SPU 贡献占比排序，取绝对值 TOP10 做瀑布图；",
        "- 毛利率归因：按 SPU 贡献占比排序，取绝对值 TOP10 做瀑布图；",
        "- 交叉核心：同时负贡献 TOP10（拉低客品数+毛利率）、同时正贡献 TOP10（拉高客品数+毛利率）见上表。",
        "",
        "## 二、洞察方向",
        "",
        "1. **客品数下滑**：重点看「客品数贡献占比」最负的 SPU，多为订单数占比高且客品数同比下降的品，或订单数占比上升但客品数偏低的品（结构恶化）。",
        "2. **毛利率下滑**：重点看「毛利率贡献占比」最负的 SPU，多为销售额占比高且毛利率同比下降的品，或销售额占比上升但毛利率偏低的品。",
        "3. **交叉负贡献**：同时出现在「客品数负 + 毛利率负」TOP10 的 SPU 是优先治理对象，既拉低篮件数又拉低毛利，可考虑控量、提毛利或下架。",
        "4. **交叉正贡献**：同时「客品数正 + 毛利率正」的 SPU 应巩固与放大，作为主推与备货重点。",
        "",
        "## 三、优化建议",
        "",
        "- **核心负贡献 SPU**：收缩推广与促销、设销量或毛利底线；清库后评估下架或改款；若为引流款，明确量级上限与毛利红线。",
        "- **核心正贡献 SPU**：流量与备货倾斜，保持定价与促销节奏，避免一刀切打折。",
        "- **客品数**：通过关联推荐、满件/套装、购物车营销提升篮件数，尤其对订单量大但客品数低的 SPU。",
        "- **毛利率**：控促销深度、控退款、控成本；对高销低毛利 SPU 单独设定价与促销规则。",
        "",
        "## 四、数据与图表",
        "",
        "- 明细：`专题四_Sheet4_下钻归因SPU明细.xlsx`",
        "- 客品数 TOP10：`专题四_Sheet4_客品数归因TOP10.xlsx`，瀑布图见 PPT",
        "- 毛利率 TOP10：`专题四_Sheet4_毛利率归因TOP10.xlsx`，瀑布图见 PPT",
        "- 交叉表：`专题四_Sheet4_客品数与毛利率交叉核心SPU表.md`",
        "",
    ]
    with open(OUT_INSIGHT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(insight_md))

    print("聚合公式说明:", OUT_FORMULA_MD)
    print("下钻明细:", TABLE_DIR / "专题04_表格_下钻归因SPU明细.xlsx")
    print("客品数TOP10:", TABLE_DIR / "专题04_表格_客品数归因TOP10.xlsx")
    print("毛利率TOP10:", TABLE_DIR / "专题04_表格_毛利率归因TOP10.xlsx")
    print("交叉核心SPU表:", OUT_CROSS_MD)
    print("业务洞察与优化建议:", OUT_INSIGHT_MD)
    return merge, top10_c, top10_g, core_neg, core_pos


if __name__ == "__main__":
    main()
