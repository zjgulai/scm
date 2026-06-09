---
title: "Phase 3 准备：虚拟数据生成器"
doc_type: workflow
module: "phase3-operationalization"
topic: "PHASE3-PREPARE"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# Phase 3 准备：虚拟数据生成器

基于 Phase2 的成功经验，为其他专题准备 Mock 数据生成器。

## 当前计划

### 专题① VOC数据 (P3-T1)
- 目标：货架内/外用户声音分析
- 输入表：fact_voc_summary, ods_voc_external, dim_voc_tag
- 需要：评论数据、情绪标签、主题分类

### 专题③ 渠道健康度 (P3-T3)
- 目标：分国家渠道运营健康度
- 输入表：fact_channel_country_month, fact_channel_traffic, fact_channel_health
- 需要：渠道流量、转化率、库存数据

### 专题④ 营销ROI (P3-T4)
- 目标：营销项目类型ROI量化
- 输入表：fact_campaign_daily, fact_campaign_roi, fact_user_lifecycle
- 需要：广告投放、促销费用、用户LTV数据

---

## 已完成：Phase2 MVP

| 专题/交叉线 | 状态 | 产出 |
|-------------|------|------|
| 专题② 订单质量 | ✅ | 成本/毛利/退款归因CSV + PPT |
| 交叉线3 退款→VOC | ✅ | 双重视图结论 + PPT |

---

## 快速运行（Phase2）

```bash
cd /Users/pray/project/ecom_ana_overview

python data_example/scripts/generate_phase2_mock_data.py
python data_example/scripts/run_phase2_topic2_pipeline.py
python data_example/scripts/run_phase2_crossline3_pipeline.py
python data_example/scripts/run_phase2_crossline3_voc_agent.py
python data_example/scripts/build_phase2_ppt.py
```

---

## 下一步决策

1. **启动专题① VOC分析** - 需确认VOC数据源
2. **启动专题③ 渠道健康度** - 需确认渠道数据源
3. **启动专题④ 营销ROI** - 需确认营销数据源
4. **等待数仓就绪** - 继续完善Phase2

请指示下一步方向。
