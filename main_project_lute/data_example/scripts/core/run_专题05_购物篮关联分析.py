# -*- coding: utf-8 -*-
"""
专题五：购物篮关联分析 ⑤⑥⑦⑧ 数据汇总，供图表与洞察使用
⑤=订单-产品线 ⑥=订单-SPU ⑦=客户-SPU ⑧=客户-SKU
"""
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "原始数据"
TOPIC_DIR = BASE_DIR / "专题产物" / "专题05"
TABLE_DIR = TOPIC_DIR / "表格"
SRC_EXCEL = DATA_DIR / "专题一：分析数据总表.xlsx"
OUT_EXCEL = TABLE_DIR / "专题05_表格_购物篮关联分析汇总.xlsx"

SHEETS = {
    "⑤_订单产品线": "⑤",
    "⑥_订单SPU": "⑥",
    "⑦_客户SPU": "⑦",
    "⑧_客户SKU": "⑧",
}


def main():
    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    with pd.ExcelWriter(OUT_EXCEL, engine="openpyxl") as w:
        for out_name, sheet in SHEETS.items():
            df = pd.read_excel(SRC_EXCEL, sheet_name=sheet)
            df = df.dropna(subset=["支持度", "置信度", "提升度"])
            df.to_excel(w, sheet_name=out_name, index=False)
        # ⑤ 提升度>=1 与 <1 分表
        d5 = pd.read_excel(SRC_EXCEL, sheet_name="⑤")
        d5_ge1 = d5[d5["提升度"] >= 1].sort_values("提升度", ascending=False)
        d5_lt1 = d5[d5["提升度"] < 1].sort_values("提升度")
        d5_ge1.to_excel(w, sheet_name="⑤_提升度≥1", index=False)
        d5_lt1.to_excel(w, sheet_name="⑤_提升度<1", index=False)
    print("已保存:", OUT_EXCEL)


if __name__ == "__main__":
    main()
