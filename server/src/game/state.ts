import { v4 as uuid } from 'uuid';
import type {
  GameState, PlayerState, GameCard, CardDefinition, GameZone,
} from '../types/game.types';

// =============================================================================
// INICIALIZAÇÃO DO ESTADO DE PARTIDA
// =============================================================================

/**
 * Converte uma CardDefinition do banco em uma GameCard instância para o jogo.
 * Cada cópia recebe um instanceId único.
 */
export function createGameCard(def: CardDefinition, ownerId: string, zone: GameZone): GameCard {
  return {
    ...def,
    instanceId: uuid(),
    ownerId,
    currentHealth: def.health,
    isTapped: false,
    isResourceMode: false,
    resourceModeTurns: 0,
    attackedThisTurn: false,
    blockedThisTurn: false,
    enteredThisTurn: false,
    zone,
    counters: {},
    attachments: [],
    isToken: def.cardType === 'token',
  };
}

/**
 * Embaralha um array in-place usando Fisher-Yates.
 */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Cria o estado inicial de um jogador a partir de suas cartas de deck.
 */
export function createPlayerState(
  userId: string,
  username: string,
  mainDeckDefs: CardDefinition[],
  extraDeckDefs: CardDefinition[],
): PlayerState {
  const deck = shuffle(
    mainDeckDefs.map(def => createGameCard(def, userId, 'deck'))
  );
  const extraDeck = extraDeckDefs.map(def => createGameCard(def, userId, 'extraDeck'));

  return {
    userId,
    username,
    hp: 100,
    ether: 0,
    etherGeneration: 0,
    specialResources: {},
    hand: [],
    deck,
    graveyard: [],
    exile: [],
    field: { front: [], back: [] },
    extraDeck,
    hasPlayedFreeLand: false,
    mulliganUsed: false,
    hasLost: false,
  };
}

/**
 * Cria o estado inicial completo de uma partida.
 * As mãos ainda estão vazias — chame dealInitialHands() em seguida.
 */
export function createGameState(
  player1Id: string, player1Username: string,
  player1MainDeck: CardDefinition[], player1ExtraDeck: CardDefinition[],
  player2Id: string, player2Username: string,
  player2MainDeck: CardDefinition[], player2ExtraDeck: CardDefinition[],
  roomCode: string,
): GameState {
  // Quem começa é sorteado aleatoriamente
  const starterId = Math.random() < 0.5 ? player1Id : player2Id;

  const state: GameState = {
    id: uuid(),
    roomCode,
    status: 'active',
    turn: 1,
    activePlayerId: starterId,
    phase: 'start',
    combat: null,
    chain: [],
    players: {
      [player1Id]: createPlayerState(player1Id, player1Username, player1MainDeck, player1ExtraDeck),
      [player2Id]: createPlayerState(player2Id, player2Username, player2MainDeck, player2ExtraDeck),
    },
    playerOrder: [player1Id, player2Id],
    winner: null,
    isDraw: false,
    endReason: null,
    startedAt: new Date(),
    endedAt: null,
    firstPlayerSkippedDraw: false,
  };

  return state;
}

/**
 * Compra N cartas do topo do deck de um jogador para a mão.
 * Retorna as cartas compradas (ou menos se o deck acabar).
 * NÃO verifica Deck Out — isso é responsabilidade do engine.
 */
export function drawCards(player: PlayerState, quantity: number): GameCard[] {
  const drawn: GameCard[] = [];
  for (let i = 0; i < quantity; i++) {
    if (player.deck.length === 0) break;
    const card = player.deck.pop()!; // topo = último elemento
    card.zone = 'hand';
    player.hand.push(card);
    drawn.push(card);
  }
  return drawn;
}

/**
 * Distribui a mão inicial (7 cartas) para ambos os jogadores.
 */
export function dealInitialHands(state: GameState): void {
  for (const player of Object.values(state.players)) {
    drawCards(player, 7);
  }
}

/**
 * Calcula a geração de Éter de um jogador com base nas cartas em Modo Recurso
 * e Estruturas ativas na Linha Inferior.
 */
export function calculateEtherGeneration(player: PlayerState): number {
  let total = 0;
  for (const card of player.field.back) {
    if (card.isResourceMode) {
      total += 1; // cada terreno em Modo Recurso gera +1
    } else if (card.cardType === 'structure') {
      // Estruturas ativas podem ter geração — verificar descrição/keywords
      // Por ora, estruturas com keyword 'gera_eter' contribuem
      // (implementação completa virá com o sistema de efeitos)
    }
  }
  return total;
}

/**
 * Aplica a geração de Éter no início do turno do jogador ativo.
 */
export function applyEtherGeneration(player: PlayerState): void {
  const gen = calculateEtherGeneration(player);
  player.etherGeneration = gen;
  player.ether = gen;
}

/**
 * Desconsome Éter. Retorna false se não tiver Éter suficiente.
 */
export function spendEther(player: PlayerState, amount: number): boolean {
  if (player.ether < amount) return false;
  player.ether -= amount;
  return true;
}

/**
 * Move uma carta de uma zona para outra dentro do estado do jogador.
 */
export function moveCardToZone(
  player: PlayerState,
  instanceId: string,
  targetZone: GameZone,
): GameCard | null {
  const card = findCard(player, instanceId);
  if (!card) return null;

  // Remover da zona atual
  removeFromZone(player, card);

  // Adicionar à zona de destino
  card.zone = targetZone;
  switch (targetZone) {
    case 'hand':       player.hand.push(card); break;
    case 'front':      player.field.front.push(card); break;
    case 'back':       player.field.back.push(card); break;
    case 'graveyard':  player.graveyard.push(card); break;
    case 'exile':      player.exile.push(card); break;
    case 'deck':       player.deck.unshift(card); break; // fundo do deck
    case 'extraDeck':  player.extraDeck.push(card); break;
  }

  return card;
}

/**
 * Encontra uma carta em qualquer zona de um jogador pelo instanceId.
 */
export function findCard(player: PlayerState, instanceId: string): GameCard | null {
  const allZones: GameCard[][] = [
    player.hand,
    player.deck,
    player.graveyard,
    player.exile,
    player.field.front,
    player.field.back,
    player.extraDeck,
  ];
  for (const zone of allZones) {
    const found = zone.find(c => c.instanceId === instanceId);
    if (found) return found;
  }
  return null;
}

/**
 * Encontra uma carta em qualquer zona de qualquer jogador.
 */
export function findCardInGame(state: GameState, instanceId: string): { card: GameCard; player: PlayerState } | null {
  for (const player of Object.values(state.players)) {
    const card = findCard(player, instanceId);
    if (card) return { card, player };
  }
  return null;
}

/**
 * Remove uma carta de sua zona atual (sem mover para outra).
 */
export function removeFromZone(player: PlayerState, card: GameCard): void {
  const zone = card.zone;
  const remove = (arr: GameCard[]) => {
    const idx = arr.findIndex(c => c.instanceId === card.instanceId);
    if (idx !== -1) arr.splice(idx, 1);
  };
  switch (zone) {
    case 'hand':      remove(player.hand); break;
    case 'deck':      remove(player.deck); break;
    case 'front':     remove(player.field.front); break;
    case 'back':      remove(player.field.back); break;
    case 'graveyard': remove(player.graveyard); break;
    case 'exile':     remove(player.exile); break;
    case 'extraDeck': remove(player.extraDeck); break;
  }
}

/**
 * Desconvira todas as cartas do campo de um jogador.
 * Chamado no início do turno do jogador.
 */
export function untapAllCards(player: PlayerState): void {
  for (const card of [...player.field.front, ...player.field.back]) {
    card.isTapped = false;
    card.attackedThisTurn = false;
    card.blockedThisTurn = false;
    card.enteredThisTurn = false;
    // Avançar contador de Modo Recurso
    if (card.isResourceMode) {
      card.resourceModeTurns += 1;
    }
  }
}

/**
 * Retorna o oponente de um jogador.
 */
export function getOpponent(state: GameState, playerId: string): PlayerState {
  const opponentId = state.playerOrder.find(id => id !== playerId)!;
  return state.players[opponentId];
}

/**
 * Verifica condições de vitória e atualiza o estado se necessário.
 * Retorna true se a partida terminou.
 */
export function checkWinConditions(state: GameState): boolean {
  const [p1, p2] = state.playerOrder.map(id => state.players[id]);

  const p1Dead = p1.hp <= 0 || (p1.deck.length === 0 && /* tentou sacar */ false);
  const p2Dead = p2.hp <= 0 || (p2.deck.length === 0 && false);

  if (p1Dead && p2Dead) {
    state.isDraw = true;
    state.winner = null;
    state.status = 'ended';
    state.endReason = 'hp_zero';
    state.endedAt = new Date();
    return true;
  }
  if (p1Dead) {
    state.winner = p2.userId;
    state.status = 'ended';
    state.endReason = p1.hp <= 0 ? 'hp_zero' : 'deck_out';
    state.endedAt = new Date();
    return true;
  }
  if (p2Dead) {
    state.winner = p1.userId;
    state.status = 'ended';
    state.endReason = p2.hp <= 0 ? 'hp_zero' : 'deck_out';
    state.endedAt = new Date();
    return true;
  }
  return false;
}

/**
 * Serializa o estado para envio ao cliente, filtrando informações privadas.
 * Cada jogador recebe: sua própria mão completa + apenas a contagem da mão do oponente.
 */
export function serializeForPlayer(state: GameState, viewerId: string) {
  const result: Record<string, unknown> = {
    id: state.id,
    roomCode: state.roomCode,
    status: state.status,
    turn: state.turn,
    activePlayerId: state.activePlayerId,
    phase: state.phase,
    combat: state.combat,
    chain: state.chain,
    playerOrder: state.playerOrder,
    winner: state.winner,
    isDraw: state.isDraw,
    endReason: state.endReason,
    players: {} as Record<string, unknown>,
  };

  for (const [id, player] of Object.entries(state.players)) {
    const isViewer = id === viewerId;
    (result.players as Record<string, unknown>)[id] = {
      userId: player.userId,
      username: player.username,
      hp: player.hp,
      ether: player.ether,
      etherGeneration: player.etherGeneration,
      specialResources: player.specialResources,
      hand: isViewer ? player.hand : [],           // oponente não vê as cartas
      handCount: player.hand.length,               // ambos veem a contagem
      deckCount: player.deck.length,
      graveyard: player.graveyard,                 // público
      exile: player.exile,
      field: player.field,                         // público
      extraDeck: player.extraDeck,                 // sempre público
      hasPlayedFreeLand: player.hasPlayedFreeLand,
      mulliganUsed: player.mulliganUsed,
    };
  }

  return result;
}
