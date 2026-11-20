import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";

/** Card shell for each admin section: title, short description, one action on the right. */
export function AdminCard({
  title,
  description,
  action,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 gap-4 py-4 sm:py-6">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6">
        <div className="min-w-0 space-y-1">
          <CardTitle className="tracking-tight">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </CardHeader>
      <CardContent className="min-w-0 px-4 sm:px-6">{children}</CardContent>
    </Card>
  );
}
