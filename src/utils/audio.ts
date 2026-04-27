/**
 * Web Audio API utility for metronome sounds.
 * Uses oscillators for low-latency, zero-asset offline sounds.
 */

class AudioEngine {
  private context: AudioContext | null = null;

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  playTick(isAccent: boolean = false) {
    this.initContext();
    if (!this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    // Accent: Higher pitch (1000Hz), regular: lower (800Hz)
    oscillator.frequency.setValueAtTime(isAccent ? 1200 : 800, this.context.currentTime);
    oscillator.type = 'sine';

    const now = this.context.currentTime;
    const duration = 0.05;

    gainNode.gain.setValueAtTime(isAccent ? 0.4 : 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}

let instance: AudioEngine | null = null;

export const getAudioEngine = () => {
  if (typeof window === 'undefined') return null;
  if (!instance) {
    instance = new AudioEngine();
  }
  return instance;
};
