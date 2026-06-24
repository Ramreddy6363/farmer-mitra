import { create } from 'zustand';
import type { AvatarState, ChatMessage, Language, Role } from '@/types';

interface AppState {
  messages: ChatMessage[];
  language: Language;
  avatarState: AvatarState;
  statusText: string;
  error: string | null;

  addMessage: (role: Role, text: string) => void;
  setLanguage: (lang: Language) => void;
  setAvatarState: (s: AvatarState) => void;
  setStatus: (t: string) => void;
  setError: (e: string | null) => void;
  clearChat: () => void;
}

let seq = 0;
const nextId = () => `m${Date.now()}-${seq++}`;

export const useStore = create<AppState>((set) => ({
  messages: [],
  language: 'kn-IN',
  avatarState: 'idle',
  statusText: '',
  error: null,

  addMessage: (role, text) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { id: nextId(), role, text, timestamp: Date.now() },
      ],
    })),
  setLanguage: (language) => set({ language }),
  setAvatarState: (avatarState) => set({ avatarState }),
  setStatus: (statusText) => set({ statusText }),
  setError: (error) => set({ error }),
  clearChat: () => set({ messages: [] }),
}));
