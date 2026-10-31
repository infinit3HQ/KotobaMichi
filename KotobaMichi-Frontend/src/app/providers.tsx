"use client";

import { ReactNode, useState } from "react";
import { ThemeProvider } from "@/components/atoms/theme-provider";
import { GlobalThemeToggle } from "@/components/atoms/global-theme-toggle";
import { Layout } from "@/components/organisms/layout";
import { LocaleProvider } from "@/components/organisms/locale-provider";
import { Toaster } from "@/components/atoms/sonner";
import { ServiceWorkerRegistration } from "@/components/atoms/service-worker-registration";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthHandlers } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import type { Locale } from "@/lib/i18n/dictionary";

export default function Providers({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
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
        <LocaleProvider initialLocale={initialLocale}>
          <Layout>{children}</Layout>
          <Toaster />
          <ServiceWorkerRegistration />
          <GlobalThemeToggle position="bottom-right" />
        </LocaleProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
