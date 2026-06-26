"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Rocket, ShieldCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
        // Updated redirect target route to point cleanly to your real dashboard folder pathway
        if (data?.org_id) router.push("/dashboard/admin/scrims");
      } finally {
        setCheckingStatus(false);
      }
    })();
  }, [user, router]);

  const handleCreateWorkspace = async () => {
    if (!user || !orgName.trim()) return;
    setIsSubmitting(true);
    try {
      const { data: org, error: orgError } = await supabase.from("organizations").insert([{ name: orgName.trim(), owner_id: user.id }]).select().single();
      if (orgError) throw orgError;
      const { error: profileError } = await supabase.from("profiles").upsert({ id: user.id, org_id: org.id, role: "owner", updated_at: new Date().toISOString() });
      if (profileError) throw profileError;
      toast.success(`Welcome to the bridge, Commander of ${orgName}.`);
      // Updated post-creation router push destination to dashboard workspace base area
      router.push("/dashboard/admin/scrims");
    } catch (err: any) { toast.error(err.message); }
    finally { setIsSubmitting(false); }
  };

  if (checkingStatus) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-void-950">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-void-950 text-foreground p-4 relative overflow-hidden">
      {/* Background Peripheral Vectors */}
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary))_0.5px,transparent_0.5px)] [background-size:20px_20px] opacity-[0.04] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />
      
      <Card className="relative max-w-sm w-full rounded-xl border border-border/80 overflow-hidden bg-card/40 backdrop-blur-md shadow-2xl z-10">
        <div className="h-[3px] bg-primary w-full" />
        
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="mx-auto h-16 w-16 bg-void-900/80 border border-border/80 rounded-lg flex items-center justify-center mb-5 shadow-inner transition-transform hover:scale-102 duration-300">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl font-display font-black uppercase tracking-wide text-white leading-none">
            Initialize <br /><span className="text-primary">Workspace</span>
          </CardTitle>
          <div className="font-mono text-void-400 uppercase text-[9px] tracking-wider mt-3 bg-void-900/40 w-fit mx-auto px-2 py-0.5 rounded-sm border border-border/30">
            Deployment Phase 01
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Organization Name</label>
            <Input 
              placeholder="e.g. PRIME ELITE" 
              className="h-11 rounded-lg bg-void-900/60 border-border text-white font-medium text-sm focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-void-600" 
              value={orgName} 
              onChange={(e) => setOrgName(e.target.value)} 
              disabled={isSubmitting} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-void-900/20 border border-border/40 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span className="text-[9px] font-mono uppercase text-void-400 tracking-wide leading-tight">Secure <br /><span className="text-void-300">Database</span></span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-void-900/20 border border-border/40 shadow-xs">
              <Globe className="h-4 w-4 text-primary shrink-0" />
              <span className="text-[9px] font-mono uppercase text-void-400 tracking-wide leading-tight">Global <br /><span className="text-void-300">Deployment</span></span>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateWorkspace} 
            disabled={isSubmitting || !orgName.trim()} 
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-display font-bold uppercase tracking-wider text-xs transition-colors shadow-md mt-1"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-4 w-4 stroke-[3]" />
            ) : (
              <span className="flex items-center gap-1.5 tracking-wide">
                Establish Command <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
              </span>
            )}
          </Button>
          
          <p className="text-center text-[9px] text-void-500 font-medium uppercase tracking-wider leading-relaxed max-w-[240px] mx-auto">
            By initializing, you agree to the SaaS operational protocols.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}