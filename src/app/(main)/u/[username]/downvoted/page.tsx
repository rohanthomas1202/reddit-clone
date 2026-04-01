import { Suspense } from "react";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { UserVotedFeed } from "@/components/user/user-voted-feed";

interface UserDownvotedPageProps {
  params: Promise<{ username: string }>;
}

export default async function UserDownvotedPage({ params }: UserDownvotedPageProps) {
  const { username } = await params;

  return (
    <Suspense fallback={<FeedSkeleton count={3} />}>
      <UserVotedFeed username={username} direction="down" />
    </Suspense>
  );
}