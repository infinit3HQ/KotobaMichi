"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import type { Word } from "@/types/api";

export type WordFormValues = Omit<Word, "id">;

const FIELDS: { key: keyof WordFormValues; label: string; placeholder?: string }[] = [
  { key: "kanji", label: "Kanji", placeholder: "Optional" },
  { key: "hiragana", label: "Hiragana" },
  { key: "romaji", label: "Romaji", placeholder: "Optional" },
  { key: "english", label: "English" },
  { key: "pronunciationUrl", label: "Pronunciation URL" },
  { key: "level", label: "Level", placeholder: "N5" },
];

export const EMPTY_WORD: WordFormValues = {
  kanji: "",
  hiragana: "",
  romaji: "",
  english: "",
  pronunciationUrl: "",
  level: "",
  createdAt: "",
};

/** Add or edit a word. The trigger button is passed in so it can be "Add word" or "Edit". */
export function WordFormDialog({
  title,
  initial,
  trigger,
  submitting,
  onSubmit,
}: {
  title: string;
  initial: WordFormValues;
  trigger: ReactNode;
  submitting?: boolean;
  onSubmit: (values: WordFormValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<WordFormValues>(initial);

  const onOpenChange = (next: boolean) => {
    if (next) setForm({ ...initial, createdAt: initial.createdAt || new Date().toISOString() });
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Hiragana and English are required.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key} className="grid gap-1.5">
              <Label htmlFor={`word-${field.key}`}>{field.label}</Label>
              <Input
                id={`word-${field.key}`}
                value={(form[field.key] as string | null) ?? ""}
                placeholder={field.placeholder}
                onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(form);
              setOpen(false);
            }}
            disabled={submitting || !form.hiragana.trim() || !form.english.trim()}
          >
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
