"use client";

import { motion, AnimatePresence } from "framer-motion";
import { StrummingPattern as IStrummingPattern, MOTION_ARROWS } from "@/utils/patternEngine";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface StrummingPatternProps {
  pattern: IStrummingPattern;
  currentStep: number;
  isPlaying: boolean;
  subdivision: number;
}

export default function StrummingPattern({
  pattern,
  currentStep,
  isPlaying,
  subdivision,
}: StrummingPatternProps) {
  const motions = pattern.motions;
  const activeIndex = currentStep % motions.length;

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <div className="flex flex-wrap justify-center gap-4 py-8 px-4 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <AnimatePresence mode="popLayout">
          {motions.map((m, index) => {
            const isActive = isPlaying && index === activeIndex;
            const isBeatStart = index % subdivision === 0;

            return (
              <motion.div
                key={`${pattern.id}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: isActive ? 1.25 : 1,
                  color: isActive ? "#a855f7" : isBeatStart ? "#cbd5e1" : "#64748b",
                }}
                className={cn(
                  "relative flex flex-col items-center gap-2 min-w-[3rem] transition-all duration-200",
                  isActive && "z-10"
                )}
              >
                <span className={cn(
                    "text-4xl font-black transition-all duration-300",
                    isActive ? "drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "drop-shadow-none"
                )}>
                  {MOTION_ARROWS[m]}
                </span>
                
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    isActive ? "text-purple-400" : "text-slate-500"
                )}>
                  {isBeatStart ? (index / subdivision + 1) : "&"}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="active-glow"
                    className="absolute -inset-4 bg-purple-500/10 blur-xl rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 bg-slate-900/60 px-4 py-1.5 rounded-full border border-white/5">
        {pattern.name}
      </div>
    </div>
  );
}
