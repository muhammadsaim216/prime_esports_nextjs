"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Newspaper, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const emptyForm = { title: "", slug: "", excerpt: "", content: "", category: "", image_url: "", is_published: false };

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to load news posts");
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openCreate = () => { setEditing(null); setFormData(emptyForm); setDialogOpen(true); };
  const openEdit = (post: any) => { setEditing(post); setFormData({ title: post.title, slug: post.slug || "", excerpt: post.excerpt || "", content: post.content || "", category: post.category || "", image_url: post.image_url || "", is_published: post.is_published }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!formData.title) { toast.error("Title is required"); return; }
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const payload = { ...formData, slug };
    const { error } = editing ? await supabase.from("news").update(payload).eq("id", editing.id) : await supabase.from("news").insert([payload]);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Post updated" : "Post created"); setDialogOpen(false); fetchPosts(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Post deleted"); fetchPosts(); }
  };

  const togglePublish = async (post: any) => { await supabase.from("news").update({ is_published: !post.is_published }).eq("id", post.id); fetchPosts(); };

  return (
    <div className="text-foreground">
      {/* Global Deployment Action Control Trigger */}
      <div className="mb-8 flex justify-end">
        <Button 
          onClick={openCreate} 
          className="h-11 px-6 rounded-lg bg-neon text-primary-foreground font-display font-bold uppercase tracking-wider text-xs neon-glow transition-all duration-300 hover:shadow-neon-strong hover:opacity-90 active:scale-[0.98] border-none"
        >
          <Plus className="mr-2 h-4 w-4 stroke-[2.5px]" /> New Article
        </Button>
      </div>

      {/* Primary Data Traffic Stream Container */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-border/50 bg-void-800/40 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="rounded-xl border-dashed border border-void-700 bg-void-900/20 backdrop-blur-xs">
          <CardContent className="py-20 text-center flex flex-col items-center justify-center">
            <Newspaper className="h-10 w-10 text-void-600 mb-4 animate-pulse" />
            <p className="text-void-400 font-mono uppercase tracking-widest text-[10px]">No articles published in network database</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="rounded-xl border border-border bg-card/20 backdrop-blur-sm text-card-foreground shadow-md overflow-hidden transition-all duration-200 hover:border-void-700">
              <CardContent className="p-6 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2.5">
                    <h4 className="text-base font-display font-bold uppercase tracking-wide text-white truncate max-w-[280px] sm:max-w-md">
                      {post.title}
                    </h4>
                    
                    <Badge variant={post.is_published ? "default" : "secondary"} className={post.is_published ? "bg-primary/10 text-primary border border-primary/20 font-mono uppercase text-[9px] tracking-wide font-medium px-2 py-0.5 rounded shadow-none" : "bg-void-800 text-void-400 border border-border font-mono uppercase text-[9px] tracking-wide font-medium px-2 py-0.5 rounded shadow-none"}>
                      {post.is_published ? "PUBLISHED" : "DRAFT"}
                    </Badge>
                    
                    {post.category && (
                      <Badge variant="outline" className="text-[9px] uppercase font-mono tracking-wide font-medium border-border text-void-400 bg-void-900/60 rounded px-2 py-0.5">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs font-medium text-void-300 line-clamp-2 mb-3.5 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <p className="text-[10px] font-mono text-void-500 uppercase flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-void-400" /> {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Secondary Contextual Node Operation Blocks */}
                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-9 w-9 rounded-md border border-border bg-void-900 text-void-400 hover:text-white hover:bg-void-800 transition-all duration-200 shadow-2xs" 
                    onClick={() => togglePublish(post)}
                    title={post.is_published ? "Revoke From Public Feed" : "Deploy to Public Feed"}
                  >
                    {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-9 w-9 rounded-md border border-border bg-void-900 text-void-400 hover:text-white hover:bg-void-800 transition-all duration-200 shadow-2xs" 
                    onClick={() => openEdit(post)}
                    title="Edit Payload Configuration"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-9 w-9 rounded-md border border-transparent bg-transparent text-void-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
                        title="Purge Document From System"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground max-w-md shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display font-bold uppercase tracking-wide text-white text-lg">
                          Purge News Entry?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-void-400 text-sm font-normal">
                          This operation will permanently delete the selected post data cache from the database stream. This action is final.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className="rounded-lg border border-border bg-void-900 text-void-300 hover:text-white hover:bg-void-800 text-xs font-display uppercase tracking-wide h-10 px-4">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(post.id)} 
                          className="rounded-lg bg-destructive text-white hover:bg-destructive/90 text-xs font-display uppercase tracking-wide h-10 px-5 border-none"
                        >
                          Confirm Purge
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Form Entry Configuration Terminal Dialogue */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-xl max-h-[85vh] overflow-y-auto border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground p-6 md:p-7 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold uppercase tracking-wide text-white text-lg">
              {editing ? "MODIFY" : "INITIALIZE"} CORE POST PAYLOAD
            </DialogTitle>
            <DialogDescription className="text-void-400 font-mono text-[10px] uppercase tracking-wider mt-1">
              Publish structured tactical information logs to public network blog channels.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="font-mono uppercase text-[10px] text-void-400 tracking-wider">ARTICLE HEADLINE TITLE</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className="h-11 rounded-lg border-border bg-void-900 text-white font-sans text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="font-mono uppercase text-[10px] text-void-400 tracking-wider">ROUTE SLUG STRING (OPTIONAL)</Label>
              <Input 
                value={formData.slug} 
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                placeholder="AUTO-GENERATED-FROM-TITLE-STRING" 
                className="h-11 rounded-lg border-border bg-void-900 text-white font-mono text-xs tracking-wide placeholder:font-mono placeholder:text-[10px] placeholder:tracking-wider placeholder:text-void-600 focus-visible:ring-primary/40 focus-visible:border-primary placeholder:uppercase" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="font-mono uppercase text-[10px] text-void-400 tracking-wider">SYSTEM REGISTRY CATEGORY</Label>
              <Input 
                value={formData.category} 
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                className="h-11 rounded-lg border-border bg-void-900 text-white font-sans text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="font-mono uppercase text-[10px] text-void-400 tracking-wider">COVER CONTENT IMAGE PATH URL</Label>
              <Input 
                value={formData.image_url} 
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                className="h-11 rounded-lg border-border bg-void-900 text-white font-mono text-xs tracking-wide focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="font-mono uppercase text-[10px] text-void-400 tracking-wider">SUMMARY EXCERPT SEGMENT</Label>
              <Textarea 
                value={formData.excerpt} 
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} 
                className="rounded-lg border-border bg-void-900 text-white font-sans text-sm leading-relaxed focus-visible:ring-primary/40 focus-visible:border-primary min-h-[65px] placeholder:text-void-600" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="font-mono uppercase text-[10px] text-void-400 tracking-wider">COMPLETE MARKDOWN BODY CONTENT</Label>
              <Textarea 
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                className="min-h-[140px] rounded-lg border-border bg-void-900 text-white font-sans text-sm leading-relaxed focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" 
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-void-900 border border-border/80 rounded-lg">
              <Label className="font-display font-bold uppercase text-[11px] tracking-wide text-void-200">IMMEDIATE LIVE PRODUCTION INGESTION</Label>
              <Switch checked={formData.is_published} onCheckedChange={(v) => setFormData({ ...formData, is_published: v })} />
            </div>
            
            <Button 
              onClick={handleSave} 
              className="w-full h-12 rounded-lg bg-neon text-primary-foreground font-display font-bold uppercase tracking-wider text-xs neon-glow transition-all duration-300 hover:shadow-neon-strong hover:opacity-90 border-none mt-2"
            >
              SAVE PAYLOAD DATA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}