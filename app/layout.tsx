import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://prime-esports.gg"),
  title: { default: "Prime Esports — Compete at the Highest Level", template: "%s | Prime Esports" },
  description: "Prime Esports is Pakistan's #1 competitive esports organization. Join elite rosters, compete in scrims, apply for tryouts, and dominate the global arena.",
  keywords: ["esports", "prime esports", "competitive gaming", "scrims", "tryouts", "pakistan esports", "gaming organization"],
  authors: [{ name: "Prime Esports" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prime-esports.gg",
    siteName: "Prime Esports",
    title: "Prime Esports — Compete at the Highest Level",
    description: "Pakistan's #1 competitive esports organization. Elite rosters, global dominance.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Prime Esports" }],
  },
  twitter: { card: "summary_large_image", title: "Prime Esports", description: "Pakistan's #1 competitive esports organization.", images: ["/images/og-image.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col relative overflow-x-hidden">
        <AuthProvider>
          
          {/* Global Ambient Glow Elements */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[160px] pointer-events-none z-0 animate-neon-pulse" />
          <div className="absolute top-[30vh] right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[180px] pointer-events-none z-0" />
          
          {/* Unified Application Layout Grid Overlay */}
          <div className="absolute inset-0 grid-texture opacity-60 pointer-events-none z-0" />

          {/* Layout Wrapper Frame */}
          <div className="relative z-10 flex flex-col flex-1 min-h-screen">
            {children}
          </div>

          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}