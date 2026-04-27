"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BeatIndicatorProps {
  currentBeat: number;
  isPlaying: boolean;
  timeSignature: string;
}

export default function BeatIndicator({
  currentBeat,
  isPlaying,
  timeSignature,
}: BeatIndicatorProps) {
  const isFirstBeat = currentBeat === 1;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto my-12">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl" />

      {/* Main Pulse Circle */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentBeat}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: isPlaying ? [0.8, 1.1, 1] : 1,
            opacity: 1,
            backgroundColor: isFirstBeat ? "#ec4899" : "#8b5cf6", // Pink for beat 1, Purple others
          }}
          transition={{
            duration: 0.3,
            ease: "backOut",
          }}
          className="relative z-10 w-48 h-48 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50"
        >
          <span className="text-7xl font-black text-white drop-shadow-lg">
            {isPlaying ? currentBeat : "—"}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Ripple Effect on Beat */}
      {isPlaying && (
        <motion.div
          key={`ripple-${currentBeat}`}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 rounded-full border-4 ${
            isFirstBeat ? "border-pink-400" : "border-purple-400"
          }`}
        />
      )}
    </div>
  );
}
