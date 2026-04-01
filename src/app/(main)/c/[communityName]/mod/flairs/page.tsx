import type { Metadata } from "next";
import { ModDashboard } from "@/components/community/mod/mod-dashboard";
import { ModFlairManager } from "@/components/community/mod/mod-flair-manager";

interface ModFlairsPageProps {
  params: Promise<{ communityName: string }>;
}

export async function generateMetadata({ params }: ModFlairsPageProps): Promise<Metadata> {
  const { communityName } = await params;
  return {
    title: `Flair Manager — c/${communityName} | Threadscape`,
  };
}

export default async function ModFlairsPage({ params }: ModFlairsPageProps) {
  const { communityName } = await params;
  return (
    <ModDashboard communityName={communityName} activeTab="flairs">
      <ModFlairManager communityName={communityName} />
    </ModDashboard>
  );
}