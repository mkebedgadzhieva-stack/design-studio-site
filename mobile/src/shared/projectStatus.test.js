import { test } from "node:test";
import assert from "node:assert/strict";
import { stageInfo, statusLabel, formatDate } from "./projectStatus.js";

test("этап 1–6 → название и прогресс", () => {
  assert.deepEqual(stageInfo(3), { number: 3, total: 6, title: "Разработка концепции", progress: 0.5 });
  assert.equal(stageInfo("6").title, "Финальные файлы / проект завершён");
});

test("неизвестный этап не роняет экран", () => {
  for (const v of [null, undefined, 0, 7, "x", 2.5]) assert.equal(stageInfo(v).number, null);
});

test("статус для клиента", () => {
  assert.equal(statusLabel("approval"), "На согласовании");
  assert.equal(statusLabel("rework"), "Статус уточняется"); // внутренний статус клиенту не показываем
});

test("дата по-русски; пустая и битая — null", () => {
  assert.match(formatDate("2026-11-20"), /20 ноября 2026/);
  assert.equal(formatDate(""), null);
  assert.equal(formatDate("not-a-date"), null);
});
