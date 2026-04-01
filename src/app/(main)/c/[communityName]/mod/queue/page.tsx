import type { Metadata } from "next";
import { ModDashboard } from "@/components/community/mod/mod-dashboard";
import { ModReportQueue } from "@/components/community/mod/mod-report-queue";

interface ModQueuePageProps {
  params: Promise<{ communityName: string }>;
}

export async function generateMetadata({ params }: ModQueuePageProps): Promise<Metadata> {
  const { communityName } = await params;
  return {
    title: `Report Queue — c/${communityName} | Threadscape`,
  };
}

export default async function ModQueuePage({ params }: ModQueuePageProps) {
  const { communityName } = await params;
  return (
    <ModDashboard communityName={communityName} activeTab="queue">
      <ModReportQueue communityName={communityName} />
    </ModDashboard>
  );
}