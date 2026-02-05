# グローバルチャット仕様書

## 1. 目的
- ユーザーの全PDFを横断して質問できるチャットを提供する。
- 通常PDFチャットと混ざらない文脈で運用する。
- 参照元を明示して誤解を防ぐ。

## 2. 前提・スコープ
- 対象: 認証済みユーザーの全PDF（user_idで制限）。
- モード: 通常PDFチャットとは別スレッド。
- 参照表示: 回答中に参照箇所を逐次表示できるようにする（LLMタグ＋検証）。

## 3. データモデル
### 3.1 テーブル
- `global_chat_threads`
  - `id`, `user_id`, `title`, `created_at`, `updated_at`
- `global_chat_messages`
  - `id`, `chat_id`, `user_id`, `role`, `content`, `status`, `refs`, `created_at`

### 3.2 参照データ
`refs` には以下を含める:
- `id`: `chunk-{chunk_id}`
- `label`: `"{DocumentTitle} p.{page}"` など表示用
- `documentId`: 参照元ドキュメントID

## 4. API仕様（要点）
- `GET /global-chats` スレッド一覧
- `POST /global-chats` スレッド作成
- `GET /global-chats/{chat_id}/messages` メッセージ一覧
- `POST /global-chats/{chat_id}/messages` ユーザー発言保存
- `POST /global-chats/{chat_id}/assistant` 回答生成

## 5. 生成フロー
1) ユーザー入力保存  
2) 埋め込み生成  
3) `match_user_documents` で全PDF検索  
4) `context` を組み立てて LLM へ送信  
5) LLMの回答から参照タグ抽出  
6) タグ検証・補正  
7) 回答保存・返却  

## 6. LLMに渡すコンテキスト
### 6.1 形式
```
[1] ({DocumentTitle} p.{page}) {chunk_text}
[2] ({DocumentTitle}) {chunk_text}

Conversation (last 2 turns):
User: ...
Assistant: ...
```

### 6.2 システムプロンプト
```
あなたはPDF横断検索を行うアシスタントです。
ユーザーの質問に対し、与えられたコンテキストと確定している事実，一般常識だけを根拠に答えてください。
推測で補完しないでください。
```

### 6.3 参照タグ付与指示（ハイブリッド方式）
LLMへ以下の指示を追加する:
- 「参照した場合は `[@:chunk-{id}]` を文中に挿入する」
- 参照は複数可、段落末尾に付ける

## 7. 参照タグ検証・補正
### 7.1 検証
- 返却された `chunk_id` が `context` 内に存在するか検証
- 不正/欠落は除去

### 7.2 補正
- タグが無い場合は上位マッチを自動割当（最上位1〜2件）
- 参照が過剰な場合は重複を削除

## 8. UI仕様
### 8.1 配置
- PDFビューア下部に固定
- 送信ボタン右にモデル選択と使用量リング

### 8.2 メッセージ表示
- 先頭プレフィックスで区別  
  - User: `>`  
  - Assistant: `•`
- 参照はメッセージ直下に表示（クリックで該当PDFへジャンプ）

### 8.3 エラー/停止時
- PDFチャットと同様の表示
- 直前ユーザー発言でリトライ可能

## 9. 保存・復元
- `globalChatOpen`, `globalChatHeight`, `globalChatMode` を `localStorage` に保存

## 10. セキュリティ
- `user_id` によるフィルタを必須
- 参照チャンクの取得時も `document_id` と `user_id` を検証

## 11. 運用上の注意
- タグ付与はLLM任せにせず、必ずサーバ側検証を行う
- 誤参照リスクが高い場合は「参照なし」扱いにする

## 12. 今後の拡張
- スレッド一覧UI（複数グロチャスレッド）
- ストリーミング回答対応
- 参照の途中挿入UI（段落ごと表示）
