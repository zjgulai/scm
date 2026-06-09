# MOVED TO: scripts/phase1/run_专题01_平台区域毛利归因.py
# -*- coding: utf-8 -*-
"""
专题一：分析数据总表 — 执行脚本
数据源：专题一：分析数据总表.xlsx，Sheet ①
"""
import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "原始数据"
TOPIC_DIR = BASE_DIR / "专题产物" / "专题01"
TABLE_DIR = TOPIC_DIR / "表格"
DOC_DIR = TOPIC_DIR / "文档"
CHECK_DIR = TOPIC_DIR / "校验"
SRC_EXCEL = DATA_DIR / "专题一：分析数据总表.xlsx"
OUT_EXCEL = TABLE_DIR / "专题01_表格_分析结果.xlsx"
OUT_CONCLUSION = DOC_DIR / "专题01_文档_归因分析结论.txt"

SHEET_NAME = "①"

# 时间窗口：月份格式 YYYY-MM
# MAT2026P1: 2025-02～2026-01；MAT2025P1: 2024-02～2025-01；YTD2026P1: 2026-01；YTD2025P1: 2025-01
MAT2026P1_MONTHS = [f"2025-{m:02d}" for m in range(2, 13)] + ["2026-01"]   # 2025-02..2026-01
MAT2025P1_MONTHS = [f"2024-{m:02d}" for m in range(2, 13)] + ["2025-01"]   # 2024-02..2025-01
YTD2026P1_MONTHS = ["2026-01"]
YTD2025P1_MONTHS = ["2025-01"]

WINDOWS = {
    "MAT2026P1": MAT2026P1_MONTHS,
    "MAT2025P1": MAT2025P1_MONTHS,
    "YTD2026P1": YTD2026P1_MONTHS,
    "YTD2025P1": YTD2025P1_MONTHS,
}


def load_data():
    df = pd.read_excel(SRC_EXCEL, sheet_name=SHEET_NAME)
    df = df.dropna(subset=["平台", "区域", "月份"])
    return df


def filter_window(df, months):
    return df[df["月份"].isin(months)].copy()


def agg_metrics(g):
    s = g["销售额"].sum()
    m = g["品线毛利额"].sum()
    return pd.Series({"销售额": s, "品线毛利额": m, "品线毛利率": m / s if s != 0 else np.nan})


def describe_and_save(df):
    """描述性统计并打印"""
    desc = df[["销售额", "品线毛利额", "品线毛利率"]].describe()
    with open(CHECK_DIR / "专题01_校验_描述性统计.txt", "w", encoding="utf-8") as f:
        f.write("=== 描述性统计（销售额、品线毛利额、品线毛利率）===\n\n")
        f.write(desc.to_string())
        f.write("\n\n=== 按平台样本量 ===\n")
        f.write(df.groupby("平台").size().to_string())
        f.write("\n\n=== 按区域样本量 ===\n")
        f.write(df.groupby("区域").size().to_string())
        f.write("\n\n=== 平台×区域 组合数 ===\n")
        f.write(str(df.groupby(["平台", "区域"]).ngroups))
    print(desc)
    return desc


def step1_overall(df):
    """步骤1：整体在各时间窗口的指标 + MAT/YTD 同比差值、同比率"""
    rows = []
    for name, months in WINDOWS.items():
        w = filter_window(df, months)
        s = w["销售额"].sum()
        m = w["品线毛利额"].sum()
        g = m / s if s != 0 else np.nan
        rows.append({"时间窗口": name, "销售额": s, "品线毛利额": m, "品线毛利率": g})
    base = pd.DataFrame(rows)

    mat_cur = base[base["时间窗口"] == "MAT2026P1"].iloc[0]
    mat_yoy = base[base["时间窗口"] == "MAT2025P1"].iloc[0]
    ytd_cur = base[base["时间窗口"] == "YTD2026P1"].iloc[0]
    ytd_yoy = base[base["时间窗口"] == "YTD2025P1"].iloc[0]

    def diff_rate(cur, yoy):
        d = cur - yoy
        r = (d / yoy * 100) if yoy != 0 else np.nan
        return d, r

    mat_sale_d, mat_sale_r = diff_rate(mat_cur["销售额"], mat_yoy["销售额"])
    mat_margin_d, mat_margin_r = diff_rate(mat_cur["品线毛利额"], mat_yoy["品线毛利额"])
    mat_gp_d, mat_gp_r = diff_rate(mat_cur["品线毛利率"], mat_yoy["品线毛利率"])
    ytd_sale_d, ytd_sale_r = diff_rate(ytd_cur["销售额"], ytd_yoy["销售额"])
    ytd_margin_d, ytd_margin_r = diff_rate(ytd_cur["品线毛利额"], ytd_yoy["品线毛利额"])
    ytd_gp_d, ytd_gp_r = diff_rate(ytd_cur["品线毛利率"], ytd_yoy["品线毛利率"])

    base["MAT同比差值_销售额"] = np.nan
    base["MAT同比率%_销售额"] = np.nan
    base.loc[base["时间窗口"] == "MAT2026P1", "MAT同比差值_销售额"] = mat_sale_d
    base.loc[base["时间窗口"] == "MAT2026P1", "MAT同比率%_销售额"] = mat_sale_r
    base["MAT同比差值_品线毛利额"] = np.nan
    base["MAT同比率%_品线毛利额"] = np.nan
    base.loc[base["时间窗口"] == "MAT2026P1", "MAT同比差值_品线毛利额"] = mat_margin_d
    base.loc[base["时间窗口"] == "MAT2026P1", "MAT同比率%_品线毛利额"] = mat_margin_r
    base["MAT同比差值_品线毛利率"] = np.nan
    base["MAT同比率%_品线毛利率"] = np.nan
    base.loc[base["时间窗口"] == "MAT2026P1", "MAT同比差值_品线毛利率"] = mat_gp_d
    base.loc[base["时间窗口"] == "MAT2026P1", "MAT同比率%_品线毛利率"] = mat_gp_r
    base["YTD同比差值_销售额"] = np.nan
    base["YTD同比率%_销售额"] = np.nan
    base.loc[base["时间窗口"] == "YTD2026P1", "YTD同比差值_销售额"] = ytd_sale_d
    base.loc[base["时间窗口"] == "YTD2026P1", "YTD同比率%_销售额"] = ytd_sale_r
    base["YTD同比差值_品线毛利额"] = np.nan
    base["YTD同比率%_品线毛利额"] = np.nan
    base.loc[base["时间窗口"] == "YTD2026P1", "YTD同比差值_品线毛利额"] = ytd_margin_d
    base.loc[base["时间窗口"] == "YTD2026P1", "YTD同比率%_品线毛利额"] = ytd_margin_r
    base["YTD同比差值_品线毛利率"] = np.nan
    base["YTD同比率%_品线毛利率"] = np.nan
    base.loc[base["时间窗口"] == "YTD2026P1", "YTD同比差值_品线毛利率"] = ytd_gp_d
    base.loc[base["时间窗口"] == "YTD2026P1", "YTD同比率%_品线毛利率"] = ytd_gp_r
    return base


def step2_platform_region(df):
    """步骤2：分平台×区域 各时间窗口指标 + MAT/YTD 同比，合并为一表"""
    parts = []
    for (platform, region), g in df.groupby(["平台", "区域"]):
        row = {"平台": platform, "区域": region}
        for name, months in WINDOWS.items():
            w = filter_window(g, months)
            s = w["销售额"].sum()
            m = w["品线毛利额"].sum()
            gp = m / s if s != 0 else np.nan
            row[f"{name}_销售额"] = s
            row[f"{name}_品线毛利额"] = m
            row[f"{name}_品线毛利率"] = gp
        parts.append(row)
    pr = pd.DataFrame(parts)

    # MAT 同比
    pr["MAT同比差值_销售额"] = pr["MAT2026P1_销售额"] - pr["MAT2025P1_销售额"]
    pr["MAT同比率%_销售额"] = (pr["MAT同比差值_销售额"] / pr["MAT2025P1_销售额"].replace(0, np.nan) * 100)
    pr["MAT同比差值_品线毛利额"] = pr["MAT2026P1_品线毛利额"] - pr["MAT2025P1_品线毛利额"]
    pr["MAT同比率%_品线毛利额"] = (pr["MAT同比差值_品线毛利额"] / pr["MAT2025P1_品线毛利额"].replace(0, np.nan) * 100)
    pr["MAT同比差值_品线毛利率"] = pr["MAT2026P1_品线毛利率"] - pr["MAT2025P1_品线毛利率"]
    pr["MAT同比率%_品线毛利率"] = (pr["MAT同比差值_品线毛利率"] / pr["MAT2025P1_品线毛利率"].replace(0, np.nan) * 100)
    # YTD 同比
    pr["YTD同比差值_销售额"] = pr["YTD2026P1_销售额"] - pr["YTD2025P1_销售额"]
    pr["YTD同比率%_销售额"] = (pr["YTD同比差值_销售额"] / pr["YTD2025P1_销售额"].replace(0, np.nan) * 100)
    pr["YTD同比差值_品线毛利额"] = pr["YTD2026P1_品线毛利额"] - pr["YTD2025P1_品线毛利额"]
    pr["YTD同比率%_品线毛利额"] = (pr["YTD同比差值_品线毛利额"] / pr["YTD2025P1_品线毛利额"].replace(0, np.nan) * 100)
    pr["YTD同比差值_品线毛利率"] = pr["YTD2026P1_品线毛利率"] - pr["YTD2025P1_品线毛利率"]
    pr["YTD同比率%_品线毛利率"] = (pr["YTD同比差值_品线毛利率"] / pr["YTD2025P1_品线毛利率"].replace(0, np.nan) * 100)
    return pr


def step3_platform_attribution(df, overall_by_window):
    """步骤3：各平台对整体毛利额、整体毛利率的贡献占比"""
    rows = []
    for wname, months in WINDOWS.items():
        w = filter_window(df, months)
        total_sale = w["销售额"].sum()
        total_margin = w["品线毛利额"].sum()
        overall_gp = total_margin / total_sale if total_sale else np.nan
        for platform, g in w.groupby("平台"):
            s = g["销售额"].sum()
            m = g["品线毛利额"].sum()
            gp = m / s if s else np.nan
            contrib_margin = m / total_margin * 100 if total_margin else np.nan
            contrib_gp = (m / total_sale) / (total_margin / total_sale) * 100 if total_sale and total_margin else np.nan  # = m/total_margin*100
            rows.append({
                "时间窗口": wname, "平台": platform,
                "销售额": s, "品线毛利额": m, "品线毛利率": gp,
                "对整体毛利额贡献占比%": contrib_margin,
                "对整体毛利率贡献占比%": contrib_gp,
            })
    return pd.DataFrame(rows)


def step4_region_attribution(df):
    """步骤4：各区域对整体毛利额、整体毛利率的贡献占比"""
    rows = []
    for wname, months in WINDOWS.items():
        w = filter_window(df, months)
        total_sale = w["销售额"].sum()
        total_margin = w["品线毛利额"].sum()
        for region, g in w.groupby("区域"):
            s = g["销售额"].sum()
            m = g["品线毛利额"].sum()
            gp = m / s if s else np.nan
            contrib_margin = m / total_margin * 100 if total_margin else np.nan
            contrib_gp = m / total_margin * 100 if total_margin else np.nan
            rows.append({
                "时间窗口": wname, "区域": region,
                "销售额": s, "品线毛利额": m, "品线毛利率": gp,
                "对整体毛利额贡献占比%": contrib_margin,
                "对整体毛利率贡献占比%": contrib_gp,
            })
    return pd.DataFrame(rows)


def step5_platform_gp_change_contribution(df):
    """步骤5：各平台品线毛利率同比波动对整体毛利率波动的贡献率、贡献占比、正负"""
    w_cur = filter_window(df, MAT2026P1_MONTHS)
    w_yoy = filter_window(df, MAT2025P1_MONTHS)
    total_sale_cur = w_cur["销售额"].sum()
    total_sale_yoy = w_yoy["销售额"].sum()
    gp_overall_cur = w_cur["品线毛利额"].sum() / total_sale_cur if total_sale_cur else np.nan
    gp_overall_yoy = w_yoy["品线毛利额"].sum() / total_sale_yoy if total_sale_yoy else np.nan
    delta_overall_mat = gp_overall_cur - gp_overall_yoy

    w_cur_ytd = filter_window(df, YTD2026P1_MONTHS)
    w_yoy_ytd = filter_window(df, YTD2025P1_MONTHS)
    ts_cur_ytd = w_cur_ytd["销售额"].sum()
    ts_yoy_ytd = w_yoy_ytd["销售额"].sum()
    gp_overall_cur_ytd = w_cur_ytd["品线毛利额"].sum() / ts_cur_ytd if ts_cur_ytd else np.nan
    gp_overall_yoy_ytd = w_yoy_ytd["品线毛利额"].sum() / ts_yoy_ytd if ts_yoy_ytd else np.nan
    delta_overall_ytd = gp_overall_cur_ytd - gp_overall_yoy_ytd

    rows = []
    # MAT
    for platform in w_cur["平台"].unique():
        c_cur = w_cur[w_cur["平台"] == platform]
        c_yoy = w_yoy[w_yoy["平台"] == platform]
        s_cur = c_cur["销售额"].sum()
        s_yoy = c_yoy["销售额"].sum()
        share_cur = s_cur / total_sale_cur if total_sale_cur else 0
        gp_cur = c_cur["品线毛利额"].sum() / s_cur if s_cur else np.nan
        gp_yoy = c_yoy["品线毛利额"].sum() / s_yoy if s_yoy else np.nan
        delta_gp = gp_cur - gp_yoy if (pd.notna(gp_cur) and pd.notna(gp_yoy)) else np.nan
        contrib = share_cur * delta_gp if pd.notna(delta_gp) else np.nan
        pct = (contrib / delta_overall_mat * 100) if (delta_overall_mat != 0 and pd.notna(contrib)) else np.nan
        sign = "正贡献" if contrib and contrib > 0 else ("负贡献" if contrib and contrib < 0 else "")
        rows.append({
            "时间窗口": "MAT2026P1 vs MAT2025P1", "平台": platform,
            "当期销售额占比": share_cur, "当期品线毛利率": gp_cur, "同期品线毛利率": gp_yoy,
            "品线毛利率同比波动": delta_gp, "对整体毛利率波动贡献率": contrib,
            "贡献占比%": pct, "正负贡献": sign,
        })
    # YTD
    for platform in w_cur_ytd["平台"].unique():
        c_cur = w_cur_ytd[w_cur_ytd["平台"] == platform]
        c_yoy = w_yoy_ytd[w_yoy_ytd["平台"] == platform]
        s_cur = c_cur["销售额"].sum()
        s_yoy = c_yoy["销售额"].sum()
        share_cur = s_cur / ts_cur_ytd if ts_cur_ytd else 0
        gp_cur = c_cur["品线毛利额"].sum() / s_cur if s_cur else np.nan
        gp_yoy = c_yoy["品线毛利额"].sum() / s_yoy if s_yoy else np.nan
        delta_gp = gp_cur - gp_yoy if (pd.notna(gp_cur) and pd.notna(gp_yoy)) else np.nan
        contrib = share_cur * delta_gp if pd.notna(delta_gp) else np.nan
        pct = (contrib / delta_overall_ytd * 100) if (delta_overall_ytd != 0 and pd.notna(contrib)) else np.nan
        sign = "正贡献" if contrib and contrib > 0 else ("负贡献" if contrib and contrib < 0 else "")
        rows.append({
            "时间窗口": "YTD2026P1 vs YTD2025P1", "平台": platform,
            "当期销售额占比": share_cur, "当期品线毛利率": gp_cur, "同期品线毛利率": gp_yoy,
            "品线毛利率同比波动": delta_gp, "对整体毛利率波动贡献率": contrib,
            "贡献占比%": pct, "正负贡献": sign,
        })
    return pd.DataFrame(rows)


def step6_platform_region_gp_change_contribution(df):
    """步骤6：各 平台×区域 品线毛利率同比波动对整体毛利率波动的贡献"""
    w_cur = filter_window(df, MAT2026P1_MONTHS)
    w_yoy = filter_window(df, MAT2025P1_MONTHS)
    total_sale_cur = w_cur["销售额"].sum()
    total_sale_yoy = w_yoy["销售额"].sum()
    gp_overall_cur = w_cur["品线毛利额"].sum() / total_sale_cur if total_sale_cur else np.nan
    gp_overall_yoy = w_yoy["品线毛利额"].sum() / total_sale_yoy if total_sale_yoy else np.nan
    delta_overall_mat = gp_overall_cur - gp_overall_yoy

    w_cur_ytd = filter_window(df, YTD2026P1_MONTHS)
    w_yoy_ytd = filter_window(df, YTD2025P1_MONTHS)
    ts_cur_ytd = w_cur_ytd["销售额"].sum()
    ts_yoy_ytd = w_yoy_ytd["销售额"].sum()
    gp_overall_cur_ytd = w_cur_ytd["品线毛利额"].sum() / ts_cur_ytd if ts_cur_ytd else np.nan
    gp_overall_yoy_ytd = w_yoy_ytd["品线毛利额"].sum() / ts_yoy_ytd if ts_yoy_ytd else np.nan
    delta_overall_ytd = gp_overall_cur_ytd - gp_overall_yoy_ytd

    rows = []
    for (platform, region), _ in df.groupby(["平台", "区域"]):
        c_cur = w_cur[(w_cur["平台"] == platform) & (w_cur["区域"] == region)]
        c_yoy = w_yoy[(w_yoy["平台"] == platform) & (w_yoy["区域"] == region)]
        s_cur = c_cur["销售额"].sum()
        s_yoy = c_yoy["销售额"].sum()
        share_cur = s_cur / total_sale_cur if total_sale_cur else 0
        gp_cur = c_cur["品线毛利额"].sum() / s_cur if s_cur else np.nan
        gp_yoy = c_yoy["品线毛利额"].sum() / s_yoy if s_yoy else np.nan
        delta_gp = gp_cur - gp_yoy if (pd.notna(gp_cur) and pd.notna(gp_yoy)) else np.nan
        contrib = share_cur * delta_gp if pd.notna(delta_gp) else np.nan
        pct = (contrib / delta_overall_mat * 100) if (delta_overall_mat != 0 and pd.notna(contrib)) else np.nan
        sign = "正贡献" if contrib and contrib > 0 else ("负贡献" if contrib and contrib < 0 else "")
        rows.append({
            "时间窗口": "MAT2026P1 vs MAT2025P1", "平台": platform, "区域": region,
            "当期销售额占比": share_cur, "当期品线毛利率": gp_cur, "同期品线毛利率": gp_yoy,
            "品线毛利率同比波动": delta_gp, "对整体毛利率波动贡献率": contrib,
            "贡献占比%": pct, "正负贡献": sign,
        })
    for (platform, region), _ in df.groupby(["平台", "区域"]):
        c_cur = w_cur_ytd[(w_cur_ytd["平台"] == platform) & (w_cur_ytd["区域"] == region)]
        c_yoy = w_yoy_ytd[(w_yoy_ytd["平台"] == platform) & (w_yoy_ytd["区域"] == region)]
        s_cur = c_cur["销售额"].sum()
        s_yoy = c_yoy["销售额"].sum()
        share_cur = s_cur / ts_cur_ytd if ts_cur_ytd else 0
        gp_cur = c_cur["品线毛利额"].sum() / s_cur if s_cur else np.nan
        gp_yoy = c_yoy["品线毛利额"].sum() / s_yoy if s_yoy else np.nan
        delta_gp = gp_cur - gp_yoy if (pd.notna(gp_cur) and pd.notna(gp_yoy)) else np.nan
        contrib = share_cur * delta_gp if pd.notna(delta_gp) else np.nan
        pct = (contrib / delta_overall_ytd * 100) if (delta_overall_ytd != 0 and pd.notna(contrib)) else np.nan
        sign = "正贡献" if contrib and contrib > 0 else ("负贡献" if contrib and contrib < 0 else "")
        rows.append({
            "时间窗口": "YTD2026P1 vs YTD2025P1", "平台": platform, "区域": region,
            "当期销售额占比": share_cur, "当期品线毛利率": gp_cur, "同期品线毛利率": gp_yoy,
            "品线毛利率同比波动": delta_gp, "对整体毛利率波动贡献率": contrib,
            "贡献占比%": pct, "正负贡献": sign,
        })
    return pd.DataFrame(rows)


def step8_conclusions(df, overall_df, platform_attr, region_attr, platform_gp_contrib, pr_gp_contrib):
    """步骤8：归因分析结论文字"""
    w_mat_cur = filter_window(df, MAT2026P1_MONTHS)
    w_mat_yoy = filter_window(df, MAT2025P1_MONTHS)
    w_ytd_cur = filter_window(df, YTD2026P1_MONTHS)
    w_ytd_yoy = filter_window(df, YTD2025P1_MONTHS)
    total_margin_mat = w_mat_cur["品线毛利额"].sum()
    total_margin_ytd = w_ytd_cur["品线毛利额"].sum()
    total_margin_mat_yoy = w_mat_yoy["品线毛利额"].sum()
    total_margin_ytd_yoy = w_ytd_yoy["品线毛利额"].sum()
    gp_mat = total_margin_mat / w_mat_cur["销售额"].sum() if w_mat_cur["销售额"].sum() else np.nan
    gp_ytd = total_margin_ytd / w_ytd_cur["销售额"].sum() if w_ytd_cur["销售额"].sum() else np.nan
    gp_mat_yoy = total_margin_mat_yoy / w_mat_yoy["销售额"].sum() if w_mat_yoy["销售额"].sum() else np.nan
    gp_ytd_yoy = total_margin_ytd_yoy / w_ytd_yoy["销售额"].sum() if w_ytd_yoy["销售额"].sum() else np.nan
    delta_gp_mat = gp_mat - gp_mat_yoy
    delta_gp_ytd = gp_ytd - gp_ytd_yoy

    lines = []
    # 1) 毛利额主要贡献平台及占比变化
    p_mat = platform_attr[(platform_attr["时间窗口"] == "MAT2026P1")][["平台", "对整体毛利额贡献占比%"]].sort_values("对整体毛利额贡献占比%", ascending=False)
    p_ytd = platform_attr[(platform_attr["时间窗口"] == "YTD2026P1")][["平台", "对整体毛利额贡献占比%"]].sort_values("对整体毛利额贡献占比%", ascending=False)
    p_mat_yoy = platform_attr[(platform_attr["时间窗口"] == "MAT2025P1")][["平台", "对整体毛利额贡献占比%"]].set_index("平台")["对整体毛利额贡献占比%"]
    p_ytd_yoy = platform_attr[(platform_attr["时间窗口"] == "YTD2025P1")][["平台", "对整体毛利额贡献占比%"]].set_index("平台")["对整体毛利额贡献占比%"]
    lines.append("一、MAT2026P1 与 YTD2026P1 整体毛利额主要贡献平台及占比变化")
    lines.append("")
    lines.append("MAT2026P1 各平台毛利额贡献占比（从高到低）：")
    for _, r in p_mat.iterrows():
        ch = ""
        if r["平台"] in p_mat_yoy.index:
            ch = f"（同期 {p_mat_yoy[r['平台']]:.1f}%，变化 {r['对整体毛利额贡献占比%'] - p_mat_yoy[r['平台']]:+.1f}pp）"
        lines.append(f"  - {r['平台']}: {r['对整体毛利额贡献占比%']:.1f}% {ch}")
    lines.append("")
    lines.append("YTD2026P1 各平台毛利额贡献占比（从高到低）：")
    for _, r in p_ytd.iterrows():
        ch = ""
        if r["平台"] in p_ytd_yoy.index:
            ch = f"（同期 {p_ytd_yoy[r['平台']]:.1f}%，变化 {r['对整体毛利额贡献占比%'] - p_ytd_yoy[r['平台']]:+.1f}pp）"
        lines.append(f"  - {r['平台']}: {r['对整体毛利额贡献占比%']:.1f}% {ch}")
    lines.append("")

    # 2) 毛利率同比波动主要贡献平台及区域正负贡献
    lines.append("二、MAT2026P1 与 YTD2026P1 整体毛利率同比波动主要贡献平台及需关注的区域")
    lines.append("")
    lines.append(f"MAT2026P1 整体毛利率同比波动：{delta_gp_mat:.4f}（同期→当期）。")
    pm = platform_gp_contrib[platform_gp_contrib["时间窗口"] == "MAT2026P1 vs MAT2025P1"].copy()
    pm = pm.reindex(pm["贡献占比%"].abs().sort_values(ascending=False).index)
    for _, r in pm.iterrows():
        lines.append(f"  - {r['平台']}: 贡献率 {r['对整体毛利率波动贡献率']:.4f}, 贡献占比 {r['贡献占比%']:.1f}%, {r['正负贡献']}")
    lines.append("")
    pr_mat = pr_gp_contrib[pr_gp_contrib["时间窗口"] == "MAT2026P1 vs MAT2025P1"]
    for platform in pr_mat["平台"].unique():
        sub = pr_mat[pr_mat["平台"] == platform].copy()
        sub = sub.reindex(sub["贡献占比%"].abs().sort_values(ascending=False).index)
        pos = sub[sub["正负贡献"] == "正贡献"]
        neg = sub[sub["正负贡献"] == "负贡献"]
        lines.append(f"  【{platform}】正贡献较大区域: {', '.join(pos.head(3)['区域'].astype(str).tolist()) or '无'}; 负贡献较大区域: {', '.join(neg.head(3)['区域'].astype(str).tolist()) or '无'}")
    lines.append("")
    lines.append(f"YTD2026P1 整体毛利率同比波动：{delta_gp_ytd:.4f}。")
    py = platform_gp_contrib[platform_gp_contrib["时间窗口"] == "YTD2026P1 vs YTD2025P1"].copy()
    py = py.reindex(py["贡献占比%"].abs().sort_values(ascending=False).index)
    for _, r in py.iterrows():
        lines.append(f"  - {r['平台']}: 贡献率 {r['对整体毛利率波动贡献率']:.4f}, 贡献占比 {r['贡献占比%']:.1f}%, {r['正负贡献']}")
    lines.append("")
    pr_ytd = pr_gp_contrib[pr_gp_contrib["时间窗口"] == "YTD2026P1 vs YTD2025P1"]
    for platform in pr_ytd["平台"].unique():
        sub = pr_ytd[pr_ytd["平台"] == platform].copy()
        sub = sub.reindex(sub["贡献占比%"].abs().sort_values(ascending=False).index)
        pos = sub[sub["正负贡献"] == "正贡献"]
        neg = sub[sub["正负贡献"] == "负贡献"]
        lines.append(f"  【{platform}】正贡献较大区域: {', '.join(pos.head(3)['区域'].astype(str).tolist()) or '无'}; 负贡献较大区域: {', '.join(neg.head(3)['区域'].astype(str).tolist()) or '无'}")
    lines.append("")

    # 3) 其他洞察
    lines.append("三、其他数据洞察")
    lines.append("")
    region_mat = region_attr[region_attr["时间窗口"] == "MAT2026P1"][["区域", "对整体毛利额贡献占比%"]].sort_values("对整体毛利额贡献占比%", ascending=False)
    lines.append("MAT2026P1 区域毛利额贡献（前五）: " + "; ".join([f"{r['区域']} {r['对整体毛利额贡献占比%']:.1f}%" for _, r in region_mat.head(5).iterrows()]))
    lines.append("")
    overall = overall_df[overall_df["时间窗口"].isin(["MAT2026P1", "YTD2026P1"])][["时间窗口", "销售额", "品线毛利额", "品线毛利率"]]
    lines.append("整体规模与盈利: " + overall.to_string(index=False))
    return "\n".join(lines)


def main():
    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    DOC_DIR.mkdir(parents=True, exist_ok=True)
    CHECK_DIR.mkdir(parents=True, exist_ok=True)
    df = load_data()
    print("行数:", len(df))

    # 描述性统计
    describe_and_save(df)

    # 整体
    overall_df = step1_overall(df)

    # 分平台×区域
    pr_df = step2_platform_region(df)

    # 步骤3、4、5、6
    overall_by_window = {r["时间窗口"]: r for _, r in overall_df.iterrows()}
    platform_attr = step3_platform_attribution(df, overall_by_window)
    region_attr = step4_region_attribution(df)
    platform_gp_contrib = step5_platform_gp_change_contribution(df)
    pr_gp_contrib = step6_platform_region_gp_change_contribution(df)

    # 步骤8 结论
    conclusion_text = step8_conclusions(df, overall_df, platform_attr, region_attr, platform_gp_contrib, pr_gp_contrib)
    with open(OUT_CONCLUSION, "w", encoding="utf-8") as f:
        f.write(conclusion_text)
    print("归因结论已写入:", OUT_CONCLUSION)

    # 步骤7：写入新 Excel（步骤2 表 + 步骤3/4/5/6 各 sheet）
    with pd.ExcelWriter(OUT_EXCEL, engine="openpyxl") as w:
        overall_df.to_excel(w, sheet_name="整体指标", index=False)
        pr_df.to_excel(w, sheet_name="分平台×区域", index=False)
        platform_attr.to_excel(w, sheet_name="平台归因_毛利额与毛利率贡献", index=False)
        region_attr.to_excel(w, sheet_name="区域归因_毛利额与毛利率贡献", index=False)
        platform_gp_contrib.to_excel(w, sheet_name="平台毛利率波动贡献", index=False)
        pr_gp_contrib.to_excel(w, sheet_name="平台×区域毛利率波动贡献", index=False)
        pd.DataFrame([{"归因分析结论": conclusion_text}]).to_excel(w, sheet_name="归因分析结论", index=False)
    print("结果表已保存:", OUT_EXCEL)


if __name__ == "__main__":
    main()
