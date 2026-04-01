import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Threadscape account",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md animate-pulse">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl space-y-4">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-3/4 mx-auto" />
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}