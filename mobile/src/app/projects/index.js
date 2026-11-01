import { Link, Redirect, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../lib/auth";
import { listMyProjects } from "../../lib/backend";
import { formatDate, stageInfo, statusLabel } from "../../shared/projectStatus";
import StageBar from "../../ui/StageBar";
import { Loading, Message } from "../../ui/StateView";
import { colors, space } from "../../ui/theme";

export default function ProjectsScreen() {
  const { user, ready, signOut } = useAuth();
  const [state, setState] = useState({ status: "loading", projects: [] });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const projects = await listMyProjects(user);
      setState({ status: "ready", projects });
    } catch {
      setState({ status: "error", projects: [] });
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!ready) return <Loading />;
  if (!user) return <Redirect href="/" />;

  const header = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <Pressable accessibilityRole="button" onPress={signOut} hitSlop={10} style={styles.signOutButton}>
            <Text style={styles.signOut}>Выйти</Text>
          </Pressable>
        ),
      }}
    />
  );

  if (state.status === "loading") return <>{header}<Loading label="Загружаем проекты…" /></>;
  if (state.status === "error") {
    return (
      <>
        {header}
        <Message
          title="Не получилось загрузить проекты"
          text="Проверьте подключение к интернету."
          actionLabel="Повторить"
          onAction={() => {
            setState({ status: "loading", projects: [] });
            load();
          }}
        />
      </>
    );
  }

  return (
    <>
      {header}
      <FlatList
        data={state.projects}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={state.projects.length ? styles.list : styles.emptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={<Message title="Проектов пока нет" text="Когда студия заведёт ваш проект, он появится здесь." />}
        renderItem={({ item }) => <ProjectRow project={item} />}
      />
    </>
  );
}

function ProjectRow({ project }) {
  const stage = stageInfo(project.stage);
  const due = formatDate(project.due_date);
  return (
    <Link href={{ pathname: "/projects/[id]", params: { id: String(project.id) } }} asChild>
      <Pressable accessibilityRole="link" style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardTitle} numberOfLines={2}>{project.title}</Text>
          <Text style={styles.status}>{statusLabel(project.external_status)}</Text>
        </View>
        <Text style={styles.stage}>
          {stage.number ? `Этап ${stage.number} из ${stage.total}: ` : ""}
          {stage.title}
        </Text>
        <StageBar progress={stage.progress} />
        {due ? <Text style={styles.due}>Срок: {due}</Text> : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.m, gap: space.s },
  emptyList: { flexGrow: 1 },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: space.m, gap: space.s, backgroundColor: colors.white },
  row: { flexDirection: "row", justifyContent: "space-between", gap: space.s },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "600", color: colors.text },
  status: { fontSize: 12, color: colors.red, fontWeight: "600" },
  stage: { fontSize: 14, color: colors.muted },
  due: { fontSize: 13, color: colors.muted },
  signOut: { color: colors.muted, fontSize: 15 },
  // в веб-режиме у заголовка нет правого отступа — добавляем свой
  signOutButton: { marginRight: Platform.OS === "web" ? space.m : 0 },
});
