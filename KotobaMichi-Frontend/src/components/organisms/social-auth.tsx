"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import { useLocale } from "@/components/organisms/locale-provider";
import { api, getApiBaseUrl } from "@/lib/api";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3c-1.07.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.29V6.62H1.26a12 12 0 0 0 0 10.76l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.14 15.23 0 12 0 7.31 0 3.26 2.69 1.26 6.62l4.01 3.09C6.22 6.87 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function SocialAuth() {
  const { t } = useLocale();
  const [google, setGoogle] = useState(true);

  useEffect(() => {
    let live = true;
    api
      .get<{ google?: boolean }>("/auth/providers")
      .then((res) => {
        if (live) setGoogle(res.data?.google !== false);
      })
      .catch(() => {
        if (live) setGoogle(true);
      });
    return () => {
      live = false;
    };
  }, []);

  if (!google) return null;

  return (
    <div className="mb-4 space-y-4">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={() => {
          window.location.assign(`${getApiBaseUrl()}/auth/google`);
        }}
      >
        <GoogleMark />
        {t.auth.continueGoogle}
      </Button>
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t.auth.orEmail}
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
