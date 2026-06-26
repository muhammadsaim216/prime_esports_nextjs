"use client";
import { useState } from "react";
import { Shield, Check, Terminal, Zap, Crown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const plans = [
  { name: "Rookie", price: "Free", description: "Perfect for new teams getting started.", features: ["Join 3 Scrims per week", "Basic Team Profile", "Public Discord Support"], premium: false },
  { name: "Pro Hunter", price: "RS. 2500", description: "For serious teams climbing the ranks.", features: ["Unlimited Scrims", "Verified Team Badge", "Priority Slot Entry", "Advanced Performance Stats"], premium: true },
  { name: "Elite", price: "RS. 6500", description: "The ultimate competitive package.", features: ["Everything in Pro", "Private Tournament Access", "Custom Team Branding", "1v1 Coaching Session/mo"], premium: false },
];

const JAZZCASH_NUMBER = "03001234567";
const ACCOUNT_NAME = "PRIME ESPORTS ADMIN";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  const handleSubmitPayment = async () => {
    if (!transactionId) { toast.error("Please enter the Transaction ID"); return; }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login first");
      const { data: team } = await supabase.from("teams").select("id").eq("owner_id", user.id).maybeSingle();
      if (!team) throw new Error("Create a team first in Settings!");
      const { error } = await supabase.from("subscription_requests").insert([{ team_id: team.id, user_id: user.id, plan_type: selectedPlan?.name.toLowerCase().includes("pro") ? "pro" : "elite", transaction_id: transactionId, status: "pending" }]);
      if (error) throw error;
      toast.success("Payment submitted! Admin will verify within 24 hours.");
      setSelectedPlan(null); setTransactionId("");
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(90deg,#15FFB5 1px,transparent 1px),linear-gradient(#15FFB5 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="container py-32 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-void-900 border border-void-600/40 text-foreground px-6 py-2 rounded-full mb-8">
            <Shield size={16} className="text-primary" /><span className="text-[10px] font-semibold tracking-wide">Subscription Protocols</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-semibold tracking-tight mb-4 leading-[0.85] text-foreground">Level Up Your <span className="text-neon">Game</span></h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`bg-card border border-void-700/40 rounded-2xl relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-void-950/10 hover:-translate-y-2 ${plan.premium ? "scale-105 z-20" : "z-10"}`}>
              {plan.premium && <div className="absolute top-0 right-0 bg-primary text-void-900 text-[9px] font-semibold px-4 py-2 rounded-bl-lg">Most Active</div>}
              <CardHeader className="pt-10">
                <div className="mb-4">{plan.premium ? <Zap className="w-5 h-5 text-primary" /> : plan.name === "Elite" ? <Crown className="w-5 h-5 text-primary" /> : <Terminal className="w-5 h-5 text-void-300" />}</div>
                <CardTitle className="text-3xl font-display font-semibold tracking-tight">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-display font-semibold">{plan.price}</span>
                  {plan.price !== "Free" && <span className="text-void-300 text-[10px] font-medium tracking-wide">/month</span>}
                </div>
                <CardDescription className="text-void-300 text-[11px] font-medium tracking-wide mt-4">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-8">
                {plan.features.map((f) => <div key={f} className="flex items-center gap-3 border-b border-void-700/20 pb-3"><Check className="w-4 h-4 text-primary" /><span className="text-xs text-void-200 font-medium">{f}</span></div>)}
              </CardContent>
              <CardFooter className="pb-10">
                <Button onClick={() => plan.price !== "Free" && setSelectedPlan(plan)} disabled={plan.price === "Free"}
                  className={`w-full h-14 font-semibold text-sm rounded-xl transition-all ${plan.premium ? "bg-neon-gradient text-void-900 hover:opacity-90 hover:shadow-neon" : "bg-void-900 text-foreground hover:bg-primary hover:text-void-900"} disabled:bg-void-800 disabled:text-void-500 disabled:opacity-50`}>
                  {plan.price === "Free" ? "Current Plan" : plan.premium ? "Upgrade to Pro" : "Go Elite"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-void-700/40 p-0 bg-void-900">
          <DialogHeader className="bg-void-950 text-foreground p-6 border-b border-void-700/40"><DialogTitle className="font-display font-semibold tracking-tight">Payment Portal — {selectedPlan?.name}</DialogTitle></DialogHeader>
          <div className="p-6 space-y-6">
            <div className="bg-void-950 p-4 border border-void-700/40 rounded-xl space-y-3">
              <p className="text-[10px] font-medium text-void-300 tracking-wide">1. Send payment via JazzCash</p>
              <div className="flex items-center justify-between bg-void-900 p-3 border border-void-700/40 rounded-xl">
                <div><p className="text-xs font-semibold text-foreground">{JAZZCASH_NUMBER}</p><p className="text-[9px] text-void-300">{ACCOUNT_NAME}</p></div>
                <Button size="sm" variant="outline" className="rounded-xl border-void-600/40 h-8 text-[10px]" onClick={() => copy(JAZZCASH_NUMBER)}><Copy className="h-3 w-3 mr-1" /> Copy</Button>
              </div>
              <p className="text-[11px] font-medium text-void-300">Amount: {selectedPlan?.price} / month</p>
            </div>
            <div>
              <label className="text-[10px] font-medium text-void-300 tracking-wide block mb-2">2. Enter Transaction ID (TID)</label>
              <Input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="TID from JazzCash" className="rounded-xl border border-void-700/40 h-12 font-medium focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-void-950" />
            </div>
            <Button onClick={handleSubmitPayment} disabled={submitting} className="w-full h-14 bg-neon-gradient text-void-900 rounded-xl font-semibold text-sm hover:opacity-90 transition-all hover:shadow-neon">
              {submitting ? "Submitting..." : "Submit Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}