"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Trophy, Gamepad2, UploadCloud, CheckCircle, Edit2, Trash2, Users, Search, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPlayersManagement() {
  const [ign, setIgn] = useState("");
  const [fullName, setFullName] = useState("");
  const [game, setGame] = useState("PUBG Mobile");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("");
  const [achievementInput, setAchievementInput] = useState("");
  const [achievements, setAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // New features state management mechanics
  const [players, setPlayers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [tableLoading, setTableLoading] = useState(false);

  // Fetch registered records from active database table
  const fetchPlayers = async () => {
    setTableLoading(true);
    const { data, error } = await supabase
      .from("esports_players")
      .select("*")
      .order("ign", { ascending: true });

    if (!error && data) {
      setPlayers(data);
    } else if (error) {
      console.error("Fetch Failure:", error.message);
    }
    setTableLoading(false);
  };

  // Run synchronization sequence on mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  const addAchievement = () => {
    if (!achievementInput.trim()) return;
    setAchievements([...achievements, achievementInput.trim()]);
    setAchievementInput("");
  };

  // Remove individual indexed tag items locally
  const removeAchievementTag = (indexToRemove: number) => {
    setAchievements(achievements.filter((_, idx) => idx !== indexToRemove));
  };

  // Reset core field entry layouts clean
  const resetFormFields = () => {
    setIgn("");
    setFullName("");
    setGame("PUBG Mobile");
    setTeam("");
    setRole("");
    setAchievements([]);
    setEditingPlayerId(null);
  };

  // Inject record payload directly into mutating state positions
  const startEditSequence = (player: any) => {
    setEditingPlayerId(player.id);
    setIgn(player.ign);
    setFullName(player.full_name || "");
    setGame(player.primary_game);
    setTeam(player.current_team === "Free Agent" ? "" : player.current_team);
    setRole(player.role || "");
    setAchievements(player.achievements || []);
    setSuccess(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Execute clean target removal query sequences
  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Are you sure you want to purge this player file permanently?")) return;
    
    const { error } = await supabase
      .from("esports_players")
      .delete()
      .eq("id", id);

    if (!error) {
      if (editingPlayerId === id) resetFormFields();
      fetchPlayers();
    } else {
      console.error("Purge Error Flagged:", error.message);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const payload = {
      ign: ign.toUpperCase(),
      full_name: fullName,
      primary_game: game,
      current_team: team || "Free Agent",
      role: role,
      achievements: achievements,
    };

    let error;

    if (editingPlayerId) {
      // Execute explicit item update conditional branch path
      const { error: updateError } = await supabase
        .from("esports_players")
        .update(payload)
        .eq("id", editingPlayerId);
      error = updateError;
    } else {
      // Regular fallback insertion pipeline branch
      const { error: insertError } = await supabase
        .from("esports_players")
        .insert([payload]);
      error = insertError;
    }

    setLoading(false);
    if (!error) {
      setSuccess(true);
      resetFormFields();
      fetchPlayers();
    } else {
      console.error("Database Write Crash:", error.message);
    }
  };

  // Filter existing cache records by input queries
  const filteredPlayers = players.filter((p) =>
    p.ign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.full_name && p.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.current_team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Creation and Modification Control Interface Block */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl rounded-xl">
        <div className="h-[3px] bg-primary w-full" />
        <CardHeader>
          <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-between text-void-400">
            <span className="flex items-center gap-2.5">
              <UserPlus className="h-4 w-4 text-primary" />
              {editingPlayerId ? "Active Mutation File Stream" : "Inbound Roster Core Deployment"}
            </span>
            {editingPlayerId && (
              <button 
                type="button" 
                onClick={resetFormFields} 
                className="text-destructive hover:underline lowercase font-normal text-[11px]"
              >
                [ Abort Mutation Edit ]
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePlayer} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase font-bold text-void-400">Player IGN *</label>
                <input required value={ign} onChange={(e) => setIgn(e.target.value)} placeholder="e.g. FALAK" className="w-full bg-void-950/50 border border-border/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary font-mono uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase font-bold text-void-400">Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Muhammad Ahmad" className="w-full bg-void-950/50 border border-border/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase font-bold text-void-400">Target Discipline</label>
                <select value={game} onChange={(e) => setGame(e.target.value)} className="w-full bg-void-950 border border-border/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
                  <option value="PUBG Mobile">PUBG Mobile</option>
                  <option value="CS2 / CS:GO">CS2 / CS:GO</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Tekken">Tekken</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase font-bold text-void-400">Squad / Org Affiliate</label>
                <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Agonxi8" className="w-full bg-void-950/50 border border-border/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase font-bold text-void-400">Tactical Role</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. IGL / Entry" className="w-full bg-void-950/50 border border-border/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[9px] uppercase font-bold text-void-400">Tracked Placements & Achievements</label>
              <div className="flex gap-2">
                <input value={achievementInput} onChange={(e) => setAchievementInput(e.target.value)} placeholder="e.g. #1 PMGC South Asia Qualifier" className="flex-1 bg-void-950/50 border border-border/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                <button type="button" onClick={addAchievement} className="px-4 py-2 font-mono text-xs bg-void-800 hover:bg-void-700 rounded border border-border/40 text-white transition-colors">Add</button>
              </div>
              {achievements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {achievements.map((ach, idx) => (
                    <span key={idx} className="font-mono text-[9px] font-bold tracking-wide bg-primary/10 border border-primary/30 text-primary px-2 py-0.5 rounded flex items-center gap-1.5">
                      {ach}
                      <button type="button" onClick={() => removeAchievementTag(idx)} className="hover:text-destructive text-[8px] font-sans">✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full font-mono font-bold text-xs uppercase tracking-widest py-3 rounded bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg transition-all flex items-center justify-center gap-2">
              {loading ? "Writing Registry..." : editingPlayerId ? "Commit Updated Modifications" : "Commit Player Data File"}
            </button>

            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-sm font-mono text-[10px] uppercase font-bold">
                <CheckCircle size={14} /> Player entry completely broadcast to public core.
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Real-time Directory Storage Database Visualizer Layout */}
      <Card className="border border-border/80 bg-card/20 backdrop-blur-md shadow-xl rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-void-400" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">Indexed Assets Core Registry</h2>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input 
                type="text" 
                placeholder="Search index metadata..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-void-950/80 border border-border/40 rounded px-3 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-primary font-mono"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-void-500" />
            </div>
            <button 
              type="button" 
              onClick={fetchPlayers} 
              disabled={tableLoading}
              className="p-1.5 bg-void-950 border border-border/40 rounded text-void-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={tableLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {tableLoading && players.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-void-500 uppercase tracking-widest animate-pulse">
              Parsing cluster system tables...
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-void-500 uppercase tracking-widest">
              No matching profiles identified in indexed cluster logs.
            </div>
          ) : (
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-void-950/40 border-b border-border/20 text-void-400 font-mono text-[9px] uppercase tracking-wider">
                  <th className="p-4 font-bold">In-Game Handle / Name</th>
                  <th className="p-4 font-bold">Discipline</th>
                  <th className="p-4 font-bold">Affiliate Team</th>
                  <th className="p-4 font-bold">Tactical Role</th>
                  <th className="p-4 font-bold text-right">Operational Sequences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-void-950/30 transition-colors group">
                    <td className="p-4">
                      <div className="font-mono font-bold text-white uppercase group-hover:text-primary transition-colors">{player.ign}</div>
                      <div className="text-[10px] text-void-400 mt-0.5">{player.full_name || "Anonymous User"}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-void-950 border border-border/40 px-2 py-0.5 rounded text-[10px] text-void-300 font-mono">
                        {player.primary_game}
                      </span>
                    </td>
                    <td className="p-4 text-void-300 font-medium">{player.current_team}</td>
                    <td className="p-4 text-void-400 font-mono">{player.role || "Unassigned"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          type="button" 
                          onClick={() => startEditSequence(player)}
                          className="p-1.5 rounded border border-border/40 bg-void-950 text-void-400 hover:text-white hover:border-primary transition-colors"
                          title="Modify Record"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDeletePlayer(player.id)}
                          className="p-1.5 rounded border border-border/40 bg-void-950 text-void-400 hover:text-destructive hover:border-destructive/40 transition-colors"
                          title="Purge Profile"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}