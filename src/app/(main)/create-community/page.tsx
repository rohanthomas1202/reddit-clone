import type { Metadata } from "next";
import { CommunityCreateWizard } from "@/components/community/create/community-create-wizard";

export const metadata: Metadata = {
  title: "Create Community | Threadscape",
  description: "Start your own community on Threadscape",
};

export default function CreateCommunityPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <CommunityCreateWizard />
      </div>
    </div>
  );
}