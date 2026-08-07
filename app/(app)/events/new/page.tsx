"use client";

import { CalendarPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Field,
  FormError,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { RequireRole } from "@/components/guards";
import { ApiError, api } from "@/lib/api";
import type { Venue } from "@/lib/types";

function NewEventForm() {
  const searchParams = useSearchParams();
  const presetVenue = searchParams.get("venue");
  const router = useRouter();

  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    proposed_date: "",
    target_venue_id: presetVenue ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.venue
      .all()
      .then(setVenues)
      .catch(() => setVenues([]));
  }, []);

  const validVenues = useMemo(
    () => (venues ?? []).filter((v) => v.status === "available"),
    [venues],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.event.create({
        title: form.title,
        description: form.description || null,
        proposed_date: new Date(form.proposed_date).toISOString(),
        target_venue_id: Number(form.target_venue_id),
      });
      router.replace("/events?tab=mine");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not propose event.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Propose an event
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Pitch an idea for a venue. If the community votes for it, the venue
        manager can approve it.
      </p>

      <Card className="mt-6 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Event title">
            <Input
              required
              placeholder="e.g. Community Art & Craft Fair"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>

          <Field label="Description" hint="optional">
            <Textarea
              placeholder="What's the event about? Who is it for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <Field label="Proposed date & time">
            <Input
              required
              type="datetime-local"
              value={form.proposed_date}
              onChange={(e) => setForm({ ...form, proposed_date: e.target.value })}
            />
          </Field>

          <Field label="Target venue">
            {venues === null ? (
              <Input disabled placeholder="Loading venues…" />
            ) : validVenues.length === 0 ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                No venues available right now. Check back later.
              </p>
            ) : (
              <Select
                required
                value={form.target_venue_id}
                onChange={(e) =>
                  setForm({ ...form, target_venue_id: e.target.value })
                }
              >
                <option value="" disabled>
                  Select a venue…
                </option>
                {validVenues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.city} ({v.venue_type})
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <FormError message={error} />

          <Button
            type="submit"
            size="lg"
            loading={submitting}
            disabled={!form.target_venue_id || !form.proposed_date}
            className="w-full"
          >
            <CalendarPlus className="size-5" /> Submit proposal
          </Button>
        </form>
      </Card>
    </div>
  );
}

function NewEventPageInner() {
  return <NewEventForm />;
}

export default function NewEventPage() {
  return (
    <RequireRole role="customer">
      <Suspense fallback={null}>
        <NewEventPageInner />
      </Suspense>
    </RequireRole>
  );
}
