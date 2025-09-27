import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import ProjectModal from "../../components/ProjectModal";
import { format } from "date-fns";

const VIEW_TABS = ["Board","List","Calendar"];
const COLS = [
  { key: "queued", label: "В очереди" },
  { key: "accepted", label: "Принят" },
  { key: "in_progress", label: "В процессе" },
  { key: "on_hold", label: "Пауза" },
  { key: "rework", label: "Доработка" },
  { key: "completed", label: "Готово" },
];

export default function PlannerBoard() {
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState(null);
  const [view, setView] = useState("Board");
  const [opened, setOpened] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setMe(user || null);
  })(); }, []);

  async function load() {
    if (!me) return;
    const { data, error } = await supabase.from("projects").select("*").eq("owner_id", me.id).order("created_at", { ascending: false });
    if (!error) setRows(data || []);
  }
  useEffect(() => { load(); }, [me]);

  const filtered = useMemo(() => {
    if (!rows) return null;
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(p =>
      p.title.toLowerCase().includes(s) ||
      (p.tags || []).some(t => t.toLowerCase().includes(s))
    );
  }, [rows, q]);

  if (!me || !filtered) return <div>Загрузка…</div>;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        {VIEW_TABS.map(t => (
          <button key={t}
            className={`px-3 py-1 rounded-xl border ${view===t ? "bg-gray-100" : "hover:bg-gray-50"}`}
            onClick={() => setView(t)}
          >{t}</button>
        ))}
        <input
          className="ml-auto border rounded-xl px-3 py-1 w-[260px]"
          placeholder="Поиск по названию/тегам…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      {view === "Board" && <BoardView rows={filtered} onOpen={setOpened} />}
      {view === "List"  && <ListView rows={filtered} onOpen={setOpened} />}
      {view === "Calendar" && <CalendarView rows={filtered} onOpen={setOpened} />}

      {opened && (
  <ProjectModal
    project={opened}
    onClose={() => setOpened(null)}
    onUpdated={(upd) => setRows(prev => prev.map(p => p.id === upd.id ? upd : p))}
    onDeleted={(id) => setRows(prev => prev.filter(p => p.id !== id))}   // <-- ДОБАВЬ ЭТО
  />
)}
    </section>
  );
}

function BoardView({ rows, onOpen }) {
  const grouped = useMemo(() => {
    const g = Object.fromEntries(COLS.map(c => [c.key, []]));
    rows.forEach(p => (g[p.internal_status] ?? g["queued"]).push(p));
    return g;
  }, [rows]);

  return (
    <div className="grid xl:grid-cols-6 lg:grid-cols-3 gap-4">
      {COLS.map(col => (
        <div key={col.key} className="border rounded-2xl p-3 bg-white/70">
          <div className="text-sm font-semibold mb-3">{col.label} · {(grouped[col.key] || []).length}</div>
          <div className="space-y-3">
            {(grouped[col.key] || []).map(p => <Card key={p.id} p={p} onOpen={() => onOpen(p)} />)}
            {(grouped[col.key] || []).length === 0 && <div className="text-xs text-gray-500">Пусто</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ p, onOpen }) {
  const days = p.due_date ? Math.ceil((new Date(p.due_date) - new Date())/86400000) : null;
  const prColor = p.priority === 1 ? "bg-red-500" : p.priority === 2 ? "bg-amber-500" : "bg-gray-400";
  const badge = <span className={`inline-block w-2 h-2 rounded-full ${prColor}`} />;

  return (
    <button onClick={onOpen} className="text-left w-full rounded-xl border bg-white hover:bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        {badge}
        <div className="font-medium">{p.title}</div>
        {p.tags?.length ? <div className="ml-auto text-xs text-gray-500">{p.tags.join(" · ")}</div> : null}
      </div>
      <div className="mt-1 text-xs text-gray-600">
        {p.due_date ? <>Дедлайн: <b>{p.due_date}</b> <span className={days!=null && (days<=3 ? "text-red-600" : days<=7 ? "text-amber-600" : "text-gray-500")}>
          {days!=null && (days>=0 ? `через ${days} д.` : `${-days} д. назад`)}
        </span></> : "Без дедлайна"}
      </div>
    </button>
  );
}

function ListView({ rows, onOpen }) {
  return (
    <div className="border rounded-2xl overflow-hidden">
      <div className="grid grid-cols-6 px-3 py-2 text-xs bg-gray-50 border-b">
        <div>Проект</div><div>Статус</div><div>Дедлайн</div><div>Приоритет</div><div>Теги</div><div></div>
      </div>
      {rows.map(p => (
        <div key={p.id} className="grid grid-cols-6 px-3 py-2 border-b bg-white">
          <div className="truncate">{p.title}</div>
          <div className="text-gray-600">{p.internal_status}</div>
          <div className="text-gray-600">{p.due_date || "—"}</div>
          <div className="text-gray-600">{p.priority ?? 2}</div>
          <div className="text-gray-600 truncate">{p.tags?.join(", ") || "—"}</div>
          <div className="text-right">
            <button className="text-xs rounded-xl border px-2 py-1 hover:bg-gray-50" onClick={() => onOpen(p)}>Открыть</button>
          </div>
        </div>
      ))}
      {!rows.length && <div className="p-4 text-sm text-gray-500">Пусто</div>}
    </div>
  );
}

function CalendarView({ rows, onOpen }) {
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(); d.setDate(1); const startDay = d.getDay() || 7; d.setDate(1 - (startDay - 1) + i);
    return d;
  });
  const byDate = (dateStr) => rows.filter(p => p.due_date === dateStr);

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, idx) => {
        const key = format(d, "yyyy-MM-dd");
        const list = byDate(key);
        return (
          <div key={idx} className="min-h-[110px] border rounded-xl bg-white/70 p-2">
            <div className="text-xs text-gray-500">{format(d, "dd.MM")}</div>
            <div className="mt-1 space-y-1">
              {list.map(p => (
                <button key={p.id} onClick={() => onOpen(p)} className="w-full text-left text-xs rounded border px-2 py-1 hover:bg-gray-50">
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
