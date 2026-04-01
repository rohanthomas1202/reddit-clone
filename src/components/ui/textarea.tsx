"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// ============================================================
// VARIANTS
// ============================================================

const textareaVariants = cva(
  [
    "w-full font-normal text-sm text-zinc-900 dark:text-zinc-100",
    "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "resize-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "border border-zinc-200 dark:border-zinc-700",
          "bg-white dark:bg-zinc-900",
          "focus-visible:border-orange-400 dark:focus-visible:border-orange-500",
          "focus-visible:ring-2 focus-visible:ring-orange-400/20 dark:focus-visible:ring-orange-500/20",
          "hover:border-zinc-300 dark:hover:border-zinc-600",
          "rounded-xl px-3.5 py-2.5",
        ],
        filled: [
          "border border-transparent",
          "bg-zinc-100 dark:bg-zinc-800",
          "focus-visible:bg-white dark:focus-visible:bg-zinc-900",
          "focus-visible:border-orange-400 dark:focus-visible:border-orange-500",
          "focus-visible:ring-2 focus-visible:ring-orange-400/20 dark:focus-visible:ring-orange-500/20",
          "rounded-xl px-3.5 py-2.5",
        ],
        ghost: [
          "border-0 bg-transparent",
          "focus-visible:ring-0",
          "px-0 py-1",
        ],
      },
      state: {
        default: "",
        error: [
          "!border-red-400 dark:!border-red-500",
          "focus-visible:!ring-red-400/20 dark:focus-visible:!ring-red-500/20",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      state: "default",
    },
  }
);

// ============================================================
// AUTO-RESIZE HOOK
// ============================================================

function useAutoResize(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  autoResize: boolean,
  value?: string | number | readonly string[]
) {
  React.useEffect(() => {
    if (!autoResize || !ref.current) return;
    const el = ref.current;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoResize, ref, value]);
}

// ============================================================
// TYPES
// ============================================================

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  hint?: string;
  error?: string;
  autoResize?: boolean;
  showCount?: boolean;
  maxLength?: number;
  wrapperClassName?: string;
}

// ============================================================
// COMPONENT
// ============================================================

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      state,
      label,
      hint,
      error,
      autoResize = false,
      showCount = false,
      maxLength,
      wrapperClassName,
      id,
      value,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const inputId = id ?? React.useId();
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const ref =
      (forwardedRef as React.RefObject<HTMLTextAreaElement>) ?? internalRef;

    const [charCount, setCharCount] = React.useState(
      typeof value === "string" ? value.length : 0
    );

    useAutoResize(ref, autoResize, value);

    const computedState = error ? "error" : state;

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length);
        onChange?.(e);
      },
      [onChange]
    );

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={inputId}
            className={cn(
              textareaVariants({ variant, state: computedState }),
              showCount && "pb-8",
              className
            )}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {showCount && (
            <div className="absolute bottom-2.5 right-3 text-xs text-zinc-400 dark:text-zinc-500 pointer-events-none">
              <span
                className={cn(
                  maxLength && charCount > maxLength * 0.9 && "text-orange-400",
                  maxLength && charCount >= maxLength && "text-red-400"
                )}
              >
                {charCount}
              </span>
              {maxLength && (
                <span className="text-zinc-300 dark:text-zinc-600">
                  /{maxLength}
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-500 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };