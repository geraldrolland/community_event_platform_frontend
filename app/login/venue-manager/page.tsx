import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { SessionNotice } from "@/components/session-notice";

export const metadata: Metadata = { title: "Venue manager login" };

export default async function ManagerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  return (
    <AuthShell
      eyebrow="Venue managers"
      title="Venue manager login"
      subtitle="Sign in to manage your venues and review event requests."
      footer={
        <>
          New to HappenHub?{" "}
          <Link href="/register/venue-manager" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
            Create a venue-manager account
          </Link>
          {" · "}
          <Link href="/login/customer" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
            Customer login
          </Link>
        </>
      }
    >
      <SessionNotice notice={notice} />
      <LoginForm role="venue_manager" />
    </AuthShell>
  );
}
