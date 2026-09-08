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
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  type FormVals = z.infer<typeof schema>;
  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormVals) => {
    try {
      const res = await api.post("/auth/login", values);
      const { user } = res.data as {
        user: { id: string; email: string; role: "USER" | "ADMIN" };
      };
      setUser(user);
      toast.success("Logged in");
      router.push("/");
    } catch (e) {
      const { message } = getApiError(e);
      if (message?.toLowerCase().includes("verify")) {
        toast.error(message);
      } else {
        toast.error(message ?? "Login failed");
      }
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
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
                        autoComplete="current-password"
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
                {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>
          <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
            <p>
              No account?{" "}
              <Link href="/auth/register" className="underline">
                Register
              </Link>
            </p>
            <p>
              Forgot your password? {""}
              <Link href="/auth/forgot-password" className="underline">
                Reset it
              </Link>
            </p>
            <p>
              Need a new verification email? {""}
              <Link href="/auth/resend-verification" className="underline">
                Resend
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
