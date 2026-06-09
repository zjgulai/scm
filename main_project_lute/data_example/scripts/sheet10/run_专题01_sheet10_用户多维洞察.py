# -*- coding: utf-8 -*-
"""
专题一：Sheet ⑩ 用户多维度洞察（新版数据结构）

目标：
1) 适配新版 Sheet⑩ 的三类表结构（整体汇总表、新客拉新指标表、新老客分组指标表）
2) 使用新口径：总推广费 = 广告费 + GTM推广费（不含折扣额）
3) 输出 Excel 五张结果表 + 五幕叙事 Markdown + 数据校验日志
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "原始数据"
TOPIC_DIR = BASE_DIR / "专题产物" / "专题01-sheet10"
TABLE_DIR = TOPIC_DIR / "表格"
DOC_DIR = TOPIC_DIR / "文档"
CHECK_DIR = TOPIC_DIR / "校验"
SRC_EXCEL = DATA_DIR / "专题一：分析数据总表.xlsx"
SHEET_NAME = "⑩"

OUT_EXCEL = TABLE_DIR / "专题01-sheet10_表格_用户多维洞察计算结果.xlsx"
OUT_REPORT = DOC_DIR / "专题01-sheet10_文档_用户多维洞察分析结论.md"
OUT_VALIDATION = CHECK_DIR / "专题01-sheet10_校验_数据校验.txt"

BASE_WINDOW = "YTD2026P2"
COMPARE_WINDOW = "YTD2025P2"
WINDOW_ORDER = [BASE_WINDOW, COMPARE_WINDOW]
REGION_ORDER = ["整体", "北美", "欧洲"]
SEGMENT_ORDER = ["整体", "新客", "老客"]

SUM_COLUMNS = [
    "去重客户数",
    "去重订单数",
    "销售额",
    "销量",
    "前台毛利额",
    "广告费",
    "GTM推广费",
    "折扣额",
    "总推广费",
    "新客人数",
    "老客人数",
]

PERCENT_COLUMNS = {
    "前台毛利率",
    "经营毛利率",
    "投入占比",
    "产出占比",
    "资源匹配差",
    "变动率",
    "复购率",
    "广告费占比",
    "GTM推广费占比",
    "折扣力度",
}

METRICS_FOR_COMPARISON = [
    "ARPU值",
    "人均推广费",
    "人均毛利额",
    "人均销售额",
    "人均订单数",
    "订单价",
    "客单价",
    "客品数",
    "品单价",
    "前台毛利率",
    "经营毛利率",
    "每元推广费产出毛利额",
    "折扣力度",
    "CAC",
    "复购率",
]


def safe_div(numerator: float, denominator: float) -> float:
    if denominator is None or pd.isna(denominator) or denominator == 0:
        return np.nan
    return numerator / denominator


def pct_change(current: float, previous: float) -> float:
    if previous is None or pd.isna(previous) or previous == 0:
        return np.nan
    return (current - previous) / previous


def fmt_num(value: float, digits: int = 2) -> str:
    if value is None or pd.isna(value):
        return "-"
    return f"{value:,.{digits}f}"


def fmt_pct(value: float, digits: int = 2) -> str:
    if value is None or pd.isna(value):
        return "-"
    return f"{value * 100:.{digits}f}%"


def load_data() -> pd.DataFrame:
    df = pd.read_excel(SRC_EXCEL, sheet_name=SHEET_NAME)

    required_cols = [
        "表类型",
        "时间窗口",
        "业务区域",
        "客户类型",
        "去重客户数",
        "去重订单数",
        "销售额",
        "销量",
        "前台毛利额",
        "广告费",
        "GTM推广费",
        "折扣额",
        "复购率",
        "ARPU值",
        "新客人数",
        "老客人数",
        "总推广费",
        "订单价",
        "客单价",
        "客品数",
        "品单价",
        "前台毛利率",
        "CAC",
    ]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Sheet⑩ 缺少必要字段: {missing}")

    df = df[required_cols].copy()
    df = df[df["时间窗口"].isin(WINDOW_ORDER)].copy()
    df = df[df["业务区域"].isin(["北美", "欧洲"])].copy()

    for col in ["表类型", "时间窗口", "业务区域"]:
        df[col] = df[col].astype(str)

    df["客户类型"] = df["客户类型"].fillna("整体").astype(str)

    numeric_cols = [c for c in df.columns if c not in ["表类型", "时间窗口", "业务区域", "客户类型"]]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def build_unified_base(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    overall = df[df["表类型"] == "整体汇总表"].copy()
    acquisition = df[df["表类型"] == "新客拉新指标表"].copy()
    segmented = df[df["表类型"] == "新老客分组指标表"].copy()

    overall["客户类型"] = "整体"
    segmented["客户类型"] = segmented["客户类型"].replace({"nan": "整体"})

    unified = pd.concat([overall, segmented], ignore_index=True)
    return unified, overall, acquisition


def append_derived_totals(unified: pd.DataFrame) -> pd.DataFrame:
    rows = []

    for window in WINDOW_ORDER:
        scope_overall = unified[
            (unified["时间窗口"] == window)
            & (unified["业务区域"].isin(["北美", "欧洲"]))
            & (unified["客户类型"] == "整体")
        ]
        if not scope_overall.empty:
            row = {
                "表类型": "派生汇总",
                "时间窗口": window,
                "业务区域": "整体",
                "客户类型": "整体",
            }
            for col in SUM_COLUMNS:
                row[col] = scope_overall[col].sum()
            rows.append(row)

        for segment in ["新客", "老客"]:
            scope_seg = unified[
                (unified["时间窗口"] == window)
                & (unified["业务区域"].isin(["北美", "欧洲"]))
                & (unified["客户类型"] == segment)
            ]
            if scope_seg.empty:
                continue
            row = {
                "表类型": "派生汇总",
                "时间窗口": window,
                "业务区域": "整体",
                "客户类型": segment,
            }
            for col in SUM_COLUMNS:
                row[col] = scope_seg[col].sum()
            rows.append(row)

    if not rows:
        return unified

    derived = pd.DataFrame(rows)
    for col in unified.columns:
        if col not in derived.columns:
            derived[col] = np.nan

    return pd.concat([unified, derived[unified.columns]], ignore_index=True)


def safe_div_series(numerator: pd.Series, denominator: pd.Series) -> pd.Series:
    return numerator / denominator.replace(0, np.nan)


def compute_metrics(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()

    result["总推广费_校验值"] = result["广告费"] + result["GTM推广费"]
    result["经营毛利额"] = result["销售额"] - result["总推广费"]
    result["经营毛利率"] = safe_div_series(result["经营毛利额"], result["销售额"])

    result["人均销售额"] = safe_div_series(result["销售额"], result["去重客户数"])
    result["人均推广费"] = safe_div_series(result["总推广费"], result["去重客户数"])
    result["人均毛利额"] = safe_div_series(result["经营毛利额"], result["去重客户数"])
    result["人均订单数"] = safe_div_series(result["去重订单数"], result["去重客户数"])

    result["ARPU值_校验值"] = safe_div_series(result["销售额"], result["去重客户数"])

    result["每元推广费产出毛利额"] = safe_div_series(result["经营毛利额"], result["总推广费"])
    result["每元推广费产出销售额"] = safe_div_series(result["销售额"], result["总推广费"])

    result["广告费占比"] = safe_div_series(result["广告费"], result["总推广费"])
    result["GTM推广费占比"] = safe_div_series(result["GTM推广费"], result["总推广费"])
    result["折扣力度"] = safe_div_series(result["折扣额"].abs(), result["销售额"])

    result["前台毛利率_校验值"] = safe_div_series(result["前台毛利额"], result["销售额"])
    result["CAC_校验值"] = safe_div_series(result["总推广费"], result["新客人数"])

    # 缺失值回填：派生汇总行优先用公式补齐，避免报告与绘图出现 NaN
    result["ARPU值"] = result["ARPU值"].fillna(result["ARPU值_校验值"])
    result["订单价"] = result["订单价"].fillna(safe_div_series(result["销售额"], result["去重订单数"]))
    result["客单价"] = result["客单价"].fillna(safe_div_series(result["销售额"], result["去重客户数"]))
    result["客品数"] = result["客品数"].fillna(safe_div_series(result["销量"], result["去重客户数"]))
    result["品单价"] = result["品单价"].fillna(safe_div_series(result["销售额"], result["销量"]))
    result["前台毛利率"] = result["前台毛利率"].fillna(result["前台毛利率_校验值"])
    result["CAC"] = result["CAC"].fillna(result["CAC_校验值"])

    # 复购率在源数据仅存在于“整体汇总表（区域级）”，对派生“整体-整体”采用按去重客户数加权
    for window in WINDOW_ORDER:
        scope = result[
            (result["时间窗口"] == window)
            & (result["业务区域"].isin(["北美", "欧洲"]))
            & (result["客户类型"] == "整体")
            & result["复购率"].notna()
        ]
        if scope.empty:
            continue
        weighted_rr = (scope["复购率"] * scope["去重客户数"]).sum() / scope["去重客户数"].sum()
        mask = (
            (result["时间窗口"] == window)
            & (result["业务区域"] == "整体")
            & (result["客户类型"] == "整体")
            & result["复购率"].isna()
        )
        result.loc[mask, "复购率"] = weighted_rr

    return result


def sort_dimension_frame(df: pd.DataFrame) -> pd.DataFrame:
    window_rank = {w: i for i, w in enumerate(WINDOW_ORDER)}
    region_rank = {r: i for i, r in enumerate(REGION_ORDER)}
    segment_rank = {s: i for i, s in enumerate(SEGMENT_ORDER)}

    temp = df.copy()
    temp["_w"] = temp["时间窗口"].map(window_rank).fillna(999)
    temp["_r"] = temp["业务区域"].map(region_rank).fillna(999)
    temp["_s"] = temp["客户类型"].map(segment_rank).fillna(999)
    temp = temp.sort_values(by=["_w", "_r", "_s", "业务区域", "客户类型"])
    return temp.drop(columns=["_w", "_r", "_s"])


def build_detail_sheet(df: pd.DataFrame) -> pd.DataFrame:
    columns = [
        "表类型",
        "时间窗口",
        "业务区域",
        "客户类型",
        "去重客户数",
        "去重订单数",
        "销售额",
        "销量",
        "前台毛利额",
        "广告费",
        "GTM推广费",
        "折扣额",
        "总推广费",
        "经营毛利额",
        "ARPU值",
        "人均销售额",
        "人均推广费",
        "人均毛利额",
        "人均订单数",
        "订单价",
        "客单价",
        "客品数",
        "品单价",
        "前台毛利率",
        "经营毛利率",
        "CAC",
        "复购率",
        "每元推广费产出毛利额",
        "每元推广费产出销售额",
        "广告费占比",
        "GTM推广费占比",
        "折扣力度",
    ]
    return sort_dimension_frame(df[columns].copy())


def build_comparison_sheet(df: pd.DataFrame) -> pd.DataFrame:
    base = df[df["时间窗口"] == BASE_WINDOW].set_index(["业务区域", "客户类型"])
    comp = df[df["时间窗口"] == COMPARE_WINDOW].set_index(["业务区域", "客户类型"])

    rows = []
    for region in REGION_ORDER:
        for segment in SEGMENT_ORDER:
            if (region, segment) not in base.index or (region, segment) not in comp.index:
                continue
            for metric in METRICS_FOR_COMPARISON:
                base_val = base.loc[(region, segment), metric]
                comp_val = comp.loc[(region, segment), metric]
                rows.append(
                    {
                        "基线时间窗口": BASE_WINDOW,
                        "对比时间窗口": COMPARE_WINDOW,
                        "业务区域": region,
                        "客户类型": segment,
                        "指标": metric,
                        "基线值": base_val,
                        "对比值": comp_val,
                        "变动值": base_val - comp_val if pd.notna(base_val) and pd.notna(comp_val) else np.nan,
                        "变动率": pct_change(base_val, comp_val),
                    }
                )
    return pd.DataFrame(rows)


def build_resource_match_sheet(df: pd.DataFrame) -> pd.DataFrame:
    atomic = df[
        df["业务区域"].isin(["北美", "欧洲"]) & df["客户类型"].isin(["新客", "老客"])
    ].copy()

    frames = []
    for window in WINDOW_ORDER:
        scope = atomic[atomic["时间窗口"] == window].copy()
        total_input = scope["总推广费"].sum()
        total_output = scope["经营毛利额"].sum()
        avg_share = safe_div(1.0, len(scope))

        scope["投入占比"] = scope["总推广费"] / total_input
        scope["产出占比"] = scope["经营毛利额"] / total_output
        scope["资源匹配差"] = scope["产出占比"] - scope["投入占比"]

        def quadrant(row: pd.Series) -> str:
            high_input = row["投入占比"] >= avg_share
            high_output = row["产出占比"] >= avg_share
            if high_input and high_output:
                return "高投入高产出"
            if high_input and not high_output:
                return "高投入低产出"
            if (not high_input) and high_output:
                return "低投入高产出"
            return "低投入低产出"

        scope["资源匹配象限"] = scope.apply(quadrant, axis=1)
        frames.append(
            scope[
                [
                    "时间窗口",
                    "业务区域",
                    "客户类型",
                    "总推广费",
                    "经营毛利额",
                    "投入占比",
                    "产出占比",
                    "资源匹配差",
                    "每元推广费产出毛利额",
                    "每元推广费产出销售额",
                    "资源匹配象限",
                    "CAC",
                    "折扣力度",
                ]
            ].copy()
        )
    return sort_dimension_frame(pd.concat(frames, ignore_index=True))


def build_promo_mix_sheet(df: pd.DataFrame) -> pd.DataFrame:
    columns = [
        "时间窗口",
        "业务区域",
        "客户类型",
        "广告费",
        "GTM推广费",
        "总推广费",
        "广告费占比",
        "GTM推广费占比",
        "折扣额",
        "折扣力度",
    ]
    return sort_dimension_frame(df[columns].copy())


def build_cac_retention_sheet(raw_df: pd.DataFrame) -> pd.DataFrame:
    cac_rows = raw_df[
        (raw_df["表类型"] == "新客拉新指标表")
        & (raw_df["客户类型"] == "新客")
        & (raw_df["业务区域"].isin(["北美", "欧洲"]))
    ][["时间窗口", "业务区域", "CAC"]].copy()
    cac_rows["指标类型"] = "CAC"
    cac_rows["指标值"] = cac_rows["CAC"]

    retention_rows = raw_df[
        (raw_df["表类型"] == "整体汇总表")
        & (raw_df["客户类型"].isin(["整体", "nan"]))
        & (raw_df["业务区域"].isin(["北美", "欧洲"]))
    ][["时间窗口", "业务区域", "复购率"]].copy()
    retention_rows["指标类型"] = "复购率"
    retention_rows["指标值"] = retention_rows["复购率"]

    out = pd.concat(
        [
            cac_rows[["时间窗口", "业务区域", "指标类型", "指标值"]],
            retention_rows[["时间窗口", "业务区域", "指标类型", "指标值"]],
        ],
        ignore_index=True,
    )
    return sort_dimension_frame(out.rename(columns={"指标类型": "客户类型"}))


def markdown_table(df: pd.DataFrame, percent_cols: Iterable[str] | None = None) -> str:
    percent_cols = set(percent_cols or [])
    headers = list(df.columns)
    rows = []
    for _, row in df.iterrows():
        values = []
        for col in headers:
            value = row[col]
            if col in percent_cols:
                values.append(fmt_pct(value))
            elif isinstance(value, (int, float, np.integer, np.floating)):
                values.append(fmt_num(value))
            else:
                values.append(str(value))
        rows.append(values)

    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for r in rows:
        lines.append("| " + " | ".join(r) + " |")
    return "\n".join(lines)


def aggregate_row(df: pd.DataFrame, window: str, region: str, segment: str) -> pd.Series:
    scope = df[
        (df["时间窗口"] == window)
        & (df["业务区域"] == region)
        & (df["客户类型"] == segment)
    ]
    if scope.empty:
        return pd.Series(dtype="float64")
    return scope.iloc[0]


def build_markdown_report(
    detail_df: pd.DataFrame,
    compare_df: pd.DataFrame,
    resource_df: pd.DataFrame,
    promo_df: pd.DataFrame,
    cac_retention_df: pd.DataFrame,
) -> str:
    base_total = aggregate_row(detail_df, BASE_WINDOW, "整体", "整体")
    comp_total = aggregate_row(detail_df, COMPARE_WINDOW, "整体", "整体")
    base_na = aggregate_row(detail_df, BASE_WINDOW, "北美", "整体")
    comp_na = aggregate_row(detail_df, COMPARE_WINDOW, "北美", "整体")
    base_eu = aggregate_row(detail_df, BASE_WINDOW, "欧洲", "整体")
    comp_eu = aggregate_row(detail_df, COMPARE_WINDOW, "欧洲", "整体")
    base_new = aggregate_row(detail_df, BASE_WINDOW, "整体", "新客")
    base_old = aggregate_row(detail_df, BASE_WINDOW, "整体", "老客")

    base_atomic = resource_df[resource_df["时间窗口"] == BASE_WINDOW].copy()
    best_eff = base_atomic.sort_values("每元推广费产出毛利额", ascending=False).iloc[0]
    worst_gap = base_atomic.sort_values("资源匹配差").iloc[0]
    best_gap = base_atomic.sort_values("资源匹配差", ascending=False).iloc[0]

    overall_table_fmt = pd.DataFrame(
        [
            {
                "指标": "ARPU值",
                "YTD2026P2": fmt_num(base_total["ARPU值"]),
                "YTD2025P2": fmt_num(comp_total["ARPU值"]),
                "同比变化": fmt_pct(pct_change(base_total["ARPU值"], comp_total["ARPU值"])),
            },
            {
                "指标": "总推广费",
                "YTD2026P2": fmt_num(base_total["总推广费"]),
                "YTD2025P2": fmt_num(comp_total["总推广费"]),
                "同比变化": fmt_pct(pct_change(base_total["总推广费"], comp_total["总推广费"])),
            },
            {
                "指标": "前台毛利率",
                "YTD2026P2": fmt_pct(base_total["前台毛利率"]),
                "YTD2025P2": fmt_pct(comp_total["前台毛利率"]),
                "同比变化": f"{(base_total['前台毛利率'] - comp_total['前台毛利率']) * 100:.2f}pp",
            },
            {
                "指标": "复购率",
                "YTD2026P2": fmt_pct(base_total["复购率"]),
                "YTD2025P2": fmt_pct(comp_total["复购率"]),
                "同比变化": f"{(base_total['复购率'] - comp_total['复购率']) * 100:.2f}pp",
            },
        ]
    )

    region_table = pd.DataFrame(
        [
            {
                "区域": "北美",
                "ARPU值": base_na["ARPU值"],
                "订单价": base_na["订单价"],
                "客品数": base_na["客品数"],
                "人均推广费": base_na["人均推广费"],
                "人均毛利额": base_na["人均毛利额"],
                "前台毛利率": base_na["前台毛利率"],
                "经营毛利率": base_na["经营毛利率"],
            },
            {
                "区域": "欧洲",
                "ARPU值": base_eu["ARPU值"],
                "订单价": base_eu["订单价"],
                "客品数": base_eu["客品数"],
                "人均推广费": base_eu["人均推广费"],
                "人均毛利额": base_eu["人均毛利额"],
                "前台毛利率": base_eu["前台毛利率"],
                "经营毛利率": base_eu["经营毛利率"],
            },
        ]
    )

    customer_table = pd.DataFrame(
        [
            {
                "客群": "新客",
                "ARPU值": base_new["ARPU值"],
                "订单价": base_new["订单价"],
                "客品数": base_new["客品数"],
                "人均推广费": base_new["人均推广费"],
                "人均毛利额": base_new["人均毛利额"],
                "人均订单数": base_new["人均订单数"],
                "前台毛利率": base_new["前台毛利率"],
            },
            {
                "客群": "老客",
                "ARPU值": base_old["ARPU值"],
                "订单价": base_old["订单价"],
                "客品数": base_old["客品数"],
                "人均推广费": base_old["人均推广费"],
                "人均毛利额": base_old["人均毛利额"],
                "人均订单数": base_old["人均订单数"],
                "前台毛利率": base_old["前台毛利率"],
            },
        ]
    )



    region_price_item_trend = pd.DataFrame(
        [
            {
                "区域": "北美",
                f"订单价({BASE_WINDOW})": base_na["订单价"],
                f"订单价({COMPARE_WINDOW})": comp_na["订单价"],
                "订单价同比": pct_change(base_na["订单价"], comp_na["订单价"]),
                f"客品数({BASE_WINDOW})": base_na["客品数"],
                f"客品数({COMPARE_WINDOW})": comp_na["客品数"],
                "客品数变化值": base_na["客品数"] - comp_na["客品数"],
                "客品数同比": pct_change(base_na["客品数"], comp_na["客品数"]),
            },
            {
                "区域": "欧洲",
                f"订单价({BASE_WINDOW})": base_eu["订单价"],
                f"订单价({COMPARE_WINDOW})": comp_eu["订单价"],
                "订单价同比": pct_change(base_eu["订单价"], comp_eu["订单价"]),
                f"客品数({BASE_WINDOW})": base_eu["客品数"],
                f"客品数({COMPARE_WINDOW})": comp_eu["客品数"],
                "客品数变化值": base_eu["客品数"] - comp_eu["客品数"],
                "客品数同比": pct_change(base_eu["客品数"], comp_eu["客品数"]),
            },
        ]
    )

    region_segment_rows = []
    for region in ["北美", "欧洲"]:
        for segment in ["新客", "老客"]:
            base_seg = aggregate_row(detail_df, BASE_WINDOW, region, segment)
            comp_seg = aggregate_row(detail_df, COMPARE_WINDOW, region, segment)
            if base_seg.empty or comp_seg.empty:
                continue
            region_segment_rows.append(
                {
                    "区域": region,
                    "客群": segment,
                    f"订单价({BASE_WINDOW})": base_seg["订单价"],
                    f"订单价({COMPARE_WINDOW})": comp_seg["订单价"],
                    "订单价同比": pct_change(base_seg["订单价"], comp_seg["订单价"]),
                    f"客品数({BASE_WINDOW})": base_seg["客品数"],
                    f"客品数({COMPARE_WINDOW})": comp_seg["客品数"],
                    "客品数变化值": base_seg["客品数"] - comp_seg["客品数"],
                    "客品数同比": pct_change(base_seg["客品数"], comp_seg["客品数"]),
                }
            )

    region_segment_item_trend = pd.DataFrame(region_segment_rows)

    decline_rows = region_segment_item_trend[region_segment_item_trend["客品数变化值"] < 0].copy()
    decline_rows = decline_rows.sort_values("客品数变化值")
    decline_insight_lines = []
    for _, row in decline_rows.iterrows():
        region = row["区域"]
        segment = row["客群"]
        delta_item = row["客品数变化值"]
        item_yoy = row["客品数同比"]
        price_yoy = row["订单价同比"]

        if pd.notna(price_yoy) and price_yoy > 0:
            advice = "订单价上升但客品数下降，说明‘提价/高客单结构’挤压连带购买，建议增加加价购与多件折扣，恢复跨品类凑单。"
        elif pd.notna(price_yoy) and price_yoy < 0:
            advice = "订单价与客品数同步下滑，说明需求与组合力双弱，建议收敛低转化SKU并强化高关联组合包。"
        else:
            advice = "优先排查该人群的连带推荐链路、凑单门槛与促销触达，避免单件购买占比继续抬升。"

        decline_insight_lines.append(
            f"- `{region}-{segment}` 客品数变化 {fmt_num(delta_item, 4)}（同比 {fmt_pct(item_yoy)}）；{advice}"
        )

    if not decline_insight_lines:
        decline_insight_lines = [
            "- 当前区域×客群维度未发现客品数下滑，但建议将`客品数同比<0%`设置为周度预警阈值，提前识别组合购买转弱信号。",
            "- 建议在北美新客与北美老客维度持续跟踪‘订单价上升+客品数放缓’组合，优先通过加价购/多件折扣维持连带率。",
        ]

    resource_table = base_atomic[
        [
            "业务区域",
            "客户类型",
            "投入占比",
            "产出占比",
            "资源匹配差",
            "每元推广费产出毛利额",
            "资源匹配象限",
        ]
    ].copy()

    cac_scope = cac_retention_df[cac_retention_df["客户类型"] == "CAC"].copy()
    cac_pivot = cac_scope.pivot(index="业务区域", columns="时间窗口", values="指标值").reset_index()
    if BASE_WINDOW in cac_pivot.columns and COMPARE_WINDOW in cac_pivot.columns:
        cac_pivot["同比变化"] = (cac_pivot[BASE_WINDOW] - cac_pivot[COMPARE_WINDOW]) / cac_pivot[COMPARE_WINDOW]

    promo_scope = promo_df[
        (promo_df["客户类型"] == "整体") & (promo_df["业务区域"].isin(["北美", "欧洲"]))
    ]
    discount_pivot = promo_scope.pivot(
        index="业务区域", columns="时间窗口", values="折扣力度"
    ).reset_index()
    if BASE_WINDOW in discount_pivot.columns and COMPARE_WINDOW in discount_pivot.columns:
        discount_pivot["同比变化"] = discount_pivot[BASE_WINDOW] - discount_pivot[COMPARE_WINDOW]

    report_lines = [
        "# 用户多维度洞察：资源匹配度与价值产出效率分析（Sheet⑩ 新版）",
        "",
        "## 结论先行",
        "",
        f"- 整体看，`{BASE_WINDOW}` 的 **ARPU值 {fmt_num(base_total['ARPU值'])}**，较 `{COMPARE_WINDOW}` 变化 {fmt_pct(pct_change(base_total['ARPU值'], comp_total['ARPU值']))}。",
        f"- 区域看，欧洲 `经营毛利率` 为 {fmt_pct(base_eu['经营毛利率'])}，高于北美的 {fmt_pct(base_na['经营毛利率'])}，且人均推广费更低（{fmt_num(base_eu['人均推广费'])} vs {fmt_num(base_na['人均推广费'])}）。",
        f"- 趋势看，北美/欧洲订单价同比分别为 {fmt_pct(pct_change(base_na['客单价'], comp_na['客单价']))} / {fmt_pct(pct_change(base_eu['客单价'], comp_eu['客单价']))}；客品数同比分别为 {fmt_pct(pct_change(base_na['客品数'], comp_na['客品数']))} / {fmt_pct(pct_change(base_eu['客品数'], comp_eu['客品数']))}。",
        f"- 客群看，老客 ARPU 是新客的 {fmt_num(base_old['ARPU值'] / base_new['ARPU值'], 2)} 倍；每元推广费产出毛利额最高维度为 `{best_eff['业务区域']}-{best_eff['客户类型']}`（{fmt_num(best_eff['每元推广费产出毛利额'])}）。",
        "",
        "## 第一幕：整体健康度速览（YoY）",
        "",
        markdown_table(overall_table_fmt),
        "",
        "## 第二幕：区域差异，谁是效率引擎",
        "",
        markdown_table(region_table, percent_cols={"前台毛利率", "经营毛利率"}),
        "",
        "## 第三幕：新老客结构，增长质量拆解",
        "",
        markdown_table(customer_table, percent_cols={"前台毛利率"}),
        "",
        "### 区域订单价与客品数趋势（整体）",
        "",
        markdown_table(region_price_item_trend, percent_cols={"订单价同比", "客品数同比"}),
        "",
        "### 区域×客群订单价与客品数趋势",
        "",
        markdown_table(region_segment_item_trend, percent_cols={"订单价同比", "客品数同比"}) if not region_segment_item_trend.empty else "- 无可用数据",
        "",
        "### 客品数下滑区域与人群：洞察与建议",
        "",
        *decline_insight_lines,
        "",
        "## 第四幕：交叉维度下钻（区域 × 客户类型）",
        "",
        markdown_table(resource_table, percent_cols={"投入占比", "产出占比", "资源匹配差"}),
        "",
        f"- 资源匹配差最高维度：`{best_gap['业务区域']}-{best_gap['客户类型']}`，匹配差 {fmt_pct(best_gap['资源匹配差'])}。",
        f"- 资源匹配差最低维度：`{worst_gap['业务区域']}-{worst_gap['客户类型']}`，匹配差 {fmt_pct(worst_gap['资源匹配差'])}。",
        "",
        "### CAC 同比（新客拉新）",
        "",
        markdown_table(cac_pivot, percent_cols={"同比变化"}) if not cac_pivot.empty else "- 无CAC数据",
        "",
        "### 折扣力度同比（区域整体）",
        "",
        markdown_table(discount_pivot, percent_cols={"同比变化", BASE_WINDOW, COMPARE_WINDOW}) if not discount_pivot.empty else "- 无折扣力度数据",
        "",
        "## 第五幕：关键发现与行动建议",
        "",
        f"1. `{best_eff['业务区域']}-{best_eff['客户类型']}` 为当前每元推广费产出最佳样板，应优先复制投放结构与商品策略。",
        "2. 对资源匹配差为负的维度，优先做渠道与折扣结构排查，减少高投入低产出的预算浪费。",
        "3. 将 CAC 与折扣力度作为拉新维度的双护栏，避免以高补贴换取低质量新增。",
        "4. 区域打法分化：欧洲优先稳利润，北美优先提效率与投放质量。",
        "",
    ]

    return "\n".join(report_lines)


def build_validation_lines(raw_df: pd.DataFrame, detail_df: pd.DataFrame) -> list[str]:
    lines = ["# 数据校验结果", ""]
    tol = 0.05

    overall = raw_df[raw_df["表类型"] == "整体汇总表"].copy()
    seg = raw_df[raw_df["表类型"] == "新老客分组指标表"].copy()
    acq = raw_df[raw_df["表类型"] == "新客拉新指标表"].copy()

    for window in WINDOW_ORDER:
        lines.append(f"## {window}")

        for region in ["北美", "欧洲"]:
            o = overall[(overall["时间窗口"] == window) & (overall["业务区域"] == region)]
            s = seg[(seg["时间窗口"] == window) & (seg["业务区域"] == region)]
            if o.empty or s.empty:
                lines.append(f"- {region}：整体 vs 分组校验缺失")
                continue
            o_row = o.iloc[0]
            sum_sales = s["销售额"].sum()
            sum_orders = s["去重订单数"].sum()
            sum_users = s["去重客户数"].sum()

            sales_diff = sum_sales - o_row["销售额"]
            order_diff = sum_orders - o_row["去重订单数"]
            user_diff = sum_users - o_row["去重客户数"]
            status = "通过" if all(abs(x) <= tol for x in [sales_diff, order_diff, user_diff]) else "失败"
            lines.append(
                f"- 整体vs分组({region})：{status} | 销售额差={fmt_num(sales_diff,6)} | 订单差={fmt_num(order_diff,6)} | 客户差={fmt_num(user_diff,6)}"
            )

        for region in ["北美", "欧洲"]:
            a = acq[(acq["时间窗口"] == window) & (acq["业务区域"] == region)]
            s_new = seg[
                (seg["时间窗口"] == window)
                & (seg["业务区域"] == region)
                & (seg["客户类型"] == "新客")
            ]
            if a.empty or s_new.empty:
                continue
            a_row = a.iloc[0]
            s_row = s_new.iloc[0]
            diff_sales = a_row["销售额"] - s_row["销售额"]
            diff_users = a_row["去重客户数"] - s_row["去重客户数"]
            status = "通过" if abs(diff_sales) <= tol and abs(diff_users) <= tol else "失败"
            lines.append(
                f"- 新客拉新vs新客分组({region})：{status} | 销售额差={fmt_num(diff_sales,6)} | 客户差={fmt_num(diff_users,6)}"
            )

        d = detail_df[
            (detail_df["时间窗口"] == window)
            & (detail_df["业务区域"] == "整体")
            & (detail_df["客户类型"] == "整体")
        ]
        if not d.empty:
            r = d.iloc[0]
            diff_arpu = r["ARPU值_校验值"] - r["ARPU值"]
            diff_margin = r["前台毛利率_校验值"] - r["前台毛利率"]
            diff_promo = r["总推广费_校验值"] - r["总推广费"]
            lines.append(
                f"- 公式校验(整体)：ARPU差={fmt_num(diff_arpu,10)} | 前台毛利率差={fmt_num(diff_margin,10)} | 总推广费差={fmt_num(diff_promo,10)}"
            )

        acq_scope = detail_df[
            (detail_df["时间窗口"] == window)
            & (detail_df["表类型"] == "新客拉新指标表")
            & (detail_df["客户类型"] == "新客")
        ]
        if not acq_scope.empty:
            cac_max_diff = (acq_scope["CAC_校验值"] - acq_scope["CAC"]).abs().max()
            lines.append(f"- CAC校验最大差值={fmt_num(cac_max_diff,10)}")

        lines.append("")

    return lines


def write_outputs(
    detail_df: pd.DataFrame,
    compare_df: pd.DataFrame,
    resource_df: pd.DataFrame,
    promo_df: pd.DataFrame,
    cac_retention_df: pd.DataFrame,
    report_text: str,
    validation_lines: list[str],
) -> None:
    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    DOC_DIR.mkdir(parents=True, exist_ok=True)
    CHECK_DIR.mkdir(parents=True, exist_ok=True)

    with pd.ExcelWriter(OUT_EXCEL, engine="openpyxl") as writer:
        detail_df.to_excel(writer, sheet_name="指标明细", index=False)
        compare_df.to_excel(writer, sheet_name="同比变动", index=False)
        resource_df.to_excel(writer, sheet_name="资源匹配度", index=False)
        promo_df.to_excel(writer, sheet_name="推广费结构", index=False)
        cac_retention_df.to_excel(writer, sheet_name="CAC与复购", index=False)

    OUT_REPORT.write_text(report_text, encoding="utf-8")
    OUT_VALIDATION.write_text("\n".join(validation_lines), encoding="utf-8")


def main() -> None:
    raw_df = load_data()
    unified, overall_df, acq_df = build_unified_base(raw_df)
    expanded = append_derived_totals(unified)
    metrics = compute_metrics(expanded)

    detail_df = build_detail_sheet(metrics)
    compare_df = build_comparison_sheet(detail_df)
    resource_df = build_resource_match_sheet(detail_df)
    promo_df = build_promo_mix_sheet(detail_df)
    cac_retention_df = build_cac_retention_sheet(raw_df)

    report_text = build_markdown_report(detail_df, compare_df, resource_df, promo_df, cac_retention_df)
    validation_lines = build_validation_lines(raw_df, metrics)

    write_outputs(
        detail_df=detail_df,
        compare_df=compare_df,
        resource_df=resource_df,
        promo_df=promo_df,
        cac_retention_df=cac_retention_df,
        report_text=report_text,
        validation_lines=validation_lines,
    )

    print(f"分析完成，已输出 Excel: {OUT_EXCEL}")
    print(f"分析完成，已输出报告: {OUT_REPORT}")
    print(f"分析完成，已输出校验: {OUT_VALIDATION}")


if __name__ == "__main__":
    main()
