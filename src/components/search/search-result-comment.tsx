"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, MessageSquare, Clock, CornerUpLeft } from "lucide-react";
import { SearchHighlight } from "./search-highlight";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface SearchResultCommentData {
  id: string;
  body: string;
  score: number;
  createdAt: Date;
  author: {
    username: string;
    avatar?: string | null;
  };
  post: {
    id: string;
    title: string;
    communityName: string;
  };
}

interface SearchResultCommentProps {
  comment: SearchResultCommentData;
  query: string;
  index: number;
}

export function SearchResultComment({
  comment,
  query,
  index,
}: SearchResultCommentProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:shadow-md dark:hover:shadow-zinc-900/50"
    >
      <div className="p-4 space-y-3">
        {/* Post context */}
        <Link
          href={`/c/${comment.post.communityName}/post/${comment.post.id}`}
          className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors group/link"
        >
          <CornerUpLeft className="w-3 h-3 shrink-0" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover/link:text-orange-500 dark:group-hover/link:text-orange-400 line-clamp-1">
            {comment.post.title}
          </span>
          <span className="text-zinc-400">in</span>
          <span className="font-medium">c/{comment.post.communityName}</span>
        </Link>

        {/* Author + meta */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Link
            href={`/u/${comment.author.username}`}
            className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            u/{comment.author.username}
          </Link>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            {comment.score >= 1000
              ? `${(comment.score / 1000).toFixed(1)}k`
              : comment.score}{" "}
            points
          </span>
        </div>

        {/* Comment body */}
        <Link
          href={`/c/${comment.post.communityName}/post/${comment.post.id}?comment=${comment.id}`}
          className="block"
        >
          <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-700 pl-3 group-hover:border-orange-300 dark:group-hover:border-orange-500/50 transition-colors">
            <SearchHighlight text={comment.body} query={query} maxLength={300} />
          </div>
        </Link>
      </div>
    </motion.article>
  );
}