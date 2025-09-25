// src/components/ServicesDropdown.jsx
import { Link } from "react-router-dom";
import { useRef, useState } from "react";

export default function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const closeSoft = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    // мягкая задержка, чтобы меню не исчезало, когда ведёшь курсор вниз
    closeTimer.current = setTimeout(() => setOpen(false), 240);
  };

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoft}
      onFocus={openNow}
      onBlur={closeSoft}
    >
      <button className="hover:opacity-70">Услуги</button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[880px] max-w-[92vw] bg-white border rounded-2xl shadow-xl p-6 z-50">
          {/* невидимый «мостик», чтобы не было разрыва между кнопкой и меню */}
          <div className="absolute left-0 -top-1 w-full h-3" aria-hidden="true" />

          {/* две строки по три колонки */}
          <div className="grid grid-cols-3 gap-x-10 gap-y-8 text-sm">
            {/* 1. Брендинг */}
            <Column title="Брендинг">
              <li><Link to="/services/logo" className="hover:underline">Логотип</Link></li>
              <li><Link to="/services/branding-packages" className="hover:underline">Пакеты брендинга</Link></li>
            </Column>

            {/* 2. Печатный дизайн */}
            <Column title="Печатный дизайн">
              <TooltipItem to="/services/small-formats" label="Малые форматы" tip="Визитки, открытки, этикетки" />
              <TooltipItem to="/services/print-ads" label="Рекламные носители" tip="Флаеры, афиши, баннеры" />
              <TooltipItem to="/services/publishing" label="Издания" tip="Каталоги, буклеты, журналы" />
            </Column>

            {/* 3. Диджитал */}
            <Column title="Диджитал">
              <li><Link to="/services/ui-landing" className="hover:underline">Дизайн лендингов/сайтов</Link></li>
              <li><Link to="/services/app-ui" className="hover:underline">UI-дизайн приложений</Link></li>
            </Column>

            {/* 4. Анимация и моушн */}
            <Column title="Анимация и моушн">
              <li><Link to="/services/logo-animation" className="hover:underline">Анимированный логотип</Link></li>
              <li><Link to="/services/video-intros" className="hover:underline">Интро/аутро для видео</Link></li>
              <li><Link to="/services/presentation-motion" className="hover:underline">Motion для презентаций</Link></li>
            </Column>

            {/* 5. Оформление соцсетей */}
            <Column title="Оформление соцсетей">
              <li><Link to="/services/social-style" className="hover:underline">Единый стиль аккаунта</Link></li>
              <li><Link to="/services/social-templates" className="hover:underline">Шаблоны постов и сторис</Link></li>
            </Column>

            {/* 6. Дополнительно — под Диджитал */}
            <Column title="Дополнительно / мелкие форматы">
              <li><Link to="/services/extras" className="hover:underline">Что не нашли в списке</Link></li>
              <li className="text-xs text-gray-500">
                Стикеры, вкладыши, бирки, карточки и др. — обсудим индивидуально.
              </li>
            </Column>
          </div>

          <div className="border-t mt-5 pt-4 text-right">
            <Link to="/services" className="text-sm hover:underline">Все услуги →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Вспомогательные компоненты ---------- */

function Column({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

/** Пункт списка с подсказкой, прижатой ближе к тексту */
function TooltipItem({ to, label, tip }) {
  return (
    <li className="relative group">
      <Link to={to} className="hover:underline inline-flex">
        <span className="relative inline-flex w-fit">
          {label}
          <span
            className="
              pointer-events-none absolute top-1/2 -translate-y-1/2 z-10
              whitespace-nowrap rounded-md px-2 py-1 text-xs
              bg-gray-900 text-white shadow-md opacity-0
              transition-opacity duration-150 group-hover:opacity-100
            "
            style={{ left: "calc(100% + 6px)" }}
          >
            {tip}
          </span>
        </span>
      </Link>
    </li>
  );
}
