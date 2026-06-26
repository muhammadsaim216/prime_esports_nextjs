"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  UserPlus, Check, X, ShieldPlus, Users, Trash2, Gamepad2, 
  Loader2, ClipboardList, LayoutGrid, ShieldAlert, ArrowRight, Sword 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminRostersPage() {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [activeRoster, setActiveRoster] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [newTeam, setNewTeam] = useState({ name: "", game: "" });
  const [newPlayer, setNewPlayer] = useState({ name: "", role: "", team_id: "", uid: "" });
  
  // New States for Tracking Separate Scrim Applications
  const [scrimApps, setScrimApps] = useState<any[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: playerData } = await supabase.from("players").select(`*, teams (name)`).order("created_at", { ascending: false });
      const { data: teamData } = await supabase.from("teams").select("*").order("name");
      
      // Fetch separate scrim application registration records safely using correct timestamp column
      let { data: scrimData, error: scrimError } = await supabase
        .from("scrim_applications")
        .select(`*, scrims (title, game)`)
        .order("requested_date", { ascending: false });

      // Fallback Strategy: If relational foreign key join fails, pull flat table data safely
      if (scrimError || !scrimData) {
        const { data: flatScrimData } = await supabase
          .from("scrim_applications")
          .select("*")
          .order("requested_date", { ascending: false });
        scrimData = flatScrimData || [];
      }

      const currentScrimApps = scrimData || [];
      setScrimApps(currentScrimApps);

      if (playerData) {
        setPendingApps(playerData.filter((p) => p.status === "pending"));
        setActiveRoster(playerData.filter((p) => p.status === "active"));
        
        if (teamData) {
          setTeams(
            teamData.map((team) => {
              // Calculate specific pending scrims count matched directly by team name match
              const associatedScrimsCount = currentScrimApps.filter(
                (sa) => sa.status === "pending" && sa.team_name?.toLowerCase() === team.name?.toLowerCase()
              ).length;

              return { 
                ...team, 
                memberCount: playerData.filter((p) => p.team_id === team.id && p.status === "active").length,
                pendingScrimsCount: associatedScrimsCount
              };
            })
          );
        }
      }
    } catch (err: any) { 
      toast.error("Sync Failed. Verify your Database Table Relationships."); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
    supabase.from("profiles").select("id, username, full_name").then(({ data }) => setProfiles(data || [])); 
  }, []);

  const updateApplicationStatus = async (id: string, newStatus: "active" | "rejected") => {
    const { error } = await supabase.from("players").update({ status: newStatus }).eq("id", id);
    if (error) toast.error("Action Failed"); else toast.success(newStatus === "active" ? "Personnel Approved" : "Application Rejected");
    fetchData();
  };

  // Dedicated dynamic status handler for Scrim records specifically
  const updateScrimApplicationStatus = async (id: string, newStatus: "approved" | "rejected") => {
    const { error } = await supabase.from("scrim_applications").update({ status: newStatus }).eq("id", id);
    if (error) toast.error("Scrim Action Failed"); else toast.success(`Scrim application status set to ${newStatus}`);
    fetchData();
  };

  const handleKickPlayer = async (id: string) => {
    if (!confirm("Confirm removal from active roster? This action is permanent.")) return;
    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) toast.error(error.message); else { setActiveRoster((prev) => prev.filter((p) => p.id !== id)); toast.success("Member Terminated"); }
    fetchData();
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.game) return;
    const { error } = await supabase.from("teams").insert([newTeam]);
    if (error) toast.error(error.message); else { toast.success("New Division Initialized"); setIsTeamModalOpen(false); setNewTeam({ name: "", game: "" }); fetchData(); }
  };

  const handleManualAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.team_id) { toast.error("Please select a team sector."); return; }
    const { error } = await supabase.from("players").insert([{ name: newPlayer.name, role: newPlayer.role, team_id: newPlayer.team_id, uid: newPlayer.uid || null, status: "active" }]);
    if (error) toast.error(error.message); else { toast.success("Member Deployed Successfully"); setIsPlayerModalOpen(false); setNewPlayer({ name: "", role: "", team_id: "", uid: "" }); fetchData(); }
  };

  const handleProfileSelect = (profileId: string) => {
    const selected = profiles.find((p) => p.id === profileId);
    if (selected) setNewPlayer((prev) => ({ ...prev, uid: selected.id, name: selected.full_name || selected.username || "" }));
  };

  return (
    <div className="space-y-8 pb-16 text-foreground">
      {/* Top Interactive Deployment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-between p-6 bg-card/40 backdrop-blur-xs border border-border rounded-xl shadow-xs hover:border-void-700 transition-all group text-left relative overflow-hidden">
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-lg bg-void-900 border border-border text-white flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                  <ShieldPlus className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold uppercase text-xl tracking-wide text-white">Initialize Roster</h3>
                <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mt-1.5">Forge a new competitive division</p>
              </div>
              <ArrowRight className="h-5 w-5 text-void-500 group-hover:text-primary group-hover:translate-x-1 transition-all relative z-10" />
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground p-6 md:p-8 shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display font-bold uppercase tracking-wide text-white text-lg">
                New <span className="text-primary">Division</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Division Name</label>
                <Input placeholder="e.g. PRIME VALORANT" value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} className="h-11 rounded-lg border-border bg-void-900 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Game Category</label>
                <Input placeholder="e.g. FPS / MOBA" value={newTeam.game} onChange={(e) => setNewTeam({ ...newTeam, game: e.target.value })} className="h-11 rounded-lg border-border bg-void-900 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" required />
              </div>
              <Button type="submit" className="w-full h-11 bg-white text-void-950 hover:bg-void-200 font-display font-bold uppercase tracking-wide rounded-lg mt-3 transition-colors border-none text-xs">
                Confirm Squad Initialization
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isPlayerModalOpen} onOpenChange={setIsPlayerModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center justify-between p-6 bg-card/40 backdrop-blur-xs border border-border rounded-xl shadow-xs hover:border-void-700 transition-all group text-left relative overflow-hidden">
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-lg bg-void-900 border border-border text-void-400 flex items-center justify-center mb-5 group-hover:bg-blue-600/10 group-hover:text-blue-500 group-hover:border-blue-500/20 transition-all duration-200">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold uppercase text-xl tracking-wide text-white">Deploy Personnel</h3>
                <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mt-1.5">Direct deployment to active squads</p>
              </div>
              <ArrowRight className="h-5 w-5 text-void-500 group-hover:text-blue-500 group-hover:translate-x-1 transition-all relative z-10" />
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground p-6 md:p-8 shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display font-bold uppercase tracking-wide text-white text-lg">
                Add <span className="text-blue-500">Member</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualAddPlayer} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Database Link (Optional)</label>
                <Select onValueChange={handleProfileSelect}>
                  <SelectTrigger className="h-11 rounded-lg border-border bg-void-900 font-medium text-void-300 focus:ring-primary/40 focus:border-primary text-sm">
                    <SelectValue placeholder="Search Operative Database" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border bg-void-950 text-void-200 font-medium text-xs">
                    {profiles.length > 0 ? profiles.map((p) => <SelectItem key={p.id} value={p.id} className="focus:bg-void-900 focus:text-white">{p.full_name || p.username || "Unnamed Operative"}</SelectItem>) : <SelectItem value="none" disabled>No operatives found</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Public Name</label>
                  <Input placeholder="Full Name" value={newPlayer.name} onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })} className="h-11 rounded-lg border-border bg-void-900 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Role</label>
                  <Input placeholder="IGL / Entry" value={newPlayer.role} onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value })} className="h-11 rounded-lg border-border bg-void-900 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Assigned Sector</label>
                <Select onValueChange={(val) => setNewPlayer({ ...newPlayer, team_id: val })}>
                  <SelectTrigger className="h-11 rounded-lg border-border bg-void-900 font-medium text-void-300 focus:ring-primary/40 focus:border-primary text-sm">
                    <SelectValue placeholder="Assign to Team Division" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border bg-void-950 text-void-200 font-medium text-xs">
                    {teams.map((t) => <SelectItem key={t.id} value={t.id} className="focus:bg-void-900 focus:text-white">{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-display font-bold uppercase tracking-wide rounded-lg mt-3 transition-colors border-none text-xs shadow-md shadow-blue-600/10">
                Execute Personnel Deployment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roster Division Strength Intelligence Analysis Panel */}
      <div className="bg-card/20 backdrop-blur-sm border border-border rounded-xl p-5 md:p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[3px] h-full bg-primary" />
        <div className="flex items-center gap-3.5 mb-8">
          <div className="h-10 w-10 rounded-lg bg-void-900 border border-border flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-void-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Division Intelligence</h2>
            <p className="text-[10px] font-mono text-void-500 uppercase tracking-wider mt-0.5">Real-time Squad Strength Analysis</p>
          </div>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.length > 0 ? teams.map((team) => (
            <div key={team.id} className="p-5 border border-border/50 rounded-lg bg-void-900/30 hover:border-void-700 transition-all group relative overflow-hidden">
              {/* Dynamic Warning Accent lines if roster has active pending matching Scrim registrations */}
              {team.pendingScrimsCount > 0 && (
                <div className="absolute top-0 right-0 left-0 h-[2px] bg-red-500 animate-pulse" />
              )}
              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-display font-bold uppercase text-void-200 tracking-wide text-sm group-hover:text-primary transition-colors truncate">{team.name}</h4>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0 mt-1" />
                </div>
                <div className="h-[1px] w-full bg-border/40" />
                <div className="flex items-end justify-between pt-0.5">
                  <div>
                    <p className="text-[8px] font-mono text-void-500 uppercase tracking-wider mb-0.5">Squad Power</p>
                    <span className="block text-4xl font-display font-bold text-white tracking-tight leading-none">{team.memberCount}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant="secondary" className="text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wide text-void-400 bg-void-800 border border-border/50 shadow-none">
                      {team.game}
                    </Badge>
                    {/* Unique Badge Element Indicating Scrim Activity */}
                    {team.pendingScrimsCount > 0 && (
                      <Badge className="bg-red-500/10 text-red-400 border border-red-500/30 font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 animate-pulse rounded-sm">
                        ⚔️ {team.pendingScrimsCount} Scrim App
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-16 text-center border border-dashed border-void-800 rounded-lg bg-void-900/10">
              <ShieldAlert className="h-8 w-8 text-void-700 mx-auto mb-3" />
              <p className="font-mono uppercase text-[10px] tracking-wider text-void-500">No active divisions detected</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW SECTION: Scrim Registrations Streams (Separated Knowledge Base) */}
      <div className="bg-card/20 backdrop-blur-sm border border-border rounded-xl p-5 md:p-6 shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-[3px] h-full bg-red-500" />
        <div className="flex items-center gap-3.5 mb-8">
          <div className="h-10 w-10 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center">
            <Sword className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Scrim Matchmaking Inbound Queue</h2>
            <p className="text-[10px] font-mono text-void-500 uppercase tracking-wider mt-0.5">Roster Challenge Verification Streams</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="text-left border-b border-border/60">
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Challenger Roster</th>
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Target Match Event</th>
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Representative / Discord</th>
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Status Pipeline</th>
                <th className="pb-4 text-right text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Action Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {scrimApps.length > 0 ? scrimApps.map((sa) => (
                <tr key={sa.id} className="group hover:bg-void-900/20 transition-all">
                  <td className="py-4 px-3 font-display font-bold uppercase text-white text-base truncate max-w-[180px]">
                    {sa.team_name || "No Name Team"}
                    {/* Visual inline alert link badge indicator */}
                    {sa.status === "pending" && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </td>
                  <td className="py-4 px-3">
                    <span className="block text-void-200 font-medium text-sm">{sa.scrims?.title || "Scrim Registration"}</span>
                    <span className="text-[10px] text-void-500 font-mono uppercase tracking-tight">{sa.scrims?.game || "Active Scrimmage"}</span>
                  </td>
                  <td className="py-4 px-3 text-sm text-void-300 font-mono">
                    <div>{sa.player_name || "Representative"}</div>
                    <div className="text-[10px] text-void-500">{sa.contact_info || "No Handle Provided"}</div>
                  </td>
                  <td className="py-4 px-3">
                    <Badge className={`font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded shadow-none ${
                      sa.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                      sa.status === "rejected" ? "bg-void-900 text-void-500 border border-border" :
                      "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    }`}>
                      {sa.status || "pending"}
                    </Badge>
                  </td>
                  <td className="py-4 px-3 text-right">
                    {(!sa.status || sa.status === "pending") ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => updateScrimApplicationStatus(sa.id, "approved")} className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-400 h-8 w-8 p-0 rounded-md transition-all shadow-none">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => updateScrimApplicationStatus(sa.id, "rejected")} className="bg-void-900 border border-border text-void-400 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 h-8 w-8 p-0 rounded-md transition-all shadow-none">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-void-600 uppercase tracking-widest px-2">Archived</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr className="border-none">
                  <td colSpan={5} className="py-16 text-center border-none">
                    <div className="flex flex-col items-center justify-center text-void-700">
                      <Sword className="h-10 w-10 mb-3 text-void-800" />
                      <p className="font-mono uppercase text-[10px] tracking-wider text-void-500">No scrim registrations logged</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recruitment Queue Data Transmission Streams */}
      <div className="bg-card/20 backdrop-blur-sm border border-border rounded-xl p-5 md:p-6 shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-[3px] h-full bg-orange-500" />
        <div className="flex items-center gap-3.5 mb-8">
          <div className="h-10 w-10 rounded-lg bg-orange-500/5 border border-orange-500/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Recruitment Queue</h2>
            <p className="text-[10px] font-mono text-void-500 uppercase tracking-wider mt-0.5">Awaiting Command Clearance</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="text-left border-b border-border/60">
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Operative</th>
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Tactical Role</th>
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Target Sector</th>
                <th className="pb-4 text-right text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {pendingApps.length > 0 ? pendingApps.map((app) => (
                <tr key={app.id} className="group hover:bg-void-900/20 transition-all">
                  <td className="py-4 px-3 font-display font-bold uppercase text-white text-base truncate max-w-[180px]">{app.name}</td>
                  <td className="py-4 px-3">
                    <span className="px-2 py-0.5 bg-void-900 border border-border text-void-300 rounded text-[9px] font-mono uppercase tracking-wide">
                      {app.role}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded shadow-none">
                      {app.teams?.name || "Central Command"}
                    </Badge>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => updateApplicationStatus(app.id, "active")} className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-400 h-8 w-8 p-0 rounded-md transition-all shadow-none">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => updateApplicationStatus(app.id, "rejected")} className="bg-void-900 border border-border text-void-400 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 h-8 w-8 p-0 rounded-md transition-all shadow-none">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr className="border-none">
                  <td colSpan={4} className="py-16 text-center border-none">
                    <div className="flex flex-col items-center justify-center text-void-700">
                      <Users className="h-10 w-10 mb-3 text-void-800" />
                      <p className="font-mono uppercase text-[10px] tracking-wider text-void-500">Incoming queue empty</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active System Registry Table Framework */}
      <div className="bg-card/20 backdrop-blur-sm border border-border rounded-xl p-5 md:p-6 shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-[3px] h-full bg-blue-600" />
        <div className="flex items-center gap-3.5 mb-8">
          <div className="h-10 w-10 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center">
            <Gamepad2 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Active Personnel</h2>
            <p className="text-[10px] font-mono text-void-500 uppercase tracking-wider mt-0.5">Verified Operatives in the Field</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="text-left border-b border-border/60">
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Operative</th>
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Specialization</th>
                <th className="pb-4 text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Deployment Unit</th>
                <th className="pb-4 text-right text-[10px] font-mono uppercase tracking-wider text-void-500 px-3">Registry Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {activeRoster.length > 0 ? activeRoster.map((player) => (
                <tr key={player.id} className="group hover:bg-void-900/20 transition-all">
                  <td className="py-4 px-3 font-display font-bold uppercase text-white text-base group-hover:text-blue-400 transition-colors truncate max-w-[180px]">{player.name}</td>
                  <td className="py-4 px-3">
                    <span className="font-mono uppercase text-[9px] text-void-300 bg-void-900 px-2 py-0.5 rounded border border-border">
                      {player.role}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <Badge variant="outline" className="border-blue-500/20 text-blue-400 font-mono text-[9px] uppercase tracking-wide bg-blue-500/5 px-2 py-0.5 rounded shadow-none">
                      {player.teams?.name || "Central Command"}
                    </Badge>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleKickPlayer(player.id)} className="h-8 w-8 rounded-md text-void-500 hover:text-destructive hover:bg-destructive/10 p-0 border border-transparent hover:border-destructive/20 transition-all shadow-none">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr className="border-none">
                  <td colSpan={4} className="py-16 text-center border-none">
                    <div className="flex flex-col items-center justify-center text-void-700">
                      <Gamepad2 className="h-10 w-10 mb-3 text-void-800" />
                      <p className="font-mono uppercase text-[10px] tracking-wider text-void-500">No active personnel deployed</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}