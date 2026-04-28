"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api-client";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth-storage";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (input: LoginInput) => Promise<void>;
  /** Sign up (avoids clashing the name "register" with RHF) */
  signUp: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const applyAuth = useCallback((payload: AuthResponse) => {
    setUser(payload.user);
    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await api.post("/auth/logout", { refreshToken: refresh });
      } catch {
        /* still clear client session */
      }
    }
    setUser(null);
    clearTokens();
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await api.post<AuthResponse>("/auth/login", input);
      applyAuth(response.data);
    },
    [applyAuth]
  );

  const signUp = useCallback(
    async (input: RegisterInput) => {
      const response = await api.post<AuthResponse>("/auth/register", input);
      applyAuth(response.data);
    },
    [applyAuth]
  );

  /** End bootstrapping immediately when there is no session to validate (avoids stuck UI). */
  useLayoutEffect(() => {
    if (!getAccessToken()) {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const response = await api.get<User>("/auth/me", { timeout: 20_000 });
        if (!cancelled) {
          setUser(response.data);
        }
      } catch {
        if (!cancelled) {
          await logout();
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      signUp,
      logout,
    }),
    [isBootstrapping, login, logout, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
