"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import { ProfileCard } from "@/components/organisms/profile/profile-cards";
import { api } from "@/lib/api";

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

const FIELDS: { name: keyof ChangePwVals; label: string; autoComplete: string }[] = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  { name: "confirmNewPassword", label: "Confirm new password", autoComplete: "new-password" },
];

export function ChangePasswordCard() {
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
    <ProfileCard title="Change password" description="Use at least six characters.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
          {FIELDS.map((item) => (
            <FormField
              key={item.name}
              control={form.control}
              name={item.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{item.label}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete={item.autoComplete} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save password"}
          </Button>
        </form>
      </Form>
    </ProfileCard>
  );
}
