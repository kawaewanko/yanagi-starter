import { Hono } from "hono";
import { z } from "zod";
import type { PointsBalance } from "@yanagi/common";

type Bindings = {
  DB: D1Database;
  INTERNAL_API_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ ok: true, service: "yanagi-api" }));

// Starter用の簡易認証。公開運用ではOAuth/JWT等と適切な認可へ置き換えてください。
app.use("/internal/*", async (c, next) => {
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== c.env.INTERNAL_API_TOKEN) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, 401);
  }
  await next();
});

app.get("/internal/points/:guildId/:userId", async (c) => {
  const { guildId, userId } = c.req.param();
  const row = await c.env.DB.prepare(
    "SELECT guild_id, user_id, balance FROM points WHERE guild_id = ? AND user_id = ?"
  ).bind(guildId, userId).first<{ guild_id: string; user_id: string; balance: number }>();

  const result: PointsBalance = {
    guildId, userId, balance: row?.balance ?? 0
  };
  return c.json(result);
});

const adjustSchema = z.object({
  guildId: z.string().min(1).max(25),
  userId: z.string().min(1).max(25),
  amount: z.number().int().min(-100000).max(100000).refine((n) => n !== 0),
  reason: z.string().trim().min(1).max(200),
  idempotencyKey: z.string().trim().min(8).max(128)
});

app.post("/internal/points/adjust", async (c) => {
  const parsed = adjustSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: { code: "BAD_REQUEST", message: "Invalid request body" } }, 400);
  }
  const { guildId, userId, amount, reason, idempotencyKey } = parsed.data;
  const db = c.env.DB;

  // D1のバッチはトランザクションとして実行されます。
  // 先に冪等キーを挿入し、重複時に残高が二重更新されないようにします。
  const existing = await db.prepare(
    "SELECT id FROM point_transactions WHERE guild_id = ? AND user_id = ? AND idempotency_key = ?"
  ).bind(guildId, userId, idempotencyKey).first();
  if (existing) {
    const row = await db.prepare(
      "SELECT balance FROM points WHERE guild_id = ? AND user_id = ?"
    ).bind(guildId, userId).first<{ balance: number }>();
    return c.json({ ok: true, duplicate: true, balance: row?.balance ?? 0 });
  }

  const current = await db.prepare(
    "SELECT balance FROM points WHERE guild_id = ? AND user_id = ?"
  ).bind(guildId, userId).first<{ balance: number }>();
  const nextBalance = (current?.balance ?? 0) + amount;
  if (nextBalance < 0) {
    return c.json({ error: { code: "CONFLICT", message: "Insufficient points" } }, 409);
  }

  try {
    await db.batch([
      db.prepare(
        "INSERT INTO point_transactions (guild_id, user_id, amount, reason, idempotency_key) VALUES (?, ?, ?, ?, ?)"
      ).bind(guildId, userId, amount, reason, idempotencyKey),
      db.prepare(
        `INSERT INTO points (guild_id, user_id, balance, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(guild_id, user_id) DO UPDATE SET balance = excluded.balance, updated_at = CURRENT_TIMESTAMP`
      ).bind(guildId, userId, nextBalance)
    ]);
  } catch {
    // 同時リクエストで冪等キーが競合した場合など。必要なら再読込して詳細化する。
    return c.json({ error: { code: "CONFLICT", message: "Transaction conflict; retry safely" } }, 409);
  }
  return c.json({ ok: true, duplicate: false, balance: nextBalance });
});

app.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "Not found" } }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, 500);
});

export default app;
