/* App.jsx — версия с кабинетом по адресу /cabinet
   Обновления:
   - подключён твой Cabinet.tsx вместо Dashboard.jsx
   - добавлен импорт Cabinet
*/

import { BrowserRouter, Routes, Route, Link, useLocation, Outlet } from "react-router-dom";
import AuthGate from "./features/auth/AuthGate.jsx";
import Project from "./pages/Project.jsx";
import { useEffect, useState } from "react";
import ContactUs from "./components/ContactUs";
import Cabinet from "./pages/Cabinet.tsx"; // ✅ твой новый кабинет

// --- THEME (редактируй эти значения под фирстиль) ---
const THEME = {
  brandName: "Mari Studio",
  accent: "#0f172a",
  accentSoft: "#e5e7eb",
  fontHeading: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
  fontBody: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
};

// --- ДЕМО-КОНТЕНТ ---
const SERVICES = [
  { id: "identity", title: "Basic", price: 30000, desc: "Базовый пакет для старта бренда", bullets: ["Логотип (3 концепции)", "Гайд на 8–12 стр.", "2 раунда правок"] },
  { id: "brandkit", title: "Pro", price: 45000, desc: "Расширенный набор для развития", bullets: ["Логотип (3–4 концепции)", "Гайд 20–30 стр.", "Посты/сторис шаблоны", "3 раунда правок"] },
  { id: "premium", title: "Premium", price: 65000, desc: "Максимум материалов + анимация", bullets: ["Логотип (3–5 концепций)", "Гайд 60+ стр.", "Печатные макеты", "Супровождение запуска"] },
];

const WORKS = [
  { id: 1, name: "La Maison — айдентика", img: "", tag: "Айдентика" },
  { id: 2, name: "Samohvost — упаковка", img: "", tag: "Упаковка" },
  { id: 3, name: "Dropgets — бренд электроники", img: "", tag: "Брендинг" },
];

// --- Утилиты/хуки ---
function classNames(...a){return a.filter(Boolean).join(" ")}

function useThemeVars() {
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", THEME.accent);
    document.documentElement.style.setProperty("--accent-soft", THEME.accentSoft);
    document.documentElement.style.setProperty("--font-heading", THEME.fontHeading);
    document.documentElement.style.setProperty("--font-body", THEME.fontBody);
  }, []);
}

function useReferralCapture() {
  const loc = useLocation();
  useEffect(() => {
    const p = new URLSearchParams(loc.search);
    const ref = p.get("ref");
    if (ref) localStorage.setItem("ref_code", ref);
  }, [loc.search]);
}

function Section({ id, title, subtitle, children, className }) {
  return (
    <section id={id} className={classNames("max-w-6xl mx-auto px-4 py-16", className)}>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold" style={{fontFamily:"var(--font-heading)"}}>{title}</h2>
        {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Card({ children, className }) {
  return <div className={classNames("border rounded-2xl p-4", className)}>{children}</div>;
}

function Button({ children, to }) {
  if (to) return <Link to={to} className="inline-flex items-center justify-center rounded-xl border px-4 py-2 hover:bg-gray-50">{children}</Link>
  return <button className="inline-flex items-center justify-center rounded-xl border px-4 py-2 hover:bg-gray-50">{children}</button>;
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-24 md:py-32">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight" style={{fontFamily:"var(--font-heading)", lineHeight:1.05}}>
          Мы отбираем то, что заслуживает места <span className="whitespace-nowrap">на твоём столе</span>
        </h1>
        <p className="mt-6 text-gray-600 max-w-2xl">
          Кураторский дизайн-студия: айдентика, упаковка, презентации и сайт-визитка. Умный, ироничный тон — не для всех, а для своих.
        </p>
        <div className="mt-8 flex gap-3">
          <Button to="/services">Пакеты услуг</Button>
          <Button to="/portfolio">Портфолио</Button>
        </div>
      </div>
    </section>
  );
}

function ServicesGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {SERVICES.map(s => (
        <Card key={s.id} className="space-y-3">
          <div className="text-lg font-semibold">{s.title}</div>
          <div className="text-sm text-gray-600">{s.desc}</div>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {s.bullets.map((b,i)=><li key={i}>{b}</li>)}
          </ul>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{s.price.toLocaleString("ru-RU")} ₽</div>
            <Button to="/contact">Заказать</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function WorksGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {WORKS.map(w => (
        <Card key={w.id} className="space-y-3">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="text-sm opacity-60">{w.tag}</div>
          <div className="font-medium">{w.name}</div>
        </Card>
      ))}
    </div>
  );
}

function Shell({ children }) {
  useThemeVars();
  useReferralCapture();
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
            <Link to="/cabinet" className="hover:opacity-70">Личный кабинет</Link>
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
            <a href="https://t.me/themarrrr" className="hover:opacity-70">Telegram</a>
            <a href="mailto:hello@example.com" className="hover:opacity-70">E-mail</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// --- Страницы сайта ---
function Home() {
  return (
    <>
      <Hero />
      <Section id="services" title="Пакеты услуг" subtitle="Выбирай подходящий — и вперёд.">
        <ServicesGrid />
      </Section>
      <Section id="portfolio" title="Избранные работы" subtitle="Собираем достойное на твой стол.">
        <WorksGrid />
      </Section>
    </>
  );
}

function Portfolio() { return <Section id="portfolio" title="Портфолио"><WorksGrid /></Section>; }
function Services() { return <Section id="services" title="Услуги"><ServicesGrid /></Section>; }
function Studio() { return <Section id="studio" title="О студии"><p>Мы делаем айдентику, упаковку, презентации. Работаем по всему миру.</p></Section>; }
function Designers() { return <Section id="designers" title="Для дизайнеров"><Card>Тут условия для дизайнеров.</Card></Section>; }
function Contact() { return <Section id="contact" title="Контакты"><Card>Форма и контакты.</Card></Section>; }
function Offer() { return <Section id="offer" title="Публичная оферта"><Card>Текст оферты.</Card></Section>; }
function Partners() { return <Section id="partners" title="Партнёрская программа"><Card>Про реферальные проценты.</Card></Section>; }

// --- Кабинет ---
function CabinetLayout() {
  return (
    <div>
      <header style={{position:'sticky',top:0,background:'#fff',borderBottom:'1px solid #eee',padding:'10px 16px',display:'flex',gap:12}}>
        <Link to="/cabinet" style={{fontWeight:600}}>MLK Design — Кабинет</Link>
        <div style={{marginLeft:'auto'}} />
      </header>
      <main style={{maxWidth:960,margin:'0 auto',padding:16}}>
        <Outlet />
      </main>
    </div>
  )
}

// --- Главный компонент ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell><><Outlet /><ContactUs whatsapp="79222817779" telegram="themarrrr" /></></Shell>}>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/services" element={<Services />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/designers" element={<Designers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/partners" element={<Partners />} />
        </Route>

        <Route path="/cabinet" element={<AuthGate><CabinetLayout /></AuthGate>}>
          <Route index element={<Cabinet />} /> {/* ✅ теперь твой компонент */}
          <Route path="projects/:id" element={<Project />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
