"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, BookOpen, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

function BlogDetailClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      // Decode the URL parameters safely in case special characters are passed
      const cleanSlug = decodeURIComponent(slug);

      // First strategy: Attempt matching on the text column 'slug'
      let response = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", cleanSlug)
        .eq("is_published", true)
        .maybeSingle();

      // Second strategy: Fallback validation if cleanSlug looks like a UUID or ID match and no record came back yet
      if (!response.data) {
        const isUuidOrId = /^[0-9a-fA-F-]+$/.test(cleanSlug) || !isNaN(Number(cleanSlug));
        if (isUuidOrId) {
          const fallbackResponse = await supabase
            .from("blogs")
            .select("*")
            .eq("id", cleanSlug)
            .eq("is_published", true)
            .maybeSingle();

          if (fallbackResponse.data) {
            response = fallbackResponse;
          }
        }
      }

      setPost(response.data);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-24 max-w-3xl mx-auto space-y-8 px-4 bg-background">
        <Skeleton className="h-12 w-3/4 bg-muted rounded-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24 bg-muted rounded-lg" />
          <Skeleton className="h-6 w-32 bg-muted rounded-lg" />
        </div>
        <Skeleton className="h-96 w-full bg-muted rounded-2xl border border-border" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-full bg-muted rounded-lg" />
          <Skeleton className="h-5 w-5/6 bg-muted rounded-lg" />
          <Skeleton className="h-5 w-4/6 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-void-950 text-foreground px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="mx-auto h-16 w-16 bg-muted/30 border border-border rounded-xl flex items-center justify-center text-primary shadow-inner">
            <Terminal className="h-8 w-8" />
          </div>
          <p className="text-sm font-sans font-semibold text-muted-foreground">
            Dispatch Not Found
          </p>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl border-border font-sans font-semibold text-sm">
            <Link href="/blogs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-void-950/30 text-foreground">
      {/* Header Banner Section */}
      <section className="relative bg-void-950 pt-36 pb-24 border-b border-border overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />

        <div className="container max-w-4xl px-4 relative z-10 mx-auto">
          <Link 
            href="/blogs" 
            className="inline-flex items-center text-muted-foreground hover:text-primary font-sans font-medium text-[11px] mb-8 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Intel
          </Link>

          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <Badge className="bg-primary text-primary-foreground border-none text-[10px] font-sans font-semibold rounded-lg shadow-md shadow-primary/10">
              {post.category}
            </Badge>
            <span className="text-void-300 font-sans font-medium text-[11px] flex items-center gap-1.5 bg-void-900 border border-border/40 px-2.5 py-1 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-primary/80" /> 
              {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold tracking-tight text-white leading-tight max-w-3xl selection:bg-primary selection:text-primary-foreground">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container max-w-4xl py-16 px-4 mx-auto">
        {post.image_url && (
          <div className="mb-14 border border-border rounded-2xl overflow-hidden bg-card shadow-lg shadow-void-950/20 group">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full object-cover max-h-[520px] transform transition-transform duration-700 group-hover:scale-[1.02]" 
            />
          </div>
        )}

        <div className="max-w-none font-medium text-foreground leading-relaxed">
          {/* Excerpt Section */}
          {post.excerpt && (
            <div className="relative p-6 bg-card border border-border border-l-2 border-l-primary rounded-r-xl shadow-sm mb-10 overflow-hidden">
              <div className="absolute top-2 right-2 opacity-5 text-foreground pointer-events-none">
                <BookOpen size={48} />
              </div>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Core Content Block */}
          {post.content ? (
            <div className="space-y-6 text-sm font-sans font-medium text-muted-foreground whitespace-pre-wrap leading-relaxed bg-card border border-border p-8 sm:p-10 rounded-2xl shadow-sm">
              {post.content}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-muted/30 border border-border border-dashed rounded-2xl text-center">
              <Terminal className="h-5 w-5 text-primary/60 mb-2 animate-pulse" />
              <p className="text-muted-foreground font-sans font-medium text-sm">
                Full article content coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default BlogDetailClient;