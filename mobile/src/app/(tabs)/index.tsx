import { ScrollView, Text, View, Linking, Pressable } from "react-native";
import {
  MapPin,
  ChevronRight,
  Thermometer,
  Droplet,
  Wind,
  CloudRainWind,
} from "lucide-react-native";

function OpenMapButton() {
  const openMap = () => {
    const location = "Santisimo Rosario, San Pablo City, Laguna";

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

    Linking.openURL(url);
  };

  return (
    <Pressable onPress={openMap}>
      <ChevronRight size={35} color="#E2D7AB" />
    </Pressable>
  );
}

type WeatherData = {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  rainfall: number | null;
  rainfallIntervalMinutes: number;
  pressure: number | null;
  recordedAt: string | null;

  previousHour: {
    temperature: number | null;
    humidity: number | null;
    windSpeed: number | null;
    pressure: number | null;
  };
};

const sampleWeather: WeatherData = {
  temperature: 28.4,
  humidity: 82,
  windSpeed: 3.2,
  rainfall: 0,
  rainfallIntervalMinutes: 10,
  pressure: 1008,
  recordedAt: "2026-10-11T09:40:00+08:00",

  previousHour: {
    temperature: 28.1,
    humidity: 80,
    windSpeed: 3.2,
    pressure: 1007,
  },
};

function getTrend(
  current: number | null,
  previous: number | null,
  unit: string,
) {
  if (current === null || previous === null) {
    return {
      arrow: "—",
      text: "No trend data",
      color: "text-gray-400",
    };
  }

  const difference = current - previous;

  if (Math.abs(difference) < 0.05) {
    return {
      arrow: "→",
      text: `0.0 ${unit} (1h)`,
      color: "text-gray-500",
    };
  }

  return {
    arrow: difference > 0 ? "↑" : "↓",
    text: `${Math.abs(difference).toFixed(1)} ${unit} (1h)`,
    color: difference > 0 ? "text-orange-600" : "text-blue-600",
  };
}

export default function HomeScreen() {
  const weather = sampleWeather;
  const now = new Date();

  const date = now.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const time = now.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const temperatureTrend = getTrend(
    weather.temperature,
    weather.previousHour.temperature,
    "°C",
  );

  const humidityTrend = getTrend(
    weather.humidity,
    weather.previousHour.humidity,
    "%",
  );

  const windSpeedTrend = getTrend(
    weather.windSpeed,
    weather.previousHour.windSpeed,
    "m/s",
  );

  return (
    <View className="flex-1 bg-hula-cream">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4 pb-8">
          <Text className="text-5xl font-bold text-hula-green">HULA</Text>
          <Text className="text-xs font-bold text-hula-green">
            Hatid na Ulat sa Lagay ng Agrikultura
          </Text>
        </View>

        <View className="flex-row mx-4 rounded-2xl bg-hula-green p-4 px-4 gap-2">
          <View className="flex justify-center align-center">
            <MapPin size={35} color="#E2D7AB" />
          </View>

          <View>
            <Text className="text-xs font-bold text-hula-beige">
              MONITORING LOCATION
            </Text>

            <Text className="mt-1 text-lg font-bold text-white">
              Barangay Santisimo Rosario
            </Text>

            <Text className="text-sm text-hula-cream">
              San Pablo City, Laguna
            </Text>
          </View>

          <View className="ml-auto justify-center">
            <OpenMapButton />
          </View>
        </View>

        <View className="w-full px-4 mt-4 flex-row items-center">
          <Text className="text-lg font-bold text-hula-green">
            Current Conditions
          </Text>

          <Text className="ml-auto text-right text-xs text-hula-green">
            {date} · {time}
          </Text>
        </View>

        <View className="mx-4 mt-4 flex-row flex-wrap justify-between gap-y-3">
          <View className="flex-row w-[48%] rounded-xl bg-white p-4 px-4 gap-2">
            <View className="justify-center">
              <Thermometer size={40} color="#c43a2d" />
            </View>
            <View className="gap-2">
              <Text className="text-xs text-hula-green">Temperature</Text>
              <Text className="text-2xl font-bold text-hula-green">
                {weather.temperature !== null
                  ? `${weather.temperature.toFixed(1)}°C`
                  : "--"}
              </Text>

              <Text className={`text-xs font-medium ${temperatureTrend.color}`}>
                {temperatureTrend.arrow} {temperatureTrend.text}
              </Text>
            </View>
          </View>

          <View className="flex-row w-[48%] rounded-xl bg-white p-4 px-4 gap-2">
            <View className="justify-center">
              <Droplet size={40} color="#2d8fc4" />
            </View>
            <View className="gap-2">
              <Text className="text-xs text-hula-green">Humidity</Text>
              <Text className="text-2xl font-bold text-hula-green">
                {weather.humidity !== null
                  ? `${weather.humidity.toFixed(1)}%`
                  : "--"}
              </Text>

              <Text className={`text-xs font-medium ${humidityTrend.color}`}>
                {humidityTrend.arrow} {humidityTrend.text}
              </Text>
            </View>
          </View>

          <View className="flex-row w-[48%] rounded-xl bg-white p-4 px-4 gap-2">
            <View className="justify-center">
              <Wind size={40} color="#3ac42d" />
            </View>
            <View className="gap-2">
              <Text className="text-xs text-hula-green">Wind Speed</Text>
              <Text className="text-2xl font-bold text-hula-green">
                {weather.windSpeed !== null
                  ? `${weather.windSpeed.toFixed(1)} m/s`
                  : "--"}
              </Text>

              <Text className={`text-xs font-medium ${windSpeedTrend.color}`}>
                {windSpeedTrend.arrow} {windSpeedTrend.text}
              </Text>
            </View>
          </View>

          <View className="flex-row w-[48%] rounded-xl bg-white p-4 px-4 gap-2">
            <View className="justify-center">
              <CloudRainWind size={40} color="#18597c" />
            </View>
            <View className="gap-2">
              <Text className="text-xs text-hula-green">Rainfall</Text>
              <Text className="text-2xl font-bold text-hula-green">
                {weather.rainfall !== null
                  ? `${weather.rainfall.toFixed(1)} mm`
                  : "--"}
              </Text>

              <Text className="text-xs font-medium">
                Last {weather.rainfallIntervalMinutes} min
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
