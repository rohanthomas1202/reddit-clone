"use client";

import { useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ChevronRight,
  Bug,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ============================================================
// ERROR COPY BUTTON
// ============================================================

function CopyErrorButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg",
        "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700",
        "text-zinc-600 dark:text-zinc-400 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900"
      )}
      aria-label={copied ? "Error details copied" : "Copy error details"}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Copy details</span>
        </>
      )}
    </button>
  );
}

// ============================================================
// MAIN ERROR PAGE
// ============================================================

export default function GlobalError({ error, reset }: ErrorPageProps) {
  const resetButtonRef = useRef<HTMLButtonElement>(null);

  // Log error to Sentry / console
  useEffect(() => {
    // Report to Sentry if available
    if (typeof window !== "undefined") {
      const Sentry = (window as unknown as { Sentry?: { captureException: (e: unknown) => void } }).Sentry;
      if (Sentry?.captureException) {
        Sentry.captureException(error);
      }
    }

    console.error("[GlobalError]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  // Announce error to screen readers
  useEffect(() => {
    const liveRegion = document.getElementById("aria-alert-region");
    if (liveRegion) {
      liveRegion.textContent =
        "An unexpected error occurred. Please try refreshing the page.";
    }
    // Focus the reset button for keyboard users
    setTimeout(() => {
      resetButtonRef.current?.focus();
    }, 300);

    return () => {
      if (liveRegion) liveRegion.textContent = "";
    };
  }, []);

  const errorDetails = [
    error.message && `Message: ${error.message}`,
    error.digest && `Digest: ${error.digest}`,
    typeof window !== "undefined" && `URL: ${window.location.href}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div
      className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b] flex items-center justify-center px-4"
      role="main"
      aria-labelledby="error-heading"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-lg text-center"
      >
        {/* Icon */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
          aria-hidden="true"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-red-500/20 animate-ping" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          id="error-heading"
          variants={itemVariants}
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3"
        >
          Something went wrong
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed mb-8 max-w-sm mx-auto"
        >
          We hit an unexpected snag. Our team has been notified. You can try
          refreshing, or head back home.
        </motion.p>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
        >
          <button
            ref={resetButtonRef}
            onClick={reset}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl",
              "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
              "text-white font-semibold text-sm",
              "transition-all duration-200 shadow-lg shadow-orange-500/25",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
              "focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-[#0a0a0b]"
            )}
            aria-label="Try refreshing the page"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </button>

          <Link
            href="/home"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl",
              "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
              "text-zinc-700 dark:text-zinc-300 font-semibold text-sm",
              "hover:bg-zinc-50 dark:hover:bg-zinc-800",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
              "focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-[#0a0a0b]"
            )}
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go home
          </Link>
        </motion.div>

        {/* Error details (collapsible) */}
        {(error.message || error.digest) && (
          <motion.details
            variants={itemVariants}
            className={cn(
              "group text-left rounded-xl border border-zinc-200 dark:border-zinc-800",
              "bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden"
            )}
          >
            <summary
              className={cn(
                "flex items-center justify-between gap-2 px-4 py-3 cursor-pointer",
                "text-sm font-medium text-zinc-600 dark:text-zinc-400",
                "hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors",
                "list-none select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
              )}
            >
              <span className="flex items-center gap-2">
                <Bug className="w-4 h-4" aria-hidden="true" />
                Technical details
              </span>
              <ChevronRight
                className="w-4 h-4 transition-transform duration-200 group-open:rotate-90"
                aria-hidden="true"
              />
            </summary>
            <div className="px-4 pb-4 pt-1 space-y-3">
              <pre
                className={cn(
                  "text-xs font-mono text-zinc-600 dark:text-zinc-400",
                  "bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3",
                  "overflow-x-auto whitespace-pre-wrap break-all"
                )}
                aria-label="Error details"
              >
                {errorDetails}
              </pre>
              <div className="flex items-center justify-end">
                <CopyErrorButton text={errorDetails} />
              </div>
            </div>
          </motion.details>
        )}

        {/* Footer links */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex items-center justify-center gap-6 text-sm text-zinc-400 dark:text-zinc-600"
        >
          <Link
            href="/home"
            className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Home
          </Link>
          <Link
            href="/popular"
            className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Popular
          </Link>
          <a
            href="mailto:support@threadscape.app"
            className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Support
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}