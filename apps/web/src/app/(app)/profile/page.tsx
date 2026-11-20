"use client";

import { PageHeader } from "@/components/molecules/page-header";
import { LearningPath } from "@/components/organisms/learning-path";
import { useLocale } from "@/components/organisms/locale-provider";
import { ChangePasswordCard } from "@/components/organisms/profile/change-password-card";
import { AccountCard, MockHistoryCard, QuizAttemptsCard } from "@/components/organisms/profile/profile-cards";
import { ProtectedRoute } from "@/components/organisms/protected-route";

export default function ProfilePage() {
  const { t } = useLocale();
  return (
    <ProtectedRoute>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          eyebrow="プロフィール"
          title={t.nav.profile}
          description="Your account, study progress and past scores."
        />
        <AccountCard />
        <LearningPath />
        <div className="grid gap-6 lg:grid-cols-2">
          <MockHistoryCard />
          <QuizAttemptsCard />
        </div>
        <ChangePasswordCard />
      </div>
    </ProtectedRoute>
  );
}
