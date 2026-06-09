# -*- coding: utf-8 -*-
"""
专题二（Sheet②）：亚马逊 vs 独立站 双平台指标与费率归因分析
数据源：专题一：分析数据总表.xlsx，Sheet ②
时间窗口：MAT2026P1/MAT2025P1，YTD2026P1/YTD2025P1（与专题一 P1 一致）
"""
import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "原始数据"
TOPIC_DIR = BASE_DIR / "专题产物" / "专题02"
TABLE_DIR = TOPIC_DIR / "表格"
DOC_DIR = TOPIC_DIR / "文档"
SRC_EXCEL = DATA_DIR / "专题一：分析数据总表.xlsx"
OUT_EXCEL = TABLE_DIR / "专题02_表格_双平台费率归因结果.xlsx"
OUT_INSIGHT = DOC_DIR / "专题02_文档_费率归因洞察与假设.txt"

SHEET_NAME = "②"
MAT2026P1_MONTHS = [f"2025-{m:02d}" for m in range(2, 13)] + ["2026-01"]
MAT2025P1_MONTHS = [f"2024-{m:02d}" for m in range(2, 13)] + ["2025-01"]
YTD2026P1_MONTHS = ["2026-01"]
YTD2025P1_MONTHS = ["2025-01"]

# 费率列（成本类，表中多为负值，计算时取绝对值作为“费率”）
RATE_COLS = [
    "退款率",
    "促销折扣率",
    "线上推广费率(品线)",
    "生产成本率",
    "头程费率(营收)",
    "仓储配送费率",
    "平台佣金率",
]
# 其他费率 = 1 - 上述各项绝对值之和
PLATFORMS = ["亚马逊", "独立站"]


def load_data():
    df = pd.read_excel(SRC_EXCEL, sheet_name=SHEET_NAME)
    df = df.dropna(subset=["平台", "月份", "销售额"])
    df = df[df["平台"].isin(PLATFORMS)].copy()
    return df


def rate_abs(df):
    """各费率取绝对值作为占营收比例（成本端）"""
    d = df.copy()
    for c in RATE_COLS:
        d[c + "_abs"] = d[c].abs()
    d["其他费率"] = 1 - d[[c + "_abs" for c in RATE_COLS]].sum(axis=1)
    return d


def agg_by_platform_window(df, months):
    """按平台聚合：销售额、品线毛利额、品线毛利率；各费率为销售额加权平均"""
    w = df[df["月份"].isin(months)].copy()
    w = rate_abs(w)
    rows = []
    for platform in PLATFORMS:
        g = w[w["平台"] == platform]
        sale = g["销售额"].sum()
        margin = g["品线毛利额"].sum()
        gp = margin / sale if sale != 0 else np.nan
        row = {
            "平台": platform,
            "销售额": sale,
            "品线毛利额": margin,
            "品线毛利率": gp,
        }
        for c in RATE_COLS:
            # 销售额加权平均费率（用绝对值）
            wgt = g["销售额"] * g[c + "_abs"]
            row[c] = wgt.sum() / sale if sale != 0 else np.nan
        # 其他费率：1 - 各费率之和
        row["其他费率"] = 1 - sum(row[c] for c in RATE_COLS) if sale != 0 else np.nan
        rows.append(row)
    return pd.DataFrame(rows)


def yoy_rate(cur, yoy):
    """同比率%（(当期-同期)/同期*100）"""
    if yoy is None or np.isnan(yoy) or yoy == 0:
        return np.nan
    return (cur - yoy) / yoy * 100


def build_table_mat():
    """MAT 窗口：两平台指标 + 同比率 + 各费率对品线毛利率同比波动的贡献率与贡献占比"""
    df = load_data()
    df = rate_abs(df)

    cur = agg_by_platform_window(df, MAT2026P1_MONTHS)
    yoy = agg_by_platform_window(df, MAT2025P1_MONTHS)

    cur = cur.set_index("平台")
    yoy = yoy.set_index("平台")

    # 整体（两平台合计）当期/同期 品线毛利率
    sale_cur = cur["销售额"].sum()
    sale_yoy = yoy["销售额"].sum()
    margin_cur = cur["品线毛利额"].sum()
    margin_yoy = yoy["品线毛利额"].sum()
    gp_overall_cur = margin_cur / sale_cur if sale_cur else np.nan
    gp_overall_yoy = margin_yoy / sale_yoy if sale_yoy else np.nan
    delta_gp_overall = (gp_overall_cur - gp_overall_yoy) * 100 if pd.notna(gp_overall_cur) and pd.notna(gp_overall_yoy) else np.nan  # pp

    rows = []
    for platform in PLATFORMS:
        r_cur = cur.loc[platform]
        r_yoy = yoy.loc[platform]
        row = {
            "时间窗口": "MAT2026P1 vs MAT2025P1",
            "平台": platform,
            "销售额_当期": r_cur["销售额"],
            "销售额_同期": r_yoy["销售额"],
            "销售额_同比率%": yoy_rate(r_cur["销售额"], r_yoy["销售额"]),
            "品线毛利额_当期": r_cur["品线毛利额"],
            "品线毛利额_同期": r_yoy["品线毛利额"],
            "品线毛利额_同比率%": yoy_rate(r_cur["品线毛利额"], r_yoy["品线毛利额"]),
            "品线毛利率_当期": r_cur["品线毛利率"],
            "品线毛利率_同期": r_yoy["品线毛利率"],
            "品线毛利率_同比差值pp": (r_cur["品线毛利率"] - r_yoy["品线毛利率"]) * 100 if pd.notna(r_cur["品线毛利率"]) and pd.notna(r_yoy["品线毛利率"]) else np.nan,
        }
        for c in RATE_COLS + ["其他费率"]:
            row[f"{c}_当期"] = r_cur[c]
            row[f"{c}_同期"] = r_yoy[c]
            row[f"{c}_同比率%"] = yoy_rate(r_cur[c], r_yoy[c])
            # xx费用额 = xx费率 * 销售额
            row[f"{c}_费用额_当期"] = r_cur[c] * r_cur["销售额"] if pd.notna(r_cur[c]) else np.nan
            row[f"{c}_费用额_同期"] = r_yoy[c] * r_yoy["销售额"] if pd.notna(r_yoy[c]) else np.nan
        # 各费率对「该平台」品线毛利率同比波动的贡献：品线毛利率 = 1 - 各项成本费率，故 Δ毛利率 = -Δ费率_i，贡献率_i = -Δ费率_i（百分点）
        delta_gp_p = (r_cur["品线毛利率"] - r_yoy["品线毛利率"]) * 100 if pd.notna(r_cur["品线毛利率"]) and pd.notna(r_yoy["品线毛利率"]) else np.nan
        for c in RATE_COLS + ["其他费率"]:
            delta_r = (r_cur[c] - r_yoy[c]) * 100  # 费率差转为百分点
            contrib = -delta_r  # 成本率升则毛利率降，贡献为负
            row[f"{c}_对毛利率波动贡献率pp"] = contrib
            row[f"{c}_对毛利率波动贡献占比%"] = (contrib / delta_gp_p * 100) if delta_gp_p and abs(delta_gp_p) > 1e-10 else np.nan
        rows.append(row)
    return pd.DataFrame(rows), delta_gp_overall, cur, yoy


def build_table_ytd():
    """YTD 窗口：同上"""
    df = load_data()
    df = rate_abs(df)

    cur = agg_by_platform_window(df, YTD2026P1_MONTHS)
    yoy = agg_by_platform_window(df, YTD2025P1_MONTHS)

    cur = cur.set_index("平台")
    yoy = yoy.set_index("平台")

    sale_cur = cur["销售额"].sum()
    sale_yoy = yoy["销售额"].sum()
    margin_cur = cur["品线毛利额"].sum()
    margin_yoy = yoy["品线毛利额"].sum()
    gp_overall_cur = margin_cur / sale_cur if sale_cur else np.nan
    gp_overall_yoy = margin_yoy / sale_yoy if sale_yoy else np.nan
    delta_gp_overall = (gp_overall_cur - gp_overall_yoy) * 100 if pd.notna(gp_overall_cur) and pd.notna(gp_overall_yoy) else np.nan

    rows = []
    for platform in PLATFORMS:
        r_cur = cur.loc[platform]
        r_yoy = yoy.loc[platform]
        row = {
            "时间窗口": "YTD2026P1 vs YTD2025P1",
            "平台": platform,
            "销售额_当期": r_cur["销售额"],
            "销售额_同期": r_yoy["销售额"],
            "销售额_同比率%": yoy_rate(r_cur["销售额"], r_yoy["销售额"]),
            "品线毛利额_当期": r_cur["品线毛利额"],
            "品线毛利额_同期": r_yoy["品线毛利额"],
            "品线毛利额_同比率%": yoy_rate(r_cur["品线毛利额"], r_yoy["品线毛利额"]),
            "品线毛利率_当期": r_cur["品线毛利率"],
            "品线毛利率_同期": r_yoy["品线毛利率"],
            "品线毛利率_同比差值pp": (r_cur["品线毛利率"] - r_yoy["品线毛利率"]) * 100 if pd.notna(r_cur["品线毛利率"]) and pd.notna(r_yoy["品线毛利率"]) else np.nan,
        }
        for c in RATE_COLS + ["其他费率"]:
            row[f"{c}_当期"] = r_cur[c]
            row[f"{c}_同期"] = r_yoy[c]
            row[f"{c}_同比率%"] = yoy_rate(r_cur[c], r_yoy[c])
            row[f"{c}_费用额_当期"] = r_cur[c] * r_cur["销售额"] if pd.notna(r_cur[c]) else np.nan
            row[f"{c}_费用额_同期"] = r_yoy[c] * r_yoy["销售额"] if pd.notna(r_yoy[c]) else np.nan
        delta_gp_p = (r_cur["品线毛利率"] - r_yoy["品线毛利率"]) * 100 if pd.notna(r_cur["品线毛利率"]) and pd.notna(r_yoy["品线毛利率"]) else np.nan
        for c in RATE_COLS + ["其他费率"]:
            delta_r = (r_cur[c] - r_yoy[c]) * 100
            contrib = -delta_r
            row[f"{c}_对毛利率波动贡献率pp"] = contrib
            row[f"{c}_对毛利率波动贡献占比%"] = (contrib / delta_gp_p * 100) if delta_gp_p and abs(delta_gp_p) > 1e-10 else np.nan
        rows.append(row)
    return pd.DataFrame(rows), delta_gp_overall, cur, yoy


def write_insight(tab_mat, tab_ytd):
    """生成洞察观点与归因假设"""
    lines = [
        "专题二（Sheet②）亚马逊 vs 独立站 费率归因 — 洞察与归因假设",
        "时间口径：MAT2026P1/MAT2025P1，YTD2026P1/YTD2025P1",
        "数据来源：专题一：分析数据总表 Sheet②",
        "",
        "一、各费用在各时间窗口的波动及对品线毛利率波动的影响",
    ]
    for period_name, tab in [("MAT2026P1 vs MAT2025P1", tab_mat), ("YTD2026P1 vs YTD2025P1", tab_ytd)]:
        lines.append(f"\n【{period_name}】")
        for _, r in tab.iterrows():
            p = r["平台"]
            dgp = r.get("品线毛利率_同比差值pp")
            lines.append(f"  {p}：品线毛利率同比差值 {dgp:+.2f}pp" if pd.notna(dgp) else f"  {p}：品线毛利率同比差值 —")
            for c in RATE_COLS + ["其他费率"]:
                contrib_pp = r.get(f"{c}_对毛利率波动贡献率pp")
                contrib_pct = r.get(f"{c}_对毛利率波动贡献占比%")
                if pd.notna(contrib_pp) and abs(contrib_pp) > 1e-6:
                    lines.append(f"    {c} 贡献率 {contrib_pp:+.2f}pp，贡献占比 {contrib_pct:.1f}%")
        lines.append("")

    lines.extend([
        "二、洞察观点",
        "• 若某平台「促销折扣率」「退款率」对毛利率波动贡献占比大且为负：说明该平台让利或退货增加是毛利率下滑的主因，需收紧促销与退货政策。",
        "• 若「生产成本率」「头程费率」贡献占比大：供应链与物流成本上升直接挤压毛利率，需从采购与物流端优化。",
        "• 若「平台佣金率」贡献占比大：平台抽成变化或销售结构导致，需关注平台政策与高佣金品类占比。",
        "• 若「其他费率」贡献占比大：未单独列示的成本或口径差异影响大，建议拆解其他费用明细。",
        "• 亚马逊 vs 独立站对比：独立站通常无平台佣金、但可能有更高推广与履约费率；通过两表对比可看出各费用对两平台毛利率波动的差异化驱动。",
        "",
        "三、归因假设",
        "• 假设1（费率驱动）：品线毛利率同比波动主要来自各费率同比变化，即 Δ毛利率 ≈ -ΣΔ费率_i；贡献占比可验证各费率相对重要性。",
        "• 假设2（结构效应）：若某费率贡献占比与费率同比率不成比例，可能存在区域/品类结构变化（销售额权重变化）。",
        "• 假设3（平台差异）：亚马逊与独立站在退款率、促销折扣率、平台佣金率上的差异，可部分解释两平台毛利率水平与波动差异。",
        "",
        "四、关键词",
        "品线毛利率 | 费率归因 | 贡献率 | 贡献占比 | 亚马逊 | 独立站 | MAT | YTD | 数据来源: 专题一分析数据总表 Sheet②",
    ])
    with open(OUT_INSIGHT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("洞察与假设已写入:", OUT_INSIGHT)


def main():
    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    DOC_DIR.mkdir(parents=True, exist_ok=True)
    tab_mat, dgp_mat, _, _ = build_table_mat()
    tab_ytd, dgp_ytd, _, _ = build_table_ytd()

    with pd.ExcelWriter(OUT_EXCEL, engine="openpyxl") as w:
        tab_mat.to_excel(w, sheet_name="MAT2026P1_vs_MAT2025P1", index=False)
        tab_ytd.to_excel(w, sheet_name="YTD2026P1_vs_YTD2025P1", index=False)
        # 简化版：仅核心指标+贡献占比，便于做表和图
        cols_simple_mat = ["时间窗口", "平台", "销售额_当期", "销售额_同比率%", "品线毛利额_当期", "品线毛利额_同比率%", "品线毛利率_当期", "品线毛利率_同期", "品线毛利率_同比差值pp"]
        contrib_cols = [f"{c}_对毛利率波动贡献占比%" for c in RATE_COLS + ["其他费率"]]
        tab_mat_simple = tab_mat[cols_simple_mat + contrib_cols].copy()
        tab_ytd_simple = tab_ytd[cols_simple_mat + contrib_cols].copy()
        tab_mat_simple.to_excel(w, sheet_name="MAT_简化", index=False)
        tab_ytd_simple.to_excel(w, sheet_name="YTD_简化", index=False)
    print("结果表已保存:", OUT_EXCEL)

    write_insight(tab_mat, tab_ytd)
    return tab_mat, tab_ytd


if __name__ == "__main__":
    main()
