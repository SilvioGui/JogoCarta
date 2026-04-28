import { useState, useEffect } from 'react';
import { useGameStore, useGameActions } from '../../store/game.store';
import { PlayerField } from './PlayerField';
import { Hand } from './Hand';
import { HpEtherBar } from './HpEtherBar';
import { PhaseIndicator } from './PhaseIndicator';
import { GraveyardModal } from './GraveyardModal';
import { EventLog } from './EventLog';
import { MulliganModal } from './MulliganModal';
import { CardComponent } from './CardComponent';
import type { PublicPlayerState, GameCard } from '../../types/game.types';

interface GraveyardView { player: PublicPlayerState }
interface ExtraDeckView { player: PublicPlayerState }

export function GameBoard({ isTutorial = false }: { isTutorial?: boolean }) {
  const myState      = useGameStore(s => s.myState());
  const opponentState = useGameStore(s => s.opponentState());
  const isMyTurn     = useGameStore(s => s.isMyTurn());
  const gameState    = useGameStore(s => s.gameState);
  const error        = useGameStore(s => s.error);
  const roomCode     = useGameStore(s => s.roomCode) ?? '';
  const actions      = useGameActions();

  const [graveyardView, setGraveyardView]   = useState<GraveyardView | null>(null);
  const [extraDeckView, setExtraDeckView]   = useState<ExtraDeckView | null>(null);
  const [mulliganDone, setMulliganDone]     = useState(false);
  const [hoveredCard, setHoveredCard]       = useState<GameCard | null>(null);

  // Auto-limpar erro
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => useGameStore.getState().setError(null), 3500);
    return () => clearTimeout(t);
  }, [error]);

  if (!gameState || !myState || !opponentState) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '14px' }}>
        Carregando partida…
      </div>
    );
  }

  const isEndedGame     = gameState.status === 'ended';
  const opponentIsActive = !isMyTurn;
  const showMulligan    = !mulliganDone && !myState.mulliganUsed && gameState.turn === 1 && myState.hand.length > 0 && gameState.status === 'active';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: 'var(--bg-primary)', overflow: 'hidden', position: 'relative',
    }}>
      {/* ── Erro flutuante ── */}
      {error && (
        <div style={{
          position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(239,68,68,0.92)', color: '#fff', fontSize: '12px', fontWeight: 600,
          padding: '6px 16px', borderRadius: '6px', zIndex: 50,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)', pointerEvents: 'none',
        }}>
          {error}
        </div>
      )}

      {/* ── Mulligan ── */}
      {showMulligan && (
        <MulliganModal
          hand={myState.hand}
          roomCode={roomCode}
          onDone={() => setMulliganDone(true)}
        />
      )}

      {/* ── Tutorial Banner ── */}
      {isTutorial && !isEndedGame && (
        <TutorialHint phase={gameState.phase} isMyTurn={isMyTurn} combat={gameState.combat} />
      )}

      {/* ── Fim de jogo overlay ── */}
      {isEndedGame && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '12px', zIndex: 80,
        }}>
          <div style={{
            fontSize: '32px', fontWeight: 900,
            color: gameState.isDraw ? 'var(--accent)' : gameState.winner === myState.userId ? '#4ade80' : '#ef4444',
          }}>
            {gameState.isDraw ? 'EMPATE' : gameState.winner === myState.userId ? 'VITÓRIA!' : 'DERROTA'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {gameState.endReason === 'hp_zero'   && 'HP chegou a 0'}
            {gameState.endReason === 'deck_out'  && 'Deck esgotado'}
            {gameState.endReason === 'surrender' && 'Rendição'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Voltando ao lobby em 5 segundos…
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── Área do Oponente (topo) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 8px',
        borderBottom: '1px solid var(--border)',
        background: opponentIsActive ? 'rgba(239,68,68,0.04)' : 'transparent',
        flexShrink: 0,
      }}>
        <HpEtherBar player={opponentState} isMine={false} />

        {/* Extra Deck do oponente */}
        <ExtraDeckPile player={opponentState} onClick={() => setExtraDeckView({ player: opponentState })} />

        {/* Cemitério / Exílio */}
        <ZonePile label="Cem." count={opponentState.graveyard.length} color="#9ca3af" onClick={() => setGraveyardView({ player: opponentState })} />
        <ZonePile label="Exílio" count={opponentState.exile.length} color="#a78bfa" onClick={() => setGraveyardView({ player: opponentState })} />

        {/* Mão do oponente */}
        <Hand cards={opponentState.hand} isMyHand={false} />
      </div>

      {/* ── Campo do Oponente ── */}
      <div style={{ padding: '3px 8px', flex: '1 0 0', minHeight: 0 }}>
        <PlayerField player={opponentState} isMine={false} isActive={opponentIsActive} onHoverCard={setHoveredCard} />
      </div>

      {/* ── Centro: Indicador de Fase + Log ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '4px 8px', gap: '8px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        <PhaseIndicator />
        <EventLog />

        {/* Tooltip da carta em hover */}
        {hoveredCard && <CardTooltip card={hoveredCard} />}

        {/* Render */}
        {!isEndedGame && (
          <button
            onClick={() => { if (confirm('Render?')) actions.surrender(); }}
            style={{
              marginLeft: 'auto', padding: '3px 10px', borderRadius: '5px',
              border: '1px solid rgba(239,68,68,0.4)', background: 'transparent',
              color: 'rgba(239,68,68,0.6)', fontSize: '9px', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}
          >
            Render
          </button>
        )}
      </div>

      {/* ── Campo Próprio ── */}
      <div style={{ padding: '3px 8px', flex: '1 0 0', minHeight: 0 }}>
        <PlayerField player={myState} isMine isActive={isMyTurn} onHoverCard={setHoveredCard} />
      </div>

      {/* ── Área do Jogador (base) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 8px',
        borderTop: '1px solid var(--border)',
        background: isMyTurn ? 'rgba(201,169,75,0.04)' : 'transparent',
        flexShrink: 0,
      }}>
        <HpEtherBar player={myState} isMine />
        <ExtraDeckPile player={myState} onClick={() => setExtraDeckView({ player: myState })} />
        <ZonePile label="Cem." count={myState.graveyard.length} color="#9ca3af" onClick={() => setGraveyardView({ player: myState })} />
        <ZonePile label="Exílio" count={myState.exile.length} color="#a78bfa" onClick={() => setGraveyardView({ player: myState })} />
        <Hand cards={myState.hand} isMyHand />
      </div>

      {/* ── Modais ── */}
      {graveyardView && (
        <GraveyardModal
          graveyard={graveyardView.player.graveyard}
          exile={graveyardView.player.exile}
          username={graveyardView.player.username}
          onClose={() => setGraveyardView(null)}
        />
      )}
      {extraDeckView && (
        <ExtraDeckModal
          cards={extraDeckView.player.extraDeck}
          username={extraDeckView.player.username}
          onClose={() => setExtraDeckView(null)}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ────────────────────────────────────────────────────────────────────────────

function ZonePile({ label, count, color, onClick }: { label: string; count: number; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '3px 5px', borderRadius: '6px',
        border: `1px solid ${color}44`, background: 'transparent',
        cursor: 'pointer', gap: '1px', flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '9px', color, fontWeight: 700 }}>{count}</span>
      <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{label}</span>
    </button>
  );
}

function ExtraDeckPile({ player, onClick }: { player: PublicPlayerState; onClick: () => void }) {
  const count = player.extraDeck.length;
  return (
    <button
      onClick={onClick}
      title="Extra Deck (Comandantes)"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '3px 5px', borderRadius: '6px',
        border: '1px solid var(--accent)44', background: 'transparent',
        cursor: 'pointer', gap: '1px', flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: 700 }}>👑 {count}</span>
      <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Extra</span>
    </button>
  );
}

function ExtraDeckModal({ cards, username, onClose }: { cards: GameCard[]; username: string; onClose: () => void }) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', maxWidth: '480px', width: '90%' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
            👑 Extra Deck — {username}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {cards.map(card => (
            <CardComponent key={card.instanceId} card={card} location="extraDeck" isMine />
          ))}
          {cards.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Vazio</span>}
        </div>
      </div>
    </div>
  );
}

function CardTooltip({ card }: { card: GameCard }) {
  const kw = card.keywords.filter(Boolean);
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '8px 10px',
      fontSize: '10px',
      color: 'var(--text-primary)',
      maxWidth: '180px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      flexShrink: 0,
      lineHeight: 1.5,
    }}>
      <div style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--accent)' }}>{card.name}</div>
      {card.damage > 0 && <div>⚔ {card.damage}  ♥ {card.currentHealth}/{card.health}</div>}
      {kw.length > 0 && <div style={{ color: '#a78bfa', marginTop: '2px' }}>{kw.join(', ')}</div>}
      {card.description && (
        <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '9px', whiteSpace: 'normal' }}>
          {card.description}
        </div>
      )}
    </div>
  );
}

// ── Tutorial Hint ────────────────────────────────────────────────────────────
const TUTORIAL_HINTS: Record<string, string> = {
  main1:  '💡 Fase Principal: Jogue terrenos (grátis) e monstros pagando Éter. Clique nas cartas da mão para opções.',
  combat: '💡 Combate: Clique em "Atk" para atacar. O oponente pode bloquear. Clique "Passar Prioridade" para resolver o dano.',
  main2:  '💡 Fase Principal 2: Jogue mais cartas ou clique "Encerrar Turno" para passar a vez.',
  end:    '💡 Encerre o turno para passar a vez ao oponente.',
};

function TutorialHint({ phase, isMyTurn, combat }: { phase: string; isMyTurn: boolean; combat: unknown }) {
  const hint = combat
    ? '💡 Combate ativo: declare bloqueio com "Blk" ou "Não Bloquear →" para avançar.'
    : TUTORIAL_HINTS[phase] ?? '';

  if (!hint || !isMyTurn) return null;

  return (
    <div style={{
      background: 'rgba(201,169,75,0.12)',
      border: '1px solid var(--accent)55',
      padding: '5px 12px',
      fontSize: '11px',
      color: 'var(--accent)',
      textAlign: 'center',
      flexShrink: 0,
    }}>
      {hint}
    </div>
  );
}
