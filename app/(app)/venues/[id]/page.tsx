"use client";

import {
  Accessibility,
  ArrowLeft,
  Building2,
  CalendarPlus,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MoveVertical,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import { RequireRole } from "@/components/guards";
import { ApiError, api } from "@/lib/api";
import { formatDate, formatPrice, imageUrl } from "@/lib/format";
import type { Venue } from "@/lib/types";

function VenueDetailContent() {
  const params = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.venue
      .get(Number(params.id))
      .then(setVenue)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load venue."),
      );
  }, [params.id]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-rose-600 dark:text-rose-400">{error}</p>
        <Link
          href="/venues"
          className="text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400"
        >
          Back to venues
        </Link>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href="/venues"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-violet-600 dark:text-slate-400"
      >
        <ArrowLeft className="size-4" /> All venues
      </Link>

      {/* Gallery */}
      <div className="grid gap-3 lg:grid-cols-[1fr_120px]">
        <div className="relative h-80 overflow-hidden rounded-2xl sm:h-96">
          <img
            src={imageUrl(venue.images[activeImage])}
            alt={`${venue.name} — photo ${activeImage + 1}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge value={venue.status} className="shadow-sm" />
            <span className="inline-flex items-center rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
              {venue.venue_type}
            </span>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto lg:flex-col">
          {venue.images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveImage(i)}
              className={`h-20 w-24 shrink-0 overflow-hidden rounded-xl transition-all lg:w-full ${
                i === activeImage
                  ? "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900"
                  : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`Show photo ${i + 1}`}
            >
              <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {venue.name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="size-4" />
              {venue.address}, {venue.city}, {venue.state}, {venue.country}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
              {venue.purpose}
            </p>
          </div>

          {venue.description && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">About</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {venue.description}
              </p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {venue.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Accessibility className="size-4 text-violet-500" /> Accessibility
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${
                      venue.accessibility.wheel_chair_accessible
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />
                  Wheelchair accessible
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${
                      venue.accessibility.elevator ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  Elevator
                </li>
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <MoveVertical className="size-4 text-violet-500" /> Parking
              </h3>
              {venue.parking_availability.available ? (
                <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <li>Capacity: {venue.parking_availability.capacity} spaces</li>
                  <li>Price: {formatPrice(venue.parking_availability.price ?? 0)}</li>
                  <li>Hours: {venue.parking_availability.hours}</li>
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No on-site parking.
                </p>
              )}
            </Card>
          </div>

          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Clock className="size-5 text-violet-500" /> Operating hours
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {venue.operating_hours.days.join(" · ")} ·{" "}
              {venue.operating_hours.opening_time} – {venue.operating_hours.closing_time}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Rental price</span>
              <span className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">
                {formatPrice(venue.rental_price)}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Building2 className="size-4" /> Up to {venue.capacity} guests
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Listed {formatDate(venue.created_at)}
            </p>
            <Link href={`/events/new?venue=${venue.id}`} className="mt-5 block">
              <Button size="lg" className="w-full">
                <CalendarPlus className="size-5" /> Propose an event here
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <User className="size-4 text-violet-500" /> Contact
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="font-semibold text-slate-800 dark:text-slate-200">
                {venue.contact.name}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4" /> {venue.contact.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" /> {venue.contact.email}
              </li>
            </ul>
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                Visit website <ExternalLink className="size-3.5" />
              </a>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

export default function VenueDetailPage() {
  return (
    <RequireRole role="customer">
      <VenueDetailContent />
    </RequireRole>
  );
}
