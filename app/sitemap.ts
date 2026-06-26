import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://prime-esports.gg";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/teams`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/scrims`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/tryouts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blogs`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/tos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cookie`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/signup`, changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    const [{ data: teams }, { data: posts }] = await Promise.all([
      supabase.from("teams").select("id, updated_at"),
      supabase.from("news").select("slug, id, updated_at").eq("is_published", true),
    ]);

    const teamRoutes: MetadataRoute.Sitemap = (teams || []).map((team) => ({
      url: `${BASE_URL}/teams/${team.id}`,
      lastModified: team.updated_at || undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const postRoutes: MetadataRoute.Sitemap = (posts || []).map((post) => ({
      url: `${BASE_URL}/blogs/${post.slug || post.id}`,
      lastModified: post.updated_at || undefined,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...teamRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
