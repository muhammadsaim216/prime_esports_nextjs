import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/admin-setup", "/super-admin", "/dashboard", "/dashboard/"],
      },
    ],
    sitemap: "https://prime-esports.gg/sitemap.xml",
  };
}
