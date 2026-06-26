"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Calendar, Users, Loader2, Gamepad2, Check, X, Eye, ShieldAlert, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const statuses = ["upcoming", "live", "completed", "cancelled"];
const emptyForm = { title: "", description: "", game: "", team_format: "Squad", team_mode: "squad", opponent: "", result: "", scheduled_at: "", is_paid: false, price: 0, max_players: 10, status: "upcoming" as const };

export default function AdminScrimsPage() {
  const [scrims, setScrims] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [games, setGames] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScrim, setEditingScrim] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [formData, setFormData] = useState(emptyForm);
  const { user } = useAuth();

  const fetchScrims = useCallback(async () => {
    const { data } = await supabase.from("scrims").select("*").order("scheduled_at", { ascending: false });
    setScrims(data || []);
  }, []);

  const fetchBookings = useCallback(async () => {
    const { data } = await supabase.from("bookings").select(`*, scrims(title, game), teams(name)`).order("booked_at", { ascending: false });
    setBookings(data || []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchScrims(), fetchBookings(), supabase.from("games").select("name").order("name").then(({ data }) => setGames(data || []))]).finally(() => setLoading(false));
    const sub = supabase.channel("bookings-changes").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchBookings()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [fetchScrims, fetchBookings]);

  const openCreate = () => { setEditingScrim(null); setFormData(emptyForm); setDialogOpen(true); };
  const openEdit = (scrim: any) => { setEditingScrim(scrim); setFormData({ ...emptyForm, ...scrim, scheduled_at: scrim.scheduled_at?.slice(0, 16) || "" }); setDialogOpen(true); };

  const handleSubmit = async () => {
    if (!formData.title || !formData.game || !formData.scheduled_at) { toast.error("Title, game, and schedule are required."); return; }
    setIsSubmitting(true);
    const payload = { ...formData, created_by: user?.id };
    const { error } = editingScrim ? await supabase.from("scrims").update(payload).eq("id", editingScrim.id) : await supabase.from("scrims").insert([payload]);
    setIsSubmitting(false);
    if (error) toast.error(error.message);
    else { toast.success(editingScrim ? "Scrim updated" : "Scrim deployed"); setDialogOpen(false); fetchScrims(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this scrim? This is permanent.")) return;
    const { error } = await supabase.from("scrims").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Scrim removed."); fetchScrims(); }
  };

  const updateBookingStatus = async (booking: any, status: "confirmed" | "rejected", slot_no?: number) => {
    const { error } = await supabase.from("bookings").update({ status, ...(slot_no ? { slot_no } : {}) }).eq("id", booking.id);
    if (error) toast.error(error.message); else { toast.success(`Booking ${status}`); fetchBookings(); setSelectedBooking(null); }
  };

  return (
    <div className="space-y-8 pb-16 text-foreground">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wider text-white">Scrim Operations</h1>
          <p className="text-[11px] font-mono text-void-400 uppercase tracking-widest mt-1">Manage scheduled battles and tactical incoming deployments</p>
        </div>
        <Button onClick={openCreate} className="h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold uppercase tracking-wide text-xs transition-all shadow-md shadow-primary/10 hover:translate-y-[-1px]">
          <Plus className="mr-2 h-4 w-4" /> Deploy New Scrim
        </Button>
      </div>

      <Tabs defaultValue="scrims" className="space-y-8">
        <TabsList className="bg-card/40 border border-border rounded-xl p-1 h-14 w-full sm:w-fit backdrop-blur-xs">
          <TabsTrigger value="scrims" className="flex-1 sm:flex-none rounded-lg font-display font-bold uppercase text-xs px-8 h-full data-[state=active]:bg-void-900 data-[state=active]:text-primary text-void-400 transition-all border border-transparent data-[state=active]:border-border/60">
            Active Scrims
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex-1 sm:flex-none rounded-lg font-display font-bold uppercase text-xs px-8 h-full data-[state=active]:bg-void-900 data-[state=active]:text-orange-400 text-void-400 transition-all border border-transparent data-[state=active]:border-border/60">
            Bookings Queue
            {bookings.filter((b) => b.status === "pending").length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[9px] font-mono rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse">
                {bookings.filter((b) => b.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scrims" className="outline-hidden mt-0">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-xl bg-card/20 border border-border animate-pulse" />
              ))}
            </div>
          ) : scrims.length === 0 ? (
            <Card className="rounded-xl border-dashed border border-border bg-card/20 backdrop-blur-xs">
              <CardContent className="py-20 text-center flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-lg bg-void-900 border border-border flex items-center justify-center text-void-500 mb-4">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                <p className="text-void-400 font-mono uppercase tracking-wider text-xs">No scrim payloads active on system registry</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {scrims.map((scrim) => (
                <Card key={scrim.id} className="rounded-xl border border-border/80 bg-card/40 backdrop-blur-xs overflow-hidden hover:border-void-700 transition-all group relative">
                  <div className={`absolute top-0 left-0 w-[3px] h-full ${scrim.status === 'live' ? 'bg-destructive' : 'bg-primary'}`} />
                  
                  <CardHeader className="pb-3 pl-6 pt-5">
                    <div className="flex justify-between items-center mb-2.5">
                      <Badge variant={scrim.status === "live" ? "destructive" : "secondary"} className={`font-mono text-[9px] font-bold uppercase rounded px-2 py-0.5 tracking-wide bg-void-900 border border-border/40 ${scrim.status === "live" && "animate-pulse border-destructive/30"}`}>
                        {scrim.status}
                      </Badge>
                      <span className="text-[10px] font-mono font-bold text-void-400 uppercase tracking-widest bg-void-900/60 border border-border/30 px-2 py-0.5 rounded">
                        {scrim.team_mode}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-display font-bold uppercase text-white tracking-wide group-hover:text-primary transition-colors line-clamp-1">
                      {scrim.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2.5 pl-6 pb-5 pt-0 border-b border-border/30">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-void-300">
                      <Gamepad2 className="h-4 w-4 text-void-500" />
                      {scrim.game}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-medium text-void-300">
                      <Calendar className="h-4 w-4 text-void-500" />
                      {new Date(scrim.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-medium text-void-300">
                      <Users className="h-4 w-4 text-void-500" />
                      Slot Threshold: Max {scrim.max_players} Cap
                    </div>
                    {scrim.is_paid && (
                      <div className="flex items-center gap-2.5 text-xs font-bold text-orange-400">
                        <Award className="h-4 w-4 text-orange-500" />
                        Paid Entry: {scrim.price} PKR
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="gap-2 pl-6 pr-6 bg-void-900/20 py-3 flex items-center justify-between">
                    <Button size="sm" variant="outline" className="flex-1 h-9 rounded-lg font-display font-bold uppercase text-[10px] border-border bg-void-950/40 hover:bg-void-900 text-void-200 hover:text-white transition-all" onClick={() => openEdit(scrim)}>
                      <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Config
                    </Button>
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg text-void-500 hover:text-destructive border-border bg-void-950/40 hover:bg-destructive/10 hover:border-destructive/20 transition-all" onClick={() => handleDelete(scrim.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="outline-hidden mt-0">
          {bookings.length === 0 ? (
            <Card className="rounded-xl border-dashed border border-border bg-card/20 backdrop-blur-xs">
              <CardContent className="py-20 text-center flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-lg bg-void-900 border border-border flex items-center justify-center text-void-500 mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-void-400 font-mono uppercase tracking-wider text-xs">No pipeline requests queued</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bookings.map((b) => (
                <Card key={b.id} className="rounded-xl border border-border/80 bg-card/40 backdrop-blur-xs overflow-hidden relative group hover:border-void-800 transition-all">
                  <div className={`absolute top-0 left-0 w-[3px] h-full ${b.status === "confirmed" ? "bg-emerald-500" : b.status === "pending" ? "bg-amber-500" : "bg-destructive"}`} />
                  <CardContent className="p-5 pl-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold uppercase text-base text-white tracking-wide">{b.scrims?.title}</h4>
                        <span className="text-[9px] font-mono text-void-500 px-1.5 py-0.5 bg-void-900 border border-border/40 rounded uppercase">{b.scrims?.game}</span>
                      </div>
                      <p className="text-[11px] font-mono font-medium text-void-400 uppercase tracking-wide">
                        Unit Assignment: <span className="text-white font-bold">{b.teams?.name || "Solo Operative"}</span> &bull; Transmission Logged: {new Date(b.booked_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <Badge variant={b.status === "confirmed" ? "default" : b.status === "pending" ? "secondary" : "destructive"} className={`font-mono font-bold uppercase text-[9px] px-2.5 py-0.5 rounded tracking-wide ${b.status === "confirmed" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-none hover:bg-emerald-500/10"} ${b.status === "pending" && "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-none hover:bg-amber-500/10"}`}>
                        {b.status}
                      </Badge>
                      <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg border-border bg-void-900 text-void-400 hover:text-white transition-colors" onClick={() => setSelectedBooking(b)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {b.status === "pending" && (
                        <>
                          <Button size="icon" className="h-9 w-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors border-none" onClick={() => updateBookingStatus(b, "confirmed", 1)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" className="h-9 w-9 rounded-lg bg-destructive hover:bg-destructive/90 text-white shadow-xs transition-colors border-none" onClick={() => updateBookingStatus(b, "rejected")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Main Scrim Editor Payload Window Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold uppercase text-xl text-white tracking-wide">
              {editingScrim ? "Modify Configuration" : "Initialize System"}-<span className="text-primary">Scrim Payload</span>
            </DialogTitle>
            <DialogDescription className="text-void-400 font-mono uppercase text-[10px] tracking-wider mt-1">Configure structural baseline parameters for competitive combat simulation matrix.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Scrim Title / Operations Designation</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="h-11 rounded-lg border-border bg-void-900 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" placeholder="e.g. PRIME SQUAD VS CENTRAL HUB" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Rules & Deployment Directives</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-lg border-border bg-void-900 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm min-h-[90px]" placeholder="Specify priority map rotations, customized game rulesets..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Active Game Category</Label>
                <Select value={formData.game} onValueChange={(v) => setFormData({ ...formData, game: v })}>
                  <SelectTrigger className="h-11 rounded-lg border-border bg-void-900 font-medium text-void-300 focus:ring-primary/40 focus:border-primary text-sm">
                    <SelectValue placeholder="Target Arena Architecture" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border bg-void-950 text-void-200 font-medium text-xs">
                    {games.map((g) => <SelectItem key={g.name} value={g.name} className="focus:bg-void-900 focus:text-white">{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Deployment Dimension Mode</Label>
                <Select value={formData.team_mode} onValueChange={(v) => setFormData({ ...formData, team_mode: v })}>
                  <SelectTrigger className="h-11 rounded-lg border-border bg-void-900 font-medium text-void-300 focus:ring-primary/40 focus:border-primary text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border bg-void-950 text-void-200 font-medium text-xs">
                    <SelectItem value="solo" className="focus:bg-void-900 focus:text-white">Solo Operative</SelectItem>
                    <SelectItem value="duo" className="focus:bg-void-900 focus:text-white">Duo Sync</SelectItem>
                    <SelectItem value="squad" className="focus:bg-void-900 focus:text-white">Squad Contingent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Scheduled Execution Window</Label>
                <Input type="datetime-local" value={formData.scheduled_at} onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })} className="h-11 rounded-lg border-border bg-void-900 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-void-400">Max Operative Limits (Sectors/Slots)</Label>
                <Input type="number" value={formData.max_players} onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) || 0 })} className="h-11 rounded-lg border-border bg-void-900 text-white font-medium focus-visible:ring-primary/40 focus-visible:border-primary text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase tracking-wider text-void-400">System Registry Phase</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="h-11 rounded-lg border-border bg-void-900 font-medium text-void-300 focus:ring-primary/40 focus:border-primary text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-border bg-void-950 text-void-200 font-medium text-xs">
                  {statuses.map((s) => <SelectItem key={s} value={s} className="focus:bg-void-900 focus:text-white uppercase font-mono tracking-wider text-[10px]">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-void-900 border border-border rounded-lg mt-1">
              <Label className="text-[10px] font-mono uppercase tracking-wider text-void-300">Commercialized Token Barrier (Paid Entry)</Label>
              <Switch checked={formData.is_paid} onCheckedChange={(v) => setFormData({ ...formData, is_paid: v })} className="data-[state=checked]:bg-primary" />
            </div>
            {formData.is_paid && (
              <div className="space-y-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-orange-400">Required Financial Clearance (PKR)</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="h-11 rounded-lg border-orange-500/30 bg-void-900 text-white font-medium focus-visible:ring-orange-500/40 focus-visible:border-orange-500 text-sm" placeholder="0.00" />
              </div>
            )}
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 bg-white text-void-950 hover:bg-void-200 font-display font-bold uppercase tracking-wide rounded-lg mt-3 transition-colors border-none text-xs shadow-md">
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : editingScrim ? "Commit Configuration Adjustments" : "Initialize Matrix Deployment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Intelligence Insight View Overlay for Specific Bookings */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold uppercase tracking-wide text-white text-lg">System Intelligence <span className="text-primary">Registry</span></DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-3 divide-y divide-border/40">
              <div className="pt-0 space-y-1">
                <p className="text-[9px] font-mono uppercase tracking-widest text-void-500">Operation Deployment Title</p>
                <p className="text-sm font-bold text-white font-display uppercase tracking-wide">{selectedBooking.scrims?.title}</p>
              </div>
              <div className="pt-3.5 space-y-1">
                <p className="text-[9px] font-mono uppercase tracking-widest text-void-500">Designated Combat Unit</p>
                <p className="text-sm font-medium text-void-200 font-sans">{selectedBooking.teams?.name || "Solo Contingent"}</p>
              </div>
              <div className="pt-3.5 space-y-1">
                <p className="text-[9px] font-mono uppercase tracking-widest text-void-500">Encrypted Communications Message</p>
                <p className="text-xs font-medium bg-void-900 p-3 border border-border/50 rounded-lg text-void-300 italic whitespace-pre-wrap font-sans">
                  {selectedBooking.message || "No contextual text payload linked with entry sequence."}
                </p>
              </div>
              <div className="pt-3.5 space-y-2 flex items-center justify-between">
                <p className="text-[9px] font-mono uppercase tracking-widest text-void-500">Deployment Clear State</p>
                <Badge variant={selectedBooking.status === "confirmed" ? "default" : selectedBooking.status === "pending" ? "secondary" : "destructive"} className={`font-mono font-bold uppercase text-[9px] rounded px-2 py-0.5 tracking-wide shadow-none ${selectedBooking.status === "confirmed" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10"}`}>
                  {selectedBooking.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}