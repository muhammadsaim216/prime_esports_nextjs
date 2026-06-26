"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (requireAdmin && !isAdmin) router.replace("/");
    }
  }, [user, isAdmin, loading, requireAdmin, router]);

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#e91e63]" />
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && !isAdmin) return null;

  return <>{children}</>;
}
