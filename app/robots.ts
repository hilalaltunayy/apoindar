import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/search", "/providers/", "/categories", "/how-it-works", "/for-teachers", "/premium"],
      disallow: ["/dashboard", "/provider", "/admin", "/bookings", "/packages", "/book/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
