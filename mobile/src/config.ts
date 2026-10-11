// Runtime settings. Values come from mobile/.env (see .env.example).
// Expo only reads EXPO_PUBLIC_* variables, and only when the dev server starts: after editing .env run `npx expo start -c`.

export type MockScenario = 'ok' | 'stale' | 'offline' | 'missing-sensor' | 'empty';

// true  = show built-in sample data (default, so the app works with no server)
// false = talk to the Django API at API_URL
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

// Lets you rehearse every screen state (no hardware needed). Only used while USE_MOCK is true.
export const MOCK_SCENARIO = (process.env.EXPO_PUBLIC_MOCK_SCENARIO ?? 'ok') as MockScenario;

export const REQUEST_TIMEOUT_MS = 8000;
// Nodes report about every 10 minutes, so a reading older than this means the station is probably offline.
export const STALE_AFTER_MIN = 30;
export const POLL_MS = { latest: 60_000, forecast: 300_000 };

export const SITE = {
  name: 'Barangay Santisimo Rosario',
  city: 'San Pablo City, Laguna',
};
