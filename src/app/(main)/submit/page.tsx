import type { Metadata } from "next";
import { Suspense } from "react";
import { PostCreateForm } from "@/components/post/create/post-create-form";

export const metadata: Metadata = {
  title: "Create Post | Threadscape",
  description: "Share something with the Threadscape community",
};

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Create a Post
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Share something with the community
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
          <PostCreateForm />
        </Suspense>
      </div>
    </div>
  );
}