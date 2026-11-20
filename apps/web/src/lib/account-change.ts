import type { AuthState } from "@/stores/auth";

type AccountSnapshot = Pick<AuthState, "user" | "hydrated">;

/**
 * True when a different account (or no account) is now signed in. Restoring the saved
 * session on page load is not a change: it happens before the store is marked hydrated.
 */
export function accountChanged(previous: AccountSnapshot, next: AccountSnapshot): boolean {
  if (!previous.hydrated) return false;
  return (previous.user?.id ?? null) !== (next.user?.id ?? null);
}
