"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, Shield, ChevronRight, ShieldAlert, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { name: "Home",    href: "/" },
  { name: "Teams",   href: "/teams" },
  { name: "Scrims",  href: "/scrims" },
  { name: "EPlayers", href: "/EPlayers" },   
  { name: "News",    href: "/blogs" },
  { name: "About",   href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, isAdmin, username, userRole, signOut } = useAuth();

  const isSuperAdmin   = userRole === "super_admin" || user?.email === "howsaim216@gmail.com";
  const isManualAdmin  = isAdmin || user?.email === "howsaim216@gmail.com";

  const displayIdentifier = (
    user?.email === "howsaim216@gmail.com"
      ? "PRExSAIM"
      : username || user?.email?.split("@")[0] || "Player"
  );

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-[100] w-full transition-all duration-300",
        scrolled
          ? "bg-void-900/90 backdrop-blur-xl border-b border-void-600/50"
          : "bg-void-900 border-b border-void-600/30"
      )}
    >
      <nav className="container flex h-18 items-center justify-between px-4 py-4">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Neon stripe mark */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-neon-gradient shadow-neon transition-all duration-300 group-hover:shadow-neon-strong">
            <span className="font-display text-xl font-semibold text-void-900 leading-none">P</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-semibold tracking-tight text-foreground leading-none">
              Prime <span className="text-neon">Esports</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-void-300 mt-0.5">Global Arena</span>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "nav-link relative px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200",
                pathname === link.href
                  ? "text-white bg-void-700/80"
                  : "text-void-200 hover:text-white hover:bg-void-700/40"
              )}
            >
              {link.name}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-neon-gradient rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* ── Auth / CTA ── */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 gap-2.5 rounded-xl border border-void-600/60 bg-void-800 hover:bg-void-700 text-foreground transition-all px-4 shadow-none"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-neon-mint animate-neon-pulse" />
                    <span className="font-medium text-[13px]">{displayIdentifier}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-xl border border-void-600/60 bg-void-800 p-0 shadow-card overflow-hidden"
                >
                  {/* Header strip */}
                  <div className="px-5 py-4 bg-neon-gradient">
                    <p className="text-[10px] font-medium text-void-900/60 mb-1">Signed in as</p>
                    <p className="font-display text-lg font-semibold text-void-900 tracking-tight leading-tight">{displayIdentifier}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {isSuperAdmin && (
                      <DropdownMenuItem asChild className="rounded-lg focus:bg-destructive/20 focus:text-foreground cursor-pointer">
                        <Link href="/super-admin" className="flex items-center gap-3 py-2.5 px-3">
                          <ShieldAlert className="h-4 w-4 text-destructive" />
                          <span className="font-medium text-[13px] text-void-100">Super Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isManualAdmin && (
                      <DropdownMenuItem asChild className="rounded-lg focus:bg-primary/20 focus:text-foreground cursor-pointer">
                        <Link href="/admin" className="flex items-center gap-3 py-2.5 px-3">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium text-[13px] text-void-100">Admin Console</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-void-700">
                      <Link href="/dashboard" className="flex items-center gap-3 py-2.5 px-3">
                        <LayoutDashboard className="h-4 w-4 text-void-300" />
                        <span className="font-medium text-[13px] text-void-100">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-void-700">
                      <Link href="/blogs" className="flex items-center gap-3 py-2.5 px-3">
                        <BookOpen className="h-4 w-4 text-void-300" />
                        <span className="font-medium text-[13px] text-void-100">Latest News</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-void-600/60" />
                    <DropdownMenuItem
                      className="flex items-center gap-3 text-destructive cursor-pointer focus:bg-destructive/20 focus:text-destructive rounded-lg py-2.5 px-3"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium text-[13px]">Sign Out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="font-medium text-[13px] text-void-200 hover:text-white hover:bg-void-700/60 rounded-xl h-10"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-neon-gradient hover:opacity-90 text-void-900 rounded-xl font-semibold text-[13px] px-6 h-10 shadow-neon transition-all hover:shadow-neon-strong border-0"
                >
                  <Link href="/signup">Join Prime</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className={cn(
              "md:hidden p-2.5 rounded-xl transition-all duration-200 border",
              mobileMenuOpen
                ? "bg-primary border-primary text-void-900"
                : "bg-void-700 border-void-600 text-void-200 hover:bg-void-600"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[73px] bottom-0 z-[90] bg-void-900 md:hidden overflow-y-auto border-t border-void-600/50">
          <div className="container py-6 px-4 space-y-6">
            {/* Nav links */}
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-void-300 px-3 mb-3">Navigation</p>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-[13px] font-medium transition-all",
                    pathname === link.href
                      ? "bg-void-700 text-white border-l-2 border-primary"
                      : "text-void-200 hover:bg-void-700/60 hover:text-white border-l-2 border-transparent"
                  )}
                >
                  {link.name}
                  <ChevronRight className="h-4 w-4 text-void-400" />
                </Link>
              ))}
            </div>

            {/* Auth section */}
            <div className="pt-4 border-t border-void-600/50">
              {user ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-void-800 border border-void-600/60">
                    <div className="h-px w-12 bg-neon-gradient rounded-full mb-3" />
                    <p className="font-display text-lg font-semibold text-white tracking-tight">{displayIdentifier}</p>
                    <p className="text-[11px] font-medium text-void-300 mt-0.5">{user.email}</p>
                  </div>
                  <div className="grid gap-2">
                    {isSuperAdmin && (
                      <Button variant="outline" size="lg" asChild className="justify-start h-12 rounded-xl border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 w-full">
                        <Link href="/super-admin"><ShieldAlert className="mr-3 h-4 w-4" /><span className="font-medium text-sm">Super Admin</span></Link>
                      </Button>
                    )}
                    {isManualAdmin && (
                      <Button variant="outline" size="lg" asChild className="justify-start h-12 rounded-xl border-void-600/60 bg-void-800 text-void-100 hover:bg-void-700 w-full">
                        <Link href="/admin"><Shield className="mr-3 h-4 w-4 text-primary" /><span className="font-medium text-sm">Admin Console</span></Link>
                      </Button>
                    )}
                    <Button variant="outline" size="lg" asChild className="justify-start h-12 rounded-xl border-void-600/60 bg-void-800 text-void-100 hover:bg-void-700 w-full">
                      <Link href="/dashboard"><LayoutDashboard className="mr-3 h-4 w-4 text-void-300" /><span className="font-medium text-sm">Dashboard</span></Link>
                    </Button>
                    <Button variant="ghost" size="lg" className="justify-start h-12 rounded-xl text-destructive hover:bg-destructive/20 hover:text-destructive w-full mt-2" onClick={handleSignOut}>
                      <LogOut className="mr-3 h-4 w-4" /><span className="font-medium text-sm">Sign Out</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button size="lg" asChild className="h-13 rounded-xl bg-neon-gradient hover:opacity-90 text-void-900 font-semibold text-sm shadow-neon">
                    <Link href="/signup">Join Prime</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="h-13 rounded-xl border-void-600/60 bg-void-800 text-white hover:bg-void-700 font-semibold text-sm">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}