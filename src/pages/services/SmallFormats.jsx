// src/pages/services/SmallFormats.jsx
import { Link } from "react-router-dom";

export default function SmallFormats() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10">Малые форматы</h1>

      {/* карточки одинаковой высоты + кнопки вровень */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Визитки */}
        <Card title="Визитки" price="5 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия</Item>
            <Item>Стандартный формат (90×50 мм или другой по запросу)</Item>
            <Item>Подготовка файлов для печати (PDF, CMYK)</Item>
            <Item>Цифровые версии (PNG, JPG)</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации (в реальной среде)</Item>
          </List>
          <Deadline>Срок: 2–4 рабочих дня</Deadline>
        </Card>

        {/* Открытки */}
        <Card title="Открытки" price="6 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия</Item>
            <Item>Стандартный формат (A6/A5, вертикаль или горизонталь)</Item>
            <Item>Лицевая и оборотная стороны</Item>
            <Item>Подготовка файлов для печати (PDF, CMYK)</Item>
            <Item>Цифровые версии (PNG, JPG)</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 3–5 рабочих дня</Deadline>
        </Card>

        {/* Этикетки */}
        <Card title="Этикетки" price="7 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия</Item>
            <Item>1 формат этикетки (круглая, прямоугольная или фигурная)</Item>
            <Item>Подготовка файлов для печати (PDF, CMYK)</Item>
            <Item>Макет с вылетами и линиями реза</Item>
            <Item>Цифровые версии (PNG, JPG)</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 3–5 рабочих дня</Deadline>
        </Card>
      </div>

      <p className="mt-6 text-xs text-gray-500 text-center">
        💡 Стоимость указана за стандартный дизайн. Финальная цена зависит от сложности и дополнительных пожеланий.
      </p>
    </section>
  );
}

/* ------- Вспомогательные мини-компоненты ------- */

function Card({ title, price, children }) {
  return (
    <div className="h-full flex flex-col justify-between border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      {/* верх */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-xl font-bold mb-4">{price}</p>
        {children}
      </div>

      {/* низ: кнопка строго на одном уровне у всех карточек */}
      <div className="mt-6">
        <Link
          to="/contact"
          className="inline-flex w-full items-center justify-center rounded-2xl border px-4 py-2 hover:bg-gray-50"
        >
          Заказать
        </Link>
      </div>
    </div>
  );
}

function List({ children }) {
  return <ul className="space-y-2 text-sm text-gray-700 mb-4">{children}</ul>;
}

function Item({ children }) {
  return <li>{children}</li>;
}

function Deadline({ children }) {
  return <p className="text-sm font-semibold">{children}</p>; // сроки — жирным
}
