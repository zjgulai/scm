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
- AI 对话当前使用本地知识库证据检索策略 `local_kb_evidence_only`，不调用 DeepSeek、Kimi 或其他外部模型 provider。
- 当前线上版本应表述为“已部署可访问原型”，不能表述为“完整 PRD 已完成”。

## 当前发布快照

- 线上地址：`https://scm.lute-tlz-dddd.top/`
- 当前部署追溯 SHA：`ce7c0aa`，分支 `codex/scm-ledger-workbench`
- 当前 P0 release：`/opt/scm-governance-workbench/releases/scm-workbench-p0-complete-ce7c0aa-20260619001646`
- 当前 P0 部署备份：`/opt/scm-governance-workbench/backups/20260619001659/governance_workbench.sqlite`
- 当前 P0 release 来自本地分支 `codex/scm-ledger-workbench` 的 `ce7c0aa` 提交；推送后以远端分支为代码追溯点。
- 容器名：`scm-governance-workbench`
- 内部端口：`127.0.0.1:5174`
- 模块数量：12 个工作台模块
- 关键边界：`productionWrites=false`、`providerCalls=false`、`erpWriteback=false`

12 个模块为：

1. 治理链路总览
2. 对象本体工作台
3. 标签工程工作台
4. 维度工程工作台
5. 指标工程工作台
6. 指标字典工作台
7. 指标体系编排台
8. 血缘与质量工作台
9. ChatBI 语义治理台
10. AI 知识库
11. AI 对话
12. 决策闭环工作台

## 推荐进程结构

- Node 进程：Docker 容器内 `server/index.mjs` 同时提供 API 和静态前端。
- 进程守护：Docker Compose + `restart: unless-stopped`。
- 外部访问：Docker 化 Nginx 容器 `ai_video_nginx` 通过外部网络 `lighthouse_ai_video_net` 反代到 `scm-governance-workbench:5174`；宿主机同时保留 `127.0.0.1:5174` 只读健康检查入口。
- 防火墙：仅开放 80/443，Node 端口不直接暴露公网。
- 隔离边界：独立目录、独立 Compose project、独立 `scm_governance_net`、独立容器名；仅为域名反代额外加入现有 `lighthouse_ai_video_net`。

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

## SQLite 备份与迁移

部署前建议先备份 SQLite 台账：

```bash
docker exec scm-governance-workbench npm run backup:sqlite
docker cp scm-governance-workbench:/app/data/backups ./backups-$(date +%Y%m%d%H%M%S)
```

迁移脚本入口：

```bash
npm run migrate
```

详细恢复、迁移前验证和服务器操作见：

```text
docs/sqlite-ops-runbook-20260618.md
```

## Nginx 反代示例

```nginx
server {
    listen 443 ssl http2;
    server_name scm.lute-tlz-dddd.top;

    location / {
        proxy_pass http://scm-governance-workbench:5174;
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
- 页面能加载 12 个工作台模块。
- `/api/workbench/modules` 返回 12 个模块。
- ChatBI dry-run 对未认证问题能拒答，对认证库存类问题能返回证据链。
- `docker exec ai_video_nginx getent hosts scm-governance-workbench` 可解析到应用容器 IP。
- 公开站点 Browser Harness DOM 检查通过：KPI 画布 `nodeCount=39`、`edgeCount=33`、`selectedCount=1`、`drawerVisible=true`；血缘质量页 `summaryCards=3`、`ruleForm=true`；浅色侧边栏 `sidebarBg=rgb(255,255,255)`。

P0 验收命令：

```bash
npm run smoke:p0
```

说明：

- `smoke:p0` 会先执行生产构建，再复制临时 SQLite、执行迁移、启动临时 API、跑核心工作流 smoke，随后使用 Browser Harness 分别对本地新 bundle 和线上地址执行导航验收。
- `smoke:browser` 默认打开 `https://scm.lute-tlz-dddd.top/`，使用 Browser Harness 连接真实 Chrome，执行只读导航验收。
- `smoke:workflows` 默认只针对本地 URL 执行治理台账写入验收。
- 非本地 URL 默认拒绝执行台账写入。只有授权 staging 才能设置 `ALLOW_LEDGER_WRITE_SMOKE=1`。

验收矩阵见：

```text
docs/e2e-acceptance-matrix-20260618.md
```
