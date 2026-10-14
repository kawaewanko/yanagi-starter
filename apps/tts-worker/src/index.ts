interface TtsJob {
  guildId: string;
  channelId: string;
  userId: string;
  text: string;
  speaker: number;
  idempotencyKey: string;
}

export default {
  async queue(batch: MessageBatch<TtsJob>, env: Record<string, unknown>): Promise<void> {
    for (const message of batch.messages) {
      const job = message.body;
      if (!job || typeof job.text !== "string" || job.text.length > 500) {
        message.ack();
        continue;
      }

      // TODO:
      // 1) VOICEVOX VPSへの認証付きリクエスト
      // 2) 音声生成とR2への保存
      // 3) Job状態更新・冪等性管理
      // Queue consumerはDiscord VCへ直接接続する場所ではありません。
      console.log("TTS job accepted", {
        idempotencyKey: job.idempotencyKey,
        guildId: job.guildId,
        speaker: job.speaker,
        textLength: job.text.length
      });
      message.ack();
    }
  }
};
