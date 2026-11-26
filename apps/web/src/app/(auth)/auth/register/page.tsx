"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { api, getApiError } from "@/lib/api";
import { useLocale } from "@/components/organisms/locale-provider";
import { SocialAuth } from "@/components/organisms/social-auth";
import { AuthAlert, AuthCard, AuthFooterLink } from "@/components/organisms/auth/auth-card";

function registerSchema(messages: { passwordMin: string; passwordsMismatch: string }) {
  return z
    .object({
      email: z.string().email(),
      password: z.string().min(6, messages.passwordMin),
      confirmPassword: z.string().min(6, messages.passwordMin),
    })
    .refine((vals) => vals.password === vals.confirmPassword, {
      path: ["confirmPassword"],
      message: messages.passwordsMismatch,
    });
}
type FormVals = z.infer<ReturnType<typeof registerSchema>>;

export default function RegisterPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const schema = useMemo(() => registerSchema(t.auth), [t]);
  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormVals) => {
    setError(null);
    try {
      const { data } = await api.post<{ emailSent?: boolean }>("/auth/register", {
        email: values.email,
        password: values.password,
      });
      // The account exists even when the mail server failed, so send them to request a new link.
      if (data?.emailSent === false) {
        toast.warning(t.auth.registeredNoEmail);
        router.push("/auth/resend-verification");
        return;
      }
      toast.success(t.auth.registered);
      router.push("/auth/login");
    } catch (e) {
      const { message } = getApiError(e);
      setError(message ?? t.auth.registerFailed);
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <AuthCard
      title={t.auth.registerTitle}
      description={t.auth.registerDesc}
      footer={
        <>
          <AuthFooterLink prompt={t.auth.haveAccount} href="/auth/login" label={t.auth.signIn} />
          <AuthFooterLink prompt={t.auth.resendPrompt} href="/auth/resend-verification" label={t.auth.resend} />
        </>
      }
    >
      <SocialAuth />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.auth.email}</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.auth.password}</FormLabel>
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
            {submitting ? t.auth.creatingAccount : t.auth.createAccount}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
