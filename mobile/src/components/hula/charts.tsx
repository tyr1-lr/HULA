import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/hula';

// Charts are drawn with plain Views so no extra library is needed.

// Line chart: each segment is a thin View stretched and rotated between two points.
export function LineChart({
  values,
  color,
  height = 70,
  xLabels,
  showValues = false,
  format = (v: number) => String(v),
}: {
  values: number[];
  color: string;
  height?: number;
  xLabels?: string[];
  showValues?: boolean;
  format?: (v: number) => string;
}) {
  const [width, setWidth] = useState(0);
  const pad = showValues ? 18 : 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => ({
    x: values.length === 1 ? width / 2 : (i / (values.length - 1)) * width,
    y: pad + (1 - (v - min) / span) * (height - pad * 2),
  }));

  return (
    <View>
      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 &&
          pts.slice(0, -1).map((p, i) => {
            const q = pts[i + 1];
            const len = Math.hypot(q.x - p.x, q.y - p.y);
            const angle = Math.atan2(q.y - p.y, q.x - p.x);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: (p.x + q.x) / 2 - len / 2,
                  top: (p.y + q.y) / 2 - 1,
                  width: len,
                  height: 2,
                  backgroundColor: color,
                  transform: [{ rotate: `${angle}rad` }],
                }}
              />
            );
          })}
        {width > 0 &&
          values.length <= 12 &&
          pts.map((p, i) => (
            <View key={`d${i}`}>
              <View style={[styles.dot, { left: p.x - 4, top: p.y - 4, backgroundColor: color }]} />
              {showValues ? (
                <Text style={[styles.pointValue, { left: p.x - 20, top: p.y - 22 }]}>{format(values[i])}</Text>
              ) : null}
            </View>
          ))}
      </View>
      {xLabels ? <XAxis labels={xLabels} /> : null}
    </View>
  );
}

// Bar chart: one flex column per value, scaled to the tallest bar (or to `max` if given).
export function BarChart({
  values,
  color,
  height = 80,
  labels,
  max,
  format = (v: number) => String(v),
}: {
  values: number[];
  color: string;
  height?: number;
  labels?: string[];
  max?: number;
  format?: (v: number) => string;
}) {
  const top = max ?? (Math.max(...values) || 1);
  const few = values.length <= 8; // only print numbers above bars when there is room
  return (
    <View>
      <View style={[styles.barRow, { height, gap: few ? 18 : 2 }]}>
        {values.map((v, i) => (
          <View key={i} style={styles.barCol}>
            {few ? <Text style={styles.barValue}>{format(v)}</Text> : null}
            <View
              style={{
                width: '100%',
                height: Math.max(2, (v / top) * (height - (few ? 16 : 0))),
                backgroundColor: color,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                opacity: v === 0 ? 0.25 : 1,
              }}
            />
          </View>
        ))}
      </View>
      {labels ? <XAxis labels={labels} spread={few} /> : null}
    </View>
  );
}

function XAxis({ labels, spread = false }: { labels: string[]; spread?: boolean }) {
  return (
    <View style={[styles.xAxis, spread && { gap: 18 }]}>
      {labels.map((l, i) => (
        <Text key={`${l}${i}`} style={[styles.xLabel, spread && { flex: 1, textAlign: 'center' }]}>
          {l}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  pointValue: { position: 'absolute', width: 40, textAlign: 'center', fontSize: 10, color: COLORS.text, fontWeight: '700' },
  barRow: { flexDirection: 'row', alignItems: 'flex-end' },
  barCol: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  barValue: { fontSize: 10, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  xLabel: { fontSize: 10, color: COLORS.muted },
});
