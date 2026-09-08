"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const schema = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
      confirmPassword: z.string().min(6),
    })
    .refine((vals) => vals.password === vals.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  type FormVals = z.infer<typeof schema>;
  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormVals) => {
    try {
      await api.post("/auth/register", {
        email: values.email,
        password: values.password,
      });
      toast.success(
        "Account created. Please verify your email before logging in."
      );
      router.push("/auth/login");
    } catch (e) {
      const { message } = getApiError(e);
      toast.error(message ?? "Registration failed");
    }
  };
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account</CardDescription>
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
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...field}
                      />
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
                    <FormLabel>Password</FormLabel>
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
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Creating account…"
                  : "Create account"}
              </Button>
            </form>
          </Form>
          <div className="mt-3 text-sm text-muted-foreground">
            <p>
              Already have an account?{" "}
              <Link href="/auth/login" className="underline">
                Login
              </Link>
            </p>
            <p className="mt-1">
              Didn&apos;t get the email?{" "}
              <Link href="/auth/resend-verification" className="underline">
                Resend verification
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
