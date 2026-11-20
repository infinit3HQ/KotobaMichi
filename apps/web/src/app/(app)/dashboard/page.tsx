"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { PageHeader } from "@/components/molecules/page-header";
import { CsvImportManager } from "@/components/organisms/admin/csv-import-manager";
import { QuizzesManager } from "@/components/organisms/admin/quizzes-manager";
import { WordsManager } from "@/components/organisms/admin/words-manager";
import { useLocale } from "@/components/organisms/locale-provider";
import { ProtectedRoute } from "@/components/organisms/protected-route";

export default function DashboardPage() {
  const { t } = useLocale();
  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader eyebrow="管理" title={t.nav.admin} description="Manage vocabulary, public quizzes and CSV imports." />
        <Tabs defaultValue="words" className="gap-4">
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="words">Words</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="import">CSV import</TabsTrigger>
          </TabsList>
          <TabsContent value="words" className="min-w-0">
            <WordsManager />
          </TabsContent>
          <TabsContent value="quizzes" className="min-w-0">
            <QuizzesManager />
          </TabsContent>
          <TabsContent value="import" className="min-w-0">
            <CsvImportManager />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
