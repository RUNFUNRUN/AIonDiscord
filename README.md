# AIonDiscord

## 使い方

### 起動

```
$ docker compose up
```

### バックグラウンド起動

```
$ docker compose up -d
```

### ログ確認

```
$ docker compose logs
```

## 注意点

- OpenAIのAPIキーを準備する必要があります。

- `init.sh`のパーミッションを環境に合わせて変える必要がある可能性があります。
下記は例です。

```
$ chmod 744 init.sh
```


- `package.json`が変更された時は、一度`node_modules`を削除してください。

- コマンドの使い方は、`src/doc.md`またはbot内で`/help`コマンドを実行してください。
