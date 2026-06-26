"use client";

import { useState, useEffect } from "react";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function DashboardAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAnnouncements(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden">
      <div className="h-[3px] bg-primary w-full" />
      
      <CardHeader className="p-6 md:p-8 pb-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-wider text-void-400">
            Latest Intel / Updates
          </CardTitle>
          <Megaphone className="h-4 w-4 text-primary shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div 
                key={ann.id} 
                className="group rounded-lg border border-border/40 p-5 md:p-6 bg-void-950/20 transition-all hover:bg-void-900/40 hover:border-border/80"
              >
                <div className="mb-3 flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <h4 className="font-display font-black text-base md:text-lg uppercase tracking-wide text-white group-hover:text-primary transition-colors leading-tight">
                    {ann.title}
                  </h4>
                  <span className="shrink-0 font-mono text-[9px] font-bold uppercase text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-sm tracking-wide self-start md:self-center shadow-xs">
                    {new Date(ann.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-void-400 leading-relaxed font-medium">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/60 rounded-lg bg-void-950/10">
            <div className="h-12 w-12 bg-void-900/80 border border-border/80 rounded-lg flex items-center justify-center mb-4">
              <Megaphone className="h-5 w-5 text-void-500" />
            </div>
            <p className="font-mono text-[10px] text-void-500 uppercase tracking-wider">
              No Transmission Detected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}