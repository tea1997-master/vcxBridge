# Client (VS Code Extension) — Agent Guidelines

`client/` ディレクトリ配下（TypeScript による VS Code 拡張機能クライアント）を扱う際のガイドラインです。

## 1. 役割とスコープ
- VS Code Extension API のライフサイクル管理（`activate` / `deactivate`）
- `ms-vscode.cpptools` の Custom Configuration Provider への登録と設定提供
- カスタム GUI（Webview / TreeView / QuickPick 等）の表示とユーザー操作のハンドリング
- Python Server (`server/`) との通信およびプロセス管理

## 2. コーディング規約 (TypeScript)
- **Strict Mode**: `tsconfig.json` の `"strict": true` を維持し、`any` 型を使わず明示的なインターフェースや型定義を行う。
- **テスタビリティの確保**:
  - `vscode` モジュールに依存する処理（アダプター層）と、純粋なデータ変換・状態管理ロジック（ドメイン/サービス層）を分離する。
  - これにより、Extension Host を起動しなくても `vitest` で高速に単体テスト（`tests/unit/`）を実行できるように保つ。
- **非同期処理**: `async / await` を統一して使用し、エラーハンドリング（ユーザーへの適切な通知や OutputChannel へのログ出力）を漏らさない。

## 3. ディレクトリ構成とビルド・テスト
- `src/`: 拡張機能本体のソースコード（エントリーポイント: `src/extension.ts`）
- `dist/`: コンパイル後の出力先（Git 管理対象外）
- `tests/unit/`: Vitest による単体テスト
- `tests/integration/`: 結合テスト

### コマンド（`D:\vcxBridge\client` で実行）
- `npm run compile`: TypeScript のコンパイル（`dist/` へ出力）
- `npm run typecheck`: 型チェックのみ実行（`tsc --noEmit`）
- `npm test`: Vitest による単体テストの一括実行（`vitest run`）
