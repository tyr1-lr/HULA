import { API_URL, REQUEST_TIMEOUT_MS, USE_MOCK } from '@/config';
import { mockGet } from '@/data/mock';

import { ApiError } from './errors';

// The only place in the app that talks to the network.
// In mock mode it returns the same JSON the Django API will return, so everything after this line runs identically.
export async function apiGet(path: string, params: Record<string, string | number> = {}): Promise<unknown> {
  if (USE_MOCK) return mockGet(path, params);

  if (!API_URL) {
    throw new ApiError('config', 'The server address is not set. Add EXPO_PUBLIC_API_URL to mobile/.env and restart Expo.');
  }

  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  const url = `${API_URL}${path}${query ? `?${query}` : ''}`;

  // Without a timeout, a phone on the wrong Wi-Fi can wait a very long time before failing.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    if (res.status === 204) return null; // contract: 204 = nothing recorded yet
    if (!res.ok) throw new ApiError('server', `The server responded with an error (${res.status}).`, res.status);
    try {
      return await res.json();
    } catch {
      throw new ApiError('server', 'The server sent a response the app could not read.');
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (controller.signal.aborted) throw new ApiError('timeout', 'The server took too long to respond.');
    throw new ApiError('network', "Can't reach the HULA server.");
  } finally {
    clearTimeout(timer);
  }
}
