import { useState } from 'react';
import type { GameCard } from '../../types/game.types';
import { CardComponent } from './CardComponent';

type Tab = 'graveyard' | 'exile';

interface GraveyardModalProps {
  graveyard: GameCard[];
  exile: GameCard[];
  username: string;
  onClose: () => void;
}

export function GraveyardModal({ graveyard, exile, username, onClose }: GraveyardModalProps) {
  const [tab, setTab] = useState<Tab>('graveyard');
  const [selected, setSelected] = useState<GameCard | null>(null);

  const cards = tab === 'graveyard' ? graveyard : exile;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={() => { setSelected(null); onClose(); }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px',
          width: '520px',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {username}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['graveyard', 'exile'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: tab === t ? 'var(--accent-subtle)' : 'transparent',
                color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t === 'graveyard' ? `Cemitério (${graveyard.length})` : `Exílio (${exile.length})`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', flex: 1, overflow: 'hidden' }}>
          {/* Card grid */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignContent: 'flex-start',
            padding: '4px',
          }}>
            {cards.length === 0 && (
              <div style={{
                color: 'var(--text-muted)', fontSize: '12px',
                width: '100%', textAlign: 'center', paddingTop: '20px',
              }}>
                {tab === 'graveyard' ? 'Cemitério vazio' : 'Exílio vazio'}
              </div>
            )}
            {cards.map(card => (
              <div
                key={card.instanceId}
                onClick={() => setSelected(selected?.instanceId === card.instanceId ? null : card)}
                style={{ cursor: 'pointer' }}
              >
                <CardComponent
                  card={card}
                  location={tab === 'graveyard' ? 'front' : 'back'}
                  isMine={false}
                  isSelected={selected?.instanceId === card.instanceId}
                  compact
                />
              </div>
            ))}
          </div>

          {/* Selected card detail */}
          {selected && (
            <div style={{
              width: '140px',
              flexShrink: 0,
              background: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto',
            }}>
              <CardComponent
                card={selected}
                location="front"
                isMine={false}
              />
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selected.name}
              </div>
              {selected.description && (
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {selected.description}
                </div>
              )}
              {selected.keywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {selected.keywords.map(kw => (
                    <span
                      key={kw}
                      style={{
                        fontSize: '8px', fontWeight: 600,
                        padding: '1px 4px', borderRadius: '3px',
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent)',
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
              {(selected.damage > 0 || selected.health > 0) && (
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 700 }}>
                  {selected.damage > 0 && (
                    <span style={{ color: '#f87171' }}>⚔ {selected.damage}</span>
                  )}
                  {selected.health > 0 && (
                    <span style={{ color: '#4ade80' }}>♥ {selected.health}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
