import { StyleSheet, Text, View } from "react-native";
import { IS_DEMO } from "../lib/backend";
import { colors } from "./theme";

// Явная пометка: база не подключена, данные тестовые.
export default function DemoBanner() {
  if (!IS_DEMO) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>Демо-режим: база не подключена, данные тестовые</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.text, paddingVertical: 6, paddingHorizontal: 16 },
  text: { color: colors.white, fontSize: 12, textAlign: "center" },
});
