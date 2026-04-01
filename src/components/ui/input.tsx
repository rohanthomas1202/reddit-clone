"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// ============================================================
// VARIANTS
// ============================================================

const inputVariants = cva(
  [
    "w-full font-normal text-zinc-900 dark:text-zinc-100",
    "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
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
        ],
        filled: [
          "border border-transparent",
          "bg-zinc-100 dark:bg-zinc-800",
          "focus-visible:bg-white dark:focus-visible:bg-zinc-900",
          "focus-visible:border-orange-400 dark:focus-visible:border-orange-500",
          "focus-visible:ring-2 focus-visible:ring-orange-400/20 dark:focus-visible:ring-orange-500/20",
        ],
        ghost: [
          "border-b border-zinc-200 dark:border-zinc-700 rounded-none",
          "bg-transparent",
          "focus-visible:border-orange-400 dark:focus-visible:border-orange-500",
          "px-0",
        ],
        glass: [
          "border border-white/20 dark:border-white/10",
          "bg-white/10 dark:bg-white/5 backdrop-blur-md",
          "focus-visible:border-orange-400/60 dark:focus-visible:border-orange-500/60",
          "focus-visible:ring-2 focus-visible:ring-orange-400/20",
          "placeholder:text-white/50",
          "text-white dark:text-white",
        ],
      },
      inputSize: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-10 px-3.5 text-sm rounded-xl",
        lg: "h-12 px-4 text-base rounded-xl",
      },
      state: {
        default: "",
        error: [
          "!border-red-400 dark:!border-red-500",
          "focus-visible:!ring-red-400/20 dark:focus-visible:!ring-red-500/20",
        ],
        success: [
          "!border-green-400 dark:!border-green-500",
          "focus-visible:!ring-green-400/20 dark:focus-visible:!ring-green-500/20",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
      state: "default",
    },
  }
);

// ============================================================
// TYPES
// ============================================================

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  wrapperClassName?: string;
}

// ============================================================
// COMPONENT
// ============================================================

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      state,
      label,
      hint,
      error,
      success,
      leftElement,
      rightElement,
      wrapperClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? React.useId();
    const computedState = error ? "error" : success ? "success" : state;

    const hasLeft = Boolean(leftElement);
    const hasRight = Boolean(rightElement);

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

        <div className="relative flex items-center">
          {hasLeft && (
            <div className="absolute left-3 flex items-center justify-center text-zinc-400 dark:text-zinc-500 pointer-events-none z-10">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, inputSize, state: computedState }),
              hasLeft && "pl-9",
              hasRight && "pr-9",
              className
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                  ? `${inputId}-hint`
                  : undefined
            }
            {...props}
          />

          {hasRight && (
            <div className="absolute right-3 flex items-center justify-center text-zinc-400 dark:text-zinc-500 z-10">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm-.5 2.5h1v4h-1v-4zm0 5h1v1h-1v-1z" />
            </svg>
            {error}
          </p>
        )}

        {success && !error && (
          <p className="text-xs text-green-500 dark:text-green-400 flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm2.854 3.854-3.5 3.5a.5.5 0 0 1-.707 0l-1.5-1.5a.5.5 0 1 1 .707-.708L5 7.293l3.146-3.147a.5.5 0 0 1 .708.708z" />
            </svg>
            {success}
          </p>
        )}

        {hint && !error && !success && (
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

Input.displayName = "Input";

export { Input, inputVariants };