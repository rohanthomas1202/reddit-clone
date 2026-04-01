"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// RIPPLE EFFECT HOOK
// ============================================================

interface RippleState {
  id: number;
  x: number;
  y: number;
  size: number;
}

function useRipple() {
  const [ripples, setRipples] = React.useState<RippleState[]>([]);

  const addRipple = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      const id = Date.now();

      setRipples((prev) => [...prev, { id, x, y, size }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    },
    []
  );

  return { ripples, addRipple };
}

// ============================================================
// BUTTON VARIANTS
// ============================================================

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold text-sm leading-none tracking-wide",
    "rounded-xl overflow-hidden select-none",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-b from-orange-500 to-orange-600",
          "text-white shadow-md shadow-orange-500/25",
          "hover:from-orange-400 hover:to-orange-500 hover:shadow-lg hover:shadow-orange-500/30",
          "focus-visible:ring-orange-500",
          "dark:from-orange-500 dark:to-orange-600",
        ],
        destructive: [
          "bg-gradient-to-b from-red-500 to-red-600",
          "text-white shadow-md shadow-red-500/25",
          "hover:from-red-400 hover:to-red-500 hover:shadow-lg hover:shadow-red-500/30",
          "focus-visible:ring-red-500",
        ],
        outline: [
          "border border-zinc-200 dark:border-zinc-700",
          "bg-white/50 dark:bg-zinc-900/50",
          "text-zinc-900 dark:text-zinc-100",
          "backdrop-blur-sm",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "hover:border-zinc-300 dark:hover:border-zinc-600",
          "focus-visible:ring-zinc-500",
        ],
        secondary: [
          "bg-zinc-100 dark:bg-zinc-800",
          "text-zinc-900 dark:text-zinc-100",
          "hover:bg-zinc-200 dark:hover:bg-zinc-700",
          "focus-visible:ring-zinc-500",
        ],
        ghost: [
          "text-zinc-700 dark:text-zinc-300",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "hover:text-zinc-900 dark:hover:text-zinc-100",
          "focus-visible:ring-zinc-500",
        ],
        link: [
          "text-orange-500 dark:text-orange-400",
          "underline-offset-4 hover:underline",
          "focus-visible:ring-orange-500",
          "active:scale-100",
        ],
        glass: [
          "bg-white/10 dark:bg-white/5",
          "backdrop-blur-md",
          "border border-white/20 dark:border-white/10",
          "text-zinc-900 dark:text-zinc-100",
          "shadow-sm",
          "hover:bg-white/20 dark:hover:bg-white/10",
          "focus-visible:ring-white/50",
        ],
        gradient: [
          "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600",
          "text-white shadow-md shadow-orange-500/25",
          "hover:shadow-lg hover:shadow-orange-500/30 hover:brightness-110",
          "focus-visible:ring-orange-500",
        ],
        upvote: [
          "text-zinc-500 dark:text-zinc-400",
          "hover:text-orange-500 dark:hover:text-orange-400",
          "hover:bg-orange-500/10",
          "data-[active=true]:text-orange-500 dark:data-[active=true]:text-orange-400",
          "data-[active=true]:bg-orange-500/10",
          "focus-visible:ring-orange-500",
          "rounded-full",
          "active:scale-100",
        ],
        downvote: [
          "text-zinc-500 dark:text-zinc-400",
          "hover:text-blue-500 dark:hover:text-blue-400",
          "hover:bg-blue-500/10",
          "data-[active=true]:text-blue-500 dark:data-[active=true]:text-blue-400",
          "data-[active=true]:bg-blue-500/10",
          "focus-visible:ring-blue-500",
          "rounded-full",
          "active:scale-100",
        ],
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-lg [&_svg]:size-3",
        sm: "h-8 px-3 text-xs rounded-lg [&_svg]:size-3.5",
        md: "h-9 px-4 text-sm [&_svg]:size-4",
        lg: "h-10 px-5 text-sm [&_svg]:size-4",
        xl: "h-12 px-6 text-base [&_svg]:size-5",
        icon: "size-9 rounded-xl [&_svg]:size-4",
        "icon-sm": "size-7 rounded-lg [&_svg]:size-3.5",
        "icon-lg": "size-11 rounded-xl [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// ============================================================
// TYPES
// ============================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  ripple?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ============================================================
// COMPONENT
// ============================================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      ripple = true,
      disabled,
      children,
      leftIcon,
      rightIcon,
      onClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const { ripples, addRipple } = useRipple();
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!prefersReducedMotion && ripple && !loading) {
          addRipple(event);
        }
        onClick?.(event);
      },
      [addRipple, loading, onClick, prefersReducedMotion, ripple]
    );

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled ?? loading}
        onClick={handleClick}
        aria-busy={loading}
        {...props}
      >
        {/* Ripple effects */}
        {ripple &&
          !prefersReducedMotion &&
          ripples.map((r) => (
            <span
              key={r.id}
              className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
              style={{
                left: r.x,
                top: r.y,
                width: r.size,
                height: r.size,
              }}
            />
          ))}

        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin shrink-0"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M14 8a6 6 0 0 1-6 6V12a4 4 0 0 0 4-4h2z"
            />
          </svg>
        )}

        {/* Left icon */}
        {!loading && leftIcon && leftIcon}

        {/* Content */}
        {children}

        {/* Right icon */}
        {!loading && rightIcon && rightIcon}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };