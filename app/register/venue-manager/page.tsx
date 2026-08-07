import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Create a venue-manager account" };

export default function ManagerRegisterPage() {
  return (
    <AuthShell
      eyebrow="Venue managers"
      title="Create a venue-manager account"
      subtitle="List your venue and let the community bring you great events."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login/venue-manager" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
            Venue manager login
          </Link>
          {" · "}
          <Link href="/register/customer" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
            Customer sign-up
          </Link>
        </>
      }
    >
      <RegisterForm role="venue_manager" />
    </AuthShell>
  );
}
