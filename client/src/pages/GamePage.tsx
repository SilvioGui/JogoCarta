import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../store/game.store';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuthStore } from '../store/auth.store';
import { GameBoard } from '../components/game/GameBoard';

export function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('room');
  const deckId = searchParams.get('deck');

  const { setRoom, clearGame, isConnecting, setConnecting, setError, gameState } = useGameStore();
  const userId = useAuthStore(s => s.user?.id);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!roomCode || !userId || !deckId) {
      navigate('/play');
      return;
    }

    if (joinedRef.current) return;
    joinedRef.current = true;

    setRoom(roomCode, userId);
    setConnecting(true);

    const socket = connectSocket();

    socket.emit('game:join', { roomCode, deckId }, (response: { ok: boolean; error?: string }) => {
      setConnecting(false);
      if (!response.ok) {
        setError(response.error ?? 'Não foi possível entrar na partida');
        setTimeout(() => navigate('/play'), 2000);
      }
    });

    return () => {
      // Não desconecta ao desmontar para manter a reconexão
    };
  }, [roomCode, userId, deckId]);

  // Navegar de volta ao lobby quando a partida terminar
  useEffect(() => {
    if (gameState?.status === 'ended') {
      const timer = setTimeout(() => {
        clearGame();
        disconnectSocket();
        navigate('/play');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.status]);

  if (isConnecting) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '12px',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Entrando na partida…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <GameBoard />;
}
