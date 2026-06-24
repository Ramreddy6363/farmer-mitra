import axios from 'axios';
import { SARVAM_TTS_URL, TTS_SPEAKER } from '@/constants';
import type { Language } from '@/types';

const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

/**
 * Split long answers on sentence boundaries. Sarvam accepts ~500 chars/request,
 * but smaller chunks synthesize much faster (a big Kannada chunk can take >20s
 * and time out), and the first chunk starts playing sooner. So keep them small.
 */
function chunkText(text: string, max = 280): string[] {
  if (text.length <= max) return [text];
  const sentences = text.match(/[^.!?।]+[.!?।]?/g) ?? [text];
  const chunks: string[] = [];
  let buf = '';
  for (const s of sentences) {
    if ((buf + s).length > max) {
      if (buf) chunks.push(buf.trim());
      buf = s;
    } else {
      buf += s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

function base64ToBlob(b64: string, mime = 'audio/wav'): Blob {
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** Split an answer into the ordered text chunks that will be synthesized. */
export function splitIntoChunks(text: string): string[] {
  return chunkText(text);
}

/**
 * Synthesize ONE text chunk. Returns its ordered audio segments (Sarvam may
 * return several per request). Kept per-chunk so the caller can start playing
 * the first chunk while later chunks are still being synthesized.
 */
export async function synthesizeChunk(
  chunk: string,
  language: Language,
): Promise<Blob[]> {
  if (!API_KEY) throw new Error('Missing VITE_SARVAM_API_KEY');

  try {
    const { data } = await axios.post(
      SARVAM_TTS_URL,
      {
        text: chunk,
        target_language_code: language,
        speaker: TTS_SPEAKER,
        model: 'bulbul:v2',
        enable_preprocessing: true,
      },
      {
        headers: { 'api-subscription-key': API_KEY },
        timeout: 45000,
      },
    );
    // Sarvam returns `audios` as an array of segments — push every segment,
    // not just the first, or the speech cuts off halfway.
    const segments: string[] = data.audios ?? [];
    return segments.filter(Boolean).map((b64) => base64ToBlob(b64));
  } catch (err) {
    console.error('Sarvam TTS failed', err);
    throw new Error('Could not generate speech.');
  }
}

/**
 * Convert a full answer to speech. Returns all audio chunks at once.
 * Prefer the streaming pattern (splitIntoChunks + synthesizeChunk) for lower
 * time-to-first-audio; this is kept for simple/non-latency-critical callers.
 */
export async function textToSpeech(
  text: string,
  language: Language,
): Promise<Blob[]> {
  const blobs: Blob[] = [];
  for (const chunk of splitIntoChunks(text)) {
    blobs.push(...(await synthesizeChunk(chunk, language)));
  }
  return blobs;
}
