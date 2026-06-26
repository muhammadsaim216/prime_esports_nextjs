"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

export default function BlogsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    const fetchPosts = async () => {
      // Updated targeted table schema from 'news' to 'blogs'
      const { data } = await supabase.from("blogs").select("*");
      if (data) {
        setPosts(data);
        setCategories(["All", ...Array.from(new Set(data.map((p: any) => p.category).filter(Boolean))) as string[]]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filtered = selectedCategory === "All" ? posts : posts.filter((p) => p.category === selectedCategory);

  return (
    <div className="text-foreground bg-background min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative bg-void-950 pt-40 pb-24 border-b border-border overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />

        <div className="container relative z-10 text-center px-4 mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 bg-void-900 border border-border px-4 py-1.5 rounded-full shadow-sm">
            <BookOpen size={14} className="text-primary" />
            <span className="font-mono text-[10px] font-medium text-void-300">Intelligence Feed</span>
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-semibold tracking-tight text-white leading-none selection:bg-primary selection:text-primary-foreground">
            Latest <span className="text-neon">News</span>
          </h1>
        </div>
      </section>

      {/* Categories Filter Bar */}
      <section className="py-4 bg-void-950/80 backdrop-blur-md border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button 
              key={cat} 
              variant="ghost" 
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl font-sans font-medium text-[11px] h-9 px-5 transition-all border ${
                selectedCategory === cat 
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10" 
                  : "bg-void-900 text-void-300 border-border/40 hover:border-primary/40 hover:bg-void-900/80 hover:text-white"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="py-16 bg-void-950/20">
        <div className="container max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                  <Skeleton className="aspect-video w-full rounded-xl bg-muted" />
                  <div className="flex gap-3"><Skeleton className="h-5 w-16 bg-muted" /><Skeleton className="h-5 w-24 bg-muted" /></div>
                  <Skeleton className="h-7 w-5/6 bg-muted rounded-lg" />
                  <Skeleton className="h-12 w-full bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-sm">
              <p className="text-muted-foreground font-sans font-medium text-sm">
                No dispatches found in this sector.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <article 
                  key={post.id} 
                  className="bg-card border border-border rounded-2xl group hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-void-950/10 overflow-hidden flex flex-col relative"
                >
                  {post.image_url && (
                    <div className="aspect-video overflow-hidden border-b border-border bg-muted relative">
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <Badge className="bg-void-900 text-white font-sans text-[10px] font-medium rounded-lg border border-border/60 px-2.5 py-0.5">
                          {post.category}
                        </Badge>
                        <span className="text-[10px] font-sans font-medium text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-primary/70" />
                          {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h2 className="text-xl font-display font-semibold tracking-tight text-foreground leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      <p className="text-xs font-medium text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="border-t border-border/40 pt-4 mt-auto">
                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto font-sans font-medium text-[11px] text-primary hover:bg-transparent hover:text-foreground group/btn transition-colors" 
                        asChild
                      >
                        <Link href={`/blogs/${post.slug || post.id}`}>
                          Read Dispatch 
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}