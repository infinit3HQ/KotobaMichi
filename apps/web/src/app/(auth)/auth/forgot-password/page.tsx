"use client";
import { useLocale } from "@/components/organisms/locale-provider";
import { AuthCard, AuthFooterLink } from "@/components/organisms/auth/auth-card";
import { EmailLinkForm } from "@/components/organisms/auth/email-link-form";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  return (
    <AuthCard
      title={t.auth.forgotTitle}
      description={t.auth.forgotDesc}
      footer={<AuthFooterLink prompt={t.auth.rememberPassword} href="/auth/login" label={t.auth.backToLogin} />}
    >
      <EmailLinkForm
        endpoint="/auth/forgot-password"
        submitLabel={t.auth.sendResetLink}
        successMessage={t.auth.resetSent}
      />
    </AuthCard>
  );
}
