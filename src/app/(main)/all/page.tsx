import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedContainer } from "@/components/feed/feed-container";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";

export const metadata: Metadata = {
  title: "All | Threadscape",
  description: "All posts from every community on Threadscape",
};

export default function AllPage() {
  return (
    <Suspense fallback={<FeedSkeleton count={5} />}>
      <FeedContainer feedType="all" />
    </Suspense>
  );
}