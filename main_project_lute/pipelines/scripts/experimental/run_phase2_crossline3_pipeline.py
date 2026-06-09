# MOVED TO: scripts/phase2/run_phase2_crossline3_pipeline.py
# -*- coding: utf-8 -*-
"""
Phase 2: 交叉线3（订单与退款 → 反哺 VOC 与产品组合）管道骨架

职责：
- 读取专题② 退款归因中间结果（topic2_refund_attribution）。
- 构造售后/退款主题输入表 refund_theme_input_for_voc，字段对齐 Phase1 交叉线3 文档与 VOC Agent 画像。
- 将结果写入标准 IO 目录，供 VOC Agent 消费，形成“订单侧问题 + 用户原话”双重视图。

当前实现：
- 使用简单的占位逻辑与字段示例，便于后续接入真实数仓表或 ETL 输出。
"""

from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]  # ecom_ana_overview root
TOPIC2_OUT_DIR = PROJECT_ROOT / "phase2_outputs" / "topic2"
MOCK_DIR = PROJECT_ROOT / "phase2_mock"
IO_DIR = PROJECT_ROOT / "data_example" / "实验管道" / "phase2" / "输入" / "phase2_io"
IO_DIR.mkdir(parents=True, exist_ok=True)

REFUND_ATTR_FILE_CANDIDATES = [
    TOPIC2_OUT_DIR / "topic2_refund_attribution_detail.csv",  # 明细表供VOC使用
    TOPIC2_OUT_DIR / "topic2_refund_attribution.csv",  # 汇总表
    TOPIC2_OUT_DIR / "topic2_refund_attribution.parquet",
]


def load_refund_attribution() -> pd.DataFrame:
    # 1）优先使用 Phase2 专题② 管道产出的正式中间结果
    for p in REFUND_ATTR_FILE_CANDIDATES:
        if p.exists():
            if p.suffix == ".parquet":
                return pd.read_parquet(p)
            if p.suffix == ".csv":
                return pd.read_csv(p)

    # 2）若正式结果尚未产出，则回退到 mock 数据（支持并行联调）
    mock_return = MOCK_DIR / "fact_return_mock.csv"
    if mock_return.exists():
        df = pd.read_csv(mock_return)
        # 确保至少包含交叉线3 所需的字段
        expected_cols = [
            "order_id",
            "return_id",
            "sku_id",
            "spu_id",
            "country_code",
            "channel_id",
            "return_reason_code",
            "is_partial_return",
            "refund_qty",
            "refund_amt",
        ]
        for c in expected_cols:
            if c not in df.columns:
                df[c] = None
        return df[expected_cols]

    # 3）兜底：若连 mock 文件也不存在，则返回空结构
    cols = [
        "order_id",
        "return_id",
        "sku_id",
        "spu_id",
        "country_code",
        "channel_id",
        "return_reason_code",
        "is_partial_return",
        "refund_qty",
        "refund_amt",
    ]
    return pd.DataFrame(columns=cols)


def build_refund_theme_input_for_voc(df: pd.DataFrame) -> pd.DataFrame:
    """将退款归因宽表映射为 VOC Agent 可消费的售后/退款主题输入表。"""
    if df.empty:
        # 保留字段结构，便于下游开发
        cols = [
            "order_id",
            "return_id",
            "sku_id",
            "spu_id",
            "country_code",
            "channel_id",
            "return_reason_code",
            "is_partial_return",
            "theme_suggested",
        ]
        return pd.DataFrame(columns=cols)

    out = df.copy()
    # 简单示例：根据退款原因编码与是否部分退生成建议主题文案（真实规则后续由业务 + NLP 迭代）
    def suggest_theme(row):
        code = str(row.get("return_reason_code", ""))
        is_partial = str(row.get("is_partial_return", "")).lower() in {"1", "true", "yes"}
        if is_partial:
            return f"部分退组合问题_原因{code}"
        return f"整单退款_原因{code}"

    out["theme_suggested"] = out.apply(suggest_theme, axis=1)
    cols = [
        "order_id",
        "return_id",
        "sku_id",
        "spu_id",
        "country_code",
        "channel_id",
        "return_reason_code",
        "is_partial_return",
        "theme_suggested",
    ]
    return out[cols]


def main():
    df_refund = load_refund_attribution()
    df_theme = build_refund_theme_input_for_voc(df_refund)
    out_parquet = IO_DIR / "refund_theme_input_for_voc.parquet"
    out_csv = IO_DIR / "refund_theme_input_for_voc.csv"
    if not df_theme.empty:
        try:
            df_theme.to_parquet(out_parquet, index=False)
            print("[Phase2] refund_theme_input_for_voc 已写入:", out_parquet)
        except Exception:
            df_theme.to_csv(out_csv, index=False)
            print("[Phase2] refund_theme_input_for_voc 已写入:", out_csv)
    else:
        # 即便为空，也写出结构化 CSV，方便后续开发确认字段
        df_theme.to_csv(out_csv, index=False)
        print("[Phase2] refund_theme_input_for_voc 为空结构已写入:", out_csv)


if __name__ == "__main__":
    main()
