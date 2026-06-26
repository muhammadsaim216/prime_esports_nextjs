"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Settings, Bell, ShieldCheck, Globe, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const siteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required").max(100),
  siteDescription: z.string().max(500).optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  discordInviteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});
type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoApproveApplications, setAutoApproveApplications] = useState(false);

  const form = useForm<SiteSettingsFormData>({ 
    resolver: zodResolver(siteSettingsSchema), 
    defaultValues: { 
      siteName: "Prime Esports", 
      siteDescription: "Professional esports organization", 
      contactEmail: "", 
      discordInviteUrl: "", 
      twitterUrl: "" 
    } 
  });

  const onSubmit = async (data: SiteSettingsFormData) => { 
    toast.success("Global parameters updated successfully."); 
  };
  
  const handleToggleChange = (setting: string, value: boolean, setter: (v: boolean) => void) => { 
    setter(value); 
    toast.success(`${setting} has been ${value ? "activated" : "deactivated"}.`); 
  };

  return (
    <div className="space-y-8 pb-16 text-foreground">
      {/* Page Header */}
      <div className="border-b border-border/40 pb-6">
        <h1 className="font-display font-black text-2xl uppercase tracking-wider text-white">System Settings</h1>
        <p className="text-[11px] font-mono text-void-400 uppercase tracking-widest mt-1">Configure global application variables, platform overrides, and communication channels</p>
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="bg-card/40 border border-border rounded-xl p-1 h-14 w-full sm:w-fit backdrop-blur-xs">
          <TabsTrigger value="general" className="flex-1 sm:flex-none rounded-lg font-display font-bold uppercase text-xs px-6 h-full data-[state=active]:bg-void-900 data-[state=active]:text-primary text-void-400 transition-all border border-transparent data-[state=active]:border-border/60">
            <Settings className="h-3.5 w-3.5 mr-2" /> General Config
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex-1 sm:flex-none rounded-lg font-display font-bold uppercase text-xs px-6 h-full data-[state=active]:bg-void-900 data-[state=active]:text-primary text-void-400 transition-all border border-transparent data-[state=active]:border-border/60">
            <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Platform Access
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 sm:flex-none rounded-lg font-display font-bold uppercase text-xs px-6 h-full data-[state=active]:bg-void-900 data-[state=active]:text-primary text-void-400 transition-all border border-transparent data-[state=active]:border-border/60">
            <Bell className="h-3.5 w-3.5 mr-2" /> Dispatch Matrix
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="outline-hidden mt-0">
          <Card className="rounded-xl border border-border/80 bg-card/40 backdrop-blur-xs max-w-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-primary" />
            <CardHeader className="pl-6 md:pl-8 pb-5 pt-6">
              <CardTitle className="font-display font-bold uppercase text-lg text-white tracking-wide">
                Identity & Metadata
              </CardTitle>
              <CardDescription className="text-void-400 font-mono uppercase text-[10px] tracking-wider mt-0.5">Modify public organization profiles and system routing links</CardDescription>
            </CardHeader>
            <CardContent className="pl-6 pr-6 md:pl-8 md:pr-8 pb-8 pt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField 
                    control={form.control} 
                    name="siteName" 
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-mono uppercase tracking-wider text-void-400">Site Name / Network Callsign</FormLabel>
                        <FormControl>
                          <Input className="h-11 rounded-lg border-border bg-void-900/60 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" {...field} placeholder="Organization Identity" />
                        </FormControl>
                        <FormMessage className="text-xs font-semibold text-destructive/90" />
                      </FormItem>
                    )} 
                  />
                  <FormField 
                    control={form.control} 
                    name="siteDescription" 
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-mono uppercase tracking-wider text-void-400">Organization Broadcast Description</FormLabel>
                        <FormControl>
                          <Input className="h-11 rounded-lg border-border bg-void-900/60 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" {...field} placeholder="A short description about the setup" />
                        </FormControl>
                        <FormMessage className="text-xs font-semibold text-destructive/90" />
                      </FormItem>
                    )} 
                  />
                  <FormField 
                    control={form.control} 
                    name="contactEmail" 
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-mono uppercase tracking-wider text-void-400">Administrative Contact Route (Email)</FormLabel>
                        <FormControl>
                          <Input className="h-11 rounded-lg border-border bg-void-900/60 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" {...field} placeholder="hq@organization.com" />
                        </FormControl>
                        <FormMessage className="text-xs font-semibold text-destructive/90" />
                      </FormItem>
                    )} 
                  />

                  <div className="pt-2">
                    <Separator className="bg-border/30 mb-4" />
                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-void-400 mb-3.5">External Gateway Synchronization</h3>
                    
                    <div className="grid gap-4">
                      <FormField 
                        control={form.control} 
                        name="discordInviteUrl" 
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[9px] font-mono uppercase tracking-wider text-void-500">Discord Comms Node URL</FormLabel>
                            <FormControl>
                              <Input className="h-11 rounded-lg border-border bg-void-900/60 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" {...field} placeholder="https://discord.gg/..." />
                            </FormControl>
                            <FormMessage className="text-xs font-semibold text-destructive/90" />
                          </FormItem>
                        )} 
                      />
                      <FormField 
                        control={form.control} 
                        name="twitterUrl" 
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[9px] font-mono uppercase tracking-wider text-void-500">X (Twitter) Broadcast URL</FormLabel>
                            <FormControl>
                              <Input className="h-11 rounded-lg border-border bg-void-900/60 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" {...field} placeholder="https://x.com/..." />
                            </FormControl>
                            <FormMessage className="text-xs font-semibold text-destructive/90" />
                          </FormItem>
                        )} 
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full sm:w-auto h-11 px-8 bg-white text-void-950 hover:bg-void-200 font-display font-bold uppercase tracking-wide rounded-lg mt-4 transition-colors border-none text-xs shadow-md">
                    Save Configuration
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Access Tab */}
        <TabsContent value="platform" className="outline-hidden mt-0">
          <Card className="rounded-xl border border-border/80 bg-card/40 backdrop-blur-xs max-w-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-primary" />
            <CardHeader className="pl-6 md:pl-8 pb-5 pt-6">
              <CardTitle className="font-display font-bold uppercase text-lg text-white tracking-wide">
                Platform Restrictions
              </CardTitle>
              <CardDescription className="text-void-400 font-mono uppercase text-[10px] tracking-wider mt-0.5">Toggle runtime core state values and firewall rulesets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pl-6 pr-6 md:pl-8 md:pr-8 pb-8 pt-0">
              <div className="flex items-center justify-between p-4 bg-void-900/50 border border-border/80 rounded-xl transition-all hover:border-void-800">
                <div className="space-y-1 pr-4">
                  <Label className="text-xs font-display font-bold uppercase tracking-wide text-white">Maintenance Intercept Mode</Label>
                  <p className="text-[10px] text-void-400 font-mono uppercase tracking-wide">Sever public client viewing streams temporarily for patch application.</p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={(v) => handleToggleChange("Maintenance Mode", v, setMaintenanceMode)} className="data-[state=checked]:bg-primary" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-void-900/50 border border-border/80 rounded-xl transition-all hover:border-void-800">
                <div className="space-y-1 pr-4">
                  <Label className="text-xs font-display font-bold uppercase tracking-wide text-white">User Registry Pipeline</Label>
                  <p className="text-[10px] text-void-400 font-mono uppercase tracking-wide">Enable or isolate global registration boundaries for incoming profiles.</p>
                </div>
                <Switch checked={registrationEnabled} onCheckedChange={(v) => handleToggleChange("User Registration", v, setRegistrationEnabled)} className="data-[state=checked]:bg-primary" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-void-900/50 border border-border/80 rounded-xl transition-all hover:border-void-800">
                <div className="space-y-1 pr-4">
                  <Label className="text-xs font-display font-bold uppercase tracking-wide text-white">Auto-Approve Scrim Clearance</Label>
                  <p className="text-[10px] text-void-400 font-mono uppercase tracking-wide">Automate verified bracket placements skipping human operations reviews.</p>
                </div>
                <Switch checked={autoApproveApplications} onCheckedChange={(v) => handleToggleChange("Auto-Approve Applications", v, setAutoApproveApplications)} className="data-[state=checked]:bg-primary" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="outline-hidden mt-0">
          <Card className="rounded-xl border border-border/80 bg-card/40 backdrop-blur-xs max-w-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-primary" />
            <CardHeader className="pl-6 md:pl-8 pb-5 pt-6">
              <CardTitle className="font-display font-bold uppercase text-lg text-white tracking-wide">
                Telemetry Messaging Matrix
              </CardTitle>
              <CardDescription className="text-void-400 font-mono uppercase text-[10px] tracking-wider mt-0.5">Control automated alert routing vectors for active operators</CardDescription>
            </CardHeader>
            <CardContent className="pl-6 pr-6 md:pl-8 md:pr-8 pb-8 pt-0">
              <div className="flex items-center justify-between p-4 bg-void-900/50 border border-border/80 rounded-xl transition-all hover:border-void-800">
                <div className="space-y-1 pr-4">
                  <Label className="text-xs font-display font-bold uppercase tracking-wide text-white">Email Dispatch Alerts</Label>
                  <p className="text-[10px] text-void-400 font-mono uppercase tracking-wide">Forward complete raw metadata packets via standard email relays upon new system applications.</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={(v) => handleToggleChange("Email Notifications", v, setEmailNotifications)} className="data-[state=checked]:bg-primary" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}