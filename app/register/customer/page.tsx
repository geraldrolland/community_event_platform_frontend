import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Create a customer account" };

export default function CustomerRegisterPage() {
  return (
    <AuthShell
      eyebrow="Customers"
      title="Create a customer account"
      subtitle="Propose events, cast votes, and shape your community's calendar."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
            Customer login
          </Link>
          {" · "}
          <Link href="/register/venue-manager" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
            Manager sign-up
          </Link>
        </>
      }
    >
      <RegisterForm role="customer" />
    </AuthShell>
  );
}
