// src/utils/TTS.ts

// Defensive TTS helper for browser games.
export default class TTS {
  static enabled = true;           // global on/off switch
  static voice: any = null;
  private static initialized = false;

  private static isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof (window as any).speechSynthesis !== "undefined" &&
      typeof (window as any).SpeechSynthesisUtterance !== "undefined"
    );
  }

  static init() {
    if (this.initialized) return;
    this.initialized = true;

    if (!this.isSupported()) {
      console.warn("TTS: Web Speech API not supported in this environment.");
      this.enabled = false;
      return;
    }

    const synth = (window as any).speechSynthesis;

    const pickVoice = () => {
      const voices: any[] = synth.getVoices();
      if (!voices || !voices.length) return;

      this.voice =
        voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en")) ||
        voices[0] ||
        null;
    };

    pickVoice();
    synth.onvoiceschanged = pickVoice;
  }

  static speak(text: string, opts?: { rate?: number; pitch?: number }) {
    if (!this.enabled) return;
    if (!this.isSupported()) return;
    if (!text || !text.trim()) return;

    const synth = (window as any).speechSynthesis;
    const Utterance = (window as any).SpeechSynthesisUtterance;

    const utter = new Utterance(text);
    if (this.voice) utter.voice = this.voice;

    utter.rate = opts?.rate ?? 1.1;
    utter.pitch = opts?.pitch ?? 1.1;
    utter.volume = 1;

    synth.cancel();
    synth.speak(utter);
  }

  static stop() {
    if (!this.isSupported()) return;
    const synth = (window as any).speechSynthesis;
    synth.cancel();
  }
}
