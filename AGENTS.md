# Skills 快速参考

> 项目包含 100+ 逻辑 Skills，分为 5 个层级。详细清单见 `SKILLS_INVENTORY.md`。

## 跨境电商数据分析 Skills（39个）

位置：`skills/cross_border_ecommerce/skills/`

### 按场景速查

| 场景 | Skill | 脚本路径 |
|------|-------|---------|
| 毛利归因 | margin-attribution | `02-attribution-analysis/margin-attribution/` |
| 成本结构 | cost-structure-analysis | `03-cost-analysis/cost-structure-analysis/` |
| 贡献度分解 | contribution-calculation | `02-attribution-analysis/contribution-calculation/` |
| 复杂归因（偏微分） | complex-contribution | `02-attribution-analysis/complex-contribution/` |
| 同比环比 | yoy-mom-analysis | `05-trend-analysis/yoy-mom-analysis/` |
| 用户分群/RFM | customer-segmentation | `08-customer-analysis/customer-segmentation/` |
| 群组留存 | cohort-analysis | `11-user-behavior-analysis/cohort-analysis/` |
| 转化漏斗 | conversion-funnel | `11-user-behavior-analysis/conversion-funnel/` |
| 渠道效果 | channel-effect-analysis | `16-channel-analysis/channel-effect-analysis/` |
| 广告归因 | ad-attribution | `12-marketing-analysis/ad-attribution/` |
| 异常检测 | anomaly-detection | `07-monitoring-analysis/anomaly-detection/` |
| 竞争分析 | competitive-analysis | `15-campaign-analysis/competitive-analysis/` |
| 定价优化 | pricing-optimization | `09-pricing-analysis/pricing-optimization/` |
| AB测试 | ab-testing | `13-methodology-analysis/ab-testing/` |
| 杜邦分析 | dupont-analysis | `01-financial-analysis/dupont-analysis/` |

### 检索

```bash
python3 skills/cross_border_ecommerce/skills_index.py "关键词"
```

---

## 麦肯锡 PPT Skills（20个）

位置：`skills/mckinsey_ppt/skills/`

### 典型工作流

```
图表选型 → 图表制作 → 业务应用 → 结论表达
```

### 按需求速查

| 需求 | Skill |
|------|-------|
| 选图指导 | chart-type-guide |
| 复合图（柱+线） | combination-chart |
| 多维图（瀑布/增长驱动） | multi-dimensional-charts |
| 母婴电商场景 | maternal-ecommerce-charts |
| 品牌健康度 | brand-health-charts |
| 渠道策略 | channel-strategy-charts |
| 消费者分析 | consumer-analysis-charts |
| 结论先行 | conclusion-first |
| 金字塔原理 | pyramid-principle |
| Chartify出图 | chartify-chart-generation |

### 检索

```bash
python3 skills/mckinsey_ppt/skills_index.py "关键词"
```

---

## Cursor 业务专项 Skills（7个）

位置：`.cursor/skills/`

| Skill | 用途 |
|-------|------|
| momcozy-margin-analysis | Momcozy 毛利率归因（平台×区域×品线） |
| momcozy-product-line-basket-reporting | 购物篮 & 品线组合报告 |
| book-knowledge-extraction | 书籍双引擎知识萃取 |
| gamma-executive-ppt-generation | Gamma 管理层 PPT 生成 |
| kpi-smart-monthly-goal | 月度 KPI SMART 化 |
| supply-chain-indicator-decoding | 供应链指标解码 |
| supply-chain-solution-storyline | 供应链管理层故事线 |

---

## 常用工作流

### 销售分析报告
1. `yoy-mom-analysis` → 趋势
2. `contribution-calculation` → 归因
3. `combination-chart` → 复合图表
4. `conclusion-first` → 结论提炼

### 用户分析报告
1. `customer-segmentation` → 分群
2. `cohort-analysis` → 留存
3. `consumer-analysis-charts` → 图表
4. `insight-extraction` → 洞察

### 品牌分析报告
1. `brand-health-charts` → 品牌漏斗
2. `multi-dimensional-charts` → 竞争分析
3. `pyramid-principle` → 结构
4. `core-insight` → 观点
