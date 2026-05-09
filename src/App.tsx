import { useEffect, useState } from 'react';
import type { WeatherData, ViewMode } from './types/weather';
import { ViewToggle } from './components/ViewToggle';
import { DailyView } from './components/DailyView';
import { MonthlyView } from './components/MonthlyView';

function App() {
  const [logs, setLogs] = useState<WeatherData[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  useEffect(() => {
    fetch('./weather_log.json')
      .then((res) => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setLogs(data as WeatherData[]);
      })
      .catch((err: unknown) => console.error('データ読み込みエラー:', err));
  }, []);

  const lastUpdated = logs.at(-1)?.date.replace('T', ' ') ?? null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #1d4ed8 100%)',
        color: '#fff',
        padding: '36px 20px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <span style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', bottom: -70, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', top: 20, left: '15%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2.8rem', lineHeight: 1, marginBottom: '10px' }}>☀️</div>
          <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.03em', textShadow: '0 1px 8px rgba(0,0,0,0.15)' }}>
            東京 天気ダッシュボード
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '0.82rem', opacity: 0.75, letterSpacing: '0.02em' }}>
            Tokyo Weather Dashboard
            {lastUpdated && (
              <span style={{ marginLeft: 12, opacity: 0.9 }}>· 最終更新: {lastUpdated}</span>
            )}
          </p>
        </div>
      </header>

      {/* ── Toggle ── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 20px 8px' }}>
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* ── Content ── */}
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '16px 20px 48px' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--c-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>⏳</div>
            <p style={{ margin: 0 }}>データ取得中...</p>
          </div>
        ) : viewMode === 'daily' ? (
          <DailyView logs={logs} />
        ) : (
          <MonthlyView logs={logs} />
        )}
      </main>
    </div>
  );
}

export default App;
