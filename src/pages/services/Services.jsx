// src/pages/services/Services.jsx
import { Link } from "react-router-dom";

export default function Services() {
  const items = [
    {
      to: "/services/logo",
      title: "Логотип",
      desc: "Разработка знака и логотипа",
    },
    {
      to: "/services/branding-packages",
      title: "Пакеты брендинга",
      desc: "Гайдлайн, фирстиль, брендбук",
    },
    {
      to: "/services/small-formats",
      title: "Малые форматы",
      desc: "Визитки, открытки, этикетки",
    },
    {
      to: "/services/print-ads",
      title: "Рекламные носители",
      desc: "Флаеры, афиши, баннеры",
    },
    {
      to: "/services/publishing",
      title: "Издания",
      desc: "Каталоги, буклеты, журналы",
    },
    {
      to: "/services/packaging",
      title: "Упаковка",
      desc: "Коробки, пакеты, стикеры",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10">Услуги</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="border rounded-2xl p-6 hover:shadow-md transition block"
          >
            <h3 className="text-lg font-semibold mb-1">{it.title}</h3>
            <p className="text-sm text-gray-600">{it.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

