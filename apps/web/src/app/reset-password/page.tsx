"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { api, getApiError } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormVals = z.infer<typeof schema>;

function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormVals) => {
    if (!token) {
      toast.error("Missing token in URL");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/auth/reset-password", {
        token,
        newPassword: values.password,
      });
      toast.success("Password updated. Please sign in.");
      router.push("/auth/login");
    } catch (e) {
      const { message } = getApiError(e);
      toast.error(message ?? "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Missing token. Request a new reset link.
              </p>
              <Button onClick={() => router.push("/auth/forgot-password")}>
                Forgot password
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          {...field}
                        />
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="••••••••"
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
                  disabled={submitting || form.formState.isSubmitting}
                >
                  {submitting || form.formState.isSubmitting
                    ? "Updating…"
                    : "Update Password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center">Loading…</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
