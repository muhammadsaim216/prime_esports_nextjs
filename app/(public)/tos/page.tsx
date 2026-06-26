import type { Metadata } from "next";
import { Terminal, Gavel, ShieldAlert, AlertTriangle, Copyright } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Terms of Service", description: "Prime Esports Terms of Service governing use of our platform and community." };

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <main className="pt-48 pb-32 container relative z-10 mx-auto px-6 max-w-5xl">
        <div className="flex flex-col items-start mb-16">
          <Badge className="mb-6 bg-void-900 text-primary border border-primary/30 px-5 py-1.5 font-medium tracking-wide text-[10px]"><Terminal className="w-3 h-3 mr-2" /> Core Protocol // Legal 01</Badge>
          <h1 className="text-6xl md:text-[120px] font-display font-semibold tracking-tight text-foreground leading-[0.8] mb-4">Terms of <br /><span className="text-neon">Service</span></h1>
          <p className="text-void-300 font-medium text-xs tracking-wide border-l-2 border-primary pl-4 mt-6">Last Updated: March 2026 // Revision 4.0</p>
        </div>
        <div className="grid gap-12 border-t border-void-700/40 pt-16">
          <section className="relative bg-card p-8 rounded-2xl border border-void-700/40 hover:border-primary/20 transition-all duration-500">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary"><Gavel size={24} /></div>
              <div>
                <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight mb-4 flex items-center gap-3"><span className="text-primary font-mono text-sm opacity-50">01.</span> Acceptance of Terms</h2>
                <p className="text-void-300 leading-relaxed text-lg font-medium">By accessing or using the Prime Esports Service, you agree to be bound by these Terms of Service. Our arena, our rules. If you do not agree, you may not access the Service.</p>
              </div>
            </div>
          </section>
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent p-10 rounded-2xl border border-primary/20 shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-5"><ShieldAlert size={120} className="text-primary" /></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight mb-6 flex items-center gap-3"><span className="text-primary font-mono text-sm">02.</span> Use of the Service</h2>
              <p className="text-void-200 leading-relaxed text-lg font-medium max-w-2xl">You must follow all rules and regulations. You are solely responsible for maintaining the confidentiality of your credentials.</p>
            </div>
          </section>
          <section className="py-8">
            <div className="flex items-center gap-4 mb-10"><h2 className="text-2xl font-display font-semibold tracking-tight whitespace-nowrap"><span className="text-primary font-mono text-sm mr-3">03.</span> User Conduct</h2><div className="h-px w-full bg-gradient-to-r from-void-700/40 to-transparent" /></div>
            <p className="text-void-300 mb-8 font-medium text-xs tracking-wide flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-primary" /> Prohibited Actions in the Arena:</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {["Violating local or international laws","Deployment of harmful/toxic content","Unauthorized access to restricted data","Harassment of other community members"].map((item, i) => (
                <div key={i} className="flex items-center gap-5 p-6 rounded-2xl bg-void-900/40 border border-void-700/40 hover:border-primary/40 transition-all duration-300">
                  <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(21,255,181,0.3)]" /><span className="text-sm font-medium text-void-200 tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="relative p-10 rounded-2xl bg-void-900/10 border-l-2 border-primary overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight mb-6 flex items-center gap-3"><span className="text-primary font-mono text-sm">04.</span> Intellectual Property</h2>
              <div className="flex gap-6 items-start">
                <Copyright className="text-primary shrink-0 mt-1" size={24} />
                <p className="text-void-300 leading-relaxed text-lg max-w-3xl">All code, designs, logos, and digital assets associated with <span className="text-foreground font-semibold">Prime Esports</span> remain the exclusive property of the organization.</p>
              </div>
            </div>
          </section>
        </div>
        <div className="mt-24 p-8 rounded-2xl bg-void-900/50 border border-void-700/40 text-center">
          <p className="text-void-300 font-medium text-xs tracking-wide mb-4">Questions regarding the protocol?</p>
          <a href="mailto:legal@primeesports.com" className="text-primary font-semibold tracking-tight text-xl hover:text-foreground transition-colors">legal@primeesports.com</a>
        </div>
      </main>
    </div>
  );
}