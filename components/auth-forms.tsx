"use client";

import { Building2, MailCheck, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Button,
  Field,
  FormError,
  Input,
  PasswordInput,
} from "@/components/ui";
import { ApiError } from "@/lib/api";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/lib/types";

const roleMeta: Record<Role, { label: string; endpoint: string }> = {
  customer: { label: "customer", endpoint: "customer" },
  venue_manager: { label: "venue manager", endpoint: "venue-manager" },
};

export function LoginForm({ role }: { role: Role }) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingVerify, setPendingVerify] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingVerify(false);
    setSubmitting(true);
    try {
      await login(role, { email, password });
      router.replace(ROLE_HOME[role]);
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 403
          ? "Your email isn't verified yet. We've re-sent the verification link."
          : err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.";
      setError(message);
      if (err instanceof ApiError && err.status === 403) setPendingVerify(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email address">
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Password">
        <PasswordInput
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      {pendingVerify && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <p className="flex items-center gap-2 font-semibold">
            <MailCheck className="size-4" /> Check your inbox
          </p>
          <p className="mt-1">
            Open the verification link we emailed you, then log in again.
          </p>
        </div>
      )}
      <FormError message={error} />

      <Button type="submit" loading={submitting} className="w-full" size="lg">
        Log in as {roleMeta[role].label}
      </Button>
    </form>
  );
}

export function RegisterForm({ role }: { role: Role }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await register(role, {
        first_name: form.first_name,
        middle_name: form.middle_name || null,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <MailCheck className="size-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          Check your email
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          We sent a verification link to{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {form.email}
          </span>
          . Click it to activate your {roleMeta[role].label} account, then log in.
        </p>
        <Link
          href={role === "customer" ? "/login" : "/login/venue-manager"}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
        >
          Go to {roleMeta[role].label} login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name">
          <Input required placeholder="Ada" value={form.first_name} onChange={set("first_name")} />
        </Field>
        <Field label="Last name">
          <Input required placeholder="Okafor" value={form.last_name} onChange={set("last_name")} />
        </Field>
      </div>
      <Field label="Middle name" hint="optional">
        <Input placeholder="Ngozi" value={form.middle_name} onChange={set("middle_name")} />
      </Field>
      <Field label="Email address">
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password">
          <PasswordInput
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
          />
        </Field>
        <Field label="Confirm password">
          <PasswordInput
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.confirm_password}
            onChange={set("confirm_password")}
          />
        </Field>
      </div>

      <FormError message={error} />

      <Button type="submit" loading={submitting} className="w-full" size="lg">
        Create {roleMeta[role].label} account
      </Button>
    </form>
  );
}

export function RoleCard({
  href,
  icon,
  title,
  body,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-violet-500/50"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
        {icon}
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">{body}</p>
      <span className="mt-4 text-sm font-semibold text-violet-600 transition-colors group-hover:text-violet-500 dark:text-violet-400">
        {cta} →
      </span>
    </Link>
  );
}

export const roleCards = {
  login: {
    icon: <Users className="size-5" />,
    title: "Customer login",
    body: "Browse venues, propose events, and vote on open ballots.",
    cta: "Continue",
  },
  register: {
    icon: <Building2 className="size-5" />,
    title: "Venue manager login",
    body: "Manage your venues and approve or reject event requests.",
    cta: "Continue",
  },
} as const;
