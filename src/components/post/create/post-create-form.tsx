"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PostTypeTabs, type PostType } from "./post-type-tabs";
import { CommunitySelector } from "./community-selector";
import { FlairSelector } from "./flair-selector";
import { PostOptionsBar } from "./post-options-bar";
import { DraftIndicator } from "./draft-indicator";
import { TextPostEditor } from "./text-post-editor";
import { LinkPostForm } from "./link-post-form";
import { ImagePostUpload } from "./image-post-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDraftStore } from "@/stores/draft.store";
import { AlertCircle, Send, Sparkles } from "lucide-react";

// ============================================================
// TYPES
// ============================================================

export interface PostFormData {
  title: string;
  type: PostType;
  communityId: string;
  communityName: string;
  body?: string;
  url?: string;
  images?: UploadedImage[];
  flairId?: string;
  flairText?: string;
  isNsfw: boolean;
  isSpoiler: boolean;
}

export interface UploadedImage {
  id: string;
  url: string;
  key: string;
  name: string;
  size: number;
  caption?: string;
}

export interface OGPreviewData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url?: string;
}

interface PostCreateFormProps {
  initialCommunity?: string;
}

// ============================================================
// VALIDATION
// ============================================================

function validateForm(data: PostFormData): string[] {
  const errors: string[] = [];

  if (!data.communityId) {
    errors.push("Please select a community");
  }

  if (!data.title.trim()) {
    errors.push("Title is required");
  } else if (data.title.trim().length < 3) {
    errors.push("Title must be at least 3 characters");
  } else if (data.title.trim().length > 300) {
    errors.push("Title must be under 300 characters");
  }

  if (data.type === "link") {
    if (!data.url?.trim()) {
      errors.push("URL is required for link posts");
    } else {
      try {
        new URL(data.url);
      } catch {
        errors.push("Please enter a valid URL");
      }
    }
  }

  if (data.type === "image") {
    if (!data.images || data.images.length === 0) {
      errors.push("Please upload at least one image");
    }
  }

  return errors;
}

// ============================================================
// COMPONENT
// ============================================================

export function PostCreateForm({ initialCommunity }: PostCreateFormProps) {
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [postType, setPostType] = useState<PostType>("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [selectedCommunityName, setSelectedCommunityName] = useState(
    initialCommunity ?? ""
  );
  const [flairId, setFlairId] = useState<string | undefined>(undefined);
  const [flairText, setFlairText] = useState<string | undefined>(undefined);
  const [isNsfw, setIsNsfw] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successRedirect, setSuccessRedirect] = useState<string | null>(null);

  // Draft store
  const { saveDraft, getDraft, clearDraft, draftSaveStatus } = useDraftStore();

  const DRAFT_ID = "main-post-draft";

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft(DRAFT_ID);
    if (draft && draft.type === "post") {
      if (draft.title) setTitle(draft.title);
      if (draft.postType) setPostType(draft.postType as PostType);
      if (draft.content) setBody(draft.content);
    }
  }, [getDraft]);

  // Auto-save draft
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (title || body || url) {
        saveDraft(DRAFT_ID, {
          id: DRAFT_ID,
          type: "post",
          postType: postType,
          title,
          content: body,
          communityId: selectedCommunityId || undefined,
          communityName: selectedCommunityName || undefined,
          isNsfw,
          isSpoiler,
          lastSaved: new Date(),
          lastModified: new Date(),
        });
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [
    title,
    body,
    url,
    postType,
    selectedCommunityId,
    selectedCommunityName,
    isNsfw,
    isSpoiler,
    saveDraft,
  ]);

  // Handle community selection
  const handleCommunitySelect = useCallback(
    (id: string, name: string) => {
      setSelectedCommunityId(id);
      setSelectedCommunityName(name);
      // Reset flair when community changes
      setFlairId(undefined);
      setFlairText(undefined);
    },
    []
  );

  // Handle post type change
  const handlePostTypeChange = useCallback((type: PostType) => {
    setPostType(type);
    setErrors([]);
  }, []);

  // Handle submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const formData: PostFormData = {
        title,
        type: postType,
        communityId: selectedCommunityId,
        communityName: selectedCommunityName,
        body: body || undefined,
        url: url || undefined,
        images: images.length > 0 ? images : undefined,
        flairId,
        flairText,
        isNsfw,
        isSpoiler,
      };

      const validationErrors = validateForm(formData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors([]);
      setIsSubmitting(true);

      try {
        // Simulate API call — in production, wire to tRPC
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Clear draft on success
        clearDraft(DRAFT_ID);

        // Redirect to post
        const mockPostId = `post_${Date.now()}`;
        setSuccessRedirect(
          `/c/${selectedCommunityName}/post/${mockPostId}`
        );
      } catch (err) {
        setErrors(["Failed to create post. Please try again."]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      title,
      postType,
      selectedCommunityId,
      selectedCommunityName,
      body,
      url,
      images,
      flairId,
      flairText,
      isNsfw,
      isSpoiler,
      clearDraft,
    ]
  );

  // Handle success redirect
  useEffect(() => {
    if (successRedirect) {
      router.push(successRedirect);
    }
  }, [successRedirect, router]);

  const titleCharCount = title.length;
  const titleMax = 300;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Community Selector */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <CommunitySelector
          value={selectedCommunityId}
          communityName={selectedCommunityName}
          onSelect={handleCommunitySelect}
        />
      </motion.div>

      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className={cn(
          "bg-white dark:bg-zinc-900",
          "border border-zinc-200 dark:border-zinc-800",
          "rounded-2xl overflow-hidden",
          "shadow-sm"
        )}
      >
        {/* Post Type Tabs */}
        <PostTypeTabs value={postType} onChange={handlePostTypeChange} />

        <div className="p-5 space-y-4">
          {/* Title Input */}
          <div className="space-y-1.5">
            <div className="relative">
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="An interesting title..."
                maxLength={titleMax}
                className={cn(
                  "text-base font-medium pr-20",
                  "bg-zinc-50 dark:bg-zinc-800/50",
                  "border-zinc-200 dark:border-zinc-700",
                  "rounded-xl"
                )}
              />
              <span
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono",
                  titleCharCount > titleMax * 0.9
                    ? "text-orange-500"
                    : "text-zinc-400 dark:text-zinc-500"
                )}
              >
                {titleCharCount}/{titleMax}
              </span>
            </div>
          </div>

          {/* Content Area — switches by post type */}
          <AnimatePresence mode="wait">
            {postType === "text" && (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <TextPostEditor value={body} onChange={setBody} />
              </motion.div>
            )}

            {postType === "link" && (
              <motion.div
                key="link"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <LinkPostForm value={url} onChange={setUrl} />
              </motion.div>
            )}

            {postType === "image" && (
              <motion.div
                key="image"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <ImagePostUpload images={images} onChange={setImages} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flair & Options Row */}
          {selectedCommunityId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap items-center gap-2 pt-1"
            >
              <FlairSelector
                communityId={selectedCommunityId}
                value={flairId}
                label={flairText}
                onSelect={(id, text) => {
                  setFlairId(id);
                  setFlairText(text);
                }}
              />
            </motion.div>
          )}

          {/* Post Options Bar */}
          <PostOptionsBar
            isNsfw={isNsfw}
            isSpoiler={isSpoiler}
            onNsfwChange={setIsNsfw}
            onSpoilerChange={setIsSpoiler}
          />
        </div>

        {/* Footer */}
        <div
          className={cn(
            "px-5 py-4",
            "border-t border-zinc-100 dark:border-zinc-800",
            "bg-zinc-50/50 dark:bg-zinc-900/50",
            "flex items-center justify-between gap-4"
          )}
        >
          {/* Draft Indicator */}
          <DraftIndicator status={draftSaveStatus} />

          {/* Error display */}
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 text-red-500 text-sm flex-1"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors[0]}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !selectedCommunityId}
              className={cn(
                "gap-2 px-6",
                "bg-orange-500 hover:bg-orange-600 text-white",
                "shadow-orange-500/25 shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Post</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Rules hint */}
      {selectedCommunityId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "p-4 rounded-xl",
            "bg-orange-50 dark:bg-orange-950/20",
            "border border-orange-200 dark:border-orange-900/50",
            "text-sm text-orange-800 dark:text-orange-200"
          )}
        >
          <div className="flex items-center gap-2 font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Posting to c/{selectedCommunityName}</span>
          </div>
          <p className="text-xs text-orange-700 dark:text-orange-300/80">
            Remember to follow the community rules and Threadscape's content
            policy. Be kind and constructive.
          </p>
        </motion.div>
      )}
    </form>
  );
}