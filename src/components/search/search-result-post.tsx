"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, MessageSquare, Clock, ExternalLink } from "lucide-react";
import { SearchHighlight } from "./search-highlight";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface SearchResultPostData {
  id: string;
  title: string;
  body?: string | null;
  url?: string | null;
  type: "TEXT" | "LINK" | "IMAGE" | "VIDEO";
  score: number;
  commentCount: number;
  createdAt: Date;
  author: {
    username: string;
    avatar?: string | null;
  };
  community: {
    name: string;
    icon?: string | null;
  };
  thumbnail?: string | null;
  flair?: {
    text: string;
    backgroundColor: string;
    textColor: string;
  } | null;
}

interface SearchResultPostProps {
  post: SearchResultPostData;
  query: string;
  index: number;
}

export function SearchResultPost({ post, query, index }: SearchResultPostProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:shadow-md dark:hover:shadow-zinc-900/50 overflow-hidden"
    >
      <div className="flex gap-3 p-4">
        {/* Vote score */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
          <ArrowUp className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
            {post.score >= 1000
              ? `${(post.score / 1000).toFixed(1)}k`
              : post.score}
          </span>
        </div>

        {/* Thumbnail */}
        {post.thumbnail && (
          <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <img
              src={post.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Community + Author */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
            {post.community.icon ? (
              <img
                src={post.community.icon}
                alt=""
                className="w-4 h-4 rounded-full"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
            )}
            <Link
              href={`/c/${post.community.name}`}
              className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              c/{post.community.name}
            </Link>
            <span>•</span>
            <span>
              Posted by{" "}
              <Link
                href={`/u/${post.author.username}`}
                className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                u/{post.author.username}
              </Link>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Title */}
          <Link href={`/c/${post.community.name}/post/${post.id}`}>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
              <SearchHighlight text={post.title} query={query} />
            </h3>
          </Link>

          {/* Flair */}
          {post.flair && (
            <span
              className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: post.flair.backgroundColor,
                color: post.flair.textColor,
              }}
            >
              {post.flair.text}
            </span>
          )}

          {/* Body excerpt */}
          {post.body && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              <SearchHighlight text={post.body} query={query} maxLength={200} />
            </p>
          )}

          {/* URL */}
          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{post.url}</span>
            </a>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 pt-1">
            <Link
              href={`/c/${post.community.name}/post/${post.id}`}
              className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {post.commentCount} comments
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}