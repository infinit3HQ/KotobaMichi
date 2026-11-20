"use client";
import { useLocale } from "@/components/organisms/locale-provider";
import { AuthCard, AuthFooterLink } from "@/components/organisms/auth/auth-card";
import { EmailLinkForm } from "@/components/organisms/auth/email-link-form";

export default function ResendVerificationPage() {
  const { t } = useLocale();
  return (
    <AuthCard
      title={t.auth.resendTitle}
      description={t.auth.resendDesc}
      footer={<AuthFooterLink prompt={t.auth.haveAccount} href="/auth/login" label={t.auth.backToLogin} />}
    >
      <EmailLinkForm
        endpoint="/auth/resend-verification"
        submitLabel={t.auth.sendLink}
        successMessage={t.auth.resendSent}
      />
    </AuthCard>
  );
}
