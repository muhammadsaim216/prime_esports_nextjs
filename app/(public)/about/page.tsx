import type { Metadata } from "next";
import { Trophy, Users, Heart, Target, ShieldCheck, Star, Zap, Terminal } from "lucide-react";

export const metadata: Metadata = { 
  title: "About", 
  description: "Learn about Prime Esports — our mission, values, and journey to the top of competitive gaming." 
};

const values = [
  { icon: Trophy, title: "Excellence", description: "We strive for greatness in every competition, pushing boundaries and setting new standards." },
  { icon: Users, title: "Teamwork", description: "Success comes from collaboration. We build strong bonds and support each other." },
  { icon: Heart, title: "Passion", description: "Our love for competitive gaming drives everything we do, from practice to performance." },
  { icon: Target, title: "Dedication", description: "We're committed to constant improvement, putting in the work to achieve our goals." },
];

const milestones = [
  { year: "2025", title: "The Genesis", description: "Prime Esports was established with a vision to dominate the digital arena." },
  { year: "2026", title: "Roster Expansion", description: "Expanded into a global community of competitive gamers and elite rosters." },
];

const stats = [
  { label: "Pro Units", value: "50+" }, 
  { label: "Victories", value: "25+" },
  { label: "Deployed Rosters", value: "04" }, 
  { label: "Community Reach", value: "1M+" },
];

export default function AboutPage() {
  return (
    <div className="text-foreground bg-background min-h-screen grid-texture">
      {/* Hero Section */}
      <section className="relative pt-36 pb-28 border-b border-border overflow-hidden bg-void-950/40 backdrop-blur-sm">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[128px] pointer-events-none" />

        <div className="container relative z-10 text-center px-4 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 bg-void-900 border border-border px-4 py-1.5 rounded-full shadow-sm animate-neon-pulse">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] font-medium text-void-300">
              Mission Directive: <span className="text-primary font-bold">541404</span>
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-semibold tracking-tight text-white leading-none">
            Prime <span className="text-neon">Legacy</span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-[11px] font-mono text-void-300 leading-relaxed glass px-5 py-2.5 rounded-xl">
            Building Champions // Creating Legends // Dominating Circuits
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="bg-transparent">
        <div className="container py-24 px-4 max-w-7xl mx-auto">

          {/* Objectives & Values Grid */}
          <div className="grid gap-16 lg:grid-cols-2 mb-40 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-4 w-1 bg-neon-gradient rounded-full" />
                <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-foreground">
                  Core <span className="text-primary">Objectives</span>
                </h2>
              </div>
              <p className="text-sm font-sans font-normal leading-relaxed text-void-300 max-w-xl">
                Prime Esports exists to discover, develop, and support the world's most talented competitive gamers. We provide the high-performance ecosystem needed for players to breach limits and materialize full execution capabilities.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-3 bg-void-900/60 backdrop-blur-sm px-4 py-2.5 border border-border rounded-xl shadow-2xs">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-mono font-medium text-void-200">Elite Standards</span>
                </div>
                <div className="flex items-center gap-3 bg-void-900/60 backdrop-blur-sm px-4 py-2.5 border border-border rounded-xl shadow-2xs">
                  <Star className="h-4 w-4 text-accent" />
                  <span className="text-[11px] font-mono font-medium text-void-200">Player First</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((v) => (
                <div key={v.title} className="relative p-6 border border-border rounded-xl bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/70 group overflow-hidden shadow-sm hover:shadow-md">
                  <div className="absolute top-4 right-4 opacity-[0.02] group-hover:opacity-[0.07] group-hover:scale-105 transition-all duration-300 text-foreground pointer-events-none">
                    <v.icon size={56} />
                  </div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center bg-void-900 border border-border text-white rounded-xl transition-colors duration-300 group-hover:border-primary/40">
                    <v.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mb-2 text-base font-display font-semibold tracking-tight text-foreground">
                    {v.title}
                  </h3>
                  <p className="text-xs font-sans font-normal leading-relaxed text-void-300">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Block */}
          <div className="mb-40 p-8 sm:p-12 md:p-16 text-white rounded-xl border border-border bg-void-950/40 backdrop-blur-sm relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[96px] pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20">
              <div className="lg:w-1/3 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight leading-none">
                    Operational <span className="text-primary">Log</span>
                  </h2>
                  <p className="text-[11px] font-mono font-medium text-void-300">
                    evolution_of_dominance.exe
                  </p>
                </div>
                <div className="h-px w-16 bg-neon-gradient" />
              </div>
              <div className="lg:w-2/3 space-y-10 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-px before:bg-void-700">
                {milestones.map((m) => (
                  <div key={m.year} className="relative flex gap-6 sm:gap-8 items-start group">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 flex items-center justify-center bg-void-900 border border-border text-primary font-mono font-bold text-xs rounded-xl z-10 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-neon">
                        {m.year.slice(2)}
                      </div>
                    </div>
                    <div className="pt-1 space-y-1.5">
                      <h3 className="text-lg font-display font-semibold tracking-tight flex items-center gap-2 text-white">
                        <Zap className="h-3.5 w-3.5 text-accent" /> {m.title}
                      </h3>
                      <p className="text-void-300 text-xs font-sans font-normal leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {stats.map((s) => (
              <div key={s.label} className="bg-card/40 backdrop-blur-sm border border-border p-8 rounded-xl text-center relative overflow-hidden shadow-2xs group hover:border-primary/20 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-right from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="text-4xl sm:text-5xl font-display font-semibold text-white tracking-tight group-hover:text-primary transition-colors duration-300">
                  {s.value}
                </div>
                <div className="text-[10px] font-mono font-medium text-void-300 mt-4 bg-void-900/60 w-fit mx-auto px-3 py-1 rounded-lg border border-border/50">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}