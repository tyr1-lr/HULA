// The shapes the screens work with. Every field a sensor can fail to report is `number | null`,
// so a dead BME280 or rain gauge shows "—" on screen instead of crashing or showing a fake 0.

export type Num = number | null;

export type Horizon = 1 | 3 | 6;
export const HORIZONS: Horizon[] = [1, 3, 6];

export type Range = '24h' | '7d' | '30d';
export const RANGES: { label: string; value: Range }[] = [
  { label: 'Last 24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
];

export type Reading = {
  recordedAt: string; // ISO 8601 timestamp, formatted for display in src/lib/format.ts
  temperature: Num; // °C
  humidity: Num; // %
  windSpeed: Num; // m/s
  rainfall: Num; // mm since the previous reading
  pressure: Num; // hPa
};

export type LatestReading = Reading & {
  source: string;
  change: { temperature: Num; humidity: Num; windSpeed: Num; pressure: Num }; // difference vs 1 hour ago
};

export type HistoryRow = Reading & { id: string };

export type ForecastPoint = {
  hours: Horizon;
  temperature: Num;
  humidity: Num;
  windSpeed: Num;
  rainfall: Num; // expected mm in the window
  rainChance: Num; // %
};

export type Forecast = {
  generatedAt: string;
  model: {
    name: string;
    accuracy: Num; // %
    variant: 'primary' | 'fallback'; // primary = local sensors + Open-Meteo, fallback = local sensors only
  };
  points: ForecastPoint[]; // sorted by hours
  advisory: string | null;
  condition: { title: string; note: string } | null;
};

export type AlertItem = { id: string; createdAt: string; title: string; detail: string };
