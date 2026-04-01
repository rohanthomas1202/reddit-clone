import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { z } from "zod";

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================
// PROVIDERS CONFIGURATION
// ============================================================

const providers: Provider[] = [
  Google({
    clientId: process.env["GOOGLE_CLIENT_ID"]!,
    clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
        scope: "openid email profile",
      },
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        emailVerified: profile.email_verified ? new Date() : null,
      };
    },
  }),
  GitHub({
    clientId: process.env["GITHUB_CLIENT_ID"]!,
    clientSecret: process.env["GITHUB_CLIENT_SECRET"]!,
    profile(profile) {
      return {
        id: String(profile.id),
        name: profile.name ?? profile.login,
        email: profile.email,
        image: profile.avatar_url,
        emailVerified: null,
      };
    },
  }),
  Credentials({
    id: "credentials",
    name: "Email & Password",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "you@example.com",
      },
      password: {
        label: "Password",
        type: "password",
      },
    },
    async authorize(credentials) {
      // Validate input schema
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      // Dynamic import to avoid circular dependencies
      const { db } = await import("@/server/db");
      const { verifyPassword } = await import("@/lib/auth-utils");

      const user = await db.user.findUnique({
        where: { email: parsed.data.email },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          passwordHash: true,
          image: true,
          role: true,
          status: true,
          emailVerified: true,
          karma: true,
        },
      });

      if (!user || !user.passwordHash) {
        return null;
      }

      // Check account status
      if (user.status === "BANNED" || user.status === "DELETED") {
        return null;
      }

      const isValidPassword = await verifyPassword(
        parsed.data.password,
        user.passwordHash,
      );

      if (!isValidPassword) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.displayName ?? user.username,
        image: user.image,
        role: user.role,
        status: user.status,
        username: user.username,
        karma: user.karma,
        emailVerified: user.emailVerified,
      };
    },
  }),
];

// ============================================================
// AUTH CONFIG (no DB adapter — pure config)
// Used in middleware (edge runtime compatible)
// ============================================================

export const authConfig: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify-email",
    newUser: "/register/onboarding",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours — refresh session token daily
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnSettings = nextUrl.pathname.startsWith("/settings");
      const isOnSubmit = nextUrl.pathname.startsWith("/submit");
      const isOnMessages = nextUrl.pathname.startsWith("/messages");
      const isOnModQueue = nextUrl.pathname.startsWith("/mod");

      const protectedRoutes = [
        isOnDashboard,
        isOnSettings,
        isOnSubmit,
        isOnMessages,
        isOnModQueue,
      ];

      const isProtected = protectedRoutes.some(Boolean);

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      }

      return true;
    },
  },
  trustHost: true,
  debug: process.env["NODE_ENV"] === "development",
};