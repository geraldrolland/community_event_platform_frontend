"use client";

import { Building2, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, EmptyState, Input, Skeleton } from "@/components/ui";
import { RequireRole } from "@/components/guards";
import { ApiError, api } from "@/lib/api";
import { formatPrice, imageUrl } from "@/lib/format";
import type { Venue } from "@/lib/types";

function VenueCard({ venue, index }: { venue: Venue; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/60"
    >
      <Link href={`/venues/${venue.id}`} className="block">
        <div className="relative h-44 overflow-hidden">
          <img
            src={imageUrl(venue.images[0])}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <Badge value={venue.status} />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
            <p className="text-sm font-semibold text-white">{venue.venue_type}</p>
          </div>
        </div>
        <div className="p-4">
          <h3 className="truncate font-bold text-slate-900 dark:text-white">{venue.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {venue.city}, {venue.state}
          </p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Users className="size-4" /> up to {venue.capacity}
            </span>
            <span className="font-bold text-violet-600 dark:text-violet-400">
              {formatPrice(venue.rental_price)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function VenuesContent() {
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.venue
      .all()
      .then(setVenues)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load venues."),
      );
  }, []);

  const filtered = useMemo(() => {
    if (!venues) return [];
    const q = query.trim().toLowerCase();
    if (!q) return venues;
    return venues.filter((v) =>
      [v.name, v.city, v.state, v.country, v.purpose, v.venue_type]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [venues, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Discover venues
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {venues ? `${venues.length} venues listed by the community` : "Loading venues…"}
          </p>
        </div>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, city, or type…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {!venues && !error && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-44" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {venues && filtered.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<Building2 className="size-10" />}
            title="No venues found"
            description={
              query ? "Try a different search." : "No venues have been listed yet."
            }
          />
        </div>
      )}

      {venues && filtered.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VenuesPage() {
  return (
    <RequireRole role="customer">
      <VenuesContent />
    </RequireRole>
  );
}
