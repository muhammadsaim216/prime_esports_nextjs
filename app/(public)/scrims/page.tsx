"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gamepad2, Video, Radio, Users, Terminal, Activity, ChevronRight, Shield, Crosshair, UserCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const getEmbedUrl = (url: string | null) => {
  if (!url) return null;
  if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
  if (url.includes("youtu.be/")) { const id = url.split("youtu.be/")[1]?.split("?")[0]; return `https://www.youtube.com/embed/${id}`; }
  return url;
};

export default function ScrimsPage() {
  const [scrims, setScrims] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [userApplications, setUserApplications] = useState<Record<string, any>>({});
  const [selectedScrim, setSelectedScrim] = useState<any>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [userTeam, setUserTeam] = useState<any>(null);
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [slotToBook, setSlotToBook] = useState<{ team: number; slot: number; key: string } | null>(null);
  const [playerForSlot, setPlayerForSlot] = useState<any>(null);
  const [bookingSlot, setBookingSlot] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    supabase.from("scrims").select("*").in("status", ["upcoming", "live"]).order("scheduled_at").then(({ data }) => setScrims(data || []));
    supabase.from("streams").select("*").eq("is_live", true).order("created_at", { ascending: false }).then(({ data }) => setStreams(data || []));
  }, []);

  // Fetch user's submitted applications to disable re-submissions
  useEffect(() => {
    if (user) {
      supabase
        .from("scrim_applications")
        .select("*")
        .eq("user_id", user.id)
        .then(({ data }) => {
          if (data) {
            const appsMap: Record<string, any> = {};
            data.forEach((app) => {
              if (app.scrim_id) appsMap[app.scrim_id] = app;
            });
            setUserApplications(appsMap);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    if (selectedScrim && user && selectedScrim.team_mode !== "solo") fetchUserTeam();
  }, [selectedScrim, user]);

  const fetchUserTeam = async () => {
    if (!user) return;
    const { data: myPlayers } = await supabase.from("players").select("*").eq("id", user.id);
    if (!myPlayers || myPlayers.length === 0) { setUserTeam(null); setTeamPlayers([]); return; }
    const myPlayer = myPlayers.find((p: any) => p.is_active === true || p.status === "active") || myPlayers[0];
    if (!myPlayer.team_id) { setUserTeam(null); setTeamPlayers([]); return; }
    setUserTeam({ id: myPlayer.team_id, name: myPlayer.team_name || "My Team" });
    const { data: allTeamPlayers } = await supabase.from("players").select("*").eq("team_id", myPlayer.team_id);
    if (!allTeamPlayers) { setTeamPlayers([]); return; }
    const active = allTeamPlayers.filter((p: any) => p.is_active === true || p.status === "active");
    const final = active.length > 0 ? active : allTeamPlayers;
    setTeamPlayers(final.map((p: any) => ({ id: p.user_id || p.id, name: p.name || "Unknown Operative" })));
  };

  const handlePlayerToggle = (playerId: string) => {
    const limit = selectedScrim?.team_mode === "duo" ? 2 : 4;
    setSelectedPlayerIds((prev) => prev.includes(playerId) ? prev.filter((id) => id !== playerId) : prev.length < limit ? [...prev, playerId] : prev);
  };

  const handleApply = async () => {
    if (!user || !selectedScrim) return;
    if (userApplications[selectedScrim.id]) { toast.error("An application has already been submitted for this deployment."); return; }
    if (selectedScrim.team_mode !== "solo" && !userTeam) { toast.error("You need a team for Duo/Squad matches."); return; }
    
    setApplying(true);
    try {
      const fallbackName = user.email?.includes("@") ? user.email.split("@")[0] : "Player";
      
      const { data, error } = await supabase.from("scrim_applications").insert({
        scrim_id: selectedScrim.id,
        user_id: user.id,
        team_name: userTeam?.name || "Solo Operative",
        player_name: fallbackName,
        contact_info: user.email || "No Email Provided",
        message: applicationMessage,
        status: "pending",
        requested_date: new Date().toISOString()
      }).select().single();

      if (error) throw error;
      
      toast.success("Registration Submitted! Admin will review your roster shortly.");
      
      // Update local application registry state immediately
      setUserApplications(prev => ({ ...prev, [selectedScrim.id]: data }));
      setSelectedScrim(null); 
      setApplicationMessage(""); 
      setSelectedPlayerIds([]);
    } catch (err: any) { 
      toast.error(err.message); 
    } finally { 
      setApplying(false); 
    }
  };

  const handleConfirmSlotBooking = async () => {
    if (!slotToBook || !selectedScrim || !user) return;
    const fallbackName = user.email?.includes("@") ? user.email.split("@")[0] : "SoloPlayer";
    let playerToAssign = { id: user.id, name: fallbackName };
    if (selectedScrim.team_mode !== "solo") {
      if (!playerForSlot) { toast.error("You must choose an operative for this slot."); return; }
      playerToAssign = { id: playerForSlot.id, name: playerForSlot.name };
    }
    setBookingSlot(true);
    try {
      const updatedSlots = { ...(selectedScrim.slots || {}), [slotToBook.key]: playerToAssign };
      const { error } = await supabase.from("scrims").update({ slots: updatedSlots }).eq("id", selectedScrim.id);
      if (error) throw error;
      setSelectedScrim({ ...selectedScrim, slots: updatedSlots });
      setScrims(scrims.map((s) => (s.id === selectedScrim.id ? { ...s, slots: updatedSlots } : s)));
      toast.success(`${playerToAssign.name} deployed to T${slotToBook.team}-S${slotToBook.slot}`);
      setSlotToBook(null); setPlayerForSlot(null);
    } catch (err: any) { toast.error(err.message); } finally { setBookingSlot(false); }
  };

  const getAssignedPlayerIds = () => {
    if (!selectedScrim?.slots) return [];
    return Object.values(selectedScrim.slots)
      .filter((slotData: any) => slotData && slotData.id)
      .map((slotData: any) => slotData.id);
  };

  const assignedPlayerIds = getAssignedPlayerIds();

  const renderSlotMatrix = (scrim: any) => {
    const playersPerTeam = scrim.team_mode === "squad" ? 4 : scrim.team_mode === "duo" ? 2 : 1;
    const totalTeams = Math.ceil(scrim.max_players / playersPerTeam);
    const gridColsClass = playersPerTeam === 4 ? "grid-cols-4" : playersPerTeam === 2 ? "grid-cols-2" : "grid-cols-1";
    return (
      <div className="space-y-4 max-h-[350px] overflow-y-auto bg-void-950 p-6 border border-void-700/40 rounded-xl shadow-inner">
        <Label className="text-xl font-display font-semibold tracking-tight text-foreground flex items-center gap-2 border-b border-void-700/40 pb-2 mb-6"><Crosshair className="text-primary" /> Slot Matrix</Label>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: totalTeams }).map((_, tIdx) => {
            const teamNum = tIdx + 1;
            return (
              <div key={teamNum} className="bg-card border border-void-700/40 p-4 rounded-xl shadow-sm">
                <div className="text-sm font-semibold tracking-tight mb-3 bg-void-900 text-foreground inline-block px-3 py-1 rounded-lg">Team {teamNum}</div>
                <div className={`grid gap-2 ${gridColsClass}`}>
                  {Array.from({ length: playersPerTeam }).map((_, sIdx) => {
                    const slotNum = sIdx + 1;
                    const slotKey = `${teamNum}-${slotNum}`;
                    const slotData = scrim.slots?.[slotKey];
                    return (
                      <button key={slotKey} type="button" onClick={() => !slotData && setSlotToBook({ team: teamNum, slot: slotNum, key: slotKey })} disabled={!!slotData}
                        className={`h-12 flex items-center justify-center border font-semibold text-sm rounded-lg transition-all ${slotData ? "bg-primary text-void-900 border-primary/50 opacity-90 cursor-not-allowed" : "bg-void-900 text-void-300 border-void-700/40 hover:bg-void-800 hover:text-foreground hover:border-primary/40 shadow-sm"}`}
                        title={slotData ? `Booked by ${slotData.name}` : `Book Slot ${slotNum}`}>
                        {slotData ? slotData.name.charAt(0).toUpperCase() : `S${slotNum}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="relative bg-background border-b border-border py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(90deg, #15FFB5 1px, transparent 1px), linear-gradient(#15FFB5 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-3 bg-void-900 border border-void-600/40 text-foreground px-6 py-2 rounded-full mb-8"><Activity size={16} className="text-primary" /><span className="text-[10px] font-semibold tracking-wide">Broadcast Operations</span></div>
          <h1 className="font-display font-semibold text-6xl md:text-8xl tracking-tight leading-[0.85] mb-4 text-foreground">Scrims & <span className="text-neon">Streams</span></h1>
          <p className="text-[11px] font-medium text-void-300 mt-6 tracking-wide">Live Competitive Deployments // Realtime Intel</p>
        </div>
      </section>

      <section className="container py-16">
        <Tabs defaultValue="scrims" className="space-y-12">
          <TabsList className="flex w-fit mx-auto bg-void-900 p-1 rounded-xl border border-void-700/40 shadow-sm">
            <TabsTrigger value="scrims" className="data-[state=active]:bg-primary data-[state=active]:text-void-900 text-void-300 rounded-lg px-8 py-3 gap-2 font-semibold text-sm tracking-wide transition-all"><Gamepad2 className="h-4 w-4" /> Scrims</TabsTrigger>
            <TabsTrigger value="streams" className="data-[state=active]:bg-primary data-[state=active]:text-void-900 text-void-300 rounded-lg px-8 py-3 gap-2 font-semibold text-sm tracking-wide transition-all"><Video className="h-4 w-4" /> Live Streams</TabsTrigger>
          </TabsList>

          <TabsContent value="scrims" className="space-y-10 outline-none">
            <div className="flex items-center gap-4 border-b border-void-700/40 pb-4"><Terminal className="text-primary" size={28} /><h2 className="font-display font-semibold text-3xl tracking-tight">Available Deployments</h2></div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {scrims.map((scrim) => {
                const isAlreadyApplied = !!userApplications[scrim.id];
                return (
                  <Card key={scrim.id} className="bg-card border border-void-700/40 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-void-950/10 hover:-translate-y-1 transition-all group overflow-hidden">
                    <CardHeader className="pb-4 border-b border-void-700/20">
                      <div className="flex justify-between items-center mb-4">
                        <Badge className={`rounded-lg font-medium text-[10px] tracking-wide ${scrim.status === "live" ? "bg-destructive animate-pulse" : "bg-void-900 text-foreground"}`}>{scrim.status}</Badge>
                        <span className="text-primary font-medium text-[10px] tracking-wide">{scrim.team_mode || "Squad"} Ops</span>
                      </div>
                      <CardTitle className="text-3xl font-display font-semibold tracking-tight leading-none group-hover:text-primary transition-colors">{scrim.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-void-900/60 p-3 rounded-lg border border-void-700/40"><Gamepad2 className="h-4 w-4 text-primary" /><span className="text-[11px] font-medium text-foreground">{scrim.game}</span></div>
                        <div className="flex items-center gap-3 bg-void-900/60 p-3 rounded-lg border border-void-700/40"><Users className="h-4 w-4 text-primary" /><span className="text-[11px] font-medium text-foreground">Max {scrim.max_players}</span></div>
                      </div>
                      <Dialog onOpenChange={(open) => { if (!open) { setSelectedPlayerIds([]); setApplicationMessage(""); } }}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full bg-void-900 hover:bg-primary hover:text-void-900 text-foreground font-semibold text-sm rounded-xl h-14 border border-void-700/40 transition-all hover:shadow-neon disabled:opacity-50" 
                            onClick={() => setSelectedScrim(scrim)} 
                            disabled={!user || scrim.status === "live" || isAlreadyApplied}
                          >
                            {scrim.status === "live" ? "Entry Closed" : isAlreadyApplied ? "Application Submitted" : user ? "Initialize Entry" : "Auth Required"} <ChevronRight className="ml-2 h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] rounded-2xl border border-void-700/40 p-0 overflow-hidden max-h-[90vh] overflow-y-auto bg-void-900">
                          <DialogHeader className="bg-void-950 text-foreground p-8 border-b border-void-700/40">
                            <DialogTitle className="text-3xl font-display font-semibold tracking-tight flex items-center gap-4"><Shield className="text-primary" /> Registration Form</DialogTitle>
                            <DialogDescription className="font-medium text-[11px] text-void-300 tracking-wide mt-2">Op Type: <span className="text-foreground">{scrim.team_mode || "Squad"}</span> // ID: {scrim.id.slice(0, 8)}</DialogDescription>
                          </DialogHeader>
                          <div className="p-8 space-y-8 bg-background">
                            {renderSlotMatrix(scrim)}
                            {scrim.team_mode !== "solo" && (
                              <div className="space-y-4">
                                <Label className="text-[11px] font-medium text-void-300 tracking-wide">General Team Roster</Label>
                                {!userTeam ? (
                                  <div className="p-6 bg-void-950 border border-dashed border-void-700/40 rounded-xl text-center text-sm font-medium text-void-300">No Roster Detected</div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-3">
                                    {teamPlayers.map((player) => (
                                      <div key={player.id} onClick={() => handlePlayerToggle(player.id)} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${selectedPlayerIds.includes(player.id) ? "border-primary bg-primary/5" : "border-void-700/40 bg-card"}`}>
                                        <UserCheck className={`w-4 h-4 ${selectedPlayerIds.includes(player.id) ? "text-primary" : "text-void-600"}`} /><span className="text-[11px] font-medium text-foreground">{player.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="space-y-3 border-t border-void-700/40 pt-8">
                              <Label className="text-[11px] font-medium text-void-300 tracking-wide">Intel Remarks & Waitlist</Label>
                              <Textarea placeholder="Any specific information for the admin..." value={applicationMessage} onChange={(e) => setApplicationMessage(e.target.value)} className="rounded-xl bg-void-950 border border-void-700/40 min-h-[120px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-void-400 font-medium text-sm" />
                            </div>
                            <Button onClick={handleApply} className="w-full h-16 bg-neon-gradient text-void-900 font-semibold text-sm rounded-xl hover:opacity-90 transition-all hover:shadow-neon" disabled={applying || isAlreadyApplied || (scrim.team_mode !== "solo" && !userTeam)}>
                              {applying ? "Processing..." : isAlreadyApplied ? "Already Registered" : "Submit General Application"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="streams" className="space-y-10 outline-none">
            <div className="flex items-center gap-4 border-b border-void-700/40 pb-4"><Radio className="text-primary" size={28} /><h2 className="font-display font-semibold text-3xl tracking-tight">Live Satellite Feeds</h2></div>
            <div className="grid gap-10 md:grid-cols-2">
              {streams.map((stream) => (
                <Card key={stream.id} className="rounded-2xl border border-void-700/40 bg-card shadow-sm overflow-hidden">
                  <div className="relative aspect-video bg-void-950 border-b border-void-700/40">
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-destructive text-white px-3 py-1 text-[10px] font-semibold rounded-lg animate-pulse"><span className="w-2 h-2 bg-white rounded-full" /> Live Feed</div>
                    {stream.embed_url ? (
                      <iframe src={getEmbedUrl(stream.embed_url) || stream.embed_url} className="absolute inset-0 w-full h-full z-10 border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"><Video className="h-16 w-16 text-void-600" /></div>
                    )}
                  </div>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-2"><div className="h-px w-8 bg-primary" /><span className="text-[10px] font-medium text-void-300 tracking-wide">Station Alpha</span></div>
                    <h3 className="font-display font-semibold tracking-tight text-2xl text-foreground leading-tight mb-4">{stream.title}</h3>
                    <p className="text-sm text-void-300 font-medium leading-relaxed border-l-2 border-void-700/40 pl-4 whitespace-pre-wrap break-words">{stream.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Dialog open={!!slotToBook} onOpenChange={(open) => { if (!open) { setSlotToBook(null); setPlayerForSlot(null); } }}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border border-void-700/40 p-0 bg-void-900">
          <DialogHeader className="bg-void-950 text-foreground p-6 border-b border-void-700/40"><DialogTitle className="font-display font-semibold tracking-tight flex items-center gap-2"><Crosshair className="text-primary" /> Deploy to Slot</DialogTitle></DialogHeader>
          <div className="p-6 space-y-6 bg-background">
            <div className="bg-void-950 p-4 border border-void-700/40 text-center rounded-xl"><p className="font-semibold tracking-tight text-xl text-foreground">Team {slotToBook?.team} <span className="text-primary">/</span> Slot {slotToBook?.slot}</p></div>
            {selectedScrim?.team_mode !== "solo" ? (
              <div className="space-y-3">
                <Label className="text-[11px] font-medium text-void-300 tracking-wide">Select Operative</Label>
                {teamPlayers.length === 0 ? (
                  <div className="p-4 bg-void-950 border border-dashed border-void-700/40 rounded-xl text-center text-sm font-medium text-void-300">No Roster Found</div>
                ) : (
                  <div className="grid gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {teamPlayers.map((p) => {
                      const isAlreadyAssigned = assignedPlayerIds.includes(p.id);
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => !isAlreadyAssigned && setPlayerForSlot(p)} 
                          className={`p-3 border rounded-xl font-semibold text-xs tracking-wide transition-all flex items-center justify-between ${
                            isAlreadyAssigned 
                              ? "border-void-800 bg-void-950/40 text-void-600 cursor-not-allowed opacity-50" 
                              : playerForSlot?.id === p.id 
                                ? "border-primary bg-primary/10 text-primary cursor-pointer" 
                                : "border-void-700/40 bg-card text-foreground hover:bg-void-800 cursor-pointer"
                          }`}
                        >
                          <span>{p.name}</span>
                          {isAlreadyAssigned && (
                            <span className="text-[9px] font-mono text-amber-500 uppercase flex items-center gap-1">
                              <AlertTriangle size={10} /> Deployed
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-void-300 font-medium text-center border border-dashed border-void-700/40 rounded-xl p-4">You will be deployed to this slot as a Solo Operative.</p>
            )}
            <Button className="w-full h-14 bg-void-900 hover:bg-primary hover:text-void-900 text-foreground rounded-xl font-semibold text-sm border border-void-700/40 transition-all hover:shadow-neon" disabled={bookingSlot || (selectedScrim?.team_mode !== "solo" && (!playerForSlot || assignedPlayerIds.includes(playerForSlot.id)))} onClick={handleConfirmSlotBooking}>
              {bookingSlot ? "Processing Deployment..." : "Confirm Slot Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}