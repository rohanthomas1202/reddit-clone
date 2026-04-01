"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Zap,
  TrendingUp,
  Clock,
  BarChart2,
  LayoutGrid,
  List,
  AlignJustify,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostSortMode } from "@/types/post";
import type { FeedType } from "@/types/feed";
import type { FeedLayout } from "@/stores/feed-preferences.store";
import { useFeedPreferencesStore } from "@/stores/feed-preferences.store";

// ============================================================
// SORT OPTIONS
// ============================================================

const SORT_OPTIONS: {
  value: PostSortMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor: string;
  description: string;
}[] = [
  {
    value: "hot",
    label: "Hot",
    icon: Flame,
    activeColor: "text-orange-500",
    description: "Trending posts right now",
  },
  {
    value: "new",
    label: "New",
    icon: Zap,
    activeColor: "text-yellow-500",
    description: "Most recently submitted",
  },
  {
    value: "top",
    label: "Top",
    icon: TrendingUp,
    activeColor: "text-green-500",
    description: "Highest scoring posts",
  },
  {
    value: "rising",
    label: "Rising",
    icon: BarChart2,
    activeColor: "text-blue-500",
    description: "Posts gaining traction fast",
  },
  {
    value: "controversial",
    label: "Controversial",
    icon: Clock,
    activeColor: "text-red-500",
    description: "Posts with heated debate",
  },
];

const LAYOUT_OPTIONS: {
  value: FeedLayout;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { value: "card", icon: LayoutGrid, label: "Card view" },
  { value: "compact", icon: AlignJustify, label: "Compact view" },
  { value: "list", icon: List, label: "List view" },
];

// ============================================================
// PROPS
// ============================================================

interface FeedSortBarProps {
  feedType: FeedType;
  currentSort: PostSortMode;
  onSortChange: (sort: PostSortMode) => void;
  layout: FeedLayout;
}

// ============================================================
// COMPONENT
// ============================================================

export function FeedSortBar({
  feedType,
  currentSort,
  onSortChange,
  layout,
}: FeedSortBarProps) {
  const { setLayout } = useFeedPreferencesStore();
  const activeRef = useRef<HTMLButtonElement>(null);

  const currentOption = SORT_OPTIONS.find((o) => o.value === currentSort);

  return (
    <div className="flex items-center justify-between gap-2 mb-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 shadow-sm">
      {/* Sort buttons */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = currentSort === option.value;

          return (
            <button
              key={option.value}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSortChange(option.value)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                "transition-all duration-200 whitespace-nowrap",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50",
                isActive
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400"
              )}
              title={option.description}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId={`feed-sort-indicator-${feedType}`}
                  className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    isActive ? option.activeColor : "text-current"
                  )}
                />
                <span className="hidden sm:inline">{option.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Layout switcher */}
      <div className="flex items-center gap-1 flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 pl-3 ml-1">
        {LAYOUT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = layout === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setLayout(opt.value)}
              title={opt.label}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50",
                isActive
                  ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}