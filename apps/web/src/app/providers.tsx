"use client";

import { ReactNode, useState } from "react";
import { ThemeProvider } from "@/components/atoms/theme-provider";
import { Layout } from "@/components/organisms/layout";
import { LocaleProvider } from "@/components/organisms/locale-provider";
import { AccountCacheReset } from "@/components/organisms/account-cache-reset";
import { Toaster } from "@/components/atoms/sonner";
import { ServiceWorkerRegistration } from "@/components/atoms/service-worker-registration";
import { AnalyticsProvider } from "@/components/atoms/analytics-provider";
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
  // One quick retry: a dead API should show its error state in about a second, not after ~7s of skeletons.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, retryDelay: 800 } } })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AccountCacheReset />
        <LocaleProvider initialLocale={initialLocale}>
          <Layout>{children}</Layout>
          <Toaster />
          <ServiceWorkerRegistration />
          <AnalyticsProvider />
        </LocaleProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
