"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const emptyForm = { team_name: "", game: "", position: "", requirements: "", description: "", deadline: "", status: "open" };

export default function AdminTryoutsPage() {
  const [tryouts, setTryouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTryout, setEditingTryout] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchTryouts = async () => {
    const { data, error } = await supabase.from("Tryouts").select("*").order("deadline");
    if (error) toast.error("Could not retrieve recruitment data.");
    setTryouts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTryouts(); }, []);

  const resetForm = () => { setFormData(emptyForm); setEditingTryout(null); };
  const openEditDialog = (t: any) => { 
    setEditingTryout(t); 
    setFormData({ 
      team_name: t.team_name, 
      game: t.game, 
      position: t.position, 
      requirements: t.requirements || "", 
      description: t.description || "", 
      deadline: t.deadline?.slice(0, 10) || "", 
      status: t.status 
    }); 
    setDialogOpen(true); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = editingTryout ? await supabase.from("Tryouts").update(formData).eq("id", editingTryout.id) : await supabase.from("Tryouts").insert(formData);
    if (error) toast.error("Sync failed.");
    else { 
      toast.success(editingTryout ? "Recruitment directive updated." : "New recruitment slot initiated."); 
      setDialogOpen(false); 
      resetForm(); 
      fetchTryouts(); 
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("Tryouts").delete().eq("id", id);
    if (error) toast.error("Termination failed."); else { toast.success("Recruitment entry removed."); fetchTryouts(); }
  };

  const getStatusStyles = (status: string) => 
    status === "open" 
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[9px] uppercase tracking-wider rounded-sm border px-2 py-0.5" 
      : status === "closing_soon" 
        ? "bg-destructive/10 text-destructive border-destructive/20 font-mono text-[9px] uppercase tracking-wider rounded-sm border px-2 py-0.5 animate-pulse" 
        : "bg-void-950 text-void-400 border-border/80 font-mono text-[9px] uppercase tracking-wider rounded-sm border px-2 py-0.5";

  return (
    <div className="space-y-8 pb-16 text-foreground">
      {/* Top Monitor Dashboard */}
      <div className="relative p-6 md:p-8 rounded-xl bg-card/40 border border-border/80 overflow-hidden backdrop-blur-xs">
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 z-10">
          <div className="space-y-1.5">
            <h2 className="text-primary font-display font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary animate-pulse" /> Intake Coordination Module
            </h2>
            <p className="text-2xl font-display font-black uppercase tracking-wide text-white">
              Personnel <span className="text-void-400">Draft</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-void-400 font-mono text-[10px] uppercase tracking-wider">
                Open Positions: <span className="text-white font-bold font-sans">{tryouts.filter((t) => t.status !== "closed").length}</span>
              </p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-white text-void-950 hover:bg-void-200 h-12 px-6 rounded-lg font-display font-bold uppercase tracking-wide text-xs shadow-md transition-all">
                <Plus className="mr-2 h-4 w-4 stroke-[3]" /> Add Opening
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-xl border-border/80 bg-card text-card-foreground p-0 overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto outline-hidden">
              <div className="h-[3px] bg-primary w-full" />
              <div className="p-6 md:p-8 space-y-5">
                <DialogHeader>
                  <DialogTitle className="text-xl font-display font-bold uppercase tracking-wide text-white">
                    {editingTryout ? "Update" : "Create"} <span className="text-primary">Position</span>
                  </DialogTitle>
                  <DialogDescription className="font-mono uppercase text-[10px] tracking-wider text-void-400 mt-1">
                    Configure peripheral recruitment parameters
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Target Team</Label>
                      <Input className="rounded-lg bg-void-900/60 border-border h-11 text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" value={formData.team_name} onChange={(e) => setFormData({ ...formData, team_name: e.target.value })} placeholder="PRIME ALPHA" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Game</Label>
                      <Input className="rounded-lg bg-void-900/60 border-border h-11 text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" value={formData.game} onChange={(e) => setFormData({ ...formData, game: e.target.value })} placeholder="VALORANT" required />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Position / Role</Label>
                    <Input className="rounded-lg bg-void-900/60 border-border h-11 text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="IGL / Entry Fragger" required />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Requirements Matrix</Label>
                    <Textarea className="rounded-lg bg-void-900/60 border-border text-white text-sm font-medium focus-visible:ring-primary/40 focus-visible:border-primary min-h-[80px] placeholder:text-void-600 resize-none" placeholder="Specify rank requirements, age limits, regional bindings, etc..." value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Role Description</Label>
                    <Textarea className="rounded-lg bg-void-900/60 border-border text-white text-sm font-medium focus-visible:ring-primary/40 focus-visible:border-primary min-h-[80px] placeholder:text-void-600 resize-none" placeholder="Describe the expectations and playstyle strategy..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Closing Deadline</Label>
                      <Input type="date" className="rounded-lg bg-void-900/60 border-border h-11 text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Operational Status</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                        <SelectTrigger className="rounded-lg bg-void-900/60 border-border h-11 text-white text-sm font-medium focus:ring-primary/40 focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-void-950 text-white rounded-lg">
                          <SelectItem value="open" className="text-xs">Open</SelectItem>
                          <SelectItem value="closing_soon" className="text-xs">Closing Soon</SelectItem>
                          <SelectItem value="closed" className="text-xs">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold uppercase tracking-wider text-xs transition-colors mt-2">
                    {editingTryout ? "Commit Blueprint Updates" : "Deploy Recruitment Node"}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid Layout Container Area */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="aspect-video h-auto rounded-xl bg-card/20 border border-border/40 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {tryouts.map((t) => (
            <Card key={t.id} className="rounded-xl border border-border/80 shadow-xs bg-card/40 backdrop-blur-xs hover:border-void-700 transition-all relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-[3px] h-full ${t.status === "open" ? "bg-emerald-500" : t.status === "closing_soon" ? "bg-destructive" : "bg-void-600"}`} />
              
              <CardHeader className="pl-6 pr-6 pt-5 pb-3">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-base font-display font-bold uppercase tracking-wide text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {t.position}
                  </CardTitle>
                  <span className={getStatusStyles(t.status)}>{t.status === "closing_soon" ? "closing soon" : t.status}</span>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-void-400 pt-0.5">
                  {t.team_name} <span className="text-primary/70 mx-1.5">•</span> {t.game}
                </p>
              </CardHeader>
              
              <CardContent className="pl-6 pr-6 pb-5 flex flex-col justify-between">
                <p className="text-[11px] text-void-400 font-medium line-clamp-2 mb-4 min-h-[2.25rem] leading-relaxed">
                  {t.description || "No supplemental directive operational parameters cataloged."}
                </p>
                
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-void-400 tracking-wider mb-5 bg-void-900/40 w-fit px-2 py-0.5 rounded-sm border border-border/30">
                  <Calendar className="h-3 w-3 text-primary" />
                  <span>Deadline: {new Date(t.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                
                <div className="flex gap-2 border-t border-border/30 pt-4">
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg font-display font-bold uppercase text-[10px] tracking-wide border-border/80 bg-void-950/20 hover:bg-void-900 text-void-300 h-9 transition-colors" onClick={() => openEditDialog(t)}>
                    <Edit className="h-3 w-3 mr-1.5 text-void-500" /> Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg text-void-500 hover:text-destructive-foreground border-border/80 bg-void-950/20 hover:bg-destructive transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border-border/80 bg-card text-card-foreground max-w-sm p-0 overflow-hidden shadow-2xl outline-hidden">
                      <div className="h-[3px] bg-destructive w-full" />
                      <div className="p-5 md:p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg font-display font-bold uppercase tracking-wide text-white">
                            Purge Intake Opening?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-void-400 text-xs font-medium leading-relaxed mt-1.5">
                            This tactical action removes the opening for <span className="text-white font-semibold">{t.position}</span> immediately. Saved pipeline telemetry cannot be retrieved.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-5 gap-2">
                          <AlertDialogCancel className="rounded-lg font-display font-bold uppercase text-[10px] border-border/80 bg-void-950/20 text-void-300 hover:bg-void-900 h-9 mt-0">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive text-white hover:bg-destructive/90 rounded-lg font-display font-bold uppercase text-[10px] tracking-wide h-9 border-none">
                            Execute Purge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}