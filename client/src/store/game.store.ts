import { create } from 'zustand';
import type { PublicGameState, GameEvent, GameAction, GameCard } from '../types/game.types';

interface GameStore {
  gameState: PublicGameState | null;
  events: GameEvent[];
  eventLog: GameEvent[];   // log acumulado de todos os eventos da partida
  myUserId: string | null;
  roomCode: string | null;
  isConnecting: boolean;
  error: string | null;

  // Carta selecionada para ação (atacar, jogar, mover)
  selectedCard: GameCard | null;
  // Modo de interação atual
  interactionMode: 'idle' | 'select_attack_target' | 'select_block_target' | 'select_play_zone';

  // Ações
  setGameState: (state: PublicGameState, events: GameEvent[]) => void;
  setRoom: (roomCode: string, userId: string) => void;
  setConnecting: (v: boolean) => void;
  setError: (e: string | null) => void;
  selectCard: (card: GameCard | null) => void;
  setInteractionMode: (mode: GameStore['interactionMode']) => void;
  clearGame: () => void;

  // Computed
  myState: () => import('../types/game.types').PublicPlayerState | null;
  opponentState: () => import('../types/game.types').PublicPlayerState | null;
  isMyTurn: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  events: [],
  eventLog: [],
  myUserId: null,
  roomCode: null,
  isConnecting: false,
  error: null,
  selectedCard: null,
  interactionMode: 'idle',

  setGameState: (state, events) => set(prev => ({
    gameState: state,
    events,
    eventLog: events.length > 0
      ? [...prev.eventLog, ...events].slice(-60)  // manter últimos 60
      : prev.eventLog,
  })),
  setRoom: (roomCode, myUserId) => set({ roomCode, myUserId }),
  setConnecting: (v) => set({ isConnecting: v }),
  setError: (e) => set({ error: e }),
  selectCard: (card) => set({ selectedCard: card }),
  setInteractionMode: (mode) => set({ interactionMode: mode }),
  clearGame: () => set({
    gameState: null, events: [], eventLog: [], roomCode: null,
    selectedCard: null, interactionMode: 'idle', error: null,
  }),

  myState: () => {
    const { gameState, myUserId } = get();
    if (!gameState || !myUserId) return null;
    return gameState.players[myUserId] ?? null;
  },

  opponentState: () => {
    const { gameState, myUserId } = get();
    if (!gameState || !myUserId) return null;
    const opponentId = gameState.playerOrder.find(id => id !== myUserId);
    return opponentId ? (gameState.players[opponentId] ?? null) : null;
  },

  isMyTurn: () => {
    const { gameState, myUserId } = get();
    return gameState?.activePlayerId === myUserId;
  },
}));

// ---------------------------------------------------------------------------
// Hook para enviar ações ao servidor via Socket.io
// ---------------------------------------------------------------------------
import { getSocket } from '../services/socket';

export function useGameActions() {
  const { roomCode, setError } = useGameStore();

  function sendAction(action: GameAction) {
    const socket = getSocket();
    if (!socket || !roomCode) return;

    socket.emit('game:action', { roomCode, action }, (response: { ok: boolean; error?: string }) => {
      if (!response.ok) {
        setError(response.error ?? 'Erro ao executar ação');
        setTimeout(() => setError(null), 3000);
      }
    });
  }

  return {
    drawCard: () => sendAction({ type: 'draw_card' }),
    playCard: (instanceId: string, targetZone: 'front' | 'back', asResource = false) =>
      sendAction({ type: 'play_card', instanceId, targetZone, asResource }),
    revertResource: (instanceId: string) => sendAction({ type: 'revert_resource', instanceId }),
    moveCard: (instanceId: string, direction: 'advance' | 'retreat') =>
      sendAction({ type: 'move_card', instanceId, direction }),
    tapCard: (instanceId: string) => sendAction({ type: 'tap_card', instanceId }),
    declareAttack: (attackerInstanceId: string, defenderInstanceId: string | null) =>
      sendAction({ type: 'declare_attack', attackerInstanceId, defenderInstanceId }),
    declareBlock: (blockerInstanceId: string) =>
      sendAction({ type: 'declare_block', blockerInstanceId }),
    passPriority: () => sendAction({ type: 'pass_priority' }),
    nextPhase: () => sendAction({ type: 'next_phase' }),
    endTurn: () => sendAction({ type: 'end_turn' }),
    surrender: () => sendAction({ type: 'surrender' }),
  };
}
