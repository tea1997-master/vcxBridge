---
name: dev-test-workflow
description: >-
  Runbook for building, type-checking, and running unit/integration tests for both the TypeScript VS Code extension client (client/) and the Python backend server (server/). Activate this skill when verifying code changes, running tests, or adding dependencies.
---

# vcxBridge ビルド・テスト実行ワークフロー

コードの変更後や、テスト・ビルドの実行を求められた際は、以下の手順に従って検証を行います。

## 1. Client (TypeScript / VS Code Extension) の検証手順

作業ディレクトリ（`Cwd`）を `D:\vcxBridge\client` に指定して実行します。

1. **型チェックとコンパイル**:
   ```powershell
   npm run compile
   ```
   - `client/dist/extension.js` がエラーなく生成されることを確認します。
2. **単体テスト（Vitest）の実行**:
   ```powershell
   npm test
   ```
   - `vitest run` が実行され、すべてのテストケースがパスすることを確認します。

## 2. Server (Python Backend) の検証手順

作業ディレクトリ（`Cwd`）を `D:\vcxBridge\server` に指定し、必ず `.venv` 内の実行ファイルを使用します。

1. **単体テスト（pytest）の実行**:
   ```powershell
   .\.venv\Scripts\pytest
   ```
2. **パッケージ追加時の手順**:
   新しい Python パッケージを追加する場合は、以下の手順で UTF-8 エンコーディングを維持したまま `requirements.txt` を更新します。
   ```powershell
   .\.venv\Scripts\pip install <package-name>
   .\.venv\Scripts\pip freeze | Out-File -FilePath requirements.txt -Encoding utf8
   ```
