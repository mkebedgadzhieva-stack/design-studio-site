// src/components/ServicesDropdown.jsx
import { Link } from "react-router-dom";
import { servicesCategories } from "../data/servicesData";

export default function ServicesDropdown() {
  return (
    <div className="relative group">
      <Link
        to="/services"
        className="px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        Услуги
      </Link>

      {/* Выпадающее меню */}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition
                      absolute left-0 top-full mt-2 w-[720px] rounded-2xl bg-white border shadow-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {servicesCategories.map((cat) => (
            <div key={cat.slug}>
              <Link
                to={`/services#${cat.slug}`}
                className="font-semibold mb-2 inline-block hover:underline"
              >
                {cat.title}
              </Link>
              <ul className="space-y-1">
                {cat.items.map((it) => (
                  <li key={it.slug}>
                    <Link
                      to={`/services/${it.slug}`}
                      className="text-sm text-gray-700 hover:text-black"
                    >
                      {it.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-3 text-right">
          <Link
            to="/services"
            className="text-sm font-medium hover:underline"
          >
            Все услуги →
          </Link>
        </div>
      </div>
    </div>
  );
}
