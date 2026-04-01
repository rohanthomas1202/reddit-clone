"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b] flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center max-w-lg mx-auto"
      >
        {/* 404 Display */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="text-[10rem] font-black leading-none tracking-tighter select-none">
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-clip-text text-transparent">
              4
            </span>
            <span className="text-zinc-200 dark:text-zinc-800">0</span>
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 bg-clip-text text-transparent">
              4
            </span>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center"
          >
            <span className="text-2xl">🔍</span>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="absolute -bottom-4 -left-4 w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center"
          >
            <span className="text-xl">🌐</span>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-10"
        >
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Thread Not Found
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
            The page you&apos;re looking for has been deleted, moved, or never
            existed. Let&apos;s get you back on track.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md hover:-translate-y-0.5"
          >
            <Search className="w-4 h-4" />
            Search
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>

        {/* Popular links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800"
        >
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4 flex items-center justify-center gap-2">
            <Compass className="w-4 h-4" />
            Popular Destinations
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { href: "/r/technology", label: "r/technology" },
              { href: "/r/gaming", label: "r/gaming" },
              { href: "/r/science", label: "r/science" },
              { href: "/popular", label: "Popular" },
              { href: "/all", label: "All Posts" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}