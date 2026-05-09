import type {
  WeatherData,
  WeatherDisplay,
  WeatherCategory,
  MonthlySummary,
  DailyStats,
} from '../types/weather';

export function getWeatherDisplay(code: number): WeatherDisplay {
  if (code === 0) return { icon: '☀️', label: '快晴', category: 'clear' };
  if (code <= 3) return { icon: '🌤️', label: '晴れ・曇り', category: 'partly_cloudy' };
  if (code === 45 || code === 48) return { icon: '🌫️', label: '霧', category: 'fog' };
  if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82))
    return { icon: '☔', label: '雨', category: 'rain' };
  if ((code >= 66 && code <= 77) || (code >= 85 && code <= 86))
    return { icon: '❄️', label: '雪', category: 'snow' };
  if (code >= 95) return { icon: '⚡', label: '雷雨', category: 'thunder' };
  return { icon: '❓', label: '不明', category: 'unknown' };
}

export function groupByDate(logs: WeatherData[]): Record<string, WeatherData[]> {
  return logs.reduce<Record<string, WeatherData[]>>((acc, log) => {
    const key = log.date.split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});
}

export function groupByMonth(logs: WeatherData[]): Record<string, WeatherData[]> {
  return logs.reduce<Record<string, WeatherData[]>>((acc, log) => {
    const key = log.date.slice(0, 7); // "YYYY-MM"
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});
}

export function calcMonthlySummary(monthKey: string, logs: WeatherData[]): MonthlySummary {
  const temps = logs.map((l) => l.temperature);
  const avgTemp = temps.reduce((s, t) => s + t, 0) / temps.length;
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);

  const weatherCounts: Partial<Record<WeatherCategory, number>> = {};
  for (const log of logs) {
    const { category } = getWeatherDisplay(log.weather_code);
    weatherCounts[category] = (weatherCounts[category] ?? 0) + 1;
  }

  const dominantCategory = (
    Object.entries(weatherCounts) as [WeatherCategory, number][]
  ).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  const sortedDates = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const [year, month] = monthKey.split('-').map(Number);

  return {
    monthKey,
    year,
    month,
    avgTemp,
    maxTemp,
    minTemp,
    dominantWeather: getWeatherDisplay(
      logs.find((l) => getWeatherDisplay(l.weather_code).category === dominantCategory)!
        .weather_code,
    ),
    weatherCounts,
    dataPoints: logs.length,
    firstDate: sortedDates[0].date.split('T')[0],
    lastDate: sortedDates[sortedDates.length - 1].date.split('T')[0],
  };
}

export function buildMonthlySummaries(logs: WeatherData[]): MonthlySummary[] {
  const byMonth = groupByMonth(logs);
  return Object.entries(byMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, entries]) => calcMonthlySummary(key, entries));
}

export function computeDailyStats(logs: WeatherData[], monthKey: string): DailyStats[] {
  const monthLogs = logs.filter((l) => l.date.startsWith(monthKey));
  const byDay = groupByDate(monthLogs);
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayLogs]) => {
      const temps = dayLogs.map((l) => l.temperature);
      return {
        day: parseInt(date.split('-')[2], 10),
        date,
        avg: temps.reduce((s, t) => s + t, 0) / temps.length,
        max: Math.max(...temps),
        min: Math.min(...temps),
      };
    });
}
