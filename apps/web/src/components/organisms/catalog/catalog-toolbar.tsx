"use client";

import type { ReactNode, RefObject } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { Input } from "@/components/atoms/input";
import { SegmentedControl, type SegmentOption } from "@/components/molecules/segmented-control";
import { cn } from "@/lib/utils";
import type { CatalogLevel, CatalogView } from "./catalog-types";

type CatalogToolbarProps = {
  level: CatalogLevel;
  onLevelChange: (level: CatalogLevel) => void;
  levelOptions: readonly SegmentOption<CatalogLevel>[];
  levelLabel: string;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  clearSearchLabel: string;
  searchRef: RefObject<HTMLInputElement | null>;
  /** Extra filters (e.g. a topic Select) placed between search and the view switch. */
  filters?: ReactNode;
  view: CatalogView;
  onViewChange: (view: CatalogView) => void;
  viewLabels: { label: string; cards: string; list: string };
};

/** The one filter row shared by the word and kanji catalogs: level, search, filters, view. */
export function CatalogToolbar(props: CatalogToolbarProps) {
  const { filters, view, onViewChange, viewLabels } = props;
  const viewOptions: SegmentOption<CatalogView>[] = [
    { value: "cards", ariaLabel: viewLabels.cards, label: <ViewLabel icon={<LayoutGrid />} text={viewLabels.cards} /> },
    { value: "list", ariaLabel: viewLabels.list, label: <ViewLabel icon={<List />} text={viewLabels.list} /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <LevelPicker {...props} />
      <SearchField {...props} wide={Boolean(filters)} />
      {filters}
      <SegmentedControl
        value={view}
        onValueChange={onViewChange}
        options={viewOptions}
        ariaLabel={viewLabels.label}
        className="shrink-0"
      />
    </div>
  );
}

function ViewLabel({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <>
      <span aria-hidden className="[&_svg]:size-4">{icon}</span>
      <span className="hidden sm:inline">{text}</span>
    </>
  );
}

function LevelPicker({ level, onLevelChange, levelOptions, levelLabel }: CatalogToolbarProps) {
  return (
    <div className="w-full overflow-x-auto [scrollbar-width:none] lg:w-auto [&::-webkit-scrollbar]:hidden">
      <SegmentedControl
        value={level}
        onValueChange={onLevelChange}
        options={levelOptions}
        ariaLabel={levelLabel}
        fullWidth
        className="min-w-max lg:w-fit"
      />
    </div>
  );
}

function SearchField({
  search,
  onSearchChange,
  searchPlaceholder,
  clearSearchLabel,
  searchRef,
  wide,
}: CatalogToolbarProps & { wide: boolean }) {
  return (
    <div className={cn("relative min-w-0 flex-1 sm:min-w-56", wide && "basis-full sm:basis-auto")}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={searchRef}
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {search ? (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          aria-label={clearSearchLabel}
          className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

type ResultBarProps = {
  count: string;
  /** Secondary actions (reveal / hide); shown only in card view. */
  actions?: ReactNode;
  /** Column picker; hidden on phones where the grid picks its own column count. */
  columns?: ReactNode;
};

/** Plain result count on the left, light secondary actions on the right. */
export function CatalogResultBar({ count, actions, columns }: ResultBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
        {count}
      </p>
      {actions || columns ? (
        <div className="-ml-2.5 flex flex-wrap items-center gap-1 sm:ml-0">
          {actions}
          {columns ? <div className="ml-2 hidden md:flex">{columns}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
