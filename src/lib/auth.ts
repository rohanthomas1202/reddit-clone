import { db } from "@/server/db";
import { redis } from "@/server/db/redis";
import NextAuth from "next-auth";
import { cache } from "react";
import { authConfig } from "./auth.config";

// ============================================================
// EXTENDED TYPE DECLARATIONS
// ============================================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      username: string;
      role: "USER" | "MOD" | "ADMIN";
      status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
      karma: number;
      emailVerified: Date | null;
    };
  }

  interface User {
    id?: string;
    username?: string;
    role?: "USER" | "MOD" | "ADMIN";
    status?: "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
    karma?: number;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: "USER" | "MOD" | "ADMIN";
    status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
    karma: number;
    emailVerified: Date | null;
    provider?: string;
  }
}

// ============================================================
// SESSION CACHE KEY
// ============================================================

const SESSION_CACHE_TTL = 60 * 5; // 5 minutes

function getSessionCacheKey(userId: string): string {
  return `session:user:${userId}`;
}

// ============================================================
// NEXTAUTH INITIALIZATION WITH FULL CALLBACKS
// ============================================================

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update: updateSession,
} = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account, profile }) {
      try {
        if (!user.email) return false;

        // Block banned/deleted accounts
        if (
          user.status === "BANNED" ||
          user.status === "DELETED"
        ) {
          return false;
        }

        // Handle OAuth sign-ins
        if (account?.provider === "google" || account?.provider === "github") {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
            select: { id: true, status: true, emailVerified: true },
          });

          if (existingUser) {
            // Block suspended/banned users
            if (
              existingUser.status === "BANNED" ||
              existingUser.status === "DELETED"
            ) {
              return false;
            }

            // Link OAuth account if not already linked
            const existingAccount = await db.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: account.provider,
              },
            });

            if (!existingAccount) {
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            }

            // Mark email as verified for OAuth users
            if (!existingUser.emailVerified) {
              await db.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() },
              });
            }

            return true;
          }

          // Create new user for first-time OAuth sign-in
          const username = await generateUniqueUsername(
            profile?.login as string ?? 
            profile?.name as string ?? 
            user.email.split("@")[0]!
          );

          await db.user.create({
            data: {
              email: user.email,
              username,
              displayName: user.name ?? username,
              image: user.image,
              emailVerified: new Date(),
              role: "USER",
              status: "ACTIVE",
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              },
            },
          });

          return true;
        }

        return true;
      } catch (error) {
        console.error("[Auth] signIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign-in — populate token from user object
      if (user && user.id) {
        token.id = user.id;
        token.username = user.username ?? "";
        token.role = user.role ?? "USER";
        token.status = user.status ?? "ACTIVE";
        token.karma = user.karma ?? 0;
        token.emailVerified = user.emailVerified ?? null;
        token.provider = account?.provider;

        // If new OAuth user, fetch from DB to get generated username
        if (account?.provider === "google" || account?.provider === "github") {
          const dbUser = await db.user.findUnique({
            where: { email: token.email! },
            select: {
              id: true,
              username: true,
              role: true,
              status: true,
              karma: true,
              emailVerified: true,
            },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.username = dbUser.username;
            token.role = dbUser.role as "USER" | "MOD" | "ADMIN";
            token.status = dbUser.status as "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
            token.karma = dbUser.karma;
            token.emailVerified = dbUser.emailVerified;
          }
        }

        return token;
      }

      // Manual session update (e.g., after profile edit)
      if (trigger === "update" && session) {
        if (session.username) token.username = session.username;
        if (session.image) token.picture = session.image;
        if (session.name) token.name = session.name;

        // Invalidate cache on update
        await redis.del(getSessionCacheKey(token.id));
        return token;
      }

      // Refresh token data from Redis cache or DB
      if (token.id) {
        const cacheKey = getSessionCacheKey(token.id);
        const cached = await redis.get<{
          role: "USER" | "MOD" | "ADMIN";
          status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
          karma: number;
          username: string;
        }>(cacheKey);

        if (cached) {
          token.role = cached.role;
          token.status = cached.status;
          token.karma = cached.karma;
          token.username = cached.username;
        } else {
          // Fetch fresh data from DB
          const dbUser = await db.user.findUnique({
            where: { id: token.id },
            select: {
              role: true,
              status: true,
              karma: true,
              username: true,
              emailVerified: true,
            },
          });

          if (dbUser) {
            token.role = dbUser.role as "USER" | "MOD" | "ADMIN";
            token.status = dbUser.status as "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
            token.karma = dbUser.karma;
            token.username = dbUser.username;
            token.emailVerified = dbUser.emailVerified;

            // Cache for 5 minutes
            await redis.set(
              cacheKey,
              {
                role: dbUser.role,
                status: dbUser.status,
                karma: dbUser.karma,
                username: dbUser.username,
              },
              { ex: SESSION_CACHE_TTL },
            );
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.karma = token.karma;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        // Update last seen timestamp
        await db.user
          .update({
            where: { id: user.id },
            data: { updatedAt: new Date() },
          })
          .catch((err) => console.error("[Auth] Failed to update lastSeen:", err));
      }
    },
    async signOut({ token }) {
      if (token && typeof token === "object" && "id" in token) {
        const userId = (token as { id: string }).id;
        // Invalidate session cache on sign-out
        await redis
          .del(getSessionCacheKey(userId))
          .catch((err) =>
            console.error("[Auth] Failed to invalidate session cache:", err),
          );
      }
    },
  },
});

// ============================================================
// CACHED SESSION HELPER (React cache — deduplicates per request)
// ============================================================

export const getSession = cache(async () => {
  return await auth();
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});

export const requireAuth = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
});

// ============================================================
// USERNAME GENERATION HELPER
// ============================================================

async function generateUniqueUsername(base: string): Promise<string> {
  // Sanitize: lowercase, replace invalid chars, trim to 18 chars
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);

  const candidate = sanitized.length >= 3 ? sanitized : `user_${sanitized}`;

  // Check availability
  const exists = await db.user.findUnique({
    where: { username: candidate },
    select: { id: true },
  });

  if (!exists) return candidate;

  // Append random suffix to make unique
  for (let i = 0; i < 10; i++) {
    const suffix = Math.floor(Math.random() * 9000) + 1000;
    const withSuffix = `${candidate.slice(0, 15)}_${suffix}`;
    const existsWithSuffix = await db.user.findUnique({
      where: { username: withSuffix },
      select: { id: true },
    });
    if (!existsWithSuffix) return withSuffix;
  }

  // Fallback: use timestamp
  return `${candidate.slice(0, 10)}_${Date.now().toString(36)}`;
}