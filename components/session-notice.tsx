const MESSAGES: Record<string, string> = {
  expired:
    "Your session has ended — please log in again.",
  customer:
    "You're logged in as a customer. Sign in as a venue manager to continue — this will switch your active session.",
  venue_manager:
    "You're logged in as a venue manager. Sign in as a customer to continue — this will switch your active session.",
};

export function SessionNotice({ notice }: { notice?: string }) {
  if (!notice) return null;
  const message = MESSAGES[notice];
  if (!message) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      {message}
    </div>
  );
}
