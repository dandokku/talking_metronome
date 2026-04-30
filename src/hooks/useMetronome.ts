import { useState, useEffect, useRef, useCallback } from 'react';
import { speak, cancelSpeech } from '@/utils/speech';
import { getAudioEngine } from '@/utils/audio';
import { StrummingPattern, PRESET_PATTERNS, MOTION_SOUNDS } from '@/utils/patternEngine';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';
export type PracticeMode = 'off' | 'speed-up' | 'slow-down' | 'timed';

interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  timeSignature: TimeSignature;
  currentBeat: number; // 1-based beat index
  currentStep: number; // 0-based pattern step index
  subdivision: 1 | 2 | 4;
  practiceMode: PracticeMode;
  stepSize: number;
  stepInterval: number; // in seconds
  targetBpm: number;
  totalDuration: number; // in minutes
  // Strumming Pattern State
  isStrummingEnabled: boolean;
  currentPattern: StrummingPattern;
  speakDirections: boolean;
}

export const useMetronome = () => {
  const [state, setState] = useState<MetronomeState>({
    isPlaying: false,
    bpm: 100,
    timeSignature: '4/4',
    currentBeat: 0,
    currentStep: 0,
    subdivision: 1,
    practiceMode: 'off',
    stepSize: 5,
    stepInterval: 20,
    targetBpm: 120,
    totalDuration: 5,
    isStrummingEnabled: false,
    currentPattern: PRESET_PATTERNS[0],
    speakDirections: false,
  });

  // Use refs for values needed in the timing loop to avoid closure issues
  const settingsRef = useRef(state);
  useEffect(() => {
    settingsRef.current = state;
  }, [state]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextTickTimeRef = useRef<number>(0);
  const currentTickInMeasureRef = useRef<number>(0); // 0-based tick index within the measure
  const currentStepRef = useRef<number>(0); // 0-based index in the strumming pattern
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
    setState(prev => ({ ...prev, isPlaying: false, currentBeat: 0, currentStep: 0 }));
    currentTickInMeasureRef.current = 0;
    currentStepRef.current = 0;
  }, []);

  const playTick = useCallback(() => {
    const { 
      bpm, 
      timeSignature, 
      subdivision, 
      practiceMode, 
      stepSize, 
      stepInterval, 
      targetBpm, 
      totalDuration,
      isStrummingEnabled,
      currentPattern,
      speakDirections
    } = settingsRef.current;
    
    const beatsPerMeasure = getBeatsPerMeasure(timeSignature);
    const totalTicksPerMeasure = beatsPerMeasure * subdivision;
    
    // Calculate current beat (1-based)
    const isBeatStart = currentTickInMeasureRef.current % subdivision === 0;
    const currentBeat = Math.floor(currentTickInMeasureRef.current / subdivision) + 1;
    const isAccent = currentBeat === 1 && isBeatStart;
    
    // Update state for UI
    setState(prev => ({ 
      ...prev, 
      currentBeat: isBeatStart ? currentBeat : prev.currentBeat,
      currentStep: currentStepRef.current
    }));

    // Audio: Only play tick on actual beats
    if (isBeatStart && audioEngine.current) {
        audioEngine.current.playTick(isAccent);
    }

    // Strumming Logic
    if (isStrummingEnabled) {
        const motions = currentPattern.motions;
        const motion = motions[currentStepRef.current % motions.length];
        if (speakDirections) {
            speak(MOTION_SOUNDS[motion], bpm / 60);
        } else if (isBeatStart) {
            speak(currentBeat.toString(), bpm / 60);
        }
        currentStepRef.current = (currentStepRef.current + 1) % motions.length;
    } else if (isBeatStart) {
        speak(currentBeat.toString(), bpm / 60);
    }

    // Increment tick
    currentTickInMeasureRef.current = (currentTickInMeasureRef.current + 1) % totalTicksPerMeasure;

    const tickInterval = 60000 / (bpm * subdivision);
    nextTickTimeRef.current += tickInterval;
    
    const now = Date.now();
    const elapsedSeconds = (now - startTimeRef.current) / 1000;
    const elapsedSinceLastStep = (now - lastStepTimeRef.current) / 1000;

    // Practice Mode logic
    if (isBeatStart) {
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
    }
    
    const drift = Date.now() - nextTickTimeRef.current;
    const nextInterval = Math.max(0, tickInterval - drift);

    timerRef.current = setTimeout(playTick, nextInterval);
  }, [stop]);

  const start = useCallback(() => {
    if (settingsRef.current.isPlaying) return;

    cancelSpeech();
    currentTickInMeasureRef.current = 0;
    currentStepRef.current = 0;
    nextTickTimeRef.current = Date.now();
    startTimeRef.current = Date.now();
    lastStepTimeRef.current = Date.now();
    setState(prev => ({ ...prev, isPlaying: true, currentBeat: 0, currentStep: 0 }));
    playTick();
  }, [playTick]);

  const setBpm = (bpm: number) => {
    const val = Math.min(200, Math.max(40, bpm));
    setState(prev => {
        let updates: Partial<MetronomeState> = { bpm: val };
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
    currentTickInMeasureRef.current = 0;
    currentStepRef.current = 0;
  };

  const setSubdivision = (sub: 1 | 2 | 4) => {
    setState(prev => ({ ...prev, subdivision: sub }));
    currentTickInMeasureRef.current = 0;
    currentStepRef.current = 0;
  };

  const setPracticeMode = (mode: PracticeMode) => {
    setState(prev => {
        let updates: Partial<MetronomeState> = { practiceMode: mode };
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

  const setStrummingEnabled = (enabled: boolean) => {
    setState(prev => ({ ...prev, isStrummingEnabled: enabled }));
  };

  const setStrummingPattern = (pattern: StrummingPattern) => {
    setState(prev => ({ ...prev, currentPattern: pattern }));
    currentStepRef.current = 0;
  };

  const setSpeakDirections = (speak: boolean) => {
    setState(prev => ({ ...prev, speakDirections: speak }));
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
    setSubdivision,
    setPracticeMode,
    updatePracticeSettings,
    setStrummingEnabled,
    setStrummingPattern,
    setSpeakDirections,
  };
};
