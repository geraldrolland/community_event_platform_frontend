"use client";

import { CalendarHeart, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Spinner } from "@/components/ui";
import { ApiError, api } from "@/lib/api";

type State =
  | { phase: "loading" }
  | { phase: "success"; message: string }
  | { phase: "error"; message: string };

function VerifyEmailContent() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      Promise.resolve().then(() =>
        setState({ phase: "error", message: "No verification token found in the link." }),
      );
      return;
    }
    api.auth
      .verifyEmail(token)
      .then((res) => setState({ phase: "success", message: res.message }))
      .catch((err) =>
        setState({
          phase: "error",
          message:
            err instanceof ApiError ? err.message : "Could not verify your email.",
        }),
      );
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
        {state.phase === "loading" && (
          <>
            <Spinner label="Verifying your email…" />
            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CalendarHeart className="size-4 text-violet-500" /> HappenHub
            </p>
          </>
        )}
        {state.phase === "success" && (
          <>
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CheckCircle2 className="size-7" />
            </span>
            <h1 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-white">
              Email verified!
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {state.message} You can now log in to your account.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              Go to login
            </Link>
          </>
        )}
        {state.phase === "error" && (
          <>
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
              <XCircle className="size-7" />
            </span>
            <h1 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-white">
              Verification failed
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{state.message}</p>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              Hint: verification links expire quickly — try logging in to receive a
              fresh link.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
