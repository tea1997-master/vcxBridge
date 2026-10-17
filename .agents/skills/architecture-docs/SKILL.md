---
name: architecture-docs
description: >-
  Guidelines and templates for creating and updating design documents, specifications, and Architecture Decision Records (ADRs) in docs/ (Obsidian compatible). Activate this skill when designing features, deciding client-server protocols, or documenting specifications.
---

# 設計ドキュメント・仕様管理スキル (Obsidian 連携)

本リポジトリはルートに `.obsidian` を備えており、`docs/` 配下の Markdown ドキュメントを Obsidian 上で閲覧・管理できるように構成されています。

## 1. `README.md` と `docs/MOC.md` の責務分離

- **`README.md`（リポジトリルート / `client/README.md`）**:
  - **本拡張機能の利用者（エンドユーザー）が見るべき情報のみ**（機能概要、動作要件、使い方、設定方法など）を記述する。内部設計や開発者向けの情報は記載しない。
- **`docs/MOC.md`（Map of Content）**:
  - 開発者・AI エージェント向けの設計書・仕様書・検討資料の目次（Map of Content）として管理する。

## 2. ドキュメント配置構成 (`docs/`)

- `docs/MOC.md`: 設計・開発ドキュメント全体の目次（Map of Content）
- `docs/architecture/`: システム全体構成、Client-Server 通信方式、技術選定の記録（ADR）
- `docs/specs/`: 各機能の詳細仕様（`.vcxproj` 解析仕様、`cpptools` 連携仕様、カスタム GUI スキーマ仕様など）

## 3. 記述ルール

1. **言語とフォーマット**:
   - すべて日本語の GitHub Flavored Markdown / Obsidian 互換形式で記述する。
   - 図表には Mermaid ダイアグラム（`flowchart TD`, `sequenceDiagram`, `classDiagram` 等）を積極的に用いる。
2. **技術選定・設計判断の記録**:
   - 通信方式やカスタム GUI の設定フォーマットなど、重要な設計判断を行った際は `docs/architecture/` または `docs/specs/` に背景・選択肢・決定理由を記録し、`docs/MOC.md` のリンクを更新する。
