"use client";

import { CalendarClock, Check, ClipboardList, X } from "lucide-react";
import { useEffect, useState } from "react";
import { EventCard } from "@/components/event-card";
import {
  Badge,
  Button,
  EmptyState,
  FormError,
  Select,
  Spinner,
} from "@/components/ui";
import { RequireRole } from "@/components/guards";
import { ApiError, api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Event, Venue } from "@/lib/types";

type StatusTab = "pending" | "approved" | "rejected";

const statusTabs: StatusTab[] = ["pending", "approved", "rejected"];

function ReviewContent() {
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [venueId, setVenueId] = useState<string>("");
  const [status, setStatus] = useState<StatusTab>("pending");
  const [events, setEvents] = useState<Event[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.venue
      .mine()
      .then((vs) => {
        if (cancelled) return;
        setVenues(vs);
        if (vs.length > 0) setVenueId(String(vs[0].id));
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(err instanceof ApiError ? err.message : "Failed to load venues.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!venueId) return;
    let cancelled = false;
    api.event
      .byStatus(Number(venueId), status)
      .then((list) => {
        if (!cancelled) {
          setLoadError(null);
          setEvents(list);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(err instanceof ApiError ? err.message : "Failed to load events.");
      });
    return () => {
      cancelled = true;
    };
  }, [venueId, status]);

  const handleDecide = async (eventId: number, decision: "approved" | "rejected") => {
    setActionError(null);
    try {
      await api.event.setStatus(eventId, decision);
      setEvents((prev) => (prev ? prev.filter((e) => e.id !== eventId) : prev));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Action failed.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Event requests
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Review proposals for your venues — approve the ones worth hosting.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:w-72">
          <Select value={venueId} onChange={(e) => setVenueId(e.target.value)}>
            {!venues && <option>Loading venues…</option>}
            {venues?.length === 0 && <option>No venues yet</option>}
            {venues?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {statusTabs.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                status === s
                  ? "bg-white text-violet-700 shadow-sm dark:bg-slate-700 dark:text-violet-300"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <FormError message={actionError} />
      {loadError && <FormError message={loadError} />}

      <div className="mt-6">
        {!venues && <Spinner />}
        {venues && venues.length === 0 && (
          <EmptyState
            icon={<ClipboardList className="size-10" />}
            title="Add a venue first"
            description="You'll review event requests here once a venue is listed."
          />
        )}
        {venues && venues.length > 0 && !events && <Spinner />}
        {events && events.length === 0 && (
          <EmptyState
            icon={<CalendarClock className="size-10" />}
            title={`No ${status} requests`}
            description="Nothing here right now — new proposals will appear as they come in."
          />
        )}
        {events && events.length > 0 && (
          <div className="space-y-4">
            {events.map((e) => (
              <EventCard key={e.id} event={e}>
                {status === "pending" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDecide(e.id, "approved")}
                      >
                        <Check className="size-4" /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDecide(e.id, "rejected")}
                      >
                        <X className="size-4" /> Reject
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Requested {formatDateTime(e.created_at)} by customer #{e.customer_id}
                    </p>
                  </div>
                ) : (
                  <Badge value={e.status} />
                )}
              </EventCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <RequireRole role="venue_manager">
      <ReviewContent />
    </RequireRole>
  );
}
