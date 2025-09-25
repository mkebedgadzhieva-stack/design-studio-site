// src/pages/services/Extras.jsx
import { Link } from "react-router-dom";

export default function Extras() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8">
        Дополнительно / мелкие форматы
      </h1>

      <div className="max-w-3xl mx-auto border rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-gray-700 leading-relaxed">
          Мы беремся за небольшие и нестандартные задачи, которые дополняют ваш бренд — как в печати, так и в диджитал.
        </p>

        <p className="mt-4 text-sm text-gray-800">
          <span className="font-medium">Что это может быть:</span>{" "}
          стикеры и вкладыши • бирки/ярлычки • карточки «спасибо» и сертификаты •
          электронные и печатные приглашения • конверты и открытки • бейджи и пропуска •
          мини-лендинги/приглашения с QR • обложки/баннеры для площадок и рассылок • и др.
        </p>

        <p className="mt-4 text-sm">
          <span className="font-semibold">Цена:</span>{" "}
          от 3 000 ₽ — для простых носителей, от 5 000 ₽ — для digital и сложных форматов.
        </p>

        <p className="mt-4 text-sm text-gray-600">
          💡 Стоимость указана за стандартный дизайн одного носителя. Финальная цена зависит от сложности и дополнительных пожеланий.
          Если вы не нашли нужный формат — напишите нам, и мы обсудим задачу индивидуально.
        </p>

        <div className="mt-6">
          <Link
            to="/contact"
            className="inline-flex w-full items-center justify-center rounded-2xl border px-4 py-2 hover:bg-gray-50"
          >
            Обсудить задачу
          </Link>
        </div>
      </div>
    </section>
  );
}

