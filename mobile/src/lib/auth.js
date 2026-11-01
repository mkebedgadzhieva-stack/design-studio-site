import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { demoUser, getSessionUser, IS_DEMO, signIn as backendSignIn, signOut as backendSignOut, supabase } from "./backend";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    getSessionUser()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setReady(true));

    if (IS_DEMO) return () => { active = false; };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => setUser(await backendSignIn(email, password)), []);
  const enterDemo = useCallback(() => setUser(demoUser()), []);
  const signOut = useCallback(async () => {
    await backendSignOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, enterDemo, signOut }), [user, ready, signIn, enterDemo, signOut]);
  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth вне AuthProvider");
  return ctx;
}
