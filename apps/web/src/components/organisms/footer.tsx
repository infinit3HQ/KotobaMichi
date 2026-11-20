"use client";

import Link from "next/link";
import { useLocale } from "@/components/organisms/locale-provider";

export function Footer() {
  const { t } = useLocale();
  const links = [
    { href: "/practice", label: t.nav.practice },
    { href: "/words", label: t.nav.words },
    { href: "/kanji", label: t.nav.kanji },
    { href: "/quizzes", label: t.nav.quizzes },
    { href: "/mock", label: t.nav.mock },
  ];
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="flex items-baseline gap-1.5">
            <span className="font-semibold text-foreground">KotobaMichi</span>
            <span className="font-jp text-xs">言葉道</span>
          </p>
          <p className="max-w-md text-xs">{t.footer.quote}</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs">© {new Date().getFullYear()} KotobaMichi</p>
      </div>
    </footer>
  );
}
