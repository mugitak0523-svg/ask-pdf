サービス名を **AskPDF** とし、既存のバックエンドAPIとSupabaseを最大限に活用した詳細仕様書を決定版として作成しました。

---

# AskPDF 詳細仕様書

## 1. サービス概要

**AskPDF** は、ユーザーがアップロードしたPDF資料に対して、AIが内容に基づいた回答を生成するRAG（Retrieval-Augmented Generation）プラットフォームです。
自作の解析エンジン（Azure Document Intelligence）を活用し、高精度なテキスト抽出と、回答の根拠となった箇所のPDFハイライト機能を提供します。

---

## 2. システムアーキテクチャ

本アプリは、以下の3つのコンポーネントで構成されます。

1. **AskPDF Web (Next.js)**: ユーザーインターフェース。
2. **AskPDF Backend (FastAPI)**: データの永続化とRAGロジックの制御。
3. **PDF Parser API (既存)**: PDFの解析、チャンク化、埋め込み、および回答生成。

---

## 3. フォルダ構成 (Folder Structure)

メンテナンス性を高めるため、フロントエンドとバックエンドを明確に分離した構成にします。

```text
ask-pdf/
├── apps/
│   ├── web/ (Frontend: Next.js)
│   │   ├── src/
│   │   │   ├── app/                # App Router
│   │   │   ├── components/
│   │   │   │   ├── sidebar/        # 履歴管理、アップロードボタン
│   │   │   │   ├── pdf-viewer/     # 自作PDFビューア層（HighlightOverlay含む）
│   │   │   │   └── chat/           # メッセージリスト、入力欄
│   │   │   ├── hooks/              # useRAG, usePDFCoordinates
│   │   │   └── store/              # Zustand (UI状態管理)
│   │
│   └── server/ (Backend: FastAPI)
│       ├── app/
│       │   ├── api/                # ルーティング (docs.py, chat.py, auth.py)
│       │   ├── services/           # RAGロジック、Parser APIクライアント
│       │   ├── db/                 # Supabase (pgvector) 連携
│       │   └── models/             # Pydanticスキーマ
│       └── main.py
│
└── supabase/
    ├── migrations/                 # pgvectorテーブル定義、RPC関数
    └── storage/                    # PDF原本保存バケット

```

---

## 4. データベース設計 (Supabase)

既存のParser APIは結果を保持しないため、AskPDF側で永続化を行います。

### `documents` テーブル

* `id`: uuid (PK)
* `user_id`: uuid (Auth.users参照)
* `title`: text
* `storage_path`: text (Supabase StorageのURL)
* `metadata`: jsonb (解析バージョン、総ページ数など)

### `document_chunks` テーブル (Vector DB)

* `id`: uuid (PK)
* `document_id`: uuid (FK)
* `content`: text (チャンクテキスト)
* `embedding`: vector(1536) (text-embedding-3-small)
* `metadata`: jsonb (ページ番号、**boundingRegions座標データ**)

---

## 5. 主要機能の技術仕様

### 5.1. PDF解析フロー

1. ユーザーがPDFをアップロード。
2. ファイルをSupabase Storageに保存。
3. Parser APIの `POST /documents` を呼び出し解析を開始。
4. `GET /documents/{doc_id}` でステータスを監視。
5. 解析完了後、`POST /documents/{doc_id}/chunks` でベクトルと座標データを一括取得。
6. 全データを `document_chunks` に一括インサート。

### 5.2. 自作PDFハイライト機能

PDFレンダリング層の上に、透明な `HighlightLayer` を実装します。

* **座標計算**:
APIから返されるインチ単位の座標を、以下の数式でビューア上のパーセンテージに変換します。

* **UX**:
チャット回答内の「引用」をクリックすると、上記計算に基づいた `div` 要素をPDF上に動的に描画します。

---

## 6. 会員区分と制限

将来の有料化（SaaS化）を前提とした制限を設けます。

| 機能 | ゲスト | 無料会員 | 有料会員 |
| --- | --- | --- | --- |
| **同時解析数** | 3 | 5 | 50 |
| **アップロードサイズ** | 10MB | 20MB | 100MB |
| **広告** | あり | あり | なし |

---

## 7. 開発ロードマップ

1. **Phase 1**: Supabase (pgvector) のセットアップとテーブル作成。
2. **Phase 2**: Parser APIとサーバー（FastAPI）の連携（インデックス処理の自動化）。
3. **Phase 3**: Next.js での 3ペインUI 実装。
4. **Phase 4**: 自作ハイライトエンジンの構築とスクロール同期の実装。

---
