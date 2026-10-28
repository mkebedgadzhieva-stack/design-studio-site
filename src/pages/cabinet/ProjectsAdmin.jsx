// src/pages/cabinet/ProjectsAdmin.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { INTERNAL_STATUSES, EXTERNAL_STATUSES } from "../../data/statuses";
const PROJECT_STAGES = [
  "Бриф и материалы",
  "Предоплата и старт",
  "Разработка концепции",
  "Согласование",
  "Правки и финализация",
  "Финальные файлы / проект завершён",
];

// маппинг: внутренний → внешний (что видит клиент)
function mapExternal(internal) {
  switch (internal) {
    case "queued":       return "queued";        // В очереди
    case "reviewing":    return "accepted";      // На рассмотрении -> Принят (наружу проще)
    case "accepted":     return "accepted";
    case "in_progress":  return "in_progress";
    case "rework":       return "in_progress";   // доработки не светим отдельно
    case "on_hold":      return "in_progress";   // пауза тоже без детализации
    case "completed":    return "completed";
    case "cancelled":    return "queued";        // клиенту не показываем "отменён"
    default:             return "queued";
  }
}

export default function ProjectsAdmin() {
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user || null);
    })();
  }, []);

  useEffect(() => {
    if (!me) return;
    (async () => {
      const { data, error } = await supabase
  .from("projects")
  .select("*")
  .order("created_at", { ascending: false });
      if (!error) setRows(data || []);
    })();
  }, [me]);

  // создать проект (в демо client_id = owner_id; позже привяжем клиента)
  async function createProject(e) {
    e.preventDefault();
    if (!me) return;
    if (!title.trim()) return alert("Название проекта обязательно");
    const payload = {
      owner_id: me.id,
      client_id: me.id, // временно! позже заменим на реального клиента
      title: title.trim(),
      description: desc?.trim() || null,
      due_date: due || null,
      internal_status: "queued",
      external_status: mapExternal("queued"),
    };
    const { data, error } = await supabase.from("projects").insert(payload).select().single();
    if (error) return alert(error.message);
    setRows(prev => [data, ...(prev || [])]);
    setTitle(""); setDesc(""); setDue("");
  }

  async function updateStatus(id, internal) {
    const external = mapExternal(internal);
    const { data, error } = await supabase
      .from("projects")
      .update({ internal_status: internal, external_status: external })
      .eq("id", id)
      .select()
      .single();
    if (error) return alert(error.message);
    setRows(prev => prev.map(p => p.id === id ? data : p));
  }
  async function updateProgress(id, changes) {
    const { data, error } = await supabase
      .from("projects")
      .update(changes)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setRows((prev) =>
      prev.map((p) => (p.id === id ? data : p))
    );
  }

  if (!me) return <div>Нужно войти</div>;
  if (!rows) return <div>Загрузка…</div>;

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Проекты (админ)</h1>

      {/* Создание проекта */}
      <form onSubmit={createProject} className="grid gap-3 md:grid-cols-5 p-4 border rounded-2xl bg-white/70">
        <input
          className="border rounded-xl px-3 py-2 md:col-span-2"
          placeholder="Название проекта"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="border rounded-xl px-3 py-2"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
        <button className="rounded-xl border px-3 py-2 hover:bg-gray-50">Создать</button>
        <div className="md:col-span-5">
          <textarea
            className="border rounded-xl px-3 py-2 w-full"
            rows={2}
            placeholder="Описание/бриф (опц.)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
      </form>

      {/* Список проектов */}
      <div className="grid gap-3">
        {rows.map(p => (
          <div key={p.id} className="rounded-2xl border bg-white/80 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="font-medium">{p.title}</div>
              {p.due_date && <div className="text-xs text-gray-600">Дедлайн: {p.due_date}</div>}
              <div className="text-xs text-gray-500">Создан: {new Date(p.created_at).toLocaleString("ru-RU")}</div>
            </div>

                        <div className="mt-2 text-sm text-gray-700">
              {p.description}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <div className="mb-1 text-xs text-gray-500">
                  Этап проекта
                </div>

                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={p.stage || 1}
                  onChange={(e) =>
                    updateProgress(p.id, {
                      stage: Number(e.target.value),
                    })
                  }
                >
                  {PROJECT_STAGES.map((stage, index) => (
                    <option
                      key={stage}
                      value={index + 1}
                    >
                      {index + 1} — {stage}
                    </option>
                  ))}
                </select>

                <div className="mt-1 text-xs text-gray-500">
                  Этап {p.stage || 1} из 6
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-500">
                  Следующий шаг
                </div>

                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  defaultValue={p.next_step || ""}
                  placeholder="Например: презентация концепции"
                  onBlur={(e) =>
                    updateProgress(p.id, {
                      next_step:
                        e.target.value.trim() || null,
                    })
                  }
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-500">
                  Ближайший срок
                </div>

                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={p.due_date || ""}
                  onChange={(e) =>
                    updateProgress(p.id, {
                      due_date: e.target.value || null,
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Заказчик увидит
              </div>

              <div className="mt-2 font-medium">
                {PROJECT_STAGES[(p.stage || 1) - 1]}
              </div>

              <div className="mt-1 text-sm text-gray-600">
                Этап {p.stage || 1} из 6
              </div>

              {p.next_step && (
                <div className="mt-2 text-sm">
                  Следующий шаг: {p.next_step}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-sm">
                Внутренний статус:
                <select
                  className="ml-2 border rounded-lg px-2 py-1"
                  value={p.internal_status}
                  onChange={(e) => updateStatus(p.id, e.target.value)}
                >
                  {Object.entries(INTERNAL_STATUSES).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Клиент видит: <b>{EXTERNAL_STATUSES[p.external_status] || "—"}</b>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-gray-500">Пока нет проектов</div>}
      </div>
    </section>
  );
}
