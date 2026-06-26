"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Send, User, Shield, Info, Trophy, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const inputStyle = "w-full rounded-xl border border-void-700/40 bg-void-950 px-6 py-4 font-medium text-foreground outline-none transition-all hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-void-400";
const textAreaStyle = "w-full rounded-2xl border border-void-700/40 bg-void-950 px-6 py-4 font-medium text-foreground outline-none resize-none transition-all hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-void-400";

function TeamDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await supabase.from("teams").select("*, players(*)").or(`id.eq.${id},name.eq.${id}`).single();
      setTeam(data);
      setLoading(false);
    };
    fetchTeam();
  }, [id]);

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.from("roster_applications").insert([{
        team_id: team?.id,
        full_name: formData.get("playerName"),
        role: formData.get("role"),
        discord_tag: formData.get("discord"),
        message: formData.get("message"),
        pubg_uid: formData.get("pubg_uid"),
        pubg_kd: formData.get("pubg_kd"),
        pubg_rank: formData.get("pubg_rank"),
        pubg_device: formData.get("pubg_device"),
        pubg_exp: formData.get("pubg_exp"),
        status: "pending",
      }]);
      if (error) throw error;
      setIsSubmitted(true);
      toast.success("Application Sent! Management will review it soon.");
    } catch (err: any) {
      toast.error("Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPUBG = team?.game?.toUpperCase().includes("PUBG");
  const isOpenForApplications = team?.is_open_for_applications ?? true;

  if (loading) return <div className="container py-24"><Skeleton className="h-96 w-full rounded-2xl bg-void-900" /></div>;
  if (!team) return <div className="container py-16 text-center"><Button variant="ghost" asChild><Link href="/teams"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link></Button></div>;

  return (
    <>
      <section className="relative overflow-hidden bg-void-950 pt-20 pb-32">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="container relative z-10">
          <Link href="/teams" className="inline-flex items-center text-sm font-medium text-void-300 hover:text-primary transition-colors mb-12">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Teams
          </Link>
          <div className="flex flex-col items-center gap-10 md:flex-row">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-75 blur transition duration-1000 group-hover:opacity-100" />
              <div className="relative h-32 w-32 md:h-40 md:w-40 bg-void-900 rounded-3xl flex items-center justify-center border border-void-700/40 shadow-2xl text-7xl">{team.logo}</div>
            </div>
            <div className="text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge className="bg-primary text-void-900 px-4 py-1 rounded-lg text-xs font-semibold border-none">Official Roster</Badge>
                <Badge variant="outline" className="text-void-300 border-void-700/40 px-4 py-1 rounded-lg text-xs font-medium">{team.game}</Badge>
                {/* Visual Pipeline Status Badge */}
                {isOpenForApplications ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1 rounded-lg text-xs font-medium uppercase tracking-wider">Recruiting</Badge>
                ) : (
                  <Badge className="bg-void-800 text-void-400 border border-void-700/60 px-4 py-1 rounded-lg text-xs font-medium uppercase tracking-wider">Roster Locked</Badge>
                )}
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-semibold text-foreground tracking-tight leading-none">{team.name}</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background relative -mt-10 rounded-t-[3rem] border-t border-void-700/40">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-foreground mb-16 px-4">The <span className="text-neon">Lineup</span></h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {team.players?.map((player: any) => (
              <div key={player.id} className="group relative">
                <Card className="relative border-none bg-void-900 rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2">
                  <div className="aspect-[4/5] bg-gradient-to-b from-void-800 to-void-900 flex items-center justify-center relative">
                    <User className="h-24 w-24 text-void-700" />
                    <span className="absolute top-6 left-6 text-4xl font-display font-semibold text-void-700/20">{player.name?.charAt(0)}</span>
                    {player.rank && (
                      <div className="absolute bottom-4 left-4 right-4 bg-void-950/80 backdrop-blur-md border border-void-700/40 text-foreground text-[10px] font-medium px-3 py-2 rounded-xl flex items-center gap-2">
                        <Trophy className="h-3 w-3 text-primary" /> {player.rank}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-display font-semibold tracking-tight text-foreground truncate mb-1 group-hover:text-primary transition-colors">{player.name}</h3>
                    <div className="text-primary text-[10px] font-medium tracking-wide mb-4">{player.role}</div>
                    <div className="flex items-center gap-2 text-void-400 font-medium text-xs"><MapPin className="h-3 w-3" /> Pakistan</div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="py-32 bg-void-950 border-t border-void-700/40">
        <div className="container max-w-3xl">
          {isOpenForApplications ? (
            <>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-display font-semibold tracking-tight mb-4 text-foreground">Recruitment <span className="text-neon">Open</span></h2>
                <p className="text-void-300 font-medium text-sm">Apply to join {team.name} professional roster</p>
              </div>
              {isSubmitted ? (
                <div className="bg-card p-16 rounded-2xl border border-void-700/40 text-center">
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8"><Send className="text-primary h-10 w-10" /></div>
                  <h3 className="text-3xl font-display font-semibold tracking-tight text-foreground">Application Logged</h3>
                  <p className="text-void-300 font-medium mt-4 max-w-xs mx-auto">Our recruitment officers will review your stats and contact you via Discord.</p>
                  <Button className="mt-10 rounded-xl px-10 py-6 border border-primary text-primary font-semibold hover:bg-primary hover:text-void-900 transition-all" variant="outline" onClick={() => setIsSubmitted(false)}>Submit Another</Button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-6">
                  <div className="flex items-center gap-3 text-void-400 mb-4"><Shield className="h-4 w-4" /><span className="text-[10px] font-medium tracking-wide">Personal Information</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="playerName" required className={inputStyle} placeholder="In-Game Name" />
                    <input name="discord" required className={inputStyle} placeholder="Discord (user#0000)" />
                  </div>
                  {isPUBG && (
                    <div className="mt-12 space-y-6 pt-6 border-t border-void-700/40">
                      <div className="flex items-center gap-3 text-void-400 mb-4"><Info className="h-4 w-4" /><span className="text-[10px] font-medium tracking-wide">PUBG Mobile Stats</span></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input name="pubg_uid" required className={inputStyle} placeholder="Character ID" />
                        <input name="pubg_rank" required className={inputStyle} placeholder="Current Rank" />
                        <input name="pubg_kd" required className={inputStyle} placeholder="Season K/D" />
                      </div>
                      <input name="pubg_device" required className={inputStyle} placeholder="Primary Device" />
                      <textarea name="pubg_exp" className={`${textAreaStyle} min-h-[120px]`} placeholder="List your past teams & achievements..." />
                    </div>
                  )}
                  <div className="mt-12 space-y-6 pt-6 border-t border-void-700/40">
                    <input name="role" required className={inputStyle} placeholder="Desired Role (IGL, Entry, Sniper, etc.)" />
                    <textarea name="message" required className={`${textAreaStyle} min-h-[180px]`} placeholder="Why do you want to join us?" />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full py-10 text-xl bg-neon-gradient text-void-900 rounded-2xl font-semibold tracking-tight shadow-neon transition-all hover:opacity-90 disabled:opacity-70">
                    {isSubmitting ? "Transmitting Data..." : "Send Application"}
                  </Button>
                </form>
              )}
            </>
          ) : (
            /* Systemic Lock State Dynamic Banner Display Component */
            <div className="text-center py-16 border border-dashed border-void-700/40 rounded-3xl bg-void-900/20 max-w-xl mx-auto backdrop-blur-xs">
              <div className="h-14 w-14 bg-void-800 border border-void-700/40 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner text-void-400">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-wide text-white">Recruitment Pipeline Suspended</h2>
              <p className="text-void-400 text-xs font-medium max-w-sm mx-auto mt-2 leading-relaxed uppercase font-mono">
                Applications for {team.name} are currently closed. Check back later for structural adjustments.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default TeamDetailClient;