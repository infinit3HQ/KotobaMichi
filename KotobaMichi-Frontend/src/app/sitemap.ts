import type { MetadataRoute } from "next";
import { headers } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1/";

export const revalidate = 3600; // refresh daily-ish

async function getPublicQuizzes() {
  try {
    const res = await fetch(`${API.replace(/\/$/, "")}/quizzes`, {
      // Public endpoint listing quizzes; adjust if your API differs
      next: { revalidate },
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) return [] as Array<{ id: string; updatedAt?: string }>;
    const data = (await res.json()) as Array<{
      id: string;
      updatedAt?: string;
    } & Record<string, unknown>>;
    return data;
  } catch {
    return [] as Array<{ id: string; updatedAt?: string }>;
  }
}

async function resolveSiteUrl(): Promise<string> {
  // Prefer explicit env when provided
  const envSite = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSite && envSite.trim().length > 0) return envSite.replace(/\/$/, "");

  // Fall back to incoming request headers (works behind reverse proxy)
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`.replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE = await resolveSiteUrl();
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/words`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/quizzes`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const quizzes = await getPublicQuizzes();
  const quizUrls: MetadataRoute.Sitemap = quizzes.map((q) => ({
    url: `${SITE}/quizzes/${q.id}`,
    lastModified: q.updatedAt ? new Date(q.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...base, ...quizUrls];
}
