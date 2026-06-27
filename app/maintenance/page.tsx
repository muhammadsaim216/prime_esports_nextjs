"use client";

import { Activity, ShieldAlert } from "lucide-react";

export default function MaintenanceHoldScreen() {
  return (
    <div className="min-h-screen bg-void-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full border border-border/40 bg-card/20 backdrop-blur-md p-8 rounded-xl space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500 animate-pulse" />
        
        <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-bounce">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-black text-2xl md:text-3xl uppercase tracking-wider text-white">
            Core Maintenance Active
          </h1>
          <p className="font-mono text-[10px] text-amber-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Activity size={12} className="animate-pulse" /> System Grid Offline // Roster Upgrades In Progress
          </p>
        </div>

        <p className="text-xs text-void-400 font-sans leading-relaxed">
          We are optimizing our central database registries and clearing backend cluster logs. Normal user access structures have been temporarily frozen.
        </p>

        <div className="pt-2 border-t border-border/10 font-mono text-[9px] text-void-500 uppercase tracking-tight">
          Operational telemetry status: Expected online shortly.
        </div>
      </div>
    </div>
  );
}