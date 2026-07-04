# Telegraph Image

基于 Cloudflare Pages 的免费图床，支持 Telegram Channel、Cloudflare R2、D1 管理后台、文件夹归类、原始文件名展示、访问统计、限制访问、图片审查，以及面向 PicGo、脚本、自动化工具的开放上传 API。

当前维护仓库：`panjoel812/Telegraph-Image`

## 功能

- 图片、视频、PDF 和常见文件上传
- Telegram Channel 存储，返回 `/api/cfile/...` 代理链接
- Cloudflare R2 存储，返回 `/api/rfile/...` 代理链接
- D1 后台记录文件名、文件夹、PV、Rating、时间
- 管理后台支持搜索、复制链接、删除记录、限制访问
- 上传前可重命名文件名，可填写虚拟文件夹
- Apple Liquid Glass 风格上传页和管理台
- PicGo / Web Uploader / curl / 自动化脚本可直接调用 `/api/picgo`
- 可选鉴黄 API：`RATINGAPI` 或 `ModerateContentApiKey`
- 可选 API Token，给外部客户端安全上传

## 在线地址

- 上传首页：`https://你的域名/`
- 管理后台：`https://你的域名/admin`
- PicGo API：`https://你的域名/api/picgo`

## 快速部署

1. Fork 或使用模板创建自己的仓库。
2. 打开 Cloudflare Dashboard。
3. 进入 `Workers 和 Pages`，创建 Pages 项目并连接 GitHub 仓库。
4. Framework preset 选择 `Next.js`。
5. 部署完成后，在 Pages 项目设置里配置环境变量、D1、R2 和兼容性标志。
6. 修改配置后，回到 `部署` 页面重试最新部署，让绑定和变量生效。

## Cloudflare 必要配置

### 兼容性标志

在 Pages 项目中进入：

`设置` -> `函数` -> `兼容性标志`

生产环境填写：

```text
nodejs_compat
```

### D1 数据库

创建 D1 数据库，例如 `img-db`，然后在 Pages 项目中绑定：

| 类型 | 变量名 | 说明 |
| --- | --- | --- |
| D1 数据库 | `DB` | 推荐绑定名 |
| D1 数据库 | `IMG` | 旧版本兼容绑定名 |

初始化 SQL：

```sql
DROP TABLE IF EXISTS tgimglog;
CREATE TABLE IF NOT EXISTS tgimglog (
  `id` integer PRIMARY KEY NOT NULL,
  `url` text,
  `referer` text,
  `ip` varchar(255),
  `time` DATE
);

DROP TABLE IF EXISTS imginfo;
CREATE TABLE IF NOT EXISTS imginfo (
  `id` integer PRIMARY KEY NOT NULL,
  `url` text,
  `referer` text,
  `ip` varchar(255),
  `rating` text,
  `total` integer,
  `time` DATE,
  `name` text,
  `folder` text
);
```

如果你已经建过旧表，也可以不删表。项目会在上传和后台读取时自动补齐 `imginfo.name` 与 `imginfo.folder` 两列。

### R2 存储桶

如果要使用 R2 上传，在 Pages 项目中绑定 R2：

| 类型 | 变量名 | 说明 |
| --- | --- | --- |
| R2 Bucket | `IMGRS` | R2 图片/文件存储桶 |

### Telegram Channel

1. 找 @BotFather 创建 Bot，得到 `TG_BOT_TOKEN`。
2. 把 Bot 加入目标频道或群组，并设置为管理员。
3. 获取频道用户名或 Chat ID，填写 `TG_CHAT_ID`。

`TG_CHAT_ID` 可以是公开频道用户名，例如 `@your_channel`；私有频道通常需要数字 ID。

## 环境变量

| 变量名 | 必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| `TG_BOT_TOKEN` | Telegram 必填 | `123456:AA...` | BotFather 提供的机器人 Token |
| `TG_CHAT_ID` | Telegram 必填 | `@your_channel` | Telegram 频道、群组或私聊 ID |
| `BASIC_USER` | 管理后台必填 | `admin` | 管理员用户名 |
| `BASIC_PASS` | 管理后台必填 | `your-password` | 管理员密码 |
| `SECRET` | 推荐 | 随机长字符串 | NextAuth session secret |
| `API_TOKEN` | 推荐 | 随机长字符串 | `/api/picgo` 外部上传 Token |
| `PICGO_API_TOKEN` | 可选 | 随机长字符串 | `API_TOKEN` 的别名 |
| `PICGO_UPLOAD_TARGET` | 可选 | `tgchannel` | PicGo 默认上传目标：`tgchannel` 或 `r2` |
| `REGULAR_USER` | 可选 | `user` | 普通用户账号 |
| `REGULAR_PASS` | 可选 | `password` | 普通用户密码 |
| `ENABLE_AUTH_API` | 可选 | `true` | 是否开启访客验证 |
| `IMGRS` | R2 必填 | R2 绑定名 | Cloudflare R2 bucket binding |
| `RATINGAPI` | 可选 | `https://example.com/rating` | 自建图片审查 API |
| `ModerateContentApiKey` | 可选 | `xxxx` | moderatecontent.com API Key |
| `CUSTOM_DOMAIN` | 可选 | `https://img.example.com` | 自定义加速域名 |
| `PROXYALLIMG` | 可选 | `false` | 是否反向代理全部图片 |

推荐至少配置：

```text
TG_BOT_TOKEN
TG_CHAT_ID
BASIC_USER
BASIC_PASS
SECRET
API_TOKEN
```

## 管理后台

访问：

```text
https://你的域名/admin
```

管理台能力：

- 查看 D1 中的上传记录
- 按文件名、文件夹、链接搜索
- 复制可访问链接
- 删除记录
- 限制访问
- 查看 PV 与 Rating

后台登录使用 `BASIC_USER` 和 `BASIC_PASS`。

## 上传 API

### PicGo 兼容接口

```http
POST /api/picgo
Content-Type: multipart/form-data
Authorization: Bearer <API_TOKEN>
```

字段：

| 字段 | 必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| `file` | 必填 | `@image.png` | 上传文件。也兼容 `image`、`img`、`source`、`smfile` |
| `target` | 可选 | `tgchannel` | `tgchannel` 或 `r2`，默认 `tgchannel` |
| `folder` | 可选 | `PicGo/截图` | 后台显示的虚拟文件夹 |
| `name` | 可选 | `demo.png` | 后台显示的文件名，也会作为上传文件名 |

请求示例：

```bash
curl -X POST "https://你的域名/api/picgo" \
  -H "Authorization: Bearer 你的_API_TOKEN" \
  -F "file=@/Users/me/Pictures/demo.png" \
  -F "target=tgchannel" \
  -F "folder=PicGo" \
  -F "name=demo.png"
```

成功响应：

```json
{
  "success": true,
  "code": 0,
  "msg": "success",
  "url": "https://你的域名/api/cfile/AgACAg...",
  "result": [
    "https://你的域名/api/cfile/AgACAg..."
  ],
  "data": {
    "url": "https://你的域名/api/cfile/AgACAg...",
    "urls": [
      "https://你的域名/api/cfile/AgACAg..."
    ],
    "name": "demo.png",
    "folder": "PicGo"
  }
}
```

失败响应：

```json
{
  "success": false,
  "code": 401,
  "msg": "Unauthorized. Set Authorization: Bearer <API_TOKEN> or X-API-Token.",
  "result": [],
  "data": {
    "urls": []
  }
}
```

### API 鉴权

如果配置了 `API_TOKEN` 或 `PICGO_API_TOKEN`，外部上传必须带其中一种 Header：

```http
Authorization: Bearer 你的_API_TOKEN
```

或：

```http
X-API-Token: 你的_API_TOKEN
```

如果没有配置 Token，`/api/picgo` 会允许匿名上传。公开站点不建议这样做。

### 查看 API 配置说明

```bash
curl "https://你的域名/api/picgo"
```

会返回接口字段、鉴权方式和推荐读取路径。

## PicGo 配置

PicGo 可以使用自定义 Web 上传器类插件连接本项目。不同插件界面名称略有差异，按下面含义填写即可。

| 配置项 | 值 |
| --- | --- |
| 上传 URL | `https://你的域名/api/picgo` |
| 请求方法 | `POST` |
| 文件字段名 | `file` |
| Header | `Authorization: Bearer 你的_API_TOKEN` |
| 额外 Body | `target=tgchannel`，`folder=PicGo` |
| 返回 URL 路径 | `data.url` |
| 备用返回路径 | `result.0` |

如果你使用 R2：

```text
target=r2
```

如果你使用 Telegram Channel：

```text
target=tgchannel
```

## 其他客户端示例

### JavaScript

```js
const form = new FormData();
form.append('file', file);
form.append('target', 'tgchannel');
form.append('folder', 'browser');

const res = await fetch('https://你的域名/api/picgo', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer 你的_API_TOKEN',
  },
  body: form,
});

const data = await res.json();
console.log(data.data.url);
```

### Python

```python
import requests

with open("demo.png", "rb") as f:
    res = requests.post(
        "https://你的域名/api/picgo",
        headers={"Authorization": "Bearer 你的_API_TOKEN"},
        files={"file": ("demo.png", f, "image/png")},
        data={"target": "tgchannel", "folder": "python"},
        timeout=60,
    )

print(res.json()["data"]["url"])
```

## 内置上传接口

前端页面使用的内部接口仍然保留：

| 接口 | 说明 |
| --- | --- |
| `POST /api/enableauthapi/tgchannel` | Telegram Channel 上传 |
| `POST /api/enableauthapi/r2` | R2 上传 |
| `GET /api/cfile/[name]` | Telegram 文件代理访问 |
| `GET /api/rfile/[name]` | R2 文件代理访问 |
| `POST /api/admin/list` | 管理台数据列表 |
| `POST /api/admin/log` | 管理台日志列表 |
| `DELETE /api/admin/delete` | 删除记录 |
| `PUT /api/admin/block` | 限制访问 |

外部工具推荐统一使用 `/api/picgo`，不要直接调用内部上传接口。

## 本地开发

```bash
npm install
npm run dev
```

本地 `next dev` 没有 Cloudflare D1/R2 上下文，涉及 D1/R2 的接口会提示缺少 Cloudflare request context。生产环境在 Cloudflare Pages 中绑定后即可正常使用。

常用验证：

```bash
npm run build
node --test src/app/api/admin/adminRouteUtils.test.mjs src/lib/adminResponse.test.mjs src/lib/cloudflareBindings.test.mjs src/lib/picgoApi.test.mjs
```

## 常见问题

### 为什么后台文件名以前显示 `/cfile/AgACAg...`？

Telegram 返回的是 `file_id`，真实访问路径会是 `/cfile/<file_id>`。项目现在会把原始文件名或重命名后的文件名写入 D1 的 `name` 字段，后台优先显示 `name`，链接仍然使用真实可访问 URL。

### 文件夹是真实目录吗？

当前文件夹是 D1 中的虚拟管理字段，用于后台搜索和归类。Telegram Channel 本身没有文件夹概念；R2 为了保持现有 `/api/rfile/[name]` 链接兼容，也默认按虚拟文件夹管理。

### `IMG D1 binding is not configured` 怎么办？

Pages 项目中需要绑定 D1，变量名推荐使用 `DB`。旧版 `IMG` 仍兼容，但新部署建议统一使用 `DB`。

### `D1_ERROR: no such table: imginfo` 怎么办？

说明 D1 数据库没有初始化表。进入 D1 控制台执行本文的初始化 SQL，或确认 Pages 项目绑定的是正确数据库。

### 修改变量后为什么不生效？

Cloudflare Pages 修改环境变量、D1、R2 绑定后，需要重新部署。进入 `部署`，对最新部署执行 `重试部署`。

## 许可证

请勿上传违反当地法律法规或平台规则的内容。部署者需要自行承担站点使用和数据合规责任。
