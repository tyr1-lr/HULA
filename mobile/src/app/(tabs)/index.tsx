import { ScrollView, Text, View, Linking, Pressable } from "react-native";
import {
  MapPin,
  ChevronRight,
  Thermometer,
  Droplet,
  Wind,
  CloudRainWind,
  CircleGauge,
  CloudSun,
  Cloud,
  Sun,
  AlertTriangle,
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

type FieldCondition = {
  condition: string;
  description: string;
  lightIntensity: number | null;
};

type RainfallForecast = {
  hoursAhead: number;
  rainProbability: number;
  expectedRainfall: number;
};

type FarmerAdvisory = {
  level: "low" | "moderate" | "high";
  title: string;
  message: string;
};

const sampleFieldCondition: FieldCondition = {
  condition: "Partly Cloudy",
  description: "Some cloud cover with periods of sunlight.",
  lightIntensity: 18500,
};

const sampleForecasts: RainfallForecast[] = [
  {
    hoursAhead: 1,
    rainProbability: 20,
    expectedRainfall: 0.0,
  },
  {
    hoursAhead: 3,
    rainProbability: 65,
    expectedRainfall: 2.4,
  },
  {
    hoursAhead: 6,
    rainProbability: 80,
    expectedRainfall: 5.2,
  },
];

const sampleAdvisory: FarmerAdvisory = {
  level: "moderate",
  title: "Rainfall Expected",
  message:
    "Rainfall may occur within the next 3 hours. Consider postponing pesticide application and monitor field conditions.",
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
  const fieldCondition = sampleFieldCondition;
  const forecasts = sampleForecasts;
  const advisory = sampleAdvisory;
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

  const pressureTrend = getTrend(
    weather.pressure,
    weather.previousHour.pressure,
    "hPa",
  );

  return (
    <View className="flex-1 bg-hula-cream">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
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

          <View className="w-full flex-row rounded-2xl p-4 bg-[#e1e8c9] px-4 gap-4">
            <View className="flex justify-center align-center">
              <CircleGauge size={35} color="#135a28" />
            </View>

            <View>
              <Text className="text-xs font-bold text-hula-green">
                Atmospheric Pressure
              </Text>

              <Text className="text-2xl font-bold text-hula-green">
                {weather.pressure !== null
                  ? `${weather.pressure.toFixed(1)} hPa`
                  : "--"}
              </Text>

              <Text className={`text-xs font-medium ${pressureTrend.color}`}>
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

            <View className="flex-1 gap-1 ">
              <Text className="text-xs font-bold text-hula-green">
                OVERALL FIELD CONDITION
              </Text>

              <Text className="text-xl font-bold text-hula-green">
                {fieldCondition.condition}
              </Text>

              <Text className="text-sm text-hula-green">
                {fieldCondition.description}
              </Text>

              <Text className="mt-1 text-xs text-hula-green">
                Light:{" "}
                {fieldCondition.lightIntensity !== null
                  ? `${fieldCondition.lightIntensity.toLocaleString()} lux`
                  : "--"}
              </Text>
            </View>
          </View>

          <View className="w-full gap-3">
            <Text className="text-lg font-bold text-hula-green">
              Next Rainfall Forecast
            </Text>

            <View className="flex-row justify-between gap-2">
              {forecasts.map((forecast) => (
                <View
                  key={forecast.hoursAhead}
                  className="flex-1 items-center gap-2 rounded-xl bg-white p-3"
                >
                  <Text className="text-sm font-bold text-hula-green">
                    Next {forecast.hoursAhead}h
                  </Text>

                  <CloudRainWind size={28} color="#18597c" />

                  <Text className="text-xl font-bold text-hula-green">
                    {forecast.rainProbability}%
                  </Text>

                  <Text className="text-center text-xs text-gray-500">
                    Rain chance
                  </Text>

                  <Text className="text-xs font-medium text-hula-green">
                    {forecast.expectedRainfall.toFixed(1)} mm
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="w-full gap-3">
            <Text className="text-lg font-bold text-hula-green">
              Farmer Advisory
            </Text>

            <View className="flex-row gap-3 rounded-2xl bg-[#EBE3C1] p-4 gap-4">
              <View className="flex justify-center align-center">
                <AlertTriangle size={35} color="#73511d" />
              </View>

              <View className="flex-1 gap-2">
                <Text className="text-base font-bold text-[#875514]">
                  {advisory.title}
                </Text>

                <Text className="text-sm leading-5 text-[#875514]">
                  {advisory.message}
                </Text>

                <Text className="text-xs font-medium text-[#B7791F]">
                  {advisory.level.toUpperCase()} ADVISORY
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
