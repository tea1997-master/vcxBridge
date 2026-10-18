---
name: architecture-docs
description: >-
  Guidelines and templates for creating and updating design documents, specifications, and Architecture Decision Records (ADRs) in docs/ (Obsidian compatible). Activate this skill when designing features, deciding client-server protocols, or documenting specifications.
---

# 設計ドキュメント・仕様管理スキル (Obsidian 連携)

本リポジトリはルートに `.obsidian` を備えており、`docs/` 配下の Markdown ドキュメントを Obsidian 上で閲覧・管理できるように構成されています。
設計資料を作成・更新する際は、`resources/` 配下の **3階層フォーマットテンプレート（全体アーキテクチャ / 外部設計 / 内部設計）** を読み込み、以下の責務境界の制約を厳格に遵守してください。

---

## 1. テンプレートファイル一覧 (`resources/`)

対象の設計スコープに応じて、必ず対応するテンプレートファイルを読み込んでからドキュメントを作成・更新してください。

| フォーマット種別 | テンプレートファイルパス | 適用対象・用途 |
| :--- | :--- | :--- |
| **【フォーマット1】全体アーキテクチャ** | [resources/format1-overall-architecture.md](./resources/format1-overall-architecture.md) | システム全体の設計・共通基盤（`docs/architecture/overview.md`） |
| **【フォーマット2】外部設計（親資料・What）** | [resources/format2-external-design.md](./resources/format2-external-design.md) | 特定機能の外部仕様・UI仕様・公開IF・業務フロー（`docs/specs/<feature>-external.md`） |
| **【フォーマット3】内部設計（子資料・How）** | [resources/format3-internal-design.md](./resources/format3-internal-design.md) | 特定機能の内部モジュール構造・データ構造・処理シーケンス（`docs/specs/<feature>-internal-<boundary>.md`） |

---

## 2. ドキュメントの責務分離と配置構成

### 2.1 `README.md` と `docs/` の分離
- **`README.md`（リポジトリルート / `client/README.md`）**:
  - **本拡張機能の利用者（エンドユーザー）が見るべき情報のみ**（機能概要、動作要件、使い方、設定方法など）を記述する。内部設計や開発者向けの情報は一切記載しない。
- **`docs/MOC.md`（Map of Content）**:
  - 開発者・AI エージェント向けの設計書・仕様書の目次（Map of Content）として管理する。
  - AI 開発ワークフロー（`.agents/`）自体の説明は `.agents/` 配下に閉じ込め、`docs/` には **vcxBridge プロダクト自体の設計資料のみ** を配置する。

### 2.2 スコープ別の出力構成とファイル配置 (`docs/`)
- **システム全体の設計を要求された場合**:
  - [format1-overall-architecture.md](./resources/format1-overall-architecture.md) に基づき「全体アーキテクチャ」（`docs/architecture/overview.md`）を出力し、必要に応じて主要機能の「外部設計」「内部設計」を出力する。
- **特定機能の設計を要求された場合**:
  - その機能の **「外部設計（親資料・What）」**（[format2-external-design.md](./resources/format2-external-design.md)）と **「内部設計（子資料・How）」**（[format3-internal-design.md](./resources/format3-internal-design.md)）に分割して `docs/specs/` 配下に出力する。
  - **技術境界ごとの内部設計分割ルール**:
    - `vcxBridge` は **TypeScript Client (`client/`)** と **Python Server (`server/`)** で実行環境・技術境界が明確に分かれているため、内部設計（子資料）はその境界ごとに分割して出力する（例: `<feature>-external.md` に対し、`<feature>-internal-client.md` と `<feature>-internal-server.md`）。

```text
docs/
├── MOC.md                                    # 設計資料全体の目次 (Map of Content)
├── architecture/
│   └── overview.md                           # 【フォーマット1】vcxBridge 全体アーキテクチャ
└── specs/
    ├── <feature>-external.md                 # 【フォーマット2】機能別の外部設計（親資料・What）
    ├── <feature>-internal-client.md          # 【フォーマット3】機能別の内部設計 - Client編（子資料・How）
    └── <feature>-internal-server.md          # 【フォーマット3】機能別の内部設計 - Server編（子資料・How）
```

---

## 3. 厳守すべき制約（ガードレール）

1. **責務境界の厳格な分離**:
   - **「全体アーキテクチャ」「外部設計（What）」「内部設計（How）」の責務境界を厳格に守り、内容を絶対に混在させないこと。**
   - **外部設計（What）** には内部ロジック・関数名・クラス構造・内部アルゴリズムへの言及を一切含めない。
   - **内部設計（How）** には UI の表面的な振る舞いやユーザー向けエラーメッセージ文言を含めない。
2. **技術境界・サブシステム境界での分割**:
   - システムの規模が大きい場合や、実行環境・技術境界（VS Code TypeScript Client と Python Backend Server 等）が明確に分かれている場合は、内部設計（子資料）をその境界ごとに適切に分割して出力し、仕様書が巨大化しないようにする。
3. **推測の禁止**:
   - 不明な点や前提条件が不足している部分は、勝手に推測せずユーザーに問い合わせる（または合意の上で「検討中（TBD）」として選択肢を明記する）。
4. **視覚化と可読性の最優先**:
   - 図・表・Mermaid（`flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `erDiagram` 等）を最大限活用して読みやすさを何よりも重視する。
   - Obsidian の Wikiリンク（`[[specs/xxx|表示名]]`）を用いて親資料（外部設計）と子資料（内部設計）を双方向にリンクし、`docs/MOC.md` の目次を常に最新に保つ。
