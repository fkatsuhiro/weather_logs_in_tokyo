import { useState, useMemo } from 'react';
import type { WeatherCategory, WeatherData, DailyStats } from '../types/weather';
import { buildMonthlySummaries, computeDailyStats } from '../utils/weatherUtils';

// ── Design tokens ──────────────────────────────────────────────
const CATEGORY_ICON: Record<WeatherCategory, string> = {
  clear: '☀️', partly_cloudy: '🌤️', fog: '🌫️',
  rain: '☔', snow: '❄️', thunder: '⚡', unknown: '❓',
};
const CATEGORY_LABEL: Record<WeatherCategory, string> = {
  clear: '快晴', partly_cloudy: '晴れ・曇り', fog: '霧',
  rain: '雨', snow: '雪', thunder: '雷雨', unknown: '不明',
};
const CATEGORY_COLOR: Record<WeatherCategory, string> = {
  clear: '#f59e0b', partly_cloudy: '#60a5fa', fog: '#94a3b8',
  rain: '#3b82f6', snow: '#93c5fd', thunder: '#8b5cf6', unknown: '#cbd5e1',
};

// ── SVG temperature chart ──────────────────────────────────────
const W = 560, H = 190;
const PAD = { top: 18, right: 18, bottom: 38, left: 46 };
const iW = W - PAD.left - PAD.right;
const iH = H - PAD.top - PAD.bottom;

function smoothPath(pts: [number, number][]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 2)];
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const p3 = pts[Math.min(pts.length - 1, i + 1)];
    const t = 0.35;
    const cp1x = p1[0] + (p2[0] - p0[0]) * t;
    const cp1y = p1[1] + (p2[1] - p0[1]) * t;
    const cp2x = p2[0] - (p3[0] - p1[0]) * t;
    const cp2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function TemperatureChart({ data }: { data: DailyStats[] }) {
  if (data.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--c-muted)', padding: '24px 0' }}>データなし</p>;
  }

  const allTemps = data.flatMap((d) => [d.min, d.avg, d.max]);
  const rawMin = Math.min(...allTemps);
  const rawMax = Math.max(...allTemps);
  const tMin = Math.floor(rawMin / 5) * 5 - 2;
  const tMax = Math.ceil(rawMax / 5) * 5 + 2;
  const tRange = tMax - tMin || 1;

  const days = data.map((d) => d.day);
  const dMin = Math.min(...days);
  const dMax = Math.max(...days);
  const dRange = Math.max(dMax - dMin, 1);

  const xOf = (day: number) => PAD.left + ((day - dMin) / dRange) * iW;
  const yOf = (temp: number) => PAD.top + (1 - (temp - tMin) / tRange) * iH;

  const avgPts = data.map((d) => [xOf(d.day), yOf(d.avg)] as [number, number]);
  const maxPts = data.map((d) => [xOf(d.day), yOf(d.max)] as [number, number]);
  const minPtsRev = [...data].reverse().map((d) => [xOf(d.day), yOf(d.min)] as [number, number]);

  const rangePath =
    smoothPath(maxPts) +
    ' ' + smoothPath(minPtsRev).replace(/^M/, 'L') +
    ' Z';

  // Y-axis grid labels at every 5°C
  const gridTemps: number[] = [];
  for (let t = Math.ceil(tMin / 5) * 5; t <= tMax; t += 5) gridTemps.push(t);

  // X-axis: show label every N days to avoid crowding
  const labelEvery = data.length <= 8 ? 1 : data.length <= 16 ? 2 : 5;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', display: 'block', overflow: 'visible' }}
      aria-label="月間気温グラフ"
    >
      <defs>
        <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridTemps.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left} y1={yOf(t).toFixed(1)}
            x2={PAD.left + iW} y2={yOf(t).toFixed(1)}
            stroke="#f1f5f9" strokeWidth="1"
          />
          <text
            x={PAD.left - 7} y={yOf(t).toFixed(1)}
            textAnchor="end" dominantBaseline="middle"
            fontSize="11" fill="#94a3b8" fontFamily="inherit"
          >
            {t}
          </text>
        </g>
      ))}

      {/* Min–Max range area */}
      <path d={rangePath} fill="url(#rangeGrad)" />

      {/* Area fill under avg line */}
      <path
        d={smoothPath(avgPts) + ` L ${avgPts.at(-1)![0].toFixed(1)} ${(PAD.top + iH).toFixed(1)} L ${avgPts[0][0].toFixed(1)} ${(PAD.top + iH).toFixed(1)} Z`}
        fill="url(#avgGrad)"
      />

      {/* Avg line */}
      <path d={smoothPath(avgPts)} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data dots */}
      {data.map((d) => (
        <circle
          key={d.day}
          cx={xOf(d.day).toFixed(1)} cy={yOf(d.avg).toFixed(1)}
          r="4" fill="#fff" stroke="#f97316" strokeWidth="2.2"
        />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) =>
        (i === 0 || i === data.length - 1 || i % labelEvery === 0) ? (
          <text
            key={d.day}
            x={xOf(d.day).toFixed(1)} y={H - 6}
            textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="inherit"
          >
            {d.day}日
          </text>
        ) : null,
      )}

      {/* Legend */}
      <g transform={`translate(${PAD.left}, ${PAD.top - 4})`}>
        <line x1="0" y1="0" x2="14" y2="0" stroke="#f97316" strokeWidth="2.5" />
        <circle cx="7" cy="0" r="3" fill="#fff" stroke="#f97316" strokeWidth="2" />
        <text x="18" y="0" dominantBaseline="middle" fontSize="11" fill="#64748b" fontFamily="inherit">日別平均</text>
        <rect x="80" y="-5" width="14" height="10" fill="url(#rangeGrad)" rx="2" />
        <text x="97" y="0" dominantBaseline="middle" fontSize="11" fill="#64748b" fontFamily="inherit">最高〜最低</text>
      </g>
    </svg>
  );
}

// ── Weather distribution bars ──────────────────────────────────
function WeatherDistribution({ counts, total }: { counts: Partial<Record<WeatherCategory, number>>; total: number }) {
  const sorted = (Object.entries(counts) as [WeatherCategory, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {sorted.map(([cat, count]) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={cat} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 48px', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <span style={{ fontSize: '1rem' }}>{CATEGORY_ICON[cat]}</span>
              <span style={{ color: 'var(--c-text)', fontWeight: 500 }}>{CATEGORY_LABEL[cat]}</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: 'var(--radius-pill)', height: '8px', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: CATEGORY_COLOR[cat],
                borderRadius: 'var(--radius-pill)',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--c-muted)', textAlign: 'right', fontWeight: 500 }}>
              {count}件
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Month tabs ─────────────────────────────────────────────────
function MonthTabs({ keys, selected, onChange }: { keys: string[]; selected: string; onChange: (k: string) => void }) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '2px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      {keys.map((key) => {
        const [y, m] = key.split('-');
        const active = key === selected;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              padding: '7px 18px',
              borderRadius: 'var(--radius-pill)',
              border: active ? 'none' : '1px solid var(--c-border)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.88rem',
              fontWeight: active ? 700 : 500,
              color: active ? '#fff' : 'var(--c-muted)',
              background: active
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                : 'var(--c-card)',
              boxShadow: active ? '0 2px 10px rgba(59,130,246,0.3)' : 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.01em',
            }}
          >
            {y}年{parseInt(m, 10)}月
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
interface Props { logs: WeatherData[] }

export function MonthlyView({ logs }: Props) {
  const summaries = useMemo(() => buildMonthlySummaries(logs), [logs]);
  const [selectedMonth, setSelectedMonth] = useState('');

  const effectiveMonth = useMemo(() => {
    if (selectedMonth && summaries.some((s) => s.monthKey === selectedMonth)) return selectedMonth;
    return summaries[0]?.monthKey ?? '';
  }, [selectedMonth, summaries]);

  const current = summaries.find((s) => s.monthKey === effectiveMonth);
  const dailyStats = useMemo(() => computeDailyStats(logs, effectiveMonth), [logs, effectiveMonth]);

  if (summaries.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--c-muted)', padding: '60px 0' }}>データ取得中...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Month tabs */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <MonthTabs
          keys={summaries.map((s) => s.monthKey)}
          selected={effectiveMonth}
          onChange={setSelectedMonth}
        />
      </div>

      {current && (
        <>
          {/* Stats header */}
          <div className="card" data-testid="monthly-card" style={{ padding: '22px 24px' }}>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                {current.year}年{current.month}月
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--c-muted)' }}>
                {current.firstDate} 〜 {current.lastDate} · {current.dataPoints}件のデータ
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: '平均気温', value: current.avgTemp.toFixed(1), color: '#f97316', bg: 'rgba(249,115,22,0.07)' },
                { label: '最高気温', value: current.maxTemp.toFixed(1), color: '#ef4444', bg: 'rgba(239,68,68,0.07)' },
                { label: '最低気温', value: current.minTemp.toFixed(1), color: '#3b82f6', bg: 'rgba(59,130,246,0.07)' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background: bg, borderRadius: '12px', padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-muted)', marginBottom: '6px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {value}℃
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temperature chart */}
          <div className="card" style={{ padding: '20px 20px 16px' }}>
            <div className="section-label">気温推移（日別平均）</div>
            <TemperatureChart data={dailyStats} />
          </div>

          {/* Weather distribution */}
          <div className="card" data-testid="monthly-distribution" style={{ padding: '20px 24px' }}>
            <div className="section-label">天気の内訳</div>
            <WeatherDistribution counts={current.weatherCounts} total={current.dataPoints} />
          </div>
        </>
      )}
    </div>
  );
}
