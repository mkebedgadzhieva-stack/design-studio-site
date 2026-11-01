import { StyleSheet, View } from "react-native";
import { colors } from "./theme";

export default function StageBar({ progress }) {
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
      <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: "hidden" },
  fill: { height: 6, backgroundColor: colors.red },
});
