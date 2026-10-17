---
name: three-agent-harness
description: >-
  Anthropic 3エージェント構成（Planner / Generator / Evaluator）による自律開発オーケストレーション・スキル。親エージェントが進行管理役（Orchestrator）となり、3つの独立した Subagent と .agents/workspace/ 配下の構造化ハンドオフファイルを用いて、計画・実装・厳格な検証ループを回す際にアクティベートする。
---

# Anthropic 3エージェント構成（Three-Agent Harness）ワークフロー

本スキルは、Anthropic が提唱する **3エージェント構成（Planner / Generator / Evaluator）** を Antigravity CLI 上で実行するためのオーケストレーション手順書です。
親エージェント（あなた）は **Orchestrator（進行管理役）** として振る舞い、自身で直接すべての実装・評価を抱え込むのではなく、独立したコンテキストを持つ 3 つの Subagent（`planner`, `generator`, `evaluator`）を順番に呼び出して高品質なソフトウェア開発を遂行します。

---

## 1. アーキテクチャと役割分担

| ロール | エージェント名 (`TypeName`) | 責務 | 出力ハンドオフファイル |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | 親エージェント（メイン） | ユーザー対話、全体進行管理、Subagent 起動と差し戻しループ制御 | — |
| **Planner** | `planner` | 要件分析、タスクチャンク分解、客観的な受入基準（Acceptance Criteria）の策定 | `.agents/workspace/plan.md`<br>`.agents/workspace/progress.md` |
| **Generator** | `generator` | 対象チャンクのコード実装、単体テスト作成、セルフビルド確認 | `.agents/workspace/progress.md`<br>（および実装・テストコード） |
| **Evaluator** | `evaluator` | 独立コンテキストでの厳格なコード監査・ビルド・テスト実行・合否判定（※コード編集禁止） | `.agents/workspace/evaluation.md` |

> [!NOTE]
> `planner`、`generator`、`evaluator` は `.agents/agents/<name>/agent.md` に定義されており、Antigravity CLI によって自動的に認識されます。`invoke_subagent` ツールで `TypeName` にそれぞれ `planner` / `generator` / `evaluator` を指定して直接呼び出すことができます。

---

## 2. 実行手順（自律ループ）

### Phase 1: 計画フェーズ（Planner の起動）
1. ユーザーから開発タスクを受け取ったら、まず要件に不明点がないか確認します（不明点があればユーザーに質問して解消します）。
2. `invoke_subagent` で `planner` を起動します：
   - **Role**: `Task Planner`
   - **Model**: `inherit`
   - **Prompt**: ユーザーの要求、背景、対象スコープを伝え、`.agents/workspace/plan.md` と `.agents/workspace/progress.md` を作成させます。
3. Planner 完了後、生成された `.agents/workspace/plan.md` を確認します。

### Phase 2: 実装フェーズ（Generator の起動）
未完了のタスクチャンク（Chunk $N$）ごとに、以下を実行します：
1. `invoke_subagent` で `generator` を起動します：
   - **Role**: `Code Generator (Chunk N)`
   - **Model**: `inherit`
   - **Prompt**:
     - `.agents/workspace/plan.md` の **Chunk $N$** を実装するよう指示します。
     - 差し戻し（リトライ）の場合は、`.agents/workspace/evaluation.md` の指摘事項をすべて解消するよう指示します。
     - 実装と単体テスト作成後、`.agents/workspace/progress.md` を更新させます。

### Phase 3: 評価・検証フェーズ（Evaluator の起動）
Generator が Chunk $N$ の実装を完了したら、**必ず新しい独立したコンテキスト**（または Evaluator 専用 Subagent）で検証を行います：
1. `invoke_subagent` で `evaluator` を起動します：
   - **Role**: `Quality Evaluator (Chunk N)`
   - **Model**: `inherit`
   - **Prompt**:
     - `.agents/workspace/plan.md` の Chunk $N$ の受入基準と `.agents/workspace/progress.md` を確認し、変更されたコードとテストの静的監査および `dev-test-workflow` に基づくビルド・単体テスト実行を行うよう指示します。
     - **プロダクションコード・テストコードの直接修正は厳禁**であることを念押しし、検証結果（`PASS` / `FAIL`）と具体的なフィードバックを `.agents/workspace/evaluation.md` に出力させます。

### Phase 4: 合否判定とイテレーション制御
Evaluator 完了後、`.agents/workspace/evaluation.md` の総合判定を確認します：
- **`PASS` の場合**:
  - `.agents/workspace/progress.md` の Chunk $N$ を `COMPLETED` に更新します。
  - 次の未完了チャンク（Chunk $N+1$）があれば **Phase 2** へ進みます。
  - 全チャンクが完了したら、最終成果物と検証結果のサマリーをユーザーに報告します。
- **`FAIL` の場合**:
  - **Phase 2** に戻り、`generator` に `.agents/workspace/evaluation.md` の指摘事項を修正させます。
  - 同一チャンクで **3回連続 `FAIL`** となった場合は、計画自体に無理がある可能性があるため、`planner` を再起動してチャンク分割を見直すか、ユーザーに状況を報告して判断を仰ぎます。
