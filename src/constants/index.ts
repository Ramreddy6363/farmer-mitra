import type { Language } from '@/types';

/** Sarvam API endpoints. */
export const SARVAM_BASE = 'https://api.sarvam.ai';
export const SARVAM_STT_URL = `${SARVAM_BASE}/speech-to-text`;
export const SARVAM_TTS_URL = `${SARVAM_BASE}/text-to-speech`;

/** Lyzr Agent inference endpoint. */
export const LYZR_CHAT_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';

/**
 * Voice used for Sarvam TTS — a male voice suits the farmer.
 * bulbul:v2 male options: 'abhilash', 'karun', 'hitesh'.
 * The same voice speaks both Kannada and English.
 */
export const TTS_SPEAKER = 'abhilash';

/** Language options shown in the UI. */
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'kn-IN', label: 'ಕನ್ನಡ' },
  { code: 'en-IN', label: 'English' },
];

export const APP_NAME = 'ಕಿಸಾನ್ ಮಿತ್ರ';
export const APP_SUBTITLE = 'Kisan Mitra · AI Farmer Assistant';

/** A friendly greeting the avatar shows on first load. */
export const GREETING: Record<Language, string> = {
  'kn-IN': 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ಮೈಕ್ ಒತ್ತಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಿ.',
  'en-IN': "Namaste! I'm your farming assistant. Tap the mic and ask me anything.",
};
