"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Link2, Image, cn } from "./utils";

// ============================================================
// TYPES
// ============================================================

export type PostType = "text" | "link" | "image";

interface PostTypeTab {
  id: PostType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: PostTypeTab[] = [
  {
    id: "text",
    label: "Text",
    icon: FileText,
    description: "Write a text post",
  },
  {
    id: "link",
    label: "Link",
    icon: Link2,
    description: "Share a link",
  },
  {
    id: "image",
    label: "Image",
    icon: Image,
    description: "Upload images",
  },
];

interface PostTypeTabsProps {
  value: PostType;
  onChange: (type: PostType) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function PostTypeTabs({ value, onChange }: PostTypeTabsProps) {
  return (
    <div
      className="relative flex border-b border-zinc-200 dark:border-zinc-800"
      role="tablist"
      aria-label="Post type"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-5 py-4 text-sm font-medium",
              "transition-colors duration-150",
              "flex-1 justify-center",
              isActive
                ? "text-orange-500 dark:text-orange-400"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="post-type-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            <Icon
              className={cn(
                "w-4 h-4 transition-transform duration-150",
                isActive && "scale-110"
              )}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}