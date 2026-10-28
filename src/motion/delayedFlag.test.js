// Запуск: npm test (встроенный node:test, без дополнительных зависимостей).
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createDelayedFlag, LOADER_DELAY_MS } from "./delayedFlag.js";

function setup() {
  mock.timers.enable({ apis: ["setTimeout"] });
  const changes = [];
  const flag = createDelayedFlag({ onChange: (v) => changes.push(v) });
  return { flag, changes };
}

test("порог по умолчанию — 500 мс", () => {
  assert.equal(LOADER_DELAY_MS, 500);
});

test("ожидание 100–400 мс: загрузчик не появляется ни на кадр", (t) => {
  t.after(() => mock.timers.reset());
  for (const ms of [100, 250, 400, 499]) {
    const { flag, changes } = setup();
    flag.update(true);
    mock.timers.tick(ms);
    flag.update(false);
    mock.timers.tick(2000);
    assert.deepEqual(changes, [], `${ms} мс`);
    mock.timers.reset();
  }
});

test("ожидание ~1500 мс: появляется после порога и сразу скрывается при готовности", (t) => {
  t.after(() => mock.timers.reset());
  const { flag, changes } = setup();
  flag.update(true);
  mock.timers.tick(499);
  assert.equal(flag.visible, false);
  mock.timers.tick(1);
  assert.equal(flag.visible, true);
  mock.timers.tick(1000);
  flag.update(false);
  assert.equal(flag.visible, false);
  assert.deepEqual(changes, [true, false]);
});

test("быстрые переходы A → B → C не оставляют зависший индикатор", (t) => {
  t.after(() => mock.timers.reset());
  const { flag, changes } = setup();
  flag.update(true); // A
  mock.timers.tick(200);
  flag.update(false);
  flag.update(true); // B
  mock.timers.tick(200);
  flag.update(false);
  flag.update(true); // C
  mock.timers.tick(300);
  flag.update(false);
  mock.timers.tick(5000);
  assert.deepEqual(changes, []);
});

test("повторный update(true) не перезапускает отсчёт", (t) => {
  t.after(() => mock.timers.reset());
  const { flag } = setup();
  flag.update(true);
  mock.timers.tick(300);
  flag.update(true);
  mock.timers.tick(200);
  assert.equal(flag.visible, true);
});

test("cancel() при размонтировании: таймер больше не срабатывает", (t) => {
  t.after(() => mock.timers.reset());
  const { flag, changes } = setup();
  flag.update(true);
  mock.timers.tick(300);
  flag.cancel();
  mock.timers.tick(5000);
  assert.deepEqual(changes, []);
});

test("после cancel() отсчёт можно начать заново (повторный mount в StrictMode)", (t) => {
  t.after(() => mock.timers.reset());
  const { flag, changes } = setup();
  flag.update(true);
  flag.cancel();
  flag.update(true);
  mock.timers.tick(500);
  assert.deepEqual(changes, [true]);
});
