/**
 * Utility for handling speech synthesis (Talking Metronome)
 */

let voices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && window.speechSynthesis) {
  const updateVoices = () => {
    voices = window.speechSynthesis.getVoices();
  };
  window.speechSynthesis.onvoiceschanged = updateVoices;
  updateVoices();
}

export const speak = (text: string, rate: number = 1.0) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speech to prevent overlap/delay
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Find a clear, friendly voice if available
  if (voices.length === 0) voices = window.speechSynthesis.getVoices();
  
  const preferredVoice = voices.find(v => 
    (v.name.includes('Google') || v.name.includes('Female')) && v.lang.startsWith('en')
  ) || voices.find(v => v.lang.startsWith('en'));

  if (preferredVoice) utterance.voice = preferredVoice;

  window.speechSynthesis.speak(utterance);
};

export const cancelSpeech = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
