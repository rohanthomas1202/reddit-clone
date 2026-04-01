import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  CreditCard, 
  HelpCircle,
  ChevronRight,
  Settings,
  Lock,
  Eye,
  Zap,
  Globe,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings | Threadscape",
  description: "Manage your Threadscape account settings",
};

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  gradient: string;
  iconColor: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "profile",
    title: "Profile",
    description: "Customize your display name, bio, avatar, and public profile appearance",
    icon: User,
    href: "/settings/profile",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
  },
  {
    id: "account",
    title: "Account",
    description: "Manage email, password, connected accounts, and privacy settings",
    icon: Shield,
    href: "/settings/account",
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-400",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Control how and when you receive notifications about your activity",
    icon: Bell,
    href: "/settings/notifications",
    badge: "New",
    gradient: "from-orange-500/20 to-amber-500/10",
    iconColor: "text-orange-400",
  },
];

const QUICK_LINKS = [
  { label: "Privacy Policy", href: "/privacy", icon: Lock },
  { label: "Terms of Service", href: "/terms", icon: Globe },
  { label: "Help Center", href: "/help", icon: HelpCircle },
  { label: "Contact Support", href: "/support", icon: Smartphone },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Settings
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Main Settings Cards */}
        <div className="space-y-3 mb-10">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={section.href}
                className={cn(
                  "group relative flex items-center gap-5 p-5 rounded-2xl",
                  "bg-white dark:bg-zinc-900/80",
                  "border border-zinc-200/80 dark:border-zinc-800/80",
                  "hover:border-zinc-300 dark:hover:border-zinc-700",
                  "transition-all duration-200",
                  "hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-zinc-900/20",
                  "hover:-translate-y-0.5"
                )}
              >
                {/* Gradient background */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    `bg-gradient-to-r ${section.gradient}`
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    "relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                    "bg-zinc-100 dark:bg-zinc-800",
                    "group-hover:scale-110 transition-transform duration-200"
                  )}
                >
                  <Icon className={cn("w-5 h-5", section.iconColor)} />
                </div>

                {/* Content */}
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {section.title}
                    </span>
                    {section.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {section.description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  className={cn(
                    "relative shrink-0 w-5 h-5 text-zinc-400 dark:text-zinc-600",
                    "group-hover:text-zinc-600 dark:group-hover:text-zinc-400",
                    "group-hover:translate-x-0.5 transition-all duration-200"
                  )}
                />
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-50 dark:bg-[#0a0a0b] px-3 text-zinc-400 dark:text-zinc-600 font-medium tracking-wider">
              More
            </span>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl",
                  "bg-white dark:bg-zinc-900/80",
                  "border border-zinc-200/80 dark:border-zinc-800/80",
                  "hover:border-zinc-300 dark:hover:border-zinc-700",
                  "text-zinc-600 dark:text-zinc-400",
                  "hover:text-zinc-900 dark:hover:text-zinc-200",
                  "transition-all duration-150",
                  "text-sm font-medium"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Version info */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          Threadscape v0.1.0 · Built with ❤️
        </p>
      </div>
    </div>
  );
}