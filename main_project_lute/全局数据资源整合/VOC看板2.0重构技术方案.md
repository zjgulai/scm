---
title: "VOC看板2.0重构技术方案"
doc_type: architecture
module: "global-data-resources"
topic: "VOC看板2.0重构技术方案"
status: stable
created: 2026-06-02
updated: 2026-06-02
owner: self
source: human+ai
---
# VOC看板2.0重构技术方案

## 一、项目简介

### 1.项目背景/目标：

[《全球营销-客服VOC看板V2.0\_20251015》](https://alidocs.dingtalk.com/i/nodes/amweZ92PV6y3ooeYsmLvyDgrWxEKBD6p?doc_type=wiki_doc)

背景: VOC看板需要整合品质退货评论数据来源以及建设dws ads层便于看板后端页面使用voc数据

### 2.方案评审纪要：

| **评审时间** | **参与人** | **评审纪要** | **Action** |
| --- | --- | --- | --- |
| 2025-12-01 |  |  |  |

## 二、需求分析

### 1、功能需求：

详细描述项目所需的功能。界定项目的范围和限制，依赖关系。

| **系统模块** | **业务** | **依赖关系** |
| --- | --- | --- |
|  |  |  |
|  |  |  |

## 三、详细设计

## 数据开发设计

*   **数据源**：
    

![37ed1a989e1c4b37a86bf2b2bb1e48b9.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/jP2lRYjbdRmPmO8g/img/74aa7f7b-b417-4c58-99dd-a4bd842261f5.png?x-oss-process=image/crop,x_0,y_155,w_324,h_423/ignore-error,1)

1.  客服工单 
    

dwd\_voc\_sale\_analysis\_final

    1)国内京麦&千牛

            ods\_rpa\_cn\_chattext\_record 整合

    2)Zendesk

            ods\_api\_zendesk\_ticket

2.商品评论 

dwd\_voc\_sale\_analysis\_final

亚马逊

           ods\_voc\_spider\_amazon\_reviews\_jijia 替换原ods\_voc\_spider\_amazon\_reviews表

3.社媒

1) meltwater

ods\_voc\_spider\_meltwater\_social\_media\_monitoring

2) facebook

ods\_fb\_data

3.退货留言

dwd\_quality\_amazon\_return\_detail 整合

    1)dwd\_fin\_amazon\_return\_detail

    2)dwd\_quality\_order\_retums\_day\_new\_1

    3)dws\_quality\_amazon\_order\_refund\_return

5.销量 来自dwd\_voc\_sale\_analysis\_final data\_source = '订单销量'

源dws\_sale\_channel\_sku\_detail 全渠道订单sku汇总表

*   **数据处理逻辑**：
    

1.  dwd\_voc\_record\_detail\_full表
    

dwd\_quality\_amazon\_return\_detail与dwd\_voc\_sale\_analysis\_final表通过

union all 关联

形成新表dwd\_voc\_record\_detail\_full表

2.dws\_voc\_record\_analysis\_day\_full dws层统计汇总表

按天统计 销量单独划分voc源

| 维度 | 原子指标 | 描述 |
| --- | --- | --- |
| date |  | 日期 |
| platform |  | 平台 |
| channel |  | 渠道 |
| shop |  | 店铺 |
| country\_code |  | 国家 |
| spu\_code |  | spu编码 |
| sku\_model\_name\_voc |  | voc型号 |
| voc\_type |  | voc源 |
| data\_source |  | voc源二级分类 |
| voc\_level\_1 |  | voc一级标签 |
| voc\_level\_2 |  | voc二级标签 |
| voc\_level\_3 |  | voc三级标签 |
| voc\_level\_4 |  | voc四级标签 |
|  | voc\_cnt | VOC量 |
|  | ticket\_cnt | 工单数 |
|  | order\_array | 订单数组 考虑去重 |
|  | sales\_qty | 销量 |
|  | total\_reviews\_cnt | 总评分数 |
|  | positive\_reviews\_cnt | 好评数 |
|  | neutral\_negative\_cnt | 中差评数 |

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/a/Rjnzae1XVCEzmm5V/016aceae42f345eca4c4f1028910f3642746.png)

表设计

*   **1.dwd\_voc\_record\_detail\_full**
    

```sql

CREATE TABLE `dwd_voc_record_detail_full` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT "主键",
  `voc_date` date NULL COMMENT "voc产生日期",
  `voc_type` varchar(32) NOT NULL COMMENT "voc数据来源分类(客服工单/退货留言/商品评论)",
  `data_source` varchar(256) NOT NULL COMMENT "voc数据二级分类",
  `platform` varchar(128) NOT NULL COMMENT "平台名称",
  `channel` varchar(128) NOT NULL COMMENT "渠道名称",
  `shop` varchar(128) NULL COMMENT "店铺名称",
  `country_code` varchar(128) NULL COMMENT "国家",
  `country_name` varchar(128) NULL COMMENT "国家名称",
  `order_id` varchar(2048) NULL COMMENT "订单号",
  `order_time` datetime NULL COMMENT "下单时间",
  `billing_time` datetime NULL COMMENT "结算时间",
  `platform_sku` varchar(256) NULL COMMENT "店铺sku",
  `asin` varchar(256) NULL COMMENT "asin",
  `spu_code` varchar(128) NULL COMMENT "spu编码",
  `spu_name` varchar(128) NULL COMMENT "spu名称",
  `sku_model_name_voc` varchar(128) NULL COMMENT "客诉型号",
  `ticket_id` varchar(2048) NULL COMMENT "工单号",
  `content` varchar(1048576) NULL COMMENT "工单客户原文",
  `sentiment` varchar(1024) NULL COMMENT "情感类型",
  `rating` int(11) NULL COMMENT "星级评分",
  `review` varchar(65535) NULL COMMENT "买家评论/备注",
  `return_remarks` varchar(2000) NULL COMMENT "买家退货备注",
  `voc_classification` varchar(512) NULL COMMENT "工单标签/买家评论标签/买家退货标签",
  `voc_label1` varchar(512) NULL COMMENT "voc一级标签",
  `voc_label2` varchar(512) NULL COMMENT "voc二级标签",
  `voc_label3` varchar(512) NULL COMMENT "voc三级标签",
  `voc_label4` varchar(512) NULL COMMENT "voc四级标签",
  `category_name_level1` varchar(256) NULL COMMENT "一级分类名称",
  `category_name_level2` varchar(256) NULL COMMENT "二级分类名称",
  `category_name_level3` varchar(256) NULL COMMENT "三级分类名称",
  `category_name_level4` varchar(256) NULL COMMENT "四级分类名称",
  `category_name_level5` varchar(256) NULL COMMENT "五级分类名称",
  `product_line` varchar(64) NULL COMMENT "产品品线",
  `sku_developer_name` varchar(255) NULL COMMENT "产品经理",
  `product_line_market_name` varchar(64) NULL COMMENT "GTM名称",
  `product_line_market_group` varchar(64) NULL COMMENT "GTM分组",
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT "记录创建时间"
) ENGINE=OLAP 
PRIMARY KEY(`id`)
COMMENT "邦钦|dwd_voc记录明细表"
DISTRIBUTED BY HASH(`id`)
PROPERTIES (
"compression" = "LZ4",
"datacache.enable" = "true",
"enable_async_write_back" = "false",
"enable_persistent_index" = "false",
"partition_live_number" = "3600",
"replication_num" = "1",
"storage_volume" = "builtin_storage_volume"
);
```

2.dws\_voc\_record\_analysis\_day\_full

```sql
CREATE TABLE `dws_voc_record_analysis_day_full` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT "主键",
  `stat_date` date NULL COMMENT "统计日期",
  `voc_type` varchar(32) NOT NULL COMMENT "voc数据来源分类(客服工单/退货留言/商品评论/订单销量)",
  `platform` varchar(128) NOT NULL COMMENT "平台名称",
  `channel` varchar(128) NOT NULL COMMENT "渠道名称",
  `shop` varchar(128) NULL COMMENT "店铺名称",
  `country_code` varchar(128) NULL COMMENT "国家",
  `country_name` varchar(128) NULL COMMENT "国家名称",
  
  `platform_sku` varchar(256) NULL COMMENT "店铺sku",
  `asin` varchar(256) NULL COMMENT "asin",
  `spu_code` varchar(128) NULL COMMENT "spu编码",
  `spu_name` varchar(128) NULL COMMENT "spu名称",
  `sku_model_name_voc` varchar(128) NULL COMMENT "客诉型号",
  
  `voc_level1` varchar(128) NULL COMMENT "voc一级标签",
  `voc_level2` varchar(128) NULL COMMENT "voc二级标签",
  `voc_level3` varchar(128) NULL COMMENT "voc三级标签",
  `voc_level4` varchar(128) NULL COMMENT "voc四级标签",
  
  `voc_cnt` int(20) NULL COMMENT "voc量",
  `order_array` varchar(4096) NULL COMMENT "订单数组",
  `sale_qty` int(20) NULL COMMENT "销量",
  `rating_qty` int(20) NULL COMMENT "平均星级评分分子-星级评分总数(rating * ship_qty)",
  `ship_qty` int(20) NULL COMMENT "平均星级评分分母-星级发货数量",
  `total_reviews_cnt` int(20) NULL COMMENT "好评、中差评率分母-总评分数", 
  `positive_reviews_cnt` int(20) NULL COMMENT "好评率分子-好评数",
  `neutral_negative_cnt` int(20) NULL COMMENT "中差评率分子-中差评数",
  
  `category_name_level1` varchar(128) NULL COMMENT "一级分类名称",
  `category_name_level2` varchar(128) NULL COMMENT "二级分类名称",
  `category_name_level3` varchar(128) NULL COMMENT "三级分类名称",
  `category_name_level4` varchar(128) NULL COMMENT "四级分类名称",
  `category_name_level5` varchar(128) NULL COMMENT "五级分类名称",
  `product_line` varchar(32) NULL COMMENT "产品品线",
  `sku_developer_name` varchar(255) NULL COMMENT "产品经理",
  `product_line_market_name` varchar(32) NULL COMMENT "GTM名称",
  `product_line_market_group` varchar(32) NULL COMMENT "GTM分组",
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT "记录创建时间"
) ENGINE=OLAP 
PRIMARY KEY(`id`)
COMMENT "邦钦|voc按天统计表"
DISTRIBUTED BY HASH(`id`)
PROPERTIES (
	"compression" = "LZ4",
	"datacache.enable" = "true",
	"enable_async_write_back" = "false",
	"enable_persistent_index" = "false",
	"partition_live_number" = "3600",
	"replication_num" = "1",
	"storage_volume" = "builtin_storage_volume"
);
```

3.ads\_voc\_record\_stat\_full

```sql
CREATE TABLE `ads_voc_record_stat_full` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT "主键",
  `data_caliber` varchar(32) NULL COMMENT "数据口径 order:下单口径 voc:voc产生日期口径",
  `date_type` date NULL COMMENT "统计类型(week:周 month:月)",
  `date_value` varchar(64) NULL COMMENT "周月统计值 周:2025Weekxx 月:2025-11",
  `voc_type` varchar(32) NOT NULL COMMENT "voc数据来源分类(客服工单/退货留言/商品评论/订单销量)",
  `platform` varchar(128) NOT NULL COMMENT "平台名称",
  `channel` varchar(128) NOT NULL COMMENT "渠道名称",
  `shop` varchar(128) NULL COMMENT "店铺名称",
  `country_code` varchar(128) NULL COMMENT "国家",
  `country_name` varchar(128) NULL COMMENT "国家名称",
  `platform_sku` varchar(256) NULL COMMENT "店铺sku",
  `asin` varchar(256) NULL COMMENT "asin",
  `spu_code` varchar(128) NULL COMMENT "spu编码",
  `spu_name` varchar(128) NULL COMMENT "spu名称",
  `sku_model_name_voc` varchar(128) NULL COMMENT "客诉型号",
  `voc_level1` varchar(128) NULL COMMENT "voc一级标签",
  `voc_level2` varchar(128) NULL COMMENT "voc二级标签",
  `voc_level3` varchar(128) NULL COMMENT "voc三级标签",
  `voc_level4` varchar(128) NULL COMMENT "voc四级标签",
  `voc_cnt` int(11) NULL COMMENT "voc量",
  `order_cnt` int(11) NULL COMMENT "订单量(不包含null值)",
  `sale_qty` int(11) NULL COMMENT "销量",
  `rating_star1_cnt` int(11) NULL COMMENT "一星评论数",
  `rating_star2_cnt` int(11) NULL COMMENT "二星评论数",
  `rating_star3_cnt` int(11) NULL COMMENT "三星评论数",
  `rating_star4_cnt` int(11) NULL COMMENT "四星评论数",
  `rating_star5_cnt` int(11) NULL COMMENT "五星评论数",
  
  `total_reviews_cnt` int(11) NULL COMMENT "好评、中差评率分母-总评分数",
  `positive_reviews_cnt` int(11) NULL COMMENT "好评率分子-好评数",
  `neutral_negative_cnt` int(11) NULL COMMENT "中差评率分子-中差评数",
  
  `category_name_level1` varchar(128) NULL COMMENT "一级分类名称",
  `category_name_level2` varchar(128) NULL COMMENT "二级分类名称",
  `category_name_level3` varchar(128) NULL COMMENT "三级分类名称",
  `category_name_level4` varchar(128) NULL COMMENT "四级分类名称",
  `category_name_level5` varchar(128) NULL COMMENT "五级分类名称",
  `product_line` varchar(32) NULL COMMENT "产品品线",
  `sku_developer_name` varchar(255) NULL COMMENT "产品经理",
  `product_line_market_name` varchar(32) NULL COMMENT "GTM名称",
  `product_line_market_group` varchar(32) NULL COMMENT "GTM分组",
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT "记录创建时间"
) ENGINE=OLAP 
PRIMARY KEY(`id`)
COMMENT "ads|邦钦|voc按周月统计表"
DISTRIBUTED BY HASH(`id`)
PROPERTIES (
	"compression" = "LZ4",
	"datacache.enable" = "true",
	"enable_async_write_back" = "false",
	"enable_persistent_index" = "false",
	"partition_live_number" = "3600",
	"replication_num" = "1",
	"storage_volume" = "builtin_storage_volume"
);

```

*   **时间安排**
    

根据上游任务时间确定

*   **上下游依赖：**
    
*   **输出表/接口**：
    
*   **调度频率**：
    
    每天一次
    
*   **数据质量保障**：
    

数据源监控

## BI开发设计

*   **数据来源**：参照【1.数据开发设计】提供
    
*   **报表/看板设计**：
    
*   **指标定义**：
    
*   **刷新频率**：
    
*   **权限控制**：