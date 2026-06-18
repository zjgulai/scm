---
title: 腾讯云轻量服务器部署说明
doc_type: deployment_guide
module: scm
topic: scm-data-governance-workbench
status: draft
created: 2026-06-18
updated: 2026-06-18
owner: self
source: human+ai
---

# 腾讯云轻量服务器部署说明

## 部署边界

- 当前版本是供应链数据治理工作台原型，不写回积加、ERP、WMS、TMS 或生产数据库。
- SQLite 数据库只来自本项目已萃取的知识库和指标资产导入。
- ChatBI 只做认证语义 dry-run，不执行真实 SQL。

## 推荐进程结构

- Node 进程：Docker 容器内 `server/index.mjs` 同时提供 API 和静态前端。
- 进程守护：Docker Compose + `restart: unless-stopped`。
- 外部访问：Nginx 反代到 `127.0.0.1:5174`。
- 防火墙：仅开放 80/443，Node 端口不直接暴露公网。
- 隔离边界：独立目录、独立 Compose project、独立 bridge network、独立容器名。

## 初始化

```bash
cd /opt/scm-governance-workbench/current
docker compose -p scm_governance_workbench -f docker-compose.yml -f docker-compose.tencent.yml up -d --build
```

## 本地启动验证

```bash
docker compose -p scm_governance_workbench ps
curl http://127.0.0.1:5174/api/deploy/health
docker exec ai_video_nginx getent hosts scm-governance-workbench
```

健康检查接口：

```bash
curl http://127.0.0.1:5174/api/deploy/health
```

## Docker Compose 启停

```bash
docker compose -p scm_governance_workbench -f docker-compose.yml -f docker-compose.tencent.yml up -d --build
docker compose -p scm_governance_workbench -f docker-compose.yml -f docker-compose.tencent.yml logs --tail=80
docker compose -p scm_governance_workbench -f docker-compose.yml -f docker-compose.tencent.yml down
```

## Nginx 反代示例

```nginx
server {
    listen 80;
    server_name scm.lute-tlz-dddd.top;

    location / {
        proxy_pass http://127.0.0.1:5174;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 上线验收

- `npm run init` 成功。
- `curl /api/deploy/health` 返回 `ok=true`。
- 页面能加载十个工作台模块。
- `/api/workbench/modules` 返回十个模块。
- ChatBI dry-run 对未认证问题能拒答，对认证库存类问题能返回证据链。
