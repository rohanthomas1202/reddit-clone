import { CommunityHeaderSkeleton } from "@/components/community/community-header";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 rounded-lg", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
    </div>
  );
}

export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      {/* Header Skeleton */}
      <CommunityHeaderSkeleton />

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-16">
        <div className="flex gap-6">
          {/* Feed Skeleton */}
          <div className="flex-1 min-w-0">
            {/* Sort bar skeleton */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <Shimmer key={i} className="h-9 w-20 rounded-lg" />
              ))}
            </div>
            <FeedSkeleton count={4} />
          </div>

          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <Shimmer className="h-24 rounded-none" />
              <div className="p-4 space-y-3">
                <Shimmer className="h-4 w-3/4" />
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-2/3" />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Shimmer className="h-16 rounded-xl" />
                  <Shimmer className="h-16 rounded-xl" />
                </div>
                <Shimmer className="h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
              <Shimmer className="h-5 w-24" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Shimmer className="h-4 w-4 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Shimmer className="h-3 w-3/4" />
                    <Shimmer className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}