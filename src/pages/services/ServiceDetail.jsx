// src/pages/services/ServiceDetail.jsx
import { Link, useParams } from "react-router-dom";
import { findServiceBySlug } from "../../data/servicesData";

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = findServiceBySlug(slug);

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-4">Услуга не найдена</h1>
        <Link to="/services" className="underline">Вернуться к списку услуг</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-sm mb-6">
        <Link to="/services" className="underline">Услуги</Link>
        <span> / </span>
        <Link to={`/services#${service.categorySlug}`} className="underline">
          {service.category}
        </Link>
      </nav>

      <h1 className="text-4xl font-bold mb-3">{service.title}</h1>
      <p className="text-lg text-gray-800 mb-8">{service.description}</p>

      {/* Состав работ — базовый шаблон, одинаковый для всех, можно потом усложнить */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="border rounded-2xl p-5 bg-white">
          <h2 className="font-semibold mb-3">Что вы получаете</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-800">
            <li>Продуманная концепция под цели и аудиторию</li>
            <li>Исходники и экспорт во всех нужных форматах</li>
            <li>Короткий гайд по использованию результата</li>
            <li>Поддержка на этапе внедрения</li>
          </ul>
        </div>
        <div className="border rounded-2xl p-5 bg-white">
          <h2 className="font-semibold mb-3">Как работаем</h2>
          <ol className="list-decimal pl-5 space-y-1 text-gray-800">
            <li>Бриф → согласование задач</li>
            <li>Дизайн-концепции → выбор направления</li>
            <li>Доработка → финал</li>
            <li>Сдача файлов и рекомендации</li>
          </ol>
        </div>
      </div>

      <div className="mt-10">
        <Link
          to="/contact"
          className="inline-block px-5 py-3 rounded-xl border hover:bg-gray-50 font-medium"
        >
          Обсудить проект
        </Link>
      </div>
    </div>
  );
}
