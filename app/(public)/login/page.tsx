"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Terminal, Mail, Lock, Eye, EyeOff, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push(isAdmin ? "/admin" : "/");
  }, [user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message || "Invalid credentials. Please try again.");
    } else {
      toast.success("Welcome back, Operator!");
    }
    setLoading(false);
  };

  return (
    <section className="flex min-h-screen items-center justify-center py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(90deg, #15FFB5 1px, transparent 1px), linear-gradient(#15FFB5 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="w-full max-w-md relative z-10 px-4">
        <div className="bg-card border border-void-700/40 shadow-xl relative overflow-hidden rounded-2xl">
          <div className="bg-void-950 p-8 text-foreground relative border-b border-void-700/40">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={40} className="text-primary" /></div>
            <div className="flex items-center gap-3 mb-2"><Terminal size={18} className="text-primary" /><span className="text-[10px] font-medium tracking-wide text-void-300">Auth Protocol v.04</span></div>
            <h1 className="text-4xl font-display font-semibold tracking-tight leading-none">Login <span className="text-neon">Command</span></h1>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2"><Mail size={12} className="text-primary" /><label className="text-[10px] font-medium text-void-300 tracking-wide">User Identifier</label></div>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@prime.net" required className="bg-void-950 border border-void-700/40 rounded-xl h-14 font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><Lock size={12} className="text-primary" /><label className="text-[10px] font-medium text-void-300 tracking-wide">Access Key</label></div>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="bg-void-950 border border-void-700/40 rounded-xl h-14 font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary" />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-void-400 hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" className="rounded-lg border border-void-600/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <label htmlFor="remember" className="text-[11px] font-medium text-void-300 tracking-wide cursor-pointer">Stay logged in</label>
              </div>
            </div>
            <Button type="submit" className="w-full h-16 bg-neon-gradient hover:opacity-90 text-void-900 rounded-xl font-semibold text-sm transition-all hover:shadow-neon-strong" disabled={loading}>
              {loading ? <Zap className="animate-spin" /> : <span className="flex items-center gap-3">Initialize Session <ChevronRight size={18} /></span>}
            </Button>
            <div className="mt-8 pt-6 border-t border-void-700/40 flex flex-col items-center gap-4">
              <p className="text-[11px] font-medium text-void-300 tracking-wide">New Recruit?</p>
              <Button variant="outline" className="w-full h-12 border border-void-600/40 rounded-xl font-semibold text-sm hover:bg-void-800 hover:text-white transition-all" asChild>
                <Link href="/signup">Join the Roster</Link>
              </Button>
            </div>
          </form>
          <div className="bg-void-900/60 border-t border-void-700/40 p-3 flex justify-between items-center px-8">
            <div className="flex gap-1"><div className="w-2 h-2 bg-primary rounded-full" /><div className="w-2 h-2 bg-void-600 rounded-full" /><div className="w-2 h-2 bg-void-600 rounded-full" /></div>
            <span className="text-[8px] font-medium text-void-400 tracking-wide">Secure encryption active</span>
          </div>
        </div>
      </div>
    </section>
  );
}