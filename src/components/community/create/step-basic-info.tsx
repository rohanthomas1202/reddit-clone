"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Lock,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  Globe,
  ShieldAlert,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

export interface BasicInfoData {
  name: string;
  displayName: string;
  description: string;
  type: "PUBLIC" | "PRIVATE" | "RESTRICTED";
  isNsfw: boolean;
}

interface StepBasicInfoProps {
  data: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
}

type NameValidationState = "idle" | "checking" | "available" | "taken" | "invalid";

const communityTypes = [
  {
    value: "PUBLIC" as const,
    label: "Public",
    description: "Anyone can view and post",
    icon: Globe,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  {
    value: "RESTRICTED" as const,
    label: "Restricted",
    description: "Anyone can view, approved users post",
    icon: ShieldAlert,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  {
    value: "PRIVATE" as const,
    label: "Private",
    description: "Only approved members can view",
    icon: Lock,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
];

// ============================================================
// NAME VALIDATION
// ============================================================

function validateCommunityName(name: string): string | null {
  if (!name) return null;
  if (name.length < 3) return "Name must be at least 3 characters";
  if (name.length > 21) return "Name must be 21 characters or less";
  if (!/^[a-zA-Z0-9_]+$/.test(name)) return "Only letters, numbers, and underscores allowed";
  if (/^_|_$/.test(name)) return "Name cannot start or end with underscore";
  return null;
}

// ============================================================
// COMPONENT
// ============================================================

export function StepBasicInfo({ data, onChange }: StepBasicInfoProps) {
  const [nameValidation, setNameValidation] = useState<NameValidationState>("idle");
  const [nameError, setNameError] = useState<string | null>(null);

  const checkNameAvailability = useCallback(
    async (name: string) => {
      const validationError = validateCommunityName(name);
      if (validationError) {
        setNameError(validationError);
        setNameValidation("invalid");
        return;
      }

      setNameValidation("checking");
      setNameError(null);

      // Simulate API check
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Mock: names starting with "test" are "taken"
      const isTaken = name.toLowerCase().startsWith("test");
      setNameValidation(isTaken ? "taken" : "available");
      if (isTaken) {
        setNameError(`c/${name} is already taken`);
      }
    },
    []
  );

  useEffect(() => {
    if (!data.name) {
      setNameValidation("idle");
      setNameError(null);
      return;
    }

    const timer = setTimeout(() => {
      void checkNameAvailability(data.name);
    }, 400);

    return () => clearTimeout(timer);
  }, [data.name, checkNameAvailability]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, "_").slice(0, 21);
    onChange({ ...data, name: raw });
  };

  const getNameStatusIcon = () => {
    switch (nameValidation) {
      case "checking":
        return <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />;
      case "available":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "taken":
      case "invalid":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Tell us about your community
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Choose a name and describe what your community is about.
        </p>
      </div>

      {/* Community Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Community Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Hash className="w-4 h-4 text-zinc-400" />
          </div>
          <input
            type="text"
            value={data.name}
            onChange={handleNameChange}
            placeholder="my_community"
            maxLength={21}
            className={cn(
              "w-full pl-9 pr-10 py-3 rounded-xl border bg-white dark:bg-zinc-800/50",
              "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400",
              "focus:outline-none focus:ring-2 transition-all duration-200",
              nameValidation === "available" &&
                "border-green-500/50 focus:ring-green-500/20",
              (nameValidation === "taken" || nameValidation === "invalid") &&
                "border-red-500/50 focus:ring-red-500/20",
              nameValidation === "idle" || nameValidation === "checking"
                ? "border-zinc-200 dark:border-zinc-700 focus:ring-orange-500/20 focus:border-orange-500/50"
                : ""
            )}
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            {getNameStatusIcon()}
          </div>
        </div>

        {/* Name feedback */}
        <div className="flex items-center justify-between">
          <div className="min-h-[20px]">
            {nameError ? (
              <p className="text-xs text-red-500">{nameError}</p>
            ) : nameValidation === "available" ? (
              <p className="text-xs text-green-500">c/{data.name} is available!</p>
            ) : data.name ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Your community will be at c/{data.name}
              </p>
            ) : null}
          </div>
          <span className="text-xs text-zinc-400">{data.name.length}/21</span>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Community names cannot be changed after creation. Choose wisely!
          </p>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Display Name
          <span className="ml-2 text-xs text-zinc-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={data.displayName}
          onChange={(e) => onChange({ ...data, displayName: e.target.value.slice(0, 50) })}
          placeholder="A human-readable name for your community"
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
        />
        <div className="flex justify-end">
          <span className="text-xs text-zinc-400">{data.displayName.length}/50</span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
          <span className="ml-2 text-xs text-zinc-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value.slice(0, 500) })}
          placeholder="Tell people what your community is about..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200 resize-none"
        />
        <div className="flex justify-end">
          <span className="text-xs text-zinc-400">{data.description.length}/500</span>
        </div>
      </div>

      {/* Community Type */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Community Type <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-3">
          {communityTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = data.type === type.value;
            return (
              <motion.button
                key={type.value}
                type="button"
                onClick={() => onChange({ ...data, type: type.value })}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                  isSelected
                    ? `${type.border} ${type.bg}`
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    isSelected ? type.bg : "bg-zinc-100 dark:bg-zinc-800"
                  )}
                >
                  <Icon
                    className={cn("w-5 h-5", isSelected ? type.color : "text-zinc-400")}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {type.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn("ml-auto flex-shrink-0")}
                      >
                        <CheckCircle2 className={cn("w-4 h-4", type.color)} />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {type.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* NSFW Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <EyeOff className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              NSFW Community
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Posts will be marked 18+ and require age verification
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...data, isNsfw: !data.isNsfw })}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none",
            data.isNsfw ? "bg-red-500" : "bg-zinc-200 dark:bg-zinc-700"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300",
              data.isNsfw ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>
    </motion.div>
  );
}