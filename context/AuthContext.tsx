"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  username: string | null;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string, discord?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUsername = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", userId)
      .maybeSingle();
    if (data?.username) setUsername(data.username);
  };

  const checkAdminRole = async (userId: string, email?: string) => {
    if (email === "howsaim216@gmail.com") {
      setIsAdmin(true);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    setIsAdmin(data?.role === "admin");
  };

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (data?.role) setUserRole(data.role);
  };

  const initializeUser = async (currentSession: Session | null) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    if (currentSession?.user) {
      await Promise.all([
        checkAdminRole(currentSession.user.id, currentSession.user.email),
        fetchUsername(currentSession.user.id),
        fetchUserRole(currentSession.user.id),
      ]);
      // Ban check
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_banned")
        .eq("id", currentSession.user.id)
        .maybeSingle();
      if (profile?.is_banned) {
        await supabase.auth.signOut();
        window.location.href = "/login?error=banned";
        return;
      }
    } else {
      setIsAdmin(false);
      setUsername(null);
      setUserRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        initializeUser(session);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      initializeUser(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    return { error: null };
  };

  const signUp = async (email: string, password: string, username: string, discord?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { username, discord_id: discord },
      },
    });
    if (error) return { error };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUsername(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, username, userRole, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
