# Deploy — Resonance を Vercel に公開する

このドキュメントは Claude Code（CLI）から `resonance_product/` を Vercel にデプロイする手順をまとめたものです。MVP 版は静的 SPA なのでサーバ不要、ほぼ無料で公開できます。

## 前提

- Node.js 18 以上
- Vercel アカウント（無料）
- ターミナル

## 最短デプロイ（推奨）

### 1. Vercel CLI を入れる

```bash
npm install -g vercel
```

### 2. ディレクトリへ移動

```bash
cd resonance_product
```

### 3. デプロイ

```bash
vercel
```

初回は対話式で：

```text
? Set up and deploy "~/resonance_product"?  Y
? Which scope do you want to deploy to?     （自分のアカウント）
? Link to existing project?                 N
? What's your project's name?               resonance
? In which directory is your code located?  ./
```

ビルドコマンド・出力ディレクトリは聞かれたらそのまま Enter（静的サイトなので不要）。

完了すると preview URL が出ます。

### 4. 本番デプロイ

```bash
vercel --prod
```

これで `https://resonance.vercel.app` （または取得した名前のドメイン）で公開されます。

## カスタムドメイン

Vercel ダッシュボードで `Domains` → 自前ドメインを追加 → DNS の CNAME を `cname.vercel-dns.com` へ向ける。HTTPS は Vercel が自動で発行。

## GitHub 連携（推奨：継続デプロイ）

```bash
# 親ディレクトリで Git 初期化（既にされていればスキップ）
git init
git add resonance_product
git commit -m "Resonance v1.0"

# GitHub にリポジトリ作成
gh repo create resonance --public --source=. --push
```

その後 Vercel ダッシュボードで `Add New Project` → GitHub リポジトリを選択 → `resonance_product` を Root Directory に指定。以降は `git push` するだけで自動デプロイされます。

`index.html` 中の `https://github.com/[your-name]/resonance` は GitHub のユーザー名に置き換えてください（`app.js` には不要、`index.html` の About タブのみ）。

## Pro 化（バックエンド経由 API 構成）

ユーザーに API キーを入れさせず、サーバ側でキーを保持する場合の構成：

### 構成

```text
resonance_product/
  index.html
  app.js              ← API 呼び出し先を /api/generate に変更
  patterns.js
  api/
    generate.js       ← Vercel Function (Anthropic API プロキシ)
  vercel.json         ← API ルートを追加
```

### api/generate.js のひな型

```javascript
// Vercel Functions（Node.js Runtime）
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { prompt, model = 'claude-sonnet-4-5', max_tokens = 2000, temperature = 0.9 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  // ここで認証・レート制限・課金チェックを入れる
  // 例: req.headers['authorization'] を検証

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,  // 環境変数から
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens,
      temperature,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!r.ok) {
    const err = await r.text();
    return res.status(r.status).json({ error: err });
  }
  const data = await r.json();
  res.status(200).json({ text: data.content[0].text });
}
```

### app.js の変更（diff のイメージ）

```javascript
async function callAnthropic(prompt) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      model: state.model,
      temperature: state.temperature,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('API エラー: ' + err);
  }
  const data = await res.json();
  return data.text;
}
```

### Vercel に環境変数を設定

```bash
vercel env add ANTHROPIC_API_KEY production
# プロンプトに sk-ant-... を入力
vercel --prod  # 反映させるため再デプロイ
```

## 課金ガード（Pro プラン化）

最低限：

- 認証（Clerk / Auth0 / Supabase Auth）
- ユーザーごとの使用回数カウント（Vercel KV / Upstash Redis）
- 無料枠超過時に Pro 誘導
- Stripe Checkout で課金 → webhook でユーザーに Pro フラグを付与
- `api/generate.js` で Pro フラグまたは無料枠残数をチェック

これは MVP には含まれていません。デプロイ後にユーザー反応を見てから実装すべき。

## ドメイン候補

```text
resonance.app          有料
resonance.tools        有料
resonance.studio       有料
useresonance.com       使いやすい
resonance-app.com      長め
```

無料で始めるなら `resonance.vercel.app` で十分。

## トラブルシューティング

### 「API キーが設定されていません」が出続ける

ブラウザの localStorage が拒否されている可能性。シークレットウィンドウや Brave/Safari の厳格設定では発生する。設定モーダルで API キーを入れた後、ページリロード。

### CORS エラーが出る

Anthropic API ブラウザ呼び出しは `anthropic-dangerous-direct-browser-access: true` ヘッダで許可されている。それでもエラーが出る場合は、API キー自体が無効か、ブラウザの拡張機能（広告ブロック等）が干渉している可能性。

### モバイルで下部ナビが他要素に被る

`index.html` の `.tab-panel` の `padding-bottom` が `100px` 確保してあるので、コンテンツが下部ナビに隠れることはないはず。隠れる場合は `app.js` で動的にスタイルを上書きしているコンポーネントがないか確認。

## デプロイ完了後にやること

```text
1. About タブの GitHub リンクを実際の URL に書き換え
2. Library の例文を自分のテイストで微調整（必要なら）
3. ブランドカラーを変えたい場合は :root の --accent を変更
4. OG image (Twitter/Slack でシェアされたときの画像) を public/og-image.png に追加
5. favicon.ico を public/ に追加
6. Plausible / Umami 等のプライバシー配慮型アナリティクス追加（任意）
7. SNS で公開告知
```
