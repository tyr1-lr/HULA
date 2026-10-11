import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Thermometer,
  Droplet,
  Wind,
  CloudRainWind,
  type LucideIcon,
} from "lucide-react-native";
import {
  HORIZONS,
  type Forecast,
  type Horizon,
  type LatestReading,
  type Num,
} from "@/api/types";
import { Async } from "@/components/hula/async";
import { BarChart, LineChart } from "@/components/hula/charts";
import {
  Card,
  DataBanner,
  Screen,
  Segmented,
  SectionTitle,
} from "@/components/hula/ui";
import { COLORS } from "@/constants/hula";
import { useForecast, useLatestReading } from "@/hooks/use-hula-data";
import { deltaText, fmt, timeAgo, withUnit } from "@/lib/format";

type TrendKey = "temperature" | "humidity" | "windSpeed" | "rainfall";
const TREND_OPTIONS: { label: string; value: TrendKey }[] = [
  { label: "Temp", value: "temperature" },
  { label: "Humidity", value: "humidity" },
  { label: "Wind", value: "windSpeed" },
  { label: "Rainfall", value: "rainfall" },
];
const TREND_COLOR: Record<TrendKey, string> = {
  temperature: COLORS.temperature,
  humidity: COLORS.humidity,
  windSpeed: COLORS.wind,
  rainfall: COLORS.rainfall,
};
const TREND_DIGITS: Record<TrendKey, number> = {
  temperature: 1,
  humidity: 0,
  windSpeed: 1,
  rainfall: 1,
};

const rainLabel = (chance: Num) =>
  chance === null
    ? "No forecast yet"
    : chance < 30
      ? "Rain unlikely"
      : chance < 60
        ? "Rain possible"
        : "Rain likely";
const diff = (a: Num | undefined, b: Num | undefined, digits: number) =>
  deltaText(a != null && b != null ? a - b : null, digits);

export default function ForecastScreen() {
  const latest = useLatestReading();
  const forecast = useForecast();

  const [horizon, setHorizon] = useState<Horizon>(1);
  const [trend, setTrend] = useState<TrendKey>("temperature");

  return (
    <Screen
      title="Rainfall & Weather Forecast"
      refreshing={latest.refreshing || forecast.refreshing}
      onRefresh={() => {
        latest.refresh();
        forecast.refresh();
      }}
    >
      <Segmented
        options={HORIZONS.map((h) => ({
          label: `${h} ${h === 1 ? "Hour" : "Hours"}`,
          value: h,
        }))}
        value={horizon}
        onChange={setHorizon}
      />
      <View style={{ height: 16 }} />
      <DataBanner recordedAt={latest.data?.recordedAt} />

      <Async resource={forecast}>
        {(fc) => (
          <Body
            fc={fc}
            now={latest.data}
            horizon={horizon}
            trend={trend}
            onTrend={setTrend}
          />
        )}
      </Async>
    </Screen>
  );
}

function Body({
  fc,
  now,
  horizon,
  trend,
  onTrend,
}: {
  fc: Forecast;
  now: LatestReading | null;
  horizon: Horizon;
  trend: TrendKey;
  onTrend: (t: TrendKey) => void;
}) {
  const point = fc.points.find((p) => p.hours === horizon);
  const chance = point?.rainChance ?? null;

  const trendPairs: { label: string; value: number }[] = [];
  const nowValue = now?.[trend] ?? null;
  if (nowValue !== null) trendPairs.push({ label: "Now", value: nowValue });
  for (const p of fc.points) {
    const v = p[trend];
    if (v !== null) trendPairs.push({ label: `${p.hours}h`, value: v });
  }
  const chancePairs = fc.points.flatMap((p) =>
    p.rainChance === null
      ? []
      : [{ label: `${p.hours}h`, value: p.rainChance }],
  );

  const windowText = horizon === 1 ? "hour" : `${horizon} hours`;
  const summary = !point
    ? "No forecast for this window yet."
    : chance === null
      ? "The model has not produced a rain forecast for this window yet."
      : `${Math.round(chance)}% chance of rain within the next ${windowText}${point.rainfall !== null ? `, with about ${fmt(point.rainfall, 1)} mm expected` : ""}.`;

  return (
    <>
      <SectionTitle>Forecast Summary</SectionTitle>
      <Card tone="soft">
        <Text style={styles.summaryTitle}>{rainLabel(chance)}</Text>
        <Text style={styles.summaryText}>{summary}</Text>
      </Card>

      <View style={styles.tiles}>
        <Tile
          icon={Thermometer}
          iconColor="#c43a2d"
          label="Temp"
          value={withUnit(point?.temperature, 1, "°C")}
          note={diff(point?.temperature, now?.temperature, 1)}
        />
        <Tile
          icon={Droplet}
          iconColor="#2d8fc4"
          label="Humidity"
          value={withUnit(point?.humidity, 0, "%")}
          note={diff(point?.humidity, now?.humidity, 0)}
        />
        <Tile
          icon={Wind}
          iconColor="#3ac42d"
          label="Wind"
          value={withUnit(point?.windSpeed, 1, " m/s")}
          note={diff(point?.windSpeed, now?.windSpeed, 1)}
        />
        <Tile
          icon={CloudRainWind}
          iconColor="#18597c"
          label="Rainfall"
          value={withUnit(point?.rainfall, 1, " mm")}
          note={chance !== null ? `${Math.round(chance)}%` : ""}
        />
      </View>

      <Card style={{ marginTop: 12, gap: 6 }}>
        <View style={styles.modelRow}>
          <View>
            <Text style={styles.small}>Prediction Model</Text>
            <Text style={styles.modelValue}>{fc.model.name}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.small}>Model Accuracy</Text>
            <Text style={styles.modelValue}>
              {withUnit(fc.model.accuracy, 1, "%")}
            </Text>
          </View>
        </View>
        <Text style={styles.small}>
          {fc.model.variant === "fallback"
            ? "Using local sensors only (no internet forecast available)."
            : "Using local sensors and the online forecast."}
          {fc.generatedAt ? ` Updated ${timeAgo(fc.generatedAt)}.` : ""}
        </Text>
      </Card>

      <View style={{ height: 24 }} />
      <SectionTitle right="Next 6 hours">Forecast Trend</SectionTitle>
      <Segmented options={TREND_OPTIONS} value={trend} onChange={onTrend} />
      <Card style={{ marginTop: 12 }}>
        {trendPairs.length >= 2 ? (
          <LineChart
            values={trendPairs.map((p) => p.value)}
            color={TREND_COLOR[trend]}
            height={110}
            xLabels={trendPairs.map((p) => p.label)}
            showValues
            format={(v) => v.toFixed(TREND_DIGITS[trend])}
          />
        ) : (
          <Text style={styles.small}>
            Not enough data to draw this trend yet.
          </Text>
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.chartTitle}>Rainfall Probability</Text>
        {chancePairs.length > 0 ? (
          <BarChart
            values={chancePairs.map((p) => p.value)}
            color={COLORS.green}
            height={110}
            labels={chancePairs.map((p) => p.label)}
            max={100}
            format={(v) => `${Math.round(v)}%`}
          />
        ) : (
          <Text style={styles.small}>No rain probabilities yet.</Text>
        )}
      </Card>
    </>
  );
}

function Tile({
  icon: Icon,
  iconColor,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card style={styles.tile}>
      <Icon size={20} color={iconColor} />

      <Text style={styles.small}>{label}</Text>

      <Text style={styles.tileValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>

      <Text style={styles.small}>{note || " "}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  summaryTitle: {
    color: COLORS.green,
    fontSize: 18,
    fontFamily: "NunitoSansBold",
    fontWeight: "800",
  },
  summaryText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontFamily: "NunitoSansRegular",
  },
  tiles: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tileIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tileValue: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: "NunitoSansBold",
    fontWeight: "800",
    marginVertical: 4,
  },
  small: {
    color: COLORS.muted,
    fontSize: 11,
    fontFamily: "NunitoSansRegular",
  },
  modelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modelValue: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: "NunitoSansBold",
    fontWeight: "800",
    marginTop: 2,
  },
  chartTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "NunitoSansBold",
    fontWeight: "700",
    marginBottom: 10,
  },
});
