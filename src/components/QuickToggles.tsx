import { Moon, Sun } from 'lucide-react';
import { t as tx, useLang, type Lang } from '../i18n';
import { setSettings } from '../lib/store';
import { useIsDark } from '../lib/theme';

export function setLanguage(lang: Lang) {
  setSettings({ lang });
  // reload so every label, date format and cached text switches cleanly
  setTimeout(() => location.reload(), 50);
}

export function LangToggle({ className = '' }: { className?: string }) {
  const lang = useLang();
  return (
    <button
      className={`qt-btn lang ${className}`}
      onClick={() => setLanguage(lang === 'ru' ? 'en' : 'ru')}
      aria-label={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
      title={lang === 'ru' ? 'English' : 'Русский'}
    >
      <span className={lang === 'en' ? 'on' : ''}>EN</span>
      <span className={lang === 'ru' ? 'on' : ''}>RU</span>
    </button>
  );
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const dark = useIsDark();
  return (
    <button
      className={`qt-btn theme ${className}`}
      onClick={() => setSettings({ theme: dark ? 'light' : 'dark' })}
      aria-label={dark ? tx('Switch to light mode') : tx('Switch to dark mode')}
      title={dark ? tx('Light mode') : tx('Dark mode')}
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  );
}

export function QuickToggles() {
  return (
    <span className="qt">
      <LangToggle />
      <ThemeToggle />
    </span>
  );
}
