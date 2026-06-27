import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getUser, onAuthChange } from "./auth";

interface AuthCtx {
  user: any;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    getUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    // Listen for changes
    const { data } = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);