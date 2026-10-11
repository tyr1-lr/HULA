import { Tabs } from "expo-router";
import {
  House,
  CloudSun,
  ChartNoAxesColumn,
  Clock3,
} from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0F4415",
        tabBarInactiveTintColor: "#929A91",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="forecast"
        options={{
          title: "Forecast",
          tabBarIcon: ({ color, size }) => (
            <CloudSun size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="weather-data"
        options={{
          title: "Weather Data",
          tabBarIcon: ({ color, size }) => (
            <ChartNoAxesColumn size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <Clock3 size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
