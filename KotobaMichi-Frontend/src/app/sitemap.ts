import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/seo-config";

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://kotobamichi-api.012140.xyz/v1";

export const revalidate = 3600; // Refresh every hour

async function getPublicQuizzes() {
  try {
    const res = await fetch(`${API.replace(/\/$/, "")}/quizzes`, {
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
  const envSite = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSite && envSite.trim().length > 0) return envSite.replace(/\/$/, "");

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host && !host.includes("localhost")) {
      const proto = h.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // headers() might not be available during static export / SSG
  }

  return SITE_URL;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE = await resolveSiteUrl();
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE}/practice`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE}/words`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE}/quizzes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
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
