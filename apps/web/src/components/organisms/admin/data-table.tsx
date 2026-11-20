import type { ComponentProps } from "react";
import { Skeleton } from "@/components/atoms/skeleton";
import { cn } from "@/lib/utils";

/** shadcn-style table markup. The wrapper scrolls sideways so wide tables never widen the page. */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("border-b border-border transition-colors hover:bg-muted/50", className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn("h-10 px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-3 py-2.5 align-middle", className)} {...props} />;
}

/** Loading rows in the shape of a table. */
export function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="space-y-0 divide-y divide-border" aria-hidden>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 py-3">
          {Array.from({ length: columns }, (_, col) => (
            <Skeleton key={col} className={cn("h-4 bg-muted", col === 0 ? "w-1/4" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}
