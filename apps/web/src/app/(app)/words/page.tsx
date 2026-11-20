"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { CatalogSkeleton } from "@/components/organisms/catalog/catalog-skeleton";
import { WordsCatalog } from "@/components/organisms/catalog/words-catalog";
import { useLocale } from "@/components/organisms/locale-provider";
import { useVocabCatalogState } from "@/hooks/use-vocab-catalog";

export default function WordsPage() {
  const { t } = useLocale();
  // The word lists are about 2 MB, so they load as their own chunk after the page shell.
  const { catalog, failed, retry } = useVocabCatalogState();

  if (failed) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={t.words.errorTitle}
        description={t.words.errorDesc}
        action={<Button onClick={retry}>{t.words.retry}</Button>}
      />
    );
  }

  if (!catalog) return <CatalogSkeleton />;

  return <WordsCatalog vocab={catalog} />;
}
