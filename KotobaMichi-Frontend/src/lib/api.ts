// src/lib/api.ts
import axios, { type AxiosRequestConfig } from "axios";
import { getRetryAfterFromHeaders } from "./rate-limit";
import type { ApiUser } from "@/types/api";

// Prefer runtime-injected env (window.__ENV__), then Next public env (process.env.*), then default
declare global {
  interface Window {
    __ENV__?: Record<string, string | undefined>;
  }
}
function resolveBaseURL() {
  const runtimeApiUrl =
    typeof window !== "undefined"
      ? window.__ENV__?.NEXT_PUBLIC_API_URL
      : undefined;
  // On the server (SSR), prefer process.env at runtime to support Docker env injection
  const serverApiUrl =
    typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined;
  const rawBase =
    runtimeApiUrl ??
    serverApiUrl ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";
  // normalize: remove trailing slashes
  const trimmed = rawBase.replace(/\/+$/, "");
  // ensure we only have a single /v1 suffix regardless of env formatting
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
});

// In case window.__ENV__ loads after this module, recompute baseURL per request
api.interceptors.request.use((cfg) => {
  const computed = resolveBaseURL();
  if (!cfg.baseURL || cfg.baseURL !== computed) {
    cfg.baseURL = computed;
  }
  return cfg;
});

type AuthHandlers = {
  onRefreshSuccess?: (user: ApiUser) => void;
  onUnauthenticated?: () => void;
};

let authHandlers: AuthHandlers = {};
export function setAuthHandlers(handlers: AuthHandlers) {
  authHandlers = handlers;
}

// Prevent refresh storms
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
async function refreshSession() {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = api
    .post("/auth/refresh")
    .then((refreshRes) => {
      const user = (refreshRes.data as { user?: ApiUser }).user;
      if (user && authHandlers.onRefreshSuccess)
        authHandlers.onRefreshSuccess(user);
    })
    .catch((err) => {
      if (authHandlers.onUnauthenticated) authHandlers.onUnauthenticated();
      throw err;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
}

// Response interceptor: on 401, attempt refresh once, then retry original
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config as
      | (AxiosRequestConfig & { _retry?: boolean; _retry429?: boolean })
      | undefined;
    const url = (original?.url ?? "") as string;
    // If the refresh request itself failed with 401, don't try to refresh again
    if (status === 401 && url.includes("/auth/refresh")) {
      if (authHandlers.onUnauthenticated) authHandlers.onUnauthenticated();
      return Promise.reject(error);
    }
    if (status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        await refreshSession();
        return api.request(original);
      } catch {
        // refreshSession() already calls authHandlers.onUnauthenticated() on failure.
        // Do not call it again here to avoid double-firing logout/toast flows.
      }
    }
    // On 429, for idempotent GETs, optionally retry once after Retry-After seconds (if provided and small)
    if (
      status === 429 &&
      original &&
      original.method?.toUpperCase() === "GET" &&
      !original._retry429
    ) {
      const retryAfter = getRetryAfterFromHeaders(error?.response?.headers);
      const waitMs = retryAfter != null ? retryAfter * 1000 : null;
      if (waitMs != null && waitMs <= 10_000) {
        original._retry429 = true;
        await new Promise((r) => setTimeout(r, waitMs));
        return api.request(original);
      }
    }
    return Promise.reject(error);
  }
);

export type ApiError = {
  message?: string;
  status?: number;
};

export function getApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as { message?: string } | undefined;
    const message = data?.message ?? err.message;
    return { status, message };
  }
  return { message: "Unknown error" };
}

// CSV Import helpers
export async function uploadCsv(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/words/import/upload", form);
  return res.data as import("@/types/api").CsvImportResponse;
}

export async function fetchImportStats() {
  const res = await api.get("/words/import/stats");
  return res.data as import("@/types/api").ImportStats;
}

export async function clearAllWords() {
  const res = await api.delete("/words/import/clear-all");
  return res.data as import("@/types/api").ClearAllWordsResponse;
}
