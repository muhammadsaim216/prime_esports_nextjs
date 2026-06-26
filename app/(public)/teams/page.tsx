"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, Users, Target, Zap, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    const fetchTeams = async () => {
      // Explicitly fetching the new database boolean column alongside achievements
      const { data } = await supabase.from("teams").select("*, team_achievements(id,title)");
      if (data) {
        setTeams(data);
        setCategories(["All", ...(Array.from(new Set(data.map((t: any) => t.category).filter(Boolean))) as string[])]);
      }
      setLoading(false);
    };
    fetchTeams();
  }, []);

  const filtered = selectedCategory === "All" ? teams : teams.filter((t) => t.category === selectedCategory);

  return (
    <>
      <section className="relative bg-void-950 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#15FFB5_0%,transparent_50%)]" />
        </div>
        <div className="container relative z-10 px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 bg-void-900/50 border border-void-700/40 rounded-full px-4 py-1.5">
            <Zap className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[9px] font-medium tracking-wide text-void-300">Tactical Deployments</span>
          </div>
          <h1 className="mb-4 text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground uppercase">
            Elite <span className="text-neon">Squads</span>
          </h1>
          <p className="mx-auto max-w-xl text-void-300 font-medium text-xs md:text-sm">
            The front line of Prime Esports. Managed for excellence, engineered for victory.
          </p>
        </div>
      </section>

      <section className="sticky top-[80px] z-30 bg-void-950/60 backdrop-blur-2xl py-4 border-y border-void-700/40">
        <div className="container px-4 flex flex-wrap items-center justify-center gap-2.5">
          {categories.map((cat) => (
            <Button 
              key={cat} 
              variant="ghost" 
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-6 font-medium text-[10px] h-9 border transition-all duration-300 ${
                selectedCategory === cat 
                  ? "bg-primary text-void-900 border-primary font-bold" 
                  : "bg-void-900/50 text-void-300 border-void-700/40 hover:text-white"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container px-4">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-96 rounded-xl bg-void-900/50 animate-pulse border border-void-700/40" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((team) => (
                <Card key={team.id} className="relative border border-void-700/40 bg-card rounded-xl overflow-hidden group transition-all duration-500 hover:border-primary/30 flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <Target className="w-16 h-16 text-primary" />
                  </div>
                  
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4 relative z-10">
                    <div className="space-y-3">
                      {/* Top Meta Row */}
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-primary/10 text-primary border border-primary/20 text-[8px] font-mono tracking-wider px-2 py-0.5 rounded-sm uppercase">
                          {team.game}
                        </Badge>
                        
                        {/* Interactive Pipeline State Check Label */}
                        {team.is_open_for_applications ?? true ? (
                          <span className="inline-flex items-center text-[8px] font-mono text-emerald-400 gap-1 uppercase tracking-wider">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Recruiting
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[8px] font-mono text-void-500 gap-1 uppercase tracking-wider">
                            <Lock className="h-2.5 w-2.5" /> Locked
                          </span>
                        )}
                      </div>

                      {/* Header Segment */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-void-900 text-2xl border border-void-700/40 transition-transform duration-500 group-hover:scale-105">
                          {team.logo}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base font-display font-bold uppercase tracking-wide text-white truncate group-hover:text-primary transition-colors">
                            {team.name}
                          </CardTitle>
                          <p className="text-[9px] font-mono text-void-400 tracking-wider uppercase mt-0.5">
                            Div // {team.category}
                          </p>
                        </div>
                      </div>

                      <div className="h-px w-full bg-gradient-to-r from-void-700/30 via-void-600/20 to-transparent" />
                      
                      {/* Slim Content Summary Paragraph */}
                      <p className="text-[11px] font-medium text-void-300 leading-relaxed line-clamp-2 min-h-[32px]">
                        {team.description || "Elite squad competing for the championship."}
                      </p>
                    </div>

                    {/* Achievements Summary Deck Component */}
                    <div className="space-y-2">
                      {team.team_achievements?.length > 0 ? (
                        <div className="space-y-1.5 bg-void-900/30 p-3 rounded-lg border border-void-700/30">
                          <div className="flex items-center gap-1.5 text-primary">
                            <Trophy className="h-3 w-3" />
                            <span className="text-[8px] font-mono uppercase tracking-wider">Combat Record</span>
                          </div>
                          {team.team_achievements.slice(0, 2).map((a: any) => (
                            <div key={a.id} className="text-[10px] font-medium text-foreground flex items-center gap-2 truncate">
                              <span className="h-1 w-1 bg-primary rounded-full shrink-0" />
                              <span className="truncate">{a.title}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-14 flex flex-col items-center justify-center border border-dashed border-void-700/30 rounded-lg opacity-40 text-void-500">
                          <Users className="h-3.5 w-3.5 mb-1" />
                          <span className="text-[8px] font-mono uppercase tracking-wider">Awaiting Data</span>
                        </div>
                      )}

                      {/* Navigation Link Routing Button Component */}
                      <Button className="w-full h-9 bg-void-900 text-foreground hover:bg-primary hover:text-void-900 rounded-lg font-bold text-xs transition-all mt-1" asChild>
                        <Link href={`/teams/${team.id}`}>
                          View Dossier <ChevronRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-void-700/40 rounded-xl">
              <Users className="mx-auto h-12 w-12 text-void-700 mb-4" />
              <p className="text-void-300 font-medium text-xs">Sector clear. No active squads found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}