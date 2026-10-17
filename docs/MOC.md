# vcxBridge 設計・開発ドキュメント (Map of Content)

本ファイル（`docs/MOC.md`）は、**vcxBridge** の開発者向け設計書・仕様書・技術選定記録の目次（Map of Content）です。Obsidian Vault の起点ノートとして利用します。

> [!NOTE]
> 拡張機能の利用者向け情報はルートの `README.md` に記述し、開発・設計に関する資料はすべて本 `docs/` 配下で管理します。

---

## 1. アーキテクチャ (`docs/architecture/`)
- [[architecture/overview|システム全体概要 (Architecture Overview)]]
- [[architecture/three-agent-harness|3エージェント自律開発ハーネス (Three-Agent Harness)]]

## 2. 機能仕様 (`docs/specs/`)
- *(今後作成予定)* `.vcxproj` / `.sln` 解析仕様
- *(今後作成予定)* `ms-vscode.cpptools` Configuration Provider 連携仕様
- *(今後作成予定)* カスタム GUI・ユーザータスク定義仕様

## 3. 今後の設計・検討テーマ (Open Topics)
1. **Client - Server 間通信方式の決定**:
   - 候補 A: FastAPI (HTTP REST / WebSocket) — 現在 `server/app/main.py` にプロトタイプ配置
   - 候補 B: JSON-RPC over stdio — ポート競合がなく VS Code Language Server 等で一般的な方式
2. **`.vcxproj` / `.sln` 解析アプローチ**:
   - MSBuild プロパティシート（`.props` / `.targets`）および条件分岐（`Condition`）の評価範囲
   - MSBuild CLI 連携と独自 XML パーサーの使い分け
3. **カスタム GUI の設定スキーマ**:
   - 利用者が自由にタスク・コマンドを定義するための設定ファイル形式（JSON / YAML 等）と UI コンポーネント構成
