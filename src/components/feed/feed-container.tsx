"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeedSortBar } from "./feed-sort-bar";
import { FeedSkeleton } from "./feed-skeleton";
import { FeedEmptyState } from "./feed-empty-state";
import { NewPostsToast } from "./new-posts-toast";
import { VirtualizedFeed } from "./virtualized-feed";
import { useFeedPreferencesStore } from "@/stores/feed-preferences.store";
import type { FeedType } from "@/types/feed";
import type { PostSortMode } from "@/types/post";
import type { PostCard } from "@/types/post";
import { cn } from "@/lib/utils";

// ============================================================
// MOCK DATA — replace with tRPC queries
// ============================================================

function generateMockPosts(feedType: FeedType, count = 15): PostCard[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `post-${feedType}-${i}`,
    title: [
      "The most beautiful mountain I've ever seen after a 3-day hike through the Cascades",
      "TIL that honey never expires — archaeologists found 3000-year-old honey in Egyptian tombs that was still edible",
      "I built a full-stack app in a weekend using Next.js 14 and it's been running flawlessly for 6 months",
      "Why does everyone sleep on TypeScript's satisfies operator? It changed how I write code",
      "After 5 years of remote work, here are my honest pros and cons",
      "My home lab setup after 2 years of iteration — the cable management alone took 8 hours",
      "The James Webb Space Telescope just captured the most detailed image of a stellar nursery ever taken",
      "I made a Spotify-like music player in pure CSS — no JavaScript at all",
      "Hot take: most productivity advice is written for people who don't actually struggle with productivity",
      "We open-sourced our entire codebase after 3 years of building in stealth — 50k stars in 24 hours",
    ][i % 10] ?? `Post title ${i + 1}`,
    slug: `post-${feedType}-${i}-slug`,
    postType: (["TEXT", "IMAGE", "LINK", "TEXT", "TEXT", "IMAGE", "TEXT", "LINK", "TEXT", "TEXT"] as const)[i % 10] ?? "TEXT",
    author: {
      id: `user-${i}`,
      username: [`cosmicwanderer`, `techphilosopher`, `buildermindset`, `typemaster`, `remoteworker`, `labrat99`, `spacegeek`, `csswizard`, `contrarian42`, `opensourcehero`][i % 10] ?? `user${i}`,
      displayName: null,
      avatar: null,
      karma: Math.floor(Math.random() * 50000) + 1000,
      isVerified: i % 7 === 0,
      isPremium: i % 11 === 0,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    },
    community: {
      id: `community-${i % 5}`,
      name: [`hiking`, `todayilearned`, `webdev`, `typescript`, `remotework`, `homelab`, `space`, `css`, `productivity`, `opensource`][i % 10] ?? `community${i}`,
      displayName: [`Hiking`, `Today I Learned`, `Web Development`, `TypeScript`, `Remote Work`, `Home Lab`, `Space`, `CSS`, `Productivity`, `Open Source`][i % 10] ?? `Community${i}`,
      icon: null,
      primaryColor: [`#ff4500`, `#46d160`, `#0dd3bb`, `#3b82f6`, `#8b5cf6`, `#f59e0b`, `#06b6d4`, `#ec4899`, `#10b981`, `#f97316`][i % 10] ?? "#ff4500",
      memberCount: Math.floor(Math.random() * 2000000) + 10000,
      isNsfw: false,
      isVerified: i % 4 === 0,
    },
    score: Math.floor(Math.random() * 50000) + 100,
    upvoteRatio: 0.75 + Math.random() * 0.24,
    commentCount: Math.floor(Math.random() * 2000) + 10,
    awardCount: Math.floor(Math.random() * 20),
    awards: i % 3 === 0 ? [
      { id: "award-1", name: "Gold", icon: "🏆", color: "#FFD700", count: Math.floor(Math.random() * 5) + 1, description: "Gilded post", tier: "GOLD" as const, coinCost: 500, giveCount: 1, isFree: false },
    ] : [],
    thumbnail: (["IMAGE", "LINK"] as const).includes((["TEXT", "IMAGE", "LINK", "TEXT", "TEXT", "IMAGE", "TEXT", "LINK", "TEXT", "TEXT"] as const)[i % 10] ?? "TEXT") ? `https://picsum.photos/seed/${i}/400/300` : null,
    url: (["LINK"] as const).includes((["TEXT", "IMAGE", "LINK", "TEXT", "TEXT", "IMAGE", "TEXT", "LINK", "TEXT", "TEXT"] as const)[i % 10] ?? "TEXT") ? `https://example.com/article-${i}` : null,
    domain: (["LINK"] as const).includes((["TEXT", "IMAGE", "LINK", "TEXT", "TEXT", "IMAGE", "TEXT", "LINK", "TEXT", "TEXT"] as const)[i % 10] ?? "TEXT") ? `example.com` : null,
    textSnippet: (["TEXT"] as const).includes((["TEXT", "IMAGE", "LINK", "TEXT", "TEXT", "IMAGE", "TEXT", "LINK", "TEXT", "TEXT"] as const)[i % 10] ?? "TEXT") ? "This is a preview of the post content. It gives readers a taste of what the full post contains without showing everything..." : null,
    images: (["IMAGE"] as const).includes((["TEXT", "IMAGE", "LINK", "TEXT", "TEXT", "IMAGE", "TEXT", "LINK", "TEXT", "TEXT"] as const)[i % 10] ?? "TEXT") ? [{ id: `img-${i}`, url: `https://picsum.photos/seed/${i}/800/600`, width: 800, height: 600, altText: "Post image" }] : [],
    flair: i % 4 === 0 ? { id: `flair-${i}`, text: ["Discussion", "News", "Question", "OC", "Meta"][i % 5] ?? "Flair", backgroundColor: ["#ff4500", "#0dd3bb", "#3b82f6", "#8b5cf6", "#f59e0b"][i % 5] ?? "#ff4500", textColor: "#ffffff", emoji: null } : null,
    isNsfw: false,
    isSpoiler: i % 13 === 0,
    isPinned: i === 0 && feedType === "home",
    isLocked: i % 17 === 0,
    isOC: i % 6 === 0,
    isCrosspost: i % 8 === 0,
    crosspostSource: i % 8 === 0 ? { id: `orig-${i}`, title: "Original post title", communityName: "originalcommunity", authorUsername: "original_author", score: 1234, commentCount: 89 } : null,
    userVote: null,
    isSaved: false,
    isHidden: false,
    hotScore: Math.random() * 100,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    editedAt: i % 5 === 0 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null,
  }));
}

// ============================================================
// PROPS
// ============================================================

interface FeedContainerProps {
  feedType: FeedType;
  communityId?: string;
  userId?: string;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function FeedContainer({
  feedType,
  communityId,
  userId,
  className,
}: FeedContainerProps) {
  const { layout, defaultSort } = useFeedPreferencesStore();
  const [sortMode, setSortMode] = useState<PostSortMode>(defaultSort ?? "hot");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);

  // Mock posts — replace with tRPC query
  const posts = generateMockPosts(feedType, 15);
  const isEmpty = posts.length === 0;

  const handleSortChange = useCallback((sort: PostSortMode) => {
    setIsLoading(true);
    setSortMode(sort);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  const handleRefresh = useCallback(() => {
    setHasNewPosts(false);
    setNewPostCount(0);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Sort bar */}
      <FeedSortBar
        feedType={feedType}
        currentSort={sortMode}
        onSortChange={handleSortChange}
        layout={layout}
      />

      {/* New posts toast */}
      <AnimatePresence>
        {hasNewPosts && (
          <NewPostsToast count={newPostCount} onRefresh={handleRefresh} />
        )}
      </AnimatePresence>

      {/* Feed content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FeedSkeleton count={5} layout={layout} />
          </motion.div>
        ) : isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FeedEmptyState feedType={feedType} />
          </motion.div>
        ) : (
          <motion.div
            key={`feed-${sortMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VirtualizedFeed
              posts={posts}
              layout={layout}
              feedType={feedType}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}