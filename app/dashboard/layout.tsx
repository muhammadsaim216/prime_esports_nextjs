"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, FileText, Bell, Settings, ChevronRight, Users, MessageCircle, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AnnouncementTicker from "@/components/layout/AnnouncementTicker";

const navItems = [
  { icon: User, label: "Profile", href: "/dashboard" },
  { icon: Users, label: "Join Team", href: "/teams" },
  { icon: Gamepad2, label: "My Scrims", href: "/dashboard/myscrims", highlight: true },
  { icon: FileText, label: "My Applications", href: "/dashboard/applications" },
  { icon: Bell, label: "Announcements", href: "/dashboard/announcements" },
  { icon: MessageCircle, label: "Messages", href: "/dashboard/messages" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, username } = useAuth();
  const displayName = username || user?.email?.split("@")[0] || "Player";

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-void-950">
        {/* Upper Announcement Layer Banner */}
        <div className="w-full overflow-hidden border-b border-border/40 bg-white">
          <AnnouncementTicker />
        </div>
        
        <Header />
        
        <main className="flex-1">
          <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
            
            {/* Tactical Commander Welcome Banner */}
            <div className="relative mb-8 p-6 md:p-8 rounded-xl bg-card/40 border border-border/80 overflow-hidden backdrop-blur-xs">
              <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary))_0.5px,transparent_0.5px)] [background-size:20px_20px] opacity-[0.04] pointer-events-none" />
              
              <div className="relative z-10 space-y-1.5">
                <h1 className="font-display text-2xl md:text-3xl font-black uppercase tracking-wide text-white leading-none">
                  Welcome back, <span className="text-primary">{displayName}</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="font-mono text-void-400 uppercase text-[9px] tracking-wider">
                    Command Center Status: <span className="text-white font-bold">Active</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Split Screen Application Workspace Layout */}
            <div className="grid gap-8 lg:grid-cols-3 items-start">
              
              {/* Sidebar Navigation Panel Nodes */}
              <div className="lg:col-span-1">
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link 
                        key={item.label} 
                        href={item.href} 
                        className={`flex items-center gap-3.5 rounded-lg px-4 py-3.5 transition-all duration-200 group border ${
                          active 
                            ? "bg-card/60 border-border/80 shadow-xs" 
                            : "border-transparent bg-transparent hover:bg-void-900/40 hover:border-border/30"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${
                          active ? "text-primary" : "text-void-500"
                        } group-hover:text-primary transition-colors`} />
                        
                        <span className={`font-display font-bold uppercase text-[11px] tracking-wide ${
                          active ? "text-white" : "text-void-400"
                        } group-hover:text-white transition-colors`}>
                          {item.label}
                        </span>
                        
                        {item.highlight ? (
                          <Badge className="ml-auto bg-primary text-primary-foreground font-mono font-bold text-[8px] tracking-wide px-1.5 py-0 rounded-xs border-none">
                            LIVE
                          </Badge>
                        ) : (
                          <ChevronRight className={`ml-auto h-3.5 w-3.5 ${
                            active ? "text-primary" : "text-void-700"
                          } group-hover:text-white group-hover:translate-x-0.5 transition-all`} />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              {/* Principal Component Content Core Node Slot */}
              <div className="lg:col-span-2 min-w-0">
                {children}
              </div>
              
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}