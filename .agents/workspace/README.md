# 3エージェント構成 構造化ハンドオフ用ワークスペース (`.agents/workspace/`)

本ディレクトリは、Anthropic の **3エージェント構成（Planner / Generator / Evaluator）** において、エージェント間でコンテキストの肥大化や汚染を防ぎながら状態を正確に引き継ぐための **Structured Handoff（構造化ハンドオフ）** ファイルを格納します。

---

## 1. ハンドオフファイル一覧

| ファイル名 | 作成・更新担当 | 読み取り担当 | 役割 |
| :--- | :--- | :--- | :--- |
| `plan.md` | **Planner** | Orchestrator, Generator, Evaluator | 全体目標、アーキテクチャ制約、分割されたタスクチャンク（Chunk 1..N）および各チャンクの受入基準（Acceptance Criteria）を定義する。 |
| `progress.md` | **Planner** / **Generator** / **Orchestrator** | 全エージェント | 各タスクチャンクの進行ステータス（`PENDING` / `IN_PROGRESS` / `READY_FOR_EVAL` / `COMPLETED`）、変更ファイル一覧、実装メモを記録する。 |
| `evaluation.md` | **Evaluator** | Orchestrator, Generator | 対象チャンクに対するビルド・単体テスト実行結果、受入基準の達成状況、総合判定（`PASS` / `FAIL`）、および差し戻し時の具体的な修正指示を記録する。 |

---

## 2. 運用ルール

1. **セッション・コンテキスト間の唯一の真実（Single Source of Truth）**:
   - 各 Subagent（`planner`, `generator`, `evaluator`）は親エージェントの長い会話履歴を引き継がないため、作業開始時に必ず本ディレクトリ内のファイルを読み込んで現在の状態を把握します。
2. **文字コード**:
   - すべてのファイルは **UTF-8 (BOM なし)**・日本語で記述します。
3. **Evaluator の書き込み制限**:
   - Evaluator はソースコード（`client/`, `server/`）を一切変更せず、本ディレクトリの `evaluation.md` にのみ検証結果とフィードバックを出力します。
