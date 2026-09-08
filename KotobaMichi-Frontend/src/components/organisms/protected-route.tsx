"use client";
import { useEffect, type PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: PropsWithChildren<{ adminOnly?: boolean }>) {
  const { user } = useAuth();
  const hydrated = useAuthStore((s) => s.hydrated);
  const authChecked = useAuthStore((s) => s.authChecked);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || !authChecked) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (adminOnly && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [hydrated, authChecked, user, adminOnly, router]);

  if (
    !hydrated ||
    !authChecked ||
    !user ||
    (adminOnly && user.role !== "ADMIN")
  ) {
    return null;
  }
  return <>{children}</>;
}
