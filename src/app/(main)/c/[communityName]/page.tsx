import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CommunityFeedContent } from "@/components/community/community-feed-content";
import { CommunitySidebar } from "@/components/community/community-sidebar";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { CommunityFlairFilter } from "@/components/community/community-flair-filter";
import { FeedSortBar } from "@/components/feed/feed-sort-bar";

interface CommunityPageProps {
  params: Promise<{ communityName: string }>;
  searchParams: Promise<{ sort?: string; flair?: string }>;
}

// Mock data for demonstration
async function getCommunityData(name: string) {
  // In production, this would fetch from the database via tRPC/API
  return {
    id: "1",
    name,
    displayName: name.charAt(0).toUpperCase() + name.slice(1),
    description: `Welcome to c/${name} — a community for discussing all things related to ${name}.`,
    memberCount: 142857,
    onlineCount: 2341,
    createdAt: new Date("2021-03-15"),
    isJoined: false,
    bannerUrl: null,
    iconUrl: null,
    primaryColor: "#FF6314",
    flairs: [
      { id: "1", name: "Discussion", color: "#3B82F6" },
      { id: "2", name: "Question", color: "#8B5CF6" },
      { id: "3", name: "Resource", color: "#10B981" },
      { id: "4", name: "News", color: "#F59E0B" },
      { id: "5", name: "Meme", color: "#EF4444" },
    ],
    rules: [
      { id: "1", title: "Be respectful", description: "Treat others with kindness and respect." },
      { id: "2", title: "No spam", description: "Do not post spam or self-promotional content." },
      { id: "3", title: "Stay on topic", description: "Keep posts relevant to the community." },
    ],
    moderators: [
      { id: "1", username: "mod_alpha", avatarUrl: null, isSuperMod: true },
      { id: "2", username: "mod_beta", avatarUrl: null, isSuperMod: false },
    ],
    type: "PUBLIC" as const,
    nsfw: false,
    postCount: 45231,
    weeklyPostCount: 312,
  };
}

export async function generateMetadata({ params }: CommunityPageProps): Promise<Metadata> {
  const { communityName } = await params;
  const community = await getCommunityData(communityName);

  return {
    title: `c/${community.name} | Threadscape`,
    description: community.description,
    openGraph: {
      title: `c/${community.name} — Threadscape`,
      description: community.description,
    },
  };
}

export default async function CommunityPage({ params, searchParams }: CommunityPageProps) {
  const { communityName } = await params;
  const { sort = "hot", flair } = await searchParams;

  const community = await getCommunityData(communityName);

  if (!community) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-16">
        <div className="flex gap-6">
          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar & Flair Filters */}
            <div className="space-y-3 mb-4">
              <FeedSortBar
                currentSort={sort as "hot" | "new" | "top" | "rising" | "controversial"}
                feedType="community"
              />
              <CommunityFlairFilter
                flairs={community.flairs}
                activeFlair={flair}
                communityName={communityName}
              />
            </div>

            {/* Feed */}
            <Suspense fallback={<FeedSkeleton count={5} />}>
              <CommunityFeedContent
                communityName={communityName}
                sort={sort}
                flair={flair}
              />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <CommunitySidebar community={community} />
          </div>
        </div>
      </div>
    </div>
  );
}