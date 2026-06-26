"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { profileSchema, ProfileFormData } from "@/lib/validations";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormData>({ 
    resolver: zodResolver(profileSchema), 
    defaultValues: { username: "", discord_id: "" } 
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username, discord_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) form.reset({ username: data.username || "", discord_id: data.discord_id || "" });
      });
  }, [user]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: data.username, discord_id: data.discord_id, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) toast.error("Failed to update profile. Please try again.");
    else { 
      toast.success("Profile updated successfully."); 
      window.location.reload(); 
    }
  };

  const handleLogout = async () => { 
    await signOut(); 
    router.push("/"); 
  };

  return (
    <div className="space-y-6">
      {/* Identity Matrix Profile Card */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden">
        <div className="h-[3px] bg-primary w-full" />
        
        <CardHeader className="p-6 md:p-8 pb-4 space-y-1.5">
          <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-wider text-void-400">
            Identity Matrix
          </CardTitle>
          <CardDescription className="font-sans text-xs font-semibold uppercase text-void-500 tracking-wide">
            Update your core profile data
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              <div className="space-y-1.5">
                <FormLabel className="font-mono text-[9px] font-bold uppercase tracking-wide text-void-400">
                  Registered Email
                </FormLabel>
                <Input 
                  className="h-10 rounded-lg border-border/40 bg-void-950/40 font-mono text-xs font-semibold text-void-500 cursor-not-allowed border-dashed" 
                  type="email" 
                  value={user?.email || ""} 
                  disabled 
                />
              </div>

              <FormField 
                control={form.control} 
                name="username" 
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="font-mono text-[9px] font-bold uppercase tracking-wide text-void-400">
                      Callsign (Username)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="h-10 rounded-lg border-border/60 bg-void-900 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-white text-xs font-semibold transition-all" 
                        placeholder="Your display name" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-[9px] font-bold text-primary uppercase" />
                  </FormItem>
                )} 
              />

              <FormField 
                control={form.control} 
                name="discord_id" 
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="font-mono text-[9px] font-bold uppercase tracking-wide text-void-400">
                      Discord Comms ID
                    </FormLabel>
                    <FormControl>
                      <Input 
                        className="h-10 rounded-lg border-border/60 bg-void-900 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-white text-xs font-semibold transition-all" 
                        placeholder="username#0000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-[9px] font-bold text-primary uppercase" />
                  </FormItem>
                )} 
              />

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold uppercase text-xs tracking-wide rounded-lg h-10 px-6 transition-colors shadow-xs"
              >
                <Save className="h-4 w-4 shrink-0" />
                {loading ? "Syncing..." : "Update Protocol"}
              </Button>
              
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Danger Zone Termination Card */}
      <Card className="border border-destructive/40 bg-destructive/5 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="p-6 md:p-8 pb-4">
          <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 shrink-0" /> Danger Zone
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-void-950/40 border border-destructive/20">
            <p className="font-mono text-[10px] text-void-500 uppercase tracking-wide max-w-md">
              Immediate session termination will revoke all active encryption access keys.
            </p>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="w-full sm:w-auto gap-2 border-destructive/30 hover:border-destructive hover:bg-destructive text-destructive hover:text-destructive-foreground font-display font-bold uppercase text-[10px] tracking-wide rounded-lg h-9 px-4 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" /> Terminate Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}