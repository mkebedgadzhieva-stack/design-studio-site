// src/data/statuses.js
export const INTERNAL_STATUSES = {
  queued: "В очереди",
  reviewing: "На рассмотрении",
  accepted: "Принят в работу",
  in_progress: "В процессе",
  on_hold: "На паузе",
  rework: "Требует доработки",
  completed: "Завершён",
  cancelled: "Отменён",
};

export const EXTERNAL_STATUSES = {
  queued: "В очереди",
  accepted: "Принят в работу",
  in_progress: "В процессе",
  approval: "На согласовании",
  completed: "Завершён",
};
