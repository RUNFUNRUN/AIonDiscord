# AIonDiscord

## 使い方

### 起動

```
docker compose up
```

で起動する。

バックグラウンドで起動したい場合はこちら。

```
docker compose up -d
```

コンテナの自動起動をしたい場合は、`docker-compose.yml`に以下を追加する。

```yml
# app:
    restart: always
```
