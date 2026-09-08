import type { MetadataRoute } from "next";
import { headers } from "next/headers";

async function resolveSiteUrl(): Promise<string> {
  const envSite = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSite && envSite.trim().length > 0) return envSite.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`.replace(/\/$/, "");
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const SITE = await resolveSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/words", "/quizzes"],
        disallow: [
          "/auth/",
          "/dashboard",
          "/profile",
          "/results/",
          "/quizzes/create",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
