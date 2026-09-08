"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Zap } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg">
          KotobaMichi
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="gap-1 font-semibold text-primary">
            <Link href="/practice">
              <Zap className="h-3.5 w-3.5 fill-current text-amber-500" />
              Practice Dojo
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/quizzes">Quizzes</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/words">Words</Link>
          </Button>
          {user && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/profile">Profile</Link>
            </Button>
          )}
          {user?.role === "ADMIN" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          )}
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Button
                size="sm"
                className="ml-2"
                variant="destructive"
                onClick={async () => {
                  try {
                    await api.post("/auth/logout");
                  } catch {}
                  logout();
                  toast.success("Logged out");
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="ml-2">
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
