"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Copy, Trophy, Gamepad2, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function DashboardHome() {
  const { user, username } = useAuth();
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [rosterApps, setRosterApps] = useState<any[]>([]);
  const hasFetched = useRef(false);
  const displayName = username || user?.email?.split("@")[0] || "Player";

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      (async () => {
        const { data: profileData } = await supabase.from("players").select("*").eq("id", user.id).maybeSingle();
        if (profileData) {
          setPlayerProfile(profileData);
          const { data: rosterData } = await supabase.from("players").select("*, teams(name)").eq("id", user.id).not("team_id", "is", null);
          setRosterApps(rosterData || []);
        }
      })();
    }
  }, [user]);

  const copyId = (id: string) => { 
    navigator.clipboard.writeText(id); 
    toast.success("Player ID copied to clipboard"); 
  };

  return (
    <div className="space-y-6">
      {/* Player Profile Dossier Card */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden relative rounded-xl">
        <div className="absolute top-0 left-0 w-[3px] h-full bg-primary" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-void-900/80 border border-border/80 font-display font-black text-primary text-xl shadow-inner">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <h3 className="font-display font-black uppercase tracking-wide text-lg text-white">
                  {displayName}
                </h3>
                <p className="font-mono text-[9px] text-void-500 uppercase tracking-wider">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Official UID Display Element */}
            <div className="w-full sm:w-auto min-w-[200px] rounded-lg bg-void-950/60 p-4 border border-border/40 shadow-inner">
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="font-mono text-[9px] font-bold uppercase text-void-500 tracking-wider">Official UID</span>
                {playerProfile && (
                  <button 
                    className="text-void-500 hover:text-primary transition-colors cursor-pointer" 
                    onClick={() => copyId(playerProfile.id)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="font-display font-black tracking-wide text-white text-lg flex items-center gap-1.5">
                <span className="text-primary font-mono font-medium">#</span>
                {playerProfile ? playerProfile.player_id : "NOT_SYNCED"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roster Clearance Section */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden rounded-xl">
        <div className="h-[3px] bg-void-900 w-full" />
        <CardHeader className="px-6 pt-6 pb-4 md:px-8 md:pt-8">
          <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 text-void-400">
            <Trophy className="h-4 w-4 text-primary shrink-0" />
            Roster Clearance Protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
          {rosterApps.length > 0 ? (
            <div className="space-y-3">
              {rosterApps.map((app) => (
                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border/40 bg-void-950/40 p-5">
                  <div className="space-y-2">
                    <h4 className="font-display font-black text-base uppercase tracking-wide text-white">
                      {app.teams?.name || "Independent Operative"}
                    </h4>
                    <div className="flex gap-2 items-center">
                      <Badge className="text-[9px] uppercase font-mono font-bold bg-primary text-primary-foreground rounded-xs px-2.5 py-0.5 border-none">
                        {app.role}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit font-mono text-[9px] uppercase font-bold tracking-wider border-border text-void-400 px-3 py-1.5 rounded-sm bg-void-900/20">
                    Verified Combatant
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-16 border border-dashed border-border/60 rounded-lg bg-void-950/20">
              <p className="font-mono text-[11px] text-void-500 mb-5 uppercase tracking-wider max-w-xs mx-auto">
                Unassigned Operative: Seeking Squad Clearance
              </p>
              <Button 
                variant="outline" 
                className="font-display font-bold uppercase text-[10px] tracking-wider h-10 px-6 rounded-lg border-border text-white hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shadow-xs" 
                asChild
              >
                <Link href="/teams">Scan Recruitment Channels</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}