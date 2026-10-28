---
name: studio-mobile
description: "Выполняет одну законченную задачу мобильного приложения PAN TERRA (Android/iOS). Если приложения нет — начинает с минимального рабочего каркаса (React Native + Expo в mobile/) и сценария входа и списка своих проектов."
argument-hint: "[ID задачи MOB-* — необязательно]"
---

# /studio-mobile — одна мобильная задача

## Старт (обязательно, каждый запуск)
1. Прочитай `CLAUDE.md`, `docs/autopilot/STATE.json`, `docs/autopilot/BACKLOG.md`, `docs/autopilot/BLOCKERS.md`.
2. Сверь состояние с git: `git status`, `git branch --show-current`, `git log --oneline -5`, `git fetch origin claude/studio-autopilot` и сравни `origin/claude/studio-autopilot` с `last_verified_sha`. Если расходятся — сначала восстанови факты в STATE.json, потом работай.
3. Если `paused: true` — не меняй продукт: сообщи о паузе и заверши запуск.
4. Не перезаписывай чужие незафиксированные изменения (`git status` / `git diff`).

## Шаги
1. Проверь, есть ли `mobile/`. Если нет — бери `MOB-01` (каркас + вход + список/карточка своего проекта).
2. Передай задачу mobile-engineer (или выполни основной сессией), с базовым SHA и разрешёнными файлами `mobile/**`.
3. Проверка: запуск на фактически доступной платформе. Expo web ≠ Android/iOS — записывай, что проверено на самом деле. Mock backend — только с явной пометкой в приложении и отчёте.
4. Сетевые ограничения (npm registry, Expo) — blocker с точной ошибкой.

## Завершение
- Обнови `docs/autopilot/BACKLOG.md` (статусы), `STATE.json` (last_verified_sha, active_task, completed, pending_checks, next_step, last_run), `REPORT.md`, при необходимости `BLOCKERS.md`, `DECISIONS.md`, раздел «Изменения» в `PROJECT_STATUS.md`.
- Commit в `claude/studio-autopilot` с понятным сообщением. Перед push: `git fetch origin claude/studio-autopilot`; если удалённая ветка ушла вперёд — не перезаписывай: сохрани свою работу в ветке `claude/studio-autopilot-conflict-<дата>`, запиши конфликт в BLOCKERS.md и заверши. Обычный `git push -u origin claude/studio-autopilot`, без force.
- Итог Марьям по-русски, на «ты», коротко: что изменилось для пользователя; где посмотреть; чем проверено; что заблокировано; следующая задача.
