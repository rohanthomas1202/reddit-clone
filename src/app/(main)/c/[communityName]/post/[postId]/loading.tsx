import { CommentSkeleton } from "@/components/comment/comment-skeleton";
import { cn } from "@/lib/utils";

// ============================================================
// SHIMMER UTILITY
// ============================================================

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 rounded-lg",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
    </div>
  );
}

// ============================================================
// POST LOADING SKELETON
// ============================================================

function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-4 space-y-3">
      {/* Meta */}
      <div className="flex items-center gap-2">
        <Shimmer className="w-5 h-5 rounded-full" />
        <Shimmer className="w-28 h-3 rounded" />
        <Shimmer className="w-20 h-3 rounded" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Shimmer className="w-full h-5 rounded" />
        <Shimmer className="w-3/4 h-5 rounded" />
      </div>

      {/* Content */}
      <div className="space-y-1.5 pt-1">
        <Shimmer className="w-full h-3.5 rounded" />
        <Shimmer className="w-full h-3.5 rounded" />
        <Shimmer className="w-5/6 h-3.5 rounded" />
        <Shimmer className="w-4/5 h-3.5 rounded" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <Shimmer className="w-16 h-4 rounded" />
        <Shimmer className="w-24 h-4 rounded" />
      </div>
    </div>
  );
}

// ============================================================
// BACK LINK SKELETON
// ============================================================

function BackLinkSkeleton() {
  return <Shimmer className="w-36 h-4 rounded mb-4" />;
}

// ============================================================
// LOADING PAGE
// ============================================================

export default function PostPageLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <BackLinkSkeleton />
        <div className="mb-6">
          <PostSkeleton />
        </div>
        {/* Sort bar skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <Shimmer className="w-16 h-4 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Shimmer key={i} className="w-14 h-7 rounded-lg" />
            ))}
          </div>
        </div>
        <CommentSkeleton count={5} />
      </div>
    </div>
  );
}