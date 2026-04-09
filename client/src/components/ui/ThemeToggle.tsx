import { useThemeStore } from '../../store/theme.store';
import { ptBR } from '../../locales/pt-BR';

const t = ptBR.common;

// Ícone Sol (modo claro)
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
    </svg>
  );
}

// Ícone Lua (modo escuro)
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      title={isDark ? t.themeToggleLight : t.themeToggleDark}
      aria-label={isDark ? t.themeToggleLight : t.themeToggleDark}
      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${className}`}
      style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border)',
        color: 'var(--accent)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-accent)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card-solid)';
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
