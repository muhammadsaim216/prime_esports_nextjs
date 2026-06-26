import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import BlogDetailClient from "./BlogDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // Changed targeted table collection from 'news' to 'blogs'
  const { data: post } = await supabase
    .from("blogs")
    .select("title, excerpt, image_url, category")
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .eq("is_published", true)
    .single();

  if (!post) {
    return { 
      title: "Article Not Found | Prime Esports" 
    };
  }

  return {
    title: `${post.title} | Prime Esports`,
    description: post.excerpt || `Read the latest from Prime Esports: ${post.title}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      images: post.image_url ? [{ url: post.image_url }] : undefined,
      type: "article",
    },
  };
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <BlogDetailClient params={params} />;
}