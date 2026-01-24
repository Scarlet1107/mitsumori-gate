# Mitsumori Gate – 家づくりシミュレーター

顧客自身の事前入力（Web）と来店時の聞き取り（対面）を同じシミュレーションロジックで扱うアプリです。年収や既存ローン、頭金、希望返済額から借入可能額と建築予算の目安を算出し、Web入力完了時はPDFを添付したメールを自動送信します。

## 何ができるか
- Web自己入力フロー（`/consent?mode=web` → `/web-form`）  
  1問1画面で18ステップ。配偶者有無やボーナス払いの有無によってステップをスキップし、途中経過をLocalStorageに保存します。完了時に顧客・シミュレーション結果をDBへ保存し、メールアドレスがある場合はPDFを添付して送信します。
- 対面入力フロー（`/inperson-form` か `/consent?mode=inperson`）  
  既存顧客を検索して呼び出し、足りない情報を追加入力してシミュレーション。既存レコードが選択されている場合は入力内容を上書きし、対面完了フラグを付けます（新規作成は行わない想定）。
- 管理画面（`/admin`、Basic認証）  
  最近の顧客一覧と完了状況を確認し、`/admin/config` で利率・DTI・坪単価を編集できます（DBが空なら初回アクセス時にデフォルトを投入）。
- PDF／メール  
  jsPDFで日本語フォント入りPDFを生成し、Resendで送信します。メール送信は環境変数が未設定でもスキップされるだけで動作は続行します。

## 技術スタック
- Next.js 15 (App Router) / React 19 / TypeScript
- UI: Tailwind CSS + shadcn/ui + framer-motion
- DB: Neon(PostgreSQL) + Prisma（`lib/generated/prisma` にクライアント出力）
- その他: jsPDF（PDF生成）、Resend（メール）

## ディレクトリ
- `app/` … ルートページ、Webフォーム、対面フォーム、管理画面、API Route Handlers
- `lib/` … 計算・バリデーション・PDF・メール・DBアクセスなどのドメインロジック
- `components/` … フォームUIやshadcnベースの共通コンポーネント
- `prisma/schema.prisma` … `Customer` / `Simulation` / `AppConfig` のスキーマ
- `public/fonts/NotoSansJP-Regular.ttf` … PDF用フォント（差し替え可）

## セットアップ
1) 前提  
   - Node.js 20系推奨  
   - PostgreSQL（ローカル or Neon など）  
2) 依存関係  
   ```bash
   npm install
   ```
3) 環境変数  
   `.env.example` をコピーして `.env` を作成し、最低限以下を設定します。
   - `DATABASE_URL` … Postgres接続文字列
   - `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` … `/admin` と `/api/admin/*` 用のBasic認証
   - `RESEND_API_KEY` / `RESEND_FROM_EMAIL` … PDFメール送信用（未設定なら送信スキップ）
   - `CONTACT_PHONE` / `CONTACT_EMAIL` … メール本文の連絡先表示
   - `PDF_JP_FONT_PATH` … 日本語フォントのパス（デフォルトで同梱フォントを参照）
   - `COMPANY_NOTIFICATION_EMAIL` … Web完了時の社内通知メール送信先（未設定なら送信スキップ）
4) DBマイグレーション  
   ```bash
   npx prisma migrate dev --name init
   ```
   初回アクセス時に設定値が空なら `AppConfig` にデフォルト値が自動投入されます。
5) 開発サーバー  
   ```bash
   npm run dev   # Turbopack
   ```
   - Web自己入力: http://localhost:3000/consent?mode=web  
   - 対面入力: http://localhost:3000/inperson-form  
   - 管理画面: http://localhost:3000/admin （Basic認証）

## 開発時のコマンド
- Lint: `npm run lint`
- テスト（計算ロジック／スキーマ）: `npm test`
- 型生成: `npx prisma generate`（`npm install` 時に自動実行）

## データと動作の要点
- `Customer` に顧客入力を保存し、Web完了時は `webCompleted=true`、対面で既存顧客を上書きすると `inPersonCompleted=true` を付与します。
- `Simulation` に試算結果を保存します（Webフローで自動作成、`unit_price_per_tsubo` などの係数もスナップショット保存）。
- `AppConfig` に利率・DTI・坪単価を保持し、管理画面で編集可能です。
- 郵便番号検索は zipcloud API を利用します。ネットワークが遮断されている場合は手入力で進行してください。

ER図はこちら (/lib/generated/ERD.md)

## ページの流れ（参考）
- `/` … Web/対面どちらで始めるかのランディング
- `/consent` … 同意確認（`mode=web|inperson` を付与）
- `/web-form` … 自己入力ウィザード（完了で `/done?mode=web` へ）
- `/inperson-form` … 対面ウィザード。検索で既存顧客を選択すると各値を自動入力
- `/done` … 完了メッセージ。戻り導線のみ
