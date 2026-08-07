import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { RequireAuth } from "@/components/guards";
import { Navbar } from "@/components/navbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Navbar variant="app" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <Footer />
    </RequireAuth>
  );
}
