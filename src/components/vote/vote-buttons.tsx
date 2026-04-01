"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { VoteButtonAnimated } from "./vote-button-animated";

// ============================================================
// TYPES
// ============================================================

export type VoteDirection = 1 | -1 | 0;

export interface VoteButtonsProps {
  postId?: string;
  commentId?: string;
  initialScore: number;
  initialVote?: VoteDirection;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
  disabled?: boolean;
  onVote?: (direction: VoteDirection, newScore: number) => void;
  className?: string;
  compact?: boolean;
}

// ============================================================
// SCORE FORMATTER
// ============================================================

function formatScore(score: number): string {
  const abs = Math.abs(score);
  if (abs >= 1_000_000) {
    return `${(score / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${(score / 1000).toFixed(1)}k`;
  }
  return score.toString();
}

// ============================================================
// SCORE COLOR
// ============================================================

function getScoreColor(vote: VoteDirection, score: number): string {
  if (vote === 1) return "text-orange-500";
  if (vote === -1) return "text-blue-500";
  if (score > 0) return "text-zinc-800 dark:text-zinc-200";
  if (score < 0) return "text-red-400";
  return "text-zinc-500 dark:text-zinc-400";
}

// ============================================================
// VOTE BUTTONS COMPONENT
// ============================================================

export function VoteButtons({
  postId,
  commentId,
  initialScore,
  initialVote = 0,
  orientation = "vertical",
  size = "md",
  showScore = true,
  disabled = false,
  onVote,
  className,
  compact = false,
}: VoteButtonsProps) {
  const [vote, setVote] = useState<VoteDirection>(initialVote);
  const [score, setScore] = useState(initialScore);
  const [isAnimatingScore, setIsAnimatingScore] = useState(false);

  const handleVote = useCallback(
    (direction: 1 | -1) => {
      if (disabled) return;

      let newVote: VoteDirection;
      let scoreDelta = 0;

      if (vote === direction) {
        // Toggle off
        newVote = 0;
        scoreDelta = -direction;
      } else {
        // New vote or switch
        scoreDelta = direction - vote;
        newVote = direction;
      }

      const newScore = score + scoreDelta;

      setVote(newVote);
      setScore(newScore);
      setIsAnimatingScore(true);
      setTimeout(() => setIsAnimatingScore(false), 400);

      onVote?.(newVote, newScore);

      // Optimistic update — in real app, you'd call tRPC mutation here
      // If mutation fails, revert:
      // setVote(vote);
      // setScore(score);
    },
    [vote, score, disabled, onVote]
  );

  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex items-center select-none",
        isVertical ? "flex-col gap-0.5" : "flex-row gap-1",
        compact && "gap-0",
        className
      )}
      role="group"
      aria-label="Vote buttons"
    >
      {/* Upvote */}
      <VoteButtonAnimated
        direction="up"
        isActive={vote === 1}
        size={size}
        disabled={disabled}
        onClick={() => handleVote(1)}
        aria-label={vote === 1 ? "Remove upvote" : "Upvote"}
        aria-pressed={vote === 1}
      />

      {/* Score */}
      {showScore && (
        <div
          className={cn(
            "relative font-bold tabular-nums overflow-hidden",
            isVertical ? "min-w-[2rem] text-center" : "min-w-[1.5rem] text-center",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            getScoreColor(vote, score),
            "transition-colors duration-200"
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={score}
              initial={{ y: isAnimatingScore ? -12 : 0, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="block"
            >
              {formatScore(score)}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {/* Downvote */}
      <VoteButtonAnimated
        direction="down"
        isActive={vote === -1}
        size={size}
        disabled={disabled}
        onClick={() => handleVote(-1)}
        aria-label={vote === -1 ? "Remove downvote" : "Downvote"}
        aria-pressed={vote === -1}
      />
    </div>
  );
}