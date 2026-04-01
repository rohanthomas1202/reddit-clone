import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedContainer } from "@/components/feed/feed-container";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";

export const metadata: Metadata = {
  title: "Popular | Threadscape",
  description: "The most popular posts on Threadscape right now",
};

export default function PopularPage() {
  return (
    <Suspense fallback={<FeedSkeleton count={5} />}>
      <FeedContainer feedType="popular" />
    </Suspense>
  );
}