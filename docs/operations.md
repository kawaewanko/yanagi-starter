# Operations checklist

- [ ] Discord Bot tokenをSecretとして登録
- [ ] D1作成、database_id設定、migration適用
- [ ] APIの内部認証を本番向けに置換
- [ ] Cloudflare Queue / R2 / D1の権限と利用上限を確認
- [ ] VPSのSSH接続元制限とファイアウォール設定
- [ ] VOICEVOX APIを内部ネットワークに限定
- [ ] ログの保存期間・個人情報の扱いを決定
- [ ] バックアップと復元テスト
- [ ] ヘルスチェック・アラート・再起動ポリシー
- [ ] ポイント変更・抽選の監査ログと冪等性テスト
