import { useGameStore } from '../../store/game.store';
import type { GameEvent } from '../../types/game.types';

function describeEvent(evt: GameEvent, myUserId: string): { text: string; color: string } | null {
  switch (evt.type) {
    case 'card_played':
      return {
        text: `${evt.playerId === myUserId ? 'Você' : 'Oponente'} jogou ${evt.card.name}`,
        color: evt.playerId === myUserId ? '#4ade80' : '#f87171',
      };
    case 'card_drawn':
      return {
        text: `${evt.playerId === myUserId ? 'Você' : 'Oponente'} sacou uma carta`,
        color: '#7dd3fc',
      };
    case 'player_damage':
      return {
        text: `${evt.targetPlayerId === myUserId ? 'Você sofreu' : 'Oponente sofreu'} ${evt.amount} de dano`,
        color: '#f87171',
      };
    case 'damage_dealt':
      return { text: `Criatura sofreu ${evt.amount} de dano`, color: '#fb923c' };
    case 'card_destroyed':
      return { text: 'Criatura destruída', color: '#9ca3af' };
    case 'card_to_graveyard':
      return { text: `${evt.card.name} → Cemitério`, color: '#9ca3af' };
    case 'card_moved':
      return {
        text: `Criatura ${evt.from === 'back' ? 'avançou' : 'recuou'}`,
        color: '#a78bfa',
      };
    case 'combat_started':
      return { text: '⚔ Combate declarado', color: '#fbbf24' };
    case 'phase_changed':
      return {
        text: `Fase: ${PHASE_PT[evt.phase] ?? evt.phase}`,
        color: 'var(--text-muted)',
      };
    case 'game_ended':
      return {
        text: evt.isDraw ? 'Empate!' : `Fim de jogo`,
        color: '#f59e0b',
      };
    default:
      return null;
  }
}

const PHASE_PT: Record<string, string> = {
  start:  'Início',
  draw:   'Compra',
  main1:  'Principal 1',
  combat: 'Combate',
  main2:  'Principal 2',
  end:    'Fim',
};

export function EventLog() {
  const eventLog = useGameStore(s => s.eventLog);
  const myUserId = useGameStore(s => s.myUserId) ?? '';

  // Pegar últimos 8 eventos relevantes
  const displayable = [...eventLog]
    .reverse()
    .reduce<Array<{ text: string; color: string; key: number }>>((acc, evt, i) => {
      if (acc.length >= 8) return acc;
      const d = describeEvent(evt, myUserId);
      if (d) acc.push({ ...d, key: i });
      return acc;
    }, []);

  if (displayable.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      maxWidth: '220px',
      minWidth: '160px',
      flexShrink: 0,
    }}>
      {displayable.map((entry, i) => (
        <div
          key={entry.key}
          style={{
            fontSize: '9px',
            color: entry.color,
            opacity: 1 - i * 0.1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4,
          }}
        >
          {entry.text}
        </div>
      ))}
    </div>
  );
}
