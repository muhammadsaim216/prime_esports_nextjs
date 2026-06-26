"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, FileText,
  Video, Bell, Settings, LogOut, ChevronRight,
  MessageCircle, ShieldCheck, ExternalLink, Trophy,
  Database, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Overview",      href: "/admin" },
  { icon: Zap,             label: "E-Players",     href: "/admin/EPlayers" },
  { icon: Users,           label: "Teams",         href: "/admin/teams" },
  { icon: Users,           label: "Players",       href: "/admin/players" },
  { icon: Trophy,          label: "Rosters",       href: "/admin/rosters" },
  { icon: Database,        label: "Games",         href: "/admin/games" },
  { icon: ClipboardList,   label: "Scrims",        href: "/admin/scrims" },
  { icon: FileText,        label: "Applications",  href: "/admin/applications" },
  { icon: Video,           label: "Streams",       href: "/admin/streams" },
  { icon: Bell,            label: "Announcements", href: "/admin/announcements" },
  { icon: MessageCircle,   label: "Messages",      href: "/admin/messages" },
  { icon: Settings,        label: "Settings",      href: "/admin/settings" },
];

const titleMap: Record<string, { title: string; description?: string }> = {
  "/admin":                { title: "Overview",      description: "Command Center Dashboard" },
  "/admin/EPlayers":       { title: "E-Players",     description: "Elite Player Registry" },
  "/admin/players":        { title: "Players",       description: "Roster Database" },
  "/admin/rosters":        { title: "Rosters",       description: "Team Composition" },
  "/admin/games":          { title: "Games",         description: "Supported Title Library" },
  "/admin/scrims":         { title: "Scrims",        description: "Match Scheduling" },
  "/admin/applications":   { title: "Applications",  description: "Recruitment Pipeline" },
  "/admin/streams":        { title: "Streams",       description: "Live Broadcast Control" },
  "/admin/announcements":  { title: "Announcements", description: "Public Comms" },
  "/admin/messages":       { title: "Messages",      description: "Support Inbox" },
  "/admin/settings":       { title: "Settings",      description: "System Configuration" },
  "/admin/teams":          { title: "Teams",         description: "Team Management" },
  "/admin/tryouts":        { title: "Tryouts",       description: "Recruitment Drives" },
  "/admin/news":           { title: "News",          description: "Content Publishing" },
  "/admin/setup":          { title: "Setup",         description: "Initial Configuration" },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { title, description } = titleMap[pathname] || { title: "Admin" };

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-background text-foreground grid-texture">
        {/* Fixed Left Sidebar Panel */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-void-900 border-r border-border overflow-hidden flex flex-col shadow-xl">
          {/* Logo Branding Hub */}
          <div className="flex h-24 items-center gap-3.5 px-6 border-b border-border bg-gradient-to-b from-white/[0.01] to-transparent">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-void-800 border border-border text-primary shadow-sm relative group">
              <ShieldCheck className="h-5 w-5 text-primary filter drop-shadow-[0_0_6px_rgba(21,255,181,0.4)]" />
              <div className="absolute inset-0 bg-neon-gradient opacity-5 blur-xs rounded-xl" />
            </div>
            <div>
              <span className="font-display font-bold text-white tracking-wide text-lg block leading-none">
                PRIME<span className="text-neon">.OPS</span>
              </span>
              <span className="text-[9px] font-mono font-medium text-void-400 uppercase tracking-widest mt-1.5 block">
                COMMAND STATION
              </span>
            </div>
          </div>
          
          {/* Main Navigation Matrix */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            <div className="px-3 mb-3 text-[10px] font-mono uppercase tracking-wider text-void-500">
              Systems Matrix
            </div>
            {sidebarLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={`${item.label}-${item.href}`} 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3.5 rounded-lg px-3.5 py-3 transition-all duration-200 group relative text-sm font-medium", 
                    isActive 
                      ? "bg-void-800 text-primary border border-border shadow-sm neon-glow" 
                      : "text-void-400 hover:text-white hover:bg-void-800/40"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-200", 
                    isActive ? "text-primary" : "text-void-400 group-hover:text-primary"
                  )} />
                  <span className={cn(
                    "font-display uppercase tracking-wide text-xs",
                    isActive ? "font-semibold" : "font-medium"
                  )}>
                    {item.label}
                  </span>
                  
                  {isActive ? (
                    <div className="absolute right-0 top-2 bottom-2 w-0.5 bg-primary rounded-l" />
                  ) : (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-void-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Account Console Profile */}
          <div className="p-4 mt-auto border-t border-border bg-void-950/60 backdrop-blur-md">
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-void-900/50 border border-border/80 mb-3">
              <div className="h-8 w-8 rounded-md bg-void-800 border border-border flex items-center justify-center font-mono font-bold text-primary text-xs relative">
                {user?.email?.[0].toUpperCase()}
                <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary border border-void-900 animate-pulse" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[11px] font-display font-semibold text-white truncate uppercase tracking-wide">
                  {user?.email?.split("@")[0]}
                </span>
                <span className="text-[9px] font-mono text-void-400 uppercase tracking-wider leading-none mt-0.5">
                  Sec_Admin
                </span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-void-400 hover:text-destructive hover:bg-destructive/5 border border-transparent rounded-lg transition-all font-display uppercase tracking-wide text-[11px] h-10 group" 
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 text-void-400 group-hover:text-destructive transition-colors" /> 
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Global Page Container Frame */}
        <main className="ml-72 flex-1 flex flex-col min-w-0">
          {/* Command Frame Context Header */}
          <header className="sticky top-0 z-30 flex h-24 items-center justify-between bg-background/60 backdrop-blur-md px-8 md:px-12 border-b border-border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-1 w-1 rounded-full bg-primary animate-neon-pulse" />
                <span className="text-[9px] font-mono text-void-400 uppercase tracking-widest">
                  Live Terminal Interface
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white leading-none">
                {title}
              </h1>
              {description && (
                <p className="text-[9px] font-mono text-void-400 uppercase tracking-wider mt-1.5 bg-void-900/60 border border-border w-fit px-2 py-0.5 rounded">
                  {description}
                </p>
              )}
            </div>
            
            {/* Utility Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden xl:flex flex-col items-end mr-2">
                <span className="text-[9px] font-mono text-void-500 uppercase tracking-wider">Infrastructure</span>
                <span className="text-[10px] font-mono font-medium text-primary uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                  <Database className="h-3 w-3" /> Supabase OK
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="h-10 rounded-lg border-border bg-void-900/50 font-display uppercase tracking-wide text-[10px] px-5 hover:bg-void-800 text-void-200 hover:text-white transition-all shadow-2xs active:scale-98"
              >
                <Link href="/" className="flex items-center gap-2">
                  <ExternalLink className="h-3 w-3 text-void-400" /> Live App
                </Link>
              </Button>
              
              <div className="h-10 w-10 rounded-lg bg-void-800 border border-border flex items-center justify-center font-mono font-semibold text-primary text-sm shadow-2xs">
                {user?.email?.[0].toUpperCase()}
              </div>
            </div>
          </header>
          
          {/* Main Content Workspace Layout */}
          <div className="p-8 md:p-12 max-w-[1600px] w-full mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}