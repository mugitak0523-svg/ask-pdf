以下は **今の実装（最新）**に合わせたアップロード〜解析完了のフローです。

---

## 1. フロントでアップロード開始
- `apps/web/src/app/[locale]/page.tsx` の `handleUpload`
- `POST /documents/index` を送信

---

## 2. サーバーで事前チェック（/documents/index）
- `apps/server/app/api/documents.py`
- **同時進行数チェック**
  - `count_active_uploads()` が `uploading | uploaded | processing` をカウント
  - 3件以上なら **403** で終了  
    → UIに `detail` を表示
- 併せてファイルサイズ制限 / ドキュメント数制限もチェック

---

## 3. DBに先にレコード作成
- `apps/server/app/services/indexer.py` `start_index_document`
- `insert_document(... status="uploading")`
  - `documents` に即時反映される

---

## 4. ストレージへアップロード
- `storage_client.upload_pdf(...)`
- 成功したら `status="uploaded"` に更新

---

## 5. 解析タスクをバックグラウンドで起動
- `asyncio.create_task(_process_document(...))`
- 同時解析は `CapacityLimiter(3)` で最大3件

---

## 6. 解析開始
- `status="processing"` に更新
- parser に投げる  
  - `parser.create_document` → `parser_doc_id`
  - `parser.get_document` で完了待ち
  - `parser.get_result` で結果取得

---

## 7. DB更新
- `update_document_result(...)`
  - `metadata`, `result`, `status="ready"`
- `document_chunks` 保存
- 解析使用量ログ保存

---

## 8. フロント側の再開（アプリ開始時）
- `loadDocuments()` が `/documents` を取得した直後に  
  `POST /documents/processing/resume` を **一度だけ**呼ぶ
- サーバー側で **processing のみ**再開
  - `parser_doc_id` があるものだけ

---

### 重要ポイント
- **uploaded は再開しない**（指示通り）
- **processing のみ再開**  
  （ブラウザでアプリを開いて `/documents` を取得した時に再開）

---

必要なら、このフローを図にしたり、`uploaded` も再開する版を追加できます。