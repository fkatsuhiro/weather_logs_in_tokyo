import { describe, it, expect } from 'vitest';
import {
  getWeatherDisplay,
  groupByDate,
  groupByMonth,
  calcMonthlySummary,
  buildMonthlySummaries,
  computeDailyStats,
} from './weatherUtils';
import type { WeatherData } from '../types/weather';

const SAMPLE: WeatherData[] = [
  { date: '2026-03-03T00:15', weather_code: 0, temperature: 8.0 },
  { date: '2026-03-03T12:00', weather_code: 0, temperature: 12.0 },
  { date: '2026-03-04T09:00', weather_code: 3, temperature: 6.0 },
  { date: '2026-04-01T09:00', weather_code: 61, temperature: 15.0 },
  { date: '2026-04-02T09:00', weather_code: 0, temperature: 20.0 },
];

describe('getWeatherDisplay', () => {
  it('code=0 → 快晴', () => {
    const d = getWeatherDisplay(0);
    expect(d.label).toBe('快晴');
    expect(d.category).toBe('clear');
    expect(d.icon).toBe('☀️');
  });

  it('code=1〜3 → partly_cloudy', () => {
    expect(getWeatherDisplay(1).category).toBe('partly_cloudy');
    expect(getWeatherDisplay(3).category).toBe('partly_cloudy');
  });

  it('code=45,48 → fog', () => {
    expect(getWeatherDisplay(45).category).toBe('fog');
    expect(getWeatherDisplay(48).category).toBe('fog');
  });

  it('code=51〜65 → rain', () => {
    expect(getWeatherDisplay(51).category).toBe('rain');
    expect(getWeatherDisplay(65).category).toBe('rain');
  });

  it('code=80〜82 → rain', () => {
    expect(getWeatherDisplay(80).category).toBe('rain');
    expect(getWeatherDisplay(82).category).toBe('rain');
  });

  it('code=66〜77 → snow', () => {
    expect(getWeatherDisplay(66).category).toBe('snow');
  });

  it('code>=95 → thunder', () => {
    expect(getWeatherDisplay(95).category).toBe('thunder');
    expect(getWeatherDisplay(99).category).toBe('thunder');
  });

  it('未定義コード → unknown', () => {
    expect(getWeatherDisplay(10).category).toBe('unknown');
  });
});

describe('groupByDate', () => {
  it('日付キーでグループ化される', () => {
    const result = groupByDate(SAMPLE);
    expect(Object.keys(result)).toContain('2026-03-03');
    expect(result['2026-03-03']).toHaveLength(2);
    expect(result['2026-03-04']).toHaveLength(1);
  });
});

describe('groupByMonth', () => {
  it('YYYY-MMキーでグループ化される', () => {
    const result = groupByMonth(SAMPLE);
    expect(Object.keys(result)).toContain('2026-03');
    expect(Object.keys(result)).toContain('2026-04');
    expect(result['2026-03']).toHaveLength(3);
    expect(result['2026-04']).toHaveLength(2);
  });
});

describe('calcMonthlySummary', () => {
  const marchLogs = SAMPLE.filter((l) => l.date.startsWith('2026-03'));

  it('平均・最高・最低気温が正しい', () => {
    const s = calcMonthlySummary('2026-03', marchLogs);
    expect(s.avgTemp).toBeCloseTo((8.0 + 12.0 + 6.0) / 3, 5);
    expect(s.maxTemp).toBe(12.0);
    expect(s.minTemp).toBe(6.0);
  });

  it('monthKey・year・monthが正しい', () => {
    const s = calcMonthlySummary('2026-03', marchLogs);
    expect(s.monthKey).toBe('2026-03');
    expect(s.year).toBe(2026);
    expect(s.month).toBe(3);
  });

  it('dataPointsがログ数と一致する', () => {
    const s = calcMonthlySummary('2026-03', marchLogs);
    expect(s.dataPoints).toBe(3);
  });

  it('firstDate/lastDateが正しいソート順', () => {
    const s = calcMonthlySummary('2026-03', marchLogs);
    expect(s.firstDate).toBe('2026-03-03');
    expect(s.lastDate).toBe('2026-03-04');
  });

  it('dominantWeatherは最頻出カテゴリ', () => {
    // marchLogs: code=0,0,3 → clear が2件で最多
    const s = calcMonthlySummary('2026-03', marchLogs);
    expect(s.dominantWeather.category).toBe('clear');
  });
});

describe('buildMonthlySummaries', () => {
  it('降順（新しい月が先）に並ぶ', () => {
    const summaries = buildMonthlySummaries(SAMPLE);
    expect(summaries[0].monthKey).toBe('2026-04');
    expect(summaries[1].monthKey).toBe('2026-03');
  });

  it('空配列で空を返す', () => {
    expect(buildMonthlySummaries([])).toHaveLength(0);
  });
});

describe('computeDailyStats', () => {
  it('指定月のデータのみ集計される', () => {
    const stats = computeDailyStats(SAMPLE, '2026-03');
    expect(stats).toHaveLength(2); // 3/3 と 3/4 の2日分
  });

  it('日別の avg/max/min が正しい', () => {
    const stats = computeDailyStats(SAMPLE, '2026-03');
    const day3 = stats.find((s) => s.day === 3)!;
    expect(day3.avg).toBeCloseTo((8.0 + 12.0) / 2, 5);
    expect(day3.max).toBe(12.0);
    expect(day3.min).toBe(8.0);
  });

  it('日付昇順に並ぶ', () => {
    const stats = computeDailyStats(SAMPLE, '2026-03');
    expect(stats[0].day).toBe(3);
    expect(stats[1].day).toBe(4);
  });

  it('存在しない月キーは空を返す', () => {
    expect(computeDailyStats(SAMPLE, '2026-01')).toHaveLength(0);
  });
});
