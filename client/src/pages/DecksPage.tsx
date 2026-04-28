import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export function DecksPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-gradient)', backgroundColor: 'var(--bg-primary)' }}
    >
      <header
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
        style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
          >
            ← Voltar
          </button>
          <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
            ⚔ JogoCarta
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
              <rect x="2" y="7" width="16" height="13" rx="2" />
              <path d="M6 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Meus Baralhos
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            O construtor de baralhos está em desenvolvimento. Em breve você poderá criar e gerenciar seus decks aqui.
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', boxShadow: '0 4px 16px var(--accent-glow)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
          >
            Voltar ao Menu
          </button>
        </div>
      </main>
    </div>
  );
}
