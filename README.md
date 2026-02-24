# Sponsorkit

[deploy-button-image]: https://vercel.com/button
[deploy-link]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fltaoo%2Fsponsorkit%3Fenv%3DTOKEN&project-name=sponsorkit&repository-name=sponsorkit

受 [sponsorkit](https://github.com/antfu-collective/sponsorkit) 启发，做的一个手动维护 `sponsors` 的工具，可以在页面上编辑、新增 `sponsors`。

## 页面截图

![](./docs/screenshot1.png)

## 部署

Deploy with Vercel

[![][deploy-button-image]][deploy-link]

> 记得环境变量加上 `TOKEN`，前端页面需要该值作为登录凭证。

## 使用方式

在页面上编辑好数据，点击「复制 json 数据」，回到自己的仓库，使用新的数据覆盖 `storage/config.json` 文件内容，重新部署即可。

然后通过 `<你的域名>/api/sponsors` 就可以访问图片了

> 或者有什么简单的数据存储方案可以推荐一下，最终预期效果可以是在页面上点击「保存」按扭即可生效。

## Golang 服务端

如果你希望动态管理赞助者数据（支持飞书多维表格或 Cloudflare D1），可以使用 Golang 版本部署。

### 安装

目前提供 Linux (x86_64/arm64) 的一键安装脚本：

```bash
curl -fsSL https://raw.githubusercontent.com/ltaoo/sponsorkit/main/install.sh | bash
```

### 配置

在运行目录下创建 `.env` 文件：

```bash
# 服务监听地址
HOST=0.0.0.0
PORT=8080

# 鉴权 Token (前端页面登录需要与此一致)
TOKEN=your_token_value

# 数据源提供者 (feishu 或 cloudflare)
PROVIDER=feishu

# Feishu (飞书) 配置
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
FEISHU_BASE_TOKEN=basxxx
FEISHU_TABLE_ID=tblxxx
FEISHU_VIEW_ID=vewxxx  # 可选
FEISHU_SORT=["赞赏时间 ASC"] # 可选

# Cloudflare D1 配置
CLOUDFLARE_API_TOKEN=xxx
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_DATABASE_ID=xxx
```

### 使用

```bash
# 启动服务 (后台运行)
sponsorkit start

# 停止服务
sponsorkit stop

# 检查更新
sponsorkit update

# 前台运行 (调试用)
sponsorkit -d
```

## 效果预览

![My Sponsors](https://sponsorkit-iota.vercel.app/api/sponsors)
