import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { SkipNav, SkipNavTarget } from "@/components/layout/skip-nav";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// ============================================================
// FONTS
// ============================================================

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

// ============================================================
// METADATA
// ============================================================

const BASE_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://threadscape.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | Threadscape",
    default: "Threadscape — Modern Community Discussion Platform",
  },
  description:
    "Threadscape is a beautiful, modern community discussion platform. Discover, share, and engage with communities you love.",
  keywords: [
    "threadscape",
    "community",
    "discussion",
    "forum",
    "social",
    "reddit alternative",
    "modern forum",
  ],
  authors: [{ name: "Threadscape Team" }],
  creator: "Threadscape",
  publisher: "Threadscape",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Threadscape",
    title: "Threadscape — Modern Community Discussion Platform",
    description:
      "Discover, share, and engage with communities you love on Threadscape.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Threadscape — Modern Community Discussion Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Threadscape — Modern Community Discussion Platform",
    description:
      "Discover, share, and engage with communities you love on Threadscape.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@threadscape",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: process.env["GOOGLE_SITE_VERIFICATION"],
  },
  other: {
    "color-scheme": "dark light",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark light",
};

// ============================================================
// PROVIDERS WRAPPER
// ============================================================

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="threadscape-theme"
        >
          <ToastProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}

// ============================================================
// ROOT LAYOUT
// ============================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://uploadthing.com" />
        <link rel="dns-prefetch" href="https://utfs.io" />

        {/* Inline critical theme script to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var stored = localStorage.getItem('threadscape-theme');
    var theme = stored ? JSON.parse(stored) : null;
    var mode = theme && theme.state ? theme.state.mode : 'system';
    var isDark = mode === 'dark' || 
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}
})();
            `.trim(),
          }}
        />
      </head>
      <body
        className={[
          "min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]",
          "text-zinc-900 dark:text-zinc-100",
          "font-sans antialiased",
          "selection:bg-orange-500/20 selection:text-orange-600 dark:selection:text-orange-400",
          "overflow-x-hidden",
        ].join(" ")}
      >
        {/* Skip navigation for keyboard/screen reader users */}
        <SkipNav />

        {/* Providers tree */}
        <Providers>
          {/* Live region for screen reader announcements */}
          <div
            id="aria-live-region"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />
          {/* Alert live region for urgent messages */}
          <div
            id="aria-alert-region"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="sr-only"
          />

          {/* Main content target for skip-nav */}
          <SkipNavTarget id="main-content" />

          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Providers>

        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}