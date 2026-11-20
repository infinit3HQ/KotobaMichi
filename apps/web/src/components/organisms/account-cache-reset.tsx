"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { accountChanged } from "@/lib/account-change";
import { useAuthStore } from "@/stores/auth";

/**
 * Drops cached server data whenever the signed-in account changes, so one student's
 * profile, quiz attempts or mock history can never flash up for the next account.
 */
export function AccountCacheReset() {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      useAuthStore.subscribe((next, previous) => {
        if (accountChanged(previous, next)) void queryClient.resetQueries();
      }),
    [queryClient]
  );

  return null;
}
