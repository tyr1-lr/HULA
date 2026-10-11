import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import type { HistoryRow } from '@/api/types';
import { Async } from '@/components/hula/async';
import { Card, DataBanner, Screen, Segmented } from '@/components/hula/ui';
import { COLORS, RADIUS } from '@/constants/hula';
import { useAlerts, useHistory } from '@/hooks/use-hula-data';
import { fmt, formatDate, formatDateTime, formatTime } from '@/lib/format';

type Tab = 'sensor' | 'alerts';
type Filter = 'all' | 'temperature' | 'humidity' | 'windSpeed' | 'rainfall';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Temperature', value: 'temperature' },
  { label: 'Humidity', value: 'humidity' },
  { label: 'Wind', value: 'windSpeed' },
  { label: 'Rainfall', value: 'rainfall' },
];

// Each column: which field it shows, its header, and how to print it.
const COLUMNS: { key: Exclude<Filter, 'all'>; head: string; show: (r: HistoryRow) => string }[] = [
  { key: 'temperature', head: 'Temp (°C)', show: (r) => fmt(r.temperature, 1) },
  { key: 'humidity', head: 'Humidity (%)', show: (r) => fmt(r.humidity, 0) },
  { key: 'windSpeed', head: 'Wind (m/s)', show: (r) => fmt(r.windSpeed, 1) },
  { key: 'rainfall', head: 'Rain (mm)', show: (r) => fmt(r.rainfall, 1) },
];

// Export needs a server endpoint; say so instead of doing nothing.
const exportCsv = () => Alert.alert('Export not available yet', 'CSV export will work once the server supports it.');

export default function HistoryScreen() {
  const [tab, setTab] = useState<Tab>('sensor');
  const [filter, setFilter] = useState<Filter>('all');

  return (
    <Screen title="History">
      <Segmented
        options={[
          { label: 'Sensor Data', value: 'sensor' as Tab },
          { label: 'Forecasts & Alerts', value: 'alerts' as Tab },
        ]}
        value={tab}
        onChange={setTab}
      />
      <View style={{ height: 16 }} />
      <DataBanner />

      <View style={styles.toolbar}>
        <View style={styles.dateChip}>
          <Text style={styles.dateText}>📅 Last 7 days</Text>
        </View>
        <Pressable onPress={exportCsv} style={styles.download}>
          <Text style={styles.downloadText}>Download</Text>
        </Pressable>
      </View>

      {tab === 'sensor' ? (
        <>
          <View style={{ marginVertical: 12 }}>
            <Segmented options={FILTERS} value={filter} onChange={setFilter} />
          </View>
          <SensorTable filter={filter} />
        </>
      ) : (
        <AlertsList />
      )}

      <Pressable onPress={exportCsv}>
        <Card tone="soft" style={{ marginTop: 16 }}>
          <Text style={styles.exportTitle}>Export Data</Text>
          <Text style={styles.meta}>Download historical data as CSV</Text>
        </Card>
      </Pressable>
    </Screen>
  );
}

// These two are separate components so each only loads its data while its tab is open.
function SensorTable({ filter }: { filter: Filter }) {
  const history = useHistory();
  const columns = COLUMNS.filter((c) => filter === 'all' || c.key === filter);

  return (
    <Async resource={history}>
      {(rows) =>
        rows.length === 0 ? (
          <Card>
            <Text style={styles.meta}>No readings in the last 7 days.</Text>
          </Card>
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <View style={[styles.row, styles.headRow]}>
              <Text style={[styles.cell, styles.timeCell, styles.head]}>Date & Time</Text>
              {columns.map((c) => (
                <Text key={c.key} style={[styles.cell, styles.head]}>
                  {c.head}
                </Text>
              ))}
            </View>
            {rows.map((r) => (
              <View key={r.id} style={styles.row}>
                <Text style={[styles.cell, styles.timeCell]}>{`${formatDate(r.recordedAt)}\n${formatTime(r.recordedAt)}`}</Text>
                {columns.map((c) => (
                  <Text key={c.key} style={styles.cell}>
                    {c.show(r)}
                  </Text>
                ))}
              </View>
            ))}
          </Card>
        )
      }
    </Async>
  );
}

function AlertsList() {
  const alerts = useAlerts();
  return (
    <View style={{ marginTop: 12 }}>
      <Async resource={alerts}>
        {(items) =>
          items.length === 0 ? (
            <Card>
              <Text style={styles.meta}>No alerts yet.</Text>
            </Card>
          ) : (
            <View style={{ gap: 10 }}>
              {items.map((a) => (
                <Card key={a.id}>
                  <Text style={styles.alertTitle}>{a.title}</Text>
                  {a.detail ? <Text style={styles.alertDetail}>{a.detail}</Text> : null}
                  <Text style={styles.meta}>{formatDateTime(a.createdAt)}</Text>
                </Card>
              ))}
            </View>
          )
        }
      </Async>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  dateChip: { flex: 1, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.card, padding: 12 },
  dateText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  download: { borderWidth: 1.5, borderColor: COLORS.green, borderRadius: RADIUS.card, paddingVertical: 11, paddingHorizontal: 14 },
  downloadText: { color: COLORS.green, fontSize: 12, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  headRow: { backgroundColor: COLORS.greenSoft, borderTopWidth: 0 },
  cell: { flex: 1, color: COLORS.text, fontSize: 12, textAlign: 'center' },
  timeCell: { flex: 1.6, textAlign: 'left' },
  head: { color: COLORS.green, fontWeight: '800', fontSize: 11 },
  alertTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  alertDetail: { color: COLORS.text, fontSize: 12, marginTop: 4 },
  meta: { color: COLORS.muted, fontSize: 11, marginTop: 6 },
  exportTitle: { color: COLORS.green, fontSize: 14, fontWeight: '800' },
});
