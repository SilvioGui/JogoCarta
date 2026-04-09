import { useState } from 'react';
import { useGameStore, useGameActions } from '../../store/game.store';
import { PlayerField } from './PlayerField';
import { Hand } from './Hand';
import { HpEtherBar } from './HpEtherBar';
import { PhaseIndicator } from './PhaseIndicator';
import { GraveyardModal } from './GraveyardModal';
import type { PublicPlayerState } from '../../types/game.types';

interface GraveyardView {
  player: PublicPlayerState;
}

export function GameBoard() {
  const myState = useGameStore(s => s.myState());
  const opponentState = useGameStore(s => s.opponentState());
  const isMyTurn = useGameStore(s => s.isMyTurn());
  const gameState = useGameStore(s => s.gameState);
  const error = useGameStore(s => s.error);
  const actions = useGameActions();

  const [graveyardView, setGraveyardView] = useState<GraveyardView | null>(null);

  if (!gameState || !myState || !opponentState) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: 'var(--text-muted)', fontSize: '14px',
      }}>
        Carregando partida…
      </div>
    );
  }

  const isActive = isMyTurn;
  const opponentIsActive = !isMyTurn;
  const isEndedGame = gameState.status === 'ended';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Erro flutuante */}
      {error && (
        <div style={{
          position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(239,68,68,0.9)',
          color: '#fff', fontSize: '12px', fontWeight: 600,
          padding: '6px 14px', borderRadius: '6px',
          zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          {error}
        </div>
      )}

      {/* Fim de jogo overlay */}
      {isEndedGame && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '12px',
          zIndex: 80,
        }}>
          <div style={{
            fontSize: '28px', fontWeight: 800,
            color: gameState.isDraw ? 'var(--accent)' :
                   gameState.winner === myState.userId ? '#4ade80' : '#ef4444',
          }}>
            {gameState.isDraw ? 'EMPATE' :
             gameState.winner === myState.userId ? 'VITÓRIA!' : 'DERROTA'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {gameState.endReason === 'hp_zero' && 'HP chegou a 0'}
            {gameState.endReason === 'deck_out' && 'Deck esgotado'}
            {gameState.endReason === 'surrender' && 'Rendição'}
          </div>
        </div>
      )}

      {/* ── Área do Oponente (topo) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 10px',
        borderBottom: '1px solid var(--border)',
        background: opponentIsActive ? 'rgba(239,68,68,0.04)' : 'transparent',
        transition: 'background 0.3s',
      }}>
        <HpEtherBar player={opponentState} isMine={false} />
        <Hand cards={opponentState.hand} isMyHand={false} />

        {/* Cemitério e Exílio do oponente */}
        <ZonePile
          label="Cem."
          count={opponentState.graveyard.length}
          color="#9ca3af"
          onClick={() => setGraveyardView({ player: opponentState })}
        />
        <ZonePile
          label="Exílio"
          count={opponentState.exile.length}
          color="#a78bfa"
          onClick={() => setGraveyardView({ player: opponentState })}
        />
      </div>

      {/* ── Campo do Oponente ── */}
      <div style={{ padding: '4px 10px', flex: '1 0 0', minHeight: 0 }}>
        <PlayerField
          player={opponentState}
          isMine={false}
          isActive={opponentIsActive}
        />
      </div>

      {/* ── Centro: Indicador de Fase ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px 10px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        gap: '10px',
      }}>
        <PhaseIndicator />

        {/* Surrender */}
        {!isEndedGame && (
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja se render?')) actions.surrender();
            }}
            style={{
              padding: '3px 10px',
              borderRadius: '5px',
              border: '1px solid rgba(239,68,68,0.4)',
              background: 'transparent',
              color: 'rgba(239,68,68,0.6)',
              fontSize: '9px',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            Render
          </button>
        )}
      </div>

      {/* ── Campo Próprio ── */}
      <div style={{ padding: '4px 10px', flex: '1 0 0', minHeight: 0 }}>
        <PlayerField
          player={myState}
          isMine
          isActive={isActive}
        />
      </div>

      {/* ── Área do Jogador (base) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 10px',
        borderTop: '1px solid var(--border)',
        background: isActive ? 'rgba(201,169,75,0.04)' : 'transparent',
        transition: 'background 0.3s',
      }}>
        <HpEtherBar player={myState} isMine />

        {/* Cemitério e Exílio do jogador */}
        <ZonePile
          label="Cem."
          count={myState.graveyard.length}
          color="#9ca3af"
          onClick={() => setGraveyardView({ player: myState })}
        />
        <ZonePile
          label="Exílio"
          count={myState.exile.length}
          color="#a78bfa"
          onClick={() => setGraveyardView({ player: myState })}
        />

        <Hand cards={myState.hand} isMyHand />
      </div>

      {/* Modal cemitério/exílio */}
      {graveyardView && (
        <GraveyardModal
          graveyard={graveyardView.player.graveyard}
          exile={graveyardView.player.exile}
          username={graveyardView.player.username}
          onClose={() => setGraveyardView(null)}
        />
      )}
    </div>
  );
}

function ZonePile({
  label, count, color, onClick,
}: {
  label: string;
  count: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '4px 6px',
        borderRadius: '6px',
        border: `1px solid ${color}44`,
        background: 'transparent',
        cursor: 'pointer',
        gap: '2px',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '9px', color, fontWeight: 700 }}>{count}</span>
      <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{label}</span>
    </button>
  );
}
