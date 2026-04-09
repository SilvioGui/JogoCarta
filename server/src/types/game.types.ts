// =============================================================================
// TIPOS DO MOTOR DE JOGO — JOGOCARTA
// Fonte da verdade para toda lógica de partida no servidor.
// =============================================================================

// ---------------------------------------------------------------------------
// Enums e literais
// ---------------------------------------------------------------------------

export type CardType =
  | 'monster'
  | 'magic'
  | 'reaction'
  | 'structure'
  | 'artifact'
  | 'terrain'
  | 'relic'
  | 'commander'
  | 'token';

export type GamePhase = 'start' | 'draw' | 'main1' | 'combat' | 'main2' | 'end';

export type CombatStep =
  | 'declare_attack'
  | 'declare_block'
  | 'reaction_window'
  | 'damage'
  | 'resolve_deaths';

export type GameZone =
  | 'deck'
  | 'hand'
  | 'front'
  | 'back'
  | 'graveyard'
  | 'exile'
  | 'extraDeck';

export type GameStatus = 'waiting' | 'active' | 'ended';

export type EndReason = 'hp_zero' | 'deck_out' | 'surrender' | 'timeout' | 'disconnection';

// ---------------------------------------------------------------------------
// Definição estática da carta (lida do banco)
// ---------------------------------------------------------------------------

export interface CardDefinition {
  id: string;
  name: string;
  archetypeId: string | null;
  cardType: CardType;
  etherCost: number;
  damage: number;       // 0 se não for monstro/estrutura
  health: number;       // 0 se não tiver vida
  description: string;
  keywords: string[];   // ex: ['atropelar', 'voar']
  isExtraDeck: boolean;
  creatorSeal: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  isTerrain: boolean;   // tem o selo /Terreno (pode ser jogado grátis como recurso)
}

// ---------------------------------------------------------------------------
// Instância de carta durante uma partida (estado mutável)
// ---------------------------------------------------------------------------

export interface GameCard extends CardDefinition {
  /** ID único desta instância na partida (permite 3 cópias da mesma carta) */
  instanceId: string;
  /** Jogador que controla esta carta */
  ownerId: string;
  /** Vida atual (pode diferir do máximo após dano) */
  currentHealth: number;
  /** Virada/exausta — não pode atacar nem usar habilidades de virar */
  isTapped: boolean;
  /** Está em Modo Recurso (silenciada, gerando Éter) */
  isResourceMode: boolean;
  /** Quantos rounds completos já passou em Modo Recurso (precisa de >= 1 para Reverter) */
  resourceModeTurns: number;
  /** Atacou neste turno (impede Retirada) */
  attackedThisTurn: boolean;
  /** Bloqueou neste turno (impede Retirada) */
  blockedThisTurn: boolean;
  /** Entrou em campo neste turno (algumas mecânicas verificam isso) */
  enteredThisTurn: boolean;
  /** Zona atual */
  zone: GameZone;
  /** Contadores: veneno, podridão, marca_da_morte, etc. */
  counters: Record<string, number>;
  /** instanceIds de Artefatos/Equipamentos anexados */
  attachments: string[];
  /** Se é Token — ao sair do campo, é banido (não fica no cemitério permanentemente) */
  isToken: boolean;
}

// ---------------------------------------------------------------------------
// Estado de um jogador na partida
// ---------------------------------------------------------------------------

export interface PlayerState {
  userId: string;
  username: string;
  hp: number;                         // começa em 100
  ether: number;                      // Éter atual disponível no turno
  etherGeneration: number;            // Éter gerado no início do turno (soma das fontes)
  /** Recursos especiais por arquétipo: faith, tide, treasure, etc. */
  specialResources: Record<string, number>;
  hand: GameCard[];
  deck: GameCard[];                   // topo = deck[deck.length - 1]
  graveyard: GameCard[];
  exile: GameCard[];
  field: {
    front: GameCard[];                // Linha Superior — combate
    back: GameCard[];                 // Linha Inferior — recursos
  };
  extraDeck: GameCard[];              // 5 Comandantes (visível para todos)
  hasPlayedFreeLand: boolean;         // jogou o 1 terreno grátis neste turno?
  mulliganUsed: boolean;
  hasLost: boolean;
}

// ---------------------------------------------------------------------------
// Estado de combate ativo
// ---------------------------------------------------------------------------

export interface CombatState {
  step: CombatStep;
  attackerInstanceId: string;
  attackerPlayerId: string;
  defenderInstanceId: string | null;  // null = ataque direto ao jogador
  defenderPlayerId: string;
  isDirect: boolean;
}

// ---------------------------------------------------------------------------
// Item na Corrente de Habilidades (Pilha LIFO)
// ---------------------------------------------------------------------------

export interface ChainItem {
  id: string;
  sourceInstanceId: string;
  sourcePlayerId: string;
  type: 'ability' | 'magic' | 'reaction' | 'trigger' | 'lastBreath';
  description: string;
  /** Dados extras para resolução (ex: { damage: 3, target: 'instanceId' }) */
  data: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Estado completo da partida (vive em memória no servidor)
// ---------------------------------------------------------------------------

export interface GameState {
  id: string;
  roomCode: string;
  status: GameStatus;
  turn: number;                       // número do turno global
  activePlayerId: string;             // quem está jogando agora
  phase: GamePhase;
  combat: CombatState | null;
  chain: ChainItem[];                 // pilha LIFO
  players: Record<string, PlayerState>;
  playerOrder: [string, string];      // [player1Id, player2Id]
  winner: string | null;              // userId do vencedor
  isDraw: boolean;
  endReason: EndReason | null;
  startedAt: Date;
  endedAt: Date | null;
  /** Quem começa pula o saque no 1º turno */
  firstPlayerSkippedDraw: boolean;
}

// ---------------------------------------------------------------------------
// Ações que o cliente pode enviar ao servidor
// ---------------------------------------------------------------------------

export interface ActionDrawCard {
  type: 'draw_card';
}

export interface ActionPlayCard {
  type: 'play_card';
  instanceId: string;
  targetZone: 'front' | 'back';
  asResource: boolean;    // jogar em Modo Recurso (grátis se for terrain, custa Éter se não)
}

export interface ActionRevertResource {
  type: 'revert_resource';
  instanceId: string;     // carta em Modo Recurso para "Ligar"
}

export interface ActionMoveCard {
  type: 'move_card';
  instanceId: string;
  direction: 'advance' | 'retreat';  // back→front ou front→back
}

export interface ActionTapCard {
  type: 'tap_card';
  instanceId: string;
}

export interface ActionDeclareAttack {
  type: 'declare_attack';
  attackerInstanceId: string;
  defenderInstanceId: string | null;  // null = ataque direto
}

export interface ActionDeclareBlock {
  type: 'declare_block';
  blockerInstanceId: string;
}

export interface ActionPassPriority {
  type: 'pass_priority';
}

export interface ActionNextPhase {
  type: 'next_phase';
}

export interface ActionEndTurn {
  type: 'end_turn';
}

export interface ActionSurrender {
  type: 'surrender';
}

export type GameAction =
  | ActionDrawCard
  | ActionPlayCard
  | ActionRevertResource
  | ActionMoveCard
  | ActionTapCard
  | ActionDeclareAttack
  | ActionDeclareBlock
  | ActionPassPriority
  | ActionNextPhase
  | ActionEndTurn
  | ActionSurrender;

// ---------------------------------------------------------------------------
// Resultado de uma ação
// ---------------------------------------------------------------------------

export interface ActionResult {
  ok: boolean;
  error?: string;
  /** Estado do jogo após a ação (enviado para os clientes) */
  state?: GameState;
  /** Eventos extras para animação no cliente */
  events?: GameEvent[];
}

// ---------------------------------------------------------------------------
// Eventos de animação/feedback para o cliente
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Payload que o servidor envia ao cliente (estado público)
// O cliente NÃO vê o deck do oponente — apenas a quantidade.
// ---------------------------------------------------------------------------

export interface PublicPlayerState {
  userId: string;
  username: string;
  hp: number;
  ether: number;
  etherGeneration: number;
  specialResources: Record<string, number>;
  hand: GameCard[];                   // visível apenas para o próprio jogador
  handCount: number;                  // oponente vê apenas a contagem
  deckCount: number;
  graveyard: GameCard[];              // público
  exile: GameCard[];
  field: { front: GameCard[]; back: GameCard[] };
  extraDeck: GameCard[];              // sempre público
  hasPlayedFreeLand: boolean;
  mulliganUsed: boolean;
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
  /** Cada jogador recebe versão filtrada: sua mão completa + mão do oponente como contagem */
  players: Record<string, PublicPlayerState>;
  playerOrder: [string, string];
  winner: string | null;
  isDraw: boolean;
  endReason: EndReason | null;
}
