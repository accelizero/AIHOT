# 部署到 Cloud in a Bottle

仓库根目录的 `cloudinabottle.toml` 把 AIHOT 注册成名为 `news` 的 OpenHost 应用。Cloud in a Bottle 每个应用只运行一个容器，因此 `Dockerfile.openhost` 在同一容器中管理 PostgreSQL、API、Worker 和 Web；数据库、图片及配置都写入平台提供的永久数据目录。

## 部署

```bash
bottle app deploy https://github.com/accelizero/AIHOT --name news --wait
```

应用地址是 `https://news.<Cloud in a Bottle 域名>/`，后台是 `/admin`。首次启动生成随机管理员密码，并在应用日志中打印一次：

```bash
bottle app logs news
```

## 启用采集与模型

首次部署不带模型密钥，自动采集和模型调用保持关闭。进入容器编辑永久配置：

```bash
bottle app ssh news
vi "$BOTTLE_APP_DATA_DIR/aihot.env"
```

填写 `LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL`，并设置：

```dotenv
COLLECT_ENABLED=true
MODEL_CALLS_ENABLED=true
```

退出后重载：

```bash
bottle app reload news
```

## 数据

- PostgreSQL：`$BOTTLE_APP_DATA_DIR/postgres`
- 图片、缓存与本地备份：`$BOTTLE_APP_DATA_DIR/aihot`
- 密钥与运行配置：`$BOTTLE_APP_DATA_DIR/aihot.env`

这些路径属于 Cloud in a Bottle 的永久应用数据，会随容器重建保留，并进入平台备份与实例迁移。
