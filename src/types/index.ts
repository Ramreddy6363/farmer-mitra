export type Role = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
}

export type Language = 'kn-IN' | 'en-IN';

/** What the avatar is currently doing — drives its animation. */
export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface SttResult {
  transcript: string;
  /** Language code Sarvam detected, when available. */
  languageCode?: string;
}
