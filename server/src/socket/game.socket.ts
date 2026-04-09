import type { Server, Socket } from 'socket.io';
import type { GameState, GameAction } from '../types/game.types';
import { createGameState, dealInitialHands, serializeForPlayer } from '../game/state';
import { processAction } from '../game/engine';
import { getDb } from '../db/database';

// =============================================================================
// SOCKET.IO — EVENTOS DE PARTIDA
// O servidor é a ÚNICA fonte de verdade. O cliente envia intenções,
// o servidor valida, executa e transmite o novo estado.
// =============================================================================

// Partidas ativas em memória
const activeGames = new Map<string, GameState>();
// roomCode → socketIds dos jogadores
const gameRooms = new Map<string, Set<string>>();
// socketId → { userId, roomCode }
const socketPlayers = new Map<string, { userId: string; username: string; roomCode: string }>();

export function registerGameHandlers(io: Server, socket: Socket) {
  const userId = (socket as unknown as { data: { userId: string; username: string } }).data.userId;
  const username = (socket as unknown as { data: { userId: string; username: string } }).data.username;

  // ------------------------------------------------------------------
  // Entrar em uma sala de jogo
  // ------------------------------------------------------------------
  socket.on('game:join', async (data: { roomCode: string; deckId: string }, callback: (r: unknown) => void) => {
    try {
      const { roomCode, deckId } = data;
      if (!roomCode || !deckId) return callback({ ok: false, error: 'roomCode e deckId são obrigatórios' });

      socket.join(roomCode);

      if (!gameRooms.has(roomCode)) {
        gameRooms.set(roomCode, new Set());
      }
      gameRooms.get(roomCode)!.add(socket.id);
      socketPlayers.set(socket.id, { userId, username, roomCode });

      const roomSockets = gameRooms.get(roomCode)!;

      // Aguardar segundo jogador
      if (roomSockets.size < 2) {
        callback({ ok: true, waiting: true });
        return;
      }

      // Dois jogadores prontos — carregar decks e iniciar partida
      if (activeGames.has(roomCode)) {
        // Partida já existe — reconectar
        const state = activeGames.get(roomCode)!;
        const serialized = serializeForPlayer(state, userId);
        callback({ ok: true, waiting: false, state: serialized });
        return;
      }

      const players = Array.from(roomSockets);
      const [s1, s2] = players.map(sid => socketPlayers.get(sid)!);

      const [deck1, deck2] = await Promise.all([
        loadDeck(s1.userId, deckId),
        loadDeck(s2.userId, deckId),   // em produção cada player envia seu próprio deckId
      ]);

      const state = createGameState(
        s1.userId, s1.username, deck1.main, deck1.extra,
        s2.userId, s2.username, deck2.main, deck2.extra,
        roomCode,
      );
      dealInitialHands(state);
      activeGames.set(roomCode, state);

      // Enviar estado personalizado para cada jogador
      for (const sid of roomSockets) {
        const pData = socketPlayers.get(sid)!;
        const serialized = serializeForPlayer(state, pData.userId);
        io.to(sid).emit('game:state', { state: serialized, events: [] });
      }

      callback({ ok: true, waiting: false });

    } catch (e) {
      callback({ ok: false, error: (e as Error).message });
    }
  });

  // ------------------------------------------------------------------
  // Ação do jogador
  // ------------------------------------------------------------------
  socket.on('game:action', (data: { roomCode: string; action: GameAction }, callback: (r: unknown) => void) => {
    const { roomCode, action } = data;
    const state = activeGames.get(roomCode);

    if (!state) return callback({ ok: false, error: 'Partida não encontrada' });
    if (state.status === 'ended') return callback({ ok: false, error: 'Partida já terminou' });

    const result = processAction(state, userId, action);

    if (!result.ok) {
      return callback({ ok: false, error: result.error });
    }

    // Transmitir estado atualizado para cada jogador (com filtragem de mão)
    const roomSockets = gameRooms.get(roomCode);
    if (roomSockets) {
      for (const sid of roomSockets) {
        const pData = socketPlayers.get(sid);
        if (!pData) continue;
        const serialized = serializeForPlayer(state, pData.userId);
        io.to(sid).emit('game:state', { state: serialized, events: result.events ?? [] });
      }
    }

    callback({ ok: true });
  });

  // ------------------------------------------------------------------
  // Solicitar estado atual (reconexão)
  // ------------------------------------------------------------------
  socket.on('game:get_state', (data: { roomCode: string }, callback: (r: unknown) => void) => {
    const state = activeGames.get(data.roomCode);
    if (!state) return callback({ ok: false, error: 'Partida não encontrada' });
    callback({ ok: true, state: serializeForPlayer(state, userId) });
  });

  // ------------------------------------------------------------------
  // Mulligan
  // ------------------------------------------------------------------
  socket.on('game:mulligan', (data: { roomCode: string; accept: boolean }, callback: (r: unknown) => void) => {
    const state = activeGames.get(data.roomCode);
    if (!state) return callback({ ok: false, error: 'Partida não encontrada' });

    const player = state.players[userId];
    if (!player) return callback({ ok: false, error: 'Jogador não encontrado' });
    if (player.mulliganUsed) return callback({ ok: false, error: 'Mulligan já utilizado' });

    if (!data.accept) {
      return callback({ ok: true });
    }

    // Devolver 7 cartas ao deck, embaralhar e sacar 7 novas
    import('../game/state').then(({ drawCards, shuffle }) => {
      player.deck.push(...player.hand);
      player.hand = [];
      shuffle(player.deck);
      drawCards(player, 7);
      player.mulliganUsed = true;

      const serialized = serializeForPlayer(state, userId);
      socket.emit('game:state', { state: serialized, events: [] });
      callback({ ok: true });
    });
  });

  // ------------------------------------------------------------------
  // Desconexão
  // ------------------------------------------------------------------
  socket.on('disconnect', () => {
    const pData = socketPlayers.get(socket.id);
    if (!pData) return;

    const { roomCode } = pData;
    socketPlayers.delete(socket.id);

    const room = gameRooms.get(roomCode);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) {
        gameRooms.delete(roomCode);
        // Manter a partida em memória por 5 minutos para reconexão
        setTimeout(() => {
          if (!gameRooms.has(roomCode) || gameRooms.get(roomCode)!.size === 0) {
            activeGames.delete(roomCode);
          }
        }, 5 * 60 * 1000);
      }
    }

    // Notificar oponente
    socket.to(roomCode).emit('game:opponent_disconnected', { userId });
  });
}

// ------------------------------------------------------------------
// Carregar deck do banco de dados
// ------------------------------------------------------------------
async function loadDeck(userId: string, deckId: string): Promise<{
  main: import('../types/game.types').CardDefinition[];
  extra: import('../types/game.types').CardDefinition[];
}> {
  const db = getDb();

  // Verificar que o deck pertence ao usuário
  const deck = db.prepare(
    'SELECT id FROM decks WHERE id = ? AND user_id = ? AND is_valid = 1'
  ).get(deckId, userId) as { id: string } | undefined;

  if (!deck) {
    throw new Error('Deck não encontrado ou inválido');
  }

  // Carregar cartas do deck com todas as informações
  const rows = db.prepare(`
    SELECT
      c.id, c.name, c.archetype_id as archetypeId, c.card_type as cardType,
      c.ether_cost as etherCost, c.damage, c.health, c.description,
      c.keywords, c.is_extra_deck as isExtraDeck, c.creator_seal as creatorSeal,
      c.rarity, dc.quantity, dc.is_extra_deck as deckIsExtra
    FROM deck_cards dc
    JOIN cards c ON c.id = dc.card_id
    WHERE dc.deck_id = ?
  `).all(deckId) as Array<{
    id: string; name: string; archetypeId: string | null; cardType: string;
    etherCost: number; damage: number | null; health: number | null;
    description: string; keywords: string; isExtraDeck: number;
    creatorSeal: number; rarity: string; quantity: number; deckIsExtra: number;
  }>;

  const main: import('../types/game.types').CardDefinition[] = [];
  const extra: import('../types/game.types').CardDefinition[] = [];

  for (const row of rows) {
    const def: import('../types/game.types').CardDefinition = {
      id: row.id,
      name: row.name,
      archetypeId: row.archetypeId,
      cardType: row.cardType as import('../types/game.types').CardType,
      etherCost: row.etherCost,
      damage: row.damage ?? 0,
      health: row.health ?? 0,
      description: row.description,
      keywords: JSON.parse(row.keywords || '[]'),
      isExtraDeck: row.isExtraDeck === 1,
      creatorSeal: row.creatorSeal === 1,
      rarity: row.rarity as 'common' | 'uncommon' | 'rare' | 'legendary',
      isTerrain: row.cardType === 'terrain' || row.cardType === 'relic',
    };

    if (row.deckIsExtra === 1) {
      extra.push(def);
    } else {
      for (let i = 0; i < row.quantity; i++) {
        main.push({ ...def });
      }
    }
  }

  return { main, extra };
}
