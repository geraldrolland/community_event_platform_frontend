"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, onSessionError } from "@/lib/api";
import type { LoginPayload, RegisterPayload, Role, UserBase } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: UserBase | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
  login: (role: Role, payload: LoginPayload) => Promise<UserBase>;
  register: (role: Role, payload: RegisterPayload) => Promise<UserBase>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserBase | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const me = await api.auth.me();
      setUser(me);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.auth
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // clear locally even if the server call fails
    }
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const handlingRef = useRef(false);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    onSessionError(() => {
      if (handlingRef.current) return;
      if (pathnameRef.current?.startsWith("/login")) return;
      handlingRef.current = true;
      logout().finally(() => {
        router.replace("/login?notice=expired");
        window.setTimeout(() => {
          handlingRef.current = false;
        }, 500);
      });
    });
  }, [logout, router]);

  const login = useCallback(
    async (role: Role, payload: LoginPayload) => {
      const me = await api.auth.login(role, payload);
      setUser(me);
      setStatus("authenticated");
      return me;
    },
    [],
  );

  const register = useCallback(
    async (role: Role, payload: RegisterPayload) => {
      const me = await api.auth.register(role, payload);
      setUser(me);
      return me;
    },
    [],
  );

  const value = useMemo(
    () => ({ user, status, refresh, login, register, logout }),
    [user, status, refresh, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
