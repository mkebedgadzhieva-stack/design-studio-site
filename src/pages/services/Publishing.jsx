// src/pages/services/Publishing.jsx
import { Link } from "react-router-dom";

export default function Publishing() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10">Издания</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <Card title="Буклет (8–12 стр.)" price="15 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия обложки</Item>
            <Item>Верстка 8–12 полос</Item>
            <Item>Сетка, шрифтовая система, отступы</Item>
            <Item>PDF (CMYK) для печати, PDF (RGB) для веб</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 5–10 рабочих дней</Deadline>
          <SmallNote>+700 ₽ за каждую доп. полосу сверх 12</SmallNote>
        </Card>

        <Card title="Каталог (16–32 стр.)" price="30 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия обложки</Item>
            <Item>Верстка 16–32 полос</Item>
            <Item>Таблицы/ценообразование/иконки по задаче</Item>
            <Item>PDF (CMYK) для печати, PDF (RGB) для веб</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 10–20 рабочих дней</Deadline>
          <SmallNote>+800 ₽ за каждую доп. полосу сверх 32</SmallNote>
        </Card>

        <Card title="Журнал (32–64 стр.)" price="45 000 ₽">
          <List>
            <Item>Основной вариант + альтернативная версия обложки</Item>
            <Item>Верстка 32–64 полос</Item>
            <Item>Фоторедактура/иллюстрации по ТЗ</Item>
            <Item>PDF (CMYK) для печати, PDF (RGB) для веб</Item>
            <Item>2 бесплатных раунда правок</Item>
            <Item>2–3 визуализации</Item>
          </List>
          <Deadline>Срок: 15–30 рабочих дней</Deadline>
          <SmallNote>+1 000 ₽ за каждую доп. полосу сверх 64</SmallNote>
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
function SmallNote({ children }) { return <p className="mt-2 text-xs text-gray-500">{children}</p>; }
function Note() {
  return (
    <p className="mt-6 text-xs text-gray-500 text-center">
      💡 Стоимость указана за стандартный дизайн. Финальная цена зависит от сложности и дополнительных пожеланий.
    </p>
  );
}
