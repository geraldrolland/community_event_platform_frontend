import { CalendarHeart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-violet-600 text-white">
            <CalendarHeart className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            HappenHub
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/venues" className="transition-colors hover:text-violet-600">
            Browse venues
          </Link>
          <Link href="/events" className="transition-colors hover:text-violet-600">
            Events
          </Link>
          <Link href="/login" className="transition-colors hover:text-violet-600">
            Customer login
          </Link>
          <Link
            href="/login/venue-manager"
            className="transition-colors hover:text-violet-600"
          >
            Venue manager login
          </Link>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} HappenHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
