"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

const GAP = 16;
/** Below this width the column picker is hidden and the grid always picks its own count. */
const FORCED_COLUMNS_MIN_WIDTH = 720;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type VirtualCardGridProps<T> = {
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Card height in px; rows are this plus the 16px gap. */
  cardHeight: number;
  /** Narrowest a card may get before the grid drops a column. */
  minCardWidth: number;
  maxColumns: number;
  /** Fixed column count chosen by the student (ignored on narrow screens). */
  columns?: number;
  onEndReached?: () => void;
  footer?: ReactNode;
};

export function autoColumns(width: number, minCardWidth: number, maxColumns: number) {
  if (width <= 0) return 1;
  const fit = Math.floor((width + GAP) / (minCardWidth + GAP));
  return Math.min(maxColumns, Math.max(1, fit));
}

function useGridMeasurements() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, top: 0 });

  useIsoLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      const next = { width: Math.round(rect.width), top: Math.round(rect.top + window.scrollY) };
      setSize((prev) => (prev.width === next.width && prev.top === next.top ? prev : next));
    };
    measure();
    // Body resizes when anything above the grid changes height, which moves the grid.
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}

/** Window-virtualised card grid: only the rows near the viewport are mounted. */
export function VirtualCardGrid<T>({
  items,
  getKey,
  renderItem,
  cardHeight,
  minCardWidth,
  maxColumns,
  columns: forced,
  onEndReached,
  footer,
}: VirtualCardGridProps<T>) {
  const { ref, width, top } = useGridMeasurements();
  const columns =
    forced && width >= FORCED_COLUMNS_MIN_WIDTH ? forced : autoColumns(width, minCardWidth, maxColumns);
  const rowHeight = cardHeight + GAP;
  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => rowHeight,
    overscan: 4,
    scrollMargin: top,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [rowHeight, virtualizer]);

  const rows = virtualizer.getVirtualItems();
  const lastIndex = rows.length > 0 ? rows[rows.length - 1].index : -1;

  useEffect(() => {
    if (onEndReached && lastIndex >= rowCount - 2 && lastIndex >= 0) onEndReached();
  }, [lastIndex, rowCount, onEndReached]);

  return (
    <div ref={ref} className="w-full">
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {rows.map((row) => {
          const start = row.index * columns;
          return (
            <div
              key={row.key}
              className="absolute top-0 left-0 grid w-full gap-4"
              style={{
                height: cardHeight,
                transform: `translateY(${row.start - top}px)`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {items.slice(start, start + columns).map((item) => (
                <div key={getKey(item)} className="min-w-0">
                  {renderItem(item)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
}
