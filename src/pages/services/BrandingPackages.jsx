export default function BrandingPackages() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center">
          Пакеты брендинга
        </h2>

        {/* Сетка пакетов */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Гайдлайн */}
          <div className="p-6 border rounded-2xl shadow-sm flex flex-col">
            <h3 className="text-2xl font-semibold mb-4">
              Гайдлайн (мини-брендбук)
            </h3>
            <p className="text-lg font-bold mb-4">25 000 ₽</p>
            <ul className="space-y-2 flex-1 text-[15px] leading-relaxed">
              <li>2–3 концепции логотипа, финал 1</li>
              <li>Основная + монохромная версии</li>
              <li>Фирменные цвета и шрифты</li>
              <li>Аватарка для соцсетей (1 формат)</li>
              <li>2 раунда правок</li>
              <li>
                Гайдлайн 8–12 страниц (логотип, цвета, шрифты, фон, примеры)
              </li>
              <li>
                <strong>Срок: 5–10 рабочих дней</strong>
              </li>
            </ul>
            <button className="mt-6 inline-flex items-center justify-center px-5 py-2 border rounded-xl">
              Заказать
            </button>
          </div>

          {/* Фирменный стиль */}
          <div className="p-6 border rounded-2xl shadow-sm flex flex-col">
            <h3 className="text-2xl font-semibold mb-4">Фирменный стиль</h3>
            <p className="text-lg font-bold mb-4">45 000 ₽</p>
            <ul className="space-y-2 flex-1 text-[15px] leading-relaxed">
              <li>3 концепции логотипа</li>
              <li>Основная, инвертированная и доп. версии</li>
              <li>Фирменные цвета, шрифты и паттерны</li>
              <li>
                Аватарки для соцсетей (2–3 формата: круглая/квадратная,
                светлый/тёмный фон)
              </li>
              <li>Иллюстрации или графические элементы (до 3 шт.)</li>
              <li>Шаблоны постов/сторис</li>
              <li>3 раунда правок</li>
              <li>
                Гайдлайн 20–30 страниц (цвета, шрифты, примеры применения)
              </li>
              <li>
                <strong>Срок: 7–14 рабочих дней</strong>
              </li>
            </ul>
            <button className="mt-6 inline-flex items-center justify-center px-5 py-2 border rounded-xl">
              Заказать
            </button>
          </div>

          {/* Брендбук */}
          <div className="p-6 border rounded-2xl shadow-sm flex flex-col">
            <h3 className="text-2xl font-semibold mb-4">Брендбук (полный)</h3>
            <p className="text-lg font-bold mb-4">65 000 ₽</p>
            <ul className="space-y-2 flex-1 text-[15px] leading-relaxed">
              <li>4 концепции логотипа, финал 1–2</li>
              <li>Все версии логотипа (основная, сокращённая, доп.)</li>
              <li>Фирменные цвета, шрифты и паттерны</li>
              <li>
                Аватарки для соцсетей (полный набор форматов: круглая/квадратная,
                светлый/тёмный фон)
              </li>
              <li>Иллюстрации и графические элементы (до 5 шт.)</li>
              <li>Печатные макеты (визитка, письмо, упаковка и др.)</li>
              <li>
                <strong>
                  Поддержка внедрения (7 дней консультаций после сдачи проекта)
                </strong>
              </li>
              <li>
                Брендбук 60+ страниц: полный набор правил и примеров применения
              </li>
              <li>
                <strong>Срок: 14–30 рабочих дней</strong>
              </li>
            </ul>
            <button className="mt-6 inline-flex items-center justify-center px-5 py-2 border rounded-xl">
              Заказать
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
