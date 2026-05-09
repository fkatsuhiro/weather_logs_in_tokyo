import type { WeatherData } from '../types/weather';
import { getWeatherDisplay, groupByDate } from '../utils/weatherUtils';

interface Props {
  logs: WeatherData[];
}

function tempColor(t: number): string {
  if (t >= 30) return '#ef4444';
  if (t >= 25) return '#f97316';
  if (t >= 18) return '#eab308';
  if (t >= 10) return '#3b82f6';
  return '#60a5fa';
}

function tempBg(t: number): string {
  if (t >= 30) return 'rgba(239,68,68,0.07)';
  if (t >= 25) return 'rgba(249,115,22,0.07)';
  if (t >= 18) return 'rgba(234,179,8,0.06)';
  if (t >= 10) return 'rgba(59,130,246,0.06)';
  return 'rgba(96,165,250,0.09)';
}

export function DailyView({ logs }: Props) {
  const grouped = groupByDate(logs);
  const sortedDates = Object.keys(grouped).sort().reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {sortedDates.map((date) => {
        const entries = grouped[date].slice().sort((a, b) => a.date.localeCompare(b.date));
        const avgTemp = entries.reduce((s, l) => s + l.temperature, 0) / entries.length;
        const dominant = entries
          .map((l) => getWeatherDisplay(l.weather_code))
          .reduce((a, b) => (entries.filter((l) => getWeatherDisplay(l.weather_code).category === b.category).length >= entries.filter((l) => getWeatherDisplay(l.weather_code).category === a.category).length ? b : a));

        return (
          <div
            key={date}
            className="card"
            data-testid="daily-card"
            style={{ padding: '20px 24px' }}
          >
            {/* Date header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>{dominant.icon}</span>
                <h2 style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--c-text)',
                  letterSpacing: '-0.02em',
                }}>
                  {new Intl.DateTimeFormat('ja-JP', {
                    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
                  }).format(new Date(date))}
                </h2>
              </div>
              <span style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: tempColor(avgTemp),
                background: tempBg(avgTemp),
                padding: '2px 10px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '-0.02em',
              }}>
                avg {avgTemp.toFixed(1)}℃
              </span>
            </div>

            {/* Time slot grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '10px' }}>
              {entries.map((log, i) => {
                const display = getWeatherDisplay(log.weather_code);
                const time = log.date.split('T')[1];
                return (
                  <div
                    key={i}
                    style={{
                      textAlign: 'center',
                      padding: '12px 8px',
                      background: tempBg(log.temperature),
                      borderRadius: '12px',
                      border: '1px solid rgba(226,232,240,0.6)',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--c-muted)', marginBottom: '4px', fontWeight: 500 }}>
                      {time}
                    </div>
                    <div style={{ fontSize: '1.6rem', lineHeight: 1, margin: '4px 0' }}>{display.icon}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: tempColor(log.temperature), letterSpacing: '-0.02em' }}>
                      {log.temperature.toFixed(1)}℃
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--c-muted)', marginTop: '2px' }}>{display.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
