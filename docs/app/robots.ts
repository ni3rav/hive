import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/.*"],
      },
    ],
    sitemap: "https://hivecms.online/sitemap.xml",
    host: "https://hivecms.online",
  };
}
