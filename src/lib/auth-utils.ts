import { hash, verify } from "@node-rs/argon2";

// ============================================================
// ARGON2 PASSWORD HASHING
// ============================================================

const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
  outputLen: 32,
} as const;

/**
 * Hash a plaintext password using Argon2id
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return await hash(plaintext, ARGON2_OPTIONS);
}

/**
 * Verify a plaintext password against an Argon2id hash
 */
export async function verifyPassword(
  plaintext: string,
  hashed: string,
): Promise<boolean> {
  try {
    return await verify(hashed, plaintext, ARGON2_OPTIONS);
  } catch {
    return false;
  }
}

// ============================================================
// TOKEN UTILITIES
// ============================================================

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(byteLength = 32): string {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  const num =
    ((array[0]! << 24) | (array[1]! << 16) | (array[2]! << 8) | array[3]!) >>>
    0;
  return String(num % 1_000_000).padStart(6, "0");
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export async function safeCompare(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aEncoded = encoder.encode(a);
  const bEncoded = encoder.encode(b);

  if (aEncoded.byteLength !== bEncoded.byteLength) {
    return false;
  }

  const aKey = await crypto.subtle.importKey(
    "raw",
    aEncoded,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const aHmac = await crypto.subtle.sign("HMAC", aKey, aEncoded);
  const bHmac = await crypto.subtle.sign("HMAC", aKey, bEncoded);

  const aView = new Uint8Array(aHmac);
  const bView = new Uint8Array(bHmac);

  let result = 0;
  for (let i = 0; i < aView.length; i++) {
    result |= (aView[i] ?? 0) ^ (bView[i] ?? 0);
  }

  return result === 0;
}