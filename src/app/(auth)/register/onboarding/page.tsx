import type { Metadata } from "next";
import { OnboardingCommunityGrid } from "@/components/auth/onboarding-community-grid";

export const metadata: Metadata = {
  title: "Pick Your Communities",
  description: "Choose communities that interest you to personalize your feed",
};

export default function OnboardingPage() {
  return <OnboardingCommunityGrid />;
}