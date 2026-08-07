"use client";

import { CalendarHeart } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-10 text-white md:block">
          <div className="bg-grid absolute inset-0" aria-hidden />
          <motion.div
            aria-hidden
            className="absolute -left-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl"
            animate={{ x: [0, 20, 0], y: [0, 14, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-12 -right-8 size-56 rounded-full bg-sky-300/20 blur-2xl"
            animate={{ x: [0, -18, 0], y: [0, -12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex h-full flex-col justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <CalendarHeart className="size-5" />
              </span>
              <span className="text-lg font-bold">HappenHub</span>
            </Link>
            <div>
              <h2 className="text-2xl font-bold leading-snug">
                Where community ideas become real events.
              </h2>
              <p className="mt-3 text-sm text-violet-100/85">
                Propose, vote, and moderate — all on one platform built for
                customers and venue managers alike.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-violet-100/90">
                <li>• Curated venues with real photos and pricing</li>
                <li>• Transparent, community-driven ballots</li>
                <li>• Fast approvals from venue managers</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
