"use client";

import { Building2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  FormError,
  Input,
  Modal,
  Skeleton,
} from "@/components/ui";
import { RequireRole } from "@/components/guards";
import { ApiError, api } from "@/lib/api";
import { formatPrice, imageUrl } from "@/lib/format";
import type { Venue } from "@/lib/types";

function ManagerVenuesContent() {
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Venue | null>(null);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    api.venue
      .mine()
      .then(setVenues)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load venues."),
      );
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null);
    setConfirmText("");
  }, []);

  const performDelete = async (venue: Venue) => {
    setDeleting(venue.id);
    setError(null);
    try {
      await api.venue.remove(venue.id);
      setVenues((prev) => (prev ? prev.filter((v) => v.id !== venue.id) : prev));
      closeDeleteModal();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete venue.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My venues
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {venues ? `${venues.length} venues listed` : "Loading venues…"}
          </p>
        </div>
        <Link href="/manager/venues/new">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="size-5" /> Add venue
          </Button>
        </Link>
      </div>

      <FormError message={error} />

      {!venues && !error && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      )}

      {venues && venues.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<Building2 className="size-10" />}
            title="No venues yet"
            description="List your first venue and start receiving community event proposals."
            action={
              <Link href="/manager/venues/new">
                <Button>
                  <Plus className="size-4" /> Add your first venue
                </Button>
              </Link>
            }
          />
        </div>
      )}

      {venues && venues.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {venues.map((venue, i) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.3) }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
            >
              <Link href={`/manager/venues/${venue.id}/edit`}>
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={imageUrl(venue.images[0])}
                    alt={venue.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3">
                    <Badge value={venue.status} />
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/manager/venues/${venue.id}/edit`}>
                  <h3 className="font-bold text-slate-900 hover:text-violet-600 dark:text-white dark:hover:text-violet-400">
                    {venue.name}
                  </h3>
                </Link>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {venue.venue_type} · {venue.city}, {venue.state}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Users className="size-4" /> {venue.capacity} guests
                  </span>
                  <span className="font-bold text-violet-600 dark:text-violet-400">
                    {formatPrice(venue.rental_price)}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/manager/venues/${venue.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="size-3.5" /> Edit
                    </Button>
                  </Link>
                  {venue.status === "closed" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setConfirmText("");
                        setDeleteTarget(venue);
                      }}
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={deleteTarget !== null}
        onClose={closeDeleteModal}
        title="Delete venue"
        footer={
          <>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleting === deleteTarget?.id}
              disabled={
                !deleteTarget || confirmText.trim() !== deleteTarget.name
              }
              onClick={() => deleteTarget && performDelete(deleteTarget)}
            >
              <Trash2 className="size-4" /> Proceed
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <>
            <p>
              Deleting{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {deleteTarget.name}
              </span>{" "}
              also removes its events and votes. Type the venue name to
              confirm.
            </p>
            <Input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deleteTarget.name}
              className="mt-4"
            />
          </>
        )}
      </Modal>
    </div>
  );
}

export default function ManagerVenuesPage() {
  return (
    <RequireRole role="venue_manager">
      <ManagerVenuesContent />
    </RequireRole>
  );
}
