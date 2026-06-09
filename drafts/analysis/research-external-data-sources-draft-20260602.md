---
title: 外部数据源调研报告
doc_type: analysis
module: main-project-lute
topic: external-data-sources
status: draft
created: 2026-03-13
updated: 2026-06-02
owner: self
source: human+ai
---

# 外部数据源调研报告

> 调研时间：2026-03-13
> 目标：为"卓越商业分析专家AI SaaS"选择优先接入的外部数据源

---

## 一、优先级评估矩阵

| 优先级 | 数据类型 | 平台/来源 | 接入难度 | 业务价值 | 建议 |
|--------|----------|-----------|----------|----------|------|
| ⭐⭐⭐ | 亚马逊评论 | Amazon Review API | 低 | 高 | **立即接入** |
| ⭐⭐⭐ | 广告投放数据 | Meta/Google Ads API | 低 | 高 | **立即接入** |
| ⭐⭐ | 社媒帖子 | Reddit API | 低 | 中 | **优先** |
| ⭐⭐ | 母婴社区 | BabyCenter等 | 中 | 高 | **优先** |
| ⭐ | 竞品数据 | 第三方工具 | 高 | 中 | 长期 |
| ⭐ | 行业报告 | eMarketer等 | 中 | 低 | 可选 |

---

## 二、详细数据源

### 2.1 VOC数据（专题①）

#### 亚马逊评论 ⭐⭐⭐
- **接入方式**：Amazon Product Advertising API / Keepa / JungleScout
- **数据内容**：评论文本、评分、点赞数、图片
- **费用**：免费/付费（月费$39起）
- **建议**：使用Keepa或第三方工具批量获取

#### Reddit ⭐⭐
- **接入方式**：Reddit API (Free Tier)
- **数据内容**：帖子、评论
- **关键社区**：r/Mommit, r/Parenting, r/pregnancy
- **费用**：免费

#### 母婴垂直社区 ⭐⭐
- **BabyCenter**：美国最大母婴社区
- **What to Expect**：孕期及新生儿社区
- **Mumsnet**：英国母婴论坛
- **接入方式**：爬虫或人工采样

### 2.2 营销数据（专题④）

#### Meta Ads ⭐⭐⭐
- **接入方式**：Marketing API
- **数据**：曝光、点击、花费、转化
- **文档**：developers.facebook.com

#### Google Ads ⭐⭐⭐
- **接入方式**：Google Ads API
- **数据**：搜索词、展示、转化
- **文档**：developers.google.com/google-ads

#### TikTok Ads ⭐⭐
- **接入方式**：TikTok Marketing API
- **数据**：曝光、互动、转化

### 2.3 渠道数据（专题③）

#### SimilarWeb ⭐
- **数据**：竞品流量来源、排名
- **费用**：付费（$299/月起）

#### Google Trends ⭐
- **数据**：搜索趋势
- **费用**：免费

---

## 三、推荐接入顺序

### 第一阶段（立即）
1. **Amazon评论** - VOC核心数据源
2. **Meta/Google Ads** - 营销ROI核心

### 第二阶段（1-2个月）
3. **Reddit** - 补充VOC
4. **Amazon Review API** - 自动化评论获取

### 第三阶段（3-6个月）
5. **BabyCenter等垂直社区**
6. **TikTok Marketing API**

---

## 四、数据采集技术方案

### VOC采集
```
方案A：API + 第三方工具
- Keepa/JungleScout获取评论
- 存储至ods_voc_external

方案B：自建爬虫
- 爬取Reddit/BabyCenter
- 需解决反爬和IP问题
```

### 营销数据采集
```
方案：API直连
- Meta Marketing API → fact_campaign_daily
- Google Ads API → fact_campaign_roi
- 定时同步（日/周）
```

---

## 五、决策建议

| 问题 | 建议 |
|------|------|
| 预算有限？ | 先接Amazon评论 + Google Trends（免费） |
| 团队技术强？ | 自建爬虫获取Reddit/BabyCenter |
| 快速见效？ | 直接接Meta/Google Ads API |

---

## 六、参考资源

- Amazon API: https://developer.amazon.com/docs/product-advertising-api/
- Reddit API: https://www.reddit.com/dev/api/
- Meta Marketing API: https://developers.facebook.com/docs/marketing-apis/
- Google Ads API: https://developers.google.com/google-ads/api
