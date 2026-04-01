"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface OAuthButtonsProps {
  callbackUrl?: string;
  mode?: "login" | "register";
}

type Provider = "google" | "github";

// SVG icons as components to avoid external dependencies
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.6 10.23c0-.68-.06-1.36-.16-2H10v3.77h5.39a4.6 4.6 0 01-2 3.02v2.52h3.23C18.34 15.9 19.6 13.27 19.6 10.23z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 4.97-.9 6.62-2.46l-3.23-2.52c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.6-4.12H1.07v2.6A9.99 9.99 0 0010 20z"
        fill="#34A853"
      />
      <path
        d="M4.4 11.85A6 6 0 014.16 10c0-.65.11-1.28.24-1.85V5.55H1.07A9.99 9.99 0 000 10c0 1.61.39 3.14 1.07 4.45l3.33-2.6z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.98c1.47 0 2.78.5 3.82 1.5L16.69 2.5A9.94 9.94 0 0010 0 9.99 9.99 0 001.07 5.55L4.4 8.15C5.2 5.74 7.4 3.98 10 3.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
      />
    </svg>
  );
}

export function OAuthButtons({ callbackUrl = "/home", mode = "login" }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleOAuth = async (provider: Provider) => {
    if (loadingProvider) return;
    setLoadingProvider(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setLoadingProvider(null);
    }
  };

  const actionLabel = mode === "login" ? "Continue" : "Sign up";

  return (
    <div className="space-y-3">
      {/* Google */}
      <motion.button
        onClick={() => handleOAuth("google")}
        disabled={!!loadingProvider}
        whileHover={{ scale: loadingProvider ? 1 : 1.01 }}
        whileTap={{ scale: loadingProvider ? 1 : 0.99 }}
        className="relative w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 group overflow-hidden"
      >
        {/* Hover shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] [transition:transform_0.6s_ease,opacity_0.3s_ease]" />
        
        {loadingProvider === "google" ? (
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        ) : (
          <GoogleIcon />
        )}
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {actionLabel} with Google
        </span>
      </motion.button>

      {/* GitHub */}
      <motion.button
        onClick={() => handleOAuth("github")}
        disabled={!!loadingProvider}
        whileHover={{ scale: loadingProvider ? 1 : 1.01 }}
        whileTap={{ scale: loadingProvider ? 1 : 0.99 }}
        className="relative w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 group overflow-hidden"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] [transition:transform_0.6s_ease,opacity_0.3s_ease]" />
        
        {loadingProvider === "github" ? (
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        ) : (
          <GitHubIcon className="text-zinc-700 dark:text-zinc-200" />
        )}
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {actionLabel} with GitHub
        </span>
      </motion.button>
    </div>
  );
}