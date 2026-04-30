"use client";

import { useState, useEffect } from "react";
import { StrummingPattern, StrumMotion, MOTION_ARROWS } from "@/utils/patternEngine";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Plus, Trash2, Save, X } from "lucide-react";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface PatternBuilderProps {
  onSave: (pattern: StrummingPattern) => void;
  onClose: () => void;
}

export default function PatternBuilder({ onSave, onClose }: PatternBuilderProps) {
  const [name, setName] = useState("");
  const [motions, setMotions] = useState<StrumMotion[]>([]);

  const addMotion = (motion: StrumMotion) => {
    if (motions.length < 16) {
        setMotions([...motions, motion]);
    }
  };

  const removeLast = () => {
    setMotions(motions.slice(0, -1));
  };

  const clear = () => {
    setMotions([]);
  };

  const handleSave = () => {
    if (motions.length > 0 && name.trim()) {
        const newPattern: StrummingPattern = {
            id: `custom-${Date.now()}`,
            name: name.trim(),
            motions,
        };
        onSave(newPattern);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
      <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
            <h2 className="text-lg font-black tracking-tight text-white">Create Pattern</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
            </button>
        </div>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
            {/* Name Input */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Pattern Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., My Muted Groove"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
            </div>

            {/* Pattern Preview */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Sequence ({motions.length}/16)</label>
                <div className="min-h-[5rem] flex flex-wrap gap-2 p-4 bg-slate-950 rounded-2xl border border-white/5">
                    {motions.length === 0 ? (
                        <span className="text-slate-700 text-sm italic m-auto">Start adding motions...</span>
                    ) : (
                        motions.map((m, i) => (
                            <div key={i} className="w-10 h-10 flex items-center justify-center bg-purple-600/20 rounded-xl border border-purple-500/30 text-purple-400 font-bold">
                                {MOTION_ARROWS[m]}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-4 gap-3">
                {(["down", "up", "rest", "mute"] as StrumMotion[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => addMotion(m)}
                        className="flex flex-col items-center gap-1 p-3 bg-slate-800/40 hover:bg-slate-800 rounded-2xl border border-white/5 transition-all"
                    >
                        <span className="text-2xl font-black text-white">{MOTION_ARROWS[m]}</span>
                        <span className="text-[9px] font-bold uppercase text-slate-400">{m}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 grid grid-cols-2 gap-4 border-t border-white/5">
            <button 
                onClick={clear}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-white/5 hover:bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest transition-all"
            >
                <Trash2 className="w-4 h-4" />
                Clear
            </button>
            <button 
                onClick={handleSave}
                disabled={motions.length === 0 || !name.trim()}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20"
            >
                <Save className="w-4 h-4" />
                Save
            </button>
        </div>
      </div>
    </div>
  );
}
