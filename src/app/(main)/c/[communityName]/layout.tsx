import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityHeader } from "@/components/community/community-header";

interface CommunityLayoutProps {
  children: React.ReactNode;
  params: Promise<{ communityName: string }>;
}

async function getCommunityBasicInfo(name: string) {
  // In production: fetch from DB
  return {
    id: "1",
    name,
    displayName: name.charAt(0).toUpperCase() + name.slice(1),
    description: `Welcome to c/${name}`,
    memberCount: 142857,
    onlineCount: 2341,
    createdAt: new Date("2021-03-15"),
    isJoined: false,
    bannerUrl: null,
    iconUrl: null,
    primaryColor: "#FF6314",
    type: "PUBLIC" as const,
    nsfw: false,
    postCount: 45231,
    weeklyPostCount: 312,
  };
}

export default async function CommunityLayout({ children, params }: CommunityLayoutProps) {
  const { communityName } = await params;
  const community = await getCommunityBasicInfo(communityName);

  if (!community) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <CommunityHeader community={community} />
      {children}
    </div>
  );
}