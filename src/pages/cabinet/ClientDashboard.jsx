import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const ACCENT = "#e0172a";

const STATUS_LABELS = {
  new: "Новый проект",
  brief: "Заполняем бриф",
  briefing: "Заполняем бриф",
  research: "Исследование",
  concept: "Разработка концепции",
  concepts: "Разработка концепции",
  revision: "Внесение правок",
  revisions: "Внесение правок",
  final: "Подготовка файлов",
  delivery: "Подготовка файлов",
  completed: "Проект завершён",
  done: "Проект завершён",
  paused: "Проект на паузе",
};

const STATUS_PROGRESS = {
  new: 8,
  brief: 15,
  briefing: 15,
  research: 30,
  concept: 55,
  concepts: 55,
  revision: 75,
  revisions: 75,
  final: 92,
  delivery: 92,
  completed: 100,
  done: 100,
  paused: 50,
};

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${number.toLocaleString("ru-RU")} ₽`;
}

function formatDate(value) {
  if (!value) return "Уточняется";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Уточняется";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getProjectTitle(project) {
  return project?.title || project?.name || "Дизайн-проект";
}

function getStatus(project) {
  const key = String(project?.status || "new").toLowerCase();
  return {
    key,
    label: STATUS_LABELS[key] || project?.status || "Проект в работе",
    progress: Number(project?.progress) || STATUS_PROGRESS[key] || 20,
  };
}

function InfoCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-lg font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-sm text-slate-500">{hint}</div>}
    </div>
  );
}

function EmptyProjects() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-8 md:p-10">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-xl" style={{ color: ACCENT }}>
        +
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-slate-900">
        Здесь появится твой проект
      </h2>
      <p className="mt-3 max-w-xl text-slate-600">
        После согласования задачи здесь будут видны этапы, сроки, файлы,
        правки и история оплаты.
      </p>
      <Link
        to="/contact"
        className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        style={{ backgroundColor: ACCENT }}
      >
        Обсудить новый проект
      </Link>
    </div>
  );
}

function ActiveProject({ project }) {
  const status = getStatus(project);
  const total =
    project.total_amount ?? project.total ?? project.price ?? project.budget;
  const paid = project.paid_amount ?? project.paid;
  const remaining =
    Number.isFinite(Number(total)) && Number.isFinite(Number(paid))
      ? Math.max(Number(total) - Number(paid), 0)
      : project.remaining_amount ?? project.balance;
  const nextAction =
    project.next_action ||
    project.client_action ||
    "Следующее действие появится после обновления этапа";

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: ACCENT }}>
            Активный проект
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900 md:text-3xl">
            {getProjectTitle(project)}
          </h2>
          <p className="mt-2 text-slate-500">{status.label}</p>
        </div>
        <div className="text-left md:text-right">
          <div className="text-sm text-slate-400">Готовность</div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">
            {Math.min(status.progress, 100)}%
          </div>
        </div>
      </div>

      <div className="mt-7 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(status.progress, 100)}%`,
            backgroundColor: ACCENT,
          }}
        />
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Этап" value={status.label} />
        <InfoCard
          label="Дедлайн"
          value={formatDate(project.deadline || project.due_date)}
        />
        <InfoCard
          label="Оплачено"
          value={formatMoney(paid)}
          hint={total ? `из ${formatMoney(total)}` : undefined}
        />
        <InfoCard label="Осталось" value={formatMoney(remaining)} />
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          Сейчас нужно от тебя
        </div>
        <div className="mt-2 font-medium text-slate-900">{nextAction}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/cabinet/projects/${project.id}`}
          className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: "#0f172a" }}
        >
          Открыть проект
        </Link>
        <a
          href="https://t.me/themarrrr"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
        >
          Написать дизайнеру
        </a>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadDashboard() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!alive) return;
        setUser(currentUser || null);

        if (!currentUser) return;

        const { data } = await supabase
          .from("projects")
          .select("*")
          .eq("client_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (!alive) return;
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Не удалось загрузить кабинет:", error);
        if (alive) setProjects([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      alive = false;
    };
  }, []);

  const firstName = useMemo(() => {
    const meta = user?.user_metadata || {};
    const fullName = meta.full_name || meta.name || meta.first_name || "";
    if (fullName.trim()) return fullName.trim().split(/\s+/)[0];
    if (user?.email) return user.email.split("@")[0];
    return "";
  }, [user]);

  const activeProject = projects.find(
    (project) => !["completed", "done"].includes(String(project.status).toLowerCase())
  );
  const completedProjects = projects.filter((project) =>
    ["completed", "done"].includes(String(project.status).toLowerCase())
  );

  return (
    <main className="min-h-[70vh] bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: ACCENT }}>
              Личный кабинет
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              {firstName ? `Привет, ${firstName}` : "Привет"}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Здесь всё по проекту: этапы, сроки, оплата, файлы и правки.
            </p>
          </div>
          <a
            href="https://t.me/themarrrr"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Связаться со студией
          </a>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            {loading ? (
              <div className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-8">
                <div className="h-5 w-28 rounded bg-slate-100" />
                <div className="mt-5 h-9 w-2/3 rounded bg-slate-100" />
                <div className="mt-8 h-2 rounded bg-slate-100" />
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="h-28 rounded-2xl bg-slate-100" />
                  <div className="h-28 rounded-2xl bg-slate-100" />
                </div>
              </div>
            ) : activeProject ? (
              <ActiveProject project={activeProject} />
            ) : (
              <EmptyProjects />
            )}

            {completedProjects.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900">
                  Завершённые проекты
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {completedProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/cabinet/projects/${project.id}`}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-400"
                    >
                      <div className="font-medium text-slate-900">
                        {getProjectTitle(project)}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        Открыть файлы и документы →
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Как идёт работа</h2>
              <ol className="mt-5 space-y-5">
                {[
                  ["01", "Бриф и материалы"],
                  ["02", "Концепция и правки"],
                  ["03", "Финальные файлы"],
                ].map(([number, label]) => (
                  <li key={number} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {number}
                    </span>
                    <span className="text-sm text-slate-700">{label}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[24px] bg-slate-900 p-6 text-white">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Нужна помощь?
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Напиши нам — ответим по проекту и подскажем следующий шаг.
              </p>
              <a
                href="https://t.me/themarrrr"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex text-sm font-medium text-white underline decoration-red-500 underline-offset-4"
              >
                Открыть Telegram
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
