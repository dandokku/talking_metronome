"use client";

import { PRESET_PATTERNS, StrummingPattern } from "@/utils/patternEngine";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Music2, Star } from "lucide-react";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface PatternSelectorProps {
  currentPattern: StrummingPattern;
  onSelect: (pattern: StrummingPattern) => void;
  customPatterns: StrummingPattern[];
}

export default function PatternSelector({
  currentPattern,
  onSelect,
  customPatterns,
}: PatternSelectorProps) {
  const allPatterns = [...PRESET_PATTERNS, ...customPatterns];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Music2 className="w-4 h-4 text-purple-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Strumming Patterns
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {allPatterns.map((pattern) => {
          const isActive = pattern.id === currentPattern.id;
          const isCustom = !PRESET_PATTERNS.some(p => p.id === pattern.id);

          return (
            <button
              key={pattern.id}
              onClick={() => onSelect(pattern)}
              className={cn(
                "group relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left overflow-hidden",
                isActive 
                  ? "bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10" 
                  : "bg-slate-900/60 border-white/5 hover:border-white/10 hover:bg-slate-900/80"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                    "text-xs font-bold transition-colors",
                    isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                )}>
                  {pattern.name}
                </span>
                {isCustom && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
              </div>
              
              <div className="flex gap-1 overflow-hidden opacity-60">
                {pattern.motions.slice(0, 6).map((m, i) => (
                    <span key={i} className="text-[10px]">{m === "down" ? "↓" : m === "up" ? "↑" : m === "rest" ? "•" : "×"}</span>
                ))}
                {pattern.motions.length > 6 && <span className="text-[10px]">...</span>}
              </div>

              {isActive && (
                <div className="absolute top-0 right-0 p-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
