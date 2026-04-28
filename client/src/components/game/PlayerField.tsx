import type { PublicPlayerState, GameCard } from '../../types/game.types';
import { CardComponent } from './CardComponent';
import { useGameStore, useGameActions } from '../../store/game.store';

interface PlayerFieldProps {
  player: PublicPlayerState;
  isMine: boolean;
  isActive: boolean;
  onHoverCard?: (card: GameCard | null) => void;
}

export function PlayerField({ player, isMine, isActive, onHoverCard }: PlayerFieldProps) {
  const { selectedCard, interactionMode, selectCard, setInteractionMode } = useGameStore();
  const actions = useGameActions();
  const combat = useGameStore(s => s.gameState?.combat);

  function handleCardClick(card: GameCard) {
    if (!isMine) {
      // Clique em carta do oponente
      if (interactionMode === 'select_attack_target' && selectedCard) {
        actions.declareAttack(selectedCard.instanceId, card.instanceId);
        selectCard(null);
        setInteractionMode('idle');
      } else if (interactionMode === 'select_block_target') {
        // nada — bloquear é seleção de carta própria
      }
      return;
    }

    // Clique em carta própria
    if (interactionMode === 'idle') {
      selectCard(card);
    } else if (interactionMode === 'select_attack_target') {
      // Desselecionar
      selectCard(null);
      setInteractionMode('idle');
    }
  }

  function handleAttack(card: GameCard) {
    if (!isMine || !isActive) return;
    if (card.zone !== 'front' || card.isTapped || card.attackedThisTurn) return;
    selectCard(card);
    setInteractionMode('select_attack_target');
  }

  function handleBlock(card: GameCard) {
    if (!isMine || !combat) return;
    actions.declareBlock(card.instanceId);
  }

  function handleAdvance(card: GameCard) {
    if (!isMine || !isActive) return;
    actions.moveCard(card.instanceId, 'advance');
  }

  function handleRetreat(card: GameCard) {
    if (!isMine || !isActive) return;
    actions.moveCard(card.instanceId, 'retreat');
  }

  function handleRevert(card: GameCard) {
    if (!isMine || !isActive) return;
    actions.revertResource(card.instanceId);
  }

  function handleDirectAttack() {
    if (!selectedCard || !isActive || isMine) return;
    if (interactionMode !== 'select_attack_target') return;
    actions.declareAttack(selectedCard.instanceId, null);
    selectCard(null);
    setInteractionMode('idle');
  }

  const isAttackTarget = interactionMode === 'select_attack_target' && !isMine;
  // Fase de bloqueio: É MINHA vez de bloquear quando sou o defensor (não estou no turno ativo)
  const isBlockPhase = combat?.step === 'declare_block' &&
    isMine &&
    combat.defenderPlayerId === useGameStore.getState().myUserId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {/* Linha Superior — Combate (Front) */}
      <FieldRow
        label={isMine ? 'Combate (Frente)' : 'Combate (Oponente)'}
        cards={player.field.front}
        isMine={isMine}
        isActive={isActive}
        rowType="front"
        isAttackTarget={isAttackTarget}
        isBlockPhase={isBlockPhase}
        onCardClick={handleCardClick}
        onAttack={handleAttack}
        onBlock={handleBlock}
        onRetreat={handleRetreat}
        onDirectAttack={isAttackTarget ? handleDirectAttack : undefined}
        onHoverCard={onHoverCard}
        selectedCard={selectedCard}
        combat={combat ?? null}
      />

      {/* Linha Inferior — Recursos (Back) */}
      <FieldRow
        label={isMine ? 'Recursos (Trás)' : 'Recursos (Oponente)'}
        cards={player.field.back}
        isMine={isMine}
        isActive={isActive}
        rowType="back"
        isAttackTarget={false}
        isBlockPhase={false}
        onCardClick={handleCardClick}
        onAttack={() => {}}
        onBlock={() => {}}
        onAdvance={handleAdvance}
        onRevert={handleRevert}
        onHoverCard={onHoverCard}
        selectedCard={selectedCard}
        combat={null}
      />
    </div>
  );
}

interface FieldRowProps {
  label: string;
  cards: GameCard[];
  isMine: boolean;
  isActive: boolean;
  rowType: 'front' | 'back';
  isAttackTarget: boolean;
  isBlockPhase: boolean;
  onCardClick: (card: GameCard) => void;
  onAttack: (card: GameCard) => void;
  onBlock: (card: GameCard) => void;
  onAdvance?: (card: GameCard) => void;
  onRetreat?: (card: GameCard) => void;
  onRevert?: (card: GameCard) => void;
  onDirectAttack?: () => void;
  onHoverCard?: (card: GameCard | null) => void;
  selectedCard: GameCard | null;
  combat: { attackerInstanceId: string; defenderInstanceId: string | null } | null;
}

function FieldRow({
  label, cards, isMine, isActive, rowType, isAttackTarget, isBlockPhase,
  onCardClick, onAttack, onBlock, onAdvance, onRetreat, onRevert,
  onDirectAttack, onHoverCard, selectedCard, combat,
}: FieldRowProps) {
  return (
    <div
      style={{
        minHeight: '120px',
        borderRadius: '10px',
        border: `1px solid ${isAttackTarget ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
        background: isAttackTarget
          ? 'rgba(239,68,68,0.05)'
          : isMine
          ? 'rgba(201,169,75,0.03)'
          : 'rgba(255,255,255,0.02)',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        position: 'relative',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Rótulo da linha */}
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: '2px',
      }}>
        {label}
        {rowType === 'back' && (
          <span style={{ marginLeft: '6px', color: 'var(--accent)', fontSize: '9px' }}>
            Éter gerado: {cards.filter(c => c.isResourceMode).length}
          </span>
        )}
      </div>

      {/* Cartas */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'flex-start' }}>
        {cards.map(card => (
          <div
            key={card.instanceId}
            style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}
            onMouseEnter={() => onHoverCard?.(card)}
            onMouseLeave={() => onHoverCard?.(null)}
          >
            <CardComponent
              card={card}
              location={rowType}
              isMine={isMine}
              onClick={onCardClick}
              isSelected={selectedCard?.instanceId === card.instanceId}
              isTarget={combat?.defenderInstanceId === card.instanceId}
              isAttacking={combat?.attackerInstanceId === card.instanceId}
            />
            {/* Mini botões de ação */}
            {isMine && isActive && (
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80px' }}>
                {rowType === 'front' && !card.isTapped && !card.attackedThisTurn && (
                  <MiniBtn label="Atk" color="#ef4444" onClick={() => onAttack(card)} />
                )}
                {rowType === 'front' && !card.attackedThisTurn && !card.blockedThisTurn && (
                  <MiniBtn label="↓" color="#8888aa" onClick={() => onRetreat?.(card)} title="Recuar" />
                )}
                {rowType === 'back' && !card.isResourceMode && (
                  <MiniBtn label="↑" color="#4ade80" onClick={() => onAdvance?.(card)} title="Avançar (2 Éter)" />
                )}
                {rowType === 'back' && card.isResourceMode && card.resourceModeTurns >= 1 && (
                  <MiniBtn label="⚡" color="var(--accent)" onClick={() => onRevert?.(card)} title="Reverter" />
                )}
              </div>
            )}
            {isBlockPhase && isMine && rowType === 'front' && !card.isTapped && !card.isResourceMode && (
              <MiniBtn label="Blk" color="#3b82f6" onClick={() => onBlock(card)} title="Bloquear" />
            )}
          </div>
        ))}

        {/* Área de ataque direto (linha inimiga sem criaturas ativas) */}
        {isAttackTarget && cards.filter(c => !c.isResourceMode).length === 0 && onDirectAttack && (
          <div
            onClick={onDirectAttack}
            style={{
              width: '100px', height: '90px',
              border: '2px dashed rgba(239,68,68,0.6)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: '#ef4444', fontSize: '11px', fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            Ataque Direto
          </div>
        )}

        {/* Campo vazio */}
        {cards.length === 0 && !isAttackTarget && (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', padding: '8px', alignSelf: 'center' }}>
            Vazio
          </div>
        )}
      </div>
    </div>
  );
}

function MiniBtn({ label, color, onClick, title }: { label: string; color: string; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={title ?? label}
      style={{
        padding: '1px 5px',
        borderRadius: '4px',
        border: `1px solid ${color}`,
        background: 'transparent',
        color,
        fontSize: '8px',
        fontWeight: 700,
        cursor: 'pointer',
        lineHeight: 1.4,
      }}
    >
      {label}
    </button>
  );
}
