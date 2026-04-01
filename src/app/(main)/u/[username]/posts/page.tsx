import { Suspense } from "react";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { UserPostsFeed } from "@/components/user/user-posts-feed";

interface UserPostsPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export default async function UserPostsPage({ params, searchParams }: UserPostsPageProps) {
  const { username } = await params;
  const { sort = "new" } = await searchParams;

  return (
    <Suspense fallback={<FeedSkeleton count={4} />}>
      <UserPostsFeed username={username} sort={sort} />
    </Suspense>
  );
}