# PDF Parser (FastAPI)

PDFをアップロードして Azure Document Intelligence で解析し、正規化JSONを返すワンショットAPIです。
結果返却後はPDF/結果/ジョブを即削除します。

## 特徴

- 非同期解析（ジョブ状態を取得可能）
- 同時解析数をセマフォで制限
- 結果はワンショット返却 → 即削除
- オーファン掃除で古いファイルを自動削除

## セットアップ

```bash
pip install -r requirements.txt
```

`.env` を作成済みならそのまま使えます。未作成の場合は `.env` を用意してください。

## 起動

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

## 使い方

### 1) アップロード

```bash
curl -s -F "file=@/path/to/sample.pdf" http://localhost:8000/api/v1/documents
```

### 2) ステータス確認

```bash
curl -s http://localhost:8000/api/v1/documents/<doc_id>
```

ステータスの種類:

- `PENDING`: 受付直後（ジョブ作成直後）
- `RUNNING`: 解析実行中（Azure DI）
- `CHUNKING`: チャンク化中
- `EMBEDDING`: 埋め込み生成中
- `SUCCEEDED`: 完了
- `FAILED`: 失敗

### 3) 結果取得（ワンショット）

```bash
curl -s http://localhost:8000/api/v1/documents/<doc_id>/result
```

レスポンス例（抜粋）:

```json
{
  "doc_id": "uuid",
"usage": {
    "pages": 10
  },
  "parser_version": "1.0.0",
  "source": {
    "adi_model": "prebuilt-layout"
  },
  "pages": [
    {
      "pageNumber": 1,
      "width": 8.26,
      "height": 11.69,
      "unit": "inch"
    }
  ],
  "paragraphs": [
    {
      "content": "This is the header of the document.",
      "role": "content",
      "spans": [{ "offset": 0, "length": 35 }],
      "boundingRegions": [
        { "pageNumber": 1, "bbox": [0.93, 0.93, 3.45, 1.12] }
      ],
      "word_indexes": [0, 1, 2, 3, 4, 5, 6],
      "paragraph_index": 0
    }
  ],
  "chunks": [
    {
      "text": "...",
      "token_count": 128,
      "metadata": {
        "doc_id": "uuid",
        "word_indexes": [0, 1, 2],
        "page": [1]
      },
      "embedding": [0.01, 0.02]
    }
  ]
}
```

### 4) チャンク化（非破壊）

```bash
curl -s -X POST http://localhost:8000/api/v1/documents/<doc_id>/chunks
```

- 返却: `chunks` のみ（`result.json` 内の `chunks` を返す）
- ルール: tokenizerベースで512トークン、10%オーバーラップ、wordは分割しない
  - `chunks[].metadata` に `doc_id` / `word_indexes` / `page` を付与
  - `chunks[].embedding` にベクトルを付与（OpenAI Embeddings）
- 除外: role が `pageHeader` / `pageFooter` / `pageNumber` / `table_element` / `figure_element` の語

### 5) 埋め込み

```bash
curl -s -X POST http://localhost:8000/api/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"text":"hello"}'
```

レスポンス例:

```json
{
  "embedding": [0.01, 0.02],
  "usage": {
    "input_tokens": 2,
    "total_tokens": 2
  }
}
```

### 6) 回答生成

```bash
curl -s -X POST http://localhost:8000/api/v1/answers \
  -H "Content-Type: application/json" \
  -d '{"question":"要約して","context":"...","model":"gpt-5-mini"}'
```

レスポンス例:

```json
{
  "answer": "...",
  "usage": {
    "input_tokens": 120,
    "output_tokens": 80,
    "total_tokens": 200
  }
}
```

### 7) 回答ストリーミング（WS）

接続後に最初のメッセージで `question` / `context` / `model` を送信します。

```json
{"question":"要約して","context":"...","model":"gpt-5-mini"}
```

イベント例:

```json
{"type":"delta","delta":"回答の一部"}
{"type":"usage","usage":{"input_tokens":120,"output_tokens":80,"total_tokens":200}}
{"type":"done"}
```

### 8) システム情報

```bash
curl -s http://localhost:8000/api/v1/system
```

レスポンス例:

```json
{
  "parser_version": "1.0.0",
  "api_key_configured": true,
  "azure_di_configured": true,
  "adi_model_default": "prebuilt-layout",
  "adi_max_concurrent_jobs": 3,
  "adi_analysis_timeout_seconds": 900,
  "max_upload_size_bytes": 20000000,
  "orphan_max_age_seconds": 600,
  "orphan_sweep_interval_seconds": 60,
  "openai_embedding_model": "text-embedding-3-small",
  "openai_chat_model": "gpt-5-mini",
  "openai_max_output_tokens": 512
}
```

## 認証（任意）

`.env` に `API_KEY` を設定すると `X-API-Key` が必須になります。

```bash
curl -H "X-API-Key: your-key" http://localhost:8000/api/v1/health
```

## レート制限（IP単位）

デフォルトで以下の制限を入れています（1分あたり）。

- `POST /documents`: 3/min
- `POST /answers`: 30/min
- `POST /embeddings`: 60/min
- `GET /documents/{doc_id}`: 120/min
- `GET /health`: 120/min
- `GET /documents/{doc_id}/result`: 60/min
- `POST /documents/{doc_id}/chunks`: 60/min

※ 複数workerだとカウンタがプロセスごとになるため、本番ではRedis等の共有バックエンド推奨。

## APIキー付与例

```bash
curl -s -H "X-API-Key: your-key" http://localhost:8000/api/v1/system
```

```bash
curl -s -X POST http://localhost:8000/api/v1/answers \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{"question":"要約して","context":"...","model":"gpt-5-mini"}'
```

## モデル指定の説明

`/answers` と `/ws/answers` は `model` をリクエストに含めると、そのモデルで回答生成します。
未指定の場合は `.env` の `OPENAI_CHAT_MODEL` が使われます。

## 設定（.env）

主な環境変数:

- `AZURE_DI_ENDPOINT`
- `AZURE_DI_KEY`
- `AZURE_DI_API_VERSION`
- `ADI_MODEL_DEFAULT`
- `TMP_DIR`
- `ADI_MAX_CONCURRENT_JOBS`
- `ADI_RETRY_MAX`
- `ADI_ANALYSIS_TIMEOUT_SECONDS`
- `ORPHAN_MAX_AGE_SECONDS`
- `ORPHAN_SWEEP_INTERVAL_SECONDS`
- `MAX_UPLOAD_SIZE_BYTES`
- `PARSER_VERSION`
- `API_KEY` (任意)
- `OPENAI_API_KEY`
- `OPENAI_EMBEDDING_MODEL`
- `OPENAI_CHAT_MODEL`
- `OPENAI_MAX_OUTPUT_TOKENS`

## Railway デプロイ手順

### 1) GitHub からデプロイ

1. GitHub にリポジトリを用意する
2. Railway で New Project → Deploy from GitHub repo
3. 対象リポジトリを選択して Deploy
4. Service の Settings → Networking から Domain を生成

### 2) CLI からデプロイ

1. CLI をインストールしてログイン
2. プロジェクト直下で `railway init`
3. `railway up` でデプロイ

CLI 例:

```bash
railway login
railway init
railway up
```

### 3) 環境変数の設定

Railway の Variables に以下を設定します（最低限）。

- `AZURE_DI_ENDPOINT`
- `AZURE_DI_KEY`
- `OPENAI_API_KEY`
- `API_KEY`（必要なら）

### 4) 起動コマンド

Railway の Start Command に以下を設定してください（ポートは Railway の `$PORT` を使用）。

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

参考:

```
https://docs.railway.com/guides/fastapi
https://docs.railway.com/guides/cli
```

## エラーコード

### 共通フォーマット

```json
{
  "error": {
    "code": "...",
    "message": "...",
    "details": { }
  }
}
```

### 一覧

- `UNAUTHORIZED` (401): APIキー不正
- `INVALID_OPTIONS` (400): options JSONが不正
- `FILE_TOO_LARGE` (413): アップロードサイズ超過
- `NOT_FOUND` (404): doc_id不明/結果なし/消費済み
- `DOCUMENT_NOT_READY` (409): 解析未完了
- `ADI_NOT_CONFIGURED` (500): ADI未設定

## 仕様書

- `docs/spec.md`
- `docs/spec_phases.md`
- `docs/endpoints.md`
