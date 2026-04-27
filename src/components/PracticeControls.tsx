"use client";

import { PracticeMode } from "@/hooks/useMetronome";
import { Timer, TrendingUp, TrendingDown, Ban } from "lucide-react";

interface PracticeControlsProps {
  practiceMode: PracticeMode;
  setPracticeMode: (mode: PracticeMode) => void;
  stepSize: number;
  stepInterval: number;
  targetBpm: number;
  totalDuration: number;
  updateSettings: (settings: any) => void;
}

export default function PracticeControls({
  practiceMode,
  setPracticeMode,
  stepSize,
  stepInterval,
  targetBpm,
  totalDuration,
  updateSettings,
}: PracticeControlsProps) {
  const modes: { id: PracticeMode; label: string; icon: any }[] = [
    { id: "off", label: "Off", icon: Ban },
    { id: "speed-up", label: "Speed Up", icon: TrendingUp },
    { id: "slow-down", label: "Slow Down", icon: TrendingDown },
    { id: "timed", label: "Timed", icon: Timer },
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="space-y-4">
        <label className="text-gray-400 font-medium flex items-center gap-2 px-2 uppercase text-xs tracking-widest">
          Practice Mode
        </label>
        <div className="grid grid-cols-4 gap-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setPracticeMode(mode.id)}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${
                  practiceMode === mode.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {practiceMode !== "off" && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {(practiceMode === "speed-up" || practiceMode === "slow-down") && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase px-1">
                  {practiceMode === "speed-up" ? "Target Speed" : "Minimum Speed"}
                </label>
                <input
                  type="number"
                  value={targetBpm}
                  onChange={(e) => updateSettings({ targetBpm: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase px-1">Step (+/-)</label>
                <input
                  type="number"
                  value={stepSize}
                  onChange={(e) => updateSettings({ stepSize: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase px-1">Interval (sec)</label>
                <input
                  type="number"
                  value={stepInterval}
                  onChange={(e) => updateSettings({ stepInterval: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </>
          )}
          {practiceMode === "timed" && (
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase px-1">Duration (min)</label>
              <input
                type="number"
                value={totalDuration}
                onChange={(e) => updateSettings({ totalDuration: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
