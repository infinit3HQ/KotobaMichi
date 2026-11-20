"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { api, getApiError } from "@/lib/api";
import { toast } from "sonner";

function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    if (!token) return;
    (async () => {
      setStatus("verifying");
      try {
        await api.post("/auth/verify-email", { token });
        if (!mounted) return;
        setStatus("success");
        toast.success("Email verified. You can now log in.");
      } catch (e) {
        const { message } = getApiError(e);
        if (!mounted) return;
        setErrorMsg(message ?? "Verification failed");
        setStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Missing token. Please use the link from your email. You can also
                request a new verification email.
              </p>
              <Button onClick={() => router.push("/auth/resend-verification")}>
                Resend verification
              </Button>
            </div>
          ) : status === "verifying" ? (
            <p>Verifying your email…</p>
          ) : status === "success" ? (
            <div className="space-y-3">
              <p>Your email has been verified.</p>
              <Button onClick={() => router.push("/auth/login")}>
                Go to login
              </Button>
            </div>
          ) : status === "error" ? (
            <div className="space-y-3">
              <p className="text-destructive">{errorMsg}</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => router.refresh()}>
                  Try again
                </Button>
                <Button
                  onClick={() => router.push("/auth/resend-verification")}
                >
                  Resend verification
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center">Loading…</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
