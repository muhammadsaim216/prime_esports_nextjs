"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MessageCircle, Send, Trash2, Clock, CheckCircle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyContent, setReplyContent] = useState("");

  const fetchConversations = async () => {
    let query = supabase.from("conversations").select("*").order("updated_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data, error } = await query;
    if (error) { setLoading(false); return; }
    const withUsernames = await Promise.all((data || []).map(async (conv) => {
      const { data: profile } = await supabase.from("profiles").select("username").eq("user_id", conv.user_id).maybeSingle();
      return { ...conv, username: profile?.username || "User" };
    }));
    setConversations(withUsernames);
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at");
    setMessages(data || []);
    await supabase.from("messages").update({ is_read: true }).eq("conversation_id", conversationId).eq("sender_type", "user");
  };

  useEffect(() => { fetchConversations(); }, [statusFilter]);

  useEffect(() => {
    if (!selectedConversation) return;
    fetchMessages(selectedConversation.id);
    const channel = supabase.channel(`admin-messages:${selectedConversation.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConversation.id}` }, (payload) => {
      setMessages((prev) => [...prev, payload.new as any]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConversation]);

  const onSendReply = async () => {
    if (!user || !selectedConversation || !replyContent) return;
    const { error } = await supabase.from("messages").insert({ conversation_id: selectedConversation.id, sender_id: user.id, sender_type: "admin", content: replyContent });
    if (error) { toast.error(error.message); return; }
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", selectedConversation.id);
    setReplyContent("");
  };

  const updateConversationStatus = async (status: string) => {
    if (!selectedConversation) return;
    const { error } = await supabase.from("conversations").update({ status }).eq("id", selectedConversation.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Conversation marked as ${status}`);
    setSelectedConversation({ ...selectedConversation, status });
    fetchConversations();
  };

  const deleteConversation = async () => {
    if (!selectedConversation) return;
    const { error } = await supabase.from("conversations").delete().eq("id", selectedConversation.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Conversation deleted");
    setSelectedConversation(null); setMessages([]); fetchConversations();
  };

  const getStatusBadge = (status: string) => status === "open" ? (
    <Badge variant="outline" className="bg-primary/10 text-primary border border-primary/20 font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded shadow-none">
      <Clock className="w-3 h-3 mr-1" />Active
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-void-800 text-void-400 border border-border font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded shadow-none">
      <CheckCircle className="w-3 h-3 mr-1" />Resolved
    </Badge>
  );

  return (
    <div className="space-y-6 text-foreground">
      {/* Filtering Control Node Dashboard Header */}
      <div className="flex items-center justify-between bg-card/20 backdrop-blur-sm p-4 rounded-xl border border-border shadow-md">
        <div className="flex items-center gap-2 px-1 text-void-400 font-mono text-[10px] uppercase tracking-wider">
          <Filter className="w-3 h-3 text-primary" /> Filter Transmission Node
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-lg border-border bg-void-900 font-display font-bold uppercase text-[10px] tracking-wide h-9 text-void-200 focus:ring-primary/40 focus:border-primary transition-all">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-border bg-void-950 font-display font-semibold uppercase text-xs text-void-200">
            <SelectItem value="all" className="focus:bg-void-900 focus:text-white">All Transmissions</SelectItem>
            <SelectItem value="open" className="focus:bg-void-900 focus:text-white">Active Only</SelectItem>
            <SelectItem value="closed" className="focus:bg-void-900 focus:text-white">Resolved Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Hand: Conversations Queue Log */}
        <Card className="lg:col-span-4 border border-border shadow-md rounded-xl overflow-hidden bg-card/20 backdrop-blur-sm text-card-foreground">
          <CardHeader className="border-b border-border bg-void-900/40 py-4 px-5">
            <CardTitle className="text-xs font-display font-bold uppercase tracking-wider flex items-center justify-between text-white">
              Transmission Inbox
              <span className="bg-void-800 text-void-300 font-mono text-[10px] px-2 py-0.5 rounded border border-border">
                {conversations.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="p-12 text-center text-void-500 font-mono uppercase text-xs tracking-wider animate-pulse">
                  Scanning Network Packets...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <MessageCircle className="w-8 h-8 mx-auto text-void-700 animate-pulse" />
                  <p className="text-void-400 font-mono uppercase tracking-widest text-[10px]">
                    No Intelligence Found
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {conversations.map((conv) => (
                    <div 
                      key={conv.id} 
                      className={cn(
                        "p-5 cursor-pointer transition-all border-l-2 border-transparent relative group", 
                        selectedConversation?.id === conv.id 
                          ? "bg-void-900/60 border-l-primary" 
                          : "hover:bg-void-900/30"
                      )} 
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-display font-bold text-sm uppercase tracking-wide truncate max-w-[140px] text-white">
                          {conv.username}
                        </h4>
                        {getStatusBadge(conv.status)}
                      </div>
                      <p className="text-xs text-void-300 truncate font-medium">
                        {conv.subject}
                      </p>
                      <p className="text-[9px] font-mono text-void-500 uppercase mt-2 flex items-center gap-1">
                        {new Date(conv.updated_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Hand: Deep Active Terminal Monitor Console */}
        <div className="lg:col-span-8">
          <Card className="border border-border shadow-md rounded-xl overflow-hidden bg-card/20 backdrop-blur-sm text-card-foreground h-[660px] flex flex-col">
            <CardHeader className="border-b border-border bg-void-900/40 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="truncate flex-1">
                  <CardTitle className="font-display font-bold uppercase text-base tracking-wide truncate text-white">
                    {selectedConversation ? selectedConversation.subject : "SELECT STREAM TERMINAL"}
                  </CardTitle>
                  {selectedConversation && (
                    <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mt-1.5">
                      Client Node Signature: <span className="text-primary font-sans font-semibold tracking-normal">{selectedConversation.username}</span>
                    </p>
                  )}
                </div>
                
                {selectedConversation && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-lg border-border font-display font-bold uppercase text-[10px] bg-void-900 text-void-300 hover:text-white hover:bg-void-800 tracking-wide h-9 px-3.5 shadow-2xs" 
                      onClick={() => updateConversationStatus(selectedConversation.status === "open" ? "closed" : "open")}
                    >
                      {selectedConversation.status === "open" ? "Mark Resolved" : "Reopen Transmission"}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="rounded-lg h-9 w-9 border-border bg-void-900 text-void-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all shadow-2xs"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-xl border border-border bg-void-950/95 backdrop-blur-lg text-card-foreground max-w-md shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display font-bold uppercase tracking-wide text-white text-lg">
                            Wipe Stream Log Payload?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-void-400 text-sm font-normal">
                            This process will permanently wipe all conversational tracking history across the node. This process is irreversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4 gap-2">
                          <AlertDialogCancel className="rounded-lg border border-border bg-void-900 text-void-300 hover:text-white hover:bg-void-800 text-xs font-display uppercase tracking-wide h-10 px-4">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={deleteConversation} 
                            className="rounded-lg bg-destructive text-white hover:bg-destructive/90 text-xs font-display uppercase tracking-wide h-10 px-5 border-none"
                          >
                            Purge Terminal Stream
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-void-950/20">
              {!selectedConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center text-void-500 font-mono uppercase text-xs tracking-wider gap-2">
                  <MessageCircle className="h-6 w-6 text-void-700 animate-bounce" />
                  No Active Connection Selected
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-6 md:p-8">
                    <div className="space-y-5">
                      {messages.map((msg) => {
                        const isAdmin = msg.sender_type === "admin";
                        return (
                          <div key={msg.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                            <div className={cn("max-w-[75%] flex flex-col", isAdmin ? "items-end" : "items-start")}>
                              <div className={cn(
                                "rounded-xl px-5 py-3.5 shadow-sm text-sm leading-relaxed", 
                                isAdmin 
                                  ? "bg-neon text-primary-foreground font-semibold" 
                                  : "bg-void-900 text-void-100 border border-border"
                              )}>
                                <p className="font-medium">{msg.content}</p>
                              </div>
                              <span className="text-[8px] font-mono uppercase text-void-500 mt-1.5 px-1 tracking-wider">
                                {isAdmin ? "Console Admin Account" : "Client User Terminal"} // {new Date(msg.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {/* Console Interface Command Dispatch Text Box */}
                  <div className="p-4 md:p-5 border-t border-border bg-void-900/40 backdrop-blur-xs">
                    <div className="flex gap-3">
                      <Input 
                        value={replyContent} 
                        onChange={(e) => setReplyContent(e.target.value)} 
                        placeholder="TYPE AN INTERFACE RESPONSE DISPATCH..." 
                        className="h-12 rounded-lg border-border bg-void-950 text-white placeholder:font-mono placeholder:text-[10px] placeholder:tracking-wider placeholder:text-void-600 focus-visible:ring-primary/40 focus-visible:border-primary placeholder:uppercase text-sm" 
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onSendReply();
                        }}
                      />
                      <Button 
                        onClick={onSendReply} 
                        size="icon" 
                        className="bg-neon text-primary-foreground hover:shadow-neon-strong transition-all duration-300 h-12 w-12 rounded-lg neon-glow shrink-0 border-none"
                        title="Dispatch Package"
                      >
                        <Send className="h-4 w-4 stroke-[2.5px]" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}