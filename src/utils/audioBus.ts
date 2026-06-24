/**
 * Central audio engine.
 *
 * Plays the TTS audio through a Web Audio AnalyserNode so the avatar can read
 * the live amplitude and drive its mouth (real lip sync). Exposes `getLevel()`
 * which returns a smoothed 0..1 loudness value for the currently playing audio.
 */

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let timeData: Uint8Array<ArrayBuffer> | null = null;
let currentAudio: HTMLAudioElement | null = null;
let smoothed = 0;

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.6;
    timeData = new Uint8Array(new ArrayBuffer(analyser.fftSize));
  }
  return ctx;
}

/** Must be called from a user gesture (e.g. mic click) to satisfy autoplay rules. */
export function unlockAudio(): void {
  const c = ensureContext();
  if (c.state === 'suspended') void c.resume();
}

/** Cache of decoded object URLs keyed by text, so repeated answers don't re-fetch. */
const urlCache = new Map<string, string>();

export function getCachedUrl(key: string): string | undefined {
  return urlCache.get(key);
}
export function setCachedUrl(key: string, url: string): void {
  urlCache.set(key, url);
}

/**
 * Play an audio blob/URL through the analyser.
 * Resolves when playback finishes (or rejects on error).
 */
export function play(src: Blob | string): Promise<void> {
  const c = ensureContext();
  void c.resume();

  // Stop anything already playing.
  stop();

  const url = typeof src === 'string' ? src : URL.createObjectURL(src);
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.src = url;
  currentAudio = audio;

  const source = c.createMediaElementSource(audio);
  source.connect(analyser!);
  analyser!.connect(c.destination);

  return new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      smoothed = 0;
      resolve();
    };
    audio.onerror = () => reject(new Error('Audio playback failed'));
    audio.play().catch(reject);
  });
}

export function stop(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio = null;
  }
  smoothed = 0;
}

/** Smoothed loudness 0..1 of the audio playing right now. 0 when silent/idle. */
export function getLevel(): number {
  if (!analyser || !timeData || !currentAudio || currentAudio.paused) {
    smoothed *= 0.8; // decay to rest
    return smoothed;
  }
  analyser.getByteTimeDomainData(timeData);
  // RMS around the 128 midpoint.
  let sum = 0;
  for (let i = 0; i < timeData.length; i++) {
    const v = (timeData[i] - 128) / 128;
    sum += v * v;
  }
  const rms = Math.sqrt(sum / timeData.length);
  // Map and clamp; speech RMS is small, so scale up.
  const target = Math.min(1, rms * 3.2);
  // Asymmetric smoothing: open fast, close a touch slower for natural motion.
  const k = target > smoothed ? 0.5 : 0.25;
  smoothed += (target - smoothed) * k;
  return smoothed;
}
