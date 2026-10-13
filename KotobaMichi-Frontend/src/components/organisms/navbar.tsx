"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { Button } from "@/components/atoms/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/atoms/sheet";
import { LocaleSwitch, useLocale } from "@/components/organisms/locale-provider";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Zap, BookOpen, Layers, User, Shield, LogOut, Menu, Home, Moon, Sun, Timer } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
  match: (pathname: string) => boolean;
};

const PRIMARY_NAV: NavItem[] = [
  {
    href: "/",
    label: "Home",
    short: "Home",
    icon: Home,
    match: (pathname) => pathname === "/",
  },
  {
    href: "/practice",
    label: "Practice Dojo",
    short: "Dojo",
    icon: Zap,
    iconClassName: "fill-current text-amber-500",
    match: (pathname) => pathname.startsWith("/practice"),
  },
  {
    href: "/words",
    label: "Words",
    short: "Words",
    icon: BookOpen,
    match: (pathname) => pathname.startsWith("/words"),
  },
  {
    href: "/quizzes",
    label: "Quizzes",
    short: "Quizzes",
    icon: Layers,
    match: (pathname) => pathname.startsWith("/quizzes"),
  },
  {
    href: "/mock",
    label: "Mock exam",
    short: "Mock",
    icon: Timer,
    match: (pathname) => pathname.startsWith("/mock"),
  },
];

function HeaderThemeButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="h-10 w-10" aria-hidden />;
  }

  const dark = theme === "dark";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-10 w-10"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-500" />}
    </Button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const labelFor = (href: string, short = false) => {
    if (href === "/") return short ? t.nav.homeShort : t.nav.home;
    if (href === "/practice") return short ? t.nav.practiceShort : t.nav.practice;
    if (href === "/words") return t.nav.words;
    if (href === "/mock") return short ? t.nav.mockShort : t.nav.mock;
    return t.nav.quizzes;
  };
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
    toast.success("Signed out");
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:px-4">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 transition-transform active:scale-95">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black shadow-sm ring-1 ring-primary/30 transition-all group-hover:scale-105 group-hover:shadow-md">
              <span className="font-jp text-base leading-none tracking-tighter">道</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5 truncate font-extrabold text-base leading-none tracking-tight text-foreground">
                KotobaMichi
                <span className="hidden font-jp text-xs font-medium tracking-normal text-primary/80 sm:inline">
                  言葉道
                </span>
              </span>
              <span className="hidden truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground min-[380px]:block">
                {t.nav.tagline}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {PRIMARY_NAV.map((item) => {
              const active = item.match(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? item.href === "/practice"
                        ? "bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/25"
                        : "bg-secondary text-foreground shadow-2xs"
                      : item.href === "/practice"
                        ? "text-primary/90 hover:bg-primary/10 hover:text-primary"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  {item.href !== "/" && (
                    <Icon
                      className={`h-3.5 w-3.5 ${item.iconClassName ?? "opacity-70"} ${
                        item.href === "/practice" ? "animate-pulse" : ""
                      }`}
                    />
                  )}
                  <span>{labelFor(item.href)}</span>
                </Link>
              );
            })}

            {user && (
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  pathname.startsWith("/profile")
                    ? "bg-secondary text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <User className="h-3.5 w-3.5 opacity-70" />
                {t.nav.profile}
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  pathname.startsWith("/dashboard")
                    ? "bg-secondary text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-primary" />
                {t.nav.admin}
              </Link>
            )}

            {user ? (
              <div className="ml-3 flex items-center gap-2 border-l border-border/60 pl-3">
                <span className="max-w-[130px] truncate font-mono text-xs text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={signOut}
                >
                  <LogOut className="mr-1 h-3.5 w-3.5" />
                  {t.nav.logout}
                </Button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <LocaleSwitch />
                <Button asChild size="sm" className="h-8 rounded-full px-3.5 text-xs font-semibold shadow-xs">
                  <Link href="/auth/login">{t.nav.signIn}</Link>
                </Button>
              </div>
            )}
            {user && <LocaleSwitch className="ml-2" />}
          </nav>

          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <LocaleSwitch />
            <HeaderThemeButton />
            {!user && (
              <Button asChild size="sm" className="hidden h-9 rounded-full px-3 text-xs font-semibold min-[420px]:inline-flex">
                <Link href="/auth/login">{t.nav.signIn}</Link>
              </Button>
            )}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2.5rem,20rem)] gap-0 p-0">
                <SheetHeader className="border-b border-border/70 px-5 py-5 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <span className="font-jp text-primary">道</span>
                    KotobaMichi
                  </SheetTitle>
                  <SheetDescription>
                    {user ? user.email : t.nav.menuHint}
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3">
                  {PRIMARY_NAV.map((item) => {
                    const active = item.match(pathname);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${item.iconClassName ?? ""}`} />
                        {labelFor(item.href)}
                      </Link>
                    );
                  })}
                  {user && (
                    <Link
                      href="/profile"
                      className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${
                        pathname.startsWith("/profile")
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <User className="h-5 w-5" />
                      {t.nav.profile}
                    </Link>
                  )}
                  {user?.role === "ADMIN" && (
                    <Link
                      href="/dashboard"
                      className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${
                        pathname.startsWith("/dashboard")
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Shield className="h-5 w-5 text-primary" />
                      {t.nav.admin}
                    </Link>
                  )}
                </nav>
                <div className="mt-auto border-t border-border/70 p-4">
                  {user ? (
                    <Button variant="outline" className="h-11 w-full" onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t.nav.signOut}
                    </Button>
                  ) : (
                    <Button asChild className="h-11 w-full">
                      <Link href="/auth/register">{t.nav.createAccount}</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <div className="grid grid-cols-5">
          {PRIMARY_NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${item.iconClassName ?? ""}`} />
                {labelFor(item.href, true)}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
