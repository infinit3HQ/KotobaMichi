// src/lib/rate-limit.ts
import { getApiError } from "./api";

export type RateLimitInfo = {
  status?: number;
  retryAfterSeconds?: number | null;
  isDailyCap?: boolean;
  rawMessage?: string;
};

export function parseRateLimitMessage(message?: string | null): RateLimitInfo {
  if (!message)
    return {
      retryAfterSeconds: null,
      isDailyCap: false,
      rawMessage: message ?? undefined,
    };
  const waitMatch = message.match(/Please wait\s+(\d+)s/i);
  const seconds = waitMatch ? parseInt(waitMatch[1], 10) : null;
  const isDaily =
    /daily limit/i.test(message) || /try again later/i.test(message);
  return {
    retryAfterSeconds: Number.isFinite(seconds as number)
      ? (seconds as number)
      : null,
    isDailyCap: isDaily,
    rawMessage: message,
  };
}

export function extractRateLimitFromError(err: unknown): RateLimitInfo | null {
  const { status, message } = getApiError(err);
  if (status === 429) {
    return { status, ...parseRateLimitMessage(message) };
  }
  return null;
}

export function getRetryAfterFromHeaders(
  headers?: Record<string, unknown>
): number | null {
  if (!headers) return null;
  const ra = (headers["retry-after"] ?? headers["Retry-After"]) as
    | string
    | number
    | undefined;
  if (ra == null) return null;
  const n = typeof ra === "string" ? parseInt(ra, 10) : ra;
  return Number.isFinite(n as number) ? (n as number) : null;
}
