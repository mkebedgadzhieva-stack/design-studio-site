# PAN TERRA — сайт дизайн-студии

Публичный сайт студии PAN TERRA (брендинг, айдентика, упаковка, полиграфия) и личные кабинеты: «Студия» и «Заказчик / партнёр».

**Стек:** Vite 7, React 19, React Router 7, Tailwind CSS 4, Supabase. Node 22.

## Запуск
```bash
npm install
npm run dev      # http://localhost:5173
```
Ключи Supabase — в `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), файл не коммитится.

## Проверки
```bash
npm run lint
npm test
npm run build
```
Те же проверки запускаются на GitHub при каждой отправке (`.github/workflows/checks.yml`, без публикации).

## Где что лежит
- `CLAUDE.md` — правила проекта; `PROJECT_STATUS.md` — состояние и изменения.
- `docs/autopilot/` — очередь задач, состояние, решения, блокеры, инструкция (RUNBOOK).
- `docs/motion/` — спецификация, раскадровка и проверки анимации пантеры.
- `src/ROUTES.md` — карта маршрутов и чеклист.
