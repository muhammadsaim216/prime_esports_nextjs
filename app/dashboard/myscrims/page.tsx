"use client";

import { useState, useEffect } from "react";
import { Gamepad2, Clock, CheckCircle2, XCircle, AlertCircle, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function MyScrimsPage() {
  const { user } = useAuth();
  const [allScrims, setAllScrims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch ALL scrims, but only load the applications that belong to the current logged-in user
    supabase
      .from("scrims")
      .select(`
        id,
        title,
        scheduled_at,
        game,
        scrim_applications(id, status, team_name, slot_no)
      `)
      .order("scheduled_at", { ascending: false })
      .then(({ data }) => {
        // 2. Map through all scrims to determine the user's specific application state
        const processed = (data || []).map((scrim: any) => {
          const userApp = scrim.scrim_applications?.[0] || null;
          return {
            ...scrim,
            hasApplied: !!userApp,
            applicationStatus: userApp?.status || null,
            teamName: userApp?.team_name || null,
            slotNo: userApp?.slot_no || null,
          };
        });

        setAllScrims(processed);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card id="scrims-section" className="border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden rounded-xl scroll-mt-20">
      <div className="h-[3px] bg-primary w-full" />
      
      <CardHeader className="pt-6 px-6 md:px-8">
        <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-2.5 text-void-400">
          <Gamepad2 className="h-4 w-4 text-primary shrink-0" />
          Scrim Operations Matrix
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
        {allScrims.length > 0 ? (
          <div className="space-y-4">
            {allScrims.map((scrim) => (
              <div 
                key={scrim.id} 
                className={`flex flex-col md:flex-row md:items-center justify-between rounded-lg border p-5 transition-all gap-4 md:gap-6 ${
                  scrim.hasApplied 
                    ? "border-border/80 bg-void-900/50 shadow-lg" // Unique UI for applied matches
                    : "border-dashed border-border/30 bg-void-950/10 opacity-60 hover:opacity-100 hover:bg-void-950/30" // Unique UI for unapplied matches
                }`}
              >
                {/* Information Segment */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="font-display font-black text-lg md:text-xl uppercase tracking-wide text-white truncate">
                      {scrim.title}
                    </h4>
                    
                    {/* Visual state tags to quickly differentiate items */}
                    {scrim.hasApplied ? (
                      <span className="font-mono text-[8px] px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 uppercase tracking-widest font-bold">
                        Registered
                      </span>
                    ) : (
                      <span className="font-mono text-[8px] px-2 py-0.5 bg-void-800 text-void-500 rounded border border-border/10 uppercase tracking-widest font-bold">
                        Open Slot
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="font-mono text-[9px] font-medium text-void-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-primary shrink-0" />
                      {scrim.scheduled_at ? new Date(scrim.scheduled_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "TBD"}
                    </span>
                    
                    <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-wide">
                      Game: {scrim.game || "N/A"}
                    </span>

                    {scrim.hasApplied && scrim.teamName && (
                      <span className="font-mono text-[9px] font-bold text-void-300 uppercase tracking-wide border-l pl-4 border-border/30">
                        Squad: {scrim.teamName}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Status / Action Controls Segment */}
                <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-border/20">
                  {scrim.hasApplied ? (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider border shadow-xs ${
                      scrim.applicationStatus === "confirmed" || scrim.applicationStatus === "approved"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : scrim.applicationStatus === "pending" 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                          : "bg-destructive/10 border-destructive/20 text-destructive"
                    }`}>
                      {(scrim.applicationStatus === "confirmed" || scrim.applicationStatus === "approved") ? (
                        <CheckCircle2 size={12} className="shrink-0" />
                      ) : scrim.applicationStatus === "pending" ? (
                        <Clock size={12} className="shrink-0" />
                      ) : (
                        <XCircle size={12} className="shrink-0" />
                      )}
                      {scrim.applicationStatus || "Pending"}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider border border-void-700/40 bg-void-800/10 text-void-400 group-hover:text-white transition-colors">
                      <PlusCircle size={12} className="shrink-0 text-void-500" />
                      Available to Apply
                    </div>
                  )}
                  
                  {/* Assigned Numbers (Only shown if granted/confirmed) */}
                  {scrim.hasApplied && (scrim.applicationStatus === "confirmed" || scrim.applicationStatus === "approved") && (
                    <div className="flex items-center md:items-end gap-3 md:gap-0 md:flex-col border-l pl-4 md:pl-6 border-border/40">
                      <span className="font-mono text-[8px] font-bold uppercase text-void-500 tracking-wide md:mb-0.5">
                        Assigned Slot
                      </span>
                      <span className="font-display font-black text-2xl md:text-3xl text-white leading-none">
                        #{scrim.slotNo || "--"}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-lg bg-void-950/20">
            <p className="font-mono text-[10px] text-void-500 uppercase font-bold tracking-widest">
              No Scrims Discovered in Data Core
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}