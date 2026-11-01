import { Redirect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../lib/auth";
import { getMyProject } from "../../lib/backend";
import { formatDate, PROJECT_STAGES, stageInfo, statusLabel } from "../../shared/projectStatus";
import StageBar from "../../ui/StageBar";
import { Loading, Message } from "../../ui/StateView";
import { colors, space } from "../../ui/theme";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams();
  const { user, ready } = useAuth();
  const [state, setState] = useState({ status: "loading", project: null });

  const load = useCallback(async () => {
    if (!user) return;
    setState({ status: "loading", project: null });
    try {
      const project = await getMyProject(user, String(id));
      setState({ status: project ? "ready" : "missing", project });
    } catch {
      setState({ status: "error", project: null });
    }
  }, [user, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!ready) return <Loading />;
  if (!user) return <Redirect href="/" />;
  if (state.status === "loading") return <Loading label="Загружаем проект…" />;
  if (state.status === "error") return <Message title="Не получилось загрузить проект" text="Проверьте подключение к интернету." actionLabel="Повторить" onAction={load} />;
  if (state.status === "missing") return <Message title="Проект не найден" text="Возможно, он недоступен для вашего аккаунта." />;

  const { project } = state;
  const stage = stageInfo(project.stage);
  const due = formatDate(project.due_date);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.eyebrow}>{statusLabel(project.external_status)}</Text>
      <Text style={styles.title}>{project.title}</Text>

      <View style={styles.block}>
        <Text style={styles.label}>Этап</Text>
        <Text style={styles.value}>{stage.number ? `${stage.number} из ${stage.total} — ${stage.title}` : stage.title}</Text>
        <StageBar progress={stage.progress} />
        <View style={styles.steps}>
          {PROJECT_STAGES.map((title, i) => (
            <Text key={title} style={[styles.step, stage.number && i + 1 <= stage.number && styles.stepDone]}>
              {i + 1}. {title}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Следующий шаг</Text>
        <Text style={styles.value}>{project.next_step || "Студия сообщит о следующем шаге."}</Text>
      </View>

      {due ? (
        <View style={styles.block}>
          <Text style={styles.label}>Срок</Text>
          <Text style={styles.value}>{due}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: space.l, gap: space.l },
  eyebrow: { color: colors.red, fontSize: 12, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  title: { fontSize: 28, fontWeight: "600", color: colors.text, marginTop: -space.s },
  block: { gap: space.xs, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: space.m },
  label: { fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 1 },
  value: { fontSize: 16, lineHeight: 23, color: colors.text },
  steps: { marginTop: space.s, gap: 4 },
  step: { fontSize: 14, color: colors.muted },
  stepDone: { color: colors.text },
});
