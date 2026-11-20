import type { PropsWithChildren } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { AuthBootstrap } from "./auth-bootstrap";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-clip pb-[calc(3.75rem+env(safe-area-inset-bottom))] lg:pb-0">
      <AuthBootstrap />
      <Navbar />
      <main className="container mx-auto min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-6">{children}</main>
      <Footer />
    </div>
  );
}
