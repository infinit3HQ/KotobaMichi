// src/stores/auth.ts
import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Role = "USER" | "ADMIN";
export type AuthUser = { id: string; email: string; role: Role };

export type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  authChecked: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  setAuthChecked: () => void;
};

const creator: StateCreator<AuthState> = (set) => {
  return ({
  user: null,
  hydrated: false,
  authChecked: false,
    setUser: (user) => set({ user, hydrated: true }),
    logout: () => set({ user: null, authChecked: false, hydrated: true }),
    setAuthChecked: () => set({ authChecked: true }),
  });
};

type PersistedAuthState = Pick<AuthState, "user">;

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], PersistedAuthState>(creator, {
    name: "auth",
    storage: createJSONStorage<PersistedAuthState>(() =>
      typeof window !== "undefined"
        ? localStorage
        : (undefined as unknown as Storage)
    ),
      // allow automatic rehydration so persisted `user` is loaded
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => () => {
        // mark hydrated after rehydration and notify subscribers
        try {
          useAuthStore.setState({ hydrated: true });
        } catch {}
      },
  })
);
