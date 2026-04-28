import type { GameState } from '../types/game.types';

// Estado compartilhado entre game.socket.ts e tutorial.socket.ts
export const activeGames = new Map<string, GameState>();
// roomCode → socketIds dos jogadores humanos
export const gameRooms = new Map<string, Set<string>>();
// socketId → { userId, username, roomCode, deckId }
export const socketPlayers = new Map<string, { userId: string; username: string; roomCode: string; deckId: string }>();
