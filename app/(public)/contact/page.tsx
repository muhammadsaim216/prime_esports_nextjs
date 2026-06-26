"use client";
import { useState } from "react";
import type { Metadata } from "next";
import { Shield, Mail, Youtube, Twitch, MessageCircle, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const contactReasons = ["General Inquiry", "Partnership / Sponsorship", "Media Request", "Player Agent", "Technical Support", "Other"];
const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:bg-[#1DA1F2]" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@primeesports-gg", color: "hover:bg-[#FF0000]" },
  { name: "Twitch", icon: Twitch, href: "https://twitch.tv", color: "hover:bg-[#9146FF]" },
  { name: "Discord", icon: MessageCircle, href: "https://discord.gg/jGESmkDb", color: "hover:bg-[#5865F2]" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", reason: "", company: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Transmission received — Our team will respond soon.");
    setForm({ name: "", email: "", reason: "", company: "", message: "" });
    setIsSubmitting(false);
  };

  const inputClass = "bg-void-950 border border-void-700/40 rounded-xl h-14 font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-colors w-full px-4";
  const labelClass = "block text-[11px] font-medium text-void-300 tracking-wide mb-2";

  return (
    <>
      <section className="bg-background pt-40 pb-24 border-b border-border text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(45deg,#15FFB5,#15FFB5 10px,transparent 10px,transparent 20px)` }} />
        <div className="container relative z-10">
          <div className="inline-flex items-center gap-3 bg-void-900 border border-void-600/40 text-foreground px-6 py-2 rounded-full mb-8">
            <Shield size={16} className="text-primary" /><span className="text-[10px] font-semibold tracking-wide">Communication Hub</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-display font-semibold tracking-tight text-foreground leading-[0.85]">Get in <span className="text-neon">Touch</span></h1>
        </div>
      </section>

      <div className="bg-background py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-4">
              <div className="bg-void-900 p-8 rounded-2xl border border-void-700/40">
                <h3 className="text-2xl font-display font-semibold tracking-tight text-foreground mb-6">Direct Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /><span className="text-[13px] font-medium text-void-300">prime.esports.com@gmail.com</span></div>
                </div>
              </div>
              <div className="bg-card border border-void-700/40 p-8 rounded-2xl">
                <h3 className="text-xl font-display font-semibold tracking-tight mb-6">Social Channels</h3>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((s) => (
                    <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-4 border border-void-700/40 font-medium text-[11px] text-void-300 rounded-xl ${s.color} hover:text-white hover:border-transparent transition-all`}>
                      <s.icon className="h-4 w-4" />{s.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <div className="bg-card border border-void-700/40 shadow-xl overflow-hidden rounded-2xl">
                <div className="bg-void-950 p-8 border-b border-void-700/40"><h2 className="text-3xl font-display font-semibold tracking-tight text-foreground">Open Transmission</h2></div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div><label className={labelClass}>Your Name</label><Input name="name" value={form.name} onChange={handleChange} placeholder="Callsign" required className={inputClass} /></div>
                    <div><label className={labelClass}>Email Address</label><Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="operator@prime.net" required className={inputClass} /></div>
                  </div>
                  <div>
                    <label className={labelClass}>Reason for Contact</label>
                    <select name="reason" value={form.reason} onChange={handleChange} required className={`${inputClass} appearance-none`}>
                      <option value="">Select channel</option>
                      {contactReasons.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div><label className={labelClass}>Company / Organization (Optional)</label><Input name="company" value={form.company} onChange={handleChange} placeholder="Org name" className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} placeholder="Enter your message..." required rows={6} className="bg-void-950 border border-void-700/40 rounded-xl font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary outline-none transition-colors w-full p-4 resize-none text-sm" />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-neon-gradient hover:opacity-90 text-void-900 rounded-xl font-semibold text-sm transition-all hover:shadow-neon-strong">
                    {isSubmitting ? "Transmitting..." : <span className="flex items-center gap-3">Send Transmission <Send className="h-5 w-5" /></span>}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}