import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { SessionNotice } from "@/components/session-notice";

export const metadata: Metadata = { title: "Customer login" };

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  return (
    <AuthShell
      eyebrow="Customers"
      title="Customer login"
      subtitle="Sign in to browse venues, propose events, and vote."
      footer={
        <>
          New to HappenHub?{" "}
          <Link href="/register" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
            Create a customer account
          </Link>
          {" · "}
          <Link href="/login/venue-manager" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
            Venue manager login
          </Link>
        </>
      }
    >
      <SessionNotice notice={notice} />
      <LoginForm role="customer" />
    </AuthShell>
  );
}
