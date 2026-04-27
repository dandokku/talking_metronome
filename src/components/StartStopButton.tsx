"use client";

import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";

interface StartStopButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export default function StartStopButton({
  isPlaying,
  onToggle,
}: StartStopButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`relative group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
        isPlaying
          ? "bg-red-500 shadow-red-500/40"
          : "bg-emerald-500 shadow-emerald-500/40"
      }`}
    >
      {/* Animated ring */}
      <div className={`absolute inset-0 rounded-full border-2 opacity-50 group-hover:scale-110 transition-transform ${
        isPlaying ? "border-red-400" : "border-emerald-400"
      }`} />
      
      {isPlaying ? (
        <Square className="w-10 h-10 text-white fill-current" />
      ) : (
        <Play className="w-10 h-10 text-white fill-current ml-1" />
      )}
    </motion.button>
  );
}
