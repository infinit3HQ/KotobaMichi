"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { useCountdown } from "@/hooks/use-countdown";
import { api, getApiError } from "@/lib/api";
import { extractRateLimitFromError } from "@/lib/rate-limit";
import { useLocale } from "@/components/organisms/locale-provider";
import { AuthAlert } from "./auth-card";

const schema = z.object({ email: z.string().email() });
type FormVals = z.infer<typeof schema>;

type Status = { tone: "success" | "error"; message: string } | null;

/** Email-only form that asks the API to send a link (password reset or a new verification email). */
export function EmailLinkForm({
  endpoint,
  submitLabel,
  successMessage,
}: {
  endpoint: string;
  submitLabel: string;
  successMessage: string;
}) {
  const { t } = useLocale();
  const form = useForm<FormVals>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const { secondsLeft, reset, running } = useCountdown(null);
  const [status, setStatus] = useState<Status>(null);
  const submitting = form.formState.isSubmitting;

  const onSubmit = async (values: FormVals) => {
    setStatus(null);
    try {
      await api.post(endpoint, values);
      setStatus({ tone: "success", message: successMessage });
    } catch (error) {
      const { message } = getApiError(error);
      const limit = extractRateLimitFromError(error);
      if (limit) {
        if (limit.retryAfterSeconds != null && limit.retryAfterSeconds > 0) reset(limit.retryAfterSeconds);
        setStatus({ tone: "error", message: limit.rawMessage ?? message ?? t.auth.tooManyRequests });
        return;
      }
      setStatus({ tone: "error", message: message ?? t.auth.requestFailed });
    }
  };

  const label = submitting
    ? t.auth.sending
    : running && secondsLeft != null
      ? t.auth.tryAgainIn(secondsLeft)
      : submitLabel;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {status ? <AuthAlert tone={status.tone}>{status.message}</AuthAlert> : null}
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
        <Button type="submit" className="w-full" disabled={submitting || running}>
          {label}
        </Button>
        {running && secondsLeft != null ? (
          <p className="text-center text-xs text-muted-foreground">{t.auth.rateLimited(secondsLeft)}</p>
        ) : null}
      </form>
    </Form>
  );
}
