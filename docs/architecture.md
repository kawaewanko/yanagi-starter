# Architecture

- Discord Gateway接続は `apps/bot` が担当。
- APIと永続ポイントデータは `apps/api` + Cloudflare D1 が担当。
- `packages/common` はRuntime間の契約と型のみを保持。
- `apps/tts-worker` はQueue consumerの骨組み。音声生成・R2保存は未実装。
- DashboardはUIの土台。管理者認証・API連携は未実装。
- VOICEVOXは独立したEngineとして実行。

## セキュリティ境界
- APIトークンはローカル開発用の簡易認証。
- 本番では認証・認可、レート制限、監査、シークレット管理を必ず整備する。
- RedisとVOICEVOXのポートをインターネットへ直接公開しない。
