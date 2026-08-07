"use client";

import { CalendarHeart, LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { initials } from "@/lib/format";
import { ROLE_HOME } from "@/lib/constants";

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-600/40">
        <CalendarHeart className="size-5" />
      </span>
      <span
        className={`text-lg font-bold tracking-tight ${
          dark ? "text-white" : "text-slate-900 dark:text-white"
        }`}
      >
        HappenHub
      </span>
    </Link>
  );
}

const customerLinks = [
  { href: "/venues", label: "Venues" },
  { href: "/events", label: "Events" },
  { href: "/votes", label: "My Votes" },
  { href: "/events/new", label: "Propose Event" },
];

const managerLinks = [
  { href: "/manager/venues", label: "My Venues" },
  { href: "/manager/events", label: "Event Requests" },
];

export function Navbar({ variant = "public" }: { variant?: "public" | "app" }) {
  const { user, status, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const dark = variant === "public";
  const links = user?.role === "customer" ? customerLinks : managerLinks;

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.replace("/");
  };

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href
        ? dark
          ? "text-white"
          : "text-violet-700 dark:text-violet-300"
        : dark
          ? "text-violet-100/80 hover:text-white"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    }`;

  return (
    <header
      className={`sticky top-0 z-40 w-full ${
        dark
          ? "bg-transparent"
          : "border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo dark={dark} />

        {status === "authenticated" && user ? (
          <>
            <nav className="hidden items-center gap-6 md:flex">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/profile" className={linkClass("/profile")}>
                <span className="flex items-center gap-2">
                  <span
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                      dark
                        ? "bg-white/15 text-white"
                        : "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                    }`}
                  >
                    {initials(user)}
                  </span>
                  <span className="sr-only">Profile</span>
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className={linkClass("logout")}
                aria-label="Log out"
              >
                <LogOut className="size-4" />
              </button>
            </nav>
            <button
              className={`md:hidden ${dark ? "text-white" : "text-slate-700 dark:text-white"}`}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`hidden text-sm font-medium transition-colors sm:block ${
                dark ? "text-violet-100/80 hover:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
              }`}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-600/30 transition-colors hover:bg-violet-500"
            >
              Get started
            </Link>
          </div>
        )}
      </div>

      {open && status === "authenticated" && user && (
        <div
          className={`border-t px-4 pb-4 pt-2 md:hidden ${
            dark
              ? "border-white/10 bg-slate-900/95"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              <User className="size-4" /> Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-left text-sm font-medium text-rose-600"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export function homePath(user: { role: string } | null): string {
  return user ? ROLE_HOME[user.role] : "/";
}
