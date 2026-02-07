# LLM回答フロー（フロント検索版 / サーバー検索版）

このファイルは、PDFチャットの回答生成フローを日本語で整理したものです。

## フロント検索版（client_matches を使う）
1. **POST /documents/{doc}/chats/{chat}/messages**
   - ユーザーメッセージをDBに保存
2. **POST /embeddings**
   - フロントから質問テキストを送信し、埋め込みベクトルを取得
3. **フロントでベクトル検索**
   - 事前に読み込んだ chunks から類似検索し `client_matches` を作成
4. **WS /documents/{doc}/chats/{chat}/assistant/ws**
   - `client_matches` を添えてWSを開始
5. **サーバー側**
   - `document_thread_exists` で権限/存在確認
   - `client_matches` を top_k に切ってコンテキストを構築
   - 直近会話履歴を追加
6. **LLM生成**
   - `parser.create_answer(question, context, model)` を実行
7. **保存 + 返却**
   - assistantメッセージを保存、usageを記録
   - WSで回答をストリーミング返却

## サーバー検索版（client_matches なし）
1. **POST /documents/{doc}/chats/{chat}/messages**
   - ユーザーメッセージをDBに保存
2. **WS /documents/{doc}/chats/{chat}/assistant/ws**
   - WSを開始（client_matches なし）
3. **サーバー側**
   - `document_thread_exists` で権限/存在確認
   - `parser.embed_text(message)` で質問を埋め込み
   - `match_documents(document_id=...)` でRAG検索
   - 直近会話履歴を取得
4. **LLM生成**
   - `parser.create_answer(question, context, model)` を実行
5. **保存 + 返却**
   - assistantメッセージを保存、usageを記録
   - WSで回答をストリーミング返却

## 共通ポイント
- **POST は保存のみ**（LLM生成はWS内）
- **LLM回答生成はWS**で行われる
- **埋め込みと検索は「フロント or サーバー」いずれか一方**
- 返却は **WSでストリーミング**
