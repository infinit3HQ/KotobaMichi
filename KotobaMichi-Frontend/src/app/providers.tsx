"use client";

import { ReactNode, useState } from "react";
import { ThemeProvider } from "@/components/atoms/theme-provider";
import { GlobalThemeToggle } from "@/components/atoms/global-theme-toggle";
import { Layout } from "@/components/organisms/layout";
import { Toaster } from "@/components/atoms/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthHandlers } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

export default function Providers({ children }: { children: ReactNode }) {
  // register auth handlers once on mount
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  setAuthHandlers({
    onRefreshSuccess: (user) => setUser(user),
    onUnauthenticated: () => logout(),
  });
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <Layout>{children}</Layout>
        <Toaster />
        <GlobalThemeToggle position="bottom-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
