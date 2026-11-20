"use client";

import { Card, CardContent } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { useLocale } from "@/components/organisms/locale-provider";

/** Placeholder shown while a drill's code chunk loads. */
export function DrillSkeleton() {
  const { t } = useLocale();
  return (
    <Card className="mx-auto w-full max-w-xl gap-0 py-0" aria-busy="true">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <span className="sr-only">{t.practice.loading}</span>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex flex-col items-center gap-3 py-4">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
