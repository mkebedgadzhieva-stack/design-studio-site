import { useEffect, useRef, useState } from "react";
import PantherLoader from "../motion/PantherLoader.jsx";
import { useDelayedPending } from "../motion/useDelayedPending.js";

// Только для разработки: маршрут /dev/motion подключается при import.meta.env.DEV.
// Здесь допустим принудительный показ загрузчика; в пользовательских сценариях
// он подчиняется реальной загрузке.

const SCENARIOS = [
  { id: "fast-150", label: "Запрос 150 мс", ms: 150 },
  { id: "fast-400", label: "Запрос 400 мс", ms: 400 },
  { id: "slow-1500", label: "Запрос 1500 мс", ms: 1500 },
  { id: "error-1200", label: "Ошибка через 1200 мс", ms: 1200, fail: true },
];

function fakeRequest(ms, fail, signal) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => (fail ? reject(new Error("network")) : resolve(`готово за ${ms} мс`)), ms);
    signal.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("aborted", "AbortError"));
    });
  });
}

function SimulatedSection() {
  const [state, setState] = useState({ status: "idle" });
  const [log, setLog] = useState([]);
  const controller = useRef(null);
  const showLoader = useDelayedPending(state.status === "pending");

  const push = (line) =>
    setLog((rows) => [`${(performance.now() / 1000).toFixed(2)}s ${line}`, ...rows].slice(0, 12));

  useEffect(() => {
    if (showLoader) push("загрузчик показан");
  }, [showLoader]);

  useEffect(() => () => controller.current?.abort(), []);

  async function run(scenario) {
    controller.current?.abort(); // устаревший запрос не меняет состояние нового
    const ctrl = new AbortController();
    controller.current = ctrl;
    setState({ status: "pending", scenario });
    push(`старт: ${scenario.label}`);
    try {
      const result = await fakeRequest(scenario.ms, scenario.fail, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setState({ status: "ready", result });
      push(`готово: ${scenario.label}`);
    } catch (error) {
      if (error.name === "AbortError") return push(`отменён: ${scenario.label}`);
      setState({ status: "error", scenario });
      push(`ошибка: ${scenario.label}`);
    }
  }

  function rapidABC() {
    run(SCENARIOS[2]);
    setTimeout(() => run(SCENARIOS[2]), 150);
    setTimeout(() => run(SCENARIOS[0]), 300);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button key={s.id} type="button" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50" onClick={() => run(s)}>
            {s.label}
          </button>
        ))}
        <button type="button" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50" onClick={rapidABC}>
          A → B → C (быстро)
        </button>
      </div>

      <div className="min-h-[260px] rounded-2xl border p-4" aria-busy={state.status === "pending"}>
        {state.status === "pending" && (showLoader ? <PantherLoader label="Загружаем раздел…" /> : null)}
        {state.status === "ready" && <p>Содержимое раздела: {state.result}</p>}
        {state.status === "error" && (
          <div role="alert" className="space-y-3">
            <p>Не получилось загрузить раздел.</p>
            <button type="button" className="rounded-xl border px-3 py-1.5 text-sm" onClick={() => run(state.scenario)}>
              Повторить
            </button>
          </div>
        )}
        {state.status === "idle" && <p className="text-gray-500">Выбери сценарий.</p>}
      </div>

      <ol className="text-xs text-gray-500 font-mono space-y-0.5" aria-label="Журнал событий">
        {log.map((line, i) => <li key={i}>{line}</li>)}
      </ol>
    </section>
  );
}

export default function MotionPreview() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
      <header>
        <p className="text-xs tracking-[0.2em] text-red-600 font-semibold">DEV / MOTION PREVIEW</p>
        <h1 className="text-3xl font-semibold mt-2">Пантера: сцены и режимы ожидания</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Страница есть только в режиме разработки (npm run dev). Порог показа — 500 мс.
          Сцены с ригом пантеры ждут ассетов MOTION-01 — сейчас показан резервный вариант.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Сцена A — порог и реальное ожидание</h2>
        <SimulatedSection />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Сцена A — принудительный показ (только превью)</h2>
        <div className="rounded-2xl border"><PantherLoader label="Загружаем…" /></div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ассет: чистая пантера из референса (статика)</h2>
        <p className="text-gray-600 text-sm">
          public/motion/panther-walk-static.svg — слои #pt-body, #pt-highlights, #pt-eyes, #pt-ball. Не риг.
        </p>
        <div className="rounded-2xl border p-6" style={{ background: "repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0 / 24px 24px" }}>
          <img src="/motion/panther-walk-static.svg" alt="" className="w-full h-auto" />
        </div>
      </section>
    </div>
  );
}
