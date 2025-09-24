// src/pages/services/ServicesLayout.jsx
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { servicesCategories, findServiceBySlug } from "../../data/servicesData";

// стили для «пилюль»
const pillBase = "px-3 py-2 rounded-xl text-sm hover:bg-gray-100 transition";
const pillActive = "bg-gray-100 font-semibold";

export default function ServicesLayout() {
  const location = useLocation();

  // slug услуги, если мы на странице вида /services/:slug
  const parts = location.pathname.split("/").filter(Boolean); // ["services", "logo"]
  const serviceSlug = parts[1] === "services" ? parts[2] : undefined;

  // если открыта конкретная услуга — найдём её категорию
  const current = serviceSlug ? findServiceBySlug(serviceSlug) : null;
  const currentCategorySlug = current?.categorySlug;

  // категории для верхней навигации (только разделы)
  const categoryPills = [
    { title: "Все услуги", to: "/services", exact: true },
    ...servicesCategories.map((c) => ({
      title: c.title,
      to: `/services#${c.slug}`, // якоря на странице «Все услуги»
      exact: false,
    })),
  ];

  // подпункты (поднавигация) для открытой конкретной услуги
  const subPills =
    currentCategorySlug
      ? servicesCategories.find((c) => c.slug === currentCategorySlug)?.items || []
      : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Хлебные крошки */}
      <nav className="text-sm mb-6">
        <Link to="/" className="underline">Главная</Link> <span>/</span>{" "}
        <Link to="/services" className="underline">Услуги</Link>
      </nav>

      {/* ВЕРХНЯЯ НАВИГАЦИЯ: только КАТЕГОРИИ */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {categoryPills.map((p) =>
          p.exact ? (
            <NavLink
              key={p.title}
              to={p.to}
              end
              className={({ isActive }) => `${pillBase} ${isActive ? pillActive : ""}`}
            >
              {p.title}
            </NavLink>
          ) : (
            // для якорей используем обычную Link (NavLink не отслеживает hash)
            <Link key={p.title} to={p.to} className={pillBase}>
              {p.title}
            </Link>
          )
        )}
      </div>

      {/* ПОДНАВИГАЦИЯ: если открыта конкретная услуга — покажем подразделы её категории */}
      {currentCategorySlug && subPills.length > 0 && (
        <div className="mb-8 flex gap-2 flex-wrap">
          {subPills.map((it) => (
            <NavLink
              key={it.slug}
              to={`/services/${it.slug}`}
              className={({ isActive }) => `${pillBase} ${isActive ? pillActive : ""}`}
            >
              {it.title}
            </NavLink>
          ))}
        </div>
      )}

      {/* Контент: либо список всех услуг, либо страница конкретной услуги */}
      <Outlet />
    </div>
  );
}
