"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/atoms/alert-dialog";
import { Button, buttonVariants } from "@/components/atoms/button";

/** Destructive action behind a confirmation dialog (replaces window.confirm). */
export function ConfirmDeleteButton({
  label,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  disabled,
  size = "sm",
  iconOnly = false,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  disabled?: boolean;
  size?: "sm" | "default";
  iconOnly?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={iconOnly ? "ghost" : "destructive"}
          size={iconOnly ? "icon" : size}
          disabled={disabled}
          aria-label={iconOnly ? label : undefined}
          className={iconOnly ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : undefined}
        >
          <Trash2 />
          {iconOnly ? null : label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
