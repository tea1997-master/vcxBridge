# AGENTS.md

## 1. プロジェクト概要
**vcxBridge** は、Visual Studio の C++ プロジェクト（`.vcxproj` / `.sln` 等）を解析し、Visual Studio Code 上での C++ 開発体験を向上させる拡張機能です。

### 主な目的・機能
1. **IntelliSense / Browse 機能の向上**:
   - Visual Studio のプロジェクトファイルを解析し、インクルードパス・マクロ定義・コンパイラオプション等を抽出して `ms-vscode.cpptools` の **Custom Configuration Provider** に渡す。
2. **カスタマイズ可能なカスタム GUI 機能**:
   - ビルド作業をはじめ、拡張機能の利用者が自由にタスク・コマンド・ワークフローを定義・実行できるカスタム GUI（Webview / TreeView 等）を提供する。
3. **ハイブリッドアーキテクチャ (TypeScript Client + Python Server)**:
   - **Client (`client/`)**: TypeScript で実装。VS Code 拡張機能のエントリーポイント、`cpptools` API 連携、カスタム GUI の描画・操作を担当。
   - **Server (`server/`)**: Python で実装。`.vcxproj` 等の XML 解析や MSBuild プロパティ評価など、負荷の高いバックエンド処理を担当（※Client-Server 間の通信方式は今後正式決定予定。現在は FastAPI による HTTP 構成がプロトタイプ配置されている）。

---

## 2. リポジトリ構成

```text
D:\vcxBridge\
├── README.md                 # 拡張機能の利用者（エンドユーザー）向け説明のみ記載
├── AGENTS.md                 # ルート全体ルール（本ファイル）
├── .agents/                  # Antigravity CLI カスタマイズ（Agents / Skills / Workspace）
│   ├── agents/               # カスタムエージェント定義（planner / generator / evaluator）
│   ├── skills/               # ワークフロー手順書（three-agent-harness 等）
│   └── workspace/            # 3エージェント間の構造化ハンドオフファイル格納先
├── .vscode/                  # VS Code デバッグ・タスク設定
├── client/                   # VS Code 拡張機能クライアント (TypeScript / Vitest)
│   ├── AGENTS.md             # Client 固有ルール
│   ├── src/                  # ソースコード
│   └── tests/                # テストコード (unit / integration)
├── server/                   # バックエンドエンジン (Python / pytest)
│   ├── AGENTS.md             # Server 固有ルール
│   ├── app/                  # アプリケーションコード
│   └── tests/                # テストコード
└── docs/                     # 設計ドキュメント・仕様書（Obsidian 対応）
    └── MOC.md                # 開発・設計資料の目次 (Map of Content)
```

---

## 3. 共通開発ルール・規約

### 言語・コミュニケーション
- ユーザーとの対話、ドキュメント、コード内コメント、コミットメッセージ、PR 説明はすべて **日本語** で記述する。
- 不明点や仕様上の曖昧さがある場合は、独断で進めずユーザーに確認する。

### ドキュメントの責務分離
- **`README.md`**: 本拡張機能の利用者が見るべき情報（機能概要、動作要件、使い方、設定方法）のみを記述し、内部設計や開発者向けの情報は混ぜない。
- **`docs/MOC.md` および `docs/` 配下**: 開発・設計資料の目次（Map of Content）および各種仕様書・アーキテクチャ資料はすべて `docs/` 配下で管理する。

### ファイルエンコーディング・改行コード
- すべてのテキストファイル（`.ts`, `.py`, `.json`, `.md`, `.txt` 等）は **UTF-8 (BOM なし)** で保存する。
- PowerShell 等でファイルを出力・更新する際も UTF-8 エンコーディングを維持する。

### コーディング・品質基準
- **責務の分離**:
  - VS Code 固有の UI / API 呼び出しは `client/` に閉じ込め、重いファイル解析や MSBuild 条件評価ロジックは `server/` に集約する。
- **テストの徹底**:
  - 機能追加・修正を行う際は、対応する単体テスト（`client`: Vitest、`server`: pytest）を作成・更新し、テストがパスすることを確認してから完了とする。
- **型安全性**:
  - TypeScript では `strict: true` を遵守し、安易な `any` の使用を避ける。
  - Python では型ヒント（Type Hints / Pydantic モデル）を必須とする。

---

## 4. よく使うコマンド（クイックリファレンス）

- **Client (TypeScript)**:
  - ビルド: `npm run compile` (作業ディレクトリ: `D:\vcxBridge\client`)
  - 型チェック: `npm run typecheck` (作業ディレクトリ: `D:\vcxBridge\client`)
  - テスト実行: `npm test` (作業ディレクトリ: `D:\vcxBridge\client`)
- **Server (Python)**:
  - テスト実行: `.\.venv\Scripts\pytest` (作業ディレクトリ: `D:\vcxBridge\server`)
  - 開発サーバー起動（現行プロトタイプ）: `.\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload` (作業ディレクトリ: `D:\vcxBridge\server`)

---

## 5. Anthropic 3エージェント構成（Planner / Generator / Evaluator）

本リポジトリでは、コンテキスト肥大化や自己評価バイアスを防ぎ高品質なソフトウェアを開発するため、Anthropic 提唱の **3エージェント構成（Three-Agent Harness）** を導入しています。

- **オーケストレーション・スキル**: `.agents/skills/three-agent-harness/SKILL.md`
  - 親エージェントが進行管理役（Orchestrator）となり、`invoke_subagent` で以下 3 つの独立した Subagent を呼び出して自律ループを回します。
- **カスタムエージェント定義 (`.agents/agents/`)**:
  1. **`planner`** (`.agents/agents/planner/agent.md`): 要件分析・タスクチャンク分解・受入基準の策定を担当。
  2. **`generator`** (`.agents/agents/generator/agent.md`): タスクチャンクの実装・単体テスト作成を担当。
  3. **`evaluator`** (`.agents/agents/evaluator/agent.md`): 独立コンテキストでのコード監査・ビルド・テスト検証・合否判定を担当（※コードの直接編集は禁止し、問題があれば Generator へ差し戻す）。
- **構造化ハンドオフ (`.agents/workspace/`)**:
  - エージェント間の状態引き継ぎは、`plan.md`（計画・受入基準）、`progress.md`（進捗・変更記録）、`evaluation.md`（評価結果・差し戻し指示）を介して行います。
