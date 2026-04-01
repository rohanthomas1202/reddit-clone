import type { Metadata } from "next";
import { Suspense } from "react";
import { NotificationList } from "@/components/notifications/notification-list";

export const metadata: Metadata = {
  title: "Notifications | Threadscape",
  description: "Your Threadscape notifications",
};

function NotificationsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 flex items-start gap-3 animate-pulse"
        >
          <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
          </div>
          <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationList />
    </Suspense>
  );
}