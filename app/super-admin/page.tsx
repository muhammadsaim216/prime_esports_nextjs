"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, Globe, Users, TrendingUp, ExternalLink, Trash2, CheckCircle2, XCircle, Plus, Loader2, History, FileText, Calendar, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function SuperAdminContent() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ orgs: 0, teams: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [newOrg, setNewOrg] = useState({ name: "", slug: "", tier: "free" });

  const fetchPlatformData = useCallback(async () => {
    setLoading(true);
    try {
      const [orgRes, teamRes, reqRes, revRes, logRes] = await Promise.all([
        supabase.from("organizations").select(`*, profiles:owner_id (username, email)`).order("created_at", { ascending: false }),
        supabase.from("teams").select("*").order("created_at", { ascending: false }),
        supabase.from("subscription_requests").select(`*, teams(name)`).eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("subscription_requests").select("amount_paid").eq("status", "approved"),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      const totalRev = revRes.data?.reduce((acc, curr) => acc + (Number(curr.amount_paid) || 0), 0) || 0;
      setOrgs(orgRes.data || []); setTeams(teamRes.data || []); setPendingRequests(reqRes.data || []); setLogs(logRes.data || []);
      setStats({ orgs: orgRes.data?.length || 0, teams: teamRes.data?.length || 0, revenue: totalRev });
    } catch (err: any) { toast.error("Failed to load dashboard data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlatformData(); }, [fetchPlatformData]);

  const createLog = useCallback(async (text: string, category: string, targetId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert([{ admin_id: user?.id, action_text: text, category, target_id: targetId }]);
  }, []);

  const handleCreateOrg = useCallback(async () => {
    if (!newOrg.name || !newOrg.slug) { toast.error("Name and Slug required"); return; }
    const cleanSlug = newOrg.slug.toLowerCase().trim().replace(/\s+/g, "-");
    const { error } = await supabase.from("organizations").insert([{ name: newOrg.name, slug: cleanSlug, subscription_tier: newOrg.tier }]);
    if (error) toast.error("Failed: " + error.message);
    else { await createLog(`Initialized Org: ${newOrg.name}`, "org"); toast.success("Organization created!"); setNewOrg({ name: "", slug: "", tier: "free" }); fetchPlatformData(); }
  }, [newOrg, createLog, fetchPlatformData]);

  const handleUpdateStatus = useCallback(async (requestId: string, teamId: string, newStatus: "approved" | "rejected", tier: string) => {
    const { error: requestError } = await supabase.from("subscription_requests").update({ status: newStatus }).eq("id", requestId);
    if (requestError) { toast.error(requestError.message); return; }
    if (newStatus === "approved") await supabase.from("teams").update({ subscription_tier: tier }).eq("id", teamId);
    await createLog(`${newStatus.toUpperCase()} license: ${teamId}`, "payment", teamId);
    toast.success(`Request ${newStatus}!`);
    fetchPlatformData();
  }, [createLog, fetchPlatformData]);

  const handleBanTeam = useCallback(async (teamId: string, teamName: string) => {
    if (!window.confirm(`BAN ${teamName}?`)) return;
    const { error } = await supabase.from("teams").update({ status: "banned" }).eq("id", teamId);
    if (error) { toast.error("Ban failed: " + error.message); return; }
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, status: "banned" } : t)));
    toast.success(`${teamName} banned`);
    await createLog(`BANNED TEAM: ${teamName}`, "team", teamId);
  }, [createLog]);

  const statCards = useMemo(() => [
    { label: "Revenue (PKR)", val: stats.revenue.toLocaleString(), icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
    { label: "Organizations", val: stats.orgs, icon: Globe, color: "from-blue-500 to-cyan-500" },
    { label: "Active Teams", val: stats.teams, icon: Users, color: "from-violet-500 to-purple-500" },
    { label: "Pending Requests", val: pendingRequests.length, icon: ShieldAlert, color: "from-rose-500 to-pink-500" },
  ], [stats, pendingRequests]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-void-950">
        <Sparkles className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="font-mono text-[10px] font-bold text-void-400 uppercase tracking-widest">Initializing Console</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-950 text-white relative overflow-x-hidden">
      {/* Grid Overlay Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.15]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-wider">System Root Active</span>
              </div>
              <h1 className="text-4xl font-display font-black uppercase tracking-tight text-white">
                Dashboard <span className="text-primary">Console</span>
              </h1>
              <p className="font-sans text-xs font-medium text-void-400 uppercase tracking-wide">
                Global infrastructure management & analytics
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold uppercase text-xs tracking-wide rounded-lg h-10 px-5 transition-colors shadow-xs">
                  <Plus className="mr-2 h-4 w-4 shrink-0" /> Deploy Org
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md shadow-2xl p-6 text-white max-w-md w-full">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="font-mono text-xs font-bold uppercase tracking-wider text-void-400">
                    Create Organization
                  </DialogTitle>
                  <p className="font-sans text-[11px] text-void-500 uppercase tracking-wide">
                    Deploy new core tenant instance
                  </p>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-void-400 uppercase tracking-wide">Name</label>
                    <Input placeholder="Organization name" value={newOrg.name} onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })} className="h-10 rounded-lg border-border/60 bg-void-900 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-void-400 uppercase tracking-wide">Slug</label>
                    <Input placeholder="organization-slug" value={newOrg.slug} onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })} className="h-10 rounded-lg border-border/60 bg-void-900 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-white" />
                  </div>
                  <Button onClick={handleCreateOrg} className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold uppercase text-xs tracking-wide mt-2">
                    Initialize Protocol
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Infrastructure Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <Card key={s.label} className="bg-card/40 backdrop-blur-md border border-border/60 rounded-xl overflow-hidden shadow-md">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[9px] font-bold text-void-400 uppercase tracking-wider">{s.label}</p>
                    <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center opacity-80 shrink-0`}>
                      <s.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-display font-black text-white tracking-tight">{s.val}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Control Tabs */}
          <Tabs defaultValue="orgs" className="space-y-6">
            <TabsList className="bg-void-900/60 border border-border/60 rounded-xl p-1 h-12 flex w-full md:w-max">
              <TabsTrigger value="orgs" className="rounded-lg font-display font-bold uppercase text-[10px] tracking-wider px-5 h-full data-[state=active]:bg-card data-[state=active]:text-primary text-void-400 transition-all">Organizations</TabsTrigger>
              <TabsTrigger value="teams" className="rounded-lg font-display font-bold uppercase text-[10px] tracking-wider px-5 h-full data-[state=active]:bg-card data-[state=active]:text-primary text-void-400 transition-all">Teams</TabsTrigger>
              <TabsTrigger value="billing" className="rounded-lg font-display font-bold uppercase text-[10px] tracking-wider px-5 h-full data-[state=active]:bg-card data-[state=active]:text-primary text-void-400 transition-all">Billing ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="logs" className="rounded-lg font-display font-bold uppercase text-[10px] tracking-wider px-5 h-full data-[state=active]:bg-card data-[state=active]:text-primary text-void-400 transition-all">Audit Logs</TabsTrigger>
            </TabsList>

            {/* Organizations View */}
            <TabsContent value="orgs" className="outline-hidden">
              <div className="grid gap-3">
                {orgs.map((org) => (
                  <Card key={org.id} className="bg-card/30 backdrop-blur-xs border border-border/40 hover:border-border/80 transition-colors rounded-xl shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-white text-base uppercase tracking-wide">{org.name}</h4>
                        <p className="font-mono text-[10px] text-void-400 uppercase tracking-wide">
                          /{org.slug} <span className="text-void-600 mx-1.5">•</span> Owner: {org.profiles?.username || org.profiles?.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-md font-mono text-[9px] font-bold uppercase px-2 py-0.5">
                          {org.subscription_tier}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-void-400 hover:text-white border border-border/40 rounded-lg hover:bg-void-900" asChild>
                          <a href={`/org/${org.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Teams View */}
            <TabsContent value="teams" className="outline-hidden">
              <div className="grid gap-3">
                {teams.map((team) => (
                  <Card key={team.id} className="bg-card/30 backdrop-blur-xs border border-border/40 hover:border-border/80 transition-colors rounded-xl shadow-xs">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-white text-base uppercase tracking-wide">{team.name}</h4>
                        <p className="font-mono text-[10px] text-void-400 uppercase tracking-wide">
                          {team.game || "Unassigned"} <span className="text-void-600 mx-1.5">•</span> Tier: {team.subscription_tier}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {team.status === "banned" ? (
                          <Badge className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md font-mono text-[9px] font-bold uppercase px-2 py-0.5">
                            BANNED
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground font-display font-bold uppercase text-[10px] tracking-wide rounded-lg h-8 px-3 transition-colors" 
                            onClick={() => handleBanTeam(team.id, team.name)}
                          >
                            Ban Team
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Billing Requests View */}
            <TabsContent value="billing" className="outline-hidden">
              <div className="grid gap-3">
                {pendingRequests.length === 0 ? (
                  <div className="p-12 border border-dashed border-border/40 rounded-xl bg-card/10 text-center">
                    <p className="font-mono text-[10px] font-bold text-void-500 uppercase tracking-widest">No pending operations matrix</p>
                  </div>
                ) : (
                  pendingRequests.map((req) => (
                    <Card key={req.id} className="bg-card/30 backdrop-blur-xs border border-border/40 rounded-xl shadow-xs">
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-display font-bold text-white text-base uppercase tracking-wide">{req.teams?.name}</h4>
                          <p className="font-mono text-[10px] text-void-400 uppercase tracking-wide">
                            Plan: <span className="text-primary">{req.plan_type}</span> <span className="text-void-600 mx-1.5">•</span> TID: {req.transaction_id}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="icon" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg h-8 w-8 transition-colors" onClick={() => handleUpdateStatus(req.id, req.team_id, "approved", req.plan_type)}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" className="bg-destructive hover:bg-destructive/90 text-white rounded-lg h-8 w-8 transition-colors" onClick={() => handleUpdateStatus(req.id, req.team_id, "rejected", req.plan_type)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Audit Logs View */}
            <TabsContent value="logs" className="outline-hidden">
              <div className="grid gap-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 p-4 bg-card/20 rounded-lg border border-border/30 shadow-xs transition-colors hover:bg-card/30">
                    <History className="h-3.5 w-3.5 text-void-500 shrink-0" />
                    <p className="font-mono text-xs text-void-300 flex-1 uppercase tracking-wide">{log.action_text}</p>
                    <span className="font-mono text-[9px] text-void-500 shrink-0">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <SuperAdminContent />
    </ProtectedRoute>
  );
}