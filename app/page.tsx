"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Users, ChevronLeft, ChevronRight, Globe, Shield, Zap, Terminal, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import AnnouncementTicker from "@/components/layout/AnnouncementTicker";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const SLIDER_IMAGES = [
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80",
];

export default function Home() {
  const [teams, setTeams] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: teamsData }, { data: achievementsData }, { data: sponsorsData }] = await Promise.all([
        supabase.from("teams").select("*, players(id)").limit(6),
        supabase.from("team_achievements").select("*, teams(name, game)").order("created_at", { ascending: false }).limit(6),
        supabase.from("sponsors").select("*").order("tier"),
      ]);
      if (teamsData) setTeams(teamsData.map((t: any) => ({ ...t, player_count: t.players?.length || 0 })));
      if (achievementsData) setAchievements(achievementsData.map((a: any) => ({ id: a.id, title: a.title, year: a.year, team_name: a.teams?.name, game: a.teams?.game })));
      if (sponsorsData) setSponsors(sponsorsData);
      setLoading(false);
    };
    fetchData();
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % SLIDER_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-void-950 selection:bg-primary selection:text-void-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsOrganization",
            name: "Prime Esports",
            url: "https://prime-esports.gg",
            description: "Prime Esports is Pakistan's #1 competitive esports organization, fielding elite rosters across multiple titles.",
            sameAs: ["https://discord.gg/jGESmkDb", "https://youtube.com/@primeesports-gg"],
          }),
        }}
      />
      <div className="w-full overflow-hidden border-b border-void-700/40 bg-void-900"><AnnouncementTicker /></div>
      <Header />
      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="relative overflow-hidden bg-void-950 pt-40 pb-24 border-b border-border">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(45deg,#15FFB5,#15FFB5 10px,transparent 10px,transparent 20px)` }} />
          <div className="container relative z-10 text-center">
            <div className="inline-flex items-center gap-3 bg-void-900 border border-void-600/40 text-foreground px-6 py-2 rounded-full mb-8">
              <Shield size={16} className="text-primary" />
              <span className="text-[10px] font-semibold tracking-wide">#1 Esports Org</span>
            </div>
            <h1 className="mb-8 text-7xl md:text-9xl font-display font-semibold tracking-tight text-white leading-[0.85]">
              Compete at the <br /><span className="text-neon">Highest Level</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-8 mb-12 max-w-2xl mx-auto">
              <div className="h-px flex-1 bg-void-700/60" />
              <p className="text-[11px] font-medium text-void-300 shrink-0">Elite Rosters // Global Dominance</p>
              <div className="h-px flex-1 bg-void-700/60" />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-neon-gradient hover:opacity-90 text-void-900 font-semibold text-sm h-16 px-12 rounded-xl shadow-neon transition-all hover:shadow-neon-strong" asChild>
                <Link href="/scrims">Initialize Entry <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border border-void-600/60 text-white font-semibold text-sm h-16 px-12 rounded-xl hover:bg-void-800 hover:border-primary/40 transition-all" asChild>
                <Link href="/teams">View Rosters</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-void-900 py-16 border-b border-border">
          <div className="container">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[{ icon: Trophy, label: "Victories", value: "25+" }, { icon: Users, label: "Operators", value: "50+" }, { icon: Target, label: "Sectors", value: "06" }, { icon: Terminal, label: "Uptime", value: "05Y" }].map((s) => (
                <div key={s.label} className="text-center group border-l border-void-700/40 first:border-0">
                  <s.icon className="mx-auto mb-4 h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
                  <div className="text-5xl font-display font-semibold tracking-tight text-white">{s.value}</div>
                  <div className="text-[10px] font-medium text-primary mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Teams Grid */}
        <section className="py-32 bg-background">
          <div className="container">
            <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between border-b border-void-700/40 pb-10">
              <div>
                <div className="flex items-center gap-3 text-primary mb-4"><Zap size={20} fill="currentColor" /><span className="text-xs font-semibold tracking-wide">Operational Units</span></div>
                <h2 className="text-5xl md:text-7xl font-display font-semibold tracking-tight text-foreground leading-none">Active <span className="text-neon">Squads</span></h2>
              </div>
              <Button variant="ghost" className="mt-8 md:mt-0 font-semibold text-sm text-foreground border border-void-600/40 rounded-xl hover:bg-void-800 hover:text-white" asChild>
                <Link href="/teams">Access All Data <ChevronRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-80 border border-void-700/40 bg-card rounded-2xl animate-pulse" />) : teams.map((team) => (
                <Card key={team.id} className="border border-void-700/40 bg-card rounded-2xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-void-950/20">
                  <CardContent className="p-10 space-y-8">
                    <div className="flex items-start justify-between">
                      <div className="flex h-16 w-16 items-center justify-center border border-void-700/40 bg-void-900 text-3xl rounded-xl shadow-sm group-hover:bg-primary group-hover:text-void-900 transition-colors">{team.logo}</div>
                      <Badge className="bg-void-900 text-foreground rounded-lg border border-void-700/40 text-[10px] font-semibold px-3 py-1">{team.game}</Badge>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-display font-semibold tracking-tight text-foreground leading-none mb-3">{team.name}</CardTitle>
                      <p className="text-[13px] font-medium text-void-300 leading-relaxed line-clamp-2">{team.description || "Executing global competitive dominance."}</p>
                    </div>
                    <Button variant="outline" className="w-full h-14 border border-void-600/40 rounded-xl hover:bg-void-800 hover:text-white font-semibold text-sm transition-all" asChild>
                      <Link href={`/teams/${team.id}`}>Open Dossier <ChevronRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements + Slider */}
        <section className="py-32 bg-void-950 border-y border-border relative">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Trophy size={200} className="text-foreground" /></div>
          <div className="container relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block bg-primary text-void-900 px-4 py-1 font-semibold text-[10px] tracking-wide rounded-lg mb-6">Records Archive</div>
                <h2 className="text-6xl md:text-8xl font-display font-semibold tracking-tight text-white leading-[0.85] mb-10">Recent <br /><span className="text-neon">Victories</span></h2>
                <div className="space-y-4">
                  {achievements.slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-center gap-6 bg-void-900/60 p-6 border-l-2 border-primary group hover:bg-void-900 transition-colors rounded-r-xl">
                      <Trophy className="text-primary h-6 w-6 shrink-0 group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="text-white text-lg font-display font-semibold tracking-tight">{a.title}</div>
                        <div className="text-primary text-[11px] font-medium">{a.team_name} // {a.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="group relative aspect-square md:aspect-video border border-void-700/40 shadow-neon-cobalt overflow-hidden bg-void-900 rounded-2xl">
                {SLIDER_IMAGES.map((img, idx) => (
                  <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? "opacity-100" : "opacity-0"}`}>
                    <img src={img} alt={`Victory ${idx + 1}`} className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  </div>
                ))}
                <div className="absolute bottom-10 left-10">
                  <div className="bg-primary text-void-900 px-3 py-1 inline-block text-[10px] font-semibold tracking-wide rounded-lg mb-2">Live Feed</div>
                  <p className="text-white text-3xl font-display font-semibold tracking-tight">Prime Champions Circuit</p>
                </div>
                <button onClick={() => setCurrentSlide((p) => (p - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length)} className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-void-900 border border-void-600/40 flex items-center justify-center text-white rounded-xl hover:bg-primary hover:text-void-900 transition-all"><ChevronLeft className="h-8 w-8" /></button>
                <button onClick={() => setCurrentSlide((p) => (p + 1) % SLIDER_IMAGES.length)} className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-void-900 border border-void-600/40 flex items-center justify-center text-white rounded-xl hover:bg-primary hover:text-void-900 transition-all"><ChevronRight className="h-8 w-8" /></button>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsors */}
        {sponsors.length > 0 && (
          <section className="py-20 bg-background">
            <div className="container">
              <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                {sponsors.map((s) => <img key={s.id} src={s.logo_url || ""} alt={s.name} className="h-10 md:h-14 w-auto object-contain" />)}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-40 bg-background relative">
          <div className="container text-center">
            <div className="max-w-5xl mx-auto bg-card border border-void-700/40 p-16 md:p-24 shadow-xl relative rounded-2xl">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-void-900 border border-void-700/40 text-foreground px-10 py-3 rounded-full">
                <span className="text-sm font-semibold tracking-wide">Enlist Now</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-display font-semibold tracking-tight text-foreground leading-[0.85] mb-10">Become a <span className="text-neon">Legend</span></h2>
              <p className="mb-12 text-void-300 font-medium text-sm max-w-xl mx-auto">Execution over excuses. Scrim against the elite, prove your tactical value, and secure your contract.</p>
              <Button size="lg" className="bg-neon-gradient hover:opacity-90 text-void-900 font-semibold text-sm h-20 px-16 rounded-xl shadow-neon transition-all hover:shadow-neon-strong" asChild>
                <Link href="/scrims">Initialize Trial</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}