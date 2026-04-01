import type { Metadata } from "next";
import { ModDashboard } from "@/components/community/mod/mod-dashboard";
import { ModSettingsForm } from "@/components/community/mod/mod-settings-form";

interface ModSettingsPageProps {
  params: Promise<{ communityName: string }>;
}

export async function generateMetadata({ params }: ModSettingsPageProps): Promise<Metadata> {
  const { communityName } = await params;
  return {
    title: `Settings — c/${communityName} | Threadscape`,
  };
}

export default async function ModSettingsPage({ params }: ModSettingsPageProps) {
  const { communityName } = await params;
  return (
    <ModDashboard communityName={communityName} activeTab="settings">
      <ModSettingsForm communityName={communityName} />
    </ModDashboard>
  );
}