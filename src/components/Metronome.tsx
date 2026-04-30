"use client";

import { useMetronome } from "@/hooks/useMetronome";
import { useStrummingPattern } from "@/hooks/useStrummingPattern";
import BeatIndicator from "./BeatIndicator";
import Controls from "./Controls";
import PracticeControls from "./PracticeControls";
import StartStopButton from "./StartStopButton";
import StrummingPattern from "./StrummingPattern";
import PatternSelector from "./PatternSelector";
import PatternBuilder from "./PatternBuilder";
import { useEffect, useState } from "react";
import { WifiOff, Music, Volume2, Plus, Sliders } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function Metronome() {
  const {
    isPlaying,
    bpm,
    timeSignature,
    subdivision,
    currentBeat,
    currentStep,
    practiceMode,
    stepSize,
    stepInterval,
    targetBpm,
    totalDuration,
    isStrummingEnabled,
    currentPattern,
    speakDirections,
    start,
    stop,
    setBpm,
    setTimeSignature,
    setSubdivision,
    setPracticeMode,
    updatePracticeSettings,
    setStrummingEnabled,
    setStrummingPattern,
    setSpeakDirections,
  } = useMetronome();

  const { customPatterns, savePattern } = useStrummingPattern();
  const [isOffline, setIsOffline] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);

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
    <div className="flex flex-col items-center min-h-screen py-8 px-6 space-y-8 overflow-y-auto pb-48">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Talking Metronome
        </h1>
        <p className="text-gray-500 font-medium tracking-widest text-[10px] uppercase">
          Precision Rhythm Trainer
        </p>
      </div>

      {/* Main Beat Section / Strumming Section */}
      <div className="w-full max-w-md space-y-8">
        {!isStrummingEnabled ? (
          <BeatIndicator
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            timeSignature={timeSignature}
          />
        ) : (
          <StrummingPattern
            pattern={currentPattern}
            currentStep={currentStep}
            isPlaying={isPlaying}
            subdivision={subdivision}
          />
        )}
      </div>

      {/* Strumming Toggles */}
      <div className="w-full max-w-md flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setStrummingEnabled(!isStrummingEnabled)}
            className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all duration-300 font-bold text-xs uppercase tracking-widest",
                isStrummingEnabled 
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20" 
                    : "bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900"
            )}
          >
            <Music className="w-4 h-4" />
            Strumming
          </button>

          {isStrummingEnabled && (
              <button
                onClick={() => setSpeakDirections(!speakDirections)}
                className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all duration-300 font-bold text-xs uppercase tracking-widest",
                    speakDirections 
                        ? "bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-900/20" 
                        : "bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900"
                )}
              >
                <Volume2 className="w-4 h-4" />
                Speak Dir
              </button>
          )}

          {isStrummingEnabled && (
              <button
                onClick={() => setShowPatterns(!showPatterns)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/60 border border-white/5 text-slate-400 hover:bg-slate-900 font-bold text-xs uppercase tracking-widest transition-all"
              >
                <Sliders className="w-4 h-4" />
                Patterns
              </button>
          )}
      </div>

      {/* Pattern Selector Overlay */}
      {showPatterns && isStrummingEnabled && (
          <div className="w-full max-w-md p-6 bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <PatternSelector
                    currentPattern={currentPattern}
                    onSelect={(p) => {
                        setStrummingPattern(p);
                        setShowPatterns(false);
                    }}
                    customPatterns={customPatterns}
                />
              </div>
              <button 
                onClick={() => setShowBuilder(true)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-950 border border-dashed border-white/10 rounded-2xl text-slate-500 hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" />
                Custom Pattern
              </button>
          </div>
      )}

      {/* Builder Modal */}
      {showBuilder && (
          <PatternBuilder 
            onSave={savePattern}
            onClose={() => setShowBuilder(false)}
          />
      )}

      {/* Controls Section */}
      <div className="w-full max-w-md space-y-6 flex flex-col items-center">
        {/* Subdivision Selector */}
        {isStrummingEnabled && (
            <div className="w-full flex justify-center gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 my-auto mr-4">Subdivision</label>
                {[1, 2, 4].map((sub) => (
                    <button
                        key={sub}
                        onClick={() => setSubdivision(sub as 1|2|4)}
                        className={cn(
                            "w-12 h-10 rounded-xl border transition-all font-black text-xs",
                            subdivision === sub 
                                ? "bg-white/10 border-white/20 text-white" 
                                : "bg-transparent border-transparent text-slate-600 hover:text-slate-400"
                        )}
                    >
                        {sub === 1 ? "1/4" : sub === 2 ? "1/8" : "1/16"}
                    </button>
                ))}
            </div>
        )}

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
