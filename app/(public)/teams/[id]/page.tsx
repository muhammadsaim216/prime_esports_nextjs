import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import TeamDetailClient from "./TeamDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: team } = await supabase.from("teams").select("name, description, game").or(`id.eq.${id},name.eq.${id}`).single();
  if (!team) return { title: "Team Not Found" };
  return {
    title: team.name,
    description: team.description || `Meet the ${team.name} roster competing in ${team.game} for Prime Esports.`,
    openGraph: { title: `${team.name} | Prime Esports`, description: team.description || `${team.name} — ${team.game} division.` },
  };
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <TeamDetailClient params={params} />;
}