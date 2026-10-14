export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

export interface PointsBalance {
  guildId: string;
  userId: string;
  balance: number;
}

export interface PointsAdjustRequest {
  guildId: string;
  userId: string;
  amount: number;
  reason: string;
  idempotencyKey: string;
}

export interface TtsJobRequest {
  guildId: string;
  channelId: string;
  userId: string;
  text: string;
  speaker: number;
  idempotencyKey: string;
}

export const MAX_TTS_TEXT_LENGTH = 500;
