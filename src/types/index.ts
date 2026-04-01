// Core type exports for Threadscape
// Re-exports all domain types for convenient importing

export type * from './user';
export type * from './community';
export type * from './post';
export type * from './comment';
export type * from './feed';
export type * from './notification';
export type * from './message';
export type * from './moderation';

// ============================================================
// SHARED UTILITY TYPES
// ============================================================

/** Pagination cursor-based params */
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

/** API success response */
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/** API error response */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** API response union */
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Time range filter */
export type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

/** Content visibility */
export type Visibility = 'public' | 'private' | 'restricted';

/** Vote type */
export type VoteType = 'UP' | 'DOWN';

/** Vote value as number */
export type VoteValue = 1 | -1 | 0;

/** Media type */
export type MediaType = 'image' | 'video' | 'gif' | 'link';

/** Theme preference */
export type Theme = 'light' | 'dark' | 'system';

/** Generic ID type */
export type ID = string;

/** Timestamp fields common to all entities */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/** Soft-delete field */
export interface SoftDelete {
  deletedAt: Date | null;
}

/** Generic key-value metadata */
export type Metadata = Record<string, string | number | boolean | null>;

/** Image upload result */
export interface UploadedImage {
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

/** Color hex string */
export type HexColor = `#${string}`;

/** URL string brand type */
export type UrlString = string & { readonly __brand: 'url' };

/** Nullable helper */
export type Nullable<T> = T | null;

/** Optional helper */
export type Optional<T> = T | undefined;

/** Make specific keys required */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specific keys optional */
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Deep partial */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Extract array element type */
export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer U)[] ? U : never;

/** Action result for mutations */
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}