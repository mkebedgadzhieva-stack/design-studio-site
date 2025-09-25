// src/pages/services/PrintAds.jsx
import { Link } from "react-router-dom";

export default function PrintAds() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10">Рекламные носители</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <Card title="Флаер / Листовка" price="5 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия</Item>
            <Item>Стандартный формат A5/A6 (вертикаль или горизонталь)</Item>
            <Item>Подготовка к печати (PDF, CMYK, вылеты/рез)</Item>
            <Item>Цифровая версия (PNG, JPG)</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 3–5 рабочих дней</Deadline>
        </Card>

        <Card title="Постер / Афиша" price="8 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия</Item>
            <Item>Формат A3–A1 (или другой по запросу)</Item>
            <Item>Подготовка к печати (PDF, CMYK, вылеты/рез)</Item>
            <Item>Цифровые версии (PNG, JPG)</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 3–7 рабочих дней</Deadline>
        </Card>

        <Card title="Баннер / Роллап / Digital" price="10 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия</Item>
            <Item>Размер под задачу (уличный баннер, роллап 85×200, digital 1080×1350/1920×1080 и т.п.)</Item>
            <Item>Печатные макеты: PDF, CMYK (для наружки/роллапа)</Item>
            <Item>Digital-версии: PNG/JPG (RGB), адаптация 1–2 размеров</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 3–7 рабочих дней</Deadline>
        </Card>
      </div>

      <Note />
    </section>
  );
}

function Card({ title, price, children }) {
  return (
    <div className="h-full flex flex-col justify-between border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-xl font-bold mb-4">{price}</p>
        {children}
      </div>
      <div className="mt-6">
        <Link to="/contact" className="inline-flex w-full items-center justify-center rounded-2xl border px-4 py-2 hover:bg-gray-50">
          Заказать
        </Link>
      </div>
    </div>
  );
}
function List({ children }) { return <ul className="space-y-2 text-sm text-gray-700 mb-4">{children}</ul>; }
function Item({ children }) { return <li>{children}</li>; }
function Deadline({ children }) { return <p className="text-sm font-semibold">{children}</p>; }
function Note() {
  return (
    <p className="mt-6 text-xs text-gray-500 text-center">
      💡 Стоимость указана за стандартный дизайн. Финальная цена зависит от сложности и дополнительных пожеланий.
    </p>
  );
}
