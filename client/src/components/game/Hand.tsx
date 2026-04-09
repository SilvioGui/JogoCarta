import type { GameCard } from '../../types/game.types';
import { CardComponent } from './CardComponent';
import { useGameStore, useGameActions } from '../../store/game.store';

interface HandProps {
  cards: GameCard[];
  isMyHand: boolean;
}

export function Hand({ cards, isMyHand }: HandProps) {
  const { selectedCard, interactionMode, selectCard, setInteractionMode } = useGameStore();
  const actions = useGameActions();
  const isMyTurn = useGameStore(s => s.isMyTurn());
  const phase = useGameStore(s => s.gameState?.phase);

  function handleCardClick(card: GameCard) {
    if (!isMyHand) return;

    const canPlay = isMyTurn && (phase === 'main1' || phase === 'main2');

    if (!canPlay) return;

    if (selectedCard?.instanceId === card.instanceId) {
      // Deselect
      selectCard(null);
      setInteractionMode('idle');
    } else {
      selectCard(card);
      setInteractionMode('select_play_zone');
    }
  }

  function handlePlayFront(card: GameCard) {
    actions.playCard(card.instanceId, 'front', false);
    selectCard(null);
    setInteractionMode('idle');
  }

  function handlePlayBack(card: GameCard, asResource = false) {
    actions.playCard(card.instanceId, 'back', asResource);
    selectCard(null);
    setInteractionMode('idle');
  }

  if (!isMyHand) {
    // Opponent hand — show face-down cards
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        padding: '4px 8px',
        minHeight: '60px',
      }}>
        {Array.from({ length: Math.min(cards.length, 12) }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '40px',
              height: '56px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '16px', opacity: 0.4 }}>🃏</span>
          </div>
        ))}
        {cards.length === 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Mão vazia</span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '4px',
      padding: '4px 8px',
      minHeight: '80px',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      position: 'relative',
    }}>
      {cards.map((card, idx) => {
        const isSelected = selectedCard?.instanceId === card.instanceId;
        const isShowingOptions = isSelected && interactionMode === 'select_play_zone';

        return (
          <div
            key={card.instanceId}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              flexShrink: 0,
              transform: isSelected ? 'translateY(-12px)' : 'none',
              transition: 'transform 0.15s ease',
              zIndex: isSelected ? 10 : idx,
            }}
          >
            <CardComponent
              card={card}
              location="hand"
              isMine
              onClick={handleCardClick}
              isSelected={isSelected}
              compact
            />

            {/* Botões de jogar quando selecionada */}
            {isShowingOptions && (
              <div style={{
                position: 'absolute',
                bottom: '90px',
                display: 'flex',
                gap: '3px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '4px',
                zIndex: 20,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}>
                {(card.cardType === 'monster' || card.cardType === 'structure') && (
                  <PlayBtn label="▶ Frente" color="#4ade80" onClick={() => handlePlayFront(card)} />
                )}
                <PlayBtn label="↓ Trás" color="#7dd3fc" onClick={() => handlePlayBack(card, false)} />
                <PlayBtn label="⚡ Recurso" color="var(--accent)" onClick={() => handlePlayBack(card, true)} />
                <PlayBtn label="✕" color="var(--text-muted)" onClick={() => { selectCard(null); setInteractionMode('idle'); }} />
              </div>
            )}
          </div>
        );
      })}

      {cards.length === 0 && (
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', alignSelf: 'center' }}>
          Mão vazia
        </span>
      )}
    </div>
  );
}

function PlayBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        padding: '3px 7px',
        borderRadius: '4px',
        border: `1px solid ${color}`,
        background: 'transparent',
        color,
        fontSize: '9px',
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
