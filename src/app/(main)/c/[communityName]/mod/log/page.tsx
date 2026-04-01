import type { Metadata } from "next";
import { ModDashboard } from "@/components/community/mod/mod-dashboard";
import { ModLog } from "@/components/community/mod/mod-log";

interface ModLogPageProps {
  params: Promise<{ communityName: string }>;
}

export async function generateMetadata({ params }: ModLogPageProps): Promise<Metadata> {
  const { communityName } = await params;
  return {
    title: `Mod Log — c/${communityName} | Threadscape`,
  };
}

export default async function ModLogPage({ params }: ModLogPageProps) {
  const { communityName } = await params;
  return (
    <ModDashboard communityName={communityName} activeTab="log">
      <ModLog communityName={communityName} />
    </ModDashboard>
  );
}