"use client";

import { useState, useEffect } from "react";
import { StrummingPattern, PRESET_PATTERNS } from "@/utils/patternEngine";

const STORAGE_KEY = "talking-metronome-custom-patterns";

export const useStrummingPattern = () => {
  const [customPatterns, setCustomPatterns] = useState<StrummingPattern[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomPatterns(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load custom patterns", e);
      }
    }
  }, []);

  const savePattern = (pattern: StrummingPattern) => {
    const updated = [...customPatterns, pattern];
    setCustomPatterns(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removePattern = (id: string) => {
    const updated = customPatterns.filter((p) => p.id !== id);
    setCustomPatterns(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    customPatterns,
    savePattern,
    removePattern,
  };
};
