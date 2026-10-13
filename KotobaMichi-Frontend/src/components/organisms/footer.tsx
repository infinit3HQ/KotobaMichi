"use client";

import Link from "next/link";
import { useLocale } from "@/components/organisms/locale-provider";

export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-border/70 bg-card/40 backdrop-blur-sm py-10 text-xs text-muted-foreground transition-colors">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground tracking-tight text-sm">KotobaMichi</span>
            <span className="font-jp text-primary font-medium text-xs">言葉道</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-mono">
              JLPT N5
            </span>
          </div>
          <p className="max-w-md text-center text-xs italic text-muted-foreground/90 md:text-left">
            {t.footer.quote}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 font-medium">
          <Link href="/practice" className="hover:text-primary transition-colors">
            {t.nav.practice}
          </Link>
          <Link href="/words" className="hover:text-primary transition-colors">
            {t.home.vaultTitle}
          </Link>
          <Link href="/kanji" className="hover:text-primary transition-colors">
            {t.nav.kanji}
          </Link>
          <Link href="/quizzes" className="hover:text-primary transition-colors">
            {t.home.quizTitle}
          </Link>
          <span className="text-border">|</span>
          <span className="text-muted-foreground/70">
            © {new Date().getFullYear()} KotobaMichi. {t.footer.crafted}
          </span>
        </div>
      </div>
    </footer>
  );
}
