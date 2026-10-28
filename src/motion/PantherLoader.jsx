import "./panther-loader.css";

// Фирменный индикатор ожидания. Показывать только через useDelayedPending —
// сам компонент порог не проверяет.
//
// Сейчас это лёгкий резервный вариант из SPEC (красный мяч + текст):
// сцена «пантера на спине подбрасывает мяч» ждёт ассетов MOTION-01
// (см. docs/motion/SPEC.md и docs/autopilot/BLOCKERS.md). Мяч — главный акцент
// и в итоговой сцене, поэтому разметка `.pt-loader__scene` останется местом
// для персонажа.
export default function PantherLoader({ label = "Загружаем…", className = "" }) {
  return (
    <div className={`pt-loader ${className}`} role="status" aria-live="polite">
      <div className="pt-loader__scene" aria-hidden="true">
        <span className="pt-loader__ball" />
        <span className="pt-loader__shadow" />
      </div>
      <p className="pt-loader__label">{label}</p>
    </div>
  );
}
