import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsPage } from "@/components/search/search-results-page";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    tab?: string;
    sort?: string;
    time?: string;
    community?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}" | Threadscape` : "Search | Threadscape",
    description: q
      ? `Search results for "${q}" on Threadscape`
      : "Search posts, comments, communities, and users on Threadscape",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-3 animate-pulse"
            >
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
            </div>
          ))}
        </div>
      }
    >
      <SearchResultsPage
        query={params.q ?? ""}
        tab={params.tab ?? "posts"}
        sort={params.sort ?? "relevance"}
        timeRange={params.time ?? "all"}
        community={params.community}
      />
    </Suspense>
  );
}