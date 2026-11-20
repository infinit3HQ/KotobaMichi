import type { JLPTLevel } from "@/data/grammar";

export type CatalogLevel = "ALL" | JLPTLevel;
export type CatalogView = "cards" | "list";
export type ColumnChoice = "auto" | "2" | "3" | "4" | "5";

export const JLPT_LEVELS: readonly JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];
export const COLUMN_CHOICES: readonly ColumnChoice[] = ["auto", "2", "3", "4", "5"];

export const SPEECH_RATES = { normal: 0.92, slow: 0.72 } as const;
export type SpeechRateKey = keyof typeof SPEECH_RATES;

export const formatNumber = (value: number) => value.toLocaleString("en-US");
