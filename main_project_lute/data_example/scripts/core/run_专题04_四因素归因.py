# -*- coding: utf-8 -*-
"""
专题四（Sheet④）：客品数、品单价、订单数、前台毛利率 对整体毛利额/毛利率的归因
数据源：专题一：分析数据总表.xlsx，Sheet ④
时间窗口：YTD2026P1（2026-01～2026-02），YTD2026P1 同期（2025-01～2025-02）
关系：前台毛利额 = 客品数 × 品单价 × 订单数 × 前台毛利率；毛利率 = 毛利额/销售额 = 前台毛利率
"""
import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "原始数据"
TOPIC_DIR = BASE_DIR / "专题产物" / "专题04"
TABLE_DIR = TOPIC_DIR / "表格"
DOC_DIR = TOPIC_DIR / "文档"
SRC_EXCEL = DATA_DIR / "专题一：分析数据总表.xlsx"
OUT_EXCEL = TABLE_DIR / "专题04_表格_四因素归因结果.xlsx"
OUT_INSIGHT = DOC_DIR / "专题04_文档_归因洞察.txt"
OUT_BUSINESS = DOC_DIR / "专题04_文档_四因素归因业务洞察.md"

SHEET_NAME = "④"
YTD2026P1_MONTHS = ["2026-01", "2026-02"]
YTD2025P2_MONTHS = ["2025-01", "2025-02"]


def load_data():
    df = pd.read_excel(SRC_EXCEL, sheet_name=SHEET_NAME)
    df["月份"] = df["年月"].astype(str).str[:7]
    return df


def filter_window(df, months):
    return df[df["月份"].isin(months)].copy()


def aggregate_window(wdf):
    """单窗口汇总：毛利额、销售额、订单数、销量 → 客品数=销量/订单数，品单价=销售额/销量，前台毛利率=毛利额/销售额"""
    total_sale = wdf["销售额"].sum()
    total_orders = wdf["订单数"].sum()
    total_qty = wdf["销量"].sum()
    total_margin = wdf["前台毛利额"].sum()
    if total_orders <= 0:
        c = np.nan  # 客品数
    else:
        c = total_qty / total_orders
    if total_qty <= 0:
        p = np.nan  # 品单价
    else:
        p = total_sale / total_qty
    if total_sale <= 0:
        gp = np.nan
    else:
        gp = total_margin / total_sale
    return {
        "毛利额": total_margin,
        "销售额": total_sale,
        "订单数": total_orders,
        "销量": total_qty,
        "客品数": c,
        "品单价": p,
        "前台毛利率": gp,
    }


def main():
    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    DOC_DIR.mkdir(parents=True, exist_ok=True)
    df = load_data()
    df_26 = filter_window(df, YTD2026P1_MONTHS)
    df_25 = filter_window(df, YTD2025P2_MONTHS)
    a26 = aggregate_window(df_26)
    a25 = aggregate_window(df_25)

    def yoy(v26, v25):
        if v25 is None or (isinstance(v25, float) and (np.isnan(v25) or v25 == 0)):
            return np.nan
        return (v26 - v25) / abs(v25)

    m26, m25 = a26["毛利额"], a25["毛利额"]
    c26, c25 = a26["客品数"], a25["客品数"]
    p26, p25 = a26["品单价"], a25["品单价"]
    n26, n25 = a26["订单数"], a25["订单数"]
    g26, g25 = a26["前台毛利率"], a25["前台毛利率"]

    yoy_margin = yoy(m26, m25)
    yoy_c = yoy(c26, c25)
    yoy_p = yoy(p26, p25)
    yoy_n = yoy(n26, n25)
    yoy_g = yoy(g26, g25)

    delta_gp_pp = (g26 - g25) * 100 if not (np.isnan(g26) or np.isnan(g25)) else np.nan
    delta_margin = m26 - m25

    # 对毛利率同比：毛利率 = 毛利额/销售额 = 前台毛利率 → 仅前台毛利率有贡献
    contrib_c_gp = contrib_p_gp = contrib_n_gp = 0.0
    contrib_g_gp = delta_gp_pp if not np.isnan(delta_gp_pp) else 0.0
    total_gp = contrib_c_gp + contrib_p_gp + contrib_n_gp + contrib_g_gp
    if abs(total_gp) < 1e-10:
        total_gp = 1e-10
    share_c_gp = 0.0
    share_p_gp = 0.0
    share_n_gp = 0.0
    share_g_gp = contrib_g_gp / total_gp * 100 if total_gp != 0 else 100.0

    # 对毛利额同比：M = C×P×N×G，dM ≈ P·N·G·dC + C·N·G·dP + C·P·G·dN + C·P·N·dG，基期 25
    cont_c = (p25 * n25 * g25) * (c26 - c25) if not np.isnan(p25 * n25 * g25) else 0.0
    cont_p = (c25 * n25 * g25) * (p26 - p25) if not np.isnan(c25 * n25 * g25) else 0.0
    cont_n = (c25 * p25 * g25) * (n26 - n25) if not np.isnan(c25 * p25 * g25) else 0.0
    cont_g = (c25 * p25 * n25) * (g26 - g25) if not np.isnan(c25 * p25 * n25) else 0.0
    if abs(delta_margin) < 1e-10:
        delta_margin = 1e-10
    share_c = cont_c / delta_margin * 100
    share_p = cont_p / delta_margin * 100
    share_n = cont_n / delta_margin * 100
    share_g = cont_g / delta_margin * 100

    # 表1：两窗口整体指标
    table1 = pd.DataFrame([
        {"时间窗口": "YTD2026P1", "毛利额": m26, "销售额": a26["销售额"], "订单数": n26, "销量": a26["销量"],
         "客品数": c26, "品单价": p26, "前台毛利率": g26},
        {"时间窗口": "YTD2025P2同期", "毛利额": m25, "销售额": a25["销售额"], "订单数": n25, "销量": a25["销量"],
         "客品数": c25, "品单价": p25, "前台毛利率": g25},
    ])
    table2 = pd.DataFrame([{
        "毛利额同比": yoy_margin, "客品数同比": yoy_c, "品单价同比": yoy_p, "订单数同比": yoy_n, "前台毛利率同比": yoy_g,
        "整体毛利率同比波动_pp": delta_gp_pp,
    }])
    table3 = pd.DataFrame([
        {"因素": "客品数", "贡献率_pp": contrib_c_gp, "贡献占比_%": share_c_gp},
        {"因素": "品单价", "贡献率_pp": contrib_p_gp, "贡献占比_%": share_p_gp},
        {"因素": "订单数", "贡献率_pp": contrib_n_gp, "贡献占比_%": share_n_gp},
        {"因素": "前台毛利率", "贡献率_pp": contrib_g_gp, "贡献占比_%": share_g_gp},
    ])
    table4 = pd.DataFrame([
        {"因素": "客品数", "贡献额": cont_c, "贡献占比_%": share_c},
        {"因素": "品单价", "贡献额": cont_p, "贡献占比_%": share_p},
        {"因素": "订单数", "贡献额": cont_n, "贡献占比_%": share_n},
        {"因素": "前台毛利率", "贡献额": cont_g, "贡献占比_%": share_g},
    ])

    with pd.ExcelWriter(OUT_EXCEL, engine="openpyxl") as w:
        table1.to_excel(w, sheet_name="两窗口整体指标", index=False)
        table2.to_excel(w, sheet_name="同比率与毛利率波动", index=False)
        table3.to_excel(w, sheet_name="归因贡献率与贡献占比", index=False)
        table4.to_excel(w, sheet_name="归因毛利额贡献", index=False)

    lines = [
        "专题四（Sheet④）客品数、品单价、订单数、前台毛利率 对整体毛利额/毛利率的归因",
        "时间窗口：YTD2026P1（2026-01～2026-02）vs YTD2025P2 同期（2025-01～2025-02）",
        "数据来源：专题一分析数据总表 Sheet④",
        "",
        "一、两窗口整体指标",
        f"YTD2026P1：毛利额 {m26:,.0f}，客品数 {c26:.4f}，品单价 {p26:,.2f}，订单数 {n26:,}，前台毛利率 {g26:.2%}",
        f"YTD2025P2同期：毛利额 {m25:,.0f}，客品数 {c25:.4f}，品单价 {p25:,.2f}，订单数 {n25:,}，前台毛利率 {g25:.2%}",
        "",
        "二、同比率",
        f"毛利额同比：{yoy_margin:.2%}" if not np.isnan(yoy_margin) else "毛利额同比：—",
        f"客品数同比：{yoy_c:.2%}" if not np.isnan(yoy_c) else "客品数同比：—",
        f"品单价同比：{yoy_p:.2%}" if not np.isnan(yoy_p) else "品单价同比：—",
        f"订单数同比：{yoy_n:.2%}" if not np.isnan(yoy_n) else "订单数同比：—",
        f"前台毛利率同比：{yoy_g:.2%}" if not np.isnan(yoy_g) else "前台毛利率同比：—",
        f"整体毛利率同比波动：{delta_gp_pp:+.2f}pp",
        "",
        "三、对毛利率同比波动的归因（偏微分）",
        "毛利率 = 毛利额/销售额 = 前台毛利率，故仅前台毛利率有贡献。",
        f"客品数/品单价/订单数：0 pp；前台毛利率：{contrib_g_gp:+.2f}pp，贡献占比 {share_g_gp:.1f}%。",
        "",
        "四、对毛利额同比波动的归因（M=C×P×N×G，基期=同期）",
        f"客品数：贡献额 {cont_c:,.0f}，贡献占比 {share_c:.1f}%",
        f"品单价：贡献额 {cont_p:,.0f}，贡献占比 {share_p:.1f}%",
        f"订单数：贡献额 {cont_n:,.0f}，贡献占比 {share_n:.1f}%",
        f"前台毛利率：贡献额 {cont_g:,.0f}，贡献占比 {share_g:.1f}%",
    ]
    with open(OUT_INSIGHT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    # 业务洞察（基于四因素对毛利额贡献）
    business_lines = [
        "# 专题四（Sheet④）四因素对整体毛利额贡献 — 业务洞察",
        "",
        "**时间窗口**：YTD2026P1 vs YTD2025P2 同期 | **关系**：前台毛利额 = 客品数 × 品单价 × 订单数 × 前台毛利率",
        "",
        "## 一、归因结果摘要",
        "",
        f"| 因素 | 贡献额 | 贡献占比 | 同比方向 |",
        f"|------|--------|----------|----------|",
        f"| 客品数 | {cont_c:,.0f} | {share_c:.1f}% | {('↑' if c26 >= c25 else '↓')} |",
        f"| 品单价 | {cont_p:,.0f} | {share_p:.1f}% | {('↑' if p26 >= p25 else '↓')} |",
        f"| 订单数 | {cont_n:,.0f} | {share_n:.1f}% | {('↑' if n26 >= n25 else '↓')} |",
        f"| 前台毛利率 | {cont_g:,.0f} | {share_g:.1f}% | {('↑' if g26 >= g25 else '↓')} |",
        "",
        "## 二、业务解读",
        "",
    ]
    # 找出贡献占比最大与最小
    shares = [("客品数", share_c), ("品单价", share_p), ("订单数", share_n), ("前台毛利率", share_g)]
    shares_sorted = sorted(shares, key=lambda x: -abs(x[1]))
    main_driver = shares_sorted[0]
    business_lines.append(f"- **主驱动**：{main_driver[0]} 对毛利额同比变动的贡献占比最高（{main_driver[1]:.1f}%），是当期毛利额同比变化的主要来源。")
    business_lines.append("")
    if share_n > 0 and n26 > n25:
        business_lines.append("- **订单数**：订单数同比增加直接放大「客品数×品单价×前台毛利率」的产出，反映获客/复购或流量转化提升；若占比高说明本期增长偏「量驱动」。")
    if share_p > 0 and p26 > p25:
        business_lines.append("- **品单价**：品单价同比上升贡献为正，说明客单价或高单价品类占比提升拉高毛利额；需结合折扣与品类结构看是否可持续。")
    if share_c != 0:
        business_lines.append("- **客品数**：客品数（每单件数）变化反映篮件数/连带；同比升则有利于摊薄单笔履约与获客成本，反之则需关注购物车深度与组合推荐。")
    if share_g < 0 and g26 < g25:
        business_lines.append("- **前台毛利率**：前台毛利率同比下滑拖累毛利额，通常与促销加深、退款或成本上升有关；需从费率与定价两端控毛利。")
    business_lines.extend([
        "",
        "## 三、策略建议",
        "",
        "- 若**订单数**贡献占比高且为正：巩固流量与转化，关注订单数增长的质量（复购、新客结构）与获客成本。",
        "- 若**品单价**贡献占比高且为正：在保持销量前提下适度维持或优化高单价结构，避免过度打折拉低品单价。",
        "- 若**客品数**贡献为负：加强关联推荐、满件优惠或套装，提升篮件数。",
        "- 若**前台毛利率**贡献为负：重点控促销、控退款、控成本，设定毛利底线与促销上限。",
    ])
    with open(OUT_BUSINESS, "w", encoding="utf-8") as f:
        f.write("\n".join(business_lines))

    print("结果已保存:", OUT_EXCEL)
    print("归因洞察已写入:", OUT_INSIGHT)
    print("业务洞察已写入:", OUT_BUSINESS)
    return table1, table2, table3, table4


if __name__ == "__main__":
    main()
