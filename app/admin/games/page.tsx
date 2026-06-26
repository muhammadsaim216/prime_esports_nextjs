"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Gamepad2, Layers, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminGamesPage() {
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [newGame, setNewGame] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    setLoading(true);
    const { data } = await supabase.from("games").select("*").order("name");
    if (data) setGames(data);
    setLoading(false);
  };

  useEffect(() => { fetchGames(); }, []);

  const addGame = async () => {
    if (!newGame) return;
    const { error } = await supabase.from("games").insert([{ name: newGame }]);
    if (error) toast.error("Game already exists or error occurred");
    else { setNewGame(""); fetchGames(); toast.success("Game added to library!"); }
  };

  const deleteGame = async (id: string) => {
    const { error } = await supabase.from("games").delete().eq("id", id);
    if (error) toast.error("Could not delete game"); else fetchGames();
  };

  return (
    <div className="max-w-2xl space-y-8 text-foreground">
      {/* Search and Deployment Console */}
      <div className="bg-card/20 backdrop-blur-sm p-6 rounded-xl border border-border shadow-md">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-void-500" />
            <Input 
              placeholder="ENTER GAME NAME (E.G. VALORANT)" 
              value={newGame} 
              onChange={(e) => setNewGame(e.target.value)} 
              className="h-11 pl-11 rounded-lg border-border bg-void-900 font-display text-sm font-semibold uppercase tracking-wide placeholder:font-mono placeholder:text-[10px] placeholder:tracking-wider placeholder:text-void-600 text-white focus-visible:ring-primary/40 focus-visible:border-primary placeholder:uppercase" 
            />
          </div>
          <Button 
            onClick={addGame} 
            className="h-11 px-6 rounded-lg bg-neon text-primary-foreground font-display font-bold uppercase tracking-wider text-xs neon-glow transition-all duration-300 hover:shadow-neon-strong hover:opacity-90 active:scale-[0.98] border-none shrink-0"
          >
            <Plus className="h-4 w-4 mr-2 stroke-[2.5px]" /> Add Game
          </Button>
        </div>
      </div>

      {/* Library Registry Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-void-400 uppercase tracking-wider">
            <Layers className="w-3 h-3 text-primary" /> Registered Titles
          </div>
          <Badge variant="outline" className="border-border bg-void-900 text-void-300 font-mono text-[10px] tracking-wide px-3 py-0.5 rounded shadow-none">
            {games.length} TOTAL
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-3">
            {games.map((game) => (
              <Card key={game.id} className="rounded-xl border border-border bg-card/20 backdrop-blur-sm text-card-foreground shadow-sm transition-all duration-200 hover:border-void-700 group overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-md bg-void-900 text-void-500 border border-border/80 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300 shadow-2xs">
                      <Gamepad2 className="h-4 w-4" />
                    </div>
                    <span className="font-display font-bold uppercase tracking-wide text-sm text-white">
                      {game.name}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteGame(game.id)} 
                    className="h-9 w-9 rounded-md border border-transparent bg-transparent text-void-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
                    title="Purge Title From Library"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            {games.length === 0 && !loading && (
              <div className="text-center py-16 bg-void-900/20 rounded-xl border border-dashed border-void-700 backdrop-blur-xs">
                <Gamepad2 className="h-10 w-10 text-void-600 mx-auto mb-3 animate-pulse" />
                <p className="text-void-400 font-mono uppercase tracking-widest text-[10px]">
                  Library is Empty
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}