import { useState, useEffect, useRef, useCallback } from 'react';
import { speak, cancelSpeech } from '@/utils/speech';
import { getAudioEngine } from '@/utils/audio';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';
export type PracticeMode = 'off' | 'speed-up' | 'slow-down' | 'timed';

interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  timeSignature: TimeSignature;
  currentBeat: number;
  practiceMode: PracticeMode;
  stepSize: number;
  stepInterval: number; // in seconds
  targetBpm: number;
  totalDuration: number; // in minutes
}

export const useMetronome = () => {
  const [state, setState] = useState<MetronomeState>({
    isPlaying: false,
    bpm: 100,
    timeSignature: '4/4',
    currentBeat: 0,
    practiceMode: 'off',
    stepSize: 5,
    stepInterval: 20,
    targetBpm: 120,
    totalDuration: 5,
  });

  // Use refs for values needed in the timing loop to avoid closure issues
  const settingsRef = useRef(state);
  useEffect(() => {
    settingsRef.current = state;
  }, [state]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextTickTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastStepTimeRef = useRef<number>(0);
  
  const audioEngine = useRef<any>(null);
  useEffect(() => {
    audioEngine.current = getAudioEngine();
  }, []);

  const getBeatsPerMeasure = (sig: TimeSignature): number => {
    switch (sig) {
      case '2/4': return 2;
      case '3/4': return 3;
      case '4/4': return 4;
      case '6/8': return 6;
      default: return 4;
    }
  };

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    cancelSpeech();
    setState(prev => ({ ...prev, isPlaying: false, currentBeat: 0 }));
    currentBeatRef.current = 0;
  }, []);

  const playBeat = useCallback(() => {
    const { bpm, timeSignature, practiceMode, stepSize, stepInterval, targetBpm, totalDuration } = settingsRef.current;
    
    const beatsPerMeasure = getBeatsPerMeasure(timeSignature);
    currentBeatRef.current = (currentBeatRef.current % beatsPerMeasure) + 1;
    const isAccent = currentBeatRef.current === 1;
    
    // Update current beat in state for UI
    setState(prev => ({ ...prev, currentBeat: currentBeatRef.current }));

    if (audioEngine.current) {
        audioEngine.current.playTick(isAccent);
    }

    speak(currentBeatRef.current.toString(), bpm / 60);

    const beatInterval = 60000 / bpm;
    nextTickTimeRef.current += beatInterval;
    
    const now = Date.now();
    const elapsedSeconds = (now - startTimeRef.current) / 1000;
    const elapsedSinceLastStep = (now - lastStepTimeRef.current) / 1000;

    // Practice Mode logic
    if (practiceMode === 'timed' && elapsedSeconds >= totalDuration * 60) {
        stop();
        return;
    }

    if ((practiceMode === 'speed-up' || practiceMode === 'slow-down') && 
        elapsedSinceLastStep >= stepInterval) {
        
        const direction = practiceMode === 'speed-up' ? 1 : -1;
        const newBpm = bpm + (stepSize * direction);
        
        const finalBpm = direction === 1 
            ? Math.min(newBpm, targetBpm)
            : Math.max(newBpm, targetBpm);
            
        if (finalBpm !== bpm) {
            setState(prev => ({ ...prev, bpm: finalBpm }));
            lastStepTimeRef.current = now;
        }
    }
    
    const drift = Date.now() - nextTickTimeRef.current;
    const nextInterval = Math.max(0, beatInterval - drift);

    timerRef.current = setTimeout(playBeat, nextInterval);
  }, [stop]);

  const start = useCallback(() => {
    if (settingsRef.current.isPlaying) return;

    cancelSpeech();
    currentBeatRef.current = 0;
    nextTickTimeRef.current = Date.now();
    startTimeRef.current = Date.now();
    lastStepTimeRef.current = Date.now();
    setState(prev => ({ ...prev, isPlaying: true, currentBeat: 0 }));
    playBeat();
  }, [playBeat]);

  const setBpm = (bpm: number) => {
    const val = Math.min(200, Math.max(40, bpm));
    setState(prev => {
        let updates: Partial<MetronomeState> = { bpm: val };
        // Validation: adjust target BPM if it becomes invalid
        if (prev.practiceMode === 'speed-up' && val > prev.targetBpm) {
            updates.targetBpm = Math.min(200, val + 20);
        } else if (prev.practiceMode === 'slow-down' && val < prev.targetBpm) {
            updates.targetBpm = Math.max(40, val - 20);
        }
        return { ...prev, ...updates };
    });
  };

  const setTimeSignature = (sig: TimeSignature) => {
    setState(prev => ({ ...prev, timeSignature: sig }));
    currentBeatRef.current = 0;
  };

  const setPracticeMode = (mode: PracticeMode) => {
    setState(prev => {
        let updates: Partial<MetronomeState> = { practiceMode: mode };
        // Validation when switching modes
        if (mode === 'speed-up' && prev.bpm >= prev.targetBpm) {
            updates.targetBpm = Math.min(200, prev.bpm + 20);
        } else if (mode === 'slow-down' && prev.bpm <= prev.targetBpm) {
            updates.targetBpm = Math.max(40, prev.bpm - 20);
        }
        return { ...prev, ...updates };
    });
  };

  const updatePracticeSettings = (settings: Partial<Pick<MetronomeState, 'stepSize' | 'stepInterval' | 'targetBpm' | 'totalDuration'>>) => {
    setState(prev => {
        let validated = { ...settings };
        // Validation for target BPM
        if (settings.targetBpm !== undefined) {
            if (prev.practiceMode === 'speed-up') {
                validated.targetBpm = Math.max(prev.bpm, settings.targetBpm);
            } else if (prev.practiceMode === 'slow-down') {
                validated.targetBpm = Math.min(prev.bpm, settings.targetBpm);
            }
        }
        return { ...prev, ...validated };
    });
  };

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
    setPracticeMode,
    updatePracticeSettings,
  };
};
