// src/components/ProjectModal.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import RichTextEditor from "./RichTextEditor";
import { INTERNAL_STATUSES } from "../data/statuses";
import { differenceInCalendarDays } from "date-fns";

/* --- Лёгкий парсер инлайновой «markdown-подобной» разметки для подзадач --- */
function mdInline(raw = "") {
  // экранируем HTML
  let s = (raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // [текст](https://...)
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  // `код`
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // **жирный**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // *курсив* или _курсив_
  s = s.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?]|$)/g, "$1<em>$2</em>");

  return s;
}

export default function ProjectModal({ project, onClose, onUpdated, onDeleted }) {
  const [p, setP] = useState(project);
  const [tasks, setTasks] = useState([]);

  // загрузка подзадач
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", p.id)
        .order("created_at");
      setTasks(data || []);
    })();
  }, [p.id]);

  const done = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const daysLeft = p.due_date ? differenceInCalendarDays(new Date(p.due_date), new Date()) : null;

  async function patch(body) {
    const { data, error } = await supabase.from("projects").update(body).eq("id", p.id).select().single();
    if (!error) {
      setP(data);
      onUpdated?.(data);
    }
  }

  async function addTask(title) {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { project_id: p.id, owner_id: user?.id ?? null, title };
    const { data, error } = await supabase.from("project_tasks").insert(payload).select().single();
    if (!error) setTasks((prev) => [...prev, data]);
  }

  async function toggleTask(t) {
    const { data } = await supabase.from("project_tasks").update({ done: !t.done }).eq("id", t.id).select().single();
    setTasks((prev) => prev.map((x) => (x.id === t.id ? data : x)));
  }

  async function deleteTask(t) {
    const ok = confirm(`Удалить подзадачу «${t.title}»?`);
    if (!ok) return;
    const { error } = await supabase.from("project_tasks").delete().eq("id", t.id);
    if (!error) setTasks((prev) => prev.filter((x) => x.id !== t.id));
  }

  async function deleteProject() {
    const ok = confirm(`Удалить проект «${p.title}» вместе со всеми подзадачами? Это действие необратимо.`);
    if (!ok) return;
    // на всякий случай чистим подзадачи (если нет CASCADE)
    await supabase.from("project_tasks").delete().eq("project_id", p.id);
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (!error) {
      onDeleted?.(p.id);
      onClose?.();
    }
  }

  const tagInput = (p.tags || []).join(", ");

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="w-[min(960px,100%)] rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-auto">
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b">
          <input
            className="text-lg font-semibold w-full outline-none"
            value={p.title}
            onChange={(e) => setP({ ...p, title: e.target.value })}
            onBlur={() => patch({ title: p.title })}
          />
          <div className="ml-3 flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-xl border hover:bg-gray-50 text-red-600"
              onClick={deleteProject}
              title="Удалить проект"
            >
              🗑️ Удалить
            </button>
            <button className="px-3 py-1 rounded-xl border hover:bg-gray-50" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>

        {/* свойства */}
        <div className="p-4 grid gap-3 md:grid-cols-4">
          <div className="text-sm">
            <div className="text-gray-500 mb-1">Статус</div>
            <select
              className="border rounded-lg px-2 py-1 w-full"
              value={p.internal_status}
              onChange={(e) =>
                patch({
                  internal_status: e.target.value,
                  external_status: ["queued", "accepted", "in_progress", "completed"].includes(e.target.value)
                    ? e.target.value
                    : "in_progress",
                })
              }
            >
              {Object.entries(INTERNAL_STATUSES).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm">
            <div className="text-gray-500 mb-1">Дедлайн</div>
            <input
              type="date"
              className="border rounded-lg px-2 py-1 w-full"
              value={p.due_date || ""}
              onChange={(e) => patch({ due_date: e.target.value || null })}
            />
            {p.due_date && (
              <div
                className={`mt-1 text-xs ${
                  daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-gray-500"
                }`}
              >
                {daysLeft >= 0 ? `через ${daysLeft} д.` : `${-daysLeft} д. назад`}
              </div>
            )}
          </div>

          <div className="text-sm">
            <div className="text-gray-500 mb-1">Приоритет</div>
            <select
              className="border rounded-lg px-2 py-1 w-full"
              value={p.priority ?? 2}
              onChange={(e) => patch({ priority: Number(e.target.value) })}
            >
              <option value={1}>Высокий</option>
              <option value={2}>Средний</option>
              <option value={3}>Низкий</option>
            </select>
          </div>

          <div className="text-sm md:col-span-1">
            <div className="text-gray-500 mb-1">Теги (через запятую)</div>
            <input
              className="border rounded-lg px-2 py-1 w-full"
              defaultValue={tagInput}
              onBlur={(e) => {
                const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                patch({ tags: arr });
              }}
            />
          </div>
        </div>

        {/* заметки */}
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-1">Заметки</div>
          <RichTextEditor value={p.description || ""} onChange={(html) => patch({ description: html })} />
        </div>

        {/* checklist */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Подзадачи</div>
            <div className="text-xs text-gray-600">
              Прогресс: {done}/{tasks.length} ({progress}%)
            </div>
          </div>

          <div className="space-y-1">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} />
                <span
                  className={
                    "prose prose-sm max-w-none flex-1 " + (t.done ? "line-through text-gray-400" : "")
                  }
                  dangerouslySetInnerHTML={{ __html: mdInline(t.title) }}
                />
                <button
                  onClick={() => deleteTask(t)}
                  className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50 text-red-600"
                  title="Удалить подзадачу"
                >
                  🗑️
                </button>
              </div>
            ))}
            {tasks.length === 0 && <div className="text-xs text-gray-500">Пока пусто</div>}
          </div>

          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = e.target.title.value.trim();
              if (v) {
                addTask(v);
                e.target.reset();
              }
            }}
          >
            <input
              name="title"
              className="flex-1 border rounded-lg px-2 py-1 text-sm"
              placeholder="Новая подзадача…"
            />
            <button className="text-sm rounded-lg border px-2 py-1 hover:bg-gray-50">Добавить</button>
          </form>

          <p className="mt-1 text-[11px] text-gray-500">
            Поддерживается мини-разметка: <code>**жирный**</code>, <code>*курсив*</code>, <code>`код`</code>, ссылки{" "}
            <code>[текст](https://...)</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
