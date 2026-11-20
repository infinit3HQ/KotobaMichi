"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { api, getApiError } from "@/lib/api";
import { useLocale } from "@/components/organisms/locale-provider";
import { AuthAlert, AuthCard, AuthCardSkeleton } from "@/components/organisms/auth/auth-card";

type Status = "idle" | "verifying" | "success" | "error";

function VerifyEmailClient() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    let mounted = true;
    if (!token) return;
    (async () => {
      setStatus("verifying");
      try {
        await api.post("/auth/verify-email", { token });
        if (mounted) setStatus("success");
      } catch (e) {
        const { message } = getApiError(e);
        if (!mounted) return;
        setErrorMsg(message ?? "");
        setStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token, attempt]);

  return (
    <AuthCard title={t.auth.verifyTitle} description={token ? t.auth.verifyDesc : undefined}>
      {!token ? (
        <>
          <AuthAlert tone="error">{t.auth.missingVerifyToken}</AuthAlert>
          <Button asChild className="w-full">
            <Link href="/auth/resend-verification">{t.auth.resendTitle}</Link>
          </Button>
        </>
      ) : status === "success" ? (
        <>
          <AuthAlert tone="success">{t.auth.verified}</AuthAlert>
          <Button asChild className="w-full">
            <Link href="/auth/login">{t.auth.goToLogin}</Link>
          </Button>
        </>
      ) : status === "error" ? (
        <>
          <AuthAlert tone="error">{errorMsg || t.auth.verifyFailed}</AuthAlert>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" className="w-full" onClick={retry}>
              {t.auth.tryAgain}
            </Button>
            <Button asChild className="w-full">
              <Link href="/auth/resend-verification">{t.auth.resendTitle}</Link>
            </Button>
          </div>
        </>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t.auth.verifying}
        </p>
      )}
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
