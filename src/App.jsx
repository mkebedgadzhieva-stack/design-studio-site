import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ContactUs from "./components/ContactUs";

// --- THEME (редактируй эти значения под фирстиль) ---
const THEME = {
  brandName: "Mari Studio",
  accent: "#0f172a",
  accentSoft: "#e5e7eb",
  fontHeading: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
  fontBody: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
};



// --- ДЕМО-КОНТЕНТ (замени на свои данные) ---
const SERVICES = [
  { id: "identity", title: "Фирменный стиль", price: 30000, desc: "Логотип, палитра, шрифты, базовые носители.", features: ["Логотип (3 концепции)", "Гайд на 8–12 стр.", "2 раунда правок"] },
  { id: "brandkit", title: "Brand Kit Pro", price: 45000, desc: "Расширенный набор носителей + тональность бренда.", features: ["Гайд 20–30 стр.", "Посты/сторис шаблоны", "3 раунда правок"] },
  { id: "premium", title: "Premium Identity", price: 65000, desc: "Полный бренд‑гайд, паттерны, упаковка.", features: ["Гайд 60+ стр.", "Печатные макеты", "Супровождение запуска"] },
];

const WORKS = [
  { id: 1, name: "La Maison — айдентика", img: "", tag: "Айдентика" },
  { id: 2, name: "Samohvost — упаковка", img: "", tag: "Упаковка" },
  { id: 3, name: "Dropgets — стратегия", img: "", tag: "Стратегия" },
  { id: 4, name: "Deskuration — электроника", img: "", tag: "Веб" },
];

// --- УТИЛИТЫ РЕФЕРАЛОК ---
async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("");
}

function useReferralCapture() {
  const loc = useLocation();
  useEffect(() => {
    const p = new URLSearchParams(loc.search);
    const ref = p.get("ref");
    if (ref) localStorage.setItem("ref_code", ref);
  }, [loc.search]);
}

function useThemeVars() {
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", THEME.accent);
    document.documentElement.style.setProperty("--accent-soft", THEME.accentSoft);
    document.documentElement.style.setProperty("--font-heading", THEME.fontHeading);
    document.documentElement.style.setProperty("--font-body", THEME.fontBody);
  }, []);
}

function Shell({ children }) {
  useThemeVars();
  useReferralCapture();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{fontFamily: "var(--font-body)"}}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl" style={{background:"var(--accent)"}} />
            <span className="font-semibold tracking-tight" style={{fontFamily:"var(--font-heading)"}}>{THEME.brandName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/portfolio" className="hover:opacity-70">Портфолио</Link>
            <Link to="/services" className="hover:opacity-70">Услуги</Link>
            <Link to="/studio" className="hover:opacity-70">О студии</Link>
            <Link to="/designers" className="hover:opacity-70">Для дизайнеров</Link>
            <Link to="/partners" className="hover:opacity-70">Партнёрская программа</Link>
            <Link to="/offer" className="hover:opacity-70">Публичная оферта</Link>
          </nav>
          <Link to="/contact" className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm">
            Оставить заявку
          </Link>
        </div>
      </header>
      {children}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} {THEME.brandName}. Все права защищены.</div>
          <div className="flex items-center gap-4">
            <Link to="/offer" className="hover:underline">Оферта</Link>
            <Link to="/contact" className="hover:underline">Контакты</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight" style={{fontFamily:"var(--font-heading)"}}>
            Графдизайн‑студия для брендов с характером
          </h1>
          <p className="mt-4 text-lg text-gray-600">Фирменные стили, логотипы, упаковка и сайты, которые повышают узнаваемость и продажи.</p>
          <div className="mt-8 flex gap-3">
            <button onClick={()=>navigate("/contact")} className="rounded-2xl text-white px-5 py-3" style={{background:"var(--accent)"}}>Начать проект</button>
            <button onClick={()=>navigate("/services")} className="rounded-2xl border px-5 py-3">Услуги и цены</button>
          </div>
          <div className="mt-6 text-sm text-gray-500">100+ клиентов · 4.9★ · сроки от 10 дней</div>
        </div>
        <div className="relative">
          <div className="aspect-video w-full rounded-3xl border shadow-sm" />
          <div className="absolute -bottom-6 -left-6 hidden md:block h-24 w-24 rounded-3xl border" />
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <Hero/>
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{fontFamily:"var(--font-heading)"}}>Почему мы</h2>
          <p className="mt-2 text-gray-600">Сильная стратегия + аккуратная подача + забота о запуске.</p>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {t:"Кураторский подход", d:"Не шаблоны — отбор решений под вашу задачу."},
              {t:"Скорость и процесс", d:"Чёткий тайминг, 2 раунда правок, отчётность."},
              {t:"Готово к печати", d:"Файлы, мокапы, гайды — без лишних доработок."},
            ].map((x,i)=>(
              <div key={i} className="rounded-3xl border p-6">
                <div className="h-10 w-10 rounded-xl mb-4" style={{background:"var(--accent-soft)"}} />
                <h3 className="font-semibold">{x.t}</h3>
                <p className="text-gray-600 mt-2">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Portfolio() {
  return (
    <section className="border-t">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{fontFamily:"var(--font-heading)"}}>Портфолио</h2>
            <p className="mt-2 text-gray-600">3–12 лучших работ. Добавляй легко — просто дополняй массив WORKS.</p>
          </div>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {WORKS.map(w => (
            <div key={w.id} className="group rounded-3xl overflow-hidden border">
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-4">
                <div className="font-medium">{w.name}</div>
                <div className="text-sm text-gray-600">{w.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  function addToCart(s) { if (!cart.includes(s.id)) setCart([...cart, s.id]); }
  function goChat() {
    const ref = localStorage.getItem("ref_code") || "direct";
    const text = encodeURIComponent(`Хочу заказать: ${cart.join(", ")} | ref=${ref}`);
    // можно заменить на свой Telegram/WhatsApp/почту
    window.location.href = `https://t.me/share/url?url=&text=${text}`;
  }
  return (
    <section className="border-t">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{fontFamily:"var(--font-heading)"}}>Услуги и цены</h2>
            <p className="mt-2 text-gray-600">Кликни «Добавить» — затем «Оставить заявку» откроет чат с предзаполненным сообщением.</p>
          </div>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {SERVICES.map((s,idx)=>(
            <div key={s.id} className={`rounded-3xl border p-6 ${idx===1?"shadow-lg scale-[1.02]":""}`}>
              <div className="text-sm text-gray-500">Пакет</div>
              <div className="text-2xl font-semibold">{s.title}</div>
              <div className="mt-1 text-gray-600">{s.desc}</div>
              <div className="mt-4 text-3xl font-bold">₽{s.price.toLocaleString("ru-RU")}</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {s.features.map((f,i)=>(<li key={i}>• {f}</li>))}
              </ul>
              <div className="mt-6 flex gap-3">
                <button onClick={()=>addToCart(s)} className="rounded-2xl border px-4 py-2">Добавить</button>
                <button onClick={goChat} className="rounded-2xl text-white px-4 py-2" style={{background:"var(--accent)"}}>Оставить заявку</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Studio() {
  return (
    <section className="border-t">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{fontFamily:"var(--font-heading)"}}>О студии</h2>
        <p className="mt-4 text-gray-700">Мы создаём айдентики и визуальные системы для компаний, продуктов и личных брендов. Работаем прозрачно: фикс‑сметы, тайминг, два раунда правок включены.</p>
      </div>
    </section>
  );
}

function Designers() {
  const PRODUCTS = [
    { id: "mockup-cards", name: "Мокап визиток (10 сцен)", price: 990, desc: "PSD с умными объектами, 6000×4000, тени/свет на слоях.", link: "#" },
    { id: "toile-brushes", name: "Набор кистей Toile (Procreate/ABR)", price: 690, desc: "32 кисти: штрихи, травы, штамп‑элементы.", link: "#" },
    { id: "font-mlk", name: "Шрифт MLK Display", price: 1490, desc: "OTF/WOFF2, кириллица + латиница, 500 глифов.", link: "#" },
  ];
  return (
    <section className="border-t">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{fontFamily:"var(--font-heading)"}}>Для дизайнеров</h2>
        <p className="mt-4 text-gray-700">Здесь студия публикует платные и бесплатные ресурсы: мокапы, шрифты, кисти, шаблоны. Нажмите «Купить» — откроется платёжная страница (Gumroad/Boosty/ЮKassa и т. п.).</p>
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {PRODUCTS.map(p => (
            <div key={p.id} className="rounded-3xl border overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-4">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.desc}</div>
                <div className="mt-3 font-semibold">₽{p.price.toLocaleString("ru-RU")}</div>
                <a href={p.link} className="mt-3 inline-flex rounded-2xl border px-4 py-2">Купить</a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border p-6">
          <div className="font-semibold">Партнёрская программа</div>
          <p className="text-sm text-gray-700 mt-2">Хотите рекомендовать нашу студию и получать 15% с завершённых проектов? Перейдите в раздел «Партнёрская программа» и сгенерируйте персональную ссылку.</p>
            <a href="/partners" className="mt-3 inline-flex rounded-2xl text-white px-4 py-2" style={{background:"var(--accent)"}}>Перейти к программе</a>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [msg, setMsg] = useState("");
  function send() {
    const ref = localStorage.getItem("ref_code") || "direct";
    const text = encodeURIComponent(`Имя: ${name}
Контакты: ${contact}
Задача: ${msg}
ref=${ref}`);
    window.location.href = `https://t.me/share/url?url=&text=${text}`;
  }
  return (
    <section className="border-t">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{fontFamily:"var(--font-heading)"}}>Контакты</h2>
        <p className="mt-2 text-gray-600">Связь в мессенджерах или по почте. Ответ — в течение 24 часов в рабочие дни.</p>
        <div className="mt-8 grid gap-4">
          <input className="rounded-2xl border px-4 py-3" placeholder="Имя" value={name} onChange={e=>setName(e.target.value)} />
          <input className="rounded-2xl border px-4 py-3" placeholder="Email или телефон" value={contact} onChange={e=>setContact(e.target.value)} />
          <textarea className="rounded-2xl border px-4 py-3" rows={4} placeholder="Коротко о задаче" value={msg} onChange={e=>setMsg(e.target.value)} />
          <button onClick={send} className="rounded-2xl text-white px-5 py-3 w-max" style={{background:"var(--accent)"}}>Оставить заявку</button>
        </div>
      </div>
    </section>
  );
}

function Offer() {
  return (
    <section className="border-t">
      <div className="max-w-3xl mx-auto px-4 py-16 text-[15px] leading-7">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6" style={{fontFamily:"var(--font-heading)"}}>Публичная оферта</h1>
        <p className="text-gray-500 mb-6">Ниже — шаблон оферты. Это не юридическая консультация. Перед публикацией рекомендуем согласовать текст с юристом и адаптировать под вашу юрисдикцию.</p>
        <ol className="list-decimal pl-6 space-y-4">
          <li><strong>Услуги.</strong> Я, Кебедгаджиева Марьям, как владелец студии __ (далее — «Исполнитель»), предлагаю услуги по разработке фирменного стиля, визуальной айдентики, логотипов и др. работ по дизайну.</li>
          <li><strong>Стоимость.</strong> Базовая стоимость разработки фирменного стиля — от 25 000 ₽. Итоговая смета формируется индивидуально и согласовывается сторонами в переписке.</li>
          <li><strong>Оплата.</strong> Работа начинается после внесения предоплаты 50% от согласованной стоимости. Оставшиеся 50% оплачиваются по завершении проекта до передачи финальных материалов.</li>
          <li><strong>Правки.</strong> В стоимость включены 2 раунда правок. Каждый дополнительный раунд — +2 000 ₽.</li>
          <li><strong>Сроки.</strong> Проект длится от 10 до 30 рабочих дней с момента получения всех вводных от Заказчика. Заказчик обязуется своевременно предоставлять обратную связь и материалы.</li>
          <li><strong>Отказ.</strong> Предоплата не возвращается в случае отказа Заказчика от проекта.</li>
          <li><strong>Передача прав.</strong> После полной оплаты Заказчик получает финальные исходники и неисключительные права на использование дизайна в пределах согласованного брифа/договора, если иное явно не оговорено сторонами.</li>
          <li><strong>Коммуникация.</strong> Рабочие часы: 09:00–20:00 (МСК). Каналы связи: мессенджеры или email. Время ответа — до 24 часов в рабочие дни.</li>
          <li><strong>Реферальная программа.</strong> Любой Пользователь может участвовать в реферальной программе Исполнителя. Вознаграждение составляет 15% от стоимости завершённого и полностью опленного проекта, пришедшего по уникальной реферальной ссылке Участника. Условие начисления: проект оплачен и закрыт, а лид пришёл по ссылке вида <code>?ref=КОД</code>, закреплённой за Участником. Срок выплаты и способ — по договорённости, не позднее 10 рабочих дней после закрытия проекта. Исполнитель оставляет за собой право проверять добросовестность привлечения и отклонять подозрительные заявки.</li>
          <li><strong>Заключение договора.</strong> Принятие оферты осуществляется путём оплаты предоплаты, отправки брифа или подачи заявки через сайт. Момент акцепта — дата первого из указанных действий.</li>
          <li><strong>Прочее.</strong> Споры решаются путём переговоров; при недостижении согласия — в порядке, предусмотренном применимым законодательством. Актуальная редакция оферты опубликована на этой странице.</li>
        </ol>
      </div>
    </section>
  );
}

function Partners() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  async function gen() {
    if (!email) return;
    const hash = await sha256Hex(email.trim().toLowerCase());
    const code = hash.slice(0, 8);
    const l = `${origin}?ref=${code}`;
    localStorage.setItem("my_ref_code", code);
    setLink(l);
  }
  return (
    <section className="border-t">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{fontFamily:"var(--font-heading)"}}>Партнёрская программа</h2>
        <p className="mt-3 text-gray-700">Получайте 15% от завершённых проектов, пришедших по вашей ссылке. Сгенерируйте персональную ссылку, поделитесь ею — заявки автоматически пометятся вашим кодом.</p>
        <div className="mt-6 grid gap-3 max-w-xl">
          <input className="rounded-2xl border px-4 py-3" placeholder="Ваш email (для генерации кода)" value={email} onChange={e=>setEmail(e.target.value)} />
          <button onClick={gen} className="rounded-2xl text-white px-5 py-3 w-max" style={{background:"var(--accent)"}}>Сгенерировать ссылку</button>
          {link && (
            <div className="rounded-2xl border p-4 text-sm">
              <div className="font-medium">Ваша ссылка:</div>
              <div className="break-all mt-1">{link}</div>
              <div className="text-gray-600 mt-2">Совет: используйте UTM‑метки, размещайте ссылку в соцсетях, добавляйте в посты и сторис. Все заявки, пришедшие по этой ссылке, сохранят <code>ref</code> в браузере, и мы увидим его в заявке.</div>
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold mt-10">Как это работает</h3>
        <ol className="list-decimal pl-6 mt-3 space-y-2 text-gray-700">
          <li>Вводите email — получаете персональный код (хэш) и ссылку вида <code>?ref=код</code>.</li>
          <li>Человек переходит по ссылке → код сохраняется в его браузере.</li>
          <li>Он отправляет заявку → код автоматически попадает в сообщение.</li>
          <li>После закрытия и оплаты проекта вы получаете 15%.</li>
        </ol>
        <p className="mt-4 text-gray-500 text-sm">Продвинуто: подключим учёт через Airtable/Google Sheets + Make/Pipedream или Memberstack/Webflow CMS — чтобы видеть статистику переходов и выплат.</p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/services" element={<Services />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/designers" element={<Designers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/partners" element={<Partners />} />
        </Routes>

        <ContactUs
          whatsapp="79222817779"
          telegram="themarrrr"
        />
      </Shell>
    </BrowserRouter>
  );
}

