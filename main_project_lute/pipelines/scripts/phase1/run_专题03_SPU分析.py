# -*- coding: utf-8 -*-
"""
专题三（Sheet③）：SPU 维度分析
数据源：专题一：分析数据总表.xlsx，Sheet ③
时间窗口：MAT2026P1（2025-02～2026-01），MAT2025P1 同比（2024-02～2025-01）
"""
import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "原始数据"
TOPIC_DIR = BASE_DIR / "专题产物" / "专题03"
TABLE_DIR = TOPIC_DIR / "表格"
DOC_DIR = TOPIC_DIR / "文档"
SRC_EXCEL = DATA_DIR / "专题一：分析数据总表.xlsx"
OUT_EXCEL = TABLE_DIR / "专题03_表格_SPU分析结果.xlsx"
OUT_INSIGHT = DOC_DIR / "专题03_文档_归因洞察与策略建议.txt"

SHEET_NAME = "③"
MAT2026P1_MONTHS = [f"2025-{m:02d}" for m in range(2, 13)] + ["2026-01"]   # 2025-02～2026-01
MAT2025P1_MONTHS = [f"2024-{m:02d}" for m in range(2, 13)] + ["2025-01"]   # 2024-02～2025-01


def load_data():
    df = pd.read_excel(SRC_EXCEL, sheet_name=SHEET_NAME)
    df = df.dropna(subset=["SPU名称", "月份", "销售额"])
    return df


def filter_window(df, months):
    return df[df["月份"].isin(months)].copy()


# ========== 1. 描述性分析 + 28 定律验证 → 数据表1 ==========
def step1_descriptive_and_28law(df_26, df_25):
    """两时间窗口描述性统计，并验证 20% SPU 是否贡献 80% 销售额、80% 毛利额"""
    def one_window(wdf, label):
        desc = wdf[["销售额", "品线毛利额", "品线毛利率"]].describe()
        # 按 SPU 聚合
        spu = wdf.groupby("SPU名称").agg(销售额=("销售额", "sum"), 品线毛利额=("品线毛利额", "sum")).reset_index()
        spu = spu.sort_values("销售额", ascending=False).reset_index(drop=True)
        spu["销售额_累计"] = spu["销售额"].cumsum()
        spu["品线毛利额_累计"] = spu["品线毛利额"].cumsum()
        total_sale = spu["销售额"].sum()
        total_margin = spu["品线毛利额"].sum()
        spu["销售额_累计占比"] = spu["销售额_累计"] / total_sale if total_sale else 0
        spu["品线毛利额_累计占比"] = spu["品线毛利额_累计"] / total_margin if total_margin else 0
        n = len(spu)
        # 达到 80% 销售额所需的最少 SPU 数
        n80_sale = (spu["销售额_累计占比"] >= 0.80).idxmax() + 1 if (spu["销售额_累计占比"] >= 0.80).any() else n
        n80_margin = (spu["品线毛利额_累计占比"] >= 0.80).idxmax() + 1 if (spu["品线毛利额_累计占比"] >= 0.80).any() else n
        pct_spu_80sale = n80_sale / n * 100 if n else 0
        pct_spu_80margin = n80_margin / n * 100 if n else 0
        return {
            "时间窗口": label,
            "行数": len(wdf),
            "SPU非重复计数": n,
            "销售额合计": total_sale,
            "品线毛利额合计": total_margin,
            "销售额_达到80%所需SPU数": n80_sale,
            "毛利额_达到80%所需SPU数": n80_margin,
            "达到80%销售额的SPU占比%": pct_spu_80sale,
            "达到80%毛利额的SPU占比%": pct_spu_80margin,
            "是否满足28定律_销售额": "是" if pct_spu_80sale <= 25 else "否",
            "是否满足28定律_毛利额": "是" if pct_spu_80margin <= 25 else "否",
        }, desc, spu

    r26, desc26, spu26 = one_window(df_26, "MAT2026P1")
    r25, desc25, spu25 = one_window(df_25, "MAT2025P1")
    table1 = pd.DataFrame([r26, r25])
    return table1, desc26, desc25, spu26, spu25


# ========== 2. 95% 销售额 SPU 筛选 + 品线占比 → 数据表2 ==========
def step2_top95_spu_by_line(df_26, df_25, spu26, spu25):
    """取各窗口贡献 95% 累计销售额的 SPU，再按品线汇总，MAT2026P1 为基准对比 MAT2025P1"""
    total26 = spu26["销售额"].sum()
    cum = 0
    spu_list_26 = []
    for _, row in spu26.iterrows():
        spu_list_26.append(row["SPU名称"])
        cum += row["销售额"]
        if cum >= total26 * 0.95:
            break
    spu_list_26 = set(spu_list_26)

    total25 = spu25["销售额"].sum()
    cum = 0
    spu_list_25 = []
    for _, row in spu25.iterrows():
        spu_list_25.append(row["SPU名称"])
        cum += row["销售额"]
        if cum >= total25 * 0.95:
            break
    spu_list_25 = set(spu_list_25)

    # 以 MAT2026P1 为基准：使用当期 95% SPU 集合，两窗口都只保留该集合内的数据（可比）
    spu_base = spu_list_26
    f26 = df_26[df_26["SPU名称"].isin(spu_base)].copy()
    f25 = df_25[df_25["SPU名称"].isin(spu_base)].copy()

    def by_line(d):
        g = d.groupby("产品品线").agg(销售额=("销售额", "sum"), 品线毛利额=("品线毛利额", "sum")).reset_index()
        t_sale = g["销售额"].sum()
        t_margin = g["品线毛利额"].sum()
        g["销售额贡献占比"] = g["销售额"] / t_sale if t_sale else 0
        g["毛利额贡献占比"] = g["品线毛利额"] / t_margin if t_margin else 0
        return g

    g26 = by_line(f26)
    g25 = by_line(f25)
    g26 = g26.rename(columns={"销售额": "销售额_MAT2026P1", "品线毛利额": "品线毛利额_MAT2026P1", "销售额贡献占比": "销售额贡献占比_MAT2026P1", "毛利额贡献占比": "毛利额贡献占比_MAT2026P1"})
    g25 = g25.rename(columns={"销售额": "销售额_MAT2025P1", "品线毛利额": "品线毛利额_MAT2025P1", "销售额贡献占比": "销售额贡献占比_MAT2025P1", "毛利额贡献占比": "毛利额贡献占比_MAT2025P1"})
    table2 = g26.merge(g25[["产品品线", "销售额_MAT2025P1", "品线毛利额_MAT2025P1", "销售额贡献占比_MAT2025P1", "毛利额贡献占比_MAT2025P1"]], on="产品品线", how="outer")
    return table2, f26, f25, spu_base


# ========== 3. 品线毛利率 7 分箱：<0 一箱 + 0～最大毛利率等距 6 箱 ==========
def step3_gp_bins_7(df_26, df_25):
    """箱1=负毛利(<0)，箱2～7=0～最大毛利率等距 6 箱，固定输出 7 行"""
    def spu_agg(wdf):
        g = wdf.groupby("SPU名称").agg(销售额=("销售额", "sum"), 品线毛利额=("品线毛利额", "sum")).reset_index()
        g["品线毛利率"] = g["品线毛利额"] / g["销售额"].replace(0, np.nan)
        return g
    s26 = spu_agg(df_26)
    s25 = spu_agg(df_25)
    gp_all = pd.concat([s26["品线毛利率"], s25["品线毛利率"]], ignore_index=True).dropna()
    # 最大毛利率（用于 0～max 等距 6 箱）；若无正毛利则用 1
    gp_max = float(gp_all.max()) if len(gp_all) else 1.0
    if gp_max <= 0:
        gp_max = 1.0
    # 0～gp_max 等距 7 个点 → 6 个区间
    edges_pos = np.linspace(0, gp_max, 7)

    def bin_stats(spu_df, label):
        total_margin = spu_df["品线毛利额"].sum() or 1
        rows = []
        # 箱1：负毛利 (<0)
        sub0 = spu_df[spu_df["品线毛利率"] < 0]
        mid0 = float(sub0["品线毛利率"].median()) if len(sub0) else -0.5
        rows.append({
            "时间窗口": label,
            "箱体": "<0",
            "箱序": 1,
            "SPU非重复计数": len(sub0),
            "品线毛利额占比": sub0["品线毛利额"].sum() / total_margin,
            "品效": sub0["品线毛利额"].sum() / len(sub0) if len(sub0) else 0,
            "区间品线毛利率_中值": mid0,
        })
        # 箱2～7：0～gp_max 等距 6 箱
        for i in range(6):
            left, right = float(edges_pos[i]), float(edges_pos[i + 1])
            if i == 0:
                sub = spu_df[(spu_df["品线毛利率"] >= left) & (spu_df["品线毛利率"] <= right)]
            else:
                sub = spu_df[(spu_df["品线毛利率"] > left) & (spu_df["品线毛利率"] <= right)]
            margin_b = sub["品线毛利额"].sum()
            n_spu = len(sub)
            mid = (left + right) / 2
            bin_str = f"({left:.2%},{right:.2%}]"
            rows.append({
                "时间窗口": label,
                "箱体": bin_str,
                "箱序": i + 2,
                "SPU非重复计数": n_spu,
                "品线毛利额占比": margin_b / total_margin,
                "品效": margin_b / n_spu if n_spu else 0,
                "区间品线毛利率_中值": mid,
            })
        return pd.DataFrame(rows)

    t26 = bin_stats(s26, "MAT2026P1")
    t25 = bin_stats(s25, "MAT2025P1")
    return t26, t25, edges_pos


# ========== 4. 各 SPU 对整体毛利率同比波动的贡献率与贡献占比 ==========
def step4_spu_contribution_to_gp_change(f26, f25):
    """以 95% 筛选后的 SPU 为整体，算各 SPU 对整体毛利率同比波动的贡献率(pp)与贡献占比(%)"""
    s26 = f26.groupby("SPU名称").agg(销售额=("销售额", "sum"), 品线毛利额=("品线毛利额", "sum")).reset_index()
    s25 = f25.groupby("SPU名称").agg(销售额=("销售额", "sum"), 品线毛利额=("品线毛利额", "sum")).reset_index()
    s26["品线毛利率"] = s26["品线毛利额"] / s26["销售额"].replace(0, np.nan)
    s25["品线毛利率"] = s25["品线毛利额"] / s25["销售额"].replace(0, np.nan)
    total_sale_26 = s26["销售额"].sum()
    total_sale_25 = s25["销售额"].sum()
    gp_26 = s26["品线毛利额"].sum() / total_sale_26 if total_sale_26 else np.nan
    gp_25 = s25["品线毛利额"].sum() / total_sale_25 if total_sale_25 else np.nan
    delta_gp = (gp_26 - gp_25) * 100  # pp
    merge = s26[["SPU名称", "销售额", "品线毛利额", "品线毛利率"]].merge(
        s25[["SPU名称", "销售额", "品线毛利额", "品线毛利率"]],
        on="SPU名称", suffixes=("_26", "_25"), how="outer"
    )
    merge = merge.fillna(0)
    # 贡献 = 当期销售额占比 * (当期毛利率 - 同期毛利率)，贡献率(pp)
    merge["销售额_26"] = merge["销售额_26"].replace(0, np.nan)
    merge["占比_26"] = merge["销售额_26"] / total_sale_26
    merge["贡献率_pp"] = merge["占比_26"] * (merge["品线毛利率_26"] - merge["品线毛利率_25"].fillna(0)) * 100
    merge["贡献占比%"] = (merge["贡献率_pp"] / delta_gp * 100) if delta_gp and abs(delta_gp) > 1e-10 else np.nan
    return merge, delta_gp, gp_26, gp_25


# ========== 5. 核心正/负贡献 SPU ==========
def step5_core_spu(contrib_df, top_n=15):
    """贡献率排序，取正贡献前 top_n、负贡献前 top_n（按贡献率绝对值）"""
    c = contrib_df.dropna(subset=["贡献率_pp"]).copy()
    c = c.sort_values("贡献率_pp", ascending=False)
    pos = c[c["贡献率_pp"] > 0].head(top_n)
    neg = c[c["贡献率_pp"] < 0].copy()
    neg["贡献率_pp_abs"] = neg["贡献率_pp"].abs()
    neg = neg.sort_values("贡献率_pp_abs", ascending=False).head(top_n)
    return pos, neg


# ========== 6. 归因洞察与前台策略（领导汇报版） ==========
def step6_insight(table1, table2, contrib_df, pos_spu, neg_spu, delta_gp, out_path):
    """生成简单易懂的归因与前台策略建议"""
    lines = [
        "专题三（Sheet③）SPU 分析 — 归因洞察与策略建议（领导汇报版）",
        "时间窗口：MAT2026P1（2025-02～2026-01）vs MAT2025P1（2024-02～2025-01）",
        "数据来源：专题一分析数据总表 Sheet③",
        "",
        "一、核心结论（一句话）",
        f"整体毛利率同比波动：{delta_gp:+.2f}pp。核心正贡献 SPU 以「高销售额占比 + 毛利率提升」拉动；核心负贡献 SPU 以「毛利率下滑或负毛利」拖累。前台要「多卖高毛利、少亏或控亏低毛利」。",
        "",
        "二、28 定律与结构",
    ]
    for _, r in table1.iterrows():
        lines.append(f"• {r['时间窗口']}：{r['SPU非重复计数']} 个 SPU，约 {r['达到80%销售额的SPU占比%']:.1f}% 的 SPU 贡献 80% 销售额，{r['达到80%毛利额的SPU占比%']:.1f}% 的 SPU 贡献 80% 毛利额；28 定律_销售额={r['是否满足28定律_销售额']}，28 定律_毛利额={r['是否满足28定律_毛利额']}。")
    lines.extend([
        "",
        "三、品线结构（95% 销售额 SPU 内）",
    ])
    for _, r in table2.iterrows():
        pl = r.get("产品品线", "")
        lines.append(f"• {pl}：MAT2026P1 销售额占比 {r.get('销售额贡献占比_MAT2026P1',0)*100:.1f}%，毛利额占比 {r.get('毛利额贡献占比_MAT2026P1',0)*100:.1f}%；同比 MAT2025P1 销售额占比 {r.get('销售额贡献占比_MAT2025P1',0)*100:.1f}%，毛利额占比 {r.get('毛利额贡献占比_MAT2025P1',0)*100:.1f}%。")
    lines.extend([
        "",
        "四、核心正贡献 SPU（拉动毛利率提升）",
    ])
    for _, r in pos_spu.head(10).iterrows():
        lines.append(f"  • {r['SPU名称']}：贡献率 {r['贡献率_pp']:+.2f}pp，贡献占比 {r['贡献占比%']:.1f}%。")
    lines.extend([
        "",
        "五、核心负贡献 SPU（拖累毛利率）",
    ])
    for _, r in neg_spu.head(10).iterrows():
        lines.append(f"  • {r['SPU名称']}：贡献率 {r['贡献率_pp']:+.2f}pp，贡献占比 {r['贡献占比%']:.1f}%。")
    lines.extend([
        "",
        "六、归因与洞察",
        "• 正贡献 SPU：多为销售额占比高且毛利率同比改善的品；可归因于定价/促销收紧、成本控制或结构优化。",
        "• 负贡献 SPU：多为毛利率同比下滑或长期低毛利/负毛利品；可归因于清仓、让利冲量、成本上升或滞销。",
        "• 品线维度：若某品线销售额占比升但毛利额占比降，说明该品线「卖得多、赚得少」，需重点看该品线下哪些 SPU 负贡献。",
        "",
        "七、前台如何卖 — 策略建议（简单易懂）",
        "① 多卖「核心正贡献」SPU：主推、备货与流量向这些品倾斜，保持当前定价与促销节奏，不盲目打折。",
        "② 少亏「核心负贡献」SPU：对长期负毛利或严重拖累毛利率的 SPU，收缩推广与促销、清库后考虑下架或改款；若为战略引流款，需设毛利底线与量级上限。",
        "③ 控价与控促：避免全品类一刀切打折；高毛利品少折、低毛利品谨慎加促，大促前用本分析看哪些 SPU 会明显拉低整体毛利。",
        "④ 结构优先：在 28 定律成立的前提下，聚焦 20% 头部 SPU 的毛利与销量；新品或长尾 SPU 先小范围试销，再决定是否放量。",
        "",
        "八、关键词",
        "SPU | 品线毛利率 | 贡献率 | 28定律 | 品线 | 数据来源: 专题一分析数据总表 Sheet③",
    ])
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("归因洞察已写入:", out_path)


def main():
    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    DOC_DIR.mkdir(parents=True, exist_ok=True)
    df = load_data()
    df_26 = filter_window(df, MAT2026P1_MONTHS)
    df_25 = filter_window(df, MAT2025P1_MONTHS)

    table1, desc26, desc25, spu26, spu25 = step1_descriptive_and_28law(df_26, df_25)
    table2, f26, f25, spu_base = step2_top95_spu_by_line(df_26, df_25, spu26, spu25)
    table3_26, table3_25, edges = step3_gp_bins_7(f26, f25)
    contrib_df, delta_gp, gp_26, gp_25 = step4_spu_contribution_to_gp_change(f26, f25)
    pos_spu, neg_spu = step5_core_spu(contrib_df, top_n=15)
    step6_insight(table1, table2, contrib_df, pos_spu, neg_spu, delta_gp, OUT_INSIGHT)

    with pd.ExcelWriter(OUT_EXCEL, engine="openpyxl") as w:
        table1.to_excel(w, sheet_name="数据表1_描述与28定律", index=False)
        table2.to_excel(w, sheet_name="数据表2_95pctSPU品线占比", index=False)
        desc26.to_excel(w, sheet_name="描述性统计_MAT2026P1")
        desc25.to_excel(w, sheet_name="描述性统计_MAT2025P1")
        pd.concat([table3_26, table3_25], ignore_index=True).to_excel(w, sheet_name="数据表3_毛利率7分箱", index=False)
        contrib_df.to_excel(w, sheet_name="各SPU对毛利率波动贡献", index=False)
        pos_spu.to_excel(w, sheet_name="核心正贡献SPU", index=False)
        neg_spu.to_excel(w, sheet_name="核心负贡献SPU", index=False)
    print("结果已保存:", OUT_EXCEL)
    return table1, table2, contrib_df, pos_spu, neg_spu


if __name__ == "__main__":
    main()
