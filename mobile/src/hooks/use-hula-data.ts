import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { getAlerts, getForecast, getHistory, getLatestReading, getSeries } from '@/api/hula';
import type { Range } from '@/api/types';
import { POLL_MS } from '@/config';

export type Resource<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean; // first load for this key, nothing to show yet
  refreshing: boolean; // pull-to-refresh in progress
  refresh: () => Promise<void>;
};

type State<T> = { key: string; data: T | null; error: Error | null };

// Loads data, keeps the last good result when a refresh fails, and optionally re-fetches on a timer.
// `key` identifies what is being loaded: when it changes (e.g. a different chart range), old data is dropped.
export function useResource<T>(key: string, fetcher: () => Promise<T>, pollMs?: number): Resource<T> {
  const [state, setState] = useState<State<T>>({ key, data: null, error: null });
  const [refreshing, setRefreshing] = useState(false);
  const fetcherRef = useRef(fetcher);
  const keyRef = useRef(key);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(async () => {
    try {
      const data = await fetcherRef.current();
      if (keyRef.current !== key) return; // a newer request replaced this one
      setState({ key, data, error: null });
    } catch (e) {
      if (keyRef.current !== key) return;
      const error = e instanceof Error ? e : new Error(String(e));
      setState((s) => ({ key, data: s.key === key ? s.data : null, error }));
    }
  }, [key]);

  useEffect(() => {
    keyRef.current = key;
    load();
    if (!pollMs) return;
    const id = setInterval(() => {
      if (AppState.currentState === 'active') load(); // don't poll while the app is in the background
    }, pollMs);
    return () => clearInterval(id);
  }, [key, load, pollMs]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const current = state.key === key ? state : { key, data: null, error: null };
  return {
    data: current.data,
    error: current.error,
    loading: current.data === null && current.error === null,
    refreshing,
    refresh,
  };
}

export const useLatestReading = () => useResource('latest', getLatestReading, POLL_MS.latest);
export const useForecast = () => useResource('forecast', getForecast, POLL_MS.forecast);
export const useSeries = (range: Range) => useResource(`series:${range}`, () => getSeries(range));
export const useHistory = () => useResource('history', () => getHistory());
export const useAlerts = () => useResource('alerts', () => getAlerts());
