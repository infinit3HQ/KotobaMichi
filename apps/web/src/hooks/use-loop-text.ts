"use client";

import { useLocale } from "@/components/organisms/locale-provider";
import { loopText } from "@/lib/i18n/loop-text";

/** Text for the daily plan, goal, milestones and mistake review, in the learner's chosen language. */
export function useLoopText() {
  const { selectedLocale } = useLocale();
  return loopText[selectedLocale];
}
