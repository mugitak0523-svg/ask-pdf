# PDF Upload & Processing Spec (v2)

## 目的
- アップロード完了前後の状態をDBで管理し、リロード/ログアウト後も一覧表示を維持する。
- 解析処理はバックグラウンドで実行し、同時解析数は最大2件に制限する。
- 解析完了のUI反映は個別のstatusポーリングで行う。

## 用語
- **Document**: ユーザーがアップロードしたPDF。
- **Processing**: 解析（全文抽出/索引/サムネイル生成など）を指す。

## 状態管理
### documents.status
- `uploading`: アップロード開始〜完了前
- `uploaded`: アップロード完了、解析待ち
- `processing`: 解析中（同時最大2件）
- `ready`: 解析完了、未閲覧
- `done`: 解析完了、閲覧済み
- `failed`: 解析失敗

### 補助カラム
- `progress` (int 0-100, nullable)
- `error_message` (text, nullable)
- `updated_at` (timestamptz, not null)

## UI表示
- 一覧に常時表示（`uploading/processing` でも表示）。
- 状態ラベル:
  - `uploading`: 「アップロード中」（波アニメ）
  - `uploaded`: 「解析待ち」
  - `processing`: 「解析中」（波アニメ）
  - `ready`: NEW バッジ（黄緑）
  - `done`: バッジ無し
  - `failed`: 「失敗」バッジ（赤）
- `failed` は **再試行ボタン無し**。

## 処理フロー
1. **アップロード開始**
   - DBに `documents` を作成: `status=uploading`
2. **アップロード完了**
   - `status=uploaded` に更新
3. **解析開始（バックグラウンド）**
   - `status=processing` に更新
   - pdf-parser に `create_document` して `parser_doc_id` を取得
   - `parser.get_document` をポーリングし、完了待ち
   - `parser.get_result` で結果取得
4. **解析完了**
   - `status=ready`、`metadata/result` を保存
   - `document_chunks` を保存
   - 使用量ログ保存
5. **解析失敗**
   - `status=failed`、`error_message` を保存

## 同時解析制御
- サーバー側の同時解析数は **制限しない**。

## 同時アップロード制限（ユーザー単位）
- `MAX_CONCURRENT_UPLOADS` 環境変数で制御（デフォルト: 2）。
- `uploading/uploaded/processing` が上限以上の場合、`POST /documents/index` は 403。

## アプリ起動時の再開
- ブラウザでアプリを開き、`/documents` 取得直後に
  `POST /documents/processing/resume` を **一度だけ**呼ぶ。
- 再開直前に `updated_at` が1時間以上前の
  `uploading/uploaded/processing` を `failed` に更新する。
- **再開対象は `processing` のみ**。
- `uploaded` は再開しない（`parser_doc_id` が無いため）。

## 解析再開の考え方
- `processing` のドキュメントは `parser_doc_id` を持つ。
- pdf-parser 側では `doc_id` に紐づく解析が継続しているため、
  サーバーが再起動しても `parser.get_document(doc_id)` のポーリングで再開できる。
- `uploaded` は解析未開始なので再開できない（ストレージ再取得が必要）。

## 解析完了のUI反映
- 一覧全体の再取得は行わない。
- `uploading/uploaded/processing` の間だけ `GET /documents/{id}` を定期ポーリングし、
  **該当ドキュメントの `status` だけ**更新する。
- `ready/failed/done` になったらポーリング停止。

## チャットの利用可否
- `ready` / `done` 以外ではチャットを利用できない。
- チャット入力、モデル切替、新規作成は無効化。
- 表示文言:
  - 通常: 「解析が完了するまでチャットは利用できません。」
  - `failed`: 「解析に失敗したのでチャットは利用できません。」

## NEW バッジの扱い
- `status === "ready"` のドキュメントに NEW を表示。
- 一度開いたら `status = "done"` に更新し、以後 NEW は表示しない。
