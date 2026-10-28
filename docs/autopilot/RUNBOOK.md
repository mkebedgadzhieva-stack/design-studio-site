# RUNBOOK — как управлять автопилотом PAN TERRA

## Команды (в Claude Code, из папки проекта)
| Команда | Что делает |
| --- | --- |
| `/studio-status` | Коротко: пауза, последний запуск, активная задача, блокеры, следующий шаг. Ничего не меняет. |
| `/studio-auto` | Один цикл: до 3 готовых задач с проверками, коммитом и отчётом. |
| `/studio-next [ID]` | Одна задача целиком. |
| `/studio-audit [область]` | Аудит и обновление backlog. |
| `/studio-motion [ID]` | Следующая задача анимации пантеры. |
| `/studio-mobile [ID]` | Задача мобильного приложения. |
| `/studio-review [SHA]` | Независимая проверка изменений. |
| `/studio-release [версия]` | Подготовка релиза без публикации. |
| `/studio-pause [причина]` | Пауза (только Марьям). |
| `/studio-resume` | Снять паузу (только Марьям). |

### Запуск у себя на компьютере (Windows)
1. Открой «Терминал» (PowerShell).
2. Перейди в папку проекта: `cd "C:\Users\Марьям\Desktop\my-studio"`
3. Получи свежую ветку: `git fetch origin` → `git switch claude/studio-autopilot` → `git pull origin claude/studio-autopilot`
4. Запусти Claude Code: `claude`
5. Напиши `/studio-status` или `/studio-auto`.
Новые папки `.claude/agents` и `.claude/skills` подхватываются при запуске Claude Code; если команды не видны — закрой и снова открой `claude`.

### В облаке (claude.ai/code)
Открой сессию с репозиторием `design-studio-site` и веткой `claude/studio-autopilot` и напиши ту же команду.

## Расписание
- **Активный механизм: нет.** Облачная задача не создана намеренно: 28.10.2026 push в GitHub отклонён (403, BLOCKERS B-004) — облачный запуск склонировал бы ветку без памяти автопилота и не смог бы сохранить результат. Локальный runner тоже не создан (нужен включённый компьютер; одновременно два механизма не включаем).
- **Создать после того, как push заработает** (одна задача, без дубликатов — сначала проверить список существующих):
  - Где: claude.ai/code → Scheduled tasks (или попросить Claude в облачной сессии с этим репозиторием: «создай расписание по RUNBOOK»).
  - Название: `PAN TERRA автопилот`
  - Репозиторий: `mkebedgadzhieva-stack/design-studio-site`, ветка `claude/studio-autopilot`
  - Расписание: ежедневно 09:42 по Москве (`CRON_TZ=Europe/Moscow 42 9 * * *`; смещение от 10:00, чтобы не попадать в пик ровного часа)
  - Режим: новая сессия на каждый запуск.
  - Текст задачи:
    > Автопилот PAN TERRA, плановый запуск. Перейди на ветку `claude/studio-autopilot` (`git fetch origin claude/studio-autopilot && git switch claude/studio-autopilot`). Если ветки нет или в ней нет `docs/autopilot/STATE.json` — заверши запуск с диагностикой, проект заново не начинай. Прочитай `CLAUDE.md` и `docs/autopilot/` (STATE, BACKLOG, BLOCKERS, RUNBOOK). Если `paused: true` — ничего не меняй и заверши. Иначе выполни один ограниченный цикл `/studio-auto` (до 3 задач, проверки lint/test/build, браузер для UI). Перед push снова `git fetch`: если удалённая ветка ушла вперёд — сохрани работу в `claude/studio-autopilot-conflict-<дата>` и заверши с записью в BLOCKERS. Обычный push в `claude/studio-autopilot`, без force. Рабочую базу, `main` и публикацию не трогай.
- **Часовой пояс:** Europe/Moscow.
- **Источник:** ветка `claude/studio-autopilot`, состояние — `docs/autopilot/STATE.json`.
- **Результаты:** коммиты в `claude/studio-autopilot`, отчёт `docs/autopilot/REPORT.md`, история сессий на claude.ai/code.

## Пауза и продолжение
- Пауза: `/studio-pause` — ставит `paused: true` в STATE.json, отключает расписание (если доступно управление) и пушит флаг. Даже если расписание не отключилось, фоновый запуск увидит паузу и ничего не изменит.
- Продолжить: `/studio-resume` — снимает флаг и включает существующее расписание (без создания дубликата).
- Вручную: в STATE.json поменять `"paused": false/true`, закоммитить и отправить в ветку.

## Разрешения
- Сейчас проектный `.claude/settings.json` **не создан** (BLOCKERS B-001). Claude будет спрашивать разрешения в обычном режиме.
- Предложение — `docs/autopilot/proposed-settings.json`: разрешает только сборку/линтер/тесты, чтение и правку файлов проекта, git-команды для ветки `claude/studio-autopilot`; запрещает force push, push в `main`, чтение `.env*`, изменяющие инструменты Supabase.
- Чтобы включить: создать файл `.claude/settings.json` и вставить в него блок `{"permissions": …}` из предложения (без поля `_note`). После этого можно проверить фоновый режим:
  `claude -p "/studio-status" --permission-mode dontAsk --max-turns 8`
  В режиме `dontAsk` всё, что не разрешено списком, отклоняется без вопроса — запуск не зависнет.
- Не использовать `bypassPermissions` и `--dangerously-skip-permissions`.

## Если push не прошёл (bundle)
Файл `pan-terra-autopilot.bundle` содержит ветку `claude/studio-autopilot` с работой автопилота. На своём компьютере:
1. Положи файл в папку `C:\Users\Марьям\Downloads`.
2. В PowerShell: `cd "C:\Users\Марьям\Desktop\my-studio"`
3. `git fetch "C:\Users\Марьям\Downloads\pan-terra-autopilot.bundle" claude/studio-autopilot:claude/studio-autopilot-bundle`
4. `git switch claude/studio-autopilot-bundle` — проверь (`npm ci`, `npm run dev`).
5. Отправить на GitHub: `git push origin claude/studio-autopilot-bundle:claude/studio-autopilot` (обычный push; если GitHub откажет из-за расхождения — не форсировать, попросить Claude разобраться).

## Восстановление после сбоя
1. `git fetch origin claude/studio-autopilot` и `git log --oneline -5 origin/claude/studio-autopilot`.
2. Сравни с `last_verified_sha` в STATE.json. Если ветка ушла вперёд без обновления STATE — сначала `/studio-audit`, чтобы восстановить факты.
3. Задача висит в `in_progress` без коммита → верни её в `ready`, незакоммиченные изменения не удаляй без проверки (`git status`, `git diff`).
4. Конфликт с удалённой веткой: своя работа сохраняется в `claude/studio-autopilot-conflict-<дата>`, запись в BLOCKERS.md; force push запрещён.
5. Ветки `claude/studio-autopilot` нет → запуск завершается с диагностикой, проект заново не начинается.

## Проверки вручную
```
npm ci
npm run lint
npm test
npm run build
npm run dev   # http://localhost:5173, превью анимаций: http://localhost:5173/dev/motion
```
Без `.env.local` (облако): `VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=dev-placeholder npx vite --port 5173` — сайт открывается, кабинет без настоящей базы.
