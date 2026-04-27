"use client";

import { TimeSignature } from "@/hooks/useMetronome";
import { Settings2, Zap } from "lucide-react";

interface ControlsProps {
  bpm: number;
  setBpm: (bpm: number) => void;
  timeSignature: TimeSignature;
  setTimeSignature: (sig: TimeSignature) => void;
  isPlaying: boolean;
}

export default function Controls({
  bpm,
  setBpm,
  timeSignature,
  setTimeSignature,
  isPlaying,
}: ControlsProps) {
  const signatures: TimeSignature[] = ["2/4", "3/4", "4/4", "6/8"];

  return (
    <div className="w-full max-w-md mx-auto space-y-8 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      {/* BPM Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <label className="text-gray-400 font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            TEMPO
          </label>
          <span className="text-3xl font-bold text-white tabular-nums">
            {bpm} <span className="text-sm font-normal text-gray-500">BPM</span>
          </span>
        </div>
        <input
          type="range"
          min="40"
          max="200"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* Time Signature Selector */}
      <div className="space-y-4">
        <label className="text-gray-400 font-medium flex items-center gap-2 px-2">
          <Settings2 className="w-4 h-4 text-purple-400" />
          RHYTHM
        </label>
        <div className="grid grid-cols-4 gap-2">
          {signatures.map((sig) => (
            <button
              key={sig}
              onClick={() => setTimeSignature(sig)}
              className={`py-3 rounded-xl font-bold transition-all ${
                timeSignature === sig
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {sig}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
