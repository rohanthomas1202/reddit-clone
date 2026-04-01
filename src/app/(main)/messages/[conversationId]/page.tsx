import type { Metadata } from "next";
import { Suspense } from "react";
import { MessageThread } from "@/components/messages/message-thread";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export async function generateMetadata({
  params,
}: ConversationPageProps): Promise<Metadata> {
  const { conversationId } = await params;
  return {
    title: `Conversation | Threadscape`,
    description: `Message conversation on Threadscape`,
  };
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 h-[600px] animate-pulse" />
          }
        >
          <MessageThread conversationId={conversationId} />
        </Suspense>
      </div>
    </div>
  );
}