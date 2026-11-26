"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { listMockAttempts } from "@/lib/mock-attempts";

/** Every mock sitting on the signed-in account, for the plan and milestones. */
export function useMockHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["mock", "attempts"],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: listMockAttempts,
  });
}
