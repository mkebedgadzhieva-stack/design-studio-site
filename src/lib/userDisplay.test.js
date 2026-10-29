import { test } from "node:test";
import assert from "node:assert/strict";
import { getDisplayName, getInitial } from "./userDisplay.js";

test("имя из регистрации по e-mail (display_name)", () => {
  assert.equal(
    getDisplayName({ email: "anna@example.test", user_metadata: { display_name: "Анна Петрова" } }),
    "Анна Петрова"
  );
});

test("имя из Google (full_name, name)", () => {
  assert.equal(getDisplayName({ user_metadata: { full_name: "Ivan Ivanov" } }), "Ivan Ivanov");
  assert.equal(getDisplayName({ user_metadata: { name: "Олег" } }), "Олег");
});

test("имя из first_name + last_name, если display_name пустой", () => {
  assert.equal(
    getDisplayName({ user_metadata: { display_name: "  ", first_name: "Мария", last_name: " Ким " } }),
    "Мария Ким"
  );
});

test("без имени — e-mail; без пользователя — пустая строка", () => {
  assert.equal(getDisplayName({ email: "client@example.test", user_metadata: {} }), "client@example.test");
  assert.equal(getDisplayName(null), "");
});

test("инициал — первая буква в верхнем регистре, иначе точка", () => {
  assert.equal(getInitial("анна"), "А");
  assert.equal(getInitial("client@example.test"), "C");
  assert.equal(getInitial("  «Ёлка»"), "Ё");
  assert.equal(getInitial(""), "•");
});
