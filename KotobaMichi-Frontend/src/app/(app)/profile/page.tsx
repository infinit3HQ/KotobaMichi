"use client";
import Link from "next/link";
import { ProtectedRoute } from "@/components/organisms/protected-route";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserProfile, UserAttemptsResponse } from "@/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { toast } from "sonner";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <ProfileCard />
        <AttemptsCard />
  <ChangePasswordCard />
      </div>
    </ProtectedRoute>
  );
}

function ProfileCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => (await api.get<UserProfile>("/users/me")).data,
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-14 w-full" />
        ) : isError || !data ? (
          <p className="text-destructive">Failed to load profile.</p>
        ) : (
          <div className="space-y-1">
            <p>
              <span className="text-muted-foreground">Email:</span> {data.email}
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span> {data.role}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const changePwSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmNewPassword: z.string().min(6),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  });

type ChangePwVals = z.infer<typeof changePwSchema>;

function ChangePasswordCard() {
  const form = useForm<ChangePwVals>({
    resolver: zodResolver(changePwSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = async (values: ChangePwVals) => {
    try {
      await api.post("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed");
      form.reset();
    } catch {
      toast.error("Failed to change password");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AttemptsCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", "me", "attempts", { page: 1, limit: 10 }],
    queryFn: async () =>
      (
        await api.get<UserAttemptsResponse>("/users/me/attempts", {
          params: { page: 1, limit: 10 },
        })
      ).data,
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attempts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-destructive">Failed to load attempts.</p>
        ) : data && data.attempts.length > 0 ? (
          <ul className="space-y-2">
            {data.attempts.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Score: {a.score}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.completedAt).toLocaleString()}
                  </div>
                </div>
                <Link href={`/results/${a.id}`} className="underline text-sm">
                  View
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No attempts yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
