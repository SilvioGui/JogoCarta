import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { connectSocket } from '../services/socket';

interface DeckSummary {
  id: string;
  name: string;
  description: string | null;
  is_valid: number;
  main_count: number;
  extra_count: number;
}

type Tab = 'quick' | 'create' | 'join';

export function PlayPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('quick');

  // Quick match
  const [inQueue, setInQueue] = useState(false);

  // Create room
  const [roomCode, setRoomCode] = useState<string | null>(null);

  // Join room
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    async function loadDecks() {
      try {
        const { decks: list } = await api.get<{ decks: DeckSummary[] }>('/decks');
        setDecks(list);
        const validDeck = list.find(d => d.is_valid);
        if (validDeck) setSelectedDeckId(validDeck.id);
      } catch {
        setStatusMsg('Erro ao carregar decks.');
      } finally {
        setLoading(false);
      }
    }
    loadDecks();
  }, []);

  // Socket para matchmaking
  const getSocket = useCallback(() => {
    const socket = connectSocket();

    socket.off('matchmaking:opponent_found');
    socket.on('matchmaking:opponent_found', (data: { roomCode: string; deckId: string; opponentUsername: string }) => {
      setInQueue(false);
      setStatusMsg(`Oponente encontrado: ${data.opponentUsername}! Entrando na partida…`);
      navigate(`/game?room=${data.roomCode}&deck=${data.deckId}`);
    });

    return socket;
  }, [navigate]);

  async function createStarterDeck() {
    try {
      setStatusMsg('Criando deck inicial…');
      const { deckId } = await api.post<{ deckId: string }>('/decks/starter', {});
      const { decks: list } = await api.get<{ decks: DeckSummary[] }>('/decks');
      setDecks(list);
      setSelectedDeckId(deckId);
      setStatusMsg('Deck inicial criado com sucesso!');
    } catch (e: unknown) {
      const err = e as { message?: string };
      setStatusMsg(err.message ?? 'Erro ao criar deck inicial.');
    }
  }

  function handleQuickMatch() {
    if (!selectedDeckId) return;
    const socket = getSocket();
    setInQueue(true);
    setStatusMsg('Procurando oponente…');
    socket.emit('matchmaking:queue', { deckId: selectedDeckId }, (res: { ok: boolean; error?: string }) => {
      if (!res.ok) {
        setInQueue(false);
        setStatusMsg(res.error ?? 'Erro ao entrar na fila.');
      }
    });
  }

  function handleCancelQueue() {
    const socket = getSocket();
    socket.emit('matchmaking:dequeue', {});
    setInQueue(false);
    setStatusMsg('');
  }

  function handleCreateRoom() {
    if (!selectedDeckId) return;
    const socket = getSocket();
    socket.emit('matchmaking:create_room', { deckId: selectedDeckId }, (res: { ok: boolean; roomCode?: string; error?: string }) => {
      if (res.ok && res.roomCode) {
        setRoomCode(res.roomCode);
        setStatusMsg('Sala criada! Compartilhe o código com seu oponente.');
      } else {
        setStatusMsg(res.error ?? 'Erro ao criar sala.');
      }
    });
  }

  function handleJoinRoom() {
    if (!selectedDeckId || !joinCode.trim()) return;
    setJoinError('');
    const socket = getSocket();
    socket.emit('matchmaking:join_room',
      { roomCode: joinCode.trim().toUpperCase(), deckId: selectedDeckId },
      (res: { ok: boolean; roomCode?: string; deckId?: string; opponentUsername?: string; error?: string }) => {
        if (res.ok && res.roomCode) {
          setStatusMsg(`Oponente encontrado: ${res.opponentUsername}! Entrando na partida…`);
          navigate(`/game?room=${res.roomCode}&deck=${res.deckId}`);
        } else {
          setJoinError(res.error ?? 'Sala não encontrada.');
        }
      }
    );
  }

  const validDecks = decks.filter(d => d.is_valid);
  const hasValidDeck = validDecks.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      gap: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <button
          onClick={() => navigate('/menu')}
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer',
            borderRadius: '6px', padding: '6px 12px', fontSize: '12px',
          }}
        >
          ← Voltar
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)', margin: 0 }}>
          ⚔ Jogar
        </h1>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Olá, {user?.username}
        </span>
      </div>

      {/* Card principal */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>

        {/* Seleção de deck */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
            DECK SELECIONADO
          </label>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Carregando decks…</div>
          ) : !hasValidDeck ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f87171',
              }}>
                Você não possui um deck válido (100 cartas + 5 comandantes).
              </div>
              <button
                onClick={createStarterDeck}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--accent)',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Criar Deck Inicial
              </button>
            </div>
          ) : (
            <select
              value={selectedDeckId}
              onChange={e => setSelectedDeckId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {validDecks.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.main_count} cartas)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Tabs de modo */}
        {hasValidDeck && (
          <>
            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}>
              {(['quick', 'create', 'join'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px 6px 0 0',
                    border: 'none',
                    background: tab === t ? 'var(--accent-subtle)' : 'transparent',
                    color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t === 'quick' ? '⚡ Partida Rápida' : t === 'create' ? '🚪 Criar Sala' : '🔗 Entrar'}
                </button>
              ))}
            </div>

            {/* Conteúdo da tab */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {tab === 'quick' && (
                <>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Encontra automaticamente um oponente disponível na fila.
                  </p>
                  {!inQueue ? (
                    <BigBtn label="Buscar Partida" color="var(--accent)" onClick={handleQuickMatch} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                      <Spinner />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Procurando oponente…</span>
                      <button
                        onClick={handleCancelQueue}
                        style={{
                          background: 'transparent', border: '1px solid rgba(239,68,68,0.4)',
                          color: 'rgba(239,68,68,0.8)', cursor: 'pointer',
                          borderRadius: '6px', padding: '4px 12px', fontSize: '11px',
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </>
              )}

              {tab === 'create' && (
                <>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Cria uma sala e compartilha o código com um amigo.
                  </p>
                  {!roomCode ? (
                    <BigBtn label="Criar Sala" color="#4ade80" onClick={handleCreateRoom} />
                  ) : (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '16px', background: 'rgba(74,222,128,0.06)', borderRadius: '10px',
                      border: '1px solid rgba(74,222,128,0.3)',
                    }}>
                      <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 700, letterSpacing: '0.1em' }}>
                        CÓDIGO DA SALA
                      </span>
                      <span style={{ fontSize: '28px', fontWeight: 900, color: '#4ade80', letterSpacing: '0.2em' }}>
                        {roomCode}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Aguardando oponente…
                      </span>
                      <Spinner />
                    </div>
                  )}
                </>
              )}

              {tab === 'join' && (
                <>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Digite o código da sala criada pelo seu amigo.
                  </p>
                  <input
                    type="text"
                    placeholder="Código de 6 letras (ex: A1B2C3)"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: `1px solid ${joinError ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '16px',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textAlign: 'center',
                      width: '100%',
                      outline: 'none',
                    }}
                  />
                  {joinError && (
                    <div style={{ fontSize: '11px', color: '#f87171' }}>{joinError}</div>
                  )}
                  <BigBtn
                    label="Entrar na Sala"
                    color="#7dd3fc"
                    onClick={handleJoinRoom}
                    disabled={joinCode.length < 6}
                  />
                </>
              )}
            </div>
          </>
        )}

        {/* Mensagem de status */}
        {statusMsg && (
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            borderRadius: '6px',
            textAlign: 'center',
          }}>
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}

function BigBtn({ label, color, onClick, disabled = false }: {
  label: string; color: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '10px',
        border: `1px solid ${color}`,
        background: disabled ? 'transparent' : `${color}18`,
        color: disabled ? 'var(--text-muted)' : color,
        fontSize: '14px',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <>
      <div style={{
        width: '28px', height: '28px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
