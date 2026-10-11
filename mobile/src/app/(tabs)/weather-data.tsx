import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RANGES, type Num, type Range, type Reading } from '@/api/types';
import { Async } from '@/components/hula/async';
import { BarChart, LineChart } from '@/components/hula/charts';
import { Card, DataBanner, Screen, Segmented } from '@/components/hula/ui';
import { COLORS } from '@/constants/hula';
import { useLatestReading, useSeries } from '@/hooks/use-hula-data';
import { axisLabels, formatDateTime } from '@/lib/format';

type Key = 'temperature' | 'humidity' | 'windSpeed' | 'rainfall';

// Takes one metric out of the readings, skipping gaps (a sensor that didn't report).
const pick = (points: Reading[], key: Key): number[] => points.flatMap((p) => (p[key] === null ? [] : [p[key] as number]));

function MetricCard({ icon, title, now, values, color, xLabels, digits, unit }: { icon: string; title: string; now: Num; values: number[]; color: string; xLabels: string[]; digits: number; unit: string }) {
  const hasChart = values.length >= 2;
  return (
    <Card style={styles.metric}>
      <View style={styles.metricTop}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.small}>{title}</Text>
          <Text style={styles.now}>{now === null ? '—' : `${now.toFixed(digits)}${unit}`}</Text>
        </View>
        {hasChart ? <Text style={styles.small}>{`Min ${Math.min(...values).toFixed(digits)}  |  Max ${Math.max(...values).toFixed(digits)}`}</Text> : null}
      </View>
      {hasChart ? <LineChart values={values} color={color} height={64} xLabels={xLabels} /> : <Text style={styles.small}>No readings for this period.</Text>}
    </Card>
  );
}

export default function WeatherDataScreen() {
  const [range, setRange] = useState<Range>('24h');
  const latest = useLatestReading();
  const series = useSeries(range);
  const now = latest.data;

  return (
    <Screen
      title="Weather Data"
      refreshing={latest.refreshing || series.refreshing}
      onRefresh={() => {
        latest.refresh();
        series.refresh();
      }}>
      <Segmented options={RANGES} value={range} onChange={setRange} />
      <View style={{ height: 16 }} />
      <DataBanner recordedAt={now?.recordedAt} />

      <Async resource={series}>
        {(points) => {
          const xLabels = axisLabels(points.map((p) => p.recordedAt), range);
          const rainfall = pick(points, 'rainfall');
          const totalRain = Math.round(rainfall.reduce((a, b) => a + b, 0) * 10) / 10;
          return (
            <>
              <MetricCard icon="🌡️" title="Temperature (°C)" now={now?.temperature ?? null} values={pick(points, 'temperature')} color={COLORS.temperature} xLabels={xLabels} digits={1} unit="°C" />
              <MetricCard icon="💧" title="Humidity (%)" now={now?.humidity ?? null} values={pick(points, 'humidity')} color={COLORS.humidity} xLabels={xLabels} digits={0} unit="%" />
              <MetricCard icon="💨" title="Wind Speed (m/s)" now={now?.windSpeed ?? null} values={pick(points, 'windSpeed')} color={COLORS.wind} xLabels={xLabels} digits={1} unit=" m/s" />

              <Card style={styles.metric}>
                <View style={styles.metricTop}>
                  <Text style={styles.icon}>🌧️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.small}>Rainfall (mm)</Text>
                    <Text style={styles.now}>{now?.rainfall == null ? '—' : `${now.rainfall.toFixed(1)} mm`}</Text>
                  </View>
                  {rainfall.length > 0 ? <Text style={styles.small}>{`Total ${totalRain} mm`}</Text> : null}
                </View>
                {rainfall.length > 0 ? <BarChart values={rainfall} color={COLORS.rainfall} height={64} labels={xLabels} /> : <Text style={styles.small}>No readings for this period.</Text>}
              </Card>
            </>
          );
        }}
      </Async>

      {now ? (
        <Card tone="soft">
          <Text style={styles.sourceTitle}>Data Source</Text>
          <Text style={styles.small}>{now.source}</Text>
          <Text style={styles.small}>{`Last update: ${formatDateTime(now.recordedAt)}`}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  metric: { marginBottom: 12 },
  metricTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  icon: { fontSize: 24 },
  small: { color: COLORS.muted, fontSize: 11 },
  now: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginTop: 2 },
  sourceTitle: { color: COLORS.green, fontSize: 13, fontWeight: '800', marginBottom: 4 },
});
