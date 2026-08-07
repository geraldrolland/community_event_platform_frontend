"use client";

import { ThumbsUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, EmptyState, FormError, Spinner } from "@/components/ui";
import { RequireRole } from "@/components/guards";
import { ApiError, api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Vote } from "@/lib/types";

function VotesContent() {
  const [votes, setVotes] = useState<Vote[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    api.vote
      .mine()
      .then(setVotes)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load votes."),
      );
  }, []);

  const handleRemove = async (voteId: number) => {
    setActionError(null);
    try {
      await api.vote.remove(voteId);
      setVotes((prev) => (prev ? prev.filter((v) => v.id !== voteId) : prev));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not remove vote.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        My votes
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Every vote you&apos;ve cast on open ballots. You can remove a vote while
        the ballot is still open.
      </p>

      <FormError message={actionError} />
      {error && <FormError message={error} />}

      <div className="mt-6">
        {votes === null ? (
          <Spinner />
        ) : votes.length === 0 ? (
          <EmptyState
            icon={<ThumbsUp className="size-10" />}
            title="No votes yet"
            description="Head to the open ballot and back an event you'd love to attend."
          />
        ) : (
          <div className="space-y-4">
            {votes.map((vote) => (
              <div
                key={vote.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-slate-900 dark:text-white">
                      {vote.event_title}
                    </h3>
                    <Badge value={vote.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Cast {formatDateTime(vote.created_at)}
                  </p>
                </div>
                {vote.status === "ballot_open" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemove(vote.id)}
                  >
                    <Trash2 className="size-4" /> Remove vote
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VotesPage() {
  return (
    <RequireRole role="customer">
      <VotesContent />
    </RequireRole>
  );
}
