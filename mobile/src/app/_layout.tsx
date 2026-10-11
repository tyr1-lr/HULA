import "../../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";

import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NunitoSansRegular: NunitoSans_400Regular,
    NunitoSansMedium: NunitoSans_500Medium,
    NunitoSansSemiBold: NunitoSans_600SemiBold,
    NunitoSansBold: NunitoSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
