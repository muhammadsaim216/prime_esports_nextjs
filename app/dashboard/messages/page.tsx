"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MessageCircle, Send, Plus, Zap } from "lucide-react";

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = { 
    open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", 
    closed: "bg-void-900 text-void-400 border-border/60" 
  };
  return (
    <Badge className={`text-[9px] uppercase font-mono font-bold px-2.5 py-1 rounded-sm border shadow-xs ${map[status] || map.closed}`}>
      {status}
    </Badge>
  );
};

export default function DashboardMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const fetchConversations = async () => {
    if (!user) return;
    const { data } = await supabase.from("conversations").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
    setConversations(data || []);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at");
    setMessages(data || []);
  };

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;
    fetchMessages(selectedConversation.id);
    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConversation.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as any]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConversation]);

  const onCreateConversation = async () => {
    if (!user || newSubject.length < 3 || newMessage.length < 10) { 
      toast.error("Subject must be 3+ chars, message 10+ chars."); 
      return; 
    }
    const { data: conv, error } = await supabase.from("conversations").insert({ user_id: user.id, subject: newSubject, status: "open" }).select().single();
    if (error || !conv) { toast.error("Failed to create conversation"); return; }
    await supabase.from("messages").insert({ conversation_id: conv.id, sender_id: user.id, sender_type: "user", content: newMessage });
    toast.success("Conversation started!");
    setDialogOpen(false); setNewSubject(""); setNewMessage("");
    fetchConversations();
  };

  const onSendReply = async () => {
    if (!user || !selectedConversation || !replyContent) return;
    await supabase.from("messages").insert({ conversation_id: selectedConversation.id, sender_id: user.id, sender_type: "user", content: replyContent });
    setReplyContent("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-void-100 text-primary-foreground font-display font-bold uppercase text-xs tracking-wide rounded-lg h-10 px-4 transition-colors shadow-xs">
              <Plus className="mr-2 h-4 w-4 shrink-0" /> New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-void-950 border border-border/80 text-white rounded-xl max-w-md w-full p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display font-black uppercase text-lg tracking-wide text-white">
                Start New Conversation
              </DialogTitle>
              <DialogDescription className="font-sans text-xs text-void-400">
                Contact the Prime Esports support team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input 
                value={newSubject} 
                onChange={(e) => setNewSubject(e.target.value)} 
                placeholder="Subject" 
                className="bg-void-900 border-border/60 rounded-lg h-10 text-sm font-medium" 
              />
              <Textarea 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Your message..." 
                className="bg-void-900 border-border/60 rounded-lg min-h-[120px] text-sm font-medium resize-none" 
              />
              <Button 
                onClick={onCreateConversation} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 font-display font-bold uppercase text-xs tracking-wide transition-colors shadow-xs"
              >
                Send
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Encryption History Side Panel */}
        <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden lg:col-span-1">
          <CardHeader className="p-4 md:p-5 border-b border-border/40 bg-void-950/40">
            <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-wider text-void-400 text-center">
              Encryption History
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-[450px]">
            {conversations.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Zap className="h-5 w-5 text-void-600 mb-3" />
                <p className="font-mono text-[10px] font-bold text-void-500 uppercase tracking-wider">
                  Logs Clear
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {conversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <div 
                      key={conv.id} 
                      className={`p-4 md:p-5 cursor-pointer transition-all relative ${
                        isSelected 
                          ? "bg-primary/5 border-l-2 border-l-primary" 
                          : "hover:bg-void-900/40"
                      }`} 
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h4 className={`font-display font-bold text-xs uppercase tracking-wide truncate ${
                          isSelected ? "text-primary" : "text-white"
                        }`}>
                          {conv.subject}
                        </h4>
                        {getStatusBadge(conv.status)}
                      </div>
                      <p className="font-mono text-[9px] text-void-500 uppercase tracking-wide">
                        {new Date(conv.updated_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Messaging Interface Core */}
        <div className="lg:col-span-2">
          <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden h-[518px] flex flex-col">
            <div className="h-[3px] bg-primary w-full" />
            
            <CardHeader className="p-4 md:p-6 border-b border-border/40 bg-void-950/20">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="font-display font-black uppercase text-base md:text-lg text-white tracking-wide truncate">
                  {selectedConversation ? selectedConversation.subject : "Support Link"}
                </CardTitle>
                {selectedConversation && getStatusBadge(selectedConversation.status)}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-void-950/10">
              {!selectedConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 bg-void-900/80 border border-border/80 rounded-lg flex items-center justify-center mb-4">
                    <MessageCircle className="w-5 h-5 text-void-500" />
                  </div>
                  <h3 className="font-display font-bold uppercase text-sm text-white tracking-wide">
                    No Comms Selected
                  </h3>
                  <p className="font-mono text-[10px] text-void-500 uppercase tracking-wider max-w-xs mt-2">
                    Select a transmission or start a new one.
                  </p>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-4 md:p-6">
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isUser = msg.sender_type === "user";
                        return (
                          <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                              <div 
                                className={`rounded-lg px-4 py-2.5 shadow-md ${
                                  isUser 
                                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                                    : "bg-void-900 border border-border/40 text-void-100 rounded-tl-none"
                                }`}
                              >
                                <p className="text-xs md:text-sm font-sans font-medium leading-relaxed whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                              </div>
                              <span className="font-mono text-[8px] text-void-500 uppercase tracking-wide mt-1 px-1">
                                {isUser ? "Origin: You" : "Origin: Admin"} // {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t border-border/40 bg-void-950/60">
                    {selectedConversation.status === "open" ? (
                      <div className="flex gap-3 items-center">
                        <Input 
                          value={replyContent} 
                          onChange={(e) => setReplyContent(e.target.value)} 
                          className="bg-void-900 border-border/60 rounded-lg h-10 text-white font-sans text-xs px-4 flex-1" 
                          placeholder="Transmit your response..." 
                        />
                        <Button 
                          onClick={onSendReply} 
                          size="icon" 
                          className="bg-white hover:bg-primary text-black hover:text-primary-foreground rounded-lg h-10 w-10 shrink-0 transition-colors shadow-xs"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-void-900/40 p-3 text-center border border-dashed border-border/40">
                        <p className="font-mono text-[9px] font-bold uppercase text-void-500 tracking-wider">
                          End of Transmission
                        </p>
                      </div>
                    )}
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