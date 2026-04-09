import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ptBR } from '../locales/pt-BR';

const t = ptBR.mainMenu;
const tc = ptBR.common;
const tt = ptBR.tutorialModal;

/* ------------------------------------------------------------------ */
/* Ícones SVG inline                                                    */
/* ------------------------------------------------------------------ */
const Icons = {
  decks: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="16" height="13" rx="2" />
      <path d="M6 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
    </svg>
  ),
  collection: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  summon: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  play: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  tutorial: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  ranking: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 20 18 10" />
      <polyline points="12 20 12 4" />
      <polyline points="6 20 6 14" />
    </svg>
  ),
  shop: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  settings: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */
type MenuItemKey = keyof typeof MENU_ITEMS;

interface MenuItemDef {
  key: MenuItemKey;
  icon: () => React.ReactElement;
  title: string;
  description: string;
  status: 'available' | 'soon';
  tutorial: string;
  onActivate?: () => void;
}

/* ------------------------------------------------------------------ */
/* Definição dos itens do menu                                          */
/* ------------------------------------------------------------------ */
const MENU_ITEMS = {
  play: null,
  decks: null,
  collection: null,
  summon: null,
  tutorial: null,
  ranking: null,
  shop: null,
  settings: null,
} as const;

function buildMenuItems(
  navigate: ReturnType<typeof useNavigate>,
  openTutorial: () => void
): MenuItemDef[] {
  return [
    {
      key: 'play',
      icon: Icons.play,
      title: t.play.title,
      description: t.play.description,
      status: t.play.status,
      tutorial: t.play.tutorial,
      onActivate: () => navigate('/play'),
    },
    {
      key: 'decks',
      icon: Icons.decks,
      title: t.decks.title,
      description: t.decks.description,
      status: t.decks.status,
      tutorial: t.decks.tutorial,
      onActivate: () => navigate('/decks'),
    },
    {
      key: 'collection',
      icon: Icons.collection,
      title: t.collection.title,
      description: t.collection.description,
      status: t.collection.status,
      tutorial: t.collection.tutorial,
      onActivate: () => navigate('/collection'),
    },
    {
      key: 'summon',
      icon: Icons.summon,
      title: t.summon.title,
      description: t.summon.description,
      status: t.summon.status,
      tutorial: t.summon.tutorial,
      onActivate: () => navigate('/summon'),
    },
    {
      key: 'tutorial',
      icon: Icons.tutorial,
      title: t.tutorial.title,
      description: t.tutorial.description,
      status: t.tutorial.status,
      tutorial: t.tutorial.tutorial,
      onActivate: openTutorial,
    },
    {
      key: 'ranking',
      icon: Icons.ranking,
      title: t.ranking.title,
      description: t.ranking.description,
      status: t.ranking.status,
      tutorial: t.ranking.tutorial,
    },
    {
      key: 'shop',
      icon: Icons.shop,
      title: t.shop.title,
      description: t.shop.description,
      status: t.shop.status,
      tutorial: t.shop.tutorial,
    },
    {
      key: 'settings',
      icon: Icons.settings,
      title: t.settings.title,
      description: t.settings.description,
      status: t.settings.status,
      tutorial: t.settings.tutorial,
    },
  ];
}

/* ================================================================== */
/* Página principal                                                     */
/* ================================================================== */
export function MainMenuPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState<MenuItemKey | null>(null);

  const menuItems = buildMenuItems(navigate, () => setTutorialOpen(true));

  async function handleLogout() {
    try { await api.post('/auth/logout', {}); } finally {
      logout();
      navigate('/login');
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: 'var(--bg-gradient)', backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Glow de fundo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-8"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-5"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 sticky top-0"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
            ⚔ {tc.appName}
          </span>
          <span
            className="hidden sm:block text-xs px-2 py-0.5 rounded"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border-accent)' }}
          >
            Modo Normal
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Avatar / usuário */}
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--border-accent)' }}
            >
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {user?.username}
            </span>
          </div>

          <ThemeToggle />

          <button
            onClick={() => navigate('/lobby')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
          >
            {t.backToModes}
          </button>

          <button
            onClick={handleLogout}
            title={tc.logout}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--error)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--error-border)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
          >
            <Icons.logout />
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="relative z-10 flex-1 px-6 py-8 max-w-6xl mx-auto w-full animate-fade-in">
        {/* Saudação */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t.greeting}
            <span style={{ color: 'var(--accent)' }}>{user?.username}</span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Grid de itens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <MenuCard
              key={item.key}
              item={item}
              infoOpen={infoOpen === item.key}
              onToggleInfo={() => setInfoOpen(infoOpen === item.key ? null : item.key)}
            />
          ))}
        </div>
      </main>

      {/* Modal de Tutorial */}
      {tutorialOpen && <TutorialModal onClose={() => setTutorialOpen(false)} />}
    </div>
  );
}

/* ================================================================== */
/* Card de item do menu                                                 */
/* ================================================================== */
function MenuCard({
  item,
  infoOpen,
  onToggleInfo,
}: {
  item: MenuItemDef;
  infoOpen: boolean;
  onToggleInfo: () => void;
}) {
  const isAvailable = item.status === 'available';

  return (
    <div
      className="relative rounded-2xl p-5 flex flex-col transition-all duration-200 group"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isAvailable ? 'var(--border)' : 'var(--border)'}`,
        backdropFilter: 'blur(8px)',
        opacity: isAvailable ? 1 : 0.6,
      }}
      onMouseEnter={(e) => {
        if (isAvailable) {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-accent)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px var(--accent-glow)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Botão de info/tutorial da seção */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleInfo(); }}
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 z-10"
        style={{
          background: infoOpen ? 'var(--accent-subtle)' : 'transparent',
          color: infoOpen ? 'var(--accent)' : 'var(--text-muted)',
          border: `1px solid ${infoOpen ? 'var(--border-accent)' : 'transparent'}`,
        }}
        title={tc.showInfo}
        aria-label={tc.showInfo}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; }}
        onMouseLeave={(e) => { if (!infoOpen) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
      >
        <Icons.info />
      </button>

      {/* Tooltip de dica */}
      {infoOpen && (
        <div
          className="absolute inset-x-0 top-full mt-2 z-20 rounded-xl p-4 text-sm leading-relaxed animate-fade-in"
          style={{
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-accent)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            color: 'var(--text-secondary)',
          }}
        >
          <p className="font-semibold mb-1" style={{ color: 'var(--accent)' }}>
            Sobre: {item.title}
          </p>
          {item.tutorial}
        </div>
      )}

      {/* Ícone */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: 'var(--accent-subtle)',
          border: '1px solid var(--border-accent)',
          color: isAvailable ? 'var(--accent)' : 'var(--text-muted)',
        }}
      >
        <item.icon />
      </div>

      {/* Título + Badge */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-base" style={{ color: isAvailable ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {item.title}
        </h3>
        {!isAvailable && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {tc.comingSoon}
          </span>
        )}
      </div>

      {/* Descrição */}
      <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: 'var(--text-secondary)' }}>
        {item.description}
      </p>

      {/* Botão de ação */}
      <button
        onClick={() => isAvailable && item.onActivate?.()}
        disabled={!isAvailable}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed"
        style={{
          background: isAvailable ? 'var(--accent)' : 'var(--bg-secondary)',
          color: isAvailable ? 'var(--text-on-accent)' : 'var(--text-muted)',
          border: `1px solid ${isAvailable ? 'transparent' : 'var(--border)'}`,
          boxShadow: isAvailable ? '0 4px 16px var(--accent-glow)' : 'none',
        }}
        onMouseEnter={(e) => { if (isAvailable) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'; }}
        onMouseLeave={(e) => { if (isAvailable) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
      >
        {isAvailable ? item.title : tc.comingSoon}
      </button>
    </div>
  );
}

/* ================================================================== */
/* Modal de Tutorial                                                    */
/* ================================================================== */
function TutorialModal({ onClose }: { onClose: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden animate-fade-in"
        style={{
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-accent)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header do modal */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
            {tt.title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
            aria-label={tc.close}
          >
            <Icons.close />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Navegação lateral */}
          <nav
            className="w-48 shrink-0 py-4 overflow-y-auto"
            style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
          >
            {tt.sections.map((section, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="w-full text-left px-4 py-2.5 text-sm transition-all duration-150"
                style={{
                  color: activeIndex === i ? 'var(--accent)' : 'var(--text-secondary)',
                  background: activeIndex === i ? 'var(--accent-subtle)' : 'transparent',
                  borderLeft: `2px solid ${activeIndex === i ? 'var(--accent)' : 'transparent'}`,
                  fontWeight: activeIndex === i ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (activeIndex !== i) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { if (activeIndex !== i) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
              >
                {section.title}
              </button>
            ))}
          </nav>

          {/* Conteúdo */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {tt.sections[activeIndex].title}
            </h3>
            <p className="text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>
              {tt.sections[activeIndex].content}
            </p>

            {/* Navegação entre seções */}
            <div className="flex gap-3 mt-8">
              {activeIndex > 0 && (
                <button
                  onClick={() => setActiveIndex(activeIndex - 1)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                >
                  ← Anterior
                </button>
              )}
              {activeIndex < tt.sections.length - 1 && (
                <button
                  onClick={() => setActiveIndex(activeIndex + 1)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
                  style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', boxShadow: '0 4px 14px var(--accent-glow)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
                >
                  Próximo →
                </button>
              )}
              {activeIndex === tt.sections.length - 1 && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
                  style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', boxShadow: '0 4px 14px var(--accent-glow)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
                >
                  Fechar Tutorial
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contador de seções */}
        <div
          className="px-6 py-3 flex items-center justify-between shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {activeIndex + 1} / {tt.sections.length}
          </span>
          <div className="flex gap-1">
            {tt.sections.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="w-2 h-2 rounded-full transition-all duration-150"
                style={{ background: i === activeIndex ? 'var(--accent)' : 'var(--border-bright)' }}
                aria-label={`Seção ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
