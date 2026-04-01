import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface ModPageProps {
  params: Promise<{ communityName: string }>;
}

export async function generateMetadata({ params }: ModPageProps): Promise<Metadata> {
  const { communityName } = await params;
  return {
    title: `Mod Dashboard — c/${communityName} | Threadscape`,
  };
}

export default async function ModPage({ params }: ModPageProps) {
  const { communityName } = await params;
  redirect(`/c/${communityName}/mod/queue`);
}