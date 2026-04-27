"use client";

import { useMetronome } from "@/hooks/useMetronome";
import BeatIndicator from "./BeatIndicator";
import Controls from "./Controls";
import PracticeControls from "./PracticeControls";
import StartStopButton from "./StartStopButton";
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function Metronome() {
  const {
    isPlaying,
    bpm,
    timeSignature,
    currentBeat,
    practiceMode,
    stepSize,
    stepInterval,
    targetBpm,
    totalDuration,
    start,
    stop,
    setBpm,
    setTimeSignature,
    setPracticeMode,
    updatePracticeSettings,
  } = useMetronome();

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen py-8 px-6 space-y-8 overflow-y-auto pb-32">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Talking Metronome
        </h1>
        <p className="text-gray-500 font-medium tracking-widest text-xs uppercase">
          Feel the rhythm
        </p>
      </div>

      {/* Main Beat Section */}
      <BeatIndicator
        currentBeat={currentBeat}
        isPlaying={isPlaying}
        timeSignature={timeSignature}
      />

      {/* Controls Section */}
      <div className="w-full max-w-md space-y-6 flex flex-col items-center">
        <Controls
          bpm={bpm}
          setBpm={setBpm}
          timeSignature={timeSignature}
          setTimeSignature={setTimeSignature}
          isPlaying={isPlaying}
        />

        <PracticeControls
          practiceMode={practiceMode}
          setPracticeMode={setPracticeMode}
          stepSize={stepSize}
          stepInterval={stepInterval}
          targetBpm={targetBpm}
          totalDuration={totalDuration}
          updateSettings={updatePracticeSettings}
        />

        <div className="fixed bottom-10 left-0 right-0 flex flex-col items-center gap-4 z-50 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center gap-4">
            <StartStopButton
              isPlaying={isPlaying}
              onToggle={isPlaying ? stop : start}
            />
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-xl">
              <div className={`w-2 h-2 rounded-full ${
                isPlaying ? "bg-emerald-500 animate-pulse" : "bg-gray-600"
              }`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {isPlaying ? "Running" : "Ready"}
              </span>
              {isOffline && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-500 ml-4">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
