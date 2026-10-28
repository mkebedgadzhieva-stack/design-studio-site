---
name: studio-audit
description: "Аудит проекта PAN TERRA: проверяет состояние репозитория, сборку, линтер, тесты и ключевые сценарии, воспроизводит проблемы и обновляет backlog. Не начинает редизайн."
argument-hint: "[область: all|web|cabinet|security|motion|mobile]"
---

# /studio-audit — аудит и обновление backlog

## Старт (обязательно, каждый запуск)
1. Прочитай `CLAUDE.md`, `docs/autopilot/STATE.json`, `docs/autopilot/BACKLOG.md`, `docs/autopilot/BLOCKERS.md`.
2. Сверь состояние с git: `git status`, `git branch --show-current`, `git log --oneline -5`, `git fetch origin claude/studio-autopilot` и сравни `origin/claude/studio-autopilot` с `last_verified_sha`. Если расходятся — сначала восстанови факты в STATE.json, потом работай.
3. Если `paused: true` — не меняй продукт: сообщи о паузе и заверши запуск.
4. Не перезаписывай чужие незафиксированные изменения (`git status` / `git diff`).

## Шаги
1. Зафиксируй исходное состояние: ветка, SHA, `npm ci`, `npm run lint`, `npm test`, `npm run build` (размер бандла).
2. Пройди основные пути: публичная страница → услуга → заявка; вход → кабинет по роли → проект → файлы/правки. Без `.env.local` — dev-сервер с заглушкой `VITE_SUPABASE_URL=http://127.0.0.1:54321` и перехватом сети (рабочую базу не трогать).
3. Для доступа/данных — вызови security-reviewer (только чтение).
4. Каждая найденная проблема — воспроизведение (команда или шаги) + запись в BACKLOG.md с новым постоянным ID (`FIX-`, `SEC-`, `UX-`, `CNT-`, `MOB-`, `REL-`, `MOTION-`), пользой, приоритетом, критериями приёмки. Дубликаты не создавай.
5. Ошибки исходного проекта и регрессии от наших изменений — раздельно.
6. Продукт не меняй (кроме явно тривиальных исправлений, если пользователь попросил).

## Завершение
- Обнови `docs/autopilot/BACKLOG.md` (статусы), `STATE.json` (last_verified_sha, active_task, completed, pending_checks, next_step, last_run), `REPORT.md`, при необходимости `BLOCKERS.md`, `DECISIONS.md`, раздел «Изменения» в `PROJECT_STATUS.md`.
- Commit в `claude/studio-autopilot` с понятным сообщением. Перед push: `git fetch origin claude/studio-autopilot`; если удалённая ветка ушла вперёд — не перезаписывай: сохрани свою работу в ветке `claude/studio-autopilot-conflict-<дата>`, запиши конфликт в BLOCKERS.md и заверши. Обычный `git push -u origin claude/studio-autopilot`, без force.
- Итог Марьям по-русски, на «ты», коротко: что изменилось для пользователя; где посмотреть; чем проверено; что заблокировано; следующая задача.
