"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui";
import { RequireRole } from "@/components/guards";
import { VenueForm } from "@/components/venue-form";
import { ApiError, api } from "@/lib/api";
import type { Venue } from "@/lib/types";

function EditVenueContent() {
  const params = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.venue
      .getMine(Number(params.id))
      .then(setVenue)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load venue."),
      );
  }, [params.id]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Edit venue
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Update the details below — customers see changes immediately.
      </p>
      <div className="mt-6">
        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}
        {!venue && !error && <Skeleton className="h-96" />}
        {venue && <VenueForm mode="edit" initial={venue} />}
      </div>
    </div>
  );
}

export function EditVenue() {
  return (
    <RequireRole role="venue_manager">
      <EditVenueContent />
    </RequireRole>
  );
}
