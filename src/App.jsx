/* App.jsx — сайт + кабинет. Store вместо раздела «Для дизайнеров» */
import SmallFormats from "./pages/services/SmallFormats.jsx";
import BrandingPackages from "./pages/services/BrandingPackages.jsx";
import ServicesLayout from "./pages/services/ServicesLayout.jsx";
import LogoService from "./pages/services/LogoService.jsx";
import Services from "./pages/services/Services.jsx";
import ServicesDropdown from "./components/ServicesDropdown.jsx";
import PrintAds from "./pages/services/PrintAds.jsx";
import Publishing from "./pages/services/Publishing.jsx";
import Packaging from "./pages/services/Packaging.jsx";
import Extras from "./pages/services/Extras.jsx";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Outlet,
  Navigate, // ← для редиректов
} from "react-router-dom";
import { useEffect } from "react";

import AuthGate from "./features/auth/AuthGate.jsx";
import AuthCallback from "./features/auth/AuthCallback.jsx";

import Project from "./pages/Project.jsx";
import ContactUs from "./components/ContactUs";
import Cabinet from "./pages/Cabinet.tsx";
import Offer from "./pages/Offer.jsx";
import Store from "./pages/Store.jsx"; // ← новый раздел

/* ---------------- THEME ---------------- */
const THEME = {
  brandName: "Mari Studio",
  accent: "#0f172a",
  accentSoft: "#e5e7eb",
  fontHeading: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
  fontBody: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
};

/* --------------- ДЕМО-ДАННЫЕ (главная) --------------- */
const SERVICES_DEMO = [
  { id: "identity", title: "Basic", price: 25000, desc: "Гайдлайн (мини-брендбук) — базовый стартовый пакет", bullets: ["2–3 концепции логотипа", "Гайд на 8–12 стр.", "2 раунда правок"] },
  { id: "brandkit", title: "Фирменный стиль", price: 45000, desc: "Средний пакет для компаний, которым нужно больше, чем логотип", bullets: ["3 концепции логотипа", "Гайд 20–30 стр.", "Шаблоны постов/сторис", "3 раунда правок"] },
  { id: "premium", title: "Брендбук (полный)", price: 65000, desc: "Максимальный пакет с поддержкой внедрения", bullets: ["4 концепции логотипа", "Брендбук 60+ стр.", "Печатные макеты", "Поддержка внедрения (7 дней консультаций)"] },
];

const WORKS = [
  { id: 1, name: "La Maison — айдентика", img: "", tag: "Айдентика" },
  { id: 2, name: "Samohvost — упаковка", img: "", tag: "Упаковка" },
  { id: 3, name: "Dropgets — бренд электроники", img: "", tag: "Брендинг" },
];

/* ---------------- утилиты ---------------- */
function classNames(...a) { return a.filter(Boolean).join(" "); }

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

/* ---------------- общие блоки ---------------- */
function Section({ id, title, subtitle, children, className }) {
  return (
    <section id={id} className={classNames("max-w-6xl mx-auto px-4 py-16", className)}>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
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
  if (to) {
    return (
      <Link to={to} className="inline-flex items-center justify-center rounded-xl border px-4 py-2 hover:bg-gray-50">
        {children}
      </Link>
    );
  }
  return (
    <button className="inline-flex items-center justify-center rounded-xl border px-4 py-2 hover:bg-gray-50">
      {children}
    </button>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-24 md:py-32">
        <h1
          className="text-4xl md:text-6xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", lineHeight: 1.05 }}
        >
          Мы отбираем то, что заслуживает места <span className="whitespace-nowrap">на твоём столе</span>
        </h1>
        <p className="mt-6 text-gray-600 max-w-2xl">
          Кураторская дизайн-студия: айдентика, упаковка, презентации и сайт-визитка.
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
      {SERVICES_DEMO.map((s) => (
        <Card key={s.id} className="space-y-3">
          <div className="text-lg font-semibold">{s.title}</div>
          <div className="text-sm text-gray-600">{s.desc}</div>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
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
      {WORKS.map((w) => (
        <Card key={w.id} className="space-y-3">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="text-sm opacity-60">{w.tag}</div>
          <div className="font-medium">{w.name}</div>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- оболочка ---------------- */
function Shell({ children }) {
  useThemeVars();
  useReferralCapture();
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "var(--font-body)" }}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl" style={{ background: "var(--accent)" }} />
            <span className="font-semibold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Mari Studio
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/portfolio" className="hover:opacity-70">Портфолио</Link>
            <ServicesDropdown />
            <Link to="/studio" className="hover:opacity-70">О студии</Link>
            <Link to="/store" className="hover:opacity-70">Store</Link>
            <Link to="/partners" className="hover:opacity-70">Партнёрская программа</Link>
            <Link to="/offer" className="hover:opacity-70">Публичная оферта</Link>
            <Link to="/cabinet" className="hover:opacity-70">Личный кабинет</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/contact" className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm">
              Оставить заявку
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Mari Studio. Все права защищены.</div>
          <div className="flex items-center gap-4">
            <a href="https://t.me/themarrrr" className="hover:opacity-70">Telegram</a>
            <a href="mailto:hello@example.com" className="hover:opacity-70">E-mail</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- простые страницы ---------------- */
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
function Studio() { return <Section id="studio" title="О студии"><Card>Мы делаем айдентику, упаковку, презентации.</Card></Section>; }
function Contact() { return <Section id="contact" title="Контакты"><Card>Форма и контакты.</Card></Section>; }
function Partners() { return <Section id="partners" title="Партнёрская программа"><Card>Про реферальные проценты.</Card></Section>; }

/* --------------- Маршруты --------------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Общая оболочка сайта */}
        <Route
          element={
            <Shell>
              <>
                <Outlet />
                <ContactUs whatsapp="79222817779" telegram="themarrrr" />
              </>
            </Shell>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />

          {/* Услуги */}
          <Route path="/services" element={<ServicesLayout />}>
  <Route index element={<Services />} />
  <Route path="logo" element={<LogoService />} />
  <Route path="branding-packages" element={<BrandingPackages />} />
  <Route path="small-formats" element={<SmallFormats />} />
  <Route path="print-ads" element={<PrintAds />} />
  <Route path="publishing" element={<Publishing />} />
  <Route path="extras" element={<Extras />} />
</Route>


          <Route path="/studio" element={<Studio />} />
          <Route path="/store" element={<Store />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/partners" element={<Partners />} />

          {/* кабинет */}
          <Route path="/cabinet" element={<AuthGate><Cabinet /></AuthGate>} />
          <Route path="/cabinet/projects/:id" element={<AuthGate><Project /></AuthGate>} />
        </Route>

        {/* oauth callback */}
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
