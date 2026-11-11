# LINK-SEKAI · 跨平台 AI 接管书

> 给任何接手本项目的 AI（Qwen、DeepSeek、Claude、GPT 或其他模型）：
> 先把这一份读完，再动代码。它描述的是**当前真实结构**，不是设想。
>
> **强制维护规则**：无论你在哪个平台、以什么方式修改了本项目的文件、目录、数据表、接口、构建流程或发布方式，**都必须在同一次改动里更新本文件对应章节，并在文末「变更记录」追加一行**。目录变了就改目录地图，接口变了就改 API 表，版本变了就改版本段。没有更新本文件 = 这次改动没有完成。

---

## 1. 项目一句话

《代码 Link-Sekai》是龙潜猫隐独立制作的编程学习游戏：六门语言（Python / Java / C / C++ / JavaScript / Go）各是一条星轨，玩家读剧情、写代码、打回合制战斗，账号与存档保存在云端。项目同时产出网页游戏、官方站点、Android 客户端与 Windows 客户端。

- 官方站点 / 网页游戏：<https://link-sekai-ot4mp9chy59.qoder.zone>
- 网页游戏直达：<https://link-sekai-ot4mp9chy59.qoder.zone/play/index.html>
- 开源仓库：<https://github.com/EliasNeko/LINK-SEKAI>
- 作者：龙潜猫隐（GitHub：EliasNeko）
- 授权：完全开源，禁止包装成付费课程售卖，禁止用于伤害他人。

技术底色：**纯静态前端 + 一个同源 Edge Function + PostgreSQL**。没有前端框架、没有打包器、没有 npm 运行时依赖。游戏逻辑全部是浏览器原生 ES5/ES2017 脚本，按 `<script>` 顺序加载。

---

## 2. 先记住这 8 条硬约束

1. **真实存档不能碰**。不要用 `file://` 打开并清空/覆盖本机存档；测试一律在 `http://localhost:8123` 上注册专用测试账号。
2. **不要泄露 `.secrets/`**。里面有第三方 API 密钥，任何情况下都不读取内容、不打印、不提交、不写进对话或日志。
3. **`dist/` 是构建产物，不是源码**。改内容请改根目录游戏源码或 `official/`，然后重新构建，不要长期手改 `dist/`。
4. **每次发布必须带后端**。Qoder Sites 发布时必须同时带 `functionDirectory: "functions"` 与 `databaseAccess: "read_write"`；只发静态文件会让 `/functions/v1/app/api/*` 全部返回 409，游戏显示「云端同步失败」。
5. **云存档是 CAS**。手改云端存档必须递增 `game_version`，并让玩家强刷；否则客户端会判定冲突并合并。
6. **版本号三处同步**：`version.json`、`js/data/announce.js` 的 `version`、`official/index.html` 的版本标签与静态资源 `?v=`。
7. **改 UI / 美术必须实机自检**：桌面 1440×900 与手机 390×844 各截图一次，检查控制台、404、横向溢出，再交付。
8. **任何结构变化都要回来更新本文件**（见文首规则）。

---

## 3. 目录地图

```text
CodeGame/
├─ index.html                 # 网页游戏入口（源码，hash 路由）
├─ manifest.webmanifest       # PWA 清单
├─ version.json               # 线上三端版本自检清单（被官网读取）
├─ css/                       # 游戏样式：base / views / growth / forge / announce / cosmetics / playground / tutorial
├─ js/
│  ├─ app.js                  # 应用外壳、hash 路由、星空背景、弹窗/提示
│  ├─ core/                   # 基础设施
│  │  ├─ utils.js             # 工具函数、LS.esc、LS.icon、toast、modal
│  │  ├─ audio.js             # 大厅主题曲 / 战斗曲、分场景音量
│  │  ├─ store.js             # 本地优先数据库（localStorage）与旧档迁移
│  │  ├─ cloud.js             # 云端账号、会话、CAS 存档同步
│  │  ├─ social.js            # 好友申请、通知、公开档案
│  │  ├─ update.js            # 三端版本自检
│  │  ├─ pixel.js / aichar.js # 像素角色、二次元立绘渲染辅助
│  │  ├─ battleplan.js        # 战斗数值、波次与题目编排
│  │  └─ codeeditor.js        # VSCode 风格编辑器
│  ├─ data/                   # 纯数据：语言、关卡、剧情、物品、成长、称号、考级、公告
│  │  ├─ languages.js         # 语言注册表、节点索引、解锁规则
│  │  ├─ python|java|c|javascript|cpp|go.js        # 第一卷
│  │  ├─ *-ext.js             # 第二卷「源核之下」
│  │  ├─ items.js / progression.js / awaken.js / cosmetics.js / titles.js / exams.js
│  │  └─ announce.js          # 开屏公告（版本、更新、开源声明）
│  ├─ engine/microrun.js      # 浏览器内微型代码运行器
│  └─ views/                  # 页面：auth / onboarding / tutorial / hub / world / lesson /
│                             # growth / forge / training / battle / profile / friends / exams
├─ assets/                    # 游戏素材源码（heroes / heroes_v6 / avatars / items / ui / frames / site / audio / app）
├─ functions/                 # 云端 Edge Function（Deno/TypeScript）
│  ├─ index.ts                # 入口：Deno.serve + createSiteContext
│  ├─ router.mjs              # 路由：注册/登录/退出/me/social/state
│  ├─ http.mjs                # 同源校验、JSON、错误、Cookie
│  ├─ sessions.mjs            # 会话令牌摘要、Cookie、过期与撤销
│  ├─ passwords.mjs           # PBKDF2 口令哈希与校验
│  ├─ limiter.mjs             # 固定窗口限流（数据库原子计数）
│  └─ validate.mjs            # 用户名/昵称/口令/存档清洗
├─ sites/schema.sql           # 应用私有表结构（部署后端时使用）
├─ official/                  # 官方站点源码「星港门户」
│  ├─ index.html              # 官网首页（含 CG / 序章映像展映区）
│  ├─ css/site.css            # 官网样式（含 CG 播放器、响应式）
│  ├─ js/site.js              # 导航、滚动动效、下载卡、版本自检
│  ├─ js/cg.js                # 序章映像原生播放器（章节/进度/音量/全屏）
│  ├─ assets/                 # 官网素材（site / cg / heroes / app）
│  └─ downloads/              # APK / EXE 构建产物（git 忽略，构建官网时需要）
├─ android/                   # 无 Gradle 的 WebView 壳
├─ desktop/                   # Electron 壳
├─ tools/                     # 构建与 QA 脚本
│  ├─ build-portal.py         # 一键构建 dist：官网在根 + 游戏在 /play
│  ├─ build-official.py       # 构建 official/dist（校验 APK 版本）
│  ├─ build-dist.py           # 构建 dist/play（图片转 WebP、限尺寸）
│  └─ build_apk.sh            # 构建并签名 Android APK
├─ qa/                        # 可复用 QA：Range 静态服务器 + PV 播放器脚本 + 截图
├─ docs/                      # 说明、截图、历史接手书与 PV 存档
│  ├─ screenshots/            # README 用的游戏截图
│  └─ archive/                # 旧接手书、旧 PV 分镜与提示词
├─ dev/                       # 本地/云端联调脚本
├─ outputs/                   # 媒体生成输出目录
├─ art-source/                # 原始美术源（git 忽略）
├─ vibe_images/               # AI 生成原图（git 忽略）
├─ dist/                      # 发布包（git 忽略，由 build-portal.py 生成）
└─ AI_HANDOVER.md             # 本文件
```

### 哪些进 Git，哪些不进

- 进 Git：游戏源码、`official/` 源码、`functions/`、`sites/schema.sql`、`android/` 源码、`desktop/` 源码、`tools/`、`qa/`、`docs/`、README/CHANGELOG/本文件。
- 不进 Git：`dist/`、`official/dist/`、`official/downloads/`、`art-source/`、`vibe_images/`、`desktop/node_modules|build|release*`、`android/build|keystore`、`.tools/`、`.secrets/`、`qa/shots/`、`*.qoder.site`、`docs/archive/`。

---

## 4. 本地怎么跑

```bash
# 源码版游戏（最常用）
python -m http.server 8123
# 打开 http://localhost:8123

# 预览与线上一致的站点结构（官网在根，游戏在 /play）
python tools/build-portal.py
cd dist && python -m http.server 8123
# 官网 http://localhost:8123/ ，游戏 http://localhost:8123/play/index.html
```

说明：

- 纯静态，无 `npm install`。Python 只用于静态服务器与构建脚本；构建需要 Pillow（`pip install pillow`）。
- `http.server` 不支持 HTTP Range，视频拖动会失效。做 PV 播放器 QA 用 `qa/serve-range.cjs`：
  ```bash
  node qa/serve-range.cjs   # 8124 端口，支持 206
  ```
- `localhost` 下云端同步自动关闭（`cloud.js` 检测本地 host），使用 localStorage；线上才启用账号与云存档。

---

## 5. 游戏前端架构

### 5.1 启动顺序

`index.html` 按固定顺序加载脚本，顺序不能乱：

1. `core/utils.js` → 全局 `LS` 工具
2. `core/audio.js`、`core/update.js`、`core/store.js`、`core/cloud.js`、`core/social.js`、`core/pixel.js`、`core/aichar.js`
3. `data/*`：语言注册 → 物品/成长/觉醒/外观 → 六门语言第一卷 → 六门语言第二卷 → 称号/考级/公告
4. `engine/microrun.js`、`core/battleplan.js`、`core/codeeditor.js`
5. `views/*`：auth → onboarding → tutorial → hub → world → lesson → growth → forge → training → battle → profile → friends → exams
6. `app.js` 最后启动路由

新增脚本时：插到对应分组、给 `?v=` 缓存戳、并在本文件目录地图补一行。

### 5.2 路由与页面

hash 路由，入口 `LS.go('#/xxx')`。主要路径：

| 路径 | 页面 | 文件 |
|---|---|---|
| `#/`、`#/hub` | 星海大厅 | `views/hub.js` |
| `#/world` | 星轨地图 | `views/world.js` |
| `#/codex` | 知识天书 | `views/world.js`（复用） |
| `#/lesson`、`#/story` | 天书阅览 | `views/lesson.js` |
| `#/battle` | 代码试炼 | `views/battle.js` |
| `#/training` | 星海演武场 | `views/training.js` |
| `#/shop` | 星辉商店 | `views/growth.js` |
| `#/forge` | 锻造台 | `views/forge.js` |
| `#/levels` | 等级殿堂 | `views/growth.js` |
| `#/proficiency` | 职业熟练度 | `views/growth.js` |
| `#/profile` | 我的档案 | `views/profile.js` |
| `#/friends` | 星网好友 | `views/friends.js` |
| `#/exams` | 证书试炼 | `views/exams.js` |
| `#/auth` | 登录/注册 | `views/auth.js` |
| `#/onboarding` | 新手选语言 | `views/onboarding.js` |
| `#/tutorial` | 八步引导 | `views/tutorial.js` |

新账号强制走注册/登录 → 选语言 → 引导，没有游客身份。

### 5.3 本地数据模型（`core/store.js`）

localStorage 主键：

- `linksekai.db.v1`：`{ version, users: { [uid]: user }, createdAt }`
- `linksekai.session.v1`：当前会话

`user` 的关键字段（会随版本迁移）：

```text
uid, login, name, primaryLang, activeLangs[]
xp, coins, materials{}, levelClaims[]
equipment[] { iid, cat: weapon|apparel|item, quality, stats, langs[], infusion }
equipped { [langId]: { weapon, apparel, item } }
progress { [langId]: { done[], current } }
proficiency { [langId]: { stage, points, ... } }
forgeClaims { boss[], full[], stage3[], bought }
lifetime { coinsEarned, coinsSpent, drops, dailyClaimed }
stats{}, titles[], titleEquipped, avatarId, avatar, frame, banner
tutorialDone, tutorialReward, cloudAccount, cloudVersion
```

旧档迁移集中在 `store.migrateUser()`：装备从单槽拆成每语言三槽、星辉与经验拆分、补齐锻造/熟练度/档案字段。**改数据结构必须在这里加迁移，不能只改新逻辑。**

### 5.4 战斗与代码运行

- `engine/microrun.js`：浏览器内微型运行器，执行玩家代码并捕获输出/错误。
- `core/battleplan.js`：波次、敌方数值、题目池、语法约束。
- `views/battle.js`：回合制战斗、攻击/受击/Boss 阶段、连击与粒子。
- 精英/Boss 会要求特定语法；只打印答案会被格挡并反击。

---

## 6. 云端账号与存档

### 6.1 前端调用

`js/core/cloud.js`：

- API 基址：`/functions/v1/app/api`（同源、`credentials: same-origin`）
- 本地 host 自动禁用云端；`file://` 完全离线。
- 写入延迟 1100ms 合并；每 12s 拉取一次；请求失败保留本机进度。
- 存档按 `game_version` 做 CAS：
  - 正常：`PUT /state { state, baseVersion }`
  - 版本不匹配：服务端返回冲突 → 客户端用 `mergeState` 合并双方进度 → 以新版本重推。
- 上限：`MAX_STATE_BYTES = 240 * 1024`。

### 6.2 API 一览

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| POST | `/api/register` | 注册（账号、昵称、口令；返回用户与 Cookie） |
| POST | `/api/login` | 登录 |
| POST | `/api/logout` | 退出并撤销会话 |
| GET | `/api/me` | 当前用户 |
| GET | `/api/state` | 读取云存档 |
| PUT | `/api/state` | CAS 写入云存档 |
| GET | `/api/social` | 好友、申请、通知总览 |
| POST | `/api/social/request` | 发起好友申请 |
| POST | `/api/social/respond` | 同意/拒绝 |
| POST | `/api/social/remove` | 删除好友 |
| GET | `/api/social/player?uid=` | 查看他人公开档案 |

鉴权：本应用自己的会话 Cookie（服务端只存令牌摘要），**不使用平台身份、Host 或前端提交的 uid/owner**。写接口校验同源 `PUBLIC_ORIGIN`（`functions/http.mjs`）。

### 6.3 数据表（`sites/schema.sql`）

| 表 | 用途 |
|---|---|
| `app.game_users` | 账号、口令摘要、游戏 UID（`LSK-XXXXXX`）、昵称、整份 `game_data`、`game_version` |
| `app.game_sessions` | 会话令牌摘要、用户、创建/过期/撤销时间 |
| `app.game_auth_limiter` | 固定窗口限流，主键原子计数 |
| `app.game_friends` | 好友对，`pair_key` 排序双人键 |
| `app.game_friend_requests` | 好友申请与处理状态 |
| `app.game_friend_notices` | 申请结果通知（最多展示最近 20 条） |

账号名与 UID 都全局唯一；并发注册撞号会重试换号。口令 PBKDF2 加盐哈希，明文与明文令牌从不落库。

### 6.4 部署后端

Function 名为 `app`，源码在 `functions/`，由 Qoder Sites 打包为 Edge Function。发布站点时必须：

```text
functionDirectory: "functions"
databaseAccess: "read_write"
schemaRef: 当前 schema
```

漏掉任一参数 → 所有 `/functions/v1/app/api/*` 返回 409 `sites_gateway_supabase_not_ready` → UI 报「云端同步失败」。这是本项目最容易被重复踩到的坑。

---

## 7. 官方站点与序章映像

### 7.1 结构

- 官网源码在 `official/`，游戏在 `/play/`，由 `tools/build-portal.py` 合成到 `dist/`。
- `build-official.py` 会从 `official/index.html` 读取 `id="apkVer"`，要求 `official/downloads/link-sekai-v{VERSION}.apk` 存在；EXE 不放进站点（超过单文件 50MiB），放 GitHub Release。
- 官网下载卡有香港/国内/备用三条加速线路，配置在 `official/js/site.js` 的 `RELEASE_BASE`。

### 7.2 序章映像（当前版本）

- 成片：`official/assets/cg/pv.mp4`（960×540、30fps、H.264、AAC、约 61.8 秒、18MB 左右，音频已统一到 -16 LUFS）。
- 封面：`official/assets/cg/pv-poster.webp`（1280×720，六人集结帧）与 `pv-poster-sm.webp`。
- 播放器：`official/js/cg.js` + `official/css/site.css` 的 CG 段。
- 三章以真实转场为界：
  - `00:00` 黎明 · 塔的召唤
  - `00:11.1` 战斗 · 六职接力
  - `00:39.3` 集结 · 对深渊
- 交互：封面播放、章节跳转、拖动进度、静音、全屏、空格暂停；离开视口自动暂停。
- 旧的三幕关键帧（act1–3.webp）与旧 CG 音轨已删除，**不要恢复**。

### 7.3 替换 PV 的正确流程

1. 新视频压成 960×540 / H.264 / faststart，音频响度约 -16 LUFS。
2. 覆盖 `official/assets/cg/pv.mp4`，重新导出封面。
3. 如果章节边界变了，改 `cg.js` 的 `CHAPTERS`、`duration`、HTML 里的 `data-cg-at` 与 `aria-valuemax`、时间文案、笔记区。
4. `python tools/build-portal.py`，本地 QA 后发布。

---

## 8. 三端

| 端 | 目录 | 实现 | 内容来源 |
|---|---|---|---|
| 网页 | 根目录 + `dist/play/` | 原生 HTML/CSS/JS | 同源 |
| Android | `android/` | 单 Activity WebView，无 Gradle；`tools/build_apk.sh` 用 SDK build-tools 打包签名 | 远程 `/play/index.html?client=android&cv=2.9.3` |
| Windows | `desktop/` | Electron，`main.js` 加载远程 `/play/index.html?client=windows&cv=2.9.3` | 远程同入口 |

要点：

- 三端共用同一份云账号与存档；内容更新只需更新站点，客户端无需重装。
- 客户端只允许站内导航，外链交给系统浏览器；加载失败显示 `desktop/offline.html`。
- 改壳版本才需要重打 APK/EXE；只改内容不要动 `version.json.shells`。
- Android 签名密钥在 `android/keystore/`（git 忽略），**必须备份**，丢了无法覆盖升级。
- 当前壳版本 2.9.3，应用内容版本 2.9.5。这是正常状态，不是不同步。

---

## 9. 版本与发布

### 9.1 改版本

1. `version.json`：`app` 与 `updated`。
2. `js/data/announce.js`：`version`、`codename`、`date`、`tagline`、`changes`。
3. `official/index.html`：hero 版本标签、ticker、`site.css`/`site.js` 的 `?v=`。
4. 游戏 `index.html`：改动过的脚本/样式 `?v=` 缓存戳。
5. `CHANGELOG.md` 追加版本段。
6. 本文件「变更记录」追加一行。

### 9.2 发布

```bash
python tools/build-portal.py       # 生成 dist/（官网 + /play + version.json）
# 本地 QA：cd dist && python -m http.server 8123
```

然后用 Qoder Sites 发布 `dist/`：

- siteId：`01a1c03f-1150-7e3d-be01-36181f0e412a`
- projectId：`01a1c03f-114c-7c79-a538-b28694f4dcaf`
- 必须带 `functionDirectory: "functions"`、`databaseAccess: "read_write"`、当前 `schemaRef`。
- 发布后验证：官网可开、`/play/` 可开、注册、登录、`/api/me`、`PUT /api/state`、GC 后重登存档仍在。

### 9.3 GitHub 同步

- 仓库：`EliasNeko/LINK-SEKAI`，主分支 `main`。
- 只提交源码与文档；`dist/`、构建产物、密钥、`docs/archive/`、`qa/shots/` 不入库。
- 提交前 `git status` 检查，绝不 `git add -A` 把 `.secrets` 带进去。
- 发布客户端时同时更新 GitHub Release 附件与 `official/js/site.js` 的版本串。

---

## 10. QA 与视觉验收

- 桌面：1440×900；手机：390×844。两套都要看。
- 检查项：控制台报错、404、横向溢出、弹窗遮挡、底部导航、视频封面/播放/拖动、登录注册。
- 可复用脚本在 `qa/`：
  - `qa/serve-range.cjs`：8124 端口，支持 Range。
  - `qa/pv-qa.mjs`：用 CDP 驱动 Edge，截桌面/手机封面、播放、章节、最终帧。
  - 截图输出 `qa/shots/pv/`（git 忽略）。
- 需要重启 headless Edge 时使用独立 profile，并加 `--autoplay-policy=no-user-gesture-required`，否则播放会被拦截。
- UI/美术改动必须给用户看实机截图，不能只说「已改好」。

---

## 11. 当前状态（2026-11-12）

- 版本：应用 2.9.5「作者剪辑版」；Android/Windows 壳 2.9.3。
- 官网 CG 区已换成作者剪辑的 61 秒 PV，桌面/手机排版已复验。
- 旧 PV、分镜片段、临时脚本、旧三幕关键帧与旧 CG 音轨已清理，只保留最终成片。
- 云端登录/注册/存档链路已复验（发布时仍需带 Function，见 §6.4）。
- 已知待办：
  - 新 Boss 素材制作与全流程验证。
  - 全站立绘一致性审计与修复。
  - 若要继续升级客户端壳，需重打 APK/EXE 并更新 Release 与 `site.js`。

---

## 12. 变更记录

| 日期 | 版本 | 改动 |
|---|---|---|
| 2026-11-12 | 2.9.5 | 官网替换为作者剪辑 61 秒 PV，CG 区重排；清理旧 PV/临时素材并归档；新增本接管书；公告与版本推进 |
| 2026-11-11 | 2.9.4 | 序章 CG 三幕、星河声场 BGM、三端内容自检 |
| 2026-11-10 | 2.9.3 | 星港门户、三端客户端、下载加速、站点水印收起 |

> 再提醒一次：**改了项目就改本文件**。下一个接手的模型只能看到仓库里的东西，看不到你的对话。
