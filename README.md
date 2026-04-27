# Resonance

**Affective dynamics writing tool** — 20 種類の感情パターンに基づいて文章を生成・リライトできる、研究に裏付けられたライティングツール。

このプロダクトは「情動経験の動力学理論」（formal_theory.md）に基づいて設計されています。

## 構成

```text
resonance/
  index.html        メインアプリ（SPA、5タブ）
  app.js            アプリケーションロジック
  patterns.js       20 感情パターンの定義 + 60 の例文
  vercel.json       Vercel デプロイ設定
  package.json      パッケージ情報
  README.md         このファイル
  DEPLOY.md         デプロイ手順
```

## 主要機能

- **Compose**: 感情パターンを選んで素材から文章を生成（5 スタイル × 3 字数）
- **Refine**: 既存テキストを別の感情パターンに書き換え（3 段階強度）
- **Library**: 20 感情パターンの図鑑、各 3 例文、軌道型と理論プロファイル
- **History**: 履歴・お気に入り・CSV エクスポート
- **About**: 理論的背景と論文・GitHub へのリンク
- **API キー**: ユーザーの Anthropic API キーを localStorage に保存
- **ダーク/ライトモード**
- **モバイル対応**（タブが下部ナビに切り替わる）

## ローカル動作確認

依存ゼロの静的 SPA。任意の HTTP サーバで動きます。

```bash
# Python の場合
python3 -m http.server 8000

# または npx
npx serve .
```

ブラウザで http://localhost:8000 を開くと最初に設定モーダルが出るので、Anthropic API キーを入れます。キーは `localStorage` にのみ保存されます。

## デプロイ

`DEPLOY.md` を参照。Vercel への 1 コマンドデプロイを推奨。

## 技術スタック

- バニラ HTML/CSS/JS（フレームワーク・ビルドステップなし）
- Anthropic API を直接呼び出し（ブラウザから `anthropic-dangerous-direct-browser-access: true` ヘッダで）
- localStorage で履歴・設定を保持

## セキュリティ注意

このバージョンはユーザーのブラウザに API キーを保存し、Anthropic API を直接呼び出します。これは **ユーザー自身の API キーで使う** モデルであり、本人以外がキーを盗める状態にはなりません。

ただし、商用展開でサーバ側 API キーで全ユーザーに提供する場合は、`Vercel Functions` 等のバックエンドプロキシを追加し、ブラウザから API キーを完全に隠す構成に変更してください（DEPLOY.md 後半に記載）。

## 既知の制約

- 1 リクエストあたり最大トークン 2000（`app.js` 内 `max_tokens`）
- 履歴は最大 200 件で自動的にトリミング
- レート制限は実装していない（Anthropic 側のレート制限に従う）
- ブランドアセット（OG image, favicon）は未配置

## 拡張ポイント

短期的に追加したい機能：

```text
- A/B 比較生成（2 案を並列生成して選ぶ）
- 強度スライダー（Compose 側にも）
- 感情のミックス（カタルシス × ノスタルジア）
- カスタム感情パターン
- 共有 URL（生成結果をリンクで共有）
- 統計ダッシュボード（よく使う感情、生成数推移）
```

中期：

```text
- バックエンドプロキシ経由でサーバ側 API キー方式に
- Stripe 連携で Pro プラン
- ユーザー認証（Clerk / Auth0 等）
- マルチデバイス同期
```

## 理論的背景

このツールの 20 感情パターンは、研究プロジェクト「情動経験の動力学理論」で定義された 9 軌道型に分類されています。

```text
軌道型 I    短期上昇 → 急下降（即時C）       笑い・ツッコミ・伏線回収・不快な冗談
軌道型 II   短期上昇 → 急下降（遅延C）       伏線回収・予想外の展開
軌道型 III  短期上昇 → 解放欠落              意味不明なギャグ・驚き
軌道型 IV   長期蓄積 → 解放                  感動・カタルシス・泣けるドラマ
軌道型 V    長期維持 → 解放なし              サスペンス・怖い沈黙・気まずさ
軌道型 VI   脅威解除                         安心
軌道型 VII  低振幅反復                       会話の気持ちよさ・ノリの良さ
軌道型 VIII 低S安定                          退屈・心地よい沈黙・予想通りの安心感
軌道型 IX   リズム破壊                       テンポの悪さ
```

詳細は GitHub リポジトリの以下のドキュメントを参照：

- [`conversation_dynamics_paper.md`](https://github.com/zekiah03/resonance/blob/main/conversation_dynamics_paper.md) 論文本体
- [`formal_theory.md`](https://github.com/zekiah03/resonance/blob/main/formal_theory.md) 動力学方程式・反証条件
- [`affective_pattern_typology.md`](https://github.com/zekiah03/resonance/blob/main/affective_pattern_typology.md) 20 パターンと軌道型の定義
- [`simulation_report.md`](https://github.com/zekiah03/resonance/blob/main/simulation_report.md) 数値シミュレーション結果

## ライセンス

研究用プロトタイプとしての公開。商用ライセンスは別途相談。
