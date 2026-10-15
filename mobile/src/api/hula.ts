// Turns the server's JSON (snake_case, units in the field names) into the app's types.
// If the backend changes a field name, this is the only file that needs to change.
// See docs/api-contract.md for the exact JSON.

import { apiGet } from './client';
import { ApiError } from './errors';
import type { AlertItem, Forecast, HistoryRow, Horizon, LatestReading, Num, Range, Reading } from './types';

type Raw = Record<string, unknown>;

// Django REST Framework sends DecimalField values as strings ("28.40"), so accept numeric strings too.
function num(v: unknown): Num {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  }
  return null;
}

function obj(v: unknown): Raw {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Raw;
  throw new ApiError('server', 'The server sent data in an unexpected format.');
}

// Accept a plain array or DRF's paginated { results: [...] }.
function list(v: unknown): Raw[] {
  if (Array.isArray(v)) return v.map(obj);
  const r = obj(v);
  return Array.isArray(r.results) ? r.results.map(obj) : [];
}

function toReading(r: Raw): Reading {
  return {
    recordedAt: typeof r.recorded_at === 'string' ? r.recorded_at : '',
    temperature: num(r.temperature_c),
    humidity: num(r.humidity_pct),
    windSpeed: num(r.wind_speed_ms),
    rainfall: num(r.rainfall_mm),
    pressure: num(r.pressure_hpa),
  };
}

export async function getLatestReading(): Promise<LatestReading> {
  const raw = await apiGet('/api/readings/latest/');
  if (raw === null) throw new ApiError('empty', 'No readings yet. Turn on a weather node and wait for its first report.');
  const r = obj(raw);
  const ch = r.change_1h && typeof r.change_1h === 'object' ? (r.change_1h as Raw) : {};
  return {
    ...toReading(r),
    source: typeof r.source === 'string' ? r.source : 'Local sensors',
    change: {
      temperature: num(ch.temperature_c),
      humidity: num(ch.humidity_pct),
      windSpeed: num(ch.wind_speed_ms),
      pressure: num(ch.pressure_hpa),
    },
  };
}

export async function getForecast(): Promise<Forecast> {
  const raw = await apiGet('/api/forecast/latest/');
  if (raw === null) throw new ApiError('empty', 'No forecast yet. The model needs some sensor readings first.');
  const r = obj(raw);
  const m = r.model && typeof r.model === 'object' ? (r.model as Raw) : {};
  const c = r.condition && typeof r.condition === 'object' ? (r.condition as Raw) : null;
  const horizons = Array.isArray(r.horizons) ? r.horizons.map(obj) : [];
  return {
    generatedAt: typeof r.generated_at === 'string' ? r.generated_at : '',
    model: {
      name: typeof m.name === 'string' ? m.name : 'LightGBM',
      accuracy: num(m.accuracy_pct),
      variant: m.variant === 'fallback' ? 'fallback' : 'primary',
    },
    points: horizons
      .map((h) => ({
        hours: num(h.hours) as Horizon,
        temperature: num(h.temperature_c),
        humidity: num(h.humidity_pct),
        windSpeed: num(h.wind_speed_ms),
        rainfall: num(h.rainfall_mm),
        rainChance: num(h.rain_chance_pct),
      }))
      .filter((p) => p.hours === 1 || p.hours === 3 || p.hours === 6)
      .sort((a, b) => a.hours - b.hours),
    advisory: typeof r.advisory === 'string' && r.advisory !== '' ? r.advisory : null,
    condition: c && typeof c.title === 'string' ? { title: c.title, note: typeof c.note === 'string' ? c.note : '' } : null,
  };
}

// Readings for one chart range, oldest first.
export async function getSeries(range: Range): Promise<Reading[]> {
  const raw = await apiGet('/api/readings/series/', { range });
  if (raw === null) return [];
  return list(Array.isArray(raw) ? raw : obj(raw).points).map(toReading);
}

// Newest first.
export async function getHistory(days = 7, limit = 50): Promise<HistoryRow[]> {
  const raw = await apiGet('/api/readings/history/', { days, limit });
  if (raw === null) return [];
  return list(raw).map((r, i) => ({ id: String(r.id ?? i), ...toReading(r) }));
}

export async function getAlerts(limit = 20): Promise<AlertItem[]> {
  const raw = await apiGet('/api/alerts/', { limit });
  if (raw === null) return [];
  return list(raw).map((r, i) => ({
    id: String(r.id ?? i),
    createdAt: typeof r.created_at === 'string' ? r.created_at : '',
    title: typeof r.title === 'string' ? r.title : 'Alert',
    detail: typeof r.detail === 'string' ? r.detail : '',
  }));
}
