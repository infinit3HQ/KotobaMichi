import type { PropsWithChildren } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { AuthBootstrap } from "./auth-bootstrap";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-clip pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <AuthBootstrap />
      <Navbar />
      <main className="container mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <Footer />
    </div>
  );
}
