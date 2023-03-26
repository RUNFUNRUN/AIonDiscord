# AIonDiscord

## 使い方

### 初回

`.env.sample`を参考に`.env`にDiscordのトークンと、OpenAIのAPIキーを入力する。

```
docker compose run --rm app /bin/bash
```
でコンテナに入る。

```
npm i
```
でパッケージをインストールして、コンテナを抜ける。

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
