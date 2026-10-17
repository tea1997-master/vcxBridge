# Server (Python Backend Engine) — Agent Guidelines

`server/` ディレクトリ配下（Python によるバックエンド解析エンジン）を扱う際のガイドラインです。

## 1. 役割とスコープ
- Visual Studio ソリューション（`.sln`）およびプロジェクトファイル（`.vcxproj`, `.vcxproj.filters`, `.props`, `.targets`）の高速な解析
- MSBuild プロパティ・マクロ（`$(Configuration)`, `$(Platform)`, `$(ProjectDir)` 等）および Condition 属性の評価
- `cpptools` が必要とするコンパイル情報（IncludePath, Defines, CompilerPath, C/C++ Standard 等）の構造化データ生成
- カスタム GUI から要求されるビルドコマンド生成やプロジェクト構造データの提供

## 2. 仮想環境と実行ルール
- **必ずローカル仮想環境 (`server/.venv`) を使用する**:
  - Python 実行: `D:\vcxBridge\server\.venv\Scripts\python.exe`
  - pytest 実行: `D:\vcxBridge\server\.venv\Scripts\pytest.exe`
  - パッケージ追加時は `server/.venv/Scripts/pip install <pkg>` を実行後、**UTF-8 エンコーディング**で `requirements.txt` を更新する（PowerShell の `>` リダイレクトは UTF-16LE になる場合があるため、`Out-File -Encoding utf8` 等を用いること）。

## 3. コーディング規約 (Python)
- **Python バージョン**: Python 3.12 以上を前提とする。
- **型ヒントとデータモデル**:
  - すべての関数・メソッドの引数と戻り値に型ヒント（Type Annotations）を付与する。
  - 入出力スキーマや設定データには `pydantic` (v2) の `BaseModel` または `dataclass` を積極的に活用する。
- **レイヤー分離**:
  - 通信インターフェース層（`app/main.py` 等）と、コア解析ロジック層（XML パーサー、MSBuild 評価器など）を分離する。今後 Client-Server 間の通信方式（HTTP / WebSocket / JSON-RPC stdio 等）が変更・拡張されても、コア解析ロジックに手を入れる必要がない設計を維持する。
- **テスト**:
  - 新規モジュール・関数を追加した際は `server/tests/` 配下に `test_*.py` を追加し、`pytest` で検証する。
