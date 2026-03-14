export type LpComparisonRow = {
  topic: string;
  legacy: string;
  askPdf: string;
};

export type LpFaqItem = {
  question: string;
  answer: string;
};

export type LpFeatureItem = {
  title: string;
  description: string;
};

export type LpFeatureDetailItem = {
  title: string;
  description: string;
  imageLabel?: string;
};

export type LpStepItem = {
  title: string;
  description: string;
};

export type LpPlanItem = {
  name: string;
  priceAmount: string;
  priceUnit: string;
  featured?: boolean;
  points: string[];
};

export const lpGeneralContent = {
  nav: {
    brand: "AskPDF",
    cta: "無料で試す",
  },
  hero: {
    title: "PDFを、参照箇所つきでAIに質問",
    subtitle:
      "契約書・マニュアル・提案書・論文など、PDFの管理，閲覧を1画面で",
    primaryCta: "無料で試す",
    secondaryCta: "価格を見る",
    chips: ["参照箇所つき回答", "多言語UI", "インストール不要"],
    metrics: [
      { label: "確認時間", value: "最大70%削減" },
      { label: "根拠確認", value: "ワンクリック" },
      { label: "初期費用", value: "¥0" },
    ],
  },
  trustLine:
    "契約書・マニュアル・提案書・論文など、日常のPDF業務を効率化します。",
  pains: [
    "必要な情報がPDFのどこにあるか探すのに時間がかかる",
    "AI回答の根拠が見えず、最終確認に手間がかかる",
    "PDFビューアとAIツールを往復して、作業が分断される",
  ],
  solutionPoints: [
    "質問への回答に参照箇所を表示し、元文書を即確認できます。",
    "PDF管理と質問を同じ画面で完結し、往復作業を減らせます。",
    "無料で始めて、利用量に応じてPlusへ拡張できます。",
  ],
  features: [
    {
      title: "PDF管理",
      description: "資料を一覧で整理し、必要なファイルにすぐアクセスできます。",
    },
    {
      title: "チャット質問",
      description: "自然言語で質問し、長文PDFの要点を短時間で確認できます。",
    },
    {
      title: "参照表示",
      description: "回答の根拠箇所を辿れるため、最終確認がスムーズです。",
    },
    {
      title: "利用上限の可視化",
      description: "プランごとの上限を把握しながら、安心して運用できます。",
    },
  ] satisfies LpFeatureItem[],
  featureDetails: [
    {
      title: "PDF管理",
      description:
        "一般的なファイル管理アプリのように、PDFを一覧で見て整理できます。フォルダ分けは現在開発中で、今後対応予定です。",
    },
    {
      title: "PDF閲覧",
      description:
        "マーカーやアンダーラインなどのアノテーションを使いながら読めます。将来的にはコメント機能などの拡張も予定しています。",
    },
    {
      title: "タブ",
      description:
        "上部タブでPDFを素早く切り替えられます。一度開いたPDFはできるだけ高速に再表示できるよう最適化しています。",
    },
    {
      title: "アノテーションミニマップ",
      description:
        "ビューア右側のミニマップから、アノテーション箇所へすぐジャンプできます。",
      imageLabel: "画像：ミニマップ",
    },
    {
      title: "チャット",
      description:
        "PDF内容をAIに質問でき、回答の参照箇所も確認できます。1つのPDFに対して複数チャットを使い分けられるのが特徴です。将来は複数PDFを横断した回答にも対応予定です。",
      imageLabel: "画像：チャット",
    },
    {
      title: "PDF検索",
      description: "本文ベースでPDFを検索できます。キーワード検索がしにくい資料でも探しやすくなります。",
    },
    {
      title: "OCR",
      description:
        "OCR解析により、画像PDFでもチャット・検索・ハイライトが可能です。手書き文書にも対応しています。",
      imageLabel: "画像：手書きでもチャット・ハイライト対応",
    },
    {
      title: "ショートカット",
      description: "主要操作にショートカットを用意しており、使い慣れるほど効率よく操作できます。",
    },
    {
      title: "シンプルUI",
      description:
        "機能を絞ったシンプルな設計で、初めてでも直感的に操作しやすいUIを目指しています。",
    },
  ] satisfies LpFeatureDetailItem[],
  steps: [
    {
      title: "1. PDFをアップロード",
      description: "確認したい資料をドラッグ&ドロップで追加。",
    },
    {
      title: "2. 気になる点を質問",
      description: "知りたい内容をチャットで入力。",
    },
    {
      title: "3. 根拠を確認",
      description: "回答と参照箇所を同時に見て判断。",
    },
  ] satisfies LpStepItem[],
  comparisonRows: [
    {
      topic: "根拠確認",
      legacy: "出典確認に時間がかかる",
      askPdf: "参照箇所をすぐ確認できる",
    },
    {
      topic: "作業導線",
      legacy: "複数ツールを行き来する",
      askPdf: "1画面で確認が完結する",
    },
    {
      topic: "読み漏れ対策",
      legacy: "該当箇所を探し直す必要がある",
      askPdf: "回答から該当箇所へ即移動できる",
    },
  ] satisfies LpComparisonRow[],
  plans: [
    {
      name: "Guest",
      priceAmount: "¥0",
      priceUnit: "/月",
      points: [
        "ログイン不要で利用開始",
        "最大PDF数: 1",
        "最大ファイルサイズ: 10MB",
        "1日のチャット数: 8",
      ],
    },
    {
      name: "Free",
      priceAmount: "¥0",
      priceUnit: "/月",
      points: [
        "ログインユーザー向け",
        "最大PDF数: 5",
        "最大ファイルサイズ: 20MB",
        "1日のチャット数: 20",
      ],
    },
    {
      name: "Plus",
      priceAmount: "¥1,980",
      priceUnit: "/月",
      featured: true,
      points: [
        "ヘビーユース向け",
        "最大PDF数: 50",
        "最大ファイルサイズ: 50MB",
        "1日のチャット数: 120",
      ],
    },
  ] satisfies LpPlanItem[],
  faqs: [
    {
      question: "どんなPDFに使えますか？",
      answer:
        "契約書、社内資料、マニュアル、提案書、論文など、幅広いPDFに利用できます。",
    },
    {
      question: "回答の根拠は確認できますか？",
      answer: "はい。回答に対応する参照箇所を確認しながら読み進められます。",
    },
    {
      question: "無料で試せますか？",
      answer: "Freeプランで利用を開始できます。必要に応じてPlusへ変更できます。",
    },
    {
      question: "アップロードしたデータはどう扱われますか？",
      answer:
        "アップロードしたPDFと利用データはアカウントに紐づいて管理され、設定から削除できます。",
    },
    {
      question: "解約はできますか？",
      answer: "いつでもプラン変更・解約が可能です。詳細は設定画面から確認できます。",
    },
  ] satisfies LpFaqItem[],
  footer: {
    note: "まずは無料で体験し、業務に合えばPlusへ切り替えてください。",
    cta: "無料で試す",
  },
} as const;
