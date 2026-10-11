// Pretend server used while EXPO_PUBLIC_USE_MOCK is true.
// It returns the same JSON as the real API (see docs/api-contract.md), so the app's mapping code is exercised too.
// Timestamps are relative to "now", so the screens look live.

import { ApiError } from '@/api/errors';
import { MOCK_SCENARIO } from '@/config';

const MIN = 60_000;
const HOUR = 60 * MIN;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();
const round1 = (v: number) => Math.round(v * 10) / 10;

const missing = MOCK_SCENARIO === 'missing-sensor';

// Smooth, repeatable fake curve (no randomness, so charts don't jump on every refresh).
function wave(i: number, n: number, base: number, amp: number, cycles: number, wobble: number) {
  const t = (i / (n - 1)) * Math.PI * 2 * cycles;
  return round1(base + amp * Math.sin(t) + wobble * Math.sin(i * 7.3));
}
function rain(i: number) {
  return Math.max(0, round1(Math.sin(i * 0.9) * 1.2 + Math.sin(i * 0.31) * 1.6 - 0.4));
}

function reading(msAgo: number, i: number, n: number, cycles: number) {
  return {
    recorded_at: iso(msAgo),
    temperature_c: wave(i, n, 28.5, 2.8, cycles, 0.3),
    humidity_pct: missing ? null : Math.round(wave(i, n, 82, 10, cycles, 1.5)),
    wind_speed_ms: Math.max(0.5, wave(i, n, 3.2, 1.6, cycles, 0.4)),
    rainfall_mm: rain(i),
    pressure_hpa: 1008,
  };
}

function latest() {
  return {
    recorded_at: iso(MOCK_SCENARIO === 'stale' ? 3 * HOUR : 3 * MIN),
    temperature_c: 28.4,
    humidity_pct: missing ? null : 82,
    wind_speed_ms: 3.2,
    rainfall_mm: 0.0,
    pressure_hpa: 1008,
    change_1h: { temperature_c: 0.3, humidity_pct: missing ? null : 2, wind_speed_ms: 0, pressure_hpa: -1 },
    source: 'Local sensors (Heltec V3)',
  };
}

function forecast() {
  return {
    generated_at: iso(5 * MIN),
    model: { name: 'LightGBM', accuracy_pct: 87.3, variant: 'primary' },
    horizons: [
      { hours: 1, temperature_c: 29.0, humidity_pct: 78, wind_speed_ms: 3.5, rainfall_mm: 0.8, rain_chance_pct: 70 },
      { hours: 3, temperature_c: 28.0, humidity_pct: 80, wind_speed_ms: 3.4, rainfall_mm: 1.4, rain_chance_pct: 80 },
      { hours: 6, temperature_c: 27.0, humidity_pct: 82, wind_speed_ms: 3.1, rainfall_mm: 0.6, rain_chance_pct: 60 },
    ],
    advisory: 'Possible rainfall within the next 3 hours. Consider closing irrigation gates if needed.',
    condition: { title: 'Partly Cloudy', note: 'Good conditions for field activities.' },
  };
}

const SERIES_SHAPE = { '24h': [48, 30 * MIN, 1], '7d': [56, 3 * HOUR, 7], '30d': [60, 12 * HOUR, 4] } as const;

function series(range: string) {
  const [n, step, cycles] = SERIES_SHAPE[range as keyof typeof SERIES_SHAPE] ?? SERIES_SHAPE['24h'];
  return { points: Array.from({ length: n }, (_, i) => reading((n - 1 - i) * step, i, n, cycles)) }; // oldest first
}

function history(limit: number) {
  const n = Math.min(limit, 40);
  return { results: Array.from({ length: n }, (_, i) => ({ id: n - i, ...reading(i * 10 * MIN, n - 1 - i, n, 1) })) }; // newest first
}

function alerts() {
  return {
    results: [
      { id: 3, created_at: iso(20 * MIN), title: 'Rain likely within 3 hours', detail: '80% chance, about 1.4 mm expected.' },
      { id: 2, created_at: iso(17 * HOUR), title: 'Rain likely within 1 hour', detail: '70% chance, about 0.8 mm expected.' },
      { id: 1, created_at: iso(51 * HOUR), title: 'Rain unlikely today', detail: 'Chance of rain stayed below 20% for the next 6 hours.' },
    ],
  };
}

export async function mockGet(path: string, params: Record<string, string | number>): Promise<unknown> {
  await sleep(350); // so loading states are visible
  if (MOCK_SCENARIO === 'offline') throw new ApiError('network', "Can't reach the HULA server.");
  const empty = MOCK_SCENARIO === 'empty';

  switch (path) {
    case '/api/readings/latest/':
      return empty ? null : latest();
    case '/api/forecast/latest/':
      return empty ? null : forecast();
    case '/api/readings/series/':
      return empty ? { points: [] } : series(String(params.range));
    case '/api/readings/history/':
      return empty ? { results: [] } : history(Number(params.limit) || 50);
    case '/api/alerts/':
      return empty ? { results: [] } : alerts();
    default:
      throw new ApiError('server', `Unknown mock endpoint ${path}`, 404);
  }
}
