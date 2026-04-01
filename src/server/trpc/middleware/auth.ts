import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

/**
 * Enforces authentication. Throws UNAUTHORIZED if no session.
 */
export const isAuthenticated = middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Enforces admin role.
 */
export const isAdmin = middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }

  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Enforces moderator or admin role.
 */
export const isModOrAdmin = middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }

  const role = ctx.session.user.role;
  if (role !== "MOD" && role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Moderator access required.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Checks if user's email is verified.
 */
export const isEmailVerified = middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }

  if (!ctx.session.user.emailVerified) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Email verification required.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});