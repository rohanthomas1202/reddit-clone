import type { Metadata } from "next";
import { Suspense } from "react";
import { ConversationList } from "@/components/messages/conversation-list";

export const metadata: Metadata = {
  title: "Messages | Threadscape",
  description: "Your Threadscape messages",
};

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 flex items-center gap-3 animate-pulse"
                >
                  <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                  </div>
                  <div className="h-3 w-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          }
        >
          <ConversationList />
        </Suspense>
      </div>
    </div>
  );
}