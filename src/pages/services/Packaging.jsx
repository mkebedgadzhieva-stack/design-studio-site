// src/pages/services/Packaging.jsx
import { Link } from "react-router-dom";

export default function Packaging() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10">Упаковка</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* 1) Стикер-лист / Вкладыш — самый простой → самая низкая цена */}
        <Card title="Стикер-лист / Вкладыш" price="8 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия</Item>
            <Item>Формат под задачу (лист со стикерами или карточка-вкладыш)</Item>
            <Item>PDF (CMYK) с вылетами, контуры реза</Item>
            <Item>Цифровые версии (PNG, JPG)</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 3–7 рабочих дней</Deadline>
        </Card>

        {/* 2) Пакет фирменный — средняя сложность */}
        <Card title="Пакет фирменный" price="10 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия</Item>
            <Item>Размер и материалы по ТЗ (крафт/мелованная и т.п.)</Item>
            <Item>PDF (CMYK), вылеты/рез, учёт люверсов/ручек</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 5–10 рабочих дней</Deadline>
        </Card>

        {/* 3) Коробка — самая сложная → самая высокая цена */}
        <Card title="Коробка (дизайн)" price="12 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия</Item>
            <Item>Дизайн под заданный размер/линию; работа с разверткой</Item>
            <Item>PDF (CMYK) с вылетами, линии реза/фальца</Item>
            <Item>Подготовка к печати (принт-шоп friendly)</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 5–10 рабочих дней</Deadline>
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
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-xl font-bold mb-4">{price}</p>
        {children}
      </div>
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
function List({ children }) { return <ul className="space-y-2 text-sm text-gray-700 mb-4">{children}</ul>; }
function Item({ children }) { return <li>{children}</li>; }
function Deadline({ children }) { return <p className="text-sm font-semibold">{children}</p>; }
