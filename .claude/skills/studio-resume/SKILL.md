---
name: studio-resume
description: "Снимает паузу автопилота PAN TERRA, восстанавливает незавершённую работу и включает существующее расписание без создания дубликата. Вызывается только пользователем."
disable-model-invocation: true
---

# /studio-resume — продолжить автопилот

Эту команду запускает только Марьям.

1. Сверь `docs/autopilot/STATE.json` с git (ветка, `last_verified_sha`, незавершённые задачи `in_progress`/`in_review`). Восстанови факты, если расходятся.
2. `"paused": false`, удали `paused_at`/`paused_reason`.
3. Расписание: найди ID из RUNBOOK.md. Если задача существует — включи её (`enabled: true`). Новую не создавай, если старая есть; если её нет — создай одну по параметрам из RUNBOOK.md и запиши новый ID.
4. Commit + обычный push в `claude/studio-autopilot`.
5. Скажи Марьям, что автопилот продолжен, и назови следующую задачу.
