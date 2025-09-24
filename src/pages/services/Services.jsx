// src/pages/services/Services.jsx
import { Link } from "react-router-dom";
import { servicesCategories } from "../../data/servicesData";

export default function Services() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Услуги студии</h1>
        <p className="text-gray-700">
          Мы отбираем решения, которые действительно работают: от брендинга до моушна. 
          Выберите раздел ниже или откройте конкретную услугу.
        </p>
      </header>

      <div className="space-y-12">
        {servicesCategories.map((cat) => (
          <section key={cat.slug} id={cat.slug}>
            <h2 className="text-2xl font-semibold mb-4">{cat.title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.items.map((it) => (
                <Link
                  key={it.slug}
                  to={`/services/${it.slug}`}
                  className="block border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition bg-white"
                >
                  <h3 className="font-semibold mb-2">{it.title}</h3>
                  <p className="text-sm text-gray-700">{it.description}</p>
                  <span className="inline-block mt-3 text-sm font-medium">
                    Подробнее →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
