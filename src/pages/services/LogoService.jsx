export default function LogoService() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Заголовок страницы */}
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center">
          Логотип
        </h2>

        {/* Карточки тарифов — стиль как на первом скрине */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Basic */}
          <div className="p-6 border rounded-2xl shadow-sm flex flex-col">
            <h3 className="text-2xl font-semibold mb-1">Basic</h3>
            <p className="text-lg font-bold mb-4">8 000 ₽</p>
            <ul className="space-y-2 text-[15px] leading-relaxed flex-1">
              <li>2 концепции логотипа</li>
              <li>2 раунда правок</li>
              <li>Файлы: PNG, SVG, PDF</li>
              <li>Основная и монохромная версии</li>
              <li>Аватарка для соцсетей (круглая или квадратная)</li>
              <li>Логолист 1–2 стр. (зона охраны, мин. размер, фон)</li>
              <li><strong>Срок: 3–5 рабочих дней</strong></li>
            </ul>
            <button className="mt-6 inline-flex items-center justify-center px-5 py-2 border rounded-xl">
              Заказать
            </button>
          </div>

          {/* Pro */}
          <div className="p-6 border rounded-2xl shadow-sm flex flex-col">
            <h3 className="text-2xl font-semibold mb-1">Pro</h3>
            <p className="text-lg font-bold mb-4">12 000 ₽</p>
            <ul className="space-y-2 text-[15px] leading-relaxed flex-1">
              <li>3 концепции логотипа</li>
              <li>4 раунда правок</li>
              <li>Полный пакет файлов: PNG, SVG, PDF (по запросу EPS/AI)</li>
              <li>Основная, инвертированная и монохромная версии</li>
              <li>Аватарки для соцсетей — 3–4 формата (круглая/квадратная, светлый/тёмный фон)</li>
              <li>Мини-гайд 6–8 стр. (палитра, шрифты, правила, примеры)</li>
              <li>2–3 визуализации (мокапы: визитка / пост / мерч)</li>
              <li><strong>Срок: 5–7 рабочих дней</strong></li>
            </ul>
            <button className="mt-6 inline-flex items-center justify-center px-5 py-2 border rounded-xl">
              Заказать
            </button>
          </div>

          {/* Premium */}
          <div className="p-6 border rounded-2xl shadow-sm flex flex-col">
            <h3 className="text-2xl font-semibold mb-1">Premium</h3>
            <p className="text-lg font-bold mb-4">20 000 ₽</p>
            <ul className="space-y-2 text-[15px] leading-relaxed flex-1">
              <li>3–4 концепции логотипа</li>
              <li>Безлимит правок в течение 3 дней</li>
              <li>Полный пакет файлов (PNG, SVG, PDF, EPS/AI по запросу)</li>
              <li>Пакет для разработчиков (favicon, иконки)</li>
              <li>Аватарки для соцсетей — набор форматов (круглая/квадратная, светлый/тёмный фон)</li>
              <li>Мини-гайд 10–12 стр. (цвета, шрифты, сетка, зоны охраны, запреты)</li>
              <li>5–6 визуализаций (мокапы для печати, digital и мерча)</li>
              <li>Простая анимация логотипа (gif/mp4)</li>
              <li><strong>Срок: 7–14 дней</strong></li>
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
