"use client";

import React, { useRef, useCallback } from "react";
import { motion, useAnimation, type AnimationControls } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

export interface VoteButtonAnimatedProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "up" | "down";
  isActive: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

// ============================================================
// SIZE CONFIG
// ============================================================

const sizeConfig = {
  sm: {
    button: "w-6 h-6",
    icon: 12,
    padding: "p-0.5",
  },
  md: {
    button: "w-8 h-8",
    icon: 16,
    padding: "p-1",
  },
  lg: {
    button: "w-10 h-10",
    icon: 20,
    padding: "p-1.5",
  },
} as const;

// ============================================================
// PARTICLE COMPONENT (for upvote celebration)
// ============================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

// ============================================================
// VOTE BUTTON ANIMATED
// ============================================================

export function VoteButtonAnimated({
  direction,
  isActive,
  size = "md",
  disabled = false,
  onClick,
  className,
  ...props
}: VoteButtonAnimatedProps) {
  const controls: AnimationControls = useAnimation();
  const config = sizeConfig[size];
  const isUp = direction === "up";

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      // Bounce animation sequence
      await controls.start({
        scale: [1, 1.4, 0.85, 1.15, 1],
        rotate: isUp ? [0, -15, 10, -5, 0] : [0, 15, -10, 5, 0],
        transition: {
          duration: 0.5,
          ease: "easeOut",
          times: [0, 0.2, 0.4, 0.7, 1],
        },
      });

      onClick?.(e);
    },
    [controls, disabled, isUp, onClick]
  );

  const upvoteColors = {
    idle: "text-zinc-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-orange-400",
    active: "text-orange-500 dark:text-orange-400",
    bg: {
      idle: "hover:bg-orange-500/10",
      active: "bg-orange-500/15",
    },
  };

  const downvoteColors = {
    idle: "text-zinc-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400",
    active: "text-blue-500 dark:text-blue-400",
    bg: {
      idle: "hover:bg-blue-500/10",
      active: "bg-blue-500/15",
    },
  };

  const colors = isUp ? upvoteColors : downvoteColors;

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        isUp
          ? "focus-visible:ring-orange-500/50"
          : "focus-visible:ring-blue-500/50",
        config.button,
        config.padding,
        isActive ? colors.active : colors.idle,
        isActive ? colors.bg.active : colors.bg.idle,
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className
      )}
      aria-label={`${isUp ? "Upvote" : "Downvote"}`}
      {...props}
    >
      <motion.span
        animate={controls}
        className="flex items-center justify-center w-full h-full"
      >
        {/* Glow effect when active */}
        {isActive && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={cn(
              "absolute inset-0 rounded-full blur-sm",
              isUp ? "bg-orange-500/30" : "bg-blue-500/30"
            )}
          />
        )}

        {/* Icon */}
        <motion.span
          animate={
            isActive
              ? {
                  filter: isUp
                    ? "drop-shadow(0 0 4px rgba(249,115,22,0.8))"
                    : "drop-shadow(0 0 4px rgba(59,130,246,0.8))",
                }
              : { filter: "none" }
          }
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          {isUp ? (
            <ArrowUp
              size={config.icon}
              strokeWidth={isActive ? 2.5 : 2}
              className={cn(
                "transition-all duration-150",
                isActive && "fill-orange-500/20"
              )}
            />
          ) : (
            <ArrowDown
              size={config.icon}
              strokeWidth={isActive ? 2.5 : 2}
              className={cn(
                "transition-all duration-150",
                isActive && "fill-blue-500/20"
              )}
            />
          )}
        </motion.span>
      </motion.span>

      {/* Ripple on activate */}
      {isActive && (
        <motion.span
          key="ripple"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "absolute inset-0 rounded-full",
            isUp ? "bg-orange-500/40" : "bg-blue-500/40"
          )}
        />
      )}
    </motion.button>
  );
}