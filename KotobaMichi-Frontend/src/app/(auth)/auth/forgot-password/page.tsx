"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getApiError } from "@/lib/api";
import { extractRateLimitFromError } from "@/lib/rate-limit";
import { useCountdown } from "@/hooks/use-countdown";
import { toast } from "sonner";

const schema = z.object({ email: z.string().email() });

type FormVals = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  const { secondsLeft, reset, running } = useCountdown(null);

  const onSubmit = async (values: FormVals) => {
    try {
      await api.post("/auth/forgot-password", values);
      toast.success("If that email exists, we sent a reset link.");
    } catch (e) {
      const { message } = getApiError(e);
      const rl = extractRateLimitFromError(e);
      if (rl) {
        if (rl.retryAfterSeconds != null && rl.retryAfterSeconds > 0) {
          reset(rl.retryAfterSeconds);
        }
        toast.error(rl.rawMessage ?? message ?? "Too many requests");
        return;
      }
      toast.error(message ?? "Request failed");
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            We&apos;ll email you a link to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting || running}
              >
                {form.formState.isSubmitting
                  ? "Sending…"
                  : running && secondsLeft != null
                  ? `Try again in ${secondsLeft}s`
                  : "Send reset link"}
              </Button>
              {running && secondsLeft != null ? (
                <p className="text-xs text-muted-foreground text-center">
                  Rate limit active. Please wait {secondsLeft}s before retrying.
                </p>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
