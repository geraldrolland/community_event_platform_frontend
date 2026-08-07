"use client";

import { CheckCircle2, Clock3, FilePen, Trash2 } from "lucide-react";import { useEffect, useMemo, useState } from "react";
import { EventCard } from "@/components/event-card";
import { Button, EmptyState, FormError, Spinner } from "@/components/ui";
import { RequireRole } from "@/components/guards";
import { ApiError, api } from "@/lib/api";
import type { Event, Venue, Vote } from "@/lib/types";

type Tab = "upcoming" | "ballot" | "mine";

const tabs: { key: Tab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "ballot", label: "Open ballot" },
  { key: "mine", label: "My proposals" },
];

function EventsContent() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [upcoming, setUpcoming] = useState<Event[] | null>(null);
  const [pending, setPending] = useState<Event[] | null>(null);
  const [mine, setMine] = useState<Event[] | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [myVotes, setMyVotes] = useState<Vote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = () => {
    Promise.all([
      api.event.upcoming(),
      api.event.pending(),
      api.event.mine(),
      api.vote.mine(),
      api.venue.all().catch(() => [] as Venue[]),
    ])
      .then(([up, pend, mineEvts, votes, vs]) => {
        setLoadError(null);
        setUpcoming(up);
        setPending(pend);
        setMine(mineEvts);
        setMyVotes(votes);
        setVenues(vs);
      })
      .catch((err) =>
        setLoadError(err instanceof ApiError ? err.message : "Failed to load events."),
      );
  };

  useEffect(() => {
    load();
  }, []);

  const venueName = useMemo(() => {
    const map = new Map(venues.map((v) => [v.id, v.name]));
    return (id: number) => map.get(id) ?? `Venue #${id}`;
  }, [venues]);

  const votedEventIds = useMemo(() => new Set(myVotes.map((v) => v.event_id)), [myVotes]);

  const handleVoted = (eventId: number) => {
    setPending((prev) =>
      prev
        ? prev.map((e) =>
            e.id === eventId ? { ...e, vote_count: e.vote_count + 1 } : e,
          )
        : prev,
    );
    setMine((prev) =>
      prev
        ? prev.map((e) =>
            e.id === eventId ? { ...e, vote_count: e.vote_count + 1 } : e,
          )
        : prev,
    );
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm("Delete this proposal? This cannot be undone.")) return;
    setError(null);
    try {
      await api.event.remove(eventId);
      setMine((prev) => (prev ? prev.filter((e) => e.id !== eventId) : prev));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete event.");
    }
  };

  const tabContent: Record<Tab, React.ReactNode> = {
    upcoming:
      upcoming === null ? (
        <Spinner />
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="size-10" />}
          title="No upcoming events yet"
          description="Approved events will show up here once venue managers say yes."
        />
      ) : (
        <div className="space-y-4">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} venueName={venueName(e.target_venue_id)} />
          ))}
        </div>
      ),
    ballot:
      pending === null ? (
        <Spinner />
      ) : pending.length === 0 ? (
        <EmptyState
          icon={<Clock3 className="size-10" />}
          title="No open ballots"
          description="Community proposals awaiting votes will appear here."
        />
      ) : (
        <div className="space-y-4">
          {pending.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              venueName={venueName(e.target_venue_id)}
              voted={votedEventIds.has(e.id)}
              onVoted={handleVoted}
            />
          ))}
        </div>
      ),
    mine:
      mine === null ? (
        <Spinner />
      ) : mine.length === 0 ? (
        <EmptyState
          icon={<FilePen className="size-10" />}
          title="You haven't proposed anything yet"
          description="Pick a venue and pitch your first event idea."
        />
      ) : (
        <div className="space-y-4">
          {mine.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              venueName={venueName(e.target_venue_id)}
            >
              {e.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button variant="danger" size="sm" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              )}
            </EventCard>
          ))}
        </div>
      ),
  };

  const isLoading = upcoming === null && pending === null && mine === null;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Events
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            See what&apos;s coming, vote on ballots, and track your proposals.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-white text-violet-700 shadow-sm dark:bg-slate-700 dark:text-violet-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <FormError message={error} />
      {loadError && (
        <div className="mt-4">
          <FormError message={loadError} />
        </div>
      )}

      <div className="mt-6">{isLoading ? <Spinner /> : tabContent[tab]}</div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <RequireRole role="customer">
      <EventsContent />
    </RequireRole>
  );
}
