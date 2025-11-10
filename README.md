# 簡単家づくりシミュレーション

住宅ローンとプランニングの事前シミュレーション機能を提供します。顧客が来店前／来店時に必要情報を入力すると、借入可能上限額・希望条件での借入額・参考延床面積を算出し、結果をPDF付きメールで送信できます。

## セットアップ

1. 依存関係をインストール
    ```bash
    npm install
    ```
2. `.env.example` を参考に `.env` ファイルを作成し、必要な環境変数を設定
   - `DATABASE_URL`: データベース接続情報
   - `RESEND_API_KEY`: Resend APIキー（メール送信用）
   - `RESEND_FROM_EMAIL`: 送信者メールアドレス
3. Prisma のマイグレーションを適用（初回は任意の名前で OK）
    ```bash
    npx prisma migrate dev --name init-simulations
    ```
4. 開発サーバーを起動
    ```bash
    npm run dev
    ```

ブラウザで [http://localhost:3000/consent](http://localhost:3000/consent) にアクセスし、同意後に表示されるステップフローでシミュレーターを利用できます。（既存の intake フローを拡張しています。）

## テストと品質確認

- 型／Lint: `npm run lint`
- ユニットテスト（バリデーションと試算ロジック）: `npm test`

※ 実行環境によっては Vitest がワーカースレッドを利用できずエラーになる場合があります。その場合は Node.js のワーカースレッドを許可するか、CI 上で実行してください。

## 設定値の一元管理

金利・返済比率・坪単価などの係数は `lib/simulation/config.ts` の `defaultSimulationConfig` でまとめて管理しています。必要に応じて環境変数や管理画面から上書きできるように `createSimulationConfig` を用意しています。

## 保存データ

`prisma/schema.prisma` の `Simulation` モデルに入力値と算出結果を保存します。WebFormの場合は、シミュレーション完了時に自動的にPDF付きメールが顧客に送信されます。メール送信にはResend APIを使用し、PDFはjsPDFライブラリで生成されます。

## 画面フロー概要

1. 同意と前提条件の確認
2. 基礎情報（年齢・郵便番号）
3. 年収・他借入・自己資金のヒアリング（1問ずつ）
4. 土地の有無を確認
5. 借入可能上限（MaxLoan）の提示
6. 希望返済額・返済期間・ボーナス返済の入力
7. スライダーで微調整し WishLoan と延床目安を更新
8. 結果保存と完了画面（WebForm完了時にPDF付きメール自動送信）

各画面に注意文言を掲示し、金額はすべて「万円」単位で入力します（1を入力すると1万円として保存・計算されます）。結果表示時は円記号＋3桁区切りでフォーマットされ、微調整画面では MaxLoan と WishLoan の比率をプログレスバーで表示し、坪数・平米数の目安も同時に更新します。

## メール機能とPDF生成

### 技術スタック
- **メール送信**: Resend API
- **PDF生成**: jsPDF（軽量、画像・テーブル対応）
- **自動化**: WebFormの完了時に自動実行

### 機能概要
- シミュレーション結果を美しくレイアウトしたPDFレポートを自動生成
- 顧客のメールアドレスにPDF添付で結果を送信
- PDFには以下の内容を含む：
  - 顧客情報
  - 借入条件と試算結果
  - 詳細な返済プラン
  - リスク評価
  - 建築計画の参考数値

### 必要な環境変数
```bash
# Resend API（メール送信）
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### Resend API設定手順
1. [Resend](https://resend.com/)でアカウント作成
2. ドメインを追加・認証（DNSレコード設定が必要）
3. API Keysページで新しいAPIキーを生成
4. 環境変数に設定
