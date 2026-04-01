import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PostPageClient } from "@/components/post/post-page-client";
import { CommentSkeleton } from "@/components/comment/comment-skeleton";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

interface PostPageProps {
  params: Promise<{ communityName: string; postId: string }>;
}

// ============================================================
// MOCK DATA FETCHER
// ============================================================

async function getPost(postId: string, communityName: string) {
  // In production: fetch from DB via tRPC or server action
  return {
    id: postId,
    title: "The future of web development is here — and it's beautiful",
    body: `After years of working with various frameworks and tools, I've come to appreciate how far we've come in terms of developer experience and end-user performance.

The combination of server components, streaming, and edge computing has fundamentally changed how we think about building web applications. What used to require complex infrastructure setups can now be accomplished with a few lines of code.

Here are some thoughts on where things are heading...`,
    type: "TEXT" as const,
    score: 2847,
    upvoteCount: 3012,
    downvoteCount: 165,
    commentCount: 342,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isLocked: false,
    isPinned: true,
    isNsfw: false,
    isSpoiler: false,
    userVote: 0 as 0 | 1 | -1,
    author: {
      id: "user_1",
      username: "techEnthusiast42",
      displayName: "Tech Enthusiast",
      avatar: null,
      karma: 15420,
      isVerified: true,
    },
    community: {
      id: "comm_1",
      name: communityName,
      displayName: communityName.charAt(0).toUpperCase() + communityName.slice(1),
      icon: null,
      memberCount: 284000,
      isNsfw: false,
    },
    flair: {
      id: "flair_1",
      text: "Discussion",
      backgroundColor: "#FF4500",
      textColor: "#FFFFFF",
    },
    awards: [
      { id: "award_1", type: "gold", count: 3 },
      { id: "award_2", type: "silver", count: 7 },
    ],
  };
}

// ============================================================
// METADATA
// ============================================================

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { communityName, postId } = await params;

  try {
    const post = await getPost(postId, communityName);
    return {
      title: `${post.title} | c/${communityName} | Threadscape`,
      description: post.body?.slice(0, 160) ?? `Post in c/${communityName}`,
      openGraph: {
        title: post.title,
        description: post.body?.slice(0, 160) ?? undefined,
        type: "article",
      },
    };
  } catch {
    return {
      title: `Post | c/${communityName} | Threadscape`,
    };
  }
}

// ============================================================
// LOADING SKELETON
// ============================================================

function PostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Post card skeleton */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
              <div className="flex">
                {/* Vote sidebar */}
                <div className="w-12 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center gap-2 py-4 px-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="w-6 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                </div>
                {/* Post content */}
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="w-32 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-3/4 h-7 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="w-5/6 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="w-4/6 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <div className="w-24 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="w-20 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="w-16 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Comment sort bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4">
              <div className="flex items-center gap-4">
                <div className="w-28 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-16 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>

            {/* Comment editor */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-3">
              <div className="w-40 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-full h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="flex justify-end">
                <div className="w-24 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>

            {/* Comments */}
            <CommentSkeleton count={4} />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 shrink-0 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-3">
              <div className="w-32 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-full h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="flex gap-4">
                <div className="flex-1 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="flex-1 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="w-full h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-3">
              <div className="w-28 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={cn("h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse", i === 0 ? "w-full" : i === 1 ? "w-5/6" : i === 2 ? "w-4/6" : "w-3/6")} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE COMPONENT
// ============================================================

export default async function PostPage({ params }: PostPageProps) {
  const { communityName, postId } = await params;

  let post;
  try {
    post = await getPost(postId, communityName);
  } catch {
    notFound();
  }

  if (!post) notFound();

  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <PostPageClient post={post} communityName={communityName} />
    </Suspense>
  );
}