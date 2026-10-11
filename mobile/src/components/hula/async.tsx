import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { ApiError } from '@/api/errors';
import { COLORS, RADIUS } from '@/constants/hula';
import type { Resource } from '@/hooks/use-hula-data';

import { Card } from './ui';

// Shows the right thing for each state of a piece of data: loading, empty, failed, or ready.
// If a refresh fails but older data exists, the old data stays visible with a small notice.
export function Async<T>({ resource, children }: { resource: Resource<T>; children: (data: T) => ReactNode }) {
  const { data, error, loading, refresh } = resource;

  if (loading) {
    return (
      <Card style={styles.center}>
        <ActivityIndicator color={COLORS.green} />
        <Text style={styles.muted}>Loading…</Text>
      </Card>
    );
  }

  if (!data) return <Problem error={error} onRetry={refresh} />;

  return (
    <>
      {error ? (
        <Card tone="warn" style={{ marginBottom: 12, paddingVertical: 10 }}>
          <Text style={styles.noticeText}>Couldn&apos;t refresh. Showing the last data the app received.</Text>
        </Card>
      ) : null}
      {children(data)}
    </>
  );
}

function Problem({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const kind = error instanceof ApiError ? error.kind : 'server';
  const info = {
    empty: { title: 'Nothing here yet', hint: error?.message ?? '' },
    config: { title: 'App not set up', hint: error?.message ?? '' },
    network: { title: "Can't reach the HULA server", hint: 'Check that your phone is connected to the HULA network (or the internet), then try again.' },
    timeout: { title: 'The server is not answering', hint: 'Check your connection, then try again.' },
    server: { title: 'Something went wrong', hint: error?.message ?? 'Please try again.' },
  }[kind];

  return (
    <Card tone={kind === 'empty' ? 'soft' : 'white'} style={styles.problem}>
      <Text style={styles.problemTitle}>{info.title}</Text>
      <Text style={styles.muted}>{info.hint}</Text>
      <Pressable onPress={onRetry} style={styles.retry}>
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  muted: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  noticeText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  problem: { gap: 8, marginBottom: 12 },
  problemTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  retry: { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: COLORS.green, borderRadius: RADIUS.card, paddingVertical: 8, paddingHorizontal: 14, marginTop: 4 },
  retryText: { color: COLORS.green, fontSize: 12, fontWeight: '800' },
});
