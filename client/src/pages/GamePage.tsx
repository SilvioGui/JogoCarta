import { useEffect, useRef, useState } from 'react';
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
  const [waitingOpponent, setWaitingOpponent] = useState(false);

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

    socket.emit('game:join', { roomCode, deckId }, (response: { ok: boolean; waiting?: boolean; error?: string }) => {
      setConnecting(false);
      if (!response.ok) {
        setError(response.error ?? 'Não foi possível entrar na partida');
        setTimeout(() => navigate('/play'), 2000);
        return;
      }
      if (response.waiting) {
        // Sala criada, aguardando oponente — o estado chega via 'game:state' quando ele entrar
        setWaitingOpponent(true);
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

  // Tela de carregamento — conectando ao servidor
  if (isConnecting) {
    return <WaitingScreen message="Entrando na partida…" />;
  }

  // Sala entrou mas oponente ainda não chegou
  if (waitingOpponent && !gameState) {
    return (
      <WaitingScreen
        message="Aguardando oponente…"
        sub={`Código da sala: ${roomCode}`}
        onCancel={() => { disconnectSocket(); navigate('/play'); }}
      />
    );
  }

  // Estado chegou — mostrar tabuleiro
  return <GameBoard />;
}

function WaitingScreen({ message, sub, onCancel }: { message: string; sub?: string; onCancel?: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', flexDirection: 'column', gap: '12px',
      background: 'var(--bg-primary)', color: 'var(--text-primary)',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{message}</span>
      {sub && <span style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{sub}</span>}
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            marginTop: '8px', padding: '6px 16px', borderRadius: '6px',
            border: '1px solid rgba(239,68,68,0.4)', background: 'transparent',
            color: 'rgba(239,68,68,0.8)', fontSize: '11px', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
