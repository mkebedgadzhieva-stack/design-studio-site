// Те же этапы и статусы, что в веб-кабинете:
// src/data/statuses.js (EXTERNAL_STATUSES) и src/pages/cabinet/ProjectsAdmin.jsx (PROJECT_STAGES).
// При изменении — синхронизировать с сайтом.
export const PROJECT_STAGES = [
  "Бриф и материалы",
  "Предоплата и старт",
  "Разработка концепции",
  "Согласование",
  "Правки и финализация",
  "Финальные файлы / проект завершён",
];

export const EXTERNAL_STATUSES = {
  queued: "В очереди",
  accepted: "Принят в работу",
  in_progress: "В процессе",
  approval: "На согласовании",
  completed: "Завершён",
};

// stage в базе — 1…6. Неизвестное значение не роняет экран.
export function stageInfo(stage) {
  const n = Number(stage);
  if (!Number.isInteger(n) || n < 1 || n > PROJECT_STAGES.length) {
    return { number: null, total: PROJECT_STAGES.length, title: "Этап не указан", progress: 0 };
  }
  return { number: n, total: PROJECT_STAGES.length, title: PROJECT_STAGES[n - 1], progress: n / PROJECT_STAGES.length };
}

export function statusLabel(status) {
  return EXTERNAL_STATUSES[status] || "Статус уточняется";
}

export function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
