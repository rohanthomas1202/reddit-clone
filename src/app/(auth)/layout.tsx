import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Threadscape",
    default: "Auth | Threadscape",
  },
  description: "Join Threadscape — the modern community discussion platform",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left blob */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        {/* Bottom-right blob */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        {/* Center blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/3 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Logo / Nav */}
      <header className="relative z-10 px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group"
          aria-label="Threadscape Home"
        >
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow duration-300">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 1.5L2 5.25V12.75L9 16.5L16 12.75V5.25L9 1.5Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M2 5.25L9 9L16 5.25"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9 9V16.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-200">
            Threadscape
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 pb-10">
        <Suspense
          fallback={
            <div className="w-full max-w-md">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-3/4 mx-auto" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mx-auto" />
                  <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                </div>
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}