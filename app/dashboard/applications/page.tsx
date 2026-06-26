"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Trophy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function DashboardApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("scrim_applications")
      .select(`id, scrim_id, status, message, created_at, scrims(title, game)`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setApplications(
          data?.map((app: any) => ({
            ...app,
            scrim: Array.isArray(app.scrims) ? app.scrims[0] : app.scrims,
          })) || []
        );
        setLoading(false);
      });
  }, [user]);

  return (
    <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden">
      <div className="h-[3px] bg-primary w-full" />
      
      <CardHeader className="p-6 md:p-8 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-wider text-void-400">
            Application History
          </CardTitle>
          <Button 
            variant="outline" 
            className="rounded-lg border-border bg-void-950 text-white font-display font-bold uppercase text-xs tracking-wide hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors h-10 px-4 shadow-xs" 
            asChild
          >
            <Link href="/scrims">
              <Search className="mr-2 h-4 w-4 shrink-0" /> Browse New Scrims
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border border-border/40 p-5 md:p-6 bg-void-950/20 transition-all hover:bg-void-900/40 hover:border-border/80"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <h4 className="font-display font-black text-base md:text-lg uppercase tracking-wide text-white group-hover:text-primary transition-colors leading-tight truncate">
                    {app.scrim?.title || "Unknown Scrim"}
                  </h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-[9px] font-bold text-void-300 uppercase tracking-wide bg-void-950 px-2 py-0.5 rounded-xs border border-border/40">
                      {app.scrim?.game || "N/A"}
                    </span>
                    <span className="font-mono text-[9px] font-medium text-void-500 uppercase tracking-wide">
                      {new Date(app.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {app.message && (
                    <p className="mt-3 font-sans text-xs text-primary bg-primary/5 p-3 rounded-lg border border-primary/10 leading-relaxed max-w-xl">
                      "{app.message}"
                    </p>
                  )}
                </div>
                
                <Badge 
                  className={`w-fit shrink-0 font-mono text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-sm border shadow-xs ${
                    app.status === "accepted" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : app.status === "rejected" 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-void-900 text-void-400 border-border/60"
                  }`}
                >
                  {app.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/60 rounded-lg bg-void-950/10">
            <div className="h-12 w-12 bg-void-900/80 border border-border/80 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-5 w-5 text-void-500" />
            </div>
            <p className="font-mono text-[10px] text-void-500 uppercase tracking-wider">
              No Active Submissions
            </p>
            <Button 
              variant="link" 
              className="mt-2 text-primary font-display font-bold uppercase text-[10px] tracking-wide hover:no-underline hover:text-primary/80 transition-colors" 
              asChild
            >
              <Link href="/scrims">Deploy to first scrim</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}