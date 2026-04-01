"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

export interface WizardStep {
  id: number;
  label: string;
  description: string;
}

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function WizardProgress({ steps, currentStep, className }: WizardProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step node */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <motion.div
                  className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm",
                    "transition-all duration-300",
                    isCompleted && "bg-orange-500 text-white shadow-lg shadow-orange-500/30",
                    isActive && "bg-orange-500 text-white ring-4 ring-orange-500/20 shadow-lg shadow-orange-500/30",
                    isUpcoming && "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                  )}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <span>{step.id}</span>
                  )}

                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-orange-500/20"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>

                <div className="text-center">
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isActive && "text-orange-500",
                      isCompleted && "text-zinc-700 dark:text-zinc-300",
                      isUpcoming && "text-zinc-400 dark:text-zinc-500"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3 mb-5">
                  <div className="relative h-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-orange-500 rounded-full"
                      initial={false}
                      animate={{
                        width: currentStep > step.id ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: compact progress bar */}
      <div className="flex sm:hidden flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {steps.find((s) => s.id === currentStep)?.label}
          </span>
        </div>
        <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
            initial={false}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}