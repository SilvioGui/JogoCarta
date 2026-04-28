import { useState } from 'react';
import { getSocket } from '../../services/socket';
import { useGameStore } from '../../store/game.store';
import { CardComponent } from './CardComponent';
import type { GameCard } from '../../types/game.types';

interface MulliganModalProps {
  hand: GameCard[];
  roomCode: string;
  onDone: () => void;
}

export function MulliganModal({ hand, roomCode, onDone }: MulliganModalProps) {
  const [loading, setLoading] = useState(false);
  const setError = useGameStore(s => s.setError);

  function sendMulligan(accept: boolean) {
    setLoading(true);
    const socket = getSocket();
    if (!socket) { onDone(); return; }
    socket.emit('game:mulligan', { roomCode, accept }, (res: { ok: boolean; error?: string }) => {
      setLoading(false);
      if (!res.ok) setError(res.error ?? 'Erro no mulligan');
      onDone();
    });
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
      zIndex: 90,
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '640px',
        width: '90%',
        display: 'flex', flexDirection: 'column', gap: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)', marginBottom: '6px' }}>
            Sua Mão Inicial
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Você pode fazer <strong>mulligan 1×</strong>: devolve as 7 cartas e saca 7 novas.
          </div>
        </div>

        {/* Preview da mão */}
        <div style={{
          display: 'flex', gap: '6px', flexWrap: 'wrap',
          justifyContent: 'center', padding: '8px',
          background: 'var(--bg-secondary)', borderRadius: '10px',
        }}>
          {hand.map(card => (
            <CardComponent
              key={card.instanceId}
              card={card}
              location="hand"
              isMine
              compact
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => sendMulligan(true)}
            disabled={loading}
            style={{
              padding: '10px 24px', borderRadius: '8px',
              border: '1px solid var(--accent)', background: 'var(--accent-subtle)',
              color: 'var(--accent)', fontWeight: 700, fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            Fazer Mulligan
          </button>
          <button
            onClick={() => sendMulligan(false)}
            disabled={loading}
            style={{
              padding: '10px 24px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            Ficar com essa mão
          </button>
        </div>
      </div>
    </div>
  );
}
