# ledal Documents

- `privacy-policy/`: プライバシーポリシー
- `terms-of-service/`: 利用規約
- `tokushoho/`: 特定商取引法に基づく表記

運用ルール:
- 各フォルダに Markdown (`.md`) を追加して改定します。
- ファイル名は `YYYY-MM-DD.md` の形式を推奨します。
- アプリ表示は各フォルダ内で**ファイル名降順の先頭(最新)**を採用します。

反映方法:
- `apps/web` で `npm run legal:generate` を実行
- `npm run dev` / `npm run build` 実行時も自動で生成されます
