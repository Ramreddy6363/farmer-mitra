import axios from 'axios';
import { SARVAM_TTS_URL, TTS_SPEAKER } from '@/constants';
import type { Language } from '@/types';

const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

/** Sarvam TTS handles ~500 chars per request — split long answers on sentences. */
function chunkText(text: string, max = 480): string[] {
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

/**
 * Convert answer text to speech. Returns an ordered list of audio chunks
 * to be played back-to-back.
 */
export async function textToSpeech(
  text: string,
  language: Language,
): Promise<Blob[]> {
  if (!API_KEY) throw new Error('Missing VITE_SARVAM_API_KEY');

  const chunks = chunkText(text);
  const blobs: Blob[] = [];

  for (const chunk of chunks) {
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
          timeout: 20000,
        },
      );
      const b64 = data.audios?.[0];
      if (b64) blobs.push(base64ToBlob(b64));
    } catch (err) {
      console.error('Sarvam TTS failed', err);
      throw new Error('Could not generate speech.');
    }
  }
  return blobs;
}
