"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trophy, Shield, Swords, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PlayersPublicShowcase() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("esports_players")
      .select("*")
      .order("ign", { ascending: true })
      .then(({ data }) => {
        setPlayers(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 space-y-8">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-wider text-white">
          National Esports Registry
        </h1>
        <p className="font-mono text-xs text-void-400 uppercase tracking-widest">
          Elite Ranked Professional Competitors // Pakistan Division
        </p>
      </div>

      {players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Card key={player.id} className="border border-border/40 bg-void-950/20 backdrop-blur-md overflow-hidden rounded-xl transition-all hover:border-primary/40 group">
              <div className="h-[2px] bg-void-800 group-hover:bg-primary transition-colors w-full" />
              
              <CardContent className="p-6 space-y-5">
                {/* Identity Block */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="font-mono text-[9px] font-bold uppercase text-primary tracking-widest block mb-0.5">
                      {player.primary_game}
                    </span>
                    <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-wide text-white truncate">
                      {player.ign}
                    </h2>
                    <p className="font-mono text-[10px] text-void-400 truncate">
                      {player.full_name || "Anonymous Operative"}
                    </p>
                  </div>

                  <div className="h-12 w-12 rounded-lg border border-border/40 bg-void-900 flex items-center justify-center font-mono font-black text-void-500 text-xl group-hover:text-white group-hover:border-primary/40 transition-all">
                    {player.ign.substring(0, 2)}
                  </div>
                </div>

                {/* Sub-Metrics Section */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/20 font-mono text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-void-500 uppercase font-bold block">Current Squad</span>
                    <span className="text-white uppercase tracking-wide font-medium flex items-center gap-1">
                      <Shield size={11} className="text-primary" /> {player.current_team}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-void-500 uppercase font-bold block">Role Matrix</span>
                    <span className="text-void-200 uppercase tracking-wide font-medium flex items-center gap-1">
                      <Swords size={11} className="text-primary" /> {player.role || "Flex"}
                    </span>
                  </div>
                </div>

                {/* Achievements Container */}
                {player.achievements && player.achievements.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border/20">
                    <span className="font-mono text-[9px] uppercase font-bold text-void-500 tracking-wider flex items-center gap-1">
                      <Trophy size={11} className="text-amber-400" /> Confirmed Track Record
                    </span>
                    <div className="space-y-1">
                      {player.achievements.slice(0, 3).map((ach: string, i: number) => (
                        <div key={i} className="font-mono text-[9px] text-void-300 uppercase truncate bg-void-950/40 border border-border/10 rounded px-2 py-1">
                          {ach}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border/30 rounded-xl bg-void-950/10">
          <p className="font-mono text-xs text-void-500 uppercase font-bold tracking-widest">
            No Competitive Profiles Loaded in Database Core
          </p>
        </div>
      )}
    </div>
  );
}