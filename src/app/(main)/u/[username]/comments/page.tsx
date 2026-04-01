import { Suspense } from "react";
import { UserCommentsFeed } from "@/components/user/user-comments-feed";

interface UserCommentsPageProps {
  params: Promise<{ username: string }>;
}

function CommentsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function UserCommentsPage({ params }: UserCommentsPageProps) {
  const { username } = await params;

  return (
    <Suspense fallback={<CommentsSkeleton />}>
      <UserCommentsFeed username={username} />
    </Suspense>
  );
}