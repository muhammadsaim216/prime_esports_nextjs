"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, Send, Shield, Terminal, Zap } from "lucide-react";

export function JoinOrgModal({ orgId, orgName }: { orgId: string; orgName: string }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ discord: "", role: "", experience: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Identity verification failed. Please login."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("team_applications").insert([{ org_id: orgId, user_id: user.id, discord_handle: formData.discord, position: formData.role, message: formData.experience, status: "pending" }]);
      if (error) throw error;
      toast.success(`Application submitted to ${orgName}.`);
      setOpen(false);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-16 bg-neon-gradient hover:opacity-90 text-void-900 rounded-xl font-semibold text-sm transition-all hover:shadow-neon-strong group">
          Apply to Roster <Shield className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-void-900 border border-void-700/40 text-foreground rounded-2xl sm:max-w-[450px] p-0 overflow-hidden shadow-xl">
        <div className="bg-void-950 p-6 flex items-center justify-between border-b border-void-700/40">
          <DialogHeader><DialogTitle className="text-2xl font-display font-semibold tracking-tight text-foreground flex items-center gap-3"><Terminal className="text-primary" />Recruitment <span className="text-neon">Dossier</span></DialogTitle></DialogHeader>
          <div className="bg-primary text-void-900 px-2 py-1 rounded-lg"><span className="text-[10px] font-semibold">v.03</span></div>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1"><Zap size={12} className="text-primary" /><label className="text-[10px] font-medium text-void-300 tracking-wide">Network Identity</label></div>
            <Input required placeholder="DiscordTag#0000" className="bg-void-950 border border-void-700/40 rounded-xl h-14 font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary" value={formData.discord} onChange={(e) => setFormData({ ...formData, discord: e.target.value })} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1"><Zap size={12} className="text-primary" /><label className="text-[10px] font-medium text-void-300 tracking-wide">Tactical Role</label></div>
            <Input required placeholder="e.g. Entry Fragger / IGL" className="bg-void-950 border border-void-700/40 rounded-xl h-14 font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1"><Zap size={12} className="text-primary" /><label className="text-[10px] font-medium text-void-300 tracking-wide">Combat History</label></div>
            <Textarea required placeholder="List previous teams or operational achievements..." className="bg-void-950 border border-void-700/40 rounded-xl min-h-[120px] font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary resize-none" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full h-16 bg-neon-gradient hover:opacity-90 text-void-900 rounded-xl font-semibold text-sm transition-all hover:shadow-neon-strong">
              {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-3">Submit to Command <Send className="h-4 w-4" /></span>}
            </Button>
            <p className="text-[10px] font-medium text-center text-void-400 mt-4">Attention: False credentials will result in permanent blacklist.</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}