"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { api, getApiError } from "@/lib/api";
import { useLocale } from "@/components/organisms/locale-provider";
import {
  AuthAlert,
  AuthCard,
  AuthCardSkeleton,
  AuthFooterLink,
} from "@/components/organisms/auth/auth-card";

function resetSchema(messages: { passwordMin: string; passwordsMismatch: string }) {
  return z
    .object({
      password: z.string().min(6, messages.passwordMin),
      confirmPassword: z.string().min(6, messages.passwordMin),
    })
    .refine((v) => v.password === v.confirmPassword, {
      path: ["confirmPassword"],
      message: messages.passwordsMismatch,
    });
}
type FormVals = z.infer<ReturnType<typeof resetSchema>>;

function ResetPasswordClient() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [error, setError] = useState<string | null>(null);
  const schema = useMemo(() => resetSchema(t.auth), [t]);
  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormVals) => {
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, newPassword: values.password });
      toast.success(t.auth.passwordUpdated);
      router.push("/auth/login");
    } catch (e) {
      const { message } = getApiError(e);
      setError(message ?? t.auth.resetFailed);
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <AuthCard
      title={t.auth.newPasswordTitle}
      description={t.auth.newPasswordDesc}
      footer={<AuthFooterLink prompt={t.auth.rememberPassword} href="/auth/login" label={t.auth.backToLogin} />}
    >
      {!token ? (
        <>
          <AuthAlert tone="error">{t.auth.missingResetToken}</AuthAlert>
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">{t.auth.requestNewLink}</Link>
          </Button>
        </>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.newPassword}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.confirmPassword}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t.auth.updating : t.auth.updatePassword}
            </Button>
          </form>
        </Form>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
