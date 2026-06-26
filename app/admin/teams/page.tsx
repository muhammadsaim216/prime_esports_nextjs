"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Search, CheckCircle2, XCircle, Inbox, ShieldCheck, Trash, Trophy, Smartphone, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appsDialogOpen, setAppsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    game: "", 
    category: "", 
    logo: "🎮", 
    description: "",
    is_open_for_applications: true 
  });

  const fetchTeams = async () => {
    const { data, error } = await supabase.from("teams").select("*, players(id)").order("name");
    if (error) toast.error("Failed to fetch teams");
    else setTeams((data || []).map((t: any) => ({ ...t, player_count: t.players?.length || 0 })));
  };

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("roster_applications")
      .select("*, teams(name, game)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!error && data) setApplications(data);
  };

  const initializeData = async () => {
    setLoading(true);
    await Promise.all([fetchTeams(), fetchApplications()]);
    setLoading(false);
  };

  useEffect(() => { 
    initializeData(); 
  }, []);

  const resetForm = () => { 
    setFormData({ name: "", game: "", category: "", logo: "🎮", description: "", is_open_for_applications: true }); 
    setEditingTeam(null); 
  };
  
  const openEditDialog = (team: any) => { 
    setEditingTeam(team); 
    setFormData({ 
      name: team.name, 
      game: team.game, 
      category: team.category, 
      logo: team.logo, 
      description: team.description || "",
      is_open_for_applications: team.is_open_for_applications ?? true
    }); 
    setDialogOpen(true); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicit token validation checkpoint before letting mutate pipeline fire
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      toast.error("Security violation: Session expired. Please sign in again.");
      return;
    }
    
    if (editingTeam) {
      // Direct optimistic state update execution to combat delayed RLS socket feedback
      // NOTE: .select() is required here — without it, Supabase/PostgREST returns
      // a "successful" response even when RLS silently blocks the update (0 rows
      // affected is not treated as an error by Postgres). We must check the
      // returned rows ourselves to detect that case.
      const { data, error } = await supabase
        .from("teams")
        .update(formData)
        .eq("id", editingTeam.id)
        .select();
      
      if (error) {
        toast.error(`Could not sync team data: ${error.message}`);
      } else if (!data || data.length === 0) {
        toast.error("Update blocked: no rows matched. This usually means your role doesn't satisfy the RLS policy for this table.");
      } else { 
        toast.success("Team registry updated."); 
        setDialogOpen(false); 
        resetForm(); 
        await fetchTeams(); 
      }
    } else {
      const { data, error } = await supabase
        .from("teams")
        .insert(formData)
        .select();
      if (error) {
        toast.error(`Could not sync team data: ${error.message}`);
      } else if (!data || data.length === 0) {
        toast.error("Insert blocked: no rows returned. Check the RLS insert policy for this table.");
      } else { 
        toast.success("New team added to roster."); 
        setDialogOpen(false); 
        resetForm(); 
        await fetchTeams(); 
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Session missing. Re-authentication required.");
      return;
    }

    // .select() lets us confirm a row was actually deleted instead of trusting
    // a "no error" response, which RLS can return even when 0 rows were removed.
    const { data, error } = await supabase
      .from("teams")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      toast.error("Termination sequence failed.");
    } else if (!data || data.length === 0) {
      toast.error("Delete blocked: no rows matched. Check the RLS delete policy for this table.");
    } else {
      toast.success("Team removed from database.");
      fetchTeams();
    }
  };

  const handleAcceptApplication = async (app: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Entry sequence aborted.");
        return;
      }

      // 1. Insert applicant as an official player on the targeted roster team
      const { error: playerError } = await supabase.from("players").insert([{
        team_id: app.team_id,
        name: app.full_name,
        role: app.role,
        rank: app.pubg_rank || "Operator"
      }]);
      if (playerError) throw playerError;

      // 2. Update application workflow pipeline flag status to 'approved'
      const { data: updateData, error: updateError } = await supabase
        .from("roster_applications")
        .update({ status: "approved" })
        .eq("id", app.id)
        .select();
      if (updateError) throw updateError;
      if (!updateData || updateData.length === 0) {
        throw new Error("Status update blocked by RLS policy (0 rows matched).");
      }
      
      toast.success(`${app.full_name} inducted into roster blueprint successfully.`);
      fetchTeams();
      fetchApplications();
    } catch (err) {
      toast.error("Failed to execute clearance onboarding sequence.");
    }
  };

  const handleRejectApplication = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Action rejected: Login verification required.");
      return;
    }

    const { data, error } = await supabase
      .from("roster_applications")
      .update({ status: "rejected" })
      .eq("id", id)
      .select();

    if (error) {
      toast.error("Rejection operation failed.");
    } else if (!data || data.length === 0) {
      toast.error("Rejection blocked: no rows matched. Check the RLS update policy for this table.");
    } else {
      toast.success("Application flagged as rejected.");
      fetchApplications();
    }
  };

  const filteredTeams = teams.filter((team) => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    team.game.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 text-foreground">
      {/* Action Header Panel */}
      <div className="border-b border-border/40 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-xl uppercase tracking-wider text-white">Roster Management</h1>
          <p className="text-[10px] font-mono text-void-400 uppercase tracking-widest mt-0.5">Configure systemic rosters, divisions, and active echelons</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center flex-wrap gap-3">
          {/* Quick Search Utility Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-void-500" />
            <Input 
              type="text" 
              placeholder="Filter roster system..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-lg bg-void-900/40 border-border text-xs text-white focus-visible:ring-primary/30"
            />
          </div>

          {/* Roster Applications Intake Modal Component */}
          <Dialog open={appsDialogOpen} onOpenChange={setAppsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-9 px-3.5 rounded-lg border-void-700/60 bg-void-900/20 text-void-300 hover:text-white text-[11px] font-mono uppercase tracking-wider relative shrink-0">
                <Inbox className="mr-1.5 h-3.5 w-3.5" /> Inbox
                {applications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-primary text-void-950 font-bold text-[9px] flex items-center justify-center animate-pulse">
                    {applications.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-xl border-border/80 bg-card text-card-foreground p-0 overflow-hidden shadow-2xl outline-hidden">
              <div className="h-[3px] bg-primary w-full" />
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg font-display font-bold uppercase tracking-wide text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Recruitment Intake Pipeline
                  </DialogTitle>
                  <DialogDescription className="font-mono uppercase text-[9px] tracking-wider text-void-400 mt-0.5">
                    Process pending deployment logs for division induction
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {applications.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border/30 rounded-xl text-void-500 font-mono text-[10px] uppercase">
                      Queue clear. No pending transmissions found.
                    </div>
                  ) : (
                    applications.map((app) => (
                      <div key={app.id} className="bg-void-950/80 rounded-xl border border-border/40 p-4 space-y-3 relative overflow-hidden">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-display font-bold text-white uppercase">{app.full_name}</span>
                              <Badge className="bg-primary/10 text-primary border border-primary/20 text-[8px] font-mono px-1.5 py-0 rounded-xs">
                                {app.role}
                              </Badge>
                            </div>
                            <p className="text-[9px] font-mono text-void-400 mt-1 uppercase">
                              Target // <span className="text-void-300 font-bold">{app.teams?.name || "Unknown"}</span> ({app.teams?.game})
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-void-400 bg-void-900 px-2 py-0.5 rounded border border-border/30">
                            <Disc className="h-3 w-3 text-indigo-400" /> {app.discord_tag}
                          </div>
                        </div>

                        {/* PUBG Stats Block Meta Expansion */}
                        {(app.pubg_uid || app.pubg_rank || app.pubg_kd) && (
                          <div className="grid grid-cols-3 gap-2 bg-void-900/40 p-2 rounded-lg border border-border/20 text-[9px] font-mono">
                            <div className="text-void-400 uppercase">UID: <span className="text-white font-medium">{app.pubg_uid || "N/A"}</span></div>
                            <div className="text-void-400 uppercase flex items-center gap-1"><Trophy className="h-2.5 w-2.5 text-primary" /> {app.pubg_rank || "N/A"}</div>
                            <div className="text-void-400 uppercase">K/D: <span className="text-emerald-400 font-bold">{app.pubg_kd || "N/A"}</span></div>
                            {app.pubg_device && (
                              <div className="col-span-3 text-void-400 uppercase flex items-center gap-1 border-t border-border/10 pt-1 mt-1">
                                <Smartphone className="h-2.5 w-2.5 text-void-500" /> {app.pubg_device}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-[11px] text-void-300 leading-relaxed bg-void-900/20 p-2.5 rounded-lg border border-border/10 italic">
                          "{app.message}"
                        </div>

                        {app.pubg_exp && (
                          <div className="text-[10px] text-void-400 font-mono">
                            <span className="text-void-500 uppercase font-bold block mb-0.5">Combat Experience:</span>
                            {app.pubg_exp}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <Button onClick={() => handleAcceptApplication(app)} size="sm" className="flex-1 h-8 rounded-lg bg-emerald-500 text-void-950 hover:bg-emerald-400 font-display font-bold uppercase text-[10px] tracking-wide">
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Approve Entry
                          </Button>
                          <Button onClick={() => handleRejectApplication(app.id)} size="sm" variant="ghost" className="h-8 w-8 rounded-lg bg-void-900 hover:bg-destructive text-void-400 hover:text-white p-0 shrink-0 transition-colors border border-border/40">
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="h-9 px-4 rounded-lg bg-white text-void-950 hover:bg-void-200 font-display font-bold uppercase tracking-wide text-[11px] shadow-sm shrink-0">
                <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[3]" /> Register
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-xl border-border/80 bg-card text-card-foreground p-0 overflow-hidden shadow-2xl outline-hidden">
              <div className="h-[3px] bg-primary w-full" />
              <div className="p-6 md:p-8">
                <DialogHeader>
                  <DialogTitle className="text-xl font-display font-bold uppercase tracking-wide text-white">
                    {editingTeam ? "Modify" : "Initialize"} <span className="text-primary">Roster Group</span>
                  </DialogTitle>
                  <DialogDescription className="font-mono uppercase text-[10px] tracking-wider text-void-400 mt-1">
                    Adjust peripheral parameters for database placement
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Team / Division Name</Label>
                    <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-lg bg-void-900/60 border-border text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" placeholder="e.g. PRIME VALORANT" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Target Game Title</Label>
                      <Input required value={formData.game} onChange={(e) => setFormData({ ...formData, game: e.target.value })} className="h-11 rounded-lg bg-void-900/60 border-border text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" placeholder="e.g. Valorant" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Roster Category Designation</Label>
                      <Input required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="h-11 rounded-lg bg-void-900/60 border-border text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" placeholder="e.g. Pro Roster" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Roster Badge Vector (Emoji)</Label>
                    <Input value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} className="h-11 rounded-lg bg-void-900/60 border-border text-white font-bold text-center text-lg focus-visible:ring-primary/40 focus-visible:border-primary" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="uppercase font-mono text-[10px] tracking-wider text-void-400">Roster Overview Documentation</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-lg bg-void-900/60 border-border text-white text-sm font-medium focus-visible:ring-primary/40 focus-visible:border-primary min-h-[90px] placeholder:text-void-600 resize-none" placeholder="Enter divisional highlights, track parameters, or achievement timelines..." />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-void-900/30">
                    <div className="space-y-0.5">
                      <Label className="uppercase font-mono text-[10px] tracking-wider text-white">Recruitment Pipeline</Label>
                      <p className="text-[9px] font-mono text-void-400 uppercase">Allow public users to apply for this division</p>
                    </div>
                    <Switch 
                      checked={formData.is_open_for_applications} 
                      onCheckedChange={(checked) => setFormData({ ...formData, is_open_for_applications: checked })}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold uppercase tracking-wider text-xs transition-colors mt-2">
                    {editingTeam ? "Commit Structural Updates" : "Deploy Roster Payload"}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Optimized Slim Grid Area Container */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl bg-card/20 border border-border/40 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="rounded-xl border border-border/80 shadow-xs bg-card/40 backdrop-blur-xs hover:border-void-700 transition-all relative overflow-hidden group flex flex-col justify-between h-36">
              <div className="absolute top-0 left-0 w-[3px] h-full bg-primary" />
              
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-void-900/80 border border-border/80 flex items-center justify-center text-lg shadow-inner shrink-0">
                      {team.logo}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-display font-bold uppercase tracking-wide text-white truncate group-hover:text-primary transition-colors">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge className="bg-void-950 border border-border/60 text-void-400 font-mono text-[8px] tracking-wider px-1 py-0 rounded-xs">
                          {team.game}
                        </Badge>
                        {team.is_open_for_applications ?? true ? (
                          <span className="inline-flex items-center text-[8px] font-mono text-emerald-400 gap-0.5 uppercase tracking-tighter">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[8px] font-mono text-void-500 gap-0.5 uppercase tracking-tighter">
                            <XCircle className="h-2.5 w-2.5" /> Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[8px] font-mono uppercase text-void-400 tracking-wider bg-void-900/50 px-1.5 py-0.5 rounded border border-border/30 shrink-0">
                    <Users className="h-2.5 w-2.5 text-primary" />
                    <span>{team.player_count} OP</span>
                  </div>
                </div>

                <p className="text-[10px] text-void-400 font-medium line-clamp-1 leading-relaxed my-2">
                  {team.description || "No customized blueprint indexed."}
                </p>
                
                <div className="flex gap-2 border-t border-border/20 pt-2.5 mt-auto">
                  <Button size="sm" variant="ghost" className="flex-1 rounded-md font-display font-bold uppercase text-[9px] tracking-wide bg-void-950/40 hover:bg-void-900 text-void-300 h-7 transition-colors px-2" onClick={() => openEditDialog(team)}>
                    <Edit className="h-2.5 w-2.5 mr-1 text-void-400" /> Modify
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md text-void-500 hover:text-white bg-void-950/40 hover:bg-destructive transition-all shrink-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border-border/80 bg-card text-card-foreground max-w-sm p-0 overflow-hidden shadow-2xl outline-hidden">
                      <div className="h-[3px] bg-destructive w-full" />
                      <div className="p-5 md:p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg font-display font-bold uppercase tracking-wide text-white">
                            Purge Division Node?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-void-400 text-xs font-medium leading-relaxed mt-1.5">
                            This structural mutation removes <span className="text-white font-semibold">{team.name}</span> instantly.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-5 gap-2">
                          <AlertDialogCancel className="rounded-lg font-display font-bold uppercase text-[10px] border-border/80 bg-void-950/20 text-void-300 hover:bg-void-900 h-9 mt-0">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(team.id)} className="bg-destructive text-white hover:bg-destructive/90 rounded-lg font-display font-bold uppercase text-[10px] tracking-wide h-9 border-none">
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
      
      {filteredTeams.length === 0 && !loading && (
        <div className="text-center py-12 border border-dashed border-border/40 rounded-xl bg-void-950/10">
          <p className="font-mono text-xs uppercase text-void-500 tracking-wider">No active teams match query metrics</p>
        </div>
      )}
    </div>
  );
}