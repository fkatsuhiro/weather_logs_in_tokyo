import type { ViewMode } from '../types/weather';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="表示切替"
      style={{
        display: 'inline-flex',
        background: 'var(--c-card)',
        borderRadius: 'var(--radius-pill)',
        padding: '4px',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--c-border)',
        gap: '2px',
      }}
    >
      {(['daily', 'monthly'] as ViewMode[]).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            aria-pressed={active}
            style={{
              padding: '7px 22px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: active ? 700 : 500,
              letterSpacing: active ? '-0.01em' : 0,
              color: active ? '#fff' : 'var(--c-muted)',
              background: active
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                : 'transparent',
              boxShadow: active ? '0 2px 8px rgba(59,130,246,0.35)' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {m === 'daily' ? '日別' : '月別サマリー'}
          </button>
        );
      })}
    </div>
  );
}
