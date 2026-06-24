import FarmerAvatar from '@/components/avatar/FarmerAvatar';
import { useStore } from '@/store/useStore';
import type { AvatarState } from '@/types';

const STATE_LABEL: Record<AvatarState, string> = {
  idle: 'Ready',
  listening: 'Listening',
  thinking: 'Thinking…',
  speaking: 'Speaking',
};

const STATE_COLOR: Record<AvatarState, string> = {
  idle: 'bg-field-500',
  listening: 'bg-red-500',
  thinking: 'bg-wheat-400',
  speaking: 'bg-field-600',
};

export default function AvatarStage() {
  const avatarState = useStore((s) => s.avatarState);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 via-field-50 to-field-100 p-4">
      {/* farm scene backdrop: sun, hills, field furrows */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {/* sun */}
        <circle cx="330" cy="60" r="34" fill="#ffe082" opacity="0.85" />
        <circle cx="330" cy="60" r="22" fill="#ffd54f" />
        {/* distant hills */}
        <path d="M0 150 Q90 110 200 140 Q300 165 400 135 L400 300 L0 300 Z" fill="#aed581" opacity="0.55" />
        {/* field with furrows */}
        <path d="M0 185 Q200 155 400 185 L400 300 L0 300 Z" fill="#9ccc65" opacity="0.7" />
        <g stroke="#7cb342" strokeWidth="2" opacity="0.55" fill="none">
          <path d="M0 215 Q200 195 400 215" />
          <path d="M0 245 Q200 228 400 245" />
          <path d="M0 278 Q200 262 400 278" />
        </g>
      </svg>

      {/* state badge */}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-field-800 shadow-sm backdrop-blur">
        <span
          className={`h-2 w-2 rounded-full ${STATE_COLOR[avatarState]} ${
            avatarState !== 'idle' ? 'animate-pulse' : ''
          }`}
        />
        {STATE_LABEL[avatarState]}
      </div>

      <FarmerAvatar />
    </div>
  );
}
