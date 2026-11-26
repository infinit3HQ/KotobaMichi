"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { api, getApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/components/organisms/locale-provider";
import { SocialAuth } from "@/components/organisms/social-auth";
import { AuthAlert, AuthCard, AuthFooterLink } from "@/components/organisms/auth/auth-card";
import { track } from "@/lib/analytics/posthog";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormVals = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason === "google") setError(t.auth.googleFailed);
  }, [t]);

  const onSubmit = async (values: FormVals) => {
    setError(null);
    try {
      const res = await api.post("/auth/login", values);
      const { user } = res.data as {
        user: { id: string; email: string; role: "USER" | "ADMIN" };
      };
      setUser(user);
      track("logged_in", { method: "password" });
      toast.success(t.auth.loggedIn);
      router.push("/");
    } catch (e) {
      const { message } = getApiError(e);
      setError(message ?? t.auth.loginFailed);
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <AuthCard
      title={t.auth.login}
      description={t.auth.signInAccount}
      footer={
        <>
          <AuthFooterLink prompt={t.auth.noAccount} href="/auth/register" label={t.auth.register} />
          <AuthFooterLink prompt={t.auth.forgot} href="/auth/forgot-password" label={t.auth.reset} />
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
                  <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t.auth.signingIn : t.auth.signIn}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
