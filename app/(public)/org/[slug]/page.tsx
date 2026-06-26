"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Trophy, Calendar, Shield, Loader2, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { JoinOrgModal } from "@/components/JoinOrgModal";

function OrgPageClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [org, setOrg] = useState<any>(null);
  const [scrims, setScrims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgData = async () => {
      const { data: orgData } = await supabase.from("organizations").select("*").eq("slug", slug).single();
      setOrg(orgData);
      if (orgData) {
        const { data: scrimsData } = await supabase.from("scrims").select("*").eq("org_id", orgData.id).eq("status", "upcoming").order("scheduled_at");
        setScrims(scrimsData || []);
      }
      setLoading(false);
    };
    fetchOrgData();
  }, [slug]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!org) return <div className="text-foreground font-semibold text-center py-20">Organization Not Found</div>;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden border-b border-border bg-void-950">
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-3 bg-void-900 border border-void-600/40 text-foreground px-6 py-2 rounded-full mb-6"><Shield size={16} className="text-primary" /><span className="text-[10px] font-semibold tracking-wide">Verified Operator ID</span></div>
          <h1 className="text-6xl md:text-9xl font-display font-semibold tracking-tight leading-[0.85] mb-4 text-foreground">{org.name}</h1>
          <div className="flex items-center justify-center gap-4 mt-6"><div className="h-px w-12 bg-void-600/40" /><p className="text-[10px] font-medium text-void-300 tracking-wide">Established Infrastructure // Powered by Prime</p><div className="h-px w-12 bg-void-600/40" /></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-void-700/40 pb-4">
              <h2 className="text-3xl font-display font-semibold tracking-tight flex items-center gap-4 text-foreground"><Terminal className="text-primary h-8 w-8" /> Active Deployments</h2>
              <Badge className="bg-void-900 text-void-300 border-none font-medium text-[10px] px-4 rounded-lg">{scrims.length} Units</Badge>
            </div>
            {scrims.length === 0 ? (
              <div className="text-center py-20 bg-card border border-dashed border-void-700/40 rounded-2xl"><p className="text-void-300 font-medium text-sm">No active deployments scheduled.</p></div>
            ) : (
              <div className="grid gap-4">
                {scrims.map((s) => (
                  <div key={s.id} className="bg-card border border-void-700/40 p-6 flex items-center justify-between rounded-xl">
                    <div><h3 className="font-semibold tracking-tight text-xl text-foreground">{s.title}</h3><p className="text-[11px] font-medium text-void-300 flex items-center gap-2 mt-2"><Calendar size={12}/>{new Date(s.scheduled_at).toLocaleString()}</p></div>
                    <Badge className="bg-void-900 text-foreground rounded-lg border border-void-700/40">{s.game}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-void-900 text-foreground p-8 rounded-2xl border border-void-700/40 border-l-2 border-l-primary">
              <Trophy className="text-primary mb-4" />
              <h3 className="text-xl font-display font-semibold tracking-tight mb-2">Org Profile</h3>
              <p className="text-[13px] font-medium text-void-300">{org.description || "Competitive gaming organization powered by Prime Esports infrastructure."}</p>
            </div>
            <Link href="/teams" className="block text-center bg-neon-gradient text-void-900 p-4 font-semibold text-sm rounded-xl hover:opacity-90 transition-all hover:shadow-neon">View All Teams</Link>
            <JoinOrgModal orgId={org.id} orgName={org.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default OrgPageClient;