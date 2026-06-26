"use client";
import { AlertCircle, Terminal, Zap } from "lucide-react";

export default function AnnouncementTicker() {
  return (
    <div className="bg-primary text-void-900 py-2 overflow-hidden border-b border-void-700/40 relative h-10 flex items-center">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-void-900/10 flex items-center justify-center z-10 border-r border-void-900/10">
        <Zap className="h-3 w-3 text-void-900/40 animate-pulse" />
      </div>
      <div className="flex whitespace-nowrap animate-marquee">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-6 mx-4">
            <span className="font-medium text-[10px] tracking-wide flex items-center gap-3">
              <div className="bg-void-900 text-primary px-1.5 py-0.5 text-[9px] font-semibold rounded">System</div>
              <AlertCircle className="h-4 w-4" />
              Need to update your profile? Found a bug? Want to join a new roster?
              <span className="bg-void-900 text-primary px-2 py-0.5 ml-1 rounded cursor-pointer font-semibold">
                Message admin via chat portal
              </span>
            </span>
            <span className="text-void-900/30 font-medium">///</span>
          </div>
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-void-900/10 flex items-center justify-center z-10 border-l border-void-900/10">
        <Terminal className="h-3 w-3 text-void-900/40" />
      </div>
    </div>
  );
}