import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserProfileHeader } from "@/components/user/user-profile-header";
import { UserProfileTabs } from "@/components/user/user-profile-tabs";

interface UserLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

async function getUserData(username: string) {
  // In production: fetch from DB via tRPC
  return {
    id: "user_1",
    username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    bio: "Passionate about technology, open source, and building great communities. Coffee enthusiast. ☕",
    avatarUrl: null,
    bannerUrl: null,
    karma: {
      post: 12450,
      comment: 8730,
      total: 21180,
    },
    createdAt: new Date("2020-06-15"),
    isVerified: true,
    isPremium: false,
    isModerator: true,
    isAdmin: false,
    isOnline: true,
    postCount: 234,
    commentCount: 1892,
    socialLinks: {
      website: "https://example.com",
      twitter: "@example",
      github: "example",
    },
    flair: {
      id: "1",
      text: "Senior Member",
      backgroundColor: "#FF6314",
      textColor: "#FFFFFF",
      emoji: "⭐",
    },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserData(username);

  return {
    title: `u/${user.username} | Threadscape`,
    description: user.bio ?? `View u/${user.username}'s profile on Threadscape`,
    openGraph: {
      title: `u/${user.username} — Threadscape`,
      description: user.bio ?? undefined,
    },
  };
}

export default async function UserLayout({ children, params }: UserLayoutProps) {
  const { username } = await params;
  const user = await getUserData(username);

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <UserProfileHeader user={user} />
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-16">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <UserProfileTabs username={username} />
            <div className="mt-4">{children}</div>
          </div>

          {/* Profile sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <ProfileSidebarCard user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSidebarCard({ user }: { user: Awaited<ReturnType<typeof getUserData>> }) {
  const joinDate = user.createdAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4 sticky top-20">
      {/* Trophy Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
        <div className="p-4 bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Trophy Case
          </h3>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {[
            { emoji: "🏆", label: "Best of 2023" },
            { emoji: "⭐", label: "Verified" },
            { emoji: "🔥", label: "Popular Post" },
            { emoji: "💎", label: "Helpful" },
            { emoji: "🎖️", label: "2 Year Club" },
            { emoji: "✨", label: "Wholesome" },
          ].map((trophy) => (
            <div
              key={trophy.label}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-default"
              title={trophy.label}
            >
              <span className="text-2xl">{trophy.emoji}</span>
              <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 text-center leading-tight">
                {trophy.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-3">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Account Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 dark:text-zinc-400">Cake Day</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">{joinDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 dark:text-zinc-400">Posts</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">{user.postCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 dark:text-zinc-400">Comments</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">{user.commentCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}