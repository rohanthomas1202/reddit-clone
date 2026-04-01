import { Suspense } from "react";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { UserSavedFeed } from "@/components/user/user-saved-feed";
import { BookmarkIcon } from "lucide-react";

interface UserSavedPageProps {
  params: Promise<{ username: string }>;
}

export default async function UserSavedPage({ params }: UserSavedPageProps) {
  const { username } = await params;

  return (
    <Suspense fallback={<FeedSkeleton count={3} />}>
      <UserSavedFeed username={username} />
    </Suspense>
  );
}