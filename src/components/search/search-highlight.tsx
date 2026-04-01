"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface SearchHighlightProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
  maxLength?: number;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function SearchHighlight({
  text,
  query,
  className,
  highlightClassName,
  maxLength,
}: SearchHighlightProps) {
  const parts = useMemo(() => {
    if (!query.trim()) {
      const displayText = maxLength ? text.slice(0, maxLength) : text;
      return [{ text: displayText, highlighted: false }];
    }

    const words = query
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(escapeRegExp);

    const pattern = new RegExp(`(${words.join("|")})`, "gi");
    const displayText = maxLength ? text.slice(0, maxLength) : text;
    const splitParts = displayText.split(pattern);

    return splitParts.map((part) => ({
      text: part,
      highlighted: pattern.test(part),
    }));
  }, [text, query, maxLength]);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.highlighted ? (
          <mark
            key={i}
            className={cn(
              "bg-orange-200 dark:bg-orange-500/30 text-orange-900 dark:text-orange-200 rounded px-0.5 not-italic font-medium",
              highlightClassName
            )}
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
      {maxLength && text.length > maxLength && (
        <span className="text-zinc-400 dark:text-zinc-500">…</span>
      )}
    </span>
  );
}