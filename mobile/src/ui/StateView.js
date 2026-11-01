import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, space } from "./theme";

export function Loading({ label = "Загружаем…" }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.red} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function Message({ title, text, actionLabel, onAction }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {text ? <Text style={styles.muted}>{text}</Text> : null}
      {onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.xl, gap: space.s },
  title: { fontSize: 18, fontWeight: "600", color: colors.text, textAlign: "center" },
  muted: { fontSize: 14, color: colors.muted, textAlign: "center" },
  button: { marginTop: space.s, borderWidth: 1, borderColor: colors.red, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18 },
  buttonText: { color: colors.red, fontSize: 15, fontWeight: "600" },
});
