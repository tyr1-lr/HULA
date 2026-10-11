import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import {
  AlertTriangle,
  ChevronRight,
  CircleGauge,
  Cloud,
  CloudRainWind,
  Droplet,
  MapPin,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react-native";

import { HORIZONS, type Num } from "@/api/types";
import { useForecast, useLatestReading } from "@/hooks/use-hula-data";

function OpenMapButton() {
  const openMap = () => {
    const location = "Santisimo Rosario, San Pablo City, Laguna";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    Linking.openURL(url);
  };

  return (
    <Pressable
      onPress={openMap}
      accessibilityRole="button"
      accessibilityLabel="Open monitoring location in Google Maps"
    >
      <ChevronRight size={35} color="#E2D7AB" />
    </Pressable>
  );
}

function display(value: Num | undefined, digits: number, unit: string) {
  return value == null ? "—" : `${value.toFixed(digits)}${unit}`;
}

function getTrend(change: Num | undefined, unit: string) {
  if (change == null) {
    return { arrow: "—", text: "No trend data", color: "text-gray-400" };
  }
  if (Math.abs(change) < 0.05) {
    return { arrow: "→", text: `0.0 ${unit} (1h)`, color: "text-gray-500" };
  }
  return {
    arrow: change > 0 ? "↑" : "↓",
    text: `${Math.abs(change).toFixed(1)} ${unit} (1h)`,
    color: change > 0 ? "text-orange-600" : "text-blue-600",
  };
}

export default function HomeScreen() {
  const latest = useLatestReading();
  const forecast = useForecast();
  const weather = latest.data;
  const forecastData = forecast.data;

  const timestamp = weather?.recordedAt ? new Date(weather.recordedAt) : null;
  const validTimestamp =
    timestamp && !Number.isNaN(timestamp.getTime()) ? timestamp : null;
  const date = validTimestamp?.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = validTimestamp?.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const temperatureTrend = getTrend(weather?.change.temperature, "°C");
  const humidityTrend = getTrend(weather?.change.humidity, "%");
  const windSpeedTrend = getTrend(weather?.change.windSpeed, "m/s");
  const pressureTrend = getTrend(weather?.change.pressure, "hPa");

  const condition = forecastData?.condition;
  const advisory = forecastData?.advisory;

  return (
    <View className="flex-1 bg-hula-cream">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-4 pt-4 pb-8">
          <Text className="text-5xl text-hula-green font-nunito-bold">
            HULA
          </Text>
          <Text className="text-xs text-hula-green font-nunito-bold">
            Hatid na Ulat sa Lagay ng Agrikultura
          </Text>
        </View>

        <View className="flex-row mx-4 rounded-2xl bg-hula-green p-4 px-4 gap-2">
          <View className="justify-center">
            <MapPin size={35} color="#E2D7AB" />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-hula-beige font-nunito-bold">
              MONITORING LOCATION
            </Text>
            <Text className="mt-1 text-lg text-white font-nunito-bold">
              Barangay Santisimo Rosario
            </Text>
            <Text className="text-sm text-hula-cream font-nunito">
              San Pablo City, Laguna
            </Text>
          </View>
          <View className="justify-center">
            <OpenMapButton />
          </View>
        </View>

        <View className="w-full px-4 mt-4 flex-row items-center">
          <Text className="text-lg text-hula-green font-nunito-bold">
            Current Conditions
          </Text>
          <Text className="ml-auto text-right text-xs text-hula-green font-nunito">
            {validTimestamp ? `${date} · ${time}` : "No reading yet"}
          </Text>
        </View>

        <View className="mx-4 mt-4 flex-row flex-wrap justify-between gap-y-3">
          <View className="flex-row w-[48%] rounded-xl bg-white p-4 px-4 gap-2">
            <View className="justify-center">
              <Thermometer size={40} color="#c43a2d" />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-xs text-hula-green font-nunito">
                Temperature
              </Text>
              <Text
                className="text-2xl font-nunito-bold"
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {display(weather?.temperature, 1, "°C")}
              </Text>
              <Text
                className={`text-xs font-nunito-medium ${temperatureTrend.color}`}
              >
                {temperatureTrend.arrow} {temperatureTrend.text}
              </Text>
            </View>
          </View>

          <View className="flex-row w-[48%] rounded-xl bg-white p-4 px-4 gap-2">
            <View className="justify-center">
              <Droplet size={40} color="#2d8fc4" />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-xs text-hula-green font-nunito">
                Humidity
              </Text>
              <Text
                className="text-2xl font-nunito-bold"
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {display(weather?.humidity, 1, "%")}
              </Text>
              <Text
                className={`text-xs font-nunito-medium ${humidityTrend.color}`}
              >
                {humidityTrend.arrow} {humidityTrend.text}
              </Text>
            </View>
          </View>

          <View className="flex-row w-[48%] rounded-xl bg-white p-4 px-4 gap-2">
            <View className="justify-center">
              <Wind size={40} color="#3ac42d" />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-xs text-hula-green font-nunito">
                Wind Speed
              </Text>
              <Text
                className="text-2xl font-nunito-bold"
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {display(weather?.windSpeed, 1, " m/s")}
              </Text>
              <Text
                className={`text-xs font-nunito-medium ${windSpeedTrend.color}`}
              >
                {windSpeedTrend.arrow} {windSpeedTrend.text}
              </Text>
            </View>
          </View>

          <View className="flex-row w-[48%] rounded-xl bg-white p-4 px-4 gap-2">
            <View className="justify-center">
              <CloudRainWind size={40} color="#18597c" />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-xs text-hula-green font-nunito">
                Rainfall
              </Text>
              <Text
                className="text-2xl font-nunito-bold"
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {display(weather?.rainfall, 1, " mm")}
              </Text>
              <Text className="text-xs text-hula-green font-nunito-medium">
                Latest interval
              </Text>
            </View>
          </View>

          <View className="w-full flex-row rounded-2xl p-4 bg-[#e1e8c9] px-4 gap-4">
            <View className="justify-center">
              <CircleGauge size={35} color="#135a28" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-hula-green font-nunito-bold">
                Atmospheric Pressure
              </Text>
              <Text className="text-2xl text-hula-green font-nunito-bold">
                {display(weather?.pressure, 1, " hPa")}
              </Text>
              <Text
                className={`text-xs font-nunito-medium ${pressureTrend.color}`}
              >
                {pressureTrend.arrow} {pressureTrend.text}
              </Text>
            </View>
          </View>

          <View className="w-full flex-row items-center gap-4 rounded-2xl bg-white p-4">
            <View className="h-14 w-16">
              <View className="absolute left-5 top-0">
                <Sun size={35} color="#FACC15" strokeWidth={2.5} />
              </View>
              <View className="absolute bottom-0 left-0">
                <Cloud
                  size={45}
                  color="#FFFFFF"
                  fill="#75BCE5"
                  strokeWidth={2}
                />
              </View>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-xs text-hula-green font-nunito-bold">
                Overall Field Conditions
              </Text>
              <Text className="text-xl text-hula-green font-nunito-bold">
                {condition?.title ?? "Unavailable"}
              </Text>
              <Text className="text-sm text-hula-green font-nunito">
                {condition?.note ?? "No field condition data available."}
              </Text>
              <Text className="mt-1 text-xs text-hula-green font-nunito">
                Light: —
              </Text>
            </View>
          </View>

          <View className="w-full gap-3">
            <Text className="text-lg text-hula-green font-nunito-bold">
              Next Rainfall Forecast
            </Text>
            <View className="flex-row justify-between gap-2">
              {HORIZONS.map((hours) => {
                const point = forecastData?.points.find(
                  (p) => p.hours === hours,
                );
                return (
                  <View
                    key={hours}
                    className="flex-1 items-center gap-2 rounded-xl bg-white p-3"
                  >
                    <Text className="text-sm text-hula-green font-nunito-bold">
                      Next {hours}h
                    </Text>
                    <CloudRainWind size={28} color="#18597c" />
                    <Text className="text-xl text-hula-green font-nunito-bold">
                      {point?.rainChance == null
                        ? "—"
                        : `${Math.round(point.rainChance)}%`}
                    </Text>
                    <Text className="text-center text-xs text-gray-500 font-nunito">
                      Rain chance
                    </Text>
                    <Text className="text-xs text-hula-green font-nunito-medium">
                      {display(point?.rainfall, 1, " mm")}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View className="w-full gap-3">
            <Text className="text-lg text-hula-green font-nunito-bold">
              Farmer Advisory
            </Text>
            <View className="w-full flex-row gap-4 rounded-2xl bg-[#EBE3C1] p-4">
              <View className="justify-center">
                <AlertTriangle size={35} color="#73511d" />
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-base text-[#875514] font-nunito-bold">
                  Farmer Advisory
                </Text>
                <Text className="text-sm leading-5 text-[#875514] font-nunito">
                  {advisory ?? "No advisory available."}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
