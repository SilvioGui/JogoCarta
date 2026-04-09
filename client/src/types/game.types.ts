// Tipos do jogo no cliente (espelho do servidor — sem lógica de execução)

export type CardType =
  | 'monster' | 'magic' | 'reaction' | 'structure'
  | 'artifact' | 'terrain' | 'relic' | 'commander' | 'token';

export type GamePhase = 'start' | 'draw' | 'main1' | 'combat' | 'main2' | 'end';
export type CombatStep = 'declare_attack' | 'declare_block' | 'reaction_window' | 'damage' | 'resolve_deaths';
export type GameZone = 'deck' | 'hand' | 'front' | 'back' | 'graveyard' | 'exile' | 'extraDeck';
export type GameStatus = 'waiting' | 'active' | 'ended';
export type EndReason = 'hp_zero' | 'deck_out' | 'surrender' | 'timeout' | 'disconnection';

export interface GameCard {
  instanceId: string;
  id: string;
  name: string;
  archetypeId: string | null;
  cardType: CardType;
  etherCost: number;
  damage: number;
  health: number;
  currentHealth: number;
  description: string;
  keywords: string[];
  isExtraDeck: boolean;
  creatorSeal: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  isTerrain: boolean;
  ownerId: string;
  isTapped: boolean;
  isResourceMode: boolean;
  resourceModeTurns: number;
  attackedThisTurn: boolean;
  blockedThisTurn: boolean;
  enteredThisTurn: boolean;
  zone: GameZone;
  counters: Record<string, number>;
  attachments: string[];
  isToken: boolean;
}

export interface PublicPlayerState {
  userId: string;
  username: string;
  hp: number;
  ether: number;
  etherGeneration: number;
  specialResources: Record<string, number>;
  hand: GameCard[];       // vazio se for o oponente
  handCount: number;
  deckCount: number;
  graveyard: GameCard[];
  exile: GameCard[];
  field: { front: GameCard[]; back: GameCard[] };
  extraDeck: GameCard[];
  hasPlayedFreeLand: boolean;
  mulliganUsed: boolean;
}

export interface CombatState {
  step: CombatStep;
  attackerInstanceId: string;
  attackerPlayerId: string;
  defenderInstanceId: string | null;
  defenderPlayerId: string;
  isDirect: boolean;
}

export interface ChainItem {
  id: string;
  sourceInstanceId: string;
  sourcePlayerId: string;
  type: 'ability' | 'magic' | 'reaction' | 'trigger' | 'lastBreath';
  description: string;
  data: Record<string, unknown>;
}

export interface PublicGameState {
  id: string;
  roomCode: string;
  status: GameStatus;
  turn: number;
  activePlayerId: string;
  phase: GamePhase;
  combat: CombatState | null;
  chain: ChainItem[];
  players: Record<string, PublicPlayerState>;
  playerOrder: [string, string];
  winner: string | null;
  isDraw: boolean;
  endReason: EndReason | null;
}

export type GameEvent =
  | { type: 'card_drawn'; playerId: string; card: GameCard }
  | { type: 'card_played'; playerId: string; card: GameCard; zone: GameZone }
  | { type: 'card_tapped'; instanceId: string }
  | { type: 'card_untapped'; instanceId: string }
  | { type: 'card_moved'; instanceId: string; from: GameZone; to: GameZone }
  | { type: 'damage_dealt'; targetInstanceId: string; amount: number; source: string }
  | { type: 'player_damage'; targetPlayerId: string; amount: number }
  | { type: 'card_destroyed'; instanceId: string }
  | { type: 'card_to_graveyard'; card: GameCard }
  | { type: 'card_exiled'; instanceId: string }
  | { type: 'chain_added'; item: ChainItem }
  | { type: 'chain_resolved'; item: ChainItem }
  | { type: 'phase_changed'; phase: GamePhase }
  | { type: 'combat_started'; combat: CombatState }
  | { type: 'game_ended'; winner: string | null; isDraw: boolean; reason: EndReason | null };

// Ações que o cliente envia ao servidor
export type GameAction =
  | { type: 'draw_card' }
  | { type: 'play_card'; instanceId: string; targetZone: 'front' | 'back'; asResource: boolean }
  | { type: 'revert_resource'; instanceId: string }
  | { type: 'move_card'; instanceId: string; direction: 'advance' | 'retreat' }
  | { type: 'tap_card'; instanceId: string }
  | { type: 'declare_attack'; attackerInstanceId: string; defenderInstanceId: string | null }
  | { type: 'declare_block'; blockerInstanceId: string }
  | { type: 'pass_priority' }
  | { type: 'next_phase' }
  | { type: 'end_turn' }
  | { type: 'surrender' };
