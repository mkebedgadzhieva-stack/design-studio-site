import PantherLoader from "./PantherLoader.jsx";
import { useDelayedPending } from "./useDelayedPending.js";

// Fallback для <Suspense> вокруг лениво загружаемых разделов (REL-02).
// Пока код раздела грузится, компонент смонтирован; загрузчик появляется только
// если ожидание дольше порога, и исчезает сразу, как только раздел готов.
export default function RouteLoader({ label = "Загружаем раздел…" }) {
  const showLoader = useDelayedPending(true);
  return (
    <div aria-busy="true" style={{ minHeight: "40vh" }}>
      {showLoader && <PantherLoader label={label} />}
    </div>
  );
}
