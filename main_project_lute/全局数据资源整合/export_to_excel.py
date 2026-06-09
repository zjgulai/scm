# -*- coding: utf-8 -*-
"""
将「全局数据资源整合」下涉及字段与表格的文档内容导出为 Excel，
不同类别放在同一工作簿的不同 Sheet，便于与数仓对接。
依赖：pandas, openpyxl  （pip install pandas openpyxl）
"""
from pathlib import Path
import pandas as pd

OUT_EXCEL = Path(__file__).resolve().parent / "全局数据资源整合_数仓对接.xlsx"


def _explode_to_rows(df: pd.DataFrame, src_col: str, new_col: str) -> pd.DataFrame:
    """
    将某一列中用英文逗号分隔的字段/指标拆成多行：
    - 原列保留整串内容，便于阅读；
    - 新增 new_col，每一行只放一个字段/指标；
    - 其他列按原行内容复制，便于数仓逐行对接。
    """
    if src_col not in df.columns:
        return df

    records = []
    for _, row in df.iterrows():
        raw = str(row[src_col]) if pd.notna(row[src_col]) else ""
        items = [item.strip() for item in raw.split(",") if item.strip()]
        # 若没有可拆分的字段，则保留一行但 new_col 为空
        if not items:
            rec = row.to_dict()
            rec[new_col] = ""
            records.append(rec)
            continue
        for item in items:
            rec = row.to_dict()
            rec[new_col] = item
            records.append(rec)
    return pd.DataFrame.from_records(records, columns=list(df.columns) + [new_col])


def sheet_01_topic_matrix():
    """
    01_专题课题_数据需求矩阵（字段级展开版）

    目标：一行只描述一个字段 / 指标，便于数仓逐字段对接。
    - 每行 = 1 个中文指标 + 1 个英文字段（若有）
    - 仍保留专题、子课题、库表建议等上下文
    """
    base_cols = [
        "专题",
        "子课题",
        "业务问题/目的（简要）",
        "所需核心指标/字段",
        "字段英文名（关键）",
        "库表建议",
        "关键切片维度",
        "数据粒度",
        "数据来源",
        "是否已有",
        "备注/复用",
    ]

    # 原始按「专题×子课题」的行
    rows = [
        ["① VOC", "① 货架内用户声音→服务质量与体验", "各渠道/品类/单品服务质量与体验、痛点与亮点",
         "VOC量、VOC率、星级评分、好评率、中差评率、销量、退货率、DOA率、评论数/新增评论数、标签二/三级分类",
         "voc_cnt, voc_rate, star_rating, good_rate, bad_rate, sales_qty, return_rate, doa_rate, review_cnt, review_cnt_new, tag_l2, tag_l3, channel_id, country_code, spu_id, dt",
         "fact_voc_summary（按 渠道/国家/SPU/月 汇总）；dim_voc_tag（标签维度）；ods_review_detail（评论明细，若有）",
         "店铺、SPU、品线、国家、渠道、时间、来源类型", "评论/工单级 & 汇总级", "内部 BI + 评论/工单明细", "汇总多在 BI，明细视现状补齐", "与②④ 共享退货率/星级"],
        ["① VOC", "② 货架外原生用户声音→高潜需求与第二大单品", "Reddit/垂类社区等货架外未被满足需求、第二大单品机会",
         "平台/社区、版块/话题、帖子ID、评论ID、用户ID、发布时间、语言、内容文本、主题标签、情绪极性、是否提及我们/竞品、交互量",
         "platform, community_name, board_name, post_id, comment_id, user_id_anon, post_time, lang, content_text, topic_tags, sentiment_polarity, mention_brand_self, mention_brand_comp, reply_cnt, like_cnt",
         "ods_voc_external（外部帖子/评论原始表）；dim_voc_external_community（社区/平台维度）；fact_voc_external_daily（按 平台/国家/主题/日 聚合，可选）",
         "平台、社区、国家/语言、品类/主题、时间", "帖子/评论级", "外部抓取 + 自建标签", "待补齐", "与④ 共享社区/话题；与③ 共享国家聚合"],
        ["① VOC", "③ 货架内外本土竞品用户声音→营销本土化", "本土竞品评价、本土化卖点/话术",
         "品牌名称、SPU/SKU、平台/站点、国家、VOC量/率、星级、中差评率、主题标签（本土化）",
         "brand_id, brand_name, spu_id, platform, site, country_code, voc_cnt, voc_rate, star_rating, bad_rate, tag_localized",
         "fact_voc_brand_summary（按 品牌/国家/渠道/月）；dim_brand（品牌维度，含 我们/竞品）；与 ods_voc_external 关联",
         "品牌、国家、渠道、品类、时间", "评论级 & 品牌聚合级", "内部 VOC + 外部竞品", "部分有，竞品/本土标签需补", "与③④ 共享国家/渠道/卖点"],
        ["① VOC", "④ 全域VOC声量趋势→渠道与流量布局", "国家/渠道声量演变、机会与风险",
         "VOC量、VOC率、销量、VOC趋势、VOC来源分布、品牌/品类提及量、标签趋势",
         "voc_cnt, voc_rate, sales_qty, voc_trend_12m, voc_source_type, mention_volume, tag_trend",
         "fact_voc_trend（按 国家/渠道/来源类型/品类/月）；可基于 fact_voc_summary + ods_voc_external 聚合产出",
         "国家、渠道、来源类型、品类、SPU、时间", "汇总级时间序列", "内部 BI + 外部聚合", "VOC 已有，来源维度扩展", "与③④ 共享国家×渠道"],
        ["② 订单", "① 订单量区域结构→后台成本（仓网）", "订单量×区域对仓网/成本影响；卖 1 元前后台成本各多少",
         "订单ID、订单日期、国家/站点、渠道/店铺、订单类型、件数/品数、销售额、品单价、前台成本、后台成本、仓库/目的仓、后台成本率",
         "order_id, order_date, country_code, site, channel_id, shop_id, order_type, item_qty, sku_qty, gmv, unit_price, cost_front_total, cost_back_total, cost_back_prod, cost_back_shipping, cost_back_warehouse, cost_back_commission, warehouse_id, dest_warehouse, cost_back_rate",
         "fact_order（订单事实，核心）；fact_order_cost（订单级成本分摊，或合入 fact_order）；dim_warehouse（仓库维度）；dim_order_type（订单类型）",
         "订单、国家、区域、渠道、店铺、仓库、时间", "订单级 + 聚合", "订单事实 + 费用分摊 + 仓网", "金额部分在 BI，需补前后台拆分与件数", "与④③① 共享成本/渠道/订单"],
        ["② 订单", "② 订单平均耗时与核心节点诊断", "履约链路时效瓶颈、周转与体验",
         "订单ID、国家/渠道/店铺、目的仓、创建/支付/出库/交运/清关/签收时间、各节点耗时、总耗时、周转天数、是否超时、是否引发VOC",
         "order_id, country_code, channel_id, dest_warehouse, created_at, paid_at, shipped_at, in_transit_at, cleared_at, delivered_at, lead_time_create_pay, lead_time_ship, lead_time_transit, lead_time_total, turnover_days, is_overdue, has_voc",
         "fact_order 扩展时间戳字段；或 fact_order_fulfillment（履约节点表，与 order_id 1:1）；dim_warehouse",
         "订单、国家、渠道、仓库、时间", "订单级", "OMS/仓配/供应链", "汇总有，明细时间戳需打通", "与③① 共享渠道/物流VOC"],
        ["② 订单", "③ 订单类型与订单价结构→毛利额归因", "促销/组合/价格带对毛利额影响",
         "订单ID、订单类型、活动ID、销售额、毛利额/率、品单价、客品数/客件数、SPU/SKU、品类、国家、渠道",
         "order_id, order_type, is_promo, is_bundle, campaign_id, gmv, gross_margin_amt, gross_margin_pct, unit_price, item_qty, sku_qty, spu_id, sku_id, category_l3, country_code, channel_id",
         "fact_order（含 order_type, campaign_id, margin 等）；fact_order_item（订单行，含 SPU/SKU/单价/数量）；dim_campaign（活动维度）",
         "订单、国家、渠道、品类/SPU、活动类型、时间", "订单级 + SPU/品类聚合", "订单+商品明细+毛利测算", "销售/ASP 有，毛利与活动标记需补", "与④① 共享活动/高VOC品类"],
        ["② 订单", "④ 退款多维归因（反推订单+穿透VOC）", "区分比较策略 vs 产品/组合设计问题；部分退与VOC打通",
         "退款单号、原订单ID、SKU/SPU、颜色/尺码、退款数量/金额、退款原因编码、是否部分退、是否重复投诉、国家/渠道、VOC工单关联键",
         "return_id, order_id, sku_id, spu_id, variant_color, variant_size, return_qty, return_amt, return_reason_code, is_partial_return, is_repeat_complaint, country_code, channel_id, voc_ticket_id",
         "fact_return（退款事实）；dim_return_reason（退款原因维度）；fact_order 保留 order_id 便于关联；与 VOC 工单表通过 order_id/return_id 关联",
         "退款单、订单、SKU/SPU、国家、渠道、时间", "退款级 & 订单级", "售后系统+退款表+VOC工单", "汇总有，需补部分退/原因编码/关联键", "与①③④ 共享售后/VOC/渠道"],
        ["③ 渠道", "① 渠道生命周期与战略校准", "国家×渠道生命周期阶段、营收/利润/目标达成",
         "国家、站点、渠道类型、GTM组、生命周期阶段、销售额、销量、毛利额/率、广告费比、库存/周转、目标销量/额、目标达成率",
         "country_code, site, channel_id, gtm_group, lifecycle_stage, gmv, sales_qty, gross_margin_amt, gross_margin_pct, ad_spend_pct, inventory_qty, turnover_days, target_sales_qty, target_gmv, target_achievement_rate",
         "fact_channel_country_month（国家×渠道×月汇总）；dim_channel（渠道维度，含 channel_type）；dim_channel_lifecycle（阶段配置表）；目标来自全渠道目标管理",
         "国家、渠道、站点、GTM组、时间", "渠道×国家聚合级", "经营驾驶舱+目标看板", "指标多在 BI，阶段/GTM 需标注", "与④① 共享预算/VOC分层"],
        ["③ 渠道", "② 渠道差异与流量布局（含本土对标）", "同国家内渠道/流量结构差异、本土竞品流量结构",
         "国家、渠道、流量来源占比（自然/广告/红人/活动）、Sessions、PV、广告/红人曝光、广告销售额、总销售额、ASP、新老客结构、本土竞品流量结构",
         "country_code, channel_id, traffic_pct_organic, traffic_pct_paid, traffic_pct_influencer, traffic_pct_promo, sessions, pv, ad_impressions, influencer_impressions, ad_sales, gmv, asp, new_customer_pct, competitor_traffic_struct",
         "fact_channel_traffic（国家×渠道×月，流量与销售）；dim_traffic_source；ods_competitor_traffic（本土竞品流量，若可获得）",
         "国家、渠道、流量类型、品类、时间", "国家×渠道聚合", "经营驾驶舱+营销数据+外部", "部分在 BI，流量拆分与竞品需补", "与④① 共享活动组合/VOC"],
        ["③ 渠道", "③ 渠道风险与机会识别", "国家/渠道风险（增速/利润/库存）与机会",
         "销售额增长率、毛利率变化、广告费比、ROAS、周转天数、滞销数、低库存数、退货率、VOC率、目标达成率、预测偏差率",
         "gmv_yoy, margin_pct_chg, ad_spend_pct, roas, turnover_days, slow_moving_qty, low_stock_qty, return_rate, voc_rate, target_achievement_rate, forecast_bias_rate",
         "fact_channel_health（国家×渠道×月，健康度指标视图）；可由 fact_channel_country_month + 预测/目标/库存 等表计算",
         "国家、渠道、站点、品类、时间", "国家×渠道×时间聚合", "多看板聚合", "多为计算指标", "全专题共享健康度视图"],
        ["④ 营销", "① 用户精准营销与LTV二次增长", "生命周期阶段×活动类型下的 LTV 增量与二次曲线",
         "用户ID、新老客标签、生命周期分段、渠道/国家、活动类型/项目ID、活动前后消费轨迹、LTV分段、LTV增量",
         "user_id_anon, is_new_customer, lifecycle_segment, first_order_dt, cum_gmv, cum_order_cnt, channel_id, country_code, campaign_id, campaign_type, ltv_segment, ltv_incr_amt",
         "fact_user_lifecycle（用户×渠道/国家×月）；fact_user_campaign（用户参与活动明细）；dim_campaign；dim_ltv_segment",
         "用户、国家、渠道、活动类型、时间", "用户级 & 活动级", "CRM/订单/活动参与", "LTV 若有则复用，否则需建用户层", "与②③① 共享订单/渠道/VOC人群"],
        ["④ 营销", "② 广告/促销/推广/会员费结构", "国家×渠道×活动类型费用结构与ROI基准",
         "活动/项目ID、活动类型、国家、渠道、店铺、广告费、促销折扣额、推广费、红人费、会员成本、曝光、点击、CPC、ROAS、广告销售额、目标/达成率",
         "campaign_id, campaign_type, country_code, channel_id, shop_id, ad_spend, promo_discount_amt, promo_spend, influencer_spend, membership_cost, impressions, clicks, cpc, roas, ad_attributed_sales, target_gmv, achievement_rate",
         "fact_campaign_daily（活动×国家×渠道×日）；dim_campaign_type（活动类型，含 品牌广告/效果广告/促销/会员/KOL/内容/大促）；dim_cost_type",
         "国家、渠道、活动类型、项目ID、店铺、时间", "活动/项目级", "广告/费用系统+经营驾驶舱", "曝光/费用多在 BI，类型与拆分需规范", "与②③ 共享前台成本/渠道"],
        ["④ 营销", "③ 广告与促销精细化ROI（含曝光归因）", "国家-渠道-活动类型下因活动带来的销售额与ROI",
         "国家、渠道、活动类型、项目ID、SPU、曝光、点击、花费、触达人数、频次、活动期销售额、基准期销售额、归因销售额、ROAS、促销毛利增量ROI",
         "country_code, channel_id, campaign_type, campaign_id, spu_id, impressions, clicks, spend, reach, frequency, sales_in_campaign, sales_baseline, attributed_sales, roas, promo_margin_roi",
         "fact_campaign_roi（活动×国家×渠道×SPU×日/活动期）；fact_campaign_attribution（归因结果表，attributed_sales 等）；依赖外部曝光/触达接入",
         "国家、渠道、活动类型、项目ID、SPU、时间", "活动级 & SPU聚合", "内部投放+订单+外部曝光", "内部有，归因与外部曝光需补", "与③① 共享渠道策略/VOC效果"],
    ]

    df_raw = pd.DataFrame(rows, columns=base_cols)

    # 按字段级展开：中文指标 & 英文字段一一拆分到行
    field_rows = []
    for _, r in df_raw.iterrows():
        chinese_raw = str(r["所需核心指标/字段"]) if pd.notna(r["所需核心指标/字段"]) else ""
        english_raw = str(r["字段英文名（关键）"]) if pd.notna(r["字段英文名（关键）"]) else ""

        # 中文字段按中文顿号/逗号拆分
        cn_items = [item.strip() for item in chinese_raw.replace("，", "、").split("、") if item.strip()]
        # 英文字段按英文逗号拆分
        en_items = [item.strip() for item in english_raw.split(",") if item.strip()]

        # 只保留「中英文均存在」的成对字段，避免一侧为空不好对接
        pair_len = min(len(cn_items), len(en_items))
        if pair_len == 0:
            continue

        for i in range(pair_len):
            rec = {
                "专题": r["专题"],
                "子课题": r["子课题"],
                "业务问题/目的（简要）": r["业务问题/目的（简要）"],
                "库表建议": r["库表建议"],
                "关键切片维度": r["关键切片维度"],
                "数据粒度": r["数据粒度"],
                "数据来源": r["数据来源"],
                "是否已有": r["是否已有"],
                "备注/复用": r["备注/复用"],
                # 字段级中文/英文
                "指标中文_单个": cn_items[i],
                "字段英文_单个": en_items[i],
            }
            field_rows.append(rec)

    field_cols = [
        "专题",
        "子课题",
        "业务问题/目的（简要）",
        "指标中文_单个",
        "字段英文_单个",
        "库表建议",
        "关键切片维度",
        "数据粒度",
        "数据来源",
        "是否已有",
        "备注/复用",
    ]

    return pd.DataFrame(field_rows, columns=field_cols)


def sheet_02_bi_mapping():
    """02_通用指标池↔存量BI映射"""
    cols = ["抽象字段/指标", "存量 BI 指标名称", "所在模块/看板", "主要切片维度", "典型专题/子课题"]
    rows = [
        ["Sessions（会话数）", "总会话数 (Sessions)", "经营驾驶舱：全链路分析", "渠道/国家/店铺/GTM/SPU", "专题③ 渠道①②；专题④ ②③"],
        ["PV（页面浏览量）", "总页面浏览量 (PV)", "经营驾驶舱：全链路分析", "页面/SPU/渠道", "专题③ 渠道②；专题④ ③"],
        ["广告曝光量", "总广告曝光量", "经营驾驶舱：全链路分析", "渠道/国家/SPU", "专题③ 渠道②；专题④ ②③"],
        ["红人曝光量", "总红人曝光量", "经营驾驶舱：全链路分析", "渠道/国家/SPU", "专题③ 渠道②；专题④ ②③"],
        ["广告点击量", "总广告点击量", "经营驾驶舱：全链路分析", "渠道/国家/SPU", "专题④ ②③"],
        ["转化率 CVR", "转化率 (CVR)", "经营驾驶舱：全链路分析", "渠道/三级类目/SPU", "专题③ 渠道②；专题④ ③"],
        ["CPC", "CPC", "经营驾驶舱：全链路分析", "渠道/国家/关键词", "专题④ ②③"],
        ["ROAS", "ROAS", "经营驾驶舱：全链路分析", "渠道/店铺/SPU", "专题④ ②③；专题③ 渠道③（风险/机会）"],
        ["广告费比", "广告费比", "经营驾驶舱：全链路分析", "店铺/SPU/渠道", "专题④ ②；专题③ 渠道①③"],
        ["广告花费", "广告花费", "经营驾驶舱：全链路分析", "渠道/店铺/SPU", "专题④ ②③"],
        ["广告销售额", "广告销售额", "经营驾驶舱：全链路分析", "渠道/SPU/活动", "专题④ ②③；专题③ 渠道②"],
        ["总销量", "总销量", "经营驾驶舱：全链路分析", "店铺/SPU/国家", "专题② ①③④；专题③ ①②③；专题① （分母）"],
        ["销售额", "销售额", "经营驾驶舱：全链路分析", "组织架构/渠道/SPU", "专题② 全部；专题③ 全部；专题④ 全部"],
        ["ASP（成交均价）", "成交均价 (ASP)", "经营驾驶舱：全链路分析", "渠道/SPU/国家", "专题② ③；专题③ ②"],
        ["促销折扣额", "促销折扣额", "经营驾驶舱：全链路分析", "店铺/SPU", "专题② ③；专题④ ②③"],
        ["退款额", "退款额", "经营驾驶舱：全链路分析", "店铺/SPU/原因", "专题② ④；专题① ①（VOC率背景）；专题③ ③"],
        ["总库存", "总库存", "经营驾驶舱：全链路分析", "仓库/SPU", "专题② ①②；专题③ ③"],
        ["海外/平台仓库存", "海外仓/平台仓库存数", "经营驾驶舱：全链路分析", "仓库类型/渠道", "专题② ①；专题③ ①③"],
        ["周转天数", "周转天数", "经营驾驶舱：全链路分析", "仓库/SPU", "专题② ②；专题③ ③"],
        ["滞销数量", "滞销数量", "经营驾驶舱：全链路分析", "仓库/SKU", "专题③ ③"],
        ["低库存数量", "低库存数量", "经营驾驶舱：全链路分析", "仓库/SKU", "专题③ ③；供应链风控"],
        ["VOC量", "VOC量", "VOC分析：核心看板", "店铺/SPU/品线/区域", "专题① 全部；专题② ④；专题③ 渠道风险"],
        ["VOC率", "VOC率", "VOC分析：核心看板", "店铺/SPU/品线", "专题① 全部；专题② ④；专题③ ③"],
        ["DOA率", "DOA率", "VOC分析：核心看板", "SPU/批次/仓库", "专题① ①；专题② ④"],
        ["退货率", "退货率", "VOC分析：核心看板", "店铺/SPU/原因", "专题② ④；专题① ①；专题③ ③"],
        ["星级评分", "星级评分", "VOC分析：核心看板", "SPU/店铺/品线", "专题① ①③；专题④ ①"],
        ["好评率/中差评率", "好评率/中差评率", "VOC分析：核心看板", "SPU/店铺/品线", "专题① ①③；专题④ ①"],
        ["三级类目VOC率", "三级类目VOC率", "VOC分析：品类分析", "类目", "专题① ①②③；专题② 品类优先级"],
        ["VOC来源分布", "VOC来源分布", "VOC分析：趋势分析", "来源类型", "专题① ④（全域声量）；专项 VOC 扩展"],
        ["评论数/新增评论数", "累计评论数/新增评论数", "VOC分析：商品评分与评论", "SPU/店铺", "专题① ①③；专题④ ①"],
        ["退货数量", "退货数量", "售后成本看板", "SPU/品类/渠道/平台/国家", "专题② ④；专题③ ③"],
        ["补发数量", "补发数量", "售后成本看板", "SPU/品类/渠道/平台/国家", "专题② ④（原因拆解）；质量专项"],
        ["退货率+补发比例", "退货率+补发比例", "售后成本看板", "SPU/品类/渠道/平台/国家", "售后健康度，支持专题②、③"],
        ["售后总成本", "售后总成本", "售后成本看板", "SPU/品类/渠道/平台/国家", "专题② ④；业财一体化"],
        ["VOC工单总量", "VOC工单总量", "VOC工单预警", "平台/渠道/国家/品类/SPU", "专题① ①；专题② ④"],
        ["预警工单数/率", "预警工单数/预警工单率", "VOC工单预警", "同上", "同上"],
        ["超时工单数/平均处理时长", "超时工单数/平均处理时长", "VOC工单预警", "同上", "专题① ①；服务体验"],
        ["满意率/SLA达成率", "满意率/ SLA达成率", "客服绩效看板", "客服名字/团队", "专题① ①；服务域改善"],
        ["预测销量/预测销售额", "预测销量/预测销售额", "销售预测看板", "SKU/类目/渠道/区域", "专题③ ③；供应链/备货"],
        ["预测准确率/偏差率", "预测准确率/偏差率", "预测准确率看板", "SKU/类目/渠道/区域", "专题③ ③；风险预警"],
        ["目标销量/目标销售额", "目标销量/目标销售额", "全渠道目标管理", "SKU/类目/渠道/区域/GTM组", "专题③ ①③；专题④ ②③"],
        ["目标达成率/目标偏差率", "目标达成率/目标偏差率", "全渠道目标管理", "同上", "专题③ ③；专项复盘"],
    ]
    return pd.DataFrame(rows, columns=cols)


def sheet_02_supplement_fields():
    """02_需在明细层补充的关键字段"""
    cols = ["字段类别", "关键字段/说明"]
    rows = [
        ["订单级字段", "订单ID、订单类型（促销/非促销、组合/非组合）、活动ID、件数/品数（客件数/客品数）、前台成本拆分（广告费、促销折扣、平台推广等）、后台成本拆分（生产、头程、仓储、配送、平台佣金等）、订单各节点时间戳、是否部分退"],
        ["退款与售后字段", "退款单号、退款原因编码（结构化）、是否部分退、是否多次/重复投诉、退款与 VOC 工单/社媒差评之间的关联键"],
        ["国家与渠道画像字段", "生命周期阶段、GTM组、渠道类型（Amazon/独立站/TikTok/线下等）、流量来源结构（自然/广告/红人/活动占比）、本土竞品流量结构（如可获得）"],
        ["活动与营销字段", "活动/项目ID、活动类型（品牌广告/效果广告/促销/会员运营/KOL/内容/大促等）、费用结构拆分（广告费、促销折扣、推广费、会员运营费等）、外部曝光/触达/点击指标"],
        ["用户与生命周期字段", "用户ID（或匿名 ID）、新客/老客标签、生命周期分段、历史 LTV 与 LTV 增量等"],
    ]
    return pd.DataFrame(rows, columns=cols)


def sheet_03_external_data():
    """03_外部数据需求清单（结构化摘要）"""
    cols = ["专题", "数据源类型", "内容摘要", "最小字段集/要点"]
    rows = [
        ["专题① VOC", "货架外垂类社区&社媒", "Reddit、BabyCenter、Mumsnet、Peanut 等；帖子/评论级", "平台/社区、国家/语言、帖子ID/评论ID、发布时间、标题正文、内容类型、品类/品牌提及、主题标签、情绪极性、互动指标"],
        ["专题① VOC", "本土竞品与品牌口碑", "上述平台补充本土品牌；Trustpilot 等", "品牌名称、本地语言别名、产品线；评分、评论数、主要优缺点标签"],
        ["专题① VOC", "与订单/VOC 打通键值", "规划", "站点/国家、时间窗口、品牌/品类、SKU 映射策略（名称+特征匹配）"],
        ["专题② 订单", "订单级前后台成本", "内部系统建设（ERP/财务对接）", "前台成本（广告费、促销折扣、平台推广）与后台成本（生产、头程、关税、仓储、配送、佣金）在订单/明细层分摊规则与字段"],
        ["专题② 订单", "物流/清关外部接口", "若有 API", "节点时间（到港、清关开始/结束、交付）、异常码"],
        ["专题③ 渠道", "本土品牌与渠道流量布局", "行业报告、第三方、平台公开榜单", "国家、品类、本土品牌名单；渠道结构（各渠道销售/流量占比）；媒介/流量类型结构；品牌在主要渠道的关键战场"],
        ["专题③ 渠道", "宏观/行业基准（可选）", "行业白皮书", "各国母婴市场体量、增速、线上渗透率；消费习惯与价格带偏好"],
        ["专题④ 营销", "广告与红人平台曝光/触达", "Meta/Google/TikTok Ads、社媒 Insights、红人/MCN 后台", "活动/项目ID、广告账户、国家、渠道；曝光量、触达、点击、花费、频次；展示位置；归因窗口与模型参数"],
        ["专题④ 营销", "红人/内容合作效果", "YouTube/Instagram/TikTok/小红书等", "平台、创作者ID、内容ID、发布时间；播放/完播率、互动、点击或导流；内容标签与品类/产品关联"],
        ["专题④ 营销", "与内部 GMV 归因桥接", "规划", "活动ID+国家+渠道+时间窗口 对比组 vs 实验组；或曝光-点击-会话-订单统计相关模型"],
        ["交叉线", "高浓度社区元数据表", "目标客群浓度高的社区", "社区名称、国家/区域、受众画像（孕期/宝龄段/收入/兴趣）、适合投放形式、历史合作经验"],
        ["交叉线", "国家×渠道补充信号（可选）", "行业报告/公开统计", "各国母婴人群在主要社媒的渗透率、使用频率"],
    ]
    return pd.DataFrame(rows, columns=cols)


def sheet_04_public_dimensions():
    """04_公共维度字段"""
    cols = ["维度", "字段示例", "典型用途", "复用专题"]
    rows = [
        ["时间", "订单日期、发货日期、签收日期、统计月份/周次", "全部时间序列分析与对比", "①②③④ 全部子课题"],
        ["国家/站点", "国家代码、站点（US/UK/DE/FR 等）", "国家画像、区域结构、渠道角色", "专题② ①②③④；专题③ 全部；专题④ 全部；专题① ②④"],
        ["渠道/平台", "渠道类型（Amazon/独立站/TikTok/线下等）、店铺", "渠道健康度、流量布局、活动归因", "专题② 全部；专题③ 全部；专题④ 全部；专题① ①④"],
        ["品类/品线/三级类目", "品类编码、品线、三级类目", "品类质量、品类结构、购物篮分析", "专题① ①②③；专题② ③④；专题③ ②③；专题④ ①"],
        ["SPU/SKU", "产品编码（ASIN/SKU/SPU）、产品名称", "商品级分析、组合识别、退款与 VOC 对齐", "专题① ①②③；专题② 全部；专题③ ②③；专题④ ③"],
        ["用户/客户", "用户ID/客户ID（如可用）、新客/老客标签", "LTV、精准营销、复购分析", "专题④ ①；专题②（订单结构与复购）"],
        ["仓库/目的仓", "仓库编码、仓库类型（海外仓/平台仓/中仓）、目的仓", "仓网布局、库存/周转、订单履约路径", "专题② ①②；专题③ ③"],
        ["活动/项目", "活动ID、活动类型、项目ID", "促销与广告分析、ROI 归因", "专题② ③；专题④ ②③；部分影响专题③ 渠道策略"],
    ]
    return pd.DataFrame(rows, columns=cols)


def sheet_04_public_metrics():
    """04_公共指标字段"""
    cols = ["指标类型", "指标示例", "存量 BI 映射", "主要复用专题"]
    rows = [
        ["流量", "Sessions、PV、广告曝光量、红人曝光量、广告点击量、CVR、CPC、ROAS、广告费比、广告花费", "经营驾驶舱：全链路分析", "专题③（渠道②③）、专题④（②③）、专题①（④）"],
        ["销售", "销量、销售额、ASP、小计 (Total)", "经营驾驶舱、销售统计", "专题② 全部；专题③ 全部；专题④ 全部；专题①（作为 VOC 分母）"],
        ["成本", "前台成本（广告费、促销折扣额等）、后台成本、售后总成本", "经营驾驶舱、售后成本看板 + 成本系统", "专题② ①③④；专题④ ②③；业财一体化 Agent"],
        ["库存与周转", "总库存、海外/平台仓库存、周转天数、滞销数量、低库存数量", "经营驾驶舱、需求计划、自动备货", "专题② ①②；专题③ ③；供应链相关决策"],
        ["目标与预测", "预测销量/销售额、预测准确率/偏差率、目标销量/销售额、目标达成率/偏差率", "销售预测看板、预测准确率、全渠道目标管理", "专题③ ①③；专题④ ②③；供应链/预算"],
        ["VOC 与口碑", "VOC量、VOC率、DOA率、退货率、星级评分、好评率/中差评率、三级类目VOC率、VOC来源分布、评论数/新增评论数", "VOC分析、售后成本、VOC工单预警", "专题① 全部；专题② ④；专题③ ③；专题④ ①"],
        ["售后与退款", "退货数量、退货率、补发数量/比例、售后总成本", "售后成本看板", "专题② ④；专题① ①；专题③ ③"],
    ]
    return pd.DataFrame(rows, columns=cols)


def sheet_04_cross_topic_reuse():
    """04_专题间典型字段复用场景"""
    cols = ["场景", "关键字段", "用途"]
    rows = [
        ["VOC ↔ 订单&退款（专题①↔②）", "SPU/SKU、国家、渠道、时间、退货率、退款原因、VOC标签（产品/物流/服务等）、中差评率", "高退货率/高中差评 SKU 在订单侧与 VOC 侧对齐，识别产品缺陷 vs 预期不符 vs 物流/服务问题"],
        ["VOC ↔ 渠道画像（专题①↔③）", "国家、渠道、VOC量/率、星级评分、Sessions、销售额", "渠道画像加入质量/口碑维度，如某国某渠道销量高但 VOC 率偏高需优先投入服务与质量改善"],
        ["渠道画像 ↔ 营销 ROI（专题③↔④）", "国家、渠道、生命周期阶段、销售额、毛利率、ROAS、广告费比、目标达成率", "由渠道生命周期与国家画像决定渠道角色（增量战场/利润池/防守位），再在 ROI 模块设定差异化 ROI 基准与预算分配"],
        ["营销活动 ↔ 订单&商品结构（专题④↔②）", "活动ID/项目ID、活动类型、国家、渠道、销售额、毛利额、促销折扣额、客单价/客品数、退货率", "评估不同活动类型对卖得更贵 vs 买得更多件的影响，结合退货与 VOC 看是否形成健康结构"],
        ["VOC&社媒社区 ↔ 营销活动配置（专题①↔④）", "社区名称、国家/区域、话题标签、目标客群画像、历史活动表现（若有）", "根据 VOC 识别目标客群浓度高的社区，反向配置活动类型与内容形式，在 ROI 模块中单独追踪效果"],
    ]
    return pd.DataFrame(rows, columns=cols)


def sheet_05_review():
    """05_审查结论与处理"""
    cols = ["审查项", "发现", "处理"]
    rows = [
        ["主键未显式定义", "原文档仅写「主键见关键切片维度」，未给出单表唯一性约束", "为每张 fact/dim/ods 表给出建议主键（含联合主键）"],
        ["粒度与事实表行含义不清", "部分表「一行代表什么」未写清，易导致重复计算或 Join 错误", "为每张事实表明确粒度（Grain）描述"],
        ["订单与订单行拆分", "fact_order 与 fact_order_item 的职责与关联需固定", "约定 fact_order=1行/订单，fact_order_item=1行/订单行；(order_id, line_item_id) 为 item 表主键"],
        ["退款表支持部分退", "退款需支持「一单多 SKU、部分退」分析", "fact_return 粒度定为一行/退货行，主键 (return_id, return_line_id) 或 (return_id, sku_id)"],
        ["渠道/营销汇总表唯一性", "国家×渠道×时间 等汇总表需保证唯一性", "所有汇总事实表均给出 (维度组合+时间) 的联合主键"],
        ["维度表主键", "维度表若仅写「维度」易与业务主键混淆", "统一约定：dim 表以业务主键（如 channel_id）为 PK；若需历史拉链则增加 surrogate_key + effective_dt/end_dt"],
        ["分区与性能", "未约定分区键，大表扫描成本高", "对事实表统一建议分区键（一般为日期/月份）"],
    ]
    return pd.DataFrame(rows, columns=cols)


def sheet_05_fact_tables():
    """05_事实表—粒度、主键、分区"""
    cols = ["表名", "粒度（Grain）", "主键（PK）", "分区键", "关键维度（外键逻辑）", "关键度量", "备注"]
    rows = [
        ["fact_order", "一行=一张订单", "order_id", "order_date（或 dt）", "country_code, site, channel_id, shop_id, warehouse_id, dest_warehouse, order_type", "gmv, item_qty, sku_qty, cost_front_total, cost_back_*, gross_margin_amt, turnover_days, created_at, paid_at, shipped_at, delivered_at, campaign_id（可选）", "订单事实核心表；成本与履约字段可放本表或扩展表"],
        ["fact_order_item", "一行=订单内一个商品行", "(order_id, line_item_id) 或 (order_id, sku_id)", "order_date（与 fact_order 一致）", "order_id, spu_id, sku_id, category_l3", "unit_price, item_qty, gmv_line, gross_margin_amt_line, is_promo, is_bundle", "与 fact_order 通过 order_id 关联"],
        ["fact_return", "一行=一次退款中的一个 SKU（支持部分退）", "(return_id, return_line_id) 或 (return_id, sku_id)", "return_dt", "order_id, return_id, sku_id, spu_id, country_code, channel_id, return_reason_code, voc_ticket_id", "return_qty, return_amt, is_partial_return, is_repeat_complaint", "同一 order_id 可有多条 return 行"],
        ["fact_voc_summary", "一行=某渠道×国家×SPU×月份 的汇总", "(channel_id, country_code, spu_id, dt_month)；若有店铺粒度则加 shop_id", "dt_month", "channel_id, country_code, shop_id, spu_id", "voc_cnt, voc_rate, star_rating, good_rate, bad_rate, sales_qty, return_rate, doa_rate, review_cnt, review_cnt_new", "汇总表，由评论/工单明细 ETL 聚合"],
        ["fact_voc_trend", "一行=某国家×渠道×来源类型×品类×月份", "(country_code, channel_id, voc_source_type, category_l3, dt_month)", "dt_month", "country_code, channel_id, voc_source_type, category_l3", "voc_cnt, voc_rate, sales_qty, voc_trend_12m, mention_volume", "由 fact_voc_summary 与 ods_voc_external 等聚合"],
        ["fact_voc_brand_summary", "一行=某品牌×国家×渠道×月份", "(brand_id, country_code, channel_id, dt_month)", "dt_month", "brand_id, country_code, channel_id, spu_id（可选）", "voc_cnt, voc_rate, star_rating, bad_rate, tag_localized", "与 dim_brand 关联"],
        ["fact_channel_country_month", "一行=某国家×渠道×月份", "(country_code, channel_id, dt_month)", "dt_month", "country_code, site, channel_id, gtm_group, lifecycle_stage", "gmv, sales_qty, gross_margin_amt, gross_margin_pct, ad_spend_pct, inventory_qty, turnover_days, target_sales_qty, target_gmv, target_achievement_rate", "渠道月汇总"],
        ["fact_channel_traffic", "一行=某国家×渠道×月份（流量与销售）", "(country_code, channel_id, dt_month)", "dt_month", "country_code, channel_id", "traffic_pct_organic, traffic_pct_paid, traffic_pct_influencer, traffic_pct_promo, sessions, pv, ad_impressions, influencer_impressions, ad_sales, gmv, asp, new_customer_pct", "可与 fact_channel_country_month 合并为一张宽表"],
        ["fact_channel_health", "一行=某国家×渠道×月份（健康度指标）", "(country_code, channel_id, dt_month)", "dt_month", "country_code, channel_id", "gmv_yoy, margin_pct_chg, ad_spend_pct, roas, turnover_days, slow_moving_qty, low_stock_qty, return_rate, voc_rate, target_achievement_rate, forecast_bias_rate", "可由 fact_channel_country_month + 预测/目标/库存 等计算"],
        ["fact_campaign_daily", "一行=某活动×国家×渠道×日", "(campaign_id, country_code, channel_id, dt)", "dt", "campaign_id, campaign_type, country_code, channel_id, shop_id", "ad_spend, promo_discount_amt, promo_spend, influencer_spend, membership_cost, impressions, clicks, cpc, roas, ad_attributed_sales, target_gmv, achievement_rate", "活动日汇总"],
        ["fact_campaign_roi", "一行=某活动×国家×渠道×SPU×日（或活动期）", "(campaign_id, country_code, channel_id, spu_id, dt)", "dt", "campaign_id, country_code, channel_id, spu_id", "impressions, clicks, spend, reach, frequency, sales_in_campaign, sales_baseline, attributed_sales, roas, promo_margin_roi", "精细化 ROI；attributed_sales 由归因逻辑产出"],
        ["fact_user_lifecycle", "一行=某用户×月份（或 用户×渠道×国家×月）", "(user_id_anon, dt_month)；若按渠道国家则 (user_id_anon, channel_id, country_code, dt_month)", "dt_month", "user_id_anon, channel_id, country_code", "is_new_customer, lifecycle_segment, first_order_dt, cum_gmv, cum_order_cnt, ltv_segment, ltv_incr_amt", "用户生命周期快照"],
        ["fact_user_campaign", "一行=某用户参与某活动的一次记录", "(user_id_anon, campaign_id, event_dt) 或 (user_id_anon, campaign_id)", "event_dt", "user_id_anon, campaign_id, campaign_type, country_code, channel_id", "参与次数、触达次数等（按需）", "用户-活动参与明细"],
        ["fact_order_fulfillment（可选）", "一行=一张订单的履约节点快照（与 order 1:1）", "order_id", "order_date", "order_id, country_code, channel_id, dest_warehouse", "created_at, paid_at, shipped_at, in_transit_at, cleared_at, delivered_at, lead_time_*, turnover_days, is_overdue, has_voc", "若与 fact_order 合并则无需单独表"],
        ["fact_voc_external_daily（可选）", "一行=某平台×国家×主题×日 的声量汇总", "(platform, country_code, topic_tag, dt)", "dt", "platform, country_code, topic_tag", "post_cnt, comment_cnt, mention_self_cnt, mention_comp_cnt", "由 ods_voc_external 聚合"],
    ]
    return pd.DataFrame(rows, columns=cols)


def sheet_05_dim_tables():
    """05_维度表—主键与属性"""
    cols = ["表名", "主键（PK）", "关键属性（示例）", "说明"]
    rows = [
        ["dim_channel", "channel_id", "channel_name, channel_type, site, gtm_group", "渠道维度；若渠道有历史变更可做 SCD2"],
        ["dim_warehouse", "warehouse_id", "warehouse_name, warehouse_type, country_code, is_fba", "仓库/目的仓维度"],
        ["dim_order_type", "order_type 或 order_type_id", "order_type_name, is_promo, is_b2b", "订单类型分类"],
        ["dim_return_reason", "return_reason_code", "return_reason_name, reason_category（产品/物流/主观等）", "退款原因维度，便于与 VOC 标签对齐"],
        ["dim_campaign", "campaign_id", "campaign_name, campaign_type, country_code, channel_id, start_dt, end_dt", "活动主数据；与 fact_campaign_* 关联"],
        ["dim_campaign_type", "campaign_type", "campaign_type_name（品牌广告/效果广告/促销/会员/KOL/内容/大促）", "活动类型分类"],
        ["dim_brand", "brand_id", "brand_name, is_self（我们/竞品）, country_code", "品牌维度，VOC 竞品与本土化用"],
        ["dim_voc_tag", "tag_id 或 (tag_l2, tag_l3)", "tag_l2, tag_l3, tag_category", "VOC 标签体系"],
        ["dim_voc_external_community", "platform + community_name 或 community_id", "platform, community_name, country_scope, lang", "外部社区/平台维度"],
        ["dim_channel_lifecycle", "lifecycle_stage", "stage_name, stage_order（导入/成长/成熟/衰退）", "渠道生命周期阶段配置"],
        ["dim_traffic_source", "traffic_source_type", "traffic_source_name（自然/广告/红人/活动）", "流量来源类型"],
        ["dim_ltv_segment", "ltv_segment", "segment_name, min_gmv, max_gmv（或类似）", "LTV 分段配置"],
        ["dim_spu / dim_sku", "spu_id / sku_id", "spu_name, sku_name, category_l3, category_l2, variant_color, variant_size", "商品维度；若已有 ERP 主数据可复用"],
    ]
    return pd.DataFrame(rows, columns=cols)


def sheet_05_ods_tables():
    """05_贴源层（ods_*）"""
    cols = ["表名", "建议主键", "分区键", "用途"]
    rows = [
        ["ods_voc_external", "(platform, post_id, comment_id) 或 (platform, comment_id)", "post_time 或 dt", "外部帖子/评论原始数据；ETL 清洗后入 fact_voc_* / fact_voc_external_daily"],
        ["ods_review_detail", "(channel_id, review_id) 或 (order_id, review_id) 视业务", "review_dt", "站内评论明细，供 fact_voc_summary 聚合"],
        ["ods_competitor_traffic", "(country_code, channel_id, source_type, dt_month) 若为汇总；或 (report_id, country_code, channel_id) 若为报告快照", "dt_month 或 report_dt", "本土竞品流量结构，外部或手工录入"],
    ]
    return pd.DataFrame(rows, columns=cols)


def main():
    with pd.ExcelWriter(OUT_EXCEL, engine="openpyxl") as writer:
        sheet_01_topic_matrix().to_excel(writer, sheet_name="01_专题课题_数据需求矩阵", index=False)
        sheet_02_bi_mapping().to_excel(writer, sheet_name="02_存量BI指标映射", index=False)
        sheet_02_supplement_fields().to_excel(writer, sheet_name="02_需补充明细字段", index=False)
        sheet_03_external_data().to_excel(writer, sheet_name="03_外部数据需求清单", index=False)
        sheet_04_public_dimensions().to_excel(writer, sheet_name="04_公共维度字段", index=False)
        sheet_04_public_metrics().to_excel(writer, sheet_name="04_公共指标字段", index=False)
        sheet_04_cross_topic_reuse().to_excel(writer, sheet_name="04_专题间复用场景", index=False)
        sheet_05_review().to_excel(writer, sheet_name="05_审查结论与处理", index=False)
        sheet_05_fact_tables().to_excel(writer, sheet_name="05_事实表_粒度主键分区", index=False)
        sheet_05_dim_tables().to_excel(writer, sheet_name="05_维度表_主键与属性", index=False)
        sheet_05_ods_tables().to_excel(writer, sheet_name="05_贴源层_主键与用途", index=False)
    print("已导出:", OUT_EXCEL)


if __name__ == "__main__":
    main()
