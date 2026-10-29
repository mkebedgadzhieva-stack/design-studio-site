import { useState } from "react";
import "./footer-panther.css";

// Сцена B (MOTION-03): полоса с пантерой над футером.
// Сейчас — честный статичный вариант из SPEC: походка ждёт рига (MOTION-01,
// BLOCKERS B-002). Высота полосы зарезервирована заранее, поэтому замена на
// анимацию не сдвинет страницу. Картинка грузится лениво — только у футера.
export default function FooterPanther() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="pt-footer-panther" aria-hidden="true">
      <div className="pt-footer-panther__track">
        {!failed && (
          <img
            className="pt-footer-panther__figure"
            src="/motion/panther-walk-static.svg"
            alt=""
            width="1541"
            height="539"
            loading="lazy"
            decoding="async"
            draggable="false"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
