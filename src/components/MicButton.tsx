import { useConversation } from '@/hooks/useConversation';
import { useStore } from '@/store/useStore';

export default function MicButton() {
  const { isRecording, toggleRecording, recorderError } = useConversation();
  const avatarState = useStore((s) => s.avatarState);
  const statusText = useStore((s) => s.statusText);
  const error = useStore((s) => s.error);

  // Disable while the assistant is busy (thinking / speaking).
  const busy = avatarState === 'thinking' || avatarState === 'speaking';

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="h-5 text-sm font-medium text-field-700">
        {statusText || (isRecording ? 'Listening…' : 'Tap to speak')}
      </p>

      <div className="relative">
        {isRecording && (
          <span className="pulse-ring absolute inset-0 rounded-full bg-red-400" />
        )}
        <button
          onClick={toggleRecording}
          disabled={busy}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-field-600 hover:bg-field-700'
          }`}
        >
          {isRecording ? (
            <span className="h-6 w-6 rounded-sm bg-white" />
          ) : (
            <MicIcon />
          )}
        </button>
      </div>

      {(error || recorderError) && (
        <p className="max-w-xs text-center text-xs text-red-600">
          {error || recorderError}
        </p>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M6 11a6 6 0 0 0 12 0M12 17v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
