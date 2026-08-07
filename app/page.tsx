"use client";

import {
  ArrowRight,
  Building2,
  CalendarHeart,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Users,
  Vote,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion, useInView, animate } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

function HeroBlob({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      animate={{ x: [0, 46, -34, 0], y: [0, -38, 30, 0], scale: [1, 1.1, 0.95, 1] }}
      transition={{ duration: 18, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function BallotRow({
  title,
  votes,
  max,
}: {
  title: string;
  votes: number;
  max: number;
}) {
  const pct = Math.round((votes / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-200">{title}</span>
        <span className="font-bold text-violet-600 dark:text-violet-400">{votes}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#312e81_0%,#1e1b4b_45%,#0b1020_100%)] pb-24 pt-20 text-white sm:pt-28">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <HeroBlob className="-left-20 top-10 size-96 bg-violet-600/40" />
        <HeroBlob className="right-0 top-24 size-[26rem] bg-fuchsia-600/30" delay={6} />
        <HeroBlob className="bottom-0 left-1/3 size-80 bg-sky-500/25" delay={12} />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-violet-100 backdrop-blur"
            >
              <Sparkles className="size-3.5" />
              Community-powered events, decided by you
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
            >
              Discover venues.
              <br />
              Propose events.{" "}
              <span className="text-gradient">Vote what happens next.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-base text-violet-100/80 sm:text-lg"
            >
              HappenHub connects customers who have ideas with venue managers who
              make them happen. Pitch an event, cast your vote, and watch the best
              ideas come to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-6 text-base font-semibold text-white shadow-lg shadow-violet-600/40 transition-all hover:bg-violet-500"
              >
                Get started free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Log in
              </Link>
            </motion.div>
          </div>

          {/* Floating ballot preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mx-auto mt-16 max-w-md"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl border border-white/15 bg-white/95 p-5 shadow-2xl shadow-violet-950/50 backdrop-blur dark:bg-slate-900/95"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400">
                    Open ballot
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    This week&apos;s proposals
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>
              <div className="space-y-4">
                <BallotRow title="Community Art &amp; Craft Fair" votes={128} max={160} />
                <BallotRow title="Open-Mic Poetry Night" votes={96} max={160} />
                <BallotRow title="Weekend Farmers Market" votes={142} max={160} />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3 dark:bg-violet-500/10">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Users className="size-4 text-violet-500" />
                  Proposed for Maple Hall
                </div>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  1,204 voters
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8 text-center"
          >
            {[
              { value: <CountUp to={120} />, label: "Curated venues" },
              { value: <CountUp to={1800} />, label: "Community votes" },
              { value: <CountUp to={240} />, label: "Events proposed" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-violet-200/70">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Everything a thriving community needs
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            One platform for ideas, venues, votes, and decisions — built around
            real people on both sides.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Lightbulb className="size-5" />,
              title: "Propose an event",
              body: "Have an idea? Pitch it with a venue and a date in under a minute.",
              accent: "from-amber-400 to-orange-500",
            },
            {
              icon: <Vote className="size-5" />,
              title: "Vote on proposals",
              body: "Back the events you want to attend. One person, one vote.",
              accent: "from-violet-500 to-fuchsia-500",
            },
            {
              icon: <Building2 className="size-5" />,
              title: "Discover venues",
              body: "Browse a curated catalog with photos, amenities, capacity, and pricing.",
              accent: "from-sky-400 to-blue-500",
            },
            {
              icon: <ShieldCheck className="size-5" />,
              title: "Moderate requests",
              body: "Venue managers review proposals and approve the ones that fit.",
              accent: "from-emerald-400 to-teal-500",
            },
            {
              icon: <Zap className="size-5" />,
              title: "Vote counts that matter",
              body: "Approved events carry their community support with them.",
              accent: "from-rose-400 to-pink-500",
            },
            {
              icon: <CalendarHeart className="size-5" />,
              title: "Everything on your calendar",
              body: "Upcoming events, your proposals, and your votes in one dashboard.",
              accent: "from-indigo-400 to-violet-500",
            },
          ].map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/60"
              >
                <span
                  className={`inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${feature.accent}`}
                >
                  {feature.icon}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {feature.body}
                </p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              From idea to event in three steps
            </h2>
          </FadeIn>

          <div className="relative mt-14 grid gap-10 md:grid-cols-3">
            <div
              aria-hidden
              className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-slate-300 md:block dark:border-slate-700"
            />
            {[
              {
                step: "01",
                title: "Join the community",
                body: "Create a customer account or a venue-manager account — each with its own dashboard.",
              },
              {
                step: "02",
                title: "Propose and vote",
                body: "Pitch an event for a real venue, then rally votes while the ballot is open.",
              },
              {
                step: "03",
                title: "Managers decide",
                body: "Venue managers review the demand and approve the events worth hosting.",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.12} className="relative text-center">
                <div className="relative z-10 mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-600 text-xl font-extrabold text-white shadow-lg shadow-violet-600/40">
                  {item.step}
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.body}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Role split */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Two sides, one platform
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Choose how you&apos;ll make things happen
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <FadeIn>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
                <Users className="size-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                For customers
              </h3>
              <ul className="mt-4 flex-1 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                {[
                  "Browse every venue in the community catalog",
                  "Propose events you'd love to attend",
                  "Vote on open ballots and shape the calendar",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm shadow-sky-600/30 transition-colors hover:bg-sky-500"
              >
                Create a customer account
              </Link>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                <Building2 className="size-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                For venue managers
              </h3>
              <ul className="mt-4 flex-1 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                {[
                  "List your venue with photos, amenities, and pricing",
                  "See community demand before you commit",
                  "Approve or reject event requests in one click",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register/venue-manager"
                className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-sm shadow-violet-600/30 transition-colors hover:bg-violet-500"
              >
                Create a venue-manager account
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <FadeIn className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-fuchsia-600 to-violet-700 px-6 py-16 text-center text-white sm:px-16">
            <HeroBlob className="-left-16 -top-16 size-64 bg-white/15" />
            <HeroBlob className="-bottom-20 -right-10 size-72 bg-sky-300/20" delay={8} />
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to make something happen?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-violet-100/90">
                Join HappenHub today — propose your first event, or open your
                venue to a community that votes with real enthusiasm.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-base font-bold text-violet-700 shadow-lg transition-transform hover:scale-[1.03]"
                >
                  Get started free
                </Link>
                <Link
                  href="/venues"
                  className="inline-flex h-12 items-center rounded-xl border border-white/30 bg-white/10 px-6 text-base font-semibold backdrop-blur transition-colors hover:bg-white/20"
                >
                  Browse venues
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
