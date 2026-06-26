import Link from "next/link";
import { Youtube, Twitch, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const quickLinks = [
  { name: "Home",    href: "/" },
  { name: "Teams",   href: "/teams" },
  { name: "Scrims",  href: "/scrims" },
  { name: "About",   href: "/about" },
  { name: "Contact", href: "/contact" },
];

const legalLinks = [
  { name: "Privacy Policy",   href: "/privacy" },
  { name: "Terms of Service", href: "/tos" },
  { name: "Cookie Policy",    href: "/cookie" },
];

const socialLinks = [
  { name: "YouTube", icon: Youtube,       href: "https://youtube.com/@primeesports-gg" },
  { name: "Twitch",  icon: Twitch,        href: "https://twitch.tv" },
  { name: "Discord", icon: MessageCircle, href: "https://discord.gg/jGESmkDb" },
];

export function Footer() {
  return (
    <footer className="bg-void-900 border-t border-void-600/40 pt-16 pb-8">
      <div className="container px-4">
        <div className="grid gap-12 lg:grid-cols-12 mb-14">

          {/* ── Brand column ── */}
          <div className="lg:col-span-4 flex flex-col items-center md:items-start space-y-6">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-neon-gradient shadow-neon transition-all duration-300 group-hover:shadow-neon-strong">
                <span className="font-display text-xl font-semibold text-void-900 leading-none">P</span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight text-white">
                Prime <span className="text-neon">Esports</span>
              </span>
            </Link>
            <p className="max-w-xs text-[13px] font-medium leading-relaxed text-void-300 text-center md:text-left">
              Competing at the highest level. Forging legends in the global digital arena.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-void-800 border border-void-600/40 text-void-300 transition-all hover:bg-primary hover:text-void-900 hover:border-primary hover:-translate-y-0.5 hover:shadow-neon"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Nav links ── */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h4 className="mb-5 font-display font-semibold text-[11px] text-void-200 flex items-center gap-2">
                <span className="h-px w-4 bg-neon-gradient rounded-full" />
                Navigation
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[13px] font-medium text-void-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-5 font-display font-semibold text-[11px] text-void-200 flex items-center gap-2">
                <span className="h-px w-4 bg-void-600 rounded-full" />
                Legal
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[13px] font-medium text-void-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Newsletter ── */}
          <div className="lg:col-span-4">
            <div className="rounded-xl bg-void-800 border border-void-600/40 p-7">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <h4 className="font-display font-semibold text-[11px] text-white">Join the Roster</h4>
              </div>
              <p className="mb-5 text-[13px] font-medium text-void-300">Get the latest news on rosters and tournaments.</p>
              <div className="space-y-2.5">
                <Input
                  className="h-11 bg-void-900 border-void-600/60 text-white rounded-xl text-[13px] font-medium placeholder:text-void-400 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                  placeholder="your@email.com"
                />
                <Button className="w-full h-11 bg-neon-gradient hover:opacity-90 text-void-900 rounded-xl font-semibold text-[13px] shadow-neon transition-all hover:shadow-neon-strong border-0">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-6 border-t border-void-600/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 items-center">
            <span className="text-[11px] font-medium text-void-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-neon-pulse" />
              Status: Online
            </span>
            <span className="text-[11px] font-medium text-void-400">v2.0.26</span>
          </div>
          <p className="text-[11px] font-medium text-void-400">
            © {new Date().getFullYear()}{" "}
            <span className="text-void-200">Prime Esports</span>
          </p>
        </div>
      </div>
    </footer>
  );
}