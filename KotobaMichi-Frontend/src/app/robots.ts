import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/seo-config";

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
    // headers() might not be available during static build
  }

  return SITE_URL;
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const SITE = await resolveSiteUrl();
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
    host: SITE,
  };
}
