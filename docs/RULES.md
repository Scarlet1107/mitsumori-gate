# Mitsumori Gate – Project Rules (V0)

## 0. 概要

* **プロダクト名**: Mitsumori Gate（ミツモリ・ゲート）
* **ミッション**: 初回面談（見積り前ヒアリング）を **スマホ/タブレット/PC** で自己入力に置き換え、**見積り作成コスト**と**質問負荷**を削減（レスポンシブ必須）
* **対象企業**: サンワイディア（住宅/新築リフォーム/公民館/農業倉庫）/ 従業員7名 / 本社: 塩川町
* **V0スコープ**

  * 1問1画面の顧客入力ウィザード（同意 → 基礎情報 → 年収/予算 → 種別）
  * `/admin` で入力結果閲覧（Basic 認証; middleware）
  * **進捗バー**表示（現在位置がわかること）
  * **ホームページからの遷移**: `?from=homepage` を付与（GETパラメータ）
  * **オンライン前提**（オフライン対応なし）
  * **将来**: 入力完了時の社員メール通知（V0では未実装）
* **非機能**

  * PDF/CSV/Excel出力は任意（V0必須ではない）
  * タップ/スワイプで右方向へ切り替わる軽快なアニメーション（YouTube Shorts的テンポ）
  * モバイル/タブレット中心のレイアウト

## 1. 技術スタックと原則

* Next.js 15 (App Router) + TypeScript
* DB: Neon Postgres (Free) + Prisma
* UI: shadcn/ui + Tailwind CSS
* フォーム: react-hook-form + Zod（厳格バリデーション）
* デプロイ: AWS Amplify Hosting（1アプリ構成）
* 認証 (V0): `/admin` および `/api/admin/*` を Basic 認証（middleware）
* 原則:

  * DBアクセスはサーバ側のみ（Route Handlers / Server Components）
  * すべての入力は Zod で検証
  * コード/設定はシンプル&最小で先に価値を出す（V0優先）

## 2. ディレクトリ構成（推奨）

```
/app
  /(public)
    /consent
    /intake
    /done
  /admin
    /intakes
      /[id]
  /api
    /intakes
    /admin/intakes
/components
  ProgressBar.tsx
  StepCard.tsx
/lib
  db.ts
  validator.ts
/prisma
  schema.prisma
/Docs
  RULES.md
  01-context.md
  02-user-journeys.md
  03-data-model.sql
  04-api-contract.md
  05-ux-copy.md
  06-privacy-security.md
```

## 3. デザイン指針

* **カラー**:

  * メイン: Tailwind `orange`/`amber` の **200, 300, 400, 500**
  * ベース: `white` / `gray-50`〜`100`、テキストは `gray-800`
* **タイポ/サイズ**:

  * 質問文: `text-xl ~ 2xl`
  * 本文: `text-base ~ lg`
  * タップ領域は最小48px
* **アニメーション**:

  * 回答/次へ: 横スライド（右方向）+ 速度は短め（軽快）
* **操作感**:

  * 1画面1質問
  * 右下に「次へ」固定（親指操作前提）
  * 上部に進捗バーを常時表示
* **レスポンシブ**:

  * 主対象はスマホ/タブレット。PC時は中央寄せ（`max-w-xl`）

## 4. 画面

* `/consent`: 同意文、スイッチ、同意必須
* `/intake`: 一問一答（下記 8〜9 ステップ）
* `/done`: 完了表示、受付ID
* `/admin/intakes`: 一覧（検索/並び替え/ページネーションは後回し可）
* `/admin/intakes/[id]`: 詳細

## 5. ステップ構成（V0）

1. 同意（必須）
2. 氏名（必須）
3. 電話（必須）
4. メール（任意）
5. 住所（任意）
6. 年収（任意; 単位=万円）
7. 予算（任意; 単位=万円）
8. 種別（new/reform/warehouse）
9. 確認 → 送信

## 6. セキュリティ（V0ミニマム）

* `/admin` と `/api/admin/*` に Basic 認証（middleware）
* `/admin` は `X-Robots-Tag: noindex, nofollow`
* 公開フォームは将来 BOT 対策/レート制限/CSRF を導入予定（V0は省略可）
* HTTPS（Amplify）

## 7. DB方針（V0）

* **固定カラムのみ**（`answers` は使用しない）
* 検索/出力で使う項目は全て列化
* 移行が必要になったら後続 migration で追加

## 8. コーディング規約（要点）

* Server/Client の明示（`"use client"`）
* 入出力は Zod スキーマで厳密化し `z.infer` を型源泉に
* DB アクセスは `/lib/db.ts` 経由
* 個人情報レスポンスは `Cache-Control: no-store`

## 9. 将来ロードマップ

* V0: 顧客入力/保存、admin閲覧、進捗バー（今ここ）
* V1: メール通知、Excel/CSV出力、簡易検索
* V2: 分岐質問（新築/リフォームで出し分け）、認証強化、正式PDF
