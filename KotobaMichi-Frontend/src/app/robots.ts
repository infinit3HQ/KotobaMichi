import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo-config";

function resolveSiteUrl(): string {
  const envSite = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSite && envSite.trim().length > 0) return envSite.replace(/\/$/, "");
  return SITE_URL.replace(/\/$/, "");
}

function resolveHost(siteUrl: string): string {
  try {
    return new URL(siteUrl).host;
  } catch {
    return siteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const SITE = resolveSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/practice", "/words", "/quizzes"],
        disallow: [
          "/auth/",
          "/dashboard",
          "/profile",
          "/results/",
          "/quizzes/create",
          "/reset-password",
          "/verify-email",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: resolveHost(SITE),
  };
}
