---
name: studio-motion
description: "Продолжает одну задачу фирменной анимации пантеры PAN TERRA (MOTION-01…04): motion-designer → character-animator → motion-engineer → QA. Использует референс пантеры и проверяет реальную загрузку. Доступна расписанию."
argument-hint: "[ID задачи MOTION-* — необязательно]"
---

# /studio-motion — фирменная анимация

## Старт (обязательно, каждый запуск)
1. Прочитай `CLAUDE.md`, `docs/autopilot/STATE.json`, `docs/autopilot/BACKLOG.md`, `docs/autopilot/BLOCKERS.md`.
2. Сверь состояние с git: `git status`, `git branch --show-current`, `git log --oneline -5`, `git fetch origin claude/studio-autopilot` и сравни `origin/claude/studio-autopilot` с `last_verified_sha`. Если расходятся — сначала восстанови факты в STATE.json, потом работай.
3. Если `paused: true` — не меняй продукт: сообщи о паузе и заверши запуск.
4. Не перезаписывай чужие незафиксированные изменения (`git status` / `git diff`).

## Очередь
MOTION-01 (ассеты и риг) → MOTION-02 (загрузчик на реальном ожидании) → MOTION-03 (прогулка у футера) → MOTION-04 (медленная сеть, гонки, плавность, вес). Возьми первую незавершённую и не заблокированную; если MOTION-01 заблокирована по ассетам — продолжай доступные части других задач на резервном варианте и не объявляй анимацию готовой.

## Последовательность специалистов
motion-designer (спецификация в `docs/motion/SPEC.md`) → character-animator (ассеты) → motion-engineer (интеграция, с web-engineer по границам файлов) → qa-engineer (`docs/motion/QA.md`). Не больше двух одновременно.

## Обязательно
- Референс: `assets-src/motion/reference/panther-reference.webp`; скрипт: `tools/motion/extract_reference.py`.
- Загрузчик только при реальном ожидании критичных данных дольше 500 мс; готовое содержимое — сразу; ошибка — «Повторить».
- Принудительный показ — только на `/dev/motion`.
- Проверка движения — кадры/видео, не один скриншот. Запиши условия измерения. Без заявлений «60 FPS везде».
- Бюджет критичного загрузчика ≤ 80 КБ gzip — измерить.

## Завершение
- Обнови `docs/autopilot/BACKLOG.md` (статусы), `STATE.json` (last_verified_sha, active_task, completed, pending_checks, next_step, last_run), `REPORT.md`, при необходимости `BLOCKERS.md`, `DECISIONS.md`, раздел «Изменения» в `PROJECT_STATUS.md`.
- Commit в `claude/studio-autopilot` с понятным сообщением. Перед push: `git fetch origin claude/studio-autopilot`; если удалённая ветка ушла вперёд — не перезаписывай: сохрани свою работу в ветке `claude/studio-autopilot-conflict-<дата>`, запиши конфликт в BLOCKERS.md и заверши. Обычный `git push -u origin claude/studio-autopilot`, без force.
- Итог Марьям по-русски, на «ты», коротко: что изменилось для пользователя; где посмотреть; чем проверено; что заблокировано; следующая задача.
