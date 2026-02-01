# Viewer Plugin Minimal Design

目的
- リッチPDFビューアを段階的に拡張できるようにする
- 早期は「普通のReact実装」を維持しつつ、あとからプラグイン化できる設計にする
- 機能制限（ユーザー/プラン別）をON/OFFしやすくする

スコープ（最小）
- プラグイン登録機構
- プラグインがアクセスできる共有状態（viewer state）
- 権限/フラグによる有効化

基本方針
- **コアは単一のViewerコンポーネント**
- **拡張点は明示的な場所（Toolbar / Sidebar / Overlay / Footer）**
- **プラグインは「描画スロットに差し込む関数」**

構成
- `ViewerCore`
  - PDF描画（pdf.js）
  - ページ/ズーム/スクロール制御
  - ハイライト描画（後から差し替え可能）
- `ViewerShell`
  - レイアウト（ヘッダー/ツールバー/本文/チャット）
  - プラグインの描画ポイント

共有状態（最小）
- `docId`: string | null
- `docTitle`: string | null
- `page`: number
- `zoom`: number
- `selection`: null | { page: number; rects: [...] }
- `highlights`: Highlight[]
- `viewerFlags`: Record<string, boolean>

プラグイン形式（最小）
```
type ViewerSlot = "toolbar" | "sidebar" | "overlay" | "footer";

type ViewerPlugin = {
  id: string;
  slot: ViewerSlot;
  label?: string;
  enabled?: (ctx: ViewerContext) => boolean;
  render: (ctx: ViewerContext) => React.ReactNode;
};
```

プラグイン登録
- 固定配列で登録
```
const plugins: ViewerPlugin[] = [
  SearchPlugin,
  HighlightPlugin,
  SummaryPlugin,
];
```

有効化（権限/プラン）
- `enabled(ctx)` で制御
```
enabled: ({ user }) => user.plan !== "free"
```

優先順位
- `slot` ごとに `order` を追加して並べる（必要なら）

レンダリング例
```
const renderSlot = (slot: ViewerSlot) =>
  plugins
    .filter(p => p.slot === slot)
    .filter(p => p.enabled ? p.enabled(ctx) : true)
    .map(p => <Fragment key={p.id}>{p.render(ctx)}</Fragment>);
```

初期プラグイン候補
- Toolbar: 検索 / ズーム / 共有
- Sidebar: 目次 / サムネ
- Overlay: ハイライト / コメント
- Footer: ページ番号

次の段階（後回し）
- プラグインの動的ロード（feature flags）
- プラグインの遅延ロード（code splitting）
- プラグイン間イベントバス

実装時の注意
- コア状態を変更するAPIは `ViewerContext` のみで提供
- DOMを直接触るプラグインは禁止（描画壊れの原因）
- 破壊的な操作は `canEdit` フラグで制限
