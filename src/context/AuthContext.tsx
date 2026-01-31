import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  getToken,
  setToken as saveToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from "@/api/client";
import { api } from "@/api/client";
import type { AuthUser } from "@/api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ role: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getToken(),
    isLoading: true,
  });

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState((s) => ({ ...s, user: null, token: null, isLoading: false }));
      return;
    }
    try {
      const user = await api.get<AuthUser>("/me");
      setStoredUser(user);
      setState((s) => ({ ...s, user, token, isLoading: false }));
    } catch {
      clearToken();
      clearStoredUser();
      setState((s) => ({ ...s, user: null, token: null, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{ token: string; user: { id: number; name: string; email: string; role: string } }>(
        "/login",
        { email, password }
      );
      saveToken(res.token);
      setStoredUser(res.user);
      setState({ user: res.user, token: res.token, isLoading: false });
      return { role: res.user.role };
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    clearStoredUser();
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
