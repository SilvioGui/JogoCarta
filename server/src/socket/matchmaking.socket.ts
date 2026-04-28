import type { Server, Socket } from 'socket.io';
import { randomBytes } from 'crypto';

// Fila de matchmaking: userId → { socketId, deckId, username }
const queue = new Map<string, { socketId: string; deckId: string; username: string }>();

// Salas abertas para entrar por código: roomCode → { hostUserId, hostSocketId, deckId }
const openRooms = new Map<string, { hostUserId: string; hostSocketId: string; deckId: string; username: string }>();

export function registerMatchmakingHandlers(io: Server, socket: Socket) {
  const userId = (socket as unknown as { data: { userId: string; username: string } }).data.userId;
  const username = (socket as unknown as { data: { userId: string; username: string } }).data.username;

  // ------------------------------------------------------------------
  // Criar sala (host aguarda oponente entrar pelo código)
  // ------------------------------------------------------------------
  socket.on('matchmaking:create_room', (data: { deckId: string }, callback: (r: unknown) => void) => {
    const { deckId } = data;
    if (!deckId) return callback({ ok: false, error: 'deckId é obrigatório' });

    // Gerar código único de 6 caracteres
    const roomCode = randomBytes(3).toString('hex').toUpperCase();

    openRooms.set(roomCode, { hostUserId: userId, hostSocketId: socket.id, deckId, username });

    // Expirar sala após 10 minutos sem ninguém entrar
    setTimeout(() => openRooms.delete(roomCode), 10 * 60 * 1000);

    callback({ ok: true, roomCode });
  });

  // ------------------------------------------------------------------
  // Entrar em sala pelo código
  // ------------------------------------------------------------------
  socket.on('matchmaking:join_room', (data: { roomCode: string; deckId: string }, callback: (r: unknown) => void) => {
    const { roomCode, deckId } = data;
    if (!roomCode || !deckId) return callback({ ok: false, error: 'roomCode e deckId são obrigatórios' });

    const room = openRooms.get(roomCode);
    if (!room) return callback({ ok: false, error: 'Sala não encontrada ou expirada' });
    if (room.hostUserId === userId) return callback({ ok: false, error: 'Você não pode entrar na sua própria sala' });

    openRooms.delete(roomCode);

    // Notificar host que alguém entrou — ambos devem emitir game:join
    io.to(room.hostSocketId).emit('matchmaking:opponent_found', {
      roomCode,
      deckId: room.deckId,
      opponentUsername: username,
    });

    // deckId aqui é o deck do GUEST (não do host) — cada um usa o seu próprio
    callback({ ok: true, roomCode, deckId, opponentUsername: room.username });
  });

  // ------------------------------------------------------------------
  // Entrar na fila de matchmaking rápido
  // ------------------------------------------------------------------
  socket.on('matchmaking:queue', (data: { deckId: string }, callback: (r: unknown) => void) => {
    const { deckId } = data;
    if (!deckId) return callback({ ok: false, error: 'deckId é obrigatório' });

    queue.set(userId, { socketId: socket.id, deckId, username });
    callback({ ok: true, inQueue: true });

    // Tentar formar par
    const entries = Array.from(queue.entries());
    if (entries.length >= 2) {
      const [[uid1, p1], [uid2, p2]] = entries;
      queue.delete(uid1);
      queue.delete(uid2);

      const roomCode = randomBytes(3).toString('hex').toUpperCase();

      io.to(p1.socketId).emit('matchmaking:opponent_found', {
        roomCode, deckId: p1.deckId, opponentUsername: p2.username,
      });
      io.to(p2.socketId).emit('matchmaking:opponent_found', {
        roomCode, deckId: p2.deckId, opponentUsername: p1.username,
      });
    }
  });

  // ------------------------------------------------------------------
  // Sair da fila
  // ------------------------------------------------------------------
  socket.on('matchmaking:dequeue', (_data: unknown, callback: (r: unknown) => void) => {
    queue.delete(userId);
    callback?.({ ok: true });
  });

  // ------------------------------------------------------------------
  // Limpar ao desconectar
  // ------------------------------------------------------------------
  socket.on('disconnect', () => {
    queue.delete(userId);

    // Remover salas abertas pelo host
    for (const [code, room] of openRooms.entries()) {
      if (room.hostSocketId === socket.id) {
        openRooms.delete(code);
      }
    }
  });
}
