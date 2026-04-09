import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';
import type { PublicGameState, GameEvent } from '../types/game.types';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().accessToken;

  socket = io('/', {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Conectado ao servidor');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Desconectado:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Erro de conexão:', err.message);
    useGameStore.getState().setError('Falha na conexão com o servidor');
  });

  // Receber atualização de estado do jogo
  socket.on('game:state', (data: { state: PublicGameState; events: GameEvent[] }) => {
    useGameStore.getState().setGameState(data.state, data.events);
  });

  // Oponente desconectou
  socket.on('game:opponent_disconnected', () => {
    useGameStore.getState().setError('O oponente se desconectou');
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
