# 04 API Contract (V0)

## POST /api/intakes

* **説明**: 最終送信時に1回で保存（V0ではオートセーブなし）
* **入力 (JSON)**:

  ```json
  {
    "consent": true,
    "customer_name": "山田太郎",
    "phone": "09012345678",
    "email": "taro@example.com",
    "address": "福島県会津若松市...",
    "annual_income": 600,
    "budget_total": 2000,
    "project_type": "new",
    "from": "homepage"
  }
  ```
* **検証**: Zod（未入力は `undefined` or 欠落）
* **出力 (JSON)**:

  ```json
  { "id": "uuid", "status": "new", "created_at": "..." }
  ```
* **レスポンスヘッダ**: `Cache-Control: no-store`

## GET /api/admin/intakes  (Basic)

* **説明**: 一覧取得（簡易; order=created_at desc）
* **クエリ**: `?limit=20&cursor=...`
* **出力**:

  ```json
  { "items": [{ "id": "...", "customer_name": "...", "created_at": "..." }], "nextCursor": "..." }
  ```

## GET /api/admin/intakes/:id  (Basic)

* **説明**: 詳細取得
* **出力**: `intakes` の全フィールド

## エラー仕様

* 機械可読:

  ```json
  { "error": { "code": "BAD_REQUEST", "message": "..." } }
  ```
* 代表コード: `UNAUTHORIZED` / `BAD_REQUEST` / `NOT_FOUND` / `INTERNAL`
