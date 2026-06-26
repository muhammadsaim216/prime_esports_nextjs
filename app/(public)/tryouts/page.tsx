"use client";
import { useState, useEffect } from "react";
import { Calendar, ChevronRight, Check, Terminal, Shield, Trophy, Target, Cpu, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const availabilityOptions = ["Weekday Mornings","Weekday Afternoons","Weekday Evenings","Weekend Mornings","Weekend Afternoons","Weekend Evenings"];

const defaultForm = { fullName:"",email:"",discord:"",age:"",currentRank:"",hoursPerWeek:"",whyJoin:"",availability:[] as string[],agreeToTerms:false };

export default function TryoutsPage() {
  const [tryouts, setTryouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    supabase.from("Tryouts").select("*").in("status",["open","closing_soon"]).order("deadline").then(({data})=>{
      setTryouts(data||[]); setLoading(false);
    });
  },[]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Protocol initiated — Application transmitted to HQ. Stand by for review.");
    setFormData(defaultForm);
  };

  const toggleAvail = (opt: string) => setFormData(p=>({...p,availability:p.availability.includes(opt)?p.availability.filter(a=>a!==opt):[...p.availability,opt]}));
  const setField = (k: string, v: any) => setFormData(p=>({...p,[k]:v}));

  return (
    <>
      <section className="relative overflow-hidden bg-void-950 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="container relative z-10 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border border-primary/30 px-4 py-1.5 font-medium tracking-wide text-[10px]">Recruitment Phase 01</Badge>
          <h1 className="mb-6 text-5xl font-display font-semibold tracking-tight text-foreground md:text-7xl">Open <span className="text-neon">Tryouts</span></h1>
          <p className="mx-auto max-w-xl text-void-300 font-medium leading-relaxed">The arena is waiting. Submit your profile to the Prime Protocol.</p>
        </div>
      </section>

      <section className="border-y border-void-700/40 bg-void-950/50 py-12">
        <div className="container grid grid-cols-1 gap-8 md:grid-cols-4">
          {[{icon:Shield,label:"Age",value:"16+ Required"},{icon:Target,label:"Comms",value:"Fluent English"},{icon:Cpu,label:"Ping",value:"Stable Connection"},{icon:Trophy,label:"Mindset",value:"Pro Discipline"}].map((item,i)=>(
            <div key={i} className="flex flex-col items-center text-center space-y-2 group">
              <div className="mb-2 rounded-xl bg-void-900 p-3 text-primary border border-void-700/40 group-hover:border-primary/50 transition-colors"><item.icon size={20}/></div>
              <span className="text-[10px] font-medium text-void-400 tracking-wide">{item.label}</span>
              <span className="font-semibold text-foreground tracking-tight">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container">
          <div className="mb-16 flex flex-col items-center space-y-4">
            <h2 className="text-4xl font-display font-semibold tracking-tight text-foreground">Available <span className="text-neon">Positions</span></h2>
            <div className="h-1 w-20 bg-primary" />
          </div>
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-[300px] w-full rounded-2xl bg-void-900/50"/>)}</div>
          ) : tryouts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {tryouts.map((tryout)=>(
                <Card key={tryout.id} className="group relative overflow-hidden border border-void-700/40 bg-card transition-all duration-500 hover:border-primary/30 rounded-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-void-950 border border-void-700/40 group-hover:border-primary/50 transition-colors"><Terminal className="text-primary" size={24}/></div>
                        <div><CardTitle className="text-xl font-display font-semibold tracking-tight text-foreground">{tryout.position}</CardTitle><p className="text-sm font-medium text-void-400 tracking-wide">{tryout.team_name}</p></div>
                      </div>
                      <Badge className={`px-3 py-1 font-medium text-[10px] rounded-lg ${tryout.status==="closing_soon"?"bg-destructive/20 text-destructive border-destructive/30 animate-pulse":"bg-primary/10 text-primary border-primary/30"}`}>{tryout.status==="closing_soon"?"Critical: Closing":"Active"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-void-300 font-medium leading-relaxed border-l-2 border-void-700/40 pl-4">"{tryout.description}"</p>
                    <div className="grid grid-cols-2 gap-4 rounded-2xl bg-void-950/40 p-5 border border-void-700/40">
                      <div><span className="text-[10px] font-medium text-void-500 tracking-wide block mb-1">Game</span><Badge variant="outline" className="border-primary/20 text-primary font-semibold">{tryout.game}</Badge></div>
                      <div className="text-right"><span className="text-[10px] font-medium text-void-500 tracking-wide block mb-1">Deadline</span><div className="flex items-center justify-end gap-2 text-foreground font-medium"><Calendar size={14} className="text-primary"/>{new Date(tryout.deadline).toLocaleDateString()}</div></div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full h-14 rounded-xl bg-void-900 text-foreground hover:bg-primary hover:text-void-900 transition-all font-semibold text-sm">Apply to Protocol <ChevronRight className="ml-2 h-5 w-5"/></Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-void-900 border border-void-700/40 text-foreground rounded-2xl">
                        <DialogHeader className="mb-6">
                          <DialogTitle className="text-3xl font-display font-semibold tracking-tight text-primary">Recruitment // {tryout.position}</DialogTitle>
                          <p className="text-void-300 text-xs font-medium tracking-wide">Team: {tryout.team_name}</p>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-8 py-4">
                          <div className="grid gap-6 sm:grid-cols-2">
                            {[["fullName","Full Name","text"],["email","Email","email"],["discord","Discord ID","text"],["age","Age","number"]].map(([k,label,type])=>(
                              <div key={k} className="space-y-2">
                                <Label className="text-void-300 font-medium text-[11px] tracking-wide">{label}</Label>
                                <Input className="bg-void-950 border-void-700/40 focus:border-primary h-12 rounded-xl" type={type} required value={(formData as any)[k]} onChange={e=>setField(k,e.target.value)}/>
                              </div>
                            ))}
                          </div>
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2"><Label className="text-void-300 font-medium text-[11px] tracking-wide">Current Rank</Label><Input className="bg-void-950 border-void-700/40 focus:border-primary h-12 rounded-xl" required value={formData.currentRank} onChange={e=>setField("currentRank",e.target.value)}/></div>
                            <div className="space-y-2">
                              <Label className="text-void-300 font-medium text-[11px] tracking-wide">Weekly Hours</Label>
                              <Select value={formData.hoursPerWeek} onValueChange={v=>setField("hoursPerWeek",v)}>
                                <SelectTrigger className="bg-void-950 border-void-700/40 h-12 rounded-xl"><SelectValue placeholder="Select hours"/></SelectTrigger>
                                <SelectContent className="bg-void-900 border-void-700/40 text-foreground">
                                  {["10-20","20-30","30-40","40+"].map(h=><SelectItem key={h} value={h}>{h} hours</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <Label className="text-void-300 font-medium text-[11px] tracking-wide">Availability Slots</Label>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {availabilityOptions.map(opt=>(
                                <button type="button" key={opt} onClick={()=>toggleAvail(opt)} className={`rounded-xl border p-3 text-center text-[11px] font-medium transition-all ${formData.availability.includes(opt)?"border-primary bg-primary/10 text-foreground":"border-void-700/40 bg-void-950 text-void-400 hover:border-void-600"}`}>{opt}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-void-300 font-medium text-[11px] tracking-wide">Motivation Statement</Label>
                            <Textarea className="bg-void-950 border-void-700/40 focus:border-primary min-h-[120px] rounded-2xl p-4" required placeholder="Why should you represent Prime DNA?" value={formData.whyJoin} onChange={e=>setField("whyJoin",e.target.value)}/>
                          </div>
                          <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <Checkbox id="terms" className="mt-1 border-primary data-[state=checked]:bg-primary" checked={formData.agreeToTerms} onCheckedChange={v=>setField("agreeToTerms",v as boolean)}/>
                            <Label htmlFor="terms" className="text-[11px] font-medium text-void-300 leading-relaxed">I confirm all data is accurate and I am entering the Prime Esports recruitment protocol.</Label>
                          </div>
                          <Button type="submit" disabled={!formData.agreeToTerms} className="w-full h-16 rounded-2xl bg-neon-gradient text-void-900 hover:opacity-90 font-semibold text-sm transition-all hover:shadow-neon">Transmit Data</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 rounded-2xl border border-void-700/40 bg-void-900/20">
              <p className="text-void-300 font-medium text-sm">The Arena is currently full. Check back later.</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-void-700/40 bg-void-950 py-24">
        <div className="container">
          <h2 className="text-4xl font-display font-semibold tracking-tight text-foreground text-center mb-16">Recruitment <span className="text-neon">Intel</span></h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {[{q:"What is the tryout process?",a:"After data transmission, coaching staff reviews candidates within 14 days. Phase 2 involves live trials."},{q:"Is previous team experience mandatory?",a:"No. Exceptional individual performance in high-rank lobbies can qualify for Academy programs."},{q:"Are positions paid?",a:"Accepted players sign professional contracts including competitive salaries, performance bonuses, and tournament splits."}].map((faq,i)=>(
              <Card key={i} className="border-void-700/40 bg-card rounded-2xl overflow-hidden group hover:border-primary/20 transition-all">
                <CardHeader className="py-6"><CardTitle className="text-sm font-display font-semibold tracking-wide text-foreground flex items-center gap-3"><Info size={16} className="text-primary"/>{faq.q}</CardTitle></CardHeader>
                <CardContent className="pb-6"><p className="text-void-300 text-sm font-medium leading-relaxed">{faq.a}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}