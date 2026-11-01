import { Redirect } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { IS_DEMO } from "../lib/backend";
import { useAuth } from "../lib/auth";
import { Loading } from "../ui/StateView";
import { colors, space } from "../ui/theme";

export default function SignInScreen() {
  const { user, ready, signIn, enterDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return <Loading label="Проверяем вход…" />;
  if (user) return <Redirect href="/projects" />;

  async function submit() {
    if (busy) return; // защита от повторного нажатия
    if (!email.trim() || !password) {
      setError("Введите e-mail и пароль.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e?.message === "Invalid login credentials" ? "Неверный e-mail или пароль." : "Не получилось войти. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.brand}>
        <Text style={styles.name}>PAN TERRA</Text>
        <Text style={styles.descriptor}>DESIGN STUDIO</Text>
      </View>
      <Text style={styles.title}>Кабинет заказчика</Text>

      {IS_DEMO ? (
        <>
          <Text style={styles.muted}>База данных не подключена. Можно открыть кабинет с тестовыми проектами.</Text>
          <Pressable accessibilityRole="button" onPress={enterDemo} style={styles.primary}>
            <Text style={styles.primaryText}>Открыть демо-кабинет</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            accessibilityLabel="E-mail"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Пароль"
            secureTextEntry
            autoComplete="current-password"
            accessibilityLabel="Пароль"
            onSubmitEditing={submit}
            style={styles.input}
          />
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <Pressable accessibilityRole="button" accessibilityState={{ busy, disabled: busy }} disabled={busy} onPress={submit} style={[styles.primary, busy && styles.disabled]}>
            <Text style={styles.primaryText}>{busy ? "Входим…" : "Войти"}</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: space.l, justifyContent: "center", gap: space.m, backgroundColor: colors.white },
  brand: { marginBottom: space.l },
  name: { fontSize: 22, fontWeight: "700", letterSpacing: 2, color: colors.text },
  descriptor: { marginTop: 4, fontSize: 10, fontWeight: "700", letterSpacing: 5, color: colors.red },
  title: { fontSize: 28, fontWeight: "600", color: colors.text },
  muted: { fontSize: 15, lineHeight: 22, color: colors.muted },
  form: { gap: space.s },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text },
  error: { color: colors.red, fontSize: 14 },
  primary: { backgroundColor: colors.red, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: space.xs },
  primaryText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.6 },
});
