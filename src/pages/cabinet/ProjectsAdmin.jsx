// src/pages/cabinet/ProjectsAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { INTERNAL_STATUSES, EXTERNAL_STATUSES } from "../../data/statuses";

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
        .eq("owner_id", me.id)
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

            <div className="mt-2 text-sm text-gray-700">{p.description}</div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
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
