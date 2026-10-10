
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  green: '#0F4415',
  beige: '#E2D7AB',
  cream: '#F1EFC8',
  white: '#FFFFFF',
  text: '#1F2A1F',
  muted: '#687368',
  border: '#E5E8DE',
};

function WeatherCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: string;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <View style={styles.weatherCard}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.cardValue}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌾 HULA</Text>
          <Text style={styles.tagline}>
            Local Weather for Rice Production
          </Text>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>MONITORING LOCATION</Text>
          <Text style={styles.location}>
            Barangay Santisimo Rosario
          </Text>
          <Text style={styles.locationSub}>
            San Pablo City, Laguna
          </Text>
          <Text style={styles.updated}>Sample data · Not live sensor readings</Text>
        </View>

        <Text style={styles.sectionTitle}>Current Conditions</Text>

        <View style={styles.grid}>
          <WeatherCard
            icon="🌡️"
            label="Temperature"
            value="28.4"
            unit="°C"
          />
          <WeatherCard
            icon="💧"
            label="Humidity"
            value="82"
            unit="%"
          />
          <WeatherCard
            icon="💨"
            label="Wind Speed"
            value="3.2"
            unit="m/s"
          />
          <WeatherCard
            icon="🌧️"
            label="Rainfall"
            value="2.4"
            unit="mm"
          />
        </View>

        <View style={styles.pressureCard}>
          <Text style={styles.pressureLabel}>ATMOSPHERIC PRESSURE</Text>
          <Text style={styles.pressureValue}>1008 hPa</Text>
        </View>

        <Text style={styles.sectionTitle}>Rainfall Forecast</Text>
        <View style={styles.forecastCard}>
          <View style={styles.forecastTop}>
            <Text style={styles.forecastTitle}>Next 3 Hours</Text>
            <Text style={styles.forecastChance}>70% chance</Text>
          </View>
          <Text style={styles.forecastDescription}>
            Sample forecast for interface preview. Predictions will be
            provided by the trained model once integrated.
          </Text>
          <View style={styles.forecastFooter}>
            <Text style={styles.forecastFooterText}>View full forecast</Text>
            <Text style={styles.arrow}>→</Text>
          </View>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Weather station status</Text>
          <Text style={styles.noticeText}>
            Hardware is not connected yet. The readings above are placeholders.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  content: {
    padding: 18,
    paddingTop: 54,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    color: COLORS.green,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tagline: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  locationCard: {
    backgroundColor: COLORS.green,
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },
  locationLabel: {
    color: COLORS.beige,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  location: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  locationSub: {
    color: COLORS.cream,
    fontSize: 12,
    marginTop: 4,
  },
  updated: {
    color: COLORS.beige,
    fontSize: 10,
    marginTop: 12,
  },
  sectionTitle: {
    color: COLORS.green,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 12,
  },
  weatherCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  unit: {
    color: COLORS.text,
    fontSize: 12,
    marginLeft: 3,
  },
  pressureCard: {
    backgroundColor: COLORS.beige,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  pressureLabel: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pressureValue: {
    color: COLORS.green,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 5,
  },
  forecastCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  forecastTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  forecastTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  forecastChance: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '800',
  },
  forecastDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  forecastFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 14,
    paddingTop: 12,
  },
  forecastFooterText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '700',
  },
  arrow: {
    color: COLORS.green,
    fontSize: 20,
  },
  notice: {
    backgroundColor: '#E8E9D8',
    borderRadius: 12,
    padding: 14,
  },
  noticeTitle: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '800',
  },
  noticeText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
});
