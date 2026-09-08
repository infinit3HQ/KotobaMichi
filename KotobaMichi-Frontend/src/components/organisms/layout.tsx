import type { PropsWithChildren } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { AuthBootstrap } from "./auth-bootstrap";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh flex flex-col">
      <AuthBootstrap />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}
