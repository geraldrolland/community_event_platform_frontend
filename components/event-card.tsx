"use client";

import { CalendarDays, MapPin, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Badge } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Event } from "@/lib/types";

export function VoteButton({
  eventId,
  initialVoted,
  onVoted,
}: {
  eventId: number;
  initialVoted: boolean;
  onVoted?: (eventId: number) => void;
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cast = async () => {
    if (voted || pending) return;
    setPending(true);
    setError(null);
    try {
      await api.vote.cast(eventId);
      setVoted(true);
      onVoted?.(eventId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cast vote.");
      if (err instanceof ApiError && err.status === 400) setVoted(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={cast}
        disabled={voted || pending}
        className={`inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-bold transition-colors ${
          voted
            ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
            : "border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
        } disabled:pointer-events-none`}
      >
        <motion.span
          animate={voted ? { scale: [1, 1.35, 1] } : {}}
          transition={{ duration: 0.35 }}
        >
          <ThumbsUp className="size-4" />
        </motion.span>
        {voted ? "Voted" : pending ? "Casting…" : "Vote"}
      </motion.button>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

export function EventCard({
  event,
  venueName,
  voted,
  onVoted,
  children,
}: {
  event: Event;
  venueName?: string;
  voted?: boolean;
  onVoted?: (eventId: number) => void;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 sm:flex-row sm:items-center"
    >
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-600/30">
        <CalendarDays className="size-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-bold text-slate-900 dark:text-white">
            {event.title}
          </h3>
          <Badge value={event.status} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDateTime(event.proposed_date)}
          </span>
          {venueName && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {venueName}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 font-semibold text-violet-600 dark:text-violet-400">
            <ThumbsUp className="size-3.5" />
            {event.vote_count} {event.vote_count === 1 ? "vote" : "votes"}
          </span>
        </p>
        {event.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {event.description}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {children ??
          (event.status === "pending" && voted !== undefined && (
            <VoteButton
              eventId={event.id}
              initialVoted={voted}
              onVoted={onVoted}
            />
          ))}
      </div>
    </motion.div>
  );
}
