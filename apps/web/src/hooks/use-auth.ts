import { useAuthStore, type AuthUser } from "@/stores/auth";

export type User = AuthUser;

export function useAuth() {
  const { user, setUser, logout, setAuthChecked } = useAuthStore();
  return { user, setUser, logout, setAuthChecked };
}
