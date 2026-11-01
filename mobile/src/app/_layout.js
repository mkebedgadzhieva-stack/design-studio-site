import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../lib/auth";
import DemoBanner from "../ui/DemoBanner";
import { colors } from "../ui/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.white }}>
          <StatusBar style="dark" />
          <DemoBanner />
          <Stack
            screenOptions={{
              headerTintColor: colors.text,
              headerTitleStyle: { fontWeight: "600" },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.white },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="projects/index" options={{ title: "Мои проекты" }} />
            <Stack.Screen name="projects/[id]" options={{ title: "Проект" }} />
          </Stack>
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
