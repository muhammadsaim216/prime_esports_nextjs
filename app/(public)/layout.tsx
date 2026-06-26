import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AnnouncementTicker from "@/components/layout/AnnouncementTicker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-x-hidden">
      {/* Announcement Bar Container */}
      <div className="w-full overflow-hidden border-b border-border bg-void-900">
        <AnnouncementTicker />
      </div>
      
      {/* Primary Navigation Frame */}
      <Header />
      
      {/* Main Feature Content Core Workspace */}
      <main className="relative flex-1 w-full overflow-x-hidden grid-texture">
        {/* Absolute Background Mesh Subtle Visual Enhancer */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        {/* Content Dynamic Layer Injection */}
        <div className="relative z-10 w-full">{children}</div>
      </main>
      
      {/* Global Platform Footer */}
      <Footer />
      
      {/* Legacy Retro Scanline Screen Texture Overlay Effect */}
      <div
        className="pointer-events-none fixed inset-0 z-[999] h-full w-full opacity-[0.012]"
        style={{
          background:
            "linear-gradient(rgba(10,11,16,0) 50%, rgba(0,0,0,0.4) 50%), linear-gradient(90deg, rgba(21,255,181,0.04), rgba(61,90,254,0.02), rgba(21,255,181,0.04))",
          backgroundSize: "100% 3px, 4px 100%",
        }}
      />
    </div>
  );
}