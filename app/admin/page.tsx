"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Gamepad2, FileText, Video, TrendingUp, ArrowUpRight, Activity, UserPlus, MonitorPlay, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AdminOverview() {
  const [stats, setStats] = useState({ totalPlayers: 0, activeScrims: 0, pendingApplications: 0, liveStreams: 0 });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // Query both standard profiles and the newly added esports pro tracking registry
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("esports_players").select("id", { count: "exact", head: true }),
      supabase.from("scrims").select("id", { count: "exact", head: true }).in("status", ["upcoming", "live"]),
      supabase.from("scrim_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("streams").select("id", { count: "exact", head: true }).eq("is_live", true),
    ]).then(([profilesRes, esportsRes, scrimsRes, appsRes, streamsRes]) => {
      const platformUsers = profilesRes.count || 0;
      const registeredPros = esportsRes.count || 0;
      
      setStats({ 
        totalPlayers: platformUsers + registeredPros, 
        activeScrims: scrimsRes.count || 0, 
        pendingApplications: appsRes.count || 0, 
        liveStreams: streamsRes.count || 0 
      });
    });

    supabase.from("scrim_applications").select(`id, message, status, created_at, profiles:user_id (username), scrims:scrim_id (title, game)`).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => { setRecentApplications(data || []); setLoading(false); });
  }, []);

  const statCards = [
    { label: "Total Players", value: stats.totalPlayers, icon: Users, color: "text-white", bg: "bg-void-800 border-border" },
    { label: "Active Scrims", value: stats.activeScrims, icon: Gamepad2, color: "text-primary", bg: "bg-void-800 border-primary/20" },
    { label: "Pending Apps", value: stats.pendingApplications, icon: FileText, color: "text-accent", bg: "bg-void-800 border-accent/20" },
    { label: "Live Streams", value: stats.liveStreams, icon: Video, color: "text-neon-mint", bg: "bg-void-800 border-border" },
  ];

  return (
    <>
      {/* Metric Stat Grids */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border border-border bg-card/40 backdrop-blur-sm text-card-foreground rounded-xl overflow-hidden group transition-all duration-300 hover:border-primary/20 shadow-sm hover:shadow-md">
            <CardContent className="flex items-center gap-5 p-6">
              <div className={cn("rounded-lg p-3.5 border transition-all duration-300 group-hover:scale-105", stat.bg, stat.color)}>
                <stat.icon className="h-5 w-5 stroke-[2px]" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-white tracking-tight leading-none">
                  {stat.value}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-void-400 mt-2">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Workspace Layout Split */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Recent Activity Log Panel */}
        <Card className="lg:col-span-3 border border-border shadow-md rounded-xl bg-card/20 backdrop-blur-sm text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-display font-bold uppercase tracking-wide text-white">
                Recent Activity
              </CardTitle>
              <p className="text-[10px] font-mono uppercase tracking-wider text-void-400">
                Incoming system applications
              </p>
            </div>
            <Button variant="ghost" className="rounded-lg font-display uppercase tracking-wide text-xs text-primary hover:text-white hover:bg-void-800 h-9 px-4 transition-colors" asChild>
              <Link href="/admin/applications" className="flex items-center gap-1.5">
                Open Logs <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-void-800/40 border border-border/50" />
                ))}
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <Activity className="h-10 w-10 text-void-600 mb-3 animate-pulse" />
                <p className="text-void-400 font-mono uppercase tracking-widest text-[10px]">
                  No pending transmissions detected
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-all duration-200 bg-void-900/40 hover:bg-void-800/40 hover:border-void-700">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-md bg-void-800 text-primary border border-border flex items-center justify-center text-xs font-mono font-bold shadow-2xs">
                        {app.profiles?.username?.substring(0, 2).toUpperCase() || "UN"}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm text-white uppercase tracking-wide">
                          {app.profiles?.username || "Unknown"}
                        </p>
                        <p className="text-[10px] font-mono text-void-400 mt-0.5 uppercase tracking-normal">
                          {app.scrims?.title} • <span className="text-void-300">{app.scrims?.game}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={cn(
                        "font-mono uppercase text-[9px] px-2.5 py-0.5 rounded border-none tracking-wide font-medium", 
                        app.status === "pending" 
                          ? "bg-void-800 text-void-300 border border-border" 
                          : app.status === "approved" 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                      )}>
                        {app.status}
                      </Badge>
                      <span className="text-[10px] font-mono text-void-500 uppercase">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Action Matrix Panel */}
        <Card className="lg:col-span-2 border border-border shadow-md rounded-xl bg-void-900/50 backdrop-blur-sm text-secondary-foreground overflow-hidden relative">
          <div className="absolute -bottom-8 -right-8 opacity-[0.02] pointer-events-none text-white transition-transform duration-700 group-hover:scale-105">
            <TrendingUp className="h-44 w-44" />
          </div>
          <CardHeader className="p-6 pt-7">
            <CardTitle className="text-lg font-display font-bold uppercase tracking-wide text-white">
              Quick Actions
            </CardTitle>
            <p className="text-[10px] font-mono uppercase tracking-wider text-void-400">
              Fast-track deployment parameters
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0 grid gap-3 relative z-10">
            <Button asChild className="h-12 justify-start gap-3.5 rounded-lg bg-neon text-primary-foreground font-display font-bold uppercase tracking-wider text-xs px-5 neon-glow transition-all duration-300 hover:shadow-neon-strong hover:opacity-90 group border-none">
              <Link href="/admin/scrims" className="w-full flex items-center">
                <Gamepad2 className="h-4 w-4" />
                <span>Create New Scrim</span>
                <Plus className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-12 justify-start gap-3.5 rounded-lg bg-void-900 border border-border text-void-200 hover:text-white hover:bg-void-800 transition-all duration-200">
              <Link href="/admin/streams" className="w-full flex items-center font-display uppercase tracking-wide text-xs">
                <MonitorPlay className="h-4 w-4 text-primary" /> 
                <span>Add Stream</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-12 justify-start gap-3.5 rounded-lg bg-void-900 border border-border text-void-200 hover:text-white hover:bg-void-800 transition-all duration-200">
              <Link href="/admin/applications" className="w-full flex items-center font-display uppercase tracking-wide text-xs">
                <FileText className="h-4 w-4 text-accent" /> 
                <span>Review Applications</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-12 justify-start gap-3.5 rounded-lg bg-void-900 border border-border text-void-200 hover:text-white hover:bg-void-800 transition-all duration-200">
              <Link href="/admin/players" className="w-full flex items-center font-display uppercase tracking-wide text-xs">
                <UserPlus className="h-4 w-4 text-void-400" /> 
                <span>Manage Players</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}