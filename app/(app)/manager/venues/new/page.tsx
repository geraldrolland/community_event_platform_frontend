import type { Metadata } from "next";
import { VenueForm } from "@/components/venue-form";
import { RequireRole } from "@/components/guards";

export const metadata: Metadata = { title: "List a new venue" };

export default function NewVenuePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        List a new venue
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Complete details below — customers can start proposing events as soon as
        it&apos;s live.
      </p>
      <div className="mt-6">
        <RequireRole role="venue_manager">
          <VenueForm mode="create" />
        </RequireRole>
      </div>
    </div>
  );
}
