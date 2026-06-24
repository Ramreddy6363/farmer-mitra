import { useStore } from '@/store/useStore';
import { LANGUAGES } from '@/constants';

export default function LanguageToggle() {
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);

  return (
    <div className="flex rounded-full bg-field-700/40 p-1 text-sm">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={`rounded-full px-3 py-1 transition-colors ${
            language === l.code
              ? 'bg-white font-semibold text-field-700'
              : 'text-white/90 hover:text-white'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
