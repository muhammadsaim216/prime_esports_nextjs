import type { Metadata } from "next";
import { Shield, Terminal, Cookie, Zap, Settings2 } from "lucide-react";

export const metadata: Metadata = { title: "Cookie Policy", description: "Learn how Prime Esports uses cookies to enhance your experience." };

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black">
      <section className="pt-40 pb-20 border-b-[8px] border-black relative overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(#000 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-3 bg-black text-white px-6 py-2 skew-x-[-10deg] mb-8"><Shield size={16} className="text-[#e91e63] skew-x-[10deg]" /><span className="text-[10px] font-black tracking-[0.4em] uppercase skew-x-[10deg]">System_Protocol // v.03</span></div>
          <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter mb-4 leading-[0.8]">COOKIE <span className="text-[#e91e63]">POLICY</span></h1>
        </div>
      </section>
      <main className="py-24 container mx-auto px-4 max-w-5xl">
        <div className="space-y-20">
          <section className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3">
              <div className="flex items-center gap-3 text-black mb-6 border-b-4 border-[#e91e63] pb-2 inline-flex"><Terminal size={20} className="text-[#e91e63]" /><h2 className="text-xl font-black uppercase tracking-tighter italic">THE_CONCEPT</h2></div>
              <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest leading-loose italic">Cookies are digital beacons stored on your local hardware to synchronize your Prime operational experience.</p>
            </div>
            <div className="md:w-2/3 bg-white border-4 border-black p-10 shadow-[12px_12px_0px_rgba(0,0,0,0.05)] relative">
              <div className="absolute top-0 right-0 p-3 bg-black text-white"><Cookie size={18} /></div>
              <p className="text-zinc-800 text-xl font-bold uppercase italic leading-relaxed tracking-tight">We utilize these small-scale text files to retain your system preferences and maintain secure login status for the Scrim Dashboard.</p>
            </div>
          </section>
          <section className="grid md:grid-cols-3 gap-6">
            {[{ type: "Essential", icon: Zap, desc: "Critical for security infrastructure and core site mechanics." },{ type: "Performance", icon: Settings2, desc: "Aggregated, anonymized data utilized to optimize UI response times." },{ type: "Preference", icon: Cookie, desc: "Synchronizes your interface specifications and language localization." }].map((item, i) => (
              <div key={i} className="p-10 bg-white border-4 border-black hover:bg-zinc-50 transition-all relative overflow-hidden">
                <item.icon className="text-[#e91e63] mb-8" size={40} />
                <h3 className="font-black text-black mb-4 uppercase italic text-2xl tracking-tighter border-b-2 border-zinc-100 pb-2">{item.type}</h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed italic">{item.desc}</p>
              </div>
            ))}
          </section>
          <section className="border-[6px] border-black bg-black text-white p-12 shadow-[20px_20px_0px_rgba(233,30,99,0.2)] relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-6 tracking-tighter flex items-center gap-4"><span className="bg-[#e91e63] p-2 skew-x-[-10deg]"><Settings2 size={32} className="skew-x-[10deg]" /></span>USER_CONTROL</h2>
              <p className="font-bold text-lg uppercase italic tracking-tight leading-relaxed mb-10 max-w-2xl text-zinc-400">You maintain the master switch. Cookies can be managed or purged via your browser parameters at any time.</p>
              <div className="bg-[#e91e63]/10 p-6 border-l-8 border-[#e91e63]"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e91e63] italic flex items-center gap-3"><Zap size={14} /> Warning: Disabling Essential protocols may restrict access to Prime HQ Dashboard features.</p></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
