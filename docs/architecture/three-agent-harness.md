# 3エージェント自律開発ハーネス (Three-Agent Harness)

上位リンク: [[MOC|vcxBridge 設計・開発ドキュメント (MOC)]]

## 1. 背景と目的

単一の AI エージェントセッションで大規模・長時間のソフトウェア開発（計画・実装・テスト検証）を行うと、以下の課題が発生しやすくなります。

1. **コンテキスト不安（Context Anxiety）と肥大化**:
   - 試行錯誤のログでコンテキストウィンドウが圧迫されると、エージェントが「早くタスクを終わらせよう」としてスタブや未完成の状態で完了報告を行う傾向がある。
2. **自己評価バイアス（Self-Evaluation Bias）**:
   - コードを書いたエージェント自身がテスト・レビューを行うと、自らの設計ミスやエッジケースの漏れに対して甘い判定を下しやすい。
3. **役割の混同**:
   - 全体設計、細部のコーディング、品質監査を同一コンテキストで行き来することで、本来のアーキテクチャ制約を見失う。

これらを解決するため、Anthropic が提唱する **3エージェント構成（Planner / Generator / Evaluator）** を Antigravity CLI の Subagent 機能および構造化ハンドオフ（Structured Handoff）を用いて実装します。

---

## 2. アーキテクチャ全体像

親エージェントが **Orchestrator（進行管理役）** となり、独立したコンテキストウィンドウを持つ 3 つの Subagent（`planner`, `generator`, `evaluator`）を `invoke_subagent` で呼び出します。

```mermaid
flowchart TD
    User["ユーザー (User)"] -->|"開発タスクの依頼"| Orchestrator["親エージェント (Orchestrator)<br/>進行管理・ループ制御"]

    subgraph Subagents ["独立コンテキスト Subagents (.agents/agents/)"]
        Planner["Planner (計画担当)<br/>タスクチャンク分解・受入基準定義"]
        Generator["Generator (実装担当)<br/>コード実装・単体テスト作成"]
        Evaluator["Evaluator (評価・検証担当)<br/>静的監査・ビルド・テスト実行<br/>※コード編集禁止"]
    end

    subgraph Handoff ["構造化ハンドオフ (.agents/workspace/)"]
        PlanMD["plan.md<br/>(計画・受入基準)"]
        ProgressMD["progress.md<br/>(進捗・変更ファイル)"]
        EvalMD["evaluation.md<br/>(合否判定・指摘事項)"]
    end

    Orchestrator -->|"1. 計画作成指示"| Planner
    Planner -->|"出力"| PlanMD
    Planner -->|"初期化"| ProgressMD

    Orchestrator -->|"2. チャンク実装指示"| Generator
    PlanMD -.->|"参照"| Generator
    EvalMD -.->|"差し戻し時に参照"| Generator
    Generator -->|"更新"| ProgressMD

    Orchestrator -->|"3. 検証指示"| Evaluator
    PlanMD -.->|"受入基準を参照"| Evaluator
    ProgressMD -.->|"変更内容を参照"| Evaluator
    Evaluator -->|"PASS / FAIL 出力"| EvalMD
    EvalMD -.->|"4. 合否確認・ループ判定"| Orchestrator
```

---

## 3. ワークフロー（シーケンス）

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザー
    participant Orch as Orchestrator (親)
    participant Plan as Planner
    participant Work as .agents/workspace/
    participant Gen as Generator
    participant Eval as Evaluator

    User->>Orch: 機能開発・改修の依頼
    Orch->>Plan: invoke_subagent("planner")
    Plan->>Work: plan.md & progress.md を作成
    Plan-->>Orch: 計画完了報告

    loop 各タスクチャンク (Chunk 1..N)
        loop Evaluator が PASS するまで (最大3回目安)
            Orch->>Gen: invoke_subagent("generator", Chunk N)
            Gen->>Work: plan.md / evaluation.md を読み込み
            Gen->>Gen: コード実装 & 単体テスト作成 (client/ or server/)
            Gen->>Work: progress.md を更新 (READY_FOR_EVAL)
            Gen-->>Orch: 実装完了報告

            Orch->>Eval: invoke_subagent("evaluator", Chunk N)
            Eval->>Work: plan.md & progress.md を読み込み
            Eval->>Eval: コード監査 & ビルド・テスト実行 (コード編集は一切行わない)
            Eval->>Work: evaluation.md を出力 (PASS or FAIL)
            Eval-->>Orch: 評価完了報告 (PASS / FAIL)
        end
        Orch->>Work: progress.md の Chunk N を COMPLETED に更新
    end

    Orch-->>User: 最終成果物と検証結果サマリーを報告
```

---

## 4. ディレクトリ・ファイル構成

| パス                                            | 種別           | 説明                                                          |
| :-------------------------------------------- | :----------- | :---------------------------------------------------------- |
| `.agents/agents/planner/agent.md`             | Custom Agent | **Planner** のシステムプロンプト・メタデータ定義                              |
| `.agents/agents/generator/agent.md`           | Custom Agent | **Generator** のシステムプロンプト・メタデータ定義                            |
| `.agents/agents/evaluator/agent.md`           | Custom Agent | **Evaluator** のシステムプロンプト・メタデータ定義（コード編集禁止ガードレール付）            |
| `.agents/skills/three-agent-harness/SKILL.md` | Skill        | Orchestrator が 3 エージェントを連携させるための実行手順書                       |
| `.agents/workspace/README.md`                 | Docs         | 構造化ハンドオフ用ファイル（`plan.md`, `progress.md`, `evaluation.md`）の仕様 |
