import type { Metadata } from "next";
import { Shield, Terminal, Eye, Database, ChevronRight, FileText, Lock, Share2 } from "lucide-react";

export const metadata: Metadata = { title: "Privacy Policy", description: "Read Prime Esports' privacy policy on data collection, use, and protection." };

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(90deg, #15FFB5 1px, transparent 1px), linear-gradient(#15FFB5 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <main className="pt-40 pb-24 container mx-auto px-4 max-w-4xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-void-700/40 pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 bg-void-900 border border-void-600/40 text-foreground px-4 py-1 rounded-full"><Shield size={14} className="text-primary" /><span className="text-[10px] font-semibold tracking-wide">Data Integrity Protocol</span></div>
            <h1 className="text-6xl md:text-9xl font-display font-semibold tracking-tight text-foreground leading-[0.85] mb-2">Privacy<br /><span className="text-neon">Policy</span></h1>
          </div>
          <div className="md:text-right flex flex-col md:items-end">
            <div className="flex items-center gap-2 mb-1"><Terminal size={12} className="text-void-300" /><p className="text-void-300 font-medium text-[10px] tracking-wide">Revision Key</p></div>
            <p className="text-foreground font-semibold text-lg leading-none border-b-2 border-primary">v.02 Jan 2026</p>
          </div>
        </div>
        <div className="space-y-20 pt-8">
          <section>
            <div className="flex items-center gap-4 mb-8"><div className="w-12 h-12 bg-void-900 flex items-center justify-center text-foreground rounded-xl"><Eye size={20} className="text-primary" /></div><h2 className="text-3xl font-display font-semibold tracking-tight text-foreground">01 Introduction</h2></div>
            <div className="border-l-2 border-primary pl-8 ml-6"><p className="text-void-300 leading-relaxed text-xl font-medium">Prime Esports operates with absolute transparency. This directive dictates how we monitor, process, and secure your digital footprint across our competitive ecosystem.</p></div>
          </section>
          <section>
            <div className="flex items-center gap-4 mb-10"><div className="w-12 h-12 bg-primary flex items-center justify-center text-void-900 rounded-xl"><Database size={20} /></div><h2 className="text-3xl font-display font-semibold tracking-tight text-foreground">02 Data Harvest</h2></div>
            <div className="grid md:grid-cols-3 gap-6 ml-6">
              {[{ title: "User Identifier", desc: "Names, emails, and discord handles used for roster verification and authentication." },{ title: "Log Signatures", desc: "IP addresses, device metadata, and interaction timestamps for system security." },{ title: "Session Packets", desc: "Technical cookies used to maintain active login states and platform preferences." }].map((item, i) => (
                <div key={i} className="bg-card border border-void-700/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-primary font-semibold mb-4 tracking-wide text-[10px] flex items-center gap-2"><ChevronRight size={12} /> {item.title}</h3>
                  <p className="text-void-300 text-xs font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-void-900 text-foreground p-10 relative overflow-hidden rounded-2xl shadow-xl border border-void-700/40">
            <div className="absolute top-0 right-0 p-8 opacity-5"><FileText size={120} className="text-primary" /></div>
            <div className="flex items-center gap-4 mb-8 relative z-10"><Lock className="text-primary" size={28} /><h2 className="text-3xl font-display font-semibold tracking-tight">03 Operational Intent</h2></div>
            <ul className="grid md:grid-cols-2 gap-y-6 gap-x-12 relative z-10">
              {["Maintain Service Integrity","Optimize Player Experience","Security Patch Deployment","Verified Command Communication"].map((text, i) => (
                <li key={i} className="flex items-center gap-4 border-b border-void-700/40 pb-4"><span className="text-primary font-mono text-xs">0{i + 1}</span><span className="text-[11px] font-medium text-void-200 tracking-wide">{text}</span></li>
              ))}
            </ul>
          </section>
          <section>
            <div className="flex items-center gap-4 mb-8"><div className="w-12 h-12 bg-void-900 flex items-center justify-center text-foreground rounded-xl"><Share2 size={20} className="text-primary" /></div><h2 className="text-3xl font-display font-semibold tracking-tight text-foreground">04 Outside Protocols</h2></div>
            <div className="ml-6 bg-card border border-dashed border-void-700/40 p-8 relative rounded-2xl">
              <div className="absolute -top-3 -right-3 bg-void-900 border border-void-700/40 p-1 rounded-lg"><Shield size={16} className="text-primary" /></div>
              <p className="text-void-300 font-medium text-sm leading-relaxed">Data sharing is strictly limited to essential operational partners. Prime Esports <span className="text-foreground underline underline-offset-4 decoration-primary decoration-2">explicitly forbids</span> the sale of competitive intelligence to third-party data brokers.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}