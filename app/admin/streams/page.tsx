"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink, Radio, Video, Layers, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AdminStreamsPage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [scrims, setScrims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", embed_url: "", thumbnail_url: "", scrim_id: "none", goLiveNow: true });
  const { user } = useAuth();

  const fetchStreams = async () => { 
    setLoading(true); 
    const { data } = await supabase.from("streams").select("*").order("created_at", { ascending: false }); 
    setStreams(data || []); 
    setLoading(false); 
  };

  useEffect(() => { 
    fetchStreams(); 
    supabase.from("scrims").select("id, title").then(({ data }) => setScrims(data || [])); 
  }, []);

  const handleCreateStream = async () => {
    if (!user) return;
    const { error } = await supabase.from("streams").insert([{
      title: formData.title, description: formData.description, embed_url: formData.embed_url || null, thumbnail_url: formData.thumbnail_url,
      status: formData.goLiveNow ? "live" : "scheduled", is_live: formData.goLiveNow, scrim_id: formData.scrim_id === "none" ? null : formData.scrim_id,
      created_by: user.id, streamer_name: user.email?.split("@")[0] || "Prime Admin",
    }]);
    if (error) toast.error(error.message);
    else { 
      toast.success("Stream configured successfully."); 
      fetchStreams(); 
      setDialogOpen(false); 
      setFormData({ title: "", description: "", embed_url: "", thumbnail_url: "", scrim_id: "none", goLiveNow: true }); 
    }
  };

  const deleteStream = async (id: string) => { 
    await supabase.from("streams").delete().eq("id", id); 
    toast.success("Stream removed."); 
    fetchStreams(); 
  };
  
  const toggleLive = async (id: string, current: boolean) => { 
    await supabase.from("streams").update({ is_live: !current, status: !current ? "live" : "scheduled" }).eq("id", id); 
    fetchStreams(); 
  };

  return (
    <div className="space-y-8 pb-16 text-foreground">
      {/* Top Monitor Dashboard */}
      <div className="relative p-6 md:p-8 rounded-xl bg-card/40 border border-border/80 overflow-hidden backdrop-blur-xs">
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 z-10">
          <div className="space-y-1.5">
            <h2 className="text-primary font-display font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
              <Radio className="h-3 w-3 animate-pulse text-primary" /> Live Transmission Hub
            </h2>
            <p className="text-2xl font-display font-black uppercase tracking-wide text-white">
              Broadcast <span className="text-void-400">Signals</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-void-400 font-mono text-[10px] uppercase tracking-wider">
                Active Uplinks: <span className="text-white font-bold font-sans">{streams.filter((s) => s.is_live).length}</span>
              </p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-white text-void-950 hover:bg-void-200 h-12 px-6 rounded-lg font-display font-bold uppercase tracking-wide text-xs shadow-md transition-all">
                <Plus className="mr-2 h-4 w-4 stroke-[3]" /> Deploy Stream
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl border-border/80 p-0 max-w-xl bg-card text-card-foreground shadow-2xl max-h-[92vh] overflow-y-auto outline-hidden">
              <div className="h-[3px] bg-primary w-full" />
              <div className="p-6 md:p-8 space-y-5">
                <DialogHeader>
                  <DialogTitle className="text-xl font-display font-bold uppercase tracking-wide text-white">
                    Initialize <span className="text-primary">Feed Link</span>
                  </DialogTitle>
                  <DialogDescription className="font-mono uppercase text-[10px] tracking-wider text-void-400 mt-1">
                    Configure peripheral satellite routing payload
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Transmission Title</Label>
                    <Input className="rounded-lg bg-void-900/60 border-border h-11 text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:font-normal placeholder:text-void-600" placeholder="e.g. VCT CHALLENGERS - GRAND FINALS" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Description Summary</Label>
                    <Textarea className="rounded-lg bg-void-900/60 border-border text-white text-sm font-medium focus-visible:ring-primary/40 focus-visible:border-primary min-h-[90px] placeholder:text-void-600 resize-none" placeholder="Provide raw configuration guidelines or summary text for this broadcast pipeline..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Embed URL (YouTube / Twitch)</Label>
                    <Input className="rounded-lg bg-void-900/60 border-border h-11 text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:font-normal placeholder:text-void-600" placeholder="https://youtube.com/watch?v=..." value={formData.embed_url} onChange={(e) => setFormData({ ...formData, embed_url: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Thumbnail Link Asset</Label>
                    <Input className="rounded-lg bg-void-900/60 border-border h-11 text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:font-normal placeholder:text-void-600" placeholder="https://images.unsplash.com/..." value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Linked Scrim Module</Label>
                    <Select value={formData.scrim_id} onValueChange={(v) => setFormData({ ...formData, scrim_id: v })}>
                      <SelectTrigger className="rounded-lg bg-void-900/60 border-border h-11 text-white text-sm font-medium focus:ring-primary/40 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-void-950 text-white rounded-lg">
                        <SelectItem value="none" className="text-xs">Standalone Stream (None)</SelectItem>
                        {scrims.map((s) => <SelectItem key={s.id} value={s.id} className="text-xs">{s.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-void-900/40 border border-border/80 rounded-xl mt-2">
                    <div className="space-y-0.5">
                      <Label className="font-display font-bold uppercase text-xs text-white tracking-wide">Hot-Swap Broadcast Live</Label>
                      <p className="text-[10px] text-void-400 font-mono uppercase tracking-wide">Route signal parameters to live array immediately on save.</p>
                    </div>
                    <Switch checked={formData.goLiveNow} onCheckedChange={(v) => setFormData({ ...formData, goLiveNow: v })} className="data-[state=checked]:bg-primary" />
                  </div>
                  
                  <Button onClick={handleCreateStream} className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold uppercase tracking-wider text-xs transition-colors mt-2">
                    Establish Uplink Matrix
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid Content / Loader Layout */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="aspect-video h-auto rounded-xl bg-card/20 border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : streams.length === 0 ? (
        <Card className="rounded-xl border-dashed border border-border/80 bg-card/20 backdrop-blur-xs">
          <CardContent className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Video className="h-8 w-8 text-void-500 stroke-[1.5]" />
            <div className="space-y-0.5">
              <p className="text-white font-display font-bold uppercase tracking-wide text-xs">No Matrix Transmissions</p>
              <p className="text-void-400 font-mono uppercase text-[9px] tracking-wider">All systemic broadcast pathways are offline or unconfigured</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {streams.map((stream) => (
            <Card key={stream.id} className="rounded-xl border border-border/80 shadow-xs overflow-hidden bg-card/40 backdrop-blur-xs group hover:border-void-700 transition-all relative">
              <div className={`absolute top-0 left-0 w-[3px] h-full ${stream.is_live ? 'bg-destructive' : 'bg-void-600'}`} />
              <CardContent className="p-0 flex flex-col h-full">
                {/* Media Presentation Layer */}
                <div className="aspect-video bg-void-950 relative flex items-center justify-center overflow-hidden border-b border-border/40">
                  {stream.thumbnail_url ? (
                    <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" />
                  ) : (
                    <Video className="h-8 w-8 text-void-800" />
                  )}
                  
                  {/* Status Indicator Badge */}
                  <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                    {stream.is_live ? (
                      <Badge className="bg-destructive hover:bg-destructive text-white font-display font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-sm shadow-md border-none flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-white animate-ping" /> LIVE
                      </Badge>
                    ) : (
                      <Badge className="bg-void-900 border border-border text-void-400 font-mono text-[9px] tracking-wider px-2 py-0.5 rounded-sm shadow-md">
                        STANDBY
                      </Badge>
                    )}

                    {stream.scrim_id && (
                      <Badge className="bg-primary/20 border border-primary/30 text-primary font-display font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-sm">
                        LINKED
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Configuration Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1 mb-6">
                    <h4 className="font-display font-bold uppercase text-base tracking-wide text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {stream.title}
                    </h4>
                    <p className="text-[11px] text-void-400 font-medium line-clamp-2 min-h-[2rem] leading-relaxed">
                      {stream.description || "No specific broadcast parameters provided."}
                    </p>
                  </div>
                  
                  {/* Action Matrix Panel */}
                  <div className="flex gap-2 border-t border-border/30 pt-4 items-center">
                    <Button size="sm" variant="outline" className={`rounded-lg flex-1 font-display font-bold uppercase text-[10px] tracking-wide border-border/80 h-9 transition-all ${stream.is_live ? 'bg-void-950/40 text-void-300 hover:bg-void-900' : 'bg-white text-void-950 hover:bg-void-200 border-none shadow-xs'}`} onClick={() => toggleLive(stream.id, stream.is_live)}>
                      {stream.is_live ? "Shutdown Feed" : "Ignite Uplink"}
                    </Button>
                    
                    {stream.embed_url && (
                      <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg border-border/80 bg-void-950/20 hover:bg-void-900 text-void-400 hover:text-white transition-colors" asChild>
                        <a href={stream.embed_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg text-void-500 hover:text-destructive-foreground border-border/80 bg-void-950/20 hover:bg-destructive transition-all" onClick={() => deleteStream(stream.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}