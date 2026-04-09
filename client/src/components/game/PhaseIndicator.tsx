import type { GamePhase, CombatStep } from '../../types/game.types';
import { useGameStore, useGameActions } from '../../store/game.store';

const PHASE_LABELS: Record<GamePhase, string> = {
  start:   'INÍCIO',
  draw:    'COMPRA',
  main1:   'PRINCIPAL 1',
  combat:  'COMBATE',
  main2:   'PRINCIPAL 2',
  end:     'FIM',
};

const PHASE_ORDER: GamePhase[] = ['start', 'draw', 'main1', 'combat', 'main2', 'end'];

const COMBAT_LABELS: Record<CombatStep, string> = {
  declare_attack:   'Declarar Ataque',
  declare_block:    'Declarar Bloqueio',
  reaction_window:  'Janela de Reação',
  damage:           'Dano',
  resolve_deaths:   'Resolver Mortes',
};

export function PhaseIndicator() {
  const phase = useGameStore(s => s.gameState?.phase);
  const combat = useGameStore(s => s.gameState?.combat);
  const isMyTurn = useGameStore(s => s.isMyTurn());
  const actions = useGameActions();
  const turn = useGameStore(s => s.gameState?.turn ?? 1);

  if (!phase) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 12px',
      background: 'var(--bg-card)',
      borderRadius: '10px',
      border: '1px solid var(--border)',
      minWidth: '200px',
    }}>
      {/* Turno */}
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>
        TURNO {turn} — {isMyTurn ? 'SEU TURNO' : 'OPONENTE'}
      </div>

      {/* Fases */}
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        {PHASE_ORDER.map(p => (
          <div
            key={p}
            style={{
              padding: '2px 5px',
              borderRadius: '4px',
              fontSize: '8px',
              fontWeight: 700,
              background: p === phase
                ? (isMyTurn ? 'var(--accent)' : 'rgba(255,255,255,0.15)')
                : 'transparent',
              color: p === phase
                ? (isMyTurn ? '#000' : 'var(--text-primary)')
                : 'var(--text-muted)',
              border: p === phase ? 'none' : '1px solid transparent',
              letterSpacing: '0.03em',
            }}
          >
            {PHASE_LABELS[p]}
          </div>
        ))}
      </div>

      {/* Etapa de combate */}
      {combat && (
        <div style={{
          fontSize: '9px',
          color: '#f87171',
          fontWeight: 600,
          padding: '2px 8px',
          background: 'rgba(239,68,68,0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(239,68,68,0.3)',
        }}>
          ⚔ {COMBAT_LABELS[combat.step]}
        </div>
      )}

      {/* Botões de ação */}
      {isMyTurn && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {(phase === 'main1' || phase === 'main2') && (
            <ActionBtn
              label="Comprar Carta"
              color="#7dd3fc"
              onClick={actions.drawCard}
            />
          )}
          {phase !== 'combat' && (
            <ActionBtn
              label="Próxima Fase →"
              color="var(--accent)"
              onClick={actions.nextPhase}
            />
          )}
          {(phase === 'combat' || combat) && (
            <ActionBtn
              label="Passar Prioridade"
              color="#a78bfa"
              onClick={actions.passPriority}
            />
          )}
          {(phase === 'main2' || phase === 'end') && (
            <ActionBtn
              label="Encerrar Turno"
              color="#ef4444"
              onClick={actions.endTurn}
            />
          )}
        </div>
      )}

      {!isMyTurn && (
        <div style={{
          fontSize: '9px',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
        }}>
          Aguardando oponente…
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 8px',
        borderRadius: '5px',
        border: `1px solid ${color}`,
        background: 'transparent',
        color,
        fontSize: '9px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'background 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = `${color}22`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {label}
    </button>
  );
}
