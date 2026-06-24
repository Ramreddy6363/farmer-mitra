import axios from 'axios';
import { SARVAM_STT_URL } from '@/constants';
import type { Language, SttResult } from '@/types';

const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

/**
 * Convert recorded speech to text using Sarvam STT.
 * Pass `language` to bias recognition, or omit for auto-detect.
 */
export async function speechToText(
  audio: Blob,
  language?: Language,
): Promise<SttResult> {
  if (!API_KEY) throw new Error('Missing VITE_SARVAM_API_KEY');

  // The browser records as "audio/webm;codecs=opus", but Sarvam only accepts
  // the bare MIME type — strip the codec suffix before sending.
  const cleanType = (audio.type.split(';')[0] || 'audio/webm').trim();
  const ext = cleanType.includes('mp4')
    ? 'mp4'
    : cleanType.includes('ogg')
      ? 'ogg'
      : 'webm';
  const file = new Blob([audio], { type: cleanType });

  const form = new FormData();
  form.append('file', file, `speech.${ext}`);
  form.append('model', 'saarika:v2.5');
  form.append('language_code', language ?? 'unknown');

  try {
    const { data } = await axios.post(SARVAM_STT_URL, form, {
      headers: { 'api-subscription-key': API_KEY },
      timeout: 20000,
    });
    return {
      transcript: (data.transcript ?? '').trim(),
      languageCode: data.language_code,
    };
  } catch (err) {
    const detail =
      axios.isAxiosError(err) &&
      (err.response?.data?.error?.message ?? err.response?.data?.message);
    console.error('Sarvam STT failed', detail || err);
    throw new Error('Could not understand the audio. Please try again.');
  }
}
