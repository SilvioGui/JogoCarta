import type { GameCard } from '../../types/game.types';
import { useGameStore } from '../../store/game.store';

interface CardComponentProps {
  card: GameCard;
  /** Onde a carta está sendo renderizada */
  location: 'hand' | 'front' | 'back' | 'extraDeck';
  /** Carta pertence ao jogador local */
  isMine: boolean;
  onClick?: (card: GameCard) => void;
  isSelected?: boolean;
  isTarget?: boolean;
  isAttacking?: boolean;
  compact?: boolean;
}

const RARITY_GLOW: Record<string, string> = {
  common:    'var(--border)',
  uncommon:  '#4a9eff44',
  rare:      '#a855f744',
  legendary: 'var(--accent-glow)',
};

const RARITY_BORDER: Record<string, string> = {
  common:    'var(--border)',
  uncommon:  '#4a9eff',
  rare:      '#a855f7',
  legendary: 'var(--accent)',
};

export function CardComponent({
  card, location: _location, isMine: _isMine, onClick, isSelected, isTarget, isAttacking, compact = false,
}: CardComponentProps) {
  const selectedCard = useGameStore(s => s.selectedCard);
  const isHighlighted = isSelected || (selectedCard?.instanceId === card.instanceId);
  const isResourceMode = card.isResourceMode;

  const borderColor = isHighlighted
    ? 'var(--accent)'
    : isTarget
    ? '#ef4444'
    : isAttacking
    ? '#f59e0b'
    : RARITY_BORDER[card.rarity] ?? 'var(--border)';

  const cardWidth  = compact ? '56px' : '80px';
  const cardHeight = compact ? '78px' : '112px';

  return (
    <div
      onClick={() => onClick?.(card)}
      title={`${card.name}${card.description ? ` — ${card.description}` : ''}`}
      style={{
        width: cardWidth,
        height: cardHeight,
        borderRadius: '8px',
        border: `2px solid ${borderColor}`,
        background: isResourceMode
          ? 'linear-gradient(135deg, #0d2010 0%, #0a1a08 100%)'
          : 'linear-gradient(135deg, var(--bg-card-solid) 0%, var(--bg-secondary) 100%)',
        boxShadow: isHighlighted
          ? `0 0 16px var(--accent), 0 4px 12px rgba(0,0,0,0.5)`
          : isTarget
          ? '0 0 14px rgba(239,68,68,0.6)'
          : `0 0 8px ${RARITY_GLOW[card.rarity] ?? 'transparent'}, 0 2px 8px rgba(0,0,0,0.4)`,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        padding: compact ? '3px' : '4px',
        position: 'relative',
        transform: isHighlighted ? 'translateY(-6px) scale(1.05)' : card.isTapped ? 'rotate(15deg)' : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        opacity: card.isTapped ? 0.75 : 1,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Indicador de Modo Recurso */}
      {isResourceMode && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '6px',
          background: 'rgba(0,100,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}>
          <span style={{ fontSize: compact ? '10px' : '12px', color: '#4ade80', fontWeight: 700 }}>
            +1 Éter
          </span>
        </div>
      )}

      {/* Selo criador */}
      {card.creatorSeal && (
        <div style={{
          position: 'absolute', top: 2, right: 2,
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--accent)', zIndex: 2,
        }} title="Carta do Criador" />
      )}

      {/* Custo de Éter */}
      {!isResourceMode && (
        <div style={{
          position: 'absolute', top: 2, left: 2,
          background: '#1e3a5f',
          borderRadius: '4px',
          padding: '1px 4px',
          fontSize: compact ? '8px' : '10px',
          fontWeight: 700,
          color: '#7dd3fc',
          lineHeight: 1.2,
          zIndex: 2,
        }}>
          {card.etherCost}
        </div>
      )}

      {/* Área da "arte" */}
      <div style={{
        flex: 1,
        borderRadius: '4px',
        background: isResourceMode
          ? 'rgba(0,80,0,0.4)'
          : `linear-gradient(135deg, ${RARITY_GLOW[card.rarity] ?? 'var(--accent-subtle)'} 0%, transparent 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: compact ? '2px' : '3px',
        marginTop: compact ? '8px' : '10px',
      }}>
        <span style={{ fontSize: compact ? '20px' : '28px' }}>
          {getCardEmoji(card)}
        </span>
      </div>

      {/* Nome */}
      {!compact && (
        <div style={{
          fontSize: '8px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          textAlign: 'center',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}>
          {isResourceMode ? '—' : card.name}
        </div>
      )}

      {/* Stats (Dano / Vida) */}
      {!isResourceMode && (card.damage > 0 || card.health > 0) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: compact ? '8px' : '9px',
          fontWeight: 700,
          marginTop: '2px',
          padding: '0 2px',
        }}>
          {card.damage > 0 && (
            <span style={{ color: '#f87171' }}>{card.damage}</span>
          )}
          {card.health > 0 && (
            <span style={{ color: card.currentHealth < card.health ? '#fb923c' : '#4ade80' }}>
              {card.currentHealth}
            </span>
          )}
        </div>
      )}

      {/* Virada overlay */}
      {card.isTapped && !isResourceMode && (
        <div style={{
          position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '3px',
          padding: '1px 4px',
          fontSize: '7px',
          color: '#fbbf24',
        }}>
          VIRADA
        </div>
      )}
    </div>
  );
}

function getCardEmoji(card: GameCard): string {
  if (card.isToken) return '✦';
  switch (card.cardType) {
    case 'monster':   return card.archetypeId ? ARCHETYPE_EMOJI[card.archetypeId] ?? '⚔' : '⚔';
    case 'magic':     return '✨';
    case 'reaction':  return '⚡';
    case 'structure': return '🏰';
    case 'artifact':  return '💎';
    case 'terrain':   return '🌿';
    case 'relic':     return '🔮';
    case 'commander': return '👑';
    default:          return '❓';
  }
}

const ARCHETYPE_EMOJI: Record<string, string> = {
  angels:    '👼',
  demons:    '😈',
  dragons:   '🐲',
  abyssals:  '🐙',
  mechanics: '⚙️',
  undead:    '💀',
  goblins:   '👺',
  specters:  '👻',
  spiders:   '🕷️',
  shadows:   '🌑',
};
