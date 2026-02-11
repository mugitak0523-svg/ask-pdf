# Stripe 決済 仕様書（年額プランなし）

## 目的
- Plus / Pro の月額課金を Stripe で提供する。
- 既存のプラン管理（`/plans/me`）と整合し、課金状態に応じてプランを変更する。
- ゲストは決済不可（サインイン誘導）。

## 対象プラン
- `guest` / `free`: 無料
- `plus`: 月額 `¥1,280`
- `pro`: 月額 `¥2,980`
- 年額プランは **提供しない**。

## 課金フロー（Checkout）
1. ユーザーが UI で Plus / Pro を選択。
2. フロントが `POST /billing/checkout` を呼ぶ。
3. サーバーが Stripe Checkout Session を作成。
4. フロントは `session.url` にリダイレクト。
5. 決済完了後、Stripe が `checkout.session.completed` を Webhook で通知。
6. サーバーが `user_plans` を更新（`plus` / `pro`）。

## プラン管理フロー（Customer Portal）
1. フロントが `POST /billing/portal` を呼ぶ。
2. サーバーが Stripe Customer Portal セッションを作成。
3. ユーザーは Portal からプラン変更・解約。
4. Stripe が `customer.subscription.*` を Webhook で通知。
5. サーバーが `user_plans` を更新。

## 課金状態とプラン決定ロジック
- Webhook が **唯一の真実**（UI からの直接 `PATCH /plans/me` は決済済みユーザーには使わない）。
- `subscription.status` が `active` または `trialing` の場合のみ `plus` / `pro` を付与。
- `canceled` / `incomplete` / `past_due` / `unpaid` の場合は `free` に戻す。
- 無料からのアップグレードは Checkout でのみ実施。

## データモデル
既存 `user_plans` を利用し、Stripe 連携用に以下を追加。
- `stripe_customer_id` (text, nullable)
- `stripe_subscription_id` (text, nullable)
- `stripe_price_id` (text, nullable)
- `stripe_status` (text, nullable)
- `current_period_end` (timestamp, nullable)
- `updated_at` (timestamp)

## Stripe 構成（Products / Prices）
Products:
- `plus`
- `pro`

Prices（すべて `recurring.interval = month`）:
- `plus_monthly_jpy_1280`
- `pro_monthly_jpy_2980`

## API 仕様

### `POST /billing/checkout`
- 認証: 必須（ゲスト不可）
- リクエスト:
  - `plan`: `plus` | `pro`
- レスポンス:
  - `url`: Checkout へのリダイレクト URL
- エラー:
  - 400: 無効なプラン
  - 401: 未認証

### `POST /billing/portal`
- 認証: 必須（ゲスト不可）
- レスポンス:
  - `url`: Customer Portal へのリダイレクト URL
- エラー:
  - 401: 未認証

### Webhooks
エンドポイント: `/billing/webhook`
検証: Stripe 署名（`STRIPE_WEBHOOK_SECRET`）

受け取るイベント:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

処理:
- `price.id` から `plan` を逆引き。
- `subscription.status` に応じて `user_plans.plan` を `plus`/`pro`/`free` に更新。
- `stripe_*` カラムと `current_period_end` を更新。

## UI 仕様
- プラン変更モーダルの CTA:
  - 未ログイン: `Sign in` / `Sign up`
  - ログイン済み: `Upgrade to Plus` / `Upgrade to Pro`
- 現在プラン表示（バッジ）は継続。
- 年額トグル・年額表示は **削除**。

## 環境変数
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PLUS_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `APP_BASE_URL`（Checkout / Portal の return URL 用）

## 実装メモ
- 既存の `PATCH /plans/me` は「決済連携前の開発用途」に限定。
- 以後、課金プランの変更は Stripe のみ。
- 既存のプラン制限ロジック（PDF数/サイズ/1日質問数）はそのまま利用。
