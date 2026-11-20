"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

/* shadcn-style table primitives, kept local to the catalog pages. */

export function Table({ className, ...props }: ComponentProps<"table">) {
  return <table className={cn("w-full caption-bottom text-sm", className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn("h-10 px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground sm:px-4", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("h-14 border-b transition-colors last:border-0 hover:bg-muted/50", className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-3 py-2 align-middle sm:px-4", className)} {...props} />;
}

type PaginatedTableProps<T> = {
  items: readonly T[];
  pageSize: number;
  header: ReactNode;
  renderRow: (item: T) => ReactNode;
  labels: { pageOf: (page: string, total: string) => string; prev: string; next: string };
};

/** Bordered table card with simple previous / next paging. Remount (via key) to reset the page. */
export function PaginatedTable<T>({ items, pageSize, header, renderRow, labels }: PaginatedTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  const rows = items.slice((current - 1) * pageSize, current * pageSize);

  const goTo = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <thead className="border-b bg-muted/40">{header}</thead>
          <tbody>{rows.map(renderRow)}</tbody>
        </Table>
      </div>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t px-3 py-3 sm:px-4">
          <span className="text-sm text-muted-foreground tabular-nums">
            {labels.pageOf(String(current), String(totalPages))}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={current === 1} onClick={() => goTo(current - 1)}>
              <ChevronLeft />
              <span className="hidden sm:inline">{labels.prev}</span>
            </Button>
            <Button variant="outline" size="sm" disabled={current === totalPages} onClick={() => goTo(current + 1)}>
              <span className="hidden sm:inline">{labels.next}</span>
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
