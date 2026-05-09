export interface WeatherData {
  date: string;
  weather_code: number;
  temperature: number;
}

export interface WeatherDisplay {
  icon: string;
  label: string;
  category: WeatherCategory;
}

export type WeatherCategory =
  | 'clear'
  | 'partly_cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunder'
  | 'unknown';

export interface MonthlySummary {
  monthKey: string;
  year: number;
  month: number;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  dominantWeather: WeatherDisplay;
  weatherCounts: Partial<Record<WeatherCategory, number>>;
  dataPoints: number;
  firstDate: string;
  lastDate: string;
}

export type ViewMode = 'daily' | 'monthly';

export interface DailyStats {
  day: number;
  date: string;
  avg: number;
  max: number;
  min: number;
}
