"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

type VerifyState = "verifying" | "success" | "error" | "expired" | "already-verified";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>(token ? "verifying" : "error");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const verifyEmail = useCallback(async (verifyToken: string) => {
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verifyToken }),
      });
      const data = await res.json() as { success?: boolean; error?: string; code?: string };
      if (!res.ok || !data.success) {
        if (data.code === "TOKEN_EXPIRED") {
          setState("expired");
        } else if (data.code === "ALREADY_VERIFIED") {
          setState("already-verified");
        } else {
          setState("error");
          setErrorMessage(data.error ?? "Verification failed");
        }
      } else {
        setState("success");
        setTimeout(() => router.push("/login?verified=true"), 2500);
      }
    } catch {
      setState("error");
      setErrorMessage("Network error. Please try again.");
    }
  }, [router]);

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("No verification token found.");
      return;
    }
    verifyEmail(token);
  }, [token, verifyEmail]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setResendCooldown(60);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 shadow-xl shadow-black/5 text-center"
      >
        <AnimatePresence mode="wait">
          {state === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  Verifying your email
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Please wait while we confirm your email address...
                </p>
              </div>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  Email verified! 🎉
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Your email has been successfully verified. Redirecting you to login...
                </p>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {(state === "error" || state === "expired") && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {state === "expired" ? "Link expired" : "Verification failed"}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {state === "expired"
                    ? "This verification link has expired. Request a new one below."
                    : errorMessage || "Something went wrong. Please try again."}
                </p>
              </div>
              <button
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend verification email"}
              </button>
              <Link
                href="/login"
                className="block text-sm text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                Back to sign in
              </Link>
            </motion.div>
          )}

          {state === "already-verified" && (
            <motion.div
              key="already-verified"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  Already verified
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Your email address is already verified. You can sign in to your account.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Sign in
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}