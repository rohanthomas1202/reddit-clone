import type { Metadata } from "next";
import { Suspense } from "react";
import { PostCreateForm } from "@/components/post/create/post-create-form";

interface CommunitySubmitPageProps {
  params: Promise<{ communityName: string }>;
}

export async function generateMetadata({
  params,
}: CommunitySubmitPageProps): Promise<Metadata> {
  const { communityName } = await params;
  return {
    title: `Submit to c/${communityName} | Threadscape`,
    description: `Share something with the c/${communityName} community`,
  };
}

export default async function CommunitySubmitPage({
  params,
}: CommunitySubmitPageProps) {
  const { communityName } = await params;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Create a Post
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Posting to{" "}
            <span className="text-orange-500 font-semibold">
              c/{communityName}
            </span>
          </p>
        </div>
        <Suspense
          fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          }
        >
          <PostCreateForm initialCommunity={communityName} />
        </Suspense>
      </div>
    </div>
  );
}