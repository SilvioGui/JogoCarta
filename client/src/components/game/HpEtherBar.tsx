import type { PublicPlayerState } from '../../types/game.types';

interface HpEtherBarProps {
  player: PublicPlayerState;
  isMine: boolean;
}

export function HpEtherBar({ player, isMine }: HpEtherBarProps) {
  const hpPct = Math.max(0, Math.min(100, (player.hp / 100) * 100));
  const hpColor = hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#fb923c' : '#ef4444';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 8px',
      background: 'var(--bg-card)',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      minWidth: '200px',
    }}>
      {/* Avatar / Nome */}
      <div style={{
        width: '28px', height: '28px',
        borderRadius: '50%',
        background: isMine ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.05)',
        border: `2px solid ${isMine ? 'var(--accent)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 700,
        color: isMine ? 'var(--accent)' : 'var(--text-secondary)',
        flexShrink: 0,
      }}>
        {player.username.charAt(0).toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Nome */}
        <div style={{
          fontSize: '9px',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '2px',
        }}>
          {player.username}
        </div>

        {/* HP Bar */}
        <div style={{
          height: '6px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '3px',
        }}>
          <div style={{
            height: '100%',
            width: `${hpPct}%`,
            background: hpColor,
            borderRadius: '3px',
            transition: 'width 0.4s ease, background 0.3s ease',
            boxShadow: `0 0 6px ${hpColor}88`,
          }} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* HP */}
          <span style={{ fontSize: '10px', fontWeight: 700, color: hpColor }}>
            ♥ {player.hp}
          </span>

          {/* Éter */}
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)' }}>
            ⚡ {player.ether}/{player.etherGeneration}
          </span>

          {/* Deck count */}
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            🂠 {player.deckCount}
          </span>

          {/* Hand count (opponent only) */}
          {!isMine && (
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              🤚 {player.handCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
