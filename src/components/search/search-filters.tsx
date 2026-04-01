"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, Clock, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  currentSort: string;
  currentTimeRange: string;
  currentCommunity?: string;
  query: string;
  activeTab: string;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance", icon: TrendingUp },
  { value: "new", label: "New", icon: Clock },
  { value: "top", label: "Top", icon: TrendingUp },
  { value: "comments", label: "Most Comments", icon: Filter },
] as const;

const TIME_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "day", label: "Past 24h" },
  { value: "week", label: "Past Week" },
  { value: "month", label: "Past Month" },
  { value: "year", label: "Past Year" },
] as const;

export function SearchFilters({
  currentSort,
  currentTimeRange,
  currentCommunity,
  query,
  activeTab,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set("q", query);
    router.push(`/search?${params.toString()}`);
  }

  function clearCommunity() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("community");
    router.push(`/search?${params.toString()}`);
  }

  const showSortOptions = activeTab === "posts" || activeTab === "comments";
  const showTimeOptions = activeTab === "posts" || activeTab === "comments";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-4 sticky top-20"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <Filter className="w-4 h-4 text-orange-500" />
        Filters
      </div>

      {currentCommunity && (
        <div className="flex items-center gap-2 text-xs bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 rounded-lg px-3 py-2 border border-orange-200 dark:border-orange-500/20">
          <span className="flex-1 truncate">c/{currentCommunity}</span>
          <button
            onClick={clearCommunity}
            className="hover:text-orange-900 dark:hover:text-orange-100 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {showSortOptions && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Sort by
          </p>
          <div className="space-y-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateParam("sort", option.value)}
                className={cn(
                  "w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-150",
                  currentSort === option.value
                    ? "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 font-medium"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showTimeOptions && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Time Range
          </p>
          <div className="space-y-1">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateParam("time", option.value)}
                className={cn(
                  "w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-150",
                  currentTimeRange === option.value
                    ? "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 font-medium"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showSortOptions && !showTimeOptions && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">
          No filters available for this tab
        </p>
      )}
    </motion.div>
  );
}