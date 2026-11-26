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
        // localStorage rehydrates synchronously while `create` is still running,
        // before `useAuthStore` is assigned. Defer, or the setState throws and
        // `hydrated` stays false, leaving protected pages blank after a reload.
        queueMicrotask(() => useAuthStore.setState({ hydrated: true }));
      },
  })
);
