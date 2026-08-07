import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Users } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { RoleCard } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Join HappenHub"
      title="Create your account"
      subtitle="Pick the account type that fits how you'll use the platform."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <RoleCard
          href="/register/customer"
          icon={<Users className="size-5" />}
          title="Customer account"
          body="Propose events you'd love to attend and vote on open ballots."
          cta="Sign up as customer"
        />
        <RoleCard
          href="/register/venue-manager"
          icon={<Building2 className="size-5" />}
          title="Venue manager account"
          body="List your venues, attract community proposals, and approve events."
          cta="Sign up as manager"
        />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
