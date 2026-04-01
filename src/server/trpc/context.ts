import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { redis } from "@/server/db/redis";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

// ============================================================
// CONTEXT TYPES
// ============================================================

export interface TRPCContext {
  session: Session | null;
  db: typeof db;
  redis: typeof redis;
  req: NextRequest;
  headers: Headers;
}

export interface AuthenticatedTRPCContext extends TRPCContext {
  session: Session & {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      username: string | null;
      role: string;
      karma: number;
      emailVerified: boolean;
    };
  };
}

// ============================================================
// CONTEXT FACTORY
// ============================================================

/**
 * Creates the tRPC context for each request.
 * Attaches session, db, and redis instances.
 */
export async function createTRPCContext(opts: {
  req: NextRequest;
  headers: Headers;
}): Promise<TRPCContext> {
  const session = await auth();

  return {
    session,
    db,
    redis,
    req: opts.req,
    headers: opts.headers,
  };
}

export type { Session };