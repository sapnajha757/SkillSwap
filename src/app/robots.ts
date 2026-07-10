import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth"],
        // OS routes are behind auth — no value in indexing them
        disallow: ["/os/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
