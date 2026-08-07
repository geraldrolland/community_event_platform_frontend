import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Users } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { RoleCard } from "@/components/auth-forms";
import { SessionNotice } from "@/components/session-notice";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to HappenHub"
      subtitle="Choose the account type you want to sign in with."
    >
      <SessionNotice notice={notice} />
      <div className="grid gap-4 sm:grid-cols-2">
        <RoleCard
          href="/login/customer"
          icon={<Users className="size-5" />}
          title="Customer"
          body="Browse venues, propose events, and vote on open ballots."
          cta="Customer login"
        />
        <RoleCard
          href="/login/venue-manager"
          icon={<Building2 className="size-5" />}
          title="Venue manager"
          body="Manage your venues and approve or reject event requests."
          cta="Manager login"
        />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        New here?{" "}
        <Link href="/register" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
