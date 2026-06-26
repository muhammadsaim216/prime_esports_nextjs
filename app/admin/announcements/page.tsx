"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Megaphone, Calendar } from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", content: "", is_published: false });

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Failed to load announcements");
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const openCreate = () => { setEditing(null); setFormData({ title: "", content: "", is_published: false }); setDialogOpen(true); };
  const openEdit = (ann: any) => { setEditing(ann); setFormData({ title: ann.title, content: ann.content, is_published: ann.is_published }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!formData.title || !formData.content) { toast.error("Title and content are required"); return; }
    if (editing) {
      const { error } = await supabase.from("announcements").update({ ...formData, updated_at: new Date().toISOString() }).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Announcement updated");
    } else {
      const { error } = await supabase.from("announcements").insert([formData]);
      if (error) toast.error(error.message); else toast.success("Announcement created");
    }
    setDialogOpen(false);
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Announcement deleted");
    fetchAnnouncements();
  };

  const togglePublish = async (ann: any) => {
    await supabase.from("announcements").update({ is_published: !ann.is_published }).eq("id", ann.id);
    fetchAnnouncements();
  };

  return (
    <>
      {/* Control Actions Header */}
      <div className="mb-8 flex justify-end">
        <Button 
          onClick={openCreate} 
          className="h-11 px-5 rounded-lg bg-neon text-primary-foreground font-display font-bold uppercase tracking-wider text-xs neon-glow transition-all duration-300 hover:shadow-neon-strong hover:opacity-90 border-none"
        >
          <Plus className="mr-2 h-4 w-4 stroke-[2.5px]" /> New Announcement
        </Button>
      </div>

      {/* Main Container / Content Logs */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-void-800/40 border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card className="rounded-xl border-dashed border border-void-700 bg-void-900/20 backdrop-blur-xs">
          <CardContent className="py-20 text-center flex flex-col items-center">
            <Megaphone className="h-10 w-10 text-void-600 mb-4 animate-pulse" />
            <p className="text-void-400 font-mono uppercase tracking-widest text-xs">
              No public broadcasts documented
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {announcements.map((ann) => (
            <Card key={ann.id} className="rounded-xl border border-border bg-card/20 backdrop-blur-sm text-card-foreground shadow-md transition-all duration-200 hover:border-void-700">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2.5">
                      <h4 className="text-lg font-display font-bold uppercase tracking-wide text-white">
                        {ann.title}
                      </h4>
                      <Badge className={cn(
                        "font-mono uppercase text-[9px] tracking-wide px-2.5 py-0.5 rounded border-none font-medium",
                        ann.is_published 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "bg-void-800 text-void-400 border border-border"
                      )}>
                        {ann.is_published ? "PUBLISHED" : "DRAFT"}
                      </Badge>
                    </div>
                    <p className="text-sm text-void-300 leading-relaxed max-w-4xl line-clamp-2">
                      {ann.content}
                    </p>
                    <p className="text-[10px] font-mono text-void-500 uppercase mt-4 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-void-400" /> {new Date(ann.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Action Cluster Trigger Engine */}
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-9 w-9 rounded-lg border-border bg-void-900/60 hover:bg-void-800 text-void-300 hover:text-white transition-all shadow-2xs" 
                      onClick={() => togglePublish(ann)}
                      title={ann.is_published ? "Unpublish Announcement" : "Publish Announcement"}
                    >
                      {ann.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-9 w-9 rounded-lg border-border bg-void-900/60 hover:bg-void-800 text-void-300 hover:text-white transition-all shadow-2xs" 
                      onClick={() => openEdit(ann)}
                      title="Edit Entry"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-9 w-9 rounded-lg border-border bg-void-900/60 text-void-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all shadow-2xs"
                          title="Delete Entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground max-w-md shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display font-bold uppercase tracking-wide text-white text-lg">
                            Terminate Announcement?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-void-400 text-sm font-normal">
                            This structural element will be purged permanently from production caches. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4 gap-2">
                          <AlertDialogCancel className="rounded-lg border border-border bg-void-900 text-void-300 hover:text-white hover:bg-void-800 text-xs font-display uppercase tracking-wide h-10 px-4">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(ann.id)} 
                            className="rounded-lg bg-destructive text-white hover:bg-destructive/90 text-xs font-display uppercase tracking-wide h-10 px-5 border-none"
                          >
                            Purge Element
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Configuration Console Overlay Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display font-bold uppercase tracking-wide text-white text-xl">
              {editing ? "Modify" : "Deploy"} Broadcast
            </DialogTitle>
            <DialogDescription className="text-void-400 text-xs font-mono uppercase tracking-wider mt-1">
              Publish critical infrastructure updates directly to client nodes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div>
              <Label className="font-mono uppercase text-[10px] tracking-wider text-void-400">
                Broadcast Title
              </Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className="h-11 rounded-lg mt-2 border-border bg-void-900 text-white focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600 font-display text-sm uppercase tracking-wide"
                placeholder="SYSTEM UPDATE PROTOCOL"
              />
            </div>
            
            <div>
              <Label className="font-mono uppercase text-[10px] tracking-wider text-void-400">
                Transmission Payload (Content)
              </Label>
              <Textarea 
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                className="min-h-[140px] rounded-lg mt-2 border-border bg-void-900 text-white focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600 text-sm leading-relaxed resize-none"
                placeholder="Enter details here..."
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-void-900/50 rounded-lg border border-border/80">
              <div className="flex flex-col">
                <Label className="font-display font-semibold uppercase tracking-wide text-xs text-white">
                  Immediate Deployment
                </Label>
                <span className="text-[9px] font-mono text-void-500 uppercase tracking-wider mt-0.5">
                  Bypass draft buffer configurations
                </span>
              </div>
              <Switch 
                checked={formData.is_published} 
                onCheckedChange={(v) => setFormData({ ...formData, is_published: v })} 
                className="data-[state=checked]:bg-primary" 
              />
            </div>
            
            <Button 
              onClick={handleSave} 
              className="w-full h-12 rounded-lg bg-neon text-primary-foreground font-display font-bold uppercase tracking-wider text-xs px-5 neon-glow transition-all duration-300 hover:shadow-neon-strong hover:opacity-90 mt-2 border-none"
            >
              Commit Data Structure
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}