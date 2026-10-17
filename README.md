# vcxBridge

**vcxBridge** は、Visual Studio の C++ プロジェクト（`.sln` / `.vcxproj`）を Visual Studio Code 上で快適に開発するための拡張機能です。

## 主な機能

- **高精度な IntelliSense / コードナビゲーション連携**
  - Visual Studio プロジェクトファイル（`.vcxproj` / `.props` / `.targets` 等）を解析し、[C/C++ 拡張機能 (`ms-vscode.cpptools`)](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) にインクルードパスやマクロ定義、コンパイラ設定を自動で提供します。
- **カスタマイズ可能な GUI パネル**
  - プロジェクトのビルドやクリーンだけでなく、利用者が独自に定義したタスク・スクリプト・ワークフローを GUI からワンクリックで実行できます。

## 動作要件

- **Visual Studio Code**: 1.90.0 以上
- **C/C++ 拡張機能 (`ms-vscode.cpptools`)**: IntelliSense 連携機能を利用する場合に必要です。

## 使い方

1. Visual Studio のソリューション（`.sln`）またはプロジェクト（`.vcxproj`）を含むフォルダを VS Code で開きます。
2. 拡張機能が自動的にプロジェクト構成を検出し、IntelliSense 設定を構成します。
3. カスタム GUI パネルからビルドや登録済みタスクを実行できます。

## ライセンス

[MIT License](./LICENSE)
