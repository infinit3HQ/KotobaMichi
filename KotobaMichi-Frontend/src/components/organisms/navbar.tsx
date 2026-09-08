"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Zap, BookOpen, Layers, User, Shield, LogOut } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo with Hanko Seal */}
        <Link href="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black shadow-sm ring-1 ring-primary/30 transition-all group-hover:scale-105 group-hover:shadow-md">
            <span className="font-jp text-base leading-none tracking-tighter">道</span>
            {/* Subtle Japanese seal corner accent */}
            <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight leading-none text-foreground flex items-center gap-1.5">
              KotobaMichi
              <span className="font-jp font-medium text-xs text-primary/80 hidden sm:inline tracking-normal">
                言葉道
              </span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
              Japanese Lexicon Dojo
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive("/") && pathname === "/"
                ? "bg-secondary text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            Home
          </Link>

          <Link
            href="/practice"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isActive("/practice")
                ? "bg-primary/10 text-primary ring-1 ring-primary/25 shadow-2xs"
                : "text-primary/90 hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <Zap className="h-3.5 w-3.5 fill-current text-amber-500 animate-pulse" />
            <span>Practice Dojo</span>
          </Link>

          <Link
            href="/words"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isActive("/words")
                ? "bg-secondary text-foreground shadow-2xs ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 opacity-70" />
            <span>Words</span>
          </Link>

          <Link
            href="/quizzes"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isActive("/quizzes")
                ? "bg-secondary text-foreground shadow-2xs ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <Layers className="h-3.5 w-3.5 opacity-70" />
            <span>Quizzes</span>
          </Link>

          {user && (
            <Link
              href="/profile"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isActive("/profile")
                  ? "bg-secondary text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <User className="h-3.5 w-3.5 opacity-70" />
              <span className="hidden md:inline">Profile</span>
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isActive("/dashboard")
                  ? "bg-secondary text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 ml-1 sm:ml-3 pl-2 sm:pl-3 border-l border-border/60">
              <span className="text-xs text-muted-foreground max-w-[130px] truncate hidden lg:inline font-mono">
                {user.email}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  try {
                    await api.post("/auth/logout");
                  } catch {}
                  logout();
                  toast.success("Signed out");
                  router.push("/");
                }}
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="ml-1 sm:ml-2">
              <Button asChild size="sm" className="h-8 px-3.5 text-xs font-semibold rounded-full shadow-xs">
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
