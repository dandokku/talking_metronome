import { useState, useEffect, useRef, useCallback } from 'react';
import { speak, cancelSpeech } from '@/utils/speech';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  timeSignature: TimeSignature;
  currentBeat: number;
}

export const useMetronome = () => {
  const [state, setState] = useState<MetronomeState>({
    isPlaying: false,
    bpm: 100,
    timeSignature: '4/4',
    currentBeat: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextTickTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);

  const getBeatsPerMeasure = (sig: TimeSignature): number => {
    switch (sig) {
      case '2/4': return 2;
      case '3/4': return 3;
      case '4/4': return 4;
      case '6/8': return 6;
      default: return 4;
    }
  };

  const playBeat = useCallback(() => {
    const beatsPerMeasure = getBeatsPerMeasure(state.timeSignature);
    currentBeatRef.current = (currentBeatRef.current % beatsPerMeasure) + 1;
    
    const beatToSpeak = currentBeatRef.current.toString();
    
    // Update state for UI (pulse)
    setState(prev => ({ ...prev, currentBeat: currentBeatRef.current }));

    // Speak the beat
    speak(beatToSpeak, state.bpm / 60); // Adjust rate slightly based on BPM

    // Schedule next beat
    const beatInterval = 60000 / state.bpm;
    nextTickTimeRef.current += beatInterval;
    
    const drift = Date.now() - nextTickTimeRef.current;
    const nextInterval = Math.max(0, beatInterval - drift);

    timerRef.current = setTimeout(playBeat, nextInterval);
  }, [state.bpm, state.timeSignature]);

  const start = useCallback(() => {
    if (state.isPlaying) return;

    cancelSpeech();
    currentBeatRef.current = 0;
    nextTickTimeRef.current = Date.now();
    setState(prev => ({ ...prev, isPlaying: true, currentBeat: 0 }));
    playBeat();
  }, [state.isPlaying, playBeat]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    cancelSpeech();
    setState(prev => ({ ...prev, isPlaying: false, currentBeat: 0 }));
    currentBeatRef.current = 0;
  }, []);

  const setBpm = (bpm: number) => {
    setState(prev => ({ ...prev, bpm: Math.min(200, Math.max(40, bpm)) }));
  };

  const setTimeSignature = (sig: TimeSignature) => {
    setState(prev => ({ ...prev, timeSignature: sig }));
    if (state.isPlaying) {
        // Reset beat count if sig changes while playing to stay in rhythm
        currentBeatRef.current = 0;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelSpeech();
    };
  }, []);

  return {
    ...state,
    start,
    stop,
    setBpm,
    setTimeSignature,
  };
};
