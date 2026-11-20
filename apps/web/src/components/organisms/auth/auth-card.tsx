import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/atoms/alert";
import { Skeleton } from "@/components/atoms/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/atoms/card";

/** The one centered card every sign-in, sign-up and account-link page uses. */
export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-center py-2 sm:py-8">
      <Card className="w-full max-w-sm gap-5 py-5 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg tracking-tight">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">{children}</CardContent>
        {footer ? (
          <CardFooter className="flex-col items-start gap-1.5 px-4 text-sm text-muted-foreground sm:px-6">
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}

/** "No account? Register" style line under an auth card. */
export function AuthFooterLink({ prompt, href, label }: { prompt: ReactNode; href: string; label: ReactNode }) {
  return (
    <p>
      {prompt}{" "}
      <Link href={href} className="font-medium text-primary underline-offset-4 hover:underline">
        {label}
      </Link>
    </p>
  );
}

/** Inline success or error message inside an auth card. */
export function AuthAlert({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <Alert variant={tone === "error" ? "destructive" : "default"}>
      <Icon />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

/** Placeholder in the shape of an auth card, shown while the page reads its URL. */
export function AuthCardSkeleton() {
  return (
    <div className="flex justify-center py-2 sm:py-8" aria-busy="true">
      <Card className="w-full max-w-sm gap-5 px-4 py-5 sm:px-6 sm:py-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </Card>
    </div>
  );
}
