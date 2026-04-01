import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedContainer } from "@/components/feed/feed-container";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";

export const metadata: Metadata = {
  title: "Home | Threadscape",
  description: "Your personalized Threadscape feed — the best discussions from your communities",
};

export default function HomePage() {
  return (
    <Suspense fallback={<FeedSkeleton count={5} />}>
      <FeedContainer feedType="home" />
    </Suspense>
  );
}