"use client";
import { useState } from "react";
import Link from "next/link";
import { Shield, Terminal, Eye, EyeOff, ChevronRight, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "", discord: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.username, form.discord || undefined);
    if (error) {
      toast.error(error.message);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("players").insert([{ id: user.id, username: form.username, email: form.email, discord_tag: form.discord || null }]);
      }
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) return (
    <section className="flex min-h-screen items-center justify-center py-16 px-4 bg-background">
      <div className="w-full max-w-md bg-card border border-void-700/40 shadow-xl p-12 text-center rounded-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-void-950 rounded-2xl"><MailCheck className="h-10 w-10 text-primary" /></div>
        <h1 className="font-display font-semibold tracking-tight text-3xl leading-none mb-4 text-foreground">Verify System Access</h1>
        <p className="text-void-300 font-medium text-sm mb-6">Transmission sent to: <span className="text-foreground">{form.email}</span></p>
        <p className="text-void-300 font-medium text-sm leading-relaxed text-center border-y border-void-700/40 py-4 mb-6">Check your inbox and confirm your credentials to finalize account deployment.</p>
        <Button asChild className="w-full h-16 bg-neon-gradient text-void-900 hover:opacity-90 rounded-xl font-semibold text-sm hover:shadow-neon">
          <Link href="/login">Return to Login <ChevronRight size={18} className="ml-2" /></Link>
        </Button>
      </div>
    </section>
  );

  return (
    <section className="flex min-h-screen items-center justify-center py-20 bg-background relative overflow-hidden px-4">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(90deg, #15FFB5 1px, transparent 1px), linear-gradient(#15FFB5 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-card border border-void-700/40 shadow-xl overflow-hidden rounded-2xl">
          <div className="bg-void-950 p-8 text-foreground relative border-b border-void-700/40">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={40} className="text-primary" /></div>
            <div className="flex items-center gap-3 mb-2"><Terminal size={18} className="text-primary" /><span className="text-[10px] font-medium tracking-wide text-void-300">Enlist Protocol v.1</span></div>
            <h1 className="text-4xl font-display font-semibold tracking-tight leading-none">Join <span className="text-neon">Prime</span></h1>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {[
              { label: "Username", name: "username", type: "text", placeholder: "Callsign" },
              { label: "Email", name: "email", type: "email", placeholder: "operator@prime.net" },
              { label: "Discord (Optional)", name: "discord", type: "text", placeholder: "user#0000" },
            ].map((f) => (
              <div key={f.name}>
                <label className="text-[11px] font-medium text-void-300 tracking-wide block mb-2">{f.label}</label>
                <Input name={f.name} type={f.type} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder} required={f.name !== "discord"} className="bg-void-950 border border-void-700/40 rounded-xl h-14 font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary" />
              </div>
            ))}
            <div>
              <label className="text-[11px] font-medium text-void-300 tracking-wide block mb-2">Password</label>
              <div className="relative">
                <Input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="••••••••" required className="bg-void-950 border border-void-700/40 rounded-xl h-14 font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary" />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-void-400 hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-void-300 tracking-wide block mb-2">Confirm Password</label>
              <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required className="bg-void-950 border border-void-700/40 rounded-xl h-14 font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary" />
            </div>
            <Button type="submit" className="w-full h-16 bg-neon-gradient hover:opacity-90 text-void-900 rounded-xl font-semibold text-sm transition-all hover:shadow-neon" disabled={loading}>
              {loading ? "Deploying..." : "Create Account"}
            </Button>
            <div className="pt-4 border-t border-void-700/40 text-center">
              <p className="text-[11px] font-medium text-void-300 tracking-wide mb-4">Already Enlisted?</p>
              <Button variant="outline" className="w-full h-12 border border-void-600/40 rounded-xl font-semibold text-sm hover:bg-void-800 hover:text-white transition-all" asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}