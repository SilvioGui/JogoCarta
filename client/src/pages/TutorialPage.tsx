import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';
import { api } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { GameBoard } from '../components/game/GameBoard';
import type { PublicGameState } from '../types/game.types';

interface DeckSummary { id: string; name: string; is_valid: number; main_count: number }

type TutorialStep = 'intro' | 'loading' | 'playing';

// Passos do tutorial exibidos antes do jogo começar
const INTRO_STEPS = [
  {
    title: 'Bem-vindo ao JogoCarta!',
    body: 'Este é um jogo de cartas estratégico onde dois jogadores se enfrentam usando decks de 100 cartas. Você jogará contra o Tutor — uma IA simples — para aprender as mecânicas.',
    icon: '🃏',
  },
  {
    title: 'O Campo de Batalha',
    body: 'O campo tem duas linhas: a Linha de Combate (frente) onde seus monstros atacam e defendem, e a Linha de Recursos (trás) onde cartas geram Éter ou ficam de reserva.',
    icon: '🏰',
  },
  {
    title: 'Éter — O Recurso',
    body: 'Éter é a moeda do jogo. Jogue um terreno por turno de graça clicando em "⚡ Recurso". Cada terreno em Modo Recurso gera +1 Éter no início do turno.',
    icon: '⚡',
  },
  {
    title: 'Seu Turno',
    body: 'Cada turno começa na Fase Principal 1. Jogue cartas, avance monstros para a linha de combate (custa 2 Éter), declare ataques na fase de Combate, e encerre com "Encerrar Turno".',
    icon: '⚔',
  },
  {
    title: 'Vitória',
    body: 'Reduza o HP do oponente a 0 atacando com seus monstros. Você começa com 100 HP. Boa sorte!',
    icon: '🏆',
  },
];

export function TutorialPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { setRoom, setConnecting, setGameState, clearGame } = useGameStore();

  const [step, setStep] = useState<TutorialStep>('intro');
  const [introIdx, setIntroIdx] = useState(0);
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [gameActive, setGameActive] = useState(false);

  const gameState = useGameStore(s => s.gameState);

  // Carregar decks
  useEffect(() => {
    api.get<{ decks: DeckSummary[] }>('/decks')
      .then(({ decks: list }) => {
        setDecks(list);
        const valid = list.find(d => d.is_valid);
        if (valid) setSelectedDeckId(valid.id);
      })
      .catch(() => setStatusMsg('Erro ao carregar decks.'))
      .finally(() => setLoadingDecks(false));
  }, []);

  // Quando partida terminar, voltar
  useEffect(() => {
    if (gameState?.status === 'ended') {
      const t = setTimeout(() => {
        clearGame();
        disconnectSocket();
        setGameActive(false);
        setStep('intro');
        setIntroIdx(0);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [gameState?.status]);

  async function createTestDeck() {
    try {
      setStatusMsg('Criando deck de teste…');
      const { deckId } = await api.post<{ deckId: string }>('/decks/test-deck', {});
      const { decks: list } = await api.get<{ decks: DeckSummary[] }>('/decks');
      setDecks(list);
      setSelectedDeckId(deckId);
      setStatusMsg('');
    } catch {
      setStatusMsg('Erro ao criar deck.');
    }
  }

  function startTutorial() {
    if (!selectedDeckId) return;
    setStep('loading');
    setStatusMsg('Iniciando partida tutorial…');

    const socket = connectSocket();

    socket.emit('tutorial:start', { deckId: selectedDeckId }, (res: {
      ok: boolean;
      roomCode?: string;
      deckId?: string;
      state?: PublicGameState;
      error?: string;
    }) => {
      if (!res.ok || !res.roomCode || !res.state) {
        setStatusMsg(res.error ?? 'Erro ao iniciar tutorial.');
        setStep('intro');
        return;
      }

      setRoom(res.roomCode, user!.id);
      setConnecting(false);
      setGameState(res.state, []);

      // Registrar no game:join para receber updates de estado
      socket.emit('game:join', { roomCode: res.roomCode, deckId: res.deckId ?? selectedDeckId }, () => {});

      setGameActive(true);
      setStep('playing');
    });
  }

  // ── Modo jogo ──────────────────────────────────────────────────────────────
  if (step === 'playing' && gameActive) {
    return <GameBoard isTutorial />;
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '12px', background: 'var(--bg-primary)' }}>
        <Spinner />
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{statusMsg}</span>
      </div>
    );
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  const current = INTRO_STEPS[introIdx];
  const isLast = introIdx === INTRO_STEPS.length - 1;
  const validDecks = decks.filter(d => d.is_valid);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-gradient)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px', gap: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => navigate('/menu')}
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '6px', padding: '5px 12px', fontSize: '12px' }}
        >
          ← Voltar
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', margin: 0 }}>
          Tutorial
        </h1>
      </div>

      {/* Card do passo atual */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px',
        display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '40px' }}>{current.icon}</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {current.title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {current.body}
          </div>
        </div>

        {/* Dots de progresso */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {INTRO_STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setIntroIdx(i)}
              style={{
                width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                background: i === introIdx ? 'var(--accent)' : 'var(--border)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        {/* Seleção de deck (apenas no último passo) */}
        {isLast && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              ESCOLHA SEU DECK
            </label>
            {loadingDecks ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Carregando…</div>
            ) : validDecks.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '12px', color: '#f87171' }}>Nenhum deck válido. Crie um primeiro:</div>
                <button
                  onClick={createTestDeck}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #4ade80', background: 'rgba(74,222,128,0.08)', color: '#4ade80', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🧪 Criar Deck de Teste
                </button>
              </div>
            ) : (
              <select
                value={selectedDeckId}
                onChange={e => setSelectedDeckId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
              >
                {validDecks.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.main_count} cartas)</option>
                ))}
              </select>
            )}
            {statusMsg && <div style={{ fontSize: '11px', color: '#f87171' }}>{statusMsg}</div>}
          </div>
        )}

        {/* Botões de navegação */}
        <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
          {introIdx > 0 && (
            <button
              onClick={() => setIntroIdx(i => i - 1)}
              style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}
            >
              ← Anterior
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => setIntroIdx(i => i + 1)}
              style={{ padding: '8px 24px', borderRadius: '8px', border: '1px solid var(--accent)', background: 'var(--accent-subtle)', color: 'var(--accent)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Próximo →
            </button>
          )}
          {isLast && (
            <button
              onClick={startTutorial}
              disabled={!selectedDeckId}
              style={{
                padding: '10px 28px', borderRadius: '10px', border: '1px solid #4ade80',
                background: selectedDeckId ? 'rgba(74,222,128,0.15)' : 'transparent',
                color: selectedDeckId ? '#4ade80' : 'var(--text-muted)',
                fontSize: '14px', fontWeight: 800,
                cursor: selectedDeckId ? 'pointer' : 'not-allowed',
                opacity: selectedDeckId ? 1 : 0.5,
              }}
            >
              ⚔ Iniciar Tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <>
      <div style={{ width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
