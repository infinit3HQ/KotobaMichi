// src/lib/audio.ts
// Native Web Speech & Web Audio synthesis for Japanese learning (Zero S3/MinIO dependency)

let preferredVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function initVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const updateVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Prioritize high-quality Japanese voices
    preferredVoice =
      voices.find((v) => v.lang === "ja-JP" && (v.name.includes("Google") || v.name.includes("Kyoko") || v.name.includes("Otoya"))) ||
      voices.find((v) => v.lang.startsWith("ja")) ||
      voices.find((v) => v.lang.toLowerCase().includes("jp")) ||
      null;
    voicesLoaded = true;
  };

  updateVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoice;
  }
}

if (typeof window !== "undefined") {
  initVoices();
}

export interface SpeakOptions {
  rate?: number; // 0.1 to 10 (default 0.95 for clear learner comprehension)
  pitch?: number; // default 1.0
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Speaks Japanese text using the native browser SpeechSynthesis engine.
 * Pronounces Kanji, Hiragana, Katakana, and sentences with accurate pitch accent.
 */
export function speakJapanese(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    if (!voicesLoaded) {
      initVoices();
    }

    // Cancel any ongoing speech to avoid queue pile-up
    window.speechSynthesis.cancel();

    // Clean text: strip English annotations or parentheses if any
    const cleanText = text.trim();
    if (!cleanText) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ja-JP";
    utterance.rate = options.rate ?? 0.92;
    utterance.pitch = options.pitch ?? 1.0;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
      resolve();
    };

    utterance.onerror = () => {
      options.onError?.();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Lightweight Web Audio synthesizer for immediate gamification feedback.
 * No MP3s or network requests required.
 */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SfxType = "correct" | "wrong" | "streak" | "flip" | "combo";

export function playSfx(type: SfxType): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === "correct") {
      // Pleasant rising major third chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc2.frequency.setValueAtTime(783.99, now + 0.16); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else if (type === "wrong") {
      // Soft low buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "streak") {
      // High energetic celebratory arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.15, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } else if (type === "flip") {
      // Subtle whoosh/click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "combo") {
      // Bright harmonic ring
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // Gracefully ignore audio context restrictions
  }
}
