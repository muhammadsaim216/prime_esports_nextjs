"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock, MessageSquare, ChevronRight, ShieldCheck, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const fetchApplications = async () => {
    setLoading(true);
    const { data: scrimData } = await supabase.from("scrim_applications").select(`id, message, status, created_at, profiles:user_id (username, discord_id), scrims:scrim_id (title, game)`).order("created_at", { ascending: false });
    const { data: rosterData } = await supabase.from("team_applications").select(`id, message, status, created_at, full_name, role, discord_tag, team_id, pubg_uid, pubg_rank, user_id, profiles:user_id (username, discord_id), teams:team_id (id, name, game)`).order("created_at", { ascending: false });
    const formattedScrims = (scrimData || []).map((app) => ({ ...app, type: "scrim" as const }));
    const formattedRoster = (rosterData || []).map((app: any) => ({ ...app, type: "roster" as const, profiles: app.profiles || { username: app.full_name || "Unknown", discord_id: app.discord_tag || null } }));
    const allApps = [...formattedScrims, ...formattedRoster].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setApplications(allApps);
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected", type: "scrim" | "roster") => {
    const table = type === "scrim" ? "scrim_applications" : "team_applications";
    const app = applications.find((a) => a.id === id);
    try {
      const { error } = await supabase.from(table).update({ status }).eq("id", id);
      if (error) throw error;
      if (status === "approved" && type === "roster" && app) {
        const { error: playerError } = await supabase.from("players").insert([{ team_id: app.team_id || app.teams?.id, name: app.full_name || app.profiles?.username, role: app.role || "Member" }]);
        if (playerError) toast.error("Approved, but failed to update roster automatically.");
        else toast.success(`${app.full_name || app.profiles?.username} has been added to ${app.teams?.name} roster.`);
      } else { toast.success(`Application ${status}!`); }
      fetchApplications();
      setSelectedApp(null);
    } catch (err: any) { toast.error(err.message); }
  };

  const filteredApplications = applications.filter((app) => filter === "all" || app.status === filter);

  const getStatusBadge = (status: string) => {
    if (status === "pending") return <Badge variant="outline" className="gap-1 border-accent/30 text-accent bg-accent/5 font-mono uppercase text-[9px] tracking-wide font-medium px-2 py-0.5 rounded"><Clock className="h-3 w-3" /> PENDING</Badge>;
    if (status === "approved") return <Badge className="bg-primary/10 gap-1 text-primary border border-primary/20 font-mono uppercase text-[9px] tracking-wide font-medium px-2 py-0.5 rounded shadow-none"><Check className="h-3 w-3" /> APPROVED</Badge>;
    if (status === "rejected") return <Badge variant="outline" className="bg-destructive/5 gap-1 text-destructive border border-destructive/20 font-mono uppercase text-[9px] tracking-wide font-medium px-2 py-0.5 rounded"><X className="h-3 w-3" /> REJECTED</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <>
      {/* Structural Filtering & Metric Nodes Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 rounded-lg border-border font-mono tracking-wider text-[10px] bg-void-900 text-void-300">
            {applications.length} TOTAL ENTRIES
          </Badge>
          {pendingCount > 0 && (
            <Badge className="bg-primary/10 text-primary border border-primary/30 font-mono font-semibold px-3 py-1 rounded-lg animate-pulse shadow-none">
              {pendingCount} NEEDS REVIEW
            </Badge>
          )}
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-48 h-11 rounded-lg border-border bg-void-900 text-void-200 font-display font-bold uppercase text-xs tracking-wider focus:ring-primary/40 focus:border-primary transition-all">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-border bg-void-950 font-display font-semibold uppercase text-xs text-void-200">
            <SelectItem value="all" className="focus:bg-void-900 focus:text-white">ALL STATUS</SelectItem>
            <SelectItem value="pending" className="focus:bg-void-900 focus:text-white">PENDING</SelectItem>
            <SelectItem value="approved" className="focus:bg-void-900 focus:text-white">APPROVED</SelectItem>
            <SelectItem value="rejected" className="focus:bg-void-900 focus:text-white">REJECTED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Primary Data Traffic Stream Container */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-xl border border-border/50 bg-void-800/40 animate-pulse">
              <CardContent className="h-28" />
            </Card>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card className="rounded-xl border-dashed border border-void-700 bg-void-900/20 backdrop-blur-xs">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare className="h-10 w-10 text-void-600 mb-4 animate-pulse" />
            <p className="text-void-400 font-mono uppercase tracking-widest text-xs">
              {filter === "all" ? "NO INCOMING TRAFFIC DOCUMENTED" : `NO ${filter} APPLICATIONS DETECTED`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((app) => (
            <Card 
              key={app.id} 
              className="rounded-xl border border-border bg-card/20 backdrop-blur-sm text-card-foreground shadow-md overflow-hidden transition-all duration-200 hover:border-void-700 cursor-pointer group" 
              onClick={() => setSelectedApp(app)}
            >
              <CardContent className="flex items-center justify-between p-6 md:p-7">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2.5">
                    <h4 className="text-base font-display font-bold uppercase tracking-wide text-white">
                      {app.profiles?.username || "ANONYMOUS USER"}
                    </h4>
                    {getStatusBadge(app.status)}
                    <Badge variant="outline" className="text-[9px] uppercase font-mono tracking-wide font-medium border-border text-void-400 bg-void-900/60 rounded px-2 py-0.5">
                      {app.type === "scrim" ? "SCRIM REQUEST" : "ROSTER RECRUIT"}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-x-5 gap-y-1">
                    <p className="text-xs font-mono text-void-400 uppercase">
                      TARGET: <span className="text-void-200 font-sans font-semibold tracking-wide ml-0.5">{app.type === "scrim" ? app.scrims?.title : app.teams?.name}</span>
                    </p>
                    <p className="text-xs font-mono text-void-400 uppercase">
                      GAME: <span className="text-void-200 font-sans font-semibold tracking-wide ml-0.5">{app.type === "scrim" ? app.scrims?.game : app.teams?.game}</span>
                    </p>
                    {app.type === "roster" && (
                      <p className="text-xs font-mono text-void-400 uppercase">
                        ROLE: <span className="text-primary font-sans font-semibold tracking-wide ml-0.5">{app.role}</span>
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-void-500 uppercase mt-3.5 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-void-400" /> {new Date(app.created_at).toLocaleString()}
                  </p>
                </div>
                
                {/* Immediate Contextual Node Approval Mechanisms */}
                <div className="flex items-center gap-4 ml-4">
                  {app.status === "pending" && (
                    <div className="hidden sm:flex gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-2xs" 
                        onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "approved", app.type); }}
                        title="Quick Approve"
                      >
                        <Check className="h-4 w-4 stroke-[2.5px]" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-md bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all duration-200 shadow-2xs" 
                        onClick={(e) => { e.stopPropagation(); updateStatus(app.id, "rejected", app.type); }}
                        title="Quick Reject"
                      >
                        <X className="h-4 w-4 stroke-[2.5px]" />
                      </Button>
                    </div>
                  )}
                  <ChevronRight className="h-5 w-5 text-void-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Deep-Review Terminal Console Overlay Dialog Dossier */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-md rounded-xl p-6 md:p-7 border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-display font-bold uppercase tracking-wide text-white">
              <span>APPLICATION DOSSIER</span>
              {selectedApp?.status === "approved" && <ShieldCheck className="h-5 w-5 text-primary" />}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono uppercase tracking-wider text-void-400 mt-1">
              SECURE REVIEW ACCESS FOR NODE ID: {selectedApp?.profiles?.username || "ANONYMOUS"}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 pt-4">
              {/* Metric Matrix Layout Metadata Split */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 border-b border-void-800 pb-5">
                <div>
                  <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mb-1">APPLICANT</p>
                  <p className="font-display font-bold uppercase text-base text-white tracking-wide">{selectedApp.profiles?.username}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mb-1">STATUS</p>
                  <div className="mt-0.5">{getStatusBadge(selectedApp.status)}</div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mb-1">OBJECTIVE TARGET</p>
                  <p className="font-semibold text-sm text-void-200">{selectedApp.type === "scrim" ? selectedApp.scrims?.title : selectedApp.teams?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mb-1">PLATFORM ARCH</p>
                  <p className="font-semibold text-sm text-void-200">{selectedApp.type === "scrim" ? selectedApp.scrims?.game : selectedApp.teams?.game}</p>
                </div>
              </div>

              {/* Sub-Payload Communications Channels */}
              <div className="space-y-2.5">
                {selectedApp.profiles?.discord_id && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-void-900 border border-border/80">
                    <span className="text-[10px] font-mono text-void-400 uppercase tracking-wider">DISCORD PROTOCOL</span>
                    <span className="text-xs font-mono font-bold text-[#5865F2]">{selectedApp.profiles.discord_id}</span>
                  </div>
                )}
                {selectedApp.role && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-void-900 border border-border/80">
                    <span className="text-[10px] font-mono text-void-400 uppercase tracking-wider">PREFFERED SECTOR</span>
                    <span className="text-xs font-display font-bold uppercase tracking-wide text-primary">{selectedApp.role}</span>
                  </div>
                )}
              </div>

              {/* Targeted Competitive Game Custom Core Matrices */}
              {selectedApp.pubg_uid && (
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 grid grid-cols-2 gap-3.5">
                  <div className="col-span-2 text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                    PUBG MOBILE SUBSYSTEM TELEMETRY
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-void-400 uppercase">UID CODE</p>
                    <p className="text-xs font-mono font-bold tracking-widest text-white mt-0.5">{selectedApp.pubg_uid}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-void-400 uppercase">COMBAT TIERS</p>
                    <p className="text-xs font-display font-bold uppercase text-primary mt-0.5">{selectedApp.pubg_rank}</p>
                  </div>
                </div>
              )}

              {/* User Content Text Payload Section */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider">APPLICANT COMM STATEMENT</p>
                <div className="rounded-lg border border-border bg-void-900/60 p-4">
                  <p className="text-sm leading-relaxed text-void-300 italic">
                    "{selectedApp.message || "No contextual text message provided by node transmission."}"
                  </p>
                </div>
              </div>

              {/* Console Trigger Operations Hub Footer */}
              {selectedApp.status === "pending" && (
                <div className="flex gap-3 pt-3">
                  <Button 
                    className="flex-1 h-12 rounded-lg bg-neon text-primary-foreground font-display font-bold uppercase tracking-wider text-xs px-5 neon-glow transition-all duration-300 hover:shadow-neon-strong hover:opacity-90 border-none gap-1.5" 
                    onClick={() => updateStatus(selectedApp.id, "approved", selectedApp.type)}
                  >
                    <UserPlus className="h-4 w-4 stroke-[2.5px]" /> APPROVE ENTRY
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-lg border-border bg-void-900 text-void-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 font-display font-bold uppercase tracking-wider text-xs transition-all duration-200 gap-1.5" 
                    onClick={() => updateStatus(selectedApp.id, "rejected", selectedApp.type)}
                  >
                    <X className="h-4 w-4 stroke-[2.5px]" /> REJECT PURGE
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}