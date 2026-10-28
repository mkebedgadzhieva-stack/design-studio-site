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
- **Механизм:** не подтверждён — см. раздел, обновляемый после создания (ниже).
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
