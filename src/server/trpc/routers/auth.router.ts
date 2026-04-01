import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { rateLimitAuth } from "../middleware/rateLimit";

// ============================================================
// SCHEMAS
// ============================================================

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

// ============================================================
// ROUTER
// ============================================================

export const authRouter = createTRPCRouter({
  /**
   * Register a new user with email/password
   */
  register: publicProcedure
    .use(rateLimitAuth)
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if username already exists
      const existingUsername = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: { id: true },
      });

      if (existingUsername) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken.",
        });
      }

      // Check if email already exists
      const existingEmail = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });

      if (existingEmail) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered.",
        });
      }

      // Hash the password
      const hashedPassword = await hashPassword(input.password);

      // Create user
      const user = await ctx.db.user.create({
        data: {
          username: input.username,
          email: input.email,
          password: hashedPassword,
          displayName: input.username,
          settings: {
            create: {},
          },
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    }),

  /**
   * Get current session user
   */
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.session?.user) return null;
    return ctx.session.user;
  }),

  /**
   * Change password for authenticated user
   */
  changePassword: protectedProcedure
    .use(rateLimitAuth)
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { id: ctx.session.user.id },
        select: { id: true, password: true },
      });

      if (!user.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account uses OAuth — no password set.",
        });
      }

      const isValid = await verifyPassword(input.currentPassword, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect.",
        });
      }

      const hashed = await hashPassword(input.newPassword);
      await ctx.db.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      return { success: true };
    }),

  /**
   * Request password reset email
   */
  forgotPassword: publicProcedure
    .use(rateLimitAuth)
    .input(forgotPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true, email: true, username: true },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return { success: true };
      }

      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      await ctx.redis.set(`password:reset:${token}`, user.id, { ex: 3600 });

      // In production, send email via email service
      // await emailService.sendPasswordReset({ email: user.email, token, username: user.username });

      return { success: true };
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .use(rateLimitAuth)
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = await ctx.redis.get<string>(`password:reset:${input.token}`);

      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token.",
        });
      }

      const hashed = await hashPassword(input.newPassword);
      await ctx.db.user.update({
        where: { id: userId },
        data: { password: hashed },
      });

      // Invalidate the token
      await ctx.redis.del(`password:reset:${input.token}`);

      return { success: true };
    }),

  /**
   * Check username availability
   */
  checkUsername: publicProcedure
    .input(z.object({ username: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: { id: true },
      });
      return { available: !existing };
    }),

  /**
   * Delete account
   */
  deleteAccount: protectedProcedure
    .input(z.object({ password: z.string().optional(), confirmText: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.confirmText !== "DELETE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please type DELETE to confirm account deletion.",
        });
      }

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          status: "DELETED",
          deletedAt: new Date(),
          email: `deleted_${ctx.session.user.id}@threadscape.deleted`,
          username: `deleted_${ctx.session.user.id.slice(0, 8)}`,
        },
      });

      return { success: true };
    }),
});