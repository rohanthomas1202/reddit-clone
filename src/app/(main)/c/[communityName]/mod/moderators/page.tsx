import type { Metadata } from "next";
import { ModDashboard } from "@/components/community/mod/mod-dashboard";

interface ModModeratorsPageProps {
  params: Promise<{ communityName: string }>;
}

export async function generateMetadata({ params }: ModModeratorsPageProps): Promise<Metadata> {
  const { communityName } = await params;
  return {
    title: `Moderators — c/${communityName} | Threadscape`,
  };
}

function ModeratorsList({ communityName }: { communityName: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Moderators</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage moderators for c/{communityName}
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">No additional moderators</p>
      </div>
    </div>
  );
}

export default async function ModModeratorsPage({ params }: ModModeratorsPageProps) {
  const { communityName } = await params;
  return (
    <ModDashboard communityName={communityName} activeTab="moderators">
      <ModeratorsList communityName={communityName} />
    </ModDashboard>
  );
}