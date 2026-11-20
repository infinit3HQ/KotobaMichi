"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { BookOpen, Languages, Layers, LogOut, Menu, Moon, Shield, Sun, Timer, User, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Separator } from "@/components/atoms/separator";
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
import { cn } from "@/lib/utils";

type NavKey = "practice" | "words" | "kanji" | "quizzes" | "mock";

type NavItem = {
  key: NavKey;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const PRIMARY_NAV: NavItem[] = [
  { key: "practice", href: "/practice", icon: Zap },
  { key: "words", href: "/words", icon: BookOpen },
  { key: "kanji", href: "/kanji", icon: Languages },
  { key: "quizzes", href: "/quizzes", icon: Layers },
  { key: "mock", href: "/mock", icon: Timer },
];

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

function BrandMark() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="KotobaMichi home">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-jp text-base font-bold leading-none text-primary-foreground">
        道
      </span>
      <span className="flex items-baseline gap-1.5 truncate">
        <span className="text-base font-semibold tracking-tight">KotobaMichi</span>
        <span className="hidden font-jp text-xs text-muted-foreground sm:inline">言葉道</span>
      </span>
    </Link>
  );
}

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="size-9" aria-hidden />;

  const dark = resolvedTheme === "dark";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Moon /> : <Sun />}
    </Button>
  );
}

function initialsOf(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const label = (key: NavKey, short = false) => {
    if (key === "practice") return short ? t.nav.practiceShort : t.nav.practice;
    if (key === "kanji") return short ? t.nav.kanjiShort : t.nav.kanji;
    if (key === "mock") return short ? t.nav.mockShort : t.nav.mock;
    if (key === "words") return t.nav.words;
    return t.nav.quizzes;
  };

  useEffect(() => setMenuOpen(false), [pathname]);

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // The session cookie may already be gone; signing out locally is still right.
    }
    logout();
    toast.success("Signed out");
    setMenuOpen(false);
    router.push("/");
  };

  const accountLinks = [
    ...(user ? [{ href: "/profile", label: t.nav.profile, icon: User }] : []),
    ...(user?.role === "ADMIN" ? [{ href: "/dashboard", label: t.nav.admin, icon: Shield }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="container mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <BrandMark />

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <LocaleSwitch className="hidden sm:inline-flex" />
            <ThemeButton />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden rounded-full lg:inline-flex" aria-label="Account">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {initialsOf(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href}>
                        <link.icon />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>
                    <LogOut />
                    {t.nav.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/login">{t.nav.signIn}</Link>
              </Button>
            )}

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-3rem,20rem)] gap-0 p-0">
                <SheetHeader className="border-b border-border p-5 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <span className="font-jp text-primary">道</span>
                    KotobaMichi
                  </SheetTitle>
                  <SheetDescription className="truncate">{user ? user.email : t.nav.menuHint}</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-0.5 p-3" aria-label="Menu">
                  {[...PRIMARY_NAV.map((item) => ({ href: item.href, label: label(item.key), icon: item.icon })), ...accountLinks].map(
                    (link) => {
                      const active = isActive(pathname, link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium",
                            active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <link.icon className="size-4" />
                          {link.label}
                        </Link>
                      );
                    }
                  )}
                </nav>
                <Separator />
                <div className="flex items-center justify-between gap-3 p-4">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <LocaleSwitch />
                </div>
                <div className="mt-auto border-t border-border p-4">
                  {user ? (
                    <Button variant="outline" className="w-full" onClick={signOut}>
                      <LogOut />
                      {t.nav.signOut}
                    </Button>
                  ) : (
                    <div className="grid gap-2">
                      <Button asChild>
                        <Link href="/auth/register">{t.nav.createAccount}</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/auth/login">{t.nav.signIn}</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <div className="grid grid-cols-5">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="size-5" />
                {label(item.key, true)}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
