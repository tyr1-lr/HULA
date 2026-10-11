import { type ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, RADIUS } from '@/constants/hula';
import { STALE_AFTER_MIN, USE_MOCK } from '@/config';
import { minutesSince, timeAgo } from '@/lib/format';

// Page wrapper: cream background, scrolls, and keeps content clear of the status bar.
// Pass onRefresh to enable pull-down-to-refresh.
export function Screen({
  title,
  subtitle,
  onRefresh,
  refreshing = false,
  children,
}: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} colors={[COLORS.green]} /> : undefined
      }
      contentContainerStyle={{
        paddingHorizontal: 18,
        paddingTop: insets.top + 16,
        paddingBottom: 24, // the tab bar sits below the screen, so no extra room is needed
      }}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={{ height: 16 }} />
      {children}
    </ScrollView>
  );
}

type Tone = 'white' | 'green' | 'soft' | 'beige' | 'warn';
const TONES: Record<Tone, ViewStyle> = {
  white: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  green: { backgroundColor: COLORS.green },
  soft: { backgroundColor: COLORS.greenSoft },
  beige: { backgroundColor: COLORS.beige },
  warn: { backgroundColor: COLORS.warn },
};

export function Card({ tone = 'white', style, children }: { tone?: Tone; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return <View style={[styles.card, TONES[tone], style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right ? <Text style={styles.sectionRight}>{right}</Text> : null}
    </View>
  );
}

// Row of pill buttons where exactly one is selected. Works for any value type (numbers or strings).
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  // With many options (like the History filters) the pills scroll sideways instead of squeezing.
  const compact = options.length > 4;
  const pills = options.map((o) => {
    const active = o.value === value;
    return (
      <Pressable
        key={String(o.value)}
        onPress={() => onChange(o.value)}
        style={[styles.seg, compact ? styles.segCompact : styles.segFlex, active && styles.segActive]}>
        <Text style={[styles.segText, active && styles.segTextActive]} numberOfLines={1}>
          {o.label}
        </Text>
      </Pressable>
    );
  });
  if (compact) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segRow}>
        {pills}
      </ScrollView>
    );
  }
  return <View style={styles.segRow}>{pills}</View>;
}

// Warns when the numbers can't be trusted as live: sample mode, or the newest reading is old (station offline).
export function DataBanner({ recordedAt }: { recordedAt?: string | null }) {
  const messages: string[] = [];
  if (USE_MOCK) messages.push('Sample data. These are not live sensor readings.');
  if (recordedAt && minutesSince(recordedAt) > STALE_AFTER_MIN) {
    messages.push(`Last reading was ${timeAgo(recordedAt)}. The weather station may be offline.`);
  }
  if (messages.length === 0) return null;
  return (
    <Card tone="warn" style={{ marginBottom: 16, paddingVertical: 10, gap: 4 }}>
      {messages.map((m) => (
        <Text key={m} style={styles.bannerText}>
          {m}
        </Text>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  title: { color: COLORS.green, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  card: { borderRadius: RADIUS.card, padding: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { color: COLORS.green, fontSize: 17, fontWeight: '800' },
  sectionRight: { color: COLORS.muted, fontSize: 11 },
  segRow: { flexDirection: 'row', gap: 8 },
  seg: {
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  segFlex: { flex: 1 },
  segCompact: { paddingHorizontal: 16 },
  segActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  segText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  segTextActive: { color: COLORS.white },
  bannerText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
});
