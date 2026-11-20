"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { formatNumber } from "./catalog-types";
import { ALL_TOPICS } from "./word-types";

type TopicSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  topics: readonly string[];
  counts: Readonly<Record<string, number>>;
  label: string;
  allLabel: string;
};

export function TopicSelect({ value, onValueChange, topics, counts, label, allLabel }: TopicSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={label} className="min-w-0 flex-1 sm:w-48 sm:flex-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {topics.map((topic) => (
          <SelectItem key={topic} value={topic}>
            {topic === ALL_TOPICS ? allLabel : topic}
            <span className="ml-auto pl-2 font-mono text-xs text-muted-foreground tabular-nums">
              {formatNumber(counts[topic] ?? 0)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
