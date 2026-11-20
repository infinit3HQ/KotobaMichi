"use client";

import { SegmentedControl } from "@/components/molecules/segmented-control";
import { COLUMN_CHOICES, type ColumnChoice } from "./catalog-types";

type ColumnPickerProps = {
  value: ColumnChoice;
  onValueChange: (value: ColumnChoice) => void;
  label: string;
  autoLabel: string;
};

export function ColumnPicker({ value, onValueChange, label, autoLabel }: ColumnPickerProps) {
  const options = COLUMN_CHOICES.map((choice) => ({
    value: choice,
    label: choice === "auto" ? autoLabel : choice,
    ariaLabel: choice === "auto" ? autoLabel : `${choice} ${label}`,
  }));
  return <SegmentedControl size="sm" value={value} onValueChange={onValueChange} options={options} ariaLabel={label} />;
}

export const columnCount = (choice: ColumnChoice) => (choice === "auto" ? undefined : Number(choice));
