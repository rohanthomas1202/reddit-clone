"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FeedLayout } from "@/stores/feed-preferences.store";

// ============================================================
// SHIMMER
// ============================================================

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 rounded-md",
        className
      )}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent"
        animate={{ translateX: ["−100%", "200%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0.2,
        }}
      />
    </div>
  );
}

// ============================================================
// CARD SKELETON
// ============================================================

function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="flex">
        {/* Vote column */}
        <div className="w-10 flex-shrink-0 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-4 gap-2 px-1">
          <Shimmer className="w-6 h-6 rounded-full" />
          <Shimmer className="w-8 h-4" />
          <Shimmer className="w-6 h-6 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-3 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2">
            <Shimmer className="w-5 h-5 rounded-full" />
            <Shimmer className="w-24 h-3" />
            <Shimmer className="w-16 h-3" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Shimmer className="w-full h-5" />
            <Shimmer className="w-3/4 h-5" />
          </div>

          {/* Flair */}
          <Shimmer className="w-20 h-5 rounded-full" />

          {/* Thumbnail for some */}
          <Shimmer className="w-full h-48 rounded-lg" />

          {/* Actions */}
          <div className="flex items-center gap-4 pt-1">
            <Shimmer className="w-20 h-7 rounded-lg" />
            <Shimmer className="w-16 h-7 rounded-lg" />
            <Shimmer className="w-12 h-7 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPACT SKELETON
// ============================================================

function PostCompactSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-3">
      <div className="flex items-center gap-3">
        <Shimmer className="w-16 h-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Shimmer className="w-full h-4" />
          <div className="flex items-center gap-3">
            <Shimmer className="w-4 h-4 rounded-full" />
            <Shimmer className="w-20 h-3" />
            <Shimmer className="w-16 h-3" />
          </div>
        </div>
        <Shimmer className="w-12 h-8 flex-shrink-0 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================
// PROPS & COMPONENT
// ============================================================

interface FeedSkeletonProps {
  count?: number;
  layout?: FeedLayout;
  className?: string;
}

export function FeedSkeleton({
  count = 5,
  layout = "card",
  className,
}: FeedSkeletonProps) {
  const SkeletonItem =
    layout === "compact" ? PostCompactSkeleton : PostCardSkeleton;

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <SkeletonItem />
        </motion.div>
      ))}
    </div>
  );
}