import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { GREETING } from '@/constants';

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatPanel() {
  const messages = useStore((s) => s.messages);
  const language = useStore((s) => s.language);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="chat-scroll flex-1 space-y-3 overflow-y-auto p-4">
      {messages.length === 0 && (
        <div className="rounded-2xl bg-field-50 p-4 text-sm text-field-800">
          {GREETING[language]}
        </div>
      )}

      {messages.map((m) => {
        const isUser = m.role === 'user';
        return (
          <div
            key={m.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isUser
                  ? 'rounded-br-sm bg-field-600 text-white'
                  : 'rounded-bl-sm bg-white text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
              <span
                className={`mt-1 block text-[10px] ${
                  isUser ? 'text-field-100' : 'text-gray-400'
                }`}
              >
                {formatTime(m.timestamp)}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
