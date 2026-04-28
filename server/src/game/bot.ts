import type { Server } from 'socket.io';
import type { GameState, GameAction } from '../types/game.types';
import { processAction } from './engine';
import { serializeForPlayer } from './state';
import type { activeGames as ActiveGames, gameRooms as GameRooms, socketPlayers as SocketPlayers } from '../socket/game.state';

// =============================================================================
// BOT DE TUTORIAL — IA simples para partidas tutoriais
// =============================================================================

export const BOT_USER_ID  = '__bot__';
export const BOT_DECK_ID  = '__bot_deck__';
export const BOT_USERNAME = 'Tutor';

// Salas onde o segundo jogador é o bot
const botRooms = new Set<string>();

export function registerBotRoom(code: string)  { botRooms.add(code); }
export function isBotRoom(code: string)         { return botRooms.has(code); }
export function removeBotRoom(code: string)     { botRooms.delete(code); }

// ---------------------------------------------------------------------------
// Broadcast helper
// ---------------------------------------------------------------------------
function broadcast(
  io: Server,
  roomCode: string,
  state: GameState,
  gameRooms: typeof GameRooms,
  socketPlayers: typeof SocketPlayers,
  events: unknown[],
) {
  const roomSockets = gameRooms.get(roomCode);
  if (!roomSockets) return;
  for (const sid of roomSockets) {
    const pData = socketPlayers.get(sid);
    if (!pData) continue;
    io.to(sid).emit('game:state', { state: serializeForPlayer(state, pData.userId), events });
  }
}

function doAction(
  state: GameState,
  action: GameAction,
  io: Server,
  roomCode: string,
  gameRooms: typeof GameRooms,
  socketPlayers: typeof SocketPlayers,
): boolean {
  const result = processAction(state, BOT_USER_ID, action);
  if (result.ok) broadcast(io, roomCode, state, gameRooms, socketPlayers, result.events ?? []);
  return result.ok ?? false;
}

function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }

// ---------------------------------------------------------------------------
// Ponto de entrada — chamado após cada mudança de estado
// ---------------------------------------------------------------------------
export function scheduleBotAction(
  io: Server,
  roomCode: string,
  activeGames: typeof ActiveGames,
  gameRooms: typeof GameRooms,
  socketPlayers: typeof SocketPlayers,
) {
  const state = activeGames.get(roomCode);
  if (!state || state.status !== 'active') return;

  // Bot é o defensor e precisa responder ao bloqueio
  if (
    state.combat?.step === 'declare_block' &&
    state.combat.defenderPlayerId === BOT_USER_ID
  ) {
    setTimeout(async () => {
      const s = activeGames.get(roomCode);
      if (!s || s.combat?.step !== 'declare_block') return;
      // Bot nunca bloqueia — passa prioridade (skip block)
      doAction(s, { type: 'pass_priority' }, io, roomCode, gameRooms, socketPlayers);
    }, 900);
    return;
  }

  // Janela de reação — bot passa prioridade para resolver combate
  if (state.combat?.step === 'reaction_window') {
    setTimeout(() => {
      const s = activeGames.get(roomCode);
      if (!s || s.combat?.step !== 'reaction_window') return;
      doAction(s, { type: 'pass_priority' }, io, roomCode, gameRooms, socketPlayers);
    }, 700);
    return;
  }

  // Turno ativo do bot
  if (state.activePlayerId !== BOT_USER_ID) return;

  // Execução assíncrona para ter delays visíveis
  (async () => {
    await runBotStep(io, roomCode, activeGames, gameRooms, socketPlayers);
  })();
}

async function runBotStep(
  io: Server,
  roomCode: string,
  activeGames: typeof ActiveGames,
  gameRooms: typeof GameRooms,
  socketPlayers: typeof SocketPlayers,
) {
  const state = activeGames.get(roomCode);
  if (!state || state.status !== 'active' || state.activePlayerId !== BOT_USER_ID) return;
  if (state.combat !== null) return;

  const bot = state.players[BOT_USER_ID];

  switch (state.phase) {
    // ── start: avançar ──────────────────────────────────────────────────────
    case 'start': {
      await delay(600);
      doAction(state, { type: 'next_phase' }, io, roomCode, gameRooms, socketPlayers);
      break;
    }

    // ── draw: avançar (carta já foi sacada pelo engine) ──────────────────────
    case 'draw': {
      await delay(500);
      doAction(state, { type: 'next_phase' }, io, roomCode, gameRooms, socketPlayers);
      break;
    }

    // ── main1: jogar terreno → jogar monstro → avançar ──────────────────────
    case 'main1': {
      await delay(800);
      const freshState = activeGames.get(roomCode);
      if (!freshState || freshState.activePlayerId !== BOT_USER_ID) return;
      const freshBot = freshState.players[BOT_USER_ID];

      // 1. Jogar terreno como recurso (se ainda não jogou)
      if (!freshBot.hasPlayedFreeLand) {
        const terrain = freshBot.hand.find(c => c.cardType === 'terrain' || c.isTerrain);
        if (terrain) {
          doAction(freshState, { type: 'play_card', instanceId: terrain.instanceId, targetZone: 'back', asResource: true }, io, roomCode, gameRooms, socketPlayers);
          await delay(700);
        }
      }

      // 2. Jogar o monstro mais barato que puder pagar
      const s2 = activeGames.get(roomCode);
      if (!s2 || s2.activePlayerId !== BOT_USER_ID) return;
      const bot2 = s2.players[BOT_USER_ID];
      const monster = bot2.hand
        .filter(c => c.cardType === 'monster' && c.etherCost <= bot2.ether)
        .sort((a, b) => a.etherCost - b.etherCost)[0];
      if (monster) {
        doAction(s2, { type: 'play_card', instanceId: monster.instanceId, targetZone: 'front', asResource: false }, io, roomCode, gameRooms, socketPlayers);
        await delay(600);
      }

      // 3. Avançar para combate
      const s3 = activeGames.get(roomCode);
      if (!s3 || s3.activePlayerId !== BOT_USER_ID || s3.phase !== 'main1') return;
      doAction(s3, { type: 'next_phase' }, io, roomCode, gameRooms, socketPlayers);
      break;
    }

    // ── combat: declarar UM ataque por turno ────────────────────────────────
    case 'combat': {
      await delay(900);
      const sc = activeGames.get(roomCode);
      if (!sc || sc.activePlayerId !== BOT_USER_ID || sc.combat !== null) return;
      const botC = sc.players[BOT_USER_ID];

      const attacker = botC.field.front.find(c =>
        c.cardType === 'monster' &&
        !c.isTapped &&
        !c.attackedThisTurn &&
        !c.isResourceMode &&
        (!c.enteredThisTurn || c.keywords.includes('impeto')),
      );

      if (attacker) {
        const opponent = Object.values(sc.players).find(p => p.userId !== BOT_USER_ID)!;
        const opponentFront = opponent.field.front.filter(c => !c.isResourceMode);

        let target: string | null = null;
        if (opponentFront.length > 0) {
          const taunt = opponentFront.find(c => c.keywords.includes('provocar'));
          const weakest = opponentFront.sort((a, b) => a.currentHealth - b.currentHealth)[0];
          target = (taunt ?? weakest).instanceId;
        }
        doAction(sc, { type: 'declare_attack', attackerInstanceId: attacker.instanceId, defenderInstanceId: target }, io, roomCode, gameRooms, socketPlayers);
        // O estado de combate agora está em declare_block; o humano responde.
        // scheduleBotAction será chamado novamente quando o humano agir.
      } else {
        // Sem atacantes — ir para main2
        doAction(sc, { type: 'next_phase' }, io, roomCode, gameRooms, socketPlayers);
      }
      break;
    }

    // ── main2 e end: encerrar turno ─────────────────────────────────────────
    case 'main2':
    case 'end': {
      await delay(600);
      const se = activeGames.get(roomCode);
      if (!se || se.activePlayerId !== BOT_USER_ID) return;
      doAction(se, { type: 'end_turn' }, io, roomCode, gameRooms, socketPlayers);
      break;
    }
  }
}
