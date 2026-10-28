---
name: studio-next
description: "Выполняет одну самую приоритетную готовую задачу backlog PAN TERRA целиком: реализация, проверки, коммит, отчёт."
argument-hint: "[ID задачи — необязательно]"
---

# /studio-next — одна задача целиком

## Старт (обязательно, каждый запуск)
1. Прочитай `CLAUDE.md`, `docs/autopilot/STATE.json`, `docs/autopilot/BACKLOG.md`, `docs/autopilot/BLOCKERS.md`.
2. Сверь состояние с git: `git status`, `git branch --show-current`, `git log --oneline -5`, `git fetch origin claude/studio-autopilot` и сравни `origin/claude/studio-autopilot` с `last_verified_sha`. Если расходятся — сначала восстанови факты в STATE.json, потом работай.
3. Если `paused: true` — не меняй продукт: сообщи о паузе и заверши запуск.
4. Не перезаписывай чужие незафиксированные изменения (`git status` / `git diff`).

## Шаги
1. Если передан ID (`$ARGUMENTS`) — возьми его (если он не `blocked` и не требует решения Марьям). Иначе — самую приоритетную `ready` задачу с выполненными зависимостями.
2. Выполни её полностью по циклу из `/studio-auto` (реализация → проверки → критерии приёмки).
3. После двух неудачных исправлений — `blocked` с диагностикой.

## Делегирование
Специалисты — проектные subagents из `.claude/agents/`. Передавай: ID задачи, цель, критерии приёмки, базовый SHA (`git rev-parse HEAD`), разрешённые файлы, зависимости, ограничения. Не больше двух одновременно и только для независимых задач. По умолчанию исполнители работают последовательно в одной ветке (см. DECISIONS.md D-004). Если агенты не зарегистрированы в этой сессии — выполняй задачу основной сессией, не имитируя вызов.

## Завершение
- Обнови `docs/autopilot/BACKLOG.md` (статусы), `STATE.json` (last_verified_sha, active_task, completed, pending_checks, next_step, last_run), `REPORT.md`, при необходимости `BLOCKERS.md`, `DECISIONS.md`, раздел «Изменения» в `PROJECT_STATUS.md`.
- Commit в `claude/studio-autopilot` с понятным сообщением. Перед push: `git fetch origin claude/studio-autopilot`; если удалённая ветка ушла вперёд — не перезаписывай: сохрани свою работу в ветке `claude/studio-autopilot-conflict-<дата>`, запиши конфликт в BLOCKERS.md и заверши. Обычный `git push -u origin claude/studio-autopilot`, без force.
- Итог Марьям по-русски, на «ты», коротко: что изменилось для пользователя; где посмотреть; чем проверено; что заблокировано; следующая задача.
