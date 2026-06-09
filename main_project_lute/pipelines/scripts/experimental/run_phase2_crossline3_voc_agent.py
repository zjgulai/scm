# MOVED TO: scripts/phase2/run_phase2_crossline3_voc_agent.py
# -*- coding: utf-8 -*-
"""
Phase 2: 交叉线3 - VOC Agent 处理退款主题

职责：
- 读取订单Agent产出的售后/退款主题输入表 (refund_theme_input_for_voc)
- 扩展VOC中的"售后/退款"主题
- 产出"订单侧问题 + 用户原话"双重视图结论

当前实现：
- 使用mock VOC数据模拟真实场景
- 输出双重视图结论文本
"""

from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
IO_DIR = PROJECT_ROOT / "data_example" / "实验管道" / "phase2" / "输入" / "phase2_io"
OUTPUT_DIR = PROJECT_ROOT / "phase2_outputs" / "crossline3_voc"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_refund_theme_input() -> pd.DataFrame:
    """读取订单Agent产出的退款主题输入，并合并退款金额"""
    # 读取退款明细
    detail_file = PROJECT_ROOT / "phase2_outputs" / "topic2" / "topic2_refund_attribution_detail.csv"
    if not detail_file.exists():
        detail_file = IO_DIR / "refund_theme_input_for_voc.csv"

    if not detail_file.exists():
        print(f"[WARN] Input file not found")
        return pd.DataFrame()

    df = pd.read_csv(detail_file)

    # 尝试读取原始退款数据获取金额
    refund_file = PROJECT_ROOT / "phase2_mock" / "fact_return_mock.csv"
    if refund_file.exists():
        refund_df = pd.read_csv(refund_file)
        # 合并退款金额
        if "refund_amt" not in df.columns:
            df = df.merge(refund_df[["return_id", "refund_amt"]], on="return_id", how="left")
        if "refund_qty" not in df.columns:
            df = df.merge(refund_df[["return_id", "refund_qty"]], on="return_id", how="left")

    print(f"[INFO] 已读取退款数据: {len(df)} 条")
    return df


def generate_mock_voc_data():
    """生成mock VOC数据，用于模拟真实场景

    在真实场景中，这部分应该替换为：
    - 读取fact_voc_summary
    - 读取ods_voc_external (亚马逊评论等)
    """
    # Mock: 亚马逊评论数据
    mock_voc = pd.DataFrame([
        # SIZE相关评论
        {"platform": "AMZ", "country": "US", "sku_id": 1001, "spu_id": 201,
         "review_text": "The size runs very small, ordered M but fits like XS. Very disappointed.",
         "star_rating": 2, "tag": "SIZE", "emotion": "negative"},
        {"platform": "AMZ", "country": "US", "sku_id": 1003, "spu_id": 203,
         "review_text": "Bra size chart is inaccurate. Had to return and exchange twice.",
         "star_rating": 1, "tag": "SIZE", "emotion": "negative"},
        {"platform": "AMZ", "country": "UK", "sku_id": 1005, "spu_id": 205,
         "review_text": "True to size, very comfortable!", "star_rating": 5, "tag": "SIZE", "emotion": "positive"},

        # COLOR相关评论
        {"platform": "AMZ", "country": "US", "sku_id": 1010, "spu_id": 209,
         "review_text": "Color is much darker than the pictures shown. Not what I expected.",
         "star_rating": 2, "tag": "COLOR", "emotion": "negative"},
        {"platform": "AMZ", "country": "DE", "sku_id": 1014, "spu_id": 209,
         "review_text": "Farbe sieht anders aus als auf dem Foto. Sehr enttäuscht.",
         "star_rating": 1, "tag": "COLOR", "emotion": "negative"},

        # QUALITY相关评论
        {"platform": "AMZ", "country": "US", "sku_id": 1006, "spu_id": 203,
         "review_text": "Material feels cheap, stitching came loose after 2 uses.",
         "star_rating": 2, "tag": "QUALITY", "emotion": "negative"},
        {"platform": "AMZ", "country": "UK", "sku_id": 1008, "spu_id": 207,
         "review_text": "Excellent quality, worth the price!", "star_rating": 5, "tag": "QUALITY", "emotion": "positive"},

        # SHIPPING相关评论
        {"platform": "AMZ", "country": "US", "sku_id": 1002, "spu_id": 202,
         "review_text": "Package was damaged during shipping, product was exposed.",
         "star_rating": 1, "tag": "SHIPPING", "emotion": "negative"},
        {"platform": "AMZ", "country": "AU", "sku_id": 1004, "spu_id": 204,
         "review_text": "Delivery took forever, almost 3 weeks.",
         "star_rating": 2, "tag": "SHIPPING", "emotion": "negative"},

        # NOT_AS_DESCRIBED
        {"platform": "AMZ", "country": "US", "sku_id": 1011, "spu_id": 210,
         "review_text": "Product looks completely different from listing. False advertising!",
         "star_rating": 1, "tag": "NOT_AS_DESCRIBED", "emotion": "negative"},

        # DEFECTIVE
        {"platform": "AMZ", "country": "US", "sku_id": 1007, "spu_id": 206,
         "review_text": "Motor stopped working after one week. Defective product!",
         "star_rating": 1, "tag": "DEFECTIVE", "emotion": "negative"},
    ])
    return mock_voc


def map_reason_to_voc_theme(return_reason_code: str) -> str:
    """将退款原因映射到VOC主题"""
    mapping = {
        "SIZE": "尺码问题",
        "COLOR": "颜色/外观",
        "QUALITY": "产品质量",
        "SHIPPING": "物流配送",
        "NOT_AS_DESCRIBED": "描述不符",
        "NO_REASON": "无理由退货",
        "DEFECTIVE": "产品缺陷",
    }
    return mapping.get(return_reason_code, "其他问题")


def build_dual_perspective(df_refund: pd.DataFrame, mock_voc: pd.DataFrame) -> pd.DataFrame:
    """构建双重视图：订单侧问题 + 用户原话"""

    if df_refund.empty:
        return pd.DataFrame()

    results = []

    # 按退款原因分组
    for _, row in df_refund.iterrows():
        reason_code = row.get("return_reason_code", "")
        country = row.get("country_code", "")
        channel = row.get("channel_id", "")
        is_partial = row.get("is_partial_return", 0)

        # 订单侧问题描述
        order_issue = f"平台:{channel}, 国家:{country}, 原因:{reason_code}"
        if is_partial == 1:
            order_issue += ", 部分退款"

        # 匹配VOC评论
        voc_match = mock_voc[
            (mock_voc["tag"] == reason_code) &
            (mock_voc["country"] == country)
        ]

        if voc_match.empty:
            # 尝试匹配任意国家的相同tag
            voc_match = mock_voc[mock_voc["tag"] == reason_code]

        # 获取用户原话
        if not voc_match.empty:
            sample = voc_match.iloc[0]
            user_voice = f"[{sample['platform']} {sample['country']}] {sample['review_text']} (⭐{sample['star_rating']})"
        else:
            user_voice = "暂无VOC匹配数据"

        # 业务洞察
        voc_theme = map_reason_to_voc_theme(reason_code)

        results.append({
            "order_issue": order_issue,
            "voc_theme": voc_theme,
            "user_voice": user_voice,
            "refund_amt": row.get("refund_amt", 0),
            "refund_qty": row.get("refund_qty", 0),
        })

    return pd.DataFrame(results)


def generate_conclusions(dual_perspective: pd.DataFrame) -> str:
    """生成双重视图结论文本"""

    if dual_perspective.empty:
        return "无退款数据可供分析"

    conclusions = []

    # 按退款金额排序，取Top问题
    top_issues = dual_perspective.nlargest(5, "refund_amt")

    conclusions.append("=" * 60)
    conclusions.append("双重视图结论：订单侧问题 + 用户原话")
    conclusions.append("=" * 60)
    conclusions.append("")

    conclusions.append("【Top 5 退款问题】")
    for i, row in top_issues.iterrows():
        conclusions.append(f"\n{len(conclusions)}. {row['voc_theme']}")
        conclusions.append(f"   订单侧: {row['order_issue']}")
        conclusions.append(f"   用户原话: {row['user_voice']}")
        conclusions.append(f"   退款金额: ${row['refund_amt']:.2f}")

    # 按VOC主题聚合洞察
    conclusions.append("\n" + "=" * 60)
    conclusions.append("【业务洞察与建议】")
    conclusions.append("=" * 60)

    theme_summary = dual_perspective.groupby("voc_theme").agg({
        "refund_amt": "sum",
        "refund_qty": "sum",
    }).sort_values("refund_amt", ascending=False)

    for theme, stats in theme_summary.iterrows():
        conclusions.append(f"\n▶ {theme}:")
        conclusions.append(f"  - 退款总额: ${stats['refund_amt']:.2f}")
        conclusions.append(f"  - 退款数量: {int(stats['refund_qty'])}")

        # 针对具体问题给建议
        if theme == "尺码问题":
            conclusions.append("  → 建议: 完善尺码表，提供更准确的测量指南")
        elif theme == "颜色/外观":
            conclusions.append("  → 建议: 确保图片与实物一致，增加多角度展示")
        elif theme == "产品质量":
            conclusions.append("  → 建议: 加强品控，提升材质质量")
        elif theme == "物流配送":
            conclusions.append("  → 建议: 优化物流方案，选择更可靠的承运商")
        elif theme == "描述不符":
            conclusions.append("  → 建议: 完善产品描述，减少期望落差")
        elif theme == "产品缺陷":
            conclusions.append("  → 建议: 加强出厂检验，建立退换货快速通道")

    conclusions.append("\n" + "=" * 60)
    conclusions.append("【驱动动作】")
    conclusions.append("=" * 60)
    conclusions.append("1. 客服话术优化：针对高频退款原因更新FAQ")
    conclusions.append("2. 产品详情页：补充尺码指南、实物视频")
    conclusions.append("3. 退换货政策：针对部分退场景优化流程")
    conclusions.append("4. 产品改进：反馈给产品团队进行迭代")

    return "\n".join(conclusions)


def main():
    print("=== Phase2 交叉线3 - VOC Agent 处理 ===\n")

    # 1. 读取订单Agent产出的退款主题
    df_refund = load_refund_theme_input()
    print(f"已读取退款主题输入: {len(df_refund)} 条")

    if df_refund.empty:
        print("[WARN] 无退款数据，生成空输出")
        return

    # 2. 生成mock VOC数据 (真实场景替换为读取数仓)
    mock_voc = generate_mock_voc_data()
    print(f"已加载VOC数据: {len(mock_voc)} 条评论\n")

    # 3. 构建双重视图
    dual_perspective = build_dual_perspective(df_refund, mock_voc)
    print(f"双重视图记录: {len(dual_perspective)} 条")

    # 4. 保存双重视图表格
    dual_perspective.to_csv(OUTPUT_DIR / "dual_perspective_table.csv", index=False, encoding="utf-8-sig")
    print(f"双重视图表格 -> {OUTPUT_DIR / 'dual_perspective_table.csv'}\n")

    # 5. 生成结论文本
    conclusions = generate_conclusions(dual_perspective)

    # 6. 保存结论
    conclusions_path = OUTPUT_DIR / "dual_perspective_conclusions.txt"
    with open(conclusions_path, "w", encoding="utf-8") as f:
        f.write(conclusions)
    print(f"双重视图结论 -> {conclusions_path}")

    print("\n" + "=" * 60)
    print("结论预览:")
    print("=" * 60)
    print(conclusions[:1500] + "...")


if __name__ == "__main__":
    main()
