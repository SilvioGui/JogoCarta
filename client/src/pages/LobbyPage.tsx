import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ptBR } from '../locales/pt-BR';

const t = ptBR.gameMode;
const tc = ptBR.common;

// Ícone de espada para Modo Normal
function SwordIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
    </svg>
  );
}

export function LobbyPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try { await api.post('/auth/logout', {}); } finally {
      logout();
      navigate('/login');
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'var(--bg-gradient)' }}
    >
      {/* Glows de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, var(--accent) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            ⚔ {tc.appName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            {tc.logout}
          </button>
        </div>
      </header>

      {/* Conteúdo central */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-12 animate-fade-in">
        {/* Saudação */}
        <div className="text-center mb-12">
          <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
            {t.welcomeBack}
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {user?.username}
            </span>
          </p>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--accent)', textShadow: '0 0 40px var(--accent-glow)' }}>
            {t.title}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Apenas o Modo Normal é exibido */}
        <div className="w-full max-w-sm">
          <NormalModeCard onPlay={() => navigate('/menu')} />
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente do card de modo de jogo                                   */
/* ------------------------------------------------------------------ */
function NormalModeCard({ onPlay }: { onPlay: () => void }) {
  const t = ptBR.gameMode.normalMode;

  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 animate-pulse-glow"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-accent)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px var(--border-accent)',
      }}
    >
      {/* Ícone */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: 'var(--accent-subtle)',
          border: '1px solid var(--border-accent)',
          color: 'var(--accent)',
        }}
      >
        <SwordIcon />
      </div>

      {/* Título */}
      <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--accent)' }}>
        {t.title}
      </h2>

      {/* Descrição */}
      <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
        {t.description}
      </p>

      {/* Botão de jogar */}
      <button
        onClick={onPlay}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-200"
        style={{
          background: 'var(--accent)',
          color: 'var(--text-on-accent)',
          boxShadow: '0 6px 24px var(--accent-glow)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px var(--accent-glow)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px var(--accent-glow)';
        }}
      >
        {t.play}
      </button>
    </div>
  );
}
