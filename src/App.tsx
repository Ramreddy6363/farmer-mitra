import AvatarStage from '@/components/AvatarStage';
import ChatPanel from '@/components/ChatPanel';
import MicButton from '@/components/MicButton';
import LanguageToggle from '@/components/LanguageToggle';
import { APP_NAME, APP_SUBTITLE } from '@/constants';

export default function App() {
  return (
    <div className="flex h-full flex-col bg-field-50 text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between bg-field-700 px-4 py-3 text-white shadow-md sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌾</span>
          <div className="leading-tight">
            <h1 className="text-lg font-bold">{APP_NAME}</h1>
            <p className="text-xs text-field-100">{APP_SUBTITLE}</p>
          </div>
        </div>
        <LanguageToggle />
      </header>

      {/* Main: avatar + chat */}
      <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row">
        {/* Avatar side */}
        <section className="flex flex-[1.2] flex-col gap-4">
          <AvatarStage />
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <MicButton />
          </div>
        </section>

        {/* Chat side */}
        <section className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-field-100/60 shadow-sm">
          <div className="border-b border-field-200 px-4 py-3 text-sm font-semibold text-field-800">
            Conversation
          </div>
          <ChatPanel />
        </section>
      </main>
    </div>
  );
}
