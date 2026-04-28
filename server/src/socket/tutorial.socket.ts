import type { Server, Socket } from 'socket.io';
import { randomBytes } from 'crypto';
import { activeGames, gameRooms, socketPlayers } from './game.state';
import { loadDeck } from './game.socket';
import { createGameState, dealInitialHands, serializeForPlayer } from '../game/state';
import { BOT_USER_ID, BOT_DECK_ID, BOT_USERNAME, registerBotRoom, scheduleBotAction } from '../game/bot';

// =============================================================================
// SOCKET.IO — EVENTOS DE TUTORIAL (partida contra bot)
// =============================================================================

export function registerTutorialHandlers(io: Server, socket: Socket) {
  const userId = (socket as unknown as { data: { userId: string; username: string } }).data.userId;
  const username = (socket as unknown as { data: { userId: string; username: string } }).data.username;

  // ------------------------------------------------------------------
  // Iniciar partida tutorial
  // tutorial:start → cria sala, carrega decks, inicia partida com bot
  // ------------------------------------------------------------------
  socket.on('tutorial:start', async (data: { deckId: string }, callback: (r: unknown) => void) => {
    try {
      const { deckId } = data;
      if (!deckId) return callback({ ok: false, error: 'deckId é obrigatório' });

      const roomCode = 'TUT' + randomBytes(2).toString('hex').toUpperCase();

      // Carregar decks: jogador real + bot
      const [playerDeck, botDeck] = await Promise.all([
        loadDeck(userId, deckId),
        loadDeck(BOT_USER_ID, BOT_DECK_ID),
      ]);

      // Criar estado da partida (jogador real sempre começa)
      const state = createGameState(
        userId,       username,       playerDeck.main,  playerDeck.extra,
        BOT_USER_ID,  BOT_USERNAME,   botDeck.main,     botDeck.extra,
        roomCode,
      );
      dealInitialHands(state);
      // Começar direto na Fase Principal 1 (mãos iniciais distribuídas)
      state.phase = 'main1';
      state.firstPlayerSkippedDraw = true;
      // Jogador real sempre começa no tutorial
      state.activePlayerId = userId;

      activeGames.set(roomCode, state);

      // Registrar sala como tutorial (habilita bot)
      registerBotRoom(roomCode);

      // Registrar socket do jogador humano
      socket.join(roomCode);
      if (!gameRooms.has(roomCode)) gameRooms.set(roomCode, new Set());
      gameRooms.get(roomCode)!.add(socket.id);
      socketPlayers.set(socket.id, { userId, username, roomCode, deckId });

      // Enviar estado inicial para o jogador
      const serialized = serializeForPlayer(state, userId);
      callback({ ok: true, roomCode, deckId, state: serialized });

    } catch (e) {
      callback({ ok: false, error: (e as Error).message });
    }
  });
}
