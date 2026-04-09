import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
}

const saved = (localStorage.getItem('jc-theme') as Theme | null) ?? 'dark';
applyTheme(saved);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: saved,
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('jc-theme', next);
    applyTheme(next);
    set({ theme: next });
  },
}));
