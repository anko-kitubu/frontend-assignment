# 住所検索 SPA

郵便番号から住所を検索する React + TypeScript の SPA です。郵便番号検索には zipcloud の「郵便番号検索 API」を使用しています。

## 使用技術

- React
- TypeScript
- Vite
- SCSS
- ESLint
- Prettier
- Vitest / Testing Library

## Node.js

`.nvmrc` に記載の `24.14.0` で確認しています。

## セットアップ

```bash
npm install
npm run dev
```

起動後、表示されたローカル URL をブラウザで開いてください。

## コマンド

```bash
npm run lint
npm run test
npm run build
```

## 実装内容

- 郵便番号入力による住所検索
- 空入力時の検索ボタン非活性
- 入力欄の最大 8 文字制限
- 半角数字とハイフン以外の入力チェック
- `000-0000` または `0000000` 形式のチェック
- 存在しない郵便番号、通信エラーの表示
- 複数検索結果の全件表示
- 検索履歴のカード表示
- 3 件ごとのカルーセル、ドラッグ・スワイプ、ページネーション、戻る・進む操作
- 768px breakpoint のレスポンシブ対応
