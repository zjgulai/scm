---
title: "VOC看板2.0：大白话设计逻辑 + 字段表与取值口径"
doc_type: architecture
module: "global-data-resources"
topic: "VOC看板2.0-大白话与字段口径"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# VOC看板2.0：大白话设计逻辑 + 字段表与取值口径

## 一、设计逻辑（大白话）

### 要解决啥问题？
- 原来 VOC（客户声音）数据散在多处：客服聊天、评论、退货留言、社媒等，看板用起来不方便。
- 需要把「品质退货相关数据」也并进来，并且建好 **明细层（dwd）** 和 **汇总层（dws/ads）**，让看板后端能稳定、统一地取数。

### 数据从哪儿来？（一句话版）
- **客服工单**：国内用京麦/千牛，海外用 Zendesk，都进同一套 VOC 明细。
- **商品评论**：主要是亚马逊评论，用新的爬虫表（jijia）替代老的。
- **社媒**：Meltwater 监测 + Facebook 数据。
- **退货留言**：把财务/品质相关的退货明细（亚马逊退货、退款退货等）整合成一条「退货留言」类 VOC。
- **销量**：用订单销量，和 VOC 按同一套维度（平台、渠道、国家、SPU 等）对齐，方便算「每卖多少单有多少条 VOC」这类指标。

### 数据处理咋干的？（三层）
1. **dwd 明细层**  
   把「客服+评论+退货留言」等所有 VOC 明细 **union 成一张大宽表** `dwd_voc_record_detail_full`。  
   每一行就是一条 VOC 记录（一条工单、一条评论、一条退货备注等），带齐平台、渠道、国家、商品、标签、分类等字段，方便后面按任意维度统计。

2. **dws 按天汇总层**  
   在明细表基础上按 **天** 做汇总，得到 `dws_voc_record_analysis_day_full`。  
   维度包括：日期、平台、渠道、店铺、国家、SPU、VOC 型号、VOC 来源类型、一二三四级标签等；指标包括：VOC 量、工单数、订单数组（去重）、销量、总评分数、好评数、中差评数等。  
   **销量单独作为一种「VOC 源」** 参与统计，这样和客服/评论/退货在同一张表里，便于做对比和占比。

3. **ads 按周/月汇总层**  
   在 dws 日表基础上再按 **周** 或 **月** 汇总，得到 `ads_voc_record_stat_full`。  
   给看板用的：支持「按周」或「按月」看，并且明确 **数据口径** 是「按下单日」还是「按 VOC 产生日」，避免大家看数时口径不一致。  
   同时把评论的星级拆成 1～5 星各自的数量，方便算星级分布、好评率/中差评率。

### 总结成一句话
**把散落在客服、评论、社媒、退货里的「客户声音」先并成一张明细表，再按天、按周/月汇总成带统一维度和指标的统计表，并且把销量也按同样维度放进来看板，方便看「卖了多少、被说了多少、好中差评各多少」。**

---

## 二、字段表与取值口径

### 1. dwd_voc_record_detail_full（VOC 明细表）

| 字段名 | 类型 | 取值口径说明 |
|--------|------|----------------|
| id | bigint | 主键，自增 |
| voc_date | date | VOC 产生日期：工单创建/评论时间/退货备注产生时间，按业务取对应日期 |
| voc_type | varchar(32) | VOC 数据来源一级分类：**客服工单** / **退货留言** / **商品评论**（三选一） |
| data_source | varchar(256) | VOC 数据二级分类：如国内京麦&千牛、Zendesk、亚马逊、Meltwater、Facebook、某退货表来源等，具体由上游 ODS 表名或配置决定 |
| platform | varchar(128) | 平台名称：如 Amazon、独立站等，来自业务系统或映射表 |
| channel | varchar(128) | 渠道名称：销售渠道 |
| shop | varchar(128) | 店铺名称：可空 |
| country_code | varchar(128) | 国家代码：如 US、DE |
| country_name | varchar(128) | 国家名称：与 country_code 对应 |
| order_id | varchar(2048) | 订单号：能关联到的订单，可多值拼接 |
| order_time | datetime | 下单时间 |
| billing_time | datetime | 结算时间 |
| platform_sku | varchar(256) | 店铺 SKU（平台侧） |
| asin | varchar(256) | 亚马逊 ASIN，非亚马逊可空 |
| spu_code | varchar(128) | SPU 编码，内部商品主数据 |
| spu_name | varchar(128) | SPU 名称 |
| sku_model_name_voc | varchar(128) | 客诉/评论口径下的型号名，用于 VOC 看板展示与分组 |
| ticket_id | varchar(2048) | 工单号：仅客服工单有值 |
| content | varchar(1048576) | 工单客户原文：客服场景的原始内容 |
| sentiment | varchar(1024) | 情感类型：如正面/负面/中性，由情感分析或规则得出 |
| rating | int | 星级评分：1～5，评论类有值 |
| review | varchar(65535) | 买家评论正文 |
| return_remarks | varchar(2000) | 买家退货备注：退货留言场景的原文 |
| voc_classification | varchar(512) | 原始标签/分类：工单标签、评论标签或退货标签的原始值 |
| voc_label1 | varchar(512) | VOC 一级标签（分类体系第 1 层） |
| voc_label2 | varchar(512) | VOC 二级标签 |
| voc_label3 | varchar(512) | VOC 三级标签 |
| voc_label4 | varchar(512) | VOC 四级标签 |
| category_name_level1~5 | varchar(256) | 一～五级分类名称：商品类目，来自商品主数据或订单 |
| product_line | varchar(64) | 产品品线 |
| sku_developer_name | varchar(255) | 产品经理（负责人） |
| product_line_market_name | varchar(64) | GTM 名称 |
| product_line_market_group | varchar(64) | GTM 分组 |
| create_time | datetime | 记录写入数仓的时间 |

---

### 2. dws_voc_record_analysis_day_full（VOC 按天统计表）

| 字段名 | 类型 | 取值口径说明 |
|--------|------|----------------|
| id | bigint | 主键，自增 |
| stat_date | date | 统计日期：按天的分区/统计日 |
| voc_type | varchar(32) | 同 dwd；此处增加 **订单销量**，表示该行是「销量」而非 VOC 条数 |
| platform / channel / shop / country_code / country_name | varchar | 与 dwd 口径一致，按这些维度聚合 |
| platform_sku / asin / spu_code / spu_name / sku_model_name_voc | varchar | 与 dwd 一致，按商品维度聚合 |
| voc_level1 ~ voc_level4 | varchar(128) | 与 dwd 的 voc_label1～4 对应，汇总层统一用 level 命名 |
| voc_cnt | int(20) | VOC 量：该维度组合下的 VOC 条数（按日汇总） |
| order_array | varchar(4096) | 订单数组：涉及订单号集合，**做去重**，具体存储格式以数仓实现为准（如 JSON 数组或去重后拼接） |
| sale_qty | int(20) | 销量：该维度下的销售件数/数量；当 voc_type=订单销量 时表示销量本身 |
| rating_qty | int(20) | 平均星级分子：sum(rating * ship_qty)，用于算平均星级 |
| ship_qty | int(20) | 平均星级分母：参与评星的发货数量 |
| total_reviews_cnt | int(20) | 总评分数：好评率/中差评率的分母 |
| positive_reviews_cnt | int(20) | 好评数：好评率分子 |
| neutral_negative_cnt | int(20) | 中差评数：中差评率分子 |
| category_name_level1～5 / product_line / sku_developer_name / product_line_market_name / product_line_market_group | varchar | 与 dwd 口径一致，维度继承 |
| create_time | datetime | 记录创建时间 |

**说明**：dws 层「按天统计」，销量单独作为一种 voc_type，与客服工单、退货留言、商品评论并列，便于同一张表内做「VOC 量 vs 销量」的对比分析。

---

### 3. ads_voc_record_stat_full（VOC 按周/月统计表，看板用）

| 字段名 | 类型 | 取值口径说明 |
|--------|------|----------------|
| id | bigint | 主键，自增 |
| data_caliber | varchar(32) | 数据口径：**order** = 按下单日口径；**voc** = 按 VOC 产生日期口径；看板筛选时必选其一 |
| date_type | varchar(32) | 统计类型：**week**（周）或 **month**（月），决定 date_value 含义 |
| date_value | varchar(64) | 周月统计值：周格式如 2025Week01；月格式如 2025-11 |
| voc_type | varchar(32) | 同 dws：客服工单 / 退货留言 / 商品评论 / 订单销量 |
| platform / channel / shop / country_code / country_name | varchar | 与 dwd/dws 一致 |
| platform_sku / asin / spu_code / spu_name / sku_model_name_voc | varchar | 与 dwd/dws 一致 |
| voc_level1～4 | varchar(128) | 与 dws 一致 |
| voc_cnt | int(11) | VOC 量：该周/月该维度下的 VOC 条数 |
| order_cnt | int(11) | 订单量：去重后的订单数，**不包含 null** |
| sale_qty | int(11) | 销量 |
| rating_star1_cnt ～ rating_star5_cnt | int(11) | 一星～五星评论数：各星级条数，用于算星级分布 |
| total_reviews_cnt | int(11) | 总评分数（好评/中差评率分母） |
| positive_reviews_cnt | int(11) | 好评数 |
| neutral_negative_cnt | int(11) | 中差评数 |
| category_name_level1～5 / product_line / sku_developer_name / product_line_market_name / product_line_market_group | varchar | 与 dwd/dws 一致 |
| create_time | datetime | 记录创建时间 |

**口径约定**：
- **data_caliber = order**：统计周期按「下单时间」归属到某周/某月。
- **data_caliber = voc**：统计周期按「VOC 产生日期」归属到某周/某月。
- 看板展示时需明确当前是「下单口径」还是「VOC 口径」，避免混用。

---

## 三、汇总：核心口径对照

| 项目 | 口径说明 |
|------|----------|
| VOC 产生日期 | 工单取创建/接入时间，评论取评论时间，退货取备注产生时间 |
| voc_type | 客服工单、退货留言、商品评论、订单销量（四类；前三个是 VOC，第四个是销量） |
| data_source | 各 voc_type 下的具体来源（京麦、Zendesk、亚马逊、Meltwater、某退货表等） |
| 订单去重 | dws 的 order_array 做去重；ads 的 order_cnt 为去重后订单数且不含 null |
| 好评/中差评 | 分子：positive_reviews_cnt / neutral_negative_cnt；分母：total_reviews_cnt |
| 平均星级 | rating_qty / ship_qty（仅在 dws 层；ads 用星级分布 star1～5） |
| 周/月统计 | date_value：周用 2025Weekxx，月用 2025-11；配合 data_caliber 区分下单日 vs VOC 日 |

以上内容可直接用于需求评审、看板取数逻辑和数据质量校验。
