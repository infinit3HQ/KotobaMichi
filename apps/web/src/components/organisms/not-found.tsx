"use client";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/atoms/button";

/** Shown for any route that does not exist. */
export function NotFound() {
  return (
    <div className="flex justify-center py-8 sm:py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <span aria-hidden className="font-jp text-4xl font-bold text-primary">
          迷子
        </span>
        <div className="space-y-1">
          <p className="font-mono text-xs tabular-nums text-muted-foreground">404</p>
          <h1 className="text-lg font-semibold tracking-tight">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            This page does not exist. The link may be old, or the address may have a typo.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home />
              Go home
            </Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
