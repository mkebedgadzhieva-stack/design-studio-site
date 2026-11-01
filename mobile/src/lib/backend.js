import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Тот же Supabase, что у сайта: только публичный anon-ключ, доступ ограничивает RLS
// на сервере. service_role в приложение не попадает никогда.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Без ключей приложение работает в демо-режиме: тестовые данные, явная плашка.
export const IS_DEMO = !url || !anonKey;

export const supabase = IS_DEMO
  ? null
  : createClient(url, anonKey, {
      auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });

// Демо-данные — вымышленные и помечены «Демо», не клиенты студии.
const DEMO_USER = { id: "demo-client", email: "demo@example.test" };
const DEMO_PROJECTS = [
  { id: "demo-1", title: "Демо: айдентика", stage: 3, external_status: "in_progress", next_step: "Студия готовит концепции логотипа", due_date: "2026-11-20", client_id: DEMO_USER.id },
  { id: "demo-2", title: "Демо: упаковка", stage: 4, external_status: "approval", next_step: "Согласовать макет этикетки", due_date: "2026-12-05", client_id: DEMO_USER.id },
  { id: "demo-3", title: "Демо: визитки", stage: 6, external_status: "completed", next_step: null, due_date: "2026-10-15", client_id: DEMO_USER.id },
];

const PROJECT_FIELDS = "id, title, stage, external_status, next_step, due_date, created_at";

export async function getSessionUser() {
  if (IS_DEMO) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user ?? null;
}

export async function signIn(email, password) {
  if (IS_DEMO) throw new Error("В демо-режиме вход по паролю отключён.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export function demoUser() {
  return DEMO_USER;
}

export async function signOut() {
  if (!IS_DEMO) await supabase.auth.signOut();
}

// Только свои проекты: фильтр по client_id, как в веб-кабинете (ClientDashboard).
export async function listMyProjects(user) {
  if (IS_DEMO) return DEMO_PROJECTS.filter((p) => p.client_id === user.id);
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_FIELDS)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getMyProject(user, id) {
  if (IS_DEMO) return DEMO_PROJECTS.find((p) => p.id === id && p.client_id === user.id) ?? null;
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_FIELDS)
    .eq("id", id)
    .eq("client_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
