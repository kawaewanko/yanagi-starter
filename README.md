# 🌙 Yanagi Starter — 夜凪 全体コードひな形

夜凪の設計資料をもとにした、TypeScript中心のモノレポ型スターターです。
実運用向け完成品ではなく、各Runtimeを起動・拡張するための最小構成です。

## 構成
- `apps/api` — Cloudflare Workers + Hono + D1
- `apps/bot` — Node.js + discord.js
- `apps/tts-worker` — Cloudflare Queue consumer の骨組み
- `apps/dashboard` — React + Vite の最小画面
- `packages/common` — 共有型・API契約
- `infra` — VOICEVOX / ローカル開発用設定
- `docs` — 実装・運用メモ

## 前提
- Node.js 20+
- npm 10+
- Cloudflare Wrangler
- Discord Bot token と Application ID
- Cloudflare D1 database
- VOICEVOX Engine（必要な場合）

## セットアップ
```bash
npm install
cp apps/bot/.env.example apps/bot/.env
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

ルートの `npm run dev:api`、`npm run dev:bot`、`npm run dev:dashboard` で個別起動できます。
Cloudflare D1 は `apps/api/wrangler.toml` の database_id を設定してから利用してください。

## 重要な未実装・要設定事項
- Discordの権限設定、OAuth、管理者認可
- 本番用の認証・認可、レート制限、監査ログ
- Queue producer / consumer とジョブ再試行・冪等性
- 本番DB migration、バックアップ、監視
- Cloudflare Workers とVPS間の安全な接続経路
- VOICEVOX音声のDiscord VC再生（Node側のVoice接続処理）
- 景品交換・抽選の業務ルールと不正対策

このひな形は「まず動く土台」です。トークンや秘密情報をGitにコミットしないでください。
