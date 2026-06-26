"use client";

import { useState, useEffect } from "react";
import { Search, Ban, ShieldAlert, UserMinus, Users, Trophy, Trash2, Filter, ArrowUpDown, ShieldCheck, Calendar, Fingerprint } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminPlayersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [playerTypeFilter, setPlayerTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchEverything = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: players } = await supabase.from("players").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");
    const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]));
    const playerMap = new Map(players?.map((p) => [p.name.toLowerCase(), p]));
    const merged = profiles?.map((profile) => {
      const playerInfo = playerMap.get(profile.username.toLowerCase());
      return { ...profile, role: roleMap.get(profile.id) || "user", is_player: !!playerInfo, player_data: playerInfo };
    }) || [];
    setData(merged);
    setLoading(false);
  };

  useEffect(() => { fetchEverything(); }, []);

  const filtered = data.filter((item) => {
    const matchesSearch = item.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || item.role === roleFilter;
    const matchesType = playerTypeFilter === "all" || (playerTypeFilter === "players" ? item.is_player : !item.is_player);
    return matchesSearch && matchesRole && matchesType;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "az") return a.username.localeCompare(b.username);
    return 0;
  });

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    if (newRole !== "user") await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    toast.success(`User elevated to ${newRole}`);
    fetchEverything();
  };

  const handleDismissPlayer = async (playerName: string) => {
    await supabase.from("players").delete().eq("name", playerName);
    toast.success(`${playerName} is no longer an active player.`);
    fetchEverything();
  };

  const handleDismissUser = async (profileId: string, username: string) => {
    await supabase.from("profiles").update({ is_banned: true }).eq("id", profileId);
    await supabase.from("players").delete().eq("name", username);
    await supabase.from("profiles").delete().eq("id", profileId);
    toast.error("User account has been terminated.");
    fetchEverything();
  };

  return (
    <div className="text-foreground">
      {/* Search & Control Filtering Cluster */}
      <div className="space-y-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-void-500 transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search roster by operative username..." 
            className="pl-11 h-12 rounded-lg bg-void-900 border-border text-white font-sans font-medium placeholder:text-void-600 focus-visible:ring-primary/40 focus-visible:border-primary transition-all text-sm" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={playerTypeFilter} onValueChange={setPlayerTypeFilter}>
            <SelectTrigger className="w-full sm:w-[170px] h-10 rounded-lg bg-void-900 border-border text-void-300 font-display font-bold uppercase text-[10px] tracking-wider focus:ring-primary/40 focus:border-primary transition-all">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-primary" />
                <SelectValue placeholder="TYPE" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border bg-void-950 font-display font-semibold uppercase text-xs text-void-200">
              <SelectItem value="all" className="focus:bg-void-900 focus:text-white">All Members</SelectItem>
              <SelectItem value="players" className="focus:bg-void-900 focus:text-white">Active Players</SelectItem>
              <SelectItem value="users" className="focus:bg-void-900 focus:text-white">Regular Users</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[170px] h-10 rounded-lg bg-void-900 border-border text-void-300 font-display font-bold uppercase text-[10px] tracking-wider focus:ring-primary/40 focus:border-primary transition-all">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <SelectValue placeholder="ROLE" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border bg-void-950 font-display font-semibold uppercase text-xs text-void-200">
              <SelectItem value="all" className="focus:bg-void-900 focus:text-white">All Roles</SelectItem>
              <SelectItem value="admin" className="focus:bg-void-900 focus:text-white">Admins</SelectItem>
              <SelectItem value="moderator" className="focus:bg-void-900 focus:text-white">Moderators</SelectItem>
              <SelectItem value="user" className="focus:bg-void-900 focus:text-white">Users</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[170px] h-10 rounded-lg bg-void-900 border-border text-void-300 font-display font-bold uppercase text-[10px] tracking-wider focus:ring-primary/40 focus:border-primary transition-all">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                <SelectValue placeholder="SORT" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border bg-void-950 font-display font-semibold uppercase text-xs text-void-200">
              <SelectItem value="newest" className="focus:bg-void-900 focus:text-white">Newest First</SelectItem>
              <SelectItem value="oldest" className="focus:bg-void-900 focus:text-white">Oldest First</SelectItem>
              <SelectItem value="az" className="focus:bg-void-900 focus:text-white">Alpha (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Main Grid Node Database Content Stream */}
      <div className="grid gap-3.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="h-10 w-10 border-2 border-void-800 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="rounded-xl border-dashed border border-void-700 bg-void-900/20 backdrop-blur-xs">
            <CardContent className="py-20 text-center flex flex-col items-center justify-center">
              <Users className="h-10 w-10 text-void-600 mb-4 animate-pulse" />
              <p className="text-void-400 font-mono uppercase tracking-widest text-[10px]">No operational profiles match criteria</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="rounded-xl border border-border bg-card/20 backdrop-blur-sm text-card-foreground shadow-md overflow-hidden transition-all duration-200 hover:border-void-700">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between p-5 md:p-6 gap-6">
                <div className="flex items-center gap-5 w-full">
                  <Avatar className="h-14 w-14 rounded-lg border border-border shadow-md">
                    <AvatarFallback className="font-display font-bold bg-void-900 text-white text-base">
                      {item.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-display font-bold uppercase tracking-wide text-white truncate max-w-[160px] sm:max-w-xs">
                        {item.username}
                      </h4>
                      {item.is_player ? (
                        <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded shadow-none h-5">
                          <Trophy className="h-2.5 w-2.5 mr-1 stroke-[2.5px]" /> PRIME ROSTER
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-void-800 text-void-400 border border-border font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded shadow-none h-5">
                          MEMBER
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-void-400 uppercase tracking-wide">
                        <Fingerprint className="h-3 w-3 text-primary" /> 
                        Role: <span className="text-white font-medium">{item.role}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-void-500 uppercase tracking-wide">
                        <Calendar className="h-3 w-3 text-void-600" /> 
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Management Configuration Controls Area */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 border-t border-border/40 pt-4 sm:pt-0 sm:border-none">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="flex-1 sm:flex-none h-9 px-4 rounded-md font-display font-bold uppercase text-[10px] tracking-wider bg-void-900 border border-border text-void-300 hover:bg-void-800 hover:text-white transition-all shadow-2xs">
                        Privileges
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground p-6 max-w-sm shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-center font-display font-bold uppercase tracking-wide text-white text-base mb-2">
                          Assign Cluster Privileges
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <div className="grid gap-2">
                        <Button variant="outline" className="h-11 rounded-lg border-border bg-void-900 text-void-200 font-display font-bold uppercase text-xs tracking-wide hover:bg-void-800 hover:text-white" onClick={() => handleRoleUpdate(item.id, "user")}>
                          REGULAR USER
                        </Button>
                        <Button variant="outline" className="h-11 rounded-lg border-border bg-void-900 text-void-200 font-display font-bold uppercase text-xs tracking-wide hover:bg-void-800 hover:text-white" onClick={() => handleRoleUpdate(item.id, "moderator")}>
                          MODERATOR
                        </Button>
                        <Button className="h-11 rounded-lg font-display font-bold uppercase text-xs tracking-wide bg-neon text-primary-foreground hover:opacity-90 transition-all border-none neon-glow" onClick={() => handleRoleUpdate(item.id, "admin")}>
                          ADMINISTRATOR
                        </Button>
                      </div>
                      <AlertDialogFooter className="mt-3">
                        <AlertDialogCancel className="w-full rounded-lg border border-border bg-void-900 text-void-400 font-display font-bold uppercase text-[10px] tracking-wider h-10 hover:bg-void-800 hover:text-white">
                          Cancel
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" className="h-9 w-9 rounded-md bg-void-900 border border-border text-void-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all shadow-2xs">
                        <Ban className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground p-6 max-w-md shadow-2xl">
                      <AlertDialogHeader className="space-y-3">
                        <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center mx-auto border border-destructive/10">
                          <ShieldAlert className="h-6 w-6" />
                        </div>
                        <AlertDialogTitle className="uppercase font-display font-bold tracking-wide text-white text-base text-center">
                          Security Mitigation Protocol
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center font-normal text-void-400 text-sm">
                          Select protective operational restriction for user <span className="text-white font-semibold">{item.username}</span>. Account deletion purges historical tracking metrics.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <div className="grid gap-2.5 py-4">
                        {item.is_player && (
                          <Button variant="outline" className="h-14 rounded-lg border-border bg-void-900 hover:bg-void-800 text-left justify-start px-4 gap-3.5 group" onClick={() => handleDismissPlayer(item.username)}>
                            <div className="p-1.5 rounded-md bg-void-950 group-hover:bg-void-900 transition-colors border border-border/50">
                              <UserMinus className="h-4 w-4 text-void-400 group-hover:text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-display font-bold uppercase text-xs text-white leading-none">Dismiss Active Player</span>
                              <span className="text-[9px] font-mono text-void-500 uppercase tracking-wide mt-1">Remove entry from public esports team roster</span>
                            </div>
                          </Button>
                        )}
                        
                        <Button className="h-14 rounded-lg bg-destructive text-white hover:bg-destructive/90 text-left justify-start px-4 gap-3.5 shadow-lg border-none" onClick={() => handleDismissUser(item.id, item.username)}>
                          <div className="p-1.5 rounded-md bg-black/20">
                            <Trash2 className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-display font-bold uppercase text-xs leading-none">Terminate System ID</span>
                            <span className="text-[9px] font-mono text-white/70 uppercase tracking-wide mt-1">Execute immediate core database wipe and ban trigger</span>
                          </div>
                        </Button>
                      </div>
                      
                      <AlertDialogFooter>
                        <AlertDialogCancel className="w-full rounded-lg border border-border bg-void-900 text-void-400 font-display font-bold uppercase text-[10px] tracking-wider h-10 hover:bg-void-800 hover:text-white">
                          Abort Operations
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}